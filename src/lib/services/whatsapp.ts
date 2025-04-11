/* eslint-disable @typescript-eslint/no-explicit-any */
import { Prescricao, PrescricaoProduto } from '../types';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// Tipos para uso interno
interface PrescricaoCompleta extends Prescricao {
  paciente: {
    nome: string;
    telefone: string;
  };
  medico: {
    nome: string;
    crm: string;
    especialidade: string;
  };
  produtos: (PrescricaoProduto & {
    produto: {
      nome: string;
      emCampanha: boolean;
    };
  })[];
}

interface WhatsAppMessage {
  to: string;
  type: 'text' | 'template' | 'document';
  text?: {
    body: string;
  };
  template?: {
    name: string;
    language: {
      code: string;
    };
    components: any[];
  };
  document?: {
    link: string;
    caption?: string;
  };
}

/**
 * Classe para gerenciar o envio de mensagens via WhatsApp
 * Implementação de exemplo usando WhatsApp Business API
 */
export class WhatsAppService {
  private static instance: WhatsAppService;
  private apiUrl: string;
  private apiToken: string;

  private constructor() {
    // Em produção, esses valores viriam de variáveis de ambiente
    this.apiUrl =
      process.env.WHATSAPP_API_URL || 'https://api.whatsapp.com/v1/messages';
    this.apiToken = process.env.WHATSAPP_API_TOKEN || 'mock_token';
  }

  /**
   * Obtém a instância única do serviço (Singleton)
   */
  public static getInstance(): WhatsAppService {
    if (!WhatsAppService.instance) {
      WhatsAppService.instance = new WhatsAppService();
    }
    return WhatsAppService.instance;
  }

  /**
   * Envia uma prescrição para o paciente via WhatsApp
   */
  public async enviarPrescricao(
    prescricao: PrescricaoCompleta,
    pdfUrl: string,
    qrCodeUrl?: string,
  ): Promise<boolean> {
    try {
      // Formatar a mensagem de texto com a prescrição
      const mensagemTexto = this.formatarMensagemPrescricao(prescricao);

      // Preparar mensagem com PDF
      const mensagemPDF: WhatsAppMessage = {
        to: this.formatarNumeroTelefone(prescricao.paciente.telefone),
        type: 'document',
        document: {
          link: pdfUrl,
          caption: 'Sua receita médica digital 👆',
        },
      };

      // Enviar mensagem com o texto da prescrição
      await this.enviarMensagem({
        to: this.formatarNumeroTelefone(prescricao.paciente.telefone),
        type: 'text' as const,
        text: {
          body: mensagemTexto,
        },
      });

      // Enviar mensagem com o PDF
      await this.enviarMensagem(mensagemPDF);

      // Se houver QR Code (produto em campanha), enviar também
      if (qrCodeUrl) {
        await this.enviarMensagem({
          to: this.formatarNumeroTelefone(prescricao.paciente.telefone),
          type: 'document',
          document: {
            link: qrCodeUrl,
            caption:
              '🎁 QR Code para desconto especial na compra dos medicamentos em campanha!',
          },
        });
      }

      return true;
    } catch (error) {
      console.error('Erro ao enviar prescrição via WhatsApp:', error);
      return false;
    }
  }

  /**
   * Formata a mensagem com os dados da prescrição
   */
  private formatarMensagemPrescricao(prescricao: PrescricaoCompleta): string {
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

    let mensagem = `*RECEITA MÉDICA DIGITAL*\n\n`;
    mensagem += `*Paciente:* ${prescricao.paciente.nome}\n`;
    mensagem += `*Data de emissão:* ${dataEmissao}\n`;
    mensagem += `*Validade:* ${dataValidade}\n\n`;

    mensagem += `*MEDICAMENTOS*\n`;
    prescricao.produtos.forEach((produto, index) => {
      mensagem += `${index + 1}. *${produto.produto.nome}* ${
        produto.produto.emCampanha ? '🎁' : ''
      }\n`;
      mensagem += `   - Quantidade: ${produto.quantidade}\n`;
      if (produto.posologia) {
        mensagem += `   - Posologia: ${produto.posologia}\n`;
      }
      if (produto.duracao) {
        mensagem += `   - Duração: ${produto.duracao}\n`;
      }
      if (produto.usoContinuo) {
        mensagem += `   - Uso contínuo\n`;
      }
      mensagem += `\n`;
    });

    if (prescricao.informacoesAdicionais) {
      mensagem += `*INFORMAÇÕES ADICIONAIS*\n`;
      mensagem += `${prescricao.informacoesAdicionais}\n\n`;
    }

    mensagem += `*MÉDICO*\n`;
    mensagem += `${prescricao.medico.nome}\n`;
    mensagem += `CRM: ${prescricao.medico.crm}\n`;
    mensagem += `Especialidade: ${prescricao.medico.especialidade}\n\n`;

    mensagem += `_Esta é uma receita médica digital válida emitida pela plataforma Cuidados Pela Vida do Aché Laboratórios._\n`;
    mensagem += `_Para verificar a autenticidade, use o código QR ou acesse o link na receita anexada._`;

    return mensagem;
  }

  /**
   * Envia uma mensagem via WhatsApp Business API
   */
  private async enviarMensagem(mensagem: WhatsAppMessage): Promise<any> {
    // Em um ambiente de produção, você faria uma chamada real à API do WhatsApp
    // Para o MVP, vamos apenas simular o envio

    console.log('Enviando mensagem WhatsApp para:', mensagem.to);
    console.log('Conteúdo:', JSON.stringify(mensagem, null, 2));

    // Simular atraso da API
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Em produção, seria algo como:
    /*
    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(mensagem)
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Erro ao enviar mensagem: ${JSON.stringify(error)}`);
    }
    
    return await response.json();
    */

    // Para MVP, retornamos um sucesso simulado
    return { success: true, messageId: `mock_${Date.now()}` };
  }

  /**
   * Formata o número de telefone para o padrão do WhatsApp
   */
  private formatarNumeroTelefone(telefone: string): string {
    // Remover caracteres não numéricos
    const numerosApenas = telefone.replace(/\D/g, '');

    // Garantir que comece com código do país (Brasil)
    if (numerosApenas.length === 11 || numerosApenas.length === 10) {
      return `55${numerosApenas}`;
    } else if (
      numerosApenas.startsWith('55') &&
      (numerosApenas.length === 13 || numerosApenas.length === 12)
    ) {
      return numerosApenas;
    }

    // Se não conseguir formatar, retorna o original
    return telefone;
  }
}

/**
 * Classe para gerenciar o bot de WhatsApp para médicos
 */
export class WhatsAppBotService {
  private static instance: WhatsAppBotService;
  private whatsappService: WhatsAppService;

  private constructor() {
    this.whatsappService = WhatsAppService.getInstance();
  }

  /**
   * Obtém a instância única do serviço (Singleton)
   */
  public static getInstance(): WhatsAppBotService {
    if (!WhatsAppBotService.instance) {
      WhatsAppBotService.instance = new WhatsAppBotService();
    }
    return WhatsAppBotService.instance;
  }

  /**
   * Envia mensagem de boas-vindas e confirmação de interesse
   */
  public async enviarMensagemBoasVindas(
    medicoId: string,
    telefone: string,
    nome: string,
  ): Promise<boolean> {
    try {
      const mensagem = {
        to: this.whatsappService['formatarNumeroTelefone'](telefone),
        type: 'text' as const,
        text: {
          body:
            `Olá, Dr(a). ${nome}!\n\n` +
            `Bem-vindo(a) ao serviço de atualização de medicamentos da *Aché Laboratórios*.\n\n` +
            `Gostaríamos de enviar periodicamente informações sobre:\n` +
            `- Novas amostras disponíveis\n` +
            `- Atualizações sobre medicamentos\n` +
            `- Campanhas especiais\n` +
            `- Eventos e congressos\n\n` +
            `Você deseja receber essas informações?\n\n` +
            `Para confirmar, responda SIM.\n` +
            `Se preferir não receber, responda NÃO ou acesse o link: http://cuidadospelavida.ache.com.br/cancelar/${medicoId}`,
        },
      };

      await this.whatsappService['enviarMensagem'](mensagem);
      return true;
    } catch (error) {
      console.error('Erro ao enviar mensagem de boas-vindas:', error);
      return false;
    }
  }

  /**
   * Envia informações sobre novos medicamentos
   */
  public async enviarInformacoesMedicamento(
    telefone: string,
    nomeMedico: string,
    nomeMedicamento: string,
    descricao: string,
    imgUrl: string,
  ): Promise<boolean> {
    try {
      // Enviar imagem com informações do medicamento
      await this.whatsappService['enviarMensagem']({
        to: this.whatsappService['formatarNumeroTelefone'](telefone),
        type: 'document',
        document: {
          link: imgUrl,
          caption: `*${nomeMedicamento}*\n\n${descricao}`,
        },
      });

      // Enviar mensagem de texto complementar
      const mensagem = {
        to: this.whatsappService['formatarNumeroTelefone'](telefone),
        type: 'text' as const,
        text: {
          body:
            `Dr(a). ${nomeMedico}, caso deseje mais informações sobre ${nomeMedicamento} ou solicitar amostras, entre em contato pelo nosso portal: http://cuidadospelavida.ache.com.br/contato\n\n` +
            `Para cancelar o recebimento destas mensagens, acesse: http://cuidadospelavida.ache.com.br/cancelar`,
        },
      };

      await this.whatsappService['enviarMensagem'](mensagem);
      return true;
    } catch (error) {
      console.error('Erro ao enviar informações de medicamento:', error);
      return false;
    }
  }
}
