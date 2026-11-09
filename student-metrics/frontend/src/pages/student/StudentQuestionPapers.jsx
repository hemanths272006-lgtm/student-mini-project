import React, { useState, useEffect } from 'react';
import { StudentPortalService } from '../../services/api';
import {
  FileArchive,
  Download,
  Calendar,
  BookOpen,
  ExternalLink
} from 'lucide-react';

export const StudentQuestionPapers = () => {
  const [papers, setPapers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subjectId, setSubjectId] = useState('');
  const [academicYear, setAcademicYear] = useState('');

  useEffect(() => {
    loadPapers();
  }, [subjectId, academicYear]);

  const loadPapers = async () => {
    try {
      setLoading(true);
      const params = {};
      if (subjectId) params.subject_id = subjectId;
      if (academicYear) params.academic_year = academicYear;
      const data = await StudentPortalService.getPreviousPapers(params);
      setPapers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Previous Year Question Papers</h2>
          <p className="text-sm text-slate-500">
            Access past semester and university examination papers for exam preparation.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <select
            value={academicYear}
            onChange={(e) => setAcademicYear(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
          >
            <option value="">All Years</option>
            <option value="2025">2025</option>
            <option value="2024">2024</option>
            <option value="2023">2023</option>
          </select>

          <select
            value={subjectId}
            onChange={(e) => setSubjectId(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
          >
            <option value="">All Subjects</option>
            <option value="1">Mathematics</option>
            <option value="2">Science</option>
            <option value="3">English</option>
            <option value="4">Computer Science</option>
            <option value="5">Social Studies</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : papers.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400">
          No previous year papers found matching your criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {papers.map((p) => (
            <div
              key={p.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-indigo-400 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {p.subject_name}
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-700 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {p.academic_year}
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 text-base">{p.title}</h4>
                <p className="text-xs text-slate-500 mt-1">Semester {p.semester} &bull; University Model Paper</p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <a
                  href={p.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Download Paper (PDF)</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

