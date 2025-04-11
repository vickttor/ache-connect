'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Download, AlertTriangle, Clock, ArrowLeft, Send } from 'lucide-react';
import Link from 'next/link';

interface PrescricaoDetalhesProps {
  id: string;
}

// Dados mockados para o MVP
const MOCK_PRESCRICAO = {
  id: '12345',
  paciente: {
    id: '1',
    nome: 'Maria Silva',
    telefone: '(11) 98765-4321',
  },
  medico: {
    nome: 'Dr. Carlos Drummond de Andrade',
    crm: 'SP0018677',
    especialidade: 'Cardiologista',
  },
  dataEmissao: new Date('2024-03-15T14:30:00'),
  validade: 30,
  status: 'emitida',
  informacoesAdicionais:
    'Tomar os medicamentos conforme orientação. Em caso de efeitos colaterais, entrar em contato imediatamente.',
  produtos: [
    {
      produto: {
        nome: 'Medicamento A 10mg',
        emCampanha: true,
      },
      quantidade: '60 comprimidos',
      posologia: '2x ao dia',
      duracao: '30 dias',
      usoContinuo: false,
    },
    {
      produto: {
        nome: 'Medicamento B 25mg',
        emCampanha: false,
      },
      quantidade: '30 comprimidos',
      posologia: '1x ao dia',
      duracao: '30 dias',
      usoContinuo: true,
    },
  ],
  codigoRastreio: 'abc123xyz',
};

export function PrescricaoDetalhes({ id }: PrescricaoDetalhesProps) {
  const [loading, setLoading] = useState(true);
  const [prescricao, setPrescricao] = useState<typeof MOCK_PRESCRICAO | null>(
    null,
  );
  const [error, setError] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    const fetchPrescricao = async () => {
      try {
        // Simulando chamada à API
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Em um ambiente real, faríamos uma chamada como:
        // const response = await fetch(`/api/prescricoes/${id}`);
        // const data = await response.json();
        // if (!response.ok) throw new Error(data.error || 'Falha ao buscar prescrição');

        // Para o MVP, usamos dados mockados
        setPrescricao(MOCK_PRESCRICAO);
      } catch (error) {
        console.error('Erro ao buscar prescrição:', error);
        setError('Não foi possível encontrar a prescrição solicitada.');
      } finally {
        setLoading(false);
      }
    };

    fetchPrescricao();
  }, [id]);

  const handleEnviarWhatsApp = async () => {
    if (!prescricao) return;

    setEnviando(true);

    try {
      // Simulando chamada à API
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Em um ambiente real, faríamos uma chamada como:
      // const response = await fetch(`/api/prescricoes/${id}/enviar`, {
      //   method: 'POST',
      // });
      // if (!response.ok) throw new Error('Falha ao enviar prescrição');

      alert('Prescrição enviada com sucesso para o WhatsApp do paciente!');

      // Atualizar o status da prescrição localmente
      setPrescricao((prev) => (prev ? { ...prev, status: 'enviada' } : null));
    } catch (error) {
      console.error('Erro ao enviar prescrição:', error);
      alert('Erro ao enviar prescrição. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  };

  // Renderizar estado de carregamento
  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="flex justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-pink-500"></div>
          </div>
          <p className="mt-4 text-gray-600">
            Carregando detalhes da prescrição...
          </p>
        </CardContent>
      </Card>
    );
  }

  // Renderizar mensagem de erro
  if (error || !prescricao) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-amber-500" />
          <h2 className="mt-4 text-xl font-bold text-gray-900">
            Prescrição não encontrada
          </h2>
          <p className="mt-2 text-gray-600">
            {error || 'Não foi possível encontrar a prescrição.'}
          </p>
          <Button className="mt-6" variant="outline" asChild>
            <Link href="/historico">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao histórico
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <Button variant="outline" asChild>
          <Link href="/historico">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao histórico
          </Link>
        </Button>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="border-pink-200 text-pink-600 hover:bg-pink-50 hover:text-pink-700"
            asChild
          >
            <Link
              href={`/rastrear/${prescricao.codigoRastreio}`}
              target="_blank"
            >
              Visualizar rastreamento
            </Link>
          </Button>

          <Button className="bg-pink-500 hover:bg-pink-600">
            <Download className="mr-2 h-4 w-4" />
            Baixar PDF
          </Button>

          {prescricao.status === 'emitida' && (
            <Button
              className="bg-green-600 hover:bg-green-700"
              onClick={handleEnviarWhatsApp}
              disabled={enviando}
            >
              <Send className="mr-2 h-4 w-4" />
              {enviando ? 'Enviando...' : 'Enviar via WhatsApp'}
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="mb-6 flex items-center justify-between rounded-lg bg-gray-50 p-4">
            <div className="flex items-center">
              <Clock
                className={`h-8 w-8 ${
                  prescricao.status === 'emitida'
                    ? 'text-amber-500'
                    : prescricao.status === 'enviada'
                      ? 'text-blue-500'
                      : 'text-green-500'
                }`}
              />
              <div className="ml-3">
                <h3 className="font-semibold">
                  {prescricao.status === 'emitida'
                    ? 'Prescrição emitida'
                    : prescricao.status === 'enviada'
                      ? 'Prescrição enviada'
                      : 'Prescrição visualizada'}
                </h3>
                <p className="text-sm text-gray-600">
                  {prescricao.status === 'emitida'
                    ? 'A prescrição foi emitida e aguarda envio ao paciente'
                    : prescricao.status === 'enviada'
                      ? 'A prescrição foi enviada para o WhatsApp do paciente'
                      : 'A prescrição foi visualizada pelo paciente'}
                </p>
              </div>
            </div>

            <div className="text-right text-sm text-gray-600">
              <p>Emitida em: {prescricao.dataEmissao.toLocaleDateString()}</p>
              <p>
                {prescricao.dataEmissao.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <h3 className="mb-2 font-semibold text-pink-600">
                Informações do Paciente
              </h3>
              <div className="rounded-lg border bg-white p-4">
                <p>
                  <span className="font-medium">Nome:</span>{' '}
                  {prescricao.paciente.nome}
                </p>
                <p>
                  <span className="font-medium">Telefone:</span>{' '}
                  {prescricao.paciente.telefone}
                </p>
              </div>
            </div>

            <div>
              <h3 className="mb-2 font-semibold text-pink-600">
                Informações do Médico
              </h3>
              <div className="rounded-lg border bg-white p-4">
                <p>
                  <span className="font-medium">Nome:</span>{' '}
                  {prescricao.medico.nome}
                </p>
                <p>
                  <span className="font-medium">CRM:</span>{' '}
                  {prescricao.medico.crm}
                </p>
                <p>
                  <span className="font-medium">Especialidade:</span>{' '}
                  {prescricao.medico.especialidade}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="mb-2 font-semibold text-pink-600">
              Medicamentos Prescritos
            </h3>
            <div className="space-y-4">
              {prescricao.produtos.map((produto, index) => (
                <div key={index} className="rounded-lg border bg-white p-4">
                  <h4 className="font-medium">
                    {produto.produto.nome}
                    {produto.produto.emCampanha && (
                      <span className="ml-2 rounded-full bg-pink-100 px-2 py-0.5 text-xs font-medium text-pink-700">
                        Em campanha
                      </span>
                    )}
                  </h4>
                  <div className="mt-2 grid grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-2">
                    <p>
                      <span className="font-medium">Quantidade:</span>{' '}
                      {produto.quantidade}
                    </p>
                    <p>
                      <span className="font-medium">Posologia:</span>{' '}
                      {produto.posologia}
                    </p>
                    <p>
                      <span className="font-medium">Duração:</span>{' '}
                      {produto.duracao}
                    </p>
                    {produto.usoContinuo && (
                      <p>
                        <span className="font-medium">Uso:</span> Contínuo
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {prescricao.informacoesAdicionais && (
            <div className="mb-6">
              <h3 className="mb-2 font-semibold text-pink-600">
                Informações Adicionais
              </h3>
              <div className="rounded-lg border bg-gray-50 p-4">
                <p className="text-gray-700">
                  {prescricao.informacoesAdicionais}
                </p>
              </div>
            </div>
          )}

          <div className="rounded-lg border bg-amber-50 p-4">
            <h3 className="font-semibold text-amber-800">
              Informações de Rastreamento
            </h3>
            <p className="mt-1 text-sm text-amber-700">
              Código de rastreamento:{' '}
              <span className="font-medium">{prescricao.codigoRastreio}</span>
            </p>
            <p className="mt-1 text-sm text-amber-700">
              Link de rastreamento:{' '}
              <a
                href={`${window.location.origin}/rastrear/${prescricao.codigoRastreio}`}
                target="_blank"
                className="font-medium underline"
              >
                {`${window.location.origin}/rastrear/${prescricao.codigoRastreio}`}
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
