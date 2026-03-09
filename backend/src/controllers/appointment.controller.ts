import { Response, NextFunction } from 'express';
import prisma from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { createAuditLog } from '../utils/audit';

type AppointmentPayload = {
  title?: string;
  description?: string;
  type?: 'AUDIENCIA' | 'REUNIAO' | 'ATENDIMENTO' | 'DILIGENCIA';
  date?: string;
  startTime?: string;
  endTime?: string;
  startDateTime?: string;
  endDateTime?: string;
  location?: string;
  participants?: string;
  isRecurring?: boolean;
  recurrence?: string;
};

const privilegedRoles = new Set(['SOCIO']);

const pad = (value: number) => value.toString().padStart(2, '0');

const toYyyyMmDd = (date: Date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

const toHHmm = (date: Date) => `${pad(date.getHours())}:${pad(date.getMinutes())}`;

const parseDateInput = (value: string): { year: number; month: number; day: number } | null => {
  const br = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  if (br) {
    return { day: Number(br[1]), month: Number(br[2]), year: Number(br[3]) };
  }

  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (iso) {
    return { year: Number(iso[1]), month: Number(iso[2]), day: Number(iso[3]) };
  }

  return null;
};

const parseTimeInput = (value: string): { hour: number; minute: number } | null => {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;

  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return null;

  return { hour, minute };
};

const parseDateAndTime = (dateInput: string, timeInput: string): Date => {
  const dateParts = parseDateInput(dateInput);
  if (!dateParts) {
    throw new AppError('Data inválida. Use o formato DD/MM/AAAA.', 400);
  }

  const timeParts = parseTimeInput(timeInput);
  if (!timeParts) {
    throw new AppError('Horário inválido. Use o formato HH:mm.', 400);
  }

  const date = new Date(
    dateParts.year,
    dateParts.month - 1,
    dateParts.day,
    timeParts.hour,
    timeParts.minute,
    0,
    0
  );

  if (Number.isNaN(date.getTime())) {
    throw new AppError('Data/Horário inválidos.', 400);
  }

  return date;
};

const parseDateTimePayload = (payload: AppointmentPayload, fallback?: { start: Date; end: Date }) => {
  if (payload.startDateTime || payload.endDateTime) {
    if (!payload.startDateTime || !payload.endDateTime) {
      throw new AppError('Informe início e fim completos do compromisso.', 400);
    }

    const start = new Date(payload.startDateTime);
    const end = new Date(payload.endDateTime);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      throw new AppError('Data/hora inválida para o compromisso.', 400);
    }

    if (end <= start) {
      throw new AppError('Horário final precisa ser maior que o horário inicial.', 400);
    }

    return { start, end };
  }

  const dateInput = payload.date ?? (fallback ? toYyyyMmDd(fallback.start) : undefined);
  const startInput = payload.startTime ?? (fallback ? toHHmm(fallback.start) : undefined);
  const endInput = payload.endTime ?? (fallback ? toHHmm(fallback.end) : undefined);

  if (!dateInput || !startInput || !endInput) {
    throw new AppError('Informe data, horário de início e horário de fim.', 400);
  }

  const start = parseDateAndTime(dateInput, startInput);
  const end = parseDateAndTime(dateInput, endInput);

  if (end <= start) {
    throw new AppError('Horário final precisa ser maior que o horário inicial.', 400);
  }

  return { start, end };
};

const toGoogleDate = (value: Date) => value.toISOString().replace(/[-:]/g, '').replace('.000', '');

const escapeIcs = (value: string) =>
  value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');

const toIcsDate = (value: Date) => value.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

const buildGoogleCalendarLink = (appointment: {
  title: string;
  description: string | null;
  location: string | null;
  startTime: Date;
  endTime: Date;
}) => {
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: appointment.title,
    dates: `${toGoogleDate(appointment.startTime)}/${toGoogleDate(appointment.endTime)}`,
    details: appointment.description || '',
    location: appointment.location || '',
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
};

const serializeAppointment = (appointment: {
  id: string;
  title: string;
  description: string | null;
  type: string;
  startTime: Date;
  endTime: Date;
  location: string | null;
  participants: string | null;
  userId: string;
  user?: { id: string; name: string; email: string } | null;
  isRecurring: boolean;
  recurrence: string | null;
  createdAt: Date;
  updatedAt: Date;
}) => ({
  id: appointment.id,
  title: appointment.title,
  description: appointment.description,
  type: appointment.type,
  startDateTime: appointment.startTime.toISOString(),
  endDateTime: appointment.endTime.toISOString(),
  date: toYyyyMmDd(appointment.startTime),
  dateLabel: appointment.startTime.toLocaleDateString('pt-BR'),
  startTime: toHHmm(appointment.startTime),
  endTime: toHHmm(appointment.endTime),
  location: appointment.location,
  participants: appointment.participants,
  userId: appointment.userId,
  user: appointment.user ?? null,
  isRecurring: appointment.isRecurring,
  recurrence: appointment.recurrence,
  googleCalendarUrl: buildGoogleCalendarLink(appointment),
  icsUrl: `/api/appointments/${appointment.id}/ics`,
  createdAt: appointment.createdAt,
  updatedAt: appointment.updatedAt,
});

const appointmentAccessWhere = (req: AuthRequest) =>
  privilegedRoles.has(req.user?.role || '') ? {} : { userId: req.user!.id };

export const getAppointments = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { dateFrom, dateTo, type } = req.query;

    const where: any = {
      ...appointmentAccessWhere(req),
    };

    if (type) where.type = type;

    if (dateFrom || dateTo) {
      where.startTime = {};
      if (dateFrom) where.startTime.gte = new Date(`${dateFrom as string}T00:00:00`);
      if (dateTo) where.startTime.lte = new Date(`${dateTo as string}T23:59:59`);
    }

    const appointments = await prisma.appointment.findMany({
      where,
      orderBy: { startTime: 'asc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    res.json({
      status: 'success',
      data: appointments.map(serializeAppointment),
    });
  } catch (error) {
    next(error);
  }
};

export const getAppointment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const appointment = await prisma.appointment.findFirst({
      where: {
        id,
        ...appointmentAccessWhere(req),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!appointment) {
      throw new AppError('Compromisso não encontrado.', 404);
    }

    res.json({ status: 'success', data: serializeAppointment(appointment) });
  } catch (error) {
    next(error);
  }
};

export const createAppointment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const payload: AppointmentPayload = req.body;

    if (!payload.title || !payload.type) {
      throw new AppError('Título e tipo são obrigatórios.', 400);
    }

    const { start, end } = parseDateTimePayload(payload);

    const appointment = await prisma.appointment.create({
      data: {
        title: payload.title,
        description: payload.description || null,
        type: payload.type,
        startTime: start,
        endTime: end,
        location: payload.location || null,
        participants: payload.participants || null,
        isRecurring: payload.isRecurring || false,
        recurrence: payload.recurrence || null,
        userId: req.user!.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    await createAuditLog(
      'CREATE',
      'Appointment',
      appointment.id,
      req.user!.id,
      req.ip,
      req.get('user-agent'),
      `Compromisso ${appointment.title} criado`
    );

    res.status(201).json({
      status: 'success',
      message: 'Compromisso criado com sucesso.',
      data: serializeAppointment(appointment),
    });
  } catch (error) {
    next(error);
  }
};

export const updateAppointment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const payload: AppointmentPayload = req.body;

    const existing = await prisma.appointment.findFirst({
      where: {
        id,
        ...appointmentAccessWhere(req),
      },
    });

    if (!existing) {
      throw new AppError('Compromisso não encontrado.', 404);
    }

    const shouldUpdateDateTime =
      payload.date !== undefined ||
      payload.startTime !== undefined ||
      payload.endTime !== undefined ||
      payload.startDateTime !== undefined ||
      payload.endDateTime !== undefined;

    const dateTime = shouldUpdateDateTime
      ? parseDateTimePayload(payload, { start: existing.startTime, end: existing.endTime })
      : null;

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        title: payload.title ?? existing.title,
        description: payload.description ?? existing.description,
        type: payload.type ?? existing.type,
        startTime: dateTime?.start ?? existing.startTime,
        endTime: dateTime?.end ?? existing.endTime,
        location: payload.location ?? existing.location,
        participants: payload.participants ?? existing.participants,
        isRecurring: payload.isRecurring ?? existing.isRecurring,
        recurrence: payload.recurrence ?? existing.recurrence,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    await createAuditLog(
      'UPDATE',
      'Appointment',
      updated.id,
      req.user!.id,
      req.ip,
      req.get('user-agent'),
      `Compromisso ${updated.title} atualizado`
    );

    res.json({
      status: 'success',
      message: 'Compromisso atualizado com sucesso.',
      data: serializeAppointment(updated),
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAppointment = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const appointment = await prisma.appointment.findFirst({
      where: {
        id,
        ...appointmentAccessWhere(req),
      },
    });

    if (!appointment) {
      throw new AppError('Compromisso não encontrado.', 404);
    }

    await prisma.appointment.delete({ where: { id } });

    await createAuditLog(
      'DELETE',
      'Appointment',
      id,
      req.user!.id,
      req.ip,
      req.get('user-agent'),
      `Compromisso ${appointment.title} excluído`
    );

    res.json({ status: 'success', message: 'Compromisso excluído com sucesso.' });
  } catch (error) {
    next(error);
  }
};

export const getAppointmentIcs = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const appointment = await prisma.appointment.findFirst({
      where: {
        id,
        ...appointmentAccessWhere(req),
      },
    });

    if (!appointment) {
      throw new AppError('Compromisso não encontrado.', 404);
    }

    const uid = `${appointment.id}@crm-juridico.local`;
    const now = toIcsDate(new Date());
    const dtStart = toIcsDate(appointment.startTime);
    const dtEnd = toIcsDate(appointment.endTime);
    const description = escapeIcs(appointment.description || '');
    const location = escapeIcs(appointment.location || '');
    const title = escapeIcs(appointment.title);

    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//CRM Juridico//Appointments//PT-BR',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${now}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${location}`,
      'END:VEVENT',
      'END:VCALENDAR',
      '',
    ].join('\r\n');

    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="compromisso-${appointment.id}.ics"`);
    res.send(ics);
  } catch (error) {
    next(error);
  }
};
