import { Router } from 'express';
import { AuditController } from './audit.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';

const router = Router();
const auditController = new AuditController();

/**
 * @openapi
 * tags:
 *   name: Audit Logs
 *   description: System audit logs operations
 */

router.use(authenticate);

/**
 * @openapi
 * /api/audit-logs:
 *   get:
 *     summary: Get all audit logs
 *     tags: [Audit Logs]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of audit logs
 */
router.get('/', authorize(['Admin']), auditController.getAuditLogs);

export default router;
