import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, GitCommit, GitPullRequest } from 'lucide-react';

export function VersionHistoryPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const mockVersions = [
    { v: 3, date: '2026-06-05 14:30', user: 'Admin', msg: 'Update skills and projects for 2026' },
    { v: 2, date: '2025-11-20 09:15', user: 'Admin', msg: 'Fix typos in experience' },
    { v: 1, date: '2025-01-10 10:00', user: 'System', msg: 'Initial CV creation' },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader 
        title="Lịch sử phiên bản" 
        description="Theo dõi lịch sử thay đổi của CV theo thời gian." 
        actions={
          <Button variant="outline" onClick={() => navigate(`/cv`)}>
            <ArrowLeft size={16} className="mr-2" /> Quay lại
          </Button>
        }
      />

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 mt-6 relative">
        <div className="absolute left-10 top-10 bottom-10 w-0.5 bg-slate-200"></div>
        <div className="space-y-8">
          {mockVersions.map((ver, idx) => (
            <div key={ver.v} className="relative pl-12 flex items-start group">
              <div className="absolute left-[-5px] top-1 bg-white p-1 rounded-full border-2 border-blue-500 text-blue-500 z-10">
                <GitCommit size={16} />
              </div>
              
              <div className="flex-1 bg-slate-50 border border-slate-100 rounded-lg p-4 group-hover:border-blue-200 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-lg text-slate-800">Version {ver.v}</span>
                    {idx === 0 && <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full font-medium">Hiện tại</span>}
                  </div>
                  <div className="flex space-x-2">
                    {idx > 0 && (
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/cv/${id}/diff`)}>
                        <GitPullRequest size={14} className="mr-1.5" /> So sánh
                      </Button>
                    )}
                    <Button variant="ghost" size="sm">Khôi phục</Button>
                  </div>
                </div>
                <p className="text-slate-600 mb-2">{ver.msg}</p>
                <div className="flex items-center text-xs text-slate-400">
                  <span className="font-medium mr-2">{ver.user}</span> • <span className="ml-2">{ver.date}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
