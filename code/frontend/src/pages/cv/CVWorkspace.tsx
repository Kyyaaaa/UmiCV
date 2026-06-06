import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { CVProfile, CVSections } from '../../types';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { ArrowLeft, Share } from 'lucide-react';
import { WorkspaceSidebar } from '../../components/cv-workspace/WorkspaceSidebar';
import { CVEditorPanel } from '../../components/cv-workspace/CVEditorPanel';
import { CVPreviewPanel } from '../../components/cv-workspace/CVPreviewPanel';
import { DraftIndicator } from '../../components/cv-workspace/DraftIndicator';
import { LanguageSwitcher } from '../../components/cv-workspace/LanguageSwitcher';
import { VersionHistorySidebar } from '../../components/cv-workspace/VersionHistorySidebar';
import { CopyLocalizationModal } from '../../components/cv-workspace/CopyLocalizationModal';
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

  // Copy Localization States
  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ title: string, type: 'success' | 'error' } | null>(null);

  const [restoreModalOpen, setRestoreModalOpen] = useState(false);
  const [versionToRestore, setVersionToRestore] = useState<string | null>(null);

  const showToast = (title: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ title, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const isFirstRender = useRef(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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

      const safeSections: any = res.data.sectionsData || {};
      const finalData = {
        ...res.data,
        sectionsData: {
          ...safeSections,
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

  useEffect(() => {
    if (id && id !== 'new') {
      fetchCV();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

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

      const safeSnap: any = res.data.snapshotData || {};
      setPreviewData({
        ...safeSnap,
        personalInfo: safeSnap.personalInfo || defaultSections.personalInfo,
        skills: safeSnap.skills || [],
        experience: safeSnap.experience || [],
        projects: safeSnap.projects || [],
        education: safeSnap.education || []
      });
    } catch (err) {
      showToast('Không thể tải nội dung phiên bản này.', 'error');
      setIsPreviewLoading(false);
      setPreviewData(null);
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleRestoreVersion = async (versionId: string) => {
    setVersionToRestore(versionId);
    setRestoreModalOpen(true);
  };

  const executeRestore = async () => {
    if (!id || !versionToRestore) return;
    try {
      await cvService.restoreVersion(id, versionToRestore);

      const res = await cvService.getCVById(id);
      setCvData(res.data);
      setPreviewData(null);
      setPreviewVersionId(null);
      setSearchParams({});
      setUnsavedChanges(0);
      showToast('Khôi phục thành công!');
      setRestoreModalOpen(false);
    } catch (err: any) {
      showToast('Khôi phục thất bại: ' + (err.response?.data?.message || err.message), 'error');
    }
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
    if (value === undefined) {
      setCvData(prev => {
        if (!prev) return prev;
        const newSections = { ...prev.sectionsData };
        delete newSections[section];
        return { ...prev, sectionsData: newSections };
      });
      setActiveSection('personalInfo');
      setUnsavedChanges(prev => prev + 1);
      return;
    }

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

  const handleAddCustomSection = (sectionId: string) => {
    setCvData(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        sectionsData: {
          ...prev.sectionsData,
          [sectionId]: []
        }
      };
    });
    setUnsavedChanges(prev => prev + 1);
    setActiveSection(sectionId);
  };

  const handleCopyLocalization = async (langCode: string) => {
    if (!id) return;
    try {
      setIsCopying(true);
      const res = await cvService.copyLocalization(id, langCode);
      setCopyModalOpen(false);
      // Navigate to new CV
      navigate(`/cv/${res.data.id}/workspace`);
    } catch (err: any) {
      console.error('Lỗi khi nhân bản:', err);
      showToast('Không thể nhân bản CV: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-white overflow-hidden">
      {/* Workspace Header */}
      <div className="min-h-[56px] py-2 border-b border-slate-200 px-4 flex flex-wrap items-center justify-between gap-3 shrink-0 bg-white z-20">
        <div className="flex flex-wrap items-center gap-4">
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

        <div className="flex flex-wrap items-center gap-4">
          <LanguageSwitcher
            currentLanguage={cvData.languageCode}
            onLanguageSelect={(lang) => setCopyModalOpen(true)}
          />
          <div className="flex flex-wrap items-center gap-2">
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
      <div className="flex-1 flex overflow-x-auto overflow-y-hidden">
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
            data={cvData.sectionsData}
            onAddSection={handleAddCustomSection}
          />
        )}

        <div className="flex-1 flex flex-col overflow-hidden relative min-w-[450px]">
          {viewMode === 'history' && (
            <div className="bg-blue-50 border-b border-blue-200 p-3 flex flex-col sm:flex-row justify-between sm:items-center gap-2 text-sm z-10 shrink-0">
              <span className="text-blue-800 font-medium">Bạn đang xem phiên bản lịch sử. Các thao tác chỉnh sửa tạm thời bị khóa.</span>
              <Button size="sm" variant="outline" className="bg-white whitespace-nowrap self-start sm:self-auto" onClick={() => {
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
            onSectionChange={setActiveSection}
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

      <CopyLocalizationModal
        isOpen={copyModalOpen}
        onClose={() => setCopyModalOpen(false)}
        onConfirm={handleCopyLocalization}
        isCopying={isCopying}
        currentLanguage={cvData.languageCode}
      />

      <Modal isOpen={restoreModalOpen} onClose={() => setRestoreModalOpen(false)} title="Xác nhận khôi phục">
        <div className="space-y-4">
          <p className="text-sm text-slate-700">
            {unsavedChanges > 0
              ? 'Bản nháp hiện tại đang có thay đổi chưa lưu. Nếu khôi phục, bạn sẽ mất những thay đổi này. Tiếp tục?'
              : 'Bạn có chắc muốn khôi phục phiên bản này đè lên bản nháp hiện tại?'}
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setRestoreModalOpen(false)}>Hủy</Button>
            <Button onClick={executeRestore} className="bg-red-600 hover:bg-red-700 text-white border-transparent">Đồng ý khôi phục</Button>
          </div>
        </div>
      </Modal>

      {toastMessage && (
        <div className={`fixed bottom-6 right-6 px-4 py-3 rounded-lg shadow-lg text-sm font-medium flex items-center z-[200] animate-in slide-in-from-bottom-5 ${toastMessage.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
          {toastMessage.title}
        </div>
      )}
    </div>
  );
}
