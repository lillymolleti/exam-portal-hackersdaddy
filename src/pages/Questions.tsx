import React, { useState } from 'react';
import { Plus, FileUp, Filter, Search, HelpCircle, Edit, Trash } from 'lucide-react';

// Mock data for questions
const mockQuestions = [
  {
    id: '1',
    text: 'What is the main purpose of the useEffect hook in React?',
    type: 'Single Choice',
    difficulty: 'Medium',
    category: 'React',
    createdDate: '2025-07-15',
  },
  {
    id: '2',
    text: 'Which of the following are valid ways to create a React component? (Select all that apply)',
    type: 'Multiple Choice',
    difficulty: 'Easy',
    category: 'React',
    createdDate: '2025-07-20',
  },
  {
    id: '3',
    text: 'Explain the concept of React\'s virtual DOM and how it improves performance.',
    type: 'Essay',
    difficulty: 'Hard',
    category: 'React',
    createdDate: '2025-07-22',
  },
  {
    id: '4',
    text: 'What is the output of the following code?\n\n```javascript\nconst numbers = [1, 2, 3, 4, 5];\nconst doubled = numbers.map(num => num * 2);\nconsole.log(doubled);\n```',
    type: 'Single Choice',
    difficulty: 'Easy',
    category: 'JavaScript',
    createdDate: '2025-07-24',
  },
  {
    id: '5',
    text: 'Fill in the missing code to create a proper React functional component',
    type: 'Single Choice',
    difficulty: 'Medium',
    category: 'React',
    createdDate: '2025-07-25',
  },
  {
    id: '6',
    text: 'What is the purpose of React.memo?',
    type: 'Single Choice',
    difficulty: 'Medium',
    category: 'React',
    createdDate: '2025-07-26',
  },
  {
    id: '7',
    text: 'Match the following hooks with their primary use cases',
    type: 'Matching',
    difficulty: 'Medium',
    category: 'React',
    createdDate: '2025-07-27',
  },
  {
    id: '8',
    text: 'Arrange the following lifecycle phases in the correct order',
    type: 'Ordering',
    difficulty: 'Hard',
    category: 'React',
    createdDate: '2025-07-28',
  }
];

const Questions: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  
  const filteredQuestions = mockQuestions.filter(question => {
    const matchesSearch = question.text.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || question.category === filterCategory;
    const matchesType = filterType === 'all' || question.type === filterType;
    const matchesDifficulty = filterDifficulty === 'all' || question.difficulty === filterDifficulty;
    
    return matchesSearch && matchesCategory && matchesType && matchesDifficulty;
  });

  // Get unique categories, types, and difficulties for filter dropdowns
  const categories = ['all', ...new Set(mockQuestions.map(q => q.category))];
  const types = ['all', ...new Set(mockQuestions.map(q => q.type))];
  const difficulties = ['all', ...new Set(mockQuestions.map(q => q.difficulty))];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Questions Bank</h1>
          <p className="text-gray-400 mt-1">
            Manage and create questions for your exams
          </p>
        </div>
        
        <div className="mt-4 md:mt-0 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          <button className="px-4 py-2 bg-gradient-to-r from-[#5cffc9] to-[#00ac76] hover:from-[#4be3b0] to-[#008f5f] text-white rounded-lg text-sm font-medium flex items-center transition-all">
            <Plus className="h-4 w-4 mr-2" />
            Add Question
          </button>
          <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg text-sm font-medium flex items-center transition-colors">
            <FileUp className="h-4 w-4 mr-2" />
            Import from Excel
          </button>
        </div>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            
            className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-lg bg-[#121212] text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#5cffc9] focus:border-transparent"
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Category filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Filter className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-lg bg-[#121212] text-white focus:outline-none focus:ring-2 focus:ring-[#5cffc9] focus:border-transparent appearance-none"
            >
              <option value="all">All Categories</option>
              {categories.filter(c => c !== 'all').map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 20 20" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          
          {/* Question type filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <HelpCircle className="h-5 w-5 text-gray-400" />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-lg bg-[#121212] text-white focus:outline-none focus:ring-2 focus:ring-[#5cffc9] focus:border-transparent appearance-none"
            >
              <option value="all">All Types</option>
              {types.filter(t => t !== 'all').map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 20 20" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          
          {/* Difficulty filter */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-700 rounded-lg bg-[#121212] text-white focus:outline-none focus:ring-2 focus:ring-[#5cffc9] focus:border-transparent appearance-none"
            >
              <option value="all">All Difficulties</option>
              {difficulties.filter(d => d !== 'all').map(difficulty => (
                <option key={difficulty} value={difficulty}>{difficulty}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 20 20" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Questions table */}
      <div className="bg-[#121212] rounded-xl border border-gray-700 overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-[#121212]">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Question
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Category
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Difficulty
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Created Date
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredQuestions.map((question) => (
                <tr key={question.id} className="hover:bg-gray-700/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-white line-clamp-2">{question.text}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium 
                      ${question.type === 'Single Choice' ? 'bg-[#5cffc9]/40 text-[#5cffc9]' : ''}
                      ${question.type === 'Multiple Choice' ? 'bg-[#00ac76]/40 text-[#00ac76]' : ''}
                      ${question.type === 'Essay' ? 'bg-[#5cffc9]/40 text-[#5cffc9]' : ''}
                      ${question.type === 'Matching' ? 'bg-[#00ac76]/40 text-[#00ac76]' : ''}
                      ${question.type === 'Ordering' ? 'bg-[#5cffc9]/40 text-[#5cffc9]' : ''}
                    `}>
                      {question.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-400">{question.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium 
                      ${question.difficulty === 'Easy' ? 'bg-[#00ac76]/40 text-[#00ac76]' : ''}
                      ${question.difficulty === 'Medium' ? 'bg-[#5cffc9]/40 text-[#5cffc9]' : ''}
                      ${question.difficulty === 'Hard' ? 'bg-red-900/40 text-red-400' : ''}
                    `}>
                      {question.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-400">{question.createdDate}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-[#5cffc9] hover:text-[#4be3b0] mr-3">
                      <Edit className="h-5 w-5" />
                    </button>
                    <button className="text-red-400 hover:text-red-300">
                      <Trash className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {filteredQuestions.length === 0 && (
        <div className="text-center py-12">
          <div className="bg-[#121212] rounded-xl border border-gray-700 p-8 mx-auto max-w-md backdrop-blur-sm">
            <div className="mx-auto h-16 w-16 rounded-full bg-gray-700 flex items-center justify-center mb-4">
              <HelpCircle className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-white">No questions found</h3>
            <p className="text-gray-400 mt-2">
              No questions match your current filters. Try adjusting your filters or create a new question.
            </p>
            <button className="mt-4 px-4 py-2 bg-gradient-to-r from-[#5cffc9] to-[#00ac76] hover:from-[#4be3b0] hover:to-[#008f5f] text-white rounded-lg text-sm font-medium flex items-center justify-center mx-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Question
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Questions;