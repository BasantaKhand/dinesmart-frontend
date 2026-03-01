import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ApplicationApprovalRateProps {
  overview?: {
    activeRestaurants: number;
    pendingRestaurants: number;
    suspendedRestaurants: number;
  };
}

export const ApplicationApprovalRate: React.FC<ApplicationApprovalRateProps> = ({ overview }) => {
  const active = overview?.activeRestaurants || 0;
  const pending = overview?.pendingRestaurants || 0;
  const suspended = overview?.suspendedRestaurants || 0;
  const total = active + pending + suspended;

  // Calculate active rate percentage
  const activeRate = total > 0 ? Math.round((active / total) * 100) : 0;

  const data = {
    labels: ['Active', 'Pending', 'Suspended'],
    datasets: [
      {
        data: [active, pending, suspended],
        backgroundColor: ['#FF5C00', '#3B82F6', '#E5E7EB'],
        borderWidth: 0,
        borderRadius: 4,
      },
    ],
  };

  const options: any = {
    cutout: '72%',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: { enabled: true },
    },
  };

  return (
    <div className="rounded-xl bg-white ring-1 ring-zinc-200 shadow-none p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <span className="font-semibold text-[15px] text-zinc-800">Application Status</span>
      </div>
      <div className="flex items-center justify-center flex-1 gap-6">
        {/* Donut */}
        <div className="relative w-[140px] h-[140px] flex-shrink-0">
          <Doughnut data={data} options={options} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-[28px] font-extrabold text-zinc-900 leading-none">{activeRate}%</span>
          </div>
        </div>
        {/* Legend */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF5C00]"></span>
            <span className="text-[13px] text-zinc-600">Active</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <span className="text-[13px] text-zinc-600">Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-zinc-300"></span>
            <span className="text-[13px] text-zinc-600">Suspended</span>
          </div>
        </div>
      </div>
      {/* Stats Row */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-100">
        <div className="text-center flex-1">
          <p className="text-[18px] font-bold text-zinc-900">{active}</p>
          <p className="text-[11px] text-zinc-400 font-medium">Active</p>
        </div>
        <div className="w-px h-8 bg-zinc-100"></div>
        <div className="text-center flex-1">
          <p className="text-[18px] font-bold text-zinc-900">{pending}</p>
          <p className="text-[11px] text-zinc-400 font-medium">Pending</p>
        </div>
        <div className="w-px h-8 bg-zinc-100"></div>
        <div className="text-center flex-1">
          <p className="text-[18px] font-bold text-zinc-900">{suspended}</p>
          <p className="text-[11px] text-zinc-400 font-medium">Suspended</p>
        </div>
      </div>
    </div>
  );
};
