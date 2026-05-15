import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Delhi','Jammu & Kashmir','Ladakh'];

export default function Cart() {
  const navigate = useNavigate();
  const { cartItem } = useCart();
  const [form, setForm] = useState({ name:'', number:'', pin:'', city:'', state:'', flat:'', area:'' });
  const [errors, setErrors] = useState({});

  if (!cartItem) return (
    <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fff', minHeight: '100vh' }}>
      <div style={{ fontSize: 56, marginBottom: 16 }}>🛒</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: '#212121', marginBottom: 8 }}>Your cart is empty!</div>
      <div style={{ fontSize: 13, color: '#888', marginBottom: 24 }}>Add items to it now.</div>
      <button onClick={() => navigate('/')}
        style={{ background: '#2874f0', color: '#fff', border: 'none', borderRadius: 2, padding: '12px 32px', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
        Shop Now
      </button>
    </div>
  );

  const { product, colorIndex } = cartItem;
  const img = (product.colorImageUrls || [])[colorIndex]?.trim() || (product.colorImageUrls || [])[0]?.trim();

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required';
    if (!/^[6-9]\d{9}$/.test(form.number)) e.number = 'Enter valid 10-digit mobile';
    if (!/^\d{6}$/.test(form.pin)) e.pin = 'Enter 6-digit pincode';
    if (!form.city.trim()) e.city = 'City is required';
    if (!form.state) e.state = 'Select a state';
    if (!form.flat.trim()) e.flat = 'House/Flat no. required';
    if (!form.area.trim()) e.area = 'Area/Colony required';
    return e;
  };

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  const handleSubmit = e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    navigate('/order-summary', { state: { ...form, product, colorIndex } });
  };

  return (
    <div id="app-shell">
      <div className="page-header">
        <div style={{ cursor: 'pointer' }} onClick={() => navigate(-1)}>
          <svg width="20" height="16" viewBox="0 0 19 16" fill="none">
            <path d="M17.556 7.847H1M7.45 1L1 7.877l6.45 6.817" stroke="#212121" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span className="page-header-title">Delivery Address</span>
      </div>

      {/* Progress */}
      <div className="progress-wrap">
        <div className="progress-track"><div className="progress-fill" style={{ width: '16%' }} /></div>
        <div className="progress-labels">
          <span className="active-lbl">Address</span>
          <span>Order Summary</span>
          <span>Payment</span>
        </div>
      </div>

      {/* Item preview */}
      <div style={{ background: '#fff', padding: 14, marginBottom: 2, display: 'flex', gap: 12, alignItems: 'center' }}>
        <img src={img} alt="" style={{ width: 64, height: 64, objectFit: 'contain' }}
          onError={e => { e.target.src = 'https://via.placeholder.com/64'; }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#212121', marginBottom: 3 }}>{product.name}</div>
          <div style={{ fontSize: 12, color: '#878787' }}>Color: {product.colors?.[colorIndex]?.trim()}</div>
          <div style={{ fontSize: 16, fontWeight: 800, color: '#212121', marginTop: 2 }}>₹{Number(product.price).toLocaleString()}</div>
        </div>
      </div>

      {/* Form */}
      <div className="address-card">
        <h6 style={{ fontSize: 14, fontWeight: 700, color: '#2874f0', marginBottom: 16 }}>📦 Enter Delivery Details</h6>
        <form onSubmit={handleSubmit} noValidate>
          <div className={`form-field ${errors.name ? 'invalid' : ''}`}>
            <label>Full Name *</label>
            <input type="text" value={form.name} onChange={e => set('name', e.target.value)} />
            {errors.name && <span className="field-err">{errors.name}</span>}
          </div>
          <div className={`form-field ${errors.number ? 'invalid' : ''}`}>
            <label>Mobile Number *</label>
            <input type="tel" maxLength={10} value={form.number} onChange={e => set('number', e.target.value)} />
            {errors.number && <span className="field-err">{errors.number}</span>}
          </div>
          <div className="two-col">
            <div className={`form-field ${errors.pin ? 'invalid' : ''}`}>
              <label>Pincode *</label>
              <input type="text" maxLength={6} value={form.pin} onChange={e => set('pin', e.target.value)} />
              {errors.pin && <span className="field-err">{errors.pin}</span>}
            </div>
            <div className={`form-field ${errors.city ? 'invalid' : ''}`}>
              <label>City *</label>
              <input type="text" value={form.city} onChange={e => set('city', e.target.value)} />
              {errors.city && <span className="field-err">{errors.city}</span>}
            </div>
          </div>
          <div className={`form-field ${errors.state ? 'invalid' : ''}`}>
            <label>State *</label>
            <select value={form.state} onChange={e => set('state', e.target.value)}>
              <option value=""></option>
              {STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {errors.state && <span className="field-err">{errors.state}</span>}
          </div>
          <div className={`form-field ${errors.flat ? 'invalid' : ''}`}>
            <label>House No / Building Name *</label>
            <input type="text" value={form.flat} onChange={e => set('flat', e.target.value)} />
            {errors.flat && <span className="field-err">{errors.flat}</span>}
          </div>
          <div className={`form-field ${errors.area ? 'invalid' : ''}`}>
            <label>Road / Area / Colony *</label>
            <input type="text" value={form.area} onChange={e => set('area', e.target.value)} />
            {errors.area && <span className="field-err">{errors.area}</span>}
          </div>
          <div style={{ marginTop: 8 }}>
            <button type="submit" className="buy-now-btn" style={{ width: '100%', borderRadius: 2, padding: 14, fontSize: 15 }}>
              CONTINUE
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
