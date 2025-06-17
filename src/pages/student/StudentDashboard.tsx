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
        // Fetch results for the current student
        const resultsSnapshot = await getDocs(query(collection(db, 'results'), where('userId', '==', user?.firebaseUser.uid)));
        const resultsData = resultsSnapshot.docs.map(doc => doc.data());
        const examsTaken = resultsData.length;
        const averageScore = examsTaken > 0
          ? Math.round(resultsData.reduce((sum, r) => sum + (r.score || 0), 0) / examsTaken)
          : 0;
        const successRate = examsTaken > 0
          ? Math.round((resultsData.filter(r => (r.score || 0) >= (r.passingScore || 50)).length / examsTaken) * 100)
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

        examsData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()); // Sort by date (earliest first)
        setStats({ averageScore, examsTaken, successRate });
        setUpcomingExams(examsData.slice(0, 3)); // Show top 3 upcoming exams
        console.log('StudentDashboard: Fetched stats:', { averageScore, examsTaken, successRate });
        console.log('StudentDashboard: Fetched upcoming exams:', examsData.length, 'showing top 3');
      } catch (error: any) {
        console.error('StudentDashboard: Error fetching data:', error.message, 'Code:', error.code);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchData();
    }
  }, [user]);

  if (loading) {
    return <div className={`p-6 text-center font-poppins ${isDark ? 'bg-darkbg text-dark-text' : 'bg-light-bg text-light-text'}`}>Loading dashboard...</div>;
  }

  return (
    <div className={`space-y-6 font-poppins ${isDark ? 'bg-darkbg text-dark-text' : 'bg-light-bg text-light-text'}`}>
      <div>
        <h1 className="text-2xl font-bold font-glacial text-primary">
          Welcome, {user?.name || user?.firebaseUser.email || 'Student'}
        </h1>
        <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Track your progress and upcoming exams
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          className={`p-6 rounded-xl border backdrop-blur-sm glass-effect ${
            isDark ? 'bg-darkbg/80 border-dark-neutral' : 'bg-light-bg/80 border-light-neutral'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Average Score</p>
              <p className="text-2xl font-bold text-primary">{stats.averageScore}%</p>
            </div>
            <div
              className={`h-10 w-10 rounded-full flex items-center justify-center ${
                isDark ? 'bg-primary/70' : 'bg-primary/60'
              }`}
            >
              <BarChart2 className="h-6 w-6 text-darkbg" />
            </div>
          </div>
        </div>
        <div
          className={`p-6 rounded-xl border backdrop-blur-sm glass-effect ${
            isDark ? 'bg-darkbg/80 border-dark-neutral' : 'bg-light-bg/80 border-light-neutral'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Exams Taken</p>
              <p className="text-2xl font-bold text-primary">{stats.examsTaken}</p>
            </div>
            <div
              className={`h-10 w-10 rounded-full flex items-center justify-center ${
                isDark ? 'bg-primary/70' : 'bg-primary/60'
              }`}
            >
              <CheckCircle className="h-6 w-6 text-darkbg" />
            </div>
          </div>
        </div>
        <div
          className={`p-6 rounded-xl border backdrop-blur-sm glass-effect ${
            isDark ? 'bg-darkbg/80 border-dark-neutral' : 'bg-light-bg/80 border-light-neutral'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Success Rate</p>
              <p className="text-2xl font-bold text-primary">{stats.successRate}%</p>
            </div>
            <div
              className={`h-10 w-10 rounded-full flex items-center justify-center ${
                isDark ? 'bg-primary/70' : 'bg-primary/60'
              }`}
            >
              <Clock className="h-6 w-6 text-darkbg" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold font-glacial text-primary">Upcoming Exams</h2>
          <a
            href="/student/exams"
            className={`text-sm font-medium transition-colors ${
              isDark ? 'text-primary hover:text-secondary' : 'text-primary hover:text-secondary'
            }`}
          >
            View All
          </a>
        </div>
        {upcomingExams.length === 0 ? (
          <div className="text-center py-12">
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              No upcoming exams found. Check back later.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingExams.map(exam => (
              <ExamCard key={exam.id} exam={exam} role="student" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;