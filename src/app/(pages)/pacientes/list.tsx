/* eslint-disable @typescript-eslint/no-explicit-any */
// src/app/(pages)/pacientes/list.tsx
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { PacienteDialog } from './dialog';
import {
  FileText,
  Search,
  Pencil,
  Trash2,
  UserPlus,
  FileDown,
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

interface Paciente {
  id: string;
  nome: string;
  idade?: number | null;
  telefone: string;
  ultimaConsulta?: Date;
}

export function PacientesList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentPaciente, setCurrentPaciente] = useState<Paciente | null>(null);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Carregar pacientes da API
  const fetchPacientes = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/pacientes');

      if (!response.ok) {
        throw new Error('Falha ao buscar pacientes');
      }

      const data = await response.json();

      // Mapear os dados para incluir a última consulta (data da última prescrição)
      const pacientesFormatados = await Promise.all(
        data.map(async (paciente: any) => {
          // Buscar última prescrição para cada paciente
          const prescrResponse = await fetch(
            `/api/prescricoes?pacienteId=${paciente.id}`,
          );
          const prescricoes = await prescrResponse.json();

          let ultimaConsulta = undefined;
          if (prescricoes && prescricoes.length > 0) {
            ultimaConsulta = new Date(prescricoes[0].dataEmissao);
          }

          return {
            ...paciente,
            ultimaConsulta,
          };
        }),
      );

      setPacientes(pacientesFormatados);
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error);
      toast.error('Não foi possível carregar os pacientes.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPacientes();
  }, []);

  // Pacientes filtrados pela busca
  const pacientesFiltrados = pacientes.filter(
    (paciente) =>
      paciente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      paciente.telefone.includes(searchTerm),
  );

  // Função para abrir o diálogo de adicionar paciente
  const handleAddPaciente = () => {
    setCurrentPaciente(null);
    setIsAddDialogOpen(true);
  };

  // Função para abrir o diálogo de editar paciente
  const handleEditPaciente = (paciente: Paciente) => {
    setCurrentPaciente(paciente);
    setIsEditDialogOpen(true);
  };

  // Função para deletar paciente
  const handleDeletePaciente = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este paciente?')) {
      return;
    }

    try {
      const response = await fetch(`/api/pacientes/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Falha ao excluir paciente');
      }

      toast.success('Paciente excluído com sucesso!');
      fetchPacientes(); // Recarregar a lista
    } catch (error) {
      console.error('Erro ao excluir paciente:', error);
      toast.error('Não foi possível excluir o paciente.');
    }
  };

  // Função para criar prescrição para paciente
  const handleCreatePrescricao = (id: string) => {
    router.push(`/prescricao?pacienteId=${id}`);
  };

  // Função após salvar paciente (tanto adicionar quanto editar)
  const handlePacienteSalvo = () => {
    fetchPacientes(); // Recarregar a lista
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-gray-400" />
          <Input
            placeholder="Buscar pacientes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <Button
          onClick={handleAddPaciente}
          className="bg-pink-500 hover:bg-pink-600"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Adicionar Paciente
        </Button>
      </div>

      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">Nome</TableHead>
              <TableHead>Idade</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Última Consulta</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Carregando pacientes...
                </TableCell>
              </TableRow>
            ) : pacientesFiltrados.length > 0 ? (
              pacientesFiltrados.map((paciente) => (
                <TableRow key={paciente.id}>
                  <TableCell className="font-medium">{paciente.nome}</TableCell>
                  <TableCell>
                    {paciente.idade ? `${paciente.idade} anos` : '-'}
                  </TableCell>
                  <TableCell>{paciente.telefone}</TableCell>
                  <TableCell>
                    {paciente.ultimaConsulta
                      ? new Date(paciente.ultimaConsulta).toLocaleDateString()
                      : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleCreatePrescricao(paciente.id)}
                        title="Nova prescrição"
                      >
                        <FileText className="h-4 w-4 text-pink-500" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleEditPaciente(paciente)}
                        title="Editar paciente"
                      >
                        <Pencil className="h-4 w-4 text-blue-500" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleDeletePaciente(paciente.id)}
                        title="Remover paciente"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() =>
                          router.push(`/historico?pacienteId=${paciente.id}`)
                        }
                        title="Ver histórico"
                      >
                        <FileDown className="h-4 w-4 text-gray-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  Nenhum paciente encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Diálogo para adicionar paciente */}
      <PacienteDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        paciente={null}
        title="Adicionar Paciente"
        onSave={handlePacienteSalvo}
      />

      {/* Diálogo para editar paciente */}
      <PacienteDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        paciente={currentPaciente}
        title="Editar Paciente"
        onSave={handlePacienteSalvo}
      />
    </div>
  );
}
