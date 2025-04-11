/* eslint-disable @typescript-eslint/no-unused-vars */
// src/app/api/auth/cadastro/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const cadastroSchema = z.object({
  nome: z.string().min(3),
  email: z.string().email(),
  senha: z.string().min(6),
  crm: z.string().min(4),
  especialidade: z.string().min(1),
  telefone: z.string().min(10),
  estado: z.string().min(2),
  dataNascimento: z.string(),
  regiao: z.string(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validar dados
    const result = cadastroSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { message: 'Dados inválidos', errors: result.error.format() },
        { status: 400 },
      );
    }

    const {
      nome,
      email,
      senha,
      crm,
      especialidade,
      telefone,
      estado,
      dataNascimento,
      regiao,
    } = result.data;

    // Verificar se o email já existe
    const medicoExistente = await prisma.medico.findFirst({
      where: {
        OR: [{ email }, { crm }],
      },
    });

    if (medicoExistente) {
      if (medicoExistente.email === email) {
        return NextResponse.json(
          { message: 'Email já cadastrado' },
          { status: 400 },
        );
      }

      if (medicoExistente.crm === crm) {
        return NextResponse.json(
          { message: 'CRM já cadastrado' },
          { status: 400 },
        );
      }
    }

    // Hash da senha
    const senhaHash = await hash(senha, 10);

    // Criar médico
    const novoMedico = await prisma.medico.create({
      data: {
        nome,
        email,
        senha: senhaHash,
        crm,
        especialidade,
        telefone,
        regiao,
        dataNascimento: new Date(dataNascimento),
      },
    });

    // Remover a senha do objeto retornado
    const { senha: _, ...medicoSemSenha } = novoMedico;

    return NextResponse.json(
      { message: 'Médico cadastrado com sucesso', medico: medicoSemSenha },
      { status: 201 },
    );
  } catch (error) {
    console.error('Erro ao cadastrar médico:', error);

    return NextResponse.json(
      { message: 'Erro ao cadastrar médico' },
      { status: 500 },
    );
  }
}
