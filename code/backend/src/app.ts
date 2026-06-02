import express, { Express, Request, Response } from 'express';
import 'express-async-errors';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { errorHandler } from './middleware/error.middleware';

const app: Express = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'UP', message: 'UmiCV API is running' });
});

import authRoutes from './modules/auth/auth.route';
import cvRoutes from './modules/cv/cv.route';
import workflowRoutes from './modules/workflow/workflow.route';
import batchRequestRoutes from './modules/batch-request/batch-request.route';

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cvs', cvRoutes); // CV and Workflow share the same base path logically, but we can mount workflow separately or together
app.use('/api/cvs', workflowRoutes); // As per API contract
app.use('/api/batch-requests', batchRequestRoutes);

// Error Handling
app.use(errorHandler);

export default app;
