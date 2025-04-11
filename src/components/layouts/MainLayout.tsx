// src/components/layouts/MainLayout.tsx
'use client';

import { ReactNode } from 'react';
import { useSession } from 'next-auth/react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { redirect } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const session = useSession();
  const user = session?.data?.user; // Acesso seguro com optional chaining

  if (session.status === 'loading') {
    return <LoadingLayout />;
  }

  if (session.status === 'unauthenticated') {
    redirect('/login');
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar user={user} />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}

function LoadingLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="h-16 border-b bg-white">
        <div className="container mx-auto h-full px-4">
          <div className="flex h-full items-center justify-between">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>
      </div>
      <div className="flex flex-1">
        <div className="w-64 border-r bg-white p-4">
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <main className="flex-1 p-6">
          <Skeleton className="h-10 w-1/3 mb-6" />
          <Skeleton className="h-32 w-full mb-4" />
          <Skeleton className="h-32 w-full mb-4" />
        </main>
      </div>
    </div>
  );
}
