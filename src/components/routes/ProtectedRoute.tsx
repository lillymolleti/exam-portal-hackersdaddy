import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
  role: 'admin' | 'student';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ role }) => {
  const { user, isAuthenticated } = useAuth();

  console.log('ProtectedRoute: Checking auth, isAuthenticated:', isAuthenticated, 'user.role:', user?.role, 'required role:', role);

  if (!isAuthenticated) {
    console.log('ProtectedRoute: Not authenticated, redirecting to /login');
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== role) {
    console.log('ProtectedRoute: Role mismatch, redirecting to /login');
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;