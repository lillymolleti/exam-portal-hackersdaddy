// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { useAuth } from '../../context/AuthContext';
// import { useTheme } from '../../context/ThemeContext';
// import { getDocs, query, where, collection, doc, getDoc } from 'firebase/firestore';
// import { db } from '../../firebase';
// import { ArrowLeft} from 'lucide-react';
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// interface Exam {
//   id: string;
//   title: string;
//   totalQuestions: number;
//   passingScore: number;
// }

// interface Question {
//   id: string;
//   text: string;
//   type: string;
//   points: number;
//   options?: string[];
//   correctAnswer?: string | string[];
// }

// interface Result {
//   id: string;
//   examId: string;
//   userId: string;
//   score: number;
//   totalScore: number;
//   maxPoints: number;
//   answers: Array<{
//     questionId: string;
//     value: string | string[];
//     scoredPoints: number;
//     isCorrect: boolean;
//     needsManualGrading: boolean;
//     startTime?: string;
//     endTime?: string;
//   }>;
//   completedAt: string;
//   startTime?: string;
//   durationTaken?: number; // in seconds
//   passingScore: number;
// }

// const Results: React.FC = () => {
//   const { id } = useParams<{ id: string }>(); // Exam ID from URL
//   const { user } = useAuth();
//   const { isDark } = useTheme();
//   const navigate = useNavigate();
//   const [result, setResult] = useState<Result | null>(null);
//   const [exam, setExam] = useState<Exam | null>(null);
//   const [questions, setQuestions] = useState<Question[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string | null>(null);

//   useEffect(() => {
//     const fetchResultData = async () => {
//       setLoading(true);
//       setError(null);
//       try {
//         if (!user || !id) {
//           throw new Error('User not logged in or exam ID missing');
//         }

//         // Fetch result for this user and exam
//         const resultQuery = query(
//           collection(db, 'results'),
//           where('userId', '==', user.firebaseUser.uid),
//           where('examId', '==', id)
//         );
//         const resultSnapshot = await getDocs(resultQuery);
//         if (resultSnapshot.empty) {
//           throw new Error('Result not found for this exam.');
//         }
//         const resultData = resultSnapshot.docs[0].data();
//         const resultObj: Result = {
//           id: resultSnapshot.docs[0].id,
//           examId: resultData.examId,
//           userId: resultData.userId,
//           score: resultData.score,
//           totalScore: resultData.totalScore,
//           maxPoints: resultData.maxPoints,
//           answers: resultData.answers || [],
//           completedAt: resultData.completedAt,
//           startTime: resultData.startTime || '',
//           durationTaken: resultData.durationTaken || 0,
//           passingScore: resultData.passingScore || 50,
//         };
//         setResult(resultObj);

//         // Fetch exam details
//         const examRef = doc(db, 'exams', id);
//         const examSnap = await getDoc(examRef);
//         if (!examSnap.exists()) {
//           throw new Error('Exam not found');
//         }
//         const examData = examSnap.data();
//         const examObj: Exam = {
//           id: examSnap.id,
//           title: examData.title,
//           totalQuestions: examData.totalQuestions,
//           passingScore: examData.passingScore || 50,
//         };
//         setExam(examObj);

//         // Fetch exam questions for reference
//         const questionsSnapshot = await getDocs(collection(db, 'exams', id, 'questions'));
//         const questionsData: Question[] = questionsSnapshot.docs.map(doc => ({
//           id: doc.id,
//           text: doc.data().text,
//           type: doc.data().type,
//           points: doc.data().points,
//           options: doc.data().options || [],
//           correctAnswer: doc.data().correctAnswer || '',
//         }));
//         setQuestions(questionsData);

//         console.log('Results: Fetched result data:', resultObj);
//         console.log('Results: Fetched exam data:', examObj);
//         console.log('Results: Fetched questions:', questionsData.length);
//       } catch (err: any) {
//         console.error('Results: Error fetching result data:', err.message, 'Code:', err.code);
//         setError(err.message || 'Failed to load results. Please try again.');
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (user && id) {
//       fetchResultData();
//     } else {
//       setError('User not logged in or exam ID missing');
//       setLoading(false);
//     }
//   }, [user, id]);

//   const formatTime = (seconds: number): string => {
//     const minutes = Math.floor(seconds / 60);
//     const secs = seconds % 60;
//     return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
//   };

//   const calculateTimeSpent = (startTime?: string, endTime?: string): number => {
//     if (!startTime || !endTime) return 0;
//     const start = new Date(startTime).getTime();
//     const end = new Date(endTime).getTime();
//     return Math.round((end - start) / 1000); // in seconds
//   };

//   // Prepare data for bar chart (points per question)
//   const chartData = questions.map(q => {
//     const answer = result?.answers.find(a => a.questionId === q.id);
//     return {
//       question: `Q${questions.findIndex(q2 => q2.id === q.id) + 1}`,
//       scored: answer ? answer.scoredPoints : 0,
//       total: q.points,
//     };
//   });

//   if (loading) {
//     return <div className={`p-6 text-center font-poppins ${isDark ? 'bg-darkbg text-dark-text' : 'bg-light-bg text-light-text'}`}>Loading results...</div>;
//   }

//   if (error || !exam || !result) {
//     return (
//       <div className={`p-6 text-center font-poppins ${isDark ? 'bg-darkbg text-dark-error' : 'bg-light-bg text-light-error'}`}>
//         <p>{error || 'Results data not available.'}</p>
//         <button
//           onClick={() => navigate('/student/exams')}
//           className={`mt-4 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
//             isDark
//               ? 'bg-dark-neutral hover:bg-secondary/50 text-dark-text'
//               : 'bg-light-neutral hover:bg-secondary/30 text-light-text'
//           }`}
//         >
//           Back to Exams
//         </button>
//       </div>
//     );
//   }

//   const passed = result.score >= result.passingScore;

//   return (
//     <div className={`p-6 space-y-6 font-poppins ${isDark ? 'bg-darkbg text-dark-text' : 'bg-light-bg text-light-text'}`}>
//       <div className="flex justify-between items-center">
//         <h1 className="text-2xl font-bold font-glacial text-primary">Results for {exam.title}</h1>
//         <button
//           onClick={() => navigate('/student/exams')}
//           className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center transition-colors ${
//             isDark
//               ? 'bg-dark-neutral hover:bg-secondary/50 text-dark-text'
//               : 'bg-light-neutral hover:bg-secondary/30 text-light-text'
//           }`}
//         >
//           <ArrowLeft className="h-4 w-4 mr-1" /> Back to Exams
//         </button>
//       </div>

//       {/* Overview Card */}
//       <div className={`rounded-xl border p-6 backdrop-blur-sm ${
//         isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-100/50 border-gray-300'
//       }`}>
//         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
//           <div>
//             <h2 className="text-xl font-semibold text-primary">Exam Summary</h2>
//             <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Completed on {new Date(result.completedAt).toLocaleString()}</p>
//             {result.startTime && result.durationTaken && (
//               <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Time Taken: {formatTime(result.durationTaken)}</p>
//             )}
//           </div>
//           <div className={`flex items-center justify-center w-full md:w-auto p-4 rounded-lg ${
//             passed ? isDark ? 'bg-green-600/30' : 'bg-green-100' : isDark ? 'bg-red-600/30' : 'bg-red-100'
//           }`}>
//             <div className="text-center">
//               <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Overall Score</p>
//               <p className="text-3xl font-bold text-primary">{result.score}%</p>
//               <p className={`text-sm ${passed ? 'text-green-400' : 'text-red-400'}`}>
//                 {passed ? 'Passed' : 'Failed'} (Passing: {result.passingScore}%)
//               </p>
//               <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
//                 Total Points: {result.totalScore} / {result.maxPoints}
//               </p>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Performance Chart */}
//       <div className={`rounded-xl border p-6 backdrop-blur-sm ${
//         isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-100/50 border-gray-300'
//       }`}>
//         <h2 className="text-xl font-semibold text-primary mb-4">Points per Question</h2>
//         <div className="h-64">
//           <ResponsiveContainer width="100%" height="100%">
//             <BarChart data={chartData}>
//               <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#333' : '#ddd'} />
//               <XAxis dataKey="question" stroke={isDark ? '#fff' : '#000'} />
//               <YAxis stroke={isDark ? '#fff' : '#000'} />
//               <Tooltip contentStyle={isDark ? { backgroundColor: '#333', borderColor: '#444' } : undefined} />
//               <Bar dataKey="scored" name="Scored Points" fill="#5cffc9" />
//               <Bar dataKey="total" name="Total Points" fill={isDark ? "#444" : "#aaa"} />
//             </BarChart>
//           </ResponsiveContainer>
//         </div>
//       </div>

//       {/* Detailed Analysis per Question */}
//       <div className={`rounded-xl border p-6 backdrop-blur-sm ${
//         isDark ? 'bg-gray-800/50 border-gray-700' : 'bg-gray-100/50 border-gray-300'
//       }`}>
//         <h2 className="text-xl font-semibold text-primary mb-4">Detailed Breakdown</h2>
//         <div className="space-y-6">
//           {questions.map((q, index) => {
//             const answer = result.answers.find(a => a.questionId === q.id);
//             const status = questionStatuses.find(s => s.questionId === q.id);
//             const timeSpent = answer ? calculateTimeSpent(answer.startTime, answer.endTime) : 0;
//             const isCorrect = answer?.isCorrect;
//             const needsGrading = answer?.needsManualGrading;

//             return (
//               <div key={q.id} className={`p-4 rounded-lg border ${
//                 needsGrading
//                   ? isDark ? 'bg-amber-600/20 border-amber-700' : 'bg-amber-100 border-amber-200'
//                   : isCorrect
//                   ? isDark ? 'bg-green-600/20 border-green-700' : 'bg-green-100 border-green-200'
//                   : isDark ? 'bg-red-600/20 border-red-700' : 'bg-red-100 border-red-200'
//               }`}>
//                 <div className="flex justify-between items-start mb-2">
//                   <h3 className="text-lg font-medium text-primary">Question {index + 1} ({q.points} point{q.points !== 1 ? 's' : ''})</h3>
//                   <div className="flex items-center space-x-4">
//                     {needsGrading ? (
//                       <span className={`text-xs px-2 py-1 rounded-full font-medium ${isDark ? 'bg-amber-600/40 text-amber-300' : 'bg-amber-400/40 text-amber-700'}`}>
//                         Pending Grading
//                       </span>
//                     ) : isCorrect ? (
//                       <span className={`text-xs px-2 py-1 rounded-full font-medium ${isDark ? 'bg-green-600/40 text-green-300' : 'bg-green-400/40 text-green-700'}`}>
//                         Correct ({answer?.scoredPoints}/{q.points})
//                       </span>
//                     ) : (
//                       <span className={`text-xs px-2 py-1 rounded-full font-medium ${isDark ? 'bg-red-600/40 text-red-300' : 'bg-red-400/40 text-red-700'}`}>
//                         Incorrect ({answer?.scoredPoints}/{q.points})
//                       </span>
//                     )}
//                     {status?.markedForReview && (
//                       <Flag className="h-4 w-4 text-amber-400" title="Marked for Review" />
//                     )}
//                   </div>
//                 </div>
//                 <p className={`mb-2 ${isDark ? 'text-white' : 'text-black'}`}>{q.text}</p>
//                 {answer && (
//                   <div className="mt-2">
//                     <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Your Answer: {Array.isArray(answer.value) ? answer.value.join(', ') : answer.value || 'Not answered'}</p>
//                     {!answer.needsManualGrading && q.correctAnswer && (
//                       <p className={`text-sm ${isDark ? 'text-green-400' : 'text-green-600'}`}>Correct Answer: {Array.isArray(q.correctAnswer) ? q.correctAnswer.join(', ') : q.correctAnswer}</p>
//                     )}
//                     {answer.startTime && answer.endTime && timeSpent > 0 && (
//                       <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Time Spent: {formatTime(timeSpent)}</p>
//                     )}
//                   </div>
//                 )}
//               </div>
//             );
//           })}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default Results;