import React from 'react';
import { CVSections } from '../../types';

interface CVPreviewPanelProps {
  data: CVSections;
}

export function CVPreviewPanel({ data }: CVPreviewPanelProps) {
  return (
    <div className="w-[500px] bg-slate-100 border-l border-slate-200 flex flex-col h-full">
      <div className="p-3 border-b border-slate-200 bg-white flex justify-between items-center shadow-sm z-10">
        <h3 className="text-sm font-semibold text-slate-700">Live Preview</h3>
        <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded">A4 Format</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 bg-[#f0f2f5] flex justify-center">
        {/* A4 Paper Mock */}
        <div className="bg-white shadow-md rounded-sm w-[400px] min-h-[565px] p-6 text-slate-800 scale-100 transform origin-top">
          {/* Header / Personal Info */}
          <div className="text-center border-b-2 border-slate-800 pb-4 mb-4">
            <h1 className="text-2xl font-bold uppercase tracking-wider text-slate-900">
              {data.personalInfo?.fullName || 'HỌ VÀ TÊN'}
            </h1>
            <h2 className="text-sm font-medium text-blue-700 uppercase tracking-widest mt-1 mb-3">
              {data.personalInfo?.title || 'Vị trí ứng tuyển'}
            </h2>
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[10px] text-slate-600">
              <span>{data.personalInfo?.phone || 'SĐT'}</span>
              <span>•</span>
              <span>{data.personalInfo?.email || 'Email'}</span>
            </div>
          </div>

          {/* Summary */}
          {data.personalInfo?.summary && (
            <div className="mb-4">
              <p className="text-[11px] leading-relaxed text-justify">
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

          {/* Experience (Mock render) */}
          <div className="mb-4">
            <h3 className="text-xs font-bold uppercase border-b border-slate-300 pb-1 mb-2 text-slate-800">Kinh nghiệm làm việc</h3>
            {data.experience?.map((exp: any, idx: number) => (
              <div key={idx} className="mb-3">
                <div className="flex justify-between items-baseline">
                  <h4 className="text-[11px] font-bold">{exp.role}</h4>
                  <span className="text-[9px] text-slate-500">{exp.startDate} - {exp.endDate}</span>
                </div>
                <div className="text-[10px] font-medium text-slate-600 mb-1">{exp.company}</div>
                <p className="text-[10px] leading-relaxed pl-2 border-l-2 border-slate-200 text-slate-600">
                  {exp.description}
                </p>
              </div>
            ))}
            {(!data.experience || data.experience.length === 0) && (
              <p className="text-[10px] text-slate-400 italic">Chưa có dữ liệu kinh nghiệm...</p>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
