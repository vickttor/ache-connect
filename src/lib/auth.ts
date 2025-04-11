// src/lib/auth.ts
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { prisma } from '@/lib/prisma';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      crm: string;
      especialidade: string;
    };
  }
  interface User {
    id: string;
    crm: string;
    especialidade: string;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    crm: string;
    especialidade: string;
  }
}

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  },
  pages: {
    signIn: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        senha: { label: 'Senha', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.senha) {
          return null;
        }

        const medico = await prisma.medico.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!medico || !medico.senha) {
          return null;
        }

        const isPasswordValid = await compare(credentials.senha, medico.senha);

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: medico.id,
          name: medico.nome,
          email: medico.email,
          crm: medico.crm,
          especialidade: medico.especialidade,
        };
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.crm = token.crm as string;
        session.user.especialidade = token.especialidade as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.crm = user.crm;
        token.especialidade = user.especialidade;
      }
      return token;
    },
  },
};
