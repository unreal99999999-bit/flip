import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getPaymentUrl, getCashfreeCreds, saveOrder } from '../store';

export default function Payment() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!state?.product) {
    return (
      <div style={{ textAlign:'center', padding:40 }}>
        <button onClick={() => navigate('/')} style={{ background:'#2874f0', color:'#fff', border:'none', padding:'12px 28px', borderRadius:4, fontWeight:700, cursor:'pointer' }}>Go Home</button>
      </div>
    );
  }

  const { product, colorIndex, name, number } = state;
  const img = (product.colorImageUrls||[])[colorIndex]?.trim() || (product.colorImageUrls||[])[0]?.trim();
  const creds = getCashfreeCreds();
  const upiUrl = getPaymentUrl();
  const hasCashfree = !!(creds.appId && creds.secretKey);

  const UPI_APPS = [
    { name:'PhonePe', src:'https://upload.wikimedia.org/wikipedia/commons/thumb/7/71/PhonePe_Logo.png/200px-PhonePe_Logo.png' },
    { name:'GPay',    src:'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f2/Google_Pay_Logo.svg/120px-Google_Pay_Logo.svg.png' },
    { name:'Paytm',   src:'https://upload.wikimedia.org/wikipedia/commons/thumb/4/42/Paytm_logo.png/200px-Paytm_logo.png' },
    { name:'BHIM',    src:'https://upload.wikimedia.org/wikipedia/commons/thumb/e/ee/BHIM-logo.svg/120px-BHIM-logo.svg.png' },
  ];

  /* ── Cashfree via Netlify Function ── */
  const handleCashfreePayment = async () => {
    setLoading(true);
    setError('');
    try {
      const orderId = 'order_' + Date.now();
      saveOrder({ name, number, productId: product._id, colorIndex, productName: product.name, productPrice: product.price, orderId });

      const res  = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({
          amount: product.price,
          customerName: name || 'Customer',
          customerPhone: number || '9999999999',
          orderId,
          appId: creds.appId,
          secretKey: creds.secretKey,
          environment: creds.environment || 'production',
        }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || 'Payment failed. Please try again.');
        setLoading(false);
        return;
      }

      if (data.payment_link) {
        window.location.href = data.payment_link;
        return;
      }

      if (data.payment_session_id) {
        /* load Cashfree JS SDK then open checkout — user sees PhonePe/GPay/Paytm, no "Cashfree" label */
        const script = document.createElement('script');
        script.src = 'https://sdk.cashfree.com/js/v3/cashfree.js';
        script.onload = () => {
          const cf = window.Cashfree({ mode: creds.environment === 'production' ? 'production' : 'sandbox' });
          cf.checkout({ paymentSessionId: data.payment_session_id, redirectTarget:'_self' });
        };
        script.onerror = () => { setError('Could not load payment. Try again.'); setLoading(false); };
        document.body.appendChild(script);
        return;
      }

      setError('No payment link received. Check your App ID & Secret Key.');
      setLoading(false);
    } catch (err) {
      setError('Network error. Check your connection.');
      setLoading(false);
    }
  };

  /* ── Fallback UPI deep-link ── */
  const handleUpiPay = () => {
    if (!upiUrl) { setError('No payment method configured. Go to Admin → Payment Gateway.'); return; }
    window.location.href = upiUrl.startsWith('http')
      ? upiUrl
      : `upi://pay?pa=${encodeURIComponent(upiUrl)}&pn=ShopNow&am=${product.price}&cu=INR&tn=Order`;
  };

  const mainAction = hasCashfree ? handleCashfreePayment : handleUpiPay;

  return (
    <>
      {/* Header */}
      <div style={{ background:'#fff', display:'flex', alignItems:'center', gap:12, padding:'12px 14px', position:'sticky', top:0, zIndex:99, borderBottom:'1px solid #eee' }}>
        <div style={{ cursor:'pointer' }} onClick={() => navigate(-1)}>
          <svg width="19" height="16" viewBox="0 0 19 16" fill="none">
            <path d="M17.556 7.847H1M7.45 1L1 7.877l6.45 6.817" stroke="#212121" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span style={{ fontWeight:700, fontSize:15, color:'#212121' }}>Payment</span>
      </div>

      {/* Progress */}
      <div style={{ background:'#fff', padding:'10px 16px 8px', marginBottom:2 }}>
        <div style={{ height:4, background:'#eee', borderRadius:2, marginBottom:8 }}>
          <div style={{ width:'100%', height:'100%', background:'#2874F0', borderRadius:2 }} />
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'#aaa' }}>
          <span>Address</span><span>Order Summary</span>
          <span style={{ color:'#2874F0', fontWeight:700 }}>Payment</span>
        </div>
      </div>

      <div style={{ paddingBottom:80 }}>
        {/* Order recap */}
        <div style={{ background:'#fff', padding:14, marginBottom:2, display:'flex', gap:12, alignItems:'center' }}>
          <img src={img} alt="" style={{ width:60, height:60, objectFit:'contain' }}
            onError={e => { e.target.src='https://via.placeholder.com/60'; }} />
          <div>
            <div style={{ fontSize:13, fontWeight:500, lineHeight:1.4 }}>{product.name}</div>
            <div style={{ fontSize:20, fontWeight:800, marginTop:4 }}>₹{Number(product.price).toLocaleString()}</div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background:'#ffebee', border:'1px solid #ffcdd2', borderRadius:4, padding:'10px 14px', fontSize:13, color:'#c62828', margin:'0 0 2px' }}>
            ⚠️ {error}
          </div>
        )}

        {/* Payment section */}
        <div style={{ background:'#fff', padding:16, marginBottom:2 }}>
          <div style={{ fontSize:14, fontWeight:700, marginBottom:14, color:'#212121' }}>
            {hasCashfree ? 'Choose Payment Method' : 'Pay via UPI'}
          </div>

          {/* UPI app icons */}
          <div style={{ display:'flex', gap:18, flexWrap:'wrap', marginBottom:16 }}>
            {UPI_APPS.map(app => (
              <div key={app.name} onClick={mainAction}
                style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1 }}>
                <img src={app.src} alt={app.name}
                  style={{ width:48, height:48, objectFit:'contain', borderRadius:12, border:'1px solid #f0f0f0', padding:4 }}
                  onError={e => { e.target.style.display='none'; }} />
                <span style={{ fontSize:11, color:'#555', fontWeight:500 }}>{app.name}</span>
              </div>
            ))}
          </div>

          {/* Extra options for Cashfree */}
          {hasCashfree && (
            <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:16 }}>
              {['Credit / Debit Card', 'Net Banking', 'Wallet'].map(m => (
                <div key={m} onClick={mainAction}
                  style={{ border:'1px solid #ddd', borderRadius:20, padding:'6px 14px', fontSize:12, color:'#333', cursor:'pointer', background:'#fafafa' }}>
                  {m}
                </div>
              ))}
            </div>
          )}

          {/* UPI ID box (fallback mode only) */}
          {!hasCashfree && upiUrl && (
            <div style={{ background:'#f5f7ff', border:'1px solid #c5d5ff', borderRadius:6, padding:'10px 14px', marginBottom:12 }}>
              <div style={{ fontSize:10, color:'#888', marginBottom:2 }}>UPI ID:</div>
              <strong style={{ color:'#2874F0', wordBreak:'break-all' }}>{upiUrl}</strong>
            </div>
          )}

          {/* Note */}
          <div style={{ background: hasCashfree ? '#e8f5e9' : '#fff8e1', border:`1px solid ${hasCashfree ? '#c8e6c9' : '#ffe082'}`, borderRadius:4, padding:'10px 12px', fontSize:12, color: hasCashfree ? '#2e7d32' : '#5d4037' }}>
            {hasCashfree
              ? '✅ Secure payment powered by your gateway. PhonePe, GPay & all UPI apps supported.'
              : '⚠️ After payment, send screenshot to confirm your order. Thank you!'}
          </div>
        </div>

        {/* No COD */}
        <div style={{ background:'#fff', padding:'12px 16px', marginBottom:2 }}>
          <div style={{ fontSize:13, color:'#d32f2f', fontWeight:500 }}>❌ Cash on Delivery not available.</div>
        </div>

        {/* Safety */}
        <div style={{ background:'#f1f3f6', padding:'12px 16px', display:'flex', alignItems:'center', gap:10, marginBottom:2 }}>
          <img src="https://rukminim1.flixcart.com/www/60/70/promos/13/02/2019/9b179a8a-a0e2-497b-bd44-20aa733dc0ec.png?q=90"
            alt="" style={{ width:40, height:30, objectFit:'contain' }} />
          <div style={{ fontSize:12, color:'#717478', fontWeight:600, lineHeight:1.5 }}>
            Safe and secure payments.<br/>Easy returns. 100% Authentic products.
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ position:'fixed', bottom:0, left:'50%', transform:'translateX(-50%)', width:'100%', maxWidth:480, background:'#fff', borderTop:'1px solid #eee', display:'flex', alignItems:'center', padding:'10px 16px', zIndex:50, gap:12, boxShadow:'0 -2px 8px rgba(0,0,0,.08)' }}>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:11, textDecoration:'line-through', color:'#878787' }}>₹{Number(product.oldPrice).toLocaleString()}</div>
          <div style={{ fontSize:20, fontWeight:800 }}>₹{Number(product.price).toLocaleString()}</div>
        </div>
        <button onClick={mainAction} disabled={loading}
          style={{ flex:1, background: loading ? '#ccc' : '#fb641b', color:'#fff', border:'none', borderRadius:2, padding:13, fontSize:14, fontWeight:700, cursor: loading ? 'not-allowed' : 'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
          {loading
            ? <><span style={{ width:16, height:16, border:'2px solid #fff', borderTopColor:'transparent', borderRadius:'50%', display:'inline-block', animation:'spin .7s linear infinite' }} /> Processing...</>
            : 'PAY NOW'}
        </button>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </>
  );
}
