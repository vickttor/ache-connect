import { PublicHeader } from '@/components/layouts/PublicHeader';
import { DescontoPublico } from '@/components/desconto/DescontoPublico';

interface DescontoPageProps {
  params: Promise<{
    codigo: string;
  }>;
}

export default async function DescontoPage({ params }: DescontoPageProps) {
  const { codigo } = await params;

  return (
    <div className="min-h-screen bg-gray-50">
      <PublicHeader />

      <main className="container mx-auto max-w-4xl px-4 py-8">
        <DescontoPublico codigo={codigo} />
      </main>

      <footer className="bg-white py-6 text-center text-sm text-gray-500">
        <div className="container mx-auto">
          <p>
            © {new Date().getFullYear()} Aché Laboratórios - Todos os direitos
            reservados
          </p>
        </div>
      </footer>
    </div>
  );
}
