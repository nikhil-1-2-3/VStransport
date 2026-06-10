import { Router } from 'express';
import { createCompany, getCompanies } from '../controllers/company.controller';
import { protect, adminOnly } from '../middleware/auth.middleware';

const router = Router();

router.post('/', protect, adminOnly, createCompany);
router.get('/', protect, getCompanies);

export default router;
