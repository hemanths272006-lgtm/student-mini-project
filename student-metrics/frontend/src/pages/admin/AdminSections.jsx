import React, { useState, useEffect } from 'react';
import { AdminService } from '../../services/api';
import {
  Layers,
  Users,
  Award,
  TrendingUp,
  AlertTriangle,
  Search,
  Eye,
  FileSpreadsheet
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const AdminSections = () => {
  const [activeSection, setActiveSection] = useState('A');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    loadSectionData(activeSection);
  }, [activeSection]);

  const loadSectionData = async (sec) => {
    try {
      setLoading(true);
      const res = await AdminService.getSectionAnalytics(sec);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const students = data?.students || [];
  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.usn.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Section Management & Governance</h2>
          <p className="text-sm text-slate-500">
            Compare Section A, Section B, and Section C with exactly 60 students each.
          </p>
        </div>

        {/* Section Tabs */}
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          {['A', 'B', 'C'].map((sec) => (
            <button
              key={sec}
              onClick={() => setActiveSection(sec)}
              className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
                activeSection === sec
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              Section {sec} (60 Students)
            </button>
          ))}
        </div>
      </div>

      {loading || !data ? (
        <div className="p-16 text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : (
        <>
          {/* Section Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <p className="text-xs text-slate-500 font-semibold uppercase">Total Enrolled</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">{data.total_students} Students</h3>
              <p className="text-xs text-slate-400 mt-0.5">Section {activeSection}</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-blue-200 shadow-sm">
              <p className="text-xs text-blue-600 font-semibold uppercase">Class Average</p>
              <h3 className="text-2xl font-bold text-blue-700 mt-1">{data.average_score}%</h3>
              <p className="text-xs text-blue-500 mt-0.5">Across All Assessments</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-sm">
              <p className="text-xs text-emerald-600 font-semibold uppercase">Fast Learners</p>
              <h3 className="text-2xl font-bold text-emerald-700 mt-1">{data.fast_learners}</h3>
              <p className="text-xs text-emerald-500 mt-0.5">&ge; 75% Score</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-indigo-200 shadow-sm">
              <p className="text-xs text-indigo-600 font-semibold uppercase">Average Learners</p>
              <h3 className="text-2xl font-bold text-indigo-700 mt-1">{data.average_learners}</h3>
              <p className="text-xs text-indigo-500 mt-0.5">50% - 74% Score</p>
            </div>

            <div className="bg-white p-4 rounded-xl border border-red-200 shadow-sm">
              <p className="text-xs text-red-600 font-semibold uppercase">Slow Learners</p>
              <h3 className="text-2xl font-bold text-red-700 mt-1">{data.slow_learners}</h3>
              <p className="text-xs text-red-500 mt-0.5">&lt; 50% Remedial</p>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder={`Search ${activeSection} students by name or USN...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Student Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm">
                Enrolled Students in Section {activeSection} ({filteredStudents.length} of {students.length})
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5">USN</th>
                    <th className="px-6 py-3.5">Student Name</th>
                    <th className="px-6 py-3.5">Attendance</th>
                    <th className="px-6 py-3.5">Overall Avg</th>
                    <th className="px-6 py-3.5">Learner Category</th>
                    <th className="px-6 py-3.5">Trend</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStudents.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-3.5 font-mono font-semibold text-slate-900">{s.usn}</td>
                      <td className="px-6 py-3.5 font-medium text-slate-900">{s.name}</td>
                      <td className="px-6 py-3.5">
                        <span className="font-semibold text-slate-800">{s.attendance}%</span>
                      </td>
                      <td className="px-6 py-3.5 font-bold text-slate-900">{s.overall_average}%</td>
                      <td className="px-6 py-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
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
                      <td className="px-6 py-3.5">
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
                      <td className="px-6 py-3.5 text-right">
                        <button
                          onClick={() => navigate(`/report/${s.id}`)}
                          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold transition-all inline-flex items-center gap-1.5"
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
          </div>
        </>
      )}
    </div>
  );
};

