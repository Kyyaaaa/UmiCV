import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { env } from '../../config/env';
import { UnauthorizedError } from '../../errors/AppError';
import { MESSAGES } from '../../constants/messages';

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
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken || typeof refreshToken !== 'string') {
      throw new UnauthorizedError(MESSAGES.AUTH.INVALID_REFRESH_TOKEN);
    }

    const result = await authService.refresh(refreshToken);

    res.status(200).json({
      success: true,
      data: {
        accessToken: result.accessToken,
      },
    });
  }

  async logout(req: Request, res: Response) {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      await authService.logout(refreshToken);
    }
    
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    res.status(200).json({ success: true, message: MESSAGES.AUTH.LOGOUT_SUCCESS });
  }

  async forgotPassword(req: Request, res: Response) {
    const { email } = req.body;
    const result = await authService.forgotPassword(email);
    res.status(200).json({ success: true, message: result.message });
  }

  async resetPassword(req: Request, res: Response) {
    const { token, newPassword } = req.body;
    const result = await authService.resetPassword(token, newPassword);
    res.status(200).json({ success: true, message: result.message });
  }
}
