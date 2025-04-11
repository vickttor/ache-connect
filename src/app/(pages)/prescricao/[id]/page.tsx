import { MainLayout } from '@/components/layouts/MainLayout';
import { PrescricaoDetalhes } from '@/components/prescricao/PrescricaoDetalhes';

interface PrescricaoDetalhesPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PrescricaoDetalhesPage({
  params,
}: PrescricaoDetalhesPageProps) {
  const { id } = await params;
  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-purple-800">
          Detalhes da Prescrição
        </h1>
        <p className="text-gray-600">
          Visualize os detalhes completos da prescrição
        </p>
      </div>

      <PrescricaoDetalhes id={id} />
    </MainLayout>
  );
}
