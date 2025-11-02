import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';
import { toast } from 'react-hot-toast';
import { DocumentTextIcon, ArrowUpTrayIcon, ArrowDownTrayIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';

const typeLabels: Record<string, string> = {
  PETICAO: 'Petição',
  PROCURACAO: 'Procuração',
  CONTRATO: 'Contrato',
  ATA: 'Ata',
  PARECER: 'Parecer',
  OUTROS: 'Outros',
};

export default function Documents() {
  const [selectedType, setSelectedType] = useState('');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadData, setUploadData] = useState({
    title: '',
    description: '',
    type: 'OUTROS',
    caseId: '',
  });
  const queryClient = useQueryClient();

  const { data: documents, isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      const res = await api.get('/documents');
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

  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return api.post('/documents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Documento enviado com sucesso!');
      setIsUploadModalOpen(false);
      setUploadFile(null);
      setUploadData({ title: '', description: '', type: 'OUTROS', caseId: '' });
    },
    onError: () => toast.error('Erro ao enviar documento'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/documents/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Documento excluído com sucesso!');
    },
    onError: () => toast.error('Erro ao excluir documento'),
  });

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      toast.error('Selecione um arquivo');
      return;
    }

    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('title', uploadData.title);
    formData.append('description', uploadData.description);
    formData.append('type', uploadData.type);
    if (uploadData.caseId) {
      formData.append('caseId', uploadData.caseId);
    }

    uploadMutation.mutate(formData);
  };

  const handleDelete = (id: string) => {
    if (confirm('Tem certeza que deseja excluir este documento?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleDownload = (filePath: string, fileName: string) => {
    // Abre o arquivo em uma nova aba
    const fileUrl = `http://localhost:3001${filePath}`;
    window.open(fileUrl, '_blank');
    toast.success(`Abrindo ${fileName}`);
  };

  const filteredDocuments = documents?.filter((doc: any) => {
    if (!selectedType) return true;
    return doc.type === selectedType;
  });

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-dark-900">Documentos</h1>
          <p className="text-gray-600 mt-1">Gestão de documentos e peças processuais</p>
        </div>
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="btn btn-primary inline-flex items-center gap-2"
        >
          <ArrowUpTrayIcon className="h-5 w-5" />
          Upload de Documento
        </button>
      </div>

      {/* Filtros */}
      <div className="card">
        <div className="flex gap-4 items-center">
          <label htmlFor="filter-type" className="text-sm font-medium text-gray-700">Filtrar por tipo:</label>
          <select
            id="filter-type"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            title="Filtrar documentos por tipo"
            aria-label="Filtrar documentos por tipo"
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Todos os Tipos</option>
            {Object.entries(typeLabels).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
          {selectedType && (
            <button
              onClick={() => setSelectedType('')}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Limpar filtro
            </button>
          )}
          <div className="ml-auto text-sm text-gray-600">
            Total: {filteredDocuments?.length || 0} documentos
          </div>
        </div>
      </div>

      {/* Lista de Documentos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-8">Carregando documentos...</div>
        ) : filteredDocuments && filteredDocuments.length > 0 ? (
          filteredDocuments.map((doc: any) => (
            <div key={doc.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <DocumentTextIcon className="h-6 w-6 text-primary-600" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-dark-900 truncate">{doc.title}</h3>
                  <p className="text-xs text-gray-500 mt-1">{doc.description || 'Sem descrição'}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                      {typeLabels[doc.type]}
                    </span>
                    <span className="text-xs text-gray-500">{formatFileSize(doc.fileSize)}</span>
                  </div>
                  {doc.case && (
                    <p className="text-xs text-gray-500 mt-2">Processo: {doc.case.caseNumber}</p>
                  )}
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleDownload(doc.filePath, doc.fileName)}
                      className="text-xs text-primary-600 hover:text-primary-900 inline-flex items-center gap-1"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4" /> Baixar
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="text-xs text-red-600 hover:text-red-900 inline-flex items-center gap-1"
                    >
                      <TrashIcon className="h-4 w-4" /> Excluir
                    </button>
                  </div>
                  <p className="text-xs text-gray-400 mt-2">
                    Enviado em {new Date(doc.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500">
            <DocumentTextIcon className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>Nenhum documento encontrado</p>
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="mt-4 text-primary-600 hover:text-primary-900"
            >
              Fazer upload do primeiro documento
            </button>
          </div>
        )}
      </div>

      {/* Modal de Upload */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-dark-900">Upload de Documento</h2>
                <button
                  onClick={() => setIsUploadModalOpen(false)}
                  title="Fechar"
                  aria-label="Fechar modal de upload"
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label htmlFor="doc-title" className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                  <input
                    id="doc-title"
                    type="text"
                    required
                    title="Título do documento"
                    placeholder="Digite o título do documento"
                    value={uploadData.title}
                    onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="doc-description" className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <textarea
                    id="doc-description"
                    value={uploadData.description}
                    onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                    rows={3}
                    title="Descrição do documento"
                    placeholder="Digite uma descrição para o documento"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="doc-type" className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
                    <select
                      id="doc-type"
                      required
                      value={uploadData.type}
                      onChange={(e) => setUploadData({ ...uploadData, type: e.target.value })}
                      title="Tipo do documento"
                      aria-label="Selecione o tipo do documento"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      {Object.entries(typeLabels).map(([key, label]) => (
                        <option key={key} value={key}>{label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="doc-case" className="block text-sm font-medium text-gray-700 mb-1">Processo (opcional)</label>
                    <select
                      id="doc-case"
                      value={uploadData.caseId}
                      onChange={(e) => setUploadData({ ...uploadData, caseId: e.target.value })}
                      title="Processo relacionado"
                      aria-label="Selecione o processo relacionado (opcional)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Selecione um processo</option>
                      {cases?.map((c: any) => (
                        <option key={c.id} value={c.id}>{c.caseNumber}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Arquivo *</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-primary-500 transition-colors">
                    <div className="space-y-1 text-center">
                      <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none">
                          <span>Escolher arquivo</span>
                          <input
                            type="file"
                            required
                            onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                            className="sr-only"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                          />
                        </label>
                        <p className="pl-1">ou arraste e solte</p>
                      </div>
                      <p className="text-xs text-gray-500">PDF, DOC, DOCX, JPG, PNG até 10MB</p>
                      {uploadFile && (
                        <p className="text-sm text-green-600 font-medium mt-2">
                          Arquivo selecionado: {uploadFile.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsUploadModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={uploadMutation.isPending}
                    className="btn btn-primary"
                  >
                    {uploadMutation.isPending ? 'Enviando...' : 'Enviar Documento'}
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
