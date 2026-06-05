import { Queue, Worker, Job } from 'bullmq';
import { redisConfig } from '../../config/redis';

// Define the queue
export const emailQueue = new Queue('email-queue', {
  connection: redisConfig,
});

// Define the worker
export const emailWorker = new Worker(
  'email-queue',
  async (job: Job) => {
    const { to, subject, body } = job.data;
    
    // Placeholder for actual email sending logic (e.g. SMTP, SendGrid, etc.)
    console.log(`[EmailWorker] Sending email to: ${to} | Subject: ${subject}`);
    
    // Simulate async email sending
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    console.log(`[EmailWorker] Successfully sent email to: ${to}`);
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
