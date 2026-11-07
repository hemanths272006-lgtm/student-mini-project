import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Award,
  BookOpen,
  AlertTriangle,
  TrendingUp,
  Percent,
  RefreshCw,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  LineChart,
  Line
} from 'recharts';
import StatCard from '../components/StatCard';
import { StudentService } from '../services/api';

const PIE_COLORS = ['#10B981', '#3B82F6', '#EF4444']; // Green, Blue, Red

export default function Dashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await StudentService.getDashboard();
      setData(res);
    } catch (err) {
      setError('Failed to connect to backend API. Please ensure FastAPI server is running on port 8000.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Loading student learning metrics...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-8 max-w-2xl mx-auto my-12 bg-white border border-rose-200 rounded-2xl shadow-sm text-center">
        <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center mx-auto mb-3">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-bold text-slate-800">Connection Error</h3>
        <p className="text-sm text-slate-500 mt-2">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 shadow-sm"
        >
          <RefreshCw className="w-4 h-4" /> Try Again
        </button>
      </div>
    );
  }

  const { kpi, learner_distribution, subject_performance, test_trends, section_performance } = data;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-2xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-radial from-blue-500/20 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30 mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Department of Computer Science & Engineering
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Student Learning Performance Dashboard
          </h1>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">
            Real-time analytics and predictive performance monitoring across 180 students in Sections A, B, and C.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => navigate('/students')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
            >
              <span>Manage Students</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => navigate('/analytics')}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 transition-colors"
            >
              <span>Detailed Analytics</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Students */}
        <StatCard
          title="Total Students"
          value={kpi.total_students}
          subtitle="3 Sections (A, B, C)"
          icon={Users}
          colorScheme="indigo"
          badge={<span>Overall Class Avg: <strong className="text-slate-800">{kpi.overall_average}%</strong></span>}
        />

        {/* Fast Learners */}
        <StatCard
          title="Fast Learners (≥ 75%)"
          value={kpi.fast_learners}
          subtitle={`${((kpi.fast_learners / (kpi.total_students || 1)) * 100).toFixed(1)}% of total strength`}
          icon={Award}
          colorScheme="emerald"
          badge={<span className="text-emerald-700 font-medium">Exceptional Mastery</span>}
        />

        {/* Average Learners */}
        <StatCard
          title="Average Learners (50-74%)"
          value={kpi.average_learners}
          subtitle={`${((kpi.average_learners / (kpi.total_students || 1)) * 100).toFixed(1)}% of total strength`}
          icon={BookOpen}
          colorScheme="blue"
          badge={<span className="text-blue-700 font-medium">Standard Progression</span>}
        />

        {/* Slow Learners */}
        <StatCard
          title="Slow Learners (< 50%)"
          value={kpi.slow_learners}
          subtitle={`${((kpi.slow_learners / (kpi.total_students || 1)) * 100).toFixed(1)}% require support`}
          icon={AlertTriangle}
          colorScheme="rose"
          badge={<span className="text-rose-700 font-medium">Academic Support Target</span>}
        />
      </div>

      {/* Secondary Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Class Attendance Avg</p>
              <h4 className="text-xl font-bold text-slate-900">{kpi.average_attendance}%</h4>
            </div>
          </div>
          <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            Mandatory: 75%
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Improving Students</p>
              <h4 className="text-xl font-bold text-slate-900">{kpi.improving_count}</h4>
            </div>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Test 3 & 4 Progression
          </span>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/80 p-4 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Declining Trajectory</p>
              <h4 className="text-xl font-bold text-slate-900">{kpi.declining_count}</h4>
            </div>
          </div>
          <span className="text-xs text-rose-600 font-medium">
            Needs Intervention
          </span>
        </div>
      </div>

      {/* Main Charts Row 1: Learner Distribution Donut & Subject-wise Performance Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Donut Chart: Learner Distribution */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-bold text-slate-900">Learner Classification</h3>
              <span className="text-xs font-semibold text-slate-400">Total: {kpi.total_students}</span>
            </div>
            <p className="text-xs text-slate-500">Distribution of Fast, Average, and Slow Learners</p>
          </div>

          <div className="h-64 w-full my-3">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={learner_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="count"
                >
                  {learner_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [`${value} Students`, name]}
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Custom Legend */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center">
            {learner_distribution.map((item, idx) => (
              <div key={item.name} className="p-2 rounded-lg bg-slate-50">
                <div className="flex items-center justify-center gap-1.5 mb-1">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[idx] }}></span>
                  <span className="text-[11px] font-semibold text-slate-600">{item.name.replace(' Learner', '')}</span>
                </div>
                <div className="text-sm font-bold text-slate-900">{item.count}</div>
                <div className="text-[10px] text-slate-400 font-medium">{item.percentage}%</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart: Subject-wise Performance */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-bold text-slate-900">Subject-wise Average Marks</h3>
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">5 Subjects</span>
            </div>
            <p className="text-xs text-slate-500">Class-wide average, highest and lowest scores per subject</p>
          </div>

          <div className="h-64 w-full my-3">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={subject_performance} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="subject" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="average" name="Class Average" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="highest" name="Highest Score" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="lowest" name="Lowest Score" fill="#F87171" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Highest avg subject: <strong>Computer Science</strong></span>
            <span>Scale: 0 to 100 Marks</span>
          </div>
        </div>
      </div>

      {/* Main Charts Row 2: Test-wise Trend Line Chart & Section Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Line Chart: Test-wise Performance Trend */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-bold text-slate-900">Assessment Progression (Tests 1 to 4)</h3>
              <span className="text-xs font-semibold text-slate-400">Continuous Evaluation</span>
            </div>
            <p className="text-xs text-slate-500">Tracking score progression across Fast, Average, and Slow Learner groups</p>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={test_trends} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="test" tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
                <YAxis domain={[20, 100]} tick={{ fontSize: 11, fill: '#64748b' }} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line type="monotone" dataKey="fast" name="Fast Learners" stroke="#10B981" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="overall" name="Class Overall" stroke="#6366F1" strokeWidth={2.5} dot={{ r: 4 }} />
                <Line type="monotone" dataKey="average" name="Average Learners" stroke="#3B82F6" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="slow" name="Slow Learners" stroke="#EF4444" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Section-wise Student Performance Cards */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col justify-between">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-base font-bold text-slate-900">Section-wise Performance</h3>
              <span className="text-xs font-semibold text-slate-400">Sections A, B, C</span>
            </div>
            <p className="text-xs text-slate-500">Comparative breakdown of average marks & student tiers</p>
          </div>

          <div className="space-y-3 flex-1">
            {section_performance.map((sec) => (
              <div key={sec.section} className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/70 hover:bg-slate-50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-lg bg-blue-600 text-white text-xs font-bold flex items-center justify-center">
                      {sec.section.replace('Section ', '')}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{sec.section}</h4>
                      <p className="text-[10px] text-slate-400">{sec.total} Students</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-extrabold text-slate-900">{sec.average}%</span>
                    <p className="text-[10px] text-slate-500">Attendance: {sec.attendance}%</p>
                  </div>
                </div>

                {/* Micro Category Bar */}
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden flex">
                  <div
                    style={{ width: `${(sec.fast_count / sec.total) * 100}%` }}
                    className="bg-emerald-500 h-full"
                    title={`Fast: ${sec.fast_count}`}
                  />
                  <div
                    style={{ width: `${(sec.avg_count / sec.total) * 100}%` }}
                    className="bg-blue-500 h-full"
                    title={`Average: ${sec.avg_count}`}
                  />
                  <div
                    style={{ width: `${(sec.slow_count / sec.total) * 100}%` }}
                    className="bg-rose-500 h-full"
                    title={`Slow: ${sec.slow_count}`}
                  />
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-500 mt-1.5 font-medium">
                  <span className="text-emerald-700">Fast: {sec.fast_count}</span>
                  <span className="text-blue-700">Avg: {sec.avg_count}</span>
                  <span className="text-rose-700">Slow: {sec.slow_count}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end">
            <button
              onClick={() => navigate('/analytics')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
            >
              <span>View full sectional comparison</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

