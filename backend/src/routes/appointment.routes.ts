import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getAppointmentIcs,
} from '../controllers/appointment.controller';

const router = Router();
router.use(authenticate);

router.get('/', getAppointments);
router.get('/:id', getAppointment);
router.get('/:id/ics', getAppointmentIcs);
router.post('/', createAppointment);
router.put('/:id', updateAppointment);
router.delete('/:id', deleteAppointment);

export default router;
