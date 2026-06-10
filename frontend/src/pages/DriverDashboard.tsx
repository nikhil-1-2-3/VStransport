import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, CheckCircle, Package, ChevronRight, AlertTriangle, Key, User, Bell, Truck, History, Map } from 'lucide-react';
import { socket } from '../services/socket';
import apiClient from '../api/client';
import { useAuthStore } from '../store/authStore';
import './DriverDashboard.css';

export const DriverDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const [activeTrip, setActiveTrip] = useState<any>(null);
  const [historyTrips, setHistoryTrips] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'CURRENT' | 'HISTORY' | 'ACCOUNT'>('CURRENT');
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [issueData, setIssueData] = useState({
    category: 'VEHICLE_ISSUE',
    description: '',
    photo: null as File | null
  });

  const fetchDriverData = async () => {
    if (!user) return;
    try {
      // Fetch all trips for history
      const allRes = await apiClient.get(`/trips/driver/${user.id}/all`);
      const allTrips = allRes.data;
      
      const completed = allTrips.filter((t: any) => t.status === 'COMPLETED');
      setHistoryTrips(completed);

      // Find active trip (not completed)
      const active = allTrips.find((t: any) => t.status !== 'COMPLETED');
      setActiveTrip(active || null);
    } catch (error) {
      console.error('Failed to fetch driver trips');
    }
  };

  useEffect(() => {
    fetchDriverData();
  }, [user]);

  const updateStatus = async (newStatus: string) => {
    if (!activeTrip) return;
    try {
      if (navigator.vibrate) navigator.vibrate([50, 50, 50]); // Haptic click
      await apiClient.put(`/trips/${activeTrip._id}/status`, { status: newStatus });
      socket.emit('update_status', { tripId: activeTrip.tripNumber, status: newStatus });
      fetchDriverData();
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const handleReportIssue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    let gpsText = '';
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 });
      });
      gpsText = `\n[GPS Location: https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}]`;
    } catch (err) {
      gpsText = '\n[GPS Location: Unavailable]';
    }

    const formData = new FormData();
    formData.append('driverId', user.id);
    formData.append('category', issueData.category);
    formData.append('description', issueData.description + gpsText);
    if (issueData.photo) {
      formData.append('photo', issueData.photo);
    }

    try {
      await apiClient.post('/issues', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Alert sent to Admin Command Center.');
      setIsIssueModalOpen(false);
      setIssueData({ category: 'VEHICLE_ISSUE', description: '', photo: null });
    } catch (error) {
      alert('Failed to report issue');
    }
  };

  // --- PROFILE UPDATE LOGIC ---
  const [profileData, setProfileData] = useState({ fullName: user?.fullName || '', username: user?.username || '' });
  const [passwordReason, setPasswordReason] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiClient.put(`/users/${user?.id}/profile`, profileData);
      alert('Profile updated successfully! Please login again to see changes everywhere.');
      setIsEditingProfile(false);
    } catch (error) {
      alert('Failed to update profile');
    }
  };

  const handleRequestPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordReason) return alert('Please provide a reason');
    try {
      await apiClient.post(`/users/${user?.id}/request-password-change`, { reason: passwordReason });
      alert('Password change request sent to Admin for approval.');
      setPasswordReason('');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to request password change');
    }
  };

  // --- SWIPE TO UPDATE COMPONENT ---
  const SwipeToUpdate = ({ currentStatus }: { currentStatus: string }) => {
    const swipeContainerRef = useRef<HTMLDivElement>(null);
    const swipeThumbRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);

    const getNextStatus = (status: string) => {
      switch (status) {
        case 'ASSIGNED': return { next: 'REACHED_PLANT', label: 'Swipe to Reached Plant' };
        case 'REACHED_PLANT': return { next: 'LOADED', label: 'Swipe to Loaded' };
        case 'LOADED': return { next: 'IN_TRANSIT', label: 'Swipe to In Transit' };
        case 'IN_TRANSIT': return { next: 'DELIVERED', label: 'Swipe to Delivered' };
        default: return { next: '', label: 'Delivered' };
      }
    };

    const nextStep = getNextStatus(currentStatus);

    if (currentStatus === 'DELIVERED') {
      return (
        <div className="swipe-container" style={{ justifyContent: 'center', background: 'rgba(16, 185, 129, 0.2)', border: '1px solid #10b981' }}>
          <span style={{ color: '#10b981', fontWeight: 'bold' }}><CheckCircle size={18} style={{ display: 'inline', marginBottom: '-4px' }}/> Delivery Complete</span>
        </div>
      );
    }

    const handleStart = (clientX: number) => {
      setIsDragging(true);
      setStartX(clientX);
    };

    const handleMove = (clientX: number) => {
      if (!isDragging || !swipeContainerRef.current || !swipeThumbRef.current) return;
      const containerWidth = swipeContainerRef.current.offsetWidth;
      const thumbWidth = swipeThumbRef.current.offsetWidth;
      const maxDrag = containerWidth - thumbWidth - 10;
      let newX = clientX - startX;
      
      if (newX < 0) newX = 0;
      if (newX > maxDrag) newX = maxDrag;

      swipeThumbRef.current.style.transform = `translateX(${newX}px)`;
      if (navigator.vibrate && newX % 20 < 2) navigator.vibrate(10); // Micro-vibrations while dragging
    };

    const handleEnd = () => {
      if (!isDragging || !swipeContainerRef.current || !swipeThumbRef.current) return;
      setIsDragging(false);
      const containerWidth = swipeContainerRef.current.offsetWidth;
      const thumbWidth = swipeThumbRef.current.offsetWidth;
      const maxDrag = containerWidth - thumbWidth - 10;
      
      const currentX = parseFloat(swipeThumbRef.current.style.transform.replace('translateX(', '').replace('px)', '') || '0');
      
      if (currentX > maxDrag * 0.8) {
        // Trigger Update
        updateStatus(nextStep.next);
      } else {
        // Snap back
        swipeThumbRef.current.style.transform = `translateX(0px)`;
      }
    };

    return (
      <div 
        className="swipe-container" 
        ref={swipeContainerRef}
        onMouseLeave={handleEnd}
        onMouseUp={handleEnd}
        onTouchEnd={handleEnd}
      >
        <div className="swipe-text">{nextStep.label}</div>
        <div 
          className="swipe-thumb" 
          ref={swipeThumbRef}
          onMouseDown={(e) => handleStart(e.clientX)}
          onMouseMove={(e) => handleMove(e.clientX)}
          onTouchStart={(e) => handleStart(e.touches[0].clientX)}
          onTouchMove={(e) => handleMove(e.touches[0].clientX)}
        >
          <ChevronRight />
        </div>
      </div>
    );
  };

  return (
    <div className="driver-dashboard-desktop">
      {/* Sidebar Navigation */}
      <aside className="driver-sidebar">
        <div className="sidebar-header">
          <img src="/logo.png" alt="Logo" style={{ width: '40px', objectFit: 'contain' }} />
          <h2 className="brand-title">TMP Driver</h2>
        </div>
        
        <nav className="sidebar-nav">
          <button 
            className={`nav-item ${activeTab === 'CURRENT' ? 'active' : ''}`}
            onClick={() => setActiveTab('CURRENT')}
          >
            <Map size={20} /> Current Dispatch
          </button>
          <button 
            className={`nav-item ${activeTab === 'HISTORY' ? 'active' : ''}`}
            onClick={() => setActiveTab('HISTORY')}
          >
            <History size={20} /> Trip History
          </button>
          <button 
            className={`nav-item ${activeTab === 'ACCOUNT' ? 'active' : ''}`}
            onClick={() => setActiveTab('ACCOUNT')}
          >
            <User size={20} /> My Profile
          </button>
        </nav>

        <div className="sidebar-footer">
          <button className="btn-report-issue" onClick={() => setIsIssueModalOpen(true)}>
            <AlertTriangle size={20} /> Report Incident
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="driver-main-content">
        <header className="content-header">
          <div className="header-title">
            <h1>
              {activeTab === 'CURRENT' && 'Active Dispatch'}
              {activeTab === 'HISTORY' && 'Dispatch History'}
              {activeTab === 'ACCOUNT' && 'Driver Account'}
            </h1>
            <p>Welcome back, {user?.fullName}</p>
          </div>
          <div className="header-actions">
            <div className="notification-bell">
              <Bell size={24} color="#64748b" />
              {activeTrip && <span className="notification-dot"></span>}
            </div>
            <div className="profile-chip">
              <div className="chip-avatar">{user?.fullName?.charAt(0) || 'D'}</div>
              <span className="chip-name">{user?.username}</span>
            </div>
          </div>
        </header>

        <div className="content-body fade-in">
          {activeTab === 'CURRENT' && (
            <div className="tab-pane">
              {!activeTrip ? (
                <div className="empty-state-desktop">
                  <Package size={64} color="#cbd5e1" />
                  <h2>No Active Trip</h2>
                  <p>You are currently unassigned. Wait for dispatch commands from the Command Center.</p>
                </div>
              ) : (
                <div className="active-trip-grid">
                  <div className="trip-card-desktop">
                    <h3 className="card-title">Route Information</h3>
                    <div className="trip-route-timeline">
                      <div className="timeline-item">
                        <div className="timeline-icon pickup"><Package size={18} /></div>
                        <div className="timeline-content">
                          <span className="timeline-label">PICKUP LOCATION</span>
                          <h4 className="timeline-value">{activeTrip.pickupLocation}</h4>
                          {activeTrip.pickupGoogleMapsLink && (
                            <a href={activeTrip.pickupGoogleMapsLink} target="_blank" rel="noreferrer" className="btn-navigate-small">
                              <Navigation size={14} /> Navigate to Pickup
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="timeline-line-desktop"></div>
                      <div className="timeline-item">
                        <div className="timeline-icon dropoff"><MapPin size={18} /></div>
                        <div className="timeline-content">
                          <span className="timeline-label">DROPOFF LOCATION</span>
                          <h4 className="timeline-value">{activeTrip.deliveryLocation}</h4>
                          {activeTrip.deliveryGoogleMapsLink && (
                            <a href={activeTrip.deliveryGoogleMapsLink} target="_blank" rel="noreferrer" className="btn-navigate-small">
                              <Navigation size={14} /> Navigate to Drop-off
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="status-update-card">
                    <h3 className="card-title">Update Status</h3>
                    <p className="card-subtitle">Swipe to update the dispatch center</p>
                    <div className="swipe-wrapper">
                      <SwipeToUpdate currentStatus={activeTrip.status} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'HISTORY' && (
            <div className="tab-pane">
              <div className="stats-overview-desktop">
                <div className="stat-box-desktop">
                  <span className="stat-value">{historyTrips.length}</span>
                  <span className="stat-label">Total Completed Trips</span>
                </div>
                <div className="stat-box-desktop">
                  <span className="stat-value">{historyTrips.length * 450} <small>km</small></span>
                  <span className="stat-label">Estimated Distance Driven</span>
                </div>
              </div>

              <div className="history-list-desktop">
                <h3 className="list-title">Recent Trips</h3>
                {historyTrips.length === 0 ? (
                  <div className="empty-state-small">
                    <History size={48} color="#cbd5e1" />
                    <p>No completed trips yet.</p>
                  </div>
                ) : (
                  <div className="history-grid">
                    {historyTrips.map(trip => (
                      <div key={trip._id} className="history-card-clean">
                        <div className="history-header-clean">
                          <span className="history-date">{new Date(trip.createdAt).toLocaleDateString()}</span>
                          <span className="badge-completed">Completed</span>
                        </div>
                        <div className="history-route-clean">
                          <span className="route-text">{trip.pickupLocation}</span>
                          <ChevronRight size={16} className="route-arrow" />
                          <span className="route-text">{trip.deliveryLocation}</span>
                        </div>
                        <div className="history-footer-clean">
                          <span>{trip.companyId?.name || 'Client'}</span>
                          <span className="weight-badge">{trip.loadWeightTons} Tons</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'ACCOUNT' && (
            <div className="tab-pane">
              <div className="account-desktop-grid">
                {/* PROFILE SECTION */}
                <div className={`account-card-desktop ${isEditingProfile ? 'editing' : ''}`}>
                  {!isEditingProfile ? (
                    <>
                      <div className="profile-header-desktop">
                        <div className="profile-avatar-giant">
                          {user?.fullName?.charAt(0) || 'D'}
                        </div>
                        <div className="profile-title-area">
                          <h2>{user?.fullName}</h2>
                          <span className="badge-active"><CheckCircle size={16}/> Active Fleet Driver</span>
                        </div>
                        <button className="btn-edit-desktop" onClick={() => setIsEditingProfile(true)}>
                          Edit Profile
                        </button>
                      </div>
                      
                      <div className="profile-details-grid-desktop">
                        <div className="detail-box">
                          <span className="detail-label">Username / ID</span>
                          <span className="detail-value">{user?.username}</span>
                        </div>
                        <div className="detail-box">
                          <span className="detail-label">Organization</span>
                          <span className="detail-value">V S Transport</span>
                        </div>
                        <div className="detail-box">
                          <span className="detail-label">Total Dispatch Count</span>
                          <span className="detail-value">{historyTrips.length}</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="edit-form-desktop">
                      <h3>Edit Professional Details</h3>
                      <form onSubmit={handleUpdateProfile}>
                        <div className="input-group">
                          <label>Full Legal Name</label>
                          <input 
                            type="text" 
                            value={profileData.fullName}
                            onChange={e => setProfileData({...profileData, fullName: e.target.value})}
                          />
                        </div>
                        <div className="input-group">
                          <label>Username / Contact Number</label>
                          <input 
                            type="text" 
                            value={profileData.username}
                            onChange={e => setProfileData({...profileData, username: e.target.value})}
                          />
                        </div>
                        <div className="form-actions-desktop">
                          <button type="button" className="btn-secondary" onClick={() => setIsEditingProfile(false)}>Cancel</button>
                          <button type="submit" className="btn-primary">Save Changes</button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>

                {/* SECURITY SECTION */}
                <div className="security-card-desktop">
                  <div className="security-header-desktop">
                    <div className="icon-wrap-error"><Key size={24} /></div>
                    <div>
                      <h3>Password Reset Request</h3>
                      <p>Security changes require Command Center approval.</p>
                    </div>
                  </div>
                  <form onSubmit={handleRequestPassword} className="security-form-desktop">
                    <div className="input-group">
                      <label>Reason for Password Change</label>
                      <input 
                        required
                        type="text" 
                        placeholder="e.g., Forgot password, Phone lost..."
                        value={passwordReason}
                        onChange={e => setPasswordReason(e.target.value)}
                      />
                    </div>
                    <button type="submit" className="btn-danger">Submit Request</button>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Incident Modal */}
      {isIssueModalOpen && (
        <div className="modal-backdrop">
          <div className="modal-centered">
            <div className="modal-header">
              <h2>Report Incident to Command Center</h2>
              <button className="btn-close" onClick={() => setIsIssueModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleReportIssue} className="incident-form">
              <div className="input-group">
                <label>Incident Category</label>
                <select 
                  value={issueData.category}
                  onChange={e => setIssueData({...issueData, category: e.target.value})}
                >
                  <option value="VEHICLE_ISSUE">Vehicle Breakdown</option>
                  <option value="ACCIDENT">Accident</option>
                  <option value="CHALLAN">Police Challan</option>
                  <option value="OTHER">Other Emergency</option>
                </select>
              </div>
              <div className="input-group">
                <label>Details / Description</label>
                <textarea 
                  required
                  rows={4}
                  value={issueData.description}
                  onChange={e => setIssueData({...issueData, description: e.target.value})}
                  placeholder="Provide details about what happened..."
                />
              </div>
              <div className="input-group">
                <label>Photo Evidence (Optional)</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={e => setIssueData({...issueData, photo: e.target.files ? e.target.files[0] : null})}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsIssueModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-danger">Send Emergency Alert</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
