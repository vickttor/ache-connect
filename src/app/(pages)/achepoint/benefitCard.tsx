/* eslint-disable @next/next/no-img-element */
// src/app/(pages)/achepoint/benefitCard.tsx
'use client';

import { Button } from '@/components/ui/button';

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

interface BenefitCardProps {
  beneficio: Beneficio;
  pontosAtuais: number;
  onResgatar: () => void;
}

export function BenefitCard({
  beneficio,
  pontosAtuais,
  onResgatar,
}: BenefitCardProps) {
  const categoriaNomes: Record<string, string> = {
    alimentacao: 'Alimentação',
    entretenimento: 'Entretenimento',
    mercado: 'Mercado',
    varejo: 'Varejo',
    transporte: 'Transporte',
  };

  const isPodeResgatar =
    pontosAtuais >= beneficio.valorPontos && beneficio.disponivel;

  return (
    <div className="overflow-hidden rounded-lg border bg-white shadow-sm transition-all hover:shadow-md">
      <div className="aspect-video relative bg-gray-100">
        {beneficio.imagemUrl ? (
          <img
            src={beneficio.imagemUrl}
            alt={beneficio.nome}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gray-100">
            <span className="text-xl font-bold text-gray-400">
              {beneficio.nome}
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="mb-2 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {beneficio.nome}
          </h3>
          <span className="text-xs font-medium text-gray-500">
            {categoriaNomes[beneficio.categoria] || beneficio.categoria}
          </span>
        </div>

        <p className="mb-4 text-sm text-gray-600">{beneficio.descricao}</p>

        <div className="flex items-center justify-between">
          <p className="font-bold text-pink-500">
            {beneficio.valorPontos} moedas
          </p>

          <Button
            onClick={onResgatar}
            disabled={!isPodeResgatar}
            variant="outline"
            className={`border-pink-300 text-pink-500 hover:bg-pink-50 hover:text-pink-600 ${
              !isPodeResgatar ? 'cursor-not-allowed opacity-50' : ''
            }`}
          >
            Resgatar
          </Button>
        </div>

        {!isPodeResgatar && (
          <p className="mt-2 text-xs italic text-gray-500">
            {pontosAtuais < beneficio.valorPontos
              ? `Você precisa de mais ${
                  beneficio.valorPontos - pontosAtuais
                } moedas para resgatar este benefício.`
              : 'Este benefício não está disponível para resgate no momento.'}
          </p>
        )}
      </div>
    </div>
  );
}
