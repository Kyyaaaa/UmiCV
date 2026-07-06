import prisma from '../../config/db';
import { CreateBatchRequestInput, UpdateBatchRequestInput } from './batch-request.dto';
import { NotFoundError, BadRequestError } from '../../errors/AppError';
import { BatchRequestStatus, CVStatus, TargetStatus, Prisma } from '@prisma/client';
import { MESSAGES } from '../../constants/messages';
import { emailQueue } from '../notification/notification.queue';
import { getRemindCVTemplate } from '../notification/mailer';

import { AuditService } from '../audit/audit.service';

const auditService = new AuditService();

export class BatchRequestService {
  async createBatchRequest(hrUserId: string, data: CreateBatchRequestInput) {
    const result = await prisma.$transaction(async (tx) => {
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

    // Async Tasks
    (async () => {
      try {
        const users = await prisma.user.findMany({
          where: { id: { in: data.targetUserIds } },
          select: { id: true, email: true }
        });

        // Create personal notifications
        await prisma.notification.createMany({
          data: users.map((u) => ({
            userId: u.id,
            title: 'Yêu cầu cập nhật CV mới',
            message: `Bạn đã được thêm vào chiến dịch cập nhật CV: "${data.title}". Vui lòng cập nhật CV và gửi đi trước hạn chót.`,
            type: 'warning',
            link: '/cv',
            isGlobal: false,
          })),
        });

        // Add emails to queue
        const emailJobs = users.map(u => ({
          name: 'send-reminder',
          data: {
            to: u.email,
            subject: `Yêu cầu cập nhật CV cho chiến dịch: ${data.title}`,
            body: `Bạn đã được yêu cầu cập nhật CV cho chiến dịch: "${data.title}". Hạn chót: ${data.deadline}`,
          }
        }));
        await emailQueue.addBulk(emailJobs);
      } catch (err) {
        console.error('[BatchRequestService] Async notification failed:', err);
      }
    })();

    auditService.logAction('CREATE_BATCH_REQUEST', hrUserId, result.id);
    return result;
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

  async getBatchRequestTargets(batchId: string, params: { status?: string, page?: number, limit?: number }) {
    const batch = await prisma.batchRequest.findUnique({ where: { id: batchId } });
    if (!batch) {
      throw new NotFoundError(MESSAGES.BATCH_REQUEST.NOT_FOUND);
    }

    const where: Prisma.BatchRequestTargetWhereInput = {
      batchRequestId: batchId,
      ...(params.status && { status: params.status as TargetStatus }),
    };

    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const [total, targets] = await Promise.all([
      prisma.batchRequestTarget.count({ where }),
      prisma.batchRequestTarget.findMany({
        where,
        include: {
          user: { select: { id: true, fullName: true, email: true, department: { select: { name: true } } } },
        },
        orderBy: { user: { fullName: 'asc' } },
        skip,
        take: limit,
      })
    ]);

    return { total, page, limit, data: targets };
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

    auditService.logAction('CANCEL_BATCH_REQUEST', hrUserId, batchId);

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
      throw new NotFoundError(MESSAGES.BATCH_REQUEST.TARGET_NOT_FOUND);
    }

    if (target.status !== TargetStatus.Outdated) {
      throw new BadRequestError(MESSAGES.BATCH_REQUEST.TARGET_NOT_OUTDATED);
    }

    // Call emailQueue

    await emailQueue.add('send-reminder', {
      to: target.user.email,
      subject: `Nhắc nhở: Vui lòng cập nhật CV cho chiến dịch ${target.batchRequest.title}`,
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

    auditService.logAction('REMIND_TARGET', hrUserId, batchId);

    return { message: MESSAGES.BATCH_REQUEST.REMINDER_SUCCESS };
  }

  async updateBatchRequest(batchId: string, hrUserId: string, data: UpdateBatchRequestInput) {
    const batch = await prisma.batchRequest.findUnique({
      where: { id: batchId },
      include: { targets: true },
    });

    if (!batch) {
      throw new NotFoundError(MESSAGES.BATCH_REQUEST.NOT_FOUND);
    }

    if (batch.status === BatchRequestStatus.Completed || batch.status === BatchRequestStatus.Cancelled) {
      throw new BadRequestError('Cannot update a completed or cancelled batch request');
    }

    let usersToAdd: string[] = [];
    let usersToRemove: string[] = [];

    if (data.targetUserIds) {
      const currentTargetUserIds = batch.targets.map((t) => t.userId);
      usersToAdd = data.targetUserIds.filter((id) => !currentTargetUserIds.includes(id));
      usersToRemove = currentTargetUserIds.filter((id) => !data.targetUserIds!.includes(id));
    }

    const result = await prisma.$transaction(async (tx) => {
      // Update basic info
      const updateData: any = {};
      if (data.title) updateData.title = data.title;
      if (data.description !== undefined) updateData.description = data.description;
      if (data.deadline) updateData.deadline = new Date(data.deadline);

      await tx.batchRequest.update({
        where: { id: batchId },
        data: updateData,
      });

      // Update targets if provided
      if (data.targetUserIds) {
        if (usersToRemove.length > 0) {
          // Xóa khỏi target
          await tx.batchRequestTarget.deleteMany({
            where: {
              batchRequestId: batchId,
              userId: { in: usersToRemove },
            },
          });

          // Rollback CV
          await tx.cVProfile.updateMany({
            where: {
              userId: { in: usersToRemove },
              status: CVStatus.Outdated,
            },
            data: { status: CVStatus.Draft },
          });
        }

        if (usersToAdd.length > 0) {
          // Thêm mới
          await tx.batchRequestTarget.createMany({
            data: usersToAdd.map((userId) => ({
              batchRequestId: batchId,
              userId,
              status: TargetStatus.Outdated,
            })),
          });

          // Set CV
          await tx.cVProfile.updateMany({
            where: { userId: { in: usersToAdd } },
            data: { status: CVStatus.Outdated },
          });
        }
      }

      return tx.batchRequest.findUnique({ where: { id: batchId } });
    });

    // Async tasks
    if (usersToAdd.length > 0) {
      (async () => {
        try {
          const users = await prisma.user.findMany({
            where: { id: { in: usersToAdd } },
            select: { id: true, email: true }
          });

          const title = data.title || batch.title;
          const deadline = data.deadline || batch.deadline;

          await prisma.notification.createMany({
            data: users.map((u) => ({
              userId: u.id,
              title: 'Yêu cầu cập nhật CV mới',
              message: `Bạn đã được thêm vào chiến dịch cập nhật CV: "${title}". Vui lòng cập nhật CV và gửi đi trước hạn chót.`,
              type: 'warning',
              link: '/cv',
              isGlobal: false,
            })),
          });

          const emailJobs = users.map(u => ({
            name: 'send-reminder',
            data: {
              to: u.email,
              subject: `Yêu cầu cập nhật CV cho chiến dịch: ${title}`,
              body: `Bạn đã được yêu cầu cập nhật CV cho chiến dịch: "${title}". Hạn chót: ${deadline}`,
            }
          }));
          await emailQueue.addBulk(emailJobs);
        } catch (err) {
          console.error('[BatchRequestService] Async notification failed:', err);
        }
      })();
    }

    return result;
  }

  async deleteBatchRequest(batchId: string, hrUserId: string) {
    const batch = await prisma.batchRequest.findUnique({
      where: { id: batchId },
      include: { targets: true },
    });

    if (!batch) {
      throw new NotFoundError(MESSAGES.BATCH_REQUEST.NOT_FOUND);
    }

    await prisma.$transaction(async (tx) => {
      // If active, rollback targets
      if (batch.status === BatchRequestStatus.Active) {
        const targetUserIds = batch.targets.map((t) => t.userId);
        if (targetUserIds.length > 0) {
          await tx.cVProfile.updateMany({
            where: {
              userId: { in: targetUserIds },
              status: CVStatus.Outdated,
            },
            data: { status: CVStatus.Draft },
          });
        }
      }

      // Delete the batch request (Cascade deletes targets)
      await tx.batchRequest.delete({
        where: { id: batchId },
      });
    });

    auditService.logAction('DELETE_BATCH_REQUEST', hrUserId, batchId);

    return { message: 'Batch request deleted successfully' };
  }
}
