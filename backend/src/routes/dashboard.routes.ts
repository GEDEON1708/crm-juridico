import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getStats,
  getCaseTypeDistribution,
  getMonthlyActivity,
} from '../controllers/dashboard.controller';

const router = Router();
router.use(authenticate);

router.get('/stats', getStats);
router.get('/case-type-distribution', getCaseTypeDistribution);
router.get('/monthly-activity', getMonthlyActivity);

export default router;
