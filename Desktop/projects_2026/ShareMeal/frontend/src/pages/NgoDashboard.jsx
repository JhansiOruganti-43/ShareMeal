import React, { useState, useEffect } from 'react';
import { useAuth, API_URL } from '../context/AuthContext';
import MapContainer from '../components/MapContainer';
import { Search, Compass, MapPin, ClipboardList, CheckCircle, Heart, Star, QrCode } from 'lucide-react';

const NgoDashboard = () => {
  const { token, user, updateProfile } = useAuth();
  
  const [activeTab, setActiveTab] = useState('browse');
  const [donations, setDonations] = useState([]);
  const [claims, setClaims] = useState([]);
  
  // Filters state
  const [foodTypeFilter, setFoodTypeFilter] = useState('');
  const [distanceFilter, setDistanceFilter] = useState('');

  // Rating Modal state
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [selectedClaimForRating, setSelectedClaimForRating] = useState(null);
  const [ratingScore, setRatingScore] = useState(5);
  const [ratingComment, setRatingComment] = useState('');

  // Profile fields state
  const [profileName, setProfileName] = useState(user?.name || '');
  const [profilePhone, setProfilePhone] = useState(user?.phone || '');
  const [profileAddress, setProfileAddress] = useState(user?.address || '');
  const [profileDesc, setProfileDesc] = useState(user?.profile?.description || '');
  const [profileReg, setProfileReg] = useState(user?.profile?.registration_number || '');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchAvailableDonations = async () => {
    try {
      let url = `${API_URL}/ngo/donations`;
      const params = [];
      if (foodTypeFilter) params.push(`food_type=${foodTypeFilter}`);
      if (distanceFilter) params.push(`max_distance=${distanceFilter}`);
      if (params.length > 0) url += `?${params.join('&')}`;

      const res = await fetch(url, {
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

  const fetchClaimsHistory = async () => {
    try {
      const res = await fetch(`${API_URL}/ngo/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setClaims(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAvailableDonations();
    fetchClaimsHistory();
  }, [token, foodTypeFilter, distanceFilter]);

  const handleClaim = async (donation) => {
    if (!window.confirm(`Do you want to claim "${donation.title}" for pickup?`)) return;
    
    try {
      const res = await fetch(`${API_URL}/ngo/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ donation_id: donation.id })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to claim donation');
      
      alert('Surplus claimed successfully! Check the "Active Pickups" tab for your QR code confirmation.');
      fetchAvailableDonations();
      fetchClaimsHistory();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleConfirmPickupSimulate = async (claim) => {
    const inputHash = window.prompt(`Simulating QR scan. To confirm food collection, enter the QR Code Hash shown on the card:`, claim.qr_code_hash);
    if (!inputHash) return;

    try {
      const res = await fetch(`${API_URL}/ngo/confirm-pickup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          claim_id: claim.id,
          qr_code_hash: inputHash
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Pickup verification failed');
      
      alert('Pickup confirmed successfully!');
      fetchClaimsHistory();
      fetchAvailableDonations();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleOpenRating = (claim) => {
    setSelectedClaimForRating(claim);
    setRatingScore(5);
    setRatingComment('');
    setShowRatingModal(true);
  };

  const handleSubmitRating = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/ngo/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          claim_id: selectedClaimForRating.id,
          score: ratingScore,
          comment: ratingComment
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to submit rating');
      
      alert('Rating submitted successfully!');
      setShowRatingModal(false);
      fetchClaimsHistory();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
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
      registration_number: profileReg
    };

    try {
      const res = await fetch(`${API_URL}/ngo/profile`, {
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

  // Group claims
  const activeClaims = claims.filter(c => c.status === 'pending_pickup');
  const pastClaims = claims.filter(c => c.status === 'completed' || c.status === 'cancelled');

  // Center maps
  const mapCenter = user?.latitude && user?.longitude ? [user.latitude, user.longitude] : [17.4401, 78.3489];

  return (
    <div className="container" style={{ marginTop: 32, marginBottom: 48 }}>
      {/* Tab Selectors */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', marginBottom: 24 }}>
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
          <button 
            onClick={() => setActiveTab('browse')}
            style={{
              padding: '12px 4px',
              border: 'none',
              borderBottom: activeTab === 'browse' ? '3px solid var(--primary)' : '3px solid transparent',
              background: 'transparent',
              fontWeight: 700,
              cursor: 'pointer',
              color: activeTab === 'browse' ? 'var(--primary)' : 'var(--text-secondary)',
              fontSize: 15
            }}
          >
            Browse Nearby Food
          </button>
          <button 
            onClick={() => setActiveTab('map')}
            style={{
              padding: '12px 4px',
              border: 'none',
              borderBottom: activeTab === 'map' ? '3px solid var(--primary)' : '3px solid transparent',
              background: 'transparent',
              fontWeight: 700,
              cursor: 'pointer',
              color: activeTab === 'map' ? 'var(--primary)' : 'var(--text-secondary)',
              fontSize: 15
            }}
          >
            Map View
          </button>
          <button 
            onClick={() => setActiveTab('my-claims')}
            style={{
              padding: '12px 4px',
              border: 'none',
              borderBottom: activeTab === 'my-claims' ? '3px solid var(--primary)' : '3px solid transparent',
              background: 'transparent',
              fontWeight: 700,
              cursor: 'pointer',
              color: activeTab === 'my-claims' ? 'var(--primary)' : 'var(--text-secondary)',
              fontSize: 15
            }}
          >
            Active Pickups ({activeClaims.length})
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
            Pickup History
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
            NGO Profile
          </button>
        </div>
      </div>

      {/* Tab Panel: Browse */}
      {activeTab === 'browse' && (
        <div>
          {/* Filters Bar */}
          <div className="card glass-panel" style={{ padding: 16, display: 'flex', flexDirection: 'row', gap: 16, flexWrap: 'wrap', alignItems: 'center', marginBottom: 24 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-secondary)', fontWeight: 600, fontSize: 14 }}>
              <Search size={18} />
              Filter Listings:
            </div>
            
            <select 
              className="form-control" 
              style={{ padding: '8px 12px', minWidth: 140 }}
              value={foodTypeFilter}
              onChange={(e) => setFoodTypeFilter(e.target.value)}
            >
              <option value="">All Food Types</option>
              <option value="veg">Vegetarian</option>
              <option value="non-veg">Non-Vegetarian</option>
              <option value="vegan">Vegan</option>
            </select>

            <select 
              className="form-control" 
              style={{ padding: '8px 12px', minWidth: 140 }}
              value={distanceFilter}
              onChange={(e) => setDistanceFilter(e.target.value)}
            >
              <option value="">Any Distance</option>
              <option value="2">Within 2 km</option>
              <option value="5">Within 5 km</option>
              <option value="10">Within 10 km</option>
              <option value="20">Within 20 km</option>
            </select>
          </div>

          {donations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              No available surplus donations found nearby. Try updating your filters or location.
            </div>
          ) : (
            <div className="card-grid">
              {donations.map(d => {
                const hoursLeft = Math.round((new Date(d.expiry_time) - new Date()) / 1000 / 60 / 60);
                return (
                  <div key={d.id} className="card animate-fade-in" style={{ justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                        <span className="badge badge-success">{d.food_type}</span>
                        {d.distance_km !== undefined && (
                          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <MapPin size={14} />
                            {d.distance_km} km away
                          </span>
                        )}
                      </div>
                      
                      <h3 style={{ fontSize: 18, marginBottom: 4 }}>{d.title}</h3>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)', display: 'block', marginBottom: 12 }}>
                        From: <strong>{d.restaurant_name}</strong> ({d.restaurant_address})
                      </span>
                      
                      <p style={{ fontSize: 13.5, color: 'var(--text-secondary)', marginBottom: 16 }}>
                        {d.description}
                      </p>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, fontSize: 12.5, backgroundColor: 'var(--bg-tertiary)', padding: 10, borderRadius: 'var(--radius-sm)', marginBottom: 16 }}>
                        <div>Servings: <strong>{d.quantity} pax</strong></div>
                        <div>Weight: <strong>{d.weight_kg} kg</strong></div>
                        <div style={{ gridColumn: 'span 2' }}>
                          Expires in: <strong>{hoursLeft > 0 ? `${hoursLeft} hours` : 'Expired'}</strong>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleClaim(d)}
                      className="btn btn-primary"
                      style={{ width: '100%', padding: '10px' }}
                    >
                      <ClipboardList size={16} />
                      Claim For Collection
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Tab Panel: Map View */}
      {activeTab === 'map' && (
        <div style={{ height: '500px', width: '100%', position: 'relative' }} className="animate-fade-in">
          <MapContainer 
            center={mapCenter} 
            donations={donations}
            userLocation={user}
            onClaim={handleClaim}
          />
        </div>
      )}

      {/* Tab Panel: My Claims */}
      {activeTab === 'my-claims' && (
        <div>
          {activeClaims.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              No active pickups claimed. Head over to "Browse" and claim some meals!
            </div>
          ) : (
            <div className="card-grid">
              {activeClaims.map(c => (
                <div key={c.id} className="card glass-panel animate-fade-in" style={{ borderColor: 'var(--warning)', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span className="badge badge-warning">Awaiting Collection</span>
                      <small style={{ color: 'var(--text-muted)' }}>
                        Claimed {new Date(c.claimed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </small>
                    </div>

                    <h3 style={{ fontSize: 18, marginBottom: 4 }}>{c.donation?.title}</h3>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 12 }}>
                      Pickup Address: <strong>{c.donation?.restaurant_name}</strong> - {c.donation?.restaurant_address}
                    </span>

                    {/* QR Code Container */}
                    <div className="glass-panel" style={{
                      margin: '16px 0',
                      padding: 16,
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px dashed var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 8
                    }}>
                      <QrCode size={48} style={{ color: 'var(--text-primary)' }} />
                      <div style={{ fontSize: 14, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--primary)' }}>
                        {c.qr_code_hash}
                      </div>
                      <small style={{ color: 'var(--text-muted)', fontSize: 10.5, textAlign: 'center' }}>
                        Provide this QR hash code to the restaurant representative during pickup to verify collection.
                      </small>
                    </div>
                  </div>

                  <button 
                    onClick={() => handleConfirmPickupSimulate(c)}
                    className="btn btn-primary"
                    style={{ width: '100%', backgroundColor: 'var(--secondary)' }}
                  >
                    <CheckCircle size={16} />
                    Simulate QR Confirm
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Panel: History */}
      {activeTab === 'history' && (
        <div>
          {pastClaims.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              No completed pickups yet.
            </div>
          ) : (
            <div className="card-grid">
              {pastClaims.map(c => (
                <div key={c.id} className="card animate-fade-in" style={{ justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                      <span className={`badge ${c.status === 'completed' ? 'badge-success' : 'badge-danger'}`}>
                        {c.status}
                      </span>
                      <small style={{ color: 'var(--text-muted)' }}>
                        {new Date(c.claimed_at).toLocaleDateString()}
                      </small>
                    </div>
                    <h3 style={{ fontSize: 17, marginBottom: 4 }}>{c.donation?.title}</h3>
                    <small style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: 12 }}>
                      From: <strong>{c.donation?.restaurant_name}</strong>
                    </small>
                  </div>

                  {c.status === 'completed' && (
                    <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 14, marginTop: 12 }}>
                      {c.is_rated ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--warning)', fontSize: 13, fontWeight: 600 }}>
                          <Star size={16} fill="var(--warning)" />
                          NGO Rated: {c.rating?.score} Stars
                        </div>
                      ) : (
                        <button 
                          onClick={() => handleOpenRating(c)}
                          className="btn btn-outline btn-sm"
                          style={{ width: '100%', color: 'var(--warning)', borderColor: 'var(--warning)' }}
                        >
                          <Star size={14} />
                          Leave Feedback
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab Panel: Profile */}
      {activeTab === 'profile' && (
        <div className="card glass-panel" style={{ maxWidth: 640, margin: '0 auto', padding: 32 }}>
          <h2 style={{ marginBottom: 20, fontSize: 22 }}>NGO Organization Details</h2>
          
          {success && <div className="badge badge-success" style={{ width: '100%', padding: 10, marginBottom: 16, textTransform: 'none', display: 'block' }}>{success}</div>}
          {error && <div className="badge badge-danger" style={{ width: '100%', padding: 10, marginBottom: 16, textTransform: 'none', display: 'block' }}>{error}</div>}

          <form onSubmit={handleUpdateProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label">NGO Organization Name</label>
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
              <label className="form-label">Office Address</label>
              <input 
                type="text" 
                className="form-control" 
                value={profileAddress} 
                onChange={(e) => setProfileAddress(e.target.value)} 
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Govt. Registration Number</label>
              <input 
                type="text" 
                className="form-control" 
                value={profileReg} 
                onChange={(e) => setProfileReg(e.target.value)} 
                required 
              />
            </div>
            <div className="form-group">
              <label className="form-label">Mission Mandate Details</label>
              <textarea 
                className="form-control" 
                rows="4" 
                value={profileDesc} 
                onChange={(e) => setProfileDesc(e.target.value)} 
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Update Settings'}
            </button>
          </form>
        </div>
      )}

      {/* Modal: Rating Review */}
      {showRatingModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: 440 }}>
            <div className="modal-header">
              <h3 style={{ fontSize: 18 }}>Rate Food Donation Quality</h3>
              <button onClick={() => setShowRatingModal(false)} style={{ border: 'none', background: 'transparent', fontSize: 20, cursor: 'pointer', color: 'var(--text-muted)' }}>×</button>
            </div>
            <form onSubmit={handleSubmitRating}>
              <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <p style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>
                  Provide feedback for <strong>{selectedClaimForRating?.donation?.title}</strong> by <strong>{selectedClaimForRating?.donation?.restaurant_name}</strong>:
                </p>
                
                <div className="form-group">
                  <label className="form-label">Quality Score (1-5 Stars)</label>
                  <select 
                    className="form-control" 
                    value={ratingScore} 
                    onChange={(e) => setRatingScore(parseInt(e.target.value))}
                  >
                    <option value="5">5 Stars - Excellent Packaging & Quality</option>
                    <option value="4">4 Stars - Good Quality Food</option>
                    <option value="3">3 Stars - Average Quality</option>
                    <option value="2">2 Stars - Poor Quality or Care</option>
                    <option value="1">1 Star - Unsatisfactory or Spoiled</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Write Feedback Comments</label>
                  <textarea 
                    className="form-control" 
                    rows="3" 
                    placeholder="e.g. Excellent containers, warm food, and helpful staff during pickup." 
                    value={ratingComment} 
                    onChange={(e) => setRatingComment(e.target.value)}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" onClick={() => setShowRatingModal(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ backgroundColor: 'var(--warning)' }} disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Rating'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default NgoDashboard;
