import React, { ReactNode } from 'react';
import { ArrowDown, ArrowUp, Minus } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  trend: 'up' | 'down' | 'neutral';
  description: string;
  bgClass: string; // You can still use this for custom gradients if needed
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  trend,
  description,
  bgClass,
}) => {
  return (
    <div className="rounded-xl border border-[#5cffc9] bg-[#121212] font-poppins overflow-hidden">
      <div className={`bg-gradient-to-r from-[#5cffc9] to-[#00ac76] p-6`}>
        <div className="flex justify-between">
          <div>
            <p className="text-[#121212]/70 text-sm font-medium font-glacial">{title}</p>
            <p className="text-2xl font-bold text-[#121212] mt-1">{value}</p>
          </div>
          <div className="h-12 w-12 rounded-lg bg-[#121212]/20 flex items-center justify-center text-[#121212]">
            {icon}
          </div>
        </div>
        
        <div className="flex items-center mt-4">
          {trend === 'up' && <ArrowUp className="h-4 w-4 text-[#00ac76] mr-1" />}
          {trend === 'down' && <ArrowDown className="h-4 w-4 text-red-400 mr-1" />}
          {trend === 'neutral' && <Minus className="h-4 w-4 text-[#121212] mr-1" />}
          
          <p className={`text-xs font-medium ${
            trend === 'up' ? 'text-[#00ac76]' : 
            trend === 'down' ? 'text-red-400' : 
            'text-[#121212]'
          }`}>
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
