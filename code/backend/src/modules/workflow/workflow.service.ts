import prisma from '../../config/db';
import { NotFoundError, BadRequestError, ForbiddenError } from '../../errors/AppError';
import { CVStatus, ApprovalAction } from '@prisma/client';
import { ApproveInput, RejectInput, SubmitDraftInput } from './workflow.dto';

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
      throw new BadRequestError('No drafts to submit');
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

    return { message: 'Drafts submitted successfully' };
  }

  private async verifyApproverScope(cvUserId: string, approverId: string, level: number) {
    const approver = await prisma.user.findUnique({ where: { id: approverId } });
    if (!approver) throw new ForbiddenError('Approver not found');

    if (level === 1) {
      if (approver.role !== 'TechLead') throw new ForbiddenError('Only TechLead can approve level 1');
      const isLead = await prisma.projectMember.findFirst({
        where: {
          userId: cvUserId,
          project: { techLeadId: approverId }
        }
      });
      if (!isLead) throw new ForbiddenError('TechLead can only approve CVs of their project members');
    } else if (level === 2) {
      if (approver.role !== 'HR' && approver.role !== 'Admin') {
        throw new ForbiddenError('Only HR/Admin can approve level 2');
      }
      // HR can approve company-wide for now as per assumptions
    }
  }

  async approveCV(cvId: string, approverId: string, data: ApproveInput) {
    const cv = await prisma.cVProfile.findUnique({ where: { id: cvId } });
    if (!cv) throw new NotFoundError('CV not found');
    if (cv.status !== CVStatus.PendingApproval) {
      throw new BadRequestError('CV is not pending approval');
    }

    await this.verifyApproverScope(cv.userId, approverId, data.level);

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

    return { message: 'CV approved successfully' };
  }

  async rejectCV(cvId: string, approverId: string, data: RejectInput, level: number) {
    const cv = await prisma.cVProfile.findUnique({ where: { id: cvId } });
    if (!cv) throw new NotFoundError('CV not found');
    if (cv.status !== CVStatus.PendingApproval) {
      throw new BadRequestError('CV is not pending approval');
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

    return { message: 'CV rejected' };
  }
}
