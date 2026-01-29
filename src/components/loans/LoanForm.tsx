import { useState, useEffect } from 'react';
import { SlideIn } from '../ui/SlideIn';
import { useCustomers } from '../../api/customerApi';
import { useInvestors } from '../../api/investorApi';
import { FileUploadZone } from '../ui/FileUploadZone';
import { AttachmentList } from '../ui/AttachmentList';
import type { Loan, CreateLoanRequest, PaymentMethod } from '../../types/loan';
import { PAYMENT_METHOD_LABELS } from '../../types/loan';

interface LoanFormProps {
  loan: Loan | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateLoanRequest, files: File[]) => Promise<void>;
  isLoading: boolean;
}

export function LoanForm({ loan, isOpen, onClose, onSubmit, isLoading }: LoanFormProps) {
  const [customerId, setCustomerId] = useState(loan?.customerId ?? '');
  const [investorId, setInvestorId] = useState(loan?.investorId ?? '');
  const [originalAmount, setOriginalAmount] = useState(loan?.originalAmount?.toString() ?? '');
  const [loanDate, setLoanDate] = useState(loan?.loanDate ?? new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | ''>(
    (loan?.paymentMethod as PaymentMethod) ?? ''
  );
  const [notes, setNotes] = useState(loan?.notes ?? '');
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [error, setError] = useState('');

  const { data: customersData } = useCustomers({ isActive: true, pageSize: 100 });
  const { data: investorsData } = useInvestors();

  useEffect(() => {
    if (isOpen) {
      setCustomerId(loan?.customerId ?? '');
      setInvestorId(loan?.investorId ?? '');
      setOriginalAmount(loan?.originalAmount?.toString() ?? '');
      setLoanDate(loan?.loanDate ?? new Date().toISOString().split('T')[0]);
      setPaymentMethod((loan?.paymentMethod as PaymentMethod) ?? '');
      setNotes(loan?.notes ?? '');
      setPendingFiles([]);
      setError('');
    }
  }, [isOpen, loan]);

  const isEditing = !!loan;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!customerId) {
      setError('Selecciona un cliente');
      return;
    }

    if (!investorId) {
      setError('Selecciona un inversor');
      return;
    }

    const amount = parseFloat(originalAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Monto debe ser mayor a 0');
      return;
    }

    if (!loanDate) {
      setError('Selecciona una fecha');
      return;
    }

    try {
      await onSubmit({
        customerId,
        investorId,
        originalAmount: amount,
        loanDate,
        paymentMethod: paymentMethod || undefined,
        notes: notes.trim() || undefined,
      }, pendingFiles);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    }
  };

  const title = isEditing ? 'Editar Prestamo' : 'Nuevo Prestamo';
  const subtitle = isEditing
    ? 'Actualiza la informacion del prestamo'
    : 'Registra un nuevo prestamo';

  return (
    <SlideIn
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      footer={
        <button
          type="submit"
          form="loan-form"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#059669] text-white rounded-lg text-sm font-medium hover:bg-[#047857] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          {isLoading ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Crear Prestamo'}
        </button>
      }
    >
      <form id="loan-form" onSubmit={handleSubmit}>
        {error && (
          <div className="mb-6 p-3 bg-[#FEE2E2] text-[#DC2626] text-sm rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#1C1917] mb-2">
              Cliente <span className="text-[#DC2626]">*</span>
            </label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              className="w-full px-4 py-3 border border-[#E7E5E4] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent disabled:bg-[#F5F5F4] disabled:cursor-not-allowed"
            >
              <option value="">Seleccionar cliente...</option>
              {customersData?.customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1C1917] mb-2">
              Inversor <span className="text-[#DC2626]">*</span>
            </label>
            <select
              value={investorId}
              onChange={(e) => setInvestorId(e.target.value)}
              className="w-full px-4 py-3 border border-[#E7E5E4] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent disabled:bg-[#F5F5F4] disabled:cursor-not-allowed"
            >
              <option value="">Seleccionar inversor...</option>
              {investorsData?.investors.map((investor) => (
                <option key={investor.id} value={investor.id}>
                  {investor.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1C1917] mb-2">
              Monto <span className="text-[#DC2626]">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A8A29E]">$</span>
              <input
                type="number"
                value={originalAmount}
                onChange={(e) => setOriginalAmount(e.target.value)}
                  min="1"
                step="0.01"
                className="w-full pl-8 pr-4 py-3 border border-[#E7E5E4] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent disabled:bg-[#F5F5F4] disabled:cursor-not-allowed font-mono"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1C1917] mb-2">
              Fecha del Prestamo <span className="text-[#DC2626]">*</span>
            </label>
            <input
              type="date"
              value={loanDate}
              onChange={(e) => setLoanDate(e.target.value)}
              className="w-full px-4 py-3 border border-[#E7E5E4] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent disabled:bg-[#F5F5F4] disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1C1917] mb-2">
              Metodo de Pago
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod | '')}
              className="w-full px-4 py-3 border border-[#E7E5E4] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent"
            >
              <option value="">Sin especificar</option>
              {(Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]).map((method) => (
                <option key={method} value={method}>
                  {PAYMENT_METHOD_LABELS[method]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1C1917] mb-2">
              Notas (Opcional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border border-[#E7E5E4] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent resize-none"
              placeholder="Notas adicionales..."
            />
          </div>

          {isEditing && loan && (
            <AttachmentList entityType="loans" entityId={loan.id} />
          )}

          <FileUploadZone files={pendingFiles} onChange={setPendingFiles} />
        </div>
      </form>
    </SlideIn>
  );
}
