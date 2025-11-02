import { Router } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', (req, res) => res.json({ status: 'success', data: [] }));
router.post('/', (req, res) => res.status(201).json({ status: 'success', data: {} }));

export default router;
