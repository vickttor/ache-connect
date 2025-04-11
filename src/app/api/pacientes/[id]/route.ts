// src/app/api/pacientes/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Schema para validação da atualização do paciente
const pacienteUpdateSchema = z.object({
  nome: z.string().min(1, { message: 'Nome é obrigatório' }).optional(),
  idade: z.number().optional(),
  telefone: z.string().min(1, { message: 'Telefone é obrigatório' }).optional(),
});

type tParams = Promise<{ id: string }>;

export async function GET(
  request: NextRequest,
  { params }: { params: tParams },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;

    const paciente = await prisma.paciente.findUnique({
      where: {
        id,
        medicoId: session.user.id, // Garantir que o paciente pertence ao médico logado
      },
      include: {
        prescricoes: {
          orderBy: {
            dataEmissao: 'desc',
          },
        },
      },
    });

    if (!paciente) {
      return NextResponse.json(
        { error: 'Paciente não encontrado' },
        { status: 404 },
      );
    }

    return NextResponse.json(paciente);
  } catch (error) {
    console.error('Erro ao buscar paciente:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar paciente' },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: tParams },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Validar os dados
    const validatedData = pacienteUpdateSchema.parse(body);

    // Verificar se o paciente existe e pertence ao médico logado
    const pacienteExistente = await prisma.paciente.findUnique({
      where: {
        id,
        medicoId: session.user.id,
      },
    });

    if (!pacienteExistente) {
      return NextResponse.json(
        { error: 'Paciente não encontrado' },
        { status: 404 },
      );
    }

    // Atualizar paciente
    const paciente = await prisma.paciente.update({
      where: { id },
      data: validatedData,
    });

    return NextResponse.json(paciente);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.format() },
        { status: 400 },
      );
    }

    console.error('Erro ao atualizar paciente:', error);
    return NextResponse.json(
      { error: 'Erro ao atualizar paciente' },
      { status: 500 },
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: tParams },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id } = await params;

    // Verificar se o paciente existe e pertence ao médico logado
    const pacienteExistente = await prisma.paciente.findUnique({
      where: {
        id,
        medicoId: session.user.id,
      },
    });

    if (!pacienteExistente) {
      return NextResponse.json(
        { error: 'Paciente não encontrado' },
        { status: 404 },
      );
    }

    // Excluir paciente
    await prisma.paciente.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao excluir paciente:', error);
    return NextResponse.json(
      { error: 'Erro ao excluir paciente' },
      { status: 500 },
    );
  }
}
