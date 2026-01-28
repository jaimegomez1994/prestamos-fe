import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLogin } from '../api/authApi';
import { useAppSelector } from '../store/hooks';
import { selectAuth } from '../store/slices/authSlice';

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { error } = useAppSelector(selectAuth);
  const loginMutation = useLogin();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await loginMutation.mutateAsync(formData);
      navigate(from, { replace: true });
    } catch {
      // Error handled by mutation
    }
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }));
  };

  return (
    <div className="min-h-screen bg-[#FAFAF9] flex flex-col">
      {/* Navbar */}
      <nav className="bg-[#1C1917] px-6 py-4 flex items-center justify-between">
        <a href="/" className="flex items-center gap-3 no-underline">
          <div className="w-9 h-9 bg-gradient-to-br from-[#059669] to-[#047857] rounded-lg flex items-center justify-center text-white font-bold">
            P
          </div>
          <span className="text-white font-semibold text-lg hidden sm:block">GD Prestamos</span>
        </a>
      </nav>

      {/* Main */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-[440px]">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-gradient-to-br from-[#059669] to-[#047857] rounded-xl flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
              P
            </div>
            <h1 className="text-2xl font-bold text-[#1C1917]">Iniciar sesion</h1>
          </div>

          {/* Card */}
          <div className="bg-white border border-[#E7E5E4] rounded-2xl p-8">
            <form onSubmit={handleSubmit}>
              {/* Error */}
              {(error || loginMutation.error) && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-5">
                  {error || loginMutation.error?.message}
                </div>
              )}

              {/* Email */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-[#1C1917] mb-2">
                  Correo electronico <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={handleChange('email')}
                  disabled={loginMutation.isPending}
                  placeholder="tu@correo.com"
                  required
                  className="w-full px-4 py-3 border border-[#E7E5E4] rounded-lg text-[15px] placeholder-[#A8A29E] focus:outline-none focus:border-[#059669] focus:ring-3 focus:ring-[#D1FAE5] disabled:bg-gray-50"
                />
              </div>

              {/* Password */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-[#1C1917] mb-2">
                  Contrasena <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange('password')}
                    disabled={loginMutation.isPending}
                    placeholder="Ingresa tu contrasena"
                    required
                    className="w-full px-4 py-3 pr-12 border border-[#E7E5E4] rounded-lg text-[15px] placeholder-[#A8A29E] focus:outline-none focus:border-[#059669] focus:ring-3 focus:ring-[#D1FAE5] disabled:bg-gray-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#A8A29E] hover:text-[#57534E] p-1"
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full py-3.5 bg-[#1C1917] text-white font-semibold rounded-lg hover:bg-[#292524] transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              >
                {loginMutation.isPending ? 'Iniciando sesion...' : 'Iniciar sesion'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Login;
