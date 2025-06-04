import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Search, Filter, Plus, Edit, Trash2, X, Save } from 'lucide-react';
import { collection, getDocs, deleteDoc, doc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '../../firebase';

interface Question {
  id: string;
  examId: string;
  examTitle: string;
  text: string;
  type: 'singleChoice' | 'multipleChoice' | 'essay' | 'matching' | 'ordering';
  points: number;
  options?: string[];
  correctAnswer?: string | string[];
}

interface Exam {
  id: string;
  title: string;
}

const Questions: React.FC = () => {
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterExam, setFilterExam] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [editText, setEditText] = useState('');
  const [editType, setEditType] = useState<'singleChoice' | 'multipleChoice' | 'essay' | 'matching' | 'ordering'>('singleChoice');
  const [editPoints, setEditPoints] = useState('1');
  const [editOptions, setEditOptions] = useState<string[]>(['']);
  const [editCorrectAnswer, setEditCorrectAnswer] = useState<string | string[]>('');
  const [editError, setEditError] = useState<string | null>(null);
  const [addText, setAddText] = useState('');
  const [addType, setAddType] = useState<'singleChoice' | 'multipleChoice' | 'essay' | 'matching' | 'ordering'>('singleChoice');
  const [addPoints, setAddPoints] = useState('1');
  const [addOptions, setAddOptions] = useState<string[]>(['']);
  const [addCorrectAnswer, setAddCorrectAnswer] = useState<string | string[]>('');
  const [addExamId, setAddExamId] = useState('');
  const [addError, setAddError] = useState<string | null>(null);

  console.log('Questions: Rendering component with user:', user?.name, 'role:', user?.role, 'isDark:', isDark);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      console.log('Questions: Fetching data from Firestore for user:', user?.name, 'role:', user?.role);
      try {
        const questionsList: Question[] = [];
        const examsList: Exam[] = [];
        console.log('Questions: Fetching exams collection...');
        const examsSnapshot = await getDocs(collection(db, 'exams'));
        console.log('Questions: Retrieved exams count:', examsSnapshot.size);

        for (const examDoc of examsSnapshot.docs) {
          const examData = examDoc.data();
          examsList.push({
            id: examDoc.id,
            title: examData.title || 'Untitled Exam',
          });
          console.log('Questions: Processing exam:', examDoc.id, 'title:', examData.title);
          try {
            const questionsSnapshot = await getDocs(collection(db, 'exams', examDoc.id, 'questions'));
            console.log(`Questions: Retrieved ${questionsSnapshot.size} questions for exam ${examDoc.id}`);
            questionsSnapshot.forEach(doc => {
              const questionData = doc.data();
              console.log(`Questions: Adding question ID ${doc.id} from exam ${examDoc.id}`);
              questionsList.push({
                id: doc.id,
                examId: examDoc.id,
                examTitle: examData.title || 'Untitled Exam',
                text: questionData.text || 'Untitled Question',
                type: questionData.type || 'singleChoice',
                points: questionData.points || 0,
                options: questionData.options || [],
                correctAnswer: questionData.correctAnswer || '',
              });
            });
          } catch (subError: any) {
            console.error(`Questions: Error fetching questions for exam ${examDoc.id}:`, subError.message, 'Code:', subError.code);
          }
        }
        setQuestions(questionsList);
        setExams(examsList);
        console.log('Questions: Total fetched questions:', questionsList.length, 'questions:', questionsList);
        console.log('Questions: Total fetched exams:', examsList.length, 'exams:', examsList);
      } catch (error: any) {
        console.error('Questions: Error fetching data:', error.message, 'Code:', error.code);
        setError('Failed to load questions. Please try again.');
      } finally {
        setLoading(false);
        console.log('Questions: Loading state set to false');
      }
    };

    if (user?.role === 'admin') {
      console.log('Questions: User is admin, initiating fetchData...');
      fetchData();
    } else {
      console.log('Questions: User is not admin, skipping fetchData.');
      setLoading(false);
    }
  }, [user]);

  const examFilterOptions = ['all', ...new Set(questions.map(q => q.examTitle))];
  console.log('Questions: Available exams for filter:', examFilterOptions);

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          question.examTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesExam = filterExam === 'all' || question.examTitle === filterExam;
    console.log(`Questions: Filtering question ID ${question.id}, matchesSearch: ${matchesSearch}, matchesExam: ${matchesExam}`);
    return matchesSearch && matchesExam;
  });
  console.log('Questions: Filtered questions count:', filteredQuestions.length);

  const handleEditQuestion = (question: Question) => {
    console.log('Questions: Opening edit modal for question:', question.id, 'text:', question.text);
    setSelectedQuestion(question);
    setEditText(question.text);
    setEditType(question.type);
    setEditPoints(question.points.toString());
    setEditOptions(question.options || ['']);
    setEditCorrectAnswer(question.correctAnswer || '');
    setEditError(null);
    setIsEditModalOpen(true);
  };

  const handleDeleteQuestion = (question: Question) => {
    console.log('Questions: Opening delete confirmation for question:', question.id, 'text:', question.text);
    setSelectedQuestion(question);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedQuestion) return;
    setLoading(true);
    console.log('Questions: Confirming deletion of question:', selectedQuestion.id, 'from exam:', selectedQuestion.examId);
    try {
      const questionRef = doc(db, 'exams', selectedQuestion.examId, 'questions', selectedQuestion.id);
      await deleteDoc(questionRef);
      console.log('Questions: Question deleted successfully:', selectedQuestion.id);
      setQuestions(questions.filter(q => q.id !== selectedQuestion.id));
      setIsDeleteModalOpen(false);
      setSelectedQuestion(null);
    } catch (err: any) {
      console.error('Questions: Error deleting question:', err.message, 'Code:', err.code);
      setError('Failed to delete question. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuestion) return;
    setLoading(true);
    setEditError(null);
    console.log('Questions: Updating question:', selectedQuestion.id, 'with data:', {
      text: editText,
      type: editType,
      points: parseInt(editPoints),
      options: editOptions,
      correctAnswer: editCorrectAnswer,
    });

    try {
      // Validate inputs
      if (!editText || !editPoints) {
        throw new Error('Question text and points are required.');
      }
      const pointsNum = parseInt(editPoints);
      if (isNaN(pointsNum) || pointsNum < 1) {
        throw new Error('Points must be a positive number.');
      }
      // For singleChoice and multipleChoice, validate options and correct answers
      if (editType === 'singleChoice' || editType === 'multipleChoice') {
        if (editOptions.length < 2 || editOptions.some(opt => !opt.trim())) {
          throw new Error('At least two non-empty options are required.');
        }
        if (editType === 'singleChoice' && (!editCorrectAnswer || typeof editCorrectAnswer !== 'string')) {
          throw new Error('A single correct answer must be selected.');
        }
        if (editType === 'multipleChoice' && (!editCorrectAnswer || !Array.isArray(editCorrectAnswer) || editCorrectAnswer.length === 0)) {
          throw new Error('At least one correct answer must be selected.');
        }
      }

      const questionRef = doc(db, 'exams', selectedQuestion.examId, 'questions', selectedQuestion.id);
      await updateDoc(questionRef, {
        text: editText,
        type: editType,
        points: pointsNum,
        options: editType === 'singleChoice' || editType === 'multipleChoice' ? editOptions : [],
        correctAnswer: editType === 'singleChoice' || editType === 'multipleChoice' ? editCorrectAnswer : '',
      });
      console.log('Questions: Question updated successfully:', selectedQuestion.id);

      // Update local state
      const updatedQuestion = {
        ...selectedQuestion,
        text: editText,
        type: editType,
        points: pointsNum,
        options: editType === 'singleChoice' || editType === 'multipleChoice' ? editOptions : [],
        correctAnswer: editType === 'singleChoice' || editType === 'multipleChoice' ? editCorrectAnswer : '',
      };
      setQuestions(questions.map(q => (q.id === selectedQuestion.id ? updatedQuestion : q)));
      setIsEditModalOpen(false);
      setSelectedQuestion(null);
    } catch (err: any) {
      console.error('Questions: Error updating question:', err.message, 'Code:', err.code);
      setEditError(err.message || 'Failed to update question.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setAddError(null);
    console.log('Questions: Adding new question with data:', {
      text: addText,
      type: addType,
      points: parseInt(addPoints),
      examId: addExamId,
      options: addOptions,
      correctAnswer: addCorrectAnswer,
    });

    try {
      // Validate inputs
      if (!addText || !addPoints || !addExamId) {
        throw new Error('Question text, points, and exam selection are required.');
      }
      const pointsNum = parseInt(addPoints);
      if (isNaN(pointsNum) || pointsNum < 1) {
        throw new Error('Points must be a positive number.');
      }
      // For singleChoice and multipleChoice, validate options and correct answers
      if (addType === 'singleChoice' || addType === 'multipleChoice') {
        if (addOptions.length < 2 || addOptions.some(opt => !opt.trim())) {
          throw new Error('At least two non-empty options are required.');
        }
        if (addType === 'singleChoice' && (!addCorrectAnswer || typeof addCorrectAnswer !== 'string')) {
          throw new Error('A single correct answer must be selected.');
        }
        if (addType === 'multipleChoice' && (!addCorrectAnswer || !Array.isArray(addCorrectAnswer) || addCorrectAnswer.length === 0)) {
          throw new Error('At least one correct answer must be selected.');
        }
      }

      const questionsCollection = collection(db, 'exams', addExamId, 'questions');
      const docRef = await addDoc(questionsCollection, {
        text: addText,
        type: addType,
        points: pointsNum,
        options: addType === 'singleChoice' || addType === 'multipleChoice' ? addOptions : [],
        correctAnswer: addType === 'singleChoice' || addType === 'multipleChoice' ? addCorrectAnswer : '',
      });
      console.log('Questions: New question added successfully with ID:', docRef.id);

      // Update local state
      const selectedExam = exams.find(exam => exam.id === addExamId);
      const newQuestion: Question = {
        id: docRef.id,
        examId: addExamId,
        examTitle: selectedExam?.title || 'Untitled Exam',
        text: addText,
        type: addType,
        points: pointsNum,
        options: addType === 'singleChoice' || addType === 'multipleChoice' ? addOptions : [],
        correctAnswer: addType === 'singleChoice' || addType === 'multipleChoice' ? addCorrectAnswer : '',
      };
      setQuestions([...questions, newQuestion]);
      setIsAddModalOpen(false);
      // Reset form fields
      setAddText('');
      setAddType('singleChoice');
      setAddPoints('1');
      setAddOptions(['']);
      setAddCorrectAnswer('');
      setAddExamId('');
    } catch (err: any) {
      console.error('Questions: Error adding question:', err.message, 'Code:', err.code);
      setAddError(err.message || 'Failed to add question.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddOption = (isAddModal: boolean) => {
    if (isAddModal) {
      setAddOptions([...addOptions, '']);
      console.log('Questions: Added new option field for add modal, total options:', addOptions.length + 1);
    } else {
      setEditOptions([...editOptions, '']);
      console.log('Questions: Added new option field for edit modal, total options:', editOptions.length + 1);
    }
  };

  const handleRemoveOption = (index: number, isAddModal: boolean) => {
    if (isAddModal) {
      if (addOptions.length > 1) {
        setAddOptions(addOptions.filter((_, i) => i !== index));
        console.log('Questions: Removed option at index for add modal:', index, 'new options count:', addOptions.length - 1);
      }
    } else {
      if (editOptions.length > 1) {
        setEditOptions(editOptions.filter((_, i) => i !== index));
        console.log('Questions: Removed option at index for edit modal:', index, 'new options count:', editOptions.length - 1);
      }
    }
  };

  const handleOptionChange = (index: number, value: string, isAddModal: boolean) => {
    if (isAddModal) {
      const updatedOptions = [...addOptions];
      updatedOptions[index] = value;
      setAddOptions(updatedOptions);
      console.log('Questions: Updated option at index for add modal:', index, 'to:', value);
    } else {
      const updatedOptions = [...editOptions];
      updatedOptions[index] = value;
      setEditOptions(updatedOptions);
      console.log('Questions: Updated option at index for edit modal:', index, 'to:', value);
    }
  };

  if (loading) {
    console.log('Questions: Rendering loading state');
    return <div className={`p-6 text-center ${isDark ? 'bg-darkbg text-white' : 'bg-light-bg text-light-text'}`}>Loading questions...</div>;
  }

  if (error) {
    console.log('Questions: Rendering error state with message:', error);
    return (
      <div className={`p-6 text-center ${isDark ? 'bg-darkbg text-red-300' : 'bg-light-bg text-red-600'}`}>
        <p>{error}</p>
        <button
          onClick={() => {
            console.log('Questions: Retrying fetch after error');
            if (user?.role === 'admin') {
              setLoading(true);
              setError(null);
              const fetchData = async () => {
                try {
                  const questions: Question[] = [];
                  const examsList: Exam[] = [];
                  const examsSnapshot = await getDocs(collection(db, 'exams'));
                  for (const examDoc of examsSnapshot.docs) {
                    const examData = examDoc.data();
                    examsList.push({
                      id: examDoc.id,
                      title: examData.title || 'Untitled Exam',
                    });
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
                        options: questionData.options,
                        correctAnswer: questionData.correctAnswer,
                      });
                    });
                  }
                  setQuestions(questions);
                  setExams(examsList);
                } catch (err: any) {
                  console.error('Questions: Retry fetch failed:', err.message);
                  setError('Failed to load questions. Please try again.');
                } finally {
                  setLoading(false);
                }
              };
              fetchData();
            }
          }}
          className={`mt-4 px-4 py-2 rounded-lg text-sm font-medium ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-300 text-black'}`}
        >
          Retry
        </button>
      </div>
    );
  }

  console.log('Questions: Rendering main content, filteredQuestions count:', filteredQuestions.length);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-light-text'}`}>Questions</h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Manage questions for your exams
          </p>
        </div>
        <button
          onClick={() => {
            console.log('Questions: Opening Add Question modal');
            setIsAddModalOpen(true);
          }}
          className={`mt-4 md:mt-0 px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-all btn-glow ${
            isDark ? 'bg-gradient-to-r from-primary to-secondary hover:from-[#4be3b0] hover:to-[#008f5f] text-white' : 'bg-gradient-to-r from-light-text to-gray-700 hover:from-gray-600 hover:to-gray-800 text-light-bg'
          }`}
        >
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
            onChange={(e) => {
              console.log('Questions: Search term updated:', e.target.value);
              setSearchTerm(e.target.value);
            }}
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
            onChange={(e) => {
              console.log('Questions: Filter exam updated:', e.target.value);
              setFilterExam(e.target.value);
            }}
            className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent appearance-none ${
              isDark ? 'bg-darkbg border-gray-700 text-white' : 'bg-light-bg border-gray-300 text-light-text'
            }`}
          >
            <option value="all">All Exams</option>
            {examFilterOptions.filter(e => e !== 'all').map(exam => (
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
                      <button
                        onClick={() => handleEditQuestion(question)}
                        className={isDark ? 'text-primary hover:text-[#4be3b0]' : 'text-light-text hover:text-gray-800'}
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(question)}
                        className={isDark ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-800'}
                      >
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

      {/* Add Question Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 font-poppins">
          <div className={`bg-darkbg rounded-xl border w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 ${isDark ? 'border-primary/40' : 'border-gray-300'}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-primary">Add New Question</h2>
              <button
                onClick={() => {
                  console.log('Questions: Closing Add Question modal');
                  setIsAddModalOpen(false);
                }}
                className="text-primary hover:text-secondary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {addError && (
              <div className="bg-red-900/40 text-red-300 p-3 rounded-md text-sm mb-4">
                {addError}
              </div>
            )}
            <form onSubmit={handleAddQuestion} className="space-y-4">
              <div>
                <label htmlFor="addExam" className="block text-sm font-medium text-primary">Exam</label>
                <select
                  id="addExam"
                  value={addExamId}
                  onChange={(e) => setAddExamId(e.target.value)}
                  className={`mt-1 w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary appearance-none ${
                    isDark ? 'bg-[#1f1f1f] border-secondary/40 text-white' : 'bg-light-bg border-gray-300 text-light-text'
                  }`}
                  required
                >
                  <option value="">Select an Exam</option>
                  {exams.map(exam => (
                    <option key={exam.id} value={exam.id}>{exam.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="addText" className="block text-sm font-medium text-primary">Question Text</label>
                <textarea
                  id="addText"
                  value={addText}
                  onChange={(e) => setAddText(e.target.value)}
                  className={`mt-1 w-full rounded-lg border px-4 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary ${
                    isDark ? 'bg-[#1f1f1f] border-secondary/40 text-white' : 'bg-light-bg border-gray-300 text-light-text'
                  }`}
                  placeholder="Enter question text"
                  rows={3}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="addType" className="block text-sm font-medium text-primary">Type</label>
                  <select
                    id="addType"
                    value={addType}
                    onChange={(e) => setAddType(e.target.value as any)}
                    className={`mt-1 w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary appearance-none ${
                      isDark ? 'bg-[#1f1f1f] border-secondary/40 text-white' : 'bg-light-bg border-gray-300 text-light-text'
                    }`}
                  >
                    <option value="singleChoice">Single Choice</option>
                    <option value="multipleChoice">Multiple Choice</option>
                    <option value="essay">Essay</option>
                    <option value="matching">Matching</option>
                    <option value="ordering">Ordering</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="addPoints" className="block text-sm font-medium text-primary">Points</label>
                  <input
                    type="number"
                    id="addPoints"
                    min="1"
                    value={addPoints}
                    onChange={(e) => setAddPoints(e.target.value)}
                    className={`mt-1 w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${
                      isDark ? 'bg-[#1f1f1f] border-secondary/40 text-white' : 'bg-light-bg border-gray-300 text-light-text'
                    }`}
                    required
                  />
                </div>
              </div>
              {(addType === 'singleChoice' || addType === 'multipleChoice') && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-primary">Options</label>
                  {addOptions.map((opt, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => handleOptionChange(index, e.target.value, true)}
                        className={`flex-1 rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${
                          isDark ? 'bg-[#1f1f1f] border-secondary/40 text-white' : 'bg-light-bg border-gray-300 text-light-text'
                        }`}
                        placeholder={`Option ${index + 1}`}
                        required
                      />
                      {addOptions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(index, true)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleAddOption(true)}
                    className={`px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm ${isDark ? 'bg-gray-700' : 'bg-gray-300 text-black'}`}
                  >
                    + Add Option
                  </button>
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-primary">Correct Answer(s)</label>
                    {addType === 'singleChoice' ? (
                      <select
                        value={typeof addCorrectAnswer === 'string' ? addCorrectAnswer : addOptions[0] || ''}
                        onChange={(e) => setAddCorrectAnswer(e.target.value)}
                        className={`mt-1 w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary appearance-none ${
                          isDark ? 'bg-[#1f1f1f] border-secondary/40 text-white' : 'bg-light-bg border-gray-300 text-light-text'
                        }`}
                        required
                      >
                        {addOptions.map((opt, index) => (
                          <option key={index} value={opt}>{opt || `Option ${index + 1}`}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="space-y-1">
                        {addOptions.map((opt, index) => (
                          <div key={index} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`add-correct-${index}`}
                              checked={Array.isArray(addCorrectAnswer) && addCorrectAnswer.includes(opt)}
                              onChange={() => {
                                const currentAnswers = Array.isArray(addCorrectAnswer) ? addCorrectAnswer : [];
                                const newAnswers = currentAnswers.includes(opt)
                                  ? currentAnswers.filter(a => a !== opt)
                                  : [...currentAnswers, opt];
                                setAddCorrectAnswer(newAnswers);
                                console.log('Questions: Updated correct answers for multiple choice in add modal:', newAnswers);
                              }}
                              className="mr-2"
                            />
                            <label htmlFor={`add-correct-${index}`} className={`text-sm ${isDark ? 'text-white' : 'text-light-text'}`}>
                              {opt || `Option ${index + 1}`}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-300 text-black'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center transition-all ${
                    loading
                      ? 'bg-gray-500 cursor-not-allowed text-gray-300'
                      : 'bg-gradient-to-r from-primary to-secondary hover:from-[#4be3b0] hover:to-[#008f5f] text-white'
                  }`}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Adding...' : 'Add Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Question Modal */}
      {isEditModalOpen && selectedQuestion && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 font-poppins">
          <div className={`bg-darkbg rounded-xl border w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 ${isDark ? 'border-primary/40' : 'border-gray-300'}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-primary">Edit Question</h2>
              <button
                onClick={() => {
                  console.log('Questions: Closing Edit Question modal');
                  setIsEditModalOpen(false);
                  setSelectedQuestion(null);
                }}
                className="text-primary hover:text-secondary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {editError && (
              <div className="bg-red-900/40 text-red-300 p-3 rounded-md text-sm mb-4">
                {editError}
              </div>
            )}
            <form onSubmit={handleUpdateQuestion} className="space-y-4">
              <div>
                <label htmlFor="editText" className="block text-sm font-medium text-primary">Question Text</label>
                <textarea
                  id="editText"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className={`mt-1 w-full rounded-lg border px-4 py-2 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary ${
                    isDark ? 'bg-[#1f1f1f] border-secondary/40 text-white' : 'bg-light-bg border-gray-300 text-light-text'
                  }`}
                  placeholder="Enter question text"
                  rows={3}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="editType" className="block text-sm font-medium text-primary">Type</label>
                  <select
                    id="editType"
                    value={editType}
                    onChange={(e) => setEditType(e.target.value as any)}
                    className={`mt-1 w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary appearance-none ${
                      isDark ? 'bg-[#1f1f1f] border-secondary/40 text-white' : 'bg-light-bg border-gray-300 text-light-text'
                    }`}
                  >
                    <option value="singleChoice">Single Choice</option>
                    <option value="multipleChoice">Multiple Choice</option>
                    <option value="essay">Essay</option>
                    <option value="matching">Matching</option>
                    <option value="ordering">Ordering</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="editPoints" className="block text-sm font-medium text-primary">Points</label>
                  <input
                    type="number"
                    id="editPoints"
                    min="1"
                    value={editPoints}
                    onChange={(e) => setEditPoints(e.target.value)}
                    className={`mt-1 w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${
                      isDark ? 'bg-[#1f1f1f] border-secondary/40 text-white' : 'bg-light-bg border-gray-300 text-light-text'
                    }`}
                    required
                  />
                </div>
              </div>
              {(editType === 'singleChoice' || editType === 'multipleChoice') && (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-primary">Options</label>
                  {editOptions.map((opt, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => handleOptionChange(index, e.target.value, false)}
                        className={`flex-1 rounded-lg border px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${
                          isDark ? 'bg-[#1f1f1f] border-secondary/40 text-white' : 'bg-light-bg border-gray-300 text-light-text'
                        }`}
                        placeholder={`Option ${index + 1}`}
                        required
                      />
                      {editOptions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(index, false)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleAddOption(false)}
                    className={`px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-sm ${isDark ? 'bg-gray-700' : 'bg-gray-300 text-black'}`}
                  >
                    + Add Option
                  </button>
                  <div className="mt-2">
                    <label className="block text-sm font-medium text-primary">Correct Answer(s)</label>
                    {editType === 'singleChoice' ? (
                      <select
                        value={typeof editCorrectAnswer === 'string' ? editCorrectAnswer : editOptions[0] || ''}
                        onChange={(e) => setEditCorrectAnswer(e.target.value)}
                        className={`mt-1 w-full rounded-lg border px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary appearance-none ${
                          isDark ? 'bg-[#1f1f1f] border-secondary/40 text-white' : 'bg-light-bg border-gray-300 text-light-text'
                        }`}
                        required
                      >
                        {editOptions.map((opt, index) => (
                          <option key={index} value={opt}>{opt || `Option ${index + 1}`}</option>
                        ))}
                      </select>
                    ) : (
                      <div className="space-y-1">
                        {editOptions.map((opt, index) => (
                          <div key={index} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`correct-${index}`}
                              checked={Array.isArray(editCorrectAnswer) && editCorrectAnswer.includes(opt)}
                              onChange={() => {
                                const currentAnswers = Array.isArray(editCorrectAnswer) ? editCorrectAnswer : [];
                                const newAnswers = currentAnswers.includes(opt)
                                  ? currentAnswers.filter(a => a !== opt)
                                  : [...currentAnswers, opt];
                                setEditCorrectAnswer(newAnswers);
                                console.log('Questions: Updated correct answers for multiple choice:', newAnswers);
                              }}
                              className="mr-2"
                            />
                            <label htmlFor={`correct-${index}`} className={`text-sm ${isDark ? 'text-white' : 'text-light-text'}`}>
                              {opt || `Option ${index + 1}`}
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedQuestion(null);
                  }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-300 text-black'}`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center transition-all ${
                    loading
                      ? 'bg-gray-500 cursor-not-allowed text-gray-300'
                      : 'bg-gradient-to-r from-primary to-secondary hover:from-[#4be3b0] hover:to-[#008f5f] text-white'
                  }`}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Updating...' : 'Update Question'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedQuestion && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 font-poppins">
          <div className={`bg-darkbg rounded-xl border w-full max-w-md p-6 ${isDark ? 'border-primary/40' : 'border-gray-300'}`}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-red-400">Delete Question</h2>
              <button
                onClick={() => {
                  console.log('Questions: Closing Delete Question modal');
                  setIsDeleteModalOpen(false);
                  setSelectedQuestion(null);
                }}
                className="text-primary hover:text-secondary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Are you sure you want to delete the question: <strong>{selectedQuestion.text}</strong>? This action cannot be undone.
            </p>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => {
                  setIsDeleteModalOpen(false);
                  setSelectedQuestion(null);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${isDark ? 'bg-gray-700 text-white' : 'bg-gray-300 text-black'}`}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={loading}
                className={`px-4 py-2 rounded-lg text-sm font-medium ${
                  loading ? 'bg-gray-500 cursor-not-allowed text-gray-300' : 'bg-red-600 hover:bg-red-700 text-white'
                }`}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Questions;