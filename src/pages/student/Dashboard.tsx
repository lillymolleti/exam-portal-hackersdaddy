import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Clock, Award, Calendar, CheckCircle } from 'lucide-react';
import StatsCard from '../../components/dashboard/StatsCard';
import ExamCard from '../../components/exams/ExamCard';
import { Link } from 'react-router-dom';

// Mock data for student dashboard
const upcomingExams = [
  { id: '1', title: 'Web Development Fundamentals', date: '2025-08-15', duration: 60, totalQuestions: 10 },
  { id: '2', title: 'Data Structures and Algorithms', date: '2025-08-18', duration: 90, totalQuestions: 10 },
];

const currentExam = {
  id: '3',
  title: 'JavaScript Programming',
  date: '2025-08-12',
  duration: 120,
  totalQuestions: 10,
  progress: 30,
};

const recentResults = [
  { id: '4', title: 'Database Systems', score: 85, status: 'Passed', date: '2025-08-01' },
  { id: '5', title: 'Computer Networks', score: 72, status: 'Passed', date: '2025-07-25' },
];

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div 
      className="space-y-6" 
      style={{ 
        backgroundColor: '#121212', 
        fontFamily: "'Poppins', sans-serif",
        minHeight: '100vh', 
        padding: '1rem 2rem',
        color: '#ffffff',
      }}
    >
      <style>
        {`
          /* Inglacial Difference font for headings */
          h1, h2, h3 {
            font-family: 'Inglacial Difference', cursive;
          }
        `}
      </style>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: '#5cffc9' }}>
            Welcome back, {user?.name}!
          </h1>
          <p className="mt-1" style={{ color: '#a0f0d1' }}>
            Stay updated with your upcoming exams and results
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <span 
            className="px-4 py-2 rounded-full text-sm font-medium" 
            style={{ 
              backgroundColor: 'rgba(92, 255, 201, 0.2)', 
              color: '#00ac76', 
              border: '1px solid rgba(0, 172, 118, 0.5)',
            }}
          >
            Student Portal
          </span>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard 
          title="Upcoming Exams" 
          value={upcomingExams.length.toString()} 
          icon={<Calendar className="h-6 w-6" style={{ color: '#5cffc9' }} />}
          trend="neutral"
          description="Scheduled for this month"
          bgClass="bg-gradient-to-r from-[#5cffc9]/30 to-[#00ac76]/30"
        />
        <StatsCard 
          title="Average Score" 
          value="78%" 
          icon={<Award className="h-6 w-6" style={{ color: '#00ac76' }} />}
          trend="up"
          description="5% higher than last month"
          bgClass="bg-gradient-to-r from-[#00ac76]/30 to-[#5cffc9]/30"
        />
        <StatsCard 
          title="Completed Exams" 
          value="12" 
          icon={<CheckCircle className="h-6 w-6" style={{ color: '#5cffc9' }} />}
          trend="up"
          description="2 more than last month"
          bgClass="bg-gradient-to-r from-[#00ac76]/30 to-[#5cffc9]/30"
        />
      </div>

      {/* Current Exam */}
      {currentExam && (
        <div 
          className="rounded-xl border p-6 backdrop-blur-sm" 
          style={{ 
            background: 'linear-gradient(90deg, rgba(92,255,201,0.2), rgba(0,172,118,0.2))',
            borderColor: 'rgba(0,172,118,0.5)',
          }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold" style={{ color: '#5cffc9' }}>
              Current Exam
            </h2>
            <span 
              className="px-3 py-1 rounded-full text-xs font-medium flex items-center" 
              style={{ backgroundColor: 'rgba(255, 202, 59, 0.2)', color: '#ffea3c' }}
            >
              <Clock className="h-3 w-3 mr-1" /> In Progress
            </span>
          </div>
          
          <div className="flex flex-col md:flex-row justify-between">
            <div>
              <h3 className="text-lg font-medium" style={{ color: '#00ac76' }}>{currentExam.title}</h3>
              <p className="mt-1" style={{ color: '#a0f0d1' }}>
                Duration: {currentExam.duration} minutes | Total Questions: {currentExam.totalQuestions}
              </p>
            </div>
            
            <div className="mt-4 md:mt-0">
              <Link
                to={`/student/exams/${currentExam.id}`}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200"
                style={{
                  background: 'linear-gradient(90deg, #5cffc9, #00ac76)',
                  color: '#121212',
                  fontWeight: '600',
                }}
              >
                Continue Exam
              </Link>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="w-full rounded-full h-2.5" style={{ backgroundColor: '#222' }}>
              <div 
                style={{ 
                  width: `${currentExam.progress}%`,
                  background: 'linear-gradient(90deg, #5cffc9, #00ac76)',
                  height: '10px',
                  borderRadius: '9999px',
                }}
              />
            </div>
            <p className="text-right text-xs mt-1" style={{ color: '#a0f0d1' }}>
              {currentExam.progress}% completed
            </p>
          </div>
        </div>
      )}

      {/* Upcoming Exams */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold" style={{ color: '#5cffc9' }}>Upcoming Exams</h2>
          <Link 
            to="/student/exams" 
            className="text-sm font-medium"
            style={{ color: '#00ac76' }}
            onMouseOver={e => e.currentTarget.style.color = '#5cffc9'}
            onMouseOut={e => e.currentTarget.style.color = '#00ac76'}
          >
            View All
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {upcomingExams.map((exam) => (
            <ExamCard key={exam.id} exam={exam} role="student" />
          ))}
        </div>
      </div>

      {/* Recent Results */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold" style={{ color: '#5cffc9' }}>Recent Results</h2>
          <Link 
            to="/student/results" 
            className="text-sm font-medium"
            style={{ color: '#00ac76' }}
            onMouseOver={e => e.currentTarget.style.color = '#5cffc9'}
            onMouseOut={e => e.currentTarget.style.color = '#00ac76'}
          >
            View All
          </Link>
        </div>
        
        <div 
          className="rounded-xl border overflow-hidden backdrop-blur-sm" 
          style={{ backgroundColor: 'rgba(18,18,18,0.8)', borderColor: 'rgba(0,172,118,0.5)' }}
        >
          <table className="min-w-full divide-y" style={{ borderColor: 'rgba(0,172,118,0.3)' }}>
            <thead style={{ backgroundColor: 'rgba(0,172,118,0.15)' }}>
              <tr>
                {['Exam', 'Date', 'Score', 'Status'].map((header) => (
                  <th 
                    key={header}
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
                    style={{ color: '#a0f0d1', borderColor: 'rgba(0,172,118,0.3)' }}
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody style={{ borderColor: 'rgba(0,172,118,0.3)' }}>
              {recentResults.map((result) => (
                <tr 
                  key={result.id} 
                  className="hover:opacity-80 transition-opacity"
                  style={{ borderBottom: '1px solid rgba(0,172,118,0.3)' }}
                >
                  <td className="px-6 py-4 whitespace-nowrap font-medium" style={{ color: '#5cffc9' }}>{result.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap" style={{ color: '#a0f0d1' }}>{result.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-medium" style={{ color: '#5cffc9' }}>{result.score}%</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span 
                      className={`px-2 py-1 rounded-full text-xs font-medium`}
                      style={{
                        backgroundColor: result.status === 'Passed' ? 'rgba(92,255,201,0.2)' : 'rgba(255,92,92,0.2)',
                        color: result.status === 'Passed' ? '#5cffc9' : '#ff5c5c',
                      }}
                    >
                      {result.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
