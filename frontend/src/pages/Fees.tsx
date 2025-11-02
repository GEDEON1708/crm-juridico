import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import api from '../lib/axios';
import {
  BanknotesIcon,
  PlusIcon,
  XMarkIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';

interface Fee {
  id: string;
  description: string;
  amount: number;
  dueDate: string;
  paidDate: string | null;
  status: 'PENDENTE' | 'PAGO' | 'ATRASADO' | 'CANCELADO';
  type: string;
  caseId: string;
  createdAt: string;
  case: {
    id: string;
    caseNumber: string;
    title: string;
    client: {
      id: string;
      name: string;
    };
  };
}

interface FeeStats {
  totalPendente: number;
  totalPago: number;
  totalAtrasado: number;
  valorPendente: number;
  valorPago: number;
  valorAtrasado: number;
}

export default function Fees() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<Fee | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    dueDate: '',
    type: 'HONORARIO',
    caseId: '',
  });

  const queryClient = useQueryClient();

  const { data: fees } = useQuery<Fee[]>({
    queryKey: ['fees', statusFilter, typeFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (typeFilter) params.append('type', typeFilter);
      const res = await api.get(`/fees?${params.toString()}`);
      return res.data.data;
    },
  });

  const { data: stats } = useQuery<FeeStats>({
    queryKey: ['fee-stats'],
    queryFn: async () => {
      const res = await api.get('/fees/stats');
      return res.data.data;
    },
  });

  const { data: cases } = useQuery({
    queryKey: ['cases'],
    queryFn: async () => {
      const res = await api.get('/cases');
      return res.data.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/fees', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fees'] });
      queryClient.invalidateQueries({ queryKey: ['fee-stats'] });
      toast.success('Honorário criado com sucesso!');
      closeModal();
    },
    onError: () => toast.error('Erro ao criar honorário'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.put(`/fees/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fees'] });
      queryClient.invalidateQueries({ queryKey: ['fee-stats'] });
      toast.success('Honorário atualizado com sucesso!');
      closeModal();
    },
    onError: () => toast.error('Erro ao atualizar honorário'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/fees/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fees'] });
      queryClient.invalidateQueries({ queryKey: ['fee-stats'] });
      toast.success('Honorário excluído com sucesso!');
    },
    onError: () => toast.error('Erro ao excluir honorário'),
  });

  const markAsPaidMutation = useMutation({
    mutationFn: (id: string) =>
      api.put(`/fees/${id}`, {
        status: 'PAGO',
        paidDate: new Date().toISOString(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fees'] });
      queryClient.invalidateQueries({ queryKey: ['fee-stats'] });
      toast.success('Honorário marcado como pago!');
    },
    onError: () => toast.error('Erro ao marcar como pago'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.amount || !formData.dueDate || !formData.caseId) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    if (editingFee) {
      updateMutation.mutate({ id: editingFee.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (fee: Fee) => {
    setEditingFee(fee);
    setFormData({
      description: fee.description,
      amount: fee.amount.toString(),
      dueDate: fee.dueDate.split('T')[0],
      type: fee.type,
      caseId: fee.caseId,
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este honorário?')) {
      deleteMutation.mutate(id);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingFee(null);
    setFormData({
      description: '',
      amount: '',
      dueDate: '',
      type: 'HONORARIO',
      caseId: '',
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PAGO':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDENTE':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ATRASADO':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'CANCELADO':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PAGO':
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />;
      case 'ATRASADO':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-600" />;
      case 'PENDENTE':
        return <ClockIcon className="h-5 w-5 text-yellow-600" />;
      default:
        return <ClockIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  const statusLabels: Record<string, string> = {
    PENDENTE: 'Pendente',
    PAGO: 'Pago',
    ATRASADO: 'Atrasado',
    CANCELADO: 'Cancelado',
  };

  const typeLabels: Record<string, string> = {
    HONORARIO: 'Honorário',
    CUSTAS: 'Custas Processuais',
    PERICIA: 'Perícia',
    PUBLICACAO: 'Publicação',
    OUTROS: 'Outros',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark-900">Honorários</h1>
          <p className="text-gray-600 mt-1">Gestão de honorários e faturamento</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          Novo Honorário
        </button>
      </div>

      {/* Cards de Estatísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pendentes</p>
                <p className="text-2xl font-bold text-dark-900 mt-1">{stats.totalPendente}</p>
                <p className="text-sm text-gray-500 mt-2">{formatCurrency(stats.valorPendente)}</p>
              </div>
              <ClockIcon className="h-12 w-12 text-yellow-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Pagos</p>
                <p className="text-2xl font-bold text-dark-900 mt-1">{stats.totalPago}</p>
                <p className="text-sm text-gray-500 mt-2">{formatCurrency(stats.valorPago)}</p>
              </div>
              <CheckCircleIcon className="h-12 w-12 text-green-500" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Atrasados</p>
                <p className="text-2xl font-bold text-dark-900 mt-1">{stats.totalAtrasado}</p>
                <p className="text-sm text-gray-500 mt-2">{formatCurrency(stats.valorAtrasado)}</p>
              </div>
              <ExclamationTriangleIcon className="h-12 w-12 text-red-500" />
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Filtrar por Status
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Todos os status</option>
              <option value="PENDENTE">Pendente</option>
              <option value="PAGO">Pago</option>
              <option value="ATRASADO">Atrasado</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
          </div>

          <div>
            <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 mb-1">
              Filtrar por Tipo
            </label>
            <select
              id="type-filter"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">Todos os tipos</option>
              <option value="HONORARIO">Honorário</option>
              <option value="CUSTAS">Custas Processuais</option>
              <option value="PERICIA">Perícia</option>
              <option value="PUBLICACAO">Publicação</option>
              <option value="OUTROS">Outros</option>
            </select>
          </div>
        </div>
      </div>

      {/* Lista de Honorários */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Descrição
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Processo/Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vencimento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {fees && fees.length > 0 ? (
                fees.map((fee) => (
                  <tr key={fee.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(fee.status)}
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(
                            fee.status
                          )}`}
                        >
                          {statusLabels[fee.status]}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-dark-900">{fee.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-dark-900">{fee.case.caseNumber}</div>
                      <div className="text-xs text-gray-500">{fee.case.client.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{typeLabels[fee.type] || fee.type}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-dark-900">{formatCurrency(fee.amount)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {new Date(fee.dueDate).toLocaleDateString('pt-BR')}
                      </span>
                      {fee.paidDate && (
                        <div className="text-xs text-gray-500">
                          Pago: {new Date(fee.paidDate).toLocaleDateString('pt-BR')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        {fee.status !== 'PAGO' && (
                          <button
                            onClick={() => markAsPaidMutation.mutate(fee.id)}
                            className="text-green-600 hover:text-green-900"
                            title="Marcar como pago"
                          >
                            Pagar
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(fee)}
                          className="text-primary-600 hover:text-primary-900"
                          title="Editar"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(fee.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Excluir"
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <BanknotesIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>Nenhum honorário encontrado</p>
                    <button
                      onClick={() => setIsModalOpen(true)}
                      className="mt-4 text-primary-600 hover:text-primary-900"
                    >
                      Cadastrar primeiro honorário
                    </button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Criar/Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-dark-900">
                  {editingFee ? 'Editar Honorário' : 'Novo Honorário'}
                </h2>
                <button
                  onClick={closeModal}
                  title="Fechar"
                  aria-label="Fechar modal"
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="fee-description" className="block text-sm font-medium text-gray-700 mb-1">
                    Descrição *
                  </label>
                  <input
                    id="fee-description"
                    type="text"
                    required
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Ex: Honorários advocatícios contratuais"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="fee-amount" className="block text-sm font-medium text-gray-700 mb-1">
                      Valor (R$) *
                    </label>
                    <input
                      id="fee-amount"
                      type="number"
                      step="0.01"
                      required
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>

                  <div>
                    <label htmlFor="fee-dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                      Vencimento *
                    </label>
                    <input
                      id="fee-dueDate"
                      type="date"
                      required
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="fee-type" className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo *
                  </label>
                  <select
                    id="fee-type"
                    required
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="HONORARIO">Honorário</option>
                    <option value="CUSTAS">Custas Processuais</option>
                    <option value="PERICIA">Perícia</option>
                    <option value="PUBLICACAO">Publicação</option>
                    <option value="OUTROS">Outros</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="fee-case" className="block text-sm font-medium text-gray-700 mb-1">
                    Processo *
                  </label>
                  <select
                    id="fee-case"
                    required
                    value={formData.caseId}
                    onChange={(e) => setFormData({ ...formData, caseId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Selecione um processo</option>
                    {cases?.map((c: any) => (
                      <option key={c.id} value={c.id}>
                        {c.caseNumber} - {c.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    {editingFee ? 'Atualizar' : 'Criar'} Honorário
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
