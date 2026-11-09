import React, { useState, useEffect } from 'react';
import { StudentPortalService } from '../../services/api';
import {
  Award,
  TrendingUp,
  Printer,
  School,
  CheckCircle2,
  Calendar,
  AlertTriangle
} from 'lucide-react';

export const StudentReportCard = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReportCard();
  }, []);

  const loadReportCard = async () => {
    try {
      setLoading(true);
      const data = await StudentPortalService.getPrivateReportCard();
      setReport(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading || !report) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { student } = report;
  const marksMatrix = student.marks_matrix || [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Action Header */}
      <div className="flex items-center justify-between no-print">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Official Student Performance Report</h2>
          <p className="text-sm text-slate-500">
            Verified academic report card generated from continuous assessments.
          </p>
        </div>
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-600/20"
        >
          <Printer className="w-4 h-4" />
          <span>Print Official Report</span>
        </button>
      </div>

      {/* Printable Report Card Container */}
      <div className="bg-white p-8 sm:p-10 rounded-2xl border border-slate-300 shadow-lg print:shadow-none print:border-none print:p-0">
        {/* Institutional Header */}
        <div className="text-center pb-6 border-b-2 border-slate-900">
          <div className="flex items-center justify-center gap-3 mb-2">
            <School className="w-8 h-8 text-indigo-800" />
            <h1 className="text-2xl font-black text-slate-900 uppercase tracking-wide">
              {report.institution_name}
            </h1>
          </div>
          <p className="text-sm font-bold text-slate-700 uppercase tracking-wider">{report.department}</p>
          <p className="text-xs text-slate-500 mt-1">ACADEMIC YEAR: {report.academic_year} &bull; CONTINUOUS ASSESSMENT TRANSCRIPT</p>
        </div>

        {/* Student Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-slate-200 text-sm">
          <div>
            <span className="text-xs font-semibold text-slate-400 block uppercase">Student Name</span>
            <span className="font-bold text-slate-900 text-base">{student.name}</span>
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 block uppercase">University Seat No (USN)</span>
            <span className="font-mono font-bold text-indigo-700 text-base">{student.usn}</span>
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 block uppercase">Section & Semester</span>
            <span className="font-bold text-slate-900 text-base">Section {student.section} &bull; Sem {student.semester}</span>
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 block uppercase">Attendance Rate</span>
            <span className="font-bold text-emerald-700 text-base">{student.attendance}%</span>
          </div>
        </div>

        {/* Classification & Summary Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500 uppercase font-semibold">Cumulative Score</span>
            <h4 className="text-3xl font-extrabold text-slate-900 mt-1">{student.overall_average}%</h4>
            <p className="text-xs text-slate-400 mt-0.5">Average of all 4 assessments</p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500 uppercase font-semibold">Learner Classification</span>
            <div className="mt-1">
              <span
                className={`inline-block px-3 py-1 rounded-full text-sm font-extrabold ${
                  student.category === 'Fast Learner'
                    ? 'bg-emerald-100 text-emerald-800'
                    : student.category === 'Average Learner'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-red-100 text-red-800'
                }`}
              >
                {student.category}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1.5">
              {student.category === 'Fast Learner' ? 'Average \u2265 75%' : student.category === 'Average Learner' ? '50% \u2264 Avg < 75%' : 'Average < 50%'}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs text-slate-500 uppercase font-semibold">Learning Trajectory</span>
            <h4 className={`text-xl font-bold mt-1 ${
              student.trend === 'Improving' ? 'text-emerald-700' : student.trend === 'Declining' ? 'text-red-700' : 'text-slate-800'
            }`}>
              {student.trend}
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">Tests (1 & 2) vs (3 & 4)</p>
          </div>
        </div>

        {/* Assessment Marks Matrix Table */}
        <div className="my-6">
          <h3 className="font-bold text-sm text-slate-900 uppercase tracking-wider mb-3">
            Subject-Wise Assessment Matrix
          </h3>
          <div className="border border-slate-300 rounded-xl overflow-hidden">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-100 border-b border-slate-300 text-xs font-bold uppercase text-slate-700">
                <tr>
                  <th className="px-4 py-3">Subject Name</th>
                  <th className="px-4 py-3 text-center">Test 1 (100)</th>
                  <th className="px-4 py-3 text-center">Test 2 (100)</th>
                  <th className="px-4 py-3 text-center">Test 3 (100)</th>
                  <th className="px-4 py-3 text-center">Test 4 (100)</th>
                  <th className="px-4 py-3 text-right">Subject Avg</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {marksMatrix.map((sub) => (
                  <tr key={sub.subject_id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-semibold text-slate-900">{sub.subject_name}</td>
                    <td className="px-4 py-3 text-center font-mono font-medium">{sub.tests['Test 1']}</td>
                    <td className="px-4 py-3 text-center font-mono font-medium">{sub.tests['Test 2']}</td>
                    <td className="px-4 py-3 text-center font-mono font-medium">{sub.tests['Test 3']}</td>
                    <td className="px-4 py-3 text-center font-mono font-medium">{sub.tests['Test 4']}</td>
                    <td className="px-4 py-3 text-right font-bold text-slate-900">{sub.subject_average}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Subject Strengths & Focus Areas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Highest Scoring Subject</span>
            <p className="text-base font-bold text-emerald-950 mt-1">{student.highest_subject} ({student.highest_score}%)</p>
          </div>
          <div className="p-4 rounded-xl bg-red-50/60 border border-red-200">
            <span className="text-xs font-bold uppercase tracking-wider text-red-800">Subject Requiring Focus</span>
            <p className="text-base font-bold text-red-950 mt-1">{student.lowest_subject} ({student.lowest_score}%)</p>
          </div>
        </div>

        {/* Personalized Improvement Suggestions */}
        <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 my-6">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 mb-2">
            Actionable Academic Recommendations
          </h4>
          <ul className="space-y-1.5 text-xs text-slate-600">
            {student.suggestions?.map((sug, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-indigo-600 font-bold">&bull;</span>
                <span>{sug}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Institutional Signature & Timestamp */}
        <div className="pt-8 border-t border-slate-300 flex items-end justify-between mt-8 text-xs text-slate-500">
          <div>
            <p>Generated: {report.generated_at}</p>
            <p className="text-[10px] text-slate-400 mt-0.5">System Authenticated Academic Record</p>
          </div>

          <div className="text-center">
            <div className="w-48 border-b border-slate-900 mb-1"></div>
            <p className="font-bold text-slate-800">{report.signature_title}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

