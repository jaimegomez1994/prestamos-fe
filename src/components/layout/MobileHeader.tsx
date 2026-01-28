interface MobileHeaderProps {
  onMenuToggle: () => void;
}

export function MobileHeader({ onMenuToggle }: MobileHeaderProps) {
  return (
    <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-[#E7E5E4] flex items-center justify-between px-4 z-40">
      <button
        onClick={onMenuToggle}
        className="p-2 text-[#57534E] hover:text-[#1C1917] hover:bg-[#F5F5F4] rounded-lg transition-colors"
        aria-label="Toggle menu"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className="flex items-center gap-2">
        <img src="/logo-icon.svg" alt="GD Préstamos" className="w-8 h-8" />
        <span className="font-semibold text-[#1C1917]">GD Préstamos</span>
      </div>

      <div className="w-10" /> {/* Spacer for centering */}
    </header>
  );
}
