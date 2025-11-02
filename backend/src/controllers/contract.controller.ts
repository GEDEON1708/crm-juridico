import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';

export const getContracts = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json({ status: 'success', data: [] });
  } catch (error) {
    next(error);
  }
};

export const getContract = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json({ status: 'success', data: null });
  } catch (error) {
    next(error);
  }
};

export const createContract = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.status(201).json({ status: 'success', data: null });
  } catch (error) {
    next(error);
  }
};

export const updateContract = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json({ status: 'success', data: null });
  } catch (error) {
    next(error);
  }
};

export const deleteContract = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    res.json({ status: 'success', message: 'Contrato excluído' });
  } catch (error) {
    next(error);
  }
};
