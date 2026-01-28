import { useState } from 'react';
import { SlideIn } from '../ui/SlideIn';
import type { Customer, CreateCustomerRequest } from '../../types/customer';

interface CustomerFormProps {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCustomerRequest) => Promise<void>;
  isLoading: boolean;
}

export function CustomerForm({ customer, isOpen, onClose, onSubmit, isLoading }: CustomerFormProps) {
  const [name, setName] = useState(customer?.name ?? '');
  const [phone, setPhone] = useState(customer?.phone ?? '');
  const [notes, setNotes] = useState(customer?.notes ?? '');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('El nombre es requerido');
      return;
    }

    try {
      await onSubmit({
        name: name.trim(),
        phone: phone.trim() || undefined,
        notes: notes.trim() || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    }
  };

  const title = customer ? 'Editar Cliente' : 'Nuevo Cliente';
  const subtitle = customer
    ? 'Actualiza la informacion del cliente'
    : 'Agrega un nuevo cliente al sistema';

  return (
    <SlideIn
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      footer={
        <button
          type="submit"
          form="customer-form"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#059669] text-white rounded-lg text-sm font-medium hover:bg-[#047857] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          {isLoading ? 'Guardando...' : customer ? 'Guardar Cambios' : 'Crear Cliente'}
        </button>
      }
    >
      <form id="customer-form" onSubmit={handleSubmit}>
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
              placeholder="Nombre del cliente"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1C1917] mb-2">
              Telefono
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 border border-[#E7E5E4] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent"
              placeholder="Ej: 55 1234 5678"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1C1917] mb-2">
              Notas (Opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-[#E7E5E4] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent resize-none"
              placeholder="Notas adicionales sobre el cliente..."
            />
          </div>
        </div>
      </form>
    </SlideIn>
  );
}
