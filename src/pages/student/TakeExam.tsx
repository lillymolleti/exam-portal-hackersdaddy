import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { doc, getDoc, getDocs, collection, addDoc, query, where, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { X, Save, Clock, ChevronLeft, ChevronRight, Flag, AlertCircle, FileQuestion, CheckCircle } from 'lucide-react';

interface Exam {
  id: string;
  title: string;
  date: string; // ISO string
  duration: number; // in minutes
  totalQuestions: number;
  description?: string;
  passingScore?: number;
}

interface Question {
  id: string;
  text: string;
  type: 'singleChoice' | 'multipleChoice' | 'essay' | 'matching' | 'ordering';
  points: number;
  options?: string[];
  correctAnswer?: string | string[]; // For reference during scoring
}

interface Answer {
  questionId: string;
  value: string | string[] | ''; // Can be single answer, multiple answers, essay text, or ordered/matched pairs
}

interface QuestionStatus {
  questionId: string;
  answered: boolean;
  markedForReview: boolean;
}

const TakeExam: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Exam ID from URL
  const { user } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [exam, setExam] = useState<Exam | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [questionStatuses, setQuestionStatuses] = useState<QuestionStatus[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(0); // in seconds
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [hasSubmitted, setHasSubmitted] = useState<boolean>(false);
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState<boolean>(false);
  const [isSecondConfirmOpen, setIsSecondConfirmOpen] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const questionRefs = useRef<(HTMLDivElement | null)[]>([]); // For scrolling to questions

  useEffect(() => {
    const fetchExamData = async () => {
      setLoading(true);
      setError(null);
      try {
        if (!user || !id) {
          throw new Error('User not logged in or exam ID missing');
        }

        // Check if student has already taken the exam
        const resultsQuery = query(
          collection(db, 'results'),
          where('userId', '==', user.firebaseUser.uid),
          where('examId', '==', id)
        );
        const resultsSnapshot = await getDocs(resultsQuery);
        if (!resultsSnapshot.empty) {
          setError('You have already taken this exam. Check your results.');
          setLoading(false);
          setTimeout(() => navigate(`/student/results/${id}`), 2000);
          return;
        }

        // Check for active session (prevent multiple tabs or re-entry)
        const sessionQuery = query(
          collection(db, 'activeSessions'),
          where('userId', '==', user.firebaseUser.uid),
          where('examId', '==', id)
        );
        const sessionSnapshot = await getDocs(sessionQuery);
        if (!sessionSnapshot.empty) {
          setError('You have an active session for this exam. Cannot start again.');
          setLoading(false);
          setTimeout(() => navigate('/student/exams'), 2000);
          return;
        }

        // Fetch exam details
        const examRef = doc(db, 'exams', id);
        const examSnap = await getDoc(examRef);
        if (!examSnap.exists()) {
          throw new Error('Exam not found');
        }
        const examData = examSnap.data();
        const examObj: Exam = {
          id: examSnap.id,
          title: examData.title,
          date: examData.date,
          duration: examData.duration,
          totalQuestions: examData.totalQuestions,
          description: examData.description,
          passingScore: examData.passingScore || 50,
        };
        setExam(examObj);

        // Set timer based on duration
        setTimeLeft(examObj.duration * 60); // Convert minutes to seconds

        // Fetch exam questions
        const questionsSnapshot = await getDocs(collection(db, 'exams', id, 'questions'));
        const questionsData: Question[] = questionsSnapshot.docs.map(doc => ({
          id: doc.id,
          text: doc.data().text,
          type: doc.data().type,
          points: doc.data().points,
          options: doc.data().options || [],
          correctAnswer: doc.data().correctAnswer || '',
        }));
        setQuestions(questionsData);

        // Initialize answers and statuses array
        setAnswers(questionsData.map(q => ({ questionId: q.id, value: q.type === 'multipleChoice' || q.type === 'ordering' || q.type === 'matching' ? [] : '' })));
        setQuestionStatuses(questionsData.map(q => ({ questionId: q.id, answered: false, markedForReview: false })));

        // Create an active session in Firestore to track exam in progress
        await addDoc(collection(db, 'activeSessions'), {
          userId: user.firebaseUser.uid,
          examId: id,
          startTime: new Date().toISOString(),
          progress: 0,
          questionsAnswered: 0,
        });

        console.log('TakeExam: Fetched exam data:', examObj);
        console.log('TakeExam: Fetched questions:', questionsData.length);
      } catch (err: any) {
        console.error('TakeExam: Error fetching exam data:', err.message, 'Code:', err.code);
        setError(err.message || 'Failed to load exam. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (user && id) {
      fetchExamData();
    } else {
      setError('User not logged in or exam ID missing');
      setLoading(false);
    }
  }, [user, id, navigate]);

  useEffect(() => {
    if (timeLeft > 0 && !hasSubmitted && exam) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmitExam();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    } else if (timeLeft <= 0 && !hasSubmitted) {
      handleSubmitExam();
    }
  }, [timeLeft, hasSubmitted, exam]);

  const handleAnswerChange = (questionId: string, value: string | string[]) => {
    setAnswers(prev => prev.map(a => 
      a.questionId === questionId ? { ...a, value } : a
    ));
    // Update answered status
    setQuestionStatuses(prev => prev.map(s => {
      if (s.questionId === questionId) {
        const isAnswered = Array.isArray(value) ? value.length > 0 : value !== '';
        return { ...s, answered: isAnswered };
      }
      return s;
    }));
    console.log('TakeExam: Answer updated for question:', questionId, 'value:', value);
  };

  const toggleMarkForReview = (questionId: string) => {
    setQuestionStatuses(prev => prev.map(s => 
      s.questionId === questionId ? { ...s, markedForReview: !s.markedForReview } : s
    ));
    console.log('TakeExam: Toggled mark for review for question:', questionId);
  };

  const navigateToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
    if (questionRefs.current[index]) {
      questionRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    console.log('TakeExam: Navigated to question index:', index);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      navigateToQuestion(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      navigateToQuestion(currentQuestionIndex - 1);
    }
  };

  const handleSubmitExam = async () => {
    if (hasSubmitted || isSubmitting || !exam) return;
    setIsSubmitting(true);
    console.log('TakeExam: Submitting exam answers for exam:', exam.id);

    try {
      let totalScore = 0;
      questions.forEach(q => {
        const answer = answers.find(a => a.questionId === q.id);
        if (!answer) return;
        if (q.type === 'singleChoice') {
          if (answer.value === q.correctAnswer) {
            totalScore += q.points;
          }
        } else if (q.type === 'multipleChoice') {
          const userAnswers = Array.isArray(answer.value) ? answer.value : [];
          const correctAnswers = Array.isArray(q.correctAnswer) ? q.correctAnswer : [];
          if (userAnswers.length === correctAnswers.length && userAnswers.every(a => correctAnswers.includes(a))) {
            totalScore += q.points;
          }
        } else if (q.type === 'ordering') {
          const userOrder = Array.isArray(answer.value) ? answer.value : [];
          const correctOrder = Array.isArray(q.correctAnswer) ? q.correctAnswer : [];
          if (userOrder.length === correctOrder.length && userOrder.every((val, idx) => val === correctOrder[idx])) {
            totalScore += q.points;
          }
        } else if (q.type === 'matching') {
          const userPairs = Array.isArray(answer.value) ? answer.value : [];
          const correctPairs = Array.isArray(q.correctAnswer) ? q.correctAnswer : [];
          if (userPairs.length === correctPairs.length && userPairs.every((val, idx) => val === correctPairs[idx])) {
            totalScore += q.points;
          }
        } // Essay questions assumed unscored for now (manual grading)
      });
      const maxPoints = questions.reduce((sum, q) => sum + q.points, 0);
      const percentageScore = maxPoints > 0 ? Math.round((totalScore / maxPoints) * 100) : 0;

      // Save result to Firestore
      await addDoc(collection(db, 'results'), {
        userId: user?.firebaseUser.uid,
        examId: exam.id,
        score: percentageScore,
        answers: answers,
        completedAt: new Date().toISOString(),
        passingScore: exam.passingScore || 50,
      });

      // Clean up active session
      const sessionQuery = query(
        collection(db, 'activeSessions'),
        where('userId', '==', user?.firebaseUser.uid),
        where('examId', '==', exam.id)
      );
      const sessionSnapshot = await getDocs(sessionQuery);
      sessionSnapshot.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });

      console.log('TakeExam: Exam submitted successfully, score:', percentageScore);
      setHasSubmitted(true);
      setTimeout(() => navigate(`/student/results/${exam.id}`), 2000);
    } catch (err: any) {
      console.error('TakeExam: Error submitting exam:', err.message, 'Code:', err.code);
      setError('Failed to submit exam. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitWithConfirm = () => {
    setIsSubmitModalOpen(true);
  };

  const handleFirstConfirm = () => {
    setIsSubmitModalOpen(false);
    setIsSecondConfirmOpen(true);
  };

  const handleSecondConfirm = () => {
    setIsSecondConfirmOpen(false);
    handleSubmitExam();
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculate summary for exam status
  const answeredCount = questionStatuses.filter(s => s.answered).length;
  const markedForReviewCount = questionStatuses.filter(s => s.markedForReview).length;
  const unansweredCount = questions.length - answeredCount;

  if (loading) {
    return <div className={`p-6 text-center font-poppins ${isDark ? 'bg-darkbg text-dark-text' : 'bg-light-bg text-light-text'}`}>Loading exam...</div>;
  }

  if (error || !exam) {
    return (
      <div className={`p-6 text-center font-poppins ${isDark ? 'bg-darkbg text-dark-error' : 'bg-light-bg text-light-error'}`}>
        <p>{error || 'Exam data not available.'}</p>
        <button
          onClick={() => navigate('/student/exams')}
          className={`mt-4 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            isDark
              ? 'bg-dark-neutral hover:bg-secondary/50 text-dark-text'
              : 'bg-light-neutral hover:bg-secondary/30 text-light-text'
          }`}
        >
          Back to Exams
        </button>
      </div>
    );
  }

  if (hasSubmitted) {
    return (
      <div className={`p-6 text-center font-poppins ${isDark ? 'bg-darkbg text-dark-text' : 'bg-light-bg text-light-text'}`}>
        <h2 className="text-xl font-semibold text-primary mb-2">Exam Submitted!</h2>
        <p className="text-sm">Your answers have been recorded. Redirecting to results...</p>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  const renderQuestion = () => {
    if (!currentQuestion) return null;

    const answer = answers.find(a => a.questionId === currentQuestion.id)?.value || '';
    switch (currentQuestion.type) {
      case 'singleChoice':
        return (
          <div className="space-y-4">
            <p className={`text-lg font-medium ${isDark ? 'text-white' : 'text-black'} whitespace-pre-line`}>{currentQuestion.text}</p>
            <div className="space-y-3 mt-4">
              {currentQuestion.options?.map((option, index) => (
                <label
                  key={index}
                  className={`flex items-start space-x-3 p-3 rounded-lg border hover:border-primary/70 cursor-pointer transition-colors ${
                    isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-100/50 border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${currentQuestion.id}`}
                    value={option}
                    checked={answer === option}
                    onChange={() => handleAnswerChange(currentQuestion.id, option)}
                    className="mt-1 h-4 w-4 text-primary focus:ring-primary border-gray-700 bg-gray-900"
                  />
                  <span className={isDark ? 'text-white' : 'text-black'}>{option}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'multipleChoice':
        return (
          <div className="space-y-4">
            <p className={`text-lg font-medium ${isDark ? 'text-white' : 'text-black'} whitespace-pre-line`}>{currentQuestion.text}</p>
            <div className="space-y-3 mt-4">
              {currentQuestion.options?.map((option, index) => (
                <label
                  key={index}
                  className={`flex items-start space-x-3 p-3 rounded-lg border hover:border-primary/70 cursor-pointer transition-colors ${
                    isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-100/50 border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={Array.isArray(answer) && answer.includes(option)}
                    onChange={() => {
                      const currentValues = Array.isArray(answer) ? answer : [];
                      const newValues = currentValues.includes(option)
                        ? currentValues.filter(v => v !== option)
                        : [...currentValues, option];
                      handleAnswerChange(currentQuestion.id, newValues);
                    }}
                    className="mt-1 h-4 w-4 text-primary focus:ring-primary border-gray-700 bg-gray-900 rounded"
                  />
                  <span className={isDark ? 'text-white' : 'text-black'}>{option}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case 'essay':
        return (
          <div className="space-y-4">
            <p className={`text-lg font-medium ${isDark ? 'text-white' : 'text-black'} whitespace-pre-line`}>{currentQuestion.text}</p>
            <textarea
              value={answer as string}
              onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
              className={`w-full h-40 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                isDark
                  ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
                  : 'bg-gray-50 border-gray-300 text-black placeholder-gray-500'
              }`}
              placeholder="Type your answer here..."
            />
          </div>
        );

      case 'matching':
        return (
          <div className="space-y-4">
            <p className={`text-lg font-medium ${isDark ? 'text-white' : 'text-black'} whitespace-pre-line`}>{currentQuestion.text}</p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
              <div className="space-y-3">
                <h4 className={`font-medium ${isDark ? 'text-primary' : 'text-primary'}`}>Left Side</h4>
                {currentQuestion.options?.slice(0, Math.ceil((currentQuestion.options?.length || 0) / 2)).map((leftItem, leftIndex) => (
                  <div key={leftIndex} className={`p-3 rounded-lg border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-100/50 border-gray-300'}`}>
                    <p className={isDark ? 'text-white' : 'text-black'}>{leftItem}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <h4 className={`font-medium ${isDark ? 'text-primary' : 'text-primary'}`}>Right Side (Match)</h4>
                {currentQuestion.options?.slice(0, Math.ceil((currentQuestion.options?.length || 0) / 2)).map((_, index) => (
                  <div key={index} className={`p-3 rounded-lg border ${isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-100/50 border-gray-300'}`}>
                    <select
                      value={Array.isArray(answer) && answer[index] ? answer[index] : ''}
                      onChange={(e) => {
                        const currentPairs = Array.isArray(answer) ? [...answer] : Array(currentQuestion.options?.length || 0).fill('');
                        currentPairs[index] = e.target.value;
                        handleAnswerChange(currentQuestion.id, currentPairs);
                      }}
                      className={`w-full border rounded focus:outline-none focus:ring-2 focus:ring-primary ${
                        isDark ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300 text-black'
                      }`}
                    >
                      <option value="">-- Select match --</option>
                      {currentQuestion.options?.slice(Math.ceil((currentQuestion.options?.length || 0) / 2)).map((rightItem, rightIndex) => (
                        <option key={rightIndex} value={rightItem} disabled={Array.isArray(answer) && answer.includes(rightItem) && answer[index] !== rightItem}>
                          {rightItem}
                        </option>
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
            <p className={`text-lg font-medium ${isDark ? 'text-white' : 'text-black'} whitespace-pre-line`}>{currentQuestion.text}</p>
            <div className="space-y-3 mt-4">
              {currentQuestion.options?.map((option, index) => (
                <div key={index} className={`flex items-center p-3 rounded-lg border ${
                  isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-100/50 border-gray-300'
                }`}>
                  <div className="flex-1">
                    <p className={isDark ? 'text-white' : 'text-black'}>{option}</p>
                  </div>
                  <select
                    value={Array.isArray(answer) && answer[index] ? answer[index] : ''}
                    onChange={(e) => {
                      const currentOrder = Array.isArray(answer) ? [...answer] : Array(currentQuestion.options?.length || 0).fill('');
                      currentOrder[index] = e.target.value;
                      handleAnswerChange(currentQuestion.id, currentOrder);
                    }}
                    className={`bg-gray-900 border-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent ${
                      isDark ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-300 text-black'
                    }`}
                  >
                    <option value="">--</option>
                    {Array.from({ length: currentQuestion.options?.length || 1 }, (_, i) => i + 1).map(pos => (
                      <option key={pos} value={option} disabled={Array.isArray(answer) && answer.includes(option) && answer[index] !== option}>
                        Position {pos}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>Unsupported question type</p>;
    }
  };

  const getQuestionStatus = (index: number) => {
    const question = questions[index];
    const status = questionStatuses.find(s => s.questionId === question.id);
    const isCurrent = index === currentQuestionIndex;

    if (isCurrent) return 'current';
    if (status?.markedForReview) return 'marked';
    if (status?.answered) return 'answered';
    return 'unanswered';
  };

  return (
    <div className="h-full flex flex-col font-poppins">
      {/* Exam Header */}
      <div className={`border-b p-4 backdrop-blur-sm ${
        isDark ? 'bg-gray-800/70 border-gray-700' : 'bg-gray-200/70 border-gray-300'
      }`}>
        <div className="flex flex-wrap justify-between items-center">
          <div>
            <h1 className={`text-xl font-semibold font-glacial ${isDark ? 'text-white' : 'text-black'}`}>{exam.title}</h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Question {currentQuestionIndex + 1} of {exam.totalQuestions}
            </p>
          </div>
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-primary mr-2" />
              <span className={`font-bold ${timeLeft < 300 ? 'text-red-400' : isDark ? 'text-white' : 'text-black'}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
            <button
              onClick={handleSubmitWithConfirm}
              disabled={isSubmitting}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isSubmitting
                  ? 'bg-gray-500 cursor-not-allowed text-gray-300'
                  : 'bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 text-darkbg'
              }`}
            >
              Submit Exam
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Question Navigator Sidebar */}
        <div className={`w-full md:w-64 lg:w-80 border-r p-4 overflow-y-auto backdrop-blur-sm ${
          isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-100/50 border-gray-300'
        }`}>
          <h2 className={`text-lg font-medium font-glacial mb-4 ${isDark ? 'text-white' : 'text-black'}`}>Question Navigator</h2>
          <div className="grid grid-cols-5 gap-2">
            {questions.map((_, index) => {
              const status = getQuestionStatus(index);
              return (
                <button
                  key={index}
                  onClick={() => navigateToQuestion(index)}
                  className={`h-10 w-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all
                    ${status === 'current' ? isDark ? 'bg-primary/60 text-white ring-2 ring-primary/40' : 'bg-primary/50 text-darkbg ring-2 ring-primary/30' : ''}
                    ${status === 'marked' ? isDark ? 'bg-amber-600/60 text-white' : 'bg-amber-400/60 text-amber-800' : ''}
                    ${status === 'answered' ? isDark ? 'bg-green-600/60 text-white' : 'bg-green-400/60 text-green-800' : ''}
                    ${status === 'unanswered' ? isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-300 text-gray-600' : ''}
                  `}
                >
                  {index + 1}
                </button>
              );
            })}
          </div>
          <div className="mt-6 space-y-3">
            <div className="flex items-center space-x-2">
              <div className={`h-4 w-4 rounded-sm ${isDark ? 'bg-primary/60' : 'bg-primary/50'}`}></div>
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Current Question</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`h-4 w-4 rounded-sm ${isDark ? 'bg-green-600/60' : 'bg-green-400/60'}`}></div>
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Answered</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`h-4 w-4 rounded-sm ${isDark ? 'bg-amber-600/60' : 'bg-amber-400/60'}`}></div>
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Marked for Review</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className={`h-4 w-4 rounded-sm ${isDark ? 'bg-gray-700' : 'bg-gray-300'}`}></div>
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Unanswered</span>
            </div>
          </div>
          <div className="mt-6">
            <h3 className={`text-md font-medium mb-2 ${isDark ? 'text-white' : 'text-black'}`}>Exam Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Total Questions:</span>
                <span className={isDark ? 'text-white' : 'text-black'}>{exam.totalQuestions}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Answered:</span>
                <span className={isDark ? 'text-white' : 'text-black'}>{answeredCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Marked for Review:</span>
                <span className={isDark ? 'text-white' : 'text-black'}>{markedForReviewCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Unanswered:</span>
                <span className={isDark ? 'text-white' : 'text-black'}>{unansweredCount}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Question Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center">
                <FileQuestion className="h-6 w-6 text-primary mr-2" />
                <h2 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-black'}`}>
                  Question {currentQuestionIndex + 1}
                </h2>
              </div>
              <button
                onClick={() => toggleMarkForReview(currentQuestion.id)}
                className={`flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  questionStatuses.find(s => s.questionId === currentQuestion.id)?.markedForReview
                    ? isDark
                      ? 'bg-amber-600/60 text-white'
                      : 'bg-amber-400/60 text-amber-800'
                    : isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-amber-600/40'
                    : 'bg-gray-300 text-gray-600 hover:bg-amber-400/40'
                }`}
              >
                <Flag className="h-4 w-4 mr-1" />
                {questionStatuses.find(s => s.questionId === currentQuestion.id)?.markedForReview ? 'Marked' : 'Mark for Review'}
              </button>
            </div>

            {/* Question Content */}
            <div className={`rounded-xl border p-6 mb-6 backdrop-blur-sm ${
              isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-100/50 border-gray-300'
            }`}>
              {renderQuestion()}
            </div>

            {/* Question Navigation */}
            <div className="flex justify-between">
              <button
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  currentQuestionIndex === 0
                    ? 'bg-gray-500 text-gray-400 cursor-not-allowed'
                    : isDark
                    ? 'bg-gray-700 text-white hover:bg-gray-600'
                    : 'bg-gray-300 text-black hover:bg-gray-400'
                }`}
              >
                <ChevronLeft className="h-5 w-5 mr-1" />
                Previous
              </button>
              <button
                onClick={() => toggleMarkForReview(currentQuestion.id)}
                className={`hidden md:flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  questionStatuses.find(s => s.questionId === currentQuestion.id)?.markedForReview
                    ? isDark
                      ? 'bg-amber-600/60 text-white'
                      : 'bg-amber-400/60 text-amber-800'
                    : isDark
                    ? 'bg-gray-700 text-white hover:bg-amber-600/40'
                    : 'bg-gray-300 text-black hover:bg-amber-400/40'
                }`}
              >
                <Flag className="h-5 w-5 mr-1" />
                {questionStatuses.find(s => s.questionId === currentQuestion.id)?.markedForReview ? 'Unmark' : 'Mark for Review'}
              </button>
              <button
                onClick={() => {
                  if (currentQuestionIndex === questions.length - 1) {
                    setIsSubmitModalOpen(true);
                  } else {
                    handleNext();
                  }
                }}
                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  isSubmitting
                    ? 'bg-gray-500 cursor-not-allowed text-gray-300'
                    : 'bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 text-darkbg'
                }`}
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

      {/* First Submit Confirmation Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-filter backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`rounded-xl border w-full max-w-md p-6 ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
          }`}>
            <div className="flex items-center justify-center mb-4">
              <div className={`h-16 w-16 rounded-full flex items-center justify-center ${
                isDark ? 'bg-amber-600/30' : 'bg-amber-100'
              }`}>
                <AlertCircle className="h-8 w-8 text-amber-400" />
              </div>
            </div>
            <h2 className={`text-xl font-semibold text-center mb-2 ${isDark ? 'text-white' : 'text-black'}`}>Submit Exam?</h2>
            <p className={`text-center mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              You have answered {answeredCount} out of {exam.totalQuestions} questions.
              {unansweredCount > 0 && ` There are ${unansweredCount} unanswered questions.`}
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-black'
                }`}
              >
                Continue Exam
              </button>
              <button
                onClick={handleFirstConfirm}
                className="px-4 py-3 bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 text-darkbg rounded-lg text-sm font-medium flex items-center justify-center transition-all"
              >
                <Save className="h-4 w-4 mr-2" />
                Submit Exam
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Second Submit Confirmation Modal */}
      {isSecondConfirmOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-filter backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className={`rounded-xl border w-full max-w-md p-6 ${
            isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'
          }`}>
            <div className="flex items-center justify-center mb-4">
              <div className={`h-16 w-16 rounded-full flex items-center justify-center ${
                isDark ? 'bg-amber-600/30' : 'bg-amber-100'
              }`}>
                <AlertCircle className="h-8 w-8 text-amber-400" />
              </div>
            </div>
            <h2 className={`text-xl font-semibold text-center mb-2 ${isDark ? 'text-white' : 'text-black'}`}>Are You Sure?</h2>
            <p className={`text-center mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              This action cannot be undone. Are you absolutely sure you want to submit your exam now?
            </p>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setIsSecondConfirmOpen(false)}
                className={`px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  isDark ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-black'
                }`}
              >
                Cancel
              </button>
              <button
                onClick={handleSecondConfirm}
                className="px-4 py-3 bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 text-darkbg rounded-lg text-sm font-medium flex items-center justify-center transition-all"
              >
                <Save className="h-4 w-4 mr-2" />
                Confirm Submission
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TakeExam;