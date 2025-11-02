import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  getClients,
  getClient,
  createClient,
  updateClient,
  deleteClient
} from '../controllers/client.controller';

const router = Router();

router.use(authenticate);

router.get('/', getClients);
router.get('/:id', getClient);
router.post('/', authorize('SOCIO', 'ADVOGADO', 'ADMINISTRATIVO'), createClient);
router.put('/:id', authorize('SOCIO', 'ADVOGADO', 'ADMINISTRATIVO'), updateClient);
router.delete('/:id', authorize('SOCIO', 'ADVOGADO'), deleteClient);

export default router;
