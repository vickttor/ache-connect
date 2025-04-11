// src/app/(pages)/pacientes/dialog.tsx
'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';

// Schema para validação do formulário
const pacienteFormSchema = z.object({
  nome: z.string().min(1, { message: 'Nome é obrigatório' }),
  idade: z.coerce
    .number()
    .min(0, { message: 'Idade deve ser um número positivo' })
    .optional()
    .nullable(),
  telefone: z.string().min(1, { message: 'Telefone é obrigatório' }),
});

type FormValues = z.infer<typeof pacienteFormSchema>;

interface PacienteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paciente: {
    id: string;
    nome: string;
    idade?: number | null;
    telefone: string;
  } | null;
  title: string;
  onSave: () => void;
}

export function PacienteDialog({
  open,
  onOpenChange,
  paciente,
  title,
  onSave,
}: PacienteDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Inicializar o formulário
  const form = useForm<FormValues>({
    resolver: zodResolver(pacienteFormSchema),
    defaultValues: {
      nome: '',
      idade: undefined,
      telefone: '',
    },
  });

  // Atualizar os valores do formulário quando o paciente mudar
  useEffect(() => {
    if (paciente) {
      form.reset({
        nome: paciente.nome,
        idade: paciente.idade || null,
        telefone: paciente.telefone,
      });
    } else {
      form.reset({
        nome: '',
        idade: null,
        telefone: '',
      });
    }
  }, [paciente, form]);

  // Função para enviar o formulário
  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);

    try {
      let response;

      if (paciente) {
        // Atualizar paciente existente
        response = await fetch(`/api/pacientes/${paciente.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        });
      } else {
        // Criar novo paciente
        response = await fetch('/api/pacientes', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao salvar paciente');
      }

      // Fechar o diálogo e mostrar mensagem de sucesso
      toast.success(
        paciente
          ? 'Paciente atualizado com sucesso!'
          : 'Paciente adicionado com sucesso!',
      );
      onOpenChange(false);
      onSave(); // Chamar a função de callback após salvar
    } catch (error) {
      console.error('Erro ao salvar paciente:', error);
      toast.error(
        paciente
          ? 'Erro ao atualizar paciente. Tente novamente.'
          : 'Erro ao adicionar paciente. Tente novamente.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Preencha os dados do paciente. Clique em salvar quando terminar.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome completo</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Nome do paciente" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="idade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Idade</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        placeholder="Idade"
                        value={field.value ?? ''}
                        onChange={(e) => {
                          const value =
                            e.target.value === ''
                              ? null
                              : parseInt(e.target.value);
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone (WhatsApp)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="(00) 00000-0000" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="bg-pink-500 hover:bg-pink-600"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Salvando...' : 'Salvar Paciente'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
