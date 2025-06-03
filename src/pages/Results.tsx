import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Search, Download, Filter, Eye, ChevronRight } from 'lucide-react';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface Result {
  id: string;
  examTitle: string;
  student?: string;
  email?: string;
  date: string;
  score: number;
  status: string;
  questionsCorrect: number;
  totalQuestions: number;
  timeTaken: string;
  certificate?: boolean;
}

const Results: React.FC = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const role = user?.role || 'student';
  const isAdmin = role === 'admin';
  const [results, setResults] = useState<Result[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterExam, setFilterExam] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        const resultsSnapshot = await getDocs(collection(db, 'results'));
        const resultsData: Result[] = [];
        for (const resultDoc of resultsSnapshot.docs) {
          const resultData = resultDoc.data();
          const examDoc = await getDoc(doc(db, 'exams', resultData.examId));
          const userDoc = isAdmin ? await getDoc(doc(db, 'users', resultData.userId)) : null;
          if (examDoc.exists()) {
            const examData = examDoc.data();
            resultsData.push({
              id: resultDoc.id,
              examTitle: examData.title,
              student: isAdmin && userDoc?.exists() ? userDoc.data().name : undefined,
              email: isAdmin && userDoc?.exists() ? userDoc.data().email : undefined,
              date: resultData.date,
              score: resultData.score,
              status: resultData.score >= 50 ? 'Passed' : 'Failed', // Adjust threshold as needed
              questionsCorrect: resultData.questionsCorrect || 0,
              totalQuestions: examData.totalQuestions,
              timeTaken: resultData.timeTaken || 'N/A',
              certificate: !isAdmin && resultData.score >= 50,
            });
          }
        }
        setResults(resultsData);
        console.log('Results: Fetched results:', resultsData);
      } catch (error) {
        console.error('Results: Error fetching results:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchResults();
  }, [isAdmin]);

  const exams = ['all', ...new Set(results.map(r => r.examTitle))];
  
  const filteredResults = results.filter(result => {
    const matchesSearch = isAdmin 
      ? (result.student?.toLowerCase().includes(searchTerm.toLowerCase()) ||
         result.email?.toLowerCase().includes(searchTerm.toLowerCase()))
      : result.examTitle.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = filterStatus === 'all' || result.status === filterStatus;
    const matchesExam = filterExam === 'all' || result.examTitle === filterExam;
    
    return matchesSearch && matchesStatus && matchesExam;
  });

  if (loading) {
    return <div className={`p-6 text-center ${isDark ? 'bg-darkbg text-white' : 'bg-light-bg text-light-text'}`}>Loading results...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-light-text'}`}>Results</h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {isAdmin 
              ? 'View student performance and exam results' 
              : 'View your exam results and download certificates'}
          </p>
        </div>
        
        {isAdmin && (
          <button className={`mt-4 md:mt-0 px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-all btn-glow ${
            isDark ? 'bg-gradient-to-r from-primary to-secondary hover:from-[#4be3b0] hover:to-[#008f5f] text-white' : 'bg-gradient-to-r from-light-text to-gray-700 hover:from-gray-600 hover:to-gray-800 text-light-bg'
          }`}>
            <Download className="h-4 w-4 mr-2" />
            Export Results
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
            placeholder={isAdmin ? "Search by student name or email..." : "Search by exam title..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
              isDark ? 'bg-darkbg border-gray-700 text-white placeholder-gray-500' : 'bg-light-bg border-gray-300 text-light-text placeholder-gray-400'
            }`}
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none ${
                isDark ? 'bg-darkbg border-gray-700 text-white' : 'bg-light-bg border-gray-300 text-light-text'
              }`}
            >
              <option value="all">All Statuses</option>
              <option value="Passed">Passed</option>
              <option value="Failed">Failed</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} fill="none" viewBox="0 0 20 20" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
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
                {isAdmin && (
                  <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Student
                  </th>
                )}
                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Date
                </th>
                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Score
                </th>
                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Status
                </th>
                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Questions
                </th>
                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Time Taken
                </th>
                <th scope="col" className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={isDark ? 'divide-gray-700' : 'divide-gray-300'}>
              {filteredResults.map((result) => (
                <tr key={result.id} className={`hover:bg-gray-700/30 transition-colors ${isDark ? '' : 'hover:bg-gray-200/30'}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-light-text'}`}>{result.examTitle}</div>
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-light-text'}`}>{result.student}</div>
                      <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{result.email}</div>
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{result.date}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-light-text'}`}>{result.score}%</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      result.status === 'Passed' 
                        ? isDark ? 'bg-secondary/30 text-secondary' : 'bg-light-text/30 text-light-text'
                        : isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-300/30 text-red-600'
                    }`}>
                      {result.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${isDark ? 'text-white' : 'text-light-text'}`}>
                      {result.questionsCorrect} / {result.totalQuestions}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{result.timeTaken}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end space-x-3">
                      <button className={isDark ? 'text-primary hover:text-[#4be3b0]' : 'text-light-text hover:text-gray-800'}>
                        <Eye className="h-5 w-5" />
                      </button>
                      {!isAdmin && result.certificate && (
                        <button className={isDark ? 'text-secondary hover:text-[#008f5f]' : 'text-light-text hover:text-gray-800'}>
                          <Download className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {filteredResults.length === 0 && (
        <div className="text-center py-12">
          <div className={`rounded-xl border p-8 mx-auto max-w-md backdrop-blur-sm glass-effect ${
            isDark ? 'bg-darkbg border-gray-700' : 'bg-light-bg border-gray-300'
          }`}>
            <div className={`mx-auto h-16 w-16 rounded-full flex items-center justify-center mb-4 ${
              isDark ? 'bg-gray-600' : 'bg-gray-200'
            }`}>
              <Search className={`h-8 w-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
            </div>
            <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-light-text'}`}>No results found</h3>
            <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              No results match your current filters. Try adjusting your search criteria.
            </p>
          </div>
        </div>
      )}
      
      {!isAdmin && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-light-text'}`}>Performance Summary</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className={`rounded-xl border p-6 backdrop-blur-sm glass-effect ${
              isDark ? 'bg-gradient-to-r from-primary/30 to-secondary/30 border-primary/50' : 'bg-gradient-to-r from-light-text/30 to-gray-600/30 border-gray-300'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-medium ${isDark ? 'text-primary' : 'text-light-text'}`}>Average Score</h3>
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  isDark ? 'bg-primary/70' : 'bg-light-text/70'
                }`}>
                  <svg className={`h-6 w-6 ${isDark ? 'text-darkbg' : 'text-light-bg'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
              </div>
              <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-light-text'}`}>
                {results.length > 0 ? Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length) : 0}%
              </p>
              <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Overall average across all exams</p>
            </div>
            
            <div className={`rounded-xl border p-6 backdrop-blur-sm glass-effect ${
              isDark ? 'bg-gradient-to-r from-primary/30 to-secondary/30 border-primary/50' : 'bg-gradient-to-r from-light-text/30 to-gray-600/30 border-gray-300'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-medium ${isDark ? 'text-primary' : 'text-light-text'}`}>Exams Taken</h3>
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  isDark ? 'bg-primary/70' : 'bg-light-text/70'
                }`}>
                  <svg className={`h-6 w-6 ${isDark ? 'text-darkbg' : 'text-light-bg'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 0 4" />
                  </svg>
                </div>
              </div>
              <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-light-text'}`}>{results.length}</p>
              <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total exams completed</p>
            </div>
            
            <div className={`rounded-xl border p-6 backdrop-blur-sm glass-effect ${
              isDark ? 'bg-gradient-to-r from-primary/30 to-secondary/30 border-primary/50' : 'bg-gradient-to-r from-light-text/30 to-gray-600/30 border-gray-300'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-medium ${isDark ? 'text-primary' : 'text-light-text'}`}>Success Rate</h3>
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  isDark ? 'bg-secondary/70' : 'bg-light-text/70'
                }`}>
                  <svg className={`h-6 w-6 ${isDark ? 'text-darkbg' : 'text-light-bg'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-light-text'}`}>
                {results.length > 0 
                  ? Math.round((results.filter(r => r.status === 'Passed').length / results.length) * 100) 
                  : 0}%
              </p>
              <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Percentage of passed exams</p>
            </div>
          </div>
          
          <div className="mt-6">
            <div className={`rounded-xl border p-6 backdrop-blur-sm glass-effect ${
              isDark ? 'bg-darkbg border-gray-700' : 'bg-light-bg border-gray-300'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-light-text'}`}>Certificates</h3>
                <a href="#" className={`text-sm font-medium flex items-center ${isDark ? 'text-primary hover:text-[#4be3b0]' : 'text-light-text hover:text-gray-800'}`}>
                  View All <ChevronRight className="h-4 w-4 ml-1" />
                </a>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {results
                  .filter(r => r.certificate)
                  .slice(0, 3)
                  .map(result => (
                    <div key={result.id} className={`rounded-lg border p-4 transition-colors glass-effect-hover ${
                      isDark ? 'bg-darkbg/50 border-gray-700 hover:border-primary/50' : 'bg-light-bg/50 border-gray-300 hover:border-light-text/50'
                    }`}>
                      <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-light-text'}`}>{result.examTitle}</h4>
                      <p className={`text-sm mb-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Issued on {result.date}</p>
                      <button className={`w-full px-3 py-1.5 text-sm rounded flex items-center justify-center ${
                        isDark ? 'bg-gradient-to-r from-primary to-secondary hover:from-[#4be3b0] hover:to-[#008f5f] text-white' : 'bg-gradient-to-r from-light-text to-gray-700 hover:from-gray-600 hover:to-gray-800 text-light-bg'
                      }`}>
                        <Download className="h-4 w-4 mr-1" />
                        Download
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Results;