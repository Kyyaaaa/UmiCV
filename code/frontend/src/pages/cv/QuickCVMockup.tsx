import React, { useState } from 'react';
import { Settings, Eye, Edit2 } from 'lucide-react';
import { Button } from '../../components/ui/Button';

/**
 * A mockup UI matching the exact layout of the reference `quickcv` project.
 */
export function QuickCVMockup() {
  const [viewMode, setViewMode] = useState<'split' | 'tabs'>('split');
  const [activeTab, setActiveTab] = useState<'editor' | 'viewer'>('editor');
  const [scale, setScale] = useState(100);

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
      className="bg-white shadow-xl origin-top transition-transform text-slate-800"
      style={{ 
        width: '794px', 
        height: '1123px', // A4 ratio
        transform: `scale(${scale / 100})`
      }}
    >
      <div className="p-10 h-full flex flex-col font-sans">
        {/* Name */}
        <div className="flex justify-center mx-auto items-center gap-2 mt-4">
          <h1 className="text-4xl font-normal">Sidhanth</h1>
          <h1 className="text-blue-500 text-4xl font-normal">Rathod</h1>
        </div>
        <div className="text-center text-xl mb-3 font-light text-slate-600">Frontend Developer</div>

        {/* Contact Info */}
        <div className="flex flex-row border-y border-slate-300 py-3 text-sm justify-center gap-6">
          <span className="flex items-center gap-2">📞 +91 9701611257</span>
          <span className="flex items-center gap-2">✉ siduck@tutanota.com</span>
          <a className="flex items-center gap-2 text-blue-600" href="https://github.com/siduck" target="_blank" rel="noreferrer">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg> 
            @siduck
          </a>
        </div>

        {/* About */}
        <h2 className="flex items-center gap-2 text-xl font-semibold mt-6 mb-2">
          <span className="flex p-1.5 bg-slate-100 text-slate-700 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/></svg>
          </span>
          About :
        </h2>
        <p className="text-sm text-slate-700 leading-relaxed mb-6">
          Self-taught Front-End Web Developer passionate about creating beautiful and performant websites, aiming to create the best user experience possible! Everything I make is beautiful. I use Arch btw.
        </p>

        {/* Experience */}
        <h2 className="flex items-center gap-2 text-xl font-semibold mt-2 mb-4">
          <span className="flex p-1.5 bg-slate-100 text-slate-700 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
          </span>
          Experience :
        </h2>
        
        <div className="flex flex-row flex-wrap gap-y-1 mb-4 items-baseline">
          <span><strong>React Developer</strong> - Jamesmccallumconsulting (Freelance)</span>
          <span className="ml-auto bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs">2022 Oct - 2023 Jan</span>
          <ul className="list-disc w-full text-slate-600 ml-6 text-sm mt-1 space-y-1">
            <li>Converted UI figma designs into responsive React + Tailwindcss components.</li>
            <li>Created responsive landing pages and a github profile dashboard using github search api.</li>
          </ul>
        </div>
        
        <div className="flex flex-row flex-wrap gap-y-1 mb-6 items-baseline">
          <span><strong>Frontend Developer</strong> - Ideanomic</span>
          <span className="ml-auto bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs">2023 April - 2025 May</span>
          <ul className="list-disc w-full text-slate-600 ml-6 text-sm mt-1 space-y-1">
            <li>Responsible for creating and maintaining company's website.</li>
            <li>Converted UI figma designs into real responsive React + Unocss components.</li>
            <li>Used Git for version control system for managing various branches for deployment & integrated with vercel deployments.</li>
            <li>Used React and Nextjs to build a fully functional H.R platform, integrated API into the frontend to show user data and maintained four various deployments.</li>
          </ul>
        </div>

        {/* Education */}
        <h2 className="flex items-center gap-2 text-xl font-semibold mt-2 mb-4">
          <span className="flex p-1.5 bg-slate-100 text-slate-700 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
          </span>
          Education :
        </h2>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="flex flex-row flex-wrap gap-y-1">
            <span className="font-medium">Sarada College</span>
            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs ml-auto">2019 – 2022</span>
            <span className="text-slate-500 w-full text-sm">BHMCT ( discontinued )</span>
          </div>
          <div className="flex flex-row flex-wrap gap-y-1">
            <span className="font-medium">Chaitanya College</span>
            <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-xs ml-auto">2017 – 2019</span>
            <span className="text-slate-500 w-full text-sm">Intermediate education</span>
          </div>
        </div>

        {/* Skills */}
        <h2 className="flex items-center gap-2 text-xl font-semibold mt-2 mb-4">
          <span className="flex p-1.5 bg-slate-100 text-slate-700 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-3.46-3.52 2.5 2.5 0 0 1-1.12-3.72 2.5 2.5 0 0 1 3-3.64 2.5 2.5 0 0 1 3.52-2.48A2.5 2.5 0 0 1 9.5 2Z"/><path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 3.46-3.52 2.5 2.5 0 0 0 1.12-3.72 2.5 2.5 0 0 0-3-3.64 2.5 2.5 0 0 0-3.52-2.48A2.5 2.5 0 0 0 14.5 2Z"/></svg>
          </span>
          Skills :
        </h2>
        <div className="flex flex-row flex-wrap gap-2 mb-6">
          {['Html', 'Css', 'JavaScript', 'TypeScript', 'Svelte', 'SolidJS', 'React', 'Lua', 'Tailwind', 'UnoCSS'].map(skill => (
            <span key={skill} className="bg-slate-100 text-slate-800 px-3 py-1 rounded text-sm flex items-center gap-2">
              {skill}
            </span>
          ))}
        </div>

        {/* Projects */}
        <h2 className="flex items-center gap-2 text-xl font-semibold mt-2 mb-4">
          <span className="flex p-1.5 bg-slate-100 text-slate-700 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 4.24 4.24"/><path d="m14.83 9.17 4.24-4.24"/><path d="m14.83 14.83 4.24 4.24"/><path d="m9.17 14.83-4.24 4.24"/><circle cx="12" cy="12" r="4"/></svg>
          </span>
          Projects :
        </h2>
        <div className="space-y-4">
          {[
            { name: 'Quick CV', link: 'https://github.com/siduck/quickcv', desc: 'Fast resume / cv builder for making beautiful resumes & supports exporting to high quality pdfs using native print(). This resume is generated by quickcv web app' },
            { name: 'NvChad', link: 'https://github.com/nvchad/nvchad', desc: 'Blazing fast Neovim config framework providing solid defaults, beautiful UI and a set of exclusive plugins built for it. Enabling users to create their own IDE experiences within Neovim! Most' },
            { name: 'Volt', link: 'https://github.com/nvzone/volt', desc: 'UI framework for drawing reactive & interactive interfaces within Neovim text editor.' },
            { name: 'Typr', link: 'https://github.com/nvzone/typr', desc: 'Most beautiful terminal typing practice plugin with fancy stats dashboard within Neovim made using Volt.' },
            { name: 'Minty', link: 'https://github.com/nvzone/minty', desc: 'Color manipulation popup ui within terminal for Neovim, like never before!' }
          ].map((project, idx) => (
            <div key={idx} className="flex flex-wrap">
              <span className="bg-slate-800 text-white px-3 py-1 rounded-t-lg rounded-b-none text-sm font-medium">
                {project.name}
              </span>
              <a href={project.link} target="_blank" rel="noreferrer" className="ml-auto text-blue-600 text-sm mt-1">Link</a>
              <p className="border-2 border-slate-800 p-3 rounded-lg rounded-tl-none w-full text-sm">
                {project.desc}
              </p>
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
          <Button size="sm" onClick={() => alert("Simulating PDF Download...")}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
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
                  className={`flex items-center gap-2 px-6 py-2 rounded-md font-medium transition-colors ${
                    activeTab === 'editor' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Edit2 size={16} /> Editor
                </button>
                <button
                  onClick={() => setActiveTab('viewer')}
                  className={`flex items-center gap-2 px-6 py-2 rounded-md font-medium transition-colors ${
                    activeTab === 'viewer' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-600 hover:text-slate-900'
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

      <style dangerouslySetInnerHTML={{__html: `
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
    </div>
  );
}
