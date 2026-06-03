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

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

import authRoutes from './modules/auth/auth.route';
import cvRoutes from './modules/cv/cv.route';
import workflowRoutes from './modules/workflow/workflow.route';
import batchRequestRoutes from './modules/batch-request/batch-request.route';

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/cvs', cvRoutes); 
app.use('/api/cvs', workflowRoutes); 
app.use('/api/batch-requests', batchRequestRoutes);

// Error Handling
app.use(errorHandler);

export default app;
