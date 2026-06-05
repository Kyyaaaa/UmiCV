import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CVProfile, CVSections } from '../../types';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, Share } from 'lucide-react';
import { WorkspaceSidebar } from '../../components/cv-workspace/WorkspaceSidebar';
import { CVEditorPanel } from '../../components/cv-workspace/CVEditorPanel';
import { CVPreviewPanel } from '../../components/cv-workspace/CVPreviewPanel';
import { DraftIndicator } from '../../components/cv-workspace/DraftIndicator';
import { LanguageSwitcher } from '../../components/cv-workspace/LanguageSwitcher';
import { cvService } from '../../services/cv.service';

export function CVWorkspace() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [cvData, setCvData] = useState<CVProfile | null>(null);
  const [activeSection, setActiveSection] = useState('personalInfo');
  const [unsavedChanges, setUnsavedChanges] = useState(0);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      // Safely merge sectionsData
      const finalData = {
        ...res.data,
        sectionsData: {
          ...defaultSections,
          ...(res.data.sectionsData || {})
        }
      };

      setCvData(finalData);
      setLastSaved(new Date(res.data.updatedAt));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể tải CV');
    }
  };

  // Auto-save logic
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

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
            <Button variant="outline" size="sm" onClick={handleSaveDraft} disabled={isSaving || unsavedChanges === 0}>
              {isSaving ? 'Đang lưu...' : 'Lưu nháp'}
            </Button>
            <Button size="sm" onClick={() => navigate(`/cv/${cvData.id}/publish`)}>
              <Share size={14} className="mr-2" />
              Publish CV
            </Button>
          </div>
        </div>
      </div>

      {/* Workspace Body (3 Columns) */}
      <div className="flex-1 flex overflow-hidden">
        <WorkspaceSidebar 
          activeSection={activeSection} 
          onSectionSelect={setActiveSection} 
        />
        <CVEditorPanel 
          activeSection={activeSection} 
          data={cvData.sectionsData} 
          onChange={handleSectionDataChange} 
        />
        <CVPreviewPanel 
          data={cvData.sectionsData} 
        />
      </div>
    </div>
  );
}
