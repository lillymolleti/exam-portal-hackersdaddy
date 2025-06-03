import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase';
import { BarChart2, CheckCircle, Clock } from 'lucide-react';
import ExamCard from '../../components/exams/ExamCard';

interface Exam {
  id: string;
  title: string;
  date: string; // ISO string
  duration: number;
  totalQuestions: number;
  description?: string;
  passingScore?: number;
}

interface Stat {
  averageScore: number;
  examsTaken: number;
  successRate: number;
}

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [stats, setStats] = useState<Stat>({ averageScore: 0, examsTaken: 0, successRate: 0 });
  const [upcomingExams, setUpcomingExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch results
        const resultsSnapshot = await getDocs(query(collection(db, 'results'), where('userId', '==', user?.firebaseUser.uid)));
        const resultsData = resultsSnapshot.docs.map(doc => doc.data());
        const examsTaken = resultsData.length;
        const averageScore = examsTaken > 0
          ? Math.round(resultsData.reduce((sum, r) => sum + r.score, 0) / examsTaken)
          : 0;
        const successRate = examsTaken > 0
          ? Math.round((resultsData.filter(r => r.score >= 50).length / examsTaken) * 100)
          : 0;

        // Fetch upcoming exams
        const examsSnapshot = await getDocs(collection(db, 'exams'));
        const examsData: Exam[] = [];
        for (const examDoc of examsSnapshot.docs) {
          const examData = examDoc.data();
          const examDate = new Date(examData.date);
          if (!isNaN(examDate.getTime()) && examDate > new Date()) {
            examsData.push({
              id: examDoc.id,
              title: examData.title,
              date: examData.date,
              duration: examData.duration,
              totalQuestions: examData.totalQuestions,
              description: examData.description,
              passingScore: examData.passingScore,
            });
          }
        }

        setStats({ averageScore, examsTaken, successRate });
        setUpcomingExams(examsData.slice(0, 3)); // Show 3 upcoming exams
        console.log('StudentDashboard: Fetched stats:', { averageScore, examsTaken, successRate });
      } catch (error) {
        console.error('StudentDashboard: Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchData();
    }
  }, [user]);

  if (loading) {
    return <div className={`p-6 text-center ${isDark ? 'bg-darkbg text-white' : 'bg-light-bg text-light-text'}`}>Loading dashboard...</div>;
  }

  return (
    <div className={`space-y-6 ${isDark ? 'bg-darkbg text-white' : 'bg-light-bg text-light-text'}`}>
      <div>
        <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-light-text'}`}>Welcome, {user?.name || user?.firebaseUser.email}</h1>
        <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Track your progress and upcoming exams</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`p-6 rounded-xl border backdrop-blur-sm glass-effect ${
          isDark ? 'bg-darkbg/80 border-gray-700' : 'bg-light-bg/80 border-gray-300'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Average Score</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-light-text'}`}>{stats.averageScore}%</p>
            </div>
            <BarChart2 className={`h-8 w-8 ${isDark ? 'text-primary' : 'text-light-text'}`} />
          </div>
        </div>
        <div className={`p-6 rounded-xl border backdrop-blur-sm glass-effect ${
          isDark ? 'bg-darkbg/80 border-gray-700' : 'bg-light-bg/80 border-gray-300'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Exams Taken</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-light-text'}`}>{stats.examsTaken}</p>
            </div>
            <CheckCircle className={`h-8 w-8 ${isDark ? 'text-primary' : 'text-light-text'}`} />
          </div>
        </div>
        <div className={`p-6 rounded-xl border backdrop-blur-sm glass-effect ${
          isDark ? 'bg-darkbg/80 border-gray-700' : 'bg-light-bg/80 border-gray-300'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Success Rate</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-light-text'}`}>{stats.successRate}%</p>
            </div>
            <Clock className={`h-8 w-8 ${isDark ? 'text-primary' : 'text-light-text'}`} />
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-light-text'}`}>Upcoming Exams</h2>
          <a href="/exams" className={`text-sm font-medium ${isDark ? 'text-primary hover:text-[#4be3b0]' : 'text-light-text hover:text-gray-800'}`}>
            View All
          </a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {upcomingExams.map(exam => (
            <ExamCard
              key={exam.id}
              exam={exam}
              role="student"
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;