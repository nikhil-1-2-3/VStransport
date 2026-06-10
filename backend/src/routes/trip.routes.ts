import { Router } from 'express';
import { createTrip, getTrips, updateTripStatus, getDriverTrips, getAllDriverTrips } from '../controllers/trip.controller';
import { protect, adminOnly } from '../middleware/auth.middleware';

const router = Router();

router.post('/', protect, adminOnly, createTrip);
router.get('/', protect, adminOnly, getTrips);
router.get('/driver/:driverId', protect, getDriverTrips);
router.get('/driver/:driverId/all', protect, getAllDriverTrips);
router.put('/:id/status', protect, updateTripStatus);

export default router;
