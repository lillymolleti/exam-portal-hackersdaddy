import React, { useState } from 'react';
import { X, Calendar, Clock, HelpCircle, Save, FileUp } from 'lucide-react';

interface CreateExamModalProps {
  onClose: () => void;
}

const CreateExamModal: React.FC<CreateExamModalProps> = ({ onClose }) => {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState('60');
  const [totalQuestions, setTotalQuestions] = useState('10');
  const [description, setDescription] = useState('');
  const [passingScore, setPassingScore] = useState('60');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 font-['Poppins']">
      <div className="bg-[#121212] rounded-xl border border-[#5cffc9]/40 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b border-[#5cffc9]/30">
          <h2 className="text-xl font-semibold text-white font-['Glacial Indifference']">Create New Exam</h2>
          <button onClick={onClose} className="text-[#5cffc9] hover:text-white">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 text-white space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-[#5cffc9]">Exam Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-lg bg-[#1f1f1f] text-white placeholder-gray-500 border border-[#00ac76]/50 focus:ring-2 focus:ring-[#5cffc9] focus:outline-none px-4 py-2"
              placeholder="Enter exam title"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Date */}
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-[#5cffc9]">Exam Date</label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Calendar className="h-5 w-5 text-[#5cffc9]/70" />
                </div>
                <input
                  type="date"
                  id="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-[#00ac76]/40 rounded-lg bg-[#1f1f1f] text-white focus:outline-none focus:ring-2 focus:ring-[#5cffc9]"
                  required
                />
              </div>
            </div>

            {/* Start Time */}
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-[#5cffc9]">Start Time</label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className="h-5 w-5 text-[#5cffc9]/70" />
                </div>
                <input
                  type="time"
                  id="startTime"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-[#00ac76]/40 rounded-lg bg-[#1f1f1f] text-white focus:outline-none focus:ring-2 focus:ring-[#5cffc9]"
                  required
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Duration */}
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-[#5cffc9]">Duration (minutes)</label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Clock className="h-5 w-5 text-[#5cffc9]/70" />
                </div>
                <input
                  type="number"
                  id="duration"
                  min="10"
                  max="240"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-[#00ac76]/40 rounded-lg bg-[#1f1f1f] text-white focus:outline-none focus:ring-2 focus:ring-[#5cffc9]"
                  required
                />
              </div>
            </div>

            {/* Questions */}
            <div>
              <label htmlFor="totalQuestions" className="block text-sm font-medium text-[#5cffc9]">Questions Per Student</label>
              <div className="relative mt-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <HelpCircle className="h-5 w-5 text-[#5cffc9]/70" />
                </div>
                <input
                  type="number"
                  id="totalQuestions"
                  min="1"
                  max="100"
                  value={totalQuestions}
                  onChange={(e) => setTotalQuestions(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-[#00ac76]/40 rounded-lg bg-[#1f1f1f] text-white focus:outline-none focus:ring-2 focus:ring-[#5cffc9]"
                  required
                />
              </div>
            </div>

            {/* Passing Score */}
            <div>
              <label htmlFor="passingScore" className="block text-sm font-medium text-[#5cffc9]">Passing Score (%)</label>
              <input
                type="number"
                id="passingScore"
                min="1"
                max="100"
                value={passingScore}
                onChange={(e) => setPassingScore(e.target.value)}
                className="mt-1 w-full rounded-lg bg-[#1f1f1f] text-white border border-[#00ac76]/40 focus:ring-2 focus:ring-[#5cffc9] px-4 py-2 focus:outline-none"
                required
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-[#5cffc9]">Description (Optional)</label>
            <textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full rounded-lg bg-[#1f1f1f] text-white border border-[#00ac76]/40 focus:ring-2 focus:ring-[#5cffc9] px-4 py-2 placeholder-gray-400 focus:outline-none"
              placeholder="Enter exam description"
            />
          </div>

          {/* Import Questions */}
          <div className="bg-[#00ac76]/10 border border-[#00ac76]/30 rounded-lg p-4">
            <h3 className="font-medium text-[#5cffc9] flex items-center">
              <FileUp className="h-5 w-5 mr-2" />
              Question Import
            </h3>
            <p className="mt-2 text-sm text-white/80">
              Import questions from an Excel file (columns for question, options, answer).
            </p>
            <div className="mt-3">
              <label className="block w-full px-4 py-2 bg-[#5cffc9] text-[#121212] hover:bg-[#4ce9b3] rounded-lg text-sm font-medium text-center cursor-pointer transition-colors">
                <input type="file" className="hidden" accept=".xlsx,.xls,.csv" />
                Select Excel File
              </label>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="mt-8 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#1f1f1f] hover:bg-[#2a2a2a] text-white rounded-lg text-sm font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-[#5cffc9] to-[#00ac76] hover:from-[#4ce9b3] hover:to-[#00b87a] text-[#121212] rounded-lg text-sm font-semibold flex items-center transition-all"
            >
              <Save className="h-4 w-4 mr-2" />
              Create Exam
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateExamModal;
