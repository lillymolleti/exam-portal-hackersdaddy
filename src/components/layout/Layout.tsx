import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import { useAuth } from '../../context/AuthContext';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user } = useAuth();
  const role = user?.role || 'student';

  return (
    <div className="flex h-screen overflow-hidden bg-darkbg text-white font-poppins">
      <Sidebar role={role} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-darkbg/80 backdrop-blur-sm">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
