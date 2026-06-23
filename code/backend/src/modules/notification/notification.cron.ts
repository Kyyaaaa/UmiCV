import cron from 'node-cron';
import prisma from '../../config/db';
import { emailQueue } from './notification.queue';
import { TargetStatus } from '@prisma/client';

// Schedule to run at 8:00 AM every day
export const setupCronjobs = () => {
  cron.schedule('0 8 * * *', async () => {
    console.log('[Cronjob] Running daily reminder for outdated CVs...');

    try {
      let skip = 0;
      const take = 100;
      let hasMore = true;
      let count = 0;

      while (hasMore) {
        const outdatedTargets = await prisma.batchRequestTarget.findMany({
          where: { status: TargetStatus.Outdated },
          include: { user: true, batchRequest: true },
          skip,
          take,
        });

        if (outdatedTargets.length === 0) {
          hasMore = false;
          break;
        }

        for (const target of outdatedTargets) {
          await emailQueue.add('send-reminder', {
            to: target.user.username,
            subject: `Reminder: Please update your CV for ${target.batchRequest.title}`,
            body: `Deadline is approaching: ${target.batchRequest.deadline}`,
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
  }, { timezone: 'Asia/Ho_Chi_Minh' });

  console.log('Cronjobs are successfully registered.');
};
