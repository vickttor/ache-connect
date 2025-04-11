/* eslint-disable @typescript-eslint/no-explicit-any */

// src/app/api/prescricoes/[id]/pdf/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import QRCode from 'qrcode';
import * as pdfMake from 'pdfmake/build/pdfmake';
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

// Configurar as fontes do pdfMake
(pdfMake as any).vfs = (pdfFonts as any).pdfMake?.vfs;

(pdfMake as any).fonts = {
  Roboto: {
    normal: 'Roboto-Regular.ttf',
    bold: 'Roboto-Medium.ttf',
    italics: 'Roboto-Italic.ttf',
    bolditalics: 'Roboto-MediumItalic.ttf',
  },
};

export async function GET(
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

    // Gerar QR Code para rastreamento
    const qrCodeUrl = await QRCode.toDataURL(
      `${process.env.NEXT_PUBLIC_APP_URL}/rastrear/${prescricao.codigoRastreio}`,
    );

    // Definir o documento PDF
    const docDefinition = {
      content: [
        {
          columns: [
            {
              width: '*',
              stack: [
                { text: 'ACHÉ LABORATÓRIOS', style: 'header' },
                { text: 'CUIDADOS PELA VIDA', style: 'subheader' },
              ],
            },
            {
              width: 100,
              image: 'data:image/png;base64,...', // Base64 da logo do Aché
              fit: [100, 100],
            },
          ],
        },
        { text: 'RECEITA MÉDICA', style: 'title', margin: [0, 20, 0, 20] },

        // Dados do paciente
        { text: 'DADOS DO PACIENTE', style: 'sectionHeader' },
        {
          columns: [
            { width: '*', text: `Nome: ${prescricao.paciente.nome}` },
            {
              width: 'auto',
              text: prescricao.paciente.idade
                ? `Idade: ${prescricao.paciente.idade} anos`
                : '',
            },
          ],
          style: 'normalText',
          margin: [0, 5, 0, 15],
        },

        // Prescrição
        { text: 'PRESCRIÇÃO', style: 'sectionHeader' },
        ...prescricao.produtos.map((produto, index) => ({
          stack: [
            {
              text: `${index + 1}. ${produto.produto.nome} ${
                produto.produto.emCampanha ? '(Em campanha)' : ''
              }`,
              style: 'medicationName',
            },
            {
              text: `Quantidade: ${produto.quantidade}`,
              style: 'medicationDetail',
            },
            {
              text: `Posologia: ${produto.posologia}`,
              style: 'medicationDetail',
            },
            { text: `Duração: ${produto.duracao}`, style: 'medicationDetail' },
            produto.usoContinuo
              ? { text: 'Uso contínuo', style: 'medicationDetail' }
              : {},
          ],
          margin: [0, 0, 0, 10],
        })),

        // Informações adicionais
        prescricao.informacoesAdicionais
          ? [
              {
                text: 'INFORMAÇÕES ADICIONAIS',
                style: 'sectionHeader',
                margin: [0, 10, 0, 5],
              },
              {
                text: prescricao.informacoesAdicionais,
                style: 'normalText',
                margin: [0, 0, 0, 15],
              },
            ]
          : {},

        // Rodapé com dados do médico e assinatura
        {
          columns: [
            {
              width: '*',
              stack: [
                {
                  text: `Data: ${new Date(
                    prescricao.dataEmissao,
                  ).toLocaleDateString()}`,
                },
                { text: `Validade: 30 dias` },
              ],
              style: 'normalText',
            },
            {
              width: '*',
              stack: [
                {
                  text: `${prescricao.medico.nome}`,
                  style: 'doctorName',
                  alignment: 'center',
                },
                {
                  text: `CRM: ${prescricao.medico.crm}`,
                  style: 'doctorInfo',
                  alignment: 'center',
                },
                {
                  text: `${prescricao.medico.especialidade}`,
                  style: 'doctorInfo',
                  alignment: 'center',
                },
              ],
              margin: [0, 20, 0, 0],
            },
          ],
          margin: [0, 20, 0, 0],
        },

        // QR Code para rastreamento
        {
          columns: [
            { width: '*', text: '' },
            {
              width: 'auto',
              stack: [
                {
                  text: 'Verifique a autenticidade',
                  style: 'qrCodeText',
                  alignment: 'center',
                },
                { image: qrCodeUrl, width: 100, alignment: 'center' },
              ],
            },
            { width: '*', text: '' },
          ],
          margin: [0, 30, 0, 0],
        },
      ],
      styles: {
        header: {
          fontSize: 16,
          bold: true,
          color: '#db2777', // pink-600
        },
        subheader: {
          fontSize: 12,
          color: '#9d174d', // pink-800
          margin: [0, 5, 0, 0],
        },
        title: {
          fontSize: 20,
          bold: true,
          alignment: 'center',
          color: '#db2777', // pink-600
        },
        sectionHeader: {
          fontSize: 14,
          bold: true,
          margin: [0, 10, 0, 5],
          color: '#9d174d', // pink-800
        },
        normalText: {
          fontSize: 12,
        },
        medicationName: {
          fontSize: 12,
          bold: true,
        },
        medicationDetail: {
          fontSize: 12,
          margin: [10, 2, 0, 0],
        },
        doctorName: {
          fontSize: 12,
          bold: true,
        },
        doctorInfo: {
          fontSize: 10,
        },
        qrCodeText: {
          fontSize: 8,
          color: '#6b7280', // gray-500
        },
      },
      defaultStyle: {
        font: 'Roboto',
      },
    };

    // Gerar o PDF
    const pdfDoc = pdfMake.createPdf(docDefinition as any);

    // Gerar o buffer do PDF
    const pdfBuffer = await new Promise<Buffer>((resolve) => {
      pdfDoc.getBuffer((buffer) => {
        resolve(Buffer.from(buffer));
      });
    });

    // Retornar o PDF
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="receita-${prescricaoId}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    return NextResponse.json({ error: 'Erro ao gerar PDF' }, { status: 500 });
  }
}
