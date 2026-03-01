import React from 'react';
import { MoreHorizontal } from 'lucide-react';

interface RecentlySuspendedProps {
  suspensions?: Array<{
    _id: string;
    name: string;
    address: string;
    updatedAt: string;
    createdAt: string;
  }>;
}

export const RecentlySuspended: React.FC<RecentlySuspendedProps> = ({ suspensions }) => {
  const displaySuspensions = suspensions || [];

  return (
    <div className="rounded-xl bg-white ring-1 ring-zinc-200 shadow-none p-5 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <span className="font-semibold text-[15px] text-zinc-800">Recently Suspended</span>
        <button className="text-xs font-semibold text-[#FF5C00] hover:underline">View All →</button>
      </div>
      <div className="flex flex-col gap-3 flex-1">
        {displaySuspensions.length > 0 ? (
          displaySuspensions.map((item) => (
            <div key={item._id} className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                <div className="flex flex-col">
                  <span className="text-[13px] font-semibold text-zinc-800 truncate max-w-[120px]" title={item.name}>{item.name}</span>
                  <span className="text-[11px] text-zinc-400 truncate max-w-[120px]" title={item.address}>{new Date(item.updatedAt || item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} • {item.address || 'No Address'}</span>
                </div>
              </div>
              <button className="px-3 py-1.5 rounded-lg bg-[#FF5C00] text-white text-[11px] font-semibold hover:bg-[#E05200] transition-colors shadow-none">
                Review
              </button>
            </div>
          ))
        ) : (
          <div className="flex-1 flex items-center justify-center text-sm font-medium text-zinc-400">
            No recently suspended restaurants.
          </div>
        )}
      </div>
    </div>
  );
};
