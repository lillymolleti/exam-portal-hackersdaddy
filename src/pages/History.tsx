import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Search, Calendar, Download } from 'lucide-react';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface AdminHistory {
  id: string;
  examTitle: string;
  date: string;
  totalStudents: number;
  passRate: number;
  avgScore: number;
}

interface StudentHistory {
  id: string;
  examTitle: string;
  date: string;
  score: number;
  status: string;
  totalQuestions: number;
  correctAnswers: number;
}

const History: React.FC = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const role = user?.role || 'student';
  const isAdmin = role === 'admin';
  const [historyData, setHistoryData] = useState<(AdminHistory | StudentHistory)[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMonth, setFilterMonth] = useState('all');
  const [loading, setLoading] = useState(true);

  const months = [
    { value: 'all', label: 'All Months' },
    { value: '08', label: 'August 2025' },
    { value: '07', label: 'July 2025' },
    { value: '06', label: 'June 2025' },
  ];

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        if (isAdmin) {
          const examsSnapshot = await getDocs(collection(db, 'exams'));
          const history: AdminHistory[] = [];
          for (const examDoc of examsSnapshot.docs) {
            const examData = examDoc.data();
            const resultsSnapshot = await getDocs(collection(db, 'results'));
            const examResults = resultsSnapshot.docs
              .filter(doc => doc.data().examId === examDoc.id)
              .map(doc => doc.data());
            const totalStudents = examResults.length;
            const passRate = totalStudents > 0 
              ? Math.round((examResults.filter(r => r.score >= 50).length / totalStudents) * 100)
              : 0;
            const avgScore = totalStudents > 0 
              ? Math.round(examResults.reduce((sum, r) => sum + r.score, 0) / totalStudents)
              : 0;
            history.push({
              id: examDoc.id,
              examTitle: examData.title,
              date: examData.date || examData.startTime.split('T')[0],
              totalStudents,
              passRate,
              avgScore,
            });
          }
          setHistoryData(history);
          console.log('History: Fetched admin history:', history);
        } else {
          const resultsSnapshot = await getDocs(query(collection(db, 'results'), where('userId', '==', user?.firebaseUser.uid)));
          const history: StudentHistory[] = [];
          for (const resultDoc of resultsSnapshot.docs) {
            const resultData = resultDoc.data();
            const examDoc = await getDoc(doc(db, 'exams', resultData.examId));
            if (examDoc.exists()) {
              const examData = examDoc.data();
              history.push({
                id: resultDoc.id,
                examTitle: examData.title,
                date: resultData.date,
                score: resultData.score,
                status: resultData.score >= 50 ? 'Passed' : 'Failed',
                totalQuestions: examData.totalQuestions,
                correctAnswers: resultData.questionsCorrect || 0,
              });
            }
          }
          setHistoryData(history);
          console.log('History: Fetched student history:', history);
        }
      } catch (error) {
        console.error('History: Error fetching history:', error);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchHistory();
    }
  }, [user, isAdmin]);

  const filteredHistory = historyData.filter(item => {
    const matchesSearch = item.examTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMonth = filterMonth === 'all' || item.date.substring(5, 7) === filterMonth;
    
    return matchesSearch && matchesMonth;
  });

  if (loading) {
    return <div className={`p-6 text-center ${isDark ? 'bg-darkbg text-white' : 'bg-light-bg text-light-text'}`}>Loading history...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-light-text'}`}>Exam History</h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {isAdmin 
              ? 'View history of past exams and performance statistics' 
              : 'View your past exam attempts and results'}
          </p>
        </div>
        
        {isAdmin && (
          <button className={`mt-4 md:mt-0 px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-all btn-glow ${
            isDark ? 'bg-gradient-to-r from-primary to-secondary hover:from-[#4be3b0] hover:to-[#008f5f] text-white' : 'bg-gradient-to-r from-light-text to-gray-700 hover:from-gray-600 hover:to-gray-800 text-light-bg'
          }`}>
            <Download className="h-4 w-4 mr-2" />
            Export History
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
          </div>
          <input
            type="text"
            placeholder="Search by exam title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
              isDark ? 'bg-darkbg border-gray-700 text-white placeholder-gray-500' : 'bg-light-bg border-gray-300 text-light-text placeholder-gray-400'
            }`}
          />
        </div>
        
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Calendar className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
          </div>
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none ${
              isDark ? 'bg-darkbg border-gray-700 text-white' : 'bg-light-bg border-gray-300 text-light-text'
            }`}
          >
            {months.map(month => (
              <option key={month.value} value={month.value}>{month.label}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} fill="none" viewBox="0 0 20 20" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      <div className={`rounded-xl border overflow-hidden backdrop-blur-sm glass-effect ${
        isDark ? 'bg-darkbg border-gray-700' : 'bg-light-bg border-gray-300'
      }`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className={isDark ? 'bg-darkbg' : 'bg-light-bg'}>
              <tr>
                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Exam
                </th>
                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Date
                </th>
                {isAdmin ? (
                  <>
                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Students
                    </th>
                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Pass Rate
                    </th>
                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Avg. Score
                    </th>
                  </>
                ) : (
                  <>
                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Score
                    </th>
                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Status
                    </th>
                    <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Performance
                    </th>
                  </>
                )}
                <th scope="col" className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={isDark ? 'divide-gray-700' : 'divide-gray-300'}>
              {filteredHistory.map((item) => (
                <tr key={item.id} className={`hover:bg-gray-700/30 transition-colors ${isDark ? '' : 'hover:bg-gray-200/30'}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-light-text'}`}>{item.examTitle}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{item.date}</div>
                  </td>
                  {isAdmin ? (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-light-text'}`}>{(item as AdminHistory).totalStudents}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-light-text'}`}>{(item as AdminHistory).passRate}%</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-light-text'}`}>{(item as AdminHistory).avgScore}%</div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-light-text'}`}>{(item as StudentHistory).score}%</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          (item as StudentHistory).status === 'Passed'
                            ? isDark ? 'bg-secondary/30 text-secondary' : 'bg-light-text/30 text-light-text'
                            : isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-300/30 text-red-600'
                        }`}>
                          {(item as StudentHistory).status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {(item as StudentHistory).correctAnswers} / {(item as StudentHistory).totalQuestions}
                        </div>
                      </td>
                    </>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button className={isDark ? 'text-primary hover:text-[#4be3b0]' : 'text-light-text hover:text-gray-800'}>
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredHistory.length === 0 && (
        <div className="text-center py-12">
          <div className={`rounded-xl border p-8 mx-auto max-w-md backdrop-blur-sm glass-effect ${
            isDark ? 'bg-darkbg border-gray-700' : 'bg-light-bg border-gray-300'
          }`}>
            <div className={`mx-auto h-16 w-16 rounded-full flex items-center justify-center mb-4 ${
              isDark ? 'bg-gray-700' : 'bg-gray-200'
            }`}>
              <Search className={`h-8 w-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
            </div>
            <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-light-text'}`}>No history found</h3>
            <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              No exams match your current filters. Try adjusting your search criteria.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;