import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();
router.use(authenticate);
router.use(authorize('SOCIO', 'ADVOGADO'));

router.get('/', (req, res) => res.json({ status: 'success', data: [] }));

export default router;
