import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { ConfirmModal } from '../../components/common/ConfirmModal';
import { mockCVs } from '../../mocks/cvs.mock';
import { mockApprovalLogs } from '../../mocks/workflows.mock';
import { ArrowLeft, Check, X, Clock } from 'lucide-react';
import { Input } from '../../components/ui/Input';

export function ApprovalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const cv = mockCVs.find(c => c.id === id) || mockCVs[0];
  const logs = mockApprovalLogs.filter(l => l.cvProfileId === cv.id);

  const [isApproveOpen, setIsApproveOpen] = useState(false);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');

  const handleApprove = () => {
    // Mock approve API call
    setIsApproveOpen(false);
    navigate('/workflow');
  };

  const handleReject = () => {
    // Mock reject API call
    setIsRejectOpen(false);
    navigate('/workflow');
  };

  return (
    <div>
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

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content (CV Preview Mock) */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Nội dung CV</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border border-slate-200 bg-slate-50 p-8 min-h-[500px]">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold">{cv.sectionsData.personalInfo.fullName}</h2>
                  <p className="text-blue-600 font-medium mt-1">{cv.sectionsData.personalInfo.title}</p>
                  <p className="text-sm text-slate-500 mt-2">{cv.sectionsData.personalInfo.email} • {cv.sectionsData.personalInfo.phone}</p>
                </div>
                
                <div className="mb-6">
                  <h3 className="font-bold text-slate-800 border-b pb-2 mb-3">TÓM TẮT</h3>
                  <p className="text-sm text-slate-700">{cv.sectionsData.personalInfo.summary}</p>
                </div>
                
                <div className="mb-6">
                  <h3 className="font-bold text-slate-800 border-b pb-2 mb-3">KINH NGHIỆM</h3>
                  {cv.sectionsData.experience.map((exp, i) => (
                    <div key={i} className="mb-4">
                      <div className="flex justify-between font-medium text-slate-900">
                        <span>{exp.role}</span>
                        <span className="text-sm text-slate-500">{exp.startDate} - {exp.endDate}</span>
                      </div>
                      <p className="text-sm font-medium text-blue-600">{exp.company}</p>
                      <p className="text-sm text-slate-700 mt-1">{exp.description}</p>
                    </div>
                  ))}
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
              <div className="space-y-6">
                {logs.length > 0 ? logs.map((log, idx) => (
                  <div key={idx} className="relative pl-6 before:absolute before:left-0 before:top-2 before:h-2 before:w-2 before:rounded-full before:bg-slate-300">
                    <p className="text-sm font-medium text-slate-900">
                      {log.action === 'Approve' ? 'Đã duyệt (Cấp 1)' : 'Đã từ chối'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">{new Date(log.createdAt).toLocaleString('vi-VN')}</p>
                    {log.reason && (
                      <div className="mt-2 rounded-md bg-red-50 p-2 text-sm text-red-700">
                        {log.reason}
                      </div>
                    )}
                  </div>
                )) : (
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Clock size={16} /> Chưa có lịch sử duyệt
                  </div>
                )}
                
                <div className="relative pl-6 before:absolute before:left-0 before:top-2 before:h-2 before:w-2 before:rounded-full before:bg-blue-500">
                  <p className="text-sm font-medium text-blue-600">Đang chờ duyệt (Cấp {logs.length + 1})</p>
                  <p className="text-xs text-slate-500 mt-1">Hiện tại</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <ConfirmModal
        isOpen={isApproveOpen}
        onClose={() => setIsApproveOpen(false)}
        onConfirm={handleApprove}
        title="Xác nhận phê duyệt CV"
        description="Bạn có chắc chắn muốn phê duyệt phiên bản CV này không? Hệ thống sẽ ghi nhận lịch sử duyệt."
        confirmText="Phê duyệt"
      />

      <ConfirmModal
        isOpen={isRejectOpen}
        onClose={() => setIsRejectOpen(false)}
        onConfirm={handleReject}
        title="Từ chối CV"
        description="Vui lòng cung cấp lý do từ chối để nhân sự có thể chỉnh sửa lại."
        confirmText="Từ chối"
        type="danger"
      />
    </div>
  );
}
