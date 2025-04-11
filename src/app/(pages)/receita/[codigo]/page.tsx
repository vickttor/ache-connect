import { PublicHeader } from '@/components/layouts/PublicHeader';
import { ReceitaPublica } from '@/components/receita/ReceitaPublica';

interface ReceitaPageProps {
  params: Promise<{
    codigo: string;
  }>;
}

export default async function ReceitaPage({ params }: ReceitaPageProps) {
  const { codigo } = await params;
  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />

      <main className="container mx-auto max-w-4xl px-4 py-8">
        <ReceitaPublica codigo={codigo} />
      </main>

      <footer className="bg-white py-6 text-center text-sm text-gray-500">
        <div className="container mx-auto">
          <p>
            © {new Date().getFullYear()} Aché Laboratórios - Todos os direitos
            reservados
          </p>
          <p className="mt-1">
            Este é um documento oficial de prescrição médica digital
          </p>
        </div>
      </footer>
    </div>
  );
}
