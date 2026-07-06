import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/ui/Button';
import { ArrowLeft } from 'lucide-react';

export function DiffViewerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-100px)] flex flex-col">
      <PageHeader 
        title="So sánh phiên bản" 
        description="So sánh bản Draft (hoặc Version mới) với phiên bản trước đó." 
        actions={
          <Button variant="outline" onClick={() => navigate(-1)}>
            <ArrowLeft size={16} className="mr-2" /> Quay lại
          </Button>
        }
      />

      <div className="flex-1 flex overflow-hidden border border-slate-200 rounded-xl mt-4 bg-white shadow-sm">
        {/* Left Column - Old */}
        <div className="w-1/2 flex flex-col border-r border-slate-200">
          <div className="p-3 bg-red-50 border-b border-red-100 text-red-700 font-semibold text-sm flex justify-between">
            <span>Phiên bản v2</span>
            <span className="text-xs font-normal">2025-11-20</span>
          </div>
          <div className="flex-1 overflow-y-auto p-6 font-mono text-sm">
            <div className="mb-6">
              <h4 className="text-slate-500 font-bold mb-2">Kỹ năng</h4>
              <div className="p-2 bg-red-50 text-red-700 rounded line-through decoration-red-400 mb-1">
                - React.js (7/10)
              </div>
              <div className="p-2 bg-red-50 text-red-700 rounded line-through decoration-red-400 mb-1">
                - Node.js (6/10)
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - New */}
        <div className="w-1/2 flex flex-col">
          <div className="p-3 bg-green-50 border-b border-green-100 text-green-700 font-semibold text-sm flex justify-between">
            <span>Bản nháp hiện tại (Draft)</span>
            <span className="text-xs font-normal">Vừa xong</span>
          </div>
          <div className="flex-1 overflow-y-auto p-6 font-mono text-sm">
            <div className="mb-6">
              <h4 className="text-slate-500 font-bold mb-2">Kỹ năng</h4>
              <div className="p-2 bg-green-50 text-green-700 rounded mb-1 border-l-4 border-green-500">
                + React.js (9/10)
              </div>
              <div className="p-2 bg-green-50 text-green-700 rounded mb-1 border-l-4 border-green-500">
                + NestJS (8/10)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
