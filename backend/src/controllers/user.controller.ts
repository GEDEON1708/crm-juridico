import { Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { createAuditLog } from '../utils/audit';

// Get all users
export const getUsers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        cpf: true,
        oab: true,
        phone: true,
        role: true,
        isActive: true,
        profileImage: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    res.json({ status: 'success', data: users });
  } catch (error) {
    next(error);
  }
};

// Get user by ID
export const getUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        cpf: true,
        oab: true,
        phone: true,
        role: true,
        isActive: true,
        twoFactorEnabled: true,
        profileImage: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    res.json({ status: 'success', data: user });
  } catch (error) {
    next(error);
  }
};

// Update user
export const updateUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, email, cpf, oab, phone, role, isActive, password } = req.body;

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      throw new AppError('Usuário não encontrado', 404);
    }

    // Check if email is being changed and if it's already in use
    if (email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({ where: { email } });
      if (emailExists) {
        throw new AppError('Email já está em uso', 400);
      }
    }

    const updateData: any = {
      name,
      email,
      cpf,
      oab,
      phone,
      role,
      isActive,
    };

    if (password) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        cpf: true,
        oab: true,
        phone: true,
        role: true,
        isActive: true,
        profileImage: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await createAuditLog(
      'UPDATE',
      'User',
      user.id,
      req.user?.id || user.id,
      req.ip,
      req.get('user-agent'),
      `Usuário ${user.name} atualizado`
    );

    res.json({ status: 'success', data: user });
  } catch (error) {
    next(error);
  }
};

// Delete user
export const deleteUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    // Instead of deleting, deactivate the user
    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    await createAuditLog(
      'DELETE',
      'User',
      id,
      req.user?.id || id,
      req.ip,
      req.get('user-agent'),
      `Usuário ${user.name} desativado`
    );

    res.json({ status: 'success', message: 'Usuário desativado com sucesso' });
  } catch (error) {
    next(error);
  }
};

// Upload profile image
export const uploadProfileImage = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      throw new AppError('Nenhuma imagem foi enviada', 400);
    }

    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      throw new AppError('Usuário não encontrado', 404);
    }

    // Delete old profile image if exists
    if (existingUser.profileImage) {
      const fs = require('fs');
      const path = require('path');
      const oldImagePath = path.join(__dirname, '../../uploads/profiles', path.basename(existingUser.profileImage));
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    // Save new profile image path
    const profileImageUrl = `/uploads/profiles/${req.file.filename}`;
    
    const user = await prisma.user.update({
      where: { id },
      data: { profileImage: profileImageUrl },
      select: {
        id: true,
        name: true,
        email: true,
        cpf: true,
        oab: true,
        phone: true,
        role: true,
        isActive: true,
        profileImage: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    await createAuditLog(
      'UPDATE',
      'User',
      user.id,
      req.user?.id || user.id,
      `Foto de perfil atualizada para ${user.name}`,
      undefined,
      undefined
    );

    res.json({ 
      status: 'success', 
      message: 'Foto de perfil atualizada com sucesso',
      data: user 
    });
  } catch (error) {
    next(error);
  }
};
