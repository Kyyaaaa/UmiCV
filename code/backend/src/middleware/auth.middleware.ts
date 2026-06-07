import { Request, Response, NextFunction } from 'express';
import prisma from '../config/db';
import { UnauthorizedError, ForbiddenError } from '../errors/AppError';
import { verifyToken } from '../utils/jwt.util';
import { MESSAGES } from '../constants/messages';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError(MESSAGES.AUTH.MISSING_TOKEN);
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyToken(token) as any;
    
    // Check in database to see if user is locked or deleted
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId }
    });

    if (!user || user.deletedAt) {
      throw new UnauthorizedError(MESSAGES.AUTH.USER_NOT_FOUND_INACTIVE);
    }

    if (user.status === 'Locked') {
      throw new UnauthorizedError(MESSAGES.AUTH.ACCOUNT_LOCKED);
    }

    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw error;
    }
    throw new UnauthorizedError(MESSAGES.AUTH.INVALID_TOKEN);
  }
};

export const authorize = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError(MESSAGES.AUTH.NOT_AUTHENTICATED);
    }

    if (!roles.includes(req.user.role)) {
      throw new ForbiddenError(MESSAGES.RBAC.FORBIDDEN);
    }
    
    next();
  };
};
