import React, { useState, useEffect } from 'react';
import { LecturerService, UploadService } from '../../services/api';
import {
  BookOpen,
  Plus,
  ExternalLink,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export const LecturerMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subject_id: 4,
    section: 'All',
    learner_category: 'Slow Learner',
    material_type: 'Notes',
    file_url: '',
    description: ''
  });
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      const data = await LecturerService.getMaterials();
      setMaterials(data);
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
      setMessage({ type: 'success', text: `Uploaded '${file.name}'.` });
    } catch (err) {
      setMessage({ type: 'error', text: 'Upload failed.' });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.file_url) {
      setMessage({ type: 'error', text: 'Please upload a study file.' });
      return;
    }
    try {
      await LecturerService.createMaterial(formData);
      setShowModal(false);
      setMessage({ type: 'success', text: 'Study material uploaded successfully.' });
      loadMaterials();
      setFormData({
        title: '',
        subject_id: 4,
        section: 'All',
        learner_category: 'Slow Learner',
        material_type: 'Notes',
        file_url: '',
        description: ''
      });
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to save material.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Faculty Study Materials & Targeted Resources</h2>
          <p className="text-sm text-slate-500">
            Publish remedial guides for Slow Learners, standard notes for Average Learners, and advanced exercises for Fast Learners.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-emerald-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Upload New Resource</span>
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

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full p-16 text-center">
            <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : materials.length === 0 ? (
          <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400">
            No study materials uploaded yet.
          </div>
        ) : (
          materials.map((m) => (
            <div
              key={m.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-emerald-400 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
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
                <h4 className="font-bold text-slate-900 text-base leading-snug">{m.title}</h4>
                <p className="text-xs text-slate-500 mt-2 line-clamp-2">{m.description || 'No description provided.'}</p>
                <div className="flex items-center gap-2 mt-3 text-xs text-slate-400">
                  <span className="font-medium text-slate-600">{m.material_type}</span>
                  <span>&bull;</span>
                  <span>Section {m.section}</span>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                <a
                  href={m.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:text-emerald-700"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Access Material</span>
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Upload Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Upload Study Material</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Resource Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Remedial Algebra & Calculus Cheatsheet"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Subject</label>
                  <select
                    value={formData.subject_id}
                    onChange={(e) => setFormData({ ...formData, subject_id: parseInt(e.target.value) })}
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
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Target Section</label>
                  <select
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="All">All Sections</option>
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Target Learner Category</label>
                  <select
                    value={formData.learner_category}
                    onChange={(e) => setFormData({ ...formData, learner_category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Slow Learner">Slow Learners (&lt; 50% - Remedial)</option>
                    <option value="Average Learner">Average Learners (50-74%)</option>
                    <option value="Fast Learner">Fast Learners (&ge; 75% - Advanced)</option>
                    <option value="All">All Learners</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Material Type</label>
                  <select
                    value={formData.material_type}
                    onChange={(e) => setFormData({ ...formData, material_type: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Notes">Lecture Notes / Handout</option>
                    <option value="Exercise">Practice Problem Set</option>
                    <option value="Question Paper">Model Question Paper</option>
                    <option value="Study Schedule">Structured Revision Guide</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Select File (PDF / Image)</label>
                <input
                  type="file"
                  onChange={handleFileUpload}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700"
                />
                {uploading && <p className="text-xs text-emerald-600 mt-1">Uploading file...</p>}
                {formData.file_url && (
                  <p className="text-xs text-emerald-700 mt-1 truncate">Ready: {formData.file_url}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Key concepts covered..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-semibold shadow-md shadow-emerald-600/20 disabled:opacity-50"
                >
                  Upload & Assign
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

