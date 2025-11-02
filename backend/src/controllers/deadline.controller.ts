import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { createAuditLog } from '../utils/audit';

// Get all deadlines
export const getDeadlines = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { caseId, priority, page = '1', limit = '10' } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = {};
    if (caseId) where.caseId = caseId;
    if (priority) where.priority = priority;

    const [deadlines, total] = await Promise.all([
      prisma.deadline.findMany({
        where,
        include: {
          case: {
            select: {
              id: true,
              caseNumber: true,
              title: true,
            },
          },
        },
        orderBy: { dueDate: 'asc' },
        skip,
        take: parseInt(limit as string),
      }),
      prisma.deadline.count({ where }),
    ]);

    res.json({
      status: 'success',
      data: {
        deadlines,
        pagination: {
          total,
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          pages: Math.ceil(total / parseInt(limit as string)),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get deadline by ID
export const getDeadline = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const deadline = await prisma.deadline.findUnique({
      where: { id },
      include: {
        case: true,
      },
    });

    if (!deadline) {
      throw new AppError('Prazo não encontrado', 404);
    }

    res.json({ status: 'success', data: deadline });
  } catch (error) {
    next(error);
  }
};

// Create deadline
export const createDeadline = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { title, description, dueDate, priority, caseId } = req.body;

    const deadline = await prisma.deadline.create({
      data: {
        title,
        description,
        dueDate: new Date(dueDate),
        priority,
        caseId,
      },
      include: {
        case: true,
      },
    });

    await createAuditLog(
      'CREATE',
      'Deadline',
      deadline.id,
      req.user!.id,
      req.ip,
      req.get('user-agent'),
      `Prazo ${title} criado`
    );

    res.status(201).json({ status: 'success', data: deadline });
  } catch (error) {
    next(error);
  }
};

// Update deadline
export const updateDeadline = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { title, description, dueDate, priority, isCompleted } = req.body;

    const existingDeadline = await prisma.deadline.findUnique({ where: { id } });
    if (!existingDeadline) {
      throw new AppError('Prazo não encontrado', 404);
    }

    const deadline = await prisma.deadline.update({
      where: { id },
      data: {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        priority,
        isCompleted,
      },
      include: {
        case: true,
      },
    });

    await createAuditLog(
      'UPDATE',
      'Deadline',
      id,
      req.user!.id,
      req.ip,
      req.get('user-agent'),
      `Prazo ${title} atualizado`
    );

    res.json({ status: 'success', data: deadline });
  } catch (error) {
    next(error);
  }
};

// Delete deadline
export const deleteDeadline = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const deadline = await prisma.deadline.findUnique({ where: { id } });
    if (!deadline) {
      throw new AppError('Prazo não encontrado', 404);
    }

    await prisma.deadline.delete({ where: { id } });

    await createAuditLog(
      'DELETE',
      'Deadline',
      id,
      req.user!.id,
      req.ip,
      req.get('user-agent'),
      `Prazo ${deadline.title} excluído`
    );

    res.json({ status: 'success', message: 'Prazo excluído com sucesso' });
  } catch (error) {
    next(error);
  }
};
