import { Router } from 'express';
import { CVController } from './cv.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { upsertDraftSchema } from './cv.dto';

const router = Router();
const cvController = new CVController();

// Use authentication for all CV routes
router.use(authenticate);

// GET /api/cvs/draft
router.get('/draft', authorize(['Employee']), cvController.getDraft);

// PUT /api/cvs/draft
router.put('/draft', authorize(['Employee']), validate(upsertDraftSchema), cvController.upsertDraft);

// Search and diff will be implemented in Search module but mounted here or separately.
// For now, we leave them as mocks if needed, or remove them and let search module handle it.

export default router;
