import React, { ReactNode } from 'react';
import { Filter } from 'lucide-react';

interface FilterPanelProps {
  children: ReactNode;
}

export function FilterPanel({ children }: FilterPanelProps) {
  return (
    <div className="mb-6 flex flex-wrap items-end gap-4 rounded-lg bg-slate-50 p-4 border border-slate-200">
      <div className="flex h-10 items-center gap-2 pr-4 text-sm font-medium text-slate-600 border-r border-slate-200">
        <Filter size={18} />
        <span>Bộ lọc</span>
      </div>
      {children}
    </div>
  );
}
