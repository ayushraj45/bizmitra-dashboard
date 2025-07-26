
import React from 'react';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({ title, value, icon, color }) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md p-6 flex items-center space-x-4">
      <div className={`rounded-full p-3 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">{title}</p>
        <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
      </div>
    </div>
  );
};

export default DashboardCard;
