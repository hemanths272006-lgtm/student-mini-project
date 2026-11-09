import React, { useState, useEffect } from 'react';
import { StudentPortalService } from '../../services/api';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Award,
  TrendingUp,
  AlertTriangle,
  ClipboardList,
  UploadCloud,
  HelpCircle,
  BookOpenCheck,
  CalendarDays,
  ArrowRight,
  Clock,
  CheckCircle2
} from 'lucide-react';

export const StudentDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await StudentPortalService.getDashboard();
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
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const student = data?.student || {};
  const kpi = data?.kpi || {
    tests_completed: 0,
    proofs_verified: 0,
    doubts_answered: 0
  };
  const online_tests = data?.online_tests || [];
  const proofs = data?.proofs || {};
  const doubts = data?.doubts || {};
  const recommended_materials = data?.recommended_materials || [];
  const timetable = data?.timetable || [];

  return (
    <div className="space-y-6">
      {/* Student Profile Hero Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 rounded-2xl p-6 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border-2 border-indigo-400/50 text-white font-bold text-2xl">
            {student.name.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold">{student.name}</h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30">
                {student.usn}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Section {student.section} &bull; Semester {student.semester} &bull; Computer Science & Engineering
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                  student.category === 'Fast Learner'
                    ? 'bg-emerald-500 text-white'
                    : student.category === 'Average Learner'
                    ? 'bg-blue-500 text-white'
                    : 'bg-red-500 text-white'
                }`}
              >
                {student.category}
              </span>
              <span className="text-xs text-slate-300">
                Trend: <strong className="text-white">{student.trend}</strong>
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs text-slate-400 uppercase font-semibold">Overall Average</p>
            <p className="text-3xl font-extrabold text-indigo-300">{student.overall_average}%</p>
          </div>
          <div className="h-10 w-[1px] bg-slate-700"></div>
          <div className="text-right">
            <p className="text-xs text-slate-400 uppercase font-semibold">Attendance</p>
            <p className="text-3xl font-extrabold text-emerald-400">{student.attendance}%</p>
          </div>
        </div>
      </div>

      {/* Quick KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Online Tests</p>
            <p className="text-lg font-bold text-slate-900">{kpi.tests_completed} Completed</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Verified Study Proofs</p>
            <p className="text-lg font-bold text-emerald-700">{kpi.proofs_verified} Verified</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Faculty Doubts</p>
            <p className="text-lg font-bold text-purple-700">{kpi.doubts_answered} Answered</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-slate-500">Strongest Subject</p>
            <p className="text-sm font-bold text-slate-900 truncate max-w-[120px]">{student.highest_subject || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Online Tests & Recommended Materials */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Online MCQ Tests Available */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Online MCQ Assessments</h3>
                <p className="text-xs text-slate-500">Timed practice tests with automated scoring</p>
              </div>
              <button
                onClick={() => navigate('/student/tests')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <span>View All</span> <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {online_tests?.length > 0 ? (
                online_tests.map((t) => (
                  <div
                    key={t.id}
                    className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 transition-all flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700">
                          {t.subject_name}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-slate-400">
                          <Clock className="w-3 h-3" /> {t.duration_minutes} Mins
                        </span>
                      </div>
                      <h4 className="font-bold text-slate-900 text-sm">{t.title}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">Total Marks: {t.total_marks} &bull; Passing: {t.passing_marks}</p>
                    </div>

                    <div>
                      {t.has_attempted ? (
                        <div className="text-right">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${t.passed ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'}`}>
                            Score: {t.score}/{t.total_marks}
                          </span>
                          <button
                            onClick={() => navigate(`/student/tests?review=${t.id}`)}
                            className="block text-[11px] text-indigo-600 font-semibold hover:underline mt-1 text-right"
                          >
                            Review Answers
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => navigate(`/student/tests?take=${t.id}`)}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
                        >
                          Start Test
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400 py-6 text-center">No assessments scheduled at this time.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Recommended Study Materials */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-base">Recommended for You</h3>
                <p className="text-xs text-slate-500">Targeted for {student.category}</p>
              </div>
              <button
                onClick={() => navigate('/student/materials')}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <span>Browse All</span> <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {recommended_materials?.length > 0 ? (
                recommended_materials.slice(0, 4).map((m) => (
                  <div
                    key={m.id}
                    className="p-3.5 rounded-xl border border-slate-200 hover:border-indigo-300 transition-all flex items-start justify-between gap-3"
                  >
                    <div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                        {m.subject_name} &bull; {m.material_type}
                      </span>
                      <h4 className="font-bold text-slate-900 text-xs mt-1 leading-snug">{m.title}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{m.description || 'Reference notes'}</p>
                    </div>
                    <a
                      href={m.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 text-indigo-700 rounded-lg text-xs font-semibold shrink-0"
                    >
                      Open
                    </a>
                  </div>
                ))
              ) : (
                <p className="text-sm text-slate-400 py-6 text-center">No customized materials found.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row: Weekly Section Timetable */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Weekly Class Timetable (Section {student.section})</h3>
            <p className="text-xs text-slate-500">Regular lecture periods and lab room numbers</p>
          </div>
          <button
            onClick={() => navigate('/student/timetable')}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
          >
            View Full Schedule
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {timetable?.slice(0, 6).map((item) => (
            <div key={item.id} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-[10px] font-bold uppercase text-slate-400 block">{item.day_of_week}</span>
              <p className="font-mono text-xs text-indigo-600 font-bold mt-1">{item.start_time}</p>
              <h5 className="font-bold text-slate-900 text-xs mt-1 truncate">{item.subject_name}</h5>
              <p className="text-[10px] text-slate-500 truncate mt-0.5">{item.lecturer_name}</p>
              <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-semibold bg-white border border-slate-200 text-slate-600 mt-1.5">
                {item.room_number}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

