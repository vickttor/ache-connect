import { MainLayout } from '@/components/layouts/MainLayout';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FileText, History, Users, Award } from 'lucide-react';

export default function Home() {
  const cards = [
    {
      title: 'Prescrição Digital',
      description:
        'Crie e envie prescrições digitais para seus pacientes via WhatsApp',
      icon: <FileText className="h-10 w-10 text-pink-500" />,
      href: '/prescricao',
      color: 'bg-pink-50',
    },
    {
      title: 'Histórico',
      description: 'Acesse o histórico completo de prescrições enviadas',
      icon: <History className="h-10 w-10 text-purple-500" />,
      href: '/historico',
      color: 'bg-purple-50',
    },
    {
      title: 'Pacientes',
      description: 'Gerencie seus pacientes e veja o histórico de prescrições',
      icon: <Users className="h-10 w-10 text-blue-500" />,
      href: '/pacientes',
      color: 'bg-blue-50',
    },
    {
      title: 'AchePoint',
      description: 'Troque seus pontos por benefícios exclusivos',
      icon: <Award className="h-10 w-10 text-amber-500" />,
      href: '/achepoint',
      color: 'bg-amber-50',
    },
  ];

  return (
    <MainLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Bem-vindo à Plataforma de Prescrição Digital
        </h1>
        <p className="mt-2 text-gray-600">
          Emita receitas digitais, acompanhe seus pacientes, e ganhe pontos
          AchePoint
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => (
          <Link key={card.href} href={card.href} className="block h-full">
            <div
              className={`h-full rounded-lg p-6 transition-all hover:shadow-md ${card.color}`}
            >
              <div className="mb-4">{card.icon}</div>
              <h2 className="mb-2 text-xl font-semibold text-gray-900">
                {card.title}
              </h2>
              <p className="text-sm text-gray-600">{card.description}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-10 rounded-lg bg-gradient-to-r from-pink-500 to-purple-600 p-8 text-white">
        <h2 className="mb-2 text-2xl font-bold">
          Nova Funcionalidade: Prescrição Digital
        </h2>
        <p className="mb-4">
          Emita receitas digitais para seus pacientes com apenas alguns cliques
          e envie diretamente para o WhatsApp deles.
        </p>
        <Button asChild className="bg-white text-pink-600 hover:bg-gray-100">
          <Link href="/prescricao">Começar agora</Link>
        </Button>
      </div>
    </MainLayout>
  );
}
