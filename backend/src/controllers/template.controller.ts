import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';

export const getTemplates = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json({ status: 'success', data: [] });
  } catch (error) {
    next(error);
  }
};

export const getTemplate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json({ status: 'success', data: null });
  } catch (error) {
    next(error);
  }
};

export const createTemplate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.status(201).json({ status: 'success', data: null });
  } catch (error) {
    next(error);
  }
};

export const updateTemplate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json({ status: 'success', data: null });
  } catch (error) {
    next(error);
  }
};

export const deleteTemplate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json({ status: 'success', message: 'Template excluído' });
  } catch (error) {
    next(error);
  }
};
