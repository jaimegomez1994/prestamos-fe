import { useState } from 'react';
import {
  useInvestors,
  useCreateInvestor,
  useUpdateInvestor,
  useDeactivateInvestor,
  useActivateInvestor,
} from '../api/investorApi';
import { InvestorTable } from '../components/investors/InvestorTable';
import { InvestorForm } from '../components/investors/InvestorForm';
import { FAB } from '../components/ui/FAB';
import { formatCurrency } from '../lib/format';
import type { Investor, CreateInvestorRequest } from '../types/investor';

function Investors() {
  const [search, setSearch] = useState('');
  const [showInactive, setShowInactive] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingInvestor, setEditingInvestor] = useState<Investor | null>(null);

  const { data, isLoading } = useInvestors({
    search: search || undefined,
    isActive: showInactive ? undefined : true,
  });

  const createMutation = useCreateInvestor();
  const updateMutation = useUpdateInvestor();
  const deactivateMutation = useDeactivateInvestor();
  const activateMutation = useActivateInvestor();

  const handleOpenCreate = () => {
    setEditingInvestor(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (investor: Investor) => {
    setEditingInvestor(investor);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingInvestor(null);
  };

  const handleSubmit = async (formData: CreateInvestorRequest) => {
    if (editingInvestor) {
      await updateMutation.mutateAsync({ id: editingInvestor.id, data: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
    handleCloseForm();
  };

  const handleToggleActive = async (investor: Investor) => {
    if (investor.isActive) {
      await deactivateMutation.mutateAsync(investor.id);
    } else {
      await activateMutation.mutateAsync(investor.id);
    }
  };

  // Calculate stats
  const activeInvestors = data?.investors.filter((i: Investor) => i.isActive) ?? [];
  const totalInvested = data?.investors.reduce((sum: number, i: Investor) => sum + (i.totalInvested ?? 0), 0) ?? 0;
  const totalLoans = data?.investors.reduce((sum: number, i: Investor) => sum + (i.activeLoansCount ?? 0), 0) ?? 0;

  const emptyMessage = search
    ? 'No se encontraron inversores'
    : 'No hay inversores registrados';

  const fabActions = [
    {
      label: 'Nuevo Inversor',
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
          <h1 className="text-2xl md:text-[28px] font-bold text-[#1C1917]">Inversores</h1>
          <p className="text-[#57534E] text-sm md:text-[15px] mt-1">
            {data?.total ?? 0} inversores registrados
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
          Nuevo Inversor
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-[#E7E5E4] rounded-xl p-4">
          <div className="text-xs text-[#A8A29E] uppercase tracking-wide mb-1">Inversores Activos</div>
          <div className="text-2xl font-bold text-[#1C1917]">{activeInvestors.length}</div>
        </div>
        <div className="bg-white border border-[#E7E5E4] rounded-xl p-4">
          <div className="text-xs text-[#A8A29E] uppercase tracking-wide mb-1">Total Invertido</div>
          <div className="text-2xl font-bold text-[#059669] font-mono">{formatCurrency(totalInvested)}</div>
        </div>
        <div className="bg-white border border-[#E7E5E4] rounded-xl p-4">
          <div className="text-xs text-[#A8A29E] uppercase tracking-wide mb-1">Prestamos Activos</div>
          <div className="text-2xl font-bold text-[#1C1917]">{totalLoans}</div>
        </div>
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
            placeholder="Buscar por nombre..."
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

      {/* Investor Table */}
      <InvestorTable
        investors={data?.investors ?? []}
        isLoading={isLoading}
        emptyMessage={emptyMessage}
        onEdit={handleOpenEdit}
        onToggleActive={handleToggleActive}
      />

      {/* Investor Form Slide-in */}
      <InvestorForm
        investor={editingInvestor}
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

export default Investors;
