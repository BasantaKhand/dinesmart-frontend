import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface PlatformGrowthChartProps {
  growthData?: {
    labels: string[];
    newRestaurants: number[];
    churn: number[];
  };
}

const options: object = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: { mode: 'index', intersect: false },
  },
  interaction: { mode: 'index', intersect: false },
  scales: {
    x: {
      grid: { display: false },
      ticks: { color: '#aaa', font: { size: 11 } },
      border: { display: false },
    },
    y: {
      beginAtZero: true,
      grid: { color: '#f3f4f6', drawBorder: false },
      ticks: { color: '#aaa', font: { size: 11 }, stepSize: 20 },
      border: { display: false },
    },
  },
};

export const PlatformGrowthChart: React.FC<PlatformGrowthChartProps> = ({ growthData }) => {
  // Format dates for display (e.g. "2024-02-23" -> "Feb 23")
  const formatLabel = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const labels = growthData?.labels?.map(formatLabel) || [];

  const chartData = {
    labels: labels,
    datasets: [
      {
        label: 'New Restaurants',
        data: growthData?.newRestaurants || [],
        borderColor: '#3B82F6',
        backgroundColor: 'rgba(59,130,246,0.06)',
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
        borderWidth: 2,
        fill: true,
      },
      {
        label: 'Churn',
        data: growthData?.churn || [],
        borderColor: '#F97316',
        backgroundColor: 'rgba(249,115,22,0.06)',
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
        borderWidth: 2,
        fill: true,
      },
    ],
  };

  return (
    <div className="rounded-xl bg-white ring-1 ring-zinc-200 shadow-none p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <span className="font-semibold text-[15px] text-zinc-800">Platform Growth</span>
        <div className="relative">
          <select className="appearance-none bg-zinc-50 border border-zinc-200 text-zinc-700 text-xs font-semibold rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#FF5C00]/20 focus:border-[#FF5C00] cursor-pointer transition-colors hover:bg-zinc-100">
            <option value="30">Last 30 Days</option>
            <option value="7">Last 7 Days</option>
            <option value="90">Last 90 Days</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-zinc-500">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
        </div>
      </div>
      <div className="flex-1 min-h-[200px]">
        {labels.length > 0 ? (
          <Line data={chartData} options={options} />
        ) : (
          <div className="h-full flex items-center justify-center text-sm font-medium text-zinc-400">
            No growth data available
          </div>
        )}
      </div>
      <div className="flex items-center gap-5 mt-3 px-1">
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-blue-500"></span>
          <span className="text-xs text-zinc-500">New Restaurants</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-orange-500"></span>
          <span className="text-xs text-zinc-500">Churn</span>
        </div>
      </div>
    </div>
  );
};
