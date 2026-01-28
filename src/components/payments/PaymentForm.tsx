import { useState, useEffect } from 'react';
import { SlideIn } from '../ui/SlideIn';
import { useLoans } from '../../api/loanApi';
import type { Payment, CreatePaymentRequest } from '../../types/payment';
import type { PaymentMethod } from '../../types/loan';
import { PAYMENT_METHOD_LABELS } from '../../types/loan';
import { formatCurrency } from '../../lib/format';

interface PaymentFormProps {
  payment: Payment | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePaymentRequest) => Promise<void>;
  isLoading: boolean;
  preselectedLoanId?: string;
}

export function PaymentForm({
  payment,
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  preselectedLoanId,
}: PaymentFormProps) {
  const [loanId, setLoanId] = useState(payment?.loanId ?? preselectedLoanId ?? '');
  const [paymentDate, setPaymentDate] = useState(
    payment?.paymentDate ?? new Date().toISOString().split('T')[0]
  );
  const [interestPaid, setInterestPaid] = useState(payment?.interestPaid?.toString() ?? '');
  const [capitalPaid, setCapitalPaid] = useState(payment?.capitalPaid?.toString() ?? '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    (payment?.paymentMethod as PaymentMethod) ?? 'EFECTIVO'
  );
  const [notes, setNotes] = useState(payment?.notes ?? '');
  const [error, setError] = useState('');

  const { data: loansData } = useLoans({ isSettled: false, pageSize: 100 });

  const isEditing = !!payment;

  // Reset form when opening/closing or when payment changes
  useEffect(() => {
    if (isOpen) {
      setLoanId(payment?.loanId ?? preselectedLoanId ?? '');
      setPaymentDate(payment?.paymentDate ?? new Date().toISOString().split('T')[0]);
      setInterestPaid(payment?.interestPaid?.toString() ?? '');
      setCapitalPaid(payment?.capitalPaid?.toString() ?? '');
      setPaymentMethod((payment?.paymentMethod as PaymentMethod) ?? 'EFECTIVO');
      setNotes(payment?.notes ?? '');
      setError('');
    }
  }, [isOpen, payment, preselectedLoanId]);

  const selectedLoan = loansData?.loans.find((l) => l.id === loanId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!loanId) {
      setError('Selecciona un prestamo');
      return;
    }

    const interest = parseFloat(interestPaid) || 0;
    const capital = parseFloat(capitalPaid) || 0;

    if (interest < 0 || capital < 0) {
      setError('Los montos no pueden ser negativos');
      return;
    }

    if (interest === 0 && capital === 0) {
      setError('Debe ingresar al menos un monto');
      return;
    }

    if (!paymentDate) {
      setError('Selecciona una fecha');
      return;
    }

    try {
      await onSubmit({
        loanId,
        paymentDate,
        interestPaid: interest,
        capitalPaid: capital,
        paymentMethod,
        notes: notes.trim() || undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    }
  };

  const title = isEditing ? 'Editar Pago' : 'Registrar Pago';
  const subtitle = isEditing
    ? 'Actualiza la informacion del pago'
    : 'Registra un nuevo pago';

  return (
    <SlideIn
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      footer={
        <button
          type="submit"
          form="payment-form"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#059669] text-white rounded-lg text-sm font-medium hover:bg-[#047857] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          {isLoading ? 'Guardando...' : isEditing ? 'Guardar Cambios' : 'Registrar Pago'}
        </button>
      }
    >
      <form id="payment-form" onSubmit={handleSubmit}>
        {error && (
          <div className="mb-6 p-3 bg-[#FEE2E2] text-[#DC2626] text-sm rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[#1C1917] mb-2">
              Prestamo <span className="text-[#DC2626]">*</span>
            </label>
            <select
              value={loanId}
              onChange={(e) => setLoanId(e.target.value)}
              disabled={isEditing}
              className="w-full px-4 py-3 border border-[#E7E5E4] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent disabled:bg-[#F5F5F4] disabled:cursor-not-allowed"
            >
              <option value="">Seleccionar prestamo...</option>
              {loansData?.loans.map((loan) => (
                <option key={loan.id} value={loan.id}>
                  {loan.customerName} - {formatCurrency(loan.currentBalance)} pendiente
                </option>
              ))}
            </select>
          </div>

          {selectedLoan && (
            <div className="p-3 bg-[#F5F5F4] rounded-lg text-sm">
              <div className="flex justify-between mb-1">
                <span className="text-[#57534E]">Monto Original:</span>
                <span className="font-mono">{formatCurrency(selectedLoan.originalAmount)}</span>
              </div>
              <div className="flex justify-between mb-1">
                <span className="text-[#57534E]">Saldo Actual:</span>
                <span className="font-mono text-[#DC2626]">{formatCurrency(selectedLoan.currentBalance)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#57534E]">Inversor:</span>
                <span>{selectedLoan.investorName}</span>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[#1C1917] mb-2">
              Fecha del Pago <span className="text-[#DC2626]">*</span>
            </label>
            <input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="w-full px-4 py-3 border border-[#E7E5E4] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#1C1917] mb-2">
                Interes <span className="text-[#DC2626]">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A8A29E]">$</span>
                <input
                  type="number"
                  value={interestPaid}
                  onChange={(e) => setInterestPaid(e.target.value)}
                  min="0"
                  step="0.01"
                  className="w-full pl-8 pr-4 py-3 border border-[#E7E5E4] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent font-mono"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1C1917] mb-2">
                Capital <span className="text-[#DC2626]">*</span>
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A8A29E]">$</span>
                <input
                  type="number"
                  value={capitalPaid}
                  onChange={(e) => setCapitalPaid(e.target.value)}
                  min="0"
                  step="0.01"
                  className="w-full pl-8 pr-4 py-3 border border-[#E7E5E4] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent font-mono"
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1C1917] mb-2">
              Metodo de Pago <span className="text-[#DC2626]">*</span>
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full px-4 py-3 border border-[#E7E5E4] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent"
            >
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
        </div>
      </form>
    </SlideIn>
  );
}
