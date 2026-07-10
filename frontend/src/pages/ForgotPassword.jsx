import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, KeyRound, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';

const ForgotPassword = () => {
  const { sendOtp, verifyOtp, resetPassword } = useAuth();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Step 1: Request OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await sendOtp(email);
      setSuccess('If this email is registered, we have sent an OTP.');
      setStep(2);
    } catch (err) {
      setError(err.message || 'Failed to request OTP');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await verifyOtp(email, otp);
      setSuccess('OTP verified! Enter your new password.');
      setStep(3);
    } catch (err) {
      setError(err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    try {
      await resetPassword(email, otp, newPassword);
      setSuccess('Password has been reset successfully!');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.message || 'Failed to reset password');
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
      background: 'radial-gradient(circle at 10% 20%, rgba(240, 74, 0, 0.05) 0%, rgba(59, 130, 246, 0.05) 90%)'
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
          <h2 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8 }} className="title-gradient">Reset Password</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14.5 }}>
            {step === 1 && "Enter your email for a recovery OTP"}
            {step === 2 && "Enter the 4-digit OTP sent to your email"}
            {step === 3 && "Secure your account with a new password"}
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="badge badge-danger" style={{ width: '100%', padding: 12, borderRadius: 'var(--radius-md)', textTransform: 'none', fontSize: 13, display: 'block' }}>
            {error}
          </div>
        )}
        
        {success && (
          <div className="badge badge-success" style={{ width: '100%', padding: 12, borderRadius: 'var(--radius-md)', textTransform: 'none', fontSize: 13, display: 'block' }}>
            {success}
          </div>
        )}

        {/* Step 1 Form */}
        {step === 1 && (
          <form onSubmit={handleRequestOtp} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
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
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Sending OTP...' : (
                <><span>Send OTP</span><ArrowRight size={18} /></>
              )}
            </button>
          </form>
        )}

        {/* Step 2 Form */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="otp">4-Digit OTP</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <KeyRound size={18} style={{ position: 'absolute', left: 16, color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  id="otp" 
                  className="form-control" 
                  style={{ width: '100%', paddingLeft: 46, letterSpacing: '0.2em' }}
                  placeholder="0000"
                  maxLength="4"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Verifying...' : (
                <><span>Verify OTP</span><ArrowRight size={18} /></>
              )}
            </button>
          </form>
        )}

        {/* Step 3 Form */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="newPassword">New Password</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock size={18} style={{ position: 'absolute', left: 16, color: 'var(--text-muted)' }} />
                <input 
                  type="password" 
                  id="newPassword" 
                  className="form-control" 
                  style={{ width: '100%', paddingLeft: 46 }}
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="confirmPassword">Confirm Password</label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock size={18} style={{ position: 'absolute', left: 16, color: 'var(--text-muted)' }} />
                <input 
                  type="password" 
                  id="confirmPassword" 
                  className="form-control" 
                  style={{ width: '100%', paddingLeft: 46 }}
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Resetting...' : (
                <><span>Reset Password</span><CheckCircle size={18} /></>
              )}
            </button>
          </form>
        )}

        {/* Footnote */}
        <div style={{ textAlign: 'center', fontSize: 14, color: 'var(--text-secondary)', borderTop: '1px solid var(--border-color)', paddingTop: 20 }}>
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <ArrowLeft size={14} /> Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
