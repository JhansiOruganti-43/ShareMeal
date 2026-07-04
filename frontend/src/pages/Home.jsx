import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, API_URL } from '../context/AuthContext';
import { ArrowRight, UtensilsCrossed, ShieldAlert, Heart, Calendar, MapPin, Award } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_URL}/analytics/dashboard`);
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
  }, []);

  return (
    <div style={{ minHeight: 'calc(100vh - 72px)', display: 'flex', flexDirection: 'column' }}>
      {/* Hero Section */}
      <section style={{
        padding: '80px 24px',
        textAlign: 'center',
        background: 'radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.08) 0%, rgba(59, 130, 246, 0.03) 100%)',
        borderBottom: '1px solid var(--border-color)'
      }}>
        <div className="container animate-fade-in" style={{ maxWidth: '800px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '6px 16px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--primary-glow)',
            color: 'var(--primary)',
            fontSize: 13,
            fontWeight: 700
          }}>
            <SparkleIcon /> Rescuing Surplus Food. Empowering NGOs.
          </div>
          
          <h1 style={{ fontSize: 'clamp(36px, 5vw, 56px)', lineHeight: 1.15, fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
            Bridging the Gap Between <span className="title-gradient">Abundance</span> & <span className="title-gradient">Need</span>
          </h1>
          
          <p style={{ fontSize: 18, color: 'var(--text-secondary)', maxWidth: '640px', lineHeight: 1.6 }}>
            ShareMeal connects verified local restaurants with surplus food directly to local NGOs, reducing landfill waste and feeding those in need.
          </p>

          <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
            {user ? (
              <Link 
                to={user.role === 'restaurant' ? '/restaurant' : user.role === 'ngo' ? '/ngo' : '/admin'} 
                className="btn btn-primary"
                style={{ padding: '12px 24px' }}
              >
                Go to Dashboard
                <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link to="/register" className="btn btn-primary" style={{ padding: '12px 24px' }}>
                  Join as Partner
                  <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="btn btn-secondary" style={{ padding: '12px 24px' }}>
                  Log In
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Real-time Statistics Grid */}
      <section style={{ padding: '60px 24px', backgroundColor: 'var(--bg-secondary)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 style={{ fontSize: 28, marginBottom: 8 }}>Our Impact in Real-Time</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Every rescue prevents landfill emissions and serves nutritional meals.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 }}>
            <div className="card glass-panel" style={{ textAlign: 'center', padding: 32 }}>
              <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--primary)', marginBottom: 8 }}>
                {stats ? `${stats.total_meals_saved}` : '1,280'}
              </div>
              <strong style={{ fontSize: 16, display: 'block', marginBottom: 4 }}>Meals Rescued</strong>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Safely delivered to local community shelter homes</p>
            </div>

            <div className="card glass-panel" style={{ textAlign: 'center', padding: 32 }}>
              <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--secondary)', marginBottom: 8 }}>
                {stats ? `${stats.total_co2_saved_kg} kg` : '3,200 kg'}
              </div>
              <strong style={{ fontSize: 16, display: 'block', marginBottom: 4 }}>CO₂ Equivalent Rescued</strong>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Prevented from landfill organic greenhouse emissions</p>
            </div>

            <div className="card glass-panel" style={{ textAlign: 'center', padding: 32 }}>
              <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--accent)', marginBottom: 8 }}>
                {stats ? `${stats.active_restaurants_count}` : '8'}
              </div>
              <strong style={{ fontSize: 16, display: 'block', marginBottom: 4 }}>Rescuing Restaurants</strong>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Verified food establishments donating daily surplus</p>
            </div>

            <div className="card glass-panel" style={{ textAlign: 'center', padding: 32 }}>
              <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--info)', marginBottom: 8 }}>
                {stats ? `${stats.active_ngos_count}` : '12'}
              </div>
              <strong style={{ fontSize: 16, display: 'block', marginBottom: 4 }}>NGO Partners</strong>
              <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Organizations managing community pickups & delivery</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section style={{ padding: '80px 24px', backgroundColor: 'var(--bg-primary)', borderTop: '1px solid var(--border-color)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: 28, marginBottom: 8 }}>Rescuing Food is a 4-Step Cycle</h2>
            <p style={{ color: 'var(--text-secondary)' }}>A secure, verified flow ensures safety and efficiency.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
            <div className="card" style={{ padding: 24 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--primary)', marginBottom: 12 }}>01 / POST SURPLUS</div>
              <h3 style={{ fontSize: 18, marginBottom: 8 }}>Restaurants List Food</h3>
              <p style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>
                Restaurants enter quantity, food type (veg/non-veg), weight, and hours to expiry. AI recommends nearby matching NGOs.
              </p>
            </div>

            <div className="card" style={{ padding: 24 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--primary)', marginBottom: 12 }}>02 / CLAIM LISTINGS</div>
              <h3 style={{ fontSize: 18, marginBottom: 8 }}>NGOs Browse & Request</h3>
              <p style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>
                Verified NGOs browse nearby listings on an interactive OpenStreetMap and claim them. A secure QR hash code is generated.
              </p>
            </div>

            <div className="card" style={{ padding: 24 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--primary)', marginBottom: 12 }}>03 / SECURE VERIFY</div>
              <h3 style={{ fontSize: 18, marginBottom: 8 }}>QR Code Confirmation</h3>
              <p style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>
                The NGO representative collects food. The restaurant verifies collection by entering/scanning the NGO's secure QR confirmation code.
              </p>
            </div>

            <div className="card" style={{ padding: 24 }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--primary)', marginBottom: 12 }}>04 / EARN REWARDS</div>
              <h3 style={{ fontSize: 18, marginBottom: 8 }}>Badges & Analytics</h3>
              <p style={{ fontSize: 13.5, color: 'var(--text-secondary)' }}>
                Top restaurants accumulate points and unlock donation badges (Silver, Gold) which are displayed on the community leaderboards.
              </p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer style={{ marginTop: 'auto', padding: '32px 24px', backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', textAlign: 'center', fontSize: 13.5, color: 'var(--text-secondary)' }}>
        <p>© 2026 ShareMeal Community Platform. Promoting zero waste and carbon reductions.</p>
      </footer>
    </div>
  );
};

const SparkleIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.3-6.3l-.7.7M6.7 17.3l-.7.7m12.6 0l-.7-.7M6.7 6.7l-.7-.7N" />
  </svg>
);

export default Home;
