import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import fs from 'fs';
import path from 'path';

export const getDocuments = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { limit = '100', type, caseId } = req.query;
    const limitNum = parseInt(limit as string);

    const where: any = {};
    if (type) where.type = type;
    if (caseId) where.caseId = caseId;

    const documents = await prisma.document.findMany({
      where,
      take: limitNum,
      orderBy: { createdAt: 'desc' },
      include: {
        case: {
          select: {
            id: true,
            caseNumber: true,
            title: true,
          },
        },
        uploader: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.json({ status: 'success', data: documents });
  } catch (error) {
    next(error);
  }
};

export const getDocument = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const document = await prisma.document.findUnique({
      where: { id },
      include: {
        case: {
          select: {
            id: true,
            caseNumber: true,
            title: true,
          },
        },
        uploader: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!document) {
      throw new AppError('Documento não encontrado', 404);
    }

    res.json({ status: 'success', data: document });
  } catch (error) {
    next(error);
  }
};

export const uploadDocument = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.file) {
      throw new AppError('Nenhum arquivo foi enviado', 400);
    }

    const { title, description, type, caseId } = req.body;

    if (!title || !type) {
      throw new AppError('Título e tipo são obrigatórios', 400);
    }

    // Criar documento no banco
    const document = await prisma.document.create({
      data: {
        title,
        description,
        type,
        fileName: req.file.filename,
        filePath: `/uploads/documents/${req.file.filename}`,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
        uploadedBy: req.user!.id,
        caseId: caseId || null,
      },
      include: {
        case: {
          select: {
            id: true,
            caseNumber: true,
            title: true,
          },
        },
        uploader: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.status(201).json({ status: 'success', data: document, message: 'Documento enviado com sucesso' });
  } catch (error) {
    next(error);
  }
};

export const updateDocument = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { title, description, type, caseId } = req.body;

    const document = await prisma.document.update({
      where: { id },
      data: {
        title,
        description,
        type,
        caseId: caseId || null,
      },
      include: {
        case: {
          select: {
            id: true,
            caseNumber: true,
            title: true,
          },
        },
        uploader: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    res.json({ status: 'success', data: document, message: 'Documento atualizado com sucesso' });
  } catch (error) {
    next(error);
  }
};

export const deleteDocument = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const document = await prisma.document.findUnique({ where: { id } });
    
    if (!document) {
      throw new AppError('Documento não encontrado', 404);
    }

    // Deletar arquivo físico
    const filePath = path.join(__dirname, '../../', document.filePath);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Deletar registro do banco
    await prisma.document.delete({ where: { id } });

    res.json({ status: 'success', message: 'Documento excluído com sucesso' });
  } catch (error) {
    next(error);
  }
};
