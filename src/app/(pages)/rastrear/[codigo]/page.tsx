import { MainLayout } from '@/components/layouts/MainLayout';
import { PrescricaoRastreamento } from '@/components/rastreamento/PrescricaoRastreamento';

interface RastreamentoProps {
  params: Promise<{
    codigo: string;
  }>;
}

export default async function RastreamentoPage({ params }: RastreamentoProps) {
  const { codigo } = await params;
  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-purple-800">
          Rastreamento de Prescrição
        </h1>
        <p className="text-gray-600">
          Verifique os detalhes e o status da sua prescrição médica
        </p>
      </div>

      <PrescricaoRastreamento codigo={codigo} />
    </MainLayout>
  );
}
