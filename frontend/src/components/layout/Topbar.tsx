import React from 'react';
import { Bell, Search } from 'lucide-react';
import './Topbar.css';

export const Topbar: React.FC = () => {
  return (
    <header className="topbar">
      <div className="search-container">
        <Search className="search-icon" size={18} />
        <input 
          type="text" 
          placeholder="Search trips, trucks, drivers..." 
          className="search-input"
        />
      </div>
      <div className="topbar-actions">
        <button className="icon-button notification-btn">
          <Bell size={20} />
          <span className="notification-badge">3</span>
        </button>
      </div>
    </header>
  );
};
