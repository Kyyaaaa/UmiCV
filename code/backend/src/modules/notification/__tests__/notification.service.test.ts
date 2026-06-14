import { NotificationService } from '../notification.service';
import prisma from '../../../config/db';

jest.mock('../../../config/db', () => ({
  __esModule: true,
  default: {
    notification: {
      count: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  },
}));

describe('NotificationService', () => {
  let notificationService: NotificationService;

  beforeEach(() => {
    notificationService = new NotificationService();
    jest.clearAllMocks();
  });

  describe('getNotifications', () => {
    it('should return paginated notifications for the user', async () => {
      const mockNotifications = [
        { id: '1', title: 'Test 1', isGlobal: true },
        { id: '2', title: 'Test 2', userId: 'user1' }
      ];
      
      (prisma.notification.count as jest.Mock).mockResolvedValue(2);
      (prisma.notification.findMany as jest.Mock).mockResolvedValue(mockNotifications);

      const result = await notificationService.getNotifications('user1', 1, 10);

      expect(prisma.notification.count).toHaveBeenCalledWith({
        where: {
          OR: [
            { isGlobal: true },
            { userId: 'user1' },
          ],
        }
      });
      expect(result).toEqual({
        total: 2,
        page: 1,
        limit: 10,
        data: mockNotifications
      });
    });
  });

  describe('broadcastNotification', () => {
    it('should create a global notification', async () => {
      const mockData = { title: 'Global', message: 'Hello' };
      const mockCreated = { id: '1', ...mockData, isGlobal: true };
      
      (prisma.notification.create as jest.Mock).mockResolvedValue(mockCreated);

      const result = await notificationService.broadcastNotification(mockData);

      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: {
          title: 'Global',
          message: 'Hello',
          isGlobal: true
        }
      });
      expect(result).toEqual(mockCreated);
    });
  });

  describe('checkNewNotifications', () => {
    it('should return hasNew: false if user not found', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue(null);
      const result = await notificationService.checkNewNotifications('user1');
      expect(result).toEqual({ hasNew: false });
    });

    it('should return hasNew: false if no notifications exist', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ lastCheckedNotifAt: null });
      (prisma.notification.findFirst as jest.Mock).mockResolvedValue(null);
      
      const result = await notificationService.checkNewNotifications('user1');
      expect(result).toEqual({ hasNew: false });
    });

    it('should return hasNew: true if user has never checked (lastCheckedNotifAt is null) and a notification exists', async () => {
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ lastCheckedNotifAt: null });
      (prisma.notification.findFirst as jest.Mock).mockResolvedValue({ createdAt: new Date() });
      
      const result = await notificationService.checkNewNotifications('user1');
      expect(result).toEqual({ hasNew: true });
    });

    it('should return hasNew: true if latest notification is newer than lastCheckedNotifAt', async () => {
      const past = new Date('2023-01-01');
      const future = new Date('2023-01-02');
      
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ lastCheckedNotifAt: past });
      (prisma.notification.findFirst as jest.Mock).mockResolvedValue({ createdAt: future });
      
      const result = await notificationService.checkNewNotifications('user1');
      expect(result).toEqual({ hasNew: true });
    });

    it('should return hasNew: false if latest notification is older than or equal to lastCheckedNotifAt', async () => {
      const time = new Date('2023-01-01');
      
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ lastCheckedNotifAt: time });
      (prisma.notification.findFirst as jest.Mock).mockResolvedValue({ createdAt: time });
      
      const result = await notificationService.checkNewNotifications('user1');
      expect(result).toEqual({ hasNew: false });
    });
  });

  describe('markNotificationsAsChecked', () => {
    it('should update user lastCheckedNotifAt', async () => {
      (prisma.user.update as jest.Mock).mockResolvedValue({ id: 'user1' });
      await notificationService.markNotificationsAsChecked('user1');
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 'user1' },
        data: { lastCheckedNotifAt: expect.any(Date) },
      });
    });
  });
});
