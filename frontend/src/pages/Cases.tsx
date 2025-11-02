import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/axios';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';

const statusColors: Record<string, string> = {
  EM_ANDAMENTO: 'bg-blue-100 text-blue-800',
  CONCLUIDO: 'bg-green-100 text-green-800',
  ARQUIVADO: 'bg-gray-100 text-gray-800',
  SUSPENSO: 'bg-yellow-100 text-yellow-800',
};

const statusLabels: Record<string, string> = {
  EM_ANDAMENTO: 'Em Andamento',
  CONCLUIDO: 'Concluído',
  ARQUIVADO: 'Arquivado',
  SUSPENSO: 'Suspenso',
};

const typeLabels: Record<string, string> = {
  TRABALHISTA: 'Trabalhista',
  CIVIL: 'Civil',
  CRIMINAL: 'Criminal',
  TRIBUTARIO: 'Tributário',
  FAMILIA: 'Família',
  PREVIDENCIARIO: 'Previdenciário',
  CONSUMIDOR: 'Consumidor',
  EMPRESARIAL: 'Empresarial',
  AMBIENTAL: 'Ambiental',
  OUTROS: 'Outros',
};

export default function Cases() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedCase, setSelectedCase] = useState<any>(null);

  const { data: casesData, isLoading } = useQuery({
    queryKey: ['cases'],
    queryFn: async () => {
      const res = await api.get('/cases?limit=100');
      return res.data.data;
    },
    retry: 1,
    staleTime: 30000,
  });

  const cases = casesData?.cases || [];

  const filteredCases = cases?.filter((caso: any) => {
    const matchesSearch = caso.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caso.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      caso.client?.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = !filterType || caso.type === filterType;
    const matchesStatus = !filterStatus || caso.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark-900">Processos</h1>
          <p className="text-gray-600 mt-1">Gerencie todos os processos do escritório</p>
        </div>
      </div>

      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar por número, título ou cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="relative">
            <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              title="Filtrar por tipo"
              aria-label="Filtrar processos por tipo"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
            >
              <option value="">Todos os Tipos</option>
              {Object.entries(typeLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div className="relative">
            <FunnelIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              title="Filtrar por status"
              aria-label="Filtrar processos por status"
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none"
            >
              <option value="">Todos os Status</option>
              {Object.entries(statusLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {isLoading ? (
          <div className="col-span-2 text-center py-8">Carregando processos...</div>
        ) : filteredCases && filteredCases.length > 0 ? (
          filteredCases.map((caso: any) => (
            <div
              key={caso.id}
              className="card hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedCase(caso)}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-dark-900">{caso.caseNumber}</h3>
                    <p className="text-sm text-gray-600 mt-1">{caso.title || 'Sem título'}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[caso.status]}`}>
                    {statusLabels[caso.status]}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                    {typeLabels[caso.type]}
                  </span>
                  <span className="text-gray-600"></span>
                  <span className="text-gray-600">{caso.client?.name || 'Cliente não identificado'}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200">
                  <div>
                    <p className="text-xs text-gray-500">Data de Abertura</p>
                    <p className="text-sm font-medium text-dark-900">
                      {new Date(caso.startDate).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Valor da Causa</p>
                    <p className="text-sm font-medium text-dark-900">
                      {caso.value ? `R$ ${caso.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-2 text-center py-8 text-gray-500">
            Nenhum processo encontrado com os filtros aplicados
          </div>
        )}
      </div>

      {selectedCase && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-dark-900">{selectedCase.caseNumber}</h2>
                  <p className="text-gray-600 mt-1">{selectedCase.title}</p>
                </div>
                <button
                  onClick={() => setSelectedCase(null)}
                  title="Fechar"
                  aria-label="Fechar detalhes do processo"
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Cliente</label>
                    <p className="text-dark-900 mt-1">{selectedCase.client?.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Tipo</label>
                    <p className="text-dark-900 mt-1">{typeLabels[selectedCase.type]}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Status</label>
                    <span className={`inline-block mt-1 px-2.5 py-1 rounded-full text-xs font-medium ${statusColors[selectedCase.status]}`}>
                      {statusLabels[selectedCase.status]}
                    </span>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Valor da Causa</label>
                    <p className="text-dark-900 mt-1">
                      {selectedCase.value ? `R$ ${selectedCase.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Não informado'}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Data de Abertura</label>
                    <p className="text-dark-900 mt-1">
                      {new Date(selectedCase.startDate).toLocaleDateString('pt-BR')}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Foro</label>
                    <p className="text-dark-900 mt-1">{selectedCase.court || 'Não informado'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Vara</label>
                    <p className="text-dark-900 mt-1">{selectedCase.courtDivision || 'Não informado'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Comarca</label>
                    <p className="text-dark-900 mt-1">{selectedCase.district || 'Não informado'}</p>
                  </div>
                </div>

                {selectedCase.description && (
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-500">Descrição</label>
                    <p className="text-dark-900 mt-1 whitespace-pre-wrap">{selectedCase.description}</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setSelectedCase(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
