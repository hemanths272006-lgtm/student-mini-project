import React, { useState, useEffect } from 'react';
import { StudentPortalService } from '../../services/api';
import {
  BookOpenCheck,
  ExternalLink,
  Filter,
  CheckCircle2,
  FileText
} from 'lucide-react';

export const StudentMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [studentCategory, setStudentCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [showAllLevels, setShowAllLevels] = useState(false);

  useEffect(() => {
    loadMaterials();
  }, [selectedSubject, showAllLevels]);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedSubject) params.subject_id = selectedSubject;
      if (showAllLevels) params.all_levels = true;

      const res = await StudentPortalService.getMaterials(params);
      setMaterials(res.materials || []);
      setStudentCategory(res.student_category || '');
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
          <h2 className="text-xl font-bold text-slate-900">Study Materials & Notes</h2>
          <p className="text-sm text-slate-500">
            Curated lecture notes and problem sets matched to your learner classification.
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none"
          >
            <option value="">All Subjects</option>
            <option value="1">Mathematics</option>
            <option value="2">Science</option>
            <option value="3">English</option>
            <option value="4">Computer Science</option>
            <option value="5">Social Studies</option>
          </select>

          <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-white px-3 py-2 border border-slate-200 rounded-xl cursor-pointer">
            <input
              type="checkbox"
              checked={showAllLevels}
              onChange={(e) => setShowAllLevels(e.target.checked)}
              className="rounded text-indigo-600 focus:ring-indigo-500"
            />
            <span>Show All Categories</span>
          </label>
        </div>
      </div>

      {studentCategory && !showAllLevels && (
        <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between text-xs text-indigo-900">
          <span>
            Showing resources customized for <strong>{studentCategory}</strong>.
          </span>
          <span className="font-semibold text-indigo-700">Targeted Learning</span>
        </div>
      )}

      {loading ? (
        <div className="p-16 text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : materials.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400">
          No resources found matching the filter. Try checking 'Show All Categories'.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {materials.map((m) => (
            <div
              key={m.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-indigo-400 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {m.subject_name}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      m.learner_category === 'Fast Learner'
                        ? 'bg-emerald-100 text-emerald-800'
                        : m.learner_category === 'Slow Learner'
                        ? 'bg-red-100 text-red-800'
                        : m.learner_category === 'Average Learner'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {m.learner_category}
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 text-base">{m.title}</h4>
                <p className="text-xs text-slate-500 mt-2 line-clamp-2">{m.description || 'Reference study resource.'}</p>
                <div className="flex items-center gap-2 mt-3 text-xs text-slate-400">
                  <span className="font-medium text-slate-600">{m.material_type}</span>
                  <span>&bull;</span>
                  <span>By: {m.uploader_name}</span>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <a
                  href={m.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Download / View Resource</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

