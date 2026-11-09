import React, { useState, useEffect } from 'react';
import { LecturerService } from '../../services/api';
import {
  FileCheck2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Clock,
  ExternalLink,
  MessageSquare,
  AlertCircle
} from 'lucide-react';

export const LecturerProofs = () => {
  const [proofs, setProofs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('Pending');
  const [selectedProof, setSelectedProof] = useState(null);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadProofs();
  }, [statusFilter]);

  const loadProofs = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter && statusFilter !== 'All') params.status = statusFilter;
      const data = await LecturerService.getProofs(params);
      setProofs(data);
      if (data.length > 0) setSelectedProof(data[0]);
      else setSelectedProof(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (actionStatus) => {
    if (!selectedProof) return;
    try {
      setSubmitting(true);
      await LecturerService.verifyProof(selectedProof.id, {
        status: actionStatus,
        feedback: feedback || (actionStatus === 'Verified' ? 'Approved by faculty.' : 'Please revise and resubmit.')
      });
      setMessage({ type: 'success', text: `Proof status updated to ${actionStatus}.` });
      setFeedback('');
      loadProofs();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to update proof status.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Student Study Proof Verification</h2>
          <p className="text-sm text-slate-500">
            Review uploaded study notes, homework proofs, and practice session logs submitted by students.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          {['Pending', 'Verified', 'Rejected', 'All'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                statusFilter === st
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                  : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              {st}
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
      ) : proofs.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400">
          No study proofs found under the '{statusFilter}' filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Proofs List */}
          <div className="lg:col-span-5 space-y-3">
            {proofs.map((p) => (
              <div
                key={p.id}
                onClick={() => {
                  setSelectedProof(p);
                  setFeedback(p.feedback || '');
                }}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  selectedProof?.id === p.id
                    ? 'border-emerald-600 bg-emerald-50/40 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                    {p.subject_name} &bull; Sec {p.section}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      p.status === 'Verified'
                        ? 'bg-emerald-100 text-emerald-800'
                        : p.status === 'Pending'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">{p.title}</h4>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1">{p.description}</p>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                  <span>Student: {p.student_name} ({p.usn})</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {p.study_duration_minutes} mins
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Verification Workspace */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
            {selectedProof ? (
              <div>
                <div className="border-b border-slate-100 pb-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-1 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {selectedProof.subject_name}
                    </span>
                    <span className="text-xs text-slate-400">
                      Submitted: {new Date(selectedProof.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{selectedProof.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Submitted by <span className="font-semibold text-slate-800">{selectedProof.student_name}</span> ({selectedProof.usn} &bull; Section {selectedProof.section})
                  </p>
                  <p className="text-sm text-slate-700 bg-slate-50 p-3.5 rounded-xl mt-3 border border-slate-100">
                    {selectedProof.description}
                  </p>
                </div>

                {/* Attached File Preview link */}
                <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-slate-600">
                      <FileCheck2 className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-800">Attached Study Evidence</p>
                      <p className="text-[11px] text-slate-500 truncate max-w-xs">{selectedProof.file_url}</p>
                    </div>
                  </div>
                  <a
                    href={selectedProof.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold text-blue-600 hover:text-blue-700 shadow-sm"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open File</span>
                  </a>
                </div>

                {/* Verification Feedback Input */}
                <div className="space-y-2 mb-6">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                    Faculty Evaluation Notes / Feedback
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Provide constructive feedback or specify corrections if asking for resubmission..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* Verification Action Buttons */}
                <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    onClick={() => handleVerify('Resubmission Required')}
                    disabled={submitting}
                    className="flex items-center gap-1.5 px-4 py-2 border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Request Resubmission</span>
                  </button>
                  <button
                    onClick={() => handleVerify('Rejected')}
                    disabled={submitting}
                    className="flex items-center gap-1.5 px-4 py-2 border border-red-300 bg-red-50 text-red-800 hover:bg-red-100 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                  >
                    <XCircle className="w-3.5 h-3.5" />
                    <span>Reject</span>
                  </button>
                  <button
                    onClick={() => handleVerify('Verified')}
                    disabled={submitting}
                    className="flex items-center gap-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Verify & Approve</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-16 text-center text-slate-400">Select a study proof to evaluate.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

