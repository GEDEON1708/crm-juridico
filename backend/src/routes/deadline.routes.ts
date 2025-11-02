import { Router } from 'express';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', (req, res) => res.json({ status: 'success', data: [] }));
router.get('/:id', (req, res) => res.json({ status: 'success', data: {} }));
router.post('/', (req, res) => res.status(201).json({ status: 'success', data: {} }));
router.put('/:id', (req, res) => res.json({ status: 'success', data: {} }));
router.delete('/:id', (req, res) => res.json({ status: 'success', message: 'Excluído' }));

export default router;
