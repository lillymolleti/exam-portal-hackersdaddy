import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Search, Filter, Plus, Edit, Trash2 } from 'lucide-react';
import { collection, getDocs} from 'firebase/firestore';
import { db } from '../../firebase';

interface Question {
  id: string;
  examId: string;
  examTitle: string;
  text: string;
  type: 'singleChoice' | 'multipleChoice' | 'essay' | 'matching' | 'ordering';
  points: number;
}

const Questions: React.FC = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterExam, setFilterExam] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        const questions: Question[] = [];
        const examsSnapshot = await getDocs(collection(db, 'exams'));
        for (const examDoc of examsSnapshot.docs) {
          const examData = examDoc.data();
          const questionsSnapshot = await getDocs(collection(db, 'exams', examDoc.id, 'questions'));
          questionsSnapshot.forEach(doc => {
            const questionData = doc.data();
            questions.push({
              id: doc.id,
              examId: examDoc.id,
              examTitle: examData.title,
              text: questionData.text,
              type: questionData.type,
              points: questionData.points,
            });
          });
        }
        setQuestions(questions);
        console.log('Questions: Fetched questions:', questions);
      } catch (error) {
        console.error('Questions: Error fetching questions:', error);
      } finally {
        setLoading(false);
      }
    };
    if (user?.role === 'admin') {
      fetchQuestions();
    }
  }, [user]);

  const exams = ['all', ...new Set(questions.map(q => q.examTitle))];

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          question.examTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesExam = filterExam === 'all' || question.examTitle === filterExam;
    return matchesSearch && matchesExam;
  });

  if (loading) {
    return <div className={`p-6 text-center ${isDark ? 'bg-darkbg text-white' : 'bg-light-bg text-light-text'}`}>Loading questions...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-light-text'}`}>Questions</h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage questions for your exams
          </p>
        </div>
        <button className={`mt-4 md:mt-0 px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-all btn-glow ${
          isDark ? 'bg-gradient-to-r from-primary to-secondary hover:from-[#4be3b0] hover:to-[#008f5f] text-white' : 'bg-gradient-to-r from-light-text to-gray-700 hover:from-gray-600 hover:to-gray-800 text-light-bg'
        }`}>
          <Plus className="h-4 w-4 mr-2" />
          Add Question
        </button>
      </div>

      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
          </div>
          <input
            type="text"
            placeholder="Search questions or exams..."
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

      <div className={`rounded-xl border overflow-hidden backdrop-blur-sm glass-effect ${
        isDark ? 'bg-darkbg border-gray-700' : 'bg-light-bg border-gray-300'
      }`}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className={isDark ? 'bg-darkbg' : 'bg-light-bg'}>
              <tr>
                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Question
                </th>
                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Exam
                </th>
                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Type
                </th>
                <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Points
                </th>
                <th scope="col" className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={isDark ? 'divide-gray-700' : 'divide-gray-300'}>
              {filteredQuestions.map((question) => (
                <tr key={question.id} className={`hover:bg-gray-700/30 transition-colors ${isDark ? '' : 'hover:bg-gray-200/30'}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-light-text'}`}>{question.text}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{question.examTitle}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{question.type}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm ${isDark ? 'text-white' : 'text-light-text'}`}>{question.points}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end space-x-3">
                      <button className={isDark ? 'text-primary hover:text-[#4be3b0]' : 'text-light-text hover:text-gray-800'}>
                        <Edit className="h-5 w-5" />
                      </button>
                      <button className={isDark ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-800'}>
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {filteredQuestions.length === 0 && (
        <div className="text-center py-12">
          <div className={`rounded-xl border p-8 mx-auto max-w-md backdrop-blur-sm glass-effect ${
            isDark ? 'bg-darkbg border-gray-700' : 'bg-light-bg border-gray-300'
          }`}>
            <div className={`mx-auto h-16 w-16 rounded-full flex items-center justify-center mb-4 ${
              isDark ? 'bg-gray-700' : 'bg-gray-200'
            }`}>
              <Search className={`h-8 w-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
            </div>
            <h3 className={`text-lg font-medium ${isDark ? 'text-white' : 'text-light-text'}`}>No questions found</h3>
            <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              No questions match your current filters. Try adjusting your search criteria.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Questions;