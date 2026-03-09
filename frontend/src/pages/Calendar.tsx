import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import api from '../lib/axios';
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  PlusIcon,
  XMarkIcon,
  TrashIcon,
  PencilSquareIcon,
  ArrowTopRightOnSquareIcon,
  ArrowDownTrayIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';

type AppointmentType = 'AUDIENCIA' | 'REUNIAO' | 'ATENDIMENTO' | 'DILIGENCIA';

interface Appointment {
  id: string;
  title: string;
  description?: string | null;
  type: AppointmentType;
  date: string;
  dateLabel: string;
  startTime: string;
  endTime: string;
  startDateTime: string;
  endDateTime: string;
  location?: string | null;
  participants?: string | null;
  googleCalendarUrl: string;
  icsUrl: string;
}

interface AppointmentForm {
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  location?: string;
  participants?: string;
  type: AppointmentType;
}

const TYPE_LABELS: Record<AppointmentType, string> = {
  AUDIENCIA: 'Audiencia',
  REUNIAO: 'Reuniao',
  ATENDIMENTO: 'Atendimento',
  DILIGENCIA: 'Diligencia',
};

const BR_DATE_REGEX = /^(\d{2})\/(\d{2})\/(\d{4})$/;

const pad = (value: number) => value.toString().padStart(2, '0');

const toBrDate = (date: Date) => `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;

const toBrDateFromIso = (isoDate: string) => {
  const [year, month, day] = isoDate.split('-');
  if (!year || !month || !day) return isoDate;
  return `${day}/${month}/${year}`;
};

const isValidBrDate = (value: string) => {
  const match = BR_DATE_REGEX.exec(value);
  if (!match) return false;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  const date = new Date(year, month - 1, day);

  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
};

const compareTime = (start: string, end: string) => {
  const [startHour, startMinute] = start.split(':').map(Number);
  const [endHour, endMinute] = end.split(':').map(Number);
  return endHour * 60 + endMinute - (startHour * 60 + startMinute);
};

const getAppointmentState = (appointment: Appointment) => {
  const now = new Date();
  const start = new Date(appointment.startDateTime);
  const end = new Date(appointment.endDateTime);

  if (now > end) {
    return { label: 'Concluido', style: 'bg-gray-200 text-gray-800 dark:bg-dark-600 dark:text-gray-100' };
  }

  if (now >= start && now <= end) {
    return { label: 'Em andamento', style: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300' };
  }

  return { label: 'Agendado', style: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' };
};

export default function Calendar() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AppointmentForm>();

  const { data: appointments = [], isLoading } = useQuery<Appointment[]>({
    queryKey: ['appointments'],
    queryFn: async () => {
      const response = await api.get('/appointments');
      return response.data.data || [];
    },
  });

  const sortedAppointments = useMemo(
    () =>
      [...appointments].sort(
        (a, b) => new Date(a.startDateTime).getTime() - new Date(b.startDateTime).getTime()
      ),
    [appointments]
  );

  const createMutation = useMutation({
    mutationFn: async (data: AppointmentForm) => api.post('/appointments', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Compromisso criado com sucesso');
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao criar compromisso');
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: AppointmentForm }) => api.put(`/appointments/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Compromisso atualizado com sucesso');
      closeModal();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao atualizar compromisso');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => api.delete(`/appointments/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Compromisso excluido com sucesso');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao excluir compromisso');
    },
  });

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAppointment(null);
    reset({
      title: '',
      description: '',
      date: toBrDate(new Date()),
      startTime: '09:00',
      endTime: '10:00',
      location: '',
      participants: '',
      type: 'REUNIAO',
    });
  };

  const openCreateModal = () => {
    setSelectedAppointment(null);
    reset({
      title: '',
      description: '',
      date: toBrDate(new Date()),
      startTime: '09:00',
      endTime: '10:00',
      location: '',
      participants: '',
      type: 'REUNIAO',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    reset({
      title: appointment.title,
      description: appointment.description || '',
      date: toBrDateFromIso(appointment.date),
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      location: appointment.location || '',
      participants: appointment.participants || '',
      type: appointment.type,
    });
    setIsModalOpen(true);
  };

  const onSubmit = (data: AppointmentForm) => {
    if (!isValidBrDate(data.date)) {
      toast.error('Informe a data no formato DIA/MES/ANO');
      return;
    }

    if (compareTime(data.startTime, data.endTime) <= 0) {
      toast.error('Horario final deve ser maior que horario inicial');
      return;
    }

    if (selectedAppointment) {
      updateMutation.mutate({ id: selectedAppointment.id, data });
      return;
    }

    createMutation.mutate(data);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Deseja excluir este compromisso?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleGoogleOpen = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleIcsDownload = async (appointment: Appointment) => {
    try {
      const response = await api.get(`/appointments/${appointment.id}/ics`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/calendar' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `compromisso-${appointment.id}.ics`;
      link.click();
      window.URL.revokeObjectURL(url);
      toast.success('Arquivo ICS baixado');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao baixar arquivo ICS');
    }
  };

  const now = new Date();
  const todayLabel = toBrDate(now);
  const todayAppointments = sortedAppointments.filter((appointment) => toBrDate(new Date(appointment.startDateTime)) === todayLabel);
  const upcomingAppointments = sortedAppointments.filter(
    (appointment) => new Date(appointment.endDateTime).getTime() >= now.getTime()
  );
  const monthAppointments = sortedAppointments.filter((appointment) => {
    const date = new Date(appointment.startDateTime);
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark-900 dark:text-gray-100">Agenda</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Data no padrao DIA/MES/ANO e integracao com Google Agenda (web, iOS e Android)
          </p>
        </div>
        <button onClick={openCreateModal} className="btn btn-primary inline-flex items-center gap-2">
          <PlusIcon className="h-5 w-5" />
          Novo compromisso
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-blue-600 to-cyan-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Hoje</p>
              <p className="text-3xl font-bold mt-2">{todayAppointments.length}</p>
            </div>
            <CalendarIcon className="h-12 w-12 text-blue-100" />
          </div>
        </div>
        <div className="card bg-gradient-to-br from-emerald-600 to-teal-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-emerald-100">Proximos</p>
              <p className="text-3xl font-bold mt-2">{upcomingAppointments.length}</p>
            </div>
            <ClockIcon className="h-12 w-12 text-emerald-100" />
          </div>
        </div>
        <div className="card bg-gradient-to-br from-indigo-600 to-blue-700 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-100">Total do mes</p>
              <p className="text-3xl font-bold mt-2">{monthAppointments.length}</p>
            </div>
            <UserGroupIcon className="h-12 w-12 text-indigo-100" />
          </div>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-dark-900 dark:text-gray-100">Compromissos</h2>
          <span className="text-sm text-gray-500 dark:text-gray-300">{sortedAppointments.length} registros</span>
        </div>

        {sortedAppointments.length === 0 ? (
          <div className="p-10 text-center text-gray-500 dark:text-gray-400">Nenhum compromisso cadastrado.</div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-dark-700">
            {sortedAppointments.map((appointment) => {
              const state = getAppointmentState(appointment);
              return (
                <div key={appointment.id} className="p-6 bg-white dark:bg-dark-800">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-semibold text-dark-900 dark:text-gray-100">{appointment.title}</h3>
                        <span className={`inline-flex px-2 py-1 text-xs rounded-full ${state.style}`}>{state.label}</span>
                        <span className="inline-flex px-2 py-1 text-xs rounded-full bg-primary-100 text-primary-800 dark:bg-primary-900/40 dark:text-primary-300">
                          {TYPE_LABELS[appointment.type]}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {appointment.dateLabel} - {appointment.startTime} ate {appointment.endTime}
                      </p>
                      {appointment.location && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
                          <MapPinIcon className="h-4 w-4" />
                          {appointment.location}
                        </p>
                      )}
                      {appointment.participants && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1.5">
                          <UserGroupIcon className="h-4 w-4" />
                          {appointment.participants}
                        </p>
                      )}
                      {appointment.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-300">{appointment.description}</p>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => handleGoogleOpen(appointment.googleCalendarUrl)}
                        className="btn btn-secondary inline-flex items-center gap-1.5 text-sm"
                        title="Adicionar ao Google Agenda"
                      >
                        <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                        Google
                      </button>
                      <button
                        onClick={() => handleIcsDownload(appointment)}
                        className="btn btn-secondary inline-flex items-center gap-1.5 text-sm"
                        title="Baixar arquivo ICS"
                      >
                        <ArrowDownTrayIcon className="h-4 w-4" />
                        ICS
                      </button>
                      <button
                        onClick={() => openEditModal(appointment)}
                        className="btn btn-secondary inline-flex items-center gap-1.5 text-sm"
                      >
                        <PencilSquareIcon className="h-4 w-4" />
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(appointment.id)}
                        className="btn btn-danger inline-flex items-center gap-1.5 text-sm"
                      >
                        <TrashIcon className="h-4 w-4" />
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-dark-700">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-dark-900 dark:text-gray-100">
                  {selectedAppointment ? 'Editar compromisso' : 'Novo compromisso'}
                </h2>
                <button
                  onClick={closeModal}
                  title="Fechar"
                  aria-label="Fechar modal"
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label htmlFor="appointment-title" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Titulo *
                  </label>
                  <input
                    {...register('title', { required: 'Titulo obrigatorio' })}
                    id="appointment-title"
                    type="text"
                    className="input-field"
                    placeholder="Ex: Reuniao com cliente"
                  />
                  {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>}
                </div>

                <div>
                  <label htmlFor="appointment-description" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Descricao
                  </label>
                  <textarea
                    {...register('description')}
                    id="appointment-description"
                    rows={3}
                    className="input-field"
                    placeholder="Detalhes do compromisso"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="appointment-date" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                      Data (DIA/MES/ANO) *
                    </label>
                    <input
                      {...register('date', {
                        required: 'Data obrigatoria',
                        pattern: {
                          value: BR_DATE_REGEX,
                          message: 'Use o formato DD/MM/AAAA',
                        },
                      })}
                      id="appointment-date"
                      type="text"
                      inputMode="numeric"
                      className="input-field"
                      placeholder="24/03/2026"
                    />
                    {errors.date && <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>}
                  </div>

                  <div>
                    <label htmlFor="appointment-type" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                      Tipo *
                    </label>
                    <select
                      {...register('type', { required: 'Tipo obrigatorio' })}
                      id="appointment-type"
                      className="input-field"
                    >
                      <option value="REUNIAO">Reuniao</option>
                      <option value="AUDIENCIA">Audiencia</option>
                      <option value="ATENDIMENTO">Atendimento</option>
                      <option value="DILIGENCIA">Diligencia</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="appointment-start-time" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                      Inicio *
                    </label>
                    <input
                      {...register('startTime', { required: 'Horario de inicio obrigatorio' })}
                      id="appointment-start-time"
                      type="time"
                      className="input-field"
                    />
                    {errors.startTime && <p className="text-red-500 text-sm mt-1">{errors.startTime.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="appointment-end-time" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                      Fim *
                    </label>
                    <input
                      {...register('endTime', { required: 'Horario de fim obrigatorio' })}
                      id="appointment-end-time"
                      type="time"
                      className="input-field"
                    />
                    {errors.endTime && <p className="text-red-500 text-sm mt-1">{errors.endTime.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="appointment-location" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                      Local
                    </label>
                    <input
                      {...register('location')}
                      id="appointment-location"
                      type="text"
                      className="input-field"
                      placeholder="Sala, Forum ou link da reuniao"
                    />
                  </div>
                  <div>
                    <label htmlFor="appointment-participants" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                      Participantes
                    </label>
                    <input
                      {...register('participants')}
                      id="appointment-participants"
                      type="text"
                      className="input-field"
                      placeholder="Nomes separados por virgula"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={closeModal} className="btn btn-secondary">
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="btn btn-primary"
                  >
                    {createMutation.isPending || updateMutation.isPending
                      ? 'Salvando...'
                      : selectedAppointment
                        ? 'Atualizar'
                        : 'Criar compromisso'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
