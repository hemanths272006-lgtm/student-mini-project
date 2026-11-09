import React, { useState, useEffect } from 'react';
import { LecturerService } from '../../services/api';
import {
  HelpCircle,
  MessageSquare,
  Send,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Clock
} from 'lucide-react';

export const LecturerDoubts = () => {
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('Pending');
  const [selectedDoubt, setSelectedDoubt] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [markResolved, setMarkResolved] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadDoubts();
  }, [statusFilter]);

  const loadDoubts = async () => {
    try {
      setLoading(true);
      const params = {};
      if (statusFilter && statusFilter !== 'All') params.status = statusFilter;
      const data = await LecturerService.getDoubts(params);
      setDoubts(data);
      if (data.length > 0) setSelectedDoubt(data[0]);
      else setSelectedDoubt(null);
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
      await LecturerService.replyDoubt(selectedDoubt.id, {
        message: replyMessage,
        mark_resolved: markResolved
      });
      setMessage({ type: 'success', text: 'Reply posted successfully.' });
      setReplyMessage('');
      loadDoubts();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to submit response.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Academic Doubts & Student Q&A</h2>
          <p className="text-sm text-slate-500">
            Provide direct answers, hints, and explanations to academic questions raised by students.
          </p>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-2">
          {['Pending', 'Answered', 'Resolved', 'All'].map((st) => (
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
      ) : doubts.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400">
          No questions found under the '{statusFilter}' status.
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
                    ? 'border-emerald-600 bg-emerald-50/40 shadow-sm'
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
                <h4 className="font-bold text-slate-900 text-sm line-clamp-1">{d.title}</h4>
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

          {/* Discussion Thread & Reply Form */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
            {selectedDoubt ? (
              <div className="flex flex-col h-full justify-between">
                <div>
                  <div className="border-b border-slate-100 pb-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2.5 py-1 rounded text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {selectedDoubt.subject_name} (Section {selectedDoubt.section})
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(selectedDoubt.created_at).toLocaleString()}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{selectedDoubt.title}</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Asked by <span className="font-semibold text-slate-800">{selectedDoubt.student_name}</span> ({selectedDoubt.usn})
                    </p>
                    <p className="text-sm text-slate-700 bg-slate-50 p-3.5 rounded-xl mt-3 border border-slate-100 leading-relaxed">
                      {selectedDoubt.description}
                    </p>
                  </div>

                  {/* Replies History */}
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-1 mb-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Thread Responses ({selectedDoubt.replies?.length || 0})
                    </h4>
                    {selectedDoubt.replies?.length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-2">No responses yet. Write the first explanation below.</p>
                    ) : (
                      selectedDoubt.replies.map((r) => (
                        <div key={r.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-xs text-slate-800 flex items-center gap-1.5">
                              <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
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
                </div>

                {/* Faculty Reply Form */}
                <form onSubmit={handleSendReply} className="pt-4 border-t border-slate-100 space-y-3">
                  <textarea
                    rows={3}
                    required
                    placeholder="Type an educational explanation, hint, or solution..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    className="w-full px-3 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={markResolved}
                        onChange={(e) => setMarkResolved(e.target.checked)}
                        className="rounded text-emerald-600 focus:ring-emerald-500"
                      />
                      <span>Mark this doubt as Resolved</span>
                    </label>
                    <button
                      type="submit"
                      disabled={submitting || !replyMessage.trim()}
                      className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{submitting ? 'Sending...' : 'Post Reply'}</span>
                    </button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="p-16 text-center text-slate-400">Select a doubt inquiry to respond.</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

