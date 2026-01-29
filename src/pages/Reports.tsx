import { useState, useMemo } from 'react';
import { useInvestorReport, usePaymentSummary, usePortfolioSummary } from '../api/reportApi';
import { useLoans } from '../api/loanApi';
import { useInvestors } from '../api/investorApi';
import { formatCurrency } from '../lib/format';
import type { ReportFilters, InvestorReportItem, PaymentSummaryItem } from '../types/report';

type ReportTab = 'cobranza' | 'portfolio' | 'investors' | 'payments';

function getCycleLabel() {
  const today = new Date();
  const day = today.getDate();
  const month = today.toLocaleDateString('es-MX', { month: 'long' });
  const year = today.getFullYear();
  const capitalMonth = month.charAt(0).toUpperCase() + month.slice(1);

  if (day <= 15) {
    return `1–15 de ${capitalMonth} ${year}`;
  } else {
    const lastDay = new Date(year, today.getMonth() + 1, 0).getDate();
    return `16–${lastDay} de ${capitalMonth} ${year}`;
  }
}

function Reports() {
  const [activeTab, setActiveTab] = useState<ReportTab>('cobranza');
  const [filters, setFilters] = useState<ReportFilters>({
    groupBy: 'month',
  });

  const { data: portfolioData, isLoading: portfolioLoading } = usePortfolioSummary();
  const { data: investorData, isLoading: investorLoading } = useInvestorReport(filters);
  const { data: paymentData, isLoading: paymentLoading } = usePaymentSummary(filters);
  const { data: investorsListData } = useInvestors({ isActive: true });
  const { data: loansData, isLoading: loansLoading } = useLoans({ isSettled: false, pageSize: 500 });

  const cobranzaData = useMemo(() => {
    const loans = loansData?.loans ?? [];
    const sorted = [...loans].sort((a, b) => a.customerName.localeCompare(b.customerName));
    const totalBalance = sorted.reduce((s, l) => s + l.currentBalance, 0);
    const totalInterest = totalBalance * 0.05;
    const uniqueCustomers = new Set(sorted.map((l) => l.customerId)).size;
    return { loans: sorted, totalBalance, totalInterest, uniqueCustomers };
  }, [loansData]);

  const cycleLabel = getCycleLabel();

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
    { id: 'cobranza' as const, label: 'Cobranza' },
    { id: 'portfolio' as const, label: 'Cartera' },
    { id: 'investors' as const, label: 'Por Inversor' },
    { id: 'payments' as const, label: 'Pagos' },
  ];

  return (
    <div className="pb-20 md:pb-0">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 md:mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-[28px] font-bold text-[#1C1917]">Reportes</h1>
          <p className="text-[#57534E] text-sm md:text-[15px] mt-1">
            Resumen y estadisticas del negocio
          </p>
        </div>
        {activeTab === 'cobranza' && (
          <button
            onClick={() => window.print()}
            className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E7E5E4] rounded-lg text-sm font-medium text-[#1C1917] hover:bg-[#F5F5F4] transition-colors"
          >
            <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Imprimir
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-[#F5F5F4] rounded-lg mb-6 overflow-x-auto print:hidden">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 min-w-[80px] px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-white text-[#1C1917] shadow-sm'
                : 'text-[#57534E] hover:text-[#1C1917]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Cobranza Tab */}
      {activeTab === 'cobranza' && (
        <div className="space-y-6">
          {/* Cycle Label */}
          <div className="flex items-center gap-3 print:hidden">
            <span className="text-sm font-medium text-[#57534E]">Ciclo:</span>
            <span className="px-4 py-2 bg-white border border-[#E7E5E4] rounded-lg text-[15px] font-medium">
              {cycleLabel}
            </span>
          </div>

          {/* Print Header (only visible when printing) */}
          <div className="hidden print:block text-center mb-4">
            <h2 className="text-xl font-bold">Reporte de Cobranza</h2>
            <p className="text-sm text-[#57534E]">Ciclo: {cycleLabel}</p>
          </div>

          {loansLoading ? (
            <div className="bg-white border border-[#E7E5E4] rounded-xl p-12 text-center text-[#A8A29E]">
              Cargando...
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4 print:gap-2">
                <div className="bg-white border border-[#E7E5E4] rounded-2xl p-5">
                  <div className="text-[12px] uppercase tracking-wide text-[#A8A29E] mb-2">Clientes</div>
                  <div className="text-2xl font-bold">{cobranzaData.uniqueCustomers}</div>
                </div>
                <div className="bg-white border border-[#E7E5E4] rounded-2xl p-5">
                  <div className="text-[12px] uppercase tracking-wide text-[#A8A29E] mb-2">Prestamos</div>
                  <div className="text-2xl font-bold">{cobranzaData.loans.length}</div>
                </div>
                <div className="bg-[#059669] text-white rounded-2xl p-5 print:bg-[#059669]">
                  <div className="text-[12px] uppercase tracking-wide text-white/80 mb-2">Interes a Cobrar</div>
                  <div className="text-2xl font-bold font-mono">{formatCurrency(cobranzaData.totalInterest)}</div>
                </div>
                <div className="bg-white border border-[#E7E5E4] rounded-2xl p-5">
                  <div className="text-[12px] uppercase tracking-wide text-[#A8A29E] mb-2">Capital Total</div>
                  <div className="text-2xl font-bold font-mono">{formatCurrency(cobranzaData.totalBalance)}</div>
                </div>
              </div>

              {/* Desktop Table */}
              {cobranzaData.loans.length > 0 ? (
                <div className="bg-white border border-[#E7E5E4] rounded-2xl overflow-hidden hidden md:block print:block">
                  <div className="px-5 py-4 border-b border-[#E7E5E4] bg-[#F5F5F4] print:bg-[#F5F5F4]">
                    <span className="font-semibold text-[15px] flex items-center gap-2">
                      <svg className="w-5 h-5 text-[#A8A29E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                      Prestamos — {cycleLabel}
                    </span>
                  </div>
                  <table className="w-full">
                    <thead>
                      <tr>
                        <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#A8A29E] bg-[#F5F5F4] border-b border-[#E7E5E4]">
                          #
                        </th>
                        <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#A8A29E] bg-[#F5F5F4] border-b border-[#E7E5E4]">
                          Cliente
                        </th>
                        <th className="text-right px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#A8A29E] bg-[#F5F5F4] border-b border-[#E7E5E4]">
                          Interes (5%)
                        </th>
                        <th className="text-right px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#A8A29E] bg-[#F5F5F4] border-b border-[#E7E5E4]">
                          Saldo (PTMO)
                        </th>
                        <th className="text-left px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-[#A8A29E] bg-[#F5F5F4] border-b border-[#E7E5E4]">
                          Inversor
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {cobranzaData.loans.map((loan, idx) => (
                        <tr key={loan.id} className="border-b border-[#E7E5E4] last:border-0 hover:bg-[#FAFAF9]">
                          <td className="px-5 py-4 text-sm text-[#A8A29E]">{idx + 1}</td>
                          <td className="px-5 py-4 text-sm font-medium text-[#1C1917]">
                            {loan.customerName}
                          </td>
                          <td className="px-5 py-4 text-sm text-right font-mono font-semibold text-[#059669]">
                            {formatCurrency(loan.currentBalance * 0.05)}
                          </td>
                          <td className="px-5 py-4 text-sm text-right font-mono font-medium">
                            {formatCurrency(loan.currentBalance)}
                          </td>
                          <td className="px-5 py-4 text-sm">
                            <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-[#D1FAE5] text-[#047857]">
                              {loan.investorName}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-[#059669] bg-[#D1FAE5] print:bg-[#D1FAE5]">
                        <td colSpan={2} className="px-5 py-4 text-sm font-bold text-[#047857]">TOTAL</td>
                        <td className="px-5 py-4 text-sm text-right font-mono font-bold text-[#047857]">
                          {formatCurrency(cobranzaData.totalInterest)}
                        </td>
                        <td className="px-5 py-4 text-sm text-right font-mono font-bold text-[#047857]">
                          {formatCurrency(cobranzaData.totalBalance)}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              ) : (
                <div className="bg-white border border-[#E7E5E4] rounded-xl p-12 text-center text-[#A8A29E]">
                  No hay prestamos activos
                </div>
              )}

              {/* Mobile Cards */}
              {cobranzaData.loans.length > 0 && (
                <div className="md:hidden space-y-3 print:hidden">
                  {cobranzaData.loans.map((loan) => (
                    <div key={loan.id} className="bg-white border border-[#E7E5E4] rounded-2xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-semibold text-[15px] text-[#1C1917]">{loan.customerName}</div>
                        <span className="inline-flex px-2.5 py-1 rounded-full text-xs font-medium bg-[#D1FAE5] text-[#047857]">
                          {loan.investorName}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-[11px] uppercase tracking-wide text-[#A8A29E] mb-1">Interes</div>
                          <div className="font-mono font-semibold text-[15px] text-[#059669]">
                            {formatCurrency(loan.currentBalance * 0.05)}
                          </div>
                        </div>
                        <div>
                          <div className="text-[11px] uppercase tracking-wide text-[#A8A29E] mb-1">Saldo</div>
                          <div className="font-mono font-semibold text-[15px]">
                            {formatCurrency(loan.currentBalance)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Mobile Totals */}
                  <div className="bg-[#D1FAE5] border-2 border-[#059669] rounded-2xl p-5">
                    <div className="font-semibold text-sm text-[#047857] mb-3">TOTALES</div>
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-[11px] uppercase tracking-wide text-[#047857] opacity-80 mb-1">Interes</div>
                        <div className="font-mono text-xl font-bold text-[#047857]">
                          {formatCurrency(cobranzaData.totalInterest)}
                        </div>
                      </div>
                      <div>
                        <div className="text-[11px] uppercase tracking-wide text-[#047857] opacity-80 mb-1">Capital</div>
                        <div className="font-mono text-xl font-bold text-[#047857]">
                          {formatCurrency(cobranzaData.totalBalance)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

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
