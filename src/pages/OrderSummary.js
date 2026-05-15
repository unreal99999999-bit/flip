import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { saveOrder } from '../store';

export default function OrderSummary() {
  const { state } = useLocation();
  const navigate = useNavigate();
  if (!state?.product) return <div onClick={() => navigate('/')} style={{ padding: 40, textAlign: 'center', cursor: 'pointer' }}>Go Home</div>;

  const { product, colorIndex, name, number, pin, city, state: st, flat, area } = state;
  const img = (product.colorImageUrls || [])[colorIndex]?.trim() || (product.colorImageUrls || [])[0]?.trim();
  const color = product.colors?.[colorIndex]?.trim() || '';
  const saved = product.oldPrice - product.price;

  const handleContinue = () => {
    saveOrder({ name, number, pin, city, state: st, flat, area, productId: product._id, colorIndex, productName: product.name, productPrice: product.price });
    navigate('/payment', { state });
  };

  return (
    <div id="app-shell">
      <div className="page-header">
        <div style={{ cursor: 'pointer' }} onClick={() => navigate(-1)}>
          <svg width="20" height="16" viewBox="0 0 19 16" fill="none">
            <path d="M17.556 7.847H1M7.45 1L1 7.877l6.45 6.817" stroke="#212121" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span className="page-header-title">Order Summary</span>
      </div>

      <div className="progress-wrap">
        <div className="progress-track"><div className="progress-fill" style={{ width: '50%' }} /></div>
        <div className="progress-labels">
          <span>Address</span>
          <span className="active-lbl">Order Summary</span>
          <span>Payment</span>
        </div>
      </div>

      {/* Delivery address */}
      <div className="delivery-addr-card">
        <div style={{ fontSize: 12, color: '#878787', fontWeight: 600, textTransform: 'uppercase', marginBottom: 6 }}>Deliver to</div>
        <div><span className="addr-name">{name}</span><span className="addr-tag">HOME</span></div>
        <div className="addr-lines">{flat}, {area}, {city} – {pin}<br />{st}<br />📞 {number}</div>
      </div>

      {/* Product */}
      <div className="order-product-card">
        <div className="order-prod-row">
          <img className="order-prod-img" src={img} alt={product.name}
            onError={e => { e.target.src = 'https://via.placeholder.com/80'; }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 500, color: '#212121', lineHeight: 1.4, marginBottom: 4 }}>{product.name}</div>
            <div style={{ fontSize: 12, color: '#878787', marginBottom: 8 }}>Color: {color}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ background: '#388e3c', color: '#fff', fontSize: 11, padding: '2px 7px', borderRadius: 2, fontWeight: 700 }}>{product.discount}% off</span>
              <span style={{ textDecoration: 'line-through', color: '#878787', fontSize: 13 }}>₹{Number(product.oldPrice).toLocaleString()}</span>
              <span style={{ fontSize: 17, fontWeight: 800, color: '#212121' }}>₹{Number(product.price).toLocaleString()}</span>
            </div>
          </div>
        </div>
        <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ background: '#f5f5f5', borderRadius: 4, padding: '4px 14px', fontSize: 13, fontWeight: 700 }}>Qty: 1</span>
          <span style={{ fontSize: 13, color: '#388e3c' }}>🚚 FREE Delivery</span>
        </div>
      </div>

      {/* Price details */}
      <div className="order-price-section">
        <div style={{ fontSize: 14, fontWeight: 700, color: '#212121', marginBottom: 10 }}>Price Details</div>
        <div className="price-row"><span>Price (1 item)</span><span>₹{Number(product.oldPrice).toLocaleString()}</span></div>
        <div className="price-row"><span>Discount</span><span style={{ color: '#388e3c' }}>−₹{saved.toLocaleString()}</span></div>
        <div className="price-row"><span>Delivery Charges</span><span style={{ color: '#388e3c' }}>FREE</span></div>
        <div className="price-row total"><span>Total Amount</span><span>₹{Number(product.price).toLocaleString()}</span></div>
        <div className="price-row saved"><span>You will save <strong>₹{saved.toLocaleString()}</strong> on this order 🎉</span></div>
      </div>

      <div className="safety-banner">
        <img src="https://rukminim1.flixcart.com/www/60/70/promos/13/02/2019/9b179a8a-a0e2-497b-bd44-20aa733dc0ec.png?q=90" alt="" />
        <div className="safety-text">Safe and secure payments. Easy returns.<br />100% Authentic products.</div>
      </div>

      <div className="buy-bar">
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, textDecoration: 'line-through', color: '#878787' }}>₹{Number(product.oldPrice).toLocaleString()}</div>
          <div style={{ fontSize: 20, fontWeight: 800 }}>₹{Number(product.price).toLocaleString()}</div>
        </div>
        <button className="buy-now-btn" style={{ flex: 1 }} onClick={handleContinue}>CONTINUE</button>
      </div>
    </div>
  );
}
