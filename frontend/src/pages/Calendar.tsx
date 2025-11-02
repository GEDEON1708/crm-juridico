import { useState } from 'react';
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
  PencilIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface Appointment {
  id: string;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  location?: string;
  type: 'AUDIENCIA' | 'REUNIAO' | 'PRAZO' | 'OUTRO';
  status: 'AGENDADO' | 'CONCLUIDO' | 'CANCELADO';
  caseId?: string;
  case?: {
    caseNumber: string;
    title: string;
  };
}

interface AppointmentForm {
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  location?: string;
  type: string;
  caseId?: string;
}

export default function Calendar() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<AppointmentForm>();

  // Buscar compromissos
  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ['appointments'],
    queryFn: async () => {
      const response = await api.get('/appointments');
      return response.data.data || [];
    }
  });

  // Buscar casos para vincular
  const { data: cases = [] } = useQuery({
    queryKey: ['cases-list'],
    queryFn: async () => {
      const response = await api.get('/cases?limit=100');
      return response.data.data?.cases || [];
    }
  });

  // Criar compromisso
  const createMutation = useMutation({
    mutationFn: async (data: AppointmentForm) => {
      return await api.post('/appointments', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Compromisso criado com sucesso!');
      setIsModalOpen(false);
      reset();
    },
    onError: () => {
      toast.error('Erro ao criar compromisso');
    }
  });

  // Atualizar compromisso
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<AppointmentForm> }) => {
      return await api.put(`/appointments/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Compromisso atualizado com sucesso!');
      setIsModalOpen(false);
      setSelectedAppointment(null);
      reset();
    },
    onError: () => {
      toast.error('Erro ao atualizar compromisso');
    }
  });

  // Deletar compromisso
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await api.delete(`/appointments/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Compromisso excluído com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao excluir compromisso');
    }
  });

  // Marcar como concluído
  const completeMutation = useMutation({
    mutationFn: async (id: string) => {
      return await api.put(`/appointments/${id}`, { status: 'CONCLUIDO' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Compromisso marcado como concluído!');
    }
  });

  const onSubmit = (data: AppointmentForm) => {
    if (selectedAppointment) {
      updateMutation.mutate({ id: selectedAppointment.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const openCreateModal = () => {
    setSelectedAppointment(null);
    reset({
      date: new Date().toISOString().split('T')[0],
      type: 'REUNIAO',
      startTime: '09:00',
      endTime: '10:00'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    reset({
      title: appointment.title,
      description: appointment.description || '',
      date: appointment.date.split('T')[0],
      startTime: appointment.startTime,
      endTime: appointment.endTime,
      location: appointment.location || '',
      type: appointment.type,
      caseId: appointment.caseId || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Deseja realmente excluir este compromisso?')) {
      deleteMutation.mutate(id);
    }
  };

  const syncWithGoogle = () => {
    toast('Integração com Google Calendar em desenvolvimento', { icon: 'ℹ️' });
    // Implementar OAuth Google Calendar posteriormente
  };

  const getAppointmentsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0];
    return appointments.filter((apt: Appointment) => 
      apt.date.split('T')[0] === dateStr
    );
  };

  const todayAppointments = getAppointmentsForDate(new Date());
  const upcomingAppointments = appointments
    .filter((apt: Appointment) => new Date(apt.date) > new Date() && apt.status !== 'CONCLUIDO')
    .sort((a: Appointment, b: Appointment) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const typeLabels: Record<string, string> = {
    AUDIENCIA: 'Audiência',
    REUNIAO: 'Reunião',
    PRAZO: 'Prazo',
    OUTRO: 'Outro'
  };

  const statusColors: Record<string, string> = {
    AGENDADO: 'bg-blue-100 text-blue-800',
    CONCLUIDO: 'bg-green-100 text-green-800',
    CANCELADO: 'bg-red-100 text-red-800'
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-dark-900">Agenda</h1>
          <p className="text-gray-600 mt-1">Gerencie seus compromissos e audiências</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={syncWithGoogle}
            className="btn bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            <CalendarIcon className="h-5 w-5 mr-2" />
            Sincronizar com Google
          </button>
          <button onClick={openCreateModal} className="btn btn-primary">
            <PlusIcon className="h-5 w-5 mr-2" />
            Novo Compromisso
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Hoje</p>
              <p className="text-3xl font-bold mt-2">{todayAppointments.length}</p>
            </div>
            <CalendarIcon className="h-12 w-12 text-blue-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Próximos</p>
              <p className="text-3xl font-bold mt-2">{upcomingAppointments.length}</p>
            </div>
            <ClockIcon className="h-12 w-12 text-green-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Total do Mês</p>
              <p className="text-3xl font-bold mt-2">
                {appointments.filter((apt: Appointment) => 
                  new Date(apt.date).getMonth() === new Date().getMonth()
                ).length}
              </p>
            </div>
            <CalendarIcon className="h-12 w-12 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Compromissos de Hoje */}
      {todayAppointments.length > 0 && (
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Compromissos de Hoje</h2>
          <div className="space-y-3">
            {todayAppointments.map((apt: Appointment) => (
              <div key={apt.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start gap-4 flex-1">
                  <div className="flex flex-col items-center bg-primary-100 rounded-lg px-3 py-2">
                    <span className="text-sm font-medium text-primary-600">{apt.startTime}</span>
                    <span className="text-xs text-primary-500">às</span>
                    <span className="text-sm font-medium text-primary-600">{apt.endTime}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-dark-900">{apt.title}</h3>
                    {apt.description && (
                      <p className="text-sm text-gray-600 mt-1">{apt.description}</p>
                    )}
                    {apt.location && (
                      <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                        <MapPinIcon className="h-4 w-4" />
                        {apt.location}
                      </div>
                    )}
                    {apt.case && (
                      <div className="mt-2 text-sm text-primary-600">
                        Processo: {apt.case.caseNumber} - {apt.case.title}
                      </div>
                    )}
                    <div className="flex gap-2 mt-2">
                      <span className="px-2 py-1 text-xs font-medium rounded bg-primary-100 text-primary-800">
                        {typeLabels[apt.type]}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${statusColors[apt.status]}`}>
                        {apt.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  {apt.status === 'AGENDADO' && (
                    <button
                      onClick={() => completeMutation.mutate(apt.id)}
                      title="Marcar como concluído"
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                    >
                      <CheckCircleIcon className="h-5 w-5" />
                    </button>
                  )}
                  <button
                    onClick={() => openEditModal(apt)}
                    title="Editar"
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(apt.id)}
                    title="Excluir"
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Próximos Compromissos */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Próximos Compromissos</h2>
        {upcomingAppointments.length === 0 ? (
          <div className="text-center py-12">
            <CalendarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum compromisso agendado</p>
            <button onClick={openCreateModal} className="btn btn-primary mt-4">
              Agendar Compromisso
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingAppointments.map((apt: Appointment) => (
              <div key={apt.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-primary-300 transition">
                <div className="flex items-start gap-4 flex-1">
                  <div className="flex flex-col items-center bg-gray-100 rounded-lg px-3 py-2 min-w-[80px]">
                    <span className="text-lg font-bold text-dark-900">
                      {new Date(apt.date).getDate()}
                    </span>
                    <span className="text-xs text-gray-600">
                      {new Date(apt.date).toLocaleDateString('pt-BR', { month: 'short' })}
                    </span>
                    <span className="text-xs font-medium text-primary-600 mt-1">
                      {apt.startTime}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-dark-900">{apt.title}</h3>
                    {apt.description && (
                      <p className="text-sm text-gray-600 mt-1">{apt.description}</p>
                    )}
                    {apt.location && (
                      <div className="flex items-center gap-1 mt-2 text-sm text-gray-500">
                        <MapPinIcon className="h-4 w-4" />
                        {apt.location}
                      </div>
                    )}
                    {apt.case && (
                      <div className="mt-2 text-sm text-primary-600">
                        {apt.case.caseNumber} - {apt.case.title}
                      </div>
                    )}
                    <span className="inline-block mt-2 px-2 py-1 text-xs font-medium rounded bg-primary-100 text-primary-800">
                      {typeLabels[apt.type]}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditModal(apt)}
                    title="Editar"
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(apt.id)}
                    title="Excluir"
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Criação/Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-dark-900">
                  {selectedAppointment ? 'Editar Compromisso' : 'Novo Compromisso'}
                </h2>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedAppointment(null);
                    reset();
                  }}
                  title="Fechar"
                  aria-label="Fechar modal"
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label htmlFor="apt-title" className="block text-sm font-medium text-gray-700 mb-1">
                    Título *
                  </label>
                  <input
                    id="apt-title"
                    {...register('title', { required: 'Título é obrigatório' })}
                    className="input-field"
                    placeholder="Ex: Reunião com cliente"
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="apt-description" className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    id="apt-description"
                    {...register('description')}
                    rows={3}
                    className="input-field"
                    placeholder="Detalhes do compromisso..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="apt-type" className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo *
                    </label>
                    <select
                      id="apt-type"
                      {...register('type', { required: true })}
                      className="input-field"
                    >
                      <option value="REUNIAO">Reunião</option>
                      <option value="AUDIENCIA">Audiência</option>
                      <option value="PRAZO">Prazo</option>
                      <option value="OUTRO">Outro</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="apt-date" className="block text-sm font-medium text-gray-700 mb-1">
                      Data *
                    </label>
                    <input
                      id="apt-date"
                      type="date"
                      {...register('date', { required: 'Data é obrigatória' })}
                      className="input-field"
                    />
                    {errors.date && (
                      <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="apt-start" className="block text-sm font-medium text-gray-700 mb-1">
                      Hora Início *
                    </label>
                    <input
                      id="apt-start"
                      type="time"
                      {...register('startTime', { required: 'Hora de início é obrigatória' })}
                      className="input-field"
                    />
                    {errors.startTime && (
                      <p className="text-red-500 text-sm mt-1">{errors.startTime.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="apt-end" className="block text-sm font-medium text-gray-700 mb-1">
                      Hora Fim *
                    </label>
                    <input
                      id="apt-end"
                      type="time"
                      {...register('endTime', { required: 'Hora de fim é obrigatória' })}
                      className="input-field"
                    />
                    {errors.endTime && (
                      <p className="text-red-500 text-sm mt-1">{errors.endTime.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="apt-location" className="block text-sm font-medium text-gray-700 mb-1">
                    Local
                  </label>
                  <input
                    id="apt-location"
                    {...register('location')}
                    className="input-field"
                    placeholder="Ex: Sala 201, Fórum Central"
                  />
                </div>

                <div>
                  <label htmlFor="apt-case" className="block text-sm font-medium text-gray-700 mb-1">
                    Vincular a Processo (opcional)
                  </label>
                  <select
                    id="apt-case"
                    {...register('caseId')}
                    className="input-field"
                  >
                    <option value="">Nenhum processo</option>
                    {cases.map((c: any) => (
                      <option key={c.id} value={c.id}>
                        {c.caseNumber} - {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      setSelectedAppointment(null);
                      reset();
                    }}
                    className="btn bg-gray-200 text-gray-700 hover:bg-gray-300 flex-1"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="btn btn-primary flex-1"
                  >
                    {createMutation.isPending || updateMutation.isPending
                      ? 'Salvando...'
                      : selectedAppointment
                      ? 'Atualizar'
                      : 'Criar Compromisso'}
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
