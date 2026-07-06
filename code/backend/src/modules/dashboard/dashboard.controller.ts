import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth.middleware';
import { DashboardService } from './dashboard.service';

const dashboardService = new DashboardService();

export class DashboardController {
  async getStats(req: AuthRequest, res: Response) {
    const userId = req.user!.userId;
    const role = req.user!.role;

    const stats = await dashboardService.getStats(userId, role);
    res.status(200).json({ success: true, data: stats });
  }

  async getRecentCVs(req: AuthRequest, res: Response) {
    const userId = req.user!.userId;
    const role = req.user!.role;
    const limit = parseInt(req.query.limit as string) || 5;

    const cvs = await dashboardService.getRecentCVs(userId, role, limit);
    res.status(200).json({ success: true, data: cvs });
  }
}
