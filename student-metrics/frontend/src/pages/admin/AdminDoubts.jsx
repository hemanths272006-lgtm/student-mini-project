import React, { useState, useEffect } from 'react';
import { AdminService } from '../../services/api';
import {
  HelpCircle,
  MessageSquare,
  CheckCircle2,
  Clock,
  Send,
  User,
  GraduationCap
} from 'lucide-react';

export const AdminDoubts = () => {
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterSection, setFilterSection] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [selectedDoubt, setSelectedDoubt] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [markResolved, setMarkResolved] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadDoubts();
  }, [filterSection, filterStatus]);

  const loadDoubts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filterSection) params.section = filterSection;
      if (filterStatus) params.status = filterStatus;
      const data = await AdminService.getDoubts(params);
      setDoubts(data);
      if (data.length > 0) {
        // If a doubt was already selected, update it with fresh replies
        setSelectedDoubt((prev) => {
          if (!prev) return data[0];
          const found = data.find((d) => d.id === prev.id);
          return found || data[0];
        });
      } else {
        setSelectedDoubt(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!selectedDoubt || !replyMessage.trim()) return;
    try {
      setSubmitting(true);
      await AdminService.replyDoubt(selectedDoubt.id, {
        message: replyMessage,
        mark_resolved: markResolved
      });
      setMessage({ type: 'success', text: 'Admin response posted successfully.' });
      setReplyMessage('');
      loadDoubts();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to post reply.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Academic Doubts Moderation</h2>
          <p className="text-sm text-slate-500">
            Monitor academic inquiries submitted by students across Sections A, B, and C.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <select
            value={filterSection}
            onChange={(e) => setFilterSection(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none"
          >
            <option value="">All Sections</option>
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="C">Section C</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Answered">Answered</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : doubts.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400">
          No doubts found matching the selected filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Doubts List */}
          <div className="lg:col-span-5 space-y-3">
            {doubts.map((d) => (
              <div
                key={d.id}
                onClick={() => setSelectedDoubt(d)}
                className={`p-4 rounded-xl border transition-all cursor-pointer ${
                  selectedDoubt?.id === d.id
                    ? 'border-blue-600 bg-blue-50/50 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                    {d.subject_name} &bull; Sec {d.section}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      d.status === 'Resolved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : d.status === 'Answered'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {d.status}
                  </span>
                </div>
                <h4 className="font-semibold text-slate-900 text-sm line-clamp-1">{d.title}</h4>
                <p className="text-xs text-slate-500 line-clamp-2 mt-1">{d.description}</p>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                  <span>Student: {d.student_name} ({d.usn})</span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" /> {d.replies?.length || 0}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Doubt Thread Detail View */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
            {selectedDoubt ? (
              <div>
                <div className="border-b border-slate-100 pb-4 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-1 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                      {selectedDoubt.subject_name} (Section {selectedDoubt.section})
                    </span>
                    <span className="text-xs text-slate-400">
                      {new Date(selectedDoubt.created_at).toLocaleString()}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">{selectedDoubt.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Asked by <span className="font-semibold text-slate-800">{selectedDoubt.student_name}</span> (USN: {selectedDoubt.usn})
                  </p>
                  <p className="text-sm text-slate-700 bg-slate-50 p-3.5 rounded-xl mt-3 border border-slate-100 leading-relaxed">
                    {selectedDoubt.description}
                  </p>
                </div>

                {/* Replies Thread */}
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Responses ({selectedDoubt.replies?.length || 0})
                  </h4>
                  {selectedDoubt.replies?.length === 0 ? (
                    <p className="text-xs text-slate-400 italic py-2">No responses yet on this inquiry.</p>
                  ) : (
                    selectedDoubt.replies.map((r) => (
                      <div key={r.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-xs text-slate-800 flex items-center gap-1.5">
                            <GraduationCap className="w-3.5 h-3.5 text-blue-600" />
                            {r.user_name} ({r.user_role})
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {new Date(r.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-sm text-slate-700 mt-1">{r.message}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Admin Official Reply Form */}
                <form onSubmit={handleSendReply} className="pt-4 border-t border-slate-100 mt-4 space-y-3">
                  <textarea
                    rows={2}
                    required
                    placeholder="Provide official administrative guidance or faculty instruction..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={markResolved}
                        onChange={(e) => setMarkResolved(e.target.checked)}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span>Mark Inquiry as Resolved</span>
                    </label>
                    <button
                      type="submit"
                      disabled={submitting || !replyMessage.trim()}
                      className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/20 disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{submitting ? 'Submitting...' : 'Post Admin Response'}</span>
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="text-center text-slate-400 py-16">Select an inquiry to view details.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

