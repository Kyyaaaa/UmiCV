import React from 'react';
import { Clock } from 'lucide-react';
import { ApprovalLog } from '../../types';

interface ApprovalTimelineProps {
  logs: ApprovalLog[];
}

export function ApprovalTimeline({ logs }: ApprovalTimelineProps) {
  return (
    <div className="space-y-6">
      {logs.length > 0 ? logs.map((log, idx) => (
        <div key={idx} className="relative pl-6 before:absolute before:left-0 before:top-2 before:h-2 before:w-2 before:rounded-full before:bg-slate-300">
          <p className="text-sm font-medium text-slate-900">
            {log.action === 'Approve' ? 'Đã duyệt (Cấp 1)' : 'Đã từ chối'}
          </p>
          <p className="text-xs text-slate-500 mt-1">{new Date(log.createdAt).toLocaleString('vi-VN')}</p>
          {log.reason && (
            <div className="mt-2 rounded-md bg-red-50 p-2 text-sm text-red-700">
              {log.reason}
            </div>
          )}
        </div>
      )) : (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Clock size={16} /> Chưa có lịch sử duyệt
        </div>
      )}
      
      <div className="relative pl-6 before:absolute before:left-0 before:top-2 before:h-2 before:w-2 before:rounded-full before:bg-blue-500">
        <p className="text-sm font-medium text-blue-600">Đang chờ duyệt (Cấp {logs.length + 1})</p>
        <p className="text-xs text-slate-500 mt-1">Hiện tại</p>
      </div>
    </div>
  );
}
