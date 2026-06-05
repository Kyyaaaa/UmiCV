import React, { useEffect, useState } from 'react';
import { GitCommit, Loader2, Info } from 'lucide-react';
import { cvService } from '../../services/cv.service';
import { VersionSummary } from '../../types/cv';
import { Button } from '../ui/Button';

interface VersionHistorySidebarProps {
  cvId: string;
  selectedVersionId: string | null;
  onSelectVersion: (versionId: string) => void;
  onRestoreVersion: (versionId: string) => void;
}

export function VersionHistorySidebar({ cvId, selectedVersionId, onSelectVersion, onRestoreVersion }: VersionHistorySidebarProps) {
  const [versions, setVersions] = useState<VersionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchVersions();
  }, [cvId]);

  const fetchVersions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await cvService.getVersions(cvId);
      setVersions(res.data);
    } catch (err: any) {
      setError('Không thể tải lịch sử phiên bản');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString('vi-VN', {
      hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric'
    });
  };

  return (
    <div className="w-80 shrink-0 bg-slate-50 border-r border-slate-200 flex flex-col h-full overflow-hidden">
      <div className="p-4 border-b border-slate-200 bg-white">
        <h3 className="font-bold text-slate-800">Lịch sử phiên bản</h3>
        <p className="text-xs text-slate-500 mt-1">Các thay đổi được lưu tự động hoặc khi phê duyệt.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-32 text-slate-400">
            <Loader2 className="animate-spin mb-2" size={24} />
            <span className="text-sm">Đang tải...</span>
          </div>
        ) : error ? (
          <div className="text-sm text-red-500 text-center p-4 bg-red-50 rounded-lg border border-red-100">
            {error}
          </div>
        ) : versions.length === 0 ? (
          <div className="text-center p-6 text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">
            <Info size={24} className="mx-auto mb-2 text-slate-300" />
            <p className="text-sm">Chưa có phiên bản lịch sử nào được lưu.</p>
          </div>
        ) : (
          <div className="relative pl-3">
            <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-slate-200"></div>
            <div className="space-y-6">
              {versions.map((ver, idx) => {
                const isSelected = selectedVersionId === ver.id;
                return (
                  <div key={ver.id} className="relative pl-6 group">
                    <div className={`absolute left-[-11px] top-1 p-1 rounded-full border-2 z-10 bg-white ${isSelected ? 'border-blue-500 text-blue-500' : 'border-slate-300 text-slate-400 group-hover:border-blue-400'}`}>
                      <GitCommit size={12} />
                    </div>
                    
                    <div 
                      onClick={() => onSelectVersion(ver.id)}
                      className={`cursor-pointer rounded-lg p-3 border transition-all ${isSelected ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-slate-200 hover:border-blue-300'}`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className={`font-semibold text-sm ${isSelected ? 'text-blue-700' : 'text-slate-700'}`}>
                          Version {ver.versionNumber}
                        </span>
                        {idx === 0 && <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase font-bold tracking-wider">Mới nhất</span>}
                      </div>
                      <div className="text-xs text-slate-500 mb-3">
                        {formatDate(ver.createdAt)}
                      </div>

                      {isSelected && (
                        <div className="pt-3 border-t border-blue-100 mt-2">
                          <Button 
                            size="sm" 
                            variant="primary" 
                            className="w-full text-xs h-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              onRestoreVersion(ver.id);
                            }}
                          >
                            Khôi phục bản này
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
