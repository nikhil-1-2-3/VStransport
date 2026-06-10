import { Router } from 'express';
import { getDashboardStats } from '../controllers/dashboard.controller';
import { protect, adminOnly } from '../middleware/auth.middleware';

const router = Router();

router.get('/stats', protect, adminOnly, getDashboardStats);

export default router;
