import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  getDocuments,
  getDocument,
  uploadDocument,
  updateDocument,
  deleteDocument
} from '../controllers/document.controller';
import { documentUpload } from '../config/documentUpload';

const router = Router();
router.use(authenticate);

router.get('/', getDocuments);
router.get('/:id', getDocument);
router.post('/', documentUpload.single('file'), uploadDocument);
router.put('/:id', updateDocument);
router.delete('/:id', authorize('SOCIO', 'ADVOGADO'), deleteDocument);

export default router;
