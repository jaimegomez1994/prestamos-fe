import type { Customer } from '../../types/customer';
import { formatCurrency } from '../../lib/format';

interface CustomerTableProps {
  customers: Customer[];
  isLoading: boolean;
  emptyMessage: string;
  onEdit: (customer: Customer) => void;
  onToggleActive: (customer: Customer) => void;
}

export function CustomerTable({
  customers,
  isLoading,
  emptyMessage,
  onEdit,
  onToggleActive,
}: CustomerTableProps) {
  if (isLoading) {
    return (
      <div className="bg-white border border-[#E7E5E4] rounded-2xl p-12 text-center text-[#A8A29E]">
        Cargando...
      </div>
    );
  }

  if (!customers.length) {
    return (
      <div className="bg-white border border-[#E7E5E4] rounded-2xl p-12 text-center text-[#A8A29E]">
        {emptyMessage}
      </div>
    );
  }

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
            {customers.map((customer) => (
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
                      onClick={() => onEdit(customer)}
                      className="p-2 text-[#57534E] hover:text-[#1C1917] hover:bg-[#F5F5F4] rounded-lg transition-colors"
                      title="Editar"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onToggleActive(customer)}
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
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-3">
        {customers.map((customer) => (
          <div
            key={customer.id}
            className="bg-white border border-[#E7E5E4] rounded-xl p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <div className="font-medium text-[#1C1917] truncate">{customer.name}</div>
                <div className="text-sm text-[#57534E] mt-0.5">{customer.phone || 'Sin telefono'}</div>
              </div>
              <span
                className={`ml-2 inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${
                  customer.isActive
                    ? 'bg-[#D1FAE5] text-[#047857]'
                    : 'bg-[#FEE2E2] text-[#DC2626]'
                }`}
              >
                {customer.isActive ? 'Activo' : 'Inactivo'}
              </span>
            </div>

            <div className="flex items-center gap-4 text-sm mb-3">
              <div>
                <span className="text-[#A8A29E]">Prestamos: </span>
                <span className="font-medium">{customer.activeLoansCount ?? 0}</span>
              </div>
              <div>
                <span className="text-[#A8A29E]">Adeudo: </span>
                <span className="font-mono font-medium">{formatCurrency(customer.totalOwed ?? 0)}</span>
              </div>
            </div>

            {customer.notes && (
              <div className="text-xs text-[#A8A29E] mb-3 truncate">
                {customer.notes}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E7E5E4]">
              <button
                onClick={() => onEdit(customer)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-[#57534E] hover:text-[#1C1917] hover:bg-[#F5F5F4] rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Editar
              </button>
              <button
                onClick={() => onToggleActive(customer)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  customer.isActive
                    ? 'text-[#DC2626] hover:bg-[#FEE2E2]'
                    : 'text-[#059669] hover:bg-[#D1FAE5]'
                }`}
              >
                {customer.isActive ? (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                    Desactivar
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Activar
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
