import { prismaMock } from '../../../__tests__/prismaMock';
import { CVService } from '../cv.service';

describe('CVService', () => {
  let cvService: CVService;

  beforeEach(() => {
    cvService = new CVService();
    jest.clearAllMocks();
  });

  describe('searchCVs', () => {
    it('should search securely with JSON parsing using Prisma queryRaw', async () => {
      prismaMock.$queryRaw.mockResolvedValue([{ id: 'cv-1' }] as any);
      prismaMock.cVProfile.count.mockResolvedValue(1);
      prismaMock.cVProfile.findMany.mockResolvedValue([{ id: 'cv-1', user: { username: 'testuser' } }] as any);

      const result = await cvService.searchCVs({
        keyword: 'React" OR "1"="1', // Malicious input with special characters
        page: 1,
        limit: 10,
      }, 'admin-id', 'Admin');

      expect(result.data).toHaveLength(1);
      expect(prismaMock.$queryRaw).toHaveBeenCalledTimes(1);

      // Verify findMany was called with the correct OR condition
      expect(prismaMock.cVProfile.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            OR: [
              { user: { username: { contains: 'React" OR "1"="1', mode: 'insensitive' } } },
              { id: { in: ['cv-1'] } },
            ],
          },
        })
      );
    });
  });

  describe('getLatestApprovedCV', () => {
    it('should throw NotFoundError if CV does not exist', async () => {
      prismaMock.cVProfile.findUnique.mockResolvedValue(null as any);

      await expect(cvService.getLatestApprovedCV('cv-1', 'user-1', 'Employee'))
        .rejects
        .toThrow('Không tìm thấy hồ sơ CV');
    });

    it('should throw NotFoundError if versionNumber is 0', async () => {
      prismaMock.cVProfile.findUnique.mockResolvedValue({ id: 'cv-1', userId: 'user-1', versionNumber: 0 } as any);

      await expect(cvService.getLatestApprovedCV('cv-1', 'user-1', 'Employee'))
        .rejects
        .toThrow('CV này chưa từng được duyệt');
    });

    it('should throw NotFoundError if no version history found', async () => {
      prismaMock.cVProfile.findUnique.mockResolvedValue({ id: 'cv-1', userId: 'user-1', versionNumber: 1 } as any);
      prismaMock.cVVersionHistory.findFirst.mockResolvedValue(null as any);

      await expect(cvService.getLatestApprovedCV('cv-1', 'user-1', 'Employee'))
        .rejects
        .toThrow('CV này chưa từng được duyệt');
    });

    it('should return the latest approved version', async () => {
      const mockVersion = { id: 'v-1', versionNumber: 1, snapshotData: {} };
      prismaMock.cVProfile.findUnique.mockResolvedValue({ id: 'cv-1', userId: 'user-1', versionNumber: 1 } as any);
      prismaMock.cVVersionHistory.findFirst.mockResolvedValue(mockVersion as any);

      const result = await cvService.getLatestApprovedCV('cv-1', 'user-1', 'Employee');
      
      expect(result).toEqual(mockVersion);
      expect(prismaMock.cVVersionHistory.findFirst).toHaveBeenCalledWith({
        where: { cvProfileId: 'cv-1' },
        orderBy: { versionNumber: 'desc' },
      });
    });
  });
});
