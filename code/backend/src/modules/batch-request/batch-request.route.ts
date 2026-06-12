import { Router } from 'express';
import { BatchRequestController } from './batch-request.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createBatchRequestSchema, cancelBatchRequestSchema, getBatchRequestsSchema, getBatchRequestTargetsSchema, remindTargetSchema } from './batch-request.dto';

const router = Router();
const batchRequestController = new BatchRequestController();

/**
 * @openapi
 * tags:
 *   name: Batch Request
 *   description: Batch operations for HR
 */

router.use(authenticate);

// HR and Admin Only
router.use(authorize(['HR', 'Admin']));

/**
 * @openapi
 * /api/batch-requests:
 *   post:
 *     summary: Create a batch request
 *     tags: [Batch Request]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - targetUserIds
 *               - deadline
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               targetUserIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *               deadline:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       201:
 *         description: Batch request created
 *       400:
 *         description: Invalid input or missing targets
 *       403:
 *         description: Forbidden (Not HR)
 */
router.post('/', validate(createBatchRequestSchema), batchRequestController.create);

/**
 * @openapi
 * /api/batch-requests:
 *   get:
 *     summary: List batch requests
 *     tags: [Batch Request]
 *     responses:
 *       200:
 *         description: List of batch requests
 */
router.get('/', validate(getBatchRequestsSchema), batchRequestController.getAll);

/**
 * @openapi
 * /api/batch-requests/{id}/targets:
 *   get:
 *     summary: List targets of a batch request
 *     tags: [Batch Request]
 *     responses:
 *       200:
 *         description: List of targets
 */
router.get('/:id/targets', validate(getBatchRequestTargetsSchema), batchRequestController.getTargets);

/**
 * @openapi
 * /api/batch-requests/{id}/cancel:
 *   post:
 *     summary: Cancel a batch request
 *     tags: [Batch Request]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Batch request cancelled successfully
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Batch request not found
 */
router.post('/:id/cancel', validate(cancelBatchRequestSchema), batchRequestController.cancel);

/**
 * @openapi
 * /api/batch-requests/{id}/targets/{userId}/remind:
 *   post:
 *     summary: Send a reminder email to a specific target
 *     tags: [Batch Request]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Reminder email sent successfully
 *       400:
 *         description: Target is not outdated
 *       404:
 *         description: Target not found
 */
router.post('/:id/targets/:userId/remind', validate(remindTargetSchema), batchRequestController.remind);

export default router;
