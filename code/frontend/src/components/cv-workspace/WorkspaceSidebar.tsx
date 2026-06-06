import React, { useState } from 'react';
import { User, Award, Briefcase, GraduationCap, Code, FileText, GripVertical, Edit2 } from 'lucide-react';

import { CVSections } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

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
  data?: CVSections;
  onAddSection?: (id: string) => void;
  onRenameSection?: (oldKey: string, newKey: string) => void;
  onReorderCustomSections?: (newOrder: string[]) => void;
}

export function WorkspaceSidebar({ activeSection, onSectionSelect, data, onAddSection, onRenameSection, onReorderCustomSections }: WorkspaceSidebarProps) {
  const [promptOpen, setPromptOpen] = useState(false);
  const [promptValue, setPromptValue] = useState('');

  const [renamePromptOpen, setRenamePromptOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState('');
  const [renameValue, setRenameValue] = useState('');

  const [draggedItem, setDraggedItem] = useState<string | null>(null);

  const customSectionIds = data 
    ? Object.keys(data).filter(key => !SECTIONS.find(s => s.id === key))
    : [];

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItem(id);
    e.dataTransfer.effectAllowed = 'move';
    // Small delay to prevent the dragged element from disappearing
    setTimeout(() => {
      e.target && (e.target as HTMLElement).classList.add('opacity-50');
    }, 0);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    if (!draggedItem || draggedItem === id) return;

    const draggedIndex = customSectionIds.indexOf(draggedItem);
    const targetIndex = customSectionIds.indexOf(id);

    if (draggedIndex !== -1 && targetIndex !== -1 && onReorderCustomSections) {
      const newOrder = [...customSectionIds];
      newOrder.splice(draggedIndex, 1);
      newOrder.splice(targetIndex, 0, draggedItem);
      onReorderCustomSections(newOrder);
    }
  };

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedItem(null);
    e.target && (e.target as HTMLElement).classList.remove('opacity-50');
  };

  const handleAddSection = () => {
    setPromptValue('');
    setPromptOpen(true);
  };

  const handleConfirmAdd = () => {
    const cleanId = promptValue.trim();
    if (cleanId && onAddSection) {
      onAddSection(cleanId);
    }
    setPromptOpen(false);
  };

  const handleRenameClick = (e: React.MouseEvent, key: string) => {
    e.stopPropagation();
    setRenameTarget(key);
    setRenameValue(key);
    setRenamePromptOpen(true);
  };

  const handleConfirmRename = () => {
    const cleanId = renameValue.trim();
    if (cleanId && cleanId !== renameTarget && onRenameSection) {
      onRenameSection(renameTarget, cleanId);
    }
    setRenamePromptOpen(false);
  };

  return (
    <div className="w-64 shrink-0 bg-slate-50 border-r border-slate-200 p-4 flex flex-col h-full overflow-y-auto">
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

      {customSectionIds.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-2">
            Mục tùy chỉnh
          </h3>
          <div className="space-y-1">
            {customSectionIds.map(key => (
              <div
                key={key}
                draggable
                onDragStart={(e) => handleDragStart(e, key)}
                onDragOver={(e) => handleDragOver(e, key)}
                onDragEnd={handleDragEnd}
                onClick={() => onSectionSelect(key)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors group ${
                  draggedItem === key ? 'opacity-50' : ''
                } ${
                  activeSection === key
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : 'text-slate-700 hover:bg-slate-200'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`${activeSection === key ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                    <Award size={16} />
                  </div>
                  <span className="text-sm capitalize">{key}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Edit2 
                    size={14} 
                    className="text-slate-400 hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" 
                    onClick={(e) => handleRenameClick(e, key)}
                  />
                  <GripVertical size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 cursor-grab" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="mt-8 px-2">
        <button 
          onClick={handleAddSection}
          className="w-full py-2 border-2 border-dashed border-slate-300 rounded-lg text-sm font-medium text-slate-500 hover:text-slate-700 hover:border-slate-400 transition-colors"
        >
          + Thêm mục mới
        </button>
      </div>

      <Modal isOpen={promptOpen} onClose={() => setPromptOpen(false)} title="Thêm mục mới">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tên mục mới (Tiếng Việt có dấu được chấp nhận)</label>
            <input 
              type="text" 
              autoFocus
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ví dụ: Giải thưởng, Chứng chỉ, Sở thích..."
              value={promptValue}
              onChange={(e) => setPromptValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleConfirmAdd()}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setPromptOpen(false)}>Hủy</Button>
            <Button onClick={handleConfirmAdd} disabled={!promptValue.trim()}>Tạo mục</Button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={renamePromptOpen} onClose={() => setRenamePromptOpen(false)} title="Đổi tên mục">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Tên mục mới</label>
            <input 
              type="text" 
              autoFocus
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nhập tên mục..."
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleConfirmRename()}
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <Button variant="outline" onClick={() => setRenamePromptOpen(false)}>Hủy</Button>
            <Button onClick={handleConfirmRename} disabled={!renameValue.trim() || renameValue.trim() === renameTarget}>Đổi tên</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
