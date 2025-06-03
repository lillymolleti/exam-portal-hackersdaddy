import React from 'react';
import { Outlet } from 'react-router-dom'; // ✅ Import Outlet
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Header from './Header';
import Sidebar from './Sidebar';

interface LayoutProps {
  children?: React.ReactNode; // Optional, since we're using <Outlet />
}

const Layout: React.FC<LayoutProps> = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const role = user?.role || 'student';

  console.log('Layout: Rendering with role:', role, 'user:', user?.name, 'isDark:', isDark);

  return (
    <div className={`flex h-screen overflow-hidden font-poppins ${
      isDark ? 'bg-darkbg text-white' : 'bg-light-bg text-light-text'
    }`}>
      <Sidebar role={role} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header role={role} />
        <main className={`flex-1 overflow-y-auto p-4 md:p-6 backdrop-blur-sm ${
          isDark ? 'bg-darkbg/80' : 'bg-light-bg/80'
        }`}>
          <Outlet /> {/* ✅ This is where nested routes will render */}
        </main>
      </div>
    </div>
  );
};

export default Layout;
