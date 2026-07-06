import React from 'react';
import { CVSections } from '../../types';

interface CVPreviewPanelProps {
  data: CVSections;
  scale?: number;
}

export function CVPreviewPanel({ data, scale = 100 }: CVPreviewPanelProps) {
  // Safe defaults
  const personalInfo = data?.personalInfo || {} as any;
  const experience = data?.experience || [];
  const education = data?.education || [];
  const skills = data?.skills || [];
  const projects = data?.projects || [];

  return (
    <div className="bg-slate-200 flex flex-col h-full overflow-y-auto items-center justify-start pt-8 pb-10 custom-scrollbar">
      <div
        className="bg-white shadow-xl origin-top transition-transform text-slate-800 flex flex-col custom-font-inter shrink-0"
        style={{
          width: '794px',
          minHeight: '1123px', // A4 ratio
          transform: `scale(${scale / 100})`
        }}
      >
        <div className="p-10 h-full flex flex-col font-sans">
          {/* Name & Role */}
          <div className="text-center mt-2">
            <h1 className="text-3xl font-bold text-slate-800 break-words">{personalInfo.name || 'HỌ VÀ TÊN'}</h1>
            <div className="text-slate-500 mt-2 text-[15px] break-words">{personalInfo.role || 'Vị trí ứng tuyển'}</div>
          </div>

          {/* Separator */}
          <hr className="mt-4 mb-3 border-slate-300" />

          {/* Contact Info */}
          <div className="flex flex-row flex-wrap text-[13px] justify-center gap-x-6 gap-y-2 text-slate-600">
            {personalInfo.phone && (
              <span className="flex items-center gap-1.5 font-normal">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                {personalInfo.phone}
              </span>
            )}
            {personalInfo.email && (
              <span className="flex items-center gap-1.5 font-normal">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
                {personalInfo.email}
              </span>
            )}
            {personalInfo.location && (
              <span className="flex items-center gap-1.5 font-normal">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                {personalInfo.location}
              </span>
            )}
            {personalInfo.website && (
              <a className="flex items-center gap-1.5 font-normal underline" href={personalInfo.website} target="_blank" rel="noreferrer">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/><path d="M2 12h20"/></svg>
                Website
              </a>
            )}
            {personalInfo.github && (
              <a className="flex items-center gap-1.5 font-normal underline" href={`https://github.com/${personalInfo.github}`} target="_blank" rel="noreferrer">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>
                {personalInfo.github}
              </a>
            )}
            {personalInfo.linkedin && (
              <a className="flex items-center gap-1.5 font-normal underline" href={personalInfo.linkedin} target="_blank" rel="noreferrer">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
                LinkedIn
              </a>
            )}
          </div>

          {/* Separator */}
          <hr className="mt-3 mb-4 border-slate-300" />

          {/* About */}
          {personalInfo.about && (
            <>
              <h2 className="flex items-center gap-2 text-[17px] font-bold mt-2 mb-3 text-slate-800">
                <span className="flex p-1 bg-slate-100 text-slate-600 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
                </span>
                About :
              </h2>
              <p className="text-[13px] text-slate-600 leading-relaxed mb-6 font-normal whitespace-pre-wrap break-words">
                {personalInfo.about}
              </p>
            </>
          )}

          {/* Experience */}
          {experience.length > 0 && (
            <>
              <h2 className="flex items-center gap-2 text-[17px] font-bold mb-4 text-slate-800">
                <span className="flex p-1 bg-slate-100 text-slate-600 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
                </span>
                Experience :
              </h2>
              {experience.map((exp: any, idx: number) => (
                <div key={idx} className="flex flex-col mb-5">
                  <div className="flex justify-between items-start mb-1.5 flex-wrap gap-2">
                    <span className="text-[14px] text-slate-700 break-words flex-1 min-w-[60%]"><strong>{exp.title}</strong>{exp.company ? ` - ${exp.company}` : ''}</span>
                    <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[11px] font-medium whitespace-nowrap shrink-0">{exp.date}</span>
                  </div>
                  <div className="text-[13px] text-slate-600 space-y-1 font-normal whitespace-pre-wrap break-words pl-2 border-l-2 border-slate-200">
                    {exp.desc}
                  </div>
                </div>
              ))}
            </>
          )}

          {/* Education */}
          {education.length > 0 && (
            <>
              <h2 className="flex items-center gap-2 text-[17px] font-bold mb-4 text-slate-800">
                <span className="flex p-1 bg-slate-100 text-slate-600 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>
                </span>
                Education :
              </h2>
              <div className="grid grid-cols-2 gap-4 mb-7">
                {education.map((edu: any, idx: number) => (
                  <div key={idx} className="flex flex-col break-words">
                    <div className="flex justify-between items-start mb-1 gap-2 flex-wrap">
                      <span className="text-[13px] text-slate-700 flex-1 min-w-[60%] break-words">{edu.institution}</span>
                      <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[11px] font-medium whitespace-nowrap shrink-0">{edu.date}</span>
                    </div>
                    <span className="text-slate-500 text-[12px] font-normal">{edu.qualification}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Skills */}
          {skills.length > 0 && (
            <>
              <h2 className="flex items-center gap-2 text-[17px] font-bold mb-4 text-slate-800">
                <span className="flex p-1 bg-slate-100 text-slate-600 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-3.46-3.52 2.5 2.5 0 0 1-1.12-3.72 2.5 2.5 0 0 1 3-3.64 2.5 2.5 0 0 1 3.52-2.48A2.5 2.5 0 0 1 9.5 2Z" /><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 3.46-3.52 2.5 2.5 0 0 0 1.12-3.72 2.5 2.5 0 0 0-3-3.64 2.5 2.5 0 0 0-3.52-2.48A2.5 2.5 0 0 0 14.5 2Z" /></svg>
                </span>
                Skills :
              </h2>
              <div className="flex flex-row flex-wrap gap-2 mb-7">
                {skills.map((skill: any, idx: number) => (
                  <span key={idx} className="bg-slate-50 border border-slate-100 text-slate-600 px-3 py-1.5 rounded text-[11px] font-medium shadow-sm">
                    {skill.name}
                  </span>
                ))}
              </div>
            </>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <>
              <h2 className="flex items-center gap-2 text-[17px] font-bold mb-4 text-slate-800">
                <span className="flex p-1 bg-slate-100 text-slate-600 rounded-full">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="m4.93 4.93 4.24 4.24" /><path d="m14.83 9.17 4.24-4.24" /><path d="m14.83 14.83 4.24 4.24" /><path d="m9.17 14.83-4.24 4.24" /><circle cx="12" cy="12" r="4" /></svg>
                </span>
                Projects :
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.map((project: any, idx: number) => (
                  <div key={idx} className="flex flex-col h-full break-words">
                    <div className="flex justify-between items-end w-full">
                      <span className="bg-slate-800 text-white px-3 py-1 rounded-t border-t border-x border-slate-800 text-[11px] font-bold tracking-wide truncate max-w-[80%]">
                        {project.name}
                      </span>
                      {project.link && (
                        <a href={project.link} target="_blank" rel="noreferrer" className="text-slate-500 text-[11px] underline mb-1 truncate max-w-[20%]">Link</a>
                      )}
                    </div>
                    <div className="border border-slate-800 p-2.5 rounded-b rounded-tr w-full text-[12px] text-slate-600 font-normal whitespace-pre-wrap flex-1">
                      {project.desc}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
