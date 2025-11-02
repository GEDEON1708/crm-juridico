import prisma from '../config/database';

export const createAuditLog = async (
  action: string,
  entity: string,
  entityId: string | null,
  userId: string | null,
  ipAddress: string | undefined,
  userAgent: string | undefined,
  details?: string
) => {
  try {
    await prisma.auditLog.create({
      data: {
        action,
        entity,
        entityId,
        userId,
        ipAddress: ipAddress || null,
        userAgent: userAgent || null,
        details: details || null
      }
    });
  } catch (error) {
    console.error('Erro ao criar log de auditoria:', error);
  }
};
