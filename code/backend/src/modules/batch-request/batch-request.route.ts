import { Router } from 'express';

const router = Router();

// POST /api/batch-requests
router.post('/', (req, res) => {
  res.json({ message: 'Create batch request mock' });
});

// POST /api/batch-requests/:id/cancel
router.post('/:id/cancel', (req, res) => {
  res.json({ message: 'Cancel batch request mock' });
});

export default router;
