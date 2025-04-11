'use client';

import './globals.css';
import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import { Providers } from './Providers';
const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
