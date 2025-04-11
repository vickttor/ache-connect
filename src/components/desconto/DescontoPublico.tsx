/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShoppingBag, AlertTriangle, CheckCircle } from 'lucide-react';

interface DescontoPublicoProps {
  codigo: string;
}

// Dados mockados para o MVP
const MOCK_DESCONTO = {
  id: '12345',
  prescricaoId: 'abc123',
  valido: true,
  percentualDesconto: 15,
  validoAte: new Date('2024-05-15'),
  produtos: [
    { nome: 'Medicamento A 10mg', desconto: 15 },
    { nome: 'Medicamento D 100mg', desconto: 20 },
  ],
  qrCodeUrl: 'https://cuidadospelavida.ache.com.br/qrcode/abc123xyz.png',
};

export function DescontoPublico({ codigo }: DescontoPublicoProps) {
  const [loading, setLoading] = useState(true);
  const [desconto, setDesconto] = useState<typeof MOCK_DESCONTO | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDesconto = async () => {
      try {
        // Simulando chamada à API
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Em um ambiente real, faríamos uma chamada como:
        // const response = await fetch(`/api/descontos/${codigo}`);
        // const data = await response.json();
        // if (!response.ok) throw new Error(data.error || 'Falha ao buscar desconto');

        // Para o MVP, usamos dados mockados
        setDesconto(MOCK_DESCONTO);
      } catch (error) {
        console.error('Erro ao buscar desconto:', error);
        setError(
          'Não foi possível encontrar o desconto com o código informado.',
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDesconto();
  }, [codigo]);

  // Renderizar estado de carregamento
  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="flex justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-pink-500"></div>
          </div>
          <p className="mt-4 text-gray-600">
            Carregando informações de desconto...
          </p>
        </CardContent>
      </Card>
    );
  }

  // Renderizar mensagem de erro
  if (error || !desconto) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-amber-500" />
          <h2 className="mt-4 text-xl font-bold text-gray-900">
            Cupom de Desconto não encontrado
          </h2>
          <p className="mt-2 text-gray-600">
            {error || 'Não foi possível encontrar o cupom de desconto.'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-purple-800">
        Cupom de Desconto Aché
      </h1>

      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-gradient-to-r from-pink-500 to-purple-600 text-white">
          <CardTitle className="text-center text-2xl">
            {desconto.valido
              ? `${desconto.percentualDesconto}% de desconto nos medicamentos Aché`
              : 'Cupom de desconto expirado'}
          </CardTitle>
        </CardHeader>

        <CardContent className="p-6">
          <div className="mb-6 flex flex-col items-center justify-center gap-4 text-center md:flex-row md:text-left">
            <div className="flex-shrink-0">
              <img
                src={desconto.qrCodeUrl}
                alt="QR Code do Desconto"
                className="h-36 w-36 rounded-md border border-gray-200 p-2"
              />
            </div>

            <div>
              <div className="mb-4 flex items-center justify-center md:justify-start">
                {desconto.valido ? (
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="mr-2 h-5 w-5" />
                    <span className="font-semibold">
                      Cupom válido até {desconto.validoAte.toLocaleDateString()}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center text-red-600">
                    <AlertTriangle className="mr-2 h-5 w-5" />
                    <span className="font-semibold">
                      Cupom expirado em{' '}
                      {desconto.validoAte.toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              <p className="text-gray-700">
                Apresente este QR Code ao farmacêutico para receber desconto na
                compra dos medicamentos Aché em campanha.
              </p>

              <div className="mt-4 flex items-center justify-center gap-2 md:justify-start">
                <ShoppingBag className="h-5 w-5 text-pink-500" />
                <span className="font-medium text-gray-900">
                  Válido em todas as farmácias parceiras
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="mb-3 font-semibold text-gray-900">
              Medicamentos com Desconto
            </h3>
            <div className="space-y-2">
              {desconto.produtos.map((produto, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between rounded-md bg-pink-50 p-3"
                >
                  <span className="font-medium text-gray-800">
                    {produto.nome}
                  </span>
                  <span className="rounded-full bg-pink-200 px-2 py-1 text-xs font-bold text-pink-800">
                    {produto.desconto}% OFF
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 rounded-md bg-amber-50 p-4">
            <div className="flex items-start">
              <AlertTriangle className="mr-3 mt-1 h-5 w-5 flex-shrink-0 text-amber-500" />
              <div>
                <p className="font-medium text-amber-800">Instruções de uso:</p>
                <ol className="mt-2 ml-4 list-decimal text-sm text-amber-700">
                  <li>
                    Apresente este QR Code ao farmacêutico no momento da compra
                  </li>
                  <li>Válido apenas para os medicamentos listados acima</li>
                  <li>Desconto não cumulativo com outras promoções</li>
                  <li>
                    Necessária apresentação da receita médica para produtos com
                    tarja
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <Button className="bg-pink-500 hover:bg-pink-600" asChild>
          <a href={`/receita/${desconto.prescricaoId}`}>Ver receita completa</a>
        </Button>
      </div>
    </div>
  );
}
