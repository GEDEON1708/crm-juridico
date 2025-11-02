import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

// Get dashboard stats
export const getStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const [
      totalClients,
      totalCases,
      activeCases,
      pendingDeadlines,
      upcomingHearings,
      totalFees,
      paidFees,
    ] = await Promise.all([
      prisma.client.count(),
      prisma.case.count(),
      prisma.case.count({ where: { status: 'ATIVO' } }),
      prisma.deadline.count({ where: { isCompleted: false } }),
      prisma.hearing.count({
        where: {
          date: {
            gte: new Date(),
          },
        },
      }),
      prisma.fee.aggregate({
        _sum: {
          amount: true,
        },
      }),
      prisma.fee.aggregate({
        where: { status: 'PAGO' },
        _sum: {
          amount: true,
        },
      }),
    ]);

    const pendingFeesAmount = await prisma.fee.aggregate({
      where: { status: { in: ['PENDENTE', 'ATRASADO'] } },
      _sum: {
        amount: true,
      },
    });

    const totalDocuments = await prisma.document.count();

    const stats = {
      totalClients,
      totalCases,
      activeCases,
      pendingDeadlines,
      upcomingHearings,
      pendingFees: pendingFeesAmount._sum.amount || 0,
      totalDocuments,
      totalRevenue: totalFees._sum.amount || 0,
      paidRevenue: paidFees._sum.amount || 0,
    };

    res.json({ status: 'success', data: stats });
  } catch (error) {
    next(error);
  }
};

// Get case type distribution
export const getCaseTypeDistribution = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const casesByType = await prisma.case.groupBy({
      by: ['type'],
      _count: {
        _all: true,
      },
    });

    const distribution = casesByType.map((item) => ({
      type: item.type,
      count: item._count._all,
    }));

    res.json({ status: 'success', data: distribution });
  } catch (error) {
    next(error);
  }
};

// Get monthly activity
export const getMonthlyActivity = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const currentYear = new Date().getFullYear();
    const startDate = new Date(currentYear, 0, 1);
    const endDate = new Date(currentYear, 11, 31);

    const [casesData, hearingsData] = await Promise.all([
      prisma.case.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          createdAt: true,
        },
      }),
      prisma.hearing.findMany({
        where: {
          date: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          date: true,
        },
      }),
    ]);

    const monthlyCaseCounts = Array(12).fill(0);
    const monthlyHearingCounts = Array(12).fill(0);
    
    casesData.forEach((c) => {
      const month = c.createdAt.getMonth();
      monthlyCaseCounts[month]++;
    });

    hearingsData.forEach((h) => {
      const month = h.date.getMonth();
      monthlyHearingCounts[month]++;
    });

    const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const data = months.map((month, index) => ({
      month,
      cases: monthlyCaseCounts[index],
      hearings: monthlyHearingCounts[index],
    }));

    res.json({ status: 'success', data });
  } catch (error) {
    next(error);
  }
};
