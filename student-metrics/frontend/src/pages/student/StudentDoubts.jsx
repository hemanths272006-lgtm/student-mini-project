import React, { useState, useEffect } from 'react';
import { StudentPortalService } from '../../services/api';
import {
  HelpCircle,
  MessageSquare,
  Plus,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  GraduationCap
} from 'lucide-react';

export const StudentDoubts = () => {
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedDoubt, setSelectedDoubt] = useState(null);
  const [newDoubt, setNewDoubt] = useState({
    title: '',
    subject_id: 1,
    description: '',
    file_url: ''
  });
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadDoubts();
  }, []);

  const loadDoubts = async () => {
    try {
      setLoading(true);
      const data = await StudentPortalService.getDoubts();
      setDoubts(data);
      if (data.length > 0 && !selectedDoubt) {
        setSelectedDoubt(data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDoubt = async (e) => {
    e.preventDefault();
    try {
      await StudentPortalService.createDoubt(newDoubt);
      setShowModal(false);
      setMessage({ type: 'success', text: 'Question submitted to faculty successfully!' });
      setNewDoubt({ title: '', subject_id: 1, description: '', file_url: '' });
      loadDoubts();
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to post doubt.' });
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!selectedDoubt || !replyText.trim()) return;
    try {
      setSubmitting(true);
      await StudentPortalService.replyDoubt(selectedDoubt.id, {
        message: replyText
      });
      setReplyText('');
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
          <h2 className="text-xl font-bold text-slate-900">Academic Doubts & Faculty Guidance</h2>
          <p className="text-sm text-slate-500">
            Ask questions on confusing concepts, homework questions, or exam topics.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-indigo-600/20"
        >
          <Plus className="w-4 h-4" />
          <span>Ask New Question</span>
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

      {loading ? (
        <div className="p-16 text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : doubts.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400">
          You haven't asked any doubts yet. Click 'Ask New Question' above.
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
                    ? 'border-indigo-600 bg-indigo-50/40 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700">
                    {d.subject_name}
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
                  <span>{new Date(d.created_at).toLocaleDateString()}</span>
                  <span className="flex items-center gap-1 font-semibold text-indigo-600">
                    <MessageSquare className="w-3 h-3" /> {d.replies?.length || 0} replies
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Discussion Thread */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
            {selectedDoubt ? (
              <div className="flex flex-col h-full justify-between">
                <div>
                  <div className="border-b border-slate-100 pb-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2.5 py-1 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {selectedDoubt.subject_name}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(selectedDoubt.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{selectedDoubt.title}</h3>
                    <p className="text-sm text-slate-700 bg-slate-50 p-3.5 rounded-xl mt-3 border border-slate-100 leading-relaxed">
                      {selectedDoubt.description}
                    </p>
                  </div>

                  {/* Thread Replies */}
                  <div className="space-y-3 max-h-64 overflow-y-auto pr-1 mb-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Faculty & Student Responses ({selectedDoubt.replies?.length || 0})
                    </h4>
                    {selectedDoubt.replies?.length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-3">
                        Waiting for faculty response. You will see answers here once reviewed.
                      </p>
                    ) : (
                      selectedDoubt.replies.map((r) => (
                        <div key={r.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-xs text-slate-800 flex items-center gap-1.5">
                              <GraduationCap className="w-3.5 h-3.5 text-indigo-600" />
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

                {/* Follow-up question form */}
                <form onSubmit={handleSendReply} className="pt-4 border-t border-slate-100 flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Ask follow-up question or clarification..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="submit"
                    disabled={submitting || !replyText.trim()}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20 disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </form>
              </div>
            ) : (
              <div className="p-16 text-center text-slate-400">Select a question to view discussion.</div>
            )}
          </div>
        </div>
      )}

      {/* Ask Question Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Post Academic Question</h3>
            <form onSubmit={handleCreateDoubt} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Subject</label>
                <select
                  value={newDoubt.subject_id}
                  onChange={(e) => setNewDoubt({ ...newDoubt, subject_id: parseInt(e.target.value) })}
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
                <label className="block text-xs font-semibold text-slate-600 mb-1">Question Title / Topic</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. How does Dijkstra's algorithm handle negative weights?"
                  value={newDoubt.title}
                  onChange={(e) => setNewDoubt({ ...newDoubt, title: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Detailed Description</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describe your doubt in detail..."
                  value={newDoubt.description}
                  onChange={(e) => setNewDoubt({ ...newDoubt, description: e.target.value })}
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
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold shadow-md shadow-indigo-600/20"
                >
                  Submit Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

