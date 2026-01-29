import { useState, useMemo, useRef, useEffect } from 'react';
import {
  useInvestors,
  useCreateInvestor,
  useUpdateInvestor,
} from '../api/investorApi';
import { useLoans } from '../api/loanApi';
import { useInvestorReport } from '../api/reportApi';
import { InvestorForm } from '../components/investors/InvestorForm';
import { FAB } from '../components/ui/FAB';
import { formatCurrency } from '../lib/format';
import type { Investor, CreateInvestorRequest } from '../types/investor';

function getCycleDates(offset: number = 0) {
  const now = new Date();
  let year = now.getFullYear();
  let month = now.getMonth(); // 0-indexed
  let half = now.getDate() <= 15 ? 0 : 1; // 0 = first half, 1 = second half

  // Apply offset (negative = previous cycles)
  let totalHalves = month * 2 + half + offset;
  while (totalHalves < 0) {
    year--;
    totalHalves += 24;
  }
  while (totalHalves >= 24) {
    year++;
    totalHalves -= 24;
  }
  month = Math.floor(totalHalves / 2);
  half = totalHalves % 2;

  const startDay = half === 0 ? 1 : 16;
  const endDay = half === 0 ? 15 : new Date(year, month + 1, 0).getDate();

  const pad = (n: number) => String(n).padStart(2, '0');
  const startDate = `${year}-${pad(month + 1)}-${pad(startDay)}`;
  const endDate = `${year}-${pad(month + 1)}-${pad(endDay)}`;

  const monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  const label = `${startDay}-${endDay} ${monthNames[month]} ${year}`;

  return { startDate, endDate, label };
}

function Investors() {
  const [selectedInvestorId, setSelectedInvestorId] = useState<string>('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingInvestor, setEditingInvestor] = useState<Investor | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: investorsData } = useInvestors({ isActive: true, pageSize: 100 });

  // Auto-select first investor
  useEffect(() => {
    if (!selectedInvestorId && investorsData?.investors.length) {
      setSelectedInvestorId(investorsData.investors[0].id);
    }
  }, [investorsData, selectedInvestorId]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const selectedInvestor = investorsData?.investors.find((i) => i.id === selectedInvestorId);

  const currentCycle = useMemo(() => getCycleDates(0), []);
  const prevCycle = useMemo(() => getCycleDates(-1), []);

  // All-time report for selected investor
  const { data: allTimeReport } = useInvestorReport(
    selectedInvestorId ? { investorId: selectedInvestorId } : {}
  );

  // Cycle reports
  const { data: currentCycleReport } = useInvestorReport(
    selectedInvestorId
      ? { investorId: selectedInvestorId, startDate: currentCycle.startDate, endDate: currentCycle.endDate }
      : {}
  );
  const { data: prevCycleReport } = useInvestorReport(
    selectedInvestorId
      ? { investorId: selectedInvestorId, startDate: prevCycle.startDate, endDate: prevCycle.endDate }
      : {}
  );

  // Active loans for loan list
  const { data: loansData } = useLoans(
    selectedInvestorId ? { investorId: selectedInvestorId, isSettled: false, pageSize: 100 } : {}
  );

  const investorData = allTimeReport?.investors[0];
  const currentCycleData = currentCycleReport?.investors[0];
  const prevCycleData = prevCycleReport?.investors[0];

  const capitalEnLaCalle = investorData?.currentOutstandingBalance ?? 0;
  const totalLentHistorical = investorData?.totalLentHistorical ?? 0;
  const activeLoansCount = investorData?.activeLoans ?? 0;
  const profitPct = investorData?.profitPercentage ?? 70;
  const businessPct = 100 - profitPct;

  // YTD: use all-time report (no date filter = all payments ever)
  const ytdInterest = investorData?.totalInterestEarned ?? 0;
  const ytdInvestorProfit = investorData?.investorProfit ?? 0;
  const ytdCapitalReturned = investorData?.totalCapitalReturned ?? 0;

  const createMutation = useCreateInvestor();
  const updateMutation = useUpdateInvestor();

  const handleOpenCreate = () => {
    setEditingInvestor(null);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingInvestor(null);
  };

  const handleSubmit = async (formData: CreateInvestorRequest) => {
    if (editingInvestor) {
      await updateMutation.mutateAsync({ id: editingInvestor.id, data: formData });
    } else {
      await createMutation.mutateAsync(formData);
    }
    handleCloseForm();
  };

  const handleEditSelected = () => {
    if (selectedInvestor) {
      setEditingInvestor(selectedInvestor);
      setIsFormOpen(true);
    }
  };

  const fabActions = [
    {
      label: 'Nuevo Inversor',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      ),
      onClick: handleOpenCreate,
    },
  ];

  const getInitials = (name: string) => {
    return name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  };

  return (
    <div className="pb-20 md:pb-0">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-[28px] font-bold text-[#1C1917]">Inversores</h1>
          <p className="text-[#57534E] text-sm md:text-[15px] mt-1">
            Resumen de capital e intereses por inversor
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2">
          {selectedInvestor && (
            <button
              onClick={handleEditSelected}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#E7E5E4] text-[#57534E] rounded-lg text-sm font-medium hover:bg-[#F5F5F4] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Editar
            </button>
          )}
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#059669] text-white rounded-lg text-sm font-medium hover:bg-[#047857] transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Nuevo Inversor
          </button>
        </div>
      </div>

      {/* Investor Selector */}
      <div className="relative mb-8 max-w-xs" ref={dropdownRef}>
        <button
          className="w-full flex items-center justify-between gap-3 px-4 py-3 bg-white border border-[#E7E5E4] rounded-xl cursor-pointer hover:border-[#D6D3D1] transition-colors"
          onClick={() => setDropdownOpen(!dropdownOpen)}
        >
          {selectedInvestor ? (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-[#D1FAE5] rounded-full flex items-center justify-center text-sm font-semibold text-[#047857] shrink-0">
                {getInitials(selectedInvestor.name)}
              </div>
              <div className="text-left">
                <div className="font-semibold text-[15px]">{selectedInvestor.name}</div>
                <div className="text-[13px] text-[#A8A29E]">
                  {formatCurrency(capitalEnLaCalle)} en la calle
                </div>
              </div>
            </div>
          ) : (
            <span className="text-[#A8A29E]">Seleccionar inversor...</span>
          )}
          <svg
            className={`w-5 h-5 text-[#A8A29E] shrink-0 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {dropdownOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-[#E7E5E4] rounded-xl shadow-lg z-50 overflow-hidden">
            {investorsData?.investors.map((inv) => (
              <button
                key={inv.id}
                className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-[#F5F5F4] transition-colors text-left ${
                  inv.id === selectedInvestorId ? 'bg-[#F5F5F4]' : ''
                }`}
                onClick={() => {
                  setSelectedInvestorId(inv.id);
                  setDropdownOpen(false);
                }}
              >
                <div className="w-9 h-9 bg-[#D1FAE5] rounded-full flex items-center justify-center text-sm font-semibold text-[#047857] shrink-0">
                  {getInitials(inv.name)}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-[15px]">{inv.name}</div>
                  <div className="text-[13px] text-[#A8A29E]">
                    {formatCurrency(inv.totalInvested ?? 0)} invertido
                  </div>
                </div>
                {inv.id === selectedInvestorId && (
                  <svg className="w-5 h-5 text-[#059669] shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {selectedInvestor && (
        <>
          {/* Highlight Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8">
            <div className="bg-gradient-to-br from-[#059669] to-[#047857] rounded-2xl p-6 text-white">
              <div className="text-sm text-white/80 flex items-center gap-2 mb-2">
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Capital en la Calle
              </div>
              <div className="text-4xl font-bold font-mono leading-tight mb-1">
                {formatCurrency(capitalEnLaCalle)}
              </div>
              <div className="text-sm text-white/70">
                En {activeLoansCount} prestamo{activeLoansCount !== 1 ? 's' : ''} activo{activeLoansCount !== 1 ? 's' : ''}
              </div>
            </div>

            <div className="bg-white border border-[#E7E5E4] rounded-2xl p-6">
              <div className="text-sm text-[#A8A29E] flex items-center gap-2 mb-2">
                <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Total Prestado (historico)
              </div>
              <div className="text-4xl font-bold font-mono leading-tight mb-1 text-[#1C1917]">
                {formatCurrency(totalLentHistorical)}
              </div>
              <div className="text-[13px] text-[#A8A29E]">
                Desde {new Date(selectedInvestor.createdAt).toLocaleDateString('es-MX', { month: 'short', year: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Cycle Comparison */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#A8A29E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Comparacion de Ciclos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Current Cycle */}
              <div className="bg-white border-2 border-[#059669] rounded-2xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <span className="font-semibold text-[15px]">{currentCycle.label}</span>
                  <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#D1FAE5] text-[#047857]">
                    Ciclo Actual
                  </span>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#57534E]">Interes esperado</span>
                    <span className="font-mono font-semibold text-2xl text-[#059669]">
                      {formatCurrency(currentCycleData?.totalInterestEarned ?? 0)}
                    </span>
                  </div>
                  <div className="h-px bg-[#E7E5E4]" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#57534E]">Tu ganancia ({profitPct}%)</span>
                    <span className="font-mono font-semibold">
                      {formatCurrency(currentCycleData?.investorProfit ?? 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#57534E]">Comision ({businessPct}%)</span>
                    <span className="font-mono font-semibold text-[#A8A29E]">
                      {formatCurrency(currentCycleData?.businessProfit ?? 0)}
                    </span>
                  </div>
                  <div className="h-px bg-[#E7E5E4]" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#57534E]">Nuevos prestamos</span>
                    <span className="font-mono font-semibold">
                      {formatCurrency(currentCycleData?.newLoansAmount ?? 0)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Previous Cycle */}
              <div className="bg-white border border-[#E7E5E4] rounded-2xl p-6">
                <div className="flex items-center justify-between mb-5">
                  <span className="font-semibold text-[15px]">{prevCycle.label}</span>
                  <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#F5F5F4] text-[#A8A29E]">
                    Ciclo Anterior
                  </span>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#57534E]">Interes cobrado</span>
                    <span className="font-mono font-semibold text-2xl text-[#059669]">
                      {formatCurrency(prevCycleData?.totalInterestEarned ?? 0)}
                    </span>
                  </div>
                  <div className="h-px bg-[#E7E5E4]" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#57534E]">Tu ganancia ({profitPct}%)</span>
                    <span className="font-mono font-semibold">
                      {formatCurrency(prevCycleData?.investorProfit ?? 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#57534E]">Comision ({businessPct}%)</span>
                    <span className="font-mono font-semibold text-[#A8A29E]">
                      {formatCurrency(prevCycleData?.businessProfit ?? 0)}
                    </span>
                  </div>
                  <div className="h-px bg-[#E7E5E4]" />
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-[#57534E]">Prestamos otorgados</span>
                    <span className="font-mono font-semibold">
                      {formatCurrency(prevCycleData?.newLoansAmount ?? 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Resumen (all-time) */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#A8A29E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
              Resumen General
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-[#E7E5E4] rounded-2xl p-5 text-center">
                <div className="text-[13px] text-[#A8A29E] mb-2">Interes Cobrado</div>
                <div className="text-[22px] font-bold font-mono text-[#059669]">
                  {formatCurrency(ytdInterest)}
                </div>
                <div className="text-xs text-[#A8A29E] mt-1">Historico</div>
              </div>
              <div className="bg-white border border-[#E7E5E4] rounded-2xl p-5 text-center">
                <div className="text-[13px] text-[#A8A29E] mb-2">Tu Ganancia ({profitPct}%)</div>
                <div className="text-[22px] font-bold font-mono">
                  {formatCurrency(ytdInvestorProfit)}
                </div>
                <div className="text-xs text-[#A8A29E] mt-1">Historico</div>
              </div>
              <div className="bg-white border border-[#E7E5E4] rounded-2xl p-5 text-center">
                <div className="text-[13px] text-[#A8A29E] mb-2">Capital Recuperado</div>
                <div className="text-[22px] font-bold font-mono">
                  {formatCurrency(ytdCapitalReturned)}
                </div>
                <div className="text-xs text-[#A8A29E] mt-1">Abonos a capital</div>
              </div>
            </div>
          </div>

          {/* Active Loans */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-[#A8A29E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Prestamos Activos
            </h2>
            <div className="space-y-3">
              {loansData?.loans.map((loan) => (
                <div
                  key={loan.id}
                  className="bg-white border border-[#E7E5E4] rounded-2xl px-5 py-4 flex items-center justify-between hover:border-[#059669] transition-colors"
                >
                  <div className="flex items-center gap-3.5">
                    <div className="w-11 h-11 bg-[#D1FAE5] rounded-full flex items-center justify-center text-[15px] font-semibold text-[#047857] shrink-0">
                      {getInitials(loan.customerName)}
                    </div>
                    <div>
                      <div className="font-medium">{loan.customerName}</div>
                      <div className="text-[13px] text-[#A8A29E]">
                        {new Date(loan.loanDate).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-semibold text-base">{formatCurrency(loan.currentBalance)}</div>
                    <div className="font-mono text-[13px] text-[#059669]">
                      +{formatCurrency(loan.currentBalance * 0.05)} interes
                    </div>
                  </div>
                </div>
              ))}
              {loansData?.loans.length === 0 && (
                <div className="bg-white border border-[#E7E5E4] rounded-2xl p-12 text-center text-[#A8A29E]">
                  No hay prestamos activos
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {!selectedInvestor && investorsData && (
        <div className="bg-white border border-[#E7E5E4] rounded-2xl p-12 text-center text-[#A8A29E]">
          {investorsData.investors.length === 0
            ? 'No hay inversores registrados'
            : 'Selecciona un inversor para ver su resumen'}
        </div>
      )}

      {/* Investor Form Slide-in */}
      <InvestorForm
        investor={editingInvestor}
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

export default Investors;
