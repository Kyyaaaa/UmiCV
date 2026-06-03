import cron from 'node-cron';
import prisma from '../../config/db';
import { emailQueue } from './notification.queue';
import { TargetStatus } from '@prisma/client';

// Schedule to run at 8:00 AM every day
export const setupCronjobs = () => {
  cron.schedule('0 8 * * *', async () => {
    console.log('[Cronjob] Running daily reminder for outdated CVs...');

    try {
      // Find all target users that haven't updated their CVs yet.
      // Notice we leverage the partial index logic on status='Outdated'
      const outdatedTargets = await prisma.batchRequestTarget.findMany({
        where: { status: TargetStatus.Outdated },
        include: { user: true, batchRequest: true },
      });

      console.log(`[Cronjob] Found ${outdatedTargets.length} outdated target(s). Queuing emails...`);

      // Queue email jobs
      for (const target of outdatedTargets) {
        await emailQueue.add('send-reminder', {
          to: target.user.username, // Using username as email or we should add email field to user. Assume username is email.
          subject: `Reminder: Please update your CV for ${target.batchRequest.title}`,
          body: `Deadline is approaching: ${target.batchRequest.deadline}`,
        });

        // Update notifiedAt
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
    } catch (error) {
      console.error('[Cronjob] Error during daily run:', error);
    }
  });

  console.log('Cronjobs are successfully registered.');
};
