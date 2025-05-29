import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, setDoc, doc } from 'firebase/firestore';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';

const AddExam = () => {
  // State for exam details
  const [exam, setExam] = useState({
    title: '',
    startTime: '',
    totalStudents: '',
  });

  // State for questions
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState({
    text: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    points: 5,
  });

  // Handle exam form changes
  const handleExamChange = (e) => {
    const { name, value } = e.target;
    setExam((prev) => ({ ...prev, [name]: value }));
  };

  // Handle question form changes
  const handleQuestionChange = (e) => {
    const { name, value } = e.target;
    setCurrentQuestion((prev) => ({ ...prev, [name]: value }));
  };

  // Handle option changes
  const handleOptionChange = (index, value) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion((prev) => ({ ...prev, options: newOptions }));
  };

  // Add question to list
  const addQuestion = () => {
    if (
      currentQuestion.text &&
      currentQuestion.options.every((opt) => opt) &&
      currentQuestion.correctAnswer &&
      currentQuestion.options.includes(currentQuestion.correctAnswer)
    ) {
      setQuestions((prev) => [...prev, currentQuestion]);
      setCurrentQuestion({
        text: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        points: 5,
      });
    } else {
      alert('Please fill out all question fields and ensure the correct answer is one of the options.');
    }
  };

  // Save exam and questions to Firestore
  const saveExam = async () => {
    if (!exam.title || !exam.startTime || !exam.totalStudents || questions.length === 0) {
      alert('Please fill out all exam details and add at least one question.');
      return;
    }

    try {
      // Add exam to 'exams' collection
      const examRef = await addDoc(collection(db, 'exams'), {
        title: exam.title,
        startTime: exam.startTime,
        totalStudents: parseInt(exam.totalStudents),
        createdAt: new Date(),
      });

      // Add questions to subcollection
      for (const question of questions) {
        await addDoc(collection(db, `exams/${examRef.id}/questions`), {
          text: question.text,
          options: question.options,
          correctAnswer: question.correctAnswer,
          points: parseInt(question.points),
        });
      }

      alert('Exam and questions saved successfully!');
      setExam({ title: '', startTime: '', totalStudents: '' });
      setQuestions([]);
    } catch (error) {
      console.error('Error saving exam:', error);
      alert('Failed to save exam. Please try again.');
    }
  };

  return (
    <div className="space-y-6 font-poppins bg-white dark:bg-darkbg/80 p-6 rounded-xl border border-gray-300 dark:border-gray-600">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-primary font-glacial">Create New Exam</h1>
        <Link
          to="/admin/dashboard"
          className="text-gray-900 dark:text-primary hover:text-gray-700 dark:hover:text-secondary text-sm font-medium flex items-center"
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to Dashboard
        </Link>
      </div>

      {/* Exam Form */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white font-glacial">Exam Details</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Exam Title</label>
          <input
            type="text"
            name="title"
            value={exam.title}
            onChange={handleExamChange}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-darkbg/70 text-gray-900 dark:text-white focus:border-primary focus:ring-primary"
            placeholder="e.g., Web Development Fundamentals"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Start Time</label>
          <input
            type="text"
            name="startTime"
            value={exam.startTime}
            onChange={handleExamChange}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-darkbg/70 text-gray-900 dark:text-white focus:border-primary focus:ring-primary"
            placeholder="e.g., 09:00 AM"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Total Students</label>
          <input
            type="number"
            name="totalStudents"
            value={exam.totalStudents}
            onChange={handleExamChange}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-darkbg/70 text-gray-900 dark:text-white focus:border-primary focus:ring-primary"
            placeholder="e.g., 45"
          />
        </div>
      </div>

      {/* Question Form */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white font-glacial">Add Question</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Question Text</label>
          <input
            type="text"
            name="text"
            value={currentQuestion.text}
            onChange={handleQuestionChange}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-darkbg/70 text-gray-900 dark:text-white focus:border-primary focus:ring-primary"
            placeholder="e.g., What is HTML?"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          {currentQuestion.options.map((option, index) => (
            <div key={index}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Option {index + 1}</label>
              <input
                type="text"
                value={option}
                onChange={(e) => handleOptionChange(index, e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-darkbg/70 text-gray-900 dark:text-white focus:border-primary focus:ring-primary"
                placeholder={`Option ${index + 1}`}
              />
            </div>
          ))}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Correct Answer</label>
          <input
            type="text"
            name="correctAnswer"
            value={currentQuestion.correctAnswer}
            onChange={handleQuestionChange}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-darkbg/70 text-gray-900 dark:text-white focus:border-primary focus:ring-primary"
            placeholder="e.g., Markup Language"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Points</label>
          <input
            type="number"
            name="points"
            value={currentQuestion.points}
            onChange={handleQuestionChange}
            className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-darkbg/70 text-gray-900 dark:text-white focus:border-primary focus:ring-primary"
            placeholder="e.g., 5"
          />
        </div>
        <button
          onClick={addQuestion}
          className="px-4 py-2 rounded-md bg-primary text-gray-900 dark:text-darkbg hover:bg-secondary transition-colors"
        >
          Add Question
        </button>
      </div>

      {/* Display Added Questions */}
      {questions.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white font-glacial">Added Questions</h2>
          <ul className="mt-2 space-y-2">
            {questions.map((q, index) => (
              <li key={index} className="text-sm text-gray-700 dark:text-gray-300">
                {index + 1}. {q.text} (Correct: {q.correctAnswer}, Points: {q.points})
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Save Exam Button */}
      <button
        onClick={saveExam}
        className="px-6 py-3 rounded-md bg-secondary text-gray-900 dark:text-darkbg hover:bg-primary transition-colors"
      >
        Save Exam
      </button>
    </div>
  );
};

export default AddExam;