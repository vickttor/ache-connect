/* eslint-disable @next/next/no-img-element */
// src/app/(auth)/login/page.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { signIn } from 'next-auth/react';
// import { useRouter } from 'next/navigation';
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
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email({ message: 'Email inválido' }),
  senha: z
    .string()
    .min(6, { message: 'Senha deve ter pelo menos 6 caracteres' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  // const router = useRouter();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      senha: '',
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email: values.email,
        senha: values.senha,
        redirect: false,
      });

      if (result?.error) {
        toast.error('Credenciais inválidas. Verifique seu email e senha.');
        return;
      }

      toast.success('Login realizado com sucesso!');
      window.location.href = '/';
      // router.push('/');
      // router.refresh();
    } catch (error) {
      toast.error('Ocorreu um erro ao fazer login. Tente novamente.');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50">
      <div className="mx-auto w-full max-w-md">
        <div className="flex justify-center mb-6">
          <img src="/images/header-ache-logo.png" alt="Aché" className="h-16" />
        </div>

        <div className="rounded-lg bg-white p-8 shadow-md">
          <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">
            Login do Médico
          </h1>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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

              <Button
                type="submit"
                className="w-full bg-pink-500 hover:bg-pink-600"
                disabled={isLoading}
              >
                {isLoading ? 'Entrando...' : 'Entrar'}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center text-sm">
            <p className="text-gray-600">
              Não tem uma conta?{' '}
              <Link
                href="/cadastro"
                className="font-medium text-pink-600 hover:text-pink-500"
              >
                Cadastre-se
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
