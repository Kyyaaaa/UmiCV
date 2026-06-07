import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { Modal } from '../../components/ui/Modal';
import { ArrowLeft, Check, X, Clock } from 'lucide-react';
import { CVPreviewPanel } from '../../components/cv-workspace/CVPreviewPanel';
import { ApprovalTimeline } from '../../components/workflow/ApprovalTimeline';
import { workflowService } from '../../services/workflow.service';
import { cvService } from '../../services/cv.service';
import { CVProfile, ApprovalLog } from '../../types';
import { useAuth } from '../../hooks/useAuth';

export function ApprovalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cv, setCv] = useState<CVProfile | null>(null);
  const [logs, setLogs] = useState<ApprovalLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [approveError, setApproveError] = useState('');
  const [toastMessage, setToastMessage] = useState<{ title: string; type: 'error' | 'success' } | null>(null);

  useEffect(() => {
    if (id) {
      fetchData(id);
    }
  }, [id]);

  const fetchData = async (cvId: string) => {
    try {
      setIsLoading(true);
      const [cvRes, logsRes] = await Promise.all([
        cvService.getCVById(cvId),
        workflowService.getApprovalLogs(cvId).catch(() => ({ data: [] }))
      ]);
      setCv(cvRes.data);
      setLogs(logsRes.data);
    } catch (err) {
      console.error('Failed to fetch approval detail', err);
    } finally {
      setIsLoading(false);
    }
  };

  const showRaceConditionToast = () => {
    setToastMessage({ title: 'Thao tác thất bại: CV này đã được một Tech Lead khác xử lý trước đó.', type: 'error' });
    setTimeout(() => {
      setToastMessage(null);
      navigate('/workflow');
    }, 2500);
  };

  const handleApprove = async () => {
    if (!id || !user) return;
    try {
      setIsSubmitting(true);
      setApproveError('');
      const level = user.role === 'TechLead' ? 1 : 2;
      await workflowService.approveCV(id, level);
      setIsApproveOpen(false);
      navigate('/workflow');
    } catch (err: any) {
      console.error('Approve failed', err);
      const msg = err.response?.data?.message || '';
      if (err.response?.status === 400 && (msg.includes('được duyệt') || msg.includes('khác xử lý') || msg.includes('trạng thái'))) {
        setIsApproveOpen(false);
        showRaceConditionToast();
      } else {
        setApproveError(msg || 'Có lỗi xảy ra khi phê duyệt.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!id) return;
    if (!rejectReason.trim()) {
      setError('Vui lòng nhập lý do từ chối');
      return;
    }
    try {
      setIsSubmitting(true);
      setError('');
      await workflowService.rejectCV(id, rejectReason);
      setIsRejectOpen(false);
      navigate('/workflow');
    } catch (err: any) {
      console.error('Reject failed', err);
      const msg = err.response?.data?.message || '';
      if (err.response?.status === 400 && (msg.includes('được duyệt') || msg.includes('khác xử lý') || msg.includes('trạng thái'))) {
        setIsRejectOpen(false);
        showRaceConditionToast();
      } else {
        setError(msg || 'Có lỗi xảy ra khi từ chối');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !cv) {
    return <div className="p-8 text-center text-slate-500">Đang tải dữ liệu...</div>;
  }

  return (
    <div>
      {toastMessage && (
        <div className={`fixed top-4 right-4 z-50 rounded-md shadow-lg p-4 max-w-sm ${toastMessage.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-green-50 text-green-800 border border-green-200'}`}>
          <div className="flex items-start">
            {toastMessage.type === 'error' ? <X className="h-5 w-5 mr-2 text-red-400" /> : <Check className="h-5 w-5 mr-2 text-green-400" />}
            <p className="text-sm font-medium">{toastMessage.title}</p>
          </div>
        </div>
      )}
      <div className="mb-4">
        <button 
          onClick={() => navigate('/workflow')}
          className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft size={16} className="mr-1" /> Quay lại danh sách
        </button>
      </div>

      <PageHeader 
        title={`Xét duyệt CV: ${cv.sectionsData.personalInfo.fullName}`}
        description={`Phiên bản v${cv.versionNumber} - ${cv.languageCode.toUpperCase()}`}
        actions={
          <>
            <Button variant="danger" onClick={() => setIsRejectOpen(true)}>
              <X size={16} className="mr-2" /> Từ chối
            </Button>
            <Button variant="primary" onClick={() => setIsApproveOpen(true)}>
              <Check size={16} className="mr-2" /> Phê duyệt
            </Button>
          </>
        }
      />

      <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4">
        {/* Main Content (CV Preview Panel) */}
        <div className="md:col-span-2 lg:col-span-3 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between border-b bg-slate-50/50 pb-4">
              <CardTitle>Nội dung CV</CardTitle>
              {/* Diff Mode Toggle Placeholder for Phase 3 */}
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-[700px] overflow-y-auto bg-slate-100 p-6 flex justify-center">
                <div className="w-full max-w-4xl bg-white shadow-sm ring-1 ring-slate-200">
                  <CVPreviewPanel data={cv.sectionsData} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar (Timeline) */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Lịch sử phê duyệt</CardTitle>
            </CardHeader>
            <CardContent>
              <ApprovalTimeline logs={logs} />
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmModal
        isOpen={isApproveOpen}
        onClose={() => {
          setIsApproveOpen(false);
          setApproveError('');
        }}
        onConfirm={handleApprove}
        title="Xác nhận phê duyệt CV"
        description="Bạn có chắc chắn muốn phê duyệt phiên bản CV này không? Hệ thống sẽ ghi nhận lịch sử duyệt."
        confirmText={isSubmitting ? "Đang xử lý..." : "Phê duyệt"}
        isLoading={isSubmitting}
        error={approveError}
      />

      <Modal isOpen={isRejectOpen} onClose={() => setIsRejectOpen(false)} title="Từ chối CV">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">Vui lòng cung cấp lý do từ chối để nhân sự có thể chỉnh sửa lại.</p>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Lý do từ chối <span className="text-red-500">*</span></label>
            <textarea 
              className={`w-full rounded-md border ${error ? 'border-red-500 ring-red-500' : 'border-slate-300'} px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]`}
              placeholder="VD: Thiếu kinh nghiệm phần ReactJS..."
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
            />
            {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setIsRejectOpen(false)}>Hủy</Button>
            <Button variant="danger" onClick={handleReject} disabled={isSubmitting}>
              {isSubmitting ? 'Đang xử lý...' : 'Từ chối CV'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
