import type { Loan } from '../../types/loan';
import { PAYMENT_METHOD_LABELS } from '../../types/loan';
import { formatCurrency } from '../../lib/format';

interface LoanTableProps {
  loans: Loan[];
  isLoading: boolean;
  emptyMessage: string;
  onEdit: (loan: Loan) => void;
  onSettle: (loan: Loan) => void;
  onReopen: (loan: Loan) => void;
}

export function LoanTable({
  loans,
  isLoading,
  emptyMessage,
  onEdit,
  onSettle,
  onReopen,
}: LoanTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white border border-[#E7E5E4] rounded-2xl p-12 text-center text-[#A8A29E]">
        Cargando...
      </div>
    );
  }

  if (!loans.length) {
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
              <th className="text-left px-6 py-4 text-[11px] font-semibold uppercase tracking-wide text-[#A8A29E]">
                Inversor
              </th>
              <th className="text-right px-6 py-4 text-[11px] font-semibold uppercase tracking-wide text-[#A8A29E]">
                Monto
              </th>
              <th className="text-center px-6 py-4 text-[11px] font-semibold uppercase tracking-wide text-[#A8A29E]">
                Fecha
              </th>
              <th className="text-center px-6 py-4 text-[11px] font-semibold uppercase tracking-wide text-[#A8A29E]">
                Estado
              </th>
              <th className="px-6 py-4"></th>
            </tr>
          </thead>
          <tbody>
            {loans.map((loan) => (
              <tr
                key={loan.id}
                className="border-b border-[#E7E5E4] last:border-0 hover:bg-[#FAFAF9] transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="font-medium text-[#1C1917]">{loan.customerName}</div>
                  {loan.paymentMethod && (
                    <div className="text-xs text-[#A8A29E] mt-0.5">
                      {PAYMENT_METHOD_LABELS[loan.paymentMethod as keyof typeof PAYMENT_METHOD_LABELS] || loan.paymentMethod}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-[#57534E]">
                  {loan.investorName}
                </td>
                <td className="px-6 py-4 text-right font-mono font-medium">
                  {formatCurrency(loan.originalAmount)}
                </td>
                <td className="px-6 py-4 text-center text-[#57534E] text-sm">
                  {formatDate(loan.loanDate)}
                </td>
                <td className="px-6 py-4 text-center">
                  <span
                    className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                      loan.isSettled
                        ? 'bg-[#D1FAE5] text-[#047857]'
                        : 'bg-[#FEF3C7] text-[#D97706]'
                    }`}
                  >
                    {loan.isSettled ? 'Liquidado' : 'Activo'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => onEdit(loan)}
                      className="p-2 text-[#57534E] hover:text-[#1C1917] hover:bg-[#F5F5F4] rounded-lg transition-colors"
                      title="Editar"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    {loan.isSettled ? (
                      <button
                        onClick={() => onReopen(loan)}
                        className="p-2 text-[#D97706] hover:bg-[#FEF3C7] rounded-lg transition-colors"
                        title="Reabrir"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                    ) : (
                      <button
                        onClick={() => onSettle(loan)}
                        className="p-2 text-[#059669] hover:bg-[#D1FAE5] rounded-lg transition-colors"
                        title="Liquidar"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {loans.map((loan) => (
          <div
            key={loan.id}
            className="bg-white border border-[#E7E5E4] rounded-xl p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-[#1C1917] truncate">{loan.customerName}</div>
                <div className="text-sm text-[#57534E] mt-0.5">{loan.investorName}</div>
              </div>
              <span
                className={`ml-2 inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                  loan.isSettled
                    ? 'bg-[#D1FAE5] text-[#047857]'
                    : 'bg-[#FEF3C7] text-[#D97706]'
                }`}
              >
                {loan.isSettled ? 'Liquidado' : 'Activo'}
              </span>
            </div>

            <div className="text-sm mb-3">
              <div className="text-[#A8A29E] text-xs">Monto</div>
              <div className="font-mono font-medium">{formatCurrency(loan.originalAmount)}</div>
            </div>

            <div className="flex items-center gap-4 text-sm text-[#57534E] mb-3">
              <div className="flex items-center gap-1">
                <svg className="w-4 h-4 text-[#A8A29E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {formatDate(loan.loanDate)}
              </div>
              {loan.paymentMethod && (
                <div className="text-xs text-[#A8A29E]">
                  {PAYMENT_METHOD_LABELS[loan.paymentMethod as keyof typeof PAYMENT_METHOD_LABELS] || loan.paymentMethod}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E7E5E4]">
              <button
                onClick={() => onEdit(loan)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#57534E] hover:text-[#1C1917] hover:bg-[#F5F5F4] rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Editar
              </button>
              {loan.isSettled ? (
                <button
                  onClick={() => onReopen(loan)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#D97706] hover:bg-[#FEF3C7] rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reabrir
                </button>
              ) : (
                <button
                  onClick={() => onSettle(loan)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#059669] hover:bg-[#D1FAE5] rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Liquidar
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
