import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../context/AuthContext';
import { Plus, Compass, Clock, Award, ShieldCheck, Trash, Eye, MapPin, Building, Phone } from 'lucide-react';

const RestaurantDashboard = () => {
  const { token, user, updateProfile } = useAuth();
  
  const [activeTab, setActiveTab] = useState('active');
  const [donations, setDonations] = useState([]);
  
  // Post Donation Form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [foodType, setFoodType] = useState('veg');
  const [quantity, setQuantity] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [expiryHours, setExpiryHours] = useState('6');
  const [imageUrl, setImageUrl] = useState('');
  
  // AI Suggestions modal state
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [selectedDonationForAI, setSelectedDonationForAI] = useState(null);
  
  // Profile editing state
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profileAddress, setProfileAddress] = useState(user?.address || '');
  const [profileDesc, setProfileDesc] = useState(user?.profile?.description || '');
  const [profileLic, setProfileLic] = useState(user?.profile?.license_number || '');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchDonations = async () => {
    try {
      const res = await fetch(`${API_URL}/restaurant/donations`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDonations(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, [token]);

  const handlePostDonation = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Calculate expiry time datetime
    const expTime = new Date();
    expTime.setHours(expTime.getHours() + parseInt(expiryHours));

    const payload = {
      title,
      description,
      food_type: foodType,
      quantity: parseFloat(quantity),
      weight_kg: parseFloat(weightKg),
      expiry_time: expTime.toISOString(),
      image_url: imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&auto=format&fit=crop&q=60' // Default fallback
    };

    try {
      const res = await fetch(`${API_URL}/restaurant/donations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to post donation');
      
      setSuccess('Donation posted successfully!');
      setTitle('');
      setDescription('');
      setQuantity('');
      setWeightKg('');
      setShowAddModal(false);
      fetchDonations();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDonation = async (id) => {
    if (!window.confirm("Are you sure you want to delete this donation listing?")) return;
    try {
      const res = await fetch(`${API_URL}/restaurant/donations/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchDonations();
      } else {
        const data = await res.json();
        alert(data.message || 'Error deleting donation');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFetchAI = async (donation) => {
    setSelectedDonationForAI(donation);
    setShowAIModal(true);
    setAiSuggestions([]);
    try {
      const res = await fetch(`${API_URL}/restaurant/ai-recommend/${donation.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAiSuggestions(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const payload = {
      name: profileName,
      phone: profilePhone,
      address: profileAddress,
      description: profileDesc,
      license_number: profileLic
    };

    try {
      const res = await fetch(`${API_URL}/restaurant/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to update profile');
      
      setSuccess('Profile updated successfully!');
      updateProfile(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filter donations
  const activeDonations = donations.filter(d => d.status === 'available' || d.status === 'claimed');
  const pastDonations = donations.filter(d => d.status === 'completed' || d.status === 'expired');

  // Compute Badge tier
  const points = user?.profile?.badge_points || 0;
  const badgeTier = points >= 200 ? 'Gold Hero' : points >= 100 ? 'Silver Champion' : 'Bronze Donor';
  const nextTierPoints = points >= 200 ? 500 : points >= 100 ? 200 : 100;
  const progressPercent = Math.min(100, (points / nextTierPoints) * 100);

  return (
    <div className="container" style={{ marginTop: 32, marginBottom: 48 }}>
      {/* Upper overview stats bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 32 }}>
        <div className="card glass-panel" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 20 }}>
          <div style={{ padding: 12, backgroundColor: 'var(--primary-glow)', borderRadius: 'var(--radius-md)', color: 'var(--primary)' }}>
            <Award size={32} />
          </div>
          <div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Badge Points</div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>{points} pts</div>
            <span className="badge badge-success" style={{ fontSize: 10 }}>{badgeTier}</span>
          </div>
        </div>

        <div className="card glass-panel" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 20 }}>
          <div style={{ padding: 12, backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: 'var(--radius-md)', color: 'var(--secondary)' }}>
            <Clock size={32} />
          </div>
          <div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Active Donations</div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>{activeDonations.length} items</div>
            <span className="badge badge-info" style={{ fontSize: 10 }}>Live on map</span>
          </div>
        </div>

        <div className="card glass-panel" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 20 }}>
          <div style={{ padding: 12, backgroundColor: 'rgba(139, 92, 246, 0.1)', borderRadius: 'var(--radius-md)', color: 'var(--accent)' }}>
            <ShieldCheck size={32} />
          </div>
          <div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>FSSAI Verification</div>
            <div style={{ fontSize: 24, fontWeight: 800 }}>Verified</div>
            <span className="badge badge-success" style={{ fontSize: 10 }}>Approved</span>
          </div>
        </div>
      </div>

      {/* Progress bar for points */}
      <div className="card glass-panel" style={{ padding: 20, marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 600, marginBottom: 8 }}>
          <span>Donor Tier Progress</span>
          <span>{points} / {nextTierPoints} Points</span>
        </div>
        <div className="expiry-progress" style={{ height: 10 }}>
          <div className="expiry-bar" style={{ width: `${progressPercent}%`, background: 'var(--primary)' }} />
        </div>
        <small style={{ color: 'var(--text-muted)', marginTop: 8, display: 'block' }}>
          * Earn +10 pts for posting a listing and +30 pts when an NGO confirms food pickup. Unlock Silver tier at 100 points, Gold at 200.
        </small>
      </div>

      {/* Main Tabs */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 24 }}>
          <button 
            onClick={() => setActiveTab('active')}
            style={{
              padding: '12px 4px',
              border: 'none',
              borderBottom: activeTab === 'active' ? '3px solid var(--primary)' : '3px solid transparent',
              background: 'transparent',
              fontWeight: 700,
              cursor: 'pointer',
              color: activeTab === 'active' ? 'var(--primary)' : 'var(--text-secondary)',
              fontSize: 15
            }}
          >
            Active Donations
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            style={{
              padding: '12px 4px',
              border: 'none',
              borderBottom: activeTab === 'history' ? '3px solid var(--primary)' : '3px solid transparent',
              background: 'transparent',
              fontWeight: 700,
              cursor: 'pointer',
              color: activeTab === 'history' ? 'var(--primary)' : 'var(--text-secondary)',
              fontSize: 15
            }}
          >
            Donation History
          </button>
          <button 
            onClick={() => setActiveTab('profile')}
            style={{
              padding: '12px 4px',
              border: 'none',
              borderBottom: activeTab === 'profile' ? '3px solid var(--primary)' : '3px solid transparent',
              background: 'transparent',
              fontWeight: 700,
              cursor: 'pointer',
              color: activeTab === 'profile' ? 'var(--primary)' : 'var(--text-secondary)',
              fontSize: 15
            }}
          >
            Business Profile
          </button>
        </div>

        {activeTab !== 'profile' && (
          <button onClick={() => setShowAddModal(true)} className="btn btn-primary">
            <Plus size={16} />
            <span>Post Surplus Food</span>
          </button>
        )}
      </div>

      {/* Tab Contents: Active */}
      {activeTab === 'active' && (
        <div>
          {activeDonations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              No active food donations. Click "Post Surplus Food" above to share meals!
            </div>
          ) : (
            <div className="card-grid">
              {activeDonations.map(d => {
                const hoursLeft = Math.round((new Date(d.expiry_time) - new Date()) / 1000 / 60 / 60);
                const isUrgent = hoursLeft <= 2;
                
                return (
                  <div key={d.id} className="card animate-fade-in" style={{ justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <span className={`badge ${d.status === 'available' ? 'badge-success' : 'badge-warning'}`}>
                          {d.status}
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4, color: isUrgent ? 'var(--danger)' : 'var(--text-secondary)' }}>
                          <Clock size={13} />
                          {hoursLeft > 0 ? `${hoursLeft} hrs left` : 'Expired'}
                        </span>
                      </div>
                      <h3 style={{ fontSize: 18, marginBottom: 8 }}>{d.title}</h3>
                      <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginBottom: 16 }}>{d.description}</p>
                      
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12.5, backgroundColor: 'var(--bg-tertiary)', padding: 12, borderRadius: 'var(--radius-sm)', marginBottom: 16 }}>
                        <div>Type: <strong>{d.food_type.toUpperCase()}</strong></div>
                        <div>Servings: <strong>{d.quantity} pax</strong></div>
                        <div>Weight: <strong>{d.weight_kg} kg</strong></div>
                        <div>CO₂ Saved: <strong>{d.co2_saved} kg</strong></div>
                      </div>

                      {d.claim && (
                        <div style={{ border: '1px dashed var(--warning)', padding: 12, borderRadius: 'var(--radius-sm)', marginBottom: 16, backgroundColor: 'rgba(245, 158, 11, 0.03)' }}>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>CLAIMED BY</div>
                          <div style={{ fontSize: 13, fontWeight: 700 }}>{d.claim.ngo_name}</div>
                          <div style={{ fontSize: 12, display: 'flex', alignItems: 'center', gap: 4, marginTop: 4, color: 'var(--primary)', fontWeight: 600 }}>
                            QR Hash: {d.claim.qr_code_hash}
                          </div>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: 10, borderTop: '1px solid var(--border-color)', paddingTop: 16, marginTop: 12 }}>
                      {d.status === 'available' && (
                        <>
                          <button 
                            onClick={() => handleFetchAI(d)}
                            className="btn btn-outline btn-sm"
                            style={{ flex: 1, color: 'var(--accent)', borderColor: 'var(--accent)' }}
                          >
                            <Compass size={14} />
                            <span>AI NGO Match</span>
                          </button>
                          <button 
                            onClick={() => handleDeleteDonation(d.id)}
                            className="btn btn-secondary btn-sm"
                            style={{ color: 'var(--danger)' }}
                          >
                            <Trash size={14} />
                          </button>
                        </>
                      )}
                      {d.status === 'claimed' && (
                        <div style={{ fontSize: 12.5, color: 'var(--text-muted)', textAlign: 'center', width: '100%', fontStyle: 'italic' }}>
                          Awaiting NGO collection
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab Contents: History */}
      {activeTab === 'history' && (
        <div>
          {pastDonations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              No completed donations yet.
            </div>
          ) : (
            <div className="card-grid">
              {pastDonations.map(d => (
                <div key={d.id} className="card animate-fade-in">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span className={`badge ${d.status === 'completed' ? 'badge-success' : 'badge-danger'}`}>
                      {d.status}
                    </span>
                    <small style={{ color: 'var(--text-muted)' }}>
                      {new Date(d.created_at).toLocaleDateString()}
                    </small>
                  </div>
                  <h3 style={{ fontSize: 18, marginBottom: 8 }}>{d.title}</h3>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12, backgroundColor: 'var(--bg-tertiary)', padding: 10, borderRadius: 'var(--radius-sm)' }}>
                    <div>Servings: <strong>{d.quantity}</strong></div>
                    <div>CO₂ Saved: <strong>{d.co2_saved} kg</strong></div>
                  </div>
                  
                  {d.claim && d.claim.status === 'completed' && (
                    <div style={{ marginTop: 12, fontSize: 12, color: 'var(--text-secondary)' }}>
                      Delivered to NGO: <strong>{d.claim.ngo_name}</strong>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Contents: Profile */}
      {activeTab === 'profile' && (
        <div className="card glass-panel" style={{ maxWidth: 640, margin: '0 auto', padding: 32 }}>
          <h2 style={{ marginBottom: 20, fontSize: 22 }}>Manage Restaurant Profile</h2>
          
          {success && <div className="badge badge-success" style={{ width: '100%', padding: 10, marginBottom: 16, textTransform: 'none', display: 'block' }}>{success}</div>}
          {error && <div className="badge badge-danger" style={{ width: '100%', padding: 10, marginBottom: 16, textTransform: 'none', display: 'block' }}>{error}</div>}

          <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">Restaurant Name</label>
              <input 
                type="text" 
                className="form-control" 
                value={profileName} 
                onChange={(e) => setProfileName(e.target.value)} 
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input 
                type="text" 
                className="form-control" 
                value={profilePhone} 
                onChange={(e) => setProfilePhone(e.target.value)} 
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Address</label>
              <input 
                type="text" 
                className="form-control" 
                value={profileAddress} 
                onChange={(e) => setProfileAddress(e.target.value)} 
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">FSSAI License Number</label>
              <input 
                type="text" 
                className="form-control" 
                value={profileLic} 
                onChange={(e) => setProfileLic(e.target.value)} 
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Restaurant Description</label>
              <textarea 
                className="form-control" 
                rows="4" 
                value={profileDesc} 
                onChange={(e) => setProfileDesc(e.target.value)} 
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving Updates...' : 'Save Profile Details'}
            </button>
          </form>
        </div>
      )}

      {/* Modal: Post Donation */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 style={{ fontSize: 20 }}>Post Surplus Food Listing</h3>
              <button onClick={() => setShowAddModal(false)} style={{ border: 'none', background: 'transparent', fontSize: 20, cursor: 'pointer', color: 'var(--text-muted)' }}>×</button>
            </div>
            <form onSubmit={handlePostDonation}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Surplus Item Title</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="e.g. Cooked Rice & Dal (30 Servings)" 
                    value={title} 
                    onChange={(e) => setTitle(e.target.value)} 
                    required 
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Details / Handling Instructions</label>
                  <textarea 
                    className="form-control" 
                    rows="3" 
                    placeholder="e.g. Refrigerated immediately. Packed in silver bags. Best consumed within 4 hours." 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Food Type</label>
                    <select className="form-control" value={foodType} onChange={(e) => setFoodType(e.target.value)}>
                      <option value="veg">Veg</option>
                      <option value="non-veg">Non-Veg</option>
                      <option value="vegan">Vegan</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Quantity (Servings)</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      placeholder="30" 
                      value={quantity} 
                      onChange={(e) => setQuantity(e.target.value)} 
                      required 
                    />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div className="form-group">
                    <label className="form-label">Est. Weight (kg)</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      className="form-control" 
                      placeholder="12.5" 
                      value={weightKg} 
                      onChange={(e) => setWeightKg(e.target.value)} 
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Expires In (Hours)</label>
                    <select className="form-control" value={expiryHours} onChange={(e) => setExpiryHours(e.target.value)}>
                      <option value="2">2 Hours (Urgent)</option>
                      <option value="4">4 Hours</option>
                      <option value="6">6 Hours</option>
                      <option value="12">12 Hours</option>
                      <option value="24">24 Hours</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowAddModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Posting...' : 'Confirm Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: AI Suggestions */}
      {showAIModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 500 }}>
            <div className="modal-header" style={{ backgroundColor: 'rgba(139, 92, 246, 0.05)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Compass style={{ color: 'var(--accent)' }} />
                <h3 style={{ fontSize: 18 }}>AI NGO Matchmaker</h3>
              </div>
              <button onClick={() => setShowAIModal(false)} style={{ border: 'none', background: 'transparent', fontSize: 20, cursor: 'pointer', color: 'var(--text-muted)' }}>×</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <p style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>
                Based on the location of <strong>{selectedDonationForAI?.title}</strong>, ShareMeal's algorithms suggest these nearest verified NGOs:
              </p>
              
              {aiSuggestions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)' }}>
                  Finding nearest NGOs...
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {aiSuggestions.map((ngo, index) => (
                    <div 
                      key={ngo.ngo_id} 
                      className="glass-panel" 
                      style={{
                        padding: 14,
                        borderLeft: index === 0 ? '4px solid var(--accent)' : '1px solid var(--border-color)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 6
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, fontSize: 14.5 }}>
                          {index + 1}. {ngo.name}
                        </span>
                        <span className="badge badge-success" style={{ fontSize: 9, backgroundColor: 'rgba(139, 92, 246, 0.1)', color: 'var(--accent)' }}>
                          Score: {ngo.match_score}
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, fontSize: 12, color: 'var(--text-secondary)' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <MapPin size={13} style={{ color: 'var(--primary)' }} />
                          {ngo.distance_km} km away
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <Award size={13} style={{ color: 'var(--warning)' }} />
                          Rating: {ngo.rating} ★
                        </span>
                      </div>
                      <div style={{ display: 'flex', gap: 4, alignItems: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
                        <Building size={13} />
                        {ngo.address}
                      </div>
                      <div style={{ display: 'flex', gap: 4, alignItems: 'center', fontSize: 12, color: 'var(--text-muted)' }}>
                        <Phone size={13} />
                        {ngo.phone}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowAIModal(false)} className="btn btn-secondary">Close Matchmaker</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantDashboard;
