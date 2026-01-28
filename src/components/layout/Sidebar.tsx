import { NavLink } from 'react-router-dom';
import { useAppSelector } from '../../store/hooks';
import { selectUser } from '../../store/slices/authSlice';

const navItems = [
  {
    path: '/dashboard',
    label: 'Dashboard',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    path: '/clientes',
    label: 'Clientes',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    path: '/prestamos',
    label: 'Prestamos',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    path: '/pagos',
    label: 'Pagos',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    path: '/inversores',
    label: 'Inversores',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  {
    path: '/reportes',
    label: 'Reportes',
    icon: (
      <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
];

function Sidebar() {
  const user = useAppSelector(selectUser);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: 'Administrador',
      operator: 'Operador',
      collector: 'Cobranza',
      customer: 'Cliente',
    };
    return labels[role] || role;
  };

  return (
    <aside className="w-[260px] bg-white border-r border-[#E7E5E4] fixed h-screen flex flex-col p-6">
      {/* Logo */}
      <div className="flex items-center gap-3 pb-6 border-b border-[#E7E5E4] mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-[#059669] to-[#047857] rounded-[10px] flex items-center justify-center text-white font-bold text-lg">
          P
        </div>
        <div>
          <div className="font-semibold text-lg text-[#1C1917]">Prestamos</div>
          <div className="text-[11px] text-[#A8A29E] uppercase tracking-wide">Sistema de Gestion</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-col gap-2 mb-6">
        <button className="flex items-center gap-2.5 px-4 py-3 bg-[#059669] text-white rounded-[10px] text-sm font-medium hover:bg-[#047857] transition-all hover:-translate-y-0.5">
          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Nuevo Prestamo
        </button>
        <button className="flex items-center gap-2.5 px-4 py-3 bg-[#059669] text-white rounded-[10px] text-sm font-medium hover:bg-[#047857] transition-all hover:-translate-y-0.5">
          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          Registrar Pago
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1">
        <div className="text-[11px] font-semibold uppercase tracking-wide text-[#A8A29E] px-3 mb-2">
          Menu
        </div>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-3 rounded-[10px] text-sm font-medium transition-all ${
                isActive
                  ? 'bg-[#D1FAE5] text-[#047857]'
                  : 'text-[#57534E] hover:bg-[#F5F5F4] hover:text-[#1C1917]'
              }`
            }
          >
            <span className="w-5 h-5">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User Info */}
      <div className="pt-6 border-t border-[#E7E5E4]">
        <div className="flex items-center gap-3 px-3">
          <div className="w-9 h-9 bg-[#F5F5F4] rounded-full flex items-center justify-center font-semibold text-sm text-[#57534E]">
            {user ? getInitials(user.name) : '?'}
          </div>
          <div>
            <div className="font-medium text-sm text-[#1C1917]">{user?.name || 'Usuario'}</div>
            <div className="text-xs text-[#A8A29E]">{user ? getRoleLabel(user.role) : ''}</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
