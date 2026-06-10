import React, { useState, useEffect } from 'react';
import apiClient from '../api/client';
import { Plus, Building2 } from 'lucide-react';
import './AdminPanels.css';

interface Company {
  _id: string;
  name: string;
  contactPerson?: string;
  contactPhone?: string;
  isActive: boolean;
}

export const Companies: React.FC = () => {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    contactPerson: '',
    contactPhone: '',
    address: '',
    gstNumber: ''
  });

  const fetchCompanies = async () => {
    try {
      const res = await apiClient.get('/companies');
      setCompanies(res.data);
    } catch (error) {
      console.error('Failed to fetch companies', error);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.post('/companies', formData);
      setIsModalOpen(false);
      fetchCompanies();
    } catch (error) {
      alert('Failed to create company');
    }
  };

  return (
    <div className="admin-panel">
      <div className="panel-header">
        <div>
          <h1>Client Companies</h1>
          <p>Manage the cement companies you transport for.</p>
        </div>
        <button className="primary-btn" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Add Company
        </button>
      </div>

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Company Name</th>
              <th>Contact Person</th>
              <th>Contact Phone</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {companies.map(company => (
              <tr key={company._id}>
                <td data-label="Company Name">
                  <div className="user-cell">
                    <div className="avatar"><Building2 size={16} /></div>
                    <span>{company.name}</span>
                  </div>
                </td>
                <td data-label="Contact Person">{company.contactPerson || 'N/A'}</td>
                <td data-label="Contact Phone">{company.contactPhone || 'N/A'}</td>
                <td data-label="Status"><span className="status-badge success">Active</span></td>
              </tr>
            ))}
            {companies.length === 0 && (
              <tr><td colSpan={4} className="empty-state">No companies found. Add your first client.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New Company</h2>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Company Name (e.g. Ambuja Cement)</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Contact Person</label>
                  <input type="text" value={formData.contactPerson} onChange={e => setFormData({...formData, contactPerson: e.target.value})} />
                </div>
                <div className="form-group">
                  <label>Contact Phone</label>
                  <input type="text" value={formData.contactPhone} onChange={e => setFormData({...formData, contactPhone: e.target.value})} />
                </div>
              </div>
              <div className="form-group">
                <label>Registered Address</label>
                <input type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              </div>
              <div className="form-group">
                <label>GST Number</label>
                <input type="text" value={formData.gstNumber} onChange={e => setFormData({...formData, gstNumber: e.target.value})} />
              </div>
              <div className="modal-actions">
                <button type="button" className="secondary-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="primary-btn">Save Company</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
