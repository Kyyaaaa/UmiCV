import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  CheckSquare, 
  Users, 
  Bell, 
  User, 
  LogOut,
  Menu
} from 'lucide-react';
import { currentUser } from '../mocks/users.mock';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/cv', icon: FileText, label: 'Quản lý CV' },
  { to: '/workflow', icon: CheckSquare, label: 'Phê duyệt' },
  { to: '/users', icon: Users, label: 'Nhân sự' },
];

export function PrivateLayout() {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 w-64 transform border-r border-slate-200 bg-white transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center px-6 border-b border-slate-200">
          <h1 className="text-2xl font-bold tracking-tight text-blue-600">UmiCV</h1>
        </div>
        <nav className="flex flex-col gap-1 p-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              <item.icon size={20} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6">
          <button 
            className="rounded-md p-2 text-slate-500 hover:bg-slate-100 md:hidden"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            <Menu size={24} />
          </button>
          
          <div className="ml-auto flex items-center gap-4">
            <button 
              className="relative rounded-full p-2 text-slate-500 hover:bg-slate-100 transition-colors"
              onClick={() => navigate('/notifications')}
            >
              <Bell size={20} />
              <span className="absolute right-1.5 top-1.5 flex h-2 w-2 rounded-full bg-red-500"></span>
            </button>
            
            <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
              <div className="hidden text-right md:block">
                <p className="text-sm font-medium text-slate-900">{currentUser.fullName}</p>
                <p className="text-xs text-slate-500">{currentUser.role}</p>
              </div>
              <button 
                className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100"
                onClick={() => navigate('/profile')}
              >
                <User size={18} className="text-slate-600" />
              </button>
              <button 
                className="rounded-md p-2 text-slate-500 hover:bg-slate-100 transition-colors"
                onClick={() => navigate('/login')}
                title="Đăng xuất"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="mx-auto max-w-6xl w-full">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-30 bg-slate-900/50 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
