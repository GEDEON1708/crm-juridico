import { Router } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/stats', (req, res) => {
  res.json({
    status: 'success',
    data: {
      totalCases: 0,
      activeCases: 0,
      pendingDeadlines: 0,
      upcomingHearings: 0
    }
  });
});

export default router;
