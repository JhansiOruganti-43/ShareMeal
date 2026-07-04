import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, Sun, Moon, LogOut, User as UserIcon, Shield, Heart, UtensilsCrossed } from 'lucide-react';
import { Link } from 'react-router-dom';

const Navbar = () => {
  const { user, logout, notifications, markNotificationRead, theme, toggleTheme } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleNotifClick = (n) => {
    if (!n.is_read) {
      markNotificationRead(n.id);
    }
  };

  return (
    <nav className="navbar">
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {/* Brand Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, fontWeight: 800, fontSize: 24, fontFamily: 'var(--font-heading)' }}>
          <UtensilsCrossed style={{ color: 'var(--primary)', width: 28, height: 28 }} />
          <span className="title-gradient">ShareMeal</span>
        </Link>

        {/* Action Panel */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {user && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              {/* Role Indicator Banner */}
              <span className="badge badge-success" style={{ textTransform: 'capitalize', fontSize: 11 }}>
                {user.role} {user.status === 'verified' && '✓'}
              </span>

              {/* Navigation Dashboard Links */}
              {user.role === 'restaurant' && (
                <Link to="/restaurant" style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Dashboard</Link>
              )}
              {user.role === 'ngo' && (
                <Link to="/ngo" style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Dashboard</Link>
              )}
              {user.role === 'admin' && (
                <Link to="/admin" style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>Admin Panel</Link>
              )}

              {/* Notifications Toggle */}
              <div style={{ position: 'relative' }}>
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="btn btn-outline" 
                  style={{ padding: 8, borderRadius: '50%' }}
                >
                  <Bell size={18} />
                  {unreadCount > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: -4,
                      right: -4,
                      backgroundColor: 'var(--danger)',
                      color: 'white',
                      fontSize: 10,
                      fontWeight: 700,
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      {unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Dropdown */}
                {showNotifications && (
                  <div className="glass-panel" style={{
                    position: 'absolute',
                    top: 48,
                    right: 0,
                    width: 320,
                    maxHeight: 400,
                    overflowY: 'auto',
                    zIndex: 200,
                    padding: 12,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8
                  }}>
                    <div style={{ fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: 8, marginBottom: 4 }}>
                      Notifications
                    </div>
                    {notifications.length === 0 ? (
                      <div style={{ color: 'var(--text-muted)', fontSize: 13, padding: '16px 0', textAlign: 'center' }}>
                        No notifications yet
                      </div>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n.id} 
                          onClick={() => handleNotifClick(n)}
                          style={{
                            padding: 10,
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: n.is_read ? 'transparent' : 'var(--bg-tertiary)',
                            cursor: 'pointer',
                            fontSize: 12.5,
                            borderLeft: n.is_read ? 'none' : '3px solid var(--primary)',
                            transition: 'background-color var(--transition-fast)'
                          }}
                        >
                          <p style={{ color: 'var(--text-primary)', marginBottom: 2 }}>{n.message}</p>
                          <small style={{ color: 'var(--text-muted)' }}>
                            {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </small>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Theme Toggle Button */}
          <button 
            onClick={toggleTheme}
            className="btn btn-outline" 
            style={{ padding: 8, borderRadius: '50%' }}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>

          {/* User & Logout Section */}
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ textAlign: 'right', display: 'none', md: 'block' }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{user.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{user.email}</div>
              </div>
              <button 
                onClick={logout}
                className="btn btn-danger btn-sm"
              >
                <LogOut size={14} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 10 }}>
              <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
