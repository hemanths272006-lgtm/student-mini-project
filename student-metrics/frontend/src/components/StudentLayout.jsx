import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  ClipboardList,
  UploadCloud,
  BookOpenCheck,
  FileArchive,
  CalendarDays,
  HelpCircle,
  Award,
  LogOut,
  GraduationCap,
  School
} from 'lucide-react';

export const StudentLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navLinks = [
    { to: '/student', label: 'My Dashboard', icon: LayoutDashboard, end: true },
    { to: '/student/tests', label: 'Online MCQ Tests', icon: ClipboardList },
    { to: '/student/proofs', label: 'Upload Study Proof', icon: UploadCloud },
    { to: '/student/materials', label: 'Recommended Materials', icon: BookOpenCheck },
    { to: '/student/question-papers', label: 'Previous Year Papers', icon: FileArchive },
    { to: '/student/timetable', label: 'Weekly Timetable', icon: CalendarDays },
    { to: '/student/doubts', label: 'Ask Faculty Doubts', icon: HelpCircle },
    { to: '/student/report-card', label: 'Official Report Card', icon: Award },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Navy Sidebar with Indigo accents */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between shrink-0 shadow-xl z-20">
        <div>
          {/* Brand header */}
          <div className="p-5 border-b border-slate-800 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <School className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm tracking-wide text-white">Student Portal</h2>
              <span className="text-[10px] font-semibold tracking-wider uppercase text-indigo-400 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-800/60">
                Academic Desk
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <img
              src={user?.picture || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100'}
              alt={user?.name}
              className="w-10 h-10 rounded-full border border-indigo-500/50 object-cover"
            />
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">{user?.name || 'Student'}</p>
              <div className="flex items-center gap-1 text-[11px] text-indigo-400">
                <GraduationCap className="w-3 h-3" />
                <span>Enrolled Student</span>
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-950/30 border border-red-900/40 rounded-lg transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm shrink-0">
          <div>
            <h1 className="text-base font-semibold text-slate-800">Student Learning & Assessment Portal</h1>
            <p className="text-xs text-slate-500">Autonomous Institute of Engineering & Technology</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-200 rounded-full text-xs font-medium text-indigo-700">
              <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
              Student Desk Online
            </div>
          </div>
        </header>

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

