import { prismaMock } from '../../../__tests__/prismaMock';
import { WorkflowService } from '../workflow.service';
import { CVStatus, ApprovalAction } from '@prisma/client';
import { ForbiddenError, NotFoundError, BadRequestError } from '../../../errors/AppError';
import { MESSAGES } from '../../../constants/messages';

describe('WorkflowService', () => {
  let workflowService: WorkflowService;

  beforeEach(() => {
    workflowService = new WorkflowService();
    jest.clearAllMocks();
  });

  describe('submitDraft', () => {
    it('should submit draft successfully', async () => {
      prismaMock.cVProfile.findMany.mockResolvedValue([{ id: 'cv-1' }] as any);
      prismaMock.cVProfile.updateMany.mockResolvedValue({ count: 1 } as any);

      const result = await workflowService.submitDraft('user-1', { languageCode: 'vi' });

      expect(result).toEqual({ message: MESSAGES.WORKFLOW.SUBMIT_SUCCESS });
      expect(prismaMock.cVProfile.updateMany).toHaveBeenCalledWith({
        where: { id: { in: ['cv-1'] } },
        data: { status: CVStatus.PendingApproval, submittedAt: expect.any(Date) },
      });
    });

    it('should throw BadRequestError if no drafts found', async () => {
      prismaMock.cVProfile.findMany.mockResolvedValue([]);

      await expect(workflowService.submitDraft('user-1', { languageCode: 'vi' }))
        .rejects.toThrow(BadRequestError);
    });
  });

  describe('approveCV', () => {
    it('should throw ForbiddenError if TechLead does not manage user', async () => {
      prismaMock.cVProfile.findUnique.mockResolvedValue({ id: 'cv-1', userId: 'user-1', status: CVStatus.PendingApproval } as any);
      prismaMock.user.findUnique.mockResolvedValue({ id: 'approver-1', role: 'TechLead' } as any);
      prismaMock.projectMember.findFirst.mockResolvedValue(null); // not a member

      await expect(workflowService.approveCV('cv-1', 'approver-1', { level: 1 }))
        .rejects.toThrow(ForbiddenError);
    });

    it('should approve CV and publish if level 2 (HR)', async () => {
      prismaMock.cVProfile.findUnique.mockResolvedValue({ id: 'cv-1', userId: 'user-1', status: CVStatus.PendingApproval, versionNumber: 0 } as any);
      prismaMock.user.findUnique.mockResolvedValue({ id: 'hr-1', role: 'HR' } as any);
      prismaMock.$transaction.mockResolvedValue([] as any);

      const result = await workflowService.approveCV('cv-1', 'hr-1', { level: 2 });

      expect(result).toEqual({ message: MESSAGES.WORKFLOW.APPROVE_SUCCESS });
      expect(prismaMock.approvalLog.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({ action: ApprovalAction.Approve, level: 2 }),
      }));
      expect(prismaMock.$transaction).toHaveBeenCalled();
    });
  });
});
