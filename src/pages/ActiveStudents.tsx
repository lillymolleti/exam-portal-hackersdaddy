import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Search, Filter, X, Clock } from 'lucide-react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface ActiveStudent {
  id: string;
  name: string;
  email: string;
  examTitle: string;
  progress: number;
  timeRemaining: string;
  startTime: string;
  questionsAnswered: number;
  totalQuestions: number;
}

const ActiveStudents: React.FC = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterExam, setFilterExam] = useState('all');
  const [activeStudents, setActiveStudents] = useState<ActiveStudent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActiveStudents = async () => {
      setLoading(true);
      try {
        const sessionsSnapshot = await getDocs(collection(db, 'activeSessions'));
        const students: ActiveStudent[] = [];
        for (const sessionDoc of sessionsSnapshot.docs) {
          const sessionData = sessionDoc.data();
          const userDoc = await getDoc(doc(db, 'users', sessionData.userId));
          const examDoc = await getDoc(doc(db, 'exams', sessionData.examId));
          if (userDoc.exists() && examDoc.exists()) {
            const userData = userDoc.data();
            const examData = examDoc.data();
            const start = new Date(sessionData.startTime);
            const duration = examData.duration * 60 * 1000; // Convert to ms
            const elapsed = Date.now() - start.getTime();
            const timeRemainingMs = duration - elapsed;
            const timeRemaining = timeRemainingMs > 0 
              ? `${Math.floor(timeRemainingMs / 60000)}:${Math.floor((timeRemainingMs % 60000) / 1000).toString().padStart(2, '0')}`
              : '00:00';
            students.push({
              id: sessionDoc.id,
              name: userData.name,
              email: userData.email,
              examTitle: examData.title,
              progress: sessionData.progress || 0,
              timeRemaining,
              startTime: start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              questionsAnswered: sessionData.questionsAnswered || 0,
              totalQuestions: examData.totalQuestions,
            });
          }
        }
        setActiveStudents(students);
        console.log('ActiveStudents: Fetched active students:', students);
      } catch (error) {
        console.error('ActiveStudents: Error fetching active students:', error);
      } finally {
        setLoading(false);
      }
    };
    if (user?.role === 'admin') {
      fetchActiveStudents();
    }
  }, [user]);

  const exams = ['all', ...new Set(activeStudents.map(s => s.examTitle))];
  
  const filteredStudents = activeStudents.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesExam = filterExam === 'all' || student.examTitle === filterExam;
    
    return matchesSearch && matchesExam;
  });

  if (loading) {
    return <div className={`p-6 text-center ${isDark ? 'bg-darkbg text-white' : 'bg-light-bg text-light-text'}`}>Loading active students...</div>;
  }

  return (
    <div className="space-y-6 font-poppins">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className={`text-2xl font-bold font-poppins ${isDark ? 'text-white' : 'text-light-text'}`}>Active Students</h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Monitor students currently taking exams
          </p>
        </div>
        
        <div className={`mt-4 md:mt-0 px-4 py-2 rounded-lg text-sm font-medium flex items-center ${
          isDark ? 'bg-secondary/20 text-secondary border-secondary/30' : 'bg-light-text/20 text-light-text border-light-text/30'
        }`}>
          <div className="h-2 w-2 rounded-full bg-secondary mr-2 animate-pulse"></div>
          {filteredStudents.length} Students Active
        </div>
      </div>

      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
          </div>
          <input
            type="text"
            placeholder="Search by student name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
              isDark ? 'bg-darkbg border-gray-700 text-white placeholder-gray-500' : 'bg-light-bg border-gray-300 text-light-text placeholder-gray-400'
            }`}
          />
        </div>
        
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
          </div>
          <select
            value={filterExam}
            onChange={(e) => setFilterExam(e.target.value)}
            className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none ${
              isDark ? 'bg-darkbg border-gray-700 text-white' : 'bg-light-bg border-gray-300 text-light-text'
            }`}
          >
            <option value="all">All Exams</option>
            {exams.filter(e => e !== 'all').map(exam => (
              <option key={exam} value={exam}>{exam}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} fill="none" viewBox="0 0 20 20" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student) => (
          <div key={student.id} className={`rounded-xl border overflow-hidden backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/20 glass-effect glass-effect-hover ${
            isDark ? 'bg-darkbg/80 border-gray-700 hover:border-primary/50' : 'bg-light-bg/80 border-gray-300 hover:border-light-text/50'
          }`}>
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-light-text'}`}>{student.name}</h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{student.email}</p>
                </div>
                <div className="flex items-center">
                  <Clock className={`h-4 w-4 ${isDark ? 'text-amber-400' : 'text-amber-600'} mr-1`} />
                  <span className={`text-sm font-medium ${
                    parseInt(student.timeRemaining.split(':')[0]) < 10 
                      ? isDark ? 'text-red-400' : 'text-red-600'
                      : isDark ? 'text-amber-400' : 'text-amber-600'
                  }`}>
                    {student.timeRemaining}
                  </span>
                </div>
              </div>
              
              <div className="mt-4">
                <div className={`flex justify-between text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <span>Exam:</span>
                  <span className={isDark ? 'text-white' : 'text-light-text'}>{student.examTitle}</span>
                </div>
                <div className={`flex justify-between text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <span>Started:</span>
                  <span className={isDark ? 'text-white' : 'text-light-text'}>{student.startTime}</span>
                </div>
                <div className={`flex justify-between text-sm mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <span>Progress:</span>
                  <span className={isDark ? 'text-white' : 'text-light-text'}>{student.questionsAnswered || 0} / {student.totalQuestions} questions</span>
                </div>
              </div>
              
              <div className="mt-4">
                <div className={`w-full rounded-full h-2.5 ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div 
                    className={`h-2.5 rounded-full ${
                      student.progress >= 80 
                        ? isDark ? 'bg-secondary' : 'bg-light-text'
                        : student.progress >= 40 
                        ? isDark ? 'bg-primary' : 'bg-light-text'
                        : isDark ? 'bg-amber-400' : 'bg-amber-600'
                    }`}
                    style={{ width: `${student.progress}%` }}
                  ></div>
                </div>
                <p className={`text-right text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  ${student.progress}% completed
                </p>
              </div>
              
              <div className="mt-4 flex justify-between">
                <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-light-text'
                }`}>
                  View Details
                </button>
                <button className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-all ${
                  isDark ? 'bg-red-900/30 hover:bg-red-900/40 text-red-400' : 'bg-red-300/20 hover:bg-red-300/30 text-red-600'
                }`}>
                  <X className="h-4 w-4 mr-1" />
                  Force End
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredStudents.length === 0 && (
        <div className="text-center py-12">
          <div className={`rounded-xl border p-8 mx-auto max-w-md backdrop-blur-sm glass-effect ${
            isDark ? 'bg-darkbg/80 border-gray-700' : 'bg-light-bg/80 border-gray-300'
          }`}>
            <div className={`mx-auto h-16 w-16 rounded-full flex items-center justify-center mb-4 ${
              isDark ? 'bg-gray-600' : 'bg-gray-200'
            }`}>
              <Search className={`h-8 w-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
            </div>
            <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-light-text'}`}>No active students found</h3>
            <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              No students are currently taking exams that match your search criteria.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveStudents;