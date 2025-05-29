import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Search, Download, Filter, Eye, ChevronRight } from 'lucide-react';

// Mock data for results
const adminResults = [
  { 
    id: '1',
    examTitle: 'Web Development Fundamentals',
    student: 'Alice Johnson',
    email: 'alice@example.com',
    date: '2025-08-05',
    score: 85,
    status: 'Passed',
    questionsCorrect: 8,
    totalQuestions: 10,
    timeTaken: '45 min'
  },
  { 
    id: '2',
    examTitle: 'Web Development Fundamentals',
    student: 'Bob Smith',
    email: 'bob@example.com',
    date: '2025-08-05',
    score: 60,
    status: 'Passed',
    questionsCorrect: 6,
    totalQuestions: 10,
    timeTaken: '58 min'
  },
  { 
    id: '3',
    examTitle: 'Web Development Fundamentals',
    student: 'Charlie Brown',
    email: 'charlie@example.com',
    date: '2025-08-05',
    score: 45,
    status: 'Failed',
    questionsCorrect: 4,
    totalQuestions: 10,
    timeTaken: '52 min'
  },
  { 
    id: '4',
    examTitle: 'Data Structures and Algorithms',
    student: 'Alice Johnson',
    email: 'alice@example.com',
    date: '2025-08-02',
    score: 90,
    status: 'Passed',
    questionsCorrect: 9,
    totalQuestions: 10,
    timeTaken: '50 min'
  },
  { 
    id: '5',
    examTitle: 'Data Structures and Algorithms',
    student: 'Bob Smith',
    email: 'bob@example.com',
    date: '2025-08-02',
    score: 70,
    status: 'Passed',
    questionsCorrect: 7,
    totalQuestions: 10,
    timeTaken: '55 min'
  }
];

const studentResults = [
  { 
    id: '1',
    examTitle: 'Web Development Fundamentals',
    date: '2025-08-05',
    score: 85,
    status: 'Passed',
    questionsCorrect: 8,
    totalQuestions: 10,
    timeTaken: '45 min',
    certificate: true
  },
  { 
    id: '2',
    examTitle: 'Data Structures and Algorithms',
    date: '2025-08-02',
    score: 90,
    status: 'Passed',
    questionsCorrect: 9,
    totalQuestions: 10,
    timeTaken: '50 min',
    certificate: true
  },
  { 
    id: '3',
    examTitle: 'JavaScript Programming',
    date: '2025-07-28',
    score: 75,
    status: 'Passed',
    questionsCorrect: 15,
    totalQuestions: 20,
    timeTaken: '75 min',
    certificate: true
  },
  { 
    id: '4',
    examTitle: 'Computer Networks',
    date: '2025-07-15',
    score: 40,
    status: 'Failed',
    questionsCorrect: 4,
    totalQuestions: 10,
    timeTaken: '58 min',
    certificate: false
  }
];

const Results: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role || 'student';
  const isAdmin = role === 'admin';
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterExam, setFilterExam] = useState('all');
  
  // Get results based on role
  const resultsData = isAdmin ? adminResults : studentResults;
  
  // Get unique exams for filter dropdown
  const exams = ['all', ...new Set(resultsData.map(r => r.examTitle))];
  
  const filteredResults = resultsData.filter(result => {
    const matchesSearch = isAdmin 
      ? (result.student.toLowerCase().includes(searchTerm.toLowerCase()) ||
         result.email.toLowerCase().includes(searchTerm.toLowerCase()))
      : result.examTitle.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = filterStatus === 'all' || result.status === filterStatus;
    const matchesExam = filterExam === 'all' || result.examTitle === filterExam;
    
    return matchesSearch && matchesStatus && matchesExam;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Results</h1>
          <p className="text-gray-400 mt-1">
            {isAdmin 
              ? 'View student performance and exam results' 
              : 'View your exam results and download certificates'}
          </p>
        </div>
        
        {isAdmin && (
          <button className="mt-4 md:mt-0 px-4 py-2 bg-gradient-to-r from-[#5cffc9] to-[#00ac76] hover:from-[#4be3b0] hover:to-[#008f5f] text-white rounded-lg text-sm font-medium flex items-center transition-all">
            <Download className="h-4 w-4 mr-2" />
            Export Results
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
            placeholder={isAdmin ? "Search by student name or email..." : "Search by exam title..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-lg bg-[#121212] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#5cffc9] focus:border-transparent"
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Status filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-lg bg-[#121212] text-white focus:outline-none focus:ring-2 focus:ring-[#5cffc9] focus:border-transparent appearance-none"
            >
              <option value="all">All Statuses</option>
              <option value="Passed">Passed</option>
              <option value="Failed">Failed</option>
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 20 20" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          
          {/* Exam filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <select
              value={filterExam}
              onChange={(e) => setFilterExam(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-lg bg-[#121212] text-white focus:outline-none focus:ring-2 focus:ring-[#5cffc9] focus:border-transparent appearance-none"
            >
              <option value="all">All Exams</option>
              {exams.filter(e => e !== 'all').map(exam => (
                <option key={exam} value={exam}>{exam}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 20 20" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Results table */}
      <div className="bg-[#121212] rounded-xl border border-gray-700 overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-[#121212]">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Exam
                </th>
                {isAdmin && (
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Student
                  </th>
                )}
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Score
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Questions
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Time Taken
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredResults.map((result) => (
                <tr key={result.id} className="hover:bg-gray-700/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">{result.examTitle}</div>
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{result.student}</div>
                      <div className="text-sm text-gray-400">{result.email}</div>
                    </td>
                  )}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-400">{result.date}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">{result.score}%</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      result.status === 'Passed' 
                        ? 'bg-[#00ac76]/30 text-[#00ac76]' 
                        : 'bg-red-900/30 text-red-400'
                    }`}>
                      {result.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">
                      {result.questionsCorrect} / {result.totalQuestions}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-400">{result.timeTaken}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end space-x-3">
                      <button className="text-[#5cffc9] hover:text-[#4be3b0]">
                        <Eye className="h-5 w-5" />
                      </button>
                      {!isAdmin && result.certificate && (
                        <button className="text-[#00ac76] hover:text-[#008f5f]">
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
          <div className="bg-[#121212] rounded-xl border border-gray-700 p-8 mx-auto max-w-md backdrop-blur-sm">
            <div className="mx-auto h-16 w-16 rounded-full bg-gray-700 flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-white">No results found</h3>
            <p className="text-gray-400 mt-2">
              No results match your current filters. Try adjusting your search criteria.
            </p>
          </div>
        </div>
      )}
      
      {!isAdmin && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Performance Summary</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-[#5cffc9]/30 to-[#00ac76]/30 rounded-xl border border-[#5cffc9]/50 p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-[#5cffc9]">Average Score</h3>
                <div className="h-10 w-10 rounded-full bg-[#5cffc9]/70 flex items-center justify-center">
                  <svg className="h-6 w-6 text-[#5cffc9]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2b0 012-2h5.586a1 1 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2m0 0V5a2 2 0 012-2h2a2 2 0 012 2m0 0V14a2 2 0 0 0 2-2h2a2 2 0 0 0 2-2m0 0V9a2 2 0 0 0-2-2a2 2 0 0 0-2 2" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-white">72.5%</p>
              <p className="text-sm text-gray-400 mt-2">Overall average across all exams</p>
            </div>
            
            <div className="bg-gradient-to-r from-[#5cffc9]/30 to-[#00ac76]/30 rounded-xl border border-[#5cffc9]/50 p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-[#5cffc9]">Exams Taken</h3>
                <div className="h-10 w-10 rounded-full bg-[#5cffc9]/70 flex items-center justify-center">
                  <svg className="h-6 w-6 text-[#5cffc9]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 0 4" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-white">4</p>
              <p className="text-sm text-gray-400 mt-2">Total exams completed</p>
            </div>
            
            <div className="bg-gradient-to-r from-[#5cffc9]/30 to-[#00ac76]/30 rounded-xl border border-[#5cffc9]/50 p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-[#5cffc9]">Success Rate</h3>
                <div className="h-10 w-10 rounded-full bg-[#00ac76]/70 flex items-center justify-center">
                  <svg className="h-6 w-6 text-[#00ac76]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-white">75%</p>
              <p className="text-sm text-gray-400 mt-2">Percentage of passed exams</p>
            </div>
          </div>
          
          <div className="mt-6">
            <div className="bg-[#121212] rounded-xl border border-gray-700 p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-white">Certificates</h3>
                <a href="#" className="text-[#5cffc9] hover:text-[#4be3b0] text-sm font-medium flex items-center">
                  View All <ChevronRight className="h-4 w-4 ml-1" />
                </a>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {studentResults
                  .filter(r => r.certificate)
                  .slice(0, 3)
                  .map(result => (
                    <div key={result.id} className="bg-gray-700/50 rounded-lg border border-gray-600 p-4 hover:border-[#5cffc9]/50 transition-colors">
                      <h4 className="text-white font-medium mb-2">{result.examTitle}</h4>
                      <p className="text-gray-400 text-sm mb-3">Issued on {result.date}</p>
                      <button className="w-full px-3 py-1.5 bg-gradient-to-r from-[#5cffc9] to-[#00ac76] hover:from-[#4be3b0] hover:to-[#008f5f] text-white text-sm rounded flex items-center justify-center">
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