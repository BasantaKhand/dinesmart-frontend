import React from 'react';

interface MostActiveRestaurantsProps {
  mostActive?: Array<{
    id: string;
    name: string;
    totalOrders: number;
    totalRevenue: number;
    users: number;
    daysAgo: string;
    heatmap: number[];
  }>;
}

const heatDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getHeatColor(value: number): string {
  if (value >= 9) return 'bg-orange-500';
  if (value >= 7) return 'bg-orange-400';
  if (value >= 5) return 'bg-orange-300';
  if (value >= 3) return 'bg-orange-200';
  if (value >= 1) return 'bg-orange-100';
  return 'bg-zinc-100';
}

export const MostActiveRestaurants: React.FC<MostActiveRestaurantsProps> = ({ mostActive = [] }) => {
  return (
    <div className="rounded-xl bg-white ring-1 ring-zinc-200 shadow-none p-5 flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <span className="font-semibold text-[15px] text-zinc-800">Most Active Restaurants (Past 7 Days)</span>
        <button className="text-xs font-semibold text-[#FF5C00] hover:underline">View All →</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[13px] min-w-[700px]">
          <thead>
            <tr className="text-zinc-400 text-[11px] uppercase tracking-wider">
              <th className="text-left font-medium pb-3">#</th>
              <th className="text-left font-medium pb-3">Name</th>
              <th className="text-left font-medium pb-3">Total Orders</th>
              <th className="text-left font-medium pb-3">Revenue</th>
              <th className="text-left font-medium pb-3">Users</th>
              <th className="text-left font-medium pb-3">Last Active</th>
              {heatDays.map((day) => (
                <th key={day} className="text-center font-medium pb-3 w-8">{day}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {mostActive.map((r, index) => (
              <tr key={r.id} className="border-t border-zinc-50 hover:bg-zinc-50/50 transition-colors">
                <td className="py-2.5 text-zinc-400 font-medium">{index + 1}</td>
                <td className="py-2.5 font-semibold text-zinc-800">
                  <span className="truncate max-w-[200px] inline-block align-middle" title={r.name}>{r.name}</span>
                </td>
                <td className="py-2.5 text-zinc-600 font-medium">{r.totalOrders}</td>
                <td className="py-2.5 text-zinc-600 font-medium">NPR {r.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}</td>
                <td className="py-2.5 text-zinc-500">{r.users}</td>
                <td className="py-2.5 text-zinc-400">{r.daysAgo}</td>
                {r.heatmap.map((val, i) => (
                  <td key={i} className="py-2.5 text-center">
                    <span
                      className={`inline-block w-5 h-5 rounded-full ${getHeatColor(val)}`}
                      title={`${val} orders`}
                    />
                  </td>
                ))}
              </tr>
            ))}
            {mostActive.length === 0 && (
              <tr>
                <td colSpan={12} className="py-8 text-center text-sm font-medium text-zinc-400">
                  No activity found in the last 7 days.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};