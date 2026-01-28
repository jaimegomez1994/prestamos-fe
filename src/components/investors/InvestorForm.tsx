import { useState, useEffect } from 'react';
import { SlideIn } from '../ui/SlideIn';
import type { Investor, CreateInvestorRequest } from '../../types/investor';

interface InvestorFormProps {
  investor: Investor | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateInvestorRequest) => Promise<void>;
  isLoading: boolean;
}

export function InvestorForm({ investor, isOpen, onClose, onSubmit, isLoading }: InvestorFormProps) {
  const [name, setName] = useState(investor?.name ?? '');
  const [profitPercentage, setProfitPercentage] = useState(investor?.profitPercentage?.toString() ?? '70');
  const [error, setError] = useState('');

  // Reset form when opening/closing or when investor changes
  useEffect(() => {
    if (isOpen) {
      setName(investor?.name ?? '');
      setProfitPercentage(investor?.profitPercentage?.toString() ?? '70');
      setError('');
    }
  }, [isOpen, investor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('El nombre es requerido');
      return;
    }

    const percentage = parseFloat(profitPercentage);
    if (isNaN(percentage) || percentage < 0 || percentage > 100) {
      setError('El porcentaje de ganancia debe estar entre 0 y 100');
      return;
    }

    try {
      await onSubmit({
        name: name.trim(),
        profitPercentage: percentage,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    }
  };

  const title = investor ? 'Editar Inversor' : 'Nuevo Inversor';
  const subtitle = investor
    ? 'Actualiza la informacion del inversor'
    : 'Agrega un nuevo inversor al sistema';

  return (
    <SlideIn
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      footer={
        <button
          type="submit"
          form="investor-form"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#059669] text-white rounded-lg text-sm font-medium hover:bg-[#047857] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {isLoading ? 'Guardando...' : investor ? 'Guardar Cambios' : 'Crear Inversor'}
        </button>
      }
    >
      <form id="investor-form" onSubmit={handleSubmit}>
        {error && (
          <div className="mb-6 p-3 bg-[#FEE2E2] text-[#DC2626] text-sm rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#1C1917] mb-2">
              Nombre <span className="text-[#DC2626]">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-[#E7E5E4] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent"
              placeholder="Nombre del inversor"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1C1917] mb-2">
              Porcentaje de Ganancia <span className="text-[#DC2626]">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                value={profitPercentage}
                onChange={(e) => setProfitPercentage(e.target.value)}
                min="0"
                max="100"
                step="0.01"
                className="w-full px-4 py-3 pr-8 border border-[#E7E5E4] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent font-mono"
                placeholder="70"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A8A29E]">%</span>
            </div>
            <p className="text-xs text-[#A8A29E] mt-1">
              Porcentaje de las ganancias de intereses para el inversor
            </p>
          </div>
        </div>
      </form>
    </SlideIn>
  );
}
