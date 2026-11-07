import React from 'react';
import { Menu, Bell, Download, ShieldCheck } from 'lucide-react';
import { StudentService } from '../services/api';

export default function Navbar({ onMenuToggle, pageTitle = "Dashboard" }) {
  const handleExport = () => {
    window.open(StudentService.getExportCSVUrl(), '_blank');
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 sticky top-0 z-30 px-4 sm:px-6 flex items-center justify-between shadow-xs">
      {/* Left: Mobile hamburger & Page Title */}
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          aria-label="Open Sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-lg font-bold text-slate-800 tracking-tight leading-tight">
            {pageTitle}
          </h2>
          <p className="text-xs text-slate-400 hidden sm:block">
            Student Learning Performance Analysis System
          </p>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Quick CSV Export button */}
        <button
          onClick={handleExport}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors shadow-xs"
          title="Export complete student records to CSV"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export CSV</span>
        </button>

        {/* Server Connection Badge */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>FastAPI Connected</span>
        </div>

        {/* Notification Bell */}
        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 relative">
          <Bell className="w-4 h-4" />
          <span className="w-2 h-2 rounded-full bg-blue-600 absolute top-1 right-1"></span>
        </div>
      </div>
    </header>
  );
}

