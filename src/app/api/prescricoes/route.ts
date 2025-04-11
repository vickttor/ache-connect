/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/prescricoes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';

// Schema para validação do produto na prescrição
const prescricaoProdutoSchema = z.object({
  produtoId: z.string().min(1, { message: 'Produto é obrigatório' }),
  quantidade: z.string().min(1, { message: 'Quantidade é obrigatória' }),
  posologia: z.string().min(1, { message: 'Posologia é obrigatória' }),
  duracao: z.string().min(1, { message: 'Duração é obrigatória' }),
  usoContinuo: z.boolean().default(false),
});

// Schema para validação da prescrição
const prescricaoSchema = z.object({
  pacienteId: z.string().min(1, { message: 'Paciente é obrigatório' }),
  produtos: z
    .array(prescricaoProdutoSchema)
    .min(1, { message: 'Adicione pelo menos um medicamento' }),
  informacoesAdicionais: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const pacienteId = searchParams.get('pacienteId');

    const whereClause: any = {
      medicoId: session.user.id,
    };

    if (pacienteId) {
      whereClause.pacienteId = pacienteId;
    }

    const prescricoes = await prisma.prescricao.findMany({
      where: whereClause,
      include: {
        paciente: true,
        produtos: {
          include: {
            produto: true,
          },
        },
      },
      orderBy: {
        dataEmissao: 'desc',
      },
    });

    return NextResponse.json(prescricoes);
  } catch (error) {
    console.error('Erro ao buscar prescrições:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar prescrições' },
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
    const validatedData = prescricaoSchema.parse(body);

    // Criar código de rastreio único
    const codigoRastreio = uuidv4();

    // Transação para criar prescrição e seus produtos
    const prescricao = await prisma.$transaction(async (tx: any) => {
      // Verificar se o paciente pertence ao médico logado
      const paciente = await tx.paciente.findUnique({
        where: {
          id: validatedData.pacienteId,
          medicoId: session.user.id,
        },
      });

      if (!paciente) {
        throw new Error(
          'Paciente não encontrado ou não pertence ao médico logado',
        );
      }

      // Criar a prescrição
      const novaPrescricao = await tx.prescricao.create({
        data: {
          pacienteId: validatedData.pacienteId,
          medicoId: session.user.id,
          informacoesAdicionais: validatedData.informacoesAdicionais,
          codigoRastreio,
          produtos: {
            create: validatedData.produtos.map((produto) => ({
              produto: {
                connect: { id: produto.produtoId },
              },
              quantidade: produto.quantidade,
              posologia: produto.posologia,
              duracao: produto.duracao,
              usoContinuo: produto.usoContinuo,
            })),
          },
        },
        include: {
          paciente: true,
          medico: true,
          produtos: {
            include: {
              produto: true,
            },
          },
        },
      });

      // Adicionar pontos AchePoint para o médico
      const mesReferencia = format(new Date(), 'yyyy-MM');

      // Buscar ou criar registro de AchePoint para o mês atual
      const achePoint = await tx.achePoint.upsert({
        where: {
          medicoId_mesReferencia: {
            medicoId: session.user.id,
            mesReferencia,
          },
        },
        update: {
          pontos: {
            increment: novaPrescricao.medico.regiao === 'remota' ? 2 : 1,
          },
        },
        create: {
          medicoId: session.user.id,
          mesReferencia,
          pontos: novaPrescricao.medico.regiao === 'remota' ? 2 : 1,
        },
      });

      // Atualizar também o total de AchePoints do médico
      await tx.medico.update({
        where: { id: session.user.id },
        data: {
          totalAchePoints: {
            increment: novaPrescricao.medico.regiao === 'remota' ? 2 : 1,
          },
        },
      });

      return {
        ...novaPrescricao,
        achePoint,
      };
    });

    return NextResponse.json(prescricao, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.format() },
        { status: 400 },
      );
    }

    console.error('Erro ao criar prescrição:', error);
    return NextResponse.json(
      { error: 'Erro ao criar prescrição' },
      { status: 500 },
    );
  }
}
