import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';

export const getAppointments = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json({ status: 'success', data: [] });
  } catch (error) {
    next(error);
  }
};

export const getAppointment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json({ status: 'success', data: null });
  } catch (error) {
    next(error);
  }
};

export const createAppointment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.status(201).json({ status: 'success', data: null });
  } catch (error) {
    next(error);
  }
};

export const updateAppointment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json({ status: 'success', data: null });
  } catch (error) {
    next(error);
  }
};

export const deleteAppointment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json({ status: 'success', message: 'Compromisso excluído' });
  } catch (error) {
    next(error);
  }
};
