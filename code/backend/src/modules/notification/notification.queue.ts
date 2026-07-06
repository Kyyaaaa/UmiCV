import { Queue, Worker, Job } from 'bullmq';
import { redisConfig } from '../../config/redis';

import { sendEmail } from './mailer';

// Define the queue
export const emailQueue = new Queue('email-queue', {
  connection: redisConfig,
});

// Define the worker
export const emailWorker = new Worker(
  'email-queue',
  async (job: Job) => {
    const { to, subject, body } = job.data;
    
    console.log(`[EmailWorker] Processing job ${job.id} to send email to: ${to}`);
    
    // Actual email sending logic using mailer.ts
    await sendEmail(to, subject, body);
  },
  {
    connection: redisConfig,
  }
);

emailWorker.on('completed', (job) => {
  console.log(`Job ${job.id} has completed!`);
});

emailWorker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} has failed with ${err.message}`);
});
