import React, { useState } from 'react';
import { X, FileUp, Save } from 'lucide-react';
import { useAuth } from '../context/AuthContext'; // Adjusted path to match the likely correct location
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import * as XLSX from 'xlsx';

interface CreateExamModalProps {
  onClose: () => void;
}

interface Question {
  text: string;
  options?: string[];
  correctAnswer?: string | string[] | null;
  type: 'singleChoice' | 'multipleChoice' | 'essay' | 'matching' | 'ordering';
  points?: number;
}

interface Exam {
  title: string;
  startTime: string;
  duration: number;
  totalQuestions: number;
  questions: Question[];
}

const CreateExamModal: React.FC<CreateExamModalProps> = ({ onClose }) => {
  const { user } = useAuth();
  const [jsonInput, setJsonInput] = useState<string>('');
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  if (!user || user.role !== 'admin') {
    return null; // Prevent rendering for non-admins
  }

  const handleJsonSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      const examData: Exam = JSON.parse(jsonInput);
      if (!examData.title || !examData.startTime || !examData.duration || !examData.questions?.length) {
        throw new Error('Missing required fields: title, startTime, duration, or questions');
      }

      // Add exam to Firestore
      const examRef = await addDoc(collection(db, 'exams'), {
        id: '', // Will be set to doc ID
        title: examData.title,
        startTime: examData.startTime,
        duration: examData.duration,
        totalQuestions: examData.questions.length,
        totalStudents: 0,
        createdAt: serverTimestamp(),
      });

      // Update exam ID
      await addDoc(collection(db, 'exams'), { id: examRef.id });

      // Add questions to subcollection
      const questionsCollection = collection(db, 'exams', examRef.id, 'questions');
      for (const [index, question] of examData.questions.entries()) {
        await addDoc(questionsCollection, {
          ...question,
          id: `question${index + 1}`,
          points: question.points || 10,
        });
      }

      console.log('Exam created with ID:', examRef.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid JSON or error saving exam');
      console.error('JSON submit error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExcelSubmit = async () => {
    setError('');
    setLoading(true);
    try {
      if (!excelFile) {
        throw new Error('No Excel file selected');
      }

      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData: any[] = XLSX.utils.sheet_to_json(sheet);

          // Validate and transform Excel data
          const examData: Exam = {
            title: jsonData[0]?.title || 'Untitled Exam',
            startTime: jsonData[0]?.startTime || new Date().toISOString(),
            duration: Number(jsonData[0]?.duration) || 60,
            totalQuestions: jsonData.length,
            questions: jsonData.map((row, index) => ({
              id: `question${index + 1}`,
              text: row.text || '',
              options: row.options ? row.options.split('|') : undefined,
              correctAnswer: row.correctAnswer || null,
              type: row.type || 'singleChoice',
              points: Number(row.points) || 10,
            })),
          };

          // Add exam to Firestore
          const examRef = await addDoc(collection(db, 'exams'), {
            id: '',
            title: examData.title,
            startTime: examData.startTime,
            duration: examData.duration,
            totalQuestions: examData.totalQuestions,
            totalStudents: 0,
            createdAt: serverTimestamp(),
          });

          // Update exam ID
          await addDoc(collection(db, 'exams'), { id: examRef.id });

          // Add questions to subcollection
          const questionsCollection = collection(db, 'exams', examRef.id, 'questions');
          for (const question of examData.questions) {
            await addDoc(questionsCollection, question);
          }

          console.log('Exam created from Excel with ID:', examRef.id);
          onClose();
        } catch (err) {
          setError('Error parsing Excel file');
          console.error('Excel parse error:', err);
        }
      };
      reader.onerror = () => {
        setError('Error reading Excel file');
        setLoading(false);
      };
      reader.readAsArrayBuffer(excelFile);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error processing Excel file');
      console.error('Excel submit error:', err);
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-filter backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-darkbg rounded-xl border border-gray-700 w-full max-w-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">Create New Exam</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-900/30 text-red-400 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* JSON Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Enter Exam JSON
          </label>
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder='{
  "title": "Sample Exam",
  "startTime": "2025-06-01T10:00:00Z",
  "duration": 60,
  "questions": [
    {
      "text": "What is 2+2?",
      "options": ["3", "4", "5", "6"],
      "correctAnswer": "4",
      "type": "singleChoice",
      "points": 10
    }
  ]
}'
            className="w-full h-48 p-3 bg-darkbg border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm"
          />
          <button
            onClick={handleJsonSubmit}
            disabled={loading || !jsonInput.trim()}
            className={`mt-3 w-full px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center transition-all ${
              loading || !jsonInput.trim()
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-primary to-secondary hover:from-[#4be3b0] hover:to-[#008f5f] text-white'
            }`}
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : 'Create Exam from JSON'}
          </button>
        </div>

        {/* Excel Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Upload Excel File
          </label>
          <input
            type="file"
            accept=".xlsx, .xls"
            onChange={(e) => setExcelFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-700 file:text-white hover:file:bg-gray-600"
          />
          <button
            onClick={handleExcelSubmit}
            disabled={loading || !excelFile}
            className={`mt-3 w-full px-4 py-2 rounded-lg text-sm font-medium flex items-center justify-center transition-all ${
              loading || !excelFile
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-primary to-secondary hover:from-[#4be3b0] hover:to-[#008f5f] text-white'
            }`}
          >
            <FileUp className="h-4 w-4 mr-2" />
            {loading ? 'Uploading...' : 'Create Exam from Excel'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateExamModal;

// **Details**:
// - **JSON Input**:
//   - Textarea accepts JSON with `title`, `startTime`, `duration`, and `questions` (matching Firestore schema).
//   - Validates JSON and required fields.
//   - Saves exam to `exams` and questions to `exams/{examId}/questions`.
// - **Excel Upload**:
//   - Accepts `.xlsx` or `.xls` files.
//   - Parses using `xlsx` into JSON.
//   - Expects columns: `title`, `startTime`, `duration`, `text`, `options` (pipe-separated, e.g., `3|4|5|6`), `correctAnswer`, `type`, `points`.
//   - Saves to Firestore similarly.
// - **UI**:
//   - Matches `Exams.tsx` style (gradient buttons, darkbg, Poppins font).
//   - Includes error messages and loading states.
// - **Security**:
//   - Only renders for admins (`user.role === 'admin'`).
//   - Uses `serverTimestamp` for `createdAt`.

// **Excel File Example**:
// // Create an Excel file (`exam.xlsx`) with:
// title,startTime,duration,text,options,correctAnswer,type,points
// "Sample Exam","2025-06-01T10:00:00Z",60,"What is 2+2?","3|4|5|6","4","singleChoice",10
// "Sample Exam","2025-06-01T10:00:00Z",60,"What is React?","Library|Framework|Language|Tool","Library","singleChoice",10