import React from 'react';
import { User, Award, Briefcase, GraduationCap, Code, FileText, GripVertical } from 'lucide-react';

interface Section {
  id: string;
  title: string;
  icon: React.ReactNode;
}

const SECTIONS: Section[] = [
  { id: 'personalInfo', title: 'Thông tin cá nhân', icon: <User size={16} /> },
  { id: 'skills', title: 'Kỹ năng chuyên môn', icon: <Code size={16} /> },
  { id: 'experience', title: 'Kinh nghiệm làm việc', icon: <Briefcase size={16} /> },
  { id: 'education', title: 'Học vấn', icon: <GraduationCap size={16} /> },
  { id: 'projects', title: 'Dự án', icon: <FileText size={16} /> },
];

interface WorkspaceSidebarProps {
  activeSection: string;
  onSectionSelect: (id: string) => void;
}

export function WorkspaceSidebar({ activeSection, onSectionSelect }: WorkspaceSidebarProps) {
  return (
    <div className="w-64 bg-slate-50 border-r border-slate-200 p-4 flex flex-col h-full overflow-y-auto">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-2">
        Cấu trúc CV
      </h3>
      <div className="space-y-1">
        {SECTIONS.map((section) => (
          <div
            key={section.id}
            onClick={() => onSectionSelect(section.id)}
            className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors group ${
              activeSection === section.id
                ? 'bg-blue-100 text-blue-700 font-medium'
                : 'text-slate-700 hover:bg-slate-200'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className={`${activeSection === section.id ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                {section.icon}
              </div>
              <span className="text-sm">{section.title}</span>
            </div>
            <GripVertical size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 cursor-grab" />
          </div>
        ))}
      </div>
      
      <div className="mt-8 px-2">
        <button className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-700 hover:border-slate-400 transition-colors">
          + Thêm mục mới
        </button>
      </div>
    </div>
  );
}
