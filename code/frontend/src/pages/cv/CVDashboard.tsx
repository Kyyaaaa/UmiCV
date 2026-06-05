import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../components/common/PageHeader';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/common/StatusBadge';
import { Plus, Edit3, History, Globe, Clock, ChevronRight } from 'lucide-react';
import { cvService } from '../../services/cv.service';
import { CVProfile } from '../../types';

export function CVDashboard() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [cvs, setCVs] = useState<CVProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchCVs();
  }, []);

  const fetchCVs = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await cvService.getMyCVs();
      
      // Fetch details for each CV to get sectionsData
      const detailedCVs = await Promise.all(
        res.data.map(async (cv) => {
          try {
            const detailRes = await cvService.getCVById(cv.id);
            return detailRes.data;
          } catch (e) {
            return cv; // fallback to basic data if detail fetch fails
          }
        })
      );
      
      setCVs(detailedCVs);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải danh sách CV. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCV = async () => {
    try {
      setIsCreating(true);
      const res = await cvService.createCV({ languageCode: 'vi' });
      navigate(`/cv/${res.data.id}/workspace`);
    } catch (err: any) {
      alert('Tạo CV thất bại: ' + (err.response?.data?.message || err.message));
      setIsCreating(false);
    }
  };

  const filteredCVs = cvs.filter(cv => {
    if (!searchTerm) return true;
    const name = cv.sectionsData?.personalInfo?.fullName || '';
    return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="max-w-7xl mx-auto">
      <PageHeader 
        title="Quản lý CV" 
        description="Quản lý kho hồ sơ nhân sự với trải nghiệm chỉnh sửa trực quan" 
        actions={
          <Button onClick={handleCreateCV} isLoading={isCreating}>
            <Plus size={16} className="mr-2" />
            Tạo Workspace Mới
          </Button>
        }
      />

      <div className="mb-6 flex gap-4">
        <input 
          type="text" 
          placeholder="Tìm kiếm CV theo tên nhân sự..." 
          className="w-full max-w-md rounded-md border border-slate-300 px-4 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="text-center py-16">
          <p className="text-slate-500">Đang tải dữ liệu...</p>
        </div>
      ) : error ? (
        <div className="text-center py-16 bg-red-50 rounded-xl border border-red-200">
          <p className="text-red-500">{error}</p>
          <Button onClick={fetchCVs} variant="outline" className="mt-4">Thử lại</Button>
        </div>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredCVs.map(cv => (
              <div key={cv.id} className="group relative flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-blue-300 hover:shadow-md">
                <div>
                  <div className="flex items-start justify-between mb-4">
                    <StatusBadge status={cv.status} type="cv" />
                    <span className="flex items-center text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded-full">
                      <Globe size={12} className="mr-1" />
                      {cv.languageCode.toUpperCase()}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-slate-900 line-clamp-1" title={cv.sectionsData?.personalInfo?.fullName || 'Chưa có tên'}>
                    {cv.sectionsData?.personalInfo?.fullName || 'Chưa có tên'}
                  </h3>
                  <p className="mt-1 text-sm font-medium text-blue-600 line-clamp-1">
                    {cv.sectionsData?.personalInfo?.title || 'Chưa cập nhật chức danh'}
                  </p>
                  
                  <div className="mt-4 flex items-center text-xs text-slate-500">
                    <Clock size={14} className="mr-1.5" />
                    Cập nhật: {new Date(cv.updatedAt).toLocaleDateString('vi-VN')}
                  </div>
                  <div className="mt-2 text-xs text-slate-500">
                    Phiên bản: <span className="font-semibold text-slate-700">v{cv.versionNumber}</span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                  <Button 
                    className="w-full justify-between" 
                    onClick={() => navigate(`/cv/${cv.id}/workspace`)}
                  >
                    <span>Mở Workspace</span>
                    <ChevronRight size={16} />
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => navigate(`/cv/${cv.id}/workspace?tab=history`)}
                    >
                      <History size={14} className="mr-1.5" /> Lịch sử
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full"
                      onClick={() => navigate(`/cv/${cv.id}/publish`)}
                    >
                      <Globe size={14} className="mr-1.5" /> Publish
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredCVs.length === 0 && (
            <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-xl mt-6">
              <p className="text-slate-500">Không tìm thấy CV nào.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
