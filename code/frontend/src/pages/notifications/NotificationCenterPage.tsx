import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PageHeader } from '../../components/common/PageHeader';
import { notificationService } from '../../services/notification.service';
import { CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

export function NotificationCenterPage() {
  const navigate = useNavigate();

  const { data: notificationsData, isLoading, error } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.getNotifications().then(res => res.data.data),
    refetchInterval: 30000 // 30 seconds
  });

  const notifications = notificationsData || [];

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="text-green-500" size={24} />;
      case 'error': return <XCircle className="text-red-500" size={24} />;
      case 'warning': return <AlertTriangle className="text-yellow-500" size={24} />;
      case 'info': default: return <Info className="text-blue-500" size={24} />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader 
        title="Thông báo" 
        description="Quản lý tất cả thông báo của bạn trong hệ thống"
      />

      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-12 text-slate-500">Đang tải thông báo...</div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">Lỗi khi tải thông báo</div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12 text-slate-500">Bạn không có thông báo nào.</div>
        ) : (
          notifications.map(notification => (
            <div 
              key={notification.id}
              onClick={() => {
                if (notification.link) {
                  navigate(notification.link);
                }
              }}
              className={cn(
                "flex items-start gap-4 rounded-xl border p-4 transition-colors",
                "border-slate-200 bg-white",
                notification.link ? "cursor-pointer hover:border-blue-300 hover:shadow-sm" : ""
              )}
            >
              <div className="mt-1 flex-shrink-0">
                {getIcon(notification.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-slate-700">
                    {notification.title}
                  </h4>
                  <span className="text-xs text-slate-500">
                    {new Date(notification.createdAt).toLocaleString('vi-VN')}
                  </span>
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  {notification.message}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
