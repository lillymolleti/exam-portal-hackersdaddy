import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Flag, Clock, CheckCircle, AlertCircle, FileQuestion, Save } from 'lucide-react';
import { doc, getDoc, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

interface Question {
  id: string;
  text: string;
  options?: string[];
  correctAnswer?: string | string[] | null;
  type: 'singleChoice' | 'multipleChoice' | 'essay' | 'matching' | 'ordering';
  points?: number;
}

interface Exam {
  id: string;
  title: string;
  startTime: string;
  duration: number;
  totalQuestions: number;
}

const ExamInterface: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();

  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: any }>({});
  const [markedQuestions, setMarkedQuestions] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchExamData = async () => {
      if (!examId) {
        setError('Invalid exam ID');
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Fetch exam details
        const examRef = doc(db, 'exams', examId);
        const examSnap = await getDoc(examRef);
        if (!examSnap.exists()) {
          throw new Error('Exam not found');
        }
        const examData = { id: examSnap.id, ...examSnap.data() } as Exam;
        setExam(examData);
        setTimeLeft(examData.duration * 60); // Convert minutes to seconds

        // Fetch questions
        const questionsRef = collection(db, 'exams', examId, 'questions');
        const questionsSnap = await getDocs(questionsRef);
        const questionsData = questionsSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Question[];
        setQuestions(questionsData);

        console.log('Exam fetched:', examData);
        console.log('Questions fetched:', questionsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading exam');
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchExamData();
  }, [examId]);

  useEffect(() => {
    if (timeLeft <= 0 || !exam) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, exam]);

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleJumpToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const handleToggleMarked = (questionId: string) => {
    setMarkedQuestions((prev) =>
      prev.includes(questionId) ? prev.filter((id) => id !== questionId) : [...prev, questionId]
    );
  };

  const handleAnswerChange = (value: any) => {
    setAnswers((prev) => ({
      ...prev,
      [questions[currentQuestionIndex].id]: value,
    }));
  };

  const handleSubmit = () => {
    // TODO: Save answers to Firestore results collection
    navigate(`/student/results/${examId}`);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getQuestionStatus = (index: number) => {
    const question = questions[index];
    const isAnswered = answers[question.id] !== undefined;
    const isMarked = markedQuestions.includes(question.id);
    const isCurrent = index === currentQuestionIndex;

    if (isCurrent) return 'current';
    if (isMarked) return 'marked';
    if (isAnswered) return 'answered';
    return 'unanswered';
  };

  const renderQuestion = () => {
    const question = questions[currentQuestionIndex];
    if (!question) return <p>No question available</p>;
    const answer = answers[question.id];

    switch (question.type) {
      case 'singleChoice':
        return (
          <div className="space-y-4">
            <p className="text-lg font-medium text-white whitespace-pre-line">{question.text}</p>
            <div className="space-y-3 mt-4">
              {question.options?.map((option, index) => (
                <label
                  key={index}
                  className="flex items-start space-x-3 p-3 rounded-lg border border-gray-700 hover:border-primary bg-darkbg cursor-pointer transition-colors"
                >
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    checked={answer === index}
                    onChange={() => handleAnswerChange(index)}
                    className="mt-1 h-4 w-4 text-primary focus:ring-primary border-gray-700 bg-darkbg"
                  />
                  <span className="text-white">{option}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'multipleChoice':
        return (
          <div className="space-y-4">
            <p className="text-lg font-medium text-white whitespace-pre-line">{question.text}</p>
            <div className="space-y-3 mt-4">
              {question.options?.map((option, index) => (
                <label
                  key={index}
                  className="flex items-start space-x-3 p-3 rounded-lg border border-gray-700 hover:border-primary bg-darkbg cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={answer?.includes(index)}
                    onChange={() => {
                      const current = answer || [];
                      const updated = current.includes(index)
                        ? current.filter((i: number) => i !== index)
                        : [...current, index];
                      handleAnswerChange(updated);
                    }}
                    className="mt-1 h-4 w-4 text-primary focus:ring-primary border-gray-700 bg-darkbg rounded"
                  />
                  <span className="text-white">{option}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'essay':
        return (
          <div className="space-y-4">
            <p className="text-lg font-medium text-white whitespace-pre-line">{question.text}</p>
            <textarea
              value={answer || ''}
              onChange={(e) => handleAnswerChange(e.target.value)}
              className="w-full h-40 p-3 bg-darkbg border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Type your answer here..."
            />
          </div>
        );

      case 'matching':
        return (
          <div className="space-y-4">
            <p className="text-lg font-medium text-white whitespace-pre-line">{question.text}</p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
              <div className="space-y-3">
                {question.options?.map((option, index) => (
                  <div key={index} className="p-3 rounded-lg border border-gray-700 bg-darkbg">
                    <p className="text-white">{option}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                {question.options?.map((_, index) => (
                  <div key={index} className="p-3 rounded-lg border border-gray-700 bg-darkbg">
                    <select
                      value={answer?.[index] ?? ''}
                      onChange={(e) => {
                        const current = answer || Array(question.options?.length).fill('');
                        const updated = [...current];
                        updated[index] = parseInt(e.target.value);
                        handleAnswerChange(updated);
                      }}
                      className="w-full bg-darkbg border-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">-- Select match --</option>
                      {question.options?.map((opt, i) => (
                        <option key={i} value={i}>{opt}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'ordering':
        return (
          <div className="space-y-4">
            <p className="text-lg font-medium text-white whitespace-pre-line">{question.text}</p>
            <div className="space-y-3 mt-4">
              {question.options?.map((option, index) => (
                <div key={index} className="flex items-center p-3 rounded-lg border border-gray-700 bg-darkbg">
                  <div className="flex-1">
                    <p className="text-white">{option}</p>
                  </div>
                  <select
                    value={answer?.[option] ?? ''}
                    onChange={(e) => {
                      const current = answer || {};
                      handleAnswerChange({
                        ...current,
                        [option]: parseInt(e.target.value),
                      });
                    }}
                    className="bg-darkbg border-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="">--</option>
                    {question.options?.map((_, i) => (
                      <option key={i} value={i}>{i + 1}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return <p>Unsupported question type</p>;
    }
  };

  if (loading) {
    return <div className="p-6 text-center bg-darkbg text-white">Loading exam...</div>;
  }

  if (error) {
    return <div className="p-6 text-center bg-darkbg text-red-400">{error}</div>;
  }

  if (!exam || !questions.length) {
    return <div className="p-6 text-center bg-darkbg text-white">No exam data available</div>;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Exam header */}
      <div className="bg-darkbg border-b border-gray-700 p-4 backdrop-blur-sm">
        <div className="flex flex-wrap justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold text-white">{exam.title}</h1>
            <p className="text-gray-400 text-sm">
              Question {currentQuestionIndex + 1} of {exam.totalQuestions}
            </p>
          </div>

          <div className="flex items-center space-x-6">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-primary mr-2" />
              <span className={`font-bold ${timeLeft < 300 ? 'text-red-400' : 'text-white'}`}>
                {formatTime(timeLeft)}
              </span>
            </div>

            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-primary to-secondary hover:from-[#4be3b0] hover:to-[#008f5f] text-white rounded-lg text-sm font-medium transition-all"
            >
              Submit Exam
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Question list sidebar */}
        <div className="w-full md:w-64 lg:w-80 bg-darkbg border-r border-gray-700 p-4 overflow-y-auto backdrop-blur-sm">
          <h2 className="text-lg font-medium text-white mb-4">Question Navigator</h2>

          <div className="grid grid-cols-5 gap-2">
            {questions.map((question, index) => {
              const status = getQuestionStatus(index);
              return (
                <button
                  key={question.id}
                  onClick={() => handleJumpToQuestion(index)}
                  className={`h-10 w-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all
                    ${status === 'current' ? 'bg-primary text-black ring-2 ring-[#4be3b0]' : ''}
                    ${status === 'marked' ? 'bg-amber-600/60 text-white' : ''}
                    ${status === 'answered' ? 'bg-secondary/60 text-white' : ''}
                    ${status === 'unanswered' ? 'bg-gray-700 text-gray-300' : ''}
                  `}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>

          <div className="mt-6 space-y-3">
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 rounded-sm bg-primary"></div>
              <span className="text-sm text-gray-300">Current Question</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 rounded-sm bg-secondary/60"></div>
              <span className="text-sm text-gray-300">Answered</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 rounded-sm bg-amber-600/60"></div>
              <span className="text-sm text-gray-300">Marked for Review</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 rounded-sm bg-gray-700"></div>
              <span className="text-sm text-gray-300">Unanswered</span>
            </div>
          </div>

          <div className="mt-6">
            <h3 className="text-md font-medium text-white mb-2">Exam Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Total Questions:</span>
                <span className="text-white">{exam.totalQuestions}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Answered:</span>
                <span className="text-white">{Object.keys(answers).length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Marked for Review:</span>
                <span className="text-white">{markedQuestions.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Unanswered:</span>
                <span className="text-white">{exam.totalQuestions - Object.keys(answers).length}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Question content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center">
                <FileQuestion className="h-6 w-6 text-primary mr-2" />
                <h2 className="text-lg font-semibold text-white">Question {currentQuestionIndex + 1}</h2>
              </div>

              <button
                onClick={() => handleToggleMarked(questions[currentQuestionIndex].id)}
                className={`flex items-center px-3 py-1.5 rounded-lg text-sm font-medium ${
                  markedQuestions.includes(questions[currentQuestionIndex].id)
                    ? 'bg-amber-600/60 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-amber-600/40'
                } transition-colors`}
              >
                <Flag className="h-4 w-4 mr-1" />
                {markedQuestions.includes(questions[currentQuestionIndex].id) ? 'Marked' : 'Mark for Review'}
              </button>
            </div>

            <div className="bg-darkbg rounded-xl border border-gray-700 p-6 mb-6 backdrop-blur-sm">
              {renderQuestion()}
            </div>

            <div className="flex justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium ${
                  currentQuestionIndex === 0
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-700 text-white hover:bg-gray-600'
                } transition-colors`}
              >
                <ChevronLeft className="h-5 w-5 mr-1" />
                Previous
              </button>

              <button
                onClick={() => handleToggleMarked(questions[currentQuestionIndex].id)}
                className={`hidden md:flex items-center px-4 py-2 rounded-lg text-sm font-medium ${
                  markedQuestions.includes(questions[currentQuestionIndex].id)
                    ? 'bg-amber-600/60 text-white'
                    : 'bg-gray-700 text-white hover:bg-amber-600/40'
                } transition-colors`}
              >
                <Flag className="h-5 w-5 mr-1" />
                {markedQuestions.includes(questions[currentQuestionIndex].id) ? 'Unmark' : 'Mark for Review'}
              </button>

              <button
                onClick={() => {
                  if (currentQuestionIndex === questions.length - 1) {
                    setIsSubmitModalOpen(true);
                  } else {
                    handleNext();
                  }
                }}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-primary to-secondary hover:from-[#4be3b0] hover:to-[#008f5f] text-white rounded-lg text-sm font-medium transition-all"
              >
                {currentQuestionIndex === questions.length - 1 ? (
                  <>
                    Finish Exam
                    <CheckCircle className="h-5 w-5 ml-1" />
                  </>
                ) : (
                  <>
                    Next
                    <ChevronRight className="h-5 w-5 ml-1" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {isSubmitModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-filter backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-darkbg rounded-xl border border-gray-700 w-full max-w-md p-6">
            <div className="flex items-center justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-amber-600/30 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-amber-400" />
              </div>
            </div>

            <h2 className="text-xl font-semibold text-white text-center mb-2">Submit Exam?</h2>
            <p className="text-gray-300 text-center mb-6">
              You have answered {Object.keys(answers).length} out of {exam.totalQuestions} questions.
              {Object.keys(answers).length < exam.totalQuestions &&
                ` There are ${exam.totalQuestions - Object.keys(answers).length} unanswered questions.`}
            </p>

            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Continue Exam
              </button>
              <button
                onClick={handleSubmit}
                className="px-4 py-3 bg-gradient-to-r from-primary to-secondary hover:from-[#4be3b0] hover:to-[#008f5f] text-white rounded-lg text-sm font-medium flex items-center justify-center transition-all"
              >
                <Save className="h-4 w-4 mr-2" />
                Submit Exam
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamInterface;