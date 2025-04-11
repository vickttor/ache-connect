// lib/types/index.ts
import { z } from 'zod';

// Schema de validação para Médico
export const medicoSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(1, { message: 'Nome é obrigatório' }),
  crm: z.string().min(1, { message: 'CRM é obrigatório' }),
  especialidade: z.string().min(1, { message: 'Especialidade é obrigatória' }),
  email: z
    .string()
    .email({ message: 'Email inválido' })
    .optional()
    .or(z.literal('')),
  telefone: z.string().optional(),
  regiao: z.string(),
});

export type Medico = z.infer<typeof medicoSchema>;

// Schema de validação para Paciente
export const pacienteSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(1, { message: 'Nome é obrigatório' }),
  idade: z.coerce.number().min(0).optional(),
  telefone: z.string().min(1, { message: 'Telefone é obrigatório' }),
  medicoId: z.string(),
});

export type Paciente = z.infer<typeof pacienteSchema>;

// Schema de validação para Produto
export const produtoSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(1, { message: 'Nome é obrigatório' }),
  posologia: z.string().optional(),
  descricao: z.string().optional(),
  emCampanha: z.boolean().default(false),
});

export type Produto = z.infer<typeof produtoSchema>;

// Schema de validação para PrescricaoProduto
export const prescricaoProdutoSchema = z.object({
  produtoId: z.string().min(1, { message: 'Produto é obrigatório' }),
  quantidade: z.string().min(1, { message: 'Quantidade é obrigatória' }),
  posologia: z.string().optional(),
  duracao: z.string().optional(),
  usoContinuo: z.boolean().default(false),
});

export type PrescricaoProduto = z.infer<typeof prescricaoProdutoSchema>;

// Schema de validação para Prescrição
export const prescricaoSchema = z.object({
  id: z.string().optional(),
  pacienteId: z.string().min(1, { message: 'Paciente é obrigatório' }),
  medicoId: z.string(),
  dataEmissao: z.date().default(() => new Date()),
  validade: z.number().default(30),
  informacoesAdicionais: z.string().optional(),
  produtos: z
    .array(prescricaoProdutoSchema)
    .min(1, { message: 'Adicione pelo menos um medicamento' }),
});

export type Prescricao = z.infer<typeof prescricaoSchema>;

// Schema de validação para AchePoint
export const achePointSchema = z.object({
  id: z.string().optional(),
  medicoId: z.string(),
  pontos: z.number().default(0),
  mesReferencia: z.string(),
});

export type AchePoint = z.infer<typeof achePointSchema>;

// Schema de validação para Benefício
export const beneficioSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(1, { message: 'Nome é obrigatório' }),
  descricao: z.string().min(1, { message: 'Descrição é obrigatória' }),
  categoria: z.string().min(1, { message: 'Categoria é obrigatória' }),
  valorPontos: z.number().min(1, { message: 'Valor em pontos é obrigatório' }),
  imagemUrl: z.string().optional(),
  ativo: z.boolean().default(true),
});

export type Beneficio = z.infer<typeof beneficioSchema>;

// Schema de validação para Resgate
export const resgateSchema = z.object({
  id: z.string().optional(),
  achePointId: z.string(),
  beneficioId: z.string().min(1, { message: 'Benefício é obrigatório' }),
  pontos: z.number().min(1),
  status: z.enum(['pendente', 'concluído', 'cancelado']).default('pendente'),
});

export type Resgate = z.infer<typeof resgateSchema>;
