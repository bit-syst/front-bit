import api from './api';

export const authService = {
  login: (data) => api.post('/auth/login', data),
  signup: (data) => api.post('/auth/signup', data),
  refreshToken: (refreshToken) => api.post('/auth/refresh-token', { refreshToken }),
  getProfile: () => api.get('/auth/profile'),
  logout: () => api.post('/auth/logout')
};

export const clientService = {
  getAll: (params) => api.get('/clients', { params }),
  getById: (id) => api.get(`/clients/${id}`),
  create: (data) => api.post('/clients', data),
  update: (id, data) => api.put(`/clients/${id}`, data),
  delete: (id) => api.delete(`/clients/${id}`),
    getMyOrders: () => api.get('/clients/my-orders'),
    getDashboardStats: (params) => api.get('/clients/dashboard-stats', { params })
  };

export const employeeService = {
  getAll: () => api.get('/employees'),
  getByDepartment: (dept) => api.get(`/employees/department/${dept}`),
  getPublicByDepartment: (dept) => api.get(`/employees/public/department/${dept}`),
  create: (data) => api.post('/employees', data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  delete: (id) => api.delete(`/employees/${id}`),
  getSalaryIncentive: () => api.get('/employees/salary-incentive'),
  getPayoutsByDate: (params) => api.get('/employees/payouts', { params }),
  getDashboard: () => api.get('/employees/dashboard')
};

export const taskService = {
  getByOrder: (orderId) => api.get(`/tasks/order/${orderId}`),
  getMyTasks: () => api.get('/tasks/my-tasks'),
  updateStatus: (id, status) => api.put(`/tasks/${id}/status`, { status }),
  getPopup: () => api.get('/tasks/popup')
};

export const invoiceService = {
  download: (orderId) => api.get(`/invoices/download/${orderId}`, { responseType: 'blob' }),
  downloadClient: (orderId) => api.get(`/invoices/client/${orderId}`, { responseType: 'blob' }),
  getAll: () => api.get('/invoices')
};

export const settingsService = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/settings', data)
};
