import { Router } from 'express';

const router = Router();

// POST /api/cvs/draft/submit
router.post('/draft/submit', (req, res) => {
  res.json({ message: 'Submit draft mock' });
});

// POST /api/cvs/:id/approve
router.post('/:id/approve', (req, res) => {
  res.json({ message: 'Approve CV mock' });
});

// POST /api/cvs/:id/reject
router.post('/:id/reject', (req, res) => {
  res.json({ message: 'Reject CV mock' });
});

export default router;
