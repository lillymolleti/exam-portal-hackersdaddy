import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  LogOut, Home, FileText, Users, HelpCircle, BarChart, Clock, Menu
} from 'lucide-react';

interface SidebarProps {
  role: string;
}

const Sidebar: React.FC<SidebarProps> = ({ role }) => {
  const { user, logout } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(true); // sidebar toggle state
  const userRole = user?.role || 'student';

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Sidebar: Error logging out:', error);
    }
  };

  const navLinks = [
    { name: 'Home', path: `/${role}/dashboard`, icon: Home },
    { name: 'Exams', path: `/${role}/exams`, icon: FileText },
    { name: 'Active Students', path: `/${role}/students`, icon: Users },
    { name: 'Questions', path: `/${role}/questions`, icon: HelpCircle },
    { name: 'Results', path: `/${role}/results`, icon: BarChart },
    { name: 'History', path: `/${role}/history`, icon: Clock },
  ];

  return (
    <>
      {/* Hamburger button */}
      <div className="p-4 md:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-gray-700 dark:text-gray-300 focus:outline-none"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Sidebar */}
      {isOpen && (
        <aside
          className={`fixed z-50 md:relative w-64 h-full bg-darkbg border-r border-gray-700 p-6 flex flex-col font-poppins transition-transform duration-300 ease-in-out
            ${isDark ? 'bg-darkbg text-dark-text' : 'bg-light-bg text-light-text'}
          `}
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold font-glacial text-primary">ExamPortal</h2>
            {/* Optional: Add close button inside sidebar */}
            <button
              onClick={() => setIsOpen(false)}
              className="md:hidden text-gray-500 dark:text-gray-300"
            >
              ✕
            </button>
          </div>

          <nav className="flex-1 space-y-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-primary/20 text-primary'
                      : isDark
                      ? 'text-gray-300 hover:bg-gray-700'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`
                }
              >
                <link.icon className="h-5 w-5" />
                <span>{link.name}</span>
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto">
            <button
              onClick={handleLogout}
              className={`flex items-center space-x-3 p-3 w-full rounded-lg transition-colors ${
                isDark ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-200'
              }`}
            >
              <LogOut className="h-5 w-5" />
              <span>Logout</span>
            </button>
          </div>
        </aside>
      )}
    </>
  );
};

export default Sidebar;
