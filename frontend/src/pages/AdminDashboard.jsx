import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../context/AuthContext';
import MetricsChart from '../components/MetricsChart';
import { ShieldAlert, Users, Trash, Award, HelpCircle, UserCheck, Heart, Sparkles, Sprout } from 'lucide-react';

const AdminDashboard = () => {
  const { token } = useAuth();
  
  const [activeTab, setActiveTab] = useState('analytics');
  const [pendingUsers, setPendingUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allDonations, setAllDonations] = useState([]);
  const [analytics, setAnalytics] = useState(null);

  const fetchPendingUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/users/pending`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPendingUsers(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAllUsers(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAllDonations = async () => {
    try {
      const res = await fetch(`${API_URL}/admin/donations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAllDonations(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`${API_URL}/analytics/dashboard`);
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
    fetchAllUsers();
    fetchAllDonations();
    fetchAnalytics();
  }, [token]);

  const handleVerify = async (userId, verifyStatus) => {
    if (!window.confirm(`Are you sure you want to mark this user as ${verifyStatus}?`)) return;
    try {
      const res = await fetch(`${API_URL}/admin/users/${userId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: verifyStatus })
      });
      if (res.ok) {
        alert(`Account successfully ${verifyStatus}!`);
        fetchPendingUsers();
        fetchAllUsers();
        fetchAnalytics();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("WARNING: This will permanently delete this user profile and all associated data. Proceed?")) return;
    try {
      const res = await fetch(`${API_URL}/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert("Account removed successfully.");
        fetchAllUsers();
        fetchPendingUsers();
        fetchAnalytics();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteDonation = async (donationId) => {
    if (!window.confirm("Delete this food donation listing from the system?")) return;
    try {
      const res = await fetch(`${API_URL}/admin/donations/${donationId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        alert("Listing removed.");
        fetchAllDonations();
        fetchAnalytics();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="container" style={{ marginTop: 32, marginBottom: 48 }}>
      {/* Top Aggregates Header (Analytics dashboard) */}
      {analytics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 32 }}>
          <div className="card glass-panel" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 16, padding: 16 }}>
            <div style={{ padding: 10, backgroundColor: 'rgba(16, 185, 129, 0.1)', borderRadius: 'var(--radius-md)', color: 'var(--primary)' }}>
              <Sprout size={28} />
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>CO₂ Saved</div>
              <div style={{ fontSize: 20, fontWeight: 800 }}>{analytics.total_co2_saved_kg} kg</div>
              <small style={{ fontSize: 10, color: 'var(--text-muted)' }}>Greenhouse Offset</small>
            </div>
          </div>
          
          <div className="card glass-panel" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 16, padding: 16 }}>
            <div style={{ padding: 10, backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: 'var(--radius-md)', color: 'var(--secondary)' }}>
              <Sparkles size={28} />
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Meals Saved</div>
              <div style={{ fontSize: 20, fontWeight: 800 }}>{analytics.total_meals_saved} meals</div>
              <small style={{ fontSize: 10, color: 'var(--text-muted)' }}>{analytics.total_weight_kg} kg food saved</small>
            </div>
          </div>

          <div className="card glass-panel" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 16, padding: 16 }}>
            <div style={{ padding: 10, backgroundColor: 'rgba(139, 92, 246, 0.1)', borderRadius: 'var(--radius-md)', color: 'var(--accent)' }}>
              <Heart size={28} fill="var(--accent)" />
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>NGO Partners</div>
              <div style={{ fontSize: 20, fontWeight: 800 }}>{analytics.active_ngos_count} NGOs</div>
              <small style={{ fontSize: 10, color: 'var(--text-muted)' }}>{analytics.ngos_served_count} active in pickups</small>
            </div>
          </div>

          <div className="card glass-panel" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 16, padding: 16 }}>
            <div style={{ padding: 10, backgroundColor: 'rgba(6, 182, 212, 0.1)', borderRadius: 'var(--radius-md)', color: 'var(--info)' }}>
              <Users size={28} />
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Restaurants</div>
              <div style={{ fontSize: 20, fontWeight: 800 }}>{analytics.active_restaurants_count} Stores</div>
              <small style={{ fontSize: 10, color: 'var(--text-muted)' }}>Verified donors</small>
            </div>
          </div>
        </div>
      )}

      {/* Tabs list */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: 24, gap: 24 }}>
        <button 
          onClick={() => setActiveTab('analytics')}
          style={{
            padding: '12px 4px',
            border: 'none',
            borderBottom: activeTab === 'analytics' ? '3px solid var(--primary)' : '3px solid transparent',
            background: 'transparent',
            fontWeight: 700,
            cursor: 'pointer',
            color: activeTab === 'analytics' ? 'var(--primary)' : 'var(--text-secondary)',
            fontSize: 15
          }}
        >
          Site Analytics
        </button>
        <button 
          onClick={() => setActiveTab('verifications')}
          style={{
            padding: '12px 4px',
            border: 'none',
            borderBottom: activeTab === 'verifications' ? '3px solid var(--primary)' : '3px solid transparent',
            background: 'transparent',
            fontWeight: 700,
            cursor: 'pointer',
            color: activeTab === 'verifications' ? 'var(--primary)' : 'var(--text-secondary)',
            fontSize: 15
          }}
        >
          Pending Approvals ({pendingUsers.length})
        </button>
        <button 
          onClick={() => setActiveTab('users')}
          style={{
            padding: '12px 4px',
            border: 'none',
            borderBottom: activeTab === 'users' ? '3px solid var(--primary)' : '3px solid transparent',
            background: 'transparent',
            fontWeight: 700,
            cursor: 'pointer',
            color: activeTab === 'users' ? 'var(--primary)' : 'var(--text-secondary)',
            fontSize: 15
          }}
        >
          Manage Accounts
        </button>
        <button 
          onClick={() => setActiveTab('donations')}
          style={{
            padding: '12px 4px',
            border: 'none',
            borderBottom: activeTab === 'donations' ? '3px solid var(--primary)' : '3px solid transparent',
            background: 'transparent',
            fontWeight: 700,
            cursor: 'pointer',
            color: activeTab === 'donations' ? 'var(--primary)' : 'var(--text-secondary)',
            fontSize: 15
          }}
        >
          Manage Listings
        </button>
      </div>

      {/* Tab: Analytics Charts & Leaderboard */}
      {activeTab === 'analytics' && analytics && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }} className="animate-fade-in">
          {/* Charts Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
            <div className="card glass-panel" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 16, marginBottom: 16 }}>Meals Distributed Trend (Pax)</h3>
              <div style={{ height: 220 }}>
                <MetricsChart trendData={analytics.monthly_trend} type="bar" />
              </div>
            </div>
            <div className="card glass-panel" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 16, marginBottom: 16 }}>Carbon Dioxide Saved Equivalent (CO₂ kg)</h3>
              <div style={{ height: 220 }}>
                <MetricsChart trendData={analytics.monthly_trend} type="line" />
              </div>
            </div>
          </div>

          {/* Environmental Calculator Widget */}
          <div className="card glass-panel" style={{
            padding: 24,
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08) 0%, rgba(59, 130, 246, 0.03) 100%)',
            border: '1px solid rgba(16, 185, 129, 0.2)'
          }}>
            <h3 style={{ fontSize: 18, color: 'var(--primary)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Sprout />
              CO₂ Emissions & Food Waste Calculator
            </h3>
            <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: '1.5' }}>
              For every 1 kilogram of surplus organic food rescued from landfill degradation:
            </p>
            <ul style={{ paddingLeft: 20, marginTop: 8, fontSize: 13.5, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li><strong>2.5 kg of CO₂ equivalent</strong> greenhouse gases are prevented from releasing into the atmosphere.</li>
              <li>Approximately <strong>2 balanced meals</strong> are safely delivered to families in shelter homes.</li>
            </ul>
            <div style={{ display: 'flex', gap: 24, marginTop: 16, borderTop: '1px solid var(--border-color)', paddingTop: 16 }}>
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>TOTAL WASTE AVOIDED</span>
                <div style={{ fontSize: 20, fontWeight: 800 }}>{analytics.total_weight_kg} kilograms</div>
              </div>
              <div>
                <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>EST. CARBON OFFSET</span>
                <div style={{ fontSize: 20, fontWeight: 800 }}>{analytics.total_co2_saved_kg} kg CO₂-eq</div>
              </div>
            </div>
          </div>

          {/* Leaderboard Table */}
          <div className="card glass-panel" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 17, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Award style={{ color: 'var(--warning)' }} />
              Top Rescuing Restaurants Leaderboard
            </h3>
            
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: 12 }}>Rank</th>
                    <th style={{ padding: 12 }}>Restaurant</th>
                    <th style={{ padding: 12 }}>Badge points</th>
                    <th style={{ padding: 12 }}>Badge level</th>
                    <th style={{ padding: 12 }}>Completed donations</th>
                    <th style={{ padding: 12 }}>Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.leaderboard.map((item, idx) => (
                    <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: 12, fontWeight: 'bold' }}>#{idx + 1}</td>
                      <td style={{ padding: 12, fontWeight: 600 }}>{item.name}</td>
                      <td style={{ padding: 12 }}>{item.points} pts</td>
                      <td style={{ padding: 12 }}>
                        <span className={`badge ${item.badge === 'Gold Hero' ? 'badge-warning' : item.badge === 'Silver Champion' ? 'badge-info' : 'badge-success'}`}>
                          {item.badge}
                        </span>
                      </td>
                      <td style={{ padding: 12 }}>{item.completed_donations} rescues</td>
                      <td style={{ padding: 12, fontWeight: 'bold', color: 'var(--warning)' }}>{item.rating} ★</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Pending Verifications */}
      {activeTab === 'verifications' && (
        <div className="animate-fade-in">
          {pendingUsers.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              No accounts awaiting verification. Excellent job!
            </div>
          ) : (
            <div className="card-grid">
              {pendingUsers.map(u => (
                <div key={u.id} className="card glass-panel" style={{ justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span className="badge badge-warning" style={{ textTransform: 'capitalize' }}>
                        {u.role}
                      </span>
                      <small style={{ color: 'var(--text-muted)' }}>
                        Registered {new Date(u.created_at).toLocaleDateString()}
                      </small>
                    </div>

                    <h3 style={{ fontSize: 18, marginBottom: 4 }}>{u.name}</h3>
                    <small style={{ color: 'var(--text-muted)', display: 'block', marginBottom: 12 }}>
                      {u.email} | {u.phone}
                    </small>
                    
                    <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>
                      {u.address}
                    </p>

                    <div style={{ fontSize: 12.5, backgroundColor: 'var(--bg-tertiary)', padding: 12, borderRadius: 'var(--radius-sm)', marginBottom: 16 }}>
                      {u.role === 'restaurant' ? (
                        <>
                          <div>FSSAI License: <strong>{u.profile?.license_number}</strong></div>
                          <div style={{ marginTop: 4, fontStyle: 'italic' }}>"{u.profile?.description}"</div>
                        </>
                      ) : (
                        <>
                          <div>NGO Registration: <strong>{u.profile?.registration_number}</strong></div>
                          <div style={{ marginTop: 4, fontStyle: 'italic' }}>"{u.profile?.description}"</div>
                        </>
                      )}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10, borderTop: '1px solid var(--border-color)', paddingTop: 16 }}>
                    <button 
                      onClick={() => handleVerify(u.id, 'verified')}
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1 }}
                    >
                      <UserCheck size={14} />
                      Verify
                    </button>
                    <button 
                      onClick={() => handleVerify(u.id, 'rejected')}
                      className="btn btn-secondary btn-sm"
                      style={{ color: 'var(--danger)', flex: 1 }}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Manage Accounts */}
      {activeTab === 'users' && (
        <div className="card glass-panel animate-fade-in" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, marginBottom: 16 }}>System Account Directory</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13.5 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: 12 }}>Name</th>
                  <th style={{ padding: 12 }}>Email</th>
                  <th style={{ padding: 12 }}>Role</th>
                  <th style={{ padding: 12 }}>Status</th>
                  <th style={{ padding: 12 }}>Registered</th>
                  <th style={{ padding: 12 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allUsers.map(u => (
                  <tr key={u.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: 12, fontWeight: 600 }}>{u.name}</td>
                    <td style={{ padding: 12 }}>{u.email}</td>
                    <td style={{ padding: 12, textTransform: 'capitalize' }}>{u.role}</td>
                    <td style={{ padding: 12 }}>
                      <span className={`badge ${u.status === 'verified' ? 'badge-success' : u.status === 'pending' ? 'badge-warning' : 'badge-danger'}`}>
                        {u.status}
                      </span>
                    </td>
                    <td style={{ padding: 12 }}>{new Date(u.created_at).toLocaleDateString()}</td>
                    <td style={{ padding: 12 }}>
                      {u.role !== 'admin' && (
                        <button 
                          onClick={() => handleDeleteUser(u.id)}
                          className="btn btn-secondary btn-sm"
                          style={{ color: 'var(--danger)', padding: '4px 8px' }}
                        >
                          <Trash size={12} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Manage Listings */}
      {activeTab === 'donations' && (
        <div className="card glass-panel animate-fade-in" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 16, marginBottom: 16 }}>All System Donations</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13.5 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                  <th style={{ padding: 12 }}>Food Title</th>
                  <th style={{ padding: 12 }}>Restaurant</th>
                  <th style={{ padding: 12 }}>Quantity</th>
                  <th style={{ padding: 12 }}>Weight</th>
                  <th style={{ padding: 12 }}>Status</th>
                  <th style={{ padding: 12 }}>Posted Date</th>
                  <th style={{ padding: 12 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {allDonations.map(d => (
                  <tr key={d.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: 12, fontWeight: 600 }}>{d.title}</td>
                    <td style={{ padding: 12 }}>{d.restaurant_name}</td>
                    <td style={{ padding: 12 }}>{d.quantity} pax</td>
                    <td style={{ padding: 12 }}>{d.weight_kg} kg</td>
                    <td style={{ padding: 12 }}>
                      <span className={`badge ${d.status === 'completed' ? 'badge-success' : d.status === 'available' ? 'badge-info' : 'badge-warning'}`}>
                        {d.status}
                      </span>
                    </td>
                    <td style={{ padding: 12 }}>{new Date(d.created_at).toLocaleDateString()}</td>
                    <td style={{ padding: 12 }}>
                      <button 
                        onClick={() => handleDeleteDonation(d.id)}
                        className="btn btn-secondary btn-sm"
                        style={{ color: 'var(--danger)', padding: '4px 8px' }}
                      >
                        <Trash size={12} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
