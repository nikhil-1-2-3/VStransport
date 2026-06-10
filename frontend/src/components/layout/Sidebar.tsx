import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Truck, Users, Briefcase, Settings, AlertTriangle } from 'lucide-react';
import './Sidebar.css';

const navItems = [
  { path: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Command Center' },
  { path: '/trips', icon: <Briefcase size={20} />, label: 'Dispatch & Trips' },
  { path: '/fleet', icon: <Truck size={20} />, label: 'Fleet Management' },
  { path: '/drivers', icon: <Users size={20} />, label: 'Drivers' },
  { path: '/companies', icon: <Briefcase size={20} />, label: 'Client Companies' },
  { path: '/settings', icon: <Settings size={20} />, label: 'Settings' },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="logo-box">
          <img src="/logo.png" alt="Logo" style={{ width: '40px', objectFit: 'contain' }} />
        </div>
        <h2 className="brand-name">TMP</h2>
        {/* Mobile close button inside sidebar header if needed, but clicking overlay is enough. We'll add a simple X button just in case. */}
        <button className="mobile-close-btn" onClick={onClose}>
          ✕
        </button>
      </div>
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
        <NavLink to="/issues" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <AlertTriangle size={20} color="var(--status-error)" />
          <span style={{ color: 'var(--status-error)', fontWeight: 'bold' }}>Driver Alerts</span>
        </NavLink>
      </nav>
      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="avatar">AD</div>
          <div className="user-info">
            <span className="user-name">System Admin</span>
            <span className="user-role">Administrator</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
