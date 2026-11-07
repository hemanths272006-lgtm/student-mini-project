import React, { useState, useEffect } from 'react';
import { X, Save, AlertCircle, Sparkles } from 'lucide-react';
import { CategoryBadge } from './Badge';

const SUBJECTS = ["Mathematics", "Science", "English", "Computer Science", "Social Studies"];
const TESTS = ["Test 1", "Test 2", "Test 3", "Test 4"];

export default function StudentModal({ isOpen, onClose, onSave, student = null }) {
  const isEdit = !!student;

  const [formData, setFormData] = useState({
    usn: '',
    name: '',
    section: 'A',
    semester: 4,
    attendance: 85.0,
  });

  // Marks matrix: { "Mathematics": { "Test 1": 75, ... }, ... }
  const [marksMatrix, setMarksMatrix] = useState({});
  const [activeTestTab, setActiveTestTab] = useState('Test 1');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (student) {
      setFormData({
        usn: student.usn || '',
        name: student.name || '',
        section: student.section || 'A',
        semester: student.semester || 4,
        attendance: student.attendance !== undefined ? student.attendance : 85.0,
      });

      // Populate existing marks if any
      const matrix = {};
      SUBJECTS.forEach((sub) => {
        matrix[sub] = {};
        TESTS.forEach((t) => {
          matrix[sub][t] = 65.0; // default fallback
        });
      });

      if (student.marks && Array.isArray(student.marks)) {
        student.marks.forEach((m) => {
          const sName = m.subject_name || m.subject;
          const tName = m.assessment_name || m.test;
          if (matrix[sName] && matrix[sName][tName] !== undefined) {
            matrix[sName][tName] = m.score;
          }
        });
      }
      setMarksMatrix(matrix);
    } else {
      // Fresh new student
      setFormData({
        usn: '',
        name: '',
        section: 'A',
        semester: 4,
        attendance: 85.0,
      });
      const matrix = {};
      SUBJECTS.forEach((sub) => {
        matrix[sub] = {};
        TESTS.forEach((t) => {
          matrix[sub][t] = 70.0;
        });
      });
      setMarksMatrix(matrix);
    }
    setError('');
  }, [student, isOpen]);

  if (!isOpen) return null;

  // Calculate live average
  let totalScore = 0;
  let count = 0;
  SUBJECTS.forEach((s) => {
    TESTS.forEach((t) => {
      const val = parseFloat(marksMatrix[s]?.[t]);
      if (!isNaN(val)) {
        totalScore += val;
        count += 1;
      }
    });
  });
  const liveAvg = count > 0 ? (totalScore / count).toFixed(1) : 0;
  let liveCategory = 'Slow Learner';
  if (liveAvg >= 75) liveCategory = 'Fast Learner';
  else if (liveAvg >= 50) liveCategory = 'Average Learner';

  const handleMarkChange = (subject, test, val) => {
    const num = parseFloat(val);
    setMarksMatrix((prev) => ({
      ...prev,
      [subject]: {
        ...prev[subject],
        [test]: isNaN(num) ? '' : num,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) {
      setError('Please provide student name.');
      return;
    }
    if (!formData.usn.trim()) {
      setError('Please provide valid USN.');
      return;
    }
    if (formData.attendance < 0 || formData.attendance > 100) {
      setError('Attendance must be between 0% and 100%.');
      return;
    }

    // Flatten marks matrix to array of MarkItem
    const marksArray = [];
    for (const sub of SUBJECTS) {
      for (const t of TESTS) {
        const score = parseFloat(marksMatrix[sub]?.[t]);
        if (isNaN(score) || score < 0 || score > 100) {
          setError(`Invalid mark for ${sub} in ${t}. Score must be between 0 and 100.`);
          return;
        }
        marksArray.push({
          subject: sub,
          test: t,
          score: score,
        });
      }
    }

    setLoading(true);
    try {
      await onSave({
        ...formData,
        marks: marksArray,
      });
      onClose();
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Error saving student');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-3xl my-8 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold tracking-tight">
              {isEdit ? 'Edit Student Details' : 'Add New Student'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {isEdit ? `Modifying records for USN: ${student.usn}` : 'Register a student and enter assessment marks'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Student Basic Information Grid */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              1. Student Basic Information
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Student Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Aarav Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  USN (University Seat No) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  disabled={isEdit}
                  placeholder="e.g. 1MS24CS201"
                  value={formData.usn}
                  onChange={(e) => setFormData({ ...formData, usn: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all disabled:opacity-60 disabled:cursor-not-allowed uppercase font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Section <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.section}
                  onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                >
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="C">Section C</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Semester
                </label>
                <input
                  type="number"
                  min="1"
                  max="8"
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: parseInt(e.target.value) || 4 })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Attendance Percentage (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  value={formData.attendance}
                  onChange={(e) => setFormData({ ...formData, attendance: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>

              {/* Live Preview Card */}
              <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3 flex flex-col justify-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Live Classification
                </span>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-lg font-extrabold text-blue-950">{liveAvg}%</span>
                  <CategoryBadge category={liveCategory} size="sm" />
                </div>
              </div>
            </div>
          </div>

          {/* Marks Entry Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                2. Assessment Marks (Out of 100)
              </h4>
              <div className="flex gap-1 bg-slate-100 p-1 rounded-lg">
                {TESTS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setActiveTestTab(t)}
                    className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                      activeTestTab === t
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {SUBJECTS.map((sub) => {
                  const currentScore = marksMatrix[sub]?.[activeTestTab] ?? 70;
                  return (
                    <div key={sub} className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                      <label className="block text-xs font-medium text-slate-700 mb-1 truncate">
                        {sub}
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max="100"
                          value={currentScore}
                          onChange={(e) => handleMarkChange(sub, activeTestTab, e.target.value)}
                          className="w-full px-3 py-1.5 text-sm font-semibold text-slate-900 bg-slate-50 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                        />
                        <span className="absolute right-3 top-2 text-xs text-slate-400">/ 100</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </form>

        {/* Footer Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-500/20 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Student'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

