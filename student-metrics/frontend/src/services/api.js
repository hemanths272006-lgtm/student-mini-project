import axios from 'axios';

// Connect to FastAPI backend
const API_BASE = 'http://127.0.0.1:8000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

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

