import { MainLayout } from '@/components/layouts/MainLayout';
import { AchePointDashboard } from './dashboard';

export default function AchePointPage() {
  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-purple-800">AchePoint</h1>
        <p className="text-gray-600">
          Programa de benefícios exclusivos para profissionais de saúde
        </p>
      </div>

      <AchePointDashboard />
    </MainLayout>
  );
}
