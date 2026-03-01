import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AdminLayout from '../layouts/AdminLayout';
import ClientLayout from '../layouts/ClientLayout';
import EmployeeLayout from '../layouts/EmployeeLayout';
import LoginPage from '../pages/auth/LoginPage';
import SignupPage from '../pages/auth/SignupPage';
import AdminDashboard from '../pages/admin/AdminDashboard';
import ClientList from '../pages/admin/ClientList';
import EmployeeManagement from '../pages/admin/EmployeeManagement';
import TaskView from '../pages/admin/TaskView';
import SalaryIncentive from '../pages/admin/SalaryIncentive';
import Settings from '../pages/admin/Settings';
import ClientDashboard from '../pages/client/ClientDashboard';
import EmployeeDashboard from '../pages/employee/EmployeeDashboard';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-overlay"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) return <Navigate to="/login" replace />;
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();

  const getDefaultRoute = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin/dashboard';
    if (user.role === 'client') return '/client/dashboard';
    if (user.role === 'employee') return '/employee/dashboard';
    return '/login';
  };

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="clients" element={<ClientList />} />
        <Route path="employees" element={<EmployeeManagement />} />
        <Route path="tasks/:orderId" element={<TaskView />} />
        <Route path="salary-incentive" element={<SalaryIncentive />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="/client" element={<ProtectedRoute allowedRoles={['client']}><ClientLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<ClientDashboard />} />
      </Route>
      <Route path="/employee" element={<ProtectedRoute allowedRoles={['employee']}><EmployeeLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<EmployeeDashboard />} />
      </Route>
      <Route path="*" element={<Navigate to={getDefaultRoute()} replace />} />
    </Routes>
  );
};

export default AppRoutes;
