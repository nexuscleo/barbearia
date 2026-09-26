'use client';

import React from 'react';
import { ServiceItem } from '@/types';

export interface ServiceFormData {
  id: string;
  nome: string;
  preco: string;
  duracaoMinutos: string;
  descricao: string;
  categoria: 'cabelo' | 'barba' | 'combo' | 'estetica';
  destaque: boolean;
}

interface AdminServiceModalProps {
  isOpen: boolean;
  serviceForm: ServiceFormData;
  onChange: (updates: Partial<ServiceFormData>) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const AdminServiceModal: React.FC<AdminServiceModalProps> = ({
  isOpen,
  serviceForm,
  onChange,
  onClose,
  onSubmit,
}) => {
  if (!isOpen) return null;

  const isEditing = Boolean(serviceForm.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg max-w-md w-full p-6 space-y-4 shadow-xl">
        <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
          <h2 className="text-sm font-bold text-zinc-100 uppercase font-mono tracking-wider">
            {isEditing ? 'Editar Serviço' : 'Novo Serviço'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-300 text-sm font-mono"
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3.5 text-xs">
          <div>
            <label htmlFor="service-nome" className="block text-zinc-400 mb-1">
              Nome do Serviço *
            </label>
            <input
              id="service-nome"
              type="text"
              required
              value={serviceForm.nome}
              onChange={(e) => onChange({ nome: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 rounded px-3 py-2 text-zinc-100 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="service-preco" className="block text-zinc-400 mb-1">
                Preço (R$) *
              </label>
              <input
                id="service-preco"
                type="number"
                step="0.5"
                required
                value={serviceForm.preco}
                onChange={(e) => onChange({ preco: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 rounded px-3 py-2 text-zinc-100 focus:outline-none font-mono"
              />
            </div>
            <div>
              <label htmlFor="service-duracao" className="block text-zinc-400 mb-1">
                Duração (Minutos) *
              </label>
              <input
                id="service-duracao"
                type="number"
                step="5"
                required
                value={serviceForm.duracaoMinutos}
                onChange={(e) => onChange({ duracaoMinutos: e.target.value })}
                className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 rounded px-3 py-2 text-zinc-100 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label htmlFor="service-categoria" className="block text-zinc-400 mb-1">
              Categoria
            </label>
            <select
              id="service-categoria"
              value={serviceForm.categoria}
              onChange={(e) =>
                onChange({
                  categoria: e.target.value as ServiceItem['categoria'],
                })
              }
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 rounded px-3 py-2 text-zinc-100 focus:outline-none font-mono"
            >
              <option value="cabelo">Cabelo</option>
              <option value="barba">Barba</option>
              <option value="combo">Combo</option>
              <option value="estetica">Estética</option>
            </select>
          </div>

          <div>
            <label htmlFor="service-descricao" className="block text-zinc-400 mb-1">
              Descrição Detalhada
            </label>
            <textarea
              id="service-descricao"
              rows={3}
              value={serviceForm.descricao}
              onChange={(e) => onChange({ descricao: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-800 focus:border-amber-500 rounded px-3 py-2 text-zinc-100 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="service-destaque"
              checked={serviceForm.destaque}
              onChange={(e) => onChange({ destaque: e.target.checked })}
              className="rounded bg-zinc-900 border-zinc-800 text-amber-500 focus:ring-0"
            />
            <label htmlFor="service-destaque" className="text-zinc-300 cursor-pointer">
              Exibir em Destaque no Menu Principal
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-colors"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
