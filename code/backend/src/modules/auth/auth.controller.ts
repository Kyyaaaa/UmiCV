import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { env } from '../../config/env';
import { UnauthorizedError } from '../../errors/AppError';

const authService = new AuthService();

export class AuthController {
  async login(req: Request, res: Response) {
    const result = await authService.login(req.body);

    // Set refresh token in HttpOnly cookie
    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({
      success: true,
      data: {
        user: result.user,
        accessToken: result.accessToken,
      },
    });
  }

  async refresh(req: Request, res: Response) {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new UnauthorizedError('No refresh token provided');
    }
    
    const result = await authService.refresh(refreshToken);
    
    res.status(200).json({
      success: true,
      data: {
        accessToken: result.accessToken,
      },
    });
  }
}
