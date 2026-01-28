import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { MobileHeader } from './MobileHeader';

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[#FAFAF9]">
      <MobileHeader onMenuToggle={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <main className="flex-1 md:ml-[260px] p-4 md:p-8 pt-20 md:pt-8">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
