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

  async checkNewNotifications(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { lastCheckedNotifAt: true },
    });

    if (!user) {
      return { hasNew: false };
    }

    const latestNotif = await prisma.notification.findFirst({
      where: {
        OR: [
          { isGlobal: true },
          { userId: userId },
        ],
      },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    });

    if (!latestNotif) {
      return { hasNew: false };
    }

    if (!user.lastCheckedNotifAt) {
      return { hasNew: true };
    }

    return {
      hasNew: latestNotif.createdAt > user.lastCheckedNotifAt,
    };
  }

  async markNotificationsAsChecked(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { lastCheckedNotifAt: new Date() },
    });
  }
}
