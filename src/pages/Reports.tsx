import { useState } from 'react';
import { useInvestorReport, usePaymentSummary, usePortfolioSummary } from '../api/reportApi';
import { useInvestors } from '../api/investorApi';
import { formatCurrency } from '../lib/format';
import type { ReportFilters, InvestorReportItem, PaymentSummaryItem } from '../types/report';

type ReportTab = 'portfolio' | 'investors' | 'payments';

function Reports() {
  const [activeTab, setActiveTab] = useState<ReportTab>('portfolio');
  const [filters, setFilters] = useState<ReportFilters>({
    groupBy: 'month',
  });

  const { data: portfolioData, isLoading: portfolioLoading } = usePortfolioSummary();
  const { data: investorData, isLoading: investorLoading } = useInvestorReport(filters);
  const { data: paymentData, isLoading: paymentLoading } = usePaymentSummary(filters);
  const { data: investorsListData } = useInvestors({ isActive: true });

  const formatPeriod = (period: string) => {
    if (period.includes('W')) {
      const [year, week] = period.split('-W');
      return `Semana ${week}, ${year}`;
    }
    const [year, month] = period.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
  };

  const tabs = [
    { id: 'portfolio' as const, label: 'Cartera' },
    { id: 'investors' as const, label: 'Por Inversor' },
    { id: 'payments' as const, label: 'Pagos' },
  ];

  return (
    <div className="pb-20 md:pb-0">
      {/* Page Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-[28px] font-bold text-[#1C1917]">Reportes</h1>
        <p className="text-[#57534E] text-sm md:text-[15px] mt-1">
          Resumen y estadisticas del negocio
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-[#F5F5F4] rounded-lg mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-[100px] px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-[#1C1917] shadow-sm'
                : 'text-[#57534E] hover:text-[#1C1917]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filters for investors and payments tabs */}
      {(activeTab === 'investors' || activeTab === 'payments') && (
        <div className="bg-white border border-[#E7E5E4] rounded-xl p-4 mb-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-[#A8A29E] uppercase tracking-wide mb-1">
                Fecha Inicio
              </label>
              <input
                type="date"
                value={filters.startDate ?? ''}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-[#E7E5E4] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs text-[#A8A29E] uppercase tracking-wide mb-1">
                Fecha Fin
              </label>
              <input
                type="date"
                value={filters.endDate ?? ''}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-[#E7E5E4] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs text-[#A8A29E] uppercase tracking-wide mb-1">
                Inversor
              </label>
              <select
                value={filters.investorId ?? ''}
                onChange={(e) => setFilters({ ...filters, investorId: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-[#E7E5E4] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent"
              >
                <option value="">Todos</option>
                {investorsListData?.investors.map((investor) => (
                  <option key={investor.id} value={investor.id}>
                    {investor.name}
                  </option>
                ))}
              </select>
            </div>
            {activeTab === 'payments' && (
              <div>
                <label className="block text-xs text-[#A8A29E] uppercase tracking-wide mb-1">
                  Agrupar por
                </label>
                <select
                  value={filters.groupBy ?? 'month'}
                  onChange={(e) => setFilters({ ...filters, groupBy: e.target.value as 'month' | 'week' })}
                  className="w-full px-3 py-2 border border-[#E7E5E4] rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#059669] focus:border-transparent"
                >
                  <option value="month">Mes</option>
                  <option value="week">Semana</option>
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Portfolio Tab */}
      {activeTab === 'portfolio' && (
        <div className="space-y-6">
          {portfolioLoading ? (
            <div className="bg-white border border-[#E7E5E4] rounded-xl p-12 text-center text-[#A8A29E]">
              Cargando...
            </div>
          ) : portfolioData ? (
            <>
              {/* Main Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-[#E7E5E4] rounded-xl p-4">
                  <div className="text-xs text-[#A8A29E] uppercase tracking-wide mb-1">
                    Prestamos Activos
                  </div>
                  <div className="text-2xl font-bold text-[#1C1917]">
                    {portfolioData.activeLoans.count}
                  </div>
                  <div className="text-sm text-[#059669] font-mono mt-1">
                    {formatCurrency(portfolioData.activeLoans.totalAmount)}
                  </div>
                </div>
                <div className="bg-white border border-[#E7E5E4] rounded-xl p-4">
                  <div className="text-xs text-[#A8A29E] uppercase tracking-wide mb-1">
                    Prestamos Liquidados
                  </div>
                  <div className="text-2xl font-bold text-[#1C1917]">
                    {portfolioData.settledLoans.count}
                  </div>
                  <div className="text-sm text-[#57534E] font-mono mt-1">
                    {formatCurrency(portfolioData.settledLoans.totalAmount)}
                  </div>
                </div>
                <div className="bg-white border border-[#E7E5E4] rounded-xl p-4">
                  <div className="text-xs text-[#A8A29E] uppercase tracking-wide mb-1">
                    Clientes
                  </div>
                  <div className="text-2xl font-bold text-[#1C1917]">
                    {portfolioData.customers.active}
                  </div>
                  <div className="text-sm text-[#57534E] mt-1">
                    de {portfolioData.customers.total} registrados
                  </div>
                </div>
                <div className="bg-white border border-[#E7E5E4] rounded-xl p-4">
                  <div className="text-xs text-[#A8A29E] uppercase tracking-wide mb-1">
                    Inversores
                  </div>
                  <div className="text-2xl font-bold text-[#1C1917]">
                    {portfolioData.investors.active}
                  </div>
                  <div className="text-sm text-[#57534E] mt-1">
                    de {portfolioData.investors.total} registrados
                  </div>
                </div>
              </div>

              {/* Payment Stats */}
              <div className="bg-white border border-[#E7E5E4] rounded-xl p-6">
                <h3 className="text-lg font-semibold text-[#1C1917] mb-4">
                  Resumen de Cobros
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  <div>
                    <div className="text-xs text-[#A8A29E] uppercase tracking-wide mb-1">
                      Total Intereses
                    </div>
                    <div className="text-2xl font-bold text-[#059669] font-mono">
                      {formatCurrency(portfolioData.payments.totalInterest)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-[#A8A29E] uppercase tracking-wide mb-1">
                      Total Capital
                    </div>
                    <div className="text-2xl font-bold text-[#1C1917] font-mono">
                      {formatCurrency(portfolioData.payments.totalCapital)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-[#A8A29E] uppercase tracking-wide mb-1">
                      Total Cobrado
                    </div>
                    <div className="text-2xl font-bold text-[#1C1917] font-mono">
                      {formatCurrency(portfolioData.payments.totalAmount)}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* Investors Tab */}
      {activeTab === 'investors' && (
        <div className="space-y-6">
          {investorLoading ? (
            <div className="bg-white border border-[#E7E5E4] rounded-xl p-12 text-center text-[#A8A29E]">
              Cargando...
            </div>
          ) : investorData ? (
            <>
              {/* Totals */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-white border border-[#E7E5E4] rounded-xl p-4">
                  <div className="text-xs text-[#A8A29E] uppercase tracking-wide mb-1">
                    Total Invertido
                  </div>
                  <div className="text-xl font-bold text-[#1C1917] font-mono">
                    {formatCurrency(investorData.totals.totalInvested)}
                  </div>
                </div>
                <div className="bg-white border border-[#E7E5E4] rounded-xl p-4">
                  <div className="text-xs text-[#A8A29E] uppercase tracking-wide mb-1">
                    Intereses Ganados
                  </div>
                  <div className="text-xl font-bold text-[#059669] font-mono">
                    {formatCurrency(investorData.totals.totalInterestEarned)}
                  </div>
                </div>
                <div className="bg-white border border-[#E7E5E4] rounded-xl p-4">
                  <div className="text-xs text-[#A8A29E] uppercase tracking-wide mb-1">
                    Capital Devuelto
                  </div>
                  <div className="text-xl font-bold text-[#1C1917] font-mono">
                    {formatCurrency(investorData.totals.totalCapitalReturned)}
                  </div>
                </div>
                <div className="bg-white border border-[#E7E5E4] rounded-xl p-4">
                  <div className="text-xs text-[#A8A29E] uppercase tracking-wide mb-1">
                    Ganancia Inversores
                  </div>
                  <div className="text-xl font-bold text-[#7C3AED] font-mono">
                    {formatCurrency(investorData.totals.totalInvestorProfit)}
                  </div>
                </div>
                <div className="bg-white border border-[#E7E5E4] rounded-xl p-4">
                  <div className="text-xs text-[#A8A29E] uppercase tracking-wide mb-1">
                    Ganancia Negocio
                  </div>
                  <div className="text-xl font-bold text-[#059669] font-mono">
                    {formatCurrency(investorData.totals.totalBusinessProfit)}
                  </div>
                </div>
              </div>

              {/* Investor Table */}
              <div className="bg-white border border-[#E7E5E4] rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#E7E5E4] bg-[#FAFAF9]">
                        <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#A8A29E]">
                          Inversor
                        </th>
                        <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#A8A29E]">
                          %
                        </th>
                        <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#A8A29E]">
                          Activos
                        </th>
                        <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#A8A29E]">
                          Invertido
                        </th>
                        <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#A8A29E]">
                          Intereses
                        </th>
                        <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#A8A29E]">
                          Ganancia Inv.
                        </th>
                        <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#A8A29E]">
                          Ganancia Neg.
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {investorData.investors.map((item: InvestorReportItem) => (
                        <tr
                          key={item.investorId}
                          className="border-b border-[#E7E5E4] last:border-0 hover:bg-[#FAFAF9]"
                        >
                          <td className="px-4 py-3 font-medium text-[#1C1917]">
                            {item.investorName}
                          </td>
                          <td className="px-4 py-3 text-right text-[#059669] font-mono">
                            {item.profitPercentage}%
                          </td>
                          <td className="px-4 py-3 text-right">
                            {item.activeLoans}
                          </td>
                          <td className="px-4 py-3 text-right font-mono">
                            {formatCurrency(item.totalInvested)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-[#059669]">
                            {formatCurrency(item.totalInterestEarned)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-[#7C3AED]">
                            {formatCurrency(item.investorProfit)}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-[#059669]">
                            {formatCurrency(item.businessProfit)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : null}
        </div>
      )}

      {/* Payments Tab */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          {paymentLoading ? (
            <div className="bg-white border border-[#E7E5E4] rounded-xl p-12 text-center text-[#A8A29E]">
              Cargando...
            </div>
          ) : paymentData ? (
            <>
              {/* Totals */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-[#E7E5E4] rounded-xl p-4">
                  <div className="text-xs text-[#A8A29E] uppercase tracking-wide mb-1">
                    Total Pagos
                  </div>
                  <div className="text-xl font-bold text-[#1C1917]">
                    {paymentData.totals.totalPayments}
                  </div>
                </div>
                <div className="bg-white border border-[#E7E5E4] rounded-xl p-4">
                  <div className="text-xs text-[#A8A29E] uppercase tracking-wide mb-1">
                    Total Intereses
                  </div>
                  <div className="text-xl font-bold text-[#059669] font-mono">
                    {formatCurrency(paymentData.totals.totalInterest)}
                  </div>
                </div>
                <div className="bg-white border border-[#E7E5E4] rounded-xl p-4">
                  <div className="text-xs text-[#A8A29E] uppercase tracking-wide mb-1">
                    Total Capital
                  </div>
                  <div className="text-xl font-bold text-[#1C1917] font-mono">
                    {formatCurrency(paymentData.totals.totalCapital)}
                  </div>
                </div>
                <div className="bg-white border border-[#E7E5E4] rounded-xl p-4">
                  <div className="text-xs text-[#A8A29E] uppercase tracking-wide mb-1">
                    Total Cobrado
                  </div>
                  <div className="text-xl font-bold text-[#1C1917] font-mono">
                    {formatCurrency(paymentData.totals.totalAmount)}
                  </div>
                </div>
              </div>

              {/* Payments Table */}
              {paymentData.payments.length > 0 ? (
                <div className="bg-white border border-[#E7E5E4] rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-[#E7E5E4] bg-[#FAFAF9]">
                          <th className="text-left px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#A8A29E]">
                            Periodo
                          </th>
                          <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#A8A29E]">
                            Pagos
                          </th>
                          <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#A8A29E]">
                            Intereses
                          </th>
                          <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#A8A29E]">
                            Capital
                          </th>
                          <th className="text-right px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#A8A29E]">
                            Total
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {paymentData.payments.map((item: PaymentSummaryItem) => (
                          <tr
                            key={item.period}
                            className="border-b border-[#E7E5E4] last:border-0 hover:bg-[#FAFAF9]"
                          >
                            <td className="px-4 py-3 font-medium text-[#1C1917] capitalize">
                              {formatPeriod(item.period)}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {item.paymentCount}
                            </td>
                            <td className="px-4 py-3 text-right font-mono text-[#059669]">
                              {formatCurrency(item.interestPaid)}
                            </td>
                            <td className="px-4 py-3 text-right font-mono">
                              {formatCurrency(item.capitalPaid)}
                            </td>
                            <td className="px-4 py-3 text-right font-mono font-medium">
                              {formatCurrency(item.totalPaid)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-[#E7E5E4] rounded-xl p-12 text-center text-[#A8A29E]">
                  No hay pagos registrados en este periodo
                </div>
              )}
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}

export default Reports;
