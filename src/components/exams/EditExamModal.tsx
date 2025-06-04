import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, HelpCircle, Save } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';

interface Exam {
  id: string;
  title: string;
  date: string; // ISO string
  duration: number;
  totalQuestions: number;
  description?: string;
  passingScore?: number;
}

interface EditExamModalProps {
  exam: Exam;
  onClose: () => void;
}

const EditExamModal: React.FC<EditExamModalProps> = ({ exam, onClose }) => {
  const { isDark } = useTheme();
  const [title, setTitle] = useState(exam.title);
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState(exam.duration.toString());
  const [totalQuestions, setTotalQuestions] = useState(exam.totalQuestions.toString());
  const [description, setDescription] = useState(exam.description || '');
  const [passingScore, setPassingScore] = useState(exam.passingScore?.toString() || '60');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const examDate = new Date(exam.date);
    if (!isNaN(examDate.getTime())) {
      setDate(examDate.toISOString().split('T')[0]);
      setStartTime(examDate.toISOString().split('T')[1].slice(0, 5));
    }
  }, [exam.date]);

  console.log('EditExamModal: Rendering component for exam:', exam.id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    console.log('EditExamModal: Form submitted with data:', {
      title,
      date,
      startTime,
      duration,
      totalQuestions,
      description,
      passingScore,
    });

    try {
      if (!title || !date || !startTime || !duration || !totalQuestions || !passingScore) {
        throw new Error('All required fields must be filled');
      }

      const durationNum = parseInt(duration);
      const totalQuestionsNum = parseInt(totalQuestions);
      const passingScoreNum = parseInt(passingScore);

      if (isNaN(durationNum) || durationNum < 10 || durationNum > 240) {
        throw new Error('Duration must be between 10 and 240 minutes');
      }
      if (isNaN(totalQuestionsNum) || totalQuestionsNum < 1 || totalQuestionsNum > 100) {
        throw new Error('Total questions must be between 1 and 100');
      }
      if (isNaN(passingScoreNum) || passingScoreNum < 1 || passingScoreNum > 100) {
        throw new Error('Passing score must be between 1 and 100');
      }

      const examDateTime = new Date(`${date}T${startTime}`).toISOString();
      console.log('EditExamModal: Combined exam date and time:', examDateTime);

      const examRef = doc(db, 'exams', exam.id);
      await updateDoc(examRef, {
        title,
        date: examDateTime,
        duration: durationNum,
        totalQuestions: totalQuestionsNum,
        description: description || null,
        passingScore: passingScoreNum,
      });
      console.log('EditExamModal: Exam updated successfully with ID:', exam.id);

      setLoading(false);
      onClose();
    } catch (err: any) {
      console.error('EditExamModal: Error updating exam:', err.message, 'Code:', err.code);
      setError(err.message || 'Failed to update exam');
      setLoading(false);
    }
  };

  return (
    <div className={`fixed inset-0 ${isDark ? 'bg-black/60' : 'bg-black/40'} backdrop-blur-sm flex items-center justify-center p-4 z-50 font-poppins`}>
      <div
        className={`rounded-xl border w-full max-w-2xl max-h-[90vh] overflow-y-auto ${
          isDark ? 'bg-darkbg border-primary/40' : 'bg-light-bg border-secondary/30'
        }`}
      >
        <div className={`flex justify-between items-center p-6 ${isDark ? 'border-b border-primary/30' : 'border-b border-secondary/20'}`}>
          <h2 className="text-xl font-semibold font-glacial text-primary">Edit Exam</h2>
          <button
            onClick={() => {
              console.log('EditExamModal: Close button clicked');
              onClose();
            }}
            className="text-primary hover:text-secondary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={`p-6 space-y-6 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
          {error && (
            <div className={`${isDark ? 'bg-dark-error/20 text-dark-error' : 'bg-light-error/20 text-light-error'} p-3 rounded-md text-sm`}>
              {error}
            </div>
          )}

          <div>
            <label htmlFor="title" className="block text-sm font-medium text-primary">Exam Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => {
                console.log('EditExamModal: Title updated:', e.target.value);
                setTitle(e.target.value);
              }}
              className={`mt-1 w-full rounded-lg border focus:ring-2 focus:ring-primary focus:outline-none px-4 py-2 ${
                isDark
                  ? 'bg-dark-secondary-bg border-secondary/50 text-dark-text placeholder-gray-500'
                  : 'bg-light-bg border-gray-300 text-light-text placeholder-gray-400'
              }`}
              placeholder="Enter exam title"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-primary">Exam Date</label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-primary/70" />
                </div>
                <input
                  type="date"
                  id="date"
                  value={date}
                  onChange={(e) => {
                    console.log('EditExamModal: Date updated:', e.target.value);
                    setDate(e.target.value);
                  }}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                    isDark
                      ? 'bg-dark-secondary-bg border-secondary/40 text-dark-text'
                      : 'bg-light-bg border-gray-300 text-light-text'
                  }`}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-primary">Start Time</label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className="h-5 w-5 text-primary/70" />
                </div>
                <input
                  type="time"
                  id="startTime"
                  value={startTime}
                  onChange={(e) => {
                    console.log('EditExamModal: StartTime updated:', e.target.value);
                    setStartTime(e.target.value);
                  }}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                    isDark
                      ? 'bg-dark-secondary-bg border-secondary/40 text-dark-text'
                      : 'bg-light-bg border-gray-300 text-light-text'
                  }`}
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-primary">Duration (minutes)</label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className="h-5 w-5 text-primary/70" />
                </div>
                <input
                  type="number"
                  id="duration"
                  min="10"
                  max="240"
                  value={duration}
                  onChange={(e) => {
                    console.log('EditExamModal: Duration updated:', e.target.value);
                    setDuration(e.target.value);
                  }}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                    isDark
                      ? 'bg-dark-secondary-bg border-secondary/40 text-dark-text'
                      : 'bg-light-bg border-gray-300 text-light-text'
                  }`}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="totalQuestions" className="block text-sm font-medium text-primary">Questions Per Student</label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <HelpCircle className="h-5 w-5 text-primary/70" />
                </div>
                <input
                  type="number"
                  id="totalQuestions"
                  min="1"
                  max="100"
                  value={totalQuestions}
                  onChange={(e) => {
                    console.log('EditExamModal: TotalQuestions updated:', e.target.value);
                    setTotalQuestions(e.target.value);
                  }}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                    isDark
                      ? 'bg-dark-secondary-bg border-secondary/40 text-dark-text'
                      : 'bg-light-bg border-gray-300 text-light-text'
                  }`}
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="passingScore" className="block text-sm font-medium text-primary">Passing Score (%)</label>
              <input
                type="number"
                id="passingScore"
                min="1"
                max="100"
                value={passingScore}
                onChange={(e) => {
                  console.log('EditExamModal: PassingScore updated:', e.target.value);
                  setPassingScore(e.target.value);
                }}
                className={`mt-1 w-full rounded-lg border focus:ring-2 focus:ring-primary px-4 py-2 focus:outline-none ${
                  isDark
                    ? 'bg-dark-secondary-bg border-secondary/40 text-dark-text'
                    : 'bg-light-bg border-gray-300 text-light-text'
                }`}
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-primary">Description (Optional)</label>
            <textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => {
                console.log('EditExamModal: Description updated:', e.target.value);
                setDescription(e.target.value);
              }}
              className={`mt-1 w-full rounded-lg border focus:ring-2 focus:ring-primary px-4 py-2 focus:outline-none ${
                isDark
                  ? 'bg-dark-secondary-bg border-secondary/40 text-dark-text placeholder-gray-500'
                  : 'bg-light-bg border-gray-300 text-light-text placeholder-gray-400'
              }`}
              placeholder="Enter exam description"
            />
          </div>

          <div className="mt-8 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                console.log('EditExamModal: Cancel button clicked');
                onClose();
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isDark
                  ? 'bg-dark-secondary-bg hover:bg-gray-700 text-dark-text'
                  : 'bg-light-secondary-bg hover:bg-gray-300 text-light-text'
              }`}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center transition-all ${
                loading
                  ? 'bg-gray-500 cursor-not-allowed text-gray-300'
                  : 'bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 text-darkbg'
              }`}
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Updating...' : 'Update Exam'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditExamModal;