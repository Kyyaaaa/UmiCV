import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  text?: string;
}

export function LoadingState({ text = 'Đang tải dữ liệu...' }: LoadingStateProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center p-8 text-slate-500">
      <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      <p className="mt-4 text-sm font-medium">{text}</p>
    </div>
  );
}
