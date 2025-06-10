import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase';
import { BarChart2, Users, FileText, CheckCircle } from 'lucide-react';
import ExamCard from '../../components/exams/ExamCard';

interface Exam {
  id: string;
  title: string;
  date: string; // ISO string
  duration: number;
  totalQuestions: number;
  description?: string;
  passingScore: number;
}

interface Result {
  id: string;
  userId: string;
  examId: string;
  score: number;
  completedAt: string; // ISO string
}

interface ActiveSession {
  id: string;
  userId: string;
  examId: string;
  startTime: string; // ISO string
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [stats, setStats] = useState({
    totalExams: 0,
    activeStudents: 0,
    completedExams: 0,
    averageScore: 0,
  });
  const [recentExams, setRecentExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchedCount, setFetchedCount] = useState(0); // Track initial fetches

  useEffect(() => {
    if (user?.role !== 'admin') {
      console.log('AdminDashboard: User is not admin, aborting fetch. User:', user);
      return;
    }

    setLoading(true);
    console.log('AdminDashboard: Setting up listeners for user:', { uid: user?.name, role: user?.role });

    const totalListeners = 3; // Number of listeners (exams, results, activeSessions)

    const incrementFetchedCount = () => {
      setFetchedCount((prev) => {
        const newCount = prev + 1;
        console.log('AdminDashboard: Incrementing fetchedCount:', newCount, 'of', totalListeners);
        if (newCount === totalListeners) {
          setLoading(false);
          console.log('AdminDashboard: All data fetched, setting loading to false');
        }
        return newCount;
      });
    };

    const unsubscribeExams = onSnapshot(
      collection(db, 'exams'),
      (snapshot) => {
        const examsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Exam[];
        examsData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setRecentExams(examsData.slice(0, 3));
        setStats((prev) => ({ ...prev, totalExams: examsData.length }));
        console.log('AdminDashboard: Fetched exams:', examsData);
        incrementFetchedCount();
      },
      (error) => {
        console.error('AdminDashboard: Error fetching exams:', error.message, 'Code:', error.code);
        incrementFetchedCount();
      }
    );

    const unsubscribeResults = onSnapshot(
      collection(db, 'results'),
      (snapshot) => {
        const resultsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Result[];
        const completedExams = resultsData.length;
        const averageScore =
          resultsData.length > 0
            ? Math.round(
                resultsData.reduce((sum, result) => sum + (result.score || 0), 0) / resultsData.length
              )
            : 0;
        setStats((prev) => ({ ...prev, completedExams, averageScore }));
        console.log('AdminDashboard: Fetched results:', { completedExams, averageScore, resultsData });
        incrementFetchedCount();
      },
      (error) => {
        console.error('AdminDashboard: Error fetching results:', error.message, 'Code:', error.code);
        incrementFetchedCount();
      }
    );

    const unsubscribeSessions = onSnapshot(
      collection(db, 'activeSessions'),
      (snapshot) => {
        const sessionsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ActiveSession[];
        const activeStudents = sessionsData.length;
        setStats((prev) => ({ ...prev, activeStudents }));
        console.log('AdminDashboard: Fetched active sessions:', { activeStudents, sessionsData });
        incrementFetchedCount();
      },
      (error) => {
        console.error('AdminDashboard: Error fetching active sessions:', error.message, 'Code:', error.code);
        incrementFetchedCount();
      }
    );

    return () => {
      console.log('AdminDashboard: Cleaning up listeners');
      unsubscribeExams();
      unsubscribeResults();
      unsubscribeSessions();
    };
  }, [user]);

  if (loading) {
    return (
      <div className={`p-6 text-center font-poppins ${isDark ? 'bg-darkbg text-dark-text' : 'bg-light-bg text-light-text'}`}>
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className={`space-y-6 font-poppins ${isDark ? 'bg-darkbg text-dark-text' : 'bg-light-bg text-light-text'}`}>
      <div>
        <h1 className={`text-2xl font-bold font-glacial text-primary`}>
          Welcome, {user?.name || user?.email || 'Admin'}
        </h1>
        <p className={`text-sm mt-1 ${isDark ? 'text-white/100' : 'text-white'}`}>
          Manage your exams and monitor student performance
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div
          className={`p-6 rounded-xl border backdrop-blur-sm glass-effect ${
            isDark ? 'bg-darkbg/80 border-dark-neutral' : 'bg-light-bg/80 border-light-neutral'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-white/100' : 'text-white/70'}`}>Total Exams</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                {stats.totalExams}
              </p>
            </div>
            <FileText className={`h-8 w-8 text-primary`} />
          </div>
        </div>
        <div
          className={`p-6 rounded-xl border backdrop-blur-sm glass-effect ${
            isDark ? 'bg-darkbg/80 border-dark-neutral' : 'bg-light-bg/80 border-light-neutral'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ?  'text-white/100' : 'text-white/70'}`}>Active Students</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                {stats.activeStudents}
              </p>
            </div>
            <Users className={`h-8 w-8 text-primary`} />
          </div>
        </div>
        <div
          className={`p-6 rounded-xl border backdrop-blur-sm glass-effect ${
            isDark ? 'bg-darkbg/80 border-dark-neutral' : 'bg-light-bg/80 border-light-neutral'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ?  'text-white/100' : 'text-white/70'}`}>Completed Exams</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                {stats.completedExams}
              </p>
            </div>
            <CheckCircle className={`h-8 w-8 text-primary`} />
          </div>
        </div>
        <div
          className={`p-6 rounded-xl border backdrop-blur-sm glass-effect ${
            isDark ? 'bg-darkbg/80 border-dark-neutral' : 'bg-light-bg/80 border-light-neutral'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ?  'text-white/100' : 'text-white/70'}`}>Average Score</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
                {stats.averageScore}%
              </p>
            </div>
            <BarChart2 className={`h-8 w-8 text-primary`} />
          </div>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-lg font-semibold font-glacial text-primary`}>Recent Exams</h2>
          <a
            href="/admin/exams"
            className={`text-sm font-medium ${isDark ? 'text-primary hover:text-secondary' : 'text-primary hover:text-secondary'}`}
          >
            View All
          </a>
        </div>
        {recentExams.length === 0 ? (
          <div className="text-center py-12">
            <p className={`text-secondary/30 ${isDark ? 'text-secondary/30' : 'text-secondary/20'}`}>
              No recent exams found. Create a new exam to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentExams.map((exam) => (
              <ExamCard key={exam.id} exam={exam} role="admin" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;