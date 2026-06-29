import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Compass, MapPin, Building2, Shield, Heart } from 'lucide-react';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  // General fields
  const [role, setRole] = useState('restaurant'); // 'restaurant', 'ngo', 'admin'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');

  // Profile-specific fields
  const [licenseNumber, setLicenseNumber] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [description, setDescription] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Detect current coordinates
  const detectLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(6));
        setLongitude(position.coords.longitude.toFixed(6));
        setError('');
      },
      () => {
        setError('Unable to retrieve location coordinates. Please enter manually.');
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    const payload = {
      email,
      password,
      role,
      name,
      phone,
      address,
      latitude: latitude ? parseFloat(latitude) : null,
      longitude: longitude ? parseFloat(longitude) : null,
    };

    if (role === 'restaurant') {
      payload.license_number = licenseNumber;
      payload.description = description;
    } else if (role === 'ngo') {
      payload.registration_number = registrationNumber;
      payload.description = description;
    }

    try {
      const res = await register(payload);
      setSuccess(res.message || 'Registration successful!');
      // Scroll to top
      window.scrollTo(0, 0);
      
      // Auto redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.message || 'Registration failed. Check details and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: 'calc(100vh - 72px)',
      padding: '40px 20px',
      background: 'radial-gradient(circle at 90% 10%, rgba(16, 185, 129, 0.05) 0%, rgba(59, 130, 246, 0.05) 90%)'
    }}>
      <div className="glass-panel animate-fade-in" style={{
        width: '100%',
        maxWidth: '560px',
        padding: '40px 32px',
        display: 'flex',
        flexDirection: 'column',
        gap: 24
      }}>
        {/* Title */}
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }} className="title-gradient">Create Account</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14.5 }}>Join the ShareMeal community to reduce food waste</p>
        </div>

        {/* Success Alert */}
        {success && (
          <div className="badge badge-success" style={{
            width: '100%',
            padding: 12,
            borderRadius: 'var(--radius-md)',
            textTransform: 'none',
            fontSize: 13,
            display: 'block',
            lineHeight: 1.4,
            textAlign: 'center'
          }}>
            {success} Redirecting to login...
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="badge badge-danger" style={{
            width: '100%',
            padding: 12,
            borderRadius: 'var(--radius-md)',
            textTransform: 'none',
            fontSize: 13,
            display: 'block',
            lineHeight: 1.4
          }}>
            {error}
          </div>
        )}

        {/* Role Tabs Selector */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          backgroundColor: 'var(--bg-tertiary)',
          borderRadius: 'var(--radius-md)',
          padding: 4
        }}>
          <button 
            type="button"
            onClick={() => { setRole('restaurant'); setError(''); }}
            style={{
              padding: '10px 0',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 13.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              backgroundColor: role === 'restaurant' ? 'var(--bg-secondary)' : 'transparent',
              color: role === 'restaurant' ? 'var(--primary)' : 'var(--text-secondary)',
              transition: 'all var(--transition-fast)'
            }}
          >
            <Building2 size={15} />
            Restaurant
          </button>
          <button 
            type="button"
            onClick={() => { setRole('ngo'); setError(''); }}
            style={{
              padding: '10px 0',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 13.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              backgroundColor: role === 'ngo' ? 'var(--bg-secondary)' : 'transparent',
              color: role === 'ngo' ? 'var(--primary)' : 'var(--text-secondary)',
              transition: 'all var(--transition-fast)'
            }}
          >
            <Heart size={15} />
            NGO
          </button>
          <button 
            type="button"
            onClick={() => { setRole('admin'); setError(''); }}
            style={{
              padding: '10px 0',
              borderRadius: 'var(--radius-sm)',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 13.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              backgroundColor: role === 'admin' ? 'var(--bg-secondary)' : 'transparent',
              color: role === 'admin' ? 'var(--primary)' : 'var(--text-secondary)',
              transition: 'all var(--transition-fast)'
            }}
          >
            <Shield size={15} />
            Admin
          </button>
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="form-group">
            <label className="form-label">Full Name / Entity Name</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="e.g. Grand Bistro or Hope Foundation"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              type="email" 
              className="form-control" 
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-control" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input 
              type="tel" 
              className="form-control" 
              placeholder="+91 XXXXX XXXXX"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Street Address</label>
            <input 
              type="text" 
              className="form-control" 
              placeholder="Apartment, Street name, City"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              required
            />
          </div>

          {/* Role specific forms */}
          {role === 'restaurant' && (
            <>
              <div className="form-group animate-fade-in">
                <label className="form-label">FSSAI License Number</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. LIC-220938-AA"
                  value={licenseNumber}
                  onChange={(e) => setLicenseNumber(e.target.value)}
                  required
                />
              </div>
              <div className="form-group animate-fade-in">
                <label className="form-label">Restaurant Description</label>
                <textarea 
                  className="form-control" 
                  rows="3"
                  placeholder="Specialties, regular schedules, types of surplus food..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </>
          )}

          {role === 'ngo' && (
            <>
              <div className="form-group animate-fade-in">
                <label className="form-label">Government Registration Number</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="e.g. REG-192837-GOV"
                  value={registrationNumber}
                  onChange={(e) => setRegistrationNumber(e.target.value)}
                  required
                />
              </div>
              <div className="form-group animate-fade-in">
                <label className="form-label">NGO Mandate & Target Groups</label>
                <textarea 
                  className="form-control" 
                  rows="3"
                  placeholder="Describe your serving areas, target groups, distribution scale..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </>
          )}

          {/* Coordinates Detector */}
          {role !== 'admin' && (
            <div className="form-group" style={{ border: '1px solid var(--border-color)', padding: 16, borderRadius: 'var(--radius-md)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span className="form-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <MapPin size={16} style={{ color: 'var(--primary)' }} />
                  Geographical Coordinates (For Map Listings)
                </span>
                <button 
                  type="button" 
                  onClick={detectLocation}
                  className="btn btn-outline btn-sm"
                  style={{ display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <Compass size={14} />
                  Auto-Detect
                </button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label className="form-label" style={{ fontSize: 11 }}>Latitude</label>
                  <input 
                    type="number" 
                    step="0.000001" 
                    className="form-control" 
                    style={{ width: '100%', padding: '8px 12px' }}
                    placeholder="17.3850"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                  />
                </div>
                <div>
                  <label className="form-label" style={{ fontSize: 11 }}>Longitude</label>
                  <input 
                    type="number" 
                    step="0.000001" 
                    className="form-control" 
                    style={{ width: '100%', padding: '8px 12px' }}
                    placeholder="78.4867"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: 8 }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : (
              <>
                <span>Sign Up</span>
                <UserPlus size={18} />
              </>
            )}
          </button>
        </form>

        {/* Footnote */}
        <div style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)', paddingTop: 20 }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700 }}>
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
