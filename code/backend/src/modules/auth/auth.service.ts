import prisma from '../../config/db';
import { verifyPassword } from '../../utils/hash.util';
import { generateAccessToken, generateRefreshToken } from '../../utils/jwt.util';
import { UnauthorizedError } from '../../errors/AppError';
import { LoginInput } from './auth.dto';

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
}
