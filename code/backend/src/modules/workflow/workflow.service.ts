import prisma from '../../config/db';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../errors/AppError';
import { CVStatus, ApprovalAction, TargetStatus, BatchRequestStatus } from '@prisma/client';
import { ApproveInput, RejectInput, SubmitDraftInput } from './workflow.dto';
import { MESSAGES } from '../../constants/messages';
import { emailQueue } from '../notification/notification.queue';
import { getRejectCVTemplate } from '../notification/mailer';

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
      if (approver.role !== 'TechLead' && approver.role !== 'Admin') throw new ForbiddenError(MESSAGES.WORKFLOW.LEVEL1_TECHLEAD_ONLY);
      if (approver.role === 'TechLead') {
        const isLead = await prisma.projectMember.findFirst({
          where: {
            userId: cvUserId,
            project: { techLeadId: approverId }
          }
        });
        if (!isLead) throw new ForbiddenError(MESSAGES.WORKFLOW.LEVEL1_MEMBER_ONLY);
      }
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

      const hasProcessed = logs.some(l => l.level === 1);
      if (hasProcessed) {
        throw new BadRequestError('CV này đã được một Tech Lead khác xử lý.');
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

      const activeTargets = await prisma.batchRequestTarget.findMany({
        where: {
          userId: cv.userId,
          status: TargetStatus.Outdated,
          batchRequest: { status: BatchRequestStatus.Active }
        },
        select: { batchRequestId: true }
      });
      const batchIds = activeTargets.map(t => t.batchRequestId);

      const transactions: any[] = [
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
        prisma.notification.create({
          data: {
            title: 'CV Approved',
            message: `Your CV (version ${updatedVersion}) has been approved and published successfully.`,
            userId: cv.userId,
            isGlobal: false,
          }
        })
      ];

      if (batchIds.length > 0) {
        transactions.push(
          prisma.batchRequestTarget.updateMany({
            where: {
              userId: cv.userId,
              batchRequestId: { in: batchIds }
            },
            data: { 
              status: TargetStatus.Updated, 
              updatedAt: new Date() 
            }
          })
        );
      }
      
      await prisma.$transaction(transactions);

      // TASK-15.2: Auto-Complete Batch Request
      for (const batchId of batchIds) {
        const outdatedCount = await prisma.batchRequestTarget.count({
          where: {
            batchRequestId: batchId,
            status: TargetStatus.Outdated
          }
        });

        if (outdatedCount === 0) {
          const updatedBatch = await prisma.batchRequest.update({
            where: { id: batchId },
            data: { status: BatchRequestStatus.Completed },
            select: { title: true, createdBy: true }
          });

          await prisma.notification.create({
            data: {
              title: 'Batch Request Completed',
              message: `Chiến dịch "${updatedBatch.title}" đã hoàn tất 100%.`,
              userId: updatedBatch.createdBy,
              isGlobal: false,
            }
          });
        }
      }
    }

    return { message: MESSAGES.WORKFLOW.APPROVE_SUCCESS };
  }

  async rejectCV(cvId: string, approverId: string, data: RejectInput, level: number) {
    const cv = await prisma.cVProfile.findUnique({ 
      where: { id: cvId },
      include: { user: true }
    });
    if (!cv) throw new NotFoundError(MESSAGES.CV.NOT_FOUND);
    if (cv.status !== CVStatus.PendingApproval) {
      throw new BadRequestError(MESSAGES.WORKFLOW.NOT_PENDING);
    }

    await this.verifyApproverScope(cv.userId, approverId, level);

    const logs = await prisma.approvalLog.findMany({ 
      where: { 
        cvProfileId: cvId,
        ...(cv.submittedAt ? { createdAt: { gte: cv.submittedAt } } : {})
      } 
    });

    if (level === 1) {
      const hasProcessed = logs.some(l => l.level === 1);
      if (hasProcessed) {
        throw new BadRequestError('CV này đã được một Tech Lead khác xử lý.');
      }
    }

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

    // Notify the user via In-App Notification
    await prisma.notification.create({
      data: {
        title: 'CV Rejected',
        message: `Your CV was rejected. Reason: ${data.reason}`,
        userId: cv.userId,
        isGlobal: false,
      }
    });

    // Notify the user about rejection
    await emailQueue.add('reject-cv', {
      to: cv.user.email,
      subject: `Your CV has been rejected`,
      body: getRejectCVTemplate(data.reason),
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
