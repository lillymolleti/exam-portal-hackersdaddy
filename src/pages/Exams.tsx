import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Plus, FileUp, Filter, Search } from 'lucide-react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import ExamCard from '../components/exams/ExamCard';
import CreateExamModal from '../components/exams/CreateExamModal';
import EditExamModal from '../components/exams/EditExamModal';

interface Exam {
  id: string;
  title: string;
  date: string; // ISO string
  duration: number;
  totalQuestions: number;
  description?: string;
  passingScore?: number;
}

const Exams: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role || 'student';
  const isAdmin = role === 'admin';

  const [exams, setExams] = useState<Exam[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  console.log('Exams: Rendering component with user:', user?.name, 'role:', role, 'isAdmin:', isAdmin);

  useEffect(() => {
    console.log('Exams: useEffect triggered for fetching exams');
    if (!user) {
      console.log('Exams: No user authenticated, aborting fetch');
      setLoading(false);
      return;
    }

    const fetchExams = async () => {
      setLoading(true);
      console.log('Exams: Fetching exams for user:', user.name, 'role:', role);
      console.log('Exams: Initial loading state set to true');
      console.log('Exams: Fetching exams from Firestore');
      try {
        const examsSnapshot = await getDocs(collection(db, 'exams'));
        console.log('Exams: Raw snapshot size:', examsSnapshot.size);
        const examsData = examsSnapshot.docs
          .map((doc) => {
            const data = doc.data();
            console.log('Exams: Exam document:', doc.id, data);
            const examDate = new Date(data.date);
            if (isNaN(examDate.getTime())) {
              console.warn('Exams: Invalid date for exam:', doc.id, 'date:', data.date);
              return null; // Skip exams with invalid dates
            }
            return {
              id: doc.id,
              title: data.title,
              date: data.date,
              duration: data.duration,
              totalQuestions: data.totalQuestions,
              description: data.description,
              passingScore: data.passingScore,
            } as Exam;
          })
          .filter((exam): exam is Exam => exam !== null); // Filter out null entries
        setExams(examsData);
        console.log('Exams: Fetched and set exams:', examsData);
      } catch (error: any) {
        console.error('Exams: Error fetching exams:', error.message, 'Code:', error.code);
      } finally {
        setLoading(false);
        console.log('Exams: Loading state set to false');
      }
    };
    fetchExams();
  }, [user]);

  const filteredExams = exams.filter((exam) => {
    console.log('Exams: Filtering exam:', exam.id, 'title:', exam.title, 'date:', exam.date);
    const matchesSearch = exam.title.toLowerCase().includes(searchTerm.toLowerCase());
    const examDate = new Date(exam.date);
    const isUpcoming = !isNaN(examDate.getTime()) && examDate > new Date();
    console.log('Exams: Exam filter - matchesSearch:', matchesSearch, 'isUpcoming:', isUpcoming, 'filterStatus:', filterStatus);

    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'upcoming') return matchesSearch && isUpcoming;
    if (filterStatus === 'past') return matchesSearch && !isUpcoming;

    return matchesSearch;
  });
  console.log('Exams: Filtered exams:', filteredExams);

  const handleEditExam = (exam: Exam) => {
    console.log('Exams: Opening EditExamModal for exam:', exam.id);
    setSelectedExam(exam);
    setIsEditModalOpen(true);
  };

  if (loading) {
    console.log('Exams: Rendering loading state');
    return <div className="p-6 text-center bg-darkbg text-white">Loading exams...</div>;
  }

  console.log('Exams: Rendering main content, filteredExams length:', filteredExams.length);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Exams</h1>
          <p className="text-gray-400 mt-1">
            {isAdmin ? 'Manage and create exams for your students' : 'View and take your scheduled exams'}
          </p>
        </div>

        {isAdmin && (
          <div className="mt-4 md:mt-0 flex space-x-3">
            <button
              onClick={() => {
                console.log('Exams: Opening CreateExamModal');
                setIsCreateModalOpen(true);
              }}
              className="px-4 py-2 bg-gradient-to-r from-primary to-secondary hover:from-[#4be3b0] hover:to-[#008f5f] text-white rounded-lg text-sm font-medium flex items-center transition-all"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Exam
            </button>
            <button
              onClick={() => {
                console.log('Exams: Opening CreateExamModal for import');
                setIsCreateModalOpen(true);
              }}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium flex items-center transition-colors"
            >
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
            onChange={(e) => {
              console.log('Exams: Search term updated:', e.target.value);
              setSearchTerm(e.target.value);
            }}
            className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-lg bg-darkbg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </div>

        <div className="relative w-full md:w-48">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Filter className="h-5 w-5 text-gray-400" />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => {
              console.log('Exams: Filter status updated:', e.target.value);
              setFilterStatus(e.target.value);
            }}
            className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-lg bg-darkbg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none"
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
        {filteredExams.map((exam) => {
          console.log('Exams: Rendering ExamCard for exam:', exam.id);
          return (
            <ExamCard
              key={exam.id}
              exam={exam}
              role={role as 'admin' | 'student'}
              onEdit={isAdmin ? handleEditExam : undefined}
            />
          );
        })}
      </div>

      {filteredExams.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-darkbg rounded-xl border border-gray-700 p-8 mx-auto max-w-md backdrop-blur-sm">
            <div className="mx-auto h-16 w-16 rounded-full bg-gray-700 flex items-center justify-center mb-4">
              <FileUp className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-white">No exams found</h3>
            <p className="text-gray-400 mt-2">
              {isAdmin ? 'Create a new exam or adjust your search filters' : 'No exams match your current filters'}
            </p>
            {isAdmin && (
              <button
                onClick={() => {
                  console.log('Exams: Opening CreateExamModal from no exams message');
                  setIsCreateModalOpen(true);
                }}
                className="mt-4 px-4 py-2 bg-gradient-to-r from-primary to-secondary hover:from-[#4be3b0] hover:to-[#008f5f] text-white rounded-lg text-sm font-medium"
              >
                Create Exam
              </button>
            )}
          </div>
        </div>
      )}

      {isCreateModalOpen && (
        <>
          {console.log('Exams: Rendering CreateExamModal')}
          <CreateExamModal
            onClose={() => {
              console.log('Exams: Closing CreateExamModal');
              setIsCreateModalOpen(false);
            }}
          />
        </>
      )}

      {isEditModalOpen && selectedExam && (
        <>
          {console.log('Exams: Rendering EditExamModal for exam:', selectedExam.id)}
          <EditExamModal
            exam={selectedExam}
            onClose={() => {
              console.log('Exams: Closing EditExamModal');
              setIsEditModalOpen(false);
              setSelectedExam(null);
            }}
          />
        </>
      )}
    </div>
  );
};

export default Exams;