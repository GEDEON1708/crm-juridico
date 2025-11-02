import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

export const getCases = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page = '1', limit = '10', status, type } = req.query;
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    if (status) where.status = status;
    if (type) where.type = type;

    const [cases, total] = await Promise.all([
      prisma.case.findMany({ where, skip, take: limitNum, orderBy: { createdAt: 'desc' }, include: { client: true, responsible: { select: { id: true, name: true } } } }),
      prisma.case.count({ where })
    ]);

    res.json({ status: 'success', data: { cases, pagination: { page: pageNum, limit: limitNum, total, totalPages: Math.ceil(total / limitNum) } } });
  } catch (error) {
    next(error);
  }
};

export const getCase = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const caseData = await prisma.case.findUnique({ where: { id: req.params.id }, include: { client: true, responsible: true, parties: true, deadlines: true, hearings: true, documents: true, notes: { include: { author: { select: { id: true, name: true } } } }, fees: true } });
    if (!caseData) throw new AppError('Processo não encontrado', 404);
    res.json({ status: 'success', data: { case: caseData } });
  } catch (error) {
    next(error);
  }
};

export const createCase = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const caseData = await prisma.case.create({ data: { ...req.body, responsibleId: req.body.responsibleId || req.user!.id } });
    res.status(201).json({ status: 'success', message: 'Processo criado com sucesso', data: { case: caseData } });
  } catch (error) {
    next(error);
  }
};

export const updateCase = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const caseData = await prisma.case.update({ where: { id: req.params.id }, data: req.body });
    res.json({ status: 'success', message: 'Processo atualizado com sucesso', data: { case: caseData } });
  } catch (error) {
    next(error);
  }
};

export const deleteCase = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    await prisma.case.delete({ where: { id: req.params.id } });
    res.json({ status: 'success', message: 'Processo excluído com sucesso' });
  } catch (error) {
    next(error);
  }
};
