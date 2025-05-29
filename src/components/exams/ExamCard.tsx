import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, HelpCircle } from 'lucide-react';

interface Exam {
  id: string;
  title: string;
  date: string;
  duration: number;
  totalQuestions: number;
}

interface ExamCardProps {
  exam: Exam;
  role: 'admin' | 'student';
}

const ExamCard: React.FC<ExamCardProps> = ({ exam, role }) => {
  const formattedDate = new Date(exam.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const isAdmin = role === 'admin';
  const isUpcoming = new Date(exam.date) > new Date();

  return (
    <div className="bg-darkbg rounded-xl border border-[#1f1f1f] hover:border-primary p-6 font-poppins backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold text-white">{exam.title}</h3>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            isUpcoming
              ? 'bg-primary/10 text-primary'
              : 'bg-[#2c2c2c] text-gray-400'
          }`}
        >
          {isUpcoming ? 'Upcoming' : 'Past'}
        </span>
      </div>

      <div className="mt-4 space-y-3 text-gray-300">
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-2" />
          <span className="text-sm">{formattedDate}</span>
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
              className="px-4 py-2 bg-[#2c2c2c] hover:bg-[#3a3a3a] text-white rounded-lg text-sm font-medium flex-1 text-center transition-colors"
            >
              Edit
            </Link>
            <Link
              to={`/admin/exams/${exam.id}/results`}
              className="px-4 py-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-black rounded-lg text-sm font-medium flex-1 text-center transition-all"
            >
              Results
            </Link>
          </div>
        ) : isUpcoming ? (
          <Link
            to={`/student/exams/${exam.id}`}
            className="block w-full px-4 py-2 bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-black rounded-lg text-sm font-medium text-center transition-all"
          >
            Take Exam
          </Link>
        ) : (
          <Link
            to={`/student/results/${exam.id}`}
            className="block w-full px-4 py-2 bg-[#2c2c2c] hover:bg-[#3a3a3a] text-white rounded-lg text-sm font-medium text-center transition-colors"
          >
            View Results
          </Link>
        )}
      </div>
    </div>
  );
};

export default ExamCard;
