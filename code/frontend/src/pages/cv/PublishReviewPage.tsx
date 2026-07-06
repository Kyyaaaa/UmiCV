import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, CheckCircle, AlertCircle, Loader2, AlertTriangle, XCircle } from 'lucide-react';
import { cvService } from '../../services/cv.service';
import { DiffChange } from '../../types/cv';

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

export function PublishReviewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isPublishing, setIsPublishing] = useState(false);
  const [diffs, setDiffs] = useState<DiffChange[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{title: string, type: 'success'|'error'} | null>(null);
  const [validationItems, setValidationItems] = useState<{ type: 'error' | 'warning' | 'success', message: string }[]>([]);

  const validateCVData = (sectionsData: any) => {
    const items: { type: 'error' | 'warning' | 'success', message: string }[] = [];
    
    // Check personal info
    const pi = sectionsData?.personalInfo || {};
    const hasName = !!pi.name?.trim();
    const hasRole = !!pi.role?.trim();
    const hasEmail = !!pi.email?.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValidEmail = hasEmail && emailRegex.test(pi.email);

    if (!hasName) items.push({ type: 'error', message: 'Họ tên không được để trống' });
    if (!hasRole) items.push({ type: 'error', message: 'Chức danh không được để trống' });
    if (!hasEmail) {
      items.push({ type: 'error', message: 'Email không được để trống' });
    } else if (!isValidEmail) {
      items.push({ type: 'error', message: 'Email không đúng định dạng' });
    }

    if (hasName && hasRole && isValidEmail) {
      items.push({ type: 'success', message: 'Thông tin cá nhân cơ bản hợp lệ' });
    }

    // Check collections
    const skills = sectionsData?.skills || [];
    const exp = sectionsData?.experience || [];
    const edu = sectionsData?.education || [];

    if (skills.length === 0) {
      items.push({ type: 'warning', message: 'Chưa nhập Kỹ năng nào' });
    } else {
      items.push({ type: 'success', message: `Đã nhập ${skills.length} kỹ năng` });
    }

    if (exp.length === 0) {
      items.push({ type: 'warning', message: 'Chưa nhập Kinh nghiệm làm việc' });
    } else {
      items.push({ type: 'success', message: `Đã nhập ${exp.length} mục kinh nghiệm làm việc` });
    }

    if (edu.length === 0) {
      items.push({ type: 'warning', message: 'Chưa nhập Học vấn' });
    } else {
      items.push({ type: 'success', message: `Đã nhập ${edu.length} mục học vấn` });
    }

    setValidationItems(items);
  };

  const showToast = (title: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ title, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    const fetchDiff = async () => {
      if (!id) return;
      try {
        setIsLoading(true);
        const [diffRes, cvRes] = await Promise.all([
          cvService.getDiff(id),
          cvService.getCVById(id)
        ]);
        setDiffs(diffRes.data || []);
        if (cvRes.data && cvRes.data.sectionsData) {
          validateCVData(cvRes.data.sectionsData);
        }
      } catch (err: any) {
        setError(err.response?.data?.message || 'Lỗi khi kiểm tra dữ liệu thay đổi.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDiff();
  }, [id]);

  const handlePublish = async () => {
    if (!id) return;
    try {
      setIsPublishing(true);
      await cvService.publishCV(id!);
      showToast('Đã xuất bản CV thành công và gửi yêu cầu phê duyệt!');
      setTimeout(() => navigate('/cv'), 1500);
    } catch (err: any) {
      showToast('Lỗi xuất bản: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  const translatePath = (path: string) => {
    const dict: Record<string, string> = {
      'personalInfo': 'Thông tin cá nhân',
      'fullName': 'Họ và tên',
      'email': 'Email',
      'phone': 'Số điện thoại',
      'summary': 'Mục tiêu',
      'skills': 'Kỹ năng',
      'name': 'Tên',
      'level': 'Mức độ',
      'experience': 'Kinh nghiệm làm việc',
      'company': 'Công ty',
      'role': 'Vai trò',
      'startDate': 'Ngày bắt đầu',
      'endDate': 'Ngày kết thúc',
      'description': 'Mô tả',
      'projects': 'Dự án',
      'technologies': 'Công nghệ',
      'education': 'Học vấn',
      'school': 'Trường học',
      'degree': 'Bằng cấp',
      'year': 'Năm hoàn thành',
    };

    return path.split('.').map((segment, index, arr) => {
      const match = segment.match(/^(.+)\[(\d+)\]$/);
      if (match) {
        const key = match[1];
        const index = parseInt(match[2], 10) + 1;
        return `${dict[key] || key} thứ ${index}`;
      }
      
      if (segment === 'title') {
        return arr[0] === 'personalInfo' ? 'Chức danh' : 'Tiêu đề';
      }
      
      return dict[segment] || segment;
    }).join(' ➔ ');
  };

  const getDiffDescription = (diff: DiffChange) => {
    const pathStr = translatePath(diff.path);
    switch (diff.type) {
      case 'added':
        return `Đã thêm dữ liệu: ${pathStr}`;
      case 'removed':
        return `Đã xóa dữ liệu: ${pathStr}`;
      case 'modified':
        return `Đã cập nhật: ${pathStr}`;
      default:
        return `Thay đổi: ${pathStr}`;
    }
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
        {isLoading ? (
          <div className="p-12 text-center flex flex-col items-center text-slate-500">
            <Loader2 className="animate-spin mb-4" size={32} />
            <p>Đang đối chiếu dữ liệu với phiên bản trước...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">
            <AlertCircle className="mx-auto mb-2" size={32} />
            <p>{error}</p>
          </div>
        ) : (
          <>
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-800">Checklist Kiểm tra CV</h3>
              <p className="text-slate-500 mt-1 text-sm">
                Đảm bảo CV đầy đủ thông tin thiết yếu trước khi gửi đi.
              </p>
              
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                {validationItems.map((item, idx) => (
                  <div key={idx} className={`flex items-center space-x-3 p-3 rounded border ${item.type === 'error' ? 'bg-red-50 border-red-100 text-red-700' : item.type === 'warning' ? 'bg-yellow-50 border-yellow-100 text-yellow-700' : 'bg-green-50 border-green-100 text-green-700'}`}>
                    {item.type === 'error' && <XCircle size={18} className="shrink-0" />}
                    {item.type === 'warning' && <AlertTriangle size={18} className="shrink-0" />}
                    {item.type === 'success' && <CheckCircle size={18} className="shrink-0" />}
                    <span className="text-sm font-medium">{item.message}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-800">Tóm tắt các thay đổi từ bản nháp</h3>
              <p className="text-slate-500 mt-1">
                {diffs.length > 0 ? `${diffs.length} thay đổi được phát hiện so với phiên bản trước.` : 'Không có thay đổi nào so với phiên bản trước.'}
              </p>
            </div>

            <div className="p-6 bg-slate-50 space-y-4 max-h-[400px] overflow-y-auto">
              {diffs.length === 0 ? (
                <div className="text-center text-slate-500 py-8">
                  Bản nháp hiện tại không có điểm khác biệt so với phiên bản đang được xuất bản.
                </div>
              ) : (
                diffs.map((diff, index) => (
                  <div key={index} className="flex items-start space-x-3 bg-white p-3 rounded border border-slate-100">
                    <CheckCircle className="text-blue-500 mt-0.5" size={18} />
                    <div>
                      <p className="font-semibold text-slate-700">{getDiffDescription(diff)}</p>
                      {diff.type === 'modified' && (
                        <div className="text-xs space-y-1 mt-2">
                          <pre className="text-red-600 bg-red-50 p-2 rounded whitespace-pre-wrap font-mono border border-red-100">- {formatDiffValue(diff.oldValue)}</pre>
                          <pre className="text-green-700 bg-green-50 p-2 rounded whitespace-pre-wrap font-mono border border-green-100">+ {formatDiffValue(diff.newValue)}</pre>
                        </div>
                      )}
                      {diff.type === 'added' && (
                        <div className="text-xs space-y-1 mt-2">
                          <pre className="text-green-700 bg-green-50 p-2 rounded whitespace-pre-wrap font-mono border border-green-100">+ {formatDiffValue(diff.newValue)}</pre>
                        </div>
                      )}
                      {diff.type === 'removed' && (
                        <div className="text-xs space-y-1 mt-2">
                          <pre className="text-red-600 bg-red-50 p-2 rounded whitespace-pre-wrap font-mono border border-red-100">- {formatDiffValue(diff.oldValue)}</pre>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-6 border-t border-slate-200 flex flex-col sm:flex-row sm:justify-between sm:items-center bg-white">
              <div className="text-sm text-slate-500 mb-2 sm:mb-0">
                {diffs.length > 0 ? 'Hành động này sẽ tạo ra Phiên bản mới chờ duyệt.' : 'Không thể xuất bản do không có dữ liệu mới.'}
              </div>
              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-200">
                <Button variant="outline" onClick={() => navigate(-1)}>
                  Hủy bỏ
                </Button>
                <Button 
                  onClick={handlePublish} 
                  isLoading={isPublishing} 
                  disabled={diffs.length === 0 || validationItems.some(i => i.type === 'error')}
                >
                  Xác nhận Publish
                </Button>
              </div>

              {toastMessage && (
                <div className={`fixed bottom-6 right-6 px-4 py-3 rounded-lg shadow-lg text-sm font-medium flex items-center z-[200] animate-in slide-in-from-bottom-5 ${toastMessage.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
                  {toastMessage.title}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
