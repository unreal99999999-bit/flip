import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../store';

export default function Login() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = e => {
    e.preventDefault();
    if (adminLogin(password)) { navigate('/admin'); }
    else { setError('Wrong password. Please try again.'); }
  };

  return (
    <div id="app-shell">
      <div className="login-outer">
        <div className="login-box">
          <div className="login-top">
            <h2>Admin Panel</h2>
            <p>Manage products, view orders &amp; update payment settings.</p>
            <div style={{ marginTop: 20, fontSize: 12, opacity: .7 }}>🔒 Secure admin-only access</div>
          </div>
          <div className="login-body">
            <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: '#212121' }}>Sign In</div>
            {error && <div style={{ background: '#ffebee', border: '1px solid #ffcdd2', borderRadius: 4, padding: '10px 12px', fontSize: 13, color: '#c62828', marginBottom: 14 }}>{error}</div>}
            <form onSubmit={handleSubmit}>
              <input type="password" className="login-input" placeholder="Admin Password" value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }} required autoFocus />
              <button type="submit" className="login-btn">LOGIN</button>
            </form>
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <a href="/" style={{ color: '#2874f0', fontSize: 13 }}>← Back to store</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
