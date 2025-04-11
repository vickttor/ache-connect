/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/(pages)/achepoint/dashboard.tsx
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Clock, CreditCard, AlertCircle } from 'lucide-react';
import { BenefitCard } from './benefitCard';
import { toast } from 'sonner';

interface AchePoint {
  id: string;
  medicoId: string;
  pontos: number;
  mesReferencia: string;
  medico: {
    nome: string;
    crm: string;
    especialidade: string;
    regiao: string;
    totalAchePoints: number;
  };
  prescricoesGeradas: number;
  pontosExpiracao: number;
}

interface Beneficio {
  id: string;
  nome: string;
  descricao: string;
  categoria: string;
  valorPontos: number;
  imagemUrl?: string;
  ativo: boolean;
  disponivel: boolean;
}

export function AchePointDashboard() {
  const [categoriaSelecionada, setCategoriaSelecionada] = useState('todas');
  const [achePoints, setAchePoints] = useState<AchePoint | null>(null);
  const [beneficios, setBeneficios] = useState<Beneficio[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Buscar dados de AchePoints
  const fetchAchePoints = async () => {
    try {
      const response = await fetch('/api/achepoints');
      if (!response.ok) {
        throw new Error('Falha ao buscar pontos');
      }
      const data = await response.json();
      setAchePoints(data);
    } catch (error) {
      console.error('Erro ao buscar AchePoints:', error);
      toast.error('Não foi possível carregar seus AchePoints');
    }
  };

  // Buscar benefícios disponíveis
  const fetchBeneficios = async (categoria: string = 'todas') => {
    try {
      const url =
        categoria === 'todas'
          ? '/api/beneficios'
          : `/api/beneficios?categoria=${categoria}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Falha ao buscar benefícios');
      }
      const data = await response.json();
      setBeneficios(data);
    } catch (error) {
      console.error('Erro ao buscar benefícios:', error);
      toast.error('Não foi possível carregar os benefícios disponíveis');
    } finally {
      setIsLoading(false);
    }
  };

  // Carregar dados iniciais
  useEffect(() => {
    const loadData = async () => {
      await fetchAchePoints();
      await fetchBeneficios();
    };

    loadData();
  }, []);

  // Atualizar benefícios quando a categoria mudar
  useEffect(() => {
    fetchBeneficios(categoriaSelecionada);
  }, [categoriaSelecionada]);

  // Função para resgatar benefício
  const handleResgatar = async (beneficioId: string) => {
    try {
      const response = await fetch('/api/resgates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ beneficioId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Falha ao resgatar benefício');
      }

      // Mostrar mensagem de sucesso
      toast.success(data.message);

      // Atualizar os pontos e benefícios
      fetchAchePoints();
      fetchBeneficios(categoriaSelecionada);
    } catch (error: any) {
      console.error('Erro ao resgatar benefício:', error);
      toast.error(
        error.message || 'Erro ao resgatar benefício. Tente novamente.',
      );
    }
  };

  // Categorias de benefícios
  const CATEGORIAS = [
    { id: 'todas', nome: 'Todas as categorias' },
    { id: 'alimentacao', nome: 'Alimentação' },
    { id: 'entretenimento', nome: 'Entretenimento' },
    { id: 'mercado', nome: 'Mercado' },
    { id: 'varejo', nome: 'Varejo' },
    { id: 'transporte', nome: 'Transporte' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
        <Card className="col-span-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Suas Moedas AchePoint</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="animate-pulse">
                <div className="h-10 w-20 rounded bg-white bg-opacity-20"></div>
                <div className="mt-2 h-4 w-32 rounded bg-white bg-opacity-20"></div>
              </div>
            ) : (
              <div className="flex items-end justify-between">
                <div>
                  <h2 className="text-5xl font-bold">
                    {achePoints?.pontos || 0}
                  </h2>
                  <p className="text-sm opacity-90">
                    moedas = R$ {(achePoints?.pontos || 0).toFixed(2)}
                  </p>
                  <p className="mt-2 text-sm opacity-80">
                    {achePoints?.prescricoesGeradas || 0} receitas geradas este
                    mês ({achePoints?.medico.regiao === 'remota' ? '2' : '1'}{' '}
                    moedas por receita)
                  </p>
                </div>
                <CreditCard className="h-12 w-12" />
              </div>
            )}

            <div className="mt-6 flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              <div>
                <p className="font-medium">
                  Atenção: Suas moedas expiram em{' '}
                  {achePoints?.pontosExpiracao || 30} dias
                </p>
                <p className="text-sm opacity-90">
                  As moedas são zeradas no início de cada mês
                </p>
              </div>
            </div>

            {achePoints?.medico.regiao === 'remota' && (
              <div className="mt-4 rounded-md bg-yellow-300 bg-opacity-20 px-4 py-2">
                <div className="flex items-center font-semibold">
                  <span className="mr-1 rounded-md bg-yellow-400 px-2 py-0.5 text-xs text-black">
                    BÔNUS 2X
                  </span>
                  Você está em uma região com bonificação especial!
                </div>
                <p className="mt-1 text-sm opacity-90">
                  Médicos em regiões fora do alcance da Aché recebem 2 moedas
                  por receita
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Como Funciona</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start">
              <div className="mr-2 rounded-full bg-pink-100 p-2 text-pink-600">
                <CreditCard className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium">1 receita = 1 moeda = R$ 1,00</p>
                <p className="text-xs text-gray-500">
                  Cada receita gerada vale 1 moeda
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="mr-2 rounded-full bg-pink-100 p-2 text-pink-600">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium">Moedas expiram mensalmente</p>
                <p className="text-xs text-gray-500">
                  Utilize suas moedas antes do fim do mês
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="mr-2 rounded-full bg-pink-100 p-2 text-pink-600">
                <AlertCircle className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium">Troque por benefícios</p>
                <p className="text-xs text-gray-500">
                  Vouchers, assinaturas e muito mais
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-purple-800">
            Benefícios do Mês
          </h2>

          <Select
            value={categoriaSelecionada}
            onValueChange={setCategoriaSelecionada}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Selecione a categoria" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIAS.map((categoria) => (
                <SelectItem key={categoria.id} value={categoria.id}>
                  {categoria.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-64 animate-pulse rounded-lg border bg-gray-100"
              ></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {beneficios.length > 0 ? (
              beneficios.map((beneficio) => (
                <BenefitCard
                  key={beneficio.id}
                  beneficio={beneficio}
                  pontosAtuais={achePoints?.pontos || 0}
                  onResgatar={() => handleResgatar(beneficio.id)}
                />
              ))
            ) : (
              <div className="col-span-3 rounded-lg border bg-white p-6 text-center shadow-sm">
                <p className="text-lg font-semibold text-gray-700">
                  Nenhum benefício encontrado nesta categoria
                </p>
                <p className="text-gray-500">
                  Tente selecionar outra categoria ou volte mais tarde para
                  novos benefícios
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
