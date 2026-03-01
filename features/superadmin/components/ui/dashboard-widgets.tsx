import React from 'react';

export const PlaceholderWidget: React.FC<{ title: string; height?: number }> = ({ title, height = 220 }) => (
  <div className="rounded-2xl bg-white ring-1 ring-zinc-200 shadow flex flex-col items-center justify-center" style={{ minHeight: height }}>
    <span className="text-zinc-400 font-semibold text-base mb-2">{title}</span>
    <span className="text-zinc-200 text-4xl font-black">--</span>
  </div>
);

// Add more widgets as needed for dashboard scaffolding
