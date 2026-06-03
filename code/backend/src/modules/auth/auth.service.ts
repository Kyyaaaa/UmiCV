import prisma from '../../config/db';
import { verifyPassword } from '../../utils/hash.util';
import { generateAccessToken, generateRefreshToken, verifyToken } from '../../utils/jwt.util';
import jwt from 'jsonwebtoken';
import { UnauthorizedError } from '../../errors/AppError';
import { LoginInput } from './auth.dto';
import { redisClient } from '../../config/redis';
import { env } from '../../config/env';

export class AuthService {
  async login(data: LoginInput) {
    const user = await prisma.user.findUnique({
      where: { username: data.username },
      include: { department: true },
    });

    if (!user || user.deletedAt) {
      throw new UnauthorizedError('Invalid username or password');
    }

    const isMatch = await verifyPassword(data.password, user.passwordHash);
    if (!isMatch) {
      throw new UnauthorizedError('Invalid username or password');
    }

    const payload = { userId: user.id, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

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
      throw new UnauthorizedError('Token has been revoked');
    }

    try {
      const payload = verifyToken(token);
      
      // Ensure user still exists
      const user = await prisma.user.findUnique({ where: { id: payload.userId } });
      if (!user || user.deletedAt) {
        throw new UnauthorizedError('User not found or inactive');
      }

      const newPayload = { userId: user.id, role: user.role };
      const accessToken = generateAccessToken(newPayload);

      return { accessToken };
    } catch (error) {
      throw new UnauthorizedError('Invalid refresh token');
    }
  }

  async logout(refreshToken: string) {
    if (!refreshToken) return;

    try {
      const payload = verifyToken(refreshToken);
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
}
