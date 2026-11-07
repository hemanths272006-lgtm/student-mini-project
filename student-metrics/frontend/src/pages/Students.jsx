import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Plus,
  Eye,
  Edit2,
  Trash2,
  Download,
  Upload,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { CategoryBadge, TrendBadge } from '../components/Badge';
import StudentModal from '../components/StudentModal';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import CSVImportModal from '../components/CSVImportModal';
import { StudentService } from '../services/api';

export default function Students() {
  const navigate = useNavigate();

  // Data states
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, limit: 15, total_pages: 1 });
  const [loading, setLoading] = useState(true);

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('usn');
  const [sortOrder, setSortOrder] = useState('asc');

  // Modals
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingStudent, setDeletingStudent] = useState(null);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const fetchStudents = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 15,
        search: searchTerm.trim() || undefined,
        section: selectedSection !== 'All' ? selectedSection : undefined,
        category: selectedCategory !== 'All' ? selectedCategory : undefined,
        sort_by: sortBy,
        sort_order: sortOrder,
      };
      const res = await StudentService.getStudents(params);
      setStudents(res.students);
      setPagination(res.pagination);
    } catch (err) {
      console.error('Failed to fetch students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents(1);
  }, [selectedSection, selectedCategory, sortBy, sortOrder]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchStudents(1);
  };

  const handleSaveStudent = async (studentData) => {
    if (editingStudent) {
      await StudentService.updateStudent(editingStudent.id, studentData);
      showNotification('Student records updated successfully!');
    } else {
      await StudentService.createStudent(studentData);
      showNotification('New student registered successfully!');
    }
    fetchStudents(pagination.page);
  };

  const handleConfirmDelete = async () => {
    if (!deletingStudent) return;
    setActionLoading(true);
    try {
      await StudentService.deleteStudent(deletingStudent.id);
      showNotification(`Student ${deletingStudent.name} deleted successfully.`);
      setIsDeleteOpen(false);
      setDeletingStudent(null);
      fetchStudents(pagination.page);
    } catch (err) {
      alert(err.response?.data?.detail || 'Delete failed');
    } finally {
      setActionLoading(false);
    }
  };

  const showNotification = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const openEditModal = async (studentSummary) => {
    try {
      const fullDetail = await StudentService.getStudent(studentSummary.id);
      setEditingStudent(fullDetail);
      setIsAddEditOpen(true);
    } catch (err) {
      alert('Could not load student details for editing.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Student Management</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              {pagination.total} Students
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Search, filter, update marks, and inspect continuous learning evaluations.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsImportOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-colors shadow-2xs"
          >
            <Upload className="w-4 h-4 text-slate-600" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={() => window.open(StudentService.getExportCSVUrl(), '_blank')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-colors shadow-2xs"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => {
              setEditingStudent(null);
              setIsAddEditOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium rounded-xl flex items-center justify-between shadow-2xs animate-fade-in">
          <span>{successMsg}</span>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-600 hover:text-emerald-900 font-bold">×</button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by student name or USN..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-20 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold rounded-lg transition-colors"
            >
              Search
            </button>
          </form>

          {/* Section Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-medium"
            >
              <option value="All">All Sections (A, B, C)</option>
              <option value="A">Section A (60 Students)</option>
              <option value="B">Section B (60 Students)</option>
              <option value="C">Section C (60 Students)</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-medium"
            >
              <option value="All">All Learner Categories</option>
              <option value="Fast Learner">Fast Learners (≥ 75%)</option>
              <option value="Average Learner">Average Learners (50 - 74%)</option>
              <option value="Slow Learner">Slow Learners (&lt; 50%)</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="md:col-span-2">
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('-');
                setSortBy(sb);
                setSortOrder(so);
              }}
              className="w-full py-2 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-700 font-medium"
            >
              <option value="usn-asc">USN (Ascending)</option>
              <option value="usn-desc">USN (Descending)</option>
              <option value="overall_average-desc">Marks: High to Low</option>
              <option value="overall_average-asc">Marks: Low to High</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="attendance-desc">Attendance: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-2">
            <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
            <p className="text-xs font-semibold text-slate-500">Retrieving student records...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-sm font-bold text-slate-700">No students found matching your criteria</p>
            <p className="text-xs text-slate-400 mt-1">Try clearing filters or search terms</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedSection('All');
                setSelectedCategory('All');
                fetchStudents(1);
              }}
              className="mt-4 px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-3.5 px-4">USN / ID</th>
                  <th className="py-3.5 px-4">Student Name</th>
                  <th className="py-3.5 px-4">Section</th>
                  <th className="py-3.5 px-4">Attendance</th>
                  <th className="py-3.5 px-4">Overall Avg</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Trend</th>
                  <th className="py-3.5 px-4">Strongest / Weakest</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-blue-50/30 transition-colors">
                    {/* USN */}
                    <td className="py-3 px-4 font-mono font-semibold text-slate-900">
                      <div>{student.usn}</div>
                      <span className="text-[10px] text-slate-400 font-normal">{student.student_id}</span>
                    </td>

                    {/* Name */}
                    <td className="py-3 px-4">
                      <span className="font-bold text-slate-900 block">{student.name}</span>
                      <span className="text-[10px] text-slate-400">Sem {student.semester}</span>
                    </td>

                    {/* Section */}
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-slate-100 text-slate-800 font-bold text-xs border border-slate-200">
                        {student.section}
                      </span>
                    </td>

                    {/* Attendance */}
                    <td className="py-3 px-4 font-semibold">
                      <div className="flex items-center gap-1.5">
                        <span className={student.attendance < 75 ? 'text-rose-600 font-bold' : 'text-slate-800'}>
                          {student.attendance}%
                        </span>
                        {student.attendance < 75 && (
                          <span className="text-[9px] bg-rose-100 text-rose-700 px-1 py-0.2 rounded font-bold">
                            Low
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Overall Average */}
                    <td className="py-3 px-4">
                      <span className="text-sm font-extrabold text-slate-900">{student.overall_average}%</span>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4">
                      <CategoryBadge category={student.category} />
                    </td>

                    {/* Trend */}
                    <td className="py-3 px-4">
                      <TrendBadge trend={student.trend} />
                    </td>

                    {/* Strongest / Weakest */}
                    <td className="py-3 px-4">
                      <div className="text-[11px] leading-tight">
                        <span className="text-emerald-700 font-semibold block">▲ {student.highest_subject}</span>
                        <span className="text-rose-600 font-medium block mt-0.5">▼ {student.lowest_subject}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => navigate(`/reports/${student.id}`)}
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-100 transition-colors"
                          title="View Performance Report"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(student)}
                          className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                          title="Edit Student & Marks"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setDeletingStudent(student);
                            setIsDeleteOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-100 transition-colors"
                          title="Delete Student"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing <strong className="text-slate-800">{((pagination.page - 1) * pagination.limit) + 1}</strong> to{' '}
            <strong className="text-slate-800">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </strong>{' '}
            of <strong className="text-slate-800">{pagination.total}</strong> students
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => fetchStudents(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" /> Previous
            </button>
            <span className="px-2 font-bold text-slate-700">
              Page {pagination.page} of {pagination.total_pages}
            </span>
            <button
              onClick={() => fetchStudents(pagination.page + 1)}
              disabled={pagination.page >= pagination.total_pages}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-700 hover:bg-slate-100 disabled:opacity-40 transition-colors"
            >
              Next <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <StudentModal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        onSave={handleSaveStudent}
        student={editingStudent}
      />

      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        student={deletingStudent}
        loading={actionLoading}
      />

      <CSVImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportSuccess={() => {
          showNotification('CSV imported successfully!');
          fetchStudents(1);
        }}
      />
    </div>
  );
}

