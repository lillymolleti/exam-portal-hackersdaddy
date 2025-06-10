import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { LogOut, Home, FileText, Users, HelpCircle, BarChart, Clock, X } from 'lucide-react';
import logo from '../../assets/vulnet-logo.png';


interface SidebarProps {
  role: string;
  isOpen: boolean;
  toggleSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ role, isOpen, toggleSidebar }) => {
  const { user, logout } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const userRole = user?.role || 'student';

  console.log('Sidebar: Rendering for role:', role, 'userRole:', userRole, 'isDark:', isDark, 'isOpen:', isOpen);

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
    <>
      <aside
        className={`fixed inset-y-0 left-0 w-64 border-r p-6 flex flex-col font-poppins transform transition-transform duration-300 ease-in-out z-50 ${
          isDark
            ? 'bg-darkbg border-gray-700 text-dark-text'
            : 'bg-light-bg border-gray-300 text-light-text'
        } ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:static md:inset-auto`}
      >
        <div className="flex items-center justify-start mb-8 gap-4 pl-2">
          <img src={logo} alt="Vulnet Logo" className="h-12 w-11 rounded-sm border border-primary/30" />
          <h2 className="text-xl font-bold font-glacial text-primary">ExamPortal</h2>
          <button onClick={toggleSidebar} className="md:hidden text-gray-400 hover:text-primary">
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex-1 space-y-2">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              onClick={() => {
                console.log(`Sidebar: NavLink clicked for ${link.name}`);
                if (window.innerWidth < 768) toggleSidebar();
              }}
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

      {isOpen && (
        <div
          className={`fixed inset-0 ${isDark ? 'bg-black/50' : 'bg-black/30'} z-40 md:hidden`}
          onClick={toggleSidebar}
        ></div>
      )}
    </>
  );
};

export default Sidebar;