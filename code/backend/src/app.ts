import express, { Express, Request, Response } from 'express';
import 'express-async-errors';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { errorHandler } from './middleware/error.middleware';

const app: Express = express();

// Middleware
app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'UP', message: 'UmiCV API is running' });
});

import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import { z } from 'zod';
import { customZodErrorMap } from './config/zod';

// Set global Zod error map
z.setErrorMap(customZodErrorMap);

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

import authRoutes from './modules/auth/auth.route';
import cvRoutes from './modules/cv/cv.route';
import workflowRoutes from './modules/workflow/workflow.route';
import batchRequestRoutes from './modules/batch-request/batch-request.route';
import userRoutes from './modules/user/user.route';
import departmentRoutes from './modules/department/department.route';
import projectRoutes from './modules/project/project.route';
import notificationRoutes from './modules/notification/notification.route';
import dashboardRoutes from './modules/dashboard/dashboard.route';
import auditRoutes from './modules/audit/audit.route';

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cvs', cvRoutes); 
app.use('/api/cvs', workflowRoutes); 
app.use('/api/batch-requests', batchRequestRoutes);
app.use('/api/users', userRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/audit-logs', auditRoutes);

// Error Handling
app.use(errorHandler);

export default app;
