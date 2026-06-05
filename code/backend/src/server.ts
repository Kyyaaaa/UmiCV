import app from './app';
import { env } from './config/env';
import prisma from './config/db';
import { setupCronjobs } from './modules/notification/notification.cron';

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log('📦 Connected to PostgreSQL Database');
    
    // Initialize cron jobs
    setupCronjobs();

    app.listen(env.PORT, () => {
      console.log(`🚀 Server is running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
