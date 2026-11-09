import React, { useState, useEffect } from 'react';
import { AdminService } from '../../services/api';
import {
  Users,
  GraduationCap,
  Layers,
  HelpCircle,
  TrendingUp,
  Award,
  AlertTriangle,
  Clock,
  CheckCircle,
  FileText
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await AdminService.getDashboard();
      setData(res);
    } catch (err) {
      console.error('Failed to load admin dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { kpis, learner_distribution, section_averages, recent_activities } = data;

  const COLORS = ['#10B981', '#3B82F6', '#EF4444'];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-900 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30">
            Institutional Oversight
          </span>
          <h2 className="text-2xl font-bold mt-2">Executive Academic Dashboard</h2>
          <p className="text-sm text-slate-300">
            Monitoring 180 Students across Sections A, B, and C with full faculty governance.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Overall Average</p>
            <p className="text-2xl font-extrabold text-blue-300">{kpis.overall_average}%</p>
          </div>
          <div className="h-10 w-[1px] bg-slate-700"></div>
          <div className="text-right">
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Attendance Rate</p>
            <p className="text-2xl font-extrabold text-emerald-400">{kpis.average_attendance}%</p>
          </div>
        </div>
      </div>

      {/* KPI Cards Row 1 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Students</p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">{kpis.total_students}</h3>
            <p className="text-xs text-slate-500 mt-1">Sections A (60), B (60), C (60)</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Fast Learners</p>
            <h3 className="text-2xl font-bold text-emerald-600 mt-1">{kpis.fast_learners}</h3>
            <p className="text-xs text-emerald-600 mt-1">&ge; 75% Average Score</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Learners</p>
            <h3 className="text-2xl font-bold text-blue-600 mt-1">{kpis.average_learners}</h3>
            <p className="text-xs text-blue-600 mt-1">50% - 74% Average Score</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Slow Learners</p>
            <h3 className="text-2xl font-bold text-red-600 mt-1">{kpis.slow_learners}</h3>
            <p className="text-xs text-red-600 mt-1">&lt; 50% Remedial Needed</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* KPI Cards Row 2 - Governance Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Registered Faculty</p>
            <p className="text-lg font-bold text-slate-800">{kpis.total_lecturers} Lecturers</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/30 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-amber-800">Pending Faculty Approval</p>
            <p className="text-lg font-bold text-amber-900">{kpis.pending_lecturer_verifications} Pending</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-blue-200 bg-blue-50/30 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-blue-800">Pending Study Proofs</p>
            <p className="text-lg font-bold text-blue-900">{kpis.pending_study_proofs} Submissions</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-purple-200 bg-purple-50/30 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-purple-800">Unanswered Doubts</p>
            <p className="text-lg font-bold text-purple-900">{kpis.pending_doubts} Doubts</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Learner Distribution Chart */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 mb-1">Learner Category Distribution</h3>
          <p className="text-xs text-slate-500 mb-4">Fast (&ge;75%), Average (50-74%), Slow (&lt;50%)</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={learner_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="count"
                  label={({ name, percentage }) => `${name.split(' ')[0]}: ${percentage}%`}
                >
                  {learner_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-around mt-2 text-xs">
            <span className="flex items-center gap-1.5 text-emerald-600 font-semibold">
              <span className="w-3 h-3 rounded-full bg-emerald-500"></span> Fast ({kpis.fast_learners})
            </span>
            <span className="flex items-center gap-1.5 text-blue-600 font-semibold">
              <span className="w-3 h-3 rounded-full bg-blue-500"></span> Average ({kpis.average_learners})
            </span>
            <span className="flex items-center gap-1.5 text-red-600 font-semibold">
              <span className="w-3 h-3 rounded-full bg-red-500"></span> Slow ({kpis.slow_learners})
            </span>
          </div>
        </div>

        {/* Section Performance Bar Chart */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-base font-bold text-slate-800 mb-1">Section A vs B vs C Performance</h3>
          <p className="text-xs text-slate-500 mb-4">Class Average Marks & Attendance Across 60 Students Each</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={section_averages} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="section" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="average" name="Average Marks %" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                <Bar dataKey="attendance" name="Attendance %" fill="#10B981" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activities Log */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <h3 className="text-base font-bold text-slate-800 mb-3">Recent Academic Activities</h3>
        <div className="divide-y divide-slate-100">
          {recent_activities?.length > 0 ? (
            recent_activities.map((act) => (
              <div key={act.id} className="py-3 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">
                      {act.user_name} &bull; <span className="text-blue-600 font-medium">{act.action}</span>
                    </p>
                    <p className="text-xs text-slate-500 mt-0.5">{act.details}</p>
                  </div>
                </div>
                <span className="text-xs text-slate-400 whitespace-nowrap">
                  {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-400 py-3">No recent activities recorded.</p>
          )}
        </div>
      </div>
    </div>
  );
};

