import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/routes/ProtectedRoute';
import Layout from './components/layout/Layout'; // Import Layout
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/student/StudentDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import Exams from './pages/Exams';
import Questions from './pages/admin/Questions';
import ActiveStudents from './pages/ActiveStudents';
import Results from './pages/Results';
import History from './pages/History';

const App: React.FC = () => {
  const { isAuthenticated, loading, user } = useAuth();

  console.log('App: Rendering with isAuthenticated:', isAuthenticated, 'loading:', loading, 'user.role:', user?.role);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-darkbg">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ThemeProvider>
      <Routes>
        {/* Login Route - No Layout */}
        <Route
          path="/login"
          element={
            isAuthenticated && user?.role ? <Navigate to={`/${user.role}/dashboard`} replace /> : <Login />
          }
        />

        {/* Register Route - No Layout */}
        <Route
          path="/register"
          element={
            isAuthenticated && user?.role ? <Navigate to={`/${user.role}/dashboard`} replace /> : <Register />
          }
        />

        {/* Student Routes - With Layout */}
        <Route path="/student" element={<ProtectedRoute role="student" />}>
          <Route element={<Layout />}>
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="exams" element={<Exams />} />
            <Route path="results" element={<Results />} />
            <Route path="history" element={<History />} />
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>
        </Route>

        {/* Admin Routes - With Layout */}
        <Route path="/admin" element={<ProtectedRoute role="admin" />}>
          <Route element={<Layout />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="exams" element={<Exams />} />
            <Route path="questions" element={<Questions />} />
            <Route path="active-students" element={<ActiveStudents />} />
            <Route path="results" element={<Results />} />
            <Route path="history" element={<History />} />
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>
        </Route>

        {/* Default Route */}
        <Route
          path="/"
          element={
            isAuthenticated && user?.role ? <Navigate to={`/${user.role}/dashboard`} replace /> : <Navigate to="/login" replace />
          }
        />

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </ThemeProvider>
  );
};

export default App;