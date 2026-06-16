import React, { useState } from 'react';
import { Settings, Eye, Edit2, Download, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { ConfirmModal } from "../../components/common/ConfirmModal";

/**
 * A mockup UI matching the exact layout of the reference `quickcv` project.
 */
export function QuickCVMockup() {
  const [viewMode, setViewMode] = useState<'split' | 'tabs'>('split');
  const [activeTab, setActiveTab] = useState<'editor' | 'viewer'>('editor');
  const [scale, setScale] = useState(100);
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);

  // Mock Editor Forms Stack
  const EditorStack = () => (
    <div className="grid gap-5">
      <div className="p-7 rounded bg-white shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold mb-4">Personal Details</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Name</label>
            <input type="text" className="w-full border border-slate-300 rounded p-2" value="Sidhanth Rathod" readOnly />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">About</label>
            <textarea className="w-full border border-slate-300 rounded p-2 h-24" readOnly value="Self-taught Front-End Web Developer passionate about creating beautiful and performant websites, aiming to create the best user experience possible! Everything I make is beautiful. I use Arch btw." />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
            <input type="text" className="w-full border border-slate-300 rounded p-2" value="Frontend Developer" readOnly />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input type="text" className="w-full border border-slate-300 rounded p-2" value="siduck@tutanota.com" readOnly />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
            <input type="text" className="w-full border border-slate-300 rounded p-2" value="+91 9701611257" readOnly />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Location</label>
            <input type="text" className="w-full border border-slate-300 rounded p-2" value="" placeholder="Enter location" readOnly />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Website</label>
            <input type="text" className="w-full border border-slate-300 rounded p-2" value="" placeholder="Enter website" readOnly />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">GitHub</label>
            <input type="text" className="w-full border border-slate-300 rounded p-2" value="siduck" readOnly />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Linkedin</label>
            <input type="text" className="w-full border border-slate-300 rounded p-2" value="https://www.linkedin.com/in/sidhanth-rathod-b3829a263" readOnly />
          </div>
        </div>
      </div>

      <div className="p-7 rounded bg-white shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold mb-4">Skills</h2>
        <div className="space-y-4">
          {['Html', 'Css', 'JavaScript', 'TypeScript', 'Svelte', 'SolidJS', 'React', 'Lua', 'Tailwind', 'UnoCSS'].map((skill) => (
            <div key={skill} className="grid grid-cols-2 gap-4 items-center bg-slate-50 p-3 rounded border border-slate-200">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Skill Name</label>
                <input type="text" className="w-full border border-slate-300 rounded p-1.5 text-sm" value={skill} readOnly />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Svg icon url</label>
                <input type="text" className="w-full border border-slate-300 rounded p-1.5 text-sm" value={`<svg>...</svg>`} readOnly />
              </div>
            </div>
          ))}
          <Button variant="outline" className="w-full border-dashed">Add Skill</Button>
        </div>
      </div>

      <div className="p-7 rounded bg-white shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold mb-4">Work Experience</h2>
        <div className="space-y-6">
          <div className="space-y-3 bg-slate-50 p-4 rounded border border-slate-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Company</label>
                <input type="text" className="w-full border border-slate-300 rounded p-1.5 text-sm" value="Jamesmccallumconsulting (Freelance)" readOnly />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Job Title</label>
                <input type="text" className="w-full border border-slate-300 rounded p-1.5 text-sm" value="React Developer" readOnly />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-slate-500 mb-1">Date</label>
                <input type="text" className="w-full border border-slate-300 rounded p-1.5 text-sm" value="2022 Oct - 2023 Jan" readOnly />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-slate-500 mb-1">Description</label>
                <textarea className="w-full border border-slate-300 rounded p-1.5 text-sm h-20" value="- Converted UI figma designs into responsive React + Tailwindcss components&#10;- Created responsive landing pages and a github profile dashboard using github search api" readOnly />
              </div>
            </div>
          </div>
          <div className="space-y-3 bg-slate-50 p-4 rounded border border-slate-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Company</label>
                <input type="text" className="w-full border border-slate-300 rounded p-1.5 text-sm" value="Ideanomic" readOnly />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Job Title</label>
                <input type="text" className="w-full border border-slate-300 rounded p-1.5 text-sm" value="Frontend Developer" readOnly />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-slate-500 mb-1">Date</label>
                <input type="text" className="w-full border border-slate-300 rounded p-1.5 text-sm" value="2023 April - 2025 May" readOnly />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-slate-500 mb-1">Description</label>
                <textarea className="w-full border border-slate-300 rounded p-1.5 text-sm h-28" value="- Responsible for creating and maintaining company's website&#10;- Converted UI figma designs into real responsive React + Unocss components&#10;- Used Git for version control system for managing various branches for deployment & integrated with vercel deployments&#10;- Used React and Nextjs to build a fully functional H.R platform, integrated API into the frontend to show user data and maintained four various deployments" readOnly />
              </div>
            </div>
          </div>
          <Button variant="outline" className="w-full border-dashed">Add Work</Button>
        </div>
      </div>

      <div className="p-7 rounded bg-white shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold mb-4">Project</h2>
        <div className="space-y-6">
          {[
            { name: 'Quick CV', link: 'https://github.com/siduck/quickcv', desc: 'Fast resume / cv builder for making beautiful resumes & supports exporting to high quality pdfs using native print(). This resume is generated by quickcv web app' },
            { name: 'NvChad', link: 'https://github.com/nvchad/nvchad', desc: 'Blazing fast Neovim config framework providing solid defaults, beautiful UI and a set of exclusive plugins built for it. Enabling users to create their own IDE experiences within Neovim! Most' },
            { name: 'Volt', link: 'https://github.com/nvzone/volt', desc: 'UI framework for drawing reactive & interactive interfaces within Neovim text editor.' },
            { name: 'Typr', link: 'https://github.com/nvzone/typr', desc: 'Most beautiful terminal typing practice plugin with fancy stats dashboard within Neovim made using Volt.' },
            { name: 'Minty', link: 'https://github.com/nvzone/minty', desc: 'Color manipulation popup ui within terminal for Neovim, like never before!' }
          ].map((proj) => (
            <div key={proj.name} className="space-y-3 bg-slate-50 p-4 rounded border border-slate-200">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Project Name</label>
                  <input type="text" className="w-full border border-slate-300 rounded p-1.5 text-sm" value={proj.name} readOnly />
                </div>
                <div>
                  <label className="block text-xs text-slate-500 mb-1">Link</label>
                  <input type="text" className="w-full border border-slate-300 rounded p-1.5 text-sm" value={proj.link} readOnly />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-slate-500 mb-1">Description</label>
                  <textarea className="w-full border border-slate-300 rounded p-1.5 text-sm h-16" value={proj.desc} readOnly />
                </div>
              </div>
            </div>
          ))}
          <Button variant="outline" className="w-full border-dashed">Add Project</Button>
        </div>
      </div>

      <div className="p-7 rounded bg-white shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold mb-4">Education</h2>
        <div className="space-y-6">
          <div className="space-y-3 bg-slate-50 p-4 rounded border border-slate-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Institution</label>
                <input type="text" className="w-full border border-slate-300 rounded p-1.5 text-sm" value="Sarada College" readOnly />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Date</label>
                <input type="text" className="w-full border border-slate-300 rounded p-1.5 text-sm" value="2019 – 2022" readOnly />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-slate-500 mb-1">Qualification</label>
                <input type="text" className="w-full border border-slate-300 rounded p-1.5 text-sm" value="BHMCT ( discontinued )" readOnly />
              </div>
            </div>
          </div>
          <div className="space-y-3 bg-slate-50 p-4 rounded border border-slate-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1">Institution</label>
                <input type="text" className="w-full border border-slate-300 rounded p-1.5 text-sm" value="Chaitanya College" readOnly />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">Date</label>
                <input type="text" className="w-full border border-slate-300 rounded p-1.5 text-sm" value="2017 – 2019" readOnly />
              </div>
              <div className="col-span-2">
                <label className="block text-xs text-slate-500 mb-1">Qualification</label>
                <input type="text" className="w-full border border-slate-300 rounded p-1.5 text-sm" value="Intermediate education" readOnly />
              </div>
            </div>
          </div>
          <Button variant="outline" className="w-full border-dashed">Add Education</Button>
        </div>
      </div>
    </div>
  );

  // Mock Resume Viewer
  const ResumeViewer = () => (
    <div
      className="bg-white shadow-xl origin-top transition-transform text-slate-800 flex flex-col custom-font-inter"
      style={{
        width: '794px',
        minHeight: '1123px', // A4 ratio, minHeight allows overflow to naturally extend the page
        transform: `scale(${scale / 100})`
      }}
    >
      <div className="p-10 h-full flex flex-col font-sans">
        {/* Name & Role */}
        <div className="text-center mt-2">
          <h1 className="text-3xl font-bold text-slate-800">Sidhanth Rathod</h1>
          <div className="text-slate-500 mt-2 text-[15px]">Frontend Developer</div>
        </div>

        {/* Separator */}
        <hr className="mt-4 mb-3 border-slate-300" />

        {/* Contact Info */}
        <div className="flex flex-row text-[13px] justify-center gap-6 text-slate-600">
          <span className="flex items-center gap-1.5 font-normal">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
            +91 9701611257
          </span>
          <span className="flex items-center gap-1.5 font-normal">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></svg>
            siduck@tutanota.com
          </span>
          <a className="flex items-center gap-1.5 font-normal underline" href="https://github.com/siduck" target="_blank" rel="noreferrer">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path><path d="M9 18c-4.51 2-5-2-7-2"></path></svg>
            @siduck
          </a>
        </div>

        {/* Separator */}
        <hr className="mt-3 mb-4 border-slate-300" />

        {/* About */}
        <h2 className="flex items-center gap-2 text-[17px] font-bold mt-2 mb-3 text-slate-800">
          <span className="flex p-1 bg-slate-100 text-slate-600 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="6" /><circle cx="12" cy="12" r="2" /></svg>
          </span>
          About :
        </h2>
        <p className="text-[13px] text-slate-600 leading-relaxed mb-6 font-normal">
          Self-taught Front-End Web Developer passionate about creating beautiful and performant websites, aiming to create the best user experience possible! Everything I make is beautiful. I use Arch btw.
        </p>

        {/* Experience */}
        <h2 className="flex items-center gap-2 text-[17px] font-bold mb-4 text-slate-800">
          <span className="flex p-1 bg-slate-100 text-slate-600 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" /><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>
          </span>
          Experience :
        </h2>

        <div className="flex flex-col mb-5">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[14px] text-slate-700"><strong>React Developer</strong> - Jamesmccallumconsulting (Freelance)</span>
            <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[11px] font-medium">2022 Oct - 2023 Jan</span>
          </div>
          <ul className="list-disc ml-5 text-[13px] text-slate-600 space-y-1 font-normal">
            <li>Converted UI figma designs into responsive React + Tailwindcss components.</li>
            <li>Created responsive landing pages and a github profile dashboard using github search api.</li>
          </ul>
        </div>

        <div className="flex flex-col mb-7">
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[14px] text-slate-700"><strong>Frontend Developer</strong> - Ideanomic</span>
            <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[11px] font-medium">2023 April - 2025 May</span>
          </div>
          <ul className="list-disc ml-5 text-[13px] text-slate-600 space-y-1 font-normal">
            <li>Responsible for creating and maintaining company's website.</li>
            <li>Converted UI figma designs into real responsive React + Unocss components.</li>
            <li>Used Git for version control system for managing various branches for deployment & integrated with vercel deployments.</li>
            <li>Used React and Nextjs to build a fully functional H.R platform, integrated API into the frontend to show user data and maintained four various deployments.</li>
          </ul>
        </div>

        {/* Education */}
        <h2 className="flex items-center gap-2 text-[17px] font-bold mb-4 text-slate-800">
          <span className="flex p-1 bg-slate-100 text-slate-600 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>
          </span>
          Education :
        </h2>
        <div className="grid grid-cols-2 gap-4 mb-7">
          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[13px] text-slate-700">Sarada College</span>
              <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[11px] font-medium">2019 – 2022</span>
            </div>
            <span className="text-slate-500 text-[12px] font-normal">BHMCT ( discontinued )</span>
          </div>
          <div className="flex flex-col">
            <div className="flex justify-between items-center mb-1">
              <span className="text-[13px] text-slate-700">Chaitanya College</span>
              <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[11px] font-medium">2017 – 2019</span>
            </div>
            <span className="text-slate-500 text-[12px] font-normal">Intermediate education</span>
          </div>
        </div>

        {/* Skills */}
        <h2 className="flex items-center gap-2 text-[17px] font-bold mb-4 text-slate-800">
          <span className="flex p-1 bg-slate-100 text-slate-600 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-3.46-3.52 2.5 2.5 0 0 1-1.12-3.72 2.5 2.5 0 0 1 3-3.64 2.5 2.5 0 0 1 3.52-2.48A2.5 2.5 0 0 1 9.5 2Z" /><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 3.46-3.52 2.5 2.5 0 0 0 1.12-3.72 2.5 2.5 0 0 0-3-3.64 2.5 2.5 0 0 0-3.52-2.48A2.5 2.5 0 0 0 14.5 2Z" /></svg>
          </span>
          Skills :
        </h2>
        <div className="flex flex-row flex-wrap gap-2 mb-7">
          {[
            { name: 'Html', color: '#e34c26' },
            { name: 'Css', color: '#264de4' },
            { name: 'JavaScript', color: '#f0db4f' },
            { name: 'TypeScript', color: '#007acc' },
            { name: 'Svelte', color: '#ff3e00' },
            { name: 'SolidJS', color: '#2c4f7c' },
            { name: 'React', color: '#61dafb' },
            { name: 'Lua', color: '#000080' },
            { name: 'Tailwind', color: '#38b2ac' },
            { name: 'UnoCSS', color: '#333333' }
          ].map(skill => (
            <span key={skill.name} className="bg-slate-50 border border-slate-100 text-slate-600 px-2.5 py-1 rounded text-[11px] flex items-center gap-1.5 font-medium shadow-sm">
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: skill.color }}></span>
              {skill.name}
            </span>
          ))}
        </div>

        {/* Projects */}
        <h2 className="flex items-center gap-2 text-[17px] font-bold mb-4 text-slate-800">
          <span className="flex p-1 bg-slate-100 text-slate-600 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="m4.93 4.93 4.24 4.24" /><path d="m14.83 9.17 4.24-4.24" /><path d="m14.83 14.83 4.24 4.24" /><path d="m9.17 14.83-4.24 4.24" /><circle cx="12" cy="12" r="4" /></svg>
          </span>
          Projects :
        </h2>
        <div className="space-y-4">
          {[
            { name: 'Quick CV', desc: 'Fast resume / cv builder for making beautiful resumes & supports exporting to high quality pdfs using native print(). This resume is generated by quickcv web app' },
            { name: 'NvChad', desc: 'Blazing fast Neovim config framework providing solid defaults, beautiful UI and a set of exclusive plugins built for it. Enabling users to create their own IDE experiences within Neovim! Most' },
            { name: 'Volt', desc: 'UI framework for drawing reactive & interactive interfaces within Neovim text editor.' },
            { name: 'Typr', desc: 'Most beautiful terminal typing practice plugin with fancy stats dashboard within Neovim made using Volt.' },
            { name: 'Minty', desc: 'Color manipulation popup ui within terminal for Neovim, like never before!' }
          ].map((project, idx) => (
            <div key={idx} className="flex flex-col">
              <div className="flex justify-between items-end w-full">
                <span className="bg-slate-800 text-white px-3 py-1 rounded-t border-t border-x border-slate-800 text-[11px] font-bold tracking-wide">
                  {project.name}
                </span>
                <span className="text-slate-500 text-[11px] underline mb-1">Link</span>
              </div>
              <div className="border border-slate-800 p-2.5 rounded-b rounded-tr w-full text-[12px] text-slate-600 font-normal">
                {project.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      {/* Top Navigation Bar */}
      <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 sticky top-0 z-50">
        <div className="font-bold text-lg text-blue-600">QuickCV Mockup</div>
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2">
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
            onClick={() => setViewMode(viewMode === 'split' ? 'tabs' : 'split')}
          >
            Toggle Mode (Currently {viewMode})
          </Button>
          <Button size="sm" onClick={() => setDownloadModalOpen(true)}>
            <Download size={16} className="mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      <div className="flex-1">
        {viewMode === 'split' ? (
          /* Split Mode Layout */
          <div className="grid grid-cols-1 lg:grid-cols-2 h-[calc(100vh-56px)]">
            <div className="sticky top-0 overflow-y-auto h-full p-5 custom-scrollbar bg-slate-100">
              <EditorStack />
            </div>

            <div className="h-full overflow-auto pt-5 flex justify-center items-start custom-scrollbar bg-slate-200">
              <ResumeViewer />
            </div>
          </div>
        ) : (
          /* Tabs Mode Layout */
          <div className="grid gap-3 justify-center py-10 px-4">
            <div className="flex justify-center mb-6">
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

            <div className="max-w-[1000px] mx-auto w-full">
              {activeTab === 'editor' && (
                <div className="w-full">
                  <EditorStack />
                </div>
              )}

              {activeTab === 'viewer' && (
                <div className="flex justify-center">
                  <ResumeViewer />
                </div>
              )}
            </div>
          </div>
        )}
      </div>

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
      <ConfirmModal
        isOpen={downloadModalOpen}
        onClose={() => setDownloadModalOpen(false)}
        onConfirm={() => setDownloadModalOpen(false)}
        title="Tải PDF"
        description="Tính năng tải xuống PDF đang được giả lập. PDF của bạn sẽ được tạo và tải xuống trong môi trường thực tế."
        confirmText="Đóng"
        hideCancel
        type="info"
      />
    </div>
  );
}
