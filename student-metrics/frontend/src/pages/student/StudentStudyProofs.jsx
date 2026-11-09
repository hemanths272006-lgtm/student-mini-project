import React, { useState, useEffect } from 'react';
import { StudentPortalService, UploadService } from '../../services/api';
import {
  UploadCloud,
  FileCheck2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Clock,
  Plus,
  ExternalLink,
  AlertCircle
} from 'lucide-react';

export const StudentStudyProofs = () => {
  const [proofs, setProofs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subject_id: 1,
    description: '',
    file_url: '',
    study_duration_minutes: 60
  });
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadProofs();
  }, []);

  const loadProofs = async () => {
    try {
      setLoading(true);
      const data = await StudentPortalService.getProofs();
      setProofs(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setUploading(true);
      const res = await UploadService.uploadFile(file);
      setFormData((prev) => ({ ...prev, file_url: res.url }));
      setMessage({ type: 'success', text: `Uploaded evidence '${file.name}'.` });
    } catch (err) {
      setMessage({ type: 'error', text: 'Upload failed.' });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.file_url) {
      setMessage({ type: 'error', text: 'Please attach study notes / proof evidence.' });
      return;
    }
    try {
      await StudentPortalService.submitProof(formData);
      setShowModal(false);
      setMessage({ type: 'success', text: 'Study proof submitted! Awaiting lecturer review.' });
      loadProofs();
      setFormData({
        title: '',
        subject_id: 1,
        description: '',
        file_url: '',
        study_duration_minutes: 60
      });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to submit proof.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Study Proofs & Homework Submissions</h2>
          <p className="text-sm text-slate-500">
            Upload pictures or PDFs of your practice notes and problem sets for verified faculty credit.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Submit New Study Proof</span>
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

      {/* Proofs List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full p-16 text-center">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : proofs.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400">
            No study proofs uploaded yet. Click 'Submit New Study Proof' above.
          </div>
        ) : (
          proofs.map((p) => (
            <div
              key={p.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-indigo-400 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {p.subject_name}
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${
                      p.status === 'Verified'
                        ? 'bg-emerald-100 text-emerald-800'
                        : p.status === 'Pending'
                        ? 'bg-amber-100 text-amber-800'
                        : p.status === 'Resubmission Required'
                        ? 'bg-orange-100 text-orange-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {p.status === 'Verified' && <CheckCircle2 className="w-3.5 h-3.5" />}
                    {p.status === 'Pending' && <Clock className="w-3.5 h-3.5" />}
                    {p.status === 'Resubmission Required' && <RotateCcw className="w-3.5 h-3.5" />}
                    {p.status === 'Rejected' && <XCircle className="w-3.5 h-3.5" />}
                    <span>{p.status}</span>
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 text-base">{p.title}</h4>
                <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">{p.description}</p>

                <div className="flex items-center gap-2 mt-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {p.study_duration_minutes} Mins
                  </span>
                  <span>&bull;</span>
                  <span>{new Date(p.created_at).toLocaleDateString()}</span>
                </div>

                {/* Faculty Feedback Note */}
                {p.feedback && (
                  <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <span className="font-bold text-slate-700 block mb-0.5">Faculty Feedback:</span>
                    <span className="text-slate-600">{p.feedback}</span>
                  </div>
                )}
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <a
                  href={p.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>View Attached Proof</span>
                </a>
                {p.verified_by_name && (
                  <span className="text-[11px] text-slate-400">By: {p.verified_by_name}</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Submission Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Upload Study Proof</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Study Session Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Solved 10 Binary Tree Problems"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Subject</label>
                  <select
                    value={formData.subject_id}
                    onChange={(e) => setFormData({ ...formData, subject_id: parseInt(e.target.value) })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value={1}>Mathematics</option>
                    <option value={2}>Science</option>
                    <option value={3}>English</option>
                    <option value={4}>Computer Science</option>
                    <option value={5}>Social Studies</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    min="15"
                    max="600"
                    value={formData.study_duration_minutes}
                    onChange={(e) => setFormData({ ...formData, study_duration_minutes: parseInt(e.target.value) || 60 })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Upload Work Photo or PDF</label>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700"
                />
                {uploading && <p className="text-xs text-indigo-600 mt-1">Uploading document...</p>}
                {formData.file_url && (
                  <p className="text-xs text-emerald-700 mt-1 truncate">Ready: {formData.file_url}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Notes / Summary of Work</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Explain what topics you covered and problems solved..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
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
                  disabled={uploading}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-md shadow-indigo-600/20 disabled:opacity-50"
                >
                  Submit for Credit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

