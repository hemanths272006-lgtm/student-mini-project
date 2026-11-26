import axios from 'axios';

// Connect to FastAPI backend (support environment variable for production deployments)
const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 45000,
});

// Attach JWT token to all requests if stored
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ====================================================
// 1. AUTHENTICATION SERVICE
// ====================================================
export const AuthService = {
  login: async (email, password, rememberMe = false) => {
    const res = await api.post('/auth/login', {
      email,
      password,
      remember_me: rememberMe,
    });
    return res.data;
  },

  register: async (payload) => {
    const res = await api.post('/auth/register', payload);
    return res.data;
  },

  forgotPassword: async (email) => {
    const res = await api.post('/auth/forgot-password', { email });
    return res.data;
  },

  resetPassword: async (token, newPassword) => {
    const res = await api.post('/auth/reset-password', {
      token,
      new_password: newPassword,
    });
    return res.data;
  },

  demoLogin: async (role, email, usn) => {
    const res = await api.post('/auth/demo-login', { role, email, usn });
    return res.data;
  },

  googleLogin: async (payload) => {
    const res = await api.post('/auth/google', payload);
    return res.data;
  },

  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  },

  getDemoAccounts: async () => {
    const res = await api.get('/auth/demo-accounts');
    return res.data;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch (e) {
      // ignore
    }
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  },
};

// ====================================================
// 2. FILE UPLOAD SERVICE
// ====================================================
export const UploadService = {
  uploadFile: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data; // { url: "/uploads/...", filename: "..." }
  },
};

// ====================================================
// 3. ADMIN PORTAL SERVICE
// ====================================================
export const AdminService = {
  getDashboard: async () => {
    const res = await api.get('/admin/dashboard');
    return res.data;
  },

  getLecturers: async () => {
    const res = await api.get('/admin/lecturers');
    return res.data;
  },

  createLecturer: async (data) => {
    const res = await api.post('/admin/lecturers', data);
    return res.data;
  },

  updateLecturer: async (id, data) => {
    const res = await api.put(`/admin/lecturers/${id}`, data);
    return res.data;
  },

  verifyLecturer: async (id, action) => {
    const res = await api.post(`/admin/lecturers/${id}/verify`, { action });
    return res.data;
  },

  getSectionAnalytics: async (section) => {
    const res = await api.get(`/admin/sections/${section}`);
    return res.data;
  },

  getDoubts: async (params = {}) => {
    const res = await api.get('/admin/doubts', { params });
    return res.data;
  },

  replyDoubt: async (id, data) => {
    const res = await api.post(`/admin/doubts/${id}/reply`, data);
    return res.data;
  },

  deleteDoubt: async (id) => {
    const res = await api.delete(`/admin/doubts/${id}`);
    return res.data;
  },

  getMaterials: async () => {
    const res = await api.get('/admin/materials');
    return res.data;
  },

  createMaterial: async (data) => {
    const res = await api.post('/admin/materials', data);
    return res.data;
  },

  deleteMaterial: async (id) => {
    const res = await api.delete(`/admin/materials/${id}`);
    return res.data;
  },
};

// ====================================================
// 4. LECTURER PORTAL SERVICE
// ====================================================
export const LecturerService = {
  getDashboard: async () => {
    const res = await api.get('/lecturer/dashboard');
    return res.data;
  },

  // Clickable Fast, Average, Slow cards student listings
  getLearnerClassification: async (params = {}) => {
    const res = await api.get('/lecturer/learner-classification', { params });
    return res.data;
  },

  getAssignedClasses: async () => {
    const res = await api.get('/lecturer/assigned-classes');
    return res.data;
  },

  getStudents: async (params = {}) => {
    const res = await api.get('/lecturer/students', { params });
    return res.data;
  },

  saveMarks: async (data) => {
    const res = await api.post('/lecturer/marks', data);
    return res.data;
  },

  getProofs: async (params = {}) => {
    const res = await api.get('/lecturer/proofs', { params });
    return res.data;
  },

  verifyProof: async (id, data) => {
    const res = await api.put(`/lecturer/proofs/${id}/verify`, data);
    return res.data;
  },

  getDoubts: async (params = {}) => {
    const res = await api.get('/lecturer/doubts', { params });
    return res.data;
  },

  replyDoubt: async (id, data) => {
    const res = await api.post(`/lecturer/doubts/${id}/reply`, data);
    return res.data;
  },

  getMaterials: async () => {
    const res = await api.get('/lecturer/materials');
    return res.data;
  },

  createMaterial: async (data) => {
    const res = await api.post('/lecturer/materials', data);
    return res.data;
  },

  getTests: async () => {
    const res = await api.get('/lecturer/tests');
    return res.data;
  },

  createTest: async (data) => {
    const res = await api.post('/lecturer/tests', data);
    return res.data;
  },
};

// ====================================================
// 5. STUDENT PORTAL SERVICE (NEW & EXTENDED)
// ====================================================
export const StudentPortalService = {
  getDashboard: async () => {
    const res = await api.get('/student/dashboard');
    return res.data;
  },

  getTests: async () => {
    const res = await api.get('/student/tests');
    return res.data;
  },

  getTestDetails: async (testId) => {
    const res = await api.get(`/student/tests/${testId}`);
    return res.data;
  },

  submitTest: async (testId, answers) => {
    const res = await api.post(`/student/tests/${testId}/submit`, { answers });
    return res.data;
  },

  getTestResults: async (testId) => {
    const res = await api.get(`/student/tests/${testId}/results`);
    return res.data;
  },

  getProofs: async () => {
    const res = await api.get('/student/proofs');
    return res.data;
  },

  submitProof: async (data) => {
    const res = await api.post('/student/proofs', data);
    return res.data;
  },

  getMaterials: async (params = {}) => {
    const res = await api.get('/student/materials', { params });
    return res.data;
  },

  getPreviousPapers: async (params = {}) => {
    const res = await api.get('/student/previous-papers', { params });
    return res.data;
  },

  getTimetable: async () => {
    const res = await api.get('/student/timetable');
    return res.data;
  },

  getDoubts: async () => {
    const res = await api.get('/student/doubts');
    return res.data;
  },

  createDoubt: async (data) => {
    const res = await api.post('/student/doubts', data);
    return res.data;
  },

  replyDoubt: async (id, data) => {
    const res = await api.post(`/student/doubts/${id}/reply`, data);
    return res.data;
  },

  getPrivateReportCard: async () => {
    const res = await api.get('/student/report-card');
    return res.data;
  },
};

// ====================================================
// 6. CORE STUDENT MANAGEMENT SERVICE (PRESERVED)
// ====================================================
export const StudentService = {
  // Dashboard
  getDashboard: async () => {
    const res = await api.get('/dashboard');
    return res.data;
  },

  // Students list with search, filter, sort & pagination
  getStudents: async (params = {}) => {
    const res = await api.get('/students', { params });
    return res.data;
  },

  // Single student details
  getStudent: async (id) => {
    const res = await api.get(`/students/${id}`);
    return res.data;
  },

  // Create student
  createStudent: async (data) => {
    const res = await api.post('/students', data);
    return res.data;
  },

  // Update student
  updateStudent: async (id, data) => {
    const res = await api.put(`/students/${id}`, data);
    return res.data;
  },

  // Delete student
  deleteStudent: async (id) => {
    const res = await api.delete(`/students/${id}`);
    return res.data;
  },

  // Analytics
  getAnalytics: async () => {
    const res = await api.get('/analytics');
    return res.data;
  },

  // Detailed printable student report
  getReport: async (id) => {
    const res = await api.get(`/reports/${id}`);
    return res.data;
  },

  // CSV Import
  importCSV: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/import-csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  },

  // URLs for direct export/download
  getExportCSVUrl: () => `${API_BASE}/export-csv`,
  getSampleCSVUrl: () => `${API_BASE}/sample-csv`,

  // Reset database with fresh 180 seed records
  resetSampleData: async () => {
    const res = await api.post('/reset-sample-data');
    return res.data;
  },
};

export default api;
