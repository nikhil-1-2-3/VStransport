import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Truck, Users, Briefcase, FileText, Settings, AlertTriangle } from 'lucide-react';
import './Sidebar.css';

const navItems = [
  { path: '/dashboard', icon: <LayoutDashboard size={20} />, label: 'Command Center' },
  { path: '/trips', icon: <Briefcase size={20} />, label: 'Dispatch & Trips' },
  { path: '/fleet', icon: <Truck size={20} />, label: 'Fleet Management' },
  { path: '/drivers', icon: <Users size={20} />, label: 'Drivers' },
  { path: '/companies', icon: <Briefcase size={20} />, label: 'Client Companies' },
  { path: '/settings', icon: <Settings size={20} />, label: 'Settings' },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-box">
          <Truck className="logo-icon" size={24} />
        </div>
        <h2 className="brand-name">TMP</h2>
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
