import { Router } from 'express';
import { BatchRequestController } from './batch-request.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { createBatchRequestSchema } from './batch-request.dto';

const router = Router();
const batchRequestController = new BatchRequestController();

router.use(authenticate);

// HR Only
router.use(authorize(['HR']));

// POST /api/batch-requests
router.post('/', validate(createBatchRequestSchema), batchRequestController.create);

// POST /api/batch-requests/:id/cancel
router.post('/:id/cancel', batchRequestController.cancel);

export default router;
