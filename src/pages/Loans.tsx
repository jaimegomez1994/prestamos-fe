import { useState } from 'react';
import {
  useLoans,
  useCreateLoan,
  useUpdateLoan,
  useReopenLoan,
} from '../api/loanApi';
import { useUploadAttachments } from '../api/attachmentApi';
import { LoanTable } from '../components/loans/LoanTable';
import { LoanForm } from '../components/loans/LoanForm';
import { FAB } from '../components/ui/FAB';
import type { Loan, CreateLoanRequest } from '../types/loan';

function Loans() {
  const [search, setSearch] = useState('');
  const [showSettled, setShowSettled] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState<Loan | null>(null);

  const { data, isLoading } = useLoans({
    search: search || undefined,
    isSettled: showSettled ? undefined : false,
  });

  const createMutation = useCreateLoan();
  const updateMutation = useUpdateLoan();
  const reopenMutation = useReopenLoan();
  const uploadMutation = useUploadAttachments();

  const handleOpenCreate = () => {
    setEditingLoan(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (loan: Loan) => {
    setEditingLoan(loan);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingLoan(null);
  };

  const handleSubmit = async (formData: CreateLoanRequest, files: File[]) => {
    let loanId: string;

    if (editingLoan) {
      const updated = await updateMutation.mutateAsync({
        id: editingLoan.id,
        data: formData,
      });
      loanId = updated.id;
    } else {
      const created = await createMutation.mutateAsync(formData);
      loanId = created.id;
    }

    if (files.length > 0) {
      await uploadMutation.mutateAsync({
        entityType: 'loans',
        entityId: loanId,
        files,
      });
    }

    handleCloseForm();
  };

  const handleReopen = async (loan: Loan) => {
    if (confirm(`¿Reabrir el prestamo de ${loan.customerName}?`)) {
      await reopenMutation.mutateAsync(loan.id);
    }
  };

  const emptyMessage = search
    ? 'No se encontraron prestamos'
    : 'No hay prestamos registrados';

  const totalActive = data?.loans.filter((l) => !l.isSettled).length ?? 0;
  const totalCapital = data?.loans
    .filter((l) => !l.isSettled)
    .reduce((sum, l) => sum + l.currentBalance, 0) ?? 0;

  const fabActions = [
    {
      label: 'Nuevo Prestamo',
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
          <h1 className="text-2xl md:text-[28px] font-bold text-[#1C1917]">Prestamos</h1>
          <p className="text-[#57534E] text-sm md:text-[15px] mt-1">
            {totalActive} prestamos activos — Capital: ${totalCapital.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
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
          Nuevo Prestamo
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
            placeholder="Buscar por cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E7E5E4] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent"
          />
        </div>
        <label className="flex items-center gap-2 text-sm text-[#57534E] cursor-pointer">
          <input
            type="checkbox"
            checked={showSettled}
            onChange={(e) => setShowSettled(e.target.checked)}
            className="w-4 h-4 rounded border-[#E7E5E4] text-[#059669] focus:ring-[#059669]"
          />
          Mostrar liquidados
        </label>
      </div>

      {/* Loan Table */}
      <LoanTable
        loans={data?.loans ?? []}
        isLoading={isLoading}
        emptyMessage={emptyMessage}
        onEdit={handleOpenEdit}
        onReopen={handleReopen}
      />

      {/* Loan Form Slide-in */}
      <LoanForm
        loan={editingLoan}
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

export default Loans;
