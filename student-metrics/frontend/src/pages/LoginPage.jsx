import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  GraduationCap,
  BookOpen,
  UserCheck,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock,
  School,
  AlertCircle
} from 'lucide-react';

export const LoginPage = () => {
  const { loginWithDemo, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedDemoRole, setSelectedDemoRole] = useState('student');

  const handleDemoLogin = async (role) => {
    setIsLoading(true);
    setError(null);
    try {
      const user = await loginWithDemo(role);
      // Route based on authenticated role
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'lecturer') navigate('/lecturer');
      else navigate('/student');
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to authenticate demo user.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleMock = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // For developer demo, authenticate as selected role with Google profile simulation
      const user = await loginWithDemo(selectedDemoRole);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'lecturer') navigate('/lecturer');
      else navigate('/student');
    } catch (err) {
      setError('Google Sign-In failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-navy-950 to-blue-950 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
      {/* Background glowing decorations */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* Main card */}
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100 z-10 grid grid-cols-1 lg:grid-cols-12">
        {/* Left hero side */}
        <div className="lg:col-span-5 bg-gradient-to-br from-blue-700 via-blue-800 to-indigo-900 p-8 text-white flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                <School className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="font-bold text-lg leading-tight">Student Learning</h1>
                <p className="text-xs text-blue-200">Performance Analysis System</p>
              </div>
            </div>

            <div className="space-y-4 my-8">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">3 Dedicated Portals</h4>
                  <p className="text-xs text-blue-200">Specialized dashboards for Admin, Lecturers, and Students.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-blue-300" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">180 Student Benchmark</h4>
                  <p className="text-xs text-blue-200">Complete Section A, B, C tracking with Fast/Avg/Slow classification.</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 border border-purple-400/30 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-purple-300" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm">Interactive Academic Tools</h4>
                  <p className="text-xs text-blue-200">Online MCQ tests, study proof uploads, and academic doubt forum.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-white/10 text-xs text-blue-200">
            Autonomous Institute of Engineering & Technology &bull; 2025-2026
          </div>
        </div>

        {/* Right login side */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-between bg-white">
          <div>
            <div className="mb-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 mb-3">
                <Lock className="w-3.5 h-3.5" /> Secure Authentication
              </span>
              <h2 className="text-2xl font-bold text-slate-900">Welcome Back</h2>
              <p className="text-sm text-slate-500 mt-1">
                Sign in using your institutional Google account or select a portal demo role below.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Google Login Simulation */}
            <div className="mb-8">
              <button
                type="button"
                onClick={handleGoogleMock}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-slate-300 rounded-xl hover:bg-slate-50 hover:border-slate-400 transition-all font-medium text-slate-700 shadow-sm disabled:opacity-50"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Sign in with Google</span>
              </button>
              <p className="text-[11px] text-slate-400 text-center mt-2">
                Connected to institutional domain @studentmetrics.edu
              </p>
            </div>

            {/* Divider */}
            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <span className="relative bg-white px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                Or 1-Click Role Access
              </span>
            </div>

            {/* Role Switcher Cards */}
            <div className="space-y-3">
              {/* Admin Card */}
              <button
                type="button"
                onClick={() => handleDemoLogin('admin')}
                disabled={isLoading}
                className="w-full text-left p-3.5 rounded-xl border-2 border-slate-200 hover:border-blue-600 hover:bg-blue-50/40 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 text-sm">Admin Portal</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">
                        Admin
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">Dr. S. K. Sharma (Dean of Academics)</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </button>

              {/* Lecturer Card */}
              <button
                type="button"
                onClick={() => handleDemoLogin('lecturer')}
                disabled={isLoading}
                className="w-full text-left p-3.5 rounded-xl border-2 border-slate-200 hover:border-emerald-600 hover:bg-emerald-50/40 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 text-sm">Lecturer Portal</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">
                        Faculty
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">Prof. Alan Turing (Computer Science & Engg)</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
              </button>

              {/* Student Card */}
              <button
                type="button"
                onClick={() => handleDemoLogin('student')}
                disabled={isLoading}
                className="w-full text-left p-3.5 rounded-xl border-2 border-slate-200 hover:border-indigo-600 hover:bg-indigo-50/40 transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 text-sm">Student Portal</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-700">
                        Student
                      </span>
                    </div>
                    <p className="text-xs text-slate-500">Aarav Sharma (USN: 1MS21CS001 &bull; Section A)</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
              </button>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
            <span>Role-Based Access Control Enabled</span>
            <span className="flex items-center gap-1 text-emerald-600 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Backend Ready
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

