import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, Clock } from 'lucide-react';
import apiClient from '../api/client';

export const Settings: React.FC = () => {
  const [requests, setRequests] = useState<any[]>([]);

  const fetchRequests = async () => {
    try {
      const res = await apiClient.get('/users/password-requests');
      setRequests(res.data);
    } catch (error) {
      console.error('Failed to fetch password requests');
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleApprove = async (id: string, currentUsername: string) => {
    const newPassword = prompt(`Enter the new password you want to set for driver ${currentUsername}:`);
    if (!newPassword) return;

    try {
      await apiClient.put(`/users/password-requests/${id}/approve`, { newPassword });
      alert('Password updated successfully!');
      fetchRequests();
    } catch (error) {
      alert('Failed to approve password change');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', color: '#0f172a', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Shield color="#2563eb" size={32} /> 
          Security & Access Controls
        </h1>
        <p style={{ color: '#475569' }}>Manage system security and approve driver password reset requests.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', color: '#0f172a', borderBottom: '2px solid #e2e8f0', paddingBottom: '0.5rem' }}>Pending Password Resets</h2>
        
        {requests.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', background: 'white', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
            <CheckCircle size={48} color="#16a34a" style={{ marginBottom: '1rem' }} />
            <h3 style={{ color: '#0f172a' }}>All Clear!</h3>
            <p style={{ color: '#64748b' }}>There are no pending password reset requests from drivers.</p>
          </div>
        ) : (
          requests.map(req => (
            <div key={req._id} style={{ 
              background: 'white', 
              borderRadius: '12px', 
              padding: '1.5rem', 
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)',
              borderLeft: '4px solid #f59e0b',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <Clock size={16} color="#f59e0b" />
                  <span style={{ fontWeight: '700', color: '#0f172a' }}>{req.driverId?.fullName} ({req.driverId?.username})</span>
                  <span style={{ fontSize: '0.8rem', color: '#64748b' }}>requested a password reset</span>
                </div>
                <p style={{ color: '#475569', margin: 0, fontSize: '0.9rem' }}><strong>Reason provided:</strong> {req.reason}</p>
                <p style={{ color: '#94a3b8', margin: '4px 0 0', fontSize: '0.8rem' }}>{new Date(req.createdAt).toLocaleString()}</p>
              </div>
              
              <button 
                onClick={() => handleApprove(req._id, req.driverId?.username)}
                style={{ 
                  background: '#2563eb', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                }}
              >
                Approve & Set Password
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
