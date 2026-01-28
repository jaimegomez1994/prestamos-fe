import type { ReactNode } from 'react';

interface SlideInProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function SlideIn({ isOpen, onClose, title, subtitle, children, footer }: SlideInProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 transition-opacity"
        onClick={onClose}
      />

      {/* Slide-in Panel */}
      <div className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col animate-slide-in">
        {/* Header */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-[#E7E5E4]">
          <div>
            <h2 className="text-xl font-semibold text-[#1C1917]">{title}</h2>
            {subtitle && (
              <p className="text-sm text-[#A8A29E] mt-1">{subtitle}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-[#A8A29E] hover:text-[#1C1917] hover:bg-[#F5F5F4] rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-[#E7E5E4] bg-white">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
