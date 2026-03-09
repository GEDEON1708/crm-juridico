import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';
import { useUIStore } from '../store/uiStore';
import {
  BriefcaseIcon,
  UsersIcon,
  ClockIcon,
  CalendarIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

export default function Dashboard() {
  const theme = useUIStore((state) => state.theme);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await api.get('/dashboard/stats');
      return res.data.data;
    },
    retry: 1,
    staleTime: 30000,
  });

  const { data: clientsData, isLoading: clientsLoading } = useQuery({
    queryKey: ['dashboard-clients'],
    queryFn: async () => {
      const res = await api.get('/clients?limit=10');
      return res.data.data;
    },
    retry: 1,
    staleTime: 30000,
  });

  const clients = clientsData?.clients || [];

  const { data: caseTypeDistribution, isLoading: casesLoading } = useQuery({
    queryKey: ['case-type-distribution'],
    queryFn: async () => {
      const res = await api.get('/dashboard/case-type-distribution');
      return res.data.data;
    },
    retry: 1,
    staleTime: 60000,
  });

  const { data: monthlyActivity, isLoading: activityLoading } = useQuery({
    queryKey: ['monthly-activity'],
    queryFn: async () => {
      const res = await api.get('/dashboard/monthly-activity');
      return res.data.data;
    },
    retry: 1,
    staleTime: 60000,
  });

  const { data: deadlines, isLoading: deadlinesLoading } = useQuery({
    queryKey: ['upcoming-deadlines'],
    queryFn: async () => {
      const res = await api.get('/deadlines?limit=5');
      return res.data.data;
    },
    retry: 1,
    staleTime: 30000,
  });

  const isLoading = statsLoading || clientsLoading || casesLoading || activityLoading || deadlinesLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto" />
          <p className="mt-4 text-gray-600 dark:text-gray-300">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  const statsCards = [
    { name: 'Processos ativos', value: stats?.activeCases || 0, icon: BriefcaseIcon, color: 'bg-blue-500' },
    { name: 'Total de clientes', value: stats?.totalClients || 0, icon: UsersIcon, color: 'bg-green-500' },
    { name: 'Prazos pendentes', value: stats?.pendingDeadlines || 0, icon: ClockIcon, color: 'bg-yellow-500' },
    { name: 'Audiencias proximas', value: stats?.upcomingHearings || 0, icon: CalendarIcon, color: 'bg-purple-500' },
    {
      name: 'Honorarios pendentes',
      value: `R$ ${(stats?.pendingFees || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      icon: CurrencyDollarIcon,
      color: 'bg-red-500',
    },
    { name: 'Documentos', value: stats?.totalDocuments || 0, icon: DocumentTextIcon, color: 'bg-indigo-500' },
  ];

  const casesByTypeData = {
    labels: caseTypeDistribution?.map((item: any) => item.type) || [],
    datasets: [
      {
        data: caseTypeDistribution?.map((item: any) => item.count) || [],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(107, 114, 128, 0.8)',
        ],
      },
    ],
  };

  const monthlyActivityData = {
    labels: monthlyActivity?.map((item: any) => item.month) || [],
    datasets: [
      {
        label: 'Processos',
        data: monthlyActivity?.map((item: any) => item.cases) || [],
        backgroundColor: 'rgba(59, 130, 246, 0.8)',
      },
      {
        label: 'Audiencias',
        data: monthlyActivity?.map((item: any) => item.hearings) || [],
        backgroundColor: 'rgba(139, 92, 246, 0.8)',
      },
    ],
  };

  const chartTextColor = theme === 'dark' ? '#e2e8f0' : '#334155';

  const doughnutOptions = {
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: {
          color: chartTextColor,
        },
      },
    },
  };

  const barOptions = {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        labels: {
          color: chartTextColor,
        },
      },
    },
    scales: {
      x: {
        ticks: { color: chartTextColor },
        grid: { color: theme === 'dark' ? '#334155' : '#e2e8f0' },
      },
      y: {
        ticks: { color: chartTextColor },
        grid: { color: theme === 'dark' ? '#334155' : '#e2e8f0' },
      },
    },
  };

  const getDaysUntil = (date: string) => {
    const today = new Date();
    const deadline = new Date(date);
    const diff = Math.ceil((deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-3">
          <img src="/logo-mark.svg" alt="CRM Juridico" className="h-10 w-10 rounded-md" />
          <h1 className="text-3xl font-bold text-dark-900 dark:text-gray-100">Dashboard</h1>
        </div>
        <p className="text-gray-600 dark:text-gray-300 mt-1">Visao geral do escritorio</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsCards.map((stat) => (
          <div key={stat.name} className="card flex items-center gap-4">
            <div className={`${stat.color} p-4 rounded-lg`}>
              <stat.icon className="h-8 w-8 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-300">{stat.name}</p>
              <p className="text-2xl font-bold text-dark-900 dark:text-gray-100">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-dark-900 dark:text-gray-100 mb-4">Processos por tipo</h3>
          <div className="h-64 flex items-center justify-center">
            <Doughnut data={casesByTypeData} options={doughnutOptions} />
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-dark-900 dark:text-gray-100 mb-4">Atividade mensal</h3>
          <div className="h-64">
            <Bar data={monthlyActivityData} options={barOptions} />
          </div>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-dark-900 dark:text-gray-100 mb-4">Clientes recentes</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-dark-700">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-200">Nome</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-200">Tipo</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-200">CPF/CNPJ</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-200">Telefone</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-200">Processos</th>
              </tr>
            </thead>
            <tbody>
              {clients?.slice(0, 10).map((client: any) => (
                <tr key={client.id} className="border-b border-gray-100 dark:border-dark-700 hover:bg-gray-50 dark:hover:bg-dark-700/60">
                  <td className="py-3 px-4 text-sm text-dark-900 dark:text-gray-100">{client.name}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        client.type === 'PESSOA_FISICA' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                      }`}
                    >
                      {client.type === 'PESSOA_FISICA' ? 'PF' : 'PJ'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">{client.cpfCnpj}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">{client.phone}</td>
                  <td className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">{client._count?.cases || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h3 className="text-lg font-semibold text-dark-900 dark:text-gray-100 mb-4">Prazos proximos</h3>
        <div className="space-y-3">
          {deadlines?.deadlines && deadlines.deadlines.length > 0 ? (
            deadlines.deadlines.slice(0, 5).map((deadline: any) => {
              const days = getDaysUntil(deadline.dueDate);
              const isUrgent = days <= 3;
              return (
                <div
                  key={deadline.id}
                  className={`flex items-center justify-between p-3 rounded-lg ${
                    isUrgent ? 'bg-red-50 dark:bg-red-900/30' : 'bg-yellow-50 dark:bg-yellow-900/30'
                  }`}
                >
                  <div>
                    <p className="font-medium text-dark-900 dark:text-gray-100">{deadline.title}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-300">Processo: {deadline.case?.caseNumber || 'N/A'}</p>
                  </div>
                  <span className={`text-sm font-semibold ${isUrgent ? 'text-red-700 dark:text-red-300' : 'text-yellow-700 dark:text-yellow-300'}`}>
                    {days} {days === 1 ? 'dia' : 'dias'}
                  </span>
                </div>
              );
            })
          ) : (
            <p className="text-gray-500 dark:text-gray-300 text-center py-4">Nenhum prazo proximo</p>
          )}
        </div>
      </div>
    </div>
  );
}
