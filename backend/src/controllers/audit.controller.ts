import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';

export const getAuditLogs = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json({ status: 'success', data: [] });
  } catch (error) {
    next(error);
  }
};
