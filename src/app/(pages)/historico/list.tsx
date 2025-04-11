// src/app/(pages)/historico/list.tsx
'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Download, Search, FileText, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

interface Paciente {
  id: string;
  nome: string;
}

interface Produto {
  nome: string;
  emCampanha: boolean;
}

interface PrescricaoProduto {
  produto: Produto;
  quantidade: string;
  posologia: string;
  duracao: string;
  usoContinuo: boolean;
}

interface Medico {
  nome: string;
  crm: string;
  especialidade: string;
}

interface Prescricao {
  id: string;
  paciente: Paciente;
  dataEmissao: string;
  validade: number;
  status: string;
  informacoesAdicionais?: string;
  codigoRastreio?: string;
  produtos: PrescricaoProduto[];
  medico: Medico;
}

export function HistoricoList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [prescricoes, setPrescricoes] = useState<Prescricao[]>([]);
  const [selectedPrescricao, setSelectedPrescricao] =
    useState<Prescricao | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session } = useSession();

  // Função para buscar prescrições
  const fetchPrescricoes = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/prescricoes');

      if (!response.ok) {
        throw new Error('Falha ao buscar prescrições');
      }

      const data = await response.json();
      setPrescricoes(data);
    } catch (error) {
      console.error('Erro ao buscar prescrições:', error);
      toast.error('Não foi possível carregar as prescrições.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescricoes();
  }, []);

  // Função para filtrar as prescrições
  const prescricoesFiltradas = prescricoes.filter((prescricao) => {
    const matchesSearch =
      prescricao.paciente.nome
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      prescricao.produtos.some((item) =>
        item.produto.nome.toLowerCase().includes(searchTerm.toLowerCase()),
      );

    // Filtro por período
    if (selectedPeriod === 'all') return matchesSearch;

    const hoje = new Date();
    const umMes = new Date();
    umMes.setMonth(hoje.getMonth() - 1);
    const tresMeses = new Date();
    tresMeses.setMonth(hoje.getMonth() - 3);
    const seisMeses = new Date();
    seisMeses.setMonth(hoje.getMonth() - 6);

    const data = new Date(prescricao.dataEmissao);

    if (selectedPeriod === '1month' && data >= umMes) return matchesSearch;
    if (selectedPeriod === '3months' && data >= tresMeses) return matchesSearch;
    if (selectedPeriod === '6months' && data >= seisMeses) return matchesSearch;

    return false;
  });

  // Função para selecionar uma prescrição e mostrar detalhes
  const mostrarDetalhes = (id: string) => {
    const prescricao = prescricoes.find((p) => p.id === id);
    if (prescricao) {
      setSelectedPrescricao(prescricao);
    }
  };

  // Função para baixar PDF da prescrição
  const handleDownloadPDF = async () => {
    if (!selectedPrescricao) return;

    try {
      const response = await fetch(
        `/api/prescricoes/${selectedPrescricao.id}/pdf`,
      );

      if (!response.ok) {
        throw new Error('Falha ao gerar PDF');
      }

      // Criando um blob do PDF e fazendo o download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receita-${selectedPrescricao.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('PDF baixado com sucesso!');
    } catch (error) {
      console.error('Erro ao baixar PDF:', error);
      toast.error('Erro ao baixar o PDF. Tente novamente.');
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="col-span-1 lg:col-span-1">
        <div className="mb-6 space-y-4 rounded-lg border bg-white p-4 shadow-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
            <Input
              placeholder="Buscar por paciente ou medicamento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Período
            </label>
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todos os períodos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os períodos</SelectItem>
                <SelectItem value="1month">Último mês</SelectItem>
                <SelectItem value="3months">Últimos 3 meses</SelectItem>
                <SelectItem value="6months">Últimos 6 meses</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <h3 className="mb-3 font-semibold text-purple-800">
          Histórico de Documentos
        </h3>

        <div className="space-y-4">
          {isLoading ? (
            <div className="rounded-lg border bg-white p-6 text-center shadow-sm">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-pink-500"></div>
              <p className="mt-2 text-gray-600">Carregando prescrições...</p>
            </div>
          ) : prescricoesFiltradas.length > 0 ? (
            prescricoesFiltradas.map((prescricao) => (
              <div
                key={prescricao.id}
                className={`cursor-pointer rounded-lg border bg-white p-4 shadow-sm transition-colors hover:border-pink-200 hover:bg-pink-50 ${
                  selectedPrescricao?.id === prescricao.id
                    ? 'border-pink-400 bg-pink-50'
                    : ''
                }`}
                onClick={() => mostrarDetalhes(prescricao.id)}
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-semibold">
                    {prescricao.paciente.nome}
                  </h4>
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                    Prescrição
                  </span>
                </div>

                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <Clock className="mr-1 h-4 w-4" />
                  {new Date(prescricao.dataEmissao).toLocaleDateString()} |{' '}
                  {new Date(prescricao.dataEmissao)
                    .toLocaleTimeString()
                    .substring(0, 5)}
                </div>

                <div className="mt-3">
                  <p className="text-sm font-medium text-gray-700">
                    Medicamentos:
                  </p>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {prescricao.produtos.map((item, idx) => (
                      <span
                        key={idx}
                        className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700"
                      >
                        {item.produto.nome}
                      </span>
                    ))}
                    {prescricao.produtos.length === 0 && (
                      <span className="text-sm text-gray-500">
                        Nenhum medicamento registrado
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-lg border bg-white p-6 text-center shadow-sm">
              <FileText className="mx-auto mb-2 h-10 w-10 text-gray-400" />
              <h4 className="text-lg font-semibold text-gray-800">
                Nenhuma prescrição encontrada
              </h4>
              <p className="text-gray-600">
                Tente ajustar os filtros ou adicionar novas prescrições
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="col-span-1 lg:col-span-2">
        <h3 className="mb-3 font-semibold text-purple-800">
          Detalhes do Documento
        </h3>

        {selectedPrescricao ? (
          <div className="rounded-lg border bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <div className="flex items-center">
                  <div className="mr-3 rounded-full bg-purple-100 p-2">
                    <FileText className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">
                      {selectedPrescricao.paciente.nome}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(
                        selectedPrescricao.dataEmissao,
                      ).toLocaleDateString()}{' '}
                      |{' '}
                      {new Date(selectedPrescricao.dataEmissao)
                        .toLocaleTimeString()
                        .substring(0, 5)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                  Prescrição
                </span>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    selectedPrescricao.status === 'emitida'
                      ? 'bg-amber-100 text-amber-800'
                      : selectedPrescricao.status === 'enviada'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                  }`}
                >
                  {selectedPrescricao.status === 'emitida'
                    ? 'Emitida'
                    : selectedPrescricao.status === 'enviada'
                      ? 'Enviada'
                      : 'Visualizada'}
                </span>
              </div>
            </div>

            <div className="mb-6">
              <h4 className="mb-3 text-base font-semibold text-pink-600">
                Medicamentos Prescritos
              </h4>

              {selectedPrescricao.produtos.map((item, idx) => (
                <div
                  key={idx}
                  className="mb-4 rounded-lg border bg-gray-50 p-4"
                >
                  <h5 className="font-medium">
                    {item.produto.nome}
                    {item.produto.emCampanha && (
                      <span className="ml-2 rounded-full bg-pink-100 px-2 py-0.5 text-xs font-medium text-pink-700">
                        Em campanha
                      </span>
                    )}
                  </h5>
                  <div className="mt-2 grid grid-cols-1 gap-2 text-sm text-gray-600 sm:grid-cols-2">
                    <p>
                      <span className="font-medium">Quantidade:</span>{' '}
                      {item.quantidade}
                    </p>
                    <p>
                      <span className="font-medium">Posologia:</span>{' '}
                      {item.posologia}
                    </p>
                    <p>
                      <span className="font-medium">Duração:</span>{' '}
                      {item.duracao}
                    </p>
                    {item.usoContinuo && (
                      <p>
                        <span className="font-medium">Uso:</span> Contínuo
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {selectedPrescricao.informacoesAdicionais && (
              <div className="mb-6">
                <h4 className="mb-2 text-base font-semibold text-pink-600">
                  Informações Adicionais
                </h4>
                <p className="rounded-lg border border-gray-200 bg-gray-50 p-3 text-sm text-gray-700">
                  {selectedPrescricao.informacoesAdicionais}
                </p>
              </div>
            )}

            <div className="border-t pt-4">
              <h4 className="mb-2 text-base font-semibold text-pink-600">
                Dados do Médico
              </h4>
              <div className="text-sm text-gray-700">
                <p className="mb-1">
                  <span className="font-medium">Nome:</span>{' '}
                  {selectedPrescricao.medico?.nome ?? session?.user?.name ?? ''}
                </p>
                <p className="mb-1">
                  <span className="font-medium">CRM:</span>{' '}
                  {selectedPrescricao.medico?.crm ?? session?.user?.crm ?? ''}
                </p>
                <p>
                  <span className="font-medium">Especialidade:</span>{' '}
                  {selectedPrescricao.medico?.especialidade ??
                    session?.user?.especialidade ??
                    ''}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button
                className="bg-pink-500 hover:bg-pink-600"
                onClick={handleDownloadPDF}
              >
                <Download className="mr-2 h-4 w-4" />
                Baixar PDF
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex min-h-80 flex-col items-center justify-center rounded-lg border bg-white p-6 text-center shadow-sm">
            <FileText className="mb-3 h-16 w-16 text-gray-300" />
            <h3 className="mb-2 text-xl font-semibold text-gray-700">
              Nenhum documento selecionado
            </h3>
            <p className="max-w-md text-gray-500">
              Selecione um documento do histórico para visualizar seus detalhes
              completos.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
