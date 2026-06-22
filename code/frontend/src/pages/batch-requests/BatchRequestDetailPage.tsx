import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { DataTable, Column } from '../../components/common/DataTable';
import { Button } from '../../components/ui/Button';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { BatchRequest, BatchRequestTarget } from '../../types';
import { batchRequestService } from '../../services/batch-request.service';
import { ArrowLeft, Ban, CheckCircle2, Clock, Edit, Trash2 } from 'lucide-react';
import { BatchRequestFormModal } from './BatchRequestFormModal';

export function BatchRequestDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [request, setRequest] = useState<BatchRequest | null>(null);
  const [targets, setTargets] = useState<BatchRequestTarget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ title: string; type: 'error' | 'success' } | null>(null);
  const [remindingTargets, setRemindingTargets] = useState<Record<string, boolean>>({});
  
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const fetchData = React.useCallback(async () => {
    try {
      setIsLoading(true);
      // Fetch both the batch request details and its targets
      // In a real app we might want a specific GET /batch-requests/:id API
      // Since we don't have it explicitly, we can filter from the list or just fetch targets and assume backend returns request details.
      // Wait, backend getBatchRequestTargets returns data: BatchRequestTarget[]. We need the request info too.
      // Let's call getBatchRequests with keyword=id or something?
      // Actually, we can fetch all requests and find it, or build a GET /:id backend endpoint.
      // For now, let's fetch targets. We'll also fetch all requests and find the matching one.
      const [targetsRes, requestsRes] = await Promise.all([
        batchRequestService.getBatchRequestTargets(id!, { page, limit: 10 }),
        batchRequestService.getBatchRequests({ limit: 1000 })
      ]);
      
      setTargets(targetsRes.data.data);
      setTotalItems(targetsRes.data.total);
      const reqInfo = requestsRes.data.data.find(r => r.id === id);
      if (reqInfo) {
        setRequest(reqInfo);
      }
    } catch (err) {
      console.error('Error fetching details', err);
    } finally {
      setIsLoading(false);
    }
  }, [id, page]);

  useEffect(() => {
    if (id) {
      // eslint-disable-next-line
      fetchData();
    }
  }, [id, page, fetchData]);

  const handleCancel = async () => {
    if (!id) return;
    try {
      setIsCanceling(true);
      await batchRequestService.cancelBatchRequest(id);
      setIsCancelModalOpen(false);
      fetchData(); // Refresh to get Cancelled status
    } catch (err) {
      console.error('Lỗi khi hủy', err);
    } finally {
      setIsCanceling(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      setIsDeleting(true);
      await batchRequestService.deleteBatchRequest(id);
      navigate('/hr/batch-requests');
    } catch (err) {
      console.error('Lỗi khi xóa', err);
      setToastMessage({ title: 'Lỗi khi xóa chiến dịch', type: 'error' });
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleEditSave = () => {
    setIsEditModalOpen(false);
    setToastMessage({ title: 'Đã cập nhật chiến dịch thành công', type: 'success' });
    setTimeout(() => setToastMessage(null), 3000);
    fetchData();
  };

  const handleRemind = async (userId: string) => {
    if (!id) return;
    try {
      setRemindingTargets(prev => ({ ...prev, [userId]: true }));
      await batchRequestService.remindTarget(id, userId);
      setToastMessage({ title: 'Đã gửi email nhắc nhở', type: 'success' });
      setTimeout(() => setToastMessage(null), 3000);
    } catch (err) {
      console.error('Lỗi khi gửi nhắc nhở', err);
      setToastMessage({ title: 'Lỗi khi gửi nhắc nhở', type: 'error' });
      setTimeout(() => setToastMessage(null), 3000);
    } finally {
      setRemindingTargets(prev => ({ ...prev, [userId]: false }));
    }
  };

  const columns: Column<BatchRequestTarget>[] = [
    {
      key: 'user',
      header: 'Nhân sự',
      render: (target) => (
        <div className="flex items-center gap-3">
          <img 
            src={target.user?.avatarUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(target.user?.fullName || 'User')}&background=random`} 
            alt={target.user?.fullName}
            className="w-8 h-8 rounded-full border border-slate-200"
          />
          <div>
            <p className="font-medium text-slate-900">{target.user?.fullName}</p>
            <p className="text-xs text-slate-500">{target.user?.email}</p>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      header: 'Trạng thái CV',
      render: (target) => (
        <div className="flex items-center">
          {target.status === 'Updated' ? (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              <CheckCircle2 size={14} className="mr-1" />
              Đã cập nhật
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
              <Clock size={14} className="mr-1" />
              Chưa cập nhật (Outdated)
            </span>
          )}
        </div>
      )
    },
    {
      key: 'updatedAt',
      header: 'Lần cập nhật cuối',
      render: (target) => (
        <span className="text-slate-600 text-sm">
          {new Date(target.updatedAt).toLocaleString('vi-VN')}
        </span>
      )
    },
    {
      key: 'actions',
      header: '',
      render: (target) => (
        <div className="flex justify-end">
          {target.status === 'Outdated' && request?.status === 'Active' && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleRemind(target.userId)}
              disabled={remindingTargets[target.userId]}
            >
              {remindingTargets[target.userId] ? 'Đang gửi...' : 'Nhắc nhở'}
            </Button>
          )}
        </div>
      )
    }
  ];

  if (isLoading && !request) {
    return <div className="p-8 text-center text-slate-500">Đang tải dữ liệu...</div>;
  }

  if (!request) {
    return <div className="p-8 text-center text-red-500">Không tìm thấy thông tin chiến dịch</div>;
  }

  return (
    <div className="relative">
      {toastMessage && (
        <div className={`fixed top-4 right-4 z-50 rounded-md shadow-lg p-4 max-w-sm ${toastMessage.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-green-50 text-green-800 border border-green-200'}`}>
          <div className="flex items-start">
            <p className="text-sm font-medium">{toastMessage.title}</p>
          </div>
        </div>
      )}

      <Button 
        variant="ghost" 
        size="sm" 
        className="mb-4 text-slate-500"
        onClick={() => navigate('/hr/batch-requests')}
      >
        <ArrowLeft size={16} className="mr-2" />
        Quay lại danh sách
      </Button>

      <PageHeader 
        title={request.title} 
        description={request.description || 'Chi tiết tiến độ cập nhật CV của nhân sự trong chiến dịch'}
        actions={
          <div className="flex items-center gap-3">
            {request.status === 'Active' ? (
              <>
                {new Date(request.deadline).getTime() + 86400000 < new Date().getTime() && (
                  <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-red-100 text-red-800">
                    Quá hạn
                  </span>
                )}
                <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
                  <Edit size={16} className="mr-2" />
                  Chỉnh sửa
                </Button>
                <Button variant="danger" onClick={() => setIsCancelModalOpen(true)}>
                  <Ban size={16} className="mr-2" />
                  Hủy
                </Button>
              </>
            ) : request.status === 'Completed' ? (
              <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-green-100 text-green-800">
                Hoàn thành
              </span>
            ) : (
              <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-slate-100 text-slate-800">
                Chiến dịch đã bị hủy
              </span>
            )}
            <Button variant="danger" onClick={() => setIsDeleteModalOpen(true)} className="ml-2 bg-red-600 hover:bg-red-700 text-white p-2">
              <Trash2 size={16} />
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500 mb-1">Thời hạn (Deadline)</p>
          <p className="text-lg font-medium text-slate-900">{new Date(request.deadline).toLocaleDateString('vi-VN')}</p>
        </div>
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500 mb-1">Tiến độ tổng quan</p>
          <p className="text-lg font-medium text-blue-600">{request.completedCount} / {request.targetCount} Hoàn thành</p>
        </div>
        <div className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm">
          <p className="text-sm text-slate-500 mb-1">Ngày tạo</p>
          <p className="text-lg font-medium text-slate-900">{new Date(request.createdAt).toLocaleDateString('vi-VN')}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h3 className="font-medium text-slate-900">Danh sách nhân sự mục tiêu ({totalItems})</h3>
        </div>
        <div className="p-0">
          <DataTable
            columns={columns}
            data={targets}
            keyExtractor={(item) => item.userId}
            isLoading={isLoading}
          />
        </div>
        {totalItems > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-white">
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

      <ConfirmModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        onConfirm={handleCancel}
        title="Xác nhận hủy chiến dịch"
        description="Bạn có chắc chắn muốn hủy chiến dịch này? Các nhân sự chưa cập nhật CV sẽ không bị ép buộc cập nhật nữa. Hành động này không thể hoàn tác."
        confirmText="Hủy chiến dịch"
        type="danger"
        isLoading={isCanceling}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDelete}
        title="Xác nhận xóa chiến dịch"
        description="Bạn có chắc muốn xóa vĩnh viễn chiến dịch này? Các nhân sự đang bị yêu cầu sẽ được gỡ bỏ ràng buộc cập nhật."
        confirmText="Xóa vĩnh viễn"
        type="danger"
        isLoading={isDeleting}
      />

      <BatchRequestFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleEditSave}
        initialData={{ ...request, targets }}
      />
    </div>
  );
}
