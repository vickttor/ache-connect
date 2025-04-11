// app/prescricao/page.tsx
import { MainLayout } from '@/components/layouts/MainLayout';
import { PrescricaoForm } from '@/components/forms/PrescricaoForm';

export default function PrescricaoPage() {
  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-purple-800">Prescrição</h1>
        <p className="text-gray-600">
          Crie e envie prescrições digitais para seus pacientes
        </p>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow">
        <PrescricaoForm />
      </div>
    </MainLayout>
  );
}
