/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/resgates/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Schema para validação do resgate
const resgateSchema = z.object({
  beneficioId: z.string().uuid(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Buscar histórico de resgates do médico
    const resgates = await prisma.resgate.findMany({
      where: {
        achePoint: {
          medicoId: session.user.id,
        },
      },
      include: {
        beneficio: true,
        achePoint: {
          select: {
            mesReferencia: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(resgates);
  } catch (error) {
    console.error('Erro ao buscar resgates:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar resgates' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const body = await request.json();

    // Validar os dados
    const validatedData = resgateSchema.parse(body);

    // Buscar o mês atual
    const mesAtual = new Date().toISOString().substring(0, 7); // YYYY-MM

    // Transação para garantir que o resgate só ocorra se houver pontos suficientes
    const resgate = await prisma.$transaction(async (tx: any) => {
      // Buscar o registro de AchePoint do médico para o mês atual
      const achePoint = await tx.achePoint.findUnique({
        where: {
          medicoId_mesReferencia: {
            medicoId: session.user.id,
            mesReferencia: mesAtual,
          },
        },
      });

      // Se não houver pontos registrados no mês atual
      if (!achePoint) {
        throw new Error('Você não possui pontos disponíveis neste mês');
      }

      // Buscar o benefício
      const beneficio = await tx.beneficio.findUnique({
        where: { id: validatedData.beneficioId },
      });

      if (!beneficio) {
        throw new Error('Benefício não encontrado');
      }

      // Verificar se o benefício está ativo
      if (!beneficio.ativo) {
        throw new Error('Este benefício não está disponível para resgate');
      }

      // Verificar se há pontos suficientes
      if (achePoint.pontos < beneficio.valorPontos) {
        throw new Error('Pontos insuficientes para resgatar este benefício');
      }

      // Atualizar os pontos do AchePoint
      const achePointAtualizado = await tx.achePoint.update({
        where: { id: achePoint.id },
        data: {
          pontos: {
            decrement: beneficio.valorPontos,
          },
        },
      });

      // Criar o resgate
      const novoResgate = await tx.resgate.create({
        data: {
          achePointId: achePoint.id,
          beneficioId: validatedData.beneficioId,
          pontos: beneficio.valorPontos,
          status: 'concluído', // Para o MVP, consideramos o resgate como concluído imediatamente
        },
        include: {
          beneficio: true,
        },
      });

      return {
        resgate: novoResgate,
        achePoint: achePointAtualizado,
      };
    });

    return NextResponse.json(
      {
        message:
          'Benefício resgatado com sucesso! Um e-mail com as instruções de resgate foi enviado para você.',
        resgate: resgate.resgate,
        pontosRestantes: resgate.achePoint.pontos,
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.format() },
        { status: 400 },
      );
    }

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    console.error('Erro ao criar resgate:', error);
    return NextResponse.json(
      { error: 'Erro ao criar resgate' },
      { status: 500 },
    );
  }
}
