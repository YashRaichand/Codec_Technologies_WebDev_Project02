import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <nav style={{ background: 'white', borderBottom: '1px solid #e5e7eb', position: 'sticky', top: 0, zIndex: 100 }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 60 }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 32, height: 32, background: '#6d28d9', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>✍️</span>
          <span style={{ fontFamily: 'sans-serif', fontWeight: 800, fontSize: 18, color: '#0f172a' }}>InkAI</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {user ? (
            <>
              <Link to="/dashboard" className="btn btn-ghost btn-sm" style={{ fontFamily: 'sans-serif' }}>Dashboard</Link>
              <Link to="/analytics" className="btn btn-ghost btn-sm" style={{ fontFamily: 'sans-serif' }}>Analytics</Link>
              <Link to="/editor" className="btn btn-primary btn-sm">+ Write</Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 8, cursor: 'pointer', position: 'relative' }} onClick={() => setMenuOpen(!menuOpen)}>
                <div className="avatar" style={{ width: 32, height: 32, fontSize: 13 }}>{user.name?.[0]}</div>
                {menuOpen && (
                  <div style={{ position: 'absolute', top: 40, right: 0, background: 'white', border: '1px solid #e5e7eb', borderRadius: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.12)', minWidth: 160, zIndex: 200, overflow: 'hidden' }}>
                    <div style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>
                      <div style={{ fontFamily: 'sans-serif', fontSize: 13, fontWeight: 700 }}>{user.name}</div>
                      <div style={{ fontSize: 12, color: '#6b7280', fontFamily: 'sans-serif' }}>{user.email}</div>
                    </div>
                    <Link to={`/user/${user._id}`} onClick={() => setMenuOpen(false)} style={{ display: 'block', padding: '10px 16px', fontSize: 13, color: '#374151', textDecoration: 'none', fontFamily: 'sans-serif' }}>View Profile</Link>
                    <button onClick={handleLogout} style={{ width: '100%', padding: '10px 16px', fontSize: 13, color: '#dc2626', fontFamily: 'sans-serif', background: 'none', border: 'none', textAlign: 'left', cursor: 'pointer', borderTop: '1px solid #f3f4f6' }}>Sign Out</button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              <Link to="/auth" className="btn btn-ghost btn-sm" style={{ fontFamily: 'sans-serif' }}>Sign In</Link>
              <Link to="/auth?mode=register" className="btn btn-primary btn-sm">Get Started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
