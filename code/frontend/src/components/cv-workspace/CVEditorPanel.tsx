import React from 'react';
import { CVSections } from '../../types';
import { Input } from '../ui/Input';

interface CVEditorPanelProps {
  activeSection: string;
  data: CVSections;
  onChange: (section: string, value: any) => void;
}

export function CVEditorPanel({ activeSection, data, onChange }: CVEditorPanelProps) {
  
  const handlePersonalInfoChange = (field: string, value: string) => {
    onChange('personalInfo', { ...data.personalInfo, [field]: value });
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'personalInfo':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-1">Thông tin cá nhân</h2>
              <p className="text-sm text-slate-500">Cập nhật thông tin liên hệ và chức danh của bạn.</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Input 
                  label="Họ và tên" 
                  value={data.personalInfo.fullName}
                  onChange={(e) => handlePersonalInfoChange('fullName', e.target.value)}
                />
              </div>
              <div className="col-span-2">
                <Input 
                  label="Chức danh" 
                  value={data.personalInfo.title}
                  onChange={(e) => handlePersonalInfoChange('title', e.target.value)}
                />
              </div>
              <Input 
                label="Email" 
                type="email"
                value={data.personalInfo.email}
                onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
              />
              <Input 
                label="Số điện thoại" 
                value={data.personalInfo.phone}
                onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
              />
              <div className="col-span-2 space-y-1">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700">Giới thiệu bản thân</label>
                <textarea 
                  className="w-full min-h-[120px] rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={data.personalInfo.summary}
                  onChange={(e) => handlePersonalInfoChange('summary', e.target.value)}
                />
              </div>
            </div>
          </div>
        );
      
      case 'skills':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-1">Kỹ năng chuyên môn</h2>
              <p className="text-sm text-slate-500">Thêm các kỹ năng nổi bật của bạn.</p>
            </div>
            <div className="space-y-4">
              {data.skills.map((skill: any, index: number) => (
                <div key={index} className="flex items-center space-x-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <div className="flex-1">
                    <Input 
                      label="Tên kỹ năng" 
                      value={skill.name} 
                      onChange={(e) => {
                        const newSkills = [...data.skills];
                        newSkills[index].name = e.target.value;
                        onChange('skills', newSkills);
                      }}
                    />
                  </div>
                  <div className="w-1/3">
                    <Input 
                      label="Mức độ (VD: 8/10)" 
                      value={skill.level} 
                      onChange={(e) => {
                        const newSkills = [...data.skills];
                        newSkills[index].level = e.target.value;
                        onChange('skills', newSkills);
                      }}
                    />
                  </div>
                </div>
              ))}
              <button className="w-full py-2 border-2 border-dashed border-blue-200 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors">
                + Thêm kỹ năng
              </button>
            </div>
          </div>
        );
        
      default:
        return (
          <div className="flex flex-col items-center justify-center h-64 text-slate-400">
            <p>Section chưa được cài đặt Form Editing.</p>
            <p className="text-sm mt-2">Dùng để test kiến trúc.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-white p-8">
      <div className="max-w-2xl mx-auto">
        {renderSection()}
      </div>
    </div>
  );
}
