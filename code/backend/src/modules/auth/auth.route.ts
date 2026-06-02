import { Router } from 'express';

const router = Router();

// POST /api/auth/login
router.post('/login', (req, res) => {
  res.json({ message: 'Login mock' });
});

// POST /api/auth/refresh
router.post('/refresh', (req, res) => {
  res.json({ message: 'Refresh mock' });
});

export default router;
