import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { Plus, User as UserIcon } from 'lucide-react';
import './AdminPanels.css';

interface Driver {
  _id: string;
  username: string;
  fullName: string;
  phone?: string;
  licenseNumber?: string;
  isActive: boolean;
  status?: string;
}

export const Drivers: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    fullName: '',
    phone: '',
    licenseNumber: ''
  });

  const fetchDrivers = async () => {
    try {
      const res = await apiClient.get('/users/drivers');
      setDrivers(res.data);
    } catch (error) {
      console.error('Failed to fetch drivers', error);
    }
  };

  useEffect(() => {
    fetchDrivers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/users', { ...formData, role: 'DRIVER' });
      setIsModalOpen(false);
      fetchDrivers(); // Refresh list
    } catch (error) {
      alert('Failed to create driver');
    }
  };

  return (
    <div className="admin-panel">
      <div className="panel-header">
        <div>
          <h1>Driver Management</h1>
          <p>Manage your fleet drivers and system access.</p>
        </div>
        <button className="primary-btn" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> New Driver
        </button>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Driver Name</th>
              <th>Username</th>
              <th>Phone</th>
              <th>License No.</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map(driver => (
              <tr key={driver._id}>
                <td>
                  <div className="user-cell">
                    <div className="avatar"><UserIcon size={16} /></div>
                    <span>{driver.fullName}</span>
                  </div>
                </td>
                <td>{driver.username}</td>
                <td>{driver.phone || 'N/A'}</td>
                <td>{driver.licenseNumber || 'N/A'}</td>
                <td>
                  <span className={`status-badge ${driver.status === 'ENGAGED' ? 'warning' : 'success'}`}>
                    {driver.status || 'AVAILABLE'}
                  </span>
                </td>
              </tr>
            ))}
            {drivers.length === 0 && (
              <tr><td colSpan={5} className="empty-state">No drivers found. Create one to get started.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New Driver</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input required type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Login Username</label>
                  <input required type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Initial Password</label>
                  <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Phone Number (WhatsApp)</label>
                  <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>License Number</label>
                  <input type="text" value={formData.licenseNumber} onChange={e => setFormData({...formData, licenseNumber: e.target.value})} />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="secondary-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="primary-btn">Create Driver</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
