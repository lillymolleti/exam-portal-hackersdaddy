import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Filter, Calendar, Download } from 'lucide-react';

// Mock data for exam history
const adminHistory = [
  { 
    id: '1',
    examTitle: 'Web Development Fundamentals',
    date: '2025-08-05',
    totalStudents: 45,
    passRate: 78,
    avgScore: 72,
  },
  { 
    id: '2',
    examTitle: 'Data Structures and Algorithms',
    date: '2025-08-02',
    totalStudents: 38,
    passRate: 65,
    avgScore: 68,
  },
  { 
    id: '3',
    examTitle: 'JavaScript Programming',
    date: '2025-07-28',
    totalStudents: 50,
    passRate: 82,
    avgScore: 75,
  },
  { 
    id: '4',
    examTitle: 'Database Systems',
    date: '2025-07-20',
    totalStudents: 42,
    passRate: 71,
    avgScore: 70,
  },
  { 
    id: '5',
    examTitle: 'Computer Networks',
    date: '2025-07-15',
    totalStudents: 35,
    passRate: 60,
    avgScore: 65,
  }
];

const studentHistory = [
  { 
    id: '1',
    examTitle: 'Web Development Fundamentals',
    date: '2025-08-05',
    score: 85,
    status: 'Passed',
    totalQuestions: 10,
    correctAnswers: 8,
  },
  { 
    id: '2',
    examTitle: 'Data Structures and Algorithms',
    date: '2025-08-02',
    score: 90,
    status: 'Passed',
    totalQuestions: 10,
    correctAnswers: 9,
  },
  { 
    id: '3',
    examTitle: 'JavaScript Programming',
    date: '2025-07-28',
    score: 75,
    status: 'Passed',
    totalQuestions: 20,
    correctAnswers: 15,
  },
  { 
    id: '4',
    examTitle: 'Computer Networks',
    date: '2025-07-15',
    score: 40,
    status: 'Failed',
    totalQuestions: 10,
    correctAnswers: 4,
  }
];

const History: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role || 'student';
  const isAdmin = role === 'admin';
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMonth, setFilterMonth] = useState('all');
  
  // Mock months for filter
  const months = [
    { value: 'all', label: 'All Months' },
    { value: '08', label: 'August 2025' },
    { value: '07', label: 'July 2025' },
    { value: '06', label: 'June 2025' },
  ];
  
  // Get history data based on role
  const historyData = isAdmin ? adminHistory : studentHistory;
  
  const filteredHistory = historyData.filter(item => {
    const matchesSearch = item.examTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesMonth = filterMonth === 'all' || item.date.substring(5, 7) === filterMonth;
    
    return matchesSearch && matchesMonth;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Exam History</h1>
          <p className="text-gray-400 mt-1">
            {isAdmin 
              ? 'View history of past exams and performance statistics' 
              : 'View your past exam attempts and results'}
          </p>
        </div>
        
        {isAdmin && (
          <button className="mt-4 md:mt-0 px-4 py-2 bg-gradient-to-r from-[#5cffc9] to-[#00ac76] hover:from-[#4be3b0] hover:to-[#008f5f] text-white rounded-lg text-sm font-medium flex items-center transition-all">
            <Download className="h-4 w-4 mr-2" />
            Export History
          </button>
        )}
      </div>

      {/* Search and filters */}
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search by exam title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-lg bg-[#121212] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#5cffc9] focus:border-transparent"
          />
        </div>
        
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-lg bg-[#121212] text-white focus:outline-none focus:ring-2 focus:ring-[#5cffc9] focus:border-transparent appearance-none"
          >
            {months.map(month => (
              <option key={month.value} value={month.value}>{month.label}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 20 20" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* History table */}
      <div className="bg-[#121212] rounded-xl border border-gray-700 overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-[#121212]">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Exam
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                {isAdmin ? (
                  <>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Students
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Pass Rate
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Avg. Score
                    </th>
                  </>
                ) : (
                  <>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Score
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      Performance
                    </th>
                  </>
                )}
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredHistory.map((item) => (
                <tr key={item.id} className="hover:bg-gray-700/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">{item.examTitle}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-400">{item.date}</div>
                  </td>
                  
                  {isAdmin ? (
                    // Admin-specific columns
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">{item.totalStudents}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="mr-2 text-sm font-medium text-white">
                            {item.passRate}%
                          </div>
                          <div className="w-24 bg-gray-700 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                item.passRate >= 80 
                                  ? 'bg-[#00ac76]' 
                                  : item.passRate >= 60 
                                  ? 'bg-yellow-500' 
                                  : 'bg-red-500'
                              }`}
                              style={{ width: `${item.passRate}%` }}
                            ></div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">{item.avgScore}%</div>
                      </td>
                    </>
                  ) : (
                    // Student-specific columns
                    <>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-white">{item.score}%</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          item.status === 'Passed' 
                            ? 'bg-[#00ac76]/30 text-[#00ac76]' 
                            : 'bg-red-900/30 text-red-400'
                        }`}>
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">
                          {item.correctAnswers} / {item.totalQuestions} correct
                        </div>
                      </td>
                    </>
                  )}
                  
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-xs font-medium transition-colors">
                      {isAdmin ? 'View Details' : 'View Results'}
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
          <div className="bg-[#121212] rounded-xl border border-gray-700 p-8 mx-auto max-w-md backdrop-blur-sm">
            <div className="mx-auto h-16 w-16 rounded-full bg-gray-700 flex items-center justify-center mb-4">
              <Calendar className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-white">No history found</h3>
            <p className="text-gray-400 mt-2">
              No exam history matches your current filters. Try adjusting your search criteria.
            </p>
          </div>
        </div>
      )}
      
      {/* Additional statistics for admin */}
      {isAdmin && filteredHistory.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-r from-[#5cffc9]/30 to-[#00ac76]/30 rounded-xl border border-[#5cffc9]/50 p-6 backdrop-blur-sm">
            <h3 className="text-lg font-medium text-[#5cffc9] mb-4">Total Participants</h3>
            <p className="text-3xl font-bold text-white">
              {filteredHistory.reduce((total, item) => total + item.totalStudents, 0)}
            </p>
            <p className="text-sm text-gray-400 mt-2">Students who took these exams</p>
          </div>
          
          <div className="bg-gradient-to-r from-[#5cffc9]/30 to-[#00ac76]/30 rounded-xl border border-[#5cffc9]/50 p-6 backdrop-blur-sm">
            <h3 className="text-lg font-medium text-[#5cffc9] mb-4">Average Pass Rate</h3>
            <p className="text-3xl font-bold text-white">
              {Math.round(
                filteredHistory.reduce((total, item) => total + item.passRate, 0) / filteredHistory.length
              )}%
            </p>
            <p className="text-sm text-gray-400 mt-2">Across all listed exams</p>
          </div>
          
          <div className="bg-gradient-to-r from-[#5cffc9]/30 to-[#00ac76]/30 rounded-xl border border-[#5cffc9]/50 p-6 backdrop-blur-sm">
            <h3 className="text-lg font-medium text-[#5cffc9] mb-4">Average Score</h3>
            <p className="text-3xl font-bold text-white">
              {Math.round(
                filteredHistory.reduce((total, item) => total + item.avgScore, 0) / filteredHistory.length
              )}%
            </p>
            <p className="text-sm text-gray-400 mt-2">Average student performance</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;