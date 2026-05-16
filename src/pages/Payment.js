import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getPaymentUrl, getCashfreeCreds, saveOrder } from '../store';

export default function Payment() {
  const { state } = useLocation();
  const navigate  = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  if (!state?.product) {
    return (
      <div style={{ textAlign:'center', padding:40 }}>
        <button onClick={() => navigate('/')} style={{ background:'#2874f0', color:'#fff', border:'none', padding:'12px 28px', borderRadius:4, fontWeight:700, cursor:'pointer' }}>Go Home</button>
      </div>
    );
  }

  const { product, colorIndex, name, number } = state;
  const img    = (product.colorImageUrls||[])[colorIndex]?.trim() || (product.colorImageUrls||[])[0]?.trim();
  const creds  = getCashfreeCreds();
  const upiId  = getPaymentUrl();
  const hasCF  = !!(creds.appId && creds.secretKey);
  const amount = product.price;

  /* ── build UPI deep-link for a specific app ── */
  const upiLink = (app) => {
    const base = `pa=${encodeURIComponent(upiId)}&pn=ShopNow&am=${amount}&cu=INR&tn=Order`;
    const links = {
      phonepe: `phonepe://pay?${base}`,
      gpay:    `tez://upi/pay?${base}`,
      paytm:   `paytmmp://pay?${base}`,
      bhim:    `upi://pay?${base}`,
    };
    return links[app] || `upi://pay?${base}`;
  };

  const openUpiApp = (app) => {
    if (!upiId) { setError('No UPI ID configured. Contact admin.'); return; }
    window.location.href = upiLink(app);
  };

  /* ── Cashfree gateway ── */
  const handleCashfreePayment = async () => {
    setLoading(true); setError('');
    try {
      const orderId = 'order_' + Date.now();
      saveOrder({ name, number, productId:product._id, colorIndex, productName:product.name, productPrice:product.price, orderId });

      const res  = await fetch('/api/create-order', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ amount, customerName:name||'Customer', customerPhone:number||'9999999999', orderId, appId:creds.appId, secretKey:creds.secretKey, environment:creds.environment||'production' }),
      });
      const data = await res.json();
      if (!res.ok || data.error) { setError(data.error||'Payment failed. Try again.'); setLoading(false); return; }

      if (data.payment_link) { window.location.href = data.payment_link; return; }

      if (data.payment_session_id) {
        const script    = document.createElement('script');
        script.src      = 'https://sdk.cashfree.com/js/v3/cashfree.js';
        script.onload   = () => {
          const cf = window.Cashfree({ mode: creds.environment==='production'?'production':'sandbox' });
          cf.checkout({ paymentSessionId: data.payment_session_id, redirectTarget:'_self' });
        };
        script.onerror  = () => { setError('Could not load payment. Try UPI below.'); setLoading(false); };
        document.body.appendChild(script);
        return;
      }
      setError('No payment link received. Check Admin → Payment settings.');
      setLoading(false);
    } catch { setError('Network error. Check connection.'); setLoading(false); }
  };

  const UPI_APPS = [
    {
      id:'phonepe', name:'PhonePe',
      logo: (
        <div style={{ width:52, height:52, borderRadius:12, background:'#5f259f', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <svg viewBox="0 0 40 40" width="34" height="34" fill="none">
            <circle cx="20" cy="20" r="20" fill="#5f259f"/>
            <text x="20" y="27" textAnchor="middle" fontSize="22" fontWeight="900" fill="#fff" fontFamily="Arial">P</text>
          </svg>
        </div>
      ),
    },
    {
      id:'gpay', name:'Google Pay',
      logo: (
        <div style={{ width:52, height:52, borderRadius:12, background:'#fff', border:'1px solid #eee', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 1px 4px rgba(0,0,0,.1)' }}>
          <svg viewBox="0 0 40 24" width="38" height="22">
            <text x="0" y="18" fontSize="13" fontWeight="700" fontFamily="Arial">
              <tspan fill="#4285F4">G</tspan>
              <tspan fill="#EA4335">o</tspan>
              <tspan fill="#FBBC04">o</tspan>
              <tspan fill="#4285F4">g</tspan>
              <tspan fill="#34A853">l</tspan>
              <tspan fill="#EA4335">e</tspan>
            </text>
            <text x="0" y="32" fontSize="0">Pay</text>
          </svg>
        </div>
      ),
    },
    {
      id:'paytm', name:'Paytm',
      logo: (
        <div style={{ width:52, height:52, borderRadius:12, background:'#002970', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <svg viewBox="0 0 60 20" width="46" height="16">
            <text x="0" y="16" fontSize="14" fontWeight="900" fontFamily="Arial" fill="#00BAF2">paytm</text>
          </svg>
        </div>
      ),
    },
    {
      id:'bhim', name:'BHIM UPI',
      logo: (
        <div style={{ width:52, height:52, borderRadius:12, background:'#fff', border:'1px solid #eee', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ fontSize:11, fontWeight:900, color:'#3d5a80', textAlign:'center', lineHeight:1.2 }}>BHIM<br/><span style={{ color:'#e53935', fontSize:9 }}>UPI</span></div>
        </div>
      ),
    },
  ];

  return (
    <>
      {/* Header */}
      <div style={{ background:'#fff', display:'flex', alignItems:'center', gap:12, padding:'12px 14px', position:'sticky', top:0, zIndex:99, borderBottom:'1px solid #eee' }}>
        <div style={{ cursor:'pointer' }} onClick={() => navigate(-1)}>
          <svg width="19" height="16" viewBox="0 0 19 16" fill="none">
            <path d="M17.556 7.847H1M7.45 1L1 7.877l6.45 6.817" stroke="#212121" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span style={{ fontWeight:700, fontSize:16, color:'#212121' }}>Payment</span>
      </div>

      {/* Progress */}
      <div style={{ background:'#fff', padding:'8px 16px', marginBottom:2 }}>
        <div style={{ height:4, background:'#eee', borderRadius:2, marginBottom:6 }}>
          <div style={{ width:'100%', height:'100%', background:'#2874F0', borderRadius:2 }} />
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'#aaa' }}>
          <span>Address</span><span>Order Summary</span><span style={{ color:'#2874F0', fontWeight:700 }}>Payment</span>
        </div>
      </div>

      <div style={{ paddingBottom:84 }}>

        {/* Product recap */}
        <div style={{ background:'#fff', padding:14, marginBottom:2, display:'flex', gap:12, alignItems:'center' }}>
          <img src={img} alt="" style={{ width:64, height:64, objectFit:'contain', border:'1px solid #f0f0f0', borderRadius:4 }}
            onError={e => { e.target.src='https://via.placeholder.com/64'; }} />
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13, color:'#212121', lineHeight:1.4, marginBottom:4 }}>{product.name}</div>
            <div style={{ fontSize:20, fontWeight:900, color:'#212121' }}>₹{Number(amount).toLocaleString()}</div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background:'#ffebee', border:'1px solid #ffcdd2', padding:'10px 14px', fontSize:13, color:'#c62828', marginBottom:2 }}>
            ⚠️ {error}
          </div>
        )}

        {/* ── CASHFREE (if configured) ── */}
        {hasCF && (
          <div style={{ background:'#fff', padding:16, marginBottom:2 }}>
            <div style={{ fontSize:15, fontWeight:700, color:'#212121', marginBottom:14 }}>Choose Payment Method</div>
            <div style={{ display:'flex', gap:14, flexWrap:'wrap', marginBottom:16 }}>
              {UPI_APPS.map(app => (
                <div key={app.id} onClick={handleCashfreePayment}
                  style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6, cursor: loading?'not-allowed':'pointer', opacity: loading?.6:1 }}>
                  {app.logo}
                  <span style={{ fontSize:11, color:'#555', fontWeight:600 }}>{app.name}</span>
                </div>
              ))}
            </div>
            <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:16 }}>
              {['Credit / Debit Card','Net Banking','Wallet'].map(m => (
                <div key={m} onClick={handleCashfreePayment}
                  style={{ border:'1px solid #ddd', borderRadius:20, padding:'7px 14px', fontSize:12, color:'#333', cursor:'pointer', background:'#fafafa' }}>
                  {m}
                </div>
              ))}
            </div>
            <button onClick={handleCashfreePayment} disabled={loading}
              style={{ width:'100%', background: loading?'#ccc':'#fb641b', color:'#fff', border:'none', borderRadius:4, padding:14, fontSize:15, fontWeight:700, cursor: loading?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
              {loading
                ? <><span style={{ width:16,height:16,border:'2px solid #fff',borderTopColor:'transparent',borderRadius:'50%',display:'inline-block',animation:'spin .7s linear infinite' }}/> Processing...</>
                : `PAY ₹${Number(amount).toLocaleString()} SECURELY`}
            </button>
            <div style={{ textAlign:'center', fontSize:11, color:'#aaa', marginTop:8 }}>🔒 Secured · All UPI, Cards & Wallets accepted</div>
          </div>
        )}

        {/* ── UPI DIRECT (always shown) ── */}
        <div style={{ background:'#fff', padding:16, marginBottom:2 }}>
          <div style={{ fontSize:15, fontWeight:700, color:'#212121', marginBottom:4 }}>
            {hasCF ? 'Or Pay Directly via UPI App' : 'Pay via UPI'}
          </div>
          <div style={{ fontSize:12, color:'#888', marginBottom:16 }}>Tap an app — it opens automatically with the amount pre-filled</div>

          {/* UPI App grid — each opens that specific app */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:16 }}>
            {UPI_APPS.map(app => (
              <div key={app.id} onClick={() => openUpiApp(app.id)}
                style={{ display:'flex', alignItems:'center', gap:12, border:'1.5px solid #e8e8e8', borderRadius:10, padding:'12px 14px', cursor:'pointer', background:'#fafafa', transition:'border-color .15s' }}
                onMouseEnter={e => e.currentTarget.style.borderColor='#2874f0'}
                onMouseLeave={e => e.currentTarget.style.borderColor='#e8e8e8'}>
                {app.logo}
                <div>
                  <div style={{ fontSize:13, fontWeight:700, color:'#212121' }}>{app.name}</div>
                  <div style={{ fontSize:11, color:'#888' }}>Tap to open</div>
                </div>
              </div>
            ))}
          </div>


        </div>

        {/* No COD */}
        <div style={{ background:'#fff', padding:'12px 16px', marginBottom:2 }}>
          <div style={{ fontSize:13, color:'#d32f2f', fontWeight:600 }}>❌ Cash on Delivery not available for this product.</div>
        </div>

        {/* Safety */}
        <div style={{ background:'#f1f3f6', padding:'12px 16px', display:'flex', alignItems:'center', gap:12 }}>
          <img src="https://rukminim1.flixcart.com/www/60/70/promos/13/02/2019/9b179a8a-a0e2-497b-bd44-20aa733dc0ec.png?q=90"
            alt="" style={{ width:36, height:28, objectFit:'contain' }} />
          <div style={{ fontSize:12, color:'#717478', fontWeight:600, lineHeight:1.5 }}>Safe and secure payments.<br/>Easy returns. 100% Authentic products.</div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ position:'fixed', bottom:0, left:'50%', transform:'translateX(-50%)', width:'100%', maxWidth:480, background:'#fff', borderTop:'1px solid #eee', display:'flex', alignItems:'center', padding:'10px 14px', zIndex:50, gap:12, boxShadow:'0 -2px 10px rgba(0,0,0,.08)' }}>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:11, textDecoration:'line-through', color:'#878787' }}>₹{Number(product.oldPrice).toLocaleString()}</div>
          <div style={{ fontSize:22, fontWeight:900, color:'#212121' }}>₹{Number(amount).toLocaleString()}</div>
        </div>
        <button
          onClick={hasCF ? handleCashfreePayment : () => openUpiApp('phonepe')}
          disabled={loading}
          style={{ flex:1.2, background: loading?'#ccc':'#fb641b', color:'#fff', border:'none', borderRadius:4, padding:14, fontSize:15, fontWeight:700, cursor: loading?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
          {loading
            ? <><span style={{ width:16,height:16,border:'2px solid #fff',borderTopColor:'transparent',borderRadius:'50%',display:'inline-block',animation:'spin .7s linear infinite' }}/> Processing...</>
            : 'PAY NOW'}
        </button>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </>
  );
}
