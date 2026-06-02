import { Router } from 'express';

const router = Router();

// GET /api/cvs/draft
router.get('/draft', (req, res) => {
  res.json({ message: 'Get draft mock' });
});

// PUT /api/cvs/draft
router.put('/draft', (req, res) => {
  res.json({ message: 'Upsert draft mock' });
});

// GET /api/cvs/search
router.get('/search', (req, res) => {
  res.json({ message: 'Search CVs mock' });
});

// GET /api/cvs/:id/diff
router.get('/:id/diff', (req, res) => {
  res.json({ message: 'Diff CV mock' });
});

export default router;
