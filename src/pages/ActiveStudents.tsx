import React, { useState } from 'react';
import { Search, Filter, X, Clock } from 'lucide-react';

// Mock data for active students
const mockActiveStudents = [
  { 
    id: '1',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    examTitle: 'Web Development Fundamentals',
    progress: 70,
    timeRemaining: '15:32',
    startTime: '09:15 AM',
    questionsAnswered: 7,
    totalQuestions: 10,
  },
  { 
    id: '2',
    name: 'Bob Smith',
    email: 'bob@example.com',
    examTitle: 'Web Development Fundamentals',
    progress: 40,
    timeRemaining: '28:45',
    startTime: '09:20 AM',
    questionsAnswered: 4,
    totalQuestions: 10,
  },
  { 
    id: '3',
    name: 'Charlie Brown',
    email: 'charlie@example.com',
    examTitle: 'Web Development Fundamentals',
    progress: 90,
    timeRemaining: '05:12',
    startTime: '09:10 AM',
    questionsAnswered: 9,
    totalQuestions: 10,
  },
  { 
    id: '4',
    name: 'Diana Prince',
    email: 'diana@example.com',
    examTitle: 'Data Structures and Algorithms',
    progress: 60,
    timeRemaining: '33:18',
    startTime: '10:00 AM',
    questionsAnswered: 6,
    totalQuestions: 10,
  },
  { 
    id: '5',
    name: 'Ethan Hunt',
    email: 'ethan@example.com',
    examTitle: 'Data Structures and Algorithms',
    progress: 20,
    timeRemaining: '42:05',
    startTime: '10:15 AM',
    questionsAnswered: 2,
    totalQuestions: 10,
  },
  { 
    id: '6',
    name: 'Fiona Gallagher',
    email: 'fiona@example.com',
    examTitle: 'JavaScript Programming',
    progress: 50,
    timeRemaining: '35:45',
    startTime: '11:00 AM',
    questionsAnswered: 5,
    totalQuestions: 10,
  }
];

const ActiveStudents: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterExam, setFilterExam] = useState('all');
  
  // Get unique exams for filter dropdown
  const exams = ['all', ...new Set(mockActiveStudents.map(s => s.examTitle))];
  
  const filteredStudents = mockActiveStudents.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesExam = filterExam === 'all' || student.examTitle === filterExam;
    
    return matchesSearch && matchesExam;
  });

  return (
    <div className="space-y-6 font-poppins">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-primary font-glacial">Active Students</h1>
          <p className="text-gray-400 mt-1">
            Monitor students currently taking exams
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 px-4 py-2 bg-secondary/20 text-secondary border border-secondary/30 rounded-lg text-sm font-medium flex items-center">
          <div className="h-2 w-2 rounded-full bg-secondary mr-2 animate-pulse"></div>
          {filteredStudents.length} Students Active
        </div>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-500" />
          </div>
          <input
            type="text"
            placeholder="Search by student name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-lg bg-darkbg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>
        
        <div className="relative w-full md:w-64">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter className="h-5 w-5 text-gray-500" />
          </div>
          <select
            value={filterExam}
            onChange={(e) => setFilterExam(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-600 rounded-lg bg-darkbg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
          >
            <option value="all">All Exams</option>
            {exams.filter(e => e !== 'all').map(exam => (
              <option key={exam} value={exam}>{exam}</option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 20 20" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Student cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student) => (
          <div key={student.id} className="bg-darkbg/80 rounded-xl border border-gray-600 hover:border-primary/50 overflow-hidden backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/20">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-white font-glacial">{student.name}</h3>
                  <p className="text-gray-400 text-sm">{student.email}</p>
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-amber-400 mr-1" />
                  <span className={`text-sm font-medium ${
                    parseInt(student.timeRemaining.split(':')[0]) < 10 
                      ? 'text-red-400' 
                      : 'text-amber-400'
                  }`}>
                    {student.timeRemaining}
                  </span>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Exam:</span>
                  <span className="text-white">{student.examTitle}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Started:</span>
                  <span className="text-white">{student.startTime}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Progress:</span>
                  <span className="text-white">{student.questionsAnswered} / {student.totalQuestions} questions</span>
                </div>
              </div>
              
              <div className="mt-4">
                <div className="w-full bg-gray-700 rounded-full h-2.5">
                  <div 
                    className={`h-2.5 rounded-full ${
                      student.progress >= 80 
                        ? 'bg-secondary' 
                        : student.progress >= 40 
                        ? 'bg-primary' 
                        : 'bg-amber-400'
                    }`}
                    style={{ width: `${student.progress}%` }}
                  ></div>
                </div>
                <p className="text-right text-xs text-gray-400 mt-1">
                  {student.progress}% completed
                </p>
              </div>
              
              <div className="mt-4 flex justify-between">
                <button className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm transition-colors">
                  View Details
                </button>
                <button className="px-3 py-2 bg-red-900/20 hover:bg-red-900/40 text-red-400 rounded-lg text-sm flex items-center transition-colors">
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
          <div className="bg-darkbg/80 rounded-xl border border-gray-600 p-8 mx-auto max-w-md backdrop-blur-sm">
            <div className="mx-auto h-16 w-16 rounded-full bg-gray-700 flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-white font-glacial">No active students found</h3>
            <p className="text-gray-400 mt-2">
              No students are currently taking exams that match your search criteria.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveStudents;