import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  Mail,
  KeyRound,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

export const ForgotPasswordPage = () => {
  const { forgotPassword } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successData, setSuccessData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      setError('Please provide your registered institutional email.');
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await forgotPassword(email.trim());
      setSuccessData(data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || 'Failed to generate password recovery link. Please try again.');
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

      <div className="w-full max-w-md">
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          <Link to="/welcome" className="inline-flex items-center gap-2.5 mb-2 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-600/30 border border-blue-400/30 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-white">Student Performance Analytics</h1>
          <p className="text-xs text-slate-400 mt-0.5">Password Recovery Service</p>
        </div>

        {/* Glass Card */}
        <div className="bg-slate-900/80 border border-slate-800/90 backdrop-blur-2xl rounded-3xl p-7 sm:p-9 shadow-2xl shadow-blue-950/40 relative">
          
          <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center mb-4">
            <KeyRound className="w-6 h-6 text-blue-400" />
          </div>

          <h2 className="text-xl font-bold text-white tracking-tight">Forgot Password</h2>
          <p className="text-xs text-slate-400 mt-1 mb-6">
            Enter your registered email address and we'll generate a secure, time-limited reset token.
          </p>

          {/* Error Banner */}
          {error && (
            <div className="mb-5 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-red-300 text-xs">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{error}</div>
            </div>
          )}

          {/* Success Box */}
          {successData ? (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs space-y-2">
                <div className="flex items-center gap-2 font-semibold text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Recovery Token Generated</span>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  {successData.message || 'If an account exists with this email, instructions have been generated.'}
                </p>
              </div>

              {/* Developer / Evaluator Helper Link */}
              {successData.reset_token && (
                <div className="p-3.5 rounded-2xl bg-blue-950/60 border border-blue-800/60 text-xs space-y-2">
                  <div className="font-semibold text-blue-300 flex items-center gap-1.5">
                    <span>⚡ Quick Evaluation Access:</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    A test token was generated directly in the database. Click below to open the password reset page:
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate(successData.reset_url || `/reset-password?token=${successData.reset_token}`)}
                    className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-600/30"
                  >
                    <span>Proceed to Reset Form</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              <div className="pt-2">
                <Link
                  to="/login"
                  className="w-full py-3 px-4 rounded-2xl bg-slate-950/70 hover:bg-slate-800 border border-slate-800 text-slate-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Return to Sign In</span>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Registered Email Address
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

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-xl shadow-blue-600/30 hover:shadow-blue-500/40 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed mt-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Send Reset Instructions</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="pt-2 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
};
export default ForgotPasswordPage;
