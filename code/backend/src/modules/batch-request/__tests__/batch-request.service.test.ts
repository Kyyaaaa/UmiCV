import { prismaMock } from '../../../__tests__/prismaMock';
import { BatchRequestService } from '../batch-request.service';
import { NotFoundError, BadRequestError } from '../../../errors/AppError';
import { BatchRequestStatus } from '@prisma/client';

jest.mock('../../audit/audit.service', () => {
  return {
    AuditService: jest.fn().mockImplementation(() => {
      return { logAction: jest.fn() };
    })
  };
});

describe('BatchRequestService', () => {
  let service: BatchRequestService;

  beforeEach(() => {
    service = new BatchRequestService();
    jest.clearAllMocks();
  });

  describe('getBatchRequests', () => {
    it('should return paginated batch requests', async () => {
      prismaMock.batchRequest.count.mockResolvedValue(1);
      prismaMock.batchRequest.findMany.mockResolvedValue([
        { id: 'batch-1', title: 'Update CV', _count: { targets: 0 } } as any
      ]);

      const result = await service.getBatchRequests({ page: 1, limit: 10 });
      expect(result.total).toBe(1);
      expect(result.data.length).toBe(1);
      expect(result.data[0].id).toBe('batch-1');
    });
  });

  describe('getBatchRequestTargets', () => {
    it('should return targets for a valid batch request', async () => {
      prismaMock.batchRequest.findUnique.mockResolvedValue({ id: 'batch-1' } as any);
      prismaMock.batchRequestTarget.findMany.mockResolvedValue([
        { userId: 'user-1', status: 'Outdated' } as any
      ]);

      const result = await service.getBatchRequestTargets('batch-1', {});
      expect(result.length).toBe(1);
    });

    it('should throw NotFoundError if batch request does not exist', async () => {
      prismaMock.batchRequest.findUnique.mockResolvedValue(null as any);

      await expect(service.getBatchRequestTargets('batch-999', {})).rejects.toThrow(NotFoundError);
    });
  });
});
