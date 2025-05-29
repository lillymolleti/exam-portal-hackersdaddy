import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronLeft, 
  ChevronRight, 
  Flag, 
  Clock, 
  CheckCircle,
  AlertCircle,
  FileQuestion,
  Save
} from 'lucide-react';

// Mock data for the exam questions
const mockQuestions = [
  {
    id: '1',
    text: 'What is the main purpose of the useEffect hook in React?',
    options: [
      'To create side effects in functional components',
      'To manage state in class components',
      'To optimize rendering performance',
      'To handle form submissions'
    ],
    type: 'singleChoice',
    correct: 0,
  },
  {
    id: '2',
    text: 'Which of the following are valid ways to create a React component? (Select all that apply)',
    options: [
      'Function declaration',
      'Arrow function',
      'Class extending React.Component',
      'Object literal'
    ],
    type: 'multipleChoice',
    correct: [0, 1, 2],
  },
  {
    id: '3',
    text: 'Explain the concept of React\'s virtual DOM and how it improves performance.',
    type: 'essay',
    correct: null,
  },
  {
    id: '4',
    text: 'What is the output of the following code?\n\n```javascript\nconst numbers = [1, 2, 3, 4, 5];\nconst doubled = numbers.map(num => num * 2);\nconsole.log(doubled);\n```',
    options: [
      '[2, 4, 6, 8, 10]',
      '[1, 4, 9, 16, 25]',
      '[1, 2, 3, 4, 5, 1, 2, 3, 4, 5]',
      'Error'
    ],
    type: 'singleChoice',
    correct: 0,
  },
  {
    id: '5',
    text: 'Fill in the missing code to create a proper React functional component:\n\n```jsx\n___ CounterComponent() {\n  const [count, setCount] = useState(0);\n  \n  return (\n    <div>\n      <p>Count: {count}</p>\n      <button onClick={() => setCount(count + 1)}>Increment</button>\n    </div>\n  );\n}\n```',
    options: [
      'function',
      'const',
      'class',
      'var'
    ],
    type: 'singleChoice',
    correct: 0,
  },
  {
    id: '6',
    text: 'What is the purpose of React.memo?',
    options: [
      'To memoize expensive calculations in components',
      'To prevent unnecessary re-renders of functional components',
      'To memorize state values between renders',
      'To create a reference to DOM elements'
    ],
    type: 'singleChoice',
    correct: 1,
  },
  {
    id: '7',
    text: 'Match the following hooks with their primary use cases:',
    matchPairs: [
      { left: 'useState', right: 'State management' },
      { left: 'useEffect', right: 'Side effects' },
      { left: 'useContext', right: 'Access context values' },
      { left: 'useRef', right: 'Persistent mutable values' }
    ],
    type: 'matching',
    correct: [0, 1, 2, 3],
  },
  {
    id: '8',
    text: 'Arrange the following lifecycle phases in the correct order:',
    options: [
      'Mounting',
      'Updating',
      'Error Handling',
      'Unmounting'
    ],
    type: 'ordering',
    correct: [0, 1, 3, 2],
  },
  {
    id: '9',
    text: 'What is the purpose of React.lazy() and Suspense?',
    options: [
      'To load components asynchronously and handle loading states',
      'To implement lazy evaluation of props',
      'To suspend component updates',
      'To implement server-side rendering'
    ],
    type: 'singleChoice',
    correct: 0,
  },
  {
    id: '10',
    text: 'Write a custom hook called useLocalStorage that syncs state with localStorage.',
    type: 'essay',
    correct: null,
  }
];

const ExamInterface: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: any }>({});
  const [markedQuestions, setMarkedQuestions] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState(3600); // 60 minutes in seconds
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  
  // Mock exam data
  const examData = {
    title: 'Web Development Fundamentals',
    duration: 60, // minutes
    totalQuestions: mockQuestions.length,
  };
  
  useEffect(() => {
    // Timer logic
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  const currentQuestion = mockQuestions[currentQuestionIndex];
  
  const handleNext = () => {
    if (currentQuestionIndex < mockQuestions.length - 1) {
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
    if (markedQuestions.includes(questionId)) {
      setMarkedQuestions(markedQuestions.filter(id => id !== questionId));
    } else {
      setMarkedQuestions([...markedQuestions, questionId]);
    }
  };
  
  const handleAnswerChange = (value: any) => {
    setAnswers({
      ...answers,
      [currentQuestion.id]: value,
    });
  };
  
  const handleSubmit = () => {
    // In a real app, would send answers to server
    navigate(`/student/results/${examId}`);
  };
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const getQuestionStatus = (index: number) => {
    const question = mockQuestions[index];
    const isAnswered = answers[question.id] !== undefined;
    const isMarked = markedQuestions.includes(question.id);
    const isCurrent = index === currentQuestionIndex;
    
    if (isCurrent) return 'current';
    if (isMarked) return 'marked';
    if (isAnswered) return 'answered';
    return 'unanswered';
  };
  
  const renderQuestion = () => {
    const question = currentQuestion;
    const answer = answers[question.id];
    
    switch (question.type) {
      case 'singleChoice':
        return (
          <div className="space-y-4">
            <p className="text-lg font-medium text-white whitespace-pre-line">{question.text}</p>
            <div className="space-y-3 mt-4">
              {question.options.map((option, index) => (
                <label key={index} className="flex items-start space-x-3 p-3 rounded-lg border border-gray-700 hover:border-[#5cffc9] bg-[#121212] cursor-pointer transition-colors">
                  <input
                    type="radio"
                    name={`question-${question.id}`}
                    checked={answer === index}
                    onChange={() => handleAnswerChange(index)}
                    className="mt-1 h-4 w-4 text-[#5cffc9] focus:ring-[#5cffc9] border-gray-700 bg-[#121212]"
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
              {question.options.map((option, index) => (
                <label key={index} className="flex items-start space-x-3 p-3 rounded-lg border border-gray-700 hover:border-[#5cffc9] bg-[#121212] cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={answer?.includes(index)}
                    onChange={() => {
                      const current = answer || [];
                      const updated = current.includes(index)
                        ? current.filter(i => i !== index)
                        : [...current, index];
                      handleAnswerChange(updated);
                    }}
                    className="mt-1 h-4 w-4 text-[#5cffc9] focus:ring-[#5cffc9] border-gray-700 bg-[#121212] rounded"
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
              className="w-full h-40 p-3 bg-[#121212] border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#5cffc9] focus:border-transparent"
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
                {question.matchPairs.map((pair, index) => (
                  <div key={index} className="p-3 rounded-lg border border-gray-700 bg-[#121212]">
                    <p className="text-white">{pair.left}</p>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                {question.matchPairs.map((pair, index) => (
                  <div key={index} className="p-3 rounded-lg border border-gray-700 bg-[#121212]">
                    <select
                      value={answer?.[index] ?? ''}
                      onChange={(e) => {
                        const current = answer || Array(question.matchPairs.length).fill('');
                        const updated = [...current];
                        updated[index] = parseInt(e.target.value);
                        handleAnswerChange(updated);
                      }}
                      className="w-full bg-[#121212] border-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-[#5cffc9] focus:border-transparent"
                    >
                      <option value="">-- Select match --</option>
                      {question.matchPairs.map((p, i) => (
                        <option key={i} value={i}>{p.right}</option>
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
              {question.options.map((option, index) => (
                <div key={index} className="flex items-center p-3 rounded-lg border border-gray-700 bg-[#121212]">
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
                    className="bg-[#121212] border-gray-700 rounded text-white focus:outline-none focus:ring-2 focus:ring-[#5cffc9] focus:border-transparent"
                  >
                    <option value="">--</option>
                    {question.options.map((_, i) => (
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
  
  return (
    <div className="h-full flex flex-col">
      {/* Exam header */}
      <div className="bg-[#121212] border-b border-gray-700 p-4 backdrop-blur-sm">
        <div className="flex flex-wrap justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold text-white">{examData.title}</h1>
            <p className="text-gray-400 text-sm">
              Question {currentQuestionIndex + 1} of {examData.totalQuestions}
            </p>
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-[#5cffc9] mr-2" />
              <span className={`font-bold ${timeLeft < 300 ? 'text-red-400' : 'text-white'}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
            
            <button
              onClick={() => setIsSubmitModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-[#5cffc9] to-[#00ac76] hover:from-[#4be3b0] hover:to-[#008f5f] text-white rounded-lg text-sm font-medium transition-all"
            >
              Submit Exam
            </button>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Question list sidebar */}
        <div className="w-full md:w-64 lg:w-80 bg-[#121212] border-r border-gray-700 p-4 overflow-y-auto backdrop-blur-sm">
          <h2 className="text-lg font-medium text-white mb-4">Question Navigator</h2>
          
          <div className="grid grid-cols-5 gap-2">
            {mockQuestions.map((question, index) => {
              const status = getQuestionStatus(index);
              
              return (
                <button
                  key={question.id}
                  onClick={() => handleJumpToQuestion(index)}
                  className={`h-10 w-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all
                    ${status === 'current' ? 'bg-[#5cffc9] text-black ring-2 ring-[#4be3b0]' : ''}
                    ${status === 'marked' ? 'bg-amber-600/60 text-white' : ''}
                    ${status === 'answered' ? 'bg-[#00ac76]/60 text-white' : ''}
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
              <div className="h-4 w-4 rounded-sm bg-[#5cffc9]"></div>
              <span className="text-sm text-gray-300">Current Question</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-4 w-4 rounded-sm bg-[#00ac76]/60"></div>
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
                <span className="text-white">{examData.totalQuestions}</span>
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
                <span className="text-white">{examData.totalQuestions - Object.keys(answers).length}</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Question content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-3xl mx-auto">
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center">
                <FileQuestion className="h-6 w-6 text-[#5cffc9] mr-2" />
                <h2 className="text-lg font-semibold text-white">
                  Question {currentQuestionIndex + 1}
                </h2>
              </div>
              
              <button
                onClick={() => handleToggleMarked(currentQuestion.id)}
                className={`flex items-center px-3 py-1.5 rounded-lg text-sm font-medium ${
                  markedQuestions.includes(currentQuestion.id)
                    ? 'bg-amber-600/60 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-amber-600/40'
                } transition-colors`}
              >
                <Flag className="h-4 w-4 mr-1" />
                {markedQuestions.includes(currentQuestion.id) ? 'Marked' : 'Mark for Review'}
              </button>
            </div>
            
            {/* Question content */}
            <div className="bg-[#121212] rounded-xl border border-gray-700 p-6 mb-6 backdrop-blur-sm">
              {renderQuestion()}
            </div>
            
            {/* Question navigation */}
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
                onClick={() => handleToggleMarked(currentQuestion.id)}
                className={`hidden md:flex items-center px-4 py-2 rounded-lg text-sm font-medium ${
                  markedQuestions.includes(currentQuestion.id)
                    ? 'bg-amber-600/60 text-white'
                    : 'bg-gray-700 text-white hover:bg-amber-600/40'
                } transition-colors`}
              >
                <Flag className="h-5 w-5 mr-1" />
                {markedQuestions.includes(currentQuestion.id) ? 'Unmark' : 'Mark for Review'}
              </button>
              
              <button
                onClick={() => {
                  // Auto-save the current answer (in a real app)
                  if (currentQuestionIndex === mockQuestions.length - 1) {
                    setIsSubmitModalOpen(true);
                  } else {
                    handleNext();
                  }
                }}
                className="flex items-center px-4 py-2 bg-gradient-to-r from-[#5cffc9] to-[#00ac76] hover:from-[#4be3b0] hover:to-[#008f5f] text-white rounded-lg text-sm font-medium transition-all"
              >
                {currentQuestionIndex === mockQuestions.length - 1 ? (
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
      
      {/* Submit Confirmation Modal */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-filter backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-[#121212] rounded-xl border border-gray-700 w-full max-w-md p-6">
            <div className="flex items-center justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-amber-600/30 flex items-center justify-center">
                <AlertCircle className="h-8 w-8 text-amber-400" />
              </div>
            </div>
            
            <h2 className="text-xl font-semibold text-white text-center mb-2">
              Submit Exam?
            </h2>
            <p className="text-gray-300 text-center mb-6">
              You have answered {Object.keys(answers).length} out of {examData.totalQuestions} questions.
              {Object.keys(answers).length < examData.totalQuestions && 
                ` There are ${examData.totalQuestions - Object.keys(answers).length} unanswered questions.`}
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
                className="px-4 py-3 bg-gradient-to-r from-[#5cffc9] to-[#00ac76] hover:from-[#4be3b0] hover:to-[#008f5f] text-white rounded-lg text-sm font-medium flex items-center justify-center transition-all"
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