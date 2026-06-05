import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { mockCVs } from '../../mocks/cvs.mock';
import { CVProfile, CVSections } from '../../types';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, Share } from 'lucide-react';
import { WorkspaceSidebar } from '../../components/cv-workspace/WorkspaceSidebar';
import { CVEditorPanel } from '../../components/cv-workspace/CVEditorPanel';
import { CVPreviewPanel } from '../../components/cv-workspace/CVPreviewPanel';
import { DraftIndicator } from '../../components/cv-workspace/DraftIndicator';
import { LanguageSwitcher } from '../../components/cv-workspace/LanguageSwitcher';

export function CVWorkspace() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [cvData, setCvData] = useState<CVProfile | null>(null);
  const [activeSection, setActiveSection] = useState('personalInfo');
  const [unsavedChanges, setUnsavedChanges] = useState(0);
  const [lastSaved, setLastSaved] = useState<Date | null>(new Date());

  useEffect(() => {
    // Mock fetch CV by id
    const found = mockCVs.find(cv => cv.id === id);
    if (found) {
      // Create a deep copy for drafting
      setCvData(JSON.parse(JSON.stringify(found)));
    } else if (id === 'new') {
      setCvData({
        id: 'new',
        userId: 'currentUser',
        languageCode: 'vi',
        status: 'Draft',
        versionNumber: 1,
        sectionsData: {
          personalInfo: { fullName: '', email: '', phone: '', title: '', summary: '' },
          skills: [],
          experience: [],
          projects: [],
          education: []
        },
        submittedAt: null,
        publishedAt: null,
        updatedAt: new Date().toISOString()
      });
    }
  }, [id]);

  if (!cvData) return <div className="p-8 text-center">Đang tải Workspace...</div>;

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

  const handleSaveDraft = () => {
    // Mock save
    setUnsavedChanges(0);
    setLastSaved(new Date());
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
            {cvData.sectionsData.personalInfo.fullName || 'CV Chưa Đặt Tên'}
          </span>
          <span className="text-xs font-medium bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200">
            v{cvData.versionNumber}
          </span>
          <DraftIndicator unsavedChangesCount={unsavedChanges} lastSavedAt={lastSaved} />
        </div>

        <div className="flex items-center space-x-4">
          <LanguageSwitcher 
            currentLanguage={cvData.languageCode} 
            onLanguageChange={(lang) => setCvData({ ...cvData, languageCode: lang as any })} 
          />
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleSaveDraft}>
              Lưu nháp
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
