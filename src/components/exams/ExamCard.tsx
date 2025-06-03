import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, HelpCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface Exam {
  id: string;
  title: string;
  date: string; // ISO string (e.g., "2025-08-15T14:30:00Z")
  duration: number;
  totalQuestions: number;
  description?: string;
  passingScore?: number;
}

interface ExamCardProps {
  exam: Exam;
  role: 'admin' | 'student';
}

const ExamCard: React.FC<ExamCardProps> = ({ exam, role }) => {
  const { isDark } = useTheme();
  console.log('ExamCard: Rendering for exam:', exam.id, 'title:', exam.title, 'role:', role, 'isDark:', isDark);

  const examDate = new Date(exam.date);
  console.log('ExamCard: Parsed exam date:', examDate.toISOString());
  const isValidDate = !isNaN(examDate.getTime());
  const formattedDate = isValidDate
    ? examDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : 'Invalid Date';
  const formattedTime = isValidDate
    ? examDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })
    : 'N/A';
  console.log('ExamCard: Formatted date:', formattedDate, 'time:', formattedTime);

  const isAdmin = role === 'admin';
  const isUpcoming = isValidDate && examDate > new Date();
  console.log('ExamCard: isAdmin:', isAdmin, 'isUpcoming:', isUpcoming);

  return (
    <div
      className={`rounded-xl border p-6 font-poppins backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 ${
        isDark
          ? 'bg-darkbg border-[#1f1f1f] hover:border-primary'
          : 'bg-light-bg border-gray-300 hover:border-primary'
      }`}
    >
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold font-glacial text-primary">{exam.title}</h3>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            isUpcoming
              ? 'bg-primary/10 text-primary'
              : isDark
              ? 'bg-[#2c2c2c] text-gray-400'
              : 'bg-gray-200 text-gray-600'
          }`}
        >
          {isUpcoming ? 'Upcoming' : 'Past'}
        </span>
      </div>

      <div className={`mt-4 space-y-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-2" />
          <span className="text-sm">
            {formattedDate} at {formattedTime}
          </span>
        </div>

        <div className="flex items-center">
          <Clock className="h-4 w-4 mr-2" />
          <span className="text-sm">{exam.duration} minutes</span>
        </div>

        <div className="flex items-center">
          <HelpCircle className="h-4 w-4 mr-2" />
          <span className="text-sm">{exam.totalQuestions} questions</span>
        </div>
      </div>

      <div className="mt-6">
        {isAdmin ? (
          <div className="flex space-x-3">
            <Link
              to={`/admin/exams/${exam.id}/edit`}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex-1 text-center transition-colors ${
                isDark ? 'bg-[#2c2c2c] hover:bg-[#3a3a3a] text-dark-text' : 'bg-gray-200 hover:bg-gray-300 text-light-text'
              }`}
              onClick={() => console.log('ExamCard: Navigating to edit exam:', exam.id)}
            >
              Edit
            </Link>
            <Link
              to={`/admin/exams/${exam.id}/results`}
              className="px-4 py-2 bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 text-darkbg rounded-lg text-sm font-medium flex-1 text-center transition-all"
              onClick={() => console.log('ExamCard: Navigating to exam results:', exam.id)}
            >
              Results
            </Link>
          </div>
        ) : isUpcoming ? (
          <Link
            to={`/student/exams/${exam.id}`}
            className="block w-full px-4 py-2 bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 text-darkbg rounded-lg text-sm font-medium text-center transition-all"
            onClick={() => console.log('ExamCard: Navigating to take exam:', exam.id)}
          >
            Take Exam
          </Link>
        ) : (
          <Link
            to={`/student/results/${exam.id}`}
            className={`block w-full px-4 py-2 rounded-lg text-sm font-medium text-center transition-colors ${
              isDark ? 'bg-[#2c2c2c] hover:bg-[#3a3a3a] text-dark-text' : 'bg-gray-200 hover:bg-gray-300 text-light-text'
            }`}
            onClick={() => console.log('ExamCard: Navigating to view results:', exam.id)}
          >
            View Results
          </Link>
        )}
      </div>
    </div>
  );
};

export default ExamCard;