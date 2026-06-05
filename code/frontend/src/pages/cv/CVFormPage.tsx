import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { mockCVs } from '../../mocks/cvs.mock';
import { ArrowLeft, Save } from 'lucide-react';

export function CVFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const initialData = isEdit 
    ? mockCVs.find(c => c.id === id)?.sectionsData 
    : {
        personalInfo: { fullName: '', email: '', phone: '', title: '', summary: '' },
        skills: [],
        experience: [],
        projects: [],
        education: []
      };

  const [formData, setFormData] = useState(initialData);

  const handleSave = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      navigate(isEdit ? `/cv/${id}` : '/cv');
    }, 1000);
  };

  return (
    <div>
      <div className="mb-4">
        <button 
          onClick={() => navigate('/cv')}
          className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft size={16} className="mr-1" /> Quay lại danh sách
        </button>
      </div>

      <PageHeader 
        title={isEdit ? 'Chỉnh sửa CV' : 'Tạo mới CV'}
        description="Điền các thông tin hồ sơ của bạn"
      />

      <div className="space-y-6 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Thông tin cá nhân</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input 
                label="Họ và tên" 
                value={formData?.personalInfo.fullName} 
                onChange={(e) => setFormData({
                  ...formData!, 
                  personalInfo: { ...formData!.personalInfo, fullName: e.target.value }
                })}
              />
              <Input 
                label="Vị trí ứng tuyển" 
                value={formData?.personalInfo.title}
                onChange={(e) => setFormData({
                  ...formData!, 
                  personalInfo: { ...formData!.personalInfo, title: e.target.value }
                })}
              />
              <Input 
                label="Email" 
                type="email" 
                value={formData?.personalInfo.email}
                onChange={(e) => setFormData({
                  ...formData!, 
                  personalInfo: { ...formData!.personalInfo, email: e.target.value }
                })}
              />
              <Input 
                label="Số điện thoại" 
                value={formData?.personalInfo.phone}
                onChange={(e) => setFormData({
                  ...formData!, 
                  personalInfo: { ...formData!.personalInfo, phone: e.target.value }
                })}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Tóm tắt</label>
              <textarea 
                className="w-full rounded-md border border-slate-300 p-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                rows={4}
                value={formData?.personalInfo.summary}
                onChange={(e) => setFormData({
                  ...formData!, 
                  personalInfo: { ...formData!.personalInfo, summary: e.target.value }
                })}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Kinh nghiệm làm việc</CardTitle>
          </CardHeader>
          <CardContent>
            {formData?.experience.length === 0 ? (
              <p className="text-sm text-slate-500">Chưa có kinh nghiệm nào. Nhấn Thêm mới để bắt đầu.</p>
            ) : (
              <div className="space-y-4">
                {formData?.experience.map((exp, idx) => (
                  <div key={idx} className="rounded-lg border border-slate-200 p-4">
                    <div className="grid gap-4 sm:grid-cols-2 mb-4">
                      <Input label="Công ty" value={exp.company} readOnly />
                      <Input label="Vị trí" value={exp.role} readOnly />
                      <Input label="Bắt đầu" value={exp.startDate} readOnly />
                      <Input label="Kết thúc" value={exp.endDate} readOnly />
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Button variant="outline" className="mt-4">Thêm kinh nghiệm</Button>
          </CardContent>
        </Card>

        {/* Similar mock forms can be implemented for Projects, Skills, Education */}

        <div className="flex justify-end gap-4 pb-12">
          <Button variant="outline" onClick={() => navigate('/cv')}>Hủy bỏ</Button>
          <Button onClick={handleSave} isLoading={isLoading}>
            <Save size={16} className="mr-2" />
            Lưu thay đổi
          </Button>
        </div>
      </div>
    </div>
  );
}
