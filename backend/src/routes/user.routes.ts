import { Router } from 'express';
import { createUser, getDrivers, updateProfile, requestPasswordChange, getPasswordRequests, approvePasswordRequest } from '../controllers/user.controller';
import { protect, adminOnly } from '../middleware/auth.middleware';

const router = Router();

// Only Admins can create new users/drivers
router.post('/', protect, adminOnly, createUser);

// Get list of drivers
router.get('/drivers', protect, getDrivers);

// Driver Account Settings
router.put('/:id/profile', protect, updateProfile);
router.post('/:id/request-password-change', protect, requestPasswordChange);

// Admin Password Approvals
router.get('/password-requests', protect, adminOnly, getPasswordRequests);
router.put('/password-requests/:id/approve', protect, adminOnly, approvePasswordRequest);

export default router;
