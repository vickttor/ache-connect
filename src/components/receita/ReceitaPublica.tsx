/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Download,
  AlertTriangle,
  CheckCircle,
  ShoppingBag,
} from 'lucide-react';

interface ReceitaPublicaProps {
  codigo: string;
}

// Dados mockados para o MVP
const MOCK_RECEITA = {
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
  validade: 30,
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
  qrCodeDesconto: 'https://cuidadospelavida.ache.com.br/qrcode/abc123xyz.png',
};

export function ReceitaPublica({ codigo }: ReceitaPublicaProps) {
  const [loading, setLoading] = useState(true);
  const [receita, setReceita] = useState<typeof MOCK_RECEITA | null>(null);
  const [error, setError] = useState('');
  const [visualized, setVisualized] = useState(false);

  useEffect(() => {
    const fetchReceita = async () => {
      try {
        // Simulando chamada à API
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Em um ambiente real, faríamos uma chamada como:
        // const response = await fetch(`/api/receitas/public/${codigo}`);
        // const data = await response.json();
        // if (!response.ok) throw new Error(data.error || 'Falha ao buscar receita');

        // Para o MVP, usamos dados mockados
        setReceita(MOCK_RECEITA);

        // Marcar como visualizada (em produção, isso seria feito via API)
        if (!visualized) {
          // Em um ambiente real: await fetch(`/api/receitas/public/${codigo}/visualizar`, { method: 'POST' });
          setVisualized(true);
        }
      } catch (error) {
        console.error('Erro ao buscar receita:', error);
        setError(
          'Não foi possível encontrar a receita médica com o código informado.',
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReceita();
  }, [codigo, visualized]);

  // Calcular data de validade
  const calcularDataValidade = (dataEmissao: Date, validade: number) => {
    const data = new Date(dataEmissao);
    data.setDate(data.getDate() + validade);
    return data;
  };

  // Verificar se a receita está válida
  const isReceitaValida = (dataEmissao: Date, validade: number) => {
    const dataValidade = calcularDataValidade(dataEmissao, validade);
    return new Date() <= dataValidade;
  };

  // Renderizar estado de carregamento
  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="flex justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-pink-500"></div>
          </div>
          <p className="mt-4 text-gray-600">Carregando sua receita médica...</p>
        </CardContent>
      </Card>
    );
  }

  // Renderizar mensagem de erro
  if (error || !receita) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-amber-500" />
          <h2 className="mt-4 text-xl font-bold text-gray-900">
            Receita não encontrada
          </h2>
          <p className="mt-2 text-gray-600">
            {error || 'Não foi possível encontrar a receita médica.'}
          </p>
        </CardContent>
      </Card>
    );
  }

  // Verificar validade da receita
  const receitaValida = isReceitaValida(receita.dataEmissao, receita.validade);
  const dataValidade = calcularDataValidade(
    receita.dataEmissao,
    receita.validade,
  );

  return (
    <div className="space-y-6">
      <div className="mb-6 flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-purple-800">
            Receita Médica Digital
          </h1>
          <p className="text-gray-600">Código: {codigo}</p>
        </div>

        <Button className="bg-pink-500 hover:bg-pink-600">
          <Download className="mr-2 h-4 w-4" />
          Baixar PDF
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-pink-200 bg-pink-50 p-6">
          <div className="mx-auto max-w-lg text-center">
            <img
              src="/images/main-ache-logo.png"
              alt="Aché"
              className="mx-auto mb-4 h-16"
            />
            <h2 className="text-2xl font-bold text-pink-600">Receita Médica</h2>
          </div>
        </div>

        <CardContent className="p-6">
          <div className="mb-6 flex items-center justify-between rounded-lg bg-gray-50 p-4">
            <div className="flex items-center">
              {receitaValida ? (
                <CheckCircle className="h-8 w-8 text-green-500" />
              ) : (
                <AlertTriangle className="h-8 w-8 text-red-500" />
              )}
              <div className="ml-3">
                <h3 className="font-semibold">
                  {receitaValida ? 'Receita válida' : 'Receita vencida'}
                </h3>
                <p className="text-sm text-gray-600">
                  {receitaValida
                    ? `Válida até ${dataValidade.toLocaleDateString()}`
                    : `Vencida desde ${dataValidade.toLocaleDateString()}`}
                </p>
              </div>
            </div>

            <div className="text-right text-sm text-gray-600">
              <p>Emitida em: {receita.dataEmissao.toLocaleDateString()}</p>
              <p>
                {receita.dataEmissao.toLocaleTimeString([], {
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
                  {receita.paciente.nome}
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
                  {receita.medico.nome}
                </p>
                <p>
                  <span className="font-medium">CRM:</span> {receita.medico.crm}
                </p>
                <p>
                  <span className="font-medium">Especialidade:</span>{' '}
                  {receita.medico.especialidade}
                </p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="mb-2 font-semibold text-pink-600">
              Medicamentos Prescritos
            </h3>
            <div className="space-y-4">
              {receita.produtos.map((produto, index) => (
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

          {receita.informacoesAdicionais && (
            <div className="mb-6">
              <h3 className="mb-2 font-semibold text-pink-600">
                Informações Adicionais
              </h3>
              <div className="rounded-lg border bg-gray-50 p-4">
                <p className="text-gray-700">{receita.informacoesAdicionais}</p>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-col items-center justify-between gap-6 border-t pt-6 md:flex-row">
            <div className="text-center md:text-left">
              <p className="font-medium text-gray-800">Assinatura Digital</p>
              <p className="text-sm text-gray-600">
                Esta receita foi assinada digitalmente pelo médico através da
                plataforma Cuidados Pela Vida - Aché
              </p>
            </div>

            <div className="text-center md:text-right">
              <div className="mb-1 h-0.5 w-40 bg-black"></div>
              <p className="font-medium">{receita.medico.nome}</p>
              <p className="text-sm text-gray-600">CRM: {receita.medico.crm}</p>
              <p className="text-sm text-gray-600">
                {receita.medico.especialidade}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* QR Code para desconto se houver medicamento em campanha */}
      {receita.produtos.some((p) => p.produto.emCampanha) &&
        receita.qrCodeDesconto && (
          <Card>
            <CardContent className="flex flex-col items-center p-6 text-center md:flex-row md:text-left">
              <div className="mb-4 flex md:mb-0 md:mr-6">
                <ShoppingBag className="mr-4 h-12 w-12 text-pink-500" />
                <img
                  src={receita.qrCodeDesconto}
                  alt="QR Code"
                  className="h-24 w-24"
                />
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Desconto Especial
                </h3>
                <p className="mb-2 text-gray-600">
                  Você tem direito a descontos especiais em medicamentos da Aché
                  em campanha!
                </p>
                <p className="text-sm text-gray-500">
                  Apresente este QR Code na farmácia no momento da compra dos
                  medicamentos marcados como &quot;Em campanha&quot;.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

      <div className="rounded-lg border bg-amber-50 p-4 text-center">
        <AlertTriangle className="mx-auto mb-2 h-6 w-6 text-amber-500" />
        <p className="text-sm font-medium text-amber-800">
          Esta receita é um documento oficial. Apresente-a em uma farmácia para
          adquirir os medicamentos.
        </p>
        <p className="mt-1 text-xs text-amber-700">
          Em caso de dúvidas, entre em contato com seu médico ou farmacêutico.
        </p>
      </div>
    </div>
  );
}
