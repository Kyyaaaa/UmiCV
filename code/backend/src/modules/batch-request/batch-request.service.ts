import prisma from '../../config/db';
import { CreateBatchRequestInput } from './batch-request.dto';
import { NotFoundError, BadRequestError } from '../../errors/AppError';
import { BatchRequestStatus, CVStatus, TargetStatus, Prisma } from '@prisma/client';
import { MESSAGES } from '../../constants/messages';

export class BatchRequestService {
  async createBatchRequest(hrUserId: string, data: CreateBatchRequestInput) {
    return prisma.$transaction(async (tx) => {
      // Create Batch Request
      const batchRequest = await tx.batchRequest.create({
        data: {
          createdBy: hrUserId,
          title: data.title,
          description: data.description,
          deadline: new Date(data.deadline),
          status: BatchRequestStatus.Active,
          targets: {
            create: data.targetUserIds.map((userId) => ({
              userId,
              status: TargetStatus.Outdated,
            })),
          },
        },
      });

      // Update CV Profiles of target users to Outdated
      await tx.cVProfile.updateMany({
        where: {
          userId: { in: data.targetUserIds },
        },
        data: {
          status: CVStatus.Outdated,
        },
      });

      return batchRequest;
    });
  }

  async getBatchRequests(params: { page?: number; limit?: number; status?: string; keyword?: string }) {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const where: Prisma.BatchRequestWhereInput = {
      ...(params.status && { status: params.status as BatchRequestStatus }),
      ...(params.keyword && { title: { contains: params.keyword, mode: 'insensitive' } }),
    };

    const [total, data] = await Promise.all([
      prisma.batchRequest.count({ where }),
      prisma.batchRequest.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          creator: { select: { id: true, fullName: true, email: true } },
          _count: { select: { targets: true } },
        },
      }),
    ]);

    const dataWithCounts = await Promise.all(data.map(async (batch) => {
      const completedCount = await prisma.batchRequestTarget.count({
        where: { batchRequestId: batch.id, status: 'Updated' }
      });
      return {
        ...batch,
        targetCount: batch._count.targets,
        completedCount
      };
    }));

    return { total, page, limit, data: dataWithCounts };
  }

  async getBatchRequestTargets(batchId: string, params: { status?: string }) {
    const batch = await prisma.batchRequest.findUnique({ where: { id: batchId } });
    if (!batch) {
      throw new NotFoundError(MESSAGES.BATCH_REQUEST.NOT_FOUND);
    }

    const where: Prisma.BatchRequestTargetWhereInput = {
      batchRequestId: batchId,
      ...(params.status && { status: params.status as TargetStatus }),
    };

    const targets = await prisma.batchRequestTarget.findMany({
      where,
      include: {
        user: { select: { id: true, fullName: true, email: true, department: { select: { name: true } } } },
      },
      orderBy: { user: { fullName: 'asc' } },
    });

    return targets;
  }

  async cancelBatchRequest(batchId: string, hrUserId: string) {
    const batch = await prisma.batchRequest.findUnique({
      where: { id: batchId },
      include: { targets: true },
    });

    if (!batch) {
      throw new NotFoundError(MESSAGES.BATCH_REQUEST.NOT_FOUND);
    }

    await prisma.$transaction(async (tx) => {
      await tx.batchRequest.update({
        where: { id: batchId },
        data: { status: BatchRequestStatus.Cancelled },
      });

      // Lấy danh sách user bị ảnh hưởng
      const targetUserIds = batch.targets.map(t => t.userId);

      // Xóa các target
      await tx.batchRequestTarget.deleteMany({
        where: { batchRequestId: batchId },
      });

      // Rollback CV status to Draft if they are currently Outdated
      if (targetUserIds.length > 0) {
        await tx.cVProfile.updateMany({
          where: {
            userId: { in: targetUserIds },
            status: CVStatus.Outdated,
          },
          data: { status: CVStatus.Draft },
        });
      }
    });

    return { message: MESSAGES.BATCH_REQUEST.CANCEL_SUCCESS };
  }

  async remindTarget(batchId: string, targetUserId: string, hrUserId: string) {
    const target = await prisma.batchRequestTarget.findUnique({
      where: {
        batchRequestId_userId: {
          batchRequestId: batchId,
          userId: targetUserId,
        },
      },
      include: { user: true, batchRequest: true },
    });

    if (!target) {
      throw new NotFoundError('Target not found');
    }

    if (target.status !== TargetStatus.Outdated) {
      throw new BadRequestError('Target is not outdated');
    }

    // Call emailQueue
    // To avoid circular dependency or import issues, we can just import it here
    const { emailQueue } = require('../notification/notification.queue');
    const { getRemindCVTemplate } = require('../notification/mailer');

    await emailQueue.add('send-reminder', {
      to: target.user.email,
      subject: `Reminder: Please update your CV for ${target.batchRequest.title}`,
      body: getRemindCVTemplate(target.batchRequest.title, target.batchRequest.deadline.toString()),
    });

    // Update notifiedAt
    await prisma.batchRequestTarget.update({
      where: {
        batchRequestId_userId: {
          batchRequestId: batchId,
          userId: targetUserId,
        },
      },
      data: { notifiedAt: new Date() },
    });

    return { message: 'Reminder email sent successfully' };
  }
}
