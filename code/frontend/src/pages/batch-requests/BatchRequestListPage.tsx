import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { BatchRequest } from '../../types';
import { batchRequestService } from '../../services/batch-request.service';
import { Plus, Search, Calendar } from 'lucide-react';
import { BatchRequestFormModal } from './BatchRequestFormModal';

export function BatchRequestListPage() {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<BatchRequest[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 10;
  
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState('');
  
  const [isFormOpen, setIsFormOpen] = useState(false);

  useEffect(() => {
    fetchData();
  }, [page, status]);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const res = await batchRequestService.getBatchRequests({
        page,
        limit,
        keyword,
        status: status || undefined
      });
      setRequests(res.data.data);
      setTotalItems(res.data.total);
    } catch (err) {
      console.error('Error fetching batch requests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchData();
  };

  const columns: Column<BatchRequest>[] = [
    {
      key: 'title',
      header: 'Tên chiến dịch',
      render: (req) => (
        <div>
          <p className="font-medium text-slate-900">{req.title}</p>
          {req.description && <p className="text-xs text-slate-500 truncate max-w-xs">{req.description}</p>}
        </div>
      )
    },
    {
      key: 'deadline',
      header: 'Deadline',
      render: (req) => (
        <div className="flex items-center text-sm text-slate-600">
          <Calendar size={14} className="mr-1.5" />
          {new Date(req.deadline).toLocaleDateString('vi-VN')}
        </div>
      )
    },
    {
      key: 'progress',
      header: 'Tiến độ',
      render: (req) => {
        const percent = req.targetCount > 0 ? Math.round((req.completedCount / req.targetCount) * 100) : 0;
        return (
          <div className="w-48">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-600">{req.completedCount} / {req.targetCount} Hoàn thành</span>
              <span className="font-medium">{percent}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5">
              <div 
                className="bg-blue-600 h-1.5 rounded-full" 
                style={{ width: `${percent}%` }}
              ></div>
            </div>
          </div>
        );
      }
    },
    {
      key: 'status',
      header: 'Trạng thái',
      render: (req) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          req.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
        }`}>
          {req.status === 'Active' ? 'Đang chạy' : 'Đã hủy'}
        </span>
      )
    }
  ];

  return (
    <div>
      <PageHeader 
        title="Chiến dịch cập nhật CV" 
        description="Quản lý các đợt yêu cầu nhân sự cập nhật CV hàng loạt"
        actions={
          <Button onClick={() => setIsFormOpen(true)}>
            <Plus size={16} className="mr-2" />
            Tạo chiến dịch mới
          </Button>
        }
      />

      <div className="bg-white p-4 rounded-lg border border-slate-200 mb-6">
        <form onSubmit={handleSearch} className="flex gap-4 items-end">
          <div className="flex-1">
            <Input
              label="Tìm kiếm chiến dịch"
              placeholder="Nhập tên chiến dịch..."
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
            />
          </div>
          <div className="w-48">
            <Select
              label="Trạng thái"
              value={status}
              onChange={e => { setStatus(e.target.value); setPage(1); }}
              options={[
                { value: '', label: 'Tất cả trạng thái' },
                { value: 'Active', label: 'Đang chạy' },
                { value: 'Cancelled', label: 'Đã hủy' }
              ]}
            />
          </div>
          <Button type="submit" variant="secondary">
            <Search size={16} className="mr-2" />
            Tìm kiếm
          </Button>
        </form>
      </div>

      <div className={isLoading ? "opacity-50 pointer-events-none" : ""}>
        <DataTable
          columns={columns}
          data={requests}
          keyExtractor={(item) => item.id}
          onRowClick={(item) => navigate(`/hr/batch-requests/${item.id}`)}
        />
        
        {totalItems > 0 && (
          <div className="mt-4 flex items-center justify-between px-4 py-3 bg-white border-t border-slate-200 rounded-b-lg">
            <div className="text-sm text-slate-500">
              Hiển thị <span className="font-medium">{(page - 1) * limit + 1}</span> đến <span className="font-medium">{Math.min(page * limit, totalItems)}</span> trong <span className="font-medium">{totalItems}</span> chiến dịch
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Trước
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setPage(p => p + 1)}
                disabled={page * limit >= totalItems}
              >
                Sau
              </Button>
            </div>
          </div>
        )}
      </div>

      <BatchRequestFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSave={() => {
          setIsFormOpen(false);
          setPage(1);
          fetchData();
        }}
      />
    </div>
  );
}
