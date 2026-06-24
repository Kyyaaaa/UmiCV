import cron from 'node-cron';
import prisma from '../../config/db';
import { emailQueue } from './notification.queue';
import { TargetStatus, BatchRequestStatus } from '@prisma/client';
import { getRemindCVTemplate } from './mailer';

export const processOutdatedTargets = async () => {
  console.log('[Cronjob] Running daily reminder for outdated CVs...');
  try {
    let skip = 0;
    const take = 100;
    let hasMore = true;
    let count = 0;

    const now = new Date();
    const next48Hours = new Date(now.getTime() + 48 * 60 * 60 * 1000);

    while (hasMore) {
      const outdatedTargets = await prisma.batchRequestTarget.findMany({
        where: {
          status: TargetStatus.Outdated,
          batchRequest: {
            status: BatchRequestStatus.Active,
            deadline: {
              lte: next48Hours
            }
          }
        },
        include: { user: true, batchRequest: true },
        skip,
        take,
      });

      if (outdatedTargets.length === 0) {
        hasMore = false;
        break;
      }

      for (const target of outdatedTargets) {
        const title = target.batchRequest.title;
        const deadlineStr = target.batchRequest.deadline.toLocaleDateString('vi-VN');

        // Send Email
        await emailQueue.add('send-reminder', {
          to: target.user.email,
          subject: `Nhắc nhở: Vui lòng cập nhật CV cho chiến dịch ${title}`,
          body: getRemindCVTemplate(title, deadlineStr),
        });

        // Send In-App Notification
        await prisma.notification.create({
          data: {
            userId: target.userId,
            title: 'Sắp hết hạn cập nhật CV',
            message: `Chiến dịch "${title}" sắp hết hạn vào ${deadlineStr}. Vui lòng cập nhật CV ngay!`,
            isGlobal: false,
          }
        });

        await prisma.batchRequestTarget.update({
          where: {
            batchRequestId_userId: {
              batchRequestId: target.batchRequestId,
              userId: target.userId,
            },
          },
          data: { notifiedAt: new Date() },
        });
      }

      count += outdatedTargets.length;
      skip += take;
    }

    console.log(`[Cronjob] Processed ${count} outdated target(s).`);
  } catch (error) {
    console.error('[Cronjob] Error during daily run:', error);
  }
};

// Schedule to run at 8:00 AM every day
export const setupCronjobs = () => {
  cron.schedule('0 8 * * *', processOutdatedTargets, { timezone: 'Asia/Ho_Chi_Minh' });
  console.log('Cronjobs are successfully registered.');
};
