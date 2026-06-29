import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn, ArrowRight } from 'lucide-react';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const loggedUser = await login(email, password);
      
      // Redirect to correct dashboard based on role
      if (loggedUser.role === 'restaurant') {
        navigate('/restaurant');
      } else if (loggedUser.role === 'ngo') {
        navigate('/ngo');
      } else if (loggedUser.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      setError(err.message || 'Invalid credentials or account pending approval.');
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
      background: 'radial-gradient(circle at 10% 20%, rgba(16, 185, 129, 0.05) 0%, rgba(59, 130, 246, 0.05) 90%)'
    }}>
      <div className="glass-panel animate-fade-in" style={{
        width: '100%',
        maxWidth: '420px',
        padding: '40px 32px',
        display: 'flex',
        flexDirection: 'column',
        gap: 24
      }}>
        {/* Title */}
        <div style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }} className="title-gradient">Welcome Back</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14.5 }}>Log in to access your ShareMeal account</p>
        </div>

        {/* Error Notification */}
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

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Mail size={18} style={{ position: 'absolute', left: 16, color: 'var(--text-muted)' }} />
              <input 
                type="email" 
                id="email" 
                className="form-control" 
                style={{ width: '100%', paddingLeft: 46 }}
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label className="form-label" htmlFor="password">Password</label>
              <Link to="/forgot-password" style={{ fontSize: 12.5, color: 'var(--secondary)', fontWeight: 600 }}>
                Forgot Password?
              </Link>
            </div>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Lock size={18} style={{ position: 'absolute', left: 16, color: 'var(--text-muted)' }} />
              <input 
                type="password" 
                id="password" 
                className="form-control" 
                style={{ width: '100%', paddingLeft: 46 }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: 8 }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : (
              <>
                <span>Sign In</span>
                <LogIn size={18} />
              </>
            )}
          </button>
        </form>

        {/* Footnote */}
        <div style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)', paddingTop: 20 }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            Register here <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
