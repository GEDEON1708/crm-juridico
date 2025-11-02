import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { createAuditLog } from '../utils/audit';

export const getClients = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { page = '1', limit = '10', search = '', isActive } = req.query;
    
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const skip = (pageNum - 1) * limitNum;

    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
        { cpfCnpj: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    if (isActive !== undefined) {
      where.isActive = isActive === 'true';
    }

    const [clients, total] = await Promise.all([
      prisma.client.findMany({
        where,
        skip,
        take: limitNum,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { cases: true, contracts: true }
          }
        }
      }),
      prisma.client.count({ where })
    ]);

    res.json({
      status: 'success',
      data: {
        clients,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getClient = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        cases: {
          include: {
            responsible: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        contracts: true
      }
    });

    if (!client) {
      throw new AppError('Cliente não encontrado', 404);
    }

    res.json({
      status: 'success',
      data: { client }
    });
  } catch (error) {
    next(error);
  }
};

export const createClient = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, email, phone, cpfCnpj, type, address, city, state, zipCode, notes } = req.body;

    // Verificar se CPF/CNPJ já existe
    const existing = await prisma.client.findUnique({ where: { cpfCnpj } });
    if (existing) {
      throw new AppError('CPF/CNPJ já cadastrado', 400);
    }

    const client = await prisma.client.create({
      data: {
        name,
        email,
        phone,
        cpfCnpj,
        type,
        address,
        city,
        state,
        zipCode,
        notes
      }
    });

    await createAuditLog('CREATE', 'Client', client.id, req.user!.id, req.ip, req.get('user-agent'));

    res.status(201).json({
      status: 'success',
      message: 'Cliente criado com sucesso',
      data: { client }
    });
  } catch (error) {
    next(error);
  }
};

export const updateClient = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, email, phone, cpfCnpj, type, address, city, state, zipCode, notes, isActive } = req.body;

    const existingClient = await prisma.client.findUnique({ where: { id } });
    if (!existingClient) {
      throw new AppError('Cliente não encontrado', 404);
    }

    // Se CPF/CNPJ mudou, verificar se não existe outro cliente com esse CPF/CNPJ
    if (cpfCnpj && cpfCnpj !== existingClient.cpfCnpj) {
      const duplicate = await prisma.client.findUnique({ where: { cpfCnpj } });
      if (duplicate) {
        throw new AppError('CPF/CNPJ já cadastrado', 400);
      }
    }

    const client = await prisma.client.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        cpfCnpj,
        type,
        address,
        city,
        state,
        zipCode,
        notes,
        isActive
      }
    });

    await createAuditLog('UPDATE', 'Client', client.id, req.user!.id, req.ip, req.get('user-agent'));

    res.json({
      status: 'success',
      message: 'Cliente atualizado com sucesso',
      data: { client }
    });
  } catch (error) {
    next(error);
  }
};

export const deleteClient = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const client = await prisma.client.findUnique({
      where: { id },
      include: { _count: { select: { cases: true } } }
    });

    if (!client) {
      throw new AppError('Cliente não encontrado', 404);
    }

    // Não permitir exclusão se houver casos associados
    if (client._count.cases > 0) {
      throw new AppError('Não é possível excluir cliente com casos associados', 400);
    }

    await prisma.client.delete({ where: { id } });

    await createAuditLog('DELETE', 'Client', id, req.user!.id, req.ip, req.get('user-agent'));

    res.json({
      status: 'success',
      message: 'Cliente excluído com sucesso'
    });
  } catch (error) {
    next(error);
  }
};
