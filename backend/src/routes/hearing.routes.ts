import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getHearings,
  getHearing,
  createHearing,
  updateHearing,
  deleteHearing,
} from '../controllers/hearing.controller';

const router = Router();
router.use(authenticate);

router.get('/', getHearings);
router.get('/:id', getHearing);
router.post('/', createHearing);
router.put('/:id', updateHearing);
router.delete('/:id', deleteHearing);

export default router;
