import { Link } from 'react-router-dom';
import { useAppSelector } from '../store/hooks';
import { selectUser } from '../store/slices/authSlice';
import { usePortfolioSummary } from '../api/reportApi';
import { useLoans } from '../api/loanApi';

function Dashboard() {
  const user = useAppSelector(selectUser);
  const { data: portfolio } = usePortfolioSummary();
  const { data: recentLoansData } = useLoans({ isSettled: false, page: 1, pageSize: 5 });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos dias';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  const getCurrentCycle = () => {
    const today = new Date();
    const day = today.getDate();
    const month = today.toLocaleDateString('es-MX', { month: 'long' });

    if (day <= 15) {
      return `1-15 ${month.charAt(0).toUpperCase() + month.slice(1)}`;
    } else {
      const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
      return `16-${lastDay} ${month.charAt(0).toUpperCase() + month.slice(1)}`;
    }
  };

  const formatDate = () => {
    return new Date().toLocaleDateString('es-MX', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(amount);
  };

  const activeCapital = portfolio?.activeLoans.totalAmount ?? 0;
  const activeLoansCount = portfolio?.activeLoans.count ?? 0;
  const expectedInterest = activeCapital * 0.05;
  const activeCustomers = portfolio?.customers.active ?? 0;

  const recentLoans = recentLoansData?.loans ?? [];

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-[28px] font-bold text-[#1C1917]">
          {getGreeting()}, {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-[#57534E] text-sm md:text-[15px] mt-1 capitalize">
          {formatDate()} — Ciclo actual: {getCurrentCycle()}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5 mb-6 md:mb-8">
        <div className="bg-white border border-[#E7E5E4] rounded-2xl p-5 md:p-6 hover:shadow-md hover:border-[#D6D3D1] transition-all">
          <div className="text-[13px] text-[#A8A29E] mb-2">Capital Activo</div>
          <div className="text-xl md:text-2xl font-bold font-mono">{formatCurrency(activeCapital)}</div>
          <div className="text-xs text-[#A8A29E] mt-2">Total en prestamos</div>
        </div>
        <div className="bg-white border border-[#E7E5E4] rounded-2xl p-5 md:p-6 hover:shadow-md hover:border-[#D6D3D1] transition-all">
          <div className="text-[13px] text-[#A8A29E] mb-2">Prestamos Activos</div>
          <div className="text-2xl md:text-[28px] font-bold">{activeLoansCount}</div>
          <div className="text-xs text-[#059669] mt-2">
            {portfolio?.settledLoans.count ?? 0} liquidados
          </div>
        </div>
        <div className="bg-white border border-[#E7E5E4] rounded-2xl p-5 md:p-6 hover:shadow-md hover:border-[#D6D3D1] transition-all">
          <div className="text-[13px] text-[#A8A29E] mb-2">Interes Esperado</div>
          <div className="text-xl md:text-2xl font-bold font-mono">{formatCurrency(expectedInterest)}</div>
          <div className="text-xs text-[#A8A29E] mt-2">5% del capital</div>
        </div>
        <div className="bg-white border border-[#E7E5E4] rounded-2xl p-5 md:p-6 hover:shadow-md hover:border-[#D6D3D1] transition-all">
          <div className="text-[13px] text-[#A8A29E] mb-2">Clientes Activos</div>
          <div className="text-2xl md:text-[28px] font-bold">{activeCustomers}</div>
          <div className="text-xs text-[#A8A29E] mt-2">
            de {portfolio?.customers.total ?? 0} totales
          </div>
        </div>
      </div>

      {/* Recent Loans */}
      <div className="bg-white border border-[#E7E5E4] rounded-2xl overflow-hidden">
        <div className="px-4 md:px-6 py-4 md:py-5 border-b border-[#E7E5E4] flex items-center justify-between">
          <h3 className="font-semibold text-[#1C1917]">Prestamos Activos</h3>
          <Link
            to="/loans"
            className="text-sm text-[#57534E] hover:text-[#1C1917] font-medium px-3 py-2 rounded-md hover:bg-[#F5F5F4] transition-all"
          >
            Ver todos →
          </Link>
        </div>
        {recentLoans.length === 0 ? (
          <div className="p-4 md:p-6">
            <p className="text-[#A8A29E] text-sm text-center py-6 md:py-8">
              No hay prestamos activos
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#F5F5F4]">
            {recentLoans.map((loan) => (
              <div key={loan.id} className="px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#F5F5F4] flex items-center justify-center text-sm font-medium text-[#57534E]">
                    {loan.customerName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[#1C1917]">{loan.customerName}</div>
                    <div className="text-xs text-[#A8A29E]">{loan.investorName}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-mono font-medium text-[#1C1917]">
                    {formatCurrency(loan.currentBalance)}
                  </div>
                  <div className="text-xs text-[#A8A29E]">
                    de {formatCurrency(loan.originalAmount)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
