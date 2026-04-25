import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Auth from './pages/Auth';
import AdminLayout from './components/AdminLayout';
import AdminOverview from './pages/admin/AdminOverview';
import AdminUsers from './pages/admin/AdminUsers';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import ClientLayout from './components/ClientLayout';
import ClientDashboard from './pages/client/ClientDashboard';
import ClientMeasurements from './pages/client/ClientMeasurements';
import ClientPlans from './pages/client/ClientPlans';
import ClientChat from './pages/client/ClientChat';
import ClientProfile from './pages/client/ClientProfile';

function PrivateRoute({ children, allowedRoles }) {
  const { user, loading } = useAuth();
  if (loading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="animate-pulse text-accent text-xl">Загрузка...</div>
      </div>
    );
  }
  if (!user) return <Navigate to="/auth" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/client'} replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="auth" element={<Auth />} />
        <Route
          path="client"
          element={
            <PrivateRoute allowedRoles={['client']}>
              <ClientLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<ClientDashboard />} />
          <Route path="measurements" element={<ClientMeasurements />} />
          <Route path="plans" element={<ClientPlans />} />
          <Route path="chat" element={<ClientChat />} />
          <Route path="profile" element={<ClientProfile />} />
        </Route>
        <Route
          path="admin"
          element={
            <PrivateRoute allowedRoles={['admin']}>
              <AdminLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<AdminOverview />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="analytics" element={<AdminAnalytics />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
