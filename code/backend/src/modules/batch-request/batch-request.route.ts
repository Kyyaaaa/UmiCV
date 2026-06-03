import { Router } from 'express';
import { BatchRequestController } from './batch-request.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createBatchRequestSchema, cancelBatchRequestSchema } from './batch-request.dto';

const router = Router();
const batchRequestController = new BatchRequestController();

/**
 * @openapi
 * tags:
 *   name: Batch Request
 *   description: Batch operations for HR
 */

router.use(authenticate);

// HR Only
router.use(authorize(['HR']));

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

export default router;
