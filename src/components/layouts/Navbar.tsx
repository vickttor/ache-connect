// src/components/layouts/Navbar.tsx
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { signOut } from 'next-auth/react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface NavbarProps {
  user?: {
    name?: string | null;
    email?: string | null;
    crm?: string;
    especialidade?: string;
  };
}

export function Navbar({ user }: NavbarProps) {
  const handleSignOut = () => {
    signOut({ callbackUrl: '/login' });
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b bg-white px-6">
      <div className="flex items-center gap-6">
        <Link href="/" className="flex items-center">
          <div className="relative h-10 w-64">
            <Image
              src="/images/header-ache-logo.png"
              alt="Cuidados Pela Vida - A plataforma do Aché Laboratórios"
              fill
              style={{ objectFit: 'contain' }}
              priority
            />
          </div>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/inicio"
            className="text-sm font-medium text-gray-700 hover:text-gray-900 cursor-not-allowed"
            onClick={(e) => {
              e.preventDefault();
            }}
          >
            Página inicial
          </Link>
          <Link
            href="/produtos"
            className="text-sm font-medium text-gray-700 hover:text-gray-900 cursor-not-allowed"
            onClick={(e) => {
              e.preventDefault();
            }}
          >
            Produtos
          </Link>
          <Link
            href="/conteudos"
            className="text-sm font-medium text-gray-700 hover:text-gray-900 cursor-not-allowed"
            onClick={(e) => {
              e.preventDefault();
            }}
          >
            Conteúdos
          </Link>
          <Link
            href="/eventos"
            className="text-sm font-medium text-gray-700 hover:text-gray-900 cursor-not-allowed"
            onClick={(e) => {
              e.preventDefault();
            }}
          >
            Eventos Exclusivos
          </Link>
          <Link
            href="/"
            className="text-sm font-medium text-pink-500 hover:text-pink-600"
          >
            Receita Digital
          </Link>
        </nav>
      </div>
      <div className="flex items-center">
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full"
              >
                <Avatar>
                  <AvatarFallback className="bg-pink-100 text-pink-700">
                    {user.name?.charAt(0) || 'M'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-gray-500">CRM: {user.crm}</p>
                  <p className="text-xs text-gray-500">{user.especialidade}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link
                  href="/perfil"
                  className="cursor-not-allowed"
                  onClick={(e) => {
                    e.preventDefault();
                  }}
                >
                  Meu Perfil
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/achepoint">Meus AchePoints</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="text-red-600"
              >
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Link href="/login">
            <Button variant="outline">Entrar</Button>
          </Link>
        )}
      </div>
    </header>
  );
}
