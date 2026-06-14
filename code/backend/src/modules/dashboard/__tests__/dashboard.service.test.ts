import { DashboardService } from '../dashboard.service';
import prisma from '../../../config/db';
import { CVStatus } from '@prisma/client';

jest.mock('../../../config/db', () => ({
  __esModule: true,
  default: {
    cVProfile: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

describe('DashboardService', () => {
  let dashboardService: DashboardService;

  beforeEach(() => {
    dashboardService = new DashboardService();
    jest.clearAllMocks();
  });

  describe('buildDashboardWhereClause', () => {
    it('should return empty object for Admin', () => {
      const where = (dashboardService as any).buildDashboardWhereClause('admin-1', 'Admin');
      expect(where).toEqual({});
    });

    it('should return empty object for HR', () => {
      const where = (dashboardService as any).buildDashboardWhereClause('hr-1', 'HR');
      expect(where).toEqual({});
    });

    it('should return correct clause for TechLead', () => {
      const where = (dashboardService as any).buildDashboardWhereClause('techlead-1', 'TechLead');
      expect(where).toEqual({
        OR: [
          { userId: 'techlead-1' },
          { user: { projectMembers: { some: { project: { techLeadId: 'techlead-1' } } } } },
        ],
      });
    });

    it('should return correct clause for Employee', () => {
      const where = (dashboardService as any).buildDashboardWhereClause('emp-1', 'Employee');
      expect(where).toEqual({ userId: 'emp-1' });
    });
  });

  describe('getStats', () => {
    it('should return correct counts', async () => {
      (prisma.cVProfile.count as jest.Mock)
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(20)  // pending
        .mockResolvedValueOnce(50)  // updated
        .mockResolvedValueOnce(30); // outdated

      const result = await dashboardService.getStats('user-1', 'Admin');
      expect(result).toEqual({ total: 100, pending: 20, updated: 50, outdated: 30 });
      expect(prisma.cVProfile.count).toHaveBeenCalledTimes(4);
      expect(prisma.cVProfile.count).toHaveBeenNthCalledWith(1, { where: {} });
      expect(prisma.cVProfile.count).toHaveBeenNthCalledWith(2, { where: { status: CVStatus.PendingApproval } });
      expect(prisma.cVProfile.count).toHaveBeenNthCalledWith(3, { where: { status: CVStatus.Updated } });
      expect(prisma.cVProfile.count).toHaveBeenNthCalledWith(4, { where: { status: CVStatus.Outdated } });
    });
  });

  describe('getRecentCVs', () => {
    it('should return mapped recent CVs', async () => {
      const mockCVs = [
        {
          id: 'cv-1',
          userId: 'user-1',
          user: { fullName: 'User One' },
          languageCode: 'vi',
          status: CVStatus.Updated,
          versionNumber: 2,
          updatedAt: new Date('2023-01-01'),
        }
      ];
      (prisma.cVProfile.findMany as jest.Mock).mockResolvedValue(mockCVs);

      const result = await dashboardService.getRecentCVs('emp-1', 'Employee', 3);
      expect(result).toEqual([{
        id: 'cv-1',
        userId: 'user-1',
        userFullName: 'User One',
        languageCode: 'vi',
        status: CVStatus.Updated,
        versionNumber: 2,
        updatedAt: mockCVs[0].updatedAt,
      }]);

      expect(prisma.cVProfile.findMany).toHaveBeenCalledWith({
        where: { userId: 'emp-1' },
        orderBy: { updatedAt: 'desc' },
        take: 3,
        include: { user: { select: { fullName: true } } }
      });
    });
  });
});
