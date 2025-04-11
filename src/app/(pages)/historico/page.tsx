import { MainLayout } from '@/components/layouts/MainLayout';
import { HistoricoList } from './list';

export default function HistoricoPage() {
  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-purple-800">Histórico</h1>
        <p className="text-gray-600">
          Visualize e gerencie o histórico de prescrições
        </p>
      </div>

      <HistoricoList />
    </MainLayout>
  );
}
