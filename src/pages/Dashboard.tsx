import { useAppSelector } from '../store/hooks';
import { selectUser } from '../store/slices/authSlice';

function Dashboard() {
  const user = useAppSelector(selectUser);

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
    const year = today.getFullYear();

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

  return (
    <div>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-[#1C1917]">
          {getGreeting()}, {user?.name?.split(' ')[0]}
        </h1>
        <p className="text-[#57534E] text-[15px] mt-1 capitalize">
          {formatDate()} — Ciclo actual: {getCurrentCycle()}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-5 mb-8">
        <div className="bg-white border border-[#E7E5E4] rounded-2xl p-6 hover:shadow-md hover:border-[#D6D3D1] transition-all">
          <div className="text-[13px] text-[#A8A29E] mb-2">Capital Activo</div>
          <div className="text-2xl font-bold font-mono">$0.00</div>
          <div className="text-xs text-[#A8A29E] mt-2">Total en prestamos</div>
        </div>
        <div className="bg-white border border-[#E7E5E4] rounded-2xl p-6 hover:shadow-md hover:border-[#D6D3D1] transition-all">
          <div className="text-[13px] text-[#A8A29E] mb-2">Prestamos Activos</div>
          <div className="text-[28px] font-bold">0</div>
          <div className="text-xs text-[#059669] mt-2">+0 este ciclo</div>
        </div>
        <div className="bg-white border border-[#E7E5E4] rounded-2xl p-6 hover:shadow-md hover:border-[#D6D3D1] transition-all">
          <div className="text-[13px] text-[#A8A29E] mb-2">Interes Esperado</div>
          <div className="text-2xl font-bold font-mono">$0.00</div>
          <div className="text-xs text-[#A8A29E] mt-2">5% del capital</div>
        </div>
        <div className="bg-white border border-[#E7E5E4] rounded-2xl p-6 hover:shadow-md hover:border-[#D6D3D1] transition-all">
          <div className="text-[13px] text-[#A8A29E] mb-2">Clientes Activos</div>
          <div className="text-[28px] font-bold">0</div>
          <div className="text-xs text-[#059669] mt-2">+0 nuevos</div>
        </div>
      </div>

      {/* Recent Loans */}
      <div className="bg-white border border-[#E7E5E4] rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-[#E7E5E4] flex items-center justify-between">
          <h3 className="font-semibold text-[#1C1917]">Prestamos Recientes</h3>
          <button className="text-sm text-[#57534E] hover:text-[#1C1917] font-medium px-3 py-2 rounded-md hover:bg-[#F5F5F4] transition-all">
            Ver todos →
          </button>
        </div>
        <div className="p-6">
          <p className="text-[#A8A29E] text-sm text-center py-8">
            No hay prestamos registrados aun
          </p>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
