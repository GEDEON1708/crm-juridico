import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { getUsers, getUser, updateUser, deleteUser, uploadProfileImage } from '../controllers/user.controller';
import { profileUpload } from '../config/multer';

const router = Router();
router.use(authenticate);

router.get('/', getUsers);
router.get('/:id', getUser);
router.put('/:id', updateUser);
router.post('/:id/profile-image', profileUpload.single('profileImage'), uploadProfileImage);
router.delete('/:id', authorize('SOCIO'), deleteUser);

export default router;
