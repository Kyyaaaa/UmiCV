import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, CheckCircle } from 'lucide-react';

export function PublishReviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = () => {
    setIsPublishing(true);
    setTimeout(() => {
      setIsPublishing(false);
      navigate('/cv');
    }, 1500);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader 
        title="Tổng duyệt & Publish CV" 
        description="Kiểm tra lại các thay đổi quan trọng trước khi xuất bản bản cập nhật này." 
        actions={
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} className="mr-2" /> Trở lại Workspace
          </Button>
        }
      />

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 mt-6 overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h3 className="text-lg font-bold text-slate-800">Tóm tắt các thay đổi từ bản nháp</h3>
          <p className="text-slate-500 mt-1">3 mục đã được chỉnh sửa so với phiên bản trước (v2).</p>
        </div>

        <div className="p-6 bg-slate-50 space-y-4">
          <div className="flex items-start space-x-3">
            <CheckCircle className="text-green-500 mt-0.5" size={18} />
            <div>
              <p className="font-semibold text-slate-700">Cập nhật Kỹ năng chuyên môn</p>
              <p className="text-sm text-slate-500">Đã thêm React.js và NestJS.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle className="text-green-500 mt-0.5" size={18} />
            <div>
              <p className="font-semibold text-slate-700">Chỉnh sửa Kinh nghiệm làm việc</p>
              <p className="text-sm text-slate-500">Sửa lại mô tả dự án tại công ty cũ.</p>
            </div>
          </div>
          <div className="flex items-start space-x-3">
            <CheckCircle className="text-green-500 mt-0.5" size={18} />
            <div>
              <p className="font-semibold text-slate-700">Sửa lỗi chính tả</p>
              <p className="text-sm text-slate-500">Sửa tiêu đề "Chuyên viên IT" thành "Senior Frontend Engineer".</p>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-200 flex justify-between items-center bg-white">
          <div className="text-sm text-slate-500">
            Hành động này sẽ tạo ra <span className="font-bold text-slate-800">Phiên bản v3</span>.
          </div>
          <div className="space-x-3">
            <Button variant="outline" onClick={() => navigate(-1)}>Hủy</Button>
            <Button onClick={handlePublish} isLoading={isPublishing}>
              Xác nhận Publish
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
