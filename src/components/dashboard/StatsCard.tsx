import React from 'react';
import { useTheme } from '../../context/ThemeContext';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon }) => {
  const { isDark } = useTheme();

  return (
    <div className={`p-6 rounded-xl border backdrop-blur-sm glass-effect ${
      isDark ? 'bg-gradient-to-r from-primary/30 to-secondary/30 border-gray-700' : 'bg-gradient-to-r from-light-text/30 to-gray-600/30 border-gray-300'
    }`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{title}</p>
          <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-light-text'}`}>{value}</p>
        </div>
        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
          isDark ? 'bg-primary/70' : 'bg-light-text/70'
        }`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;