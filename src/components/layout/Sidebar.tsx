import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Home, 
  FileText, 
  Users, 
  HelpCircle, 
  BarChart2, 
  Clock, 
  LogOut,
  Menu,
  X
} from 'lucide-react';

interface SidebarProps {
  role: 'admin' | 'student';
}

const Sidebar: React.FC<SidebarProps> = ({ role }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const baseRoute = `/${role}`;

  const navItems = [
    { name: 'Home', icon: <Home size={20} />, path: `${baseRoute}/dashboard` },
    { name: 'Exams', icon: <FileText size={20} />, path: `${baseRoute}/exams` },
    ...(role === 'admin' ? [
      { name: 'Active Students', icon: <Users size={20} />, path: `${baseRoute}/active-students` },
      { name: 'Questions', icon: <HelpCircle size={20} />, path: `${baseRoute}/questions` },
    ] : []),
    { name: 'Results', icon: <BarChart2 size={20} />, path: `${baseRoute}/results` },
    { name: 'History', icon: <Clock size={20} />, path: `${baseRoute}/history` },
  ];

  const toggleSidebar = () => setIsOpen(!isOpen);

  return (
    <>
      {/* Mobile menu button */}
      <button 
        onClick={toggleSidebar} 
        className="fixed top-4 left-4 z-50 md:hidden text-white bg-[#121212] p-2 rounded-md"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed md:static inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out
                   ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
                   flex flex-col h-full overflow-y-auto bg-[#121212] bg-opacity-90 backdrop-blur-sm
                   border-r border-[#5cffc9]/30 shadow-xl`}
      >
        <div className="flex items-center justify-center p-4 border-b border-[#5cffc9]/30">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-[#5cffc9] flex items-center justify-center">
              <span className="text-[#121212] font-bold">E</span>
            </div>
            <h1 className="text-xl font-bold text-[#5cffc9]">ExamPortal</h1>
          </div>
        </div>

        <nav className="flex-1 px-2 py-4 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
                ${isActive 
                  ? 'bg-[#5cffc9]/30 text-[#5cffc9] border-l-4 border-[#5cffc9]' 
                  : 'text-gray-300 hover:bg-[#00ac76]/30 hover:text-[#4be3b0]'}`
              }
              onClick={() => setIsOpen(false)}
            >
              <span className="mr-3">{item.icon}</span>
              {item.name}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-[#5cffc9]/30">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2.5 text-sm font-medium text-gray-300 rounded-lg hover:bg-red-900/30 hover:text-red-300 transition-all duration-200"
          >
            <LogOut size={20} className="mr-3" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;