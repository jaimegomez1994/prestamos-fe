import { useState } from 'react';
import {
  useCustomers,
  useCreateCustomer,
  useUpdateCustomer,
  useDeactivateCustomer,
  useActivateCustomer,
} from '../api/customerApi';
import type { Customer, CreateCustomerRequest } from '../types/customer';

function Clientes() {
  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  const { data, isLoading } = useCustomers({
    search: search || undefined,
    isActive: showInactive ? undefined : true,
  });

  const createMutation = useCreateCustomer();
  const updateMutation = useUpdateCustomer();
  const deactivateMutation = useDeactivateCustomer();
  const activateMutation = useActivateCustomer();

  const handleOpenCreate = () => {
    setEditingCustomer(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCustomer(null);
  };

  const handleSubmit = async (formData: CreateCustomerRequest) => {
    if (editingCustomer) {
      await updateMutation.mutateAsync({ id: editingCustomer.id, data: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
    handleCloseModal();
  };

  const handleToggleActive = async (customer: Customer) => {
    if (customer.isActive) {
      await deactivateMutation.mutateAsync(customer.id);
    } else {
      await activateMutation.mutateAsync(customer.id);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
    }).format(amount);
  };

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-[28px] font-bold text-[#1C1917]">Clientes</h1>
          <p className="text-[#57534E] text-[15px] mt-1">
            {data?.total ?? 0} clientes registrados
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#059669] text-white rounded-lg text-sm font-medium hover:bg-[#047857] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Nuevo Cliente
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 relative">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A8A29E]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Buscar por nombre o telefono..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E7E5E4] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-[#57534E] cursor-pointer">
          <input
            type="checkbox"
            checked={showInactive}
            onChange={(e) => setShowInactive(e.target.checked)}
            className="w-4 h-4 rounded border-[#E7E5E4] text-[#059669] focus:ring-[#059669]"
          />
          Mostrar inactivos
        </label>
      </div>

      {/* Customer List */}
      <div className="bg-white border border-[#E7E5E4] rounded-2xl overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-[#A8A29E]">Cargando...</div>
        ) : !data?.customers.length ? (
          <div className="p-12 text-center text-[#A8A29E]">
            {search ? 'No se encontraron clientes' : 'No hay clientes registrados'}
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#E7E5E4] bg-[#FAFAF9]">
                <th className="text-left px-6 py-4 text-[11px] font-semibold uppercase tracking-wide text-[#A8A29E]">
                  Cliente
                </th>
                <th className="text-left px-6 py-4 text-[11px] font-semibold uppercase tracking-wide text-[#A8A29E]">
                  Telefono
                </th>
                <th className="text-right px-6 py-4 text-[11px] font-semibold uppercase tracking-wide text-[#A8A29E]">
                  Prestamos
                </th>
                <th className="text-right px-6 py-4 text-[11px] font-semibold uppercase tracking-wide text-[#A8A29E]">
                  Adeudo
                </th>
                <th className="text-center px-6 py-4 text-[11px] font-semibold uppercase tracking-wide text-[#A8A29E]">
                  Estado
                </th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {data.customers.map((customer) => (
                <tr
                  key={customer.id}
                  className="border-b border-[#E7E5E4] last:border-0 hover:bg-[#FAFAF9] transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="font-medium text-[#1C1917]">{customer.name}</div>
                    {customer.notes && (
                      <div className="text-xs text-[#A8A29E] mt-0.5 truncate max-w-[200px]">
                        {customer.notes}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-[#57534E]">
                    {customer.phone || '-'}
                  </td>
                  <td className="px-6 py-4 text-right font-medium">
                    {customer.activeLoansCount ?? 0}
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-medium">
                    {formatCurrency(customer.totalOwed ?? 0)}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                        customer.isActive
                          ? 'bg-[#D1FAE5] text-[#047857]'
                          : 'bg-[#FEE2E2] text-[#DC2626]'
                      }`}
                    >
                      {customer.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleOpenEdit(customer)}
                        className="p-2 text-[#57534E] hover:text-[#1C1917] hover:bg-[#F5F5F4] rounded-lg transition-colors"
                        title="Editar"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleToggleActive(customer)}
                        className={`p-2 rounded-lg transition-colors ${
                          customer.isActive
                            ? 'text-[#DC2626] hover:bg-[#FEE2E2]'
                            : 'text-[#059669] hover:bg-[#D1FAE5]'
                        }`}
                        title={customer.isActive ? 'Desactivar' : 'Activar'}
                      >
                        {customer.isActive ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Slide-in Panel */}
      {isModalOpen && (
        <CustomerSlideIn
          customer={editingCustomer}
          onClose={handleCloseModal}
          onSubmit={handleSubmit}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </div>
  );
}

interface CustomerSlideInProps {
  customer: Customer | null;
  onClose: () => void;
  onSubmit: (data: CreateCustomerRequest) => Promise<void>;
  isLoading: boolean;
}

function CustomerSlideIn({ customer, onClose, onSubmit, isLoading }: CustomerSlideInProps) {
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

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 transition-opacity"
        onClick={onClose}
      />

      {/* Slide-in Panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col animate-slide-in">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-[#E7E5E4]">
          <div>
            <h2 className="text-xl font-semibold text-[#1C1917]">
              {customer ? 'Editar Cliente' : 'Nuevo Cliente'}
            </h2>
            <p className="text-sm text-[#A8A29E] mt-1">
              {customer ? 'Actualiza la informacion del cliente' : 'Agrega un nuevo cliente al sistema'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-[#A8A29E] hover:text-[#1C1917] hover:bg-[#F5F5F4] rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto px-6 py-6">
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
          </div>

          {/* Footer with Action Button */}
          <div className="px-6 py-4 border-t border-[#E7E5E4] bg-white">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#059669] text-white rounded-lg text-sm font-medium hover:bg-[#047857] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {isLoading ? 'Guardando...' : customer ? 'Guardar Cambios' : 'Crear Cliente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Clientes;
