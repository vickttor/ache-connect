import QRCode from 'qrcode';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Tipos para uso interno
interface Medico {
  nome: string;
  crm: string;
  especialidade: string;
}

interface Paciente {
  nome: string;
  idade?: number;
}

interface Produto {
  nome: string;
  quantidade: string;
  posologia?: string;
  duracao?: string;
  usoContinuo: boolean;
  emCampanha: boolean;
}

interface Prescricao {
  id: string;
  dataEmissao: Date;
  validade: number;
  codigoRastreio?: string;
  informacoesAdicionais?: string;
  medico: Medico;
  paciente: Paciente;
  produtos: Produto[];
}

/**
 * Classe para gerar PDFs de receitas médicas
 * Em um ambiente de produção, usaríamos bibliotecas como PDFKit, jsPDF ou puppeteer
 * Para o MVP, simulamos o processo de geração
 */
export class PDFGenerator {
  private static instance: PDFGenerator;

  private constructor() {}

  /**
   * Obtém a instância única do gerador (Singleton)
   */
  public static getInstance(): PDFGenerator {
    if (!PDFGenerator.instance) {
      PDFGenerator.instance = new PDFGenerator();
    }
    return PDFGenerator.instance;
  }

  /**
   * Gera o PDF de uma receita médica
   */
  public async gerarPDFReceita(
    prescricao: Prescricao,
  ): Promise<{ pdfUrl: string; qrCodeUrl?: string }> {
    try {
      // Em um ambiente real, aqui utilizaríamos uma biblioteca para gerar o PDF
      console.log('Gerando PDF para a receita:', prescricao.id);

      // Simular o processo de geração
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // URL simulada para o PDF gerado
      const pdfUrl = `https://cuidadospelavida.ache.com.br/receitas/${prescricao.id}.pdf`;

      // Se há produtos em campanha, gerar QR Code para desconto
      const temProdutoEmCampanha = prescricao.produtos.some(
        (p) => p.emCampanha,
      );
      let qrCodeUrl: string | undefined;

      if (temProdutoEmCampanha && prescricao.codigoRastreio) {
        // URL para desconto
        const discountUrl = `https://cuidadospelavida.ache.com.br/desconto/${prescricao.codigoRastreio}`;

        // Em um ambiente real, geramos o QR Code e o salvamos
        // Para o MVP, simularemos o processo
        await QRCode.toDataURL(discountUrl);
        qrCodeUrl = `https://cuidadospelavida.ache.com.br/qrcode/${prescricao.id}.png`;
      }

      return { pdfUrl, qrCodeUrl };
    } catch (error) {
      console.error('Erro ao gerar PDF da receita:', error);
      throw new Error('Falha ao gerar PDF da receita');
    }
  }

  /**
   * Simula a geração do conteúdo HTML que seria usado para criar o PDF
   * Em um ambiente real, este HTML seria convertido em PDF
   */
  public gerarHTMLReceita(prescricao: Prescricao): string {
    const dataEmissao = format(
      new Date(prescricao.dataEmissao),
      "dd 'de' MMMM 'de' yyyy",
      { locale: ptBR },
    );
    const dataValidade = format(
      new Date(
        new Date(prescricao.dataEmissao).setDate(
          new Date(prescricao.dataEmissao).getDate() + prescricao.validade,
        ),
      ),
      "dd 'de' MMMM 'de' yyyy",
      { locale: ptBR },
    );

    // Montar o HTML da receita
    const html = `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Receita Médica - ${prescricao.paciente.nome}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            color: #333;
          }
          .container {
            width: 100%;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding-bottom: 20px;
            border-bottom: 2px solid #ec4899;
          }
          .logo {
            height: 60px;
          }
          .titulo {
            text-align: center;
            color: #ec4899;
            font-size: 24px;
            font-weight: bold;
            margin-top: 10px;
            margin-bottom: 30px;
          }
          .secao {
            margin-bottom: 30px;
          }
          .secao-titulo {
            color: #ec4899;
            font-weight: bold;
            font-size: 18px;
            margin-bottom: 10px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 5px;
          }
          .medicamento {
            margin-bottom: 15px;
            padding: 10px;
            border: 1px solid #e5e7eb;
            border-radius: 5px;
            background-color: #f9fafb;
          }
          .medicamento-nome {
            font-weight: bold;
            font-size: 16px;
            margin-bottom: 5px;
          }
          .medicamento-campanha {
            color: #ec4899;
            font-weight: bold;
          }
          .medicamento-detalhes {
            margin-left: 15px;
            font-size: 14px;
          }
          .footer {
            margin-top: 40px;
            display: flex;
            justify-content: space-between;
            font-size: 14px;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
          }
          .assinatura {
            margin-top: 60px;
            text-align: center;
            border-top: 1px solid #333;
            padding-top: 10px;
            width: 250px;
            margin-left: auto;
            margin-right: auto;
          }
          .qr-code {
            display: block;
            width: 120px;
            height: 120px;
            margin: 20px auto;
            border: 1px solid #e5e7eb;
            padding: 10px;
          }
          .info-adicional {
            padding: 15px;
            border: 1px solid #e5e7eb;
            border-radius: 5px;
            background-color: #f9fafb;
            margin-bottom: 30px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://cuidadospelavida.ache.com.br/logo.png" alt="Aché Laboratórios" class="logo">
            <div>
              <h1 class="titulo">Receita Médica</h1>
            </div>
          </div>
          
          <div class="secao">
            <h2 class="secao-titulo">DADOS DO PACIENTE</h2>
            <p><strong>Nome:</strong> ${prescricao.paciente.nome}</p>
            ${
              prescricao.paciente.idade
                ? `<p><strong>Idade:</strong> ${prescricao.paciente.idade} anos</p>`
                : ''
            }
          </div>
          
          <div class="secao">
            <h2 class="secao-titulo">PRESCRIÇÃO</h2>
            
            ${prescricao.produtos
              .map(
                (produto) => `
              <div class="medicamento">
                <div class="medicamento-nome">
                  ${produto.nome} ${
                    produto.emCampanha
                      ? '<span class="medicamento-campanha">(Em campanha)</span>'
                      : ''
                  }
                </div>
                <div class="medicamento-detalhes">
                  <p><strong>Quantidade:</strong> ${produto.quantidade}</p>
                  ${
                    produto.posologia
                      ? `<p><strong>Posologia:</strong> ${produto.posologia}</p>`
                      : ''
                  }
                  ${
                    produto.duracao
                      ? `<p><strong>Duração:</strong> ${produto.duracao}</p>`
                      : ''
                  }
                  ${
                    produto.usoContinuo
                      ? `<p><strong>Uso contínuo</strong></p>`
                      : ''
                  }
                </div>
              </div>
            `,
              )
              .join('')}
          </div>
          
          ${
            prescricao.informacoesAdicionais
              ? `
            <div class="secao">
              <h2 class="secao-titulo">INFORMAÇÕES ADICIONAIS</h2>
              <div class="info-adicional">
                ${prescricao.informacoesAdicionais.replace(/\n/g, '<br>')}
              </div>
            </div>
          `
              : ''
          }
          
          <div class="footer">
            <div>
              <p><strong>Data:</strong> ${dataEmissao}</p>
              <p><strong>Validade:</strong> ${dataValidade}</p>
            </div>
            
            <div>
              <div class="assinatura">
                <p>${prescricao.medico.nome}</p>
                <p>CRM: ${prescricao.medico.crm}</p>
                <p>${prescricao.medico.especialidade}</p>
              </div>
            </div>
          </div>
          
          ${
            prescricao.codigoRastreio
              ? `
            <div style="text-align: center; margin-top: 30px;">
              <p style="font-size: 12px; color: #666;">
                Receita gerada digitalmente pelo portal Cuidados Pela Vida - Aché<br>
                Verifique a autenticidade pelo QR Code abaixo
              </p>
              <img src="https://cuidadospelavida.ache.com.br/qrcode/${prescricao.id}.png" alt="QR Code de verificação" class="qr-code">
            </div>
          `
              : ''
          }
        </div>
      </body>
      </html>
    `;

    return html;
  }
}
