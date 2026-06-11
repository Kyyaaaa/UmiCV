import React from 'react';
import { CVSections } from '../../types';
import { Input } from '../ui/Input';

const StringArrayInput = ({ value, onChange, disabled }: { value: string[], onChange: (val: string[]) => void, disabled?: boolean }) => {
  const [text, setText] = React.useState((value || []).join(', '));
  
  React.useEffect(() => {
    const currentSemantics = text.split(',').map(s => s.trim()).filter(Boolean).join(',');
    const newSemantics = (value || []).map(s => s.trim()).filter(Boolean).join(',');
    if (currentSemantics !== newSemantics) {
      setText((value || []).join(', '));
    }
  }, [value]);

  return (
    <input 
      className="flex h-9 w-full rounded-md border border-slate-300 bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
      value={text}
      onChange={(e) => {
        setText(e.target.value);
        onChange(e.target.value.split(',').map(s => s.trim()).filter(Boolean));
      }}
      disabled={disabled}
    />
  );
};

interface CVEditorPanelProps {
  activeSection: string;
  data: CVSections;
  onChange: (section: string, value: any) => void;
  onSectionChange?: (section: string) => void;
  disabled?: boolean;
}

export function CVEditorPanel({ activeSection, data, onChange, onSectionChange, disabled = false }: CVEditorPanelProps) {
  
  const handlePersonalInfoChange = (field: string, value: string) => {
    onChange('personalInfo', { ...(data.personalInfo || {}), [field]: value });
  };

  const containerRef = React.useRef<HTMLDivElement>(null);
  const sectionRefs = React.useRef<{ [key: string]: HTMLDivElement | null }>({});

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the entry that is intersecting the most or first intersecting
        const intersectingEntry = entries.find((entry) => entry.isIntersecting);
        if (intersectingEntry && onSectionChange) {
          onSectionChange(intersectingEntry.target.id);
        }
      },
      {
        root: containerRef.current,
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0
      }
    );

    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [onSectionChange, data]); // Re-run when data changes (custom sections added)

  const renderSectionContent = (sectionKey: string) => {
    switch (sectionKey) {
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
                  value={data.personalInfo?.fullName || ''}
                  onChange={(e) => handlePersonalInfoChange('fullName', e.target.value)}
                  disabled={disabled}
                />
              </div>
              <div className="col-span-2">
                <Input 
                  label="Chức danh" 
                  value={data.personalInfo?.title || ''}
                  onChange={(e) => handlePersonalInfoChange('title', e.target.value)}
                  disabled={disabled}
                />
              </div>
              <Input 
                label="Email" 
                type="email"
                value={data.personalInfo?.email || ''}
                onChange={(e) => handlePersonalInfoChange('email', e.target.value)}
                disabled={disabled}
              />
              <Input 
                label="Số điện thoại" 
                value={data.personalInfo?.phone || ''}
                onChange={(e) => handlePersonalInfoChange('phone', e.target.value)}
                disabled={disabled}
              />
              <div className="col-span-2 space-y-1">
                <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-slate-700">Giới thiệu bản thân</label>
                <textarea 
                  className="w-full min-h-[120px] rounded-md border border-slate-300 bg-transparent px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  value={data.personalInfo?.summary || ''}
                  onChange={(e) => handlePersonalInfoChange('summary', e.target.value)}
                  disabled={disabled}
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
              {data.skills?.map((skill: any, index: number) => (
                <div key={index} className="flex items-center space-x-4 bg-slate-50 p-4 rounded-lg border border-slate-200">
                  <div className="flex-1">
                    <Input 
                      label="Tên kỹ năng" 
                      value={skill.name} 
                      onChange={(e) => {
                        const newSkills = [...(data.skills || [])];
                        newSkills[index].name = e.target.value;
                        onChange('skills', newSkills);
                      }}
                      disabled={disabled}
                    />
                  </div>
                  <div className="w-1/3">
                    <Input 
                      label="Mức độ (VD: 8/10)" 
                      value={skill.level} 
                      onChange={(e) => {
                        const newSkills = [...(data.skills || [])];
                        newSkills[index].level = e.target.value;
                        onChange('skills', newSkills);
                      }}
                      disabled={disabled}
                    />
                  </div>
                  <div className="pt-6">
                    <button 
                      onClick={() => {
                        const newSkills = data.skills.filter((_, i) => i !== index);
                        onChange('skills', newSkills);
                      }}
                      disabled={disabled}
                      className="text-red-500 text-sm font-medium hover:underline disabled:opacity-50"
                      title="Xóa kỹ năng này"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
              <button 
                onClick={() => {
                  const newSkills = [...(data.skills || []), { name: '', level: '' }];
                  onChange('skills', newSkills);
                }}
                className="w-full py-2 border-2 border-dashed border-blue-200 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" 
                disabled={disabled}
              >
                + Thêm kỹ năng
              </button>
            </div>
          </div>
        );
        
      case 'experience':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-1">Kinh nghiệm làm việc</h2>
              <p className="text-sm text-slate-500">Liệt kê quá trình công tác của bạn.</p>
            </div>
            <div className="space-y-6">
              {data.experience?.map((exp: any, index: number) => (
                <div key={index} className="bg-slate-50 p-5 rounded-lg border border-slate-200 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input 
                      label="Tên công ty" 
                      value={exp.company} 
                      onChange={(e) => {
                        const newExp = [...(data.experience || [])];
                        newExp[index].company = e.target.value;
                        onChange('experience', newExp);
                      }}
                      disabled={disabled}
                    />
                    <Input 
                      label="Vị trí/Chức danh" 
                      value={exp.role} 
                      onChange={(e) => {
                        const newExp = [...(data.experience || [])];
                        newExp[index].role = e.target.value;
                        onChange('experience', newExp);
                      }}
                      disabled={disabled}
                    />
                    <Input 
                      label="Từ (Tháng/Năm)" 
                      value={exp.startDate} 
                      onChange={(e) => {
                        const newExp = [...(data.experience || [])];
                        newExp[index].startDate = e.target.value;
                        onChange('experience', newExp);
                      }}
                      disabled={disabled}
                    />
                    <Input 
                      label="Đến (Tháng/Năm)" 
                      value={exp.endDate} 
                      onChange={(e) => {
                        const newExp = [...(data.experience || [])];
                        newExp[index].endDate = e.target.value;
                        onChange('experience', newExp);
                      }}
                      disabled={disabled}
                    />
                    <div className="col-span-2 space-y-1">
                      <label className="text-sm font-medium text-slate-700">Mô tả công việc</label>
                      <textarea 
                        className="w-full min-h-[100px] rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        value={exp.description}
                        onChange={(e) => {
                          const newExp = [...(data.experience || [])];
                          newExp[index].description = e.target.value;
                          onChange('experience', newExp);
                        }}
                        disabled={disabled}
                      />
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      const newExp = data.experience.filter((_, i) => i !== index);
                      onChange('experience', newExp);
                    }}
                    disabled={disabled}
                    className="text-red-500 text-sm font-medium hover:underline disabled:opacity-50"
                  >
                    Xóa kinh nghiệm này
                  </button>
                </div>
              ))}
              <button 
                onClick={() => {
                  const newExp = [...(data.experience || []), { company: '', role: '', startDate: '', endDate: '', description: '' }];
                  onChange('experience', newExp);
                }}
                className="w-full py-2 border-2 border-dashed border-blue-200 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors disabled:opacity-50" 
                disabled={disabled}
              >
                + Thêm kinh nghiệm làm việc
              </button>
            </div>
          </div>
        );

      case 'education':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-1">Học vấn</h2>
              <p className="text-sm text-slate-500">Quá trình đào tạo và bằng cấp.</p>
            </div>
            <div className="space-y-6">
              {data.education?.map((edu: any, index: number) => (
                <div key={index} className="bg-slate-50 p-5 rounded-lg border border-slate-200 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Input 
                        label="Trường / Cơ sở đào tạo" 
                        value={edu.school} 
                        onChange={(e) => {
                          const newEdu = [...(data.education || [])];
                          newEdu[index].school = e.target.value;
                          onChange('education', newEdu);
                        }}
                        disabled={disabled}
                      />
                    </div>
                    <Input 
                      label="Chuyên ngành / Bằng cấp" 
                      value={edu.degree} 
                      onChange={(e) => {
                        const newEdu = [...(data.education || [])];
                        newEdu[index].degree = e.target.value;
                        onChange('education', newEdu);
                      }}
                      disabled={disabled}
                    />
                    <Input 
                      label="Năm hoàn thành" 
                      value={edu.year} 
                      onChange={(e) => {
                        const newEdu = [...(data.education || [])];
                        newEdu[index].year = e.target.value;
                        onChange('education', newEdu);
                      }}
                      disabled={disabled}
                    />
                  </div>
                  <button 
                    onClick={() => {
                      const newEdu = data.education.filter((_, i) => i !== index);
                      onChange('education', newEdu);
                    }}
                    disabled={disabled}
                    className="text-red-500 text-sm font-medium hover:underline disabled:opacity-50"
                  >
                    Xóa học vấn này
                  </button>
                </div>
              ))}
              <button 
                onClick={() => {
                  const newEdu = [...(data.education || []), { school: '', degree: '', year: '' }];
                  onChange('education', newEdu);
                }}
                className="w-full py-2 border-2 border-dashed border-blue-200 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors disabled:opacity-50" 
                disabled={disabled}
              >
                + Thêm học vấn
              </button>
            </div>
          </div>
        );

      case 'projects':
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-1">Dự án nổi bật</h2>
              <p className="text-sm text-slate-500">Các dự án tiêu biểu bạn đã tham gia.</p>
            </div>
            <div className="space-y-6">
              {data.projects?.map((proj: any, index: number) => (
                <div key={index} className="bg-slate-50 p-5 rounded-lg border border-slate-200 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input 
                      label="Tên dự án" 
                      value={proj.name} 
                      onChange={(e) => {
                        const newProj = [...(data.projects || [])];
                        newProj[index].name = e.target.value;
                        onChange('projects', newProj);
                      }}
                      disabled={disabled}
                    />
                    <Input 
                      label="Vai trò" 
                      value={proj.role} 
                      onChange={(e) => {
                        const newProj = [...(data.projects || [])];
                        newProj[index].role = e.target.value;
                        onChange('projects', newProj);
                      }}
                      disabled={disabled}
                    />
                    <div className="col-span-2 space-y-1">
                      <label className="text-sm font-medium text-slate-700">Công nghệ sử dụng (cách nhau bởi dấu phẩy)</label>
                      <StringArrayInput 
                        value={proj.technologies || []}
                        onChange={(newTechs) => {
                          const newProj = [...(data.projects || [])];
                          newProj[index].technologies = newTechs;
                          onChange('projects', newProj);
                        }}
                        disabled={disabled}
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <label className="text-sm font-medium text-slate-700">Mô tả chi tiết</label>
                      <textarea 
                        className="w-full min-h-[100px] rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        value={proj.description}
                        onChange={(e) => {
                          const newProj = [...(data.projects || [])];
                          newProj[index].description = e.target.value;
                          onChange('projects', newProj);
                        }}
                        disabled={disabled}
                      />
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      const newProj = data.projects.filter((_, i) => i !== index);
                      onChange('projects', newProj);
                    }}
                    disabled={disabled}
                    className="text-red-500 text-sm font-medium hover:underline disabled:opacity-50"
                  >
                    Xóa dự án này
                  </button>
                </div>
              ))}
              <button 
                onClick={() => {
                  const newProj = [...(data.projects || []), { name: '', role: '', technologies: [], description: '' }];
                  onChange('projects', newProj);
                }}
                className="w-full py-2 border-2 border-dashed border-blue-200 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors disabled:opacity-50" 
                disabled={disabled}
              >
                + Thêm dự án
              </button>
            </div>
          </div>
        );
        
      default:
        // Handle Custom Dynamic Sections
        const customData = (data || {})[sectionKey] || [];
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-1 capitalize">{sectionKey}</h2>
                <p className="text-sm text-slate-500">Mục tùy chỉnh do bạn tự tạo.</p>
              </div>
              <button 
                onClick={() => {
                  onChange(sectionKey, undefined);
                }}
                disabled={disabled}
                className="text-red-600 text-sm font-medium px-3 py-1.5 rounded-md hover:bg-red-50 border border-transparent hover:border-red-100 transition-colors disabled:opacity-50"
              >
                Xóa toàn bộ mục này
              </button>
            </div>
            <div className="space-y-6">
              {customData.map((item: any, index: number) => (
                <div key={index} className="bg-slate-50 p-5 rounded-lg border border-slate-200 space-y-4">
                  <Input 
                    label="Tiêu đề (Ví dụ: Tên giải thưởng, Chứng chỉ)" 
                    value={item.title || ''} 
                    onChange={(e) => {
                      const newData = [...customData];
                      newData[index] = { ...newData[index], title: e.target.value };
                      onChange(sectionKey, newData);
                    }}
                    disabled={disabled}
                  />
                  <div className="space-y-1">
                    <label className="text-sm font-medium text-slate-700">Mô tả chi tiết / Thời gian</label>
                    <textarea 
                      className="w-full min-h-[80px] rounded-md border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                      value={item.description || ''}
                      onChange={(e) => {
                        const newData = [...customData];
                        newData[index] = { ...newData[index], description: e.target.value };
                        onChange(sectionKey, newData);
                      }}
                      disabled={disabled}
                    />
                  </div>
                  <button 
                    onClick={() => {
                      const newData = customData.filter((_: any, i: number) => i !== index);
                      onChange(sectionKey, newData);
                    }}
                    disabled={disabled}
                    className="text-red-500 text-sm font-medium hover:underline disabled:opacity-50"
                  >
                    Xóa mục này
                  </button>
                </div>
              ))}
              <button 
                onClick={() => {
                  const newData = [...customData, { title: '', description: '' }];
                  onChange(sectionKey, newData);
                }}
                className="w-full py-2 border-2 border-dashed border-blue-200 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors disabled:opacity-50" 
                disabled={disabled}
              >
                + Thêm nội dung mới vào {sectionKey}
              </button>
            </div>
          </div>
        );
    }
  };

  const standardKeys = ['personalInfo', 'skills', 'experience', 'education', 'projects'];
  const allSectionKeys = [
    ...standardKeys,
    ...Object.keys(data || {}).filter(k => !standardKeys.includes(k))
  ];

  const handleScrollToSection = (id: string) => {
    const el = sectionRefs.current[id];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    if (onSectionChange) onSectionChange(id);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-white p-8 relative scroll-smooth" ref={containerRef}>
      <div className="max-w-2xl mx-auto space-y-16 pb-32">
        {disabled && (
          <div className="flex gap-2 border-b border-slate-200 pb-4 mb-6 overflow-x-auto whitespace-nowrap hide-scrollbar sticky top-0 bg-white z-10">
            {allSectionKeys.map(k => (
              <button
                key={k}
                onClick={() => handleScrollToSection(k)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${activeSection === k ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
              >
                {k === 'personalInfo' ? 'Thông tin cá nhân' : 
                 k === 'skills' ? 'Kỹ năng' :
                 k === 'experience' ? 'Kinh nghiệm' :
                 k === 'education' ? 'Học vấn' :
                 k === 'projects' ? 'Dự án' : k}
              </button>
            ))}
          </div>
        )}
        
        {allSectionKeys.map(key => (
          <div 
            key={key} 
            id={key}
            ref={(el) => { sectionRefs.current[key] = el; }}
            className="scroll-mt-8"
          >
            {renderSectionContent(key)}
          </div>
        ))}
      </div>
    </div>
  );
}
