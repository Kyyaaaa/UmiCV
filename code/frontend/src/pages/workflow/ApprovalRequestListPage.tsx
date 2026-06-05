import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { mockCVs } from '../../mocks/cvs.mock';
import { CVProfile } from '../../types';
import { Button } from '../../components/ui/Button';
import { CheckSquare } from 'lucide-react';

export function ApprovalRequestListPage() {
  const navigate = useNavigate();
  // Mock filter for CVs that are pending approval
  const pendingCVs = mockCVs.filter(cv => cv.status === 'PendingApproval');

  const columns: Column<CVProfile>[] = [
    {
      key: 'name',
      header: 'Người gửi',
      render: (cv) => (
        <div>
          <p className="font-medium text-slate-900">{cv.sectionsData.personalInfo.fullName}</p>
          <p className="text-xs text-slate-500">{cv.sectionsData.personalInfo.email}</p>
        </div>
      ),
    },
    {
      key: 'title',
      header: 'Vị trí',
      render: (cv) => cv.sectionsData.personalInfo.title,
    },
    {
      key: 'submittedAt',
      header: 'Thời gian gửi',
      render: (cv) => cv.submittedAt ? new Date(cv.submittedAt).toLocaleString('vi-VN') : '',
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (cv) => <StatusBadge status={cv.status} type="cv" />,
    },
    {
      key: 'actions',
      header: '',
      render: (cv) => (
        <div className="flex justify-end">
          <Button size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/workflow/${cv.id}`); }}>
            <CheckSquare size={16} className="mr-1" /> Duyệt
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader 
        title="Yêu cầu phê duyệt" 
        description="Danh sách các CV đang chờ bạn duyệt" 
      />

      <DataTable
        columns={columns}
        data={pendingCVs}
        keyExtractor={(item) => item.id}
        onRowClick={(item) => navigate(`/workflow/${item.id}`)}
        emptyTitle="Không có yêu cầu duyệt"
        emptyDescription="Bạn đã xử lý hết các yêu cầu phê duyệt hiện tại."
      />
    </div>
  );
}
