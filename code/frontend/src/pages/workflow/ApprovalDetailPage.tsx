import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { Modal } from '../../components/ui/Modal';
import { ArrowLeft, Check, X, Download, ZoomIn, ZoomOut, Diff } from 'lucide-react';
import { CVPreviewPanel } from '../../components/cv-workspace/CVPreviewPanel';
import { CVPdfDocument } from '../../components/cv-workspace/CVPdfDocument';
import { ApprovalTimeline } from '../../components/workflow/ApprovalTimeline';
import { workflowService } from '../../services/workflow.service';
import { cvService } from '../../services/cv.service';
import { CVProfile, ApprovalLog } from '../../types';
import { DiffChange } from '../../types/cv';
import { useAuth } from '../../hooks/useAuth';
import { pdf } from '@react-pdf/renderer';

const formatDiffValue = (val: any) => {
  if (val === null || val === undefined) return 'null';
  if (typeof val === 'object') {
    try {
      return JSON.stringify(val, null, 2);
    } catch {
      return String(val);
    }
  }
  return String(val);
};

export function ApprovalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cv, setCv] = useState<CVProfile | null>(null);
  const [logs, setLogs] = useState<ApprovalLog[]>([]);
  const [diffData, setDiffData] = useState<DiffChange[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // UI States
  const [scale, setScale] = useState(100);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [showDiff, setShowDiff] = useState(false);

  // Approval Modal States
  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [approveError, setApproveError] = useState('');
  const [toastMessage, setToastMessage] = useState<{ title: string; type: 'error' | 'success' } | null>(null);

  const fetchData = async (cvId: string) => {
    try {
      setIsLoading(true);
      const [cvRes, logsRes, diffRes] = await Promise.all([
        cvService.getCVById(cvId),
        workflowService.getApprovalLogs(cvId).catch(() => ({ data: [] })),
        cvService.getDiff(cvId).catch(() => ({ data: [] }))
      ]);
      setCv(cvRes.data);
      setLogs(logsRes.data);
      setDiffData(diffRes.data || []);
    } catch (err) {
      console.error('Failed to fetch approval detail', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchData(id);
    }
  }, [id]);

  const handleDownloadPdf = async () => {
    if (!cv) return;
    setIsDownloadingPdf(true);
    try {
      const doc = <CVPdfDocument data={cv.sectionsData} />;
      const asPdf = pdf(doc);
      const blob = await asPdf.toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `CV_${cv.sectionsData.personalInfo?.name || 'Applicant'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (err) {
      console.error('Lỗi tạo PDF:', err);
      setToastMessage({ title: 'Lỗi khi tải PDF. Vui lòng thử lại.', type: 'error' });
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const showRaceConditionToast = () => {
    setToastMessage({ title: 'Thao tác thất bại: CV này đã được xử lý trước đó.', type: 'error' });
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
      let level = 2;
      if (user.role === 'TechLead') {
        level = 1;
      } else if (user.role === 'Admin') {
        const hasLevel1 = logs.some(l => l.level === 1 && l.action === 'Approve');
        level = hasLevel1 ? 2 : 1;
      }
      
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
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {toastMessage && (
        <div className={`fixed top-4 right-4 z-50 rounded-md shadow-lg p-4 max-w-sm ${toastMessage.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-green-50 text-green-800 border border-green-200'}`}>
          <div className="flex items-start">
            {toastMessage.type === 'error' ? <X className="h-5 w-5 mr-2 text-red-400" /> : <Check className="h-5 w-5 mr-2 text-green-400" />}
            <p className="text-sm font-medium">{toastMessage.title}</p>
          </div>
        </div>
      )}
      
      <div className="mb-2 shrink-0">
        <button 
          onClick={() => navigate('/workflow')}
          className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft size={16} className="mr-1" /> Quay lại danh sách
        </button>
      </div>

      <div className="shrink-0">
        <PageHeader 
          title={`Xét duyệt CV: ${cv.sectionsData.personalInfo?.name || 'Không rõ tên'}`}
          description={`Phiên bản v${cv.versionNumber} - Ngôn ngữ: ${cv.languageCode.toUpperCase()}`}
          actions={
            <div className="flex gap-2">
              <Button variant="danger" onClick={() => setIsRejectOpen(true)}>
                <X size={16} className="mr-2" /> Từ chối
              </Button>
              <Button variant="primary" onClick={() => setIsApproveOpen(true)}>
                <Check size={16} className="mr-2" /> Phê duyệt
              </Button>
            </div>
          }
        />
      </div>

      <div className="flex-1 flex overflow-hidden gap-6 pb-6">
        {/* Main Content (CV Preview Panel) */}
        <div className="flex-1 flex flex-col bg-slate-50 border border-slate-200 rounded-lg overflow-hidden relative shadow-sm">
          {/* Preview Toolbar */}
          <div className="h-12 bg-white border-b border-slate-200 px-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700">Chế độ xem trước</span>
              <div className="h-4 w-px bg-slate-300 mx-2"></div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setScale(Math.max(50, scale - 10))} className="h-8 w-8 p-0">
                  <ZoomOut size={16} />
                </Button>
                <span className="text-sm text-slate-600 w-12 text-center">{scale}%</span>
                <Button variant="ghost" size="sm" onClick={() => setScale(Math.min(200, scale + 10))} className="h-8 w-8 p-0">
                  <ZoomIn size={16} />
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {diffData && diffData.length > 0 && (
                <Button 
                  variant={showDiff ? "primary" : "outline"} 
                  size="sm" 
                  onClick={() => setShowDiff(!showDiff)}
                  className={`h-8 ${showDiff ? 'bg-blue-600 text-white' : ''}`}
                >
                  <Diff size={16} className="mr-2" /> {showDiff ? 'Đang bật Diff' : 'Xem Diff'}
                </Button>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleDownloadPdf} 
                disabled={isDownloadingPdf}
                className="h-8"
              >
                <Download size={16} className="mr-2" />
                {isDownloadingPdf ? 'Đang tạo...' : 'Tải PDF'}
              </Button>
            </div>
          </div>
          
          {/* Scrollable Preview Area */}
          <div className="flex-1 overflow-y-auto bg-slate-200">
            <CVPreviewPanel data={cv.sectionsData} scale={scale} />
          </div>
        </div>

        {/* Sidebar (Info & Timeline) */}
        <div className="w-96 shrink-0 flex flex-col gap-6 overflow-y-auto pr-1">
          {showDiff && diffData && diffData.length > 0 && (
            <Card className="border-blue-200 shadow-sm shrink-0">
              <CardHeader className="bg-blue-50/50 pb-3 border-b border-blue-100">
                <CardTitle className="text-blue-800 text-sm flex items-center">
                  <Diff size={16} className="mr-2" /> Có {diffData.length} điểm thay đổi
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 text-sm max-h-60 overflow-y-auto custom-scrollbar">
                <ul className="space-y-3">
                  {diffData.map((d, i) => (
                    <li key={i} className="border-l-2 pl-3 py-1 text-slate-600 border-slate-300 bg-slate-50">
                      <span className="font-medium text-slate-900 block mb-1">
                        [{d.type === 'added' ? 'Thêm mới' : d.type === 'removed' ? 'Đã xóa' : 'Chỉnh sửa'}] {d.path}
                      </span>
                      {d.type === 'modified' && (
                        <div className="text-xs space-y-1 mt-2">
                          <pre className="text-red-600 bg-red-50 p-2 rounded whitespace-pre-wrap font-mono border border-red-100">- {formatDiffValue(d.oldValue)}</pre>
                          <pre className="text-green-700 bg-green-50 p-2 rounded whitespace-pre-wrap font-mono border border-green-100">+ {formatDiffValue(d.newValue)}</pre>
                        </div>
                      )}
                      {d.type === 'added' && (
                        <div className="text-xs space-y-1 mt-2">
                          <pre className="text-green-700 bg-green-50 p-2 rounded whitespace-pre-wrap font-mono border border-green-100">+ {formatDiffValue(d.newValue)}</pre>
                        </div>
                      )}
                      {d.type === 'removed' && (
                        <div className="text-xs space-y-1 mt-2">
                          <pre className="text-red-600 bg-red-50 p-2 rounded whitespace-pre-wrap font-mono border border-red-100">- {formatDiffValue(d.oldValue)}</pre>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          <Card className="shrink-0">
            <CardHeader>
              <CardTitle>Thông tin tổng quan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Mã NV:</span>
                  <span className="font-medium">{cv.userId.substring(0, 8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Trạng thái:</span>
                  <span className="font-medium text-amber-600">Đang chờ duyệt</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Ngày nộp:</span>
                  <span className="font-medium">{cv.submittedAt ? new Date(cv.submittedAt).toLocaleDateString('vi-VN') : 'N/A'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shrink-0">
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
