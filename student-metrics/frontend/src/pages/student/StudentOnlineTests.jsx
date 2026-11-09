import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { StudentPortalService } from '../../services/api';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  HelpCircle,
  ArrowRight,
  ArrowLeft,
  Award,
  RotateCcw
} from 'lucide-react';

export const StudentOnlineTests = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const takeTestId = searchParams.get('take');
  const reviewTestId = searchParams.get('review');

  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active Test State
  const [activeTest, setActiveTest] = useState(null);
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0); // in seconds
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Results State
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    loadTestsList();
  }, []);

  useEffect(() => {
    if (takeTestId) {
      startTakingTest(parseInt(takeTestId));
    } else if (reviewTestId) {
      loadReviewTest(parseInt(reviewTestId));
    } else {
      setActiveTest(null);
      setTestResult(null);
    }
  }, [takeTestId, reviewTestId]);

  // Timer Countdown Effect
  useEffect(() => {
    if (!activeTest || timeLeft <= 0 || testResult) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeTest, timeLeft, testResult]);

  const loadTestsList = async () => {
    try {
      setLoading(true);
      const data = await StudentPortalService.getTests();
      setTests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startTakingTest = async (id) => {
    try {
      setLoading(true);
      const data = await StudentPortalService.getTestDetails(id);
      setActiveTest(data);
      setCurrentQIndex(0);
      setAnswers({});
      setTimeLeft((data.duration_minutes || 20) * 60);
      setTestResult(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadReviewTest = async (id) => {
    try {
      setLoading(true);
      const res = await StudentPortalService.getTestResults(id);
      setTestResult(res);
      setActiveTest(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectOption = (qId, option) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: option
    }));
  };

  const handleAutoSubmit = () => {
    alert('Time has expired! Submitting your answers automatically.');
    handleSubmitTest();
  };

  const handleSubmitTest = async () => {
    if (!activeTest) return;
    try {
      setIsSubmitting(true);
      const res = await StudentPortalService.submitTest(activeTest.id, answers);
      setTestResult(res);
      setActiveTest(null);
      loadTestsList();
    } catch (err) {
      alert('Error submitting test. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 1. ACTIVE TEST TAKING VIEW
  if (activeTest) {
    const questions = activeTest.questions || [];
    const currentQ = questions[currentQIndex];
    const answeredCount = Object.keys(answers).length;

    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Test Header with Live Timer */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-0 z-10">
          <div>
            <span className="px-2.5 py-0.5 rounded text-xs font-semibold bg-indigo-50 text-indigo-700">
              {activeTest.subject_name}
            </span>
            <h2 className="text-lg font-bold text-slate-900 mt-1">{activeTest.title}</h2>
          </div>

          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-base font-bold border ${
              timeLeft < 300 ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' : 'bg-slate-100 text-slate-800 border-slate-200'
            }`}>
              <Clock className="w-5 h-5 text-indigo-600" />
              <span>{formatTimer(timeLeft)}</span>
            </div>

            <button
              onClick={handleSubmitTest}
              disabled={isSubmitting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold shadow-md shadow-indigo-600/20 disabled:opacity-50"
            >
              {isSubmitting ? 'Evaluating...' : 'Submit Assessment'}
            </button>
          </div>
        </div>

        {/* Question Area */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Question Card */}
          <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between min-h-[420px]">
            {currentQ && (
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 font-semibold mb-4">
                  <span>Question {currentQIndex + 1} of {questions.length}</span>
                  <span>{currentQ.marks} Marks</span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug mb-6">
                  {currentQ.question_text}
                </h3>

                {/* MCQ Options */}
                <div className="space-y-3">
                  {['A', 'B', 'C', 'D'].map((optKey) => {
                    const optText = currentQ[`option_${optKey.toLowerCase()}`];
                    const isSelected = answers[currentQ.id] === optKey;
                    return (
                      <div
                        key={optKey}
                        onClick={() => handleSelectOption(currentQ.id, optKey)}
                        className={`p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-3.5 ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                            isSelected
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {optKey}
                        </div>
                        <span className="text-sm font-medium text-slate-800">{optText}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Navigation buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-100 mt-6">
              <button
                onClick={() => setCurrentQIndex((prev) => Math.max(0, prev - 1))}
                disabled={currentQIndex === 0}
                className="flex items-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-semibold hover:bg-slate-50 disabled:opacity-40"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Previous
              </button>

              <button
                onClick={() => setCurrentQIndex((prev) => Math.min(questions.length - 1, prev + 1))}
                disabled={currentQIndex === questions.length - 1}
                className="flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm disabled:opacity-40"
              >
                Next <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Question Palette */}
          <div className="lg:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <h4 className="font-bold text-sm text-slate-800 mb-3">Questions Palette</h4>
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const isAnswered = answers[q.id] !== undefined;
                const isCurrent = currentQIndex === idx;
                return (
                  <button
                    key={q.id}
                    onClick={() => setCurrentQIndex(idx)}
                    className={`h-10 rounded-xl font-bold text-xs transition-all ${
                      isCurrent
                        ? 'ring-2 ring-indigo-600 bg-indigo-600 text-white'
                        : isAnswered
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Answered:</span>
                <span className="font-bold text-emerald-600">{answeredCount} of {questions.length}</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Remaining:</span>
                <span className="font-bold text-slate-400">{questions.length - answeredCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 2. DETAILED TEST RESULTS / REVIEW VIEW
  if (testResult) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Results Banner */}
        <div className={`p-8 rounded-2xl text-white shadow-lg ${
          testResult.passed
            ? 'bg-gradient-to-r from-emerald-800 to-teal-900'
            : 'bg-gradient-to-r from-slate-900 to-red-950'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/20 text-white">
                {testResult.passed ? 'Assessment Passed' : 'Assessment Completed'}
              </span>
              <h2 className="text-2xl font-bold mt-2">{testResult.title}</h2>
              <p className="text-xs text-slate-200 mt-1">
                Completed on {testResult.submitted_at ? new Date(testResult.submitted_at).toLocaleString() : 'Just now'}
              </p>
            </div>

            <div className="text-right flex items-center gap-6">
              <div>
                <p className="text-xs text-slate-300 uppercase font-semibold">Your Score</p>
                <p className="text-4xl font-extrabold">{testResult.score} / {testResult.total_marks}</p>
                <p className="text-xs text-slate-200 mt-0.5">{testResult.percentage}% Overall</p>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Tests button */}
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-slate-900">Detailed Answer Review & Explanations</h3>
          <button
            onClick={() => setSearchParams({})}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Tests List
          </button>
        </div>

        {/* Question Breakdown List */}
        <div className="space-y-4">
          {testResult.breakdown?.map((q, idx) => (
            <div
              key={q.question_id || idx}
              className={`p-6 rounded-2xl border-2 bg-white shadow-sm ${
                q.is_correct ? 'border-emerald-200' : 'border-red-200'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <span className="font-bold text-xs uppercase tracking-wider text-slate-400">
                  Question {idx + 1}
                </span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1 ${
                  q.is_correct ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                }`}>
                  {q.is_correct ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
                  <span>{q.marks_awarded} / {q.max_marks} Pts</span>
                </span>
              </div>

              <h4 className="font-bold text-slate-900 text-sm leading-snug mb-4">{q.question_text}</h4>

              {/* Options Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs mb-4">
                {['A', 'B', 'C', 'D'].map((opt) => {
                  const optText = q[`option_${opt.toLowerCase()}`];
                  const isChosen = q.chosen_option === opt;
                  const isCorrect = q.correct_option === opt;
                  return (
                    <div
                      key={opt}
                      className={`p-3 rounded-xl border flex items-center gap-2.5 ${
                        isCorrect
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold'
                          : isChosen
                          ? 'border-red-500 bg-red-50 text-red-900 font-semibold'
                          : 'border-slate-200 text-slate-600 bg-slate-50/50'
                      }`}
                    >
                      <span className="font-bold">{opt}.</span>
                      <span>{optText}</span>
                      {isCorrect && <span className="ml-auto text-[10px] bg-emerald-200 text-emerald-800 px-1.5 py-0.5 rounded font-bold">Correct</span>}
                      {isChosen && !isCorrect && <span className="ml-auto text-[10px] bg-red-200 text-red-800 px-1.5 py-0.5 rounded font-bold">Your Choice</span>}
                    </div>
                  );
                })}
              </div>

              {/* Explanation note */}
              {q.explanation && (
                <div className="p-3.5 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-900">
                  <span className="font-bold block mb-0.5">Faculty Explanation:</span>
                  <span>{q.explanation}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 3. DEFAULT LIST VIEW
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Online MCQ Assessments</h2>
        <p className="text-sm text-slate-500">
          Take interactive practice tests to strengthen your subject conceptual clarity.
        </p>
      </div>

      {loading ? (
        <div className="p-16 text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      ) : tests.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-400">
          No tests currently assigned for your section.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tests.map((t) => (
            <div
              key={t.id}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-indigo-400 transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {t.subject_name}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <Clock className="w-3.5 h-3.5" /> {t.duration_minutes} Mins
                  </span>
                </div>

                <h4 className="font-bold text-slate-900 text-base">{t.title}</h4>

                <div className="grid grid-cols-2 gap-2 mt-4 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 block">Questions</span>
                    <span className="font-bold text-slate-800">{t.question_count} MCQs</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Total Marks</span>
                    <span className="font-bold text-slate-800">{t.total_marks} Pts</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                {t.has_attempted ? (
                  <>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Your Score</span>
                      <span className={`text-base font-extrabold ${t.passed ? 'text-emerald-600' : 'text-red-600'}`}>
                        {t.score}/{t.total_marks} ({t.percentage}%)
                      </span>
                    </div>
                    <button
                      onClick={() => setSearchParams({ review: t.id })}
                      className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-all"
                    >
                      Review
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setSearchParams({ take: t.id })}
                    className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-600/20"
                  >
                    Start Assessment Now
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

