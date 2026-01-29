import { useState } from 'react';
import {
  usePayments,
  useCreatePayment,
  useUpdatePayment,
  useDeletePayment,
} from '../api/paymentApi';
import { useUploadAttachments } from '../api/attachmentApi';
import { PaymentTable } from '../components/payments/PaymentTable';
import { PaymentForm } from '../components/payments/PaymentForm';
import { FAB } from '../components/ui/FAB';
import type { Payment, CreatePaymentRequest } from '../types/payment';
import { formatCurrency } from '../lib/format';

function Payments() {
  const [search, setSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);

  const { data, isLoading } = usePayments({
    search: search || undefined,
  });

  const createMutation = useCreatePayment();
  const updateMutation = useUpdatePayment();
  const deleteMutation = useDeletePayment();
  const uploadMutation = useUploadAttachments();

  const handleOpenCreate = () => {
    setEditingPayment(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (payment: Payment) => {
    setEditingPayment(payment);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingPayment(null);
  };

  const handleSubmit = async (formData: CreatePaymentRequest, files: File[]) => {
    let paymentId: string;

    if (editingPayment) {
      const updated = await updateMutation.mutateAsync({
        id: editingPayment.id,
        data: {
          paymentDate: formData.paymentDate,
          interestPaid: formData.interestPaid,
          capitalPaid: formData.capitalPaid,
          paymentMethod: formData.paymentMethod,
          notes: formData.notes,
        },
      });
      paymentId = updated.id;
    } else {
      const created = await createMutation.mutateAsync(formData);
      paymentId = created.id;
    }

    if (files.length > 0) {
      await uploadMutation.mutateAsync({
        entityType: 'payments',
        entityId: paymentId,
        files,
      });
    }

    handleCloseForm();
  };

  const handleDelete = async (payment: Payment) => {
    if (confirm(`¿Eliminar el pago de ${payment.customerName} por ${formatCurrency(payment.totalPaid)}?`)) {
      await deleteMutation.mutateAsync(payment.id);
    }
  };

  const emptyMessage = search
    ? 'No se encontraron pagos'
    : 'No hay pagos registrados';

  const totalPayments = data?.payments.length ?? 0;
  const totalAmount = data?.payments.reduce((sum: number, p: Payment) => sum + p.totalPaid, 0) ?? 0;
  const totalInterest = data?.payments.reduce((sum: number, p: Payment) => sum + p.interestPaid, 0) ?? 0;
  const totalCapital = data?.payments.reduce((sum: number, p: Payment) => sum + p.capitalPaid, 0) ?? 0;

  const fabActions = [
    {
      label: 'Registrar Pago',
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
          <h1 className="text-2xl md:text-[28px] font-bold text-[#1C1917]">Pagos</h1>
          <p className="text-[#57534E] text-sm md:text-[15px] mt-1">
            {totalPayments} pagos — Total: {formatCurrency(totalAmount)}
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
          Registrar Pago
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-[#E7E5E4] rounded-xl p-4">
          <div className="text-[13px] text-[#A8A29E] mb-1">Total Recaudado</div>
          <div className="text-lg font-bold font-mono">{formatCurrency(totalAmount)}</div>
        </div>
        <div className="bg-white border border-[#E7E5E4] rounded-xl p-4">
          <div className="text-[13px] text-[#A8A29E] mb-1">Intereses</div>
          <div className="text-lg font-bold font-mono text-[#059669]">{formatCurrency(totalInterest)}</div>
        </div>
        <div className="bg-white border border-[#E7E5E4] rounded-xl p-4 col-span-2 md:col-span-1">
          <div className="text-[13px] text-[#A8A29E] mb-1">Capital</div>
          <div className="text-lg font-bold font-mono">{formatCurrency(totalCapital)}</div>
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
            placeholder="Buscar por cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#E7E5E4] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent"
          />
        </div>
      </div>

      {/* Payment Table */}
      <PaymentTable
        payments={data?.payments ?? []}
        isLoading={isLoading}
        emptyMessage={emptyMessage}
        onEdit={handleOpenEdit}
        onDelete={handleDelete}
      />

      {/* Payment Form Slide-in */}
      <PaymentForm
        payment={editingPayment}
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

export default Payments;
