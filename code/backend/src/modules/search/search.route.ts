import { Router } from 'express';
import { SearchController } from './search.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { searchSchema } from './search.dto';

const router = Router();
const searchController = new SearchController();

router.use(authenticate);

// GET /api/cvs/search
router.get('/search', authorize(['TechLead', 'HR', 'Admin']), validate(searchSchema), searchController.search);

// GET /api/cvs/:id/diff
router.get('/:id/diff', searchController.diff);

export default router;
