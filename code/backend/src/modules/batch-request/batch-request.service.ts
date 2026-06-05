import prisma from '../../config/db';
import { CreateBatchRequestInput } from './batch-request.dto';
import { NotFoundError } from '../../errors/AppError';
import { BatchRequestStatus, CVStatus, TargetStatus } from '@prisma/client';

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

  async cancelBatchRequest(batchId: string, hrUserId: string) {
    const batch = await prisma.batchRequest.findUnique({
      where: { id: batchId },
      include: { targets: true },
    });

    if (!batch) {
      throw new NotFoundError('Batch Request not found');
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

    return { message: 'Batch request cancelled successfully' };
  }
}
