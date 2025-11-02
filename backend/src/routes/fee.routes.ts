import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  getFees,
  getFee,
  createFee,
  updateFee,
  deleteFee,
  getFeeStats,
} from '../controllers/fee.controller';

const router = Router();
router.use(authenticate);

router.get('/stats', getFeeStats);
router.get('/', getFees);
router.get('/:id', getFee);
router.post('/', authorize('SOCIO', 'ADVOGADO'), createFee);
router.put('/:id', authorize('SOCIO', 'ADVOGADO'), updateFee);
router.delete('/:id', authorize('SOCIO', 'ADVOGADO'), deleteFee);

export default router;
