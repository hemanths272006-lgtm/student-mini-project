import React, { useState, useEffect } from 'react';
import { LecturerService } from '../../services/api';
import {
  ClipboardCheck,
  Plus,
  Clock,
  CheckCircle2,
  Trash2,
  AlertCircle
} from 'lucide-react';

export const LecturerTests = () => {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [testForm, setTestForm] = useState({
    title: '',
    subject_id: 4,
    section: 'All',
    duration_minutes: 20,
    total_marks: 20,
    passing_marks: 10,
    questions: [
      {
        question_text: '',
        option_a: '',
        option_b: '',
        option_c: '',
        option_d: '',
        correct_option: 'A',
        explanation: '',
        marks: 2.0
      }
    ]
  });
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadTests();
  }, []);

  const loadTests = async () => {
    try {
      setLoading(true);
      const data = await LecturerService.getTests();
      setTests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddQuestion = () => {
    setTestForm((prev) => ({
      ...prev,
      questions: [
        ...prev.questions,
        {
          question_text: '',
          option_a: '',
          option_b: '',
          option_c: '',
          option_d: '',
          correct_option: 'A',
          explanation: '',
          marks: 2.0
        }
      ]
    }));
  };

  const handleQuestionChange = (index, field, value) => {
    const updated = [...testForm.questions];
    updated[index][field] = value;
    setTestForm({ ...testForm, questions: updated });
  };

  const handleRemoveQuestion = (index) => {
    if (testForm.questions.length <= 1) return;
    const updated = testForm.questions.filter((_, i) => i !== index);
    setTestForm({ ...testForm, questions: updated });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await LecturerService.createTest(testForm);
      setShowModal(false);
      setMessage({ type: 'success', text: 'Online MCQ test published successfully!' });
      loadTests();
      setTestForm({
        title: '',
        subject_id: 4,
        section: 'All',
        duration_minutes: 20,
        total_marks: 20,
        passing_marks: 10,
        questions: [
          {
            question_text: '',
            option_a: '',
            option_b: '',
            option_c: '',
            option_d: '',
            correct_option: 'A',
            explanation: '',
            marks: 2.0
          }
        ]
      });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to create test.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Online MCQ Tests Management</h2>
          <p className="text-sm text-slate-500">
            Publish timed assessments with automated evaluation and instant scoring for students.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-emerald-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Online Test</span>
        </button>
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

      {/* Tests Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full p-16 text-center">
            <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : tests.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400">
            No active tests created yet.
          </div>
        ) : (
          tests.map((t) => (
            <div
              key={t.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-emerald-400 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {t.subject_name}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-500 font-medium">
                    <Clock className="w-3.5 h-3.5" /> {t.duration_minutes} Mins
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-base">{t.title}</h4>
                <div className="grid grid-cols-2 gap-2 mt-4 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 block">Questions</span>
                    <span className="font-bold text-slate-800">{t.questions_count} MCQs</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Total Marks</span>
                    <span className="font-bold text-slate-800">{t.total_marks} Pts</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Passing Marks</span>
                    <span className="font-bold text-slate-800">{t.passing_marks} Pts</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Student Attempts</span>
                    <span className="font-bold text-emerald-700">{t.attempts_count} Taken</span>
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>Section: {t.section}</span>
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Active
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Test Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-100 my-8 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Create Online MCQ Assessment</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Test Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Unit 3: Algorithm Complexity & Tree Traversals"
                  value={testForm.title}
                  onChange={(e) => setTestForm({ ...testForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Subject</label>
                  <select
                    value={testForm.subject_id}
                    onChange={(e) => setTestForm({ ...testForm, subject_id: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value={1}>Mathematics</option>
                    <option value={2}>Science</option>
                    <option value={3}>English</option>
                    <option value={4}>Computer Science</option>
                    <option value={5}>Social Studies</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Section</label>
                  <select
                    value={testForm.section}
                    onChange={(e) => setTestForm({ ...testForm, section: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="All">All Sections</option>
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Duration (Mins)</label>
                  <input
                    type="number"
                    min="5"
                    max="180"
                    value={testForm.duration_minutes}
                    onChange={(e) => setTestForm({ ...testForm, duration_minutes: parseInt(e.target.value) || 20 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Questions Section */}
              <div className="pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-sm text-slate-800">
                    Questions ({testForm.questions.length})
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Question
                  </button>
                </div>

                <div className="space-y-4">
                  {testForm.questions.map((q, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-700">Question {idx + 1}</span>
                        {testForm.questions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemoveQuestion(idx)}
                            className="text-red-500 hover:text-red-700 text-xs"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      <input
                        type="text"
                        required
                        placeholder="Type question prompt here..."
                        value={q.question_text}
                        onChange={(e) => handleQuestionChange(idx, 'question_text', e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                      />

                      <div className="grid grid-cols-2 gap-2">
                        <input
                          type="text"
                          required
                          placeholder="Option A"
                          value={q.option_a}
                          onChange={(e) => handleQuestionChange(idx, 'option_a', e.target.value)}
                          className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                        />
                        <input
                          type="text"
                          required
                          placeholder="Option B"
                          value={q.option_b}
                          onChange={(e) => handleQuestionChange(idx, 'option_b', e.target.value)}
                          className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                        />
                        <input
                          type="text"
                          required
                          placeholder="Option C"
                          value={q.option_c}
                          onChange={(e) => handleQuestionChange(idx, 'option_c', e.target.value)}
                          className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                        />
                        <input
                          type="text"
                          required
                          placeholder="Option D"
                          value={q.option_d}
                          onChange={(e) => handleQuestionChange(idx, 'option_d', e.target.value)}
                          className="px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">
                            Correct Answer
                          </label>
                          <select
                            value={q.correct_option}
                            onChange={(e) => handleQuestionChange(idx, 'correct_option', e.target.value)}
                            className="w-full px-2 py-1 border border-slate-300 rounded-lg text-xs bg-white font-bold"
                          >
                            <option value="A">Option A</option>
                            <option value="B">Option B</option>
                            <option value="C">Option C</option>
                            <option value="D">Option D</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-[11px] font-semibold text-slate-500 mb-0.5">
                            Marks for Question
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="20"
                            step="0.5"
                            value={q.marks}
                            onChange={(e) => handleQuestionChange(idx, 'marks', parseFloat(e.target.value) || 2.0)}
                            className="w-full px-2 py-1 border border-slate-300 rounded-lg text-xs bg-white"
                          />
                        </div>
                      </div>

                      <input
                        type="text"
                        placeholder="Explanation for correct answer (shown after submission)..."
                        value={q.explanation}
                        onChange={(e) => handleQuestionChange(idx, 'explanation', e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs bg-white"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-md shadow-emerald-600/20"
                >
                  Publish Online Test
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

