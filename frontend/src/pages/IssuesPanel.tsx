import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, Camera } from 'lucide-react';
import apiClient from '../api/client';

export const IssuesPanel: React.FC = () => {
  const [issues, setIssues] = useState<any[]>([]);

  const fetchIssues = async () => {
    try {
      const res = await apiClient.get('/issues');
      setIssues(res.data);
    } catch (error) {
      console.error('Failed to fetch issues');
    }
  };

  useEffect(() => {
    fetchIssues();
    // In a real scenario, we'd add a socket listener here for new issues
  }, []);

  const handleResolve = async (id: string) => {
    try {
      await apiClient.put(`/issues/${id}/resolve`);
      fetchIssues();
    } catch (error) {
      alert('Failed to resolve issue');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertTriangle color="var(--status-error)" size={32} /> 
          Driver Alerts & Issues
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>Review and resolve tickets submitted by drivers on the road.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {issues.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', background: 'white', borderRadius: '12px', border: '1px dashed #cbd5e1' }}>
            <CheckCircle size={48} color="var(--status-success)" style={{ marginBottom: '1rem' }} />
            <h3>No Active Alerts</h3>
            <p style={{ color: 'var(--text-secondary)' }}>All drivers are reporting normal operations.</p>
          </div>
        ) : (
          issues.map(issue => (
            <div key={issue._id} style={{ 
              background: 'white', 
              borderRadius: '12px', 
              padding: '1.5rem', 
              boxShadow: 'var(--shadow-sm)',
              borderLeft: `4px solid ${issue.status === 'OPEN' ? 'var(--status-error)' : 'var(--status-success)'}`,
              display: 'flex',
              gap: '2rem',
              alignItems: 'flex-start'
            }}>
              
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ 
                      padding: '4px 12px', 
                      borderRadius: '100px', 
                      fontSize: '0.8rem', 
                      fontWeight: 'bold',
                      background: issue.category === 'ACCIDENT' ? '#fee2e2' : '#f1f5f9',
                      color: issue.category === 'ACCIDENT' ? '#dc2626' : '#475569'
                    }}>
                      {issue.category.replace('_', ' ')}
                    </span>
                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      {new Date(issue.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <span style={{ 
                    fontWeight: 'bold', 
                    color: issue.status === 'OPEN' ? '#dc2626' : '#16a34a' 
                  }}>
                    {issue.status}
                  </span>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <h4 style={{ color: 'var(--text-primary)', marginBottom: '4px' }}>Driver: {issue.driverId?.fullName || 'Unknown'} ({issue.driverId?.phone})</h4>
                  <p style={{ color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                    {issue.description}
                  </p>
                </div>

                {issue.status === 'OPEN' && (
                  <button 
                    onClick={() => handleResolve(issue._id)}
                    style={{ 
                      background: '#16a34a', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px'
                    }}
                  >
                    <CheckCircle size={16} /> Mark as Resolved
                  </button>
                )}
              </div>

              {issue.photoUrl && (
                <div style={{ width: '200px', flexShrink: 0 }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Camera size={14} /> Attached Photo
                  </div>
                  <a href={`http://localhost:5000${issue.photoUrl}`} target="_blank" rel="noreferrer" style={{ display: 'block' }}>
                    <img 
                      src={`http://localhost:5000${issue.photoUrl}`} 
                      alt="Issue Proof" 
                      style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                    />
                  </a>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
