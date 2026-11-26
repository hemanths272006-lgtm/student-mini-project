import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  ShieldCheck,
  BookOpen,
  Users,
  TrendingUp,
  Award,
  ArrowRight,
  Sparkles,
  ChevronRight,
  School,
  Lock,
  Layers,
  CheckCircle2,
  BarChart3,
  FileCheck2
} from 'lucide-react';

export const WelcomePage = () => {
  const navigate = useNavigate();
  const { loginWithDemo, isAuthenticated, user } = useAuth();

  const handleQuickRoleAccess = async (role) => {
    try {
      const loggedUser = await loginWithDemo(role);
      if (loggedUser.role === 'admin') navigate('/admin');
      else if (loggedUser.role === 'lecturer') navigate('/lecturer');
      else navigate('/student');
    } catch (err) {
      console.error(err);
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-600 selection:text-white relative overflow-hidden flex flex-col justify-between">
      {/* Background Glows & Grid Pattern */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-b from-blue-600/20 via-indigo-600/10 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-blue-700/15 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Top Navigation Bar */}
      <header className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/welcome')}>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-600/30 border border-blue-400/30">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight text-white">Student Performance Analytics</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full hidden sm:inline-block">v2.0 Pro</span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Autonomous Institute of Engineering & Technology</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated && user ? (
              <button
                onClick={() => {
                  if (user.role === 'admin') navigate('/admin');
                  else if (user.role === 'lecturer') navigate('/lecturer');
                  else navigate('/student');
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-all shadow-md shadow-blue-600/30"
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 rounded-xl transition-all border border-slate-800"
                >
                  Sign In
                </button>
                <button
                  onClick={() => navigate('/register')}
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-md shadow-blue-600/30 hover:shadow-blue-500/40"
                >
                  Create Account
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 flex-1 flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Branding, Tagline & Call-to-actions */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/70 border border-blue-800/60 text-blue-300 text-xs font-medium backdrop-blur-md shadow-inner">
              <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-pulse" />
              <span>Institutional Academic Analytics & Evaluation Engine</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15]">
              Track Your Learning.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400">
                Improve Your Future.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
              A comprehensive student intelligence platform engineered for real-time continuous evaluation, automated learner classification, online assessments, and dedicated multi-role dashboards.
            </p>

            {/* Main Action Buttons */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
              <button
                onClick={() => navigate('/login')}
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-base shadow-xl shadow-blue-600/35 hover:shadow-blue-500/50 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0"
              >
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => navigate('/register')}
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/90 text-slate-200 hover:text-white font-medium text-base border border-slate-800 hover:border-slate-700 transition-all duration-200"
              >
                <span>Register as Student</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* Key feature pills */}
            <div className="pt-6 grid grid-cols-2 sm:grid-cols-3 gap-3 border-t border-slate-800/80 text-left">
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Real SQLite / PostgreSQL Auth</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                <span>180 Benchmark Students</span>
              </div>
              <div className="flex items-center gap-2.5 text-xs text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Fast / Avg / Slow ML Analysis</span>
              </div>
            </div>
          </div>

          {/* Right Column: 3D-Style Glass Academic Graphic */}
          <div className="lg:col-span-5 relative">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              
              {/* Outer decorative card with glassmorphism */}
              <div className="rounded-3xl p-6 sm:p-8 bg-slate-900/70 border border-slate-800/90 backdrop-blur-2xl shadow-2xl shadow-blue-950/60 relative overflow-hidden group">
                
                {/* Internal accent bar */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-white">Academic Intelligence</h3>
                      <p className="text-[11px] text-slate-400">Live Continuous Evaluation</p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Live System
                  </span>
                </div>

                {/* 3 Interactive Metric Highlights */}
                <div className="space-y-3.5 mb-6">
                  {/* Metric 1 */}
                  <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/70 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
                        <Users className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">180 Seeded Students</div>
                        <div className="text-[10px] text-slate-400">Sections A, B & C Classified</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">100% Synced</span>
                  </div>

                  {/* Metric 2 */}
                  <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/70 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                        <TrendingUp className="w-4 h-4 text-blue-400" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">Learner Segmentation</div>
                        <div className="text-[10px] text-slate-400">Fast, Average & Slow Tracks</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md">Automated</span>
                  </div>

                  {/* Metric 3 */}
                  <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800/70 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
                        <FileCheck2 className="w-4 h-4 text-purple-400" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">MCQ & Study Proofs</div>
                        <div className="text-[10px] text-slate-400">Continuous Formative Evaluation</div>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-md">Verified</span>
                  </div>
                </div>

                {/* Quick 1-Click Role Direct Preview */}
                <div className="pt-4 border-t border-slate-800">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5">
                    1-Click Direct Role Preview
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => handleQuickRoleAccess('admin')}
                      className="p-2.5 rounded-xl bg-slate-950/80 hover:bg-blue-900/30 border border-slate-800 hover:border-blue-600/50 text-center transition-all group/btn"
                    >
                      <ShieldCheck className="w-4 h-4 text-blue-400 mx-auto mb-1 group-hover/btn:scale-110 transition-transform" />
                      <div className="text-[11px] font-semibold text-slate-200">Admin</div>
                      <div className="text-[9px] text-slate-500">Institution</div>
                    </button>

                    <button
                      onClick={() => handleQuickRoleAccess('lecturer')}
                      className="p-2.5 rounded-xl bg-slate-950/80 hover:bg-emerald-900/30 border border-slate-800 hover:border-emerald-600/50 text-center transition-all group/btn"
                    >
                      <BookOpen className="w-4 h-4 text-emerald-400 mx-auto mb-1 group-hover/btn:scale-110 transition-transform" />
                      <div className="text-[11px] font-semibold text-slate-200">Lecturer</div>
                      <div className="text-[9px] text-slate-500">Faculty</div>
                    </button>

                    <button
                      onClick={() => handleQuickRoleAccess('student')}
                      className="p-2.5 rounded-xl bg-slate-950/80 hover:bg-purple-900/30 border border-slate-800 hover:border-purple-600/50 text-center transition-all group/btn"
                    >
                      <GraduationCap className="w-4 h-4 text-purple-400 mx-auto mb-1 group-hover/btn:scale-110 transition-transform" />
                      <div className="text-[11px] font-semibold text-slate-200">Student</div>
                      <div className="text-[9px] text-slate-500">Learner</div>
                    </button>
                  </div>
                </div>

              </div>

              {/* Floating aesthetic badge */}
              <div className="absolute -bottom-4 -right-4 p-3 rounded-2xl bg-slate-900/90 border border-slate-700/80 backdrop-blur-xl shadow-xl flex items-center gap-2.5 hidden sm:flex">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold text-white">NIST PBKDF2 Hashing Active</span>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500 bg-slate-950/80">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Student Performance Analytics System • Autonomous Institute of Engineering & Technology</span>
          <span>FastAPI + SQLite/PostgreSQL Engine • React Vite</span>
        </div>
      </footer>
    </div>
  );
};
export default WelcomePage;
