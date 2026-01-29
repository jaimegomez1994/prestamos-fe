import { useState, useEffect, useMemo } from 'react';
import { SlideIn } from '../ui/SlideIn';
import { useCustomers } from '../../api/customerApi';
import { useLoans } from '../../api/loanApi';
import { FileUploadZone } from '../ui/FileUploadZone';
import { AttachmentList } from '../ui/AttachmentList';
import type { Payment, CreatePaymentRequest } from '../../types/payment';
import type { PaymentMethod } from '../../types/loan';
import { PAYMENT_METHOD_LABELS } from '../../types/loan';
import { formatCurrency } from '../../lib/format';

interface PaymentFormProps {
  payment: Payment | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePaymentRequest, files: File[]) => Promise<void>;
  isLoading: boolean;
  preselectedCustomerId?: string;
}

export function PaymentForm({
  payment,
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  preselectedCustomerId,
}: PaymentFormProps) {
  const [customerId, setCustomerId] = useState(preselectedCustomerId ?? '');
  const [paymentDate, setPaymentDate] = useState(
    payment?.paymentDate ?? new Date().toISOString().split('T')[0]
  );
  const [interestPaid, setInterestPaid] = useState(payment?.interestPaid?.toString() ?? '');
  const [capitalPaid, setCapitalPaid] = useState(payment?.capitalPaid?.toString() ?? '');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    (payment?.paymentMethod as PaymentMethod) ?? 'EFECTIVO'
  );
  const [notes, setNotes] = useState(payment?.notes ?? '');
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [error, setError] = useState('');

  const { data: customersData } = useCustomers({ pageSize: 200 });

  // Fetch active loans for selected customer
  const { data: loansData } = useLoans(
    customerId ? { customerId, isSettled: false, pageSize: 100 } : { customerId: '__none__', pageSize: 0 }
  );

  const activeLoans = useMemo(() => loansData?.loans ?? [], [loansData]);

  const totalBalance = useMemo(
    () => activeLoans.reduce((sum, l) => sum + l.currentBalance, 0),
    [activeLoans]
  );

  const isEditing = !!payment;

  // Reset form when opening/closing or when payment changes
  useEffect(() => {
    if (isOpen) {
      setCustomerId(preselectedCustomerId ?? '');
      setPaymentDate(payment?.paymentDate ?? new Date().toISOString().split('T')[0]);
      setInterestPaid(payment?.interestPaid?.toString() ?? '');
      setCapitalPaid(payment?.capitalPaid?.toString() ?? '');
      setPaymentMethod((payment?.paymentMethod as PaymentMethod) ?? 'EFECTIVO');
      setNotes(payment?.notes ?? '');
      setPendingFiles([]);
      setError('');
    }
  }, [isOpen, payment, preselectedCustomerId]);

  // Auto-set interest to 5% of total balance when customer changes (only for new payments)
  useEffect(() => {
    if (!isEditing && customerId && totalBalance > 0) {
      const defaultInterest = Math.round(totalBalance * 0.05 * 100) / 100;
      setInterestPaid(defaultInterest.toString());
    }
  }, [customerId, totalBalance, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!customerId) {
      setError('Selecciona un cliente');
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
        customerId,
        paymentDate,
        interestPaid: interest,
        capitalPaid: capital,
        paymentMethod,
        notes: notes.trim() || undefined,
      }, pendingFiles);
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
              Cliente <span className="text-[#DC2626]">*</span>
            </label>
            <select
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              disabled={isEditing}
              className="w-full px-4 py-3 border border-[#E7E5E4] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent disabled:bg-[#F5F5F4] disabled:cursor-not-allowed"
            >
              <option value="">Seleccionar cliente...</option>
              {customersData?.customers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {activeLoans.length > 0 && (
            <div className="p-3 bg-[#F5F5F4] rounded-lg text-sm space-y-2">
              <div className="font-medium text-[#1C1917] mb-1">
                Prestamos Activos ({activeLoans.length})
              </div>
              {activeLoans.map((loan) => (
                <div key={loan.id} className="flex justify-between items-center py-1 border-b border-[#E7E5E4] last:border-0">
                  <div>
                    <span className="font-mono">{formatCurrency(loan.currentBalance)}</span>
                    <span className="text-[#57534E] ml-2">de {formatCurrency(loan.originalAmount)}</span>
                  </div>
                  <span className="text-[#57534E] text-xs">{loan.investorName}</span>
                </div>
              ))}
              <div className="flex justify-between pt-1 font-medium">
                <span>Saldo Total:</span>
                <span className="font-mono text-[#DC2626]">{formatCurrency(totalBalance)}</span>
              </div>
            </div>
          )}

          {customerId && activeLoans.length === 0 && loansData && (
            <div className="p-3 bg-[#FEF3C7] text-[#92400E] text-sm rounded-lg">
              Este cliente no tiene prestamos activos
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

          {isEditing && payment && (
            <AttachmentList entityType="payments" entityId={payment.id} />
          )}

          <FileUploadZone files={pendingFiles} onChange={setPendingFiles} />
        </div>
      </form>
    </SlideIn>
  );
}
