import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Home, AlertTriangle } from 'lucide-react';

const NotFound: React.FC = () => {
  const { user } = useAuth();
  
  const getDashboardLink = () => {
    if (!user) return '/login';
    return `/${user.role}/dashboard`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#121212] p-4">
      <div className="max-w-md w-full text-center backdrop-blur-sm bg-[#121212]/40 p-8 rounded-xl border border-[#5cffc9]/30 shadow-lg">
        <div className="flex justify-center mb-6">
          <div className="h-24 w-24 rounded-full bg-red-900/30 flex items-center justify-center">
            <AlertTriangle className="h-12 w-12 text-red-400" />
          </div>
        </div>
        
        <h1 className="text-4xl font-bold text-white mb-2">404</h1>
        <h2 className="text-2xl font-semibold text-[#5cffc9] mb-4">Page Not Found</h2>
        
        <p className="text-gray-300 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <Link
          to={getDashboardLink()}
          className="px-6 py-3 bg-gradient-to-r from-[#5cffc9] to-[#00ac76] hover:from-[#4be3b0] hover:to-[#008f5f] text-white rounded-lg text-sm font-medium flex items-center justify-center mx-auto max-w-xs transition-all"
        >
          <Home className="h-5 w-5 mr-2" />
          Back to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;