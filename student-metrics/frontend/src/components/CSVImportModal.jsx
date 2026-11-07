import React, { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Download, X, AlertTriangle } from 'lucide-react';
import { StudentService } from '../services/api';

export default function CSVImportModal({ isOpen, onClose, onImportSuccess }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (!selected.name.endsWith('.csv')) {
        setError('Only .csv files are supported.');
        setFile(null);
      } else {
        setFile(selected);
        setError('');
        setResult(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a valid CSV file.');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await StudentService.importCSV(file);
      setResult(res);
      if (res.imported_count > 0 || res.updated_count > 0) {
        onImportSuccess?.();
      }
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'CSV upload failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadSample = () => {
    window.open(StudentService.getSampleCSVUrl(), '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Upload className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="text-base font-bold tracking-tight">Import Student Marks (CSV)</h3>
              <p className="text-xs text-slate-400">Bulk upload student records & assessment marks</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Sample Download Bar */}
          <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-blue-900">
              <FileText className="w-4 h-4 text-blue-600 shrink-0" />
              <span>Need the required format template?</span>
            </div>
            <button
              onClick={handleDownloadSample}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-white hover:bg-blue-100 text-blue-700 font-semibold rounded-lg border border-blue-300 shadow-2xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Sample CSV</span>
            </button>
          </div>

          {/* Drag & Drop Upload Box */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/40 rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 group"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv"
              className="hidden"
            />
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <Upload className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-800 mb-1">
              {file ? file.name : 'Click to browse or drop your CSV file'}
            </p>
            <p className="text-xs text-slate-400">
              Supported columns: usn, name, section, semester, attendance, subject, test, score
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Import Result Stats */}
          {result && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Import Summary</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-slate-400 block text-[10px] uppercase font-semibold">Processed</span>
                  <span className="text-base font-extrabold text-slate-800">{result.total_rows}</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-emerald-500 block text-[10px] uppercase font-semibold">Imported</span>
                  <span className="text-base font-extrabold text-emerald-600">{result.imported_count}</span>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="text-blue-500 block text-[10px] uppercase font-semibold">Updated</span>
                  <span className="text-base font-extrabold text-blue-600">{result.updated_count}</span>
                </div>
              </div>

              {/* Errors list if any */}
              {result.errors && result.errors.length > 0 && (
                <div className="mt-3">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-700 mb-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Row Validation Warnings ({result.error_count}):</span>
                  </div>
                  <ul className="text-[11px] text-rose-600 bg-rose-50/70 p-2.5 rounded-lg border border-rose-200 space-y-1 max-h-32 overflow-y-auto">
                    {result.errors.map((errStr, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <span>•</span>
                        <span>{errStr}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
          >
            {result ? 'Done' : 'Cancel'}
          </button>
          {!result && (
            <button
              onClick={handleUpload}
              disabled={loading || !file}
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm shadow-blue-500/20 transition-all disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              <span>{loading ? 'Uploading...' : 'Upload & Process'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

