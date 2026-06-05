import React from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { FileText, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { DataTable, Column } from '../../components/common/DataTable';
import { mockCVs } from '../../mocks/cvs.mock';
import { StatusBadge } from '../../components/common/StatusBadge';
import { CVProfile } from '../../types';

export function DashboardOverview() {
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
      render: (cv) => cv.sectionsData.personalInfo.fullName,
    },
    {
      key: 'title',
      header: 'Vị trí',
      render: (cv) => cv.sectionsData.personalInfo.title,
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
    <div>
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
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Thông báo mới</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-4 rounded-lg border border-slate-100 bg-slate-50 p-3">
                <div className="mt-0.5 rounded-full bg-blue-100 p-1.5 text-blue-600">
                  <FileText size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Chiến dịch cập nhật CV Q3 đã được tạo</p>
                  <p className="text-xs text-slate-500 mt-1">2 giờ trước</p>
                </div>
              </div>
              <div className="flex items-start gap-4 rounded-lg border border-slate-100 bg-slate-50 p-3">
                <div className="mt-0.5 rounded-full bg-yellow-100 p-1.5 text-yellow-600">
                  <Clock size={16} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Có 12 CV đang chờ bạn duyệt</p>
                  <p className="text-xs text-slate-500 mt-1">5 giờ trước</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
