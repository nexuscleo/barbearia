'use client';

import React from 'react';
import { ServiceItem } from '@/types';
import { Plus, Edit2, Trash2 } from 'lucide-react';

interface AdminServicesListProps {
  services: ServiceItem[];
  onOpenCreateModal: () => void;
  onEditService: (service: ServiceItem) => void;
  onDeleteService: (id: string) => void;
}

export const AdminServicesList: React.FC<AdminServicesListProps> = ({
  services,
  onOpenCreateModal,
  onEditService,
  onDeleteService,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-mono uppercase tracking-wider text-zinc-300 font-bold">
            Catálogo de Serviços da Barbearia
          </h2>
          <p className="text-xs text-zinc-500">
            Gerencie os cortes, barbas e tratamentos oferecidos com seus respectivos preços e tempos.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenCreateModal}
          className="px-3.5 py-1.5 rounded-md bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Novo Serviço
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-zinc-800">
        <table className="w-full text-left text-xs">
          <thead className="bg-zinc-950 text-zinc-400 font-mono uppercase border-b border-zinc-800 text-[11px]">
            <tr>
              <th className="p-3">Serviço</th>
              <th className="p-3">Categoria</th>
              <th className="p-3">Duração</th>
              <th className="p-3">Preço</th>
              <th className="p-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/80 bg-zinc-900/40">
            {services.map((item) => (
              <tr key={item.id} className="hover:bg-zinc-800/30 transition-colors">
                <td className="p-3">
                  <span className="font-semibold text-zinc-200 block">{item.nome}</span>
                  <span className="text-[11px] text-zinc-500 line-clamp-1">{item.descricao}</span>
                </td>
                <td className="p-3 font-mono text-[11px] uppercase text-zinc-400">
                  {item.categoria}
                </td>
                <td className="p-3 font-mono text-zinc-400">{item.duracaoMinutos} min</td>
                <td className="p-3 font-mono font-bold text-amber-400">
                  R$ {Number(item.preco).toFixed(2)}
                </td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => onEditService(item)}
                      className="p-1 rounded text-zinc-400 hover:text-amber-400 hover:bg-zinc-800 transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteService(item.id)}
                      className="p-1 rounded text-zinc-400 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                      title="Excluir"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
