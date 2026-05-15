import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getProductById, getProducts } from '../store';
import { useCart } from '../context/CartContext';

function Stars({ rating = 4.2 }) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span className="stars">
      {[...Array(5)].map((_, i) => (
        <span key={i} className={i < full ? 'star-filled' : (i === full && half ? 'star-half' : 'star-empty')}>★</span>
      ))}
    </span>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const product = getProductById(id);
  const [selColor, setSelColor] = useState(0);
  const [selImg, setSelImg] = useState(0);
  const [offerTimer, setOfferTimer] = useState('');

  useEffect(() => {
    if (!product) { navigate('/'); return; }
    window.scrollTo(0, 0);
  }, [product, navigate]);

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const s = d.getMinutes() * 60 + d.getSeconds();
      const left = 900 - (s % 900);
      const m = Math.floor(left / 60), sec = left % 60;
      setOfferTimer(`${m}m ${sec}s`);
    };
    tick();
    const id2 = setInterval(tick, 1000);
    return () => clearInterval(id2);
  }, []);

  if (!product) return null;

  const images = (product.colorImageUrls || []).map(u => u.trim()).filter(Boolean);
  // For color selector: pair each color with an image
  const colors = product.colors || [];
  const saved = product.oldPrice - product.price;
  const wowPrice = Math.max(product.price - 100, Math.floor(product.price * 0.8));
  const similar = getProducts().filter(p => p._id !== product._id).slice(0, 8);

  // delivery date: 2 days from now
  const delivDate = new Date();
  delivDate.setDate(delivDate.getDate() + 2);
  const delivStr = delivDate.toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' });

  const handleBuy = () => {
    addToCart(product, selColor);
    navigate('/cart');
  };

  const handleAddCart = () => {
    addToCart(product, selColor);
    navigate('/cart');
  };

  return (
    <>
      {/* Header */}
      <div className="detail-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ cursor: 'pointer' }} onClick={() => navigate(-1)}>
            <svg width="20" height="16" viewBox="0 0 19 16" fill="none">
              <path d="M17.556 7.847H1M7.45 1L1 7.877l6.45 6.817" stroke="#212121" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <div className="fk-logo-circle">f</div>
        </div>
        <div className="detail-header-right">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 4 4"/></svg>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        </div>
      </div>

      <div className="pb-buy-bar">
        {/* Image area */}
        <div className="detail-img-area">
          <img src={images[selImg] || images[0]} alt={product.name}
            onError={e => { e.target.src = 'https://via.placeholder.com/300'; }} />
          <div className="detail-img-actions">
            <button title="Wishlist">♡</button>
            <button title="Share">↗</button>
          </div>
        </div>
        {/* Image dots */}
        {images.length > 1 && (
          <div className="img-dots">
            {images.slice(0, 6).map((_, i) => (
              <div key={i} className={`img-dot ${selImg === i ? 'active' : ''}`} onClick={() => setSelImg(i)} />
            ))}
          </div>
        )}

        {/* Color selector */}
        {colors.length > 0 && (
          <div className="color-section">
            <h3>Select Color</h3>
            <div className="color-grid">
              {colors.map((c, i) => {
                const cImg = images[i] || images[0];
                return (
                  <div key={i} className={`color-item ${selColor === i ? 'active' : ''}`}
                    onClick={() => { setSelColor(i); setSelImg(i); }}>
                    <img src={cImg} alt={c}
                      onError={e => { e.target.src = 'https://via.placeholder.com/60'; }} />
                    <div className="color-item-name">{c.trim()}</div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Product info */}
        <div className="detail-info">
          <div className="detail-title">{product.name}</div>
          <div className="detail-rating-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Stars rating={4.7} />
              <span style={{ fontSize: 13, color: '#2874f0', fontWeight: 700 }}>4.7</span>
              <span style={{ fontSize: 12, color: '#878787' }}>· 6345 ratings</span>
            </div>
            <span className="assured-badge" style={{ fontSize: 11 }}>
              <span className="fk-f-circle">f</span> Assured
            </span>
          </div>
          {/* Price */}
          <div style={{ marginBottom: 8 }}>
            <div className="detail-price-row">
              <span className="detail-discount-pct">↓ {product.discount}%</span>
              <span className="detail-mrp">₹{Number(product.oldPrice).toLocaleString()}</span>
              <span className="detail-price">₹{Number(product.price).toLocaleString()}</span>
            </div>
            <div style={{ fontSize: 12, color: '#555', marginTop: 4 }}>
              + <span style={{ textDecoration: 'line-through' }}>₹99</span> Secured Packaging Free
            </div>
            <div style={{ fontSize: 13, color: '#388e3c', fontWeight: 500, marginTop: 4 }}>
              Free delivery by 2 day
            </div>
          </div>
        </div>

        {/* Express delivery */}
        <div className="express-card">
          <div style={{ fontSize: 26, flexShrink: 0 }}>🚚</div>
          <div style={{ flex: 1 }}>
            <div className="express-title">
              Express <span className="express-free">Free</span> <span className="express-strike">₹40</span> Delivery in
            </div>
            <div className="express-date">2 Days Delivery by {delivStr} ›</div>
            <div className="express-timer">This offer will end in {offerTimer}</div>
          </div>
        </div>

        {/* Warranty */}
        <div className="warranty-card">
          <span style={{ fontSize: 20 }}>📋</span>
          <span>1-YEAR WARRANTY</span>
        </div>

        {/* Policy icons */}
        <div className="policy-row">
          <div className="policy-item">
            <span className="policy-icon">🔧</span>
            <span>7-day brand support ›</span>
          </div>
          <div className="policy-item">
            <span className="policy-icon">💳</span>
            <span>No cash on delivery ›</span>
          </div>
          <div className="policy-item">
            <span className="policy-icon">⚡</span>
            <span>Flipkart Assured ›</span>
          </div>
        </div>

        {/* WOW deal */}
        <div className="wow-deal-block">
          <div style={{ textAlign: 'center' }}>
            <div className="wow-deal-logo">WOW!</div>
            <div className="wow-deal-sub">DEAL</div>
          </div>
          <div>
            <div className="wow-deal-text">Get at <span className="wow-deal-price">₹{wowPrice}</span></div>
            <div style={{ fontSize: 12, color: '#555' }}>With UPI Payment &amp; More</div>
          </div>
        </div>

        {/* Product description */}
        <div style={{ background: '#fff', padding: 14, marginTop: 2 }}>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: '#212121' }}>Product Description</div>
          <img src={images[selImg] || images[0]} alt="" style={{ width: '100%', maxHeight: 300, objectFit: 'contain', marginBottom: 10 }}
            onError={e => { e.target.style.display = 'none'; }} />
          {product.description && (
            <p style={{ fontSize: 13, color: '#555', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{product.description}</p>
          )}
        </div>

        {/* Similar products */}
        <div className="similar-section">
          <div className="similar-title">Similar Products</div>
          <div className="similar-scroll">
            {similar.map(p => {
              const si = (p.colorImageUrls || [])[0]?.trim();
              return (
                <div key={p._id} className="similar-card" onClick={() => navigate(`/product/${p._id}`)}>
                  <img src={si} alt={p.name} onError={e => { e.target.src = 'https://via.placeholder.com/90'; }} />
                  <div className="similar-name">{p.name}</div>
                  <div className="similar-price">₹{Number(p.price).toLocaleString()}</div>
                  <div style={{ fontSize: 11, color: '#388e3c' }}>{p.discount}% off</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Safety */}
        <div className="safety-banner">
          <img src="https://rukminim1.flixcart.com/www/60/70/promos/13/02/2019/9b179a8a-a0e2-497b-bd44-20aa733dc0ec.png?q=90" alt="" />
          <div className="safety-text">Safe and secure payments.<br />Easy returns. 100% Authentic products.</div>
        </div>
      </div>

      {/* Bottom buy bar */}
      <div className="buy-bar">
        <button className="add-cart-btn" onClick={handleAddCart}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
          Add to Cart
        </button>
        <button className="buy-now-btn" onClick={handleBuy}>Buy Now</button>
      </div>
    </>
  );
}
