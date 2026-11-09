import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { LecturerService } from '../../services/api';
import {
  Award,
  TrendingUp,
  AlertTriangle,
  Users,
  Search,
  Filter,
  ArrowUpDown,
  Download,
  Eye,
  CheckCircle2
} from 'lucide-react';

export const LecturerClassification = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Read category from URL query or default to 'All'
  const currentCategory = searchParams.get('category') || 'All';
  const currentSection = searchParams.get('section') || '';

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('marks_desc'); // marks_desc, marks_asc, attendance_desc, attendance_asc

  useEffect(() => {
    loadClassificationData();
  }, [currentCategory, currentSection]);

  const loadClassificationData = async () => {
    try {
      setLoading(true);
      const params = {};
      if (currentCategory && currentCategory !== 'All') {
        params.category = currentCategory;
      }
      if (currentSection) {
        params.section = currentSection;
      }
      const res = await LecturerService.getLearnerClassification(params);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorySelect = (cat) => {
    const newParams = new URLSearchParams(searchParams);
    if (cat === 'All') newParams.delete('category');
    else newParams.set('category', cat);
    setSearchParams(newParams);
  };

  const handleSectionSelect = (sec) => {
    const newParams = new URLSearchParams(searchParams);
    if (!sec) newParams.delete('section');
    else newParams.set('section', sec);
    setSearchParams(newParams);
  };

  // Filter & sort students in memory
  let students = data?.students || [];

  if (search.trim()) {
    const q = search.toLowerCase();
    students = students.filter(
      (s) => s.name.toLowerCase().includes(q) || s.usn.toLowerCase().includes(q)
    );
  }

  students = [...students].sort((a, b) => {
    if (sortBy === 'marks_desc') return b.overall_average - a.overall_average;
    if (sortBy === 'marks_asc') return a.overall_average - b.overall_average;
    if (sortBy === 'attendance_desc') return b.attendance - a.attendance;
    if (sortBy === 'attendance_asc') return a.attendance - b.attendance;
    return 0;
  });

  const exportCSV = () => {
    if (!students.length) return;
    const headers = ['Rank', 'USN', 'Name', 'Section', 'Attendance %', 'Overall Average %', 'Category', 'Trend', 'Highest Subject', 'Lowest Subject'];
    const rows = students.map((s, idx) => [
      idx + 1,
      s.usn,
      `"${s.name}"`,
      s.section,
      s.attendance,
      s.overall_average,
      s.category,
      s.trend,
      `"${s.highest_subject || ''}"`,
      `"${s.lowest_subject || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Learner_Classification_${currentCategory}_Section_${currentSection || 'All'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const summary = data?.summary || { total: 0, fast: 0, average: 0, slow: 0 };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Learner Classification & Analytics</h2>
          <p className="text-sm text-slate-500">
            Interactive student categorization based on continuous assessment averages (&ge;75% Fast, 50-74% Average, &lt;50% Slow).
          </p>
        </div>
        <button
          onClick={exportCSV}
          disabled={students.length === 0}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl text-sm font-semibold transition-all shadow-sm disabled:opacity-50"
        >
          <Download className="w-4 h-4 text-slate-500" />
          <span>Export Filtered List (CSV)</span>
        </button>
      </div>

      {/* 3 Clickable Learner Cards + All Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* All Learners */}
        <div
          onClick={() => handleCategorySelect('All')}
          className={`p-5 rounded-2xl border-2 transition-all cursor-pointer ${
            currentCategory === 'All'
              ? 'border-slate-800 bg-slate-900 text-white shadow-lg'
              : 'border-slate-200 bg-white hover:border-slate-400 text-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold tracking-wider">All Students</span>
            <Users className="w-5 h-5" />
          </div>
          <h4 className="text-3xl font-extrabold mt-2">{summary.total}</h4>
          <p className={`text-xs mt-2 ${currentCategory === 'All' ? 'text-slate-300' : 'text-slate-500'}`}>
            Complete student cohort
          </p>
        </div>

        {/* Fast Learners (>= 75%) */}
        <div
          onClick={() => handleCategorySelect('Fast')}
          className={`p-5 rounded-2xl border-2 transition-all cursor-pointer ${
            currentCategory === 'Fast'
              ? 'border-emerald-600 bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
              : 'border-emerald-200 bg-emerald-50/40 hover:border-emerald-500 text-emerald-950'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold tracking-wider">Fast Learners</span>
            <Award className="w-5 h-5" />
          </div>
          <h4 className="text-3xl font-extrabold mt-2">{summary.fast}</h4>
          <p className={`text-xs mt-2 ${currentCategory === 'Fast' ? 'text-emerald-100' : 'text-emerald-700'}`}>
            Average &ge; 75%
          </p>
        </div>

        {/* Average Learners (50% - 74%) */}
        <div
          onClick={() => handleCategorySelect('Average')}
          className={`p-5 rounded-2xl border-2 transition-all cursor-pointer ${
            currentCategory === 'Average'
              ? 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-600/30'
              : 'border-blue-200 bg-blue-50/40 hover:border-blue-500 text-blue-950'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold tracking-wider">Average Learners</span>
            <TrendingUp className="w-5 h-5" />
          </div>
          <h4 className="text-3xl font-extrabold mt-2">{summary.average}</h4>
          <p className={`text-xs mt-2 ${currentCategory === 'Average' ? 'text-blue-100' : 'text-blue-700'}`}>
            50% &le; Average &lt; 75%
          </p>
        </div>

        {/* Slow Learners (< 50%) */}
        <div
          onClick={() => handleCategorySelect('Slow')}
          className={`p-5 rounded-2xl border-2 transition-all cursor-pointer ${
            currentCategory === 'Slow'
              ? 'border-red-600 bg-red-600 text-white shadow-lg shadow-red-600/30'
              : 'border-red-200 bg-red-50/40 hover:border-red-500 text-red-950'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-semibold tracking-wider">Slow Learners</span>
            <AlertTriangle className="w-5 h-5" />
          </div>
          <h4 className="text-3xl font-extrabold mt-2">{summary.slow}</h4>
          <p className={`text-xs mt-2 ${currentCategory === 'Slow' ? 'text-red-100' : 'text-red-700'}`}>
            Average &lt; 50% (Remedial)
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search student by name or USN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div className="flex items-center gap-3">
          {/* Section Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500 font-medium">Section:</span>
            <select
              value={currentSection}
              onChange={(e) => handleSectionSelect(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none"
            >
              <option value="">All (A, B, C)</option>
              <option value="A">Section A</option>
              <option value="B">Section B</option>
              <option value="C">Section C</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-4 h-4 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none"
            >
              <option value="marks_desc">Highest Marks First</option>
              <option value="marks_asc">Lowest Marks First</option>
              <option value="attendance_desc">Highest Attendance</option>
              <option value="attendance_asc">Lowest Attendance</option>
            </select>
          </div>
        </div>
      </div>

      {/* Detailed Student Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="font-bold text-slate-800 text-sm">
            Showing {students.length} Students ({currentCategory === 'All' ? 'All Categories' : `${currentCategory} Learners`})
          </h3>
          <span className="text-xs text-slate-500">Live academic records from SQLite</span>
        </div>

        {loading ? (
          <div className="p-16 text-center">
            <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : students.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            No students found matching the selected category and filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                <tr>
                  <th className="px-5 py-3.5">Rank</th>
                  <th className="px-5 py-3.5">Student Details</th>
                  <th className="px-5 py-3.5">Section</th>
                  <th className="px-5 py-3.5">Attendance</th>
                  <th className="px-5 py-3.5">Overall Avg</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Trend</th>
                  <th className="px-5 py-3.5">Strongest / Weakest</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((s, idx) => (
                  <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-slate-400">#{idx + 1}</td>
                    <td className="px-5 py-3.5">
                      <p className="font-semibold text-slate-900">{s.name}</p>
                      <p className="font-mono text-xs text-slate-500">{s.usn}</p>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-700">
                        Sec {s.section}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 font-semibold text-slate-800">{s.attendance}%</td>
                    <td className="px-5 py-3.5 font-extrabold text-slate-900 text-base">{s.overall_average}%</td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                          s.category === 'Fast Learner'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : s.category === 'Average Learner'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-red-50 text-red-700 border border-red-200'
                        }`}
                      >
                        {s.category}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`text-xs font-semibold ${
                          s.trend === 'Improving'
                            ? 'text-emerald-600'
                            : s.trend === 'Declining'
                            ? 'text-red-600'
                            : 'text-slate-600'
                        }`}
                      >
                        {s.trend}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs">
                      <p className="text-emerald-700 font-medium">Top: {s.highest_subject || 'N/A'}</p>
                      <p className="text-red-600 font-medium">Focus: {s.lowest_subject || 'N/A'}</p>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => navigate(`/report/${s.id}`)}
                        className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Report</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

