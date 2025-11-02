import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const res = await api.get('/dashboard/stats');
      return res.data.data;
    },
    retry: 1,
    staleTime: 30000, // Cache por 30 segundos
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  const statsCards = [
    { name: 'Processos Ativos', value: stats?.activeCases || 0, icon: BriefcaseIcon, color: 'bg-blue-500' },
    { name: 'Total de Clientes', value: stats?.totalClients || 0, icon: UsersIcon, color: 'bg-green-500' },
    { name: 'Prazos Pendentes', value: stats?.pendingDeadlines || 0, icon: ClockIcon, color: 'bg-yellow-500' },
    { name: 'Audiências Próximas', value: stats?.upcomingHearings || 0, icon: CalendarIcon, color: 'bg-purple-500' },
    { name: 'Honorários Pendentes', value: `R$ ${(stats?.pendingFees || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, icon: CurrencyDollarIcon, color: 'bg-red-500' },
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
        label: 'Audiências',
        data: monthlyActivity?.map((item: any) => item.hearings) || [],
        backgroundColor: 'rgba(139, 92, 246, 0.8)',
      },
    ],
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
        <h1 className="text-3xl font-bold text-dark-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Visão geral do escritório</p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsCards.map((stat) => (
          <div key={stat.name} className="card flex items-center gap-4">
            <div className={`${stat.color} p-4 rounded-lg`}>
              <stat.icon className="h-8 w-8 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-600">{stat.name}</p>
              <p className="text-2xl font-bold text-dark-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card">
          <h3 className="text-lg font-semibold text-dark-900 mb-4">Processos por Tipo</h3>
          <div className="h-64 flex items-center justify-center">
            <Doughnut data={casesByTypeData} options={{ maintainAspectRatio: false }} />
          </div>
        </div>

        <div className="card">
          <h3 className="text-lg font-semibold text-dark-900 mb-4">Atividade Mensal</h3>
          <div className="h-64">
            <Bar data={monthlyActivityData} options={{ maintainAspectRatio: false, responsive: true }} />
          </div>
        </div>
      </div>

      {/* Clientes */}
      <div className="card">
        <h3 className="text-lg font-semibold text-dark-900 mb-4">Clientes Recentes</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Nome</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tipo</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">CPF/CNPJ</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Telefone</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Processos</th>
              </tr>
            </thead>
            <tbody>
              {clients?.slice(0, 10).map((client: any) => (
                <tr key={client.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm text-dark-900">{client.name}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      client.type === 'PESSOA_FISICA' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                    }`}>
                      {client.type === 'PESSOA_FISICA' ? 'PF' : 'PJ'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{client.cpfCnpj}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{client.phone}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{client._count?.cases || 0}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Prazos Próximos */}
      <div className="card">
        <h3 className="text-lg font-semibold text-dark-900 mb-4">Prazos Próximos</h3>
        <div className="space-y-3">
          {deadlines?.deadlines && deadlines.deadlines.length > 0 ? (
            deadlines.deadlines.slice(0, 5).map((deadline: any) => {
              const days = getDaysUntil(deadline.dueDate);
              const isUrgent = days <= 3;
              return (
                <div key={deadline.id} className={`flex items-center justify-between p-3 rounded-lg ${
                  isUrgent ? 'bg-red-50' : 'bg-yellow-50'
                }`}>
                  <div>
                    <p className="font-medium text-dark-900">{deadline.title}</p>
                    <p className="text-sm text-gray-600">Processo: {deadline.case?.caseNumber || 'N/A'}</p>
                  </div>
                  <span className={`text-sm font-semibold ${isUrgent ? 'text-red-700' : 'text-yellow-700'}`}>
                    {days} {days === 1 ? 'dia' : 'dias'}
                  </span>
                </div>
              );
            })
          ) : (
            <p className="text-gray-500 text-center py-4">Nenhum prazo próximo</p>
          )}
        </div>
      </div>
    </div>
  );
}
