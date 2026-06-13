import { Response } from 'express';
import { NotificationService } from './notification.service';
import { AuthRequest } from '../../middleware/auth.middleware';

const notificationService = new NotificationService();

export class NotificationController {
  async getAll(req: AuthRequest, res: Response) {
    const userId = req.user!.userId;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const result = await notificationService.getNotifications(userId, page, limit);
    res.status(200).json({ success: true, ...result });
  }

  async broadcast(req: AuthRequest, res: Response) {
    const data = req.body;
    const result = await notificationService.broadcastNotification(data);
    res.status(201).json({ success: true, data: result });
  }
}
