import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Navbar({ onSearch }) {
  const [q, setQ] = useState('');
  const navigate = useNavigate();

  const handleChange = e => {
    setQ(e.target.value);
    if (onSearch) onSearch(e.target.value);
  };

  return (
    <nav className="navbar-custom">
      <div className="container d-flex align-items-center gap-3">
        <div onClick={() => navigate('/')} style={{ cursor: 'pointer', flexShrink: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: '#fff', fontWeight: 800, fontSize: 22, fontStyle: 'italic', letterSpacing: -1 }}>
            Shop<span style={{ color: '#ffe500' }}>Now</span>
          </span>
          <span style={{ color: '#ffe500', fontSize: 10, fontWeight: 600, marginTop: 2 }}>Explore Plus ✦</span>
        </div>
        <input
          type="text"
          className="navbar-search"
          placeholder="Search for Products, Brands and More"
          value={q}
          onChange={handleChange}
        />
        <div style={{ flexShrink: 0 }}>
          <svg width="16" height="16" viewBox="0 0 15 15" xmlns="http://www.w3.org/2000/svg">
            <g fill="#fff" fillRule="evenodd">
              <path d="m5.189 13.04c0 .996-.791 1.804-1.767 1.804-.976 0-1.767-.808-1.767-1.804 0-.996.791-1.804 1.767-1.804.976 0 1.767.808 1.767 1.804"/>
              <path d="m14.912 2.259h-14.298l2.247 6.917c.042.129.16.216.293.216h8.06c-.064.69-.629 1.841-1.702 1.841h-6.04l1.072 1.991h5.611c1.881 0 2.938-2.278 3.657-4.719.888-3.01 1.219-6.245 1.106-6.245"/>
              <path d="m.615 2.259l-.592-1.828c-.08-.207.069-.431.287-.431h1.482c.126 0 .24.079.287.198l.682 2.061c0 0-.63 1.642-1.942.066"/>
              <path d="m13.424 13.325c0 .837-.664 1.516-1.484 1.516-.82 0-1.484-.679-1.484-1.516 0-.837.664-1.516 1.484-1.516.82 0 1.484.679 1.484 1.516"/>
            </g>
          </svg>
        </div>
      </div>
    </nav>
  );
}
