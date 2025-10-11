/**
 * Admin CSV Import Page - Story 3.3
 *
 * Multi-step wizard for bulk candidate import via CSV.
 *
 * AC1: Página admin em /admin/import/candidates
 * AC2: Upload de arquivo aceita .csv files (max 10MB)
 * AC3: Após upload, mostra interface de mapeamento de colunas
 * AC4: Tabela de preview mostra primeiras 5 linhas com mapeamentos
 * AC5: Admin clica "Importar" → API POST /api/v1/admin/candidates/import
 * AC7: Indicador de progresso da importação (X de Y candidatos processados)
 * AC8: Importação completa: mostra resumo (sucessos, erros)
 * AC9: Download de log de erros CSV
 */

import { json } from '@remix-run/node';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { useNavigate, useLoaderData } from '@remix-run/react';
import {
  FileUpload,
  Stepper,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  Button,
  Select,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Alert,
  RadioGroup,
  ProgressBar,
} from '@talentbase/design-system';
import type { Step } from '@talentbase/design-system';
import { FileDown, CheckCircle, XCircle } from 'lucide-react';
import { useState, useCallback } from 'react';

import { apiClient, ApiError } from '~/lib/apiClient';
import { requireAdmin, getUserFromToken } from '~/utils/auth.server';

/**
 * Loader - Ensure admin access and fetch user data
 */
export async function loader({ request }: LoaderFunctionArgs) {
  const { token } = await requireAdmin(request);

  // Get actual user info from token
  const userData = await getUserFromToken(token);
  const user = {
    name: userData?.name || 'Admin',
    email: userData?.email || 'admin@talentbase.com',
  };

  return json({ user });
}

/**
 * CSV Import Wizard Steps
 */
const WIZARD_STEPS: Step[] = [
  { id: '1', label: 'Upload', description: 'Selecionar arquivo CSV' },
  { id: '2', label: 'Mapear', description: 'Mapear colunas' },
  { id: '3', label: 'Importar', description: 'Processar dados' },
  { id: '4', label: 'Concluído', description: 'Ver resultados' },
];

interface ParseResult {
  columns: string[];
  preview_rows: Record<string, any>[];
  suggested_mapping: Record<string, string>;
  total_rows: number;
  file_id: string;
}

interface ImportResult {
  total: number;
  success: number;
  skipped: number;
  errors: Array<{
    row: number;
    nome: string;
    email: string;
    error: string;
  }>;
  error_file_url?: string;
}

interface ImportStatus {
  task_id: string;
  status: 'PENDING' | 'PROGRESS' | 'SUCCESS' | 'FAILURE';
  progress?: number;
  current?: number;
  total?: number;
  success?: number;
  errors?: number;
}

// Note: AdminLayout is applied by parent route (admin.tsx)
export default function AdminImportCandidatesPage() {
  const { user } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  // Wizard state
  const [currentStep, setCurrentStep] = useState(0);

  // Step 1: Upload
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Step 2: Column Mapping
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [columnMapping, setColumnMapping] = useState<Record<string, string>>({});
  const [duplicateStrategy, setDuplicateStrategy] = useState<string>('skip');

  // Step 3: Import Progress
  const [taskId, setTaskId] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<ImportStatus | null>(null);
  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null);

  // Step 4: Results
  const [importResult, setImportResult] = useState<ImportResult | null>(null);

  /**
   * Step 1: Handle file upload and parse CSV
   */
  const handleFileSelect = useCallback(async (file: File) => {
    setUploadedFile(file);
    setIsUploading(true);
    setUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const data = await apiClient.postFormData<ParseResult>(
        '/api/v1/candidates/admin/parse-csv',
        formData
      );

      setParseResult(data);
      setColumnMapping(data.suggested_mapping);

      // Move to next step
      setCurrentStep(1);
    } catch (err) {
      if (err instanceof ApiError) {
        const errorData = err.data as any;
        setUploadError(errorData?.error || 'Erro ao processar CSV');
      } else {
        setUploadError('Erro ao processar CSV');
      }
    } finally {
      setIsUploading(false);
    }
  }, []);

  /**
   * Step 2: Handle column mapping change
   */
  const handleMappingChange = (csvColumn: string, modelField: string) => {
    setColumnMapping((prev) => ({
      ...prev,
      [csvColumn]: modelField,
    }));
  };

  /**
   * Step 2: Start import
   */
  const handleStartImport = useCallback(async () => {
    if (!parseResult) return;

    try {
      const data = await apiClient.post<{ task_id: string }>('/api/v1/candidates/admin/import', {
        file_id: parseResult.file_id,
        column_mapping: columnMapping,
        duplicate_strategy: duplicateStrategy,
      });

      setTaskId(data.task_id);
      setCurrentStep(2);

      // Start polling for progress
      startProgressPolling(data.task_id);
    } catch (err) {
      if (err instanceof ApiError) {
        const errorData = err.data as any;
        alert(errorData?.error || 'Erro ao iniciar importação');
      } else {
        alert('Erro ao iniciar importação');
      }
    }
  }, [parseResult, columnMapping, duplicateStrategy]);

  /**
   * Step 3: Poll import progress
   */
  const startProgressPolling = (task_id: string) => {
    const interval = setInterval(async () => {
      try {
        const status = await apiClient.get<ImportStatus>(
          `/api/v1/candidates/admin/import/${task_id}/status`
        );

        setImportStatus(status);

        // If completed, fetch results and stop polling
        if (status.status === 'SUCCESS') {
          clearInterval(interval);
          setPollInterval(null);
          await fetchImportResult(task_id);
        } else if (status.status === 'FAILURE') {
          clearInterval(interval);
          setPollInterval(null);
          alert('Importação falhou. Tente novamente.');
        }
      } catch (error: any) {
        console.error('Error polling status:', error);
      }
    }, 2000); // Poll every 2 seconds

    setPollInterval(interval);
  };

  /**
   * Step 4: Fetch final import results
   */
  const fetchImportResult = async (task_id: string) => {
    try {
      const result = await apiClient.get<ImportResult>(
        `/api/v1/candidates/admin/import/${task_id}/result`
      );

      setImportResult(result);
      setCurrentStep(3);
    } catch (error: any) {
      console.error('Error fetching result:', error);
    }
  };

  /**
   * Download error log
   */
  const handleDownloadErrorLog = () => {
    if (!taskId) return;

    const url = `/api/v1/candidates/admin/import/${taskId}/error-log`;
    const token = localStorage.getItem('token');

    // Create download link
    const link = document.createElement('a');
    link.href = url;
    link.download = `import_errors_${taskId}.csv`;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';

    // Add auth header via fetch and blob
    fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.blob())
      .then((blob) => {
        const blobUrl = URL.createObjectURL(blob);
        link.href = blobUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(blobUrl);
      })
      .catch((err) => {
        console.error('Error downloading file:', err);
        alert('Erro ao baixar log de erros');
      });
  };

  /**
   * Reset wizard
   */
  const handleReset = () => {
    setCurrentStep(0);
    setUploadedFile(null);
    setParseResult(null);
    setColumnMapping({});
    setDuplicateStrategy('skip');
    setTaskId(null);
    setImportStatus(null);
    setImportResult(null);
    if (pollInterval) {
      clearInterval(pollInterval);
      setPollInterval(null);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Importar Candidatos</h1>
        <p className="text-gray-600 mt-2">Importe candidatos em massa via CSV (formato Notion)</p>
      </div>

      {/* Stepper */}
      <div className="mb-8">
        <Stepper steps={WIZARD_STEPS} currentStep={currentStep} orientation="horizontal" />
      </div>

      {/* Step Content */}
      <Card>
        {/* Step 1: Upload CSV */}
        {currentStep === 0 && (
          <>
            <CardHeader>
              <CardTitle>Upload CSV</CardTitle>
            </CardHeader>
            <CardContent>
              <FileUpload
                accept=".csv"
                maxSize={10 * 1024 * 1024}
                onFileSelect={handleFileSelect}
                onError={(error) => setUploadError(error)}
                helperText="Max 10MB, formato .csv"
                disabled={isUploading}
              />

              {uploadError && <Alert variant="error" message={uploadError} className="mt-4" />}

              {isUploading && (
                <div className="mt-4">
                  <ProgressBar value={50} max={100} label="Processando CSV..." animated />
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => navigate('/admin')}>
                Cancelar
              </Button>
              <a
                href="/docs/basedados/notion_candidates_sample.csv"
                download
                className="text-sm text-primary-600 hover:underline"
              >
                Baixar Template CSV
              </a>
            </CardFooter>
          </>
        )}

        {/* Step 2: Column Mapping */}
        {currentStep === 1 && parseResult && (
          <>
            <CardHeader>
              <CardTitle>Mapear Colunas</CardTitle>
              <p className="text-sm text-gray-600 mt-2">
                {parseResult.total_rows} candidatos detectados
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Duplicate Strategy */}
              <RadioGroup
                name="duplicate-strategy"
                label="Estratégia de Duplicatas"
                options={[
                  {
                    value: 'skip',
                    label: 'Pular',
                    description: 'Ignora candidatos com email já cadastrado',
                  },
                  {
                    value: 'update',
                    label: 'Atualizar',
                    description: 'Atualiza dados de candidatos existentes',
                  },
                  {
                    value: 'error',
                    label: 'Erro',
                    description: 'Marca como erro se encontrar duplicata',
                  },
                ]}
                value={duplicateStrategy}
                onChange={setDuplicateStrategy}
                orientation="horizontal"
              />

              {/* Column Mapping Table */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">Mapeamento de Colunas</h3>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Coluna CSV</TableHead>
                        <TableHead>Campo do Sistema</TableHead>
                        <TableHead>Preview</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parseResult.columns.map((col, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="font-medium">{col}</TableCell>
                          <TableCell>
                            <select
                              value={columnMapping[col] || ''}
                              onChange={(e) => handleMappingChange(col, e.target.value)}
                              className="w-full border rounded px-2 py-1"
                            >
                              <option value="">-- Não mapear --</option>
                              <option value="full_name">Nome</option>
                              <option value="email">Email</option>
                              <option value="cpf">CPF</option>
                              <option value="phone">Telefone</option>
                              <option value="city">Cidade</option>
                              <option value="linkedin">LinkedIn</option>
                              {/* Add more field options as needed */}
                            </select>
                          </TableCell>
                          <TableCell className="text-sm text-gray-600">
                            {parseResult.preview_rows[0]?.[col] || '-'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Preview Table */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-3">
                  Preview (primeiras 5 linhas)
                </h3>
                <div className="border rounded-lg overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {Object.keys(columnMapping).map((col, idx) => (
                          <TableHead key={idx}>{columnMapping[col] || col}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {parseResult.preview_rows.slice(0, 5).map((row, idx) => (
                        <TableRow key={idx}>
                          {Object.keys(columnMapping).map((col, colIdx) => (
                            <TableCell key={colIdx} className="text-sm">
                              {row[col] || '-'}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => setCurrentStep(0)}>
                Voltar
              </Button>
              <Button onClick={handleStartImport}>
                Importar {parseResult.total_rows} Candidatos
              </Button>
            </CardFooter>
          </>
        )}

        {/* Step 3: Import Progress */}
        {currentStep === 2 && importStatus && (
          <>
            <CardHeader>
              <CardTitle>Importando Candidatos...</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <ProgressBar
                value={importStatus.current || 0}
                max={importStatus.total || 100}
                label="Progresso da Importação"
                showFraction
                showPercentage
                animated={importStatus.status === 'PROGRESS'}
              />

              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-900">Sucessos</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600 mt-2">
                    {importStatus.success || 0}
                  </p>
                </div>

                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <span className="text-sm font-medium text-red-900">Erros</span>
                  </div>
                  <p className="text-2xl font-bold text-red-600 mt-2">{importStatus.errors || 0}</p>
                </div>
              </div>
            </CardContent>
          </>
        )}

        {/* Step 4: Results */}
        {currentStep === 3 && importResult && (
          <>
            <CardHeader>
              <CardTitle>Importação Concluída</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg text-center">
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-3xl font-bold text-blue-600 mt-1">{importResult.total}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg text-center">
                  <p className="text-sm text-gray-600">Sucessos</p>
                  <p className="text-3xl font-bold text-green-600 mt-1">{importResult.success}</p>
                </div>
                <div className="p-4 bg-yellow-50 rounded-lg text-center">
                  <p className="text-sm text-gray-600">Erros/Pulados</p>
                  <p className="text-3xl font-bold text-yellow-600 mt-1">
                    {importResult.errors.length + importResult.skipped}
                  </p>
                </div>
              </div>

              {/* Success Alert */}
              {importResult.success > 0 && (
                <Alert
                  variant="success"
                  message={`✓ ${importResult.success} candidatos importados com sucesso!`}
                />
              )}

              {/* Error Details */}
              {importResult.errors.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-medium text-gray-900">
                      Erros Encontrados ({importResult.errors.length})
                    </h3>
                    {importResult.error_file_url && (
                      <Button variant="outline" size="sm" onClick={handleDownloadErrorLog}>
                        <FileDown className="w-4 h-4 mr-2" />
                        Baixar Log de Erros
                      </Button>
                    )}
                  </div>

                  <div className="border rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Linha</TableHead>
                          <TableHead>Nome</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Erro</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {importResult.errors.slice(0, 10).map((err, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{err.row}</TableCell>
                            <TableCell>{err.nome}</TableCell>
                            <TableCell>{err.email}</TableCell>
                            <TableCell className="text-red-600 text-sm">{err.error}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {importResult.errors.length > 10 && (
                    <p className="text-sm text-gray-600 mt-2 text-center">
                      Mostrando 10 de {importResult.errors.length} erros. Baixe o log completo
                      acima.
                    </p>
                  )}
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={handleReset}>
                Nova Importação
              </Button>
              <Button onClick={() => navigate('/admin/candidates')}>Ver Candidatos</Button>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
}
