import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { SearchBox } from '../../components/common/SearchBox';
import { FilterPanel } from '../../components/common/FilterPanel';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { mockCVs } from '../../mocks/cvs.mock';
import { CVProfile } from '../../types';
import { Plus } from 'lucide-react';

export function CVListPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filteredCVs = mockCVs.filter(cv => {
    const matchesSearch = cv.sectionsData.personalInfo.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter ? cv.status === statusFilter : true;
    return matchesSearch && matchesStatus;
  });

  const columns: Column<CVProfile>[] = [
    {
      key: 'name',
      header: 'Họ và tên',
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
      key: 'language',
      header: 'Ngôn ngữ',
      render: (cv) => <span className="uppercase">{cv.languageCode}</span>,
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (cv) => <StatusBadge status={cv.status} type="cv" />,
    },
    {
      key: 'updatedAt',
      header: 'Cập nhật',
      render: (cv) => new Date(cv.updatedAt).toLocaleDateString('vi-VN'),
    },
    {
      key: 'actions',
      header: '',
      render: (cv) => (
        <div className="flex justify-end gap-2">
          <Button variant="outline" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/cv/${cv.id}/edit`); }}>
            Sửa
          </Button>
          <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); navigate(`/cv/${cv.id}`); }}>
            Xem
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader 
        title="Quản lý CV" 
        description="Quản lý danh sách CV của nhân viên trong hệ thống" 
        actions={
          <Button onClick={() => navigate('/cv/create')}>
            <Plus size={16} className="mr-2" />
            Tạo mới CV
          </Button>
        }
      />

      <FilterPanel>
        <div className="w-64">
          <SearchBox value={searchTerm} onChange={setSearchTerm} placeholder="Tìm theo tên..." />
        </div>
        <div className="w-48">
          <Select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            options={[
              { value: '', label: 'Tất cả trạng thái' },
              { value: 'Draft', label: 'Nháp' },
              { value: 'PendingApproval', label: 'Chờ duyệt' },
              { value: 'Outdated', label: 'Chưa cập nhật' },
              { value: 'Updated', label: 'Đã cập nhật' },
            ]}
          />
        </div>
      </FilterPanel>

      <DataTable
        columns={columns}
        data={filteredCVs}
        keyExtractor={(item) => item.id}
        onRowClick={(item) => navigate(`/cv/${item.id}`)}
      />
    </div>
  );
}
