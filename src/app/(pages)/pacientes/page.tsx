import { MainLayout } from '@/components/layouts/MainLayout';
import { PacientesList } from './list';

export default function PacientesPage() {
  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-purple-800">Pacientes</h1>
        <p className="text-gray-600">Gerencie seus pacientes</p>
      </div>

      <PacientesList />
    </MainLayout>
  );
}
