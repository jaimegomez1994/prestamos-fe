import { useState } from 'react';

interface FABAction {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}

interface FABProps {
  actions: FABAction[];
}

export function FAB({ actions }: FABProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (actions.length === 0) return null;

  // Single action - just show the button directly
  if (actions.length === 1) {
    return (
      <button
        onClick={actions[0].onClick}
        className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-[#059669] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#047857] transition-colors z-30"
        aria-label={actions[0].label}
      >
        {actions[0].icon}
      </button>
    );
  }

  // Multiple actions - show expandable FAB
  return (
    <div className="md:hidden fixed bottom-6 right-6 z-30">
      {/* Action buttons */}
      <div
        className={`absolute bottom-16 right-0 flex flex-col gap-3 transition-all duration-200 ${
          isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={() => {
              action.onClick();
              setIsOpen(false);
            }}
            className="flex items-center gap-3 pl-3 pr-4 py-2.5 bg-white rounded-full shadow-lg hover:bg-[#F5F5F4] transition-colors"
          >
            <span className="w-8 h-8 bg-[#059669] text-white rounded-full flex items-center justify-center">
              {action.icon}
            </span>
            <span className="text-sm font-medium text-[#1C1917] whitespace-nowrap">
              {action.label}
            </span>
          </button>
        ))}
      </div>

      {/* Main FAB button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 bg-[#059669] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#047857] transition-all duration-200 ${
          isOpen ? 'rotate-45' : ''
        }`}
        aria-label="Quick actions"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 -z-10"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}
