import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { useForm } from 'react-hook-form';
import api from '../lib/axios';
import { 
  ClockIcon, 
  PlusIcon,
  XMarkIcon,
  TrashIcon,
  PencilIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  BellAlertIcon
} from '@heroicons/react/24/outline';

interface Deadline {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  priority: 'BAIXA' | 'MEDIA' | 'ALTA' | 'URGENTE';
  status: 'PENDENTE' | 'CONCLUIDO' | 'ATRASADO';
  caseId?: string;
  case?: {
    caseNumber: string;
    title: string;
  };
  completedAt?: string;
}

interface DeadlineForm {
  title: string;
  description?: string;
  dueDate: string;
  priority: string;
  caseId?: string;
}

export default function Deadlines() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDeadline, setSelectedDeadline] = useState<Deadline | null>(null);
  const [filterPriority, setFilterPriority] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<DeadlineForm>();

  // Buscar prazos
  const { data: deadlines = [], isLoading } = useQuery({
    queryKey: ['deadlines', filterPriority, filterStatus],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filterPriority) params.append('priority', filterPriority);
      if (filterStatus) params.append('status', filterStatus);
      
      const response = await api.get(`/deadlines?${params.toString()}`);
      return response.data.data || [];
    }
  });

  // Buscar casos
  const { data: cases = [] } = useQuery({
    queryKey: ['cases-list'],
    queryFn: async () => {
      const response = await api.get('/cases?limit=100');
      return response.data.data?.cases || [];
    }
  });

  // Criar prazo
  const createMutation = useMutation({
    mutationFn: async (data: DeadlineForm) => {
      return await api.post('/deadlines', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deadlines'] });
      toast.success('Prazo criado com sucesso!');
      setIsModalOpen(false);
      reset();
    },
    onError: () => {
      toast.error('Erro ao criar prazo');
    }
  });

  // Atualizar prazo
  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<DeadlineForm> }) => {
      return await api.put(`/deadlines/${id}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deadlines'] });
      toast.success('Prazo atualizado com sucesso!');
      setIsModalOpen(false);
      setSelectedDeadline(null);
      reset();
    },
    onError: () => {
      toast.error('Erro ao atualizar prazo');
    }
  });

  // Deletar prazo
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await api.delete(`/deadlines/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deadlines'] });
      toast.success('Prazo excluído com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao excluir prazo');
    }
  });

  // Marcar como concluído
  const completeMutation = useMutation({
    mutationFn: async (id: string) => {
      return await api.put(`/deadlines/${id}`, { status: 'CONCLUIDO', completedAt: new Date().toISOString() });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deadlines'] });
      toast.success('Prazo marcado como concluído!');
    }
  });

  const onSubmit = (data: DeadlineForm) => {
    if (selectedDeadline) {
      updateMutation.mutate({ id: selectedDeadline.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const openCreateModal = () => {
    setSelectedDeadline(null);
    reset({
      dueDate: new Date().toISOString().split('T')[0],
      priority: 'MEDIA'
    });
    setIsModalOpen(true);
  };

  const openEditModal = (deadline: Deadline) => {
    setSelectedDeadline(deadline);
    reset({
      title: deadline.title,
      description: deadline.description || '',
      dueDate: deadline.dueDate.split('T')[0],
      priority: deadline.priority,
      caseId: deadline.caseId || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Deseja realmente excluir este prazo?')) {
      deleteMutation.mutate(id);
    }
  };

  const getDaysUntilDeadline = (dueDate: string) => {
    const today = new Date();
    const deadline = new Date(dueDate);
    const diffTime = deadline.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getUrgencyColor = (deadline: Deadline) => {
    if (deadline.status === 'CONCLUIDO') return 'border-green-300 bg-green-50';
    if (deadline.status === 'ATRASADO') return 'border-red-300 bg-red-50';
    
    const days = getDaysUntilDeadline(deadline.dueDate);
    if (days < 0) return 'border-red-300 bg-red-50';
    if (days <= 3) return 'border-orange-300 bg-orange-50';
    if (days <= 7) return 'border-yellow-300 bg-yellow-50';
    return 'border-gray-200 bg-white';
  };

  const filteredDeadlines = deadlines;

  const urgentDeadlines = deadlines.filter((d: Deadline) => {
    const days = getDaysUntilDeadline(d.dueDate);
    return days >= 0 && days <= 7 && d.status === 'PENDENTE';
  }).length;

  const overdueDeadlines = deadlines.filter((d: Deadline) => 
    d.status === 'ATRASADO' || getDaysUntilDeadline(d.dueDate) < 0 && d.status === 'PENDENTE'
  ).length;

  const completedDeadlines = deadlines.filter((d: Deadline) => d.status === 'CONCLUIDO').length;

  const priorityLabels: Record<string, string> = {
    BAIXA: 'Baixa',
    MEDIA: 'Média',
    ALTA: 'Alta',
    URGENTE: 'Urgente'
  };

  const priorityColors: Record<string, string> = {
    BAIXA: 'bg-gray-100 text-gray-800',
    MEDIA: 'bg-blue-100 text-blue-800',
    ALTA: 'bg-orange-100 text-orange-800',
    URGENTE: 'bg-red-100 text-red-800'
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
          <h1 className="text-3xl font-bold text-dark-900">Prazos Judiciais</h1>
          <p className="text-gray-600 mt-1">Controle rigoroso dos prazos processuais</p>
        </div>
        <button onClick={openCreateModal} className="btn btn-primary">
          <PlusIcon className="h-5 w-5 mr-2" />
          Novo Prazo
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Urgentes (próx. 7 dias)</p>
              <p className="text-3xl font-bold mt-2">{urgentDeadlines}</p>
            </div>
            <BellAlertIcon className="h-12 w-12 text-orange-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-100">Atrasados</p>
              <p className="text-3xl font-bold mt-2">{overdueDeadlines}</p>
            </div>
            <ExclamationTriangleIcon className="h-12 w-12 text-red-200" />
          </div>
        </div>

        <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Concluídos</p>
              <p className="text-3xl font-bold mt-2">{completedDeadlines}</p>
            </div>
            <CheckCircleIcon className="h-12 w-12 text-green-200" />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="card">
        <div className="flex gap-4">
          <div className="flex-1">
            <label htmlFor="filter-priority" className="block text-sm font-medium text-gray-700 mb-2">
              Filtrar por Prioridade
            </label>
            <select
              id="filter-priority"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="input-field"
            >
              <option value="">Todas as Prioridades</option>
              <option value="BAIXA">Baixa</option>
              <option value="MEDIA">Média</option>
              <option value="ALTA">Alta</option>
              <option value="URGENTE">Urgente</option>
            </select>
          </div>
          <div className="flex-1">
            <label htmlFor="filter-status" className="block text-sm font-medium text-gray-700 mb-2">
              Filtrar por Status
            </label>
            <select
              id="filter-status"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input-field"
            >
              <option value="">Todos os Status</option>
              <option value="PENDENTE">Pendente</option>
              <option value="CONCLUIDO">Concluído</option>
              <option value="ATRASADO">Atrasado</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Prazos */}
      <div className="card">
        <h2 className="text-xl font-semibold mb-4">Todos os Prazos</h2>
        {filteredDeadlines.length === 0 ? (
          <div className="text-center py-12">
            <ClockIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum prazo cadastrado</p>
            <button onClick={openCreateModal} className="btn btn-primary mt-4">
              Cadastrar Primeiro Prazo
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDeadlines.map((deadline: Deadline) => {
              const daysUntil = getDaysUntilDeadline(deadline.dueDate);
              const isOverdue = daysUntil < 0 && deadline.status === 'PENDENTE';
              
              return (
                <div 
                  key={deadline.id} 
                  className={`flex items-center justify-between p-4 border-2 rounded-lg ${getUrgencyColor(deadline)}`}
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div className="flex flex-col items-center bg-white rounded-lg px-3 py-2 min-w-[90px] border border-gray-200">
                      <span className="text-2xl font-bold text-dark-900">
                        {new Date(deadline.dueDate).getDate()}
                      </span>
                      <span className="text-xs text-gray-600">
                        {new Date(deadline.dueDate).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}
                      </span>
                      {deadline.status === 'PENDENTE' && (
                        <span className={`text-xs font-bold mt-1 ${
                          isOverdue ? 'text-red-600' : 
                          daysUntil <= 3 ? 'text-orange-600' : 
                          daysUntil <= 7 ? 'text-yellow-600' : 
                          'text-green-600'
                        }`}>
                          {isOverdue ? `${Math.abs(daysUntil)} dias atrasado` : 
                           daysUntil === 0 ? 'Hoje!' : 
                           daysUntil === 1 ? 'Amanhã' : 
                           `${daysUntil} dias`}
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-dark-900">{deadline.title}</h3>
                        {isOverdue && (
                          <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                      {deadline.description && (
                        <p className="text-sm text-gray-600 mt-1">{deadline.description}</p>
                      )}
                      {deadline.case && (
                        <div className="mt-2 text-sm text-primary-600">
                          Processo: {deadline.case.caseNumber} - {deadline.case.title}
                        </div>
                      )}
                      <div className="flex gap-2 mt-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${priorityColors[deadline.priority]}`}>
                          {priorityLabels[deadline.priority]}
                        </span>
                        {deadline.status === 'CONCLUIDO' && (
                          <span className="px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-800">
                            ✓ Concluído
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {deadline.status === 'PENDENTE' && (
                      <button
                        onClick={() => completeMutation.mutate(deadline.id)}
                        title="Marcar como concluído"
                        className="p-2 text-green-600 hover:bg-green-100 rounded-lg"
                      >
                        <CheckCircleIcon className="h-5 w-5" />
                      </button>
                    )}
                    <button
                      onClick={() => openEditModal(deadline)}
                      title="Editar"
                      className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                    >
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(deadline.id)}
                      title="Excluir"
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Criação/Edição */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-dark-900">
                  {selectedDeadline ? 'Editar Prazo' : 'Novo Prazo'}
                </h2>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedDeadline(null);
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
                  <label htmlFor="deadline-title" className="block text-sm font-medium text-gray-700 mb-1">
                    Título do Prazo *
                  </label>
                  <input
                    id="deadline-title"
                    {...register('title', { required: 'Título é obrigatório' })}
                    className="input-field"
                    placeholder="Ex: Contestação - Processo XYZ"
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="deadline-description" className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição
                  </label>
                  <textarea
                    id="deadline-description"
                    {...register('description')}
                    rows={3}
                    className="input-field"
                    placeholder="Detalhes do prazo processual..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="deadline-date" className="block text-sm font-medium text-gray-700 mb-1">
                      Data do Vencimento *
                    </label>
                    <input
                      id="deadline-date"
                      type="date"
                      {...register('dueDate', { required: 'Data é obrigatória' })}
                      className="input-field"
                    />
                    {errors.dueDate && (
                      <p className="text-red-500 text-sm mt-1">{errors.dueDate.message}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="deadline-priority" className="block text-sm font-medium text-gray-700 mb-1">
                      Prioridade *
                    </label>
                    <select
                      id="deadline-priority"
                      {...register('priority', { required: true })}
                      className="input-field"
                    >
                      <option value="BAIXA">Baixa</option>
                      <option value="MEDIA">Média</option>
                      <option value="ALTA">Alta</option>
                      <option value="URGENTE">Urgente</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="deadline-case" className="block text-sm font-medium text-gray-700 mb-1">
                    Vincular a Processo (opcional)
                  </label>
                  <select
                    id="deadline-case"
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
                      setSelectedDeadline(null);
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
                      : selectedDeadline
                      ? 'Atualizar'
                      : 'Criar Prazo'}
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
