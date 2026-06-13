import { NotificationService } from '../notification.service';
import prisma from '../../../config/db';

jest.mock('../../../config/db', () => ({
  __esModule: true,
  default: {
    notification: {
      count: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
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
});
