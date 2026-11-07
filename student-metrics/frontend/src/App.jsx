import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Analytics from './pages/Analytics';
import StudentReport from './pages/StudentReport';
import Settings from './pages/Settings';

function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  // Determine current page title
  const getPageTitle = (pathname) => {
    if (pathname === '/') return 'Dashboard';
    if (pathname.startsWith('/students')) return 'Student Management';
    if (pathname.startsWith('/analytics')) return 'Performance Analytics';
    if (pathname.startsWith('/reports')) return 'Student Performance Report';
    if (pathname.startsWith('/settings')) return 'System Settings';
    return 'Student Learning Performance Analysis';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-['Inter',sans-serif]">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex-1 flex flex-col min-w-0">
        {/* Top Navbar */}
        <Navbar
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          pageTitle={getPageTitle(location.pathname)}
        />

        {/* Main Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/students" element={<Students />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/reports" element={<StudentReport />} />
            <Route path="/reports/:id" element={<StudentReport />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </main>

        {/* Global Footer (hidden in print) */}
        <footer className="no-print border-t border-slate-200/80 bg-white py-4 px-6 text-center text-xs text-slate-400">
          Student Learning Performance Analysis System • Department of Computer Science & Engineering
        </footer>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

