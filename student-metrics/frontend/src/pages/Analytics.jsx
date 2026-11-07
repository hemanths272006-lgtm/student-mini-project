import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Award,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Users
} from 'lucide-react';
import { CategoryBadge, TrendBadge } from '../components/Badge';
import { StudentService } from '../services/api';

const TREND_COLORS = {
  Improving: '#10B981',
  Consistent: '#64748B',
  Declining: '#EF4444',
};

export default function Analytics() {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const data = await StudentService.getAnalytics();
      setAnalytics(data);
    } catch (err) {
      setError('Failed to load performance analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Synthesizing cohort learning analytics...</p>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="p-8 max-w-lg mx-auto my-12 bg-white border border-rose-200 rounded-2xl text-center">
        <h3 className="text-lg font-bold text-slate-800">Error Loading Analytics</h3>
        <p className="text-xs text-slate-500 mt-2">{error}</p>
        <button
          onClick={fetchAnalytics}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { section_comparison, subject_performance, trend_distribution, top_10_students, support_needed_students } = analytics;

  const trendPieData = [
    { name: 'Improving', value: trend_distribution.Improving || 0, color: '#10B981' },
    { name: 'Consistent', value: trend_distribution.Consistent || 0, color: '#64748B' },
    { name: 'Declining', value: trend_distribution.Declining || 0, color: '#EF4444' },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Performance Analytics</h1>
          <p className="text-xs text-slate-500 mt-1">
            Sectional comparisons, progression trends, top rankers, and academic intervention targets.
          </p>
        </div>
        <button
          onClick={fetchAnalytics}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Analytics
        </button>
      </div>

      {/* Row 1: Section Comparison Bar Chart & Trend Donut */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Section Comparison */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">Sectional Benchmarking (A vs B vs C)</h3>
              <p className="text-xs text-slate-500">Average score and attendance across sections</p>
            </div>
            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">
              60 Students / Section
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={section_comparison} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="section" tick={{ fontSize: 11 }} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px' }} />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="average" name="Section Average %" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="attendance" name="Attendance %" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Learning Trend Breakdown */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-bold text-slate-900">Cohort Learning Trends</h3>
              <span className="text-xs font-semibold text-slate-400">T1/T2 vs T3/T4</span>
            </div>
            <p className="text-xs text-slate-500">Trajectory distribution across all 180 students</p>
          </div>

          <div className="h-52 w-full my-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={trendPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {trendPieData.map((entry, index) => (
                    <Cell key={`trend-cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-800">
              <span className="text-[10px] font-bold uppercase block">Improving</span>
              <span className="text-base font-extrabold">{trend_distribution.Improving}</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
              <span className="text-[10px] font-bold uppercase block">Consistent</span>
              <span className="text-base font-extrabold">{trend_distribution.Consistent}</span>
            </div>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-800">
              <span className="text-[10px] font-bold uppercase block">Declining</span>
              <span className="text-base font-extrabold">{trend_distribution.Declining}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Top 10 High Performers Leaderboard */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Academic Honors: Top 10 Performing Students</h3>
              <p className="text-xs text-slate-500">Highest cumulative averages across all four assessments</p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200">
                <th className="py-3 px-4">Rank</th>
                <th className="py-3 px-4">USN</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Section</th>
                <th className="py-3 px-4">Cumulative Avg</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Trend</th>
                <th className="py-3 px-4">Attendance</th>
                <th className="py-3 px-4 text-right">Report</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {top_10_students.map((student) => (
                <tr key={student.id} className="hover:bg-amber-50/20 transition-colors">
                  <td className="py-2.5 px-4 font-bold text-slate-900">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                      student.rank === 1 ? 'bg-amber-400 text-white font-extrabold' :
                      student.rank === 2 ? 'bg-slate-300 text-slate-800 font-bold' :
                      student.rank === 3 ? 'bg-amber-600 text-white font-bold' :
                      'bg-slate-100 text-slate-600 font-semibold'
                    }`}>
                      {student.rank}
                    </span>
                  </td>
                  <td className="py-2.5 px-4 font-mono font-semibold text-slate-800">{student.usn}</td>
                  <td className="py-2.5 px-4 font-bold text-slate-900">{student.name}</td>
                  <td className="py-2.5 px-4">Section {student.section}</td>
                  <td className="py-2.5 px-4 font-extrabold text-blue-600 text-sm">{student.overall_average}%</td>
                  <td className="py-2.5 px-4"><CategoryBadge category={student.category} /></td>
                  <td className="py-2.5 px-4"><TrendBadge trend={student.trend} /></td>
                  <td className="py-2.5 px-4 font-medium">{student.attendance}%</td>
                  <td className="py-2.5 px-4 text-right">
                    <button
                      onClick={() => navigate(`/reports/${student.id}`)}
                      className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors"
                    >
                      Inspect
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row 3: Academic Support & Intervention Center */}
      <div className="bg-white rounded-2xl border border-rose-200/90 p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Academic Intervention & Support Center</h3>
              <p className="text-xs text-slate-500">Students flagged for Slow Learner tier, low attendance (&lt; 75%), or declining trends</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
            {support_needed_students.length} Students Target
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-rose-50/50 text-slate-600 font-bold uppercase tracking-wider text-[10px] border-b border-rose-200">
                <th className="py-3 px-4">USN / Name</th>
                <th className="py-3 px-4">Section</th>
                <th className="py-3 px-4">Average</th>
                <th className="py-3 px-4">Attendance</th>
                <th className="py-3 px-4">Weakest Subject</th>
                <th className="py-3 px-4">Diagnostic Reasons</th>
                <th className="py-3 px-4">Recommended Intervention</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {support_needed_students.map((student) => (
                <tr key={student.id} className="hover:bg-rose-50/20 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900 block">{student.name}</span>
                    <span className="font-mono text-[10px] text-slate-400">{student.usn}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-700">Sec {student.section}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-extrabold text-rose-600">{student.overall_average}%</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`font-semibold ${student.attendance < 75 ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>
                      {student.attendance}%
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-slate-800 font-medium">{student.weakest_subject}</span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-wrap gap-1">
                      {student.reasons.map((r, i) => (
                        <span key={i} className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                          {r}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-slate-600 leading-snug block max-w-xs text-[11px]">
                      {student.action_plan}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => navigate(`/reports/${student.id}`)}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition-colors"
                    >
                      <span>Action Plan</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

