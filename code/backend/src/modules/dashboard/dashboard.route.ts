import { Router } from 'express';
import { DashboardController } from './dashboard.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();
const dashboardController = new DashboardController();

/**
 * @openapi
 * tags:
 *   name: Dashboard
 *   description: Dashboard Analytics API
 */

router.use(authenticate);

/**
 * @openapi
 * /api/dashboard/stats:
 *   get:
 *     summary: Get CV statistics for dashboard
 *     tags: [Dashboard]
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     pending:
 *                       type: integer
 *                     updated:
 *                       type: integer
 *                     outdated:
 *                       type: integer
 */
router.get('/stats', dashboardController.getStats);

/**
 * @openapi
 * /api/dashboard/recent-cvs:
 *   get:
 *     summary: Get recent CVs for dashboard
 *     tags: [Dashboard]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Number of recent CVs to retrieve (default 5)
 *     responses:
 *       200:
 *         description: List of recent CVs
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       userId:
 *                         type: string
 *                       userFullName:
 *                         type: string
 *                       languageCode:
 *                         type: string
 *                       status:
 *                         type: string
 *                       versionNumber:
 *                         type: integer
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 */
router.get('/recent-cvs', dashboardController.getRecentCVs);

export default router;
