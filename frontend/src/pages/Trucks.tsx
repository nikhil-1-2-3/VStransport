import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { Plus, Truck as TruckIcon } from 'lucide-react';
import './AdminPanels.css';

interface Truck {
  _id: string;
  registrationNumber: string;
  capacityTons: number;
  makeAndModel?: string;
  status: string;
}

export const Trucks: React.FC = () => {
  const [trucks, setTrucks] = useState<Truck[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    registrationNumber: '',
    capacityTons: 0,
    makeAndModel: '',
    insuranceExpiry: '',
    permitExpiry: '',
    fitnessExpiry: ''
  });

  const fetchTrucks = async () => {
    try {
      const res = await apiClient.get('/trucks');
      setTrucks(res.data);
    } catch (error) {
      console.error('Failed to fetch trucks', error);
    }
  };

  useEffect(() => {
    fetchTrucks();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/trucks', formData);
      setIsModalOpen(false);
      fetchTrucks();
    } catch (error) {
      alert('Failed to create truck');
    }
  };

  return (
    <div className="admin-panel">
      <div className="panel-header">
        <div>
          <h1>Fleet Management</h1>
          <p>Manage your trucks, permits, and statuses.</p>
        </div>
        <button className="primary-btn" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Add Truck
        </button>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Registration</th>
              <th>Capacity</th>
              <th>Make/Model</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {trucks.map(truck => (
              <tr key={truck._id}>
                <td data-label="Registration">
                  <div className="user-cell">
                    <div className="avatar"><TruckIcon size={16} /></div>
                    <span>{truck.registrationNumber}</span>
                  </div>
                </td>
                <td data-label="Capacity">{truck.capacityTons} Tons</td>
                <td data-label="Make/Model">{truck.makeAndModel || 'N/A'}</td>
                <td data-label="Status"><span className={`status-badge ${truck.status === 'AVAILABLE' ? 'success' : ''}`}>{truck.status}</span></td>
              </tr>
            ))}
            {trucks.length === 0 && (
              <tr><td colSpan={4} className="empty-state">No trucks found. Add your first truck.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New Truck</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Registration Number (e.g. HR-38-1234)</label>
                <input required type="text" value={formData.registrationNumber} onChange={e => setFormData({...formData, registrationNumber: e.target.value})} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Capacity (Tons)</label>
                  <input required type="number" value={formData.capacityTons} onChange={e => setFormData({...formData, capacityTons: Number(e.target.value)})} />
                </div>
                <div className="form-group">
                  <label>Make & Model</label>
                  <input type="text" value={formData.makeAndModel} onChange={e => setFormData({...formData, makeAndModel: e.target.value})} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Insurance Expiry Date</label>
                  <input required type="date" value={formData.insuranceExpiry} onChange={e => setFormData({...formData, insuranceExpiry: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Fitness Expiry Date</label>
                  <input required type="date" value={formData.fitnessExpiry} onChange={e => setFormData({...formData, fitnessExpiry: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label>Permit Expiry Date</label>
                <input required type="date" value={formData.permitExpiry} onChange={e => setFormData({...formData, permitExpiry: e.target.value})} />
              </div>
              <div className="modal-actions">
                <button type="button" className="secondary-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="primary-btn">Save Truck</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
