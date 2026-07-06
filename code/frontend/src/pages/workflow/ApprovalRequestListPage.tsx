import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { StatusBadge } from '../../components/common/StatusBadge';
import { SearchBox } from '../../components/common/SearchBox';
import { FilterPanel } from '../../components/common/FilterPanel';
import { CVProfile } from '../../types';
import { Button } from '../../components/ui/Button';
import { CheckSquare } from 'lucide-react';
import { workflowService } from '../../services/workflow.service';

export function ApprovalRequestListPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [slaFilter, setSlaFilter] = useState('all');
  const [pendingCVs, setPendingCVs] = useState<CVProfile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const limit = 10;

  const [errorMsg, setErrorMsg] = useState('');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(1); // Reset page on new search
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchCVs = async () => {
    try {
      setIsLoading(true);
      setErrorMsg('');
      const params: any = { 
        status: 'PendingApproval',
        page,
        limit
      };
      
      if (debouncedSearchTerm) {
        params.keyword = debouncedSearchTerm;
      }
      
      if (slaFilter !== 'all') {
        params.slaStatus = slaFilter;
      }

      const res = await workflowService.searchCVs(params);
      setPendingCVs(res.data);
      setTotalItems(res.total || 0);
    } catch (error: any) {
      console.error('Failed to fetch approval requests', error);
      if (error?.response?.status === 403) {
        setErrorMsg('Bạn không có quyền truy cập vào danh sách này');
      } else {
        setErrorMsg('Có lỗi xảy ra khi tải danh sách');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCVs();
  }, [debouncedSearchTerm, slaFilter, page]);

  const columns: Column<CVProfile>[] = [
    {
      key: 'name',
      header: 'Người gửi',
      render: (cv) => (
        <div>
          <p className="font-medium text-slate-900">{cv.user?.username || 'Unknown'}</p>
          <p className="text-xs text-slate-500">{cv.user?.fullName || ''}</p>
        </div>
      ),
    },
    {
      key: 'submittedAt',
      header: 'Thời gian gửi',
      render: (cv) => cv.submittedAt ? new Date(cv.submittedAt).toLocaleString('vi-VN') : '',
    },
    {
      key: 'slaStatus',
      header: 'Hạn xử lý (SLA)',
      render: (cv) => {
        if (!cv.slaStatus || cv.slaStatus === 'Safe') {
          return <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">An toàn</span>;
        }
        if (cv.slaStatus === 'Warning') {
          return <span className="inline-flex items-center rounded-full bg-yellow-50 px-2 py-1 text-xs font-medium text-yellow-800 ring-1 ring-inset ring-yellow-600/20">Sắp hết hạn</span>;
        }
        return <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">Quá hạn</span>;
      }
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

      {errorMsg && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
          {errorMsg}
        </div>
      )}

      <FilterPanel>
        <div className="flex-1 min-w-[200px]">
          <SearchBox 
            value={searchTerm} 
            onChange={setSearchTerm} 
            placeholder="Tìm theo tên nhân sự..." 
          />
        </div>
        <div className="flex gap-4">
          <select 
            className="h-10 rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            value={slaFilter}
            onChange={(e) => {
              setSlaFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="all">Tất cả SLA</option>
            <option value="Safe">An toàn</option>
            <option value="Warning">Sắp hết hạn</option>
            <option value="Overdue">Quá hạn</option>
          </select>
        </div>
      </FilterPanel>

      <div className={isLoading ? "opacity-50 pointer-events-none" : ""}>
        <DataTable
          columns={columns}
          data={pendingCVs}
          keyExtractor={(item) => item.id}
          onRowClick={(item) => navigate(`/workflow/${item.id}`)}
          emptyTitle="Không có yêu cầu duyệt"
          emptyDescription={searchTerm ? "Không tìm thấy yêu cầu duyệt nào khớp với từ khóa." : "Bạn đã xử lý hết các yêu cầu phê duyệt hiện tại."}
        />

        {totalItems > 0 && (
          <div className="mt-4 flex items-center justify-between px-4 py-3 bg-white border-t border-slate-200 rounded-b-lg shadow-sm">
            <div className="text-sm text-slate-500">
              Hiển thị <span className="font-medium">{(page - 1) * limit + 1}</span> đến <span className="font-medium">{Math.min(page * limit, totalItems)}</span> trong <span className="font-medium">{totalItems}</span> yêu cầu
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
    </div>
  );
}
