import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Printer,
  ArrowLeft,
  GraduationCap,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  TrendingUp,
  Percent,
  Sparkles,
  ChevronRight,
  RefreshCw,
  Search
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { CategoryBadge, TrendBadge } from '../components/Badge';
import { StudentService } from '../services/api';

const SUBJECT_LIST = ["Mathematics", "Science", "English", "Computer Science", "Social Studies"];
const TEST_LIST = ["Test 1", "Test 2", "Test 3", "Test 4"];

export default function StudentReport() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [allStudents, setAllStudents] = useState([]);
  const [searchJump, setSearchJump] = useState('');

  const fetchReport = async (studentId) => {
    setLoading(true);
    setError('');
    try {
      const data = await StudentService.getReport(studentId);
      setStudent(data);
    } catch (err) {
      setError('Failed to fetch student report.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // If no ID param provided, default to first student (1)
    const targetId = id || '1';
    fetchReport(targetId);

    // Fetch student list for quick switcher
    StudentService.getStudents({ limit: 180 }).then((res) => {
      setAllStudents(res.students || []);
    }).catch(() => {});
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
        <p className="text-sm font-semibold text-slate-500">Generating student learning report...</p>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="p-8 max-w-xl mx-auto my-12 bg-white border border-rose-200 rounded-2xl text-center">
        <h3 className="text-lg font-bold text-slate-800">Report Not Found</h3>
        <p className="text-xs text-slate-500 mt-2">{error || 'Unable to locate student details.'}</p>
        <button
          onClick={() => navigate('/students')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold"
        >
          Return to Student Directory
        </button>
      </div>
    );
  }

  // Build matrix for table: subject -> test -> score
  const matrix = {};
  SUBJECT_LIST.forEach((s) => {
    matrix[s] = {};
    TEST_LIST.forEach((t) => {
      matrix[s][t] = 0;
    });
  });

  if (student.raw_marks) {
    student.raw_marks.forEach((m) => {
      if (matrix[m.subject_name]) {
        matrix[m.subject_name][m.assessment_name] = m.score;
      }
    });
  }

  // Trend chart data: progression across Test 1, Test 2, Test 3, Test 4
  const trendChartData = TEST_LIST.map((t) => ({
    test: t,
    score: student.test_averages?.[t] || 0,
  }));

  // Subject chart data
  const subjectChartData = SUBJECT_LIST.map((s) => ({
    subject: s,
    average: student.subject_averages?.[s] || 0,
  }));

  // Read customized institutional branding if configured in Settings
  const savedInstitution = JSON.parse(localStorage.getItem('institution_settings') || '{}');
  const institutionName = savedInstitution.institutionName || student.institution_name || 'Department of Computer Science & Engineering';
  const collegeName = savedInstitution.collegeName || 'College of Engineering & Technology';
  const academicYear = savedInstitution.academicYear || student.academic_year || '2026-2027';
  const programName = savedInstitution.programName || student.program || 'Bachelor of Engineering (B.E.)';
  const advisorTitle = savedInstitution.advisorTitle || 'Class Advisor';
  const hodTitle = savedInstitution.hodTitle || 'Head of Department (HOD)';

  return (
    <div className="space-y-6">
      {/* Action Toolbar (Hidden during print) */}
      <div className="no-print bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => navigate('/students')}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Directory
          </button>

          {/* Quick Student Switcher Dropdown */}
          <div className="relative flex-1 md:w-64">
            <select
              value={student.id}
              onChange={(e) => navigate(`/reports/${e.target.value}`)}
              className="w-full text-xs font-medium py-1.5 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {allStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.usn} - {s.name} (Sec {s.section})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Print Button */}
        <button
          onClick={handlePrint}
          className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-500/20 transition-all"
        >
          <Printer className="w-4 h-4" />
          <span>Print Formal Report</span>
        </button>
      </div>

      {/* Printable Report Canvas */}
      <div className="printable-area bg-white rounded-2xl border border-slate-200/90 shadow-sm p-6 sm:p-10 space-y-8">
        {/* Institutional Report Header */}
        <div className="border-b-2 border-slate-900 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-900 text-white flex items-center justify-center font-bold shadow-md">
              <GraduationCap className="w-8 h-8 text-blue-200" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 uppercase tracking-tight">
                {institutionName}
              </h2>
              <p className="text-xs text-blue-700 font-bold uppercase tracking-wider mt-0.5">
                {collegeName}
              </p>
              <p className="text-xs text-slate-500 font-semibold tracking-wide mt-0.5">
                CONTINUOUS LEARNING EVALUATION & PERFORMANCE ASSESSMENT REPORT
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Program: {programName} • Academic Year: {academicYear} • Semester {student.semester}
              </p>
            </div>
          </div>

          <div className="text-right sm:border-l sm:pl-6 sm:border-slate-200">
            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Report Date</span>
            <span className="text-xs font-bold text-slate-800">November 2026</span>
            <div className="mt-1">
              <CategoryBadge category={student.category} size="lg" />
            </div>
          </div>
        </div>

        {/* Student Profile Info Grid */}
        <div className="bg-slate-50/80 rounded-2xl border border-slate-200 p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-xs">
            <div>
              <span className="text-slate-400 font-medium block text-[10px] uppercase tracking-wider">Student Name</span>
              <span className="text-sm font-bold text-slate-900 mt-0.5 block">{student.name}</span>
            </div>

            <div>
              <span className="text-slate-400 font-medium block text-[10px] uppercase tracking-wider">USN</span>
              <span className="text-sm font-bold text-slate-900 font-mono mt-0.5 block">{student.usn}</span>
            </div>

            <div>
              <span className="text-slate-400 font-medium block text-[10px] uppercase tracking-wider">Section</span>
              <span className="text-sm font-bold text-slate-900 mt-0.5 block">Section {student.section}</span>
            </div>

            <div>
              <span className="text-slate-400 font-medium block text-[10px] uppercase tracking-wider">Attendance</span>
              <span className={`text-sm font-bold mt-0.5 block ${student.attendance < 75 ? 'text-rose-600' : 'text-slate-900'}`}>
                {student.attendance}%
              </span>
            </div>

            <div>
              <span className="text-slate-400 font-medium block text-[10px] uppercase tracking-wider">Class Rank</span>
              <span className="text-sm font-bold text-slate-900 mt-0.5 block">
                #{student.class_rank} <span className="text-slate-400 text-[11px] font-normal">of {student.total_students}</span>
              </span>
            </div>

            <div>
              <span className="text-slate-400 font-medium block text-[10px] uppercase tracking-wider">Learning Trend</span>
              <div className="mt-1">
                <TrendBadge trend={student.trend} />
              </div>
            </div>
          </div>
        </div>

        {/* KPI Performance Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/60">
            <span className="text-[10px] uppercase font-bold text-blue-700 tracking-wider">Cumulative Average</span>
            <div className="text-3xl font-extrabold text-blue-950 mt-1">{student.overall_average}%</div>
            <p className="text-[11px] text-blue-700 mt-1">Calculated over 4 Tests & 5 Subjects</p>
          </div>

          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/60">
            <span className="text-[10px] uppercase font-bold text-emerald-700 tracking-wider">Highest Scoring Subject</span>
            <div className="text-base font-extrabold text-emerald-950 mt-1 truncate">{student.highest_subject}</div>
            <p className="text-xs font-bold text-emerald-700 mt-1">{student.highest_score}% Average Score</p>
          </div>

          <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/60">
            <span className="text-[10px] uppercase font-bold text-rose-700 tracking-wider">Lowest Scoring Subject</span>
            <div className="text-base font-extrabold text-rose-950 mt-1 truncate">{student.lowest_subject}</div>
            <p className="text-xs font-bold text-rose-700 mt-1">{student.lowest_score}% Average Score</p>
          </div>
        </div>

        {/* Assessment Marks Matrix Table */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-3">
            Assessment-wise Score Breakdown
          </h3>
          <div className="rounded-xl border border-slate-200 overflow-hidden shadow-2xs">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/80 text-slate-600 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3 px-4 border-b border-slate-200">Subject</th>
                  <th className="py-3 px-4 border-b border-slate-200 text-center">Test 1</th>
                  <th className="py-3 px-4 border-b border-slate-200 text-center">Test 2</th>
                  <th className="py-3 px-4 border-b border-slate-200 text-center">Test 3</th>
                  <th className="py-3 px-4 border-b border-slate-200 text-center">Test 4</th>
                  <th className="py-3 px-4 border-b border-slate-200 text-right bg-slate-200/50">Subject Avg</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {SUBJECT_LIST.map((subj) => {
                  const sAvg = student.subject_averages?.[subj] || 0;
                  return (
                    <tr key={subj} className="hover:bg-slate-50">
                      <td className="py-2.5 px-4 font-bold text-slate-900">{subj}</td>
                      <td className="py-2.5 px-4 text-center">{matrix[subj]["Test 1"]}</td>
                      <td className="py-2.5 px-4 text-center">{matrix[subj]["Test 2"]}</td>
                      <td className="py-2.5 px-4 text-center">{matrix[subj]["Test 3"]}</td>
                      <td className="py-2.5 px-4 text-center">{matrix[subj]["Test 4"]}</td>
                      <td className="py-2.5 px-4 text-right font-bold text-slate-900 bg-slate-50/70">
                        {sAvg}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 text-slate-900 font-bold text-xs border-t-2 border-slate-200">
                  <td className="py-2.5 px-4">Test Average</td>
                  <td className="py-2.5 px-4 text-center">{student.test_averages?.["Test 1"]}%</td>
                  <td className="py-2.5 px-4 text-center">{student.test_averages?.["Test 2"]}%</td>
                  <td className="py-2.5 px-4 text-center">{student.test_averages?.["Test 3"]}%</td>
                  <td className="py-2.5 px-4 text-center">{student.test_averages?.["Test 4"]}%</td>
                  <td className="py-2.5 px-4 text-right bg-blue-50 text-blue-900 font-extrabold">
                    {student.overall_average}%
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Visual Charts: Progression Trend and Subject Distribution */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Trend Line Chart */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Continuous Learning Progression
            </h4>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="test" tick={{ fontSize: 11 }} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px' }} />
                  <Line type="monotone" dataKey="score" name="Test Average" stroke="#2563EB" strokeWidth={3} dot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-slate-500 mt-2 text-center">
              Comparison: Tests 1 & 2 vs Tests 3 & 4 defines the <strong>{student.trend}</strong> trajectory.
            </p>
          </div>

          {/* Subject Average Bar Chart */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Subject Competency Profile
            </h4>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={subjectChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="subject" tick={{ fontSize: 9 }} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px' }} />
                  <Bar dataKey="average" name="Average %" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-[10px] text-slate-500 mt-2 text-center">
              Strength: <strong>{student.highest_subject}</strong> • Focus Area: <strong>{student.lowest_subject}</strong>
            </p>
          </div>
        </div>

        {/* Personalized Improvement Suggestions */}
        <div className="p-5 rounded-2xl border border-blue-200 bg-blue-50/40">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900">
              Personalized Improvement Guidance & Academic Action Plan
            </h3>
          </div>
          <div className="space-y-2">
            {student.suggestions && student.suggestions.map((sug, idx) => (
              <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 bg-white p-3 rounded-xl border border-blue-100 shadow-2xs">
                <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{sug}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Signatures & Verification Area for Print */}
        <div className="pt-12 grid grid-cols-3 gap-6 text-center text-xs text-slate-600 border-t border-slate-200">
          <div>
            <div className="h-10 border-b border-slate-400 mb-1"></div>
            <span className="font-semibold text-slate-800">{advisorTitle}</span>
            <p className="text-[10px] text-slate-400">{institutionName}</p>
          </div>

          <div>
            <div className="h-10 border-b border-slate-400 mb-1"></div>
            <span className="font-semibold text-slate-800">{hodTitle}</span>
            <p className="text-[10px] text-slate-400">Academic Review Committee</p>
          </div>

          <div>
            <div className="h-10 border-b border-slate-400 mb-1"></div>
            <span className="font-semibold text-slate-800">Institutional Seal</span>
            <p className="text-[10px] text-slate-400">Official Evaluation Transcript</p>
          </div>
        </div>
      </div>
    </div>
  );
}

