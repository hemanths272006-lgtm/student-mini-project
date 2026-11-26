import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  BookOpen,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const LoginPage = () => {
  const { login, loginWithDemo, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDemoDrawer, setShowDemoDrawer] = useState(true);

  const redirectByRole = (role) => {
    const from = location.state?.from?.pathname;
    if (from && from !== '/login' && from !== '/welcome' && from !== '/register') {
      navigate(from, { replace: true });
      return;
    }
    if (role === 'admin') navigate('/admin', { replace: true });
    else if (role === 'lecturer') navigate('/lecturer', { replace: true });
    else navigate('/student', { replace: true });
  };

  const handleRealLogin = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setError('Please provide both your registered email and password.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const user = await login(email.trim(), password, rememberMe);
      redirectByRole(user.role);
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail;
      setError(detail || 'Authentication failed. Please verify your credentials or register a new account.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (role) => {
    setIsLoading(true);
    setError(null);
    try {
      const user = await loginWithDemo(role);
      redirectByRole(user.role);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Demo login failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Connect to Google OAuth endpoint with demo simulation
      const user = await loginWithGoogle({
        email: email || 'student.google@studentmetrics.edu',
        name: 'Google Student Account',
        picture: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        role: 'student'
      });
      redirectByRole(user.role);
    } catch (err) {
      setError('Google Sign-In is unavailable. Please sign in with email and password or use the 1-Click access below.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
      {/* Background radial glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[650px] h-[350px] bg-gradient-to-b from-blue-600/20 via-indigo-600/10 to-transparent blur-3xl pointer-events-none -z-10" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-blue-700/15 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-cyan-600/15 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Main Container */}
      <div className="w-full max-w-md">
        
        {/* Brand Header */}
        <div className="text-center mb-8">
          <Link to="/welcome" className="inline-flex items-center gap-2.5 mb-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-600/30 border border-blue-400/30 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-white">Student Performance Analytics</h1>
          <p className="text-xs text-slate-400 mt-1">Autonomous College Academic Management</p>
        </div>

        {/* Glassmorphic Login Card */}
        <div className="bg-slate-900/80 border border-slate-800/90 backdrop-blur-2xl rounded-3xl p-7 sm:p-9 shadow-2xl shadow-blue-950/40 relative">
          
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white tracking-tight">Welcome Back</h2>
            <p className="text-xs text-slate-400 mt-1">Enter your credentials to access your dashboard</p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-red-300 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium leading-relaxed">{error}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleRealLogin} className="space-y-4">
            
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. aarav.sharma@studentmetrics.edu"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 rounded-2xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-11 py-3 bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 rounded-2xl text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200 focus:outline-none transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded bg-slate-950 border-slate-700 text-blue-600 focus:ring-blue-500/30 focus:ring-offset-0 cursor-pointer"
                />
                <span className="text-xs text-slate-400">Remember me for 30 days</span>
              </label>
            </div>

            {/* Primary Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-xl shadow-blue-600/30 hover:shadow-blue-500/40 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Social Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase">
              <span className="bg-slate-900 px-3 text-slate-500 font-semibold tracking-wider">
                Or Continue With
              </span>
            </div>
          </div>

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-2xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white font-medium text-xs flex items-center justify-center gap-3 transition-all"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.36 7.34 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.98 0 12c0 2.02.46 3.84 1.26 5.42l4.02-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.25 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* 1-Click Fast Role Switcher Drawer (Preserved for Evaluator Access) */}
          <div className="mt-6 pt-5 border-t border-slate-800/80">
            <button
              type="button"
              onClick={() => setShowDemoDrawer(!showDemoDrawer)}
              className="w-full flex items-center justify-between text-[11px] font-semibold text-slate-400 hover:text-slate-300 transition-colors uppercase tracking-wider"
            >
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                <span>1-Click Evaluator Access</span>
              </div>
              {showDemoDrawer ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>

            {showDemoDrawer && (
              <div className="mt-3 grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoLogin('admin')}
                  className="p-2.5 rounded-xl bg-slate-950/90 hover:bg-blue-950/40 border border-slate-800 hover:border-blue-500/50 text-left transition-all"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400 mb-1" />
                  <div className="text-[11px] font-semibold text-slate-200">Admin</div>
                  <div className="text-[9px] text-slate-500 truncate">Dr. Sharma</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoLogin('lecturer')}
                  className="p-2.5 rounded-xl bg-slate-950/90 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-500/50 text-left transition-all"
                >
                  <BookOpen className="w-3.5 h-3.5 text-emerald-400 mb-1" />
                  <div className="text-[11px] font-semibold text-slate-200">Lecturer</div>
                  <div className="text-[9px] text-slate-500 truncate">Dr. Hegde</div>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoLogin('student')}
                  className="p-2.5 rounded-xl bg-slate-950/90 hover:bg-purple-950/40 border border-slate-800 hover:border-purple-500/50 text-left transition-all"
                >
                  <GraduationCap className="w-3.5 h-3.5 text-purple-400 mb-1" />
                  <div className="text-[11px] font-semibold text-slate-200">Student</div>
                  <div className="text-[9px] text-slate-500 truncate">Aarav S.</div>
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Bottom Registration & Welcome Links */}
        <div className="text-center mt-6 space-y-2">
          <p className="text-xs text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-blue-400 hover:text-blue-300 transition-colors">
              Create an Account
            </Link>
          </p>
          <p className="text-xs text-slate-500">
            <Link to="/welcome" className="hover:text-slate-400 transition-colors">
              ← Return to Welcome Page
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
};
export default LoginPage;
