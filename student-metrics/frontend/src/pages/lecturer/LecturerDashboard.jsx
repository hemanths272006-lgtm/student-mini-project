import React, { useState, useEffect } from 'react';
import { LecturerService } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Award,
  TrendingUp,
  AlertTriangle,
  FileCheck2,
  HelpCircle,
  ClipboardCheck,
  BookOpen,
  ArrowRight,
  School
} from 'lucide-react';

export const LecturerDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await LecturerService.getDashboard();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const lecturer = data?.lecturer || {};
  const stats = data?.stats || data?.kpi || {
    total_students: 0,
    fast_learners: 0,
    average_learners: 0,
    slow_learners: 0,
    pending_proofs: 0,
    pending_doubts: 0,
    active_tests: 0
  };
  const assigned_sections = data?.assigned_sections || lecturer.assigned_sections || [];
  const assigned_subjects = data?.assigned_subjects || lecturer.assigned_subjects || [];

  return (
    <div className="space-y-6">
      {/* Faculty Profile Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950 to-teal-900 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={lecturer.picture || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120'}
            alt={lecturer.name}
            className="w-16 h-16 rounded-2xl border-2 border-emerald-500/60 object-cover"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">{lecturer.name}</h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/30 text-emerald-300 border border-emerald-400/40">
                {lecturer.employee_id}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">{lecturer.department} &bull; {lecturer.qualification}</p>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {assigned_subjects?.map((s, idx) => (
                <span key={idx} className="px-2 py-0.5 rounded text-[10px] bg-white/10 text-emerald-200">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-slate-400 uppercase font-semibold">Assigned Sections</p>
            <p className="text-xl font-bold text-emerald-300">{assigned_sections?.join(', ') || 'All'}</p>
          </div>
        </div>
      </div>

      {/* Clickable Learner Cards - Prompt Highlight Requirement */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-slate-800 text-base">Learner Performance Breakdown</h3>
          <span className="text-xs text-slate-500">Click any card to open detailed filtered student list</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Students Card */}
          <div
            onClick={() => navigate('/lecturer/classification?category=All')}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-slate-400 hover:shadow-md transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total In Scope</p>
              <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <h4 className="text-3xl font-extrabold text-slate-900 mt-2">{stats.total_students}</h4>
            <div className="flex items-center justify-between mt-3 text-xs text-slate-500 pt-2 border-t border-slate-100">
              <span>View all students</span>
              <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-all" />
            </div>
          </div>

          {/* Fast Learners Card */}
          <div
            onClick={() => navigate('/lecturer/classification?category=Fast')}
            className="bg-white p-5 rounded-2xl border-2 border-emerald-100 hover:border-emerald-500 shadow-sm hover:shadow-md transition-all cursor-pointer group bg-emerald-50/20"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Fast Learners</p>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <Award className="w-5 h-5" />
              </div>
            </div>
            <h4 className="text-3xl font-extrabold text-emerald-700 mt-2">{stats.fast_learners}</h4>
            <div className="flex items-center justify-between mt-3 text-xs text-emerald-600 font-medium pt-2 border-t border-emerald-100">
              <span>Average &ge; 75%</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-all" />
            </div>
          </div>

          {/* Average Learners Card */}
          <div
            onClick={() => navigate('/lecturer/classification?category=Average')}
            className="bg-white p-5 rounded-2xl border-2 border-blue-100 hover:border-blue-500 shadow-sm hover:shadow-md transition-all cursor-pointer group bg-blue-50/20"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Average Learners</p>
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <h4 className="text-3xl font-extrabold text-blue-700 mt-2">{stats.average_learners}</h4>
            <div className="flex items-center justify-between mt-3 text-xs text-blue-600 font-medium pt-2 border-t border-blue-100">
              <span>50% &le; Avg &lt; 75%</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-all" />
            </div>
          </div>

          {/* Slow Learners Card */}
          <div
            onClick={() => navigate('/lecturer/classification?category=Slow')}
            className="bg-white p-5 rounded-2xl border-2 border-red-100 hover:border-red-500 shadow-sm hover:shadow-md transition-all cursor-pointer group bg-red-50/20"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-red-700 uppercase tracking-wider">Slow Learners</p>
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold">
                <AlertTriangle className="w-5 h-5" />
              </div>
            </div>
            <h4 className="text-3xl font-extrabold text-red-700 mt-2">{stats.slow_learners}</h4>
            <div className="flex items-center justify-between mt-3 text-xs text-red-600 font-medium pt-2 border-t border-red-100">
              <span>Average &lt; 50%</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        </div>
      </div>

      {/* Action shortcuts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div
          onClick={() => navigate('/lecturer/proofs')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-500 transition-all cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm">Review Study Proofs</p>
              <p className="text-xs text-slate-500">{stats.pending_proofs} pending verification</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-bold text-xs">
            {stats.pending_proofs}
          </span>
        </div>

        <div
          onClick={() => navigate('/lecturer/doubts')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-500 transition-all cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <HelpCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm">Answer Student Doubts</p>
              <p className="text-xs text-slate-500">{stats.pending_doubts} awaiting answers</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 font-bold text-xs">
            {stats.pending_doubts}
          </span>
        </div>

        <div
          onClick={() => navigate('/lecturer/tests')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:border-emerald-500 transition-all cursor-pointer flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ClipboardCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="font-bold text-slate-800 text-sm">Online MCQ Tests</p>
              <p className="text-xs text-slate-500">Create & manage student tests</p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
            {stats.active_tests} Active
          </span>
        </div>
      </div>
    </div>
  );
};

