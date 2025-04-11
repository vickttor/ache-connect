/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/api/prescricoes/[id]/whatsapp/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import QRCode from 'qrcode';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const { id: prescricaoId } = await params;

    // Buscar prescrição com todos os dados relacionados
    const prescricao = await prisma.prescricao.findUnique({
      where: {
        id: prescricaoId,
        medicoId: session.user.id,
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

    if (!prescricao) {
      return NextResponse.json(
        { error: 'Prescrição não encontrada' },
        { status: 404 },
      );
    }

    // Verificar se a prescrição já foi enviada
    if (prescricao.status !== 'emitida') {
      return NextResponse.json(
        { error: 'A prescrição já foi enviada anteriormente' },
        { status: 400 },
      );
    }

    // Gerar URL do PDF
    const pdfUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/prescricoes/${prescricaoId}/pdf`;

    // Gerar QR Code para produtos em campanha (se houver)
    let qrCodeDescontoUrl: string | undefined;
    const temProdutoEmCampanha = prescricao.produtos.some(
      (p: any) => p.produto.emCampanha,
    );

    if (temProdutoEmCampanha && prescricao.codigoRastreio) {
      const discountUrl = `${process.env.NEXT_PUBLIC_APP_URL}/desconto/${prescricao.codigoRastreio}`;
      qrCodeDescontoUrl = await QRCode.toDataURL(discountUrl);
    }

    // Em uma aplicação real, você usaria um serviço como Twilio API ou WhatsApp Business API
    // Para fins de demonstração, simularemos o envio de mensagem

    // Simulando um atraso de envio
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Atualizar o status da prescrição
    await prisma.prescricao.update({
      where: { id: prescricaoId },
      data: { status: 'enviada' },
    });

    return NextResponse.json({
      message: 'Prescrição enviada com sucesso via WhatsApp',
      pdfUrl,
      qrCodeDescontoUrl,
    });
  } catch (error) {
    console.error('Erro ao enviar via WhatsApp:', error);
    return NextResponse.json(
      { error: 'Erro ao enviar via WhatsApp' },
      { status: 500 },
    );
  }
}
