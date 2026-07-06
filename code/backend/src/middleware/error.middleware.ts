import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/AppError';
import { env } from '../config/env';
import { logger } from '../utils/logger.util';
import { MESSAGES } from '../constants/messages';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof ZodError) {
    const firstError = err.errors[0];
    const message = firstError ? `Lỗi tại trường ${firstError.path.join('.')}: ${firstError.message}` : MESSAGES.COMMON.VALIDATION_FAILED;
    return res.status(400).json({
      success: false,
      message,
      errors: err.errors.map(e => ({ field: e.path.join('.'), message: e.message })),
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Unhandled errors
  logger.error('Unhandled Error:', err);
  
  return res.status(500).json({
    success: false,
    message: MESSAGES.COMMON.INTERNAL_SERVER_ERROR,
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};
