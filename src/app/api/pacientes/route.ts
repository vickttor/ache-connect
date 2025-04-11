/* eslint-disable @typescript-eslint/no-unused-vars */
// src/app/api/pacientes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Schema para validação do paciente
const pacienteSchema = z.object({
  nome: z.string().min(1, { message: 'Nome é obrigatório' }),
  idade: z.number().optional(),
  telefone: z.string().min(1, { message: 'Telefone é obrigatório' }),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const pacientes = await prisma.paciente.findMany({
      where: {
        medicoId: session.user.id,
      },
      orderBy: {
        nome: 'asc',
      },
    });

    return NextResponse.json(pacientes);
  } catch (error) {
    console.error('Erro ao buscar pacientes:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar pacientes' },
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
    const validatedData = pacienteSchema.parse(body);

    // Criar novo paciente
    const paciente = await prisma.paciente.create({
      data: {
        ...validatedData,
        medicoId: session.user.id,
      },
    });

    return NextResponse.json(paciente, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: error.format() },
        { status: 400 },
      );
    }

    console.error('Erro ao criar paciente:', error);
    return NextResponse.json(
      { error: 'Erro ao criar paciente' },
      { status: 500 },
    );
  }
}
