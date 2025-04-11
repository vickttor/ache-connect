/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
// src/app/api/beneficios/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const categoria = searchParams.get('categoria');

    const whereClause: any = { ativo: true };

    if (categoria && categoria !== 'todas') {
      whereClause.categoria = categoria;
    }

    // Buscar benefícios ativos
    const beneficios = await prisma.beneficio.findMany({
      where: whereClause,
      orderBy: {
        valorPontos: 'asc',
      },
    });

    // Buscar informações do médico para verificar os pontos disponíveis
    const medico = await prisma.medico.findUnique({
      where: { id: session.user.id },
      select: { totalAchePoints: true },
    });

    // Buscar registro de AchePoint do mês atual
    const mesAtual = new Date().toISOString().substring(0, 7); // YYYY-MM
    const achePoint = await prisma.achePoint.findUnique({
      where: {
        medicoId_mesReferencia: {
          medicoId: session.user.id,
          mesReferencia: mesAtual,
        },
      },
    });

    // Calcular os pontos disponíveis no mês atual
    const pontosDisponiveis = achePoint?.pontos || 0;

    // Mapear os benefícios com informação de disponibilidade
    const beneficiosComDisponibilidade = beneficios.map((beneficio: any) => ({
      ...beneficio,
      disponivel: pontosDisponiveis >= beneficio.valorPontos,
      pontosDisponiveis,
    }));

    return NextResponse.json(beneficiosComDisponibilidade);
  } catch (error) {
    console.error('Erro ao buscar benefícios:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar benefícios' },
      { status: 500 },
    );
  }
}
