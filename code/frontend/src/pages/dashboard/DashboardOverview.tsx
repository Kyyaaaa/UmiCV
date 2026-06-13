import React, { useState } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { FileText, CheckCircle, Clock, AlertTriangle, Send } from 'lucide-react';
import { DataTable, Column } from '../../components/common/DataTable';
import { mockCVs } from '../../mocks/cvs.mock';
import { StatusBadge } from '../../components/common/StatusBadge';
import { CVProfile } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { notificationService } from '../../services/notification.service';
import { Button } from '../../components/ui/Button';

export function DashboardOverview() {
  const { user } = useAuth();
  
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastType, setBroadcastType] = useState('info');
  const [broadcastLink, setBroadcastLink] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ title: string; type: 'error' | 'success' } | null>(null);

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsBroadcasting(true);
      await notificationService.broadcastNotification({
        title: broadcastTitle,
        message: broadcastMessage,
        type: broadcastType,
        link: broadcastLink || undefined
      });
      setToastMessage({ title: 'Đã gửi thông báo toàn hệ thống', type: 'success' });
      setBroadcastTitle('');
      setBroadcastMessage('');
      setBroadcastLink('');
      setTimeout(() => setToastMessage(null), 3000);
    } catch (error) {
      console.error('Lỗi khi gửi thông báo', error);
      setToastMessage({ title: 'Lỗi khi gửi thông báo', type: 'error' });
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setIsBroadcasting(false);
    }
  };
  const stats = [
    { title: 'Tổng số CV', value: '124', icon: FileText, color: 'text-blue-500' },
    { title: 'CV chờ duyệt', value: '12', icon: Clock, color: 'text-yellow-500' },
    { title: 'CV đã cập nhật', value: '98', icon: CheckCircle, color: 'text-green-500' },
    { title: 'CV chưa cập nhật', value: '14', icon: AlertTriangle, color: 'text-red-500' },
  ];

  const recentColumns: Column<CVProfile>[] = [
    {
      key: 'name',
      header: 'Nhân viên',
      render: (cv) => cv.sectionsData.personalInfo.name,
    },
    {
      key: 'title',
      header: 'Vị trí',
      render: (cv) => cv.sectionsData.personalInfo.role,
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (cv) => <StatusBadge status={cv.status} type="cv" />,
    },
    {
      key: 'updatedAt',
      header: 'Cập nhật lần cuối',
      render: (cv) => new Date(cv.updatedAt).toLocaleDateString('vi-VN'),
    },
  ];

  return (
    <div className="relative">
      {toastMessage && (
        <div className={`fixed top-4 right-4 z-50 rounded-md shadow-lg p-4 max-w-sm ${toastMessage.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-green-50 text-green-800 border border-green-200'}`}>
          <div className="flex items-start">
            <p className="text-sm font-medium">{toastMessage.title}</p>
          </div>
        </div>
      )}

      <PageHeader 
        title="Dashboard" 
        description="Tổng quan về tình trạng CV của toàn bộ hệ thống" 
      />

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.title}</p>
                <h3 className="mt-2 text-3xl font-bold text-slate-900">{stat.value}</h3>
              </div>
              <div className={`rounded-full bg-slate-50 p-3 ${stat.color}`}>
                <stat.icon size={24} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>CV Cập nhật gần đây</CardTitle>
          </CardHeader>
          <CardContent>
            <DataTable
              columns={recentColumns}
              data={mockCVs}
              keyExtractor={(item) => item.id}
            />
          </CardContent>
        </Card>
        {(user?.role === 'Admin' || user?.role === 'HR') && (
          <Card className="col-span-3">
            <CardHeader>
              <CardTitle>Gửi thông báo hệ thống (Broadcast)</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleBroadcast} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Tiêu đề</label>
                  <input
                    type="text"
                    required
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Nhập tiêu đề thông báo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nội dung</label>
                  <textarea
                    required
                    rows={3}
                    value={broadcastMessage}
                    onChange={(e) => setBroadcastMessage(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Nội dung thông báo..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Loại</label>
                    <select
                      value={broadcastType}
                      onChange={(e) => setBroadcastType(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white"
                    >
                      <option value="info">Thông tin (Info)</option>
                      <option value="success">Thành công (Success)</option>
                      <option value="warning">Cảnh báo (Warning)</option>
                      <option value="error">Lỗi (Error)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Đường dẫn (Tùy chọn)</label>
                    <input
                      type="text"
                      value={broadcastLink}
                      onChange={(e) => setBroadcastLink(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="VD: /cv"
                    />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={isBroadcasting}>
                  <Send size={16} className="mr-2" />
                  {isBroadcasting ? 'Đang gửi...' : 'Gửi Broadcast'}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
