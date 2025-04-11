/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/(auth)/cadastro/page.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

const cadastroSchema = z
  .object({
    nome: z
      .string()
      .min(3, { message: 'Nome deve ter pelo menos 3 caracteres' }),
    email: z.string().email({ message: 'Email inválido' }),
    senha: z
      .string()
      .min(6, { message: 'Senha deve ter pelo menos 6 caracteres' }),
    confirmarSenha: z.string(),
    crm: z.string().min(4, { message: 'CRM inválido' }),
    especialidade: z
      .string()
      .min(1, { message: 'Especialidade é obrigatória' }),
    telefone: z.string().min(10, { message: 'Telefone inválido' }),
    estado: z.string().min(2, { message: 'Estado é obrigatório' }),
    dataNascimento: z.string().refine(
      (data) => {
        const date = new Date(data);
        return !isNaN(date.getTime());
      },
      { message: 'Data de nascimento inválida' },
    ),
  })
  .refine((data) => data.senha === data.confirmarSenha, {
    message: 'As senhas não conferem',
    path: ['confirmarSenha'],
  });

const ESTADOS_BRASILEIROS = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' },
];

const ESPECIALIDADES = [
  'Cardiologista',
  'Clínico Geral',
  'Dermatologista',
  'Endocrinologista',
  'Gastroenterologista',
  'Ginecologista',
  'Neurologista',
  'Oftalmologista',
  'Ortopedista',
  'Otorrinolaringologista',
  'Pediatra',
  'Psiquiatra',
  'Urologista',
];

type CadastroFormValues = z.infer<typeof cadastroSchema>;

export default function CadastroPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<CadastroFormValues>({
    resolver: zodResolver(cadastroSchema),
    defaultValues: {
      nome: '',
      email: '',
      senha: '',
      confirmarSenha: '',
      crm: '',
      especialidade: '',
      telefone: '',
      estado: '',
      dataNascimento: '',
    },
  });

  const onSubmit = async (values: CadastroFormValues) => {
    setIsLoading(true);

    try {
      // Determinar se a região é "remota" com base no estado
      const estadosRemotos = ['AC', 'AP', 'AM', 'PA', 'RO', 'RR', 'TO'];
      const regiao = estadosRemotos.includes(values.estado)
        ? 'remota'
        : 'normal';

      const response = await fetch('/api/auth/cadastro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          regiao,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Erro ao criar conta');
      }

      toast.success('Conta criada com sucesso! Você já pode fazer login.');
      router.push('/login');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar conta. Tente novamente.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-8">
      <div className="mx-auto w-full max-w-2xl">
        <div className="flex justify-center mb-6">
          <img src="/images/header-ache-logo.png" alt="Aché" className="h-16" />
        </div>

        <div className="rounded-lg bg-white p-8 shadow-md">
          <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">
            Cadastro de Médico
          </h1>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="nome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Dr. João da Silva"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="seu.email@exemplo.com"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="crm"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CRM</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="123456"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="especialidade"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Especialidade</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a especialidade" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ESPECIALIDADES.map((especialidade) => (
                            <SelectItem
                              key={especialidade}
                              value={especialidade}
                            >
                              {especialidade}
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
                  name="telefone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone (WhatsApp)</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="(11) 99999-9999"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="estado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        disabled={isLoading}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o estado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {ESTADOS_BRASILEIROS.map((estado) => (
                            <SelectItem key={estado.value} value={estado.value}>
                              {estado.label}
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
                  name="dataNascimento"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data de Nascimento</FormLabel>
                      <FormControl>
                        <Input {...field} type="date" disabled={isLoading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="senha"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="********"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmarSenha"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar Senha</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="password"
                          placeholder="********"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-pink-500 hover:bg-pink-600"
                disabled={isLoading}
              >
                {isLoading ? 'Criando conta...' : 'Criar Conta'}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center text-sm">
            <p className="text-gray-600">
              Já tem uma conta?{' '}
              <Link
                href="/login"
                className="font-medium text-pink-600 hover:text-pink-500"
              >
                Faça login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
