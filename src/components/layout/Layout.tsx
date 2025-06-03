import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Header from './Header';
import Sidebar from './Sidebar';

interface LayoutProps {
  role: string; // Updated to explicitly require role (removed children since we're using Outlet)
}

const Layout: React.FC<LayoutProps> = ({ role }) => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => {
      console.log('Layout: Toggling sidebar, new state:', !prev);
      return !prev;
    });
  };

  console.log('Layout: Rendering with role:', role, 'user:', user?.name, 'isDark:', isDark, 'isSidebarOpen:', isSidebarOpen);

  return (
    <div className={`flex h-screen overflow-hidden font-poppins ${isDark ? 'bg-darkbg text-white' : 'bg-light-bg text-light-text'}`}>
      <Sidebar role={role} isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header role={role} toggleSidebar={toggleSidebar} />
        <main className={`flex-1 overflow-y-auto p-4 md:p-6 backdrop-blur-sm ${isDark ? 'bg-darkbg/80' : 'bg-light-bg/80'}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;