// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Criar médico de teste
  const hashedPassword = await hash('senha123', 10);

  const medico = await prisma.medico.upsert({
    where: { email: 'medico@exemplo.com' },
    update: {},
    create: {
      nome: 'Dr. Carlos Drummond de Andrade',
      email: 'medico@exemplo.com',
      senha: hashedPassword,
      crm: 'SP0018677',
      especialidade: 'Cardiologista',
      telefone: '(11) 99999-9999',
      regiao: 'normal',
      estado: 'SP',
      dataNascimento: new Date('1980-01-01'),
    },
  });

  // Criar produtos
  const produtos = [
    { nome: 'Medicamento A 10mg', emCampanha: true },
    { nome: 'Medicamento B 25mg', emCampanha: false },
    { nome: 'Medicamento C 50mg', emCampanha: false },
    { nome: 'Medicamento D 100mg', emCampanha: true },
    { nome: 'Medicamento E 75mg', emCampanha: false },
    { nome: 'Medicamento F 20mg', emCampanha: false },
  ];

  for (const produto of produtos) {
    await prisma.produto.upsert({
      where: { nome: produto.nome },
      update: { emCampanha: produto.emCampanha },
      create: produto,
    });
  }

  // Criar pacientes
  const pacientes = [
    { nome: 'Maria Silva', idade: 45, telefone: '(11) 98765-4321' },
    { nome: 'João Santos', idade: 62, telefone: '(11) 91234-5678' },
    { nome: 'Ana Oliveira', idade: 38, telefone: '(11) 99876-5432' },
    { nome: 'Carlos Pereira', idade: 55, telefone: '(11) 98888-7777' },
    { nome: 'Lúcia Ferreira', idade: 41, telefone: '(11) 97777-8888' },
  ];

  for (const paciente of pacientes) {
    await prisma.paciente.upsert({
      where: {
        medicoId_nome: {
          medicoId: medico.id,
          nome: paciente.nome,
        },
      },
      update: {},
      create: {
        ...paciente,
        medicoId: medico.id,
      },
    });
  }

  // Criar benefícios
  const beneficios = [
    {
      nome: 'Vale-Presente Cacau Show',
      descricao: 'Vale-presente de R$50 para utilização em lojas Cacau Show',
      categoria: 'alimentacao',
      valorPontos: 50,
    },
    {
      nome: 'Assinatura Netflix (1 mês)',
      descricao: 'Um mês de assinatura Netflix padrão',
      categoria: 'entretenimento',
      valorPontos: 30,
    },
    {
      nome: 'Vale-Compras Supermercado',
      descricao:
        'Vale-compras de R$100 para utilização em supermercados parceiros',
      categoria: 'mercado',
      valorPontos: 100,
    },
    {
      nome: 'Assinatura Spotify (1 mês)',
      descricao: 'Um mês de assinatura Spotify Premium',
      categoria: 'entretenimento',
      valorPontos: 20,
    },
    {
      nome: 'Vale-Presente Amazon',
      descricao: 'Vale-presente de R$25 para utilização na Amazon',
      categoria: 'varejo',
      valorPontos: 1,
    },
    {
      nome: 'Vale-Combustível',
      descricao: 'Vale-combustível de R$50 para utilização em postos parceiros',
      categoria: 'transporte',
      valorPontos: 50,
    },
  ];

  for (const beneficio of beneficios) {
    await prisma.beneficio.upsert({
      where: {
        nome_categoria: {
          nome: beneficio.nome,
          categoria: beneficio.categoria,
        },
      },
      update: {},
      create: {
        ...beneficio,
        ativo: true,
      },
    });
  }

  console.log('Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
