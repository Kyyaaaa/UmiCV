import React, { useEffect, useRef, useState } from 'react';
import { CVSections } from '../../types';

interface CVPreviewPanelProps {
  data: CVSections;
}

export function CVPreviewPanel({ data }: CVPreviewPanelProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [pageCount, setPageCount] = useState(1);
  const A4_HEIGHT = 565;

  useEffect(() => {
    // Measure content height to calculate how many A4 pages it takes
    const measure = () => {
      if (contentRef.current) {
        // Temporarily remove fixed height to measure true content height
        contentRef.current.style.height = 'auto';
        const scrollHeight = contentRef.current.scrollHeight;
        const count = Math.max(1, Math.ceil(scrollHeight / A4_HEIGHT));
        setPageCount(count);
        // Apply the quantized height (multiple of A4)
        contentRef.current.style.height = `${count * A4_HEIGHT}px`;
      }
    };

    // Small timeout to wait for React to render
    const timer = setTimeout(measure, 50);
    return () => clearTimeout(timer);
  }, [data]);

  return (
    <div className="w-[500px] shrink-0 bg-slate-100 border-l border-slate-200 flex flex-col h-full overflow-hidden">
      <div className="p-3 border-b border-slate-200 bg-white flex justify-between items-center shadow-sm z-10 shrink-0">
        <h3 className="text-sm font-semibold text-slate-700">Live Preview</h3>
        <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200">
          {pageCount} Trang A4
        </span>
      </div>
      
      {/* Vertical scrolling container */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 bg-[#f0f2f5]">
        
        {/* Continuous A4 Paper */}
        <div 
          className="relative mx-auto bg-white shadow-md rounded-sm w-[400px]"
          style={{ minHeight: A4_HEIGHT }}
        >
          {/* Page Dividers */}
          <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
            {Array.from({ length: pageCount - 1 }).map((_, i) => (
              <div 
                key={i}
                className="absolute w-full border-t border-dashed border-slate-300 flex items-center justify-center opacity-70"
                style={{ top: (i + 1) * A4_HEIGHT }}
              >
                <span className="bg-white px-2 py-0.5 text-[9px] text-slate-400 rounded-full border border-slate-200 -mt-2.5">
                  Page Break
                </span>
              </div>
            ))}
          </div>

          {/* Actual Content */}
          <div 
            ref={contentRef}
            className="relative z-10 text-slate-800 p-6 overflow-hidden"
          >
            {/* Header / Personal Info */}
            <div className="text-center border-b-2 border-slate-800 pb-4 mb-4">
              <h1 className="text-2xl font-bold uppercase tracking-wider text-slate-900">
                {data.personalInfo?.fullName || 'HỌ VÀ TÊN'}
              </h1>
              <h2 className="text-sm font-medium text-blue-700 uppercase tracking-widest mt-1 mb-3">
                {data.personalInfo?.title || 'Vị trí ứng tuyển'}
              </h2>
              <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[10px] text-slate-600 break-words">
                <span>{data.personalInfo?.phone || 'SĐT'}</span>
                <span>•</span>
                <span className="break-all">{data.personalInfo?.email || 'Email'}</span>
              </div>
            </div>

            {/* Summary */}
            {data.personalInfo?.summary && (
              <div className="mb-4">
                <p className="text-[11px] leading-relaxed text-justify whitespace-pre-wrap break-words">
                  {data.personalInfo.summary}
                </p>
              </div>
            )}

            {/* Skills */}
            {data.skills && data.skills.length > 0 && (
              <div className="mb-4">
                <h3 className="text-xs font-bold uppercase border-b border-slate-300 pb-1 mb-2 text-slate-800">Kỹ năng</h3>
                <div className="flex flex-wrap gap-2">
                  {data.skills?.map((skill: any, idx: number) => (
                    <span key={idx} className="text-[10px] bg-slate-100 px-2 py-0.5 rounded text-slate-700 border border-slate-200">
                      {skill.name} {skill.level ? `(${skill.level})` : ''}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Experience */}
            <div className="mb-4">
              <h3 className="text-xs font-bold uppercase border-b border-slate-300 pb-1 mb-2 text-slate-800">Kinh nghiệm làm việc</h3>
              {data.experience?.map((exp: any, idx: number) => (
                <div key={idx} className="mb-3">
                  <div className="flex justify-between items-baseline">
                    <h4 className="text-[11px] font-bold">{exp.role}</h4>
                    <span className="text-[9px] text-slate-500 shrink-0 ml-2">{exp.startDate} - {exp.endDate}</span>
                  </div>
                  <div className="text-[10px] font-medium text-slate-600 mb-1">{exp.company}</div>
                  <p className="text-[10px] leading-relaxed pl-2 border-l-2 border-slate-200 text-slate-600 whitespace-pre-wrap break-words">
                    {exp.description}
                  </p>
                </div>
              ))}
              {(!data.experience || data.experience.length === 0) && (
                <p className="text-[10px] text-slate-400 italic">Chưa có dữ liệu kinh nghiệm...</p>
              )}
            </div>
            
            {/* Education */}
            <div className="mb-4">
              <h3 className="text-xs font-bold uppercase border-b border-slate-300 pb-1 mb-2 text-slate-800">Học vấn</h3>
              {data.education?.map((edu: any, idx: number) => (
                <div key={idx} className="mb-2 flex justify-between items-start">
                  <div>
                    <h4 className="text-[11px] font-bold">{edu.school}</h4>
                    <div className="text-[10px] text-slate-600">{edu.degree}</div>
                  </div>
                  <span className="text-[9px] text-slate-500 shrink-0 ml-2">{edu.year}</span>
                </div>
              ))}
            </div>

            {/* Projects */}
            {data.projects && data.projects.length > 0 && (
              <div className="mb-4">
                <h3 className="text-xs font-bold uppercase border-b border-slate-300 pb-1 mb-2 text-slate-800">Dự án tiêu biểu</h3>
                {data.projects.map((proj: any, idx: number) => (
                  <div key={idx} className="mb-3">
                    <div className="flex items-baseline space-x-2">
                      <h4 className="text-[11px] font-bold">{proj.name}</h4>
                      <span className="text-[10px] text-slate-600 border-l border-slate-300 pl-2">{proj.role}</span>
                    </div>
                    {proj.technologies && proj.technologies.length > 0 && (
                      <div className="text-[9px] font-medium text-slate-500 mt-0.5 mb-1 break-words">
                        Công nghệ: {proj.technologies.join(', ')}
                      </div>
                    )}
                    <p className="text-[10px] leading-relaxed text-slate-600 mt-1 whitespace-pre-wrap break-words">
                      {proj.description}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
