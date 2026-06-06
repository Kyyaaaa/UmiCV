import prisma from '../../config/db';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../errors/AppError';
import { CVStatus, ApprovalAction } from '@prisma/client';
import { ApproveInput, RejectInput, SubmitDraftInput } from './workflow.dto';
import { MESSAGES } from '../../constants/messages';

export class WorkflowService {
  async submitDraft(userId: string, data: SubmitDraftInput) {
    // Only one language? The requirement doesn't specify. Assume we submit the 'vi' one or it's passed via body/query. 
    // Let's assume user submits their primary draft (or we need CV Profile ID).
    const profiles = await prisma.cVProfile.findMany({
      where: {
        userId,
        languageCode: data.languageCode,
        status: { in: [CVStatus.Draft, CVStatus.Outdated] },
      },
    });

    if (profiles.length === 0) {
      throw new BadRequestError(MESSAGES.WORKFLOW.NO_DRAFTS);
    }

    await prisma.cVProfile.updateMany({
      where: {
        id: { in: profiles.map((p) => p.id) },
      },
      data: {
        status: CVStatus.PendingApproval,
        submittedAt: new Date(),
      },
    });

    return { message: MESSAGES.WORKFLOW.SUBMIT_SUCCESS };
  }

  private async verifyApproverScope(cvUserId: string, approverId: string, level: number) {
    const approver = await prisma.user.findUnique({ where: { id: approverId } });
    if (!approver) throw new ForbiddenError(MESSAGES.WORKFLOW.APPROVER_NOT_FOUND);

    if (level === 1) {
      if (approver.role !== 'TechLead') throw new ForbiddenError(MESSAGES.WORKFLOW.LEVEL1_TECHLEAD_ONLY);
      const isLead = await prisma.projectMember.findFirst({
        where: {
          userId: cvUserId,
          project: { techLeadId: approverId }
        }
      });
      if (!isLead) throw new ForbiddenError(MESSAGES.WORKFLOW.LEVEL1_MEMBER_ONLY);
    } else if (level === 2) {
      if (approver.role !== 'HR' && approver.role !== 'Admin') {
        throw new ForbiddenError(MESSAGES.WORKFLOW.LEVEL2_HR_ADMIN_ONLY);
      }
      // HR can approve company-wide for now as per assumptions
    }
  }

  async approveCV(cvId: string, approverId: string, data: ApproveInput) {
    const cv = await prisma.cVProfile.findUnique({ where: { id: cvId } });
    if (!cv) throw new NotFoundError(MESSAGES.CV.NOT_FOUND);
    if (cv.status !== CVStatus.PendingApproval) {
      throw new BadRequestError(MESSAGES.WORKFLOW.NOT_PENDING);
    }

    await this.verifyApproverScope(cv.userId, approverId, data.level);

    // State Machine: 2-Level Approval Logic
    const logs = await prisma.approvalLog.findMany({ 
      where: { 
        cvProfileId: cvId,
        ...(cv.submittedAt ? { createdAt: { gte: cv.submittedAt } } : {})
      } 
    });

    if (data.level === 1) {
      const hasLevel2 = logs.some(l => l.level === 2 && l.action === ApprovalAction.Approve);
      if (hasLevel2) {
        throw new BadRequestError('CV đã được HR duyệt, không thể duyệt lại cấp 1.');
      }

      const hasLevel1 = logs.some(l => l.level === 1 && l.action === ApprovalAction.Approve);
      if (hasLevel1) {
        throw new BadRequestError('CV đã được duyệt cấp 1, không thể duyệt lại.');
      }
    }

    if (data.level === 2) {
      const hasTechLead = await prisma.projectMember.findFirst({ where: { userId: cv.userId } });
      const hasLevel1 = logs.some(l => l.level === 1 && l.action === ApprovalAction.Approve);
      
      if (hasTechLead && !hasLevel1) {
        throw new BadRequestError('CV phải được TechLead duyệt trước khi HR phê duyệt.');
      }

      const hasLevel2 = logs.some(l => l.level === 2 && l.action === ApprovalAction.Approve);
      if (hasLevel2) {
        throw new BadRequestError('CV đã được duyệt cấp 2, không thể duyệt lại.');
      }
    }

    // Log approval
    await prisma.approvalLog.create({
      data: {
        cvProfileId: cvId,
        approverId,
        action: ApprovalAction.Approve,
        level: data.level,
      },
    });

    // If level 2 (HR), we publish
    if (data.level === 2) {
      const updatedVersion = cv.versionNumber + 1;
      
      await prisma.$transaction([
        prisma.cVProfile.update({
          where: { id: cvId },
          data: {
            status: CVStatus.Updated,
            versionNumber: updatedVersion,
            publishedAt: new Date(),
          },
        }),
        prisma.cVVersionHistory.create({
          data: {
            cvProfileId: cvId,
            versionNumber: updatedVersion,
            snapshotData: cv.sectionsData as any,
          },
        }),
      ]);
    }

    return { message: MESSAGES.WORKFLOW.APPROVE_SUCCESS };
  }

  async rejectCV(cvId: string, approverId: string, data: RejectInput, level: number) {
    const cv = await prisma.cVProfile.findUnique({ where: { id: cvId } });
    if (!cv) throw new NotFoundError(MESSAGES.CV.NOT_FOUND);
    if (cv.status !== CVStatus.PendingApproval) {
      throw new BadRequestError(MESSAGES.WORKFLOW.NOT_PENDING);
    }

    await this.verifyApproverScope(cv.userId, approverId, level);

    // Log rejection
    await prisma.approvalLog.create({
      data: {
        cvProfileId: cvId,
        approverId,
        action: ApprovalAction.Reject,
        level,
        reason: data.reason,
        sectionId: data.sectionId,
      },
    });

    // Revert status to Draft
    await prisma.cVProfile.update({
      where: { id: cvId },
      data: {
        status: CVStatus.Draft,
      },
    });

    return { message: MESSAGES.WORKFLOW.REJECT_SUCCESS };
  }

  async getApprovalLogs(cvId: string) {
    const cv = await prisma.cVProfile.findUnique({ where: { id: cvId } });
    if (!cv) throw new NotFoundError(MESSAGES.CV.NOT_FOUND);

    const logs = await prisma.approvalLog.findMany({
      where: { 
        cvProfileId: cvId,
        ...(cv.submittedAt ? { createdAt: { gte: cv.submittedAt } } : {})
      },
      include: {
        approver: {
          select: { fullName: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return logs.map((log) => ({
      id: log.id,
      approverId: log.approverId,
      approverName: log.approver.fullName,
      action: log.action,
      level: log.level,
      reason: log.reason,
      createdAt: log.createdAt
    }));
  }
}
