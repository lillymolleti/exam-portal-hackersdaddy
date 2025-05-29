import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, FileUp, Filter, Search } from 'lucide-react';
import ExamCard from '../components/exams/ExamCard';
import CreateExamModal from '../components/exams/CreateExamModal';

// Mock data for exams
const mockExams = [
  { id: '1', title: 'Web Development Fundamentals', date: '2025-08-15', duration: 60, totalQuestions: 10 },
  { id: '2', title: 'Data Structures and Algorithms', date: '2025-08-18', duration: 90, totalQuestions: 10 },
  { id: '3', title: 'JavaScript Programming', date: '2025-08-12', duration: 120, totalQuestions: 10 },
  { id: '4', title: 'Database Systems', date: '2025-08-01', duration: 75, totalQuestions: 10 },
  { id: '5', title: 'Computer Networks', date: '2025-07-25', duration: 60, totalQuestions: 10 },
  { id: '6', title: 'Operating Systems', date: '2025-08-20', duration: 90, totalQuestions: 10 },
];

const Exams: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role || 'student';
  const isAdmin = role === 'admin';
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const filteredExams = mockExams.filter(exam => {
    const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase());
    const isUpcoming = new Date(exam.date) > new Date();
    
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'upcoming') return matchesSearch && isUpcoming;
    if (filterStatus === 'past') return matchesSearch && !isUpcoming;
    
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Exams</h1>
          <p className="text-gray-400 mt-1">
            {isAdmin 
              ? 'Manage and create exams for your students' 
              : 'View and take your scheduled exams'}
          </p>
        </div>
        
        {isAdmin && (
          <div className="mt-4 md:mt-0 flex space-x-3">
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-[#5cffc9] to-[#00ac76] hover:from-[#4be3b0] hover:to-[#008f5f] text-white rounded-lg text-sm font-medium flex items-center transition-all"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Exam
            </button>
            <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium flex items-center transition-colors">
              <FileUp className="h-4 w-4 mr-2" />
              Import from Excel
            </button>
          </div>
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
            placeholder="Search exams..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-lg bg-[#121212] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#5cffc9] focus:border-transparent"
          />
        </div>
        
        <div className="relative w-full md:w-48">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter className="h-5 w-5 text-gray-400" />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-lg bg-[#121212] text-white focus:outline-none focus:ring-2 focus:ring-[#5cffc9] focus:border-transparent appearance-none"
          >
            <option value="all">All Exams</option>
            <option value="upcoming">Upcoming</option>
            <option value="past">Past</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 20 20" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Exams grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExams.map((exam) => (
          <ExamCard key={exam.id} exam={exam} role={role as 'admin' | 'student'} />
        ))}
      </div>
      
      {filteredExams.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-[#121212] rounded-xl border border-gray-700 p-8 mx-auto max-w-md backdrop-blur-sm">
            <div className="mx-auto h-16 w-16 rounded-full bg-gray-700 flex items-center justify-center mb-4">
              <FileUp className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-white">No exams found</h3>
            <p className="text-gray-400 mt-2">
              {isAdmin
                ? 'Create a new exam or adjust your search filters'
                : 'No exams match your current filters'}
            </p>
            {isAdmin && (
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-4 px-4 py-2 bg-gradient-to-r from-[#5cffc9] to-[#00ac76] hover:from-[#4be3b0] hover:to-[#008f5f] text-white rounded-lg text-sm font-medium"
              >
                Create Exam
              </button>
            )}
          </div>
        </div>
      )}
      
      {/* Create Exam Modal */}
      {isCreateModalOpen && (
        <CreateExamModal onClose={() => setIsCreateModalOpen(false)} />
      )}
    </div>
  );
};

export default Exams;