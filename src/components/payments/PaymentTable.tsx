import type { Payment } from '../../types/payment';
import { PAYMENT_METHOD_LABELS } from '../../types/loan';
import { formatCurrency } from '../../lib/format';

interface PaymentTableProps {
  payments: Payment[];
  isLoading: boolean;
  emptyMessage: string;
  onEdit: (payment: Payment) => void;
  onDelete: (payment: Payment) => void;
}

export function PaymentTable({
  payments,
  isLoading,
  emptyMessage,
  onEdit,
  onDelete,
}: PaymentTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white border border-[#E7E5E4] rounded-2xl p-12 text-center text-[#A8A29E]">
        Cargando...
      </div>
    );
  }

  if (!payments.length) {
    return (
      <div className="bg-white border border-[#E7E5E4] rounded-2xl p-12 text-center text-[#A8A29E]">
        {emptyMessage}
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block bg-white border border-[#E7E5E4] rounded-2xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E7E5E4] bg-[#FAFAF9]">
              <th className="text-left px-6 py-4 text-[11px] font-semibold uppercase tracking-wide text-[#A8A29E]">
                Cliente
              </th>
              <th className="text-center px-6 py-4 text-[11px] font-semibold uppercase tracking-wide text-[#A8A29E]">
                Fecha
              </th>
              <th className="text-right px-6 py-4 text-[11px] font-semibold uppercase tracking-wide text-[#A8A29E]">
                Interes
              </th>
              <th className="text-right px-6 py-4 text-[11px] font-semibold uppercase tracking-wide text-[#A8A29E]">
                Capital
              </th>
              <th className="text-right px-6 py-4 text-[11px] font-semibold uppercase tracking-wide text-[#A8A29E]">
                Total
              </th>
              <th className="text-center px-6 py-4 text-[11px] font-semibold uppercase tracking-wide text-[#A8A29E]">
                Metodo
              </th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody>
            {payments.map((payment) => (
              <tr
                key={payment.id}
                className="border-b border-[#E7E5E4] last:border-0 hover:bg-[#FAFAF9] transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="font-medium text-[#1C1917]">{payment.customerName}</div>
                  <div className="text-xs text-[#A8A29E] mt-0.5">{payment.investorName}</div>
                </td>
                <td className="px-6 py-4 text-center text-[#57534E] text-sm">
                  {formatDate(payment.paymentDate)}
                </td>
                <td className="px-6 py-4 text-right font-mono text-sm text-[#057857]">
                  {formatCurrency(payment.interestPaid)}
                </td>
                <td className="px-6 py-4 text-right font-mono text-sm text-[#1C1917]">
                  {formatCurrency(payment.capitalPaid)}
                </td>
                <td className="px-6 py-4 text-right font-mono font-medium">
                  {formatCurrency(payment.totalPaid)}
                </td>
                <td className="px-6 py-4 text-center text-sm text-[#57534E]">
                  {payment.paymentMethod
                    ? PAYMENT_METHOD_LABELS[payment.paymentMethod as keyof typeof PAYMENT_METHOD_LABELS] || payment.paymentMethod
                    : '-'}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onEdit(payment)}
                      className="p-2 text-[#57534E] hover:text-[#1C1917] hover:bg-[#F5F5F4] rounded-lg transition-colors"
                      title="Editar"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDelete(payment)}
                      className="p-2 text-[#DC2626] hover:bg-[#FEE2E2] rounded-lg transition-colors"
                      title="Eliminar"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {payments.map((payment) => (
          <div
            key={payment.id}
            className="bg-white border border-[#E7E5E4] rounded-xl p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-[#1C1917] truncate">{payment.customerName}</div>
                <div className="text-sm text-[#57534E] mt-0.5">{payment.investorName}</div>
              </div>
              <div className="ml-2 text-right">
                <div className="font-mono font-medium text-[#1C1917]">{formatCurrency(payment.totalPaid)}</div>
                <div className="text-xs text-[#A8A29E]">{formatDate(payment.paymentDate)}</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm mb-3">
              <div>
                <div className="text-[#A8A29E] text-xs">Interes</div>
                <div className="font-mono text-[#059669]">{formatCurrency(payment.interestPaid)}</div>
              </div>
              <div>
                <div className="text-[#A8A29E] text-xs">Capital</div>
                <div className="font-mono">{formatCurrency(payment.capitalPaid)}</div>
              </div>
            </div>

            {(payment.paymentMethod || payment.notes) && (
              <div className="flex items-center gap-4 text-sm text-[#57534E] mb-3">
                {payment.paymentMethod && (
                  <span className="text-xs bg-[#F5F5F4] px-2 py-1 rounded">
                    {PAYMENT_METHOD_LABELS[payment.paymentMethod as keyof typeof PAYMENT_METHOD_LABELS] || payment.paymentMethod}
                  </span>
                )}
                {payment.notes && (
                  <span className="text-xs text-[#A8A29E] truncate">{payment.notes}</span>
                )}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E7E5E4]">
              <button
                onClick={() => onEdit(payment)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#57534E] hover:text-[#1C1917] hover:bg-[#F5F5F4] rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Editar
              </button>
              <button
                onClick={() => onDelete(payment)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#DC2626] hover:bg-[#FEE2E2] rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Eliminar
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
