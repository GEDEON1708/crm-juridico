import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';
import { toast } from 'react-hot-toast';
import {
  DocumentTextIcon,
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  XMarkIcon,
  CheckBadgeIcon,
} from '@heroicons/react/24/outline';

interface DocumentItem {
  id: string;
  title: string;
  description?: string | null;
  type: 'PETICAO' | 'PROCURACAO' | 'CONTRATO' | 'ATA' | 'PARECER' | 'OUTROS';
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
  case?: {
    id: string;
    caseNumber: string;
    title: string;
  } | null;
}

interface CaseItem {
  id: string;
  caseNumber: string;
  title: string;
}

const typeLabels: Record<DocumentItem['type'], string> = {
  PETICAO: 'Peticao',
  PROCURACAO: 'Procuracao',
  CONTRATO: 'Contrato',
  ATA: 'Ata',
  PARECER: 'Parecer',
  OUTROS: 'Outros',
};

const MAX_PDF_SIZE_BYTES = 10 * 1024 * 1024;

const apiRoot = (import.meta.env.VITE_API_URL || 'http://localhost:3001/api').replace(/\/api\/?$/, '');

const isPdfFile = (file: File) => {
  const extensionOk = file.name.toLowerCase().endsWith('.pdf');
  const mimeOk = file.type === 'application/pdf' || file.type === '';
  return extensionOk && mimeOk;
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

  const { data: documents = [], isLoading } = useQuery<DocumentItem[]>({
    queryKey: ['documents'],
    queryFn: async () => {
      const res = await api.get('/documents');
      return res.data.data || [];
    },
  });

  const { data: cases = [] } = useQuery<CaseItem[]>({
    queryKey: ['cases-for-documents'],
    queryFn: async () => {
      const res = await api.get('/cases?limit=200');
      return res.data.data?.cases || [];
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
      toast.success('Documento PDF enviado com sucesso');
      setIsUploadModalOpen(false);
      setUploadFile(null);
      setUploadData({ title: '', description: '', type: 'OUTROS', caseId: '' });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao enviar documento');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/documents/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      toast.success('Documento excluido com sucesso');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Erro ao excluir documento');
    },
  });

  const handleUpload = (event: React.FormEvent) => {
    event.preventDefault();

    if (!uploadFile) {
      toast.error('Selecione um arquivo PDF');
      return;
    }

    if (!isPdfFile(uploadFile)) {
      toast.error('Somente arquivos PDF sao permitidos');
      return;
    }

    if (uploadFile.size > MAX_PDF_SIZE_BYTES) {
      toast.error('O arquivo deve ter no maximo 10MB');
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
    if (window.confirm('Tem certeza que deseja excluir este documento?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleDownload = (filePath: string, fileName: string) => {
    const fileUrl = `${apiRoot}${filePath}`;
    window.open(fileUrl, '_blank', 'noopener,noreferrer');
    toast.success(`Abrindo ${fileName}`);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (!file) {
      setUploadFile(null);
      return;
    }

    if (!isPdfFile(file)) {
      toast.error('Selecione apenas arquivo PDF');
      event.target.value = '';
      setUploadFile(null);
      return;
    }

    if (file.size > MAX_PDF_SIZE_BYTES) {
      toast.error('Arquivo acima do limite de 10MB');
      event.target.value = '';
      setUploadFile(null);
      return;
    }

    setUploadFile(file);
  };

  const filteredDocuments = useMemo(() => {
    if (!selectedType) return documents;
    return documents.filter((doc) => doc.type === selectedType);
  }, [documents, selectedType]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-dark-900 dark:text-gray-100">Documentos</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">Upload funcional com validacao PDF obrigatoria</p>
        </div>
        <button
          onClick={() => setIsUploadModalOpen(true)}
          className="btn btn-primary inline-flex items-center gap-2"
        >
          <ArrowUpTrayIcon className="h-5 w-5" />
          Upload PDF
        </button>
      </div>

      <div className="card">
        <div className="flex flex-wrap gap-4 items-center">
          <label htmlFor="filter-type" className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Filtrar por tipo:
          </label>
          <select
            id="filter-type"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="input-field max-w-xs"
          >
            <option value="">Todos os tipos</option>
            {Object.entries(typeLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          {selectedType && (
            <button onClick={() => setSelectedType('')} className="btn btn-secondary text-sm">
              Limpar filtro
            </button>
          )}
          <div className="md:ml-auto text-sm text-gray-600 dark:text-gray-300">
            Total: {filteredDocuments.length} documento(s)
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-full text-center py-8 text-gray-500 dark:text-gray-300">Carregando documentos...</div>
        ) : filteredDocuments.length > 0 ? (
          filteredDocuments.map((doc) => (
            <div key={doc.id} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center">
                  <DocumentTextIcon className="h-6 w-6 text-primary-600 dark:text-primary-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-dark-900 dark:text-gray-100 truncate">{doc.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{doc.description || 'Sem descricao'}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                      {typeLabels[doc.type]}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-700 dark:text-emerald-300">
                      <CheckBadgeIcon className="h-4 w-4" />
                      PDF
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">{formatFileSize(doc.fileSize)}</span>
                  </div>

                  {doc.case && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Processo: {doc.case.caseNumber}</p>
                  )}

                  <div className="mt-3 flex gap-3">
                    <button
                      onClick={() => handleDownload(doc.filePath, doc.fileName)}
                      className="text-xs text-primary-600 hover:text-primary-700 inline-flex items-center gap-1"
                    >
                      <ArrowDownTrayIcon className="h-4 w-4" />
                      Abrir
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="text-xs text-red-600 hover:text-red-700 inline-flex items-center gap-1"
                    >
                      <TrashIcon className="h-4 w-4" />
                      Excluir
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
          <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-300">
            <DocumentTextIcon className="h-12 w-12 mx-auto mb-4 text-gray-300 dark:text-dark-400" />
            <p>Nenhum documento encontrado</p>
            <button onClick={() => setIsUploadModalOpen(true)} className="mt-4 text-primary-600 hover:text-primary-700">
              Fazer upload do primeiro documento
            </button>
          </div>
        )}
      </div>

      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-800 rounded-xl shadow-xl max-w-2xl w-full border border-gray-200 dark:border-dark-700">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-dark-900 dark:text-gray-100">Upload de Documento PDF</h2>
                <button
                  onClick={() => {
                    setIsUploadModalOpen(false);
                    setUploadFile(null);
                  }}
                  title="Fechar"
                  aria-label="Fechar modal de upload"
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleUpload} className="space-y-4">
                <div>
                  <label htmlFor="doc-title" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Titulo *
                  </label>
                  <input
                    id="doc-title"
                    type="text"
                    required
                    value={uploadData.title}
                    onChange={(e) => setUploadData({ ...uploadData, title: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label htmlFor="doc-description" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                    Descricao
                  </label>
                  <textarea
                    id="doc-description"
                    value={uploadData.description}
                    onChange={(e) => setUploadData({ ...uploadData, description: e.target.value })}
                    rows={3}
                    className="input-field"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="doc-type" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                      Tipo *
                    </label>
                    <select
                      id="doc-type"
                      required
                      value={uploadData.type}
                      onChange={(e) => setUploadData({ ...uploadData, type: e.target.value })}
                      className="input-field"
                    >
                      {Object.entries(typeLabels).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="doc-case" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                      Processo (opcional)
                    </label>
                    <select
                      id="doc-case"
                      value={uploadData.caseId}
                      onChange={(e) => setUploadData({ ...uploadData, caseId: e.target.value })}
                      className="input-field"
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">Arquivo PDF *</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 dark:border-dark-600 rounded-lg hover:border-primary-500 transition-colors">
                    <div className="space-y-1 text-center">
                      <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600 dark:text-gray-300 justify-center">
                        <label className="relative cursor-pointer rounded-md font-medium text-primary-600 hover:text-primary-500">
                          <span>Escolher arquivo</span>
                          <input
                            type="file"
                            required
                            onChange={handleFileChange}
                            className="sr-only"
                            accept="application/pdf,.pdf"
                          />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Somente PDF, tamanho maximo 10MB</p>
                      {uploadFile && (
                        <p className="text-sm text-emerald-600 dark:text-emerald-300 font-medium mt-2">
                          Arquivo: {uploadFile.name}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsUploadModalOpen(false);
                      setUploadFile(null);
                    }}
                    className="btn btn-secondary"
                  >
                    Cancelar
                  </button>
                  <button type="submit" disabled={uploadMutation.isPending} className="btn btn-primary">
                    {uploadMutation.isPending ? 'Enviando...' : 'Enviar PDF'}
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
