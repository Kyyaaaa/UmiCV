import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams, useBlocker } from 'react-router-dom';
import { CVProfile, CVSections } from '../../types';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { ArrowLeft, Share, Settings, Eye, Edit2 } from 'lucide-react';
import { pdf } from '@react-pdf/renderer';
import { CVEditorPanel } from '../../components/cv-workspace/CVEditorPanel';
import { CVPreviewPanel } from '../../components/cv-workspace/CVPreviewPanel';
import { DraftIndicator } from '../../components/cv-workspace/DraftIndicator';
import { LanguageSwitcher } from '../../components/cv-workspace/LanguageSwitcher';
import { VersionHistorySidebar } from '../../components/cv-workspace/VersionHistorySidebar';
import { CopyLocalizationModal } from '../../components/cv-workspace/CopyLocalizationModal';
import { CVPdfDocument } from '../../components/cv-workspace/CVPdfDocument';
import { cvService } from '../../services/cv.service';

export function CVWorkspace() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const viewMode = searchParams.get('tab') === 'history' ? 'history' : 'draft';

  const [cvData, setCvData] = useState<CVProfile | null>(null);
  const [activeSection, setActiveSection] = useState('personalInfo');
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Layout States
  const [layoutMode, setLayoutMode] = useState<'split' | 'tabs'>('split');
  const [activeTab, setActiveTab] = useState<'editor' | 'viewer'>('editor');
  const [scale, setScale] = useState(100);

  // Preview Mode States
  const [previewVersionId, setPreviewVersionId] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<CVSections | null>(null);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  // Copy Localization States
  const [copyModalOpen, setCopyModalOpen] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ title: string, type: 'success' | 'error' } | null>(null);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  // Restore Version States
  const [restoreModalOpen, setRestoreModalOpen] = useState(false);
  const [versionToRestore, setVersionToRestore] = useState<string | null>(null);

  // Unsaved Changes Navigation Guard State
  type UnsavedAction = {
    proceed: () => void;
    reset: () => void;
  } | null;
  const [pendingUnsavedAction, setPendingUnsavedAction] = useState<UnsavedAction>(null);

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
        personalInfo: { name: '', email: '', phone: '', role: '', about: '', location: '', website: '', github: '', linkedin: '' },
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
        personalInfo: { name: '', email: '', phone: '', role: '', about: '', location: '', website: '', github: '', linkedin: '' },
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
      setIsDirty(false);
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
      await cvService.updateDraft(id, { sectionsData: cvData!.sectionsData });
      setIsDirty(false);
      setLastSaved(new Date());
    } catch (err: any) {
      console.error('Lưu nháp thất bại:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!id || id === 'new') return;
    try {
      setIsPublishing(true);
      if (isDirty && cvData) {
        await cvService.updateDraft(id, { sectionsData: cvData.sectionsData });
        setIsDirty(false);
        setLastSaved(new Date());
      }
      navigate(`/cv/${id}/publish`);
    } catch (err: any) {
      console.error('Lỗi khi nộp CV:', err);
      showToast('Không thể lưu nháp trước khi nộp: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDownloadPdf = async () => {
    setIsDownloadingPdf(true);
    if (!cvData) return;
    try {
      const dataToRender = viewMode === 'history' ? (previewData || cvData.sectionsData) : cvData.sectionsData;
      const doc = <CVPdfDocument data={dataToRender} />;
      const asPdf = pdf(doc);
      const blob = await asPdf.toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `CV_${cvData?.sectionsData?.personalInfo?.name || 'Umi'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (err) {
      console.error('Lỗi tạo PDF:', err);
      showToast('Lỗi khi tải PDF. Vui lòng thử lại.', 'error');
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      isDirty &&
      currentLocation.pathname !== nextLocation.pathname
  );

  useEffect(() => {
    if (blocker.state === "blocked") {
      setPendingUnsavedAction({
        proceed: () => { blocker.proceed(); },
        reset: () => { blocker.reset(); }
      });
    }
  }, [blocker]);

  // BUG-01: Unsaved Changes Protection (beforeunload + useBlocker)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = ''; // Required for Chrome
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);


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
      setIsDirty(true);
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
    setIsDirty(true);
  };



  const handleCopyLocalization = async (langCode: string) => {
    if (!id) return;
    try {
      setIsCopying(true);
      const res = await cvService.copyLocalization(id, langCode);
      setCopyModalOpen(false);
      navigate(`/cv/${res.data.id}/workspace`);
    } catch (err: any) {
      console.error('Lỗi khi nhân bản:', err);
      showToast('Không thể nhân bản CV: ' + (err.response?.data?.message || err.message), 'error');
    } finally {
      setIsCopying(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 font-sans text-slate-900 overflow-hidden custom-font-inter">
      {/* Top Navigation Bar */}
      <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/cv')}
            className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-md transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="font-bold text-lg text-blue-600 truncate max-w-[200px]">
            {cvData.sectionsData?.personalInfo?.name || 'CV Chưa Đặt Tên'}
          </div>
          <span className="text-xs font-medium bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200">
            v{cvData.versionNumber}
          </span>
          <DraftIndicator isDirty={isDirty} lastSavedAt={lastSaved} isSaving={isSaving} />
        </div>

        <div className="flex gap-4 items-center">
          <div className="hidden md:flex items-center gap-2">
            <span className="text-sm font-medium">Zoom: {scale}%</span>
            <input
              type="range"
              min="50"
              max="150"
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
              className="w-24"
            />
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLayoutMode(layoutMode === 'split' ? 'tabs' : 'split')}
            className="hidden md:flex whitespace-nowrap"
          >
            Chế độ: {layoutMode === 'split' ? 'Chia đôi' : 'Tab'}
          </Button>
          <div className="h-6 w-px bg-slate-300 hidden md:block"></div>
          <LanguageSwitcher
            currentLanguage={cvData.languageCode}
            onLanguageSelect={(lang) => {
              if (isDirty) {
                setPendingUnsavedAction({
                  proceed: () => { setCopyModalOpen(true); },
                  reset: () => {}
                });
              } else {
                setCopyModalOpen(true);
              }
            }}
          />
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
          <Button variant="outline" size="sm" onClick={handleSaveDraft} disabled={isSaving || !isDirty || viewMode === 'history' || cvData.status === 'PendingApproval'}>
            {isSaving ? 'Đang lưu...' : 'Lưu nháp'}
          </Button>
          <Button 
            size="sm" 
            onClick={handlePublish} 
            disabled={isPublishing || viewMode === 'history' || cvData.status === 'PendingApproval'}
            className={cvData.status === 'PendingApproval' ? 'bg-amber-500 hover:bg-amber-600 text-white border-transparent' : cvData.status === 'Updated' ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-transparent' : 'bg-green-600 hover:bg-green-700 text-white border-transparent'}
          >
            {isPublishing ? 'Đang nộp...' : cvData.status === 'PendingApproval' ? 'Đang chờ duyệt' : cvData.status === 'Updated' ? (isDirty ? 'Cập nhật CV' : 'Đã duyệt') : 'Nộp CV'}
          </Button>
          <Button
            onClick={handleDownloadPdf}
            disabled={isDownloadingPdf || viewMode === 'history'}
            className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700 h-9 px-3 ${viewMode === 'history' ? 'pointer-events-none opacity-50' : ''}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
            {isDownloadingPdf ? 'Đang tạo PDF...' : 'Tải PDF'}
          </Button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {viewMode === 'history' && (
          <VersionHistorySidebar
            cvId={id!}
            selectedVersionId={previewVersionId}
            onSelectVersion={loadVersionPreview}
            onRestoreVersion={handleRestoreVersion}
          />
        )}
        
        {layoutMode === 'split' ? (
          /* Split Mode Layout */
          <div className="grid grid-cols-1 lg:grid-cols-2 w-full h-full">
            <div className="overflow-y-auto h-full p-5 custom-scrollbar bg-slate-100">
              {viewMode === 'history' && (
                <div className="bg-blue-50 border-b border-blue-200 p-3 mb-4 rounded flex flex-col justify-between items-center gap-2 text-sm z-10 shrink-0">
                  <span className="text-blue-800 font-medium">Đang xem lịch sử</span>
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
                onSectionChange={setActiveSection}
                disabled={viewMode === 'history'}
              />
            </div>

            <div className="h-full overflow-auto pt-5 flex justify-center items-start custom-scrollbar bg-slate-200 relative">
              {isPreviewLoading && (
                <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-20 flex items-center justify-center">
                  <span className="animate-pulse text-slate-600 font-medium p-4 bg-white rounded shadow-sm">Đang tải nội dung phiên bản...</span>
                </div>
              )}
              <CVPreviewPanel
                data={viewMode === 'history' ? (previewData || cvData.sectionsData) : cvData.sectionsData}
                scale={scale}
              />
            </div>
          </div>
        ) : (
          /* Tabs Mode Layout */
          <div className="w-full h-full flex flex-col bg-slate-100 overflow-y-auto custom-scrollbar">
            <div className="flex justify-center my-6 shrink-0">
              <div className="bg-slate-200 p-1 rounded-lg inline-flex">
                <button
                  onClick={() => setActiveTab('editor')}
                  className={`flex items-center gap-2 px-6 py-2 rounded-md font-medium transition-colors ${activeTab === 'editor' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  <Edit2 size={16} /> Editor
                </button>
                <button
                  onClick={() => setActiveTab('viewer')}
                  className={`flex items-center gap-2 px-6 py-2 rounded-md font-medium transition-colors ${activeTab === 'viewer' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  <Eye size={16} /> Viewer
                </button>
              </div>
            </div>

            <div className="max-w-[1000px] mx-auto w-full px-4 pb-10">
              {activeTab === 'editor' && (
                <div className="w-full">
                  {viewMode === 'history' && (
                    <div className="bg-blue-50 border-b border-blue-200 p-3 mb-4 rounded flex flex-col justify-between items-center gap-2 text-sm z-10 shrink-0">
                      <span className="text-blue-800 font-medium">Đang xem lịch sử</span>
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
                    onSectionChange={setActiveSection}
                    disabled={viewMode === 'history'}
                  />
                </div>
              )}

              {activeTab === 'viewer' && (
                <div className="flex justify-center relative">
                  {isPreviewLoading && (
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-20 flex items-center justify-center">
                      <span className="animate-pulse text-slate-600 font-medium p-4 bg-white rounded shadow-sm">Đang tải nội dung phiên bản...</span>
                    </div>
                  )}
                  <CVPreviewPanel
                    data={viewMode === 'history' ? (previewData || cvData.sectionsData) : cvData.sectionsData}
                    scale={scale}
                  />
                </div>
              )}
            </div>
          </div>
        )}
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
            {isDirty
              ? 'Bản nháp hiện tại đang có thay đổi chưa lưu. Nếu khôi phục, bạn sẽ mất những thay đổi này. Tiếp tục?'
              : 'Bạn có chắc muốn khôi phục phiên bản này đè lên bản nháp hiện tại?'}
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setRestoreModalOpen(false)}>Hủy</Button>
            <Button onClick={executeRestore} className="bg-red-600 hover:bg-red-700 text-white border-transparent">Đồng ý khôi phục</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={!!pendingUnsavedAction} onClose={() => {
        pendingUnsavedAction?.reset();
        setPendingUnsavedAction(null);
      }} title="Bạn có thay đổi chưa được lưu">
        <div className="space-y-4">
          <p className="text-sm text-slate-700">
            Các thay đổi gần đây của bạn chưa được lưu nháp. 
            Nếu rời khỏi trang, các thay đổi này sẽ bị mất.<br/><br/>
            Bạn có muốn tiếp tục không?
          </p>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => {
              pendingUnsavedAction?.reset();
              setPendingUnsavedAction(null);
            }}>Ở lại</Button>
            <Button onClick={() => {
              pendingUnsavedAction?.proceed();
              setPendingUnsavedAction(null);
            }} className="bg-red-600 hover:bg-red-700 text-white border-transparent">
              Rời khỏi trang
            </Button>
          </div>
        </div>
      </Modal>

      {toastMessage && (
        <div className={`fixed bottom-6 right-6 px-4 py-3 rounded-lg shadow-lg text-sm font-medium flex items-center z-[200] animate-in slide-in-from-bottom-5 ${toastMessage.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'}`}>
          {toastMessage.title}
        </div>
      )}
      <style dangerouslySetInnerHTML={{
        __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        .custom-font-inter {
          font-family: 'Inter', sans-serif;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #cbd5e1;
          border-radius: 20px;
        }
      `}} />
    </div>
  );
}
