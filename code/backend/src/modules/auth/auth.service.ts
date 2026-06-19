import prisma from '../../config/db';
import { verifyPassword, hashPassword } from '../../utils/hash.util';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../../utils/jwt.util';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../../errors/AppError';
import { LoginInput } from './auth.dto';
import { redisClient } from '../../config/redis';
import { MESSAGES } from '../../constants/messages';
import crypto from 'crypto';
import { emailQueue } from '../notification/notification.queue';
import { getResetPasswordTemplate } from '../notification/mailer';
import { BadRequestError } from '../../errors/AppError';
import { AuditService } from '../audit/audit.service';

const auditService = new AuditService();

export class AuthService {
  async login(data: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { username: data.username },
      include: { department: true },
    });

    if (!user || user.deletedAt) {
      throw new UnauthorizedError(MESSAGES.AUTH.INVALID_CREDENTIALS);
    }

    if (user.status === 'Locked') {
      throw new UnauthorizedError(MESSAGES.AUTH.ACCOUNT_LOCKED);
    }

    const isMatch = await verifyPassword(data.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError(MESSAGES.AUTH.INVALID_CREDENTIALS);
    }

    const payload = { userId: user.id, role: user.role, tokenVersion: user.tokenVersion };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    auditService.logAction('LOGIN', user.id);

    return {
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        department: user.department.name,
      },
      accessToken,
      refreshToken,
    };
  }

  async refresh(token: string) {
    // Check blacklist
    const isBlacklisted = await redisClient.get(`bl_${token}`);
    if (isBlacklisted) {
      throw new UnauthorizedError(MESSAGES.AUTH.TOKEN_REVOKED);
    }

    try {
      const payload = verifyToken(token);
      
      // Ensure user still exists
      const user = await prisma.user.findUnique({ where: { id: payload.userId } });
      if (!user || user.deletedAt) {
        throw new UnauthorizedError(MESSAGES.AUTH.USER_NOT_FOUND_INACTIVE);
      }

      if (user.status === 'Locked') {
        throw new UnauthorizedError(MESSAGES.AUTH.ACCOUNT_LOCKED);
      }

      const newPayload = { userId: user.id, role: user.role, tokenVersion: user.tokenVersion };
      const accessToken = generateAccessToken(newPayload);

      return { accessToken };
    } catch (error) {
      if (error instanceof UnauthorizedError) throw error;
      throw new UnauthorizedError(MESSAGES.AUTH.INVALID_REFRESH_TOKEN);
    }
  }

  async logout(refreshToken: string) {
    if (!refreshToken) return;

    try {
      verifyToken(refreshToken);
      const decoded = jwt.decode(refreshToken) as any;
      
      // Calculate remaining TTL in seconds
      const expiresIn = decoded?.exp ? decoded.exp - Math.floor(Date.now() / 1000) : 7 * 24 * 60 * 60;
      
      if (expiresIn > 0) {
        // Add to blacklist with TTL
        await redisClient.setex(`bl_${refreshToken}`, expiresIn, 'blacklisted');
      }
    } catch (error) {
      // Token already invalid or expired, no need to blacklist
    }
  }

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || user.deletedAt) {
      // Return success even if user not found to prevent email enumeration
      return { message: 'If that email address is in our database, we will send you an email to reset your password.' };
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetPasswordToken: passwordResetToken,
        resetPasswordExpires: passwordResetExpires,
      },
    });

    const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;
    const message = getResetPasswordTemplate(resetUrl);

    await emailQueue.add('forgot-password', {
      to: user.email,
      subject: 'Password Reset Request',
      body: message,
    });

    return { message: 'If that email address is in our database, we will send you an email to reset your password.' };
  }

  async resetPassword(token: string, newPassword: string) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { gt: new Date() },
      },
    });

    if (!user || user.deletedAt) {
      throw new BadRequestError('Token is invalid or has expired');
    }

    const passwordHash = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        resetPasswordToken: null,
        resetPasswordExpires: null,
        tokenVersion: { increment: 1 },
      },
    });

    return { message: 'Password has been successfully reset' };
  }
}
