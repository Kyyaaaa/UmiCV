import React from 'react';
import { Save, AlertCircle } from 'lucide-react';

interface DraftIndicatorProps {
  unsavedChangesCount: number;
  lastSavedAt: Date | null;
}

export function DraftIndicator({ unsavedChangesCount, lastSavedAt }: DraftIndicatorProps) {
  if (unsavedChangesCount === 0) {
    return (
      <div className="flex items-center text-sm text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
        <Save size={14} className="mr-2" />
        Đã lưu {lastSavedAt ? `lúc ${lastSavedAt.toLocaleTimeString('vi-VN')}` : ''}
      </div>
    );
  }

  return (
    <div className="flex items-center text-sm text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
      <AlertCircle size={14} className="mr-2" />
      {unsavedChangesCount} thay đổi chưa lưu
    </div>
  );
}
