/* eslint-disable @typescript-eslint/no-unused-vars */
// src/app/api/achepoints/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { format } from 'date-fns';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Obter o mês atual
    const mesAtual = format(new Date(), 'yyyy-MM');

    // Buscar os pontos do médico para o mês atual
    const achePoint = await prisma.achePoint.findUnique({
      where: {
        medicoId_mesReferencia: {
          medicoId: session.user.id,
          mesReferencia: mesAtual,
        },
      },
      include: {
        medico: {
          select: {
            nome: true,
            crm: true,
            especialidade: true,
            regiao: true,
            totalAchePoints: true,
          },
        },
      },
    });

    // Buscar os resgates do mês atual
    const resgates = await prisma.resgate.findMany({
      where: {
        achePoint: {
          medicoId: session.user.id,
          mesReferencia: mesAtual,
        },
      },
      include: {
        beneficio: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calcular quantas prescrições foram geradas no mês
    const prescricoes = await prisma.prescricao.findMany({
      where: {
        medicoId: session.user.id,
        dataEmissao: {
          gte: new Date(mesAtual + '-01'),
          lt: new Date(
            mesAtual === '12'
              ? `${parseInt(mesAtual.split('-')[0]) + 1}-01-01`
              : `${mesAtual.split('-')[0]}-${String(
                  parseInt(mesAtual.split('-')[1]) + 1,
                ).padStart(2, '0')}-01`,
          ),
        },
      },
    });

    // Se não existir, retornar objeto com pontos zerados
    if (!achePoint) {
      const medico = await prisma.medico.findUnique({
        where: { id: session.user.id },
        select: {
          nome: true,
          crm: true,
          especialidade: true,
          regiao: true,
          totalAchePoints: true,
        },
      });

      return NextResponse.json({
        pontos: 0,
        medico,
        mesReferencia: mesAtual,
        resgates: [],
        prescricoesGeradas: prescricoes.length,
        pontosExpiracao: 30 - parseInt(format(new Date(), 'd')), // Dias restantes no mês
      });
    }

    return NextResponse.json({
      ...achePoint,
      resgates,
      prescricoesGeradas: prescricoes.length,
      pontosExpiracao: 30 - parseInt(format(new Date(), 'd')), // Dias restantes no mês
    });
  } catch (error) {
    console.error('Erro ao buscar AchePoints:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar AchePoints' },
      { status: 500 },
    );
  }
}
