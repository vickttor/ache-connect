// components/rastreamento/PrescricaoRastreamento.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Download,
  CheckCircle,
  Clock,
  ShoppingBag,
  AlertTriangle,
} from 'lucide-react';

interface PrescricaoRastreamentoProps {
  codigo: string;
}

// Dados mockados para simular o rastreamento
const MOCK_RASTREAMENTO = {
  id: '12345',
  paciente: {
    nome: 'Maria Silva',
  },
  medico: {
    nome: 'Dr. Carlos Drummond de Andrade',
    crm: 'SP0018677',
    especialidade: 'Cardiologista',
  },
  dataEmissao: new Date('2024-03-15T14:30:00'),
  status: 'visualizada',
  visualizada: new Date('2024-03-15T15:20:00'),
  medicamentos: [
    {
      nome: 'Medicamento A 10mg',
      emCampanha: true,
      adquirido: true,
      dataAquisicao: new Date('2024-03-16T10:45:00'),
    },
    { nome: 'Medicamento B 25mg', emCampanha: false, adquirido: false },
  ],
};

export function PrescricaoRastreamento({
  codigo,
}: PrescricaoRastreamentoProps) {
  const [loading, setLoading] = useState(true);
  const [prescricao, setPrescricao] = useState<typeof MOCK_RASTREAMENTO | null>(
    null,
  );
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPrescricao = async () => {
      try {
        // Simulando chamada à API
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Em um ambiente real, faríamos uma chamada como:
        // const response = await fetch(`/api/rastreamento/${codigo}`);
        // const data = await response.json();
        // if (!response.ok) throw new Error(data.error || 'Falha ao buscar prescrição');

        // Para o MVP, usamos dados mockados
        setPrescricao(MOCK_RASTREAMENTO);
      } catch (error) {
        console.error('Erro ao buscar prescrição:', error);
        setError(
          'Não foi possível encontrar a prescrição com o código informado.',
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPrescricao();
  }, [codigo]);

  // Renderizar estado de carregamento
  if (loading) {
    return (
      <Card className="mx-auto max-w-4xl">
        <CardContent className="p-8 text-center">
          <div className="flex justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-pink-500"></div>
          </div>
          <p className="mt-4 text-gray-600">
            Buscando informações da prescrição...
          </p>
        </CardContent>
      </Card>
    );
  }

  // Renderizar mensagem de erro
  if (error || !prescricao) {
    return (
      <Card className="mx-auto max-w-4xl">
        <CardContent className="p-8 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-amber-500" />
          <h2 className="mt-4 text-xl font-bold text-gray-900">
            Prescrição não encontrada
          </h2>
          <p className="mt-2 text-gray-600">
            {error || 'Não foi possível encontrar a prescrição.'}
          </p>
          <Button
            className="mt-6 bg-pink-500 hover:bg-pink-600"
            onClick={() => (window.location.href = '/')}
          >
            Voltar ao início
          </Button>
        </CardContent>
      </Card>
    );
  }

  // Funções auxiliares para o status
  const getStatusIcon = () => {
    switch (prescricao.status) {
      case 'emitida':
        return <Clock className="h-8 w-8 text-amber-500" />;
      case 'enviada':
        return <Clock className="h-8 w-8 text-blue-500" />;
      case 'visualizada':
        return <CheckCircle className="h-8 w-8 text-green-500" />;
      default:
        return <AlertTriangle className="h-8 w-8 text-gray-500" />;
    }
  };

  const getStatusText = () => {
    switch (prescricao.status) {
      case 'emitida':
        return 'Prescrição emitida';
      case 'enviada':
        return 'Prescrição enviada';
      case 'visualizada':
        return 'Prescrição visualizada';
      default:
        return 'Status desconhecido';
    }
  };

  const getStatusDescription = () => {
    switch (prescricao.status) {
      case 'emitida':
        return 'A prescrição foi emitida pelo médico e aguarda envio ao paciente.';
      case 'enviada':
        return 'A prescrição foi enviada para o WhatsApp do paciente.';
      case 'visualizada':
        return `A prescrição foi visualizada pelo paciente em ${
          prescricao.visualizada
            ? prescricao.visualizada.toLocaleDateString() +
              ' às ' +
              prescricao.visualizada.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })
            : 'data desconhecida'
        }`;
      default:
        return 'Não há informações adicionais sobre o status.';
    }
  };

  // Renderização principal
  return (
    <Card className="mx-auto max-w-4xl">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">Prescrição Digital</CardTitle>
            <CardDescription>Código de rastreamento: {codigo}</CardDescription>
          </div>
          <Button className="bg-pink-500 hover:bg-pink-600">
            <Download className="mr-2 h-4 w-4" />
            Baixar PDF
          </Button>
        </div>
      </CardHeader>

      <CardContent className="p-6">
        <div className="mb-6 flex items-center justify-between rounded-lg bg-gray-50 p-4">
          <div className="flex items-center">
            {getStatusIcon()}
            <div className="ml-3">
              <h3 className="font-semibold">{getStatusText()}</h3>
              <p className="text-sm text-gray-600">{getStatusDescription()}</p>
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
            <h3 className="mb-2 font-semibold text-gray-900">
              Informações do Paciente
            </h3>
            <div className="rounded-lg border bg-white p-4">
              <p>
                <span className="font-medium">Nome:</span>{' '}
                {prescricao.paciente.nome}
              </p>
            </div>
          </div>

          <div>
            <h3 className="mb-2 font-semibold text-gray-900">
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

        <div>
          <h3 className="mb-2 font-semibold text-gray-900">
            Medicamentos Prescritos
          </h3>
          <div className="space-y-4">
            {prescricao.medicamentos.map((medicamento, index) => (
              <div key={index} className="rounded-lg border bg-white p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className={`mr-3 rounded-full ${
                        medicamento.adquirido ? 'bg-green-100' : 'bg-gray-100'
                      } p-2`}
                    >
                      {medicamento.adquirido ? (
                        <ShoppingBag className="h-5 w-5 text-green-600" />
                      ) : (
                        <Clock className="h-5 w-5 text-gray-500" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium">
                        {medicamento.nome}
                        {medicamento.emCampanha && (
                          <span className="ml-2 rounded-full bg-pink-100 px-2 py-0.5 text-xs font-medium text-pink-700">
                            Em campanha
                          </span>
                        )}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {medicamento.adquirido
                          ? `Adquirido em ${medicamento.dataAquisicao?.toLocaleDateString()}`
                          : 'Aguardando aquisição'}
                      </p>
                    </div>
                  </div>

                  {medicamento.emCampanha && !medicamento.adquirido && (
                    <Button
                      variant="outline"
                      className="border-pink-200 text-pink-600 hover:bg-pink-50 hover:text-pink-700"
                    >
                      Ver descontos
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 rounded-lg border bg-amber-50 p-4 text-center">
          <AlertTriangle className="mx-auto mb-2 h-6 w-6 text-amber-500" />
          <p className="text-sm font-medium text-amber-800">
            Esta prescrição é um documento oficial. Apresente-a em uma farmácia
            para adquirir os medicamentos.
          </p>
          <p className="mt-1 text-xs text-amber-700">
            Em caso de dúvidas, entre em contato com seu médico ou farmacêutico.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
