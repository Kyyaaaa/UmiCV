import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { CVProfile, CVSections } from '../../types';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, Share } from 'lucide-react';
import { WorkspaceSidebar } from '../../components/cv-workspace/WorkspaceSidebar';
import { CVEditorPanel } from '../../components/cv-workspace/CVEditorPanel';
import { CVPreviewPanel } from '../../components/cv-workspace/CVPreviewPanel';
import { DraftIndicator } from '../../components/cv-workspace/DraftIndicator';
import { LanguageSwitcher } from '../../components/cv-workspace/LanguageSwitcher';
import { VersionHistorySidebar } from '../../components/cv-workspace/VersionHistorySidebar';
import { cvService } from '../../services/cv.service';

export function CVWorkspace() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const viewMode = searchParams.get('tab') === 'history' ? 'history' : 'draft';

  const [cvData, setCvData] = useState<CVProfile | null>(null);
  const [activeSection, setActiveSection] = useState('personalInfo');
  const [unsavedChanges, setUnsavedChanges] = useState(0);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Preview Mode States
  const [previewVersionId, setPreviewVersionId] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<CVSections | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  const isFirstRender = useRef(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (id && id !== 'new') {
      fetchCV();
    }
  }, [id]);

  const fetchCV = async () => {
    try {
      const res = await cvService.getCVById(id!);
      
      const defaultSections: CVSections = {
        personalInfo: { fullName: '', email: '', phone: '', title: '', summary: '' },
        skills: [],
        experience: [],
        projects: [],
        education: []
      };

      const safeSections = res.data.sectionsData || {};
      const finalData = {
        ...res.data,
        sectionsData: {
          personalInfo: safeSections.personalInfo || defaultSections.personalInfo,
          skills: safeSections.skills || [],
          experience: safeSections.experience || [],
          projects: safeSections.projects || [],
          education: safeSections.education || []
        }
      };

      setCvData(finalData);
      setLastSaved(new Date(res.data.updatedAt));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải CV');
    }
  };

  const loadVersionPreview = async (versionId: string) => {
    if (!id) return;
    try {
      setIsPreviewLoading(true);
      setPreviewVersionId(versionId);
      const res = await cvService.getVersionById(id, versionId);
      
      const defaultSections: CVSections = {
        personalInfo: { fullName: '', email: '', phone: '', title: '', summary: '' },
        skills: [],
        experience: [],
        projects: [],
        education: []
      };

      const safeSnap = res.data.snapshotData || {};
      setPreviewData({
        personalInfo: safeSnap.personalInfo || defaultSections.personalInfo,
        skills: safeSnap.skills || [],
        experience: safeSnap.experience || [],
        projects: safeSnap.projects || [],
        education: safeSnap.education || []
      });
    } catch (err: any) {
      console.error('Lỗi khi tải phiên bản:', err);
      alert('Không thể tải nội dung phiên bản này.');
      setPreviewVersionId(null);
      setPreviewData(null);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleRestoreVersion = async (versionId: string) => {
    if (!id) return;
    if (unsavedChanges > 0) {
      const confirm = window.confirm('Bản nháp hiện tại đang có thay đổi chưa lưu. Nếu khôi phục, bạn sẽ mất những thay đổi này. Tiếp tục?');
      if (!confirm) return;
    } else {
      const confirm = window.confirm('Bạn có chắc muốn khôi phục phiên bản này đè lên bản nháp hiện tại?');
      if (!confirm) return;
    }

    try {
      await cvService.restoreVersion(id, versionId);
      alert('Khôi phục thành công!');
      // Reset view
      setSearchParams({});
      setPreviewVersionId(null);
      setPreviewData(null);
      setUnsavedChanges(0);
      // Reload draft
      await fetchCV();
    } catch (err: any) {
      console.error('Lỗi khôi phục:', err);
      alert('Khôi phục thất bại: ' + (err.response?.data?.message || err.message));
    }
  };

  // Auto-save logic
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (viewMode === 'history') return;

    if (unsavedChanges > 0) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      
      timeoutRef.current = setTimeout(() => {
        handleSaveDraft();
      }, 2500);
    }

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [cvData?.sectionsData, unsavedChanges]);

  // BUG-01: Unsaved Changes Protection (beforeunload + useBlocker)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (unsavedChanges > 0) {
        e.preventDefault();
        e.returnValue = ''; // Mặc định trình duyệt sẽ hỏi xác nhận
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [unsavedChanges]);

  // Note: useBlocker cannot be used here because the app uses BrowserRouter instead of createBrowserRouter (Data Router).

  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!cvData) return <div className="p-8 text-center text-slate-500">Đang tải Workspace...</div>;

  const handleSectionDataChange = (section: string, value: any) => {
    setCvData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        sectionsData: {
          ...prev.sectionsData,
          [section]: value
        }
      };
    });
    setUnsavedChanges(prev => prev + 1);
  };

  const handleSaveDraft = async () => {
    if (!id || id === 'new') return;
    
    try {
      setIsSaving(true);
      await cvService.updateDraft(id, { sectionsData: cvData.sectionsData });
      setUnsavedChanges(0);
      setLastSaved(new Date());
    } catch (err: any) {
      console.error('Lưu nháp thất bại:', err);
      // alert('Không thể lưu nháp: ' + (err.response?.data?.message || err.message));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-white overflow-hidden">
      {/* Workspace Header */}
      <div className="h-14 border-b border-slate-200 px-4 flex items-center justify-between shrink-0 bg-white z-20">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate('/cv')}
            className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-md transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="h-4 w-px bg-slate-300"></div>
          <span className="font-semibold text-sm text-slate-800">
            {cvData.sectionsData?.personalInfo?.fullName || 'CV Chưa Đặt Tên'}
          </span>
          <span className="text-xs font-medium bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200">
            v{cvData.versionNumber}
          </span>
          <DraftIndicator unsavedChangesCount={unsavedChanges} lastSavedAt={lastSaved} isSaving={isSaving} />
        </div>

        <div className="flex items-center space-x-4">
          <LanguageSwitcher 
            currentLanguage={cvData.languageCode} 
            onLanguageChange={(lang) => setCvData({ ...cvData, languageCode: lang as any })} 
          />
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => {
                if (viewMode === 'history') {
                  setSearchParams({});
                  setPreviewVersionId(null);
                  setPreviewData(null);
                } else {
                  setSearchParams({ tab: 'history' });
                }
              }}
              className={viewMode === 'history' ? 'bg-slate-100' : ''}
            >
              Lịch sử
            </Button>
            <Button variant="outline" size="sm" onClick={handleSaveDraft} disabled={isSaving || unsavedChanges === 0 || viewMode === 'history'}>
              {isSaving ? 'Đang lưu...' : 'Lưu nháp'}
            </Button>
            <Button 
              size="sm" 
              onClick={() => navigate(`/cv/${cvData.id}/publish`)}
              disabled={viewMode === 'history' || unsavedChanges > 0}
            >
              <Share size={14} className="mr-2" />
              Publish CV
            </Button>
          </div>
        </div>
      </div>

      {/* Workspace Body (3 Columns) */}
      <div className="flex-1 flex overflow-hidden">
        {viewMode === 'history' ? (
          <VersionHistorySidebar 
            cvId={id!} 
            selectedVersionId={previewVersionId} 
            onSelectVersion={loadVersionPreview}
            onRestoreVersion={handleRestoreVersion}
          />
        ) : (
          <WorkspaceSidebar 
            activeSection={activeSection} 
            onSectionSelect={setActiveSection} 
          />
        )}
        
        <div className="flex-1 flex flex-col overflow-hidden relative">
          {viewMode === 'history' && (
            <div className="bg-blue-50 border-b border-blue-200 p-3 flex justify-between items-center text-sm z-10 shrink-0">
              <span className="text-blue-800 font-medium">Bạn đang xem phiên bản lịch sử. Các thao tác chỉnh sửa tạm thời bị khóa.</span>
              <Button size="sm" variant="outline" className="bg-white" onClick={() => {
                setSearchParams({});
                setPreviewVersionId(null);
                setPreviewData(null);
              }}>
                Quay lại Bản Nháp
              </Button>
            </div>
          )}
          
          <CVEditorPanel 
            activeSection={activeSection} 
            data={viewMode === 'history' ? (previewData || cvData.sectionsData) : cvData.sectionsData} 
            onChange={handleSectionDataChange} 
            disabled={viewMode === 'history'}
          />
          
          {isPreviewLoading && (
            <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-20 flex items-center justify-center">
              <div className="bg-white p-4 rounded-lg shadow-lg flex items-center text-slate-600">
                <span className="animate-pulse">Đang tải nội dung phiên bản...</span>
              </div>
            </div>
          )}
        </div>

        <CVPreviewPanel 
          data={viewMode === 'history' ? (previewData || cvData.sectionsData) : cvData.sectionsData} 
        />
      </div>
    </div>
  );
}
