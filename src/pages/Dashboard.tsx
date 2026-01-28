import { useLogout } from '../api/authApi';
import { useAppSelector } from '../store/hooks';
import { selectUser } from '../store/slices/authSlice';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const user = useAppSelector(selectUser);
  const logoutMutation = useLogout();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9]">
      {/* Navbar */}
      <nav className="bg-[#1C1917] px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-[#059669] to-[#047857] rounded-lg flex items-center justify-center text-white font-bold">
            P
          </div>
          <span className="text-white font-semibold text-lg">GD Prestamos</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[#A8A29E] text-sm">{user?.name}</span>
          <button
            onClick={handleLogout}
            className="text-[#A8A29E] hover:text-white text-sm font-medium transition-colors"
          >
            Cerrar sesion
          </button>
        </div>
      </nav>

      {/* Main */}
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-[#1C1917] mb-6">Dashboard</h1>

          <div className="bg-white border border-[#E7E5E4] rounded-2xl p-6">
            <p className="text-[#57534E]">
              Bienvenido, <strong>{user?.name}</strong>
            </p>
            <p className="text-sm text-[#A8A29E] mt-2">
              Rol: {user?.role}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;
