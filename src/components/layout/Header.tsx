import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Bell, Moon, Sun, User } from 'lucide-react';

interface HeaderProps {
  role: string;
}

const Header: React.FC<HeaderProps> = ({ role }) => {
  const { user, loading: authLoading } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);

  const dashboardTitle = role === 'admin' ? 'Admin Dashboard' : role === 'student' ? 'Student Dashboard' : 'Dashboard';

  // Handle initial loading state for user
  useEffect(() => {
    if (!authLoading) {
      setIsLoading(false);
      console.log('Header: User loaded:', user, 'role:', role);
    }
  }, [user, authLoading, role]);

  // Debug logging
  console.log('Header: Rendering with title:', dashboardTitle, 'user:', user, 'role:', role);
  console.log('Header: Theme state:', { isDark, documentClass: document.documentElement.className });

  if (isLoading) {
    return (
      <header className={`border-b border-primary/20 px-4 py-3 font-poppins backdrop-blur-md ${
        isDark ? 'bg-darkbg/90' : 'bg-light-bg/90'
      }`}>
        <div className="flex justify-between items-center">
          <h2 className={`text-xl font-semibold ml-8 md:ml-0 text-primary`}>
            {dashboardTitle}
          </h2>
          <div className="flex items-center space-x-4">
            <div className="animate-pulse bg-gray-300 rounded-full h-8 w-8"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className={`border-b border-primary/20 px-4 py-3 font-poppins backdrop-blur-md ${
      isDark ? 'bg-darkbg/90' : 'bg-light-bg/90'
    }`}>
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <h2 className={`text-xl font-semibold ml-8 md:ml-0 text-primary`}>
            {dashboardTitle}
          </h2>
        </div>

        <div className="flex items-center space-x-4">
          <button
            className={`p-2 rounded-full transition-all ${
              isDark ? 'text-gray-300 hover:text-primary' : 'text-gray-700 hover:text-primary'
            }`}
            onClick={() => {
              console.log('Header: Theme toggle clicked, current isDark:', isDark);
              toggleTheme();
            }}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <div className="relative">
            <button 
              className={`p-2 rounded-full transition-all ${
                isDark ? 'text-gray-300 hover:text-primary' : 'text-gray-700 hover:text-primary'
              }`}
              onClick={() => console.log('Header: Notification bell clicked')}
            >
              <Bell size={20} />
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-primary to-secondary p-0.5 rounded-full">
              <div className={`rounded-full p-1 ${isDark ? 'bg-darkbg' : 'bg-light-bg'}`}>
                <User size={20} className="text-primary" />
              </div>
            </div>
            <span className={`text-sm font-medium hidden md:block text-primary`}>
              {user?.email || 'User'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;