import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/routes/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/student/Dashboard';
import AdminDashboard from './pages/admin/Dashboard';
import AddExam from './pages/admin/AddExam';
import Exams from './pages/Exams';
import Questions from './pages/Questions';
import Results from './pages/Results';
import History from './pages/History';
import ActiveStudents from './pages/ActiveStudents';
import ExamInterface from './pages/ExamInterface';
import NotFound from './pages/NotFound';
import

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Student Routes */}
            <Route path="/student" element={<ProtectedRoute role="student" />}>
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="exams" element={<Exams />} />
              <Route path="exams/:examId" element={<ExamInterface />} />
              <Route path="results" element={<Results />} />
              <Route path="history" element={<History />} />
              <Route index element={<Navigate to="/student/dashboard" replace />} />
            </Route>
            
            {/* Admin Routes */}
            <Route path="/admin" element={<ProtectedRoute role="admin" />}>
            <Route path="/admin/login" element={<Login />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="add-exam" element={<AddExam />} />
              <Route path="exams" element={<Exams />} />
              <Route path="active-students" element={<ActiveStudents />} />
              <Route path="questions" element={<Questions />} />
              <Route path="results" element={<Results />} />
              <Route path="history" element={<History />} />
              <Route index element={<Navigate to="/admin/dashboard" replace />} />
            </Route>
            
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;

