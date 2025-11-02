import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../middleware/errorHandler';

const prisma = new PrismaClient();

export const getFees = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { caseId, status, type, limit } = req.query;

    const where: any = {};
    if (caseId) where.caseId = caseId as string;
    if (status) where.status = status as string;
    if (type) where.type = type as string;

    const fees = await prisma.fee.findMany({
      where,
      take: limit ? parseInt(limit as string) : undefined,
      include: {
        case: {
          include: {
            client: true,
          },
        },
      },
      orderBy: { dueDate: 'asc' },
    });

    // Atualizar status automaticamente para ATRASADO se vencido
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (const fee of fees) {
      if (fee.status === 'PENDENTE' && fee.dueDate < today) {
        await prisma.fee.update({
          where: { id: fee.id },
          data: { status: 'ATRASADO' },
        });
        fee.status = 'ATRASADO' as any;
      }
    }

    res.json({ success: true, data: fees });
  } catch (error) {
    next(error);
  }
};

export const getFee = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const fee = await prisma.fee.findUnique({
      where: { id },
      include: {
        case: {
          include: {
            client: true,
          },
        },
      },
    });

    if (!fee) {
      throw new AppError('Honorário não encontrado', 404);
    }

    res.json({ success: true, data: fee });
  } catch (error) {
    next(error);
  }
};

export const createFee = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { description, amount, dueDate, type, caseId } = req.body;

    if (!description || !amount || !dueDate || !type || !caseId) {
      throw new AppError('Campos obrigatórios: description, amount, dueDate, type, caseId', 400);
    }

    const fee = await prisma.fee.create({
      data: {
        description,
        amount: parseFloat(amount),
        dueDate: new Date(dueDate),
        type,
        caseId,
      },
      include: {
        case: {
          include: {
            client: true,
          },
        },
      },
    });

    res.status(201).json({ success: true, data: fee });
  } catch (error) {
    next(error);
  }
};

export const updateFee = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { description, amount, dueDate, paidDate, status, type } = req.body;

    const fee = await prisma.fee.findUnique({ where: { id } });
    if (!fee) {
      throw new AppError('Honorário não encontrado', 404);
    }

    const updateData: any = {};
    if (description !== undefined) updateData.description = description;
    if (amount !== undefined) updateData.amount = parseFloat(amount);
    if (dueDate !== undefined) updateData.dueDate = new Date(dueDate);
    if (paidDate !== undefined) updateData.paidDate = paidDate ? new Date(paidDate) : null;
    if (status !== undefined) updateData.status = status;
    if (type !== undefined) updateData.type = type;

    const updatedFee = await prisma.fee.update({
      where: { id },
      data: updateData,
      include: {
        case: {
          include: {
            client: true,
          },
        },
      },
    });

    res.json({ success: true, data: updatedFee });
  } catch (error) {
    next(error);
  }
};

export const deleteFee = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const fee = await prisma.fee.findUnique({ where: { id } });
    if (!fee) {
      throw new AppError('Honorário não encontrado', 404);
    }

    await prisma.fee.delete({ where: { id } });

    res.json({ success: true, message: 'Honorário excluído com sucesso' });
  } catch (error) {
    next(error);
  }
};

export const getFeeStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const fees = await prisma.fee.findMany();

    const stats = {
      totalPendente: 0,
      totalPago: 0,
      totalAtrasado: 0,
      valorPendente: 0,
      valorPago: 0,
      valorAtrasado: 0,
    };

    fees.forEach((fee) => {
      if (fee.status === 'PAGO') {
        stats.totalPago++;
        stats.valorPago += fee.amount;
      } else if (fee.status === 'ATRASADO' || (fee.status === 'PENDENTE' && fee.dueDate < today)) {
        stats.totalAtrasado++;
        stats.valorAtrasado += fee.amount;
      } else if (fee.status === 'PENDENTE') {
        stats.totalPendente++;
        stats.valorPendente += fee.amount;
      }
    });

    res.json({ success: true, data: stats });
  } catch (error) {
    next(error);
  }
};
