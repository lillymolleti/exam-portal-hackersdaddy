import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Users, Award, FileText, BarChart2, ChevronRight, Sun, Moon } from 'lucide-react';
import StatsCard from '../../components/dashboard/StatsCard';
import { Link } from 'react-router-dom';
import { Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Filler, // Added for fill option
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Filler // Added for fill option
);

// Mock data for active exams
const activeExams = [
  { id: '1', title: 'Web Development Fundamentals', activeStudents: 32, totalStudents: 45, startTime: '09:00 AM' },
  { id: '2', title: 'Data Structures and Algorithms', activeStudents: 28, totalStudents: 38, startTime: '10:30 AM' },
  { id: '3', title: 'JavaScript Programming', activeStudents: 15, totalStudents: 25, startTime: '01:00 PM' },
];

// Mock data for recent results
const recentResults = [
  { id: '1', examTitle: 'Web Development', avgScore: 72, passRate: 85, date: '2025-08-05' },
  { id: '2', examTitle: 'Database Systems', avgScore: 68, passRate: 78, date: '2025-08-03' },
  { id: '3', examTitle: 'Computer Networks', avgScore: 75, passRate: 90, date: '2025-07-30' },
];

const Dashboard = () => {
  const { user } = useAuth();
  const [theme, setTheme] = useState('dark');

  // Toggle dark mode by adding/removing 'dark' class on <html>
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  // Chart colors based on theme
  const chartTextColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)';
  const chartGridColor = theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

  // Doughnut chart data - Pass/Fail/Pending distribution
  const doughnutData = {
    labels: ['Passed', 'Failed', 'Pending'],
    datasets: [
      {
        data: [65, 15, 20],
        backgroundColor: [
          'rgba(0, 172, 118, 0.7)', // secondary (#00ac76)
          'rgba(239, 68, 68, 0.7)', // red
          'rgba(251, 191, 36, 0.7)', // yellow
        ],
        borderColor: [
          'rgba(0, 172, 118, 1)', // secondary
          'rgba(239, 68, 68, 1)',
          'rgba(251, 191, 36, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Line chart data - Active Students over a week
  const lineData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Active Students',
        data: [65, 75, 52, 91, 83, 56, 80],
        borderColor: 'rgba(92, 255, 201, 1)', // primary (#5cffc9)
        backgroundColor: 'rgba(92, 255, 201, 0.1)', // primary with opacity
        tension: 0.4,
        fill: true,
      },
    ],
  };

  // Common chart options for both charts
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: chartTextColor,
          font: { size: 12, family: 'Poppins' },
        },
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: chartGridColor },
        ticks: { color: chartTextColor, font: { family: 'Poppins' } },
      },
      x: {
        grid: { color: chartGridColor },
        ticks: { color: chartTextColor, font: { family: 'Poppins' } },
      },
    },
  };

  return (
    <div className="space-y-6 font-poppins bg-white dark:bg-darkbg/80">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-primary font-glacial">Admin Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Monitor ongoing exams and student performance</p>
        </div>
        <div className="mt-4 md:mt-0 flex items-center space-x-4">
          <span className="px-4 py-2 rounded-full bg-gray-200 dark:bg-secondary/20 text-gray-900 dark:text-secondary border border-gray-300 dark:border-secondary/30 text-sm font-medium">
            Admin Portal
          </span>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full bg-gray-200 dark:bg-secondary/20 text-gray-900 dark:text-secondary hover:bg-gray-300 dark:hover:bg-secondary/30 transition-colors"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Active Students"
          value="75"
          icon={<Users className="h-6 w-6 text-gray-900 dark:text-primary" />}
          trend="up"
          description="12% increase"
          bgClass="from-gray-200 dark:from-primary/40 to-gray-300 dark:to-secondary/40"
        />
        <StatsCard
          title="Avg. Score"
          value="72%"
          icon={<Award className="h-6 w-6 text-gray-900 dark:text-secondary" />}
          trend="up"
          description="3% increase"
          bgClass="from-gray-200 dark:from-secondary/40 to-gray-300 dark:to-primary/40"
        />
        <StatsCard
          title="Active Exams"
          value="3"
          icon={<FileText className="h-6 w-6 text-gray-900 dark:text-primary" />}
          trend="neutral"
          description="Same as yesterday"
          bgClass="from-gray-200 dark:from-primary/40 to-gray-300 dark:to-secondary/40"
        />
        <StatsCard
          title="Questions"
          value="450"
          icon={<BarChart2 className="h-6 w-6 text-gray-900 dark:text-secondary" />}
          trend="up"
          description="50 new added"
          bgClass="from-gray-200 dark:from-secondary/40 to-gray-300 dark:to-primary/40"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart for Active Students */}
        <div className="bg-gray-100 dark:bg-darkbg/80 rounded-xl border border-gray-300 dark:border-gray-600 p-6 backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white font-glacial mb-4">Active Students (Weekly)</h2>
          <div className="h-72">
            <Line data={lineData} options={chartOptions} />
          </div>
        </div>

        {/* Doughnut Chart for Results */}
        <div className="bg-gray-100 dark:bg-darkbg/80 rounded-xl border border-gray-300 dark:border-gray-600 p-6 backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white font-glacial mb-4">Results Overview</h2>
          <div className="h-72 flex items-center justify-center">
            <Doughnut data={doughnutData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Active Exams Table */}
      <div className="bg-gray-100 dark:bg-darkbg/80 rounded-xl border border-gray-300 dark:border-gray-600 overflow-hidden backdrop-blur-sm">
        <div className="p-6 border-b border-gray-300 dark:border-gray-600 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white font-glacial">Active Exams</h2>
          <Link
            to="/admin/active-students"
            className="text-gray-900 dark:text-primary hover:text-gray-700 dark:hover:text-secondary text-sm font-medium flex items-center"
          >
            View All <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600">
            <thead className="bg-gray-200 dark:bg-darkbg/70">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Exam Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Start Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Students
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Participation
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300 dark:divide-gray-600">
              {activeExams.map((exam) => {
                const participationPercent = Math.round((exam.activeStudents / exam.totalStudents) * 100);
                return (
                  <tr key={exam.id} className="hover:bg-gray-200 dark:hover:bg-gray-600/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">{exam.title}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 dark:text-gray-400">{exam.startTime}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {exam.activeStudents} / {exam.totalStudents}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-full bg-gray-300 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full"
                          style={{ width: `${participationPercent}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{participationPercent}% participation</div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Results Table */}
      <div className="bg-gray-100 dark:bg-darkbg/80 rounded-xl border border-gray-300 dark:border-gray-600 overflow-hidden backdrop-blur-sm">
        <div className="p-6 border-b border-gray-300 dark:border-gray-600 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white font-glacial">Recent Results</h2>
          <Link
            to="/admin/results"
            className="text-gray-900 dark:text-primary hover:text-gray-700 dark:hover:text-secondary text-sm font-medium flex items-center"
          >
            View All <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-300 dark:divide-gray-600">
            <thead className="bg-gray-200 dark:bg-darkbg/70">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Exam</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Avg. Score</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Pass Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-300 dark:divide-gray-600">
              {recentResults.map((result) => (
                <tr key={result.id} className="hover:bg-gray-200 dark:hover:bg-gray-600/30 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{result.examTitle}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500 dark:text-gray-400">{result.date}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">{result.avgScore}%</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="mr-2 text-sm font-medium text-gray-900 dark:text-white">{result.passRate}%</div>
                      <div className="w-24 bg-gray-300 dark:bg-gray-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            result.passRate >= 80
                              ? 'bg-secondary'
                              : result.passRate >= 50
                              ? 'bg-primary'
                              : 'bg-red-500'
                          }`}
                          style={{ width: `${result.passRate}%` }}
                        />
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;