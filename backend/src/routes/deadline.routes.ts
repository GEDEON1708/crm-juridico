import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getDeadlines,
  getDeadline,
  createDeadline,
  updateDeadline,
  deleteDeadline,
} from '../controllers/deadline.controller';

const router = Router();
router.use(authenticate);

router.get('/', getDeadlines);
router.get('/:id', getDeadline);
router.post('/', createDeadline);
router.put('/:id', updateDeadline);
router.delete('/:id', deleteDeadline);

export default router;
