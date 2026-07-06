import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { auditService, AuditLog } from '../../services/audit.service';
import { format } from 'date-fns';
import { Button } from '../../components/ui/Button';

export function AuditLogListPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const fetchLogs = async () => {
    try {
      setIsLoading(true);
      const res = await auditService.getAuditLogs({ page, limit: 10 });
      setLogs(res.data || []);
      setTotalItems(res.total || 0);
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const columns: Column<AuditLog>[] = [
    {
      key: 'timestamp',
      header: 'Thời gian',
      render: (log) => log.timestamp ? format(new Date(log.timestamp), 'dd/MM/yyyy HH:mm:ss') : '-'
    },
    {
      key: 'action',
      header: 'Hành động',
      render: (log) => <span className="font-medium text-slate-700">{log.action}</span>
    },
    {
      key: 'user',
      header: 'Người thực hiện',
      render: (log) => log.user ? `${log.user.fullName} (${log.user.username})` : log.userId
    },
    {
      key: 'resourceId',
      header: 'Đối tượng bị tác động (Resource ID)',
      render: (log) => log.resourceId || '-'
    }
  ];

  return (
    <div>
      <PageHeader 
        title="Nhật ký Hệ thống (Audit Logs)" 
        description="Giám sát các thao tác cập nhật, tạo mới, hoặc thay đổi hệ thống" 
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
