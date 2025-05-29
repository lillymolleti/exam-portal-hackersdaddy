import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Bell, Moon, Sun, User } from 'lucide-react';

const Header: React.FC = () => {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="border-b border-primary/20 bg-darkbg/90 backdrop-blur-md px-4 py-3 font-poppins">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <h2 className="text-xl font-semibold text-primary ml-8 md:ml-0">
            {user?.role === 'admin' ? 'Admin Dashboard' : 'Student Dashboard'}
          </h2>
        </div>

        <div className="flex items-center space-x-4">
          <button
            className="text-gray-300 hover:text-primary p-2 rounded-full transition-all"
            onClick={toggleTheme}
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          <div className="relative">
            <button className="text-gray-300 hover:text-primary p-2 rounded-full transition-all">
              <Bell size={20} />
              <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <div className="bg-gradient-to-r from-primary to-secondary p-0.5 rounded-full">
              <div className="bg-darkbg rounded-full p-1">
                <User size={20} className="text-white" />
              </div>
            </div>
            <span className="text-sm font-medium text-gray-200 hidden md:block">
              {user?.name || 'User'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
