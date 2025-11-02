import { Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { createAuditLog } from '../utils/audit';

// Gerar tokens JWT
const generateTokens = (userId: string, email: string, role: string) => {
  const payload = { id: userId, email, role };
  const secret = process.env.JWT_SECRET as string;
  const refreshSecret = process.env.JWT_REFRESH_SECRET as string;
  
  // @ts-ignore - Issue with jsonwebtoken types
  const accessToken = jwt.sign(payload, secret, { expiresIn: '15m' });
  
  // @ts-ignore - Issue with jsonwebtoken types
  const refreshToken = jwt.sign(payload, refreshSecret, { expiresIn: '7d' });

  return { accessToken, refreshToken };
};

// Register
export const register = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { name, email, password, cpf, oab, phone, role } = req.body;

    // Verificar se usuário já existe
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new AppError('Email já cadastrado', 400);
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 12);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        cpf,
        oab,
        phone,
        role: role || 'ADVOGADO'
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    // Criar log de auditoria
    await createAuditLog('CREATE', 'User', user.id, user.id, req.ip, req.get('user-agent'));

    res.status(201).json({
      status: 'success',
      message: 'Usuário criado com sucesso',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

// Login
export const login = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { email, password, twoFactorCode } = req.body;

    // Buscar usuário
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      throw new AppError('Credenciais inválidas', 401);
    }

    // Verificar senha
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Credenciais inválidas', 401);
    }

    // Verificar 2FA se habilitado
    if (user.twoFactorEnabled) {
      if (!twoFactorCode) {
        return res.status(200).json({
          status: 'success',
          require2FA: true,
          message: 'Código 2FA necessário'
        });
      }

      const isValid = authenticator.verify({
        token: twoFactorCode,
        secret: user.twoFactorSecret!
      });

      if (!isValid) {
        throw new AppError('Código 2FA inválido', 401);
      }
    }

    // Gerar tokens
    const { accessToken, refreshToken } = generateTokens(user.id, user.email, user.role);

    // Salvar refresh token
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt
      }
    });

    // Log de auditoria
    await createAuditLog('LOGIN', 'User', user.id, user.id, req.ip, req.get('user-agent'));

    res.json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          twoFactorEnabled: user.twoFactorEnabled
        },
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    next(error);
  }
};

// Refresh Token
export const refreshToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new AppError('Refresh token não fornecido', 401);
    }

    // Verificar se o token existe no banco
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true }
    });

    if (!storedToken) {
      throw new AppError('Refresh token inválido', 401);
    }

    // Verificar se expirou
    if (new Date() > storedToken.expiresAt) {
      await prisma.refreshToken.delete({ where: { token: refreshToken } });
      throw new AppError('Refresh token expirado', 401);
    }

    // Verificar o token JWT
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET!) as {
      id: string;
      email: string;
      role: string;
    };

    // Gerar novos tokens
    const tokens = generateTokens(decoded.id, decoded.email, decoded.role);

    // Deletar token antigo e criar novo
    await prisma.refreshToken.delete({ where: { token: refreshToken } });
    
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        token: tokens.refreshToken,
        userId: decoded.id,
        expiresAt
      }
    });

    res.json({
      status: 'success',
      data: tokens
    });
  } catch (error) {
    next(error);
  }
};

// Logout
export const logout = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await prisma.refreshToken.deleteMany({
        where: { token: refreshToken }
      });
    }

    // Log de auditoria
    await createAuditLog('LOGOUT', 'User', req.user!.id, req.user!.id, req.ip, req.get('user-agent'));

    res.json({
      status: 'success',
      message: 'Logout realizado com sucesso'
    });
  } catch (error) {
    next(error);
  }
};

// Get Current User
export const getCurrentUser = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: {
        id: true,
        name: true,
        email: true,
        cpf: true,
        oab: true,
        phone: true,
        role: true,
        profileImage: true,
        twoFactorEnabled: true,
        createdAt: true
      }
    });

    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    res.json({
      status: 'success',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

// Enable 2FA
export const enable2FA = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id }
    });

    if (!user) {
      throw new AppError('Usuário não encontrado', 404);
    }

    if (user.twoFactorEnabled) {
      throw new AppError('2FA já está habilitado', 400);
    }

    // Gerar secret
    const secret = authenticator.generateSecret();
    const appName = process.env.TWO_FACTOR_APP_NAME || 'CRM Jurídico';
    const otpauth = authenticator.keyuri(user.email, appName, secret);

    // Gerar QR Code
    const qrCode = await QRCode.toDataURL(otpauth);

    // Salvar secret temporariamente (será confirmado no verify)
    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorSecret: secret }
    });

    res.json({
      status: 'success',
      data: {
        secret,
        qrCode
      }
    });
  } catch (error) {
    next(error);
  }
};

// Verify 2FA
export const verify2FA = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { code } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id }
    });

    if (!user || !user.twoFactorSecret) {
      throw new AppError('2FA não configurado', 400);
    }

    // Verificar código
    const isValid = authenticator.verify({
      token: code,
      secret: user.twoFactorSecret
    });

    if (!isValid) {
      throw new AppError('Código inválido', 400);
    }

    // Ativar 2FA
    await prisma.user.update({
      where: { id: user.id },
      data: { twoFactorEnabled: true }
    });

    // Log de auditoria
    await createAuditLog('ENABLE_2FA', 'User', user.id, user.id, req.ip, req.get('user-agent'));

    res.json({
      status: 'success',
      message: '2FA habilitado com sucesso'
    });
  } catch (error) {
    next(error);
  }
};

// Disable 2FA
export const disable2FA = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { code } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.user!.id }
    });

    if (!user || !user.twoFactorEnabled) {
      throw new AppError('2FA não está habilitado', 400);
    }

    // Verificar código
    const isValid = authenticator.verify({
      token: code,
      secret: user.twoFactorSecret!
    });

    if (!isValid) {
      throw new AppError('Código inválido', 400);
    }

    // Desativar 2FA
    await prisma.user.update({
      where: { id: user.id },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null
      }
    });

    // Log de auditoria
    await createAuditLog('DISABLE_2FA', 'User', user.id, user.id, req.ip, req.get('user-agent'));

    res.json({
      status: 'success',
      message: '2FA desabilitado com sucesso'
    });
  } catch (error) {
    next(error);
  }
};
