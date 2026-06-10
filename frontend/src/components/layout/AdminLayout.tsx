import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useAuthStore } from '../../store/authStore';
import { requestNotificationPermission } from '../../utils/notificationUtils';
import './AdminLayout.css';

export const AdminLayout: React.FC = () => {
  const { user } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  useEffect(() => {
    // Globally request permission for push notifications when admin logs in
    if (user?.role === 'ADMIN') {
      requestNotificationPermission();
    }
  }, [user?.role]);

  return (
    <div className="admin-layout">
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setIsSidebarOpen(false)} />
      )}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="main-content">
        <Topbar onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
