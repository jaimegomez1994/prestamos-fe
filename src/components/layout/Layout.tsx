import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

function Layout() {
  return (
    <div className="flex min-h-screen bg-[#FAFAF9]">
      <Sidebar />
      <main className="flex-1 ml-[260px] p-8">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
