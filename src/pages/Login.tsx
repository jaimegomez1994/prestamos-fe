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

  const LogoIcon = ({ size = 24 }: { size?: number }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width={size} height={size}>
      <path d="M7 14C7 14 8 13 10 13C11 13 11.5 13.5 12 13.5C12.5 13.5 13 13 14 13C15 13 16 13.5 16 14.5C16 15.5 15 16.5 13 16.5H11" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7 14V17H11" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="15" cy="9" r="3.5"/>
    </svg>
  );

  return (
    <div className="min-h-screen min-h-dvh bg-[#FAFAF9] flex flex-col">
      {/* Navbar */}
      <nav className="bg-white border-b border-[#E7E5E4] px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between flex-shrink-0">
        <a href="/" className="flex items-center gap-3 no-underline">
          <div className="w-10 h-10 bg-gradient-to-br from-[#059669] to-[#047857] rounded-[10px] flex items-center justify-center text-white">
            <LogoIcon size={24} />
          </div>
          <span className="text-[#1C1917] font-semibold text-lg hidden sm:block">GD Prestamos</span>
        </a>
        <div className="flex items-center gap-1 sm:gap-2">
          <a href="/mi-cuenta" className="text-[#57534E] text-sm font-medium px-3 sm:px-4 py-2 rounded-[10px] hover:bg-[#F5F5F4] hover:text-[#1C1917] transition-all">
            Mi Cuenta
          </a>
          <span className="text-[#57534E] text-sm font-medium px-3 sm:px-4 py-2 rounded-[10px] bg-[#D1FAE5] text-[#047857]">
            Iniciar Sesion
          </span>
        </div>
      </nav>

      {/* Main */}
      <main className="flex-1 flex items-center sm:items-center items-start justify-center p-4 sm:p-6 md:p-10">
        <div className="w-full max-w-[400px]">
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-16 h-16 sm:w-[72px] sm:h-[72px] bg-gradient-to-br from-[#059669] to-[#047857] rounded-[16px] sm:rounded-[18px] flex items-center justify-center mx-auto mb-5 sm:mb-6 shadow-[0_8px_24px_rgba(5,150,105,0.25)] text-white">
              <LogoIcon size={36} />
            </div>
            <h1 className="text-2xl sm:text-[28px] font-bold text-[#1C1917] mb-2">Bienvenido</h1>
            <p className="text-[15px] text-[#57534E]">Ingresa a tu cuenta para continuar</p>
          </div>

          {/* Card */}
          <div className="bg-white border border-[#E7E5E4] rounded-2xl p-6 sm:p-8 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
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
                  Correo electronico <span className="text-[#DC2626]">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={handleChange('email')}
                  disabled={loginMutation.isPending}
                  placeholder="tu@correo.com"
                  required
                  autoComplete="email"
                  inputMode="email"
                  className="w-full px-4 py-3.5 sm:py-3 border border-[#E7E5E4] rounded-[10px] text-base placeholder-[#A8A29E] focus:outline-none focus:border-[#059669] focus:ring-[3px] focus:ring-[#D1FAE5] disabled:bg-gray-50 transition-all"
                />
              </div>

              {/* Password */}
              <div className="mb-5">
                <label className="block text-sm font-medium text-[#1C1917] mb-2">
                  Contrasena <span className="text-[#DC2626]">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange('password')}
                    disabled={loginMutation.isPending}
                    placeholder="Ingresa tu contrasena"
                    required
                    autoComplete="current-password"
                    className="w-full px-4 py-3.5 sm:py-3 pr-14 border border-[#E7E5E4] rounded-[10px] text-base placeholder-[#A8A29E] focus:outline-none focus:border-[#059669] focus:ring-[3px] focus:ring-[#D1FAE5] disabled:bg-gray-50 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-1 top-1/2 -translate-y-1/2 text-[#A8A29E] hover:text-[#57534E] hover:bg-[#F5F5F4] active:bg-[#E7E5E4] p-2.5 rounded-[10px] transition-all"
                    aria-label={showPassword ? 'Ocultar contrasena' : 'Mostrar contrasena'}
                  >
                    {showPassword ? (
                      <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-[22px] h-[22px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              {/* Forgot Password */}
              <div className="text-right mb-6">
                <a href="/recuperar" className="text-sm font-medium text-[#059669] hover:text-[#047857] hover:underline transition-colors">
                  ¿Olvidaste tu contrasena?
                </a>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full py-4 sm:py-4 bg-[#059669] text-white font-semibold text-base rounded-[10px] hover:bg-[#047857] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loginMutation.isPending ? 'Iniciando sesion...' : 'Iniciar sesion'}
              </button>
            </form>
          </div>

          {/* Footer */}
          <p className="text-center mt-6 text-sm text-[#57534E]">
            ¿Eres cliente? <a href="/mi-cuenta" className="text-[#059669] font-medium hover:underline">Consulta tu saldo aqui</a>
          </p>
        </div>
      </main>
    </div>
  );
}

export default Login;
