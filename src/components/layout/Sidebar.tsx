import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { LogOut, Home, FileText, Users, HelpCircle, BarChart, Clock } from 'lucide-react';

interface SidebarProps {
  role: string; // Changed from isOpen and toggleSidebar to role
}

const Sidebar: React.FC<SidebarProps> = ({ role }) => {
  const { user, logout } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const userRole = user?.role || 'student';

  console.log('Sidebar: Rendering for role:', role, 'userRole:', userRole, 'isDark:', isDark);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login', { replace: true });
      console.log('Sidebar: Logout successful');
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
    <aside
      className={`w-64 bg-darkbg border-r border-gray-700 p-6 flex flex-col font-poppins ${
        isDark ? 'bg-darkbg text-dark-text' : 'bg-light-bg text-light-text'
      }`}
    >
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-xl font-bold font-glacial text-primary">ExamPortal</h2>
      </div>

      <nav className="flex-1 space-y-2">
        {navLinks.map((link) => (
          <NavLink
            key={link.name}
            to={link.path}
            className={({ isActive }) => {
              console.log(`Sidebar: NavLink rendered for ${link.name}, isActive:`, isActive);
              return `flex items-center space-x-3 p-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-primary/20 text-primary'
                  : isDark
                  ? 'text-gray-300 hover:bg-gray-700'
                  : 'text-gray-600 hover:bg-gray-200'
              }`;
            }}
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
  );
};

export default Sidebar;