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
      });

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
});
