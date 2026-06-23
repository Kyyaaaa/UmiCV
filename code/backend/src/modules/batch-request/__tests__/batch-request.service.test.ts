import { prismaMock } from '../../../__tests__/prismaMock';
import { BatchRequestService } from '../batch-request.service';
import { NotFoundError } from '../../../errors/AppError';

jest.mock('../../audit/audit.service', () => {
  return {
    AuditService: jest.fn().mockImplementation(() => {
      return { logAction: jest.fn() };
    })
  };
});

import { emailQueue } from '../../notification/notification.queue';

jest.mock('../../notification/notification.queue', () => ({
  emailQueue: {
    addBulk: jest.fn(),
  },
}));

describe('BatchRequestService', () => {
  let service: BatchRequestService;

  beforeEach(() => {
    service = new BatchRequestService();
    jest.clearAllMocks();
  });

  describe('createBatchRequest', () => {
    it('should create batch request and queue emails asynchronously', async () => {
      prismaMock.$transaction.mockImplementation(async (cb) => {
        return cb(prismaMock);
      });

      prismaMock.batchRequest.create.mockResolvedValue({ id: 'batch-1' } as any);
      prismaMock.user.findMany.mockResolvedValue([
        { id: 'user-1', email: 'test1@test.com' },
        { id: 'user-2', email: 'test2@test.com' },
      ] as any);

      await service.createBatchRequest('hr-1', {
        title: 'Test Title',
        description: 'Test Description',
        deadline: new Date().toISOString(),
        targetUserIds: ['user-1', 'user-2'],
      });

      // Wait a tick for async I/O
      await new Promise(resolve => setImmediate(resolve));

      expect(emailQueue.addBulk).toHaveBeenCalledTimes(1);
      const jobs = (emailQueue.addBulk as jest.Mock).mock.calls[0][0];
      expect(jobs).toHaveLength(2);
      expect(jobs[0].data.to).toBe('test1@test.com');
      expect(jobs[1].data.to).toBe('test2@test.com');
    });
  });

  describe('updateBatchRequest', () => {
    it('should update batch request and queue emails for new users asynchronously', async () => {
      prismaMock.$transaction.mockImplementation(async (cb) => {
        return cb(prismaMock);
      });

      prismaMock.batchRequest.findUnique.mockResolvedValue({
        id: 'batch-1',
        title: 'Old Title',
        targets: [{ userId: 'user-old' }],
        status: 'Active'
      } as any);

      prismaMock.user.findMany.mockResolvedValue([
        { id: 'user-new', email: 'test-new@test.com' }
      ] as any);

      await service.updateBatchRequest('batch-1', 'hr-1', {
        title: 'New Title',
        targetUserIds: ['user-old', 'user-new'], // new user added
      });

      // Wait a tick for async I/O
      await new Promise(resolve => setImmediate(resolve));

      expect(emailQueue.addBulk).toHaveBeenCalledTimes(1);
      const jobs = (emailQueue.addBulk as jest.Mock).mock.calls[0][0];
      expect(jobs).toHaveLength(1);
      expect(jobs[0].data.to).toBe('test-new@test.com');
    });
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
    it('should return paginated targets for a valid batch request', async () => {
      prismaMock.batchRequest.findUnique.mockResolvedValue({ id: 'batch-1' } as any);
      prismaMock.batchRequestTarget.count.mockResolvedValue(1);
      prismaMock.batchRequestTarget.findMany.mockResolvedValue([
        { userId: 'user-1', status: 'Outdated' } as any
      ]);

      const result = await service.getBatchRequestTargets('batch-1', {});
      expect(result.data.length).toBe(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should throw NotFoundError if batch request does not exist', async () => {
      prismaMock.batchRequest.findUnique.mockResolvedValue(null as any);

      await expect(service.getBatchRequestTargets('batch-999', {})).rejects.toThrow(NotFoundError);
    });
  });
});
