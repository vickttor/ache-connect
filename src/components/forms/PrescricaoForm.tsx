/* eslint-disable @next/next/no-img-element */
// src/components/forms/PrescricaoForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Trash2, Download } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

// Schema para validação do formulário
const prescricaoFormSchema = z.object({
  pacienteId: z.string().min(1, { message: 'Selecione um paciente' }),
  produtos: z
    .array(
      z.object({
        produtoId: z.string().min(1, { message: 'Selecione um medicamento' }),
        quantidade: z.string().min(1, { message: 'Informe a quantidade' }),
        posologia: z.string().min(1, { message: 'Informe a posologia' }),
        duracao: z
          .string()
          .min(1, { message: 'Informe a duração do tratamento' }),
        usoContinuo: z.boolean(),
      }),
    )
    .min(1, { message: 'Adicione pelo menos um medicamento' }),
  informacoesAdicionais: z.string().optional(),
});

interface Paciente {
  id: string;
  nome: string;
  idade?: number | null;
  telefone: string;
}

interface Produto {
  id: string;
  nome: string;
  emCampanha: boolean;
}

type FormValues = z.infer<typeof prescricaoFormSchema>;

interface PrescricaoFormProps {
  pacienteIdInicial?: string;
}

export function PrescricaoForm({ pacienteIdInicial }: PrescricaoFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSendingToWhatsapp, setIsSendingToWhatsapp] = useState(false);
  const [selectedPaciente, setSelectedPaciente] = useState<Paciente | null>(
    null,
  );
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [prescricaoSalva, setPrescricaoSalva] = useState<{ id: string } | null>(
    null,
  );

  const router = useRouter();
  const { data: session } = useSession();

  // Inicializar o formulário
  const form = useForm<FormValues>({
    resolver: zodResolver(prescricaoFormSchema),
    defaultValues: {
      pacienteId: pacienteIdInicial || '',
      produtos: [
        {
          produtoId: '',
          quantidade: '',
          posologia: '',
          duracao: '',
          usoContinuo: false,
        },
      ],
      informacoesAdicionais: '',
    },
  });

  // Configurar o fieldArray para os produtos
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: 'produtos',
  });

  // Carregar pacientes e produtos da API
  useEffect(() => {
    const fetchPacientesEProdutos = async () => {
      try {
        setIsLoading(true);

        // Buscar pacientes
        const pacientesResponse = await fetch('/api/pacientes');
        if (!pacientesResponse.ok) {
          throw new Error('Falha ao buscar pacientes');
        }
        const pacientesData = await pacientesResponse.json();
        setPacientes(pacientesData);

        // Buscar produtos
        const produtosResponse = await fetch('/api/produtos');
        if (!produtosResponse.ok) {
          throw new Error('Falha ao buscar produtos');
        }
        const produtosData = await produtosResponse.json();
        setProdutos(produtosData);

        // Se houver um pacienteId inicial, selecioná-lo
        if (pacienteIdInicial) {
          const paciente = pacientesData.find(
            (p: Paciente) => p.id === pacienteIdInicial,
          );
          if (paciente) {
            setSelectedPaciente(paciente);
            form.setValue('pacienteId', pacienteIdInicial);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar dados:', error);
        toast.error('Não foi possível carregar os dados necessários.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPacientesEProdutos();
  }, [pacienteIdInicial, form]);

  // Função para adicionar novo medicamento
  const adicionarMedicamento = () => {
    append({
      produtoId: '',
      quantidade: '',
      posologia: '',
      duracao: '',
      usoContinuo: false,
    });
  };

  // Função para remover um medicamento
  const removerMedicamento = (index: number) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  // Função para lidar com a mudança de paciente
  const handlePacienteChange = (pacienteId: string) => {
    const paciente = pacientes.find((p) => p.id === pacienteId) || null;
    setSelectedPaciente(paciente);
  };

  // Função para baixar o PDF da prescrição
  const handleDownloadPDF = async () => {
    if (!prescricaoSalva?.id) return;

    try {
      // Em uma aplicação real, você faria uma chamada para a API para gerar e baixar o PDF
      const response = await fetch(
        `/api/prescricoes/${prescricaoSalva.id}/pdf`,
      );

      if (!response.ok) {
        throw new Error('Falha ao gerar PDF');
      }

      // Criando um blob do PDF e fazendo o download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `receita-${prescricaoSalva.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('PDF baixado com sucesso!');
    } catch (error) {
      console.error('Erro ao baixar PDF:', error);
      toast.error('Erro ao baixar o PDF. Tente novamente.');
    }
  };

  // Função para enviar a prescrição via WhatsApp
  const handleSendWhatsApp = async () => {
    if (!prescricaoSalva?.id) return;

    try {
      setIsSendingToWhatsapp(true);

      const response = await fetch(
        `/api/prescricoes/${prescricaoSalva.id}/whatsapp`,
        {
          method: 'POST',
        },
      );

      if (!response.ok) {
        throw new Error('Falha ao enviar via WhatsApp');
      }

      toast.success('Prescrição enviada via WhatsApp com sucesso!');

      // Redirecionar para a página de detalhes da prescrição
      router.push(`/prescricao/${prescricaoSalva.id}`);
    } catch (error) {
      console.error('Erro ao enviar via WhatsApp:', error);
      toast.error('Erro ao enviar via WhatsApp. Tente novamente.');
    } finally {
      setIsSendingToWhatsapp(false);
    }
  };

  // Função para enviar o formulário
  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/prescricoes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao salvar prescrição');
      }

      const data = await response.json();

      // Mostrar mensagem de sucesso e salvar o ID da prescrição
      toast.success('Prescrição gerada com sucesso!');
      setPrescricaoSalva(data);

      // Não resetamos o formulário para permitir o download do PDF ou envio por WhatsApp
    } catch (error) {
      console.error('Erro ao enviar prescrição:', error);
      toast.error('Erro ao gerar prescrição. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row">
      <div className="w-full border-r border-pink-500 bg-pink-50 p-8 md:w-1/6">
        <div className="flex justify-center">
          <img
            src="/images/main-ache-logo.png"
            alt="Aché"
            className="mb-4 h-16"
          />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-pink-600">Receita Médica</h2>
        </div>
      </div>

      <div className="flex-1 p-8">
        {prescricaoSalva ? (
          <div className="rounded-lg border border-green-500 bg-green-50 p-6 text-center">
            <h3 className="mb-4 text-xl font-bold text-green-700">
              Prescrição Gerada com Sucesso!
            </h3>
            <p className="mb-6 text-green-600">
              A prescrição foi salva no sistema. Você pode baixar o PDF ou
              enviar diretamente via WhatsApp para o paciente.
            </p>
            <div className="flex justify-center space-x-4">
              <Button
                onClick={handleDownloadPDF}
                className="bg-blue-500 hover:bg-blue-600"
              >
                <Download className="mr-2 h-4 w-4" />
                Baixar PDF
              </Button>
              <Button
                onClick={handleSendWhatsApp}
                className="bg-green-500 hover:bg-green-600"
                disabled={isSendingToWhatsapp}
              >
                {isSendingToWhatsapp ? 'Enviando...' : 'Enviar via WhatsApp'}
              </Button>
              <Button
                onClick={() => {
                  // Reiniciar o formulário para uma nova prescrição
                  form.reset({
                    pacienteId: '',
                    produtos: [
                      {
                        produtoId: '',
                        quantidade: '',
                        posologia: '',
                        duracao: '',
                        usoContinuo: false,
                      },
                    ],
                    informacoesAdicionais: '',
                  });
                  setSelectedPaciente(null);
                  setPrescricaoSalva(null);
                }}
                variant="outline"
              >
                Nova Prescrição
              </Button>
            </div>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="border-b pb-6">
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  DADOS DO PACIENTE
                </h3>

                <FormField
                  control={form.control}
                  name="pacienteId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do(a) Paciente:</FormLabel>
                      <Select
                        onValueChange={(value) => {
                          field.onChange(value);
                          handlePacienteChange(value);
                        }}
                        value={field.value}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um paciente" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {pacientes.map((paciente) => (
                            <SelectItem key={paciente.id} value={paciente.id}>
                              {paciente.nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <FormLabel>Idade:</FormLabel>
                    <Input
                      value={selectedPaciente?.idade || ''}
                      disabled
                      placeholder="Ex: 34"
                    />
                  </div>
                  <div>
                    <FormLabel>Whatsapp:</FormLabel>
                    <Input value={selectedPaciente?.telefone || ''} disabled />
                  </div>
                </div>
              </div>

              <div>
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  PRESCRIÇÃO
                </h3>

                {fields.map((field, index) => (
                  <div
                    key={field.id}
                    className="mb-4 rounded-lg border bg-white p-4 shadow-sm"
                  >
                    <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name={`produtos.${index}.produtoId`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Medicamento:</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              value={field.value}
                              disabled={isLoading}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Pesquisar" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {produtos.map((produto) => (
                                  <SelectItem
                                    key={produto.id}
                                    value={produto.id}
                                    className={
                                      produto.emCampanha
                                        ? 'text-pink-500 font-medium'
                                        : ''
                                    }
                                  >
                                    {produto.nome}{' '}
                                    {produto.emCampanha && '(Em campanha)'}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`produtos.${index}.posologia`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Posologia:</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Ex: 1 comprimido a cada 8 horas"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="mb-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name={`produtos.${index}.quantidade`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantidade:</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Ex: 30 comprimidos"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`produtos.${index}.duracao`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Duração do tratamento:</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Ex: 10 dias" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <FormField
                        control={form.control}
                        name={`produtos.${index}.usoContinuo`}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel className="cursor-pointer font-normal">
                              Uso contínuo
                            </FormLabel>
                          </FormItem>
                        )}
                      />

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removerMedicamento(index)}
                        disabled={fields.length === 1}
                      >
                        <Trash2 className="mr-1 h-4 w-4" />
                        Remover
                      </Button>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  className="mt-2 w-full text-pink-500 hover:bg-pink-50 hover:text-pink-600"
                  onClick={adicionarMedicamento}
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Adicionar Medicamento
                </Button>
              </div>

              <div>
                <h3 className="mb-4 text-lg font-semibold text-gray-900">
                  Informações Adicionais
                </h3>
                <FormField
                  control={form.control}
                  name="informacoesAdicionais"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Informações adicionais sobre o medicamento e o uso aqui"
                          className="min-h-32"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex items-center justify-between border-t pt-4">
                <div className="text-sm text-gray-500">
                  <p>Data: {new Date().toLocaleDateString()}</p>
                  <p>Validade: 30 dias</p>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Dr(a). {session?.user?.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    CRM: {session?.user?.crm}
                  </p>
                  <p className="text-sm text-gray-500">
                    Especialidade: {session?.user?.especialidade}
                  </p>
                </div>
              </div>

              <div className="flex justify-center border-t pt-6">
                <Button
                  type="submit"
                  className="bg-pink-500 px-8 hover:bg-pink-600"
                  disabled={isSubmitting || isLoading}
                >
                  {isSubmitting ? 'Gerando...' : 'Gerar Receita Digital'}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </div>
    </div>
  );
}
