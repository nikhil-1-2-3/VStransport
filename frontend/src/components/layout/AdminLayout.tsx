import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useAuthStore } from '../../store/authStore';
import { requestNotificationPermission } from '../../utils/notificationUtils';
import './AdminLayout.css';

export const AdminLayout: React.FC = () => {
  const { isAuthenticated, role } = useAuthStore();

  useEffect(() => {
    // Globally request permission for push notifications when admin logs in
    if (role === 'ADMIN') {
      requestNotificationPermission();
    }
  }, [role]);

  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="main-content">
        <Topbar />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
