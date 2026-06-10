import { Router } from 'express';
import { login, seedAdmin } from '../controllers/auth.controller';

const router = Router();

router.post('/login', login);
router.post('/seed', seedAdmin); // Protected or remove in prod

export default router;
