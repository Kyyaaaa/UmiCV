import { Router } from 'express';
import { CVController } from './cv.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { getDraftSchema, upsertDraftSchema, searchSchema } from './cv.dto';

const router = Router();
const cvController = new CVController();

// Use authentication for all CV routes
router.use(authenticate);

// GET /api/cvs/draft
router.get('/draft', authorize(['Employee']), validate(getDraftSchema), cvController.getDraft);

// PUT /api/cvs/draft
router.put('/draft', authorize(['Employee']), validate(upsertDraftSchema), cvController.upsertDraft);

// GET /api/cvs/search
router.get('/search', authorize(['TechLead', 'HR', 'Admin']), validate(searchSchema), cvController.search);

// GET /api/cvs/:id/diff
router.get('/:id/diff', cvController.diff);

export default router;
