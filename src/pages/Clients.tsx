import { useState } from 'react';
import {
  useCustomers,
  useCreateCustomer,
  useUpdateCustomer,
  useDeactivateCustomer,
  useActivateCustomer,
} from '../api/customerApi';
import { CustomerTable } from '../components/customers/CustomerTable';
import { CustomerForm } from '../components/customers/CustomerForm';
import { FAB } from '../components/ui/FAB';
import type { Customer, CreateCustomerRequest } from '../types/customer';

function Clients() {
  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
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
    setIsFormOpen(true);
  };

  const handleOpenEdit = (customer: Customer) => {
    setEditingCustomer(customer);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingCustomer(null);
  };

  const handleSubmit = async (formData: CreateCustomerRequest) => {
    if (editingCustomer) {
      await updateMutation.mutateAsync({ id: editingCustomer.id, data: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
    handleCloseForm();
  };

  const handleToggleActive = async (customer: Customer) => {
    if (customer.isActive) {
      await deactivateMutation.mutateAsync(customer.id);
    } else {
      await activateMutation.mutateAsync(customer.id);
    }
  };

  const emptyMessage = search
    ? 'No se encontraron clientes'
    : 'No hay clientes registrados';

  const fabActions = [
    {
      label: 'Nuevo Cliente',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      onClick: handleOpenCreate,
    },
  ];

  return (
    <div className="pb-20 md:pb-0">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-[28px] font-bold text-[#1C1917]">Clientes</h1>
          <p className="text-[#57534E] text-sm md:text-[15px] mt-1">
            {data?.total ?? 0} clientes registrados
          </p>
        </div>
        {/* Desktop only button */}
        <button
          onClick={handleOpenCreate}
          className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-[#059669] text-white rounded-lg text-sm font-medium hover:bg-[#047857] transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Nuevo Cliente
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-6">
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

      {/* Customer Table */}
      <CustomerTable
        customers={data?.customers ?? []}
        isLoading={isLoading}
        emptyMessage={emptyMessage}
        onEdit={handleOpenEdit}
        onToggleActive={handleToggleActive}
      />

      {/* Customer Form Slide-in */}
      <CustomerForm
        customer={editingCustomer}
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        isLoading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Mobile FAB */}
      <FAB actions={fabActions} />
    </div>
  );
}

export default Clients;
