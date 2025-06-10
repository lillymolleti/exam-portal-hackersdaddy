import React, { useState } from 'react';
import { X, Calendar, Clock, HelpCircle, Save, FileUp } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { collection, addDoc, setDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';
import * as XLSX from 'xlsx';

interface CreateExamModalProps {
  onClose: () => void;
}

interface Question {
  text: string;
  type: 'singleChoice' | 'multipleChoice' | 'essay' | 'matching' | 'ordering';
  points: number;
  options?: string[]; // For single/multiple choice
  correctAnswer?: string | string[]; // For single/multiple choice
}

const CreateExamModal: React.FC<CreateExamModalProps> = ({ onClose }) => {
  const { isDark } = useTheme();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [duration, setDuration] = useState('60');
  const [totalQuestions, setTotalQuestions] = useState('10');
  const [description, setDescription] = useState('');
  const [passingScore, setPassingScore] = useState('60');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [importedQuestions, setImportedQuestions] = useState<Question[]>([]);

  console.log('CreateExamModal: Rendering component with isDark:', isDark);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    console.log('CreateExamModal: Form submitted with data:', {
      title,
      date,
      startTime,
      duration,
      totalQuestions,
      description,
      passingScore,
    });

    try {
      // Validate required fields
      if (!title || !date || !startTime || !duration || !totalQuestions || !passingScore) {
        throw new Error('All required fields must be filled');
      }

      const durationNum = parseInt(duration);
      const totalQuestionsNum = parseInt(totalQuestions);
      const passingScoreNum = parseInt(passingScore);

      // Validate numeric fields
      if (isNaN(durationNum) || durationNum < 10 || durationNum > 240) {
        throw new Error('Duration must be between 10 and 240 minutes');
      }
      if (isNaN(totalQuestionsNum) || totalQuestionsNum < 1 || totalQuestionsNum > 100) {
        throw new Error('Total questions must be between 1 and 100');
      }
      if (isNaN(passingScoreNum) || passingScoreNum < 1 || passingScoreNum > 100) {
        throw new Error('Passing score must be between 1 and 100');
      }

      // Combine date and start time into ISO string
      const examDateTime = new Date(`${date}T${startTime}`).toISOString();
      console.log('CreateExamModal: Combined exam date and time:', examDateTime);

      // Save exam to Firestore
      const docRef = await addDoc(collection(db, 'exams'), {
        title,
        date: examDateTime,
        duration: durationNum,
        totalQuestions: totalQuestionsNum,
        description: description || null,
        passingScore: passingScoreNum,
      });
      console.log('CreateExamModal: Exam created successfully with ID:', docRef.id);

      // If there are imported questions, save them under the exam
      if (importedQuestions.length > 0) {
        const questionsCollection = collection(db, 'exams', docRef.id, 'questions');
        for (const [index, question] of importedQuestions.entries()) {
          await setDoc(doc(questionsCollection, `question_${index + 1}`), {
            text: question.text,
            type: question.type,
            points: question.points,
            options: question.options || [],
            correctAnswer: question.correctAnswer || '',
          });
          console.log(`CreateExamModal: Saved question ${index + 1} for exam ${docRef.id}`);
        }
      }

      setLoading(false);
      onClose();
    } catch (err: any) {
      console.error('CreateExamModal: Error creating exam:', err.message, 'Code:', err.code);
      setError(err.message || 'Failed to create exam');
      setLoading(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setImportError('No file selected');
      console.log('CreateExamModal: No file selected for import.');
      return;
    }

    setImportError(null);
    console.log('CreateExamModal: File selected for import:', file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = event.target?.result;
        if (!data) {
          throw new Error('Failed to read file content');
        }
        console.log('CreateExamModal: File content read successfully, size:', file.size);

        // Handle JSON
        if (file.name.endsWith('.json')) {
          console.log('CreateExamModal: Processing JSON file...');
          const text = data as string;
          const jsonData = JSON.parse(text);
          console.log('CreateExamModal: JSON parsed, raw data:', jsonData);
          if (Array.isArray(jsonData) && jsonData.length > 0) {
            const questions = jsonData.map((q: any) => ({
              text: q.text || 'Untitled Question',
              type: q.type || 'singleChoice',
              points: q.points || 1,
              options: q.options || [],
              correctAnswer: q.correctAnswer || '',
            })) as Question[];
            setImportedQuestions(questions);
            console.log('CreateExamModal: JSON parsed, questions imported:', questions.length, 'questions:', questions);
          } else {
            throw new Error('Invalid JSON format: Expected an array of questions');
          }
        }
        // Handle Excel (.xlsx, .xls, .csv)
        else if (file.name.match(/\.(xlsx|xls|csv)$/)) {
          console.log('CreateExamModal: Processing Excel/CSV file...');
          const arrayBuffer = data as ArrayBuffer;
          const workbook = XLSX.read(arrayBuffer, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          console.log('CreateExamModal: Excel sheet extracted:', sheetName);

          // Convert sheet to JSON
          const jsonData = XLSX.utils.sheet_to_json(sheet, { header: 1 });
          console.log('CreateExamModal: Excel data converted to JSON, rows:', jsonData.length);

          if (jsonData.length < 2) {
            throw new Error('Excel file is empty or has no data rows beyond header');
          }

          // Assuming first row is header
          const headers = jsonData[0] as string[];
          console.log('CreateExamModal: Excel headers:', headers);

          // Process data rows (skip header row)
          const questions = jsonData.slice(1).map((row: any, rowIndex: number) => {
            const question: Question = {
              text: '',
              type: 'singleChoice',
              points: 1,
            };

            // Map columns based on headers or fixed positions
            headers.forEach((header, colIndex) => {
              const value = row[colIndex] !== undefined ? row[colIndex].toString() : '';
              const normalizedHeader = header.toLowerCase().trim();

              if (normalizedHeader.includes('text') || normalizedHeader.includes('question')) {
                question.text = value || `Untitled Question ${rowIndex + 1}`;
              } else if (normalizedHeader.includes('type')) {
                const typeValue = value.toLowerCase() as
                  | 'singlechoice'
                  | 'single choice'
                  | 'multiplechoice'
                  | 'multiple choice'
                  | 'essay'
                  | 'matching'
                  | 'ordering';
                if (typeValue.includes('multiple') || typeValue === 'multiplechoice') {
                  question.type = 'multipleChoice';
                } else if (typeValue === 'essay') {
                  question.type = 'essay';
                } else if (typeValue === 'matching') {
                  question.type = 'matching';
                } else if (typeValue === 'ordering') {
                  question.type = 'ordering';
                } else {
                  question.type = 'singleChoice';
                }
              } else if (normalizedHeader.includes('points') || normalizedHeader.includes('mark')) {
                question.points = parseInt(value) || 1;
              } else if (normalizedHeader.includes('options') || normalizedHeader.includes('choice')) {
                question.options = value ? value.split('|').map(optionText => optionText.trim()).filter(optionText => optionText) : [];
              } else if (normalizedHeader.includes('correct') || normalizedHeader.includes('answer')) {
                if (question.type === 'multipleChoice') {
                  question.correctAnswer = value
                    ? value.split('|').map(answer => answer.trim()).filter(answer => answer)
                    : [];
                } else {
                  question.correctAnswer = value || '';
                }
              }
            });

            // Fallback for missing fields or validation
            if (!question.text) {
              question.text = `Untitled Question ${rowIndex + 1}`;
            }
            if (question.type === 'singleChoice' || question.type === 'multipleChoice') {
              if (!question.options || question.options.length === 0) {
                question.options = ['Option 1', 'Option 2'];
              }
              if (question.type === 'singleChoice' && (!question.correctAnswer || !question.options.includes(question.correctAnswer as string))) {
                question.correctAnswer = question.options[0];
              }
              if (question.type === 'multipleChoice' && (!question.correctAnswer || (question.correctAnswer as string[]).length === 0)) {
                question.correctAnswer = [question.options[0]];
              }
            } else {
              question.options = [];
              question.correctAnswer = '';
            }

            console.log(`CreateExamModal: Processed question row ${rowIndex + 1}:`, question);
            return question;
          });

          setImportedQuestions(questions);
          console.log('CreateExamModal: Excel parsed, questions imported:', questions.length, 'questions:', questions);
        } else {
          throw new Error('Unsupported file type. Use JSON or Excel format (.xlsx, .xls, .csv).');
        }
      } catch (err: any) {
        setImportError(err.message || 'Failed to parse file');
        console.error('CreateExamModal: Error parsing file:', err.message, 'Stack:', err.stack);
      }
    };

    reader.onerror = () => {
      setImportError('Error reading file content');
      console.error('CreateExamModal: FileReader error occurred');
    };

    if (file.name.match(/\.(xlsx|xls|csv)$/)) {
      reader.readAsArrayBuffer(file); // For Excel files
      console.log('CreateExamModal: Reading file as ArrayBuffer for Excel/CSV processing.');
    } else {
      reader.readAsText(file); // For JSON
      console.log('CreateExamModal: Reading file as text for JSON processing.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 font-poppins">
      <div
        className={`bg-darkbg rounded-xl border w-full max-w-2xl max-h-[90vh] overflow-y-auto ${
          isDark ? 'border-primary/40' : 'border-gray-300'
        }`}
      >
        <div className="flex justify-between items-center p-6 border-b border-primary/30">
          <h2 className="text-xl font-semibold font-glacial text-primary">Create New Exam</h2>
          <button
            onClick={() => {
              console.log('CreateExamModal: Close button clicked');
              onClose();
            }}
            className="text-primary hover:text-secondary"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className={`p-6 space-y-6 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>
          {error && (
            <div className="bg-red-900/40 text-red-300 p-3 rounded-md text-sm">
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
                console.log('CreateExamModal: Title updated:', e.target.value);
                setTitle(e.target.value);
              }}
              className={`mt-1 w-full rounded-lg text-dark-text placeholder-gray-500 border focus:ring-2 focus:ring-primary focus:outline-none px-4 py-2 ${
                isDark ? 'bg-[#1f1f1f] border-secondary/50' : 'bg-light-bg border-gray-300'
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
                    console.log('CreateExamModal: Date updated:', e.target.value);
                    setDate(e.target.value);
                  }}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-lg text-dark-text focus:outline-none focus:ring-2 focus:ring-primary ${
                    isDark ? 'bg-[#1f1f1f] border-secondary/40' : 'bg-light-bg border-gray-300'
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
                    console.log('CreateExamModal: StartTime updated:', e.target.value);
                    setStartTime(e.target.value);
                  }}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-lg text-dark-text focus:outline-none focus:ring-2 focus:ring-primary ${
                    isDark ? 'bg-[#1f1f1f] border-secondary/40' : 'bg-light-bg border-gray-300'
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
                    console.log('CreateExamModal: Duration updated:', e.target.value);
                    setDuration(e.target.value);
                  }}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-lg text-dark-text focus:outline-none focus:ring-2 focus:ring-primary ${
                    isDark ? 'bg-[#1f1f1f] border-secondary/40' : 'bg-light-bg border-gray-300'
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
                    console.log('CreateExamModal: TotalQuestions updated:', e.target.value);
                    setTotalQuestions(e.target.value);
                  }}
                  className={`block w-full pl-10 pr-3 py-2 border rounded-lg text-dark-text focus:outline-none focus:ring-2 focus:ring-primary ${
                    isDark ? 'bg-[#1f1f1f] border-secondary/40' : 'bg-light-bg border-gray-300'
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
                  console.log('CreateExamModal: PassingScore updated:', e.target.value);
                  setPassingScore(e.target.value);
                }}
                className={`mt-1 w-full rounded-lg text-dark-text border focus:ring-2 focus:ring-primary px-4 py-2 focus:outline-none ${
                  isDark ? 'bg-[#1f1f1f] border-secondary/40' : 'bg-light-bg border-gray-300'
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
                console.log('CreateExamModal: Description updated:', e.target.value);
                setDescription(e.target.value);
              }}
              className={`mt-1 w-full rounded-lg text-dark-text border focus:ring-2 focus:ring-primary px-4 py-2 placeholder-gray-400 focus:outline-none ${
                isDark ? 'bg-[#1f1f1f] border-secondary/40' : 'bg-light-bg border-gray-300'
              }`}
              placeholder="Enter exam description"
            />
          </div>

          {/* Import Questions */}
          <div className="bg-secondary/10 border border-secondary/30 rounded-lg p-4">
            <h3 className="font-medium text-primary flex items-center">
              <FileUp className="h-5 w-5 mr-2" />
              Question Import
            </h3>
            <p className="mt-2 text-sm text-dark-text/80">
              Import questions from a JSON or Excel file (columns for question, options, answer).
            </p>
            {importError && (
              <div className="mt-2 bg-red-900/40 text-red-300 p-2 rounded-md text-xs">
                {importError}
              </div>
            )}
            {importedQuestions.length > 0 && (
              <p className="mt-2 text-sm text-green-400">
                {importedQuestions.length} questions imported successfully.
              </p>
            )}
            <div className="mt-3">
              <label className="block w-full px-4 py-2 bg-primary text-darkbg hover:bg-primary/80 rounded-lg text-sm font-medium text-center cursor-pointer transition-colors">
                <input type="file" className="hidden" accept=".json,.xlsx,.xls,.csv" onChange={handleFileUpload} />
                Select File (JSON/Excel)
              </label>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="mt-8 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => {
                console.log('CreateExamModal: Cancel button clicked');
                onClose();
              }}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                isDark ? 'bg-[#1f1f1f] hover:bg-[#2a2a2a] text-dark-text' : 'bg-gray-200 hover:bg-gray-300 text-light-text'
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
              {loading ? 'Creating...' : 'Create Exam'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateExamModal;