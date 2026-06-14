import cron from 'node-cron';
import prisma from '../../../config/db';
import { emailQueue } from '../../notification/notification.queue';
import { setupWorkflowCronjobs } from '../workflow.cron';
import { CVStatus, ApprovalAction } from '@prisma/client';

jest.mock('node-cron', () => ({
  schedule: jest.fn(),
}));

jest.mock('../../../config/db', () => ({
  __esModule: true,
  default: {
    cVProfile: {
      findMany: jest.fn(),
    },
    user: {
      findMany: jest.fn(),
    },
    notification: {
      create: jest.fn(),
    },
  },
}));

jest.mock('../../notification/notification.queue', () => ({
  emailQueue: {
    add: jest.fn(),
  },
}));

describe('Workflow Cronjobs', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers().setSystemTime(new Date('2023-10-10T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should register the cronjob', () => {
    setupWorkflowCronjobs();
    expect(cron.schedule).toHaveBeenCalledWith('0 8 * * *', expect.any(Function));
  });

  describe('Cronjob Logic', () => {
    let cronCallback: Function;

    beforeEach(() => {
      setupWorkflowCronjobs();
      cronCallback = (cron.schedule as jest.Mock).mock.calls[0][1];
    });

    it('should do nothing if no PendingApproval CVs exist', async () => {
      (prisma.cVProfile.findMany as jest.Mock).mockResolvedValue([]);
      
      await cronCallback();
      
      expect(prisma.notification.create).not.toHaveBeenCalled();
      expect(emailQueue.add).not.toHaveBeenCalled();
    });

    it('should send warning to TechLead if hoursDiff >= 24 and no level 1 approval', async () => {
      const submittedAt = new Date(Date.now() - 25 * 60 * 60 * 1000); // 25 hours ago
      
      (prisma.cVProfile.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'cv-1',
          status: CVStatus.PendingApproval,
          submittedAt,
          user: {
            id: 'user-1',
            fullName: 'User One',
            projectMembers: [
              { project: { techLeadId: 'techlead-1' } }
            ]
          },
          approvalLogs: []
        }
      ]);

      (prisma.user.findMany as jest.Mock).mockImplementation((args) => {
        if (args?.where?.role === 'HR') return Promise.resolve([{ id: 'hr-1', email: 'hr@test.com' }]);
        if (args?.where?.id?.in) return Promise.resolve([{ id: 'techlead-1', email: 'tl@test.com' }]);
        return Promise.resolve([]);
      });

      await cronCallback();

      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'techlead-1',
          title: expect.stringContaining('SLA Warning'),
          message: expect.stringContaining('Warning'),
        })
      });
      expect(emailQueue.add).toHaveBeenCalledWith('send-reminder', expect.objectContaining({
        to: 'tl@test.com'
      }));
    });

    it('should send overdue to HR if hoursDiff >= 48 and has level 1 approval', async () => {
      const submittedAt = new Date(Date.now() - 50 * 60 * 60 * 1000); // 50 hours ago
      
      (prisma.cVProfile.findMany as jest.Mock).mockResolvedValue([
        {
          id: 'cv-2',
          status: CVStatus.PendingApproval,
          submittedAt,
          user: {
            id: 'user-2',
            fullName: 'User Two',
            projectMembers: [
              { project: { techLeadId: 'techlead-1' } }
            ]
          },
          approvalLogs: [
            { level: 1, action: ApprovalAction.Approve, createdAt: new Date(Date.now() - 40 * 60 * 60 * 1000) }
          ]
        }
      ]);

      (prisma.user.findMany as jest.Mock).mockImplementation((args) => {
        if (args?.where?.role === 'HR') return Promise.resolve([{ id: 'hr-1', email: 'hr@test.com' }]);
        return Promise.resolve([]);
      });

      await cronCallback();

      expect(prisma.notification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          userId: 'hr-1',
          title: expect.stringContaining('SLA Overdue'),
          message: expect.stringContaining('Overdue'),
        })
      });
      expect(emailQueue.add).toHaveBeenCalledWith('send-reminder', expect.objectContaining({
        to: 'hr@test.com'
      }));
    });
  });
});
