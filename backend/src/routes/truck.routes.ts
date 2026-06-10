import { Router } from 'express';
import { createTruck, getTrucks } from '../controllers/truck.controller';
import { protect, adminOnly } from '../middleware/auth.middleware';

const router = Router();

router.post('/', protect, adminOnly, createTruck);
router.get('/', protect, getTrucks);

export default router;
