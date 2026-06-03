import { Router } from 'express';
import { WorkflowController } from './workflow.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { approveSchema, rejectSchema, submitDraftSchema } from './workflow.dto';

const router = Router();
const workflowController = new WorkflowController();

// Use authentication
router.use(authenticate);

// POST /api/cvs/draft/submit
router.post('/draft/submit', authorize(['Employee']), validate(submitDraftSchema), workflowController.submitDraft);

// POST /api/cvs/:id/approve
router.post('/:id/approve', authorize(['TechLead', 'HR']), validate(approveSchema), workflowController.approveCV);

// POST /api/cvs/:id/reject
router.post('/:id/reject', authorize(['TechLead', 'HR']), validate(rejectSchema), workflowController.rejectCV);

export default router;
