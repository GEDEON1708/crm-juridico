import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getCases,
  getCase,
  createCase,
  updateCase,
  deleteCase
} from '../controllers/case.controller';

const router = Router();
router.use(authenticate);

router.get('/', getCases);
router.get('/:id', getCase);
router.post('/', createCase);
router.put('/:id', updateCase);
router.delete('/:id', deleteCase);

export default router;
