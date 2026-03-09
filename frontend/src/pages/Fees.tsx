import { useMemo, useState } from 'react';
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
  ChartPieIcon,
} from '@heroicons/react/24/outline';
import { Line, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { useUIStore } from '../store/uiStore';

ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

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

interface CaseItem {
  id: string;
  caseNumber: string;
  title: string;
}

interface FeeStats {
  totalPendente: number;
  totalPago: number;
  totalAtrasado: number;
  valorPendente: number;
  valorPago: number;
  valorAtrasado: number;
}

const statusLabels: Record<Fee['status'], string> = {
  PENDENTE: 'Pendente',
  PAGO: 'Pago',
  ATRASADO: 'Atrasado',
  CANCELADO: 'Cancelado',
};

const typeLabels: Record<string, string> = {
  HONORARIO: 'Honorario',
  CUSTAS: 'Custas processuais',
  PERICIA: 'Pericia',
  PUBLICACAO: 'Publicacao',
  OUTROS: 'Outros',
};

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

  const theme = useUIStore((state) => state.theme);
  const queryClient = useQueryClient();

  const { data: fees = [] } = useQuery<Fee[]>({
    queryKey: ['fees', statusFilter, typeFilter],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      if (typeFilter) params.append('type', typeFilter);
      const suffix = params.toString();
      const url = suffix ? `/fees?${suffix}` : '/fees';
      const res = await api.get(url);
      return res.data.data || [];
    },
  });

  const { data: allFees = [] } = useQuery<Fee[]>({
    queryKey: ['fees-chart-data'],
    queryFn: async () => {
      const res = await api.get('/fees');
      return res.data.data || [];
    },
  });

  const { data: stats } = useQuery<FeeStats>({
    queryKey: ['fee-stats'],
    queryFn: async () => {
      const res = await api.get('/fees/stats');
      return res.data.data;
    },
  });

  const { data: cases = [] } = useQuery<CaseItem[]>({
    queryKey: ['cases-for-fees'],
    queryFn: async () => {
      const res = await api.get('/cases?limit=200');
      return res.data.data?.cases || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post('/fees', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fees'] });
      queryClient.invalidateQueries({ queryKey: ['fees-chart-data'] });
      queryClient.invalidateQueries({ queryKey: ['fee-stats'] });
      toast.success('Honorario criado com sucesso');
      closeModal();
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'Erro ao criar honorario'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.put(`/fees/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fees'] });
      queryClient.invalidateQueries({ queryKey: ['fees-chart-data'] });
      queryClient.invalidateQueries({ queryKey: ['fee-stats'] });
      toast.success('Honorario atualizado com sucesso');
      closeModal();
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'Erro ao atualizar honorario'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/fees/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fees'] });
      queryClient.invalidateQueries({ queryKey: ['fees-chart-data'] });
      queryClient.invalidateQueries({ queryKey: ['fee-stats'] });
      toast.success('Honorario excluido com sucesso');
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'Erro ao excluir honorario'),
  });

  const markAsPaidMutation = useMutation({
    mutationFn: (id: string) =>
      api.put(`/fees/${id}`, {
        status: 'PAGO',
        paidDate: new Date().toISOString(),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['fees'] });
      queryClient.invalidateQueries({ queryKey: ['fees-chart-data'] });
      queryClient.invalidateQueries({ queryKey: ['fee-stats'] });
      toast.success('Honorario marcado como pago');
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'Erro ao marcar como pago'),
  });

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.description || !formData.amount || !formData.dueDate || !formData.caseId) {
      toast.error('Preencha os campos obrigatorios');
      return;
    }

    if (Number(formData.amount) <= 0) {
      toast.error('Informe um valor maior que zero');
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
    if (window.confirm('Tem certeza que deseja excluir este honorario?')) {
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

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);

  const getStatusColor = (status: Fee['status']) => {
    if (status === 'PAGO') return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-900/40';
    if (status === 'PENDENTE') return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/40 dark:text-yellow-300 dark:border-yellow-900/40';
    if (status === 'ATRASADO') return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-900/40';
    return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:border-dark-600';
  };

  const getStatusIcon = (status: Fee['status']) => {
    if (status === 'PAGO') return <CheckCircleIcon className="h-5 w-5 text-green-600 dark:text-green-300" />;
    if (status === 'ATRASADO') return <ExclamationTriangleIcon className="h-5 w-5 text-red-600 dark:text-red-300" />;
    return <ClockIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-300" />;
  };

  const pieData = useMemo(() => {
    const counts = {
      PENDENTE: 0,
      PAGO: 0,
      ATRASADO: 0,
      CANCELADO: 0,
    };

    allFees.forEach((fee) => {
      counts[fee.status] += 1;
    });

    return {
      labels: ['Pago', 'Pendente', 'Atrasado', 'Cancelado'],
      datasets: [
        {
          data: [counts.PAGO, counts.PENDENTE, counts.ATRASADO, counts.CANCELADO],
          backgroundColor: ['#10b981', '#f59e0b', '#ef4444', '#64748b'],
          borderWidth: 0,
        },
      ],
    };
  }, [allFees]);

  const lineData = useMemo(() => {
    const now = new Date();
    const monthKeys: string[] = [];
    const monthLabels: string[] = [];

    for (let index = 5; index >= 0; index -= 1) {
      const cursor = new Date(now.getFullYear(), now.getMonth() - index, 1);
      const key = `${cursor.getFullYear()}-${(cursor.getMonth() + 1).toString().padStart(2, '0')}`;
      monthKeys.push(key);
      monthLabels.push(
        cursor.toLocaleDateString('pt-BR', {
          month: 'short',
          year: '2-digit',
        })
      );
    }

    const paidValues = monthKeys.map(() => 0);
    const pendingValues = monthKeys.map(() => 0);
    const overdueValues = monthKeys.map(() => 0);

    allFees.forEach((fee) => {
      const dateRef = new Date(fee.paidDate || fee.dueDate);
      const key = `${dateRef.getFullYear()}-${(dateRef.getMonth() + 1).toString().padStart(2, '0')}`;
      const index = monthKeys.indexOf(key);
      if (index === -1) return;

      if (fee.status === 'PAGO') paidValues[index] += fee.amount;
      if (fee.status === 'PENDENTE') pendingValues[index] += fee.amount;
      if (fee.status === 'ATRASADO') overdueValues[index] += fee.amount;
    });

    return {
      labels: monthLabels,
      datasets: [
        {
          label: 'Pago',
          data: paidValues,
          borderColor: '#10b981',
          backgroundColor: 'rgba(16,185,129,0.2)',
          tension: 0.35,
        },
        {
          label: 'Pendente',
          data: pendingValues,
          borderColor: '#f59e0b',
          backgroundColor: 'rgba(245,158,11,0.2)',
          tension: 0.35,
        },
        {
          label: 'Atrasado',
          data: overdueValues,
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239,68,68,0.2)',
          tension: 0.35,
        },
      ],
    };
  }, [allFees]);

  const chartTextColor = theme === 'dark' ? '#e2e8f0' : '#334155';

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: chartTextColor },
      },
    },
    scales: {
      x: {
        ticks: { color: chartTextColor },
        grid: { color: theme === 'dark' ? '#334155' : '#e2e8f0' },
      },
      y: {
        ticks: {
          color: chartTextColor,
          callback: (value: any) => `R$ ${Number(value).toLocaleString('pt-BR')}`,
        },
        grid: { color: theme === 'dark' ? '#334155' : '#e2e8f0' },
      },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: chartTextColor },
      },
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark-900 dark:text-gray-100">Honorarios</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Visualize e gerencie honorarios por status e por periodo</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          Novo honorario
        </button>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">Pendentes</p>
                <p className="text-2xl font-bold text-dark-900 dark:text-gray-100 mt-1">{stats.totalPendente}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{formatCurrency(stats.valorPendente)}</p>
              </div>
              <ClockIcon className="h-12 w-12 text-yellow-500" />
            </div>
          </div>

          <div className="card border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">Pagos</p>
                <p className="text-2xl font-bold text-dark-900 dark:text-gray-100 mt-1">{stats.totalPago}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{formatCurrency(stats.valorPago)}</p>
              </div>
              <CheckCircleIcon className="h-12 w-12 text-green-500" />
            </div>
          </div>

          <div className="card border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 dark:text-gray-300 text-sm font-medium">Atrasados</p>
                <p className="text-2xl font-bold text-dark-900 dark:text-gray-100 mt-1">{stats.totalAtrasado}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{formatCurrency(stats.valorAtrasado)}</p>
              </div>
              <ExclamationTriangleIcon className="h-12 w-12 text-red-500" />
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="card xl:col-span-2">
          <h2 className="text-lg font-semibold text-dark-900 dark:text-gray-100 mb-4">Evolucao por mes</h2>
          <div className="h-72">
            <Line data={lineData} options={lineOptions} />
          </div>
        </div>
        <div className="card">
          <h2 className="text-lg font-semibold text-dark-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <ChartPieIcon className="h-5 w-5" />
            Distribuicao por status
          </h2>
          <div className="h-72">
            <Pie data={pieData} options={pieOptions} />
          </div>
        </div>
      </div>

      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Filtrar por status
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field"
            >
              <option value="">Todos os status</option>
              <option value="PENDENTE">Pendente</option>
              <option value="PAGO">Pago</option>
              <option value="ATRASADO">Atrasado</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
          </div>

          <div>
            <label htmlFor="type-filter" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
              Filtrar por tipo
            </label>
            <select
              id="type-filter"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="input-field"
            >
              <option value="">Todos os tipos</option>
              <option value="HONORARIO">Honorario</option>
              <option value="CUSTAS">Custas</option>
              <option value="PERICIA">Pericia</option>
              <option value="PUBLICACAO">Publicacao</option>
              <option value="OUTROS">Outros</option>
            </select>
          </div>
        </div>
      </div>

      <div className="card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[840px]">
            <thead className="bg-gray-50 dark:bg-dark-700 border-b border-gray-200 dark:border-dark-600">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Descricao
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Processo / Cliente
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Tipo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Vencimento
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Acoes
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-dark-800 divide-y divide-gray-200 dark:divide-dark-700">
              {fees.length > 0 ? (
                fees.map((fee) => (
                  <tr key={fee.id} className="hover:bg-gray-50 dark:hover:bg-dark-700/60">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(fee.status)}
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatusColor(fee.status)}`}>
                          {statusLabels[fee.status]}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-dark-900 dark:text-gray-100">{fee.description}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-dark-900 dark:text-gray-100">{fee.case.caseNumber}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{fee.case.client.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-700 dark:text-gray-200">{typeLabels[fee.type] || fee.type}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-dark-900 dark:text-gray-100">{formatCurrency(fee.amount)}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                      {new Date(fee.dueDate).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        {fee.status !== 'PAGO' && fee.status !== 'CANCELADO' && (
                          <button
                            onClick={() => markAsPaidMutation.mutate(fee.id)}
                            className="text-green-600 hover:text-green-700 text-sm font-medium"
                          >
                            Marcar pago
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(fee)}
                          className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(fee.id)}
                          className="text-red-600 hover:text-red-700 text-sm font-medium"
                        >
                          Excluir
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500 dark:text-gray-300">
                    Nenhum honorario encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-xl w-full max-w-2xl border border-gray-200 dark:border-dark-700">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-dark-900 dark:text-gray-100">
                  {editingFee ? 'Editar honorario' : 'Novo honorario'}
                </h2>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
                  title="Fechar"
                  aria-label="Fechar modal"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="fee-description" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Descricao *
                  </label>
                  <input
                    id="fee-description"
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="fee-amount" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                      Valor *
                    </label>
                    <input
                      id="fee-amount"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="fee-due-date" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                      Vencimento *
                    </label>
                    <input
                      id="fee-due-date"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="fee-type" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                      Tipo *
                    </label>
                    <select
                      id="fee-type"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="input-field"
                      required
                    >
                      <option value="HONORARIO">Honorario</option>
                      <option value="CUSTAS">Custas</option>
                      <option value="PERICIA">Pericia</option>
                      <option value="PUBLICACAO">Publicacao</option>
                      <option value="OUTROS">Outros</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="fee-case" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                      Processo *
                    </label>
                    <select
                      id="fee-case"
                      value={formData.caseId}
                      onChange={(e) => setFormData({ ...formData, caseId: e.target.value })}
                      className="input-field"
                      required
                    >
                      <option value="">Selecione um processo</option>
                      {cases.map((caseItem) => (
                        <option key={caseItem.id} value={caseItem.id}>
                          {caseItem.caseNumber} - {caseItem.title}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button type="button" onClick={closeModal} className="btn btn-secondary">
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="btn btn-primary inline-flex items-center gap-2"
                  >
                    <BanknotesIcon className="h-5 w-5" />
                    {createMutation.isPending || updateMutation.isPending
                      ? 'Salvando...'
                      : editingFee
                        ? 'Atualizar'
                        : 'Cadastrar'}
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
