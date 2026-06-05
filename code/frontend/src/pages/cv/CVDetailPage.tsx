import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { mockCVs } from '../../mocks/cvs.mock';
import { ArrowLeft, Download, Send } from 'lucide-react';

export function CVDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const cv = mockCVs.find(c => c.id === id) || mockCVs[0];

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
        title={`Hồ sơ CV: ${cv.sectionsData.personalInfo.fullName}`}
        description="Chi tiết các thông tin trong hồ sơ ứng viên"
        actions={
          <>
            <Button variant="outline">
              <Download size={16} className="mr-2" />
              Tải PDF
            </Button>
            {cv.status === 'Draft' && (
              <Button>
                <Send size={16} className="mr-2" />
                Gửi duyệt
              </Button>
            )}
          </>
        }
      />

      <div className="grid gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin chung</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="text-slate-500">Trạng thái</p>
                <div className="mt-1"><StatusBadge status={cv.status} type="cv" /></div>
              </div>
              <div>
                <p className="text-slate-500">Ngôn ngữ</p>
                <p className="font-medium uppercase">{cv.languageCode}</p>
              </div>
              <div>
                <p className="text-slate-500">Cập nhật lần cuối</p>
                <p className="font-medium">{new Date(cv.updatedAt).toLocaleString('vi-VN')}</p>
              </div>
              <div>
                <p className="text-slate-500">Phiên bản</p>
                <p className="font-medium">v{cv.versionNumber}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Liên hệ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div>
                <p className="text-slate-500">Email</p>
                <p className="font-medium">{cv.sectionsData.personalInfo.email}</p>
              </div>
              <div>
                <p className="text-slate-500">Số điện thoại</p>
                <p className="font-medium">{cv.sectionsData.personalInfo.phone}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Kỹ năng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {cv.sectionsData.skills.map((skill, idx) => (
                  <span key={idx} className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-800">
                    {skill.name} <span className="ml-1 text-slate-500">({skill.level})</span>
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6 md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Tóm tắt</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">
                {cv.sectionsData.personalInfo.summary}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Kinh nghiệm làm việc</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {cv.sectionsData.experience.map((exp, idx) => (
                  <div key={idx} className="relative pl-6 before:absolute before:left-0 before:top-2 before:h-2 before:w-2 before:rounded-full before:bg-blue-500">
                    <h4 className="font-semibold text-slate-900">{exp.role}</h4>
                    <p className="text-sm font-medium text-slate-600">{exp.company}</p>
                    <p className="mt-1 text-xs text-slate-400">{exp.startDate} - {exp.endDate}</p>
                    <p className="mt-2 text-sm text-slate-700">{exp.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dự án</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {cv.sectionsData.projects.map((proj, idx) => (
                  <div key={idx} className="rounded-lg border border-slate-100 bg-slate-50 p-4">
                    <h4 className="font-semibold text-slate-900">{proj.name}</h4>
                    <p className="mt-1 text-sm font-medium text-blue-600">{proj.role}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {proj.technologies.map(tech => (
                        <span key={tech} className="text-xs bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-600">
                          {tech}
                        </span>
                      ))}
                    </div>
                    <p className="mt-3 text-sm text-slate-700">{proj.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
