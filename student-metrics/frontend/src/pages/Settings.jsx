import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Database,
  RotateCcw,
  Download,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Code2,
  BookOpen,
  Building,
  Save
} from 'lucide-react';
import { StudentService } from '../services/api';

const DEFAULT_INSTITUTION = {
  institutionName: "Department of Computer Science & Engineering",
  collegeName: "College of Engineering & Technology",
  academicYear: "2026-2027",
  programName: "Bachelor of Engineering (B.E.)",
  advisorTitle: "Class Advisor",
  hodTitle: "Head of Department (HOD)",
};

export default function Settings() {
  const [resetLoading, setResetLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Institutional Details state (persisted in localStorage)
  const [institution, setInstitution] = useState(DEFAULT_INSTITUTION);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('institution_settings');
    if (saved) {
      try {
        setInstitution({ ...DEFAULT_INSTITUTION, ...JSON.parse(saved) });
      } catch (e) {}
    }
  }, []);

  const handleSaveInstitution = (e) => {
    e.preventDefault();
    localStorage.setItem('institution_settings', JSON.stringify(institution));
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  const handleResetData = async () => {
    if (!window.confirm("Are you sure you want to re-seed the database? This will restore the pristine 180 students across Sections A, B, and C with fresh assessment marks.")) {
      return;
    }

    setResetLoading(true);
    setMessage('');
    setError('');
    try {
      const res = await StudentService.resetSampleData();
      setMessage(res.message || 'Database successfully reset and re-seeded with 180 students!');
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Reset failed.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center">
            <SettingsIcon className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">System Settings & Rules Engine</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure classification criteria, customize college headers, and manage database seeding.
            </p>
          </div>
        </div>
      </div>

      {message && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2 font-medium">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Institutional Details Customizer Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-blue-600" />
            <div>
              <h2 className="text-base font-bold text-slate-900">Institutional & Report Branding</h2>
              <p className="text-xs text-slate-500">Customize the college name and department shown on the printable reports and header.</p>
            </div>
          </div>
          {saveSuccess && (
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Saved!
            </span>
          )}
        </div>

        <form onSubmit={handleSaveInstitution} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Department / Header Name</label>
            <input
              type="text"
              value={institution.institutionName}
              onChange={(e) => setInstitution({ ...institution, institutionName: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">College / University Name</label>
            <input
              type="text"
              value={institution.collegeName}
              onChange={(e) => setInstitution({ ...institution, collegeName: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Academic Year</label>
            <input
              type="text"
              value={institution.academicYear}
              onChange={(e) => setInstitution({ ...institution, academicYear: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Degree / Program</label>
            <input
              type="text"
              value={institution.programName}
              onChange={(e) => setInstitution({ ...institution, programName: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Advisor Signature Title</label>
            <input
              type="text"
              value={institution.advisorTitle}
              onChange={(e) => setInstitution({ ...institution, advisorTitle: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">HOD Signature Title</label>
            <input
              type="text"
              value={institution.hodTitle}
              onChange={(e) => setInstitution({ ...institution, hodTitle: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white"
            />
          </div>

          <div className="md:col-span-2 flex justify-end pt-2">
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs shadow-sm shadow-blue-500/20 transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Update Institutional Branding</span>
            </button>
          </div>
        </form>
      </div>

      {/* Classification Rules Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <h2 className="text-base font-bold text-slate-900">Learner Classification Rules Engine</h2>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          The system evaluates each student using all stored subject and test marks. The classification parameters are transparent and computed in real-time by the backend.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Fast Learner */}
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-800">Fast Learner</span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            </div>
            <div className="text-2xl font-extrabold text-emerald-950">≥ 75%</div>
            <p className="text-[11px] text-emerald-700 mt-2">
              Consistently demonstrates mastery in concepts. Eligible for competitive projects and advanced seminar mentorship.
            </p>
          </div>

          {/* Average Learner */}
          <div className="p-4 rounded-xl border border-blue-200 bg-blue-50/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-blue-800">Average Learner</span>
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            </div>
            <div className="text-2xl font-extrabold text-blue-950">50% to 74%</div>
            <p className="text-[11px] text-blue-700 mt-2">
              Meets standard curricular learning objectives with steady progress. Guided towards targeted subject weaknesses.
            </p>
          </div>

          {/* Slow Learner */}
          <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-rose-800">Slow Learner</span>
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            </div>
            <div className="text-2xl font-extrabold text-rose-950">&lt; 50%</div>
            <p className="text-[11px] text-rose-700 mt-2">
              Flagged for academic intervention. Automatically enrolled in remedial mentoring and weekly progress reviews.
            </p>
          </div>
        </div>

        {/* Learning Trend Formula */}
        <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 text-xs text-slate-700 space-y-1.5">
          <span className="font-bold text-slate-900 block text-xs">Learning Trend Formula:</span>
          <p className="text-[11px] text-slate-600">
            Trajectory difference is computed as: <code className="bg-white px-2 py-0.5 rounded border border-slate-300 font-mono text-blue-700 font-bold">Δ = (Test 3 + Test 4)/2 - (Test 1 + Test 2)/2</code>
          </p>
          <ul className="text-[11px] text-slate-500 list-disc list-inside space-y-0.5 pt-1">
            <li><strong>Improving:</strong> Δ &gt; +2.0% score progression</li>
            <li><strong>Declining:</strong> Δ &lt; -2.0% score progression</li>
            <li><strong>Consistent:</strong> -2.0% ≤ Δ ≤ +2.0% score progression</li>
          </ul>
        </div>
      </div>

      {/* Database Management Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-blue-600" />
          <h2 className="text-base font-bold text-slate-900">Database & Data Integrity</h2>
        </div>
        <p className="text-xs text-slate-500">
          Manage the SQLite relational store with tables: <code className="font-mono text-slate-800">students</code>, <code className="font-mono text-slate-800">subjects</code>, <code className="font-mono text-slate-800">assessments</code>, and <code className="font-mono text-slate-800">marks</code>.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          {/* Re-seed button */}
          <button
            onClick={handleResetData}
            disabled={resetLoading}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-blue-500/20 transition-all disabled:opacity-50"
          >
            <RotateCcw className={`w-4 h-4 ${resetLoading ? 'animate-spin' : ''}`} />
            <span>{resetLoading ? 'Re-seeding...' : 'Reset & Re-Seed 180 Students'}</span>
          </button>

          {/* Export CSV button */}
          <button
            onClick={() => window.open(StudentService.getExportCSVUrl(), '_blank')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition-colors"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Export Complete Dataset (CSV)</span>
          </button>

          {/* Download Sample CSV */}
          <button
            onClick={() => window.open(StudentService.getSampleCSVUrl(), '_blank')}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition-colors"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Download CSV Template</span>
          </button>
        </div>
      </div>

      {/* Technology Stack Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Code2 className="w-5 h-5 text-blue-600" />
          <h2 className="text-base font-bold text-slate-900">College Mini Project Architecture</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="font-bold text-slate-900 block text-xs uppercase tracking-wider text-blue-700">Frontend Technology</span>
            <ul className="space-y-1 text-slate-600">
              <li>• <strong>Framework:</strong> React.js 18 + Vite</li>
              <li>• <strong>Styling:</strong> Tailwind CSS</li>
              <li>• <strong>Data Visualizations:</strong> Recharts (Bar, Line, Donut)</li>
              <li>• <strong>Client Routing:</strong> React Router Dom v6</li>
              <li>• <strong>HTTP Client:</strong> Axios</li>
              <li>• <strong>Iconography:</strong> Lucide React</li>
            </ul>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="font-bold text-slate-900 block text-xs uppercase tracking-wider text-blue-700">Backend Technology</span>
            <ul className="space-y-1 text-slate-600">
              <li>• <strong>Server:</strong> Python 3.13 + FastAPI</li>
              <li>• <strong>ORM & DB:</strong> SQLAlchemy 2.0 + SQLite</li>
              <li>• <strong>Analytics Engine:</strong> Pandas + NumPy</li>
              <li>• <strong>Validation:</strong> Pydantic v2</li>
              <li>• <strong>Bulk Ingestion:</strong> Python multipart + CSV Streaming</li>
              <li>• <strong>Documentation:</strong> OpenAPI & Swagger UI</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
