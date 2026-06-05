import React, { useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { mockNotifications } from '../../mocks/notifications.mock';
import { Button } from '../../components/ui/Button';
import { Check, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

export function NotificationCenterPage() {
  const [notifications, setNotifications] = useState(mockNotifications);

  const markAllAsRead = () => {
    setNotifications(notifications.map(n => ({ ...n, isRead: true })));
  };

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
        actions={
          <Button variant="outline" onClick={markAllAsRead}>
            <Check size={16} className="mr-2" />
            Đánh dấu đã đọc tất cả
          </Button>
        }
      />

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-12 text-slate-500">Bạn không có thông báo nào.</div>
        ) : (
          notifications.map(notification => (
            <div 
              key={notification.id}
              className={cn(
                "flex items-start gap-4 rounded-xl border p-4 transition-colors",
                notification.isRead ? "border-slate-200 bg-white" : "border-blue-100 bg-blue-50"
              )}
            >
              <div className="mt-1 flex-shrink-0">
                {getIcon(notification.type)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className={cn("font-semibold", notification.isRead ? "text-slate-700" : "text-slate-900")}>
                    {notification.title}
                  </h4>
                  <span className="text-xs text-slate-500">
                    {new Date(notification.createdAt).toLocaleString('vi-VN')}
                  </span>
                </div>
                <p className={cn("mt-1 text-sm", notification.isRead ? "text-slate-500" : "text-slate-700")}>
                  {notification.message}
                </p>
                {notification.link && (
                  <a href={notification.link} className="mt-2 inline-block text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline">
                    Xem chi tiết &rarr;
                  </a>
                )}
              </div>
              {!notification.isRead && (
                <div className="h-2 w-2 flex-shrink-0 rounded-full bg-blue-600 mt-2"></div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
