import React, { useState, useEffect } from 'react';
import { TrendingUp, Truck, Users, Activity } from 'lucide-react';
import apiClient from '../api/client';
import './Dashboard.css';

const StatCard = ({ title, value, subtitle, icon: Icon, trend }: any) => (
  <div className="stat-card">
    <div className="stat-header">
      <h3 className="stat-title">{title}</h3>
      <div className="stat-icon-wrapper"><Icon size={20} className="stat-icon" /></div>
    </div>
    <div className="stat-value">{value}</div>
    <div className="stat-footer">
      {trend !== undefined && (
        <span className={`trend ${trend >= 0 ? 'positive' : 'negative'}`}>
          {trend >= 0 ? '+' : ''}{trend}%
        </span>
      )}
      <span className="stat-subtitle">{subtitle}</span>
    </div>
  </div>
);

export const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    activeTrips: 0,
    totalTrucks: 0,
    availableTrucks: 0,
    activeDrivers: 0,
    totalTonnageMoved: 0
  });

  const fetchStats = async () => {
    try {
      const res = await apiClient.get('/dashboard/stats');
      setStats(res.data);
    } catch (error) {
      console.error('Failed to fetch stats', error);
    }
  };

  useEffect(() => {
    fetchStats();
    // Poll every 30 seconds
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="page-title">Command Center</h1>
        <div className="date-filter">Real-time Overview</div>
      </div>

      <div className="stats-grid">
        <StatCard 
          title="Active Trips" 
          value={stats.activeTrips.toString()} 
          subtitle="currently on route" 
          icon={Activity} 
        />
        <StatCard 
          title="Available Trucks" 
          value={stats.availableTrucks.toString()} 
          subtitle={`out of ${stats.totalTrucks} total`} 
          icon={Truck} 
        />
        <StatCard 
          title="Active Drivers" 
          value={stats.activeDrivers.toString()} 
          subtitle="ready for dispatch" 
          icon={Users} 
        />
        <StatCard 
          title="Tonnage Moved" 
          value={`${stats.totalTonnageMoved}T`} 
          subtitle="completed volume" 
          icon={TrendingUp} 
        />
      </div>

      <div className="dashboard-content">
        <div className="chart-section">
          <div className="section-header">
            <h2>Live Tracking</h2>
            <button className="btn-secondary">View Map</button>
          </div>
          <div className="chart-placeholder">
            <div className="pulse-dot"></div>
            <p>Real-time map and trip metrics will appear here.</p>
          </div>
        </div>
        <div className="feed-section">
          <div className="section-header">
            <h2>Recent Activity</h2>
          </div>
          <div className="activity-feed">
            <div className="activity-item">
              <div className="activity-dot bg-success"></div>
              <div className="activity-content">
                <p className="activity-text">Command Center activated. All systems online.</p>
                <span className="activity-time">Just now</span>
              </div>
            </div>
            {stats.activeTrips > 0 && (
              <div className="activity-item">
                <div className="activity-dot bg-info"></div>
                <div className="activity-content">
                  <p className="activity-text"><strong>{stats.activeTrips} trips</strong> are currently being monitored.</p>
                  <span className="activity-time">Live</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
