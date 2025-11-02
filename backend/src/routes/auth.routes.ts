import { Router } from 'express';
import {
  register,
  login,
  refreshToken,
  logout,
  enable2FA,
  verify2FA,
  disable2FA,
  getCurrentUser
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refreshToken);
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, getCurrentUser);

// 2FA
router.post('/2fa/enable', authenticate, enable2FA);
router.post('/2fa/verify', authenticate, verify2FA);
router.post('/2fa/disable', authenticate, disable2FA);

export default router;
