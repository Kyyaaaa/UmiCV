import prisma from '../../config/db';
import { BroadcastNotificationInput } from './notification.dto';

export class NotificationService {
  async getNotifications(userId: string, page: number, limit: number) {
    const skip = (page - 1) * limit;

    const where = {
      OR: [
        { isGlobal: true },
        { userId: userId },
      ],
    };

    const [total, data] = await Promise.all([
      prisma.notification.count({ where }),
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    return { total, page, limit, data };
  }

  async broadcastNotification(data: BroadcastNotificationInput) {
    const notification = await prisma.notification.create({
      data: {
        title: data.title,
        message: data.message,
        isGlobal: true,
      },
    });

    return notification;
  }
}
