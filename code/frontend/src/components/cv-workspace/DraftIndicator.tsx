import React from 'react';
import { Save, AlertCircle, Loader2 } from 'lucide-react';

interface DraftIndicatorProps {
  isDirty: boolean;
  lastSavedAt: Date | null;
  isSaving?: boolean;
}

export function DraftIndicator({ isDirty, lastSavedAt, isSaving }: DraftIndicatorProps) {
  if (isSaving) {
    return (
      <div className="flex items-center text-sm text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">
        <Loader2 size={14} className="mr-2 animate-spin" />
        Đang lưu...
      </div>
    );
  }

  if (!isDirty) {
    return (
      <div className="flex items-center text-sm text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
        <Save size={14} className="mr-2" />
        ✓ Đã lưu {lastSavedAt && !isNaN(lastSavedAt.getTime()) ? `lúc ${lastSavedAt.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}` : ''}
      </div>
    );
  }

  return (
    <div className="flex items-center text-sm text-amber-700 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
      <AlertCircle size={14} className="mr-2" />
      ● Chưa lưu thay đổi
    </div>
  );
}
