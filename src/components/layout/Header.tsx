import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Bell, Moon, Sun, User, Menu } from 'lucide-react';

interface HeaderProps {
  role: string;
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ role, toggleSidebar }) => {
  const { user, loading: authLoading } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [isLoading, setIsLoading] = useState(true);

  const dashboardTitle =
    role === 'admin'
      ? ' '
      : role === 'student'
      ? ' '
      : 'Dashboard';

  useEffect(() => {
    if (!authLoading) {
      setIsLoading(false);
      console.log('Header: User loaded:', user, 'role:', role);
    }
  }, [authLoading, user, role]);

  console.log(
    'Header: Rendering with title:',
    dashboardTitle,
    'user:',
    user,
    'role:',
    role,
    'isDark:',
    isDark
  );

  const headerClasses = `
    border-b border-primary/20
    px-4 py-3
    font-poppins
    backdrop-blur-md
    ${isDark ? 'bg-darkbg/90' : 'bg-light-bg/90'}
  `;

  if (isLoading) {
    return (
      <header className={headerClasses}>
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={toggleSidebar}
              className="md:hidden text-gray-400 hover:text-primary"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-xl font-semibold text-primary">
              {dashboardTitle}
            </h2>
          </div>

          <div className="flex items-center space-x-4">
            <div className="animate-pulse bg-gray-300 rounded-full h-8 w-8" />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className={headerClasses}>
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleSidebar}
            className="md:hidden text-gray-400 hover:text-primary"
          >
            <Menu size={20} />
          </button>
          <h2 className="text-xl font-semibold text-primary">
            {dashboardTitle}
          </h2>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={() => {
              console.log('Header: toggling theme, wasDark=', isDark);
              toggleTheme();
            }}
            className={`p-2 rounded-full transition-all ${
              isDark ? 'text-gray-300 hover:text-primary' : 'text-gray-700 hover:text-primary'
            }`}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <div className="relative">
            <button
              onClick={() => console.log('Header: bell clicked')}
              className={`p-2 rounded-full transition-all ${
                isDark ? 'text-gray-300 hover:text-primary' : 'text-gray-700 hover:text-primary'
              }`}
            >
              <Bell size={20} />
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500" />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-primary to-secondary p-0.5 rounded-full">
              <div className={`rounded-full p-1 ${isDark ? 'bg-darkbg' : 'bg-light-bg'}`}>
                <User size={20} className="text-primary" />
              </div>
            </div>
            <span className="text-sm font-medium hidden md:block text-primary">
              {user?.email || 'User'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;