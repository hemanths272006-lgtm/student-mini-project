import React, { useState, useEffect } from 'react';
import { LecturerService } from '../../services/api';
import {
  FileSpreadsheet,
  Save,
  Search,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const LecturerMarks = () => {
  const [section, setSection] = useState('A');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [marksGrid, setMarksGrid] = useState({});
  const [message, setMessage] = useState(null);

  const subjects = ['Mathematics', 'Science', 'English', 'Computer Science', 'Social Studies'];
  const assessments = ['Test 1', 'Test 2', 'Test 3', 'Test 4'];

  useEffect(() => {
    loadStudents();
  }, [section]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      const res = await LecturerService.getStudents({ section });
      setStudents(res);
      if (res.length > 0) {
        selectStudent(res[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const selectStudent = (st) => {
    setSelectedStudent(st);
    // Build marks lookup
    const grid = {};
    st.marks_matrix?.forEach((m) => {
      grid[`${m.subject_name}_${m.assessment_name}`] = m.score;
    });
    setMarksGrid(grid);
  };

  const handleScoreChange = (sub, ass, val) => {
    const num = Math.min(100, Math.max(0, parseFloat(val) || 0));
    setMarksGrid((prev) => ({
      ...prev,
      [`${sub}_${ass}`]: num
    }));
  };

  const handleSaveMarks = async () => {
    if (!selectedStudent) return;
    try {
      setSaving(true);
      const marksList = [];
      subjects.forEach((sub) => {
        assessments.forEach((ass) => {
          const key = `${sub}_${ass}`;
          if (marksGrid[key] !== undefined) {
            marksList.push({
              subject: sub,
              test: ass,
              score: marksGrid[key]
            });
          }
        });
      });

      await LecturerService.saveMarks({
        student_id: selectedStudent.id,
        marks: marksList
      });

      setMessage({ type: 'success', text: `Marks for ${selectedStudent.name} saved successfully.` });
      loadStudents();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update marks.' });
    } finally {
      setSaving(false);
    }
  };

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
          <h2 className="text-xl font-bold text-slate-900">Student Marks Evaluation & Entry</h2>
          <p className="text-sm text-slate-500">
            Record continuous assessment scores (out of 100) across Test 1, Test 2, Test 3, and Test 4.
          </p>
        </div>

        {/* Section Picker */}
        <div className="flex items-center gap-2">
          {['A', 'B', 'C'].map((s) => (
            <button
              key={s}
              onClick={() => setSection(s)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                section === s
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              Section {s} (60 Students)
            </button>
          ))}
        </div>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl flex items-center gap-2 text-sm ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {loading ? (
        <div className="p-16 text-center">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Student List (Section Roster) */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col h-[650px]">
            <div className="relative mb-3">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Filter by name or USN..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none"
              />
            </div>
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {filteredStudents.map((st) => (
                <div
                  key={st.id}
                  onClick={() => selectStudent(st)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedStudent?.id === st.id
                      ? 'border-emerald-600 bg-emerald-50/60 shadow-sm'
                      : 'border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-slate-900 text-sm">{st.name}</p>
                    <span className="font-bold text-xs text-slate-700">{st.overall_average}%</span>
                  </div>
                  <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
                    <span className="font-mono">{st.usn}</span>
                    <span
                      className={`font-semibold ${
                        st.category === 'Fast Learner'
                          ? 'text-emerald-600'
                          : st.category === 'Average Learner'
                          ? 'text-blue-600'
                          : 'text-red-600'
                      }`}
                    >
                      {st.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Marks Grid */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
            {selectedStudent ? (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 mb-6 gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{selectedStudent.name}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      USN: <span className="font-mono font-semibold text-slate-800">{selectedStudent.usn}</span> &bull; Section {selectedStudent.section} &bull; Semester {selectedStudent.semester}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-bold text-slate-400">Current Average</p>
                      <p className="text-xl font-extrabold text-emerald-700">{selectedStudent.overall_average}%</p>
                    </div>
                    <button
                      onClick={handleSaveMarks}
                      disabled={saving}
                      className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
                    >
                      <Save className="w-4 h-4" />
                      <span>{saving ? 'Saving...' : 'Save Evaluated Marks'}</span>
                    </button>
                  </div>
                </div>

                {/* Editable Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
                      <tr>
                        <th className="px-4 py-3">Subject Name</th>
                        {assessments.map((ass) => (
                          <th key={ass} className="px-4 py-3 text-center">
                            {ass} (100)
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {subjects.map((sub) => (
                        <tr key={sub} className="hover:bg-slate-50/50">
                          <td className="px-4 py-3.5 font-semibold text-slate-900">{sub}</td>
                          {assessments.map((ass) => {
                            const val = marksGrid[`${sub}_${ass}`] ?? 0;
                            return (
                              <td key={ass} className="px-4 py-3.5 text-center">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="0.5"
                                  value={val}
                                  onChange={(e) => handleScoreChange(sub, ass, e.target.value)}
                                  className={`w-20 text-center py-1.5 px-2 rounded-lg border font-bold text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                                    val >= 75
                                      ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                                      : val >= 50
                                      ? 'border-blue-300 bg-blue-50 text-blue-800'
                                      : 'border-red-300 bg-red-50 text-red-800'
                                  }`}
                                />
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-6 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center justify-between">
                  <span>Changes made will automatically recalculate learner classification and performance trends.</span>
                  <span className="font-semibold text-emerald-700">Max Score: 100</span>
                </div>
              </div>
            ) : (
              <div className="p-16 text-center text-slate-400">Select a student from the list to enter marks.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

