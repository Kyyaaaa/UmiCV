import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError, ForbiddenError } from '../errors/AppError';
import { verifyToken } from '../utils/jwt.util';
import { MESSAGES } from '../constants/messages';

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
  };
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new UnauthorizedError(MESSAGES.AUTH.MISSING_TOKEN);
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyToken(token) as any;
    req.user = decoded;
    next();
  } catch (error) {
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
