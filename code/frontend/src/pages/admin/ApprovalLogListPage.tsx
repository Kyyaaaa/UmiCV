import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { workflowService } from '../../services/workflow.service';
import { format } from 'date-fns';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/common/StatusBadge';

export function ApprovalLogListPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const res = await workflowService.getAllApprovalLogs({ page, limit: 10 });
      setLogs(res.data || []);
      setTotalItems(res.total || 0);
    } catch (error) {
      console.error('Failed to fetch approval logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const columns: Column<any>[] = [
    {
      key: 'createdAt',
      header: 'Thời gian',
      render: (log) => format(new Date(log.createdAt), 'dd/MM/yyyy HH:mm:ss')
    },
    {
      key: 'approverName',
      header: 'Người thực hiện',
      render: (log) => log.approver?.fullName || '-'
    },
    {
      key: 'cvName',
      header: 'Tên CV / Chủ sở hữu',
      render: (log) => log.cvProfile?.user?.fullName || '-'
    },
    {
      key: 'action',
      header: 'Hành động',
      render: (log) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          log.action === 'Approve' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {log.action === 'Approve' ? 'Phê duyệt' : 'Từ chối'}
        </span>
      )
    },
    {
      key: 'level',
      header: 'Cấp duyệt',
      render: (log) => `Level ${log.level}`
    },
    {
      key: 'reason',
      header: 'Lý do',
      render: (log) => log.reason || '-'
    }
  ];

  return (
    <div>
      <PageHeader 
        title="Lịch sử Phê duyệt" 
        description="Xem danh sách lịch sử phê duyệt và từ chối CV" 
      />

      <div className={isLoading ? "opacity-50 pointer-events-none" : ""}>
        <DataTable
          columns={columns}
          data={logs}
          keyExtractor={(item) => item.id}
        />
        
        {totalItems > 0 && (
          <div className="mt-4 flex items-center justify-between px-4 py-3 bg-white border-t border-slate-200 rounded-b-lg shadow-sm">
            <div className="text-sm text-slate-500">
              Hiển thị <span className="font-medium">{(page - 1) * 10 + 1}</span> đến <span className="font-medium">{Math.min(page * 10, totalItems)}</span> trong <span className="font-medium">{totalItems}</span> bản ghi
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
                disabled={page * 10 >= totalItems}
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
