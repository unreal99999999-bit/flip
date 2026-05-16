import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getCashfreeCreds, saveOrder } from '../store';

export default function Payment() {
  const { state }  = useLocation();
  const navigate   = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  if (!state?.product) {
    return (
      <div style={{ textAlign:'center', padding:40 }}>
        <button onClick={() => navigate('/')}
          style={{ background:'#2874f0', color:'#fff', border:'none', padding:'12px 28px', borderRadius:4, fontWeight:700, cursor:'pointer' }}>
          Go Home
        </button>
      </div>
    );
  }

  const { product, colorIndex, name, number } = state;
  const img    = (product.colorImageUrls||[])[colorIndex]?.trim() || (product.colorImageUrls||[])[0]?.trim();
  const creds  = getCashfreeCreds();
  const hasCF  = !!(creds.appId && creds.secretKey);
  const amount = product.price;

  /* ── Cashfree gateway ── */
  const handleCashfree = async () => {
    if (!hasCF) { setError('Payment gateway not configured. Please contact admin.'); return; }
    setLoading(true); setError('');
    try {
      const orderId = 'order_' + Date.now();
      saveOrder({ name, number, productId:product._id, colorIndex, productName:product.name, productPrice:product.price, orderId });

      const res  = await fetch('/api/create-order', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({
          amount, customerName:name||'Customer',
          customerPhone:number||'9999999999',
          orderId, appId:creds.appId, secretKey:creds.secretKey,
          environment:creds.environment||'production',
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) { setError(data.error||'Payment failed. Please try again.'); setLoading(false); return; }

      if (data.payment_link) { window.location.href = data.payment_link; return; }

      if (data.payment_session_id) {
        const script    = document.createElement('script');
        script.src      = 'https://sdk.cashfree.com/js/v3/cashfree.js';
        script.onload   = () => {
          const cf = window.Cashfree({ mode: creds.environment==='production'?'production':'sandbox' });
          cf.checkout({ paymentSessionId:data.payment_session_id, redirectTarget:'_self' });
        };
        script.onerror  = () => { setError('Could not load payment. Please try again.'); setLoading(false); };
        document.body.appendChild(script);
        return;
      }
      setError('No payment link received. Check Admin → Payment settings.');
      setLoading(false);
    } catch { setError('Network error. Please check your connection.'); setLoading(false); }
  };

  const UPI_APPS = [
    { id:'phonepe', name:'PhonePe',    icon:'/phonepe.svg',    bg:'#5f259f' },
    { id:'gpay',    name:'Google Pay', icon:null,              bg:'#fff'    },
    { id:'paytm',   name:'Paytm',      icon:'/paytm_icon.svg', bg:'#fff'    },
    { id:'bhim',    name:'BHIM UPI',   icon:'/bhim_upi.svg',   bg:'#fff'    },
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
      <div style={{ background:'#fff', padding:'8px 16px 10px', marginBottom:2 }}>
        <div style={{ height:4, background:'#eee', borderRadius:2, marginBottom:6 }}>
          <div style={{ width:'100%', height:'100%', background:'#2874F0', borderRadius:2 }} />
        </div>
        <div style={{ display:'flex', justifyContent:'space-between', fontSize:11, color:'#aaa' }}>
          <span>Address</span><span>Order Summary</span>
          <span style={{ color:'#2874F0', fontWeight:700 }}>Payment</span>
        </div>
      </div>

      <div style={{ paddingBottom:84 }}>

        {/* Product recap */}
        <div style={{ background:'#fff', padding:14, marginBottom:2, display:'flex', gap:12, alignItems:'center' }}>
          <img src={img} alt="" style={{ width:64, height:64, objectFit:'contain', border:'1px solid #f0f0f0', borderRadius:4 }}
            onError={e => { e.target.src='https://via.placeholder.com/64'; }} />
          <div style={{ flex:1 }}>
            <div style={{ fontSize:13, color:'#212121', lineHeight:1.4, marginBottom:4 }}>{product.name}</div>
            <div style={{ fontSize:22, fontWeight:900, color:'#212121' }}>₹{Number(amount).toLocaleString()}</div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background:'#ffebee', border:'1px solid #ffcdd2', padding:'10px 14px', fontSize:13, color:'#c62828', marginBottom:2 }}>
            ⚠️ {error}
          </div>
        )}

        {/* Payment section */}
        <div style={{ background:'#fff', padding:16, marginBottom:2 }}>
          <div style={{ fontSize:15, fontWeight:700, color:'#212121', marginBottom:14 }}>Choose Payment Method</div>

          {/* UPI App icons — all go through Cashfree */}
          <div style={{ display:'flex', gap:16, flexWrap:'wrap', marginBottom:16 }}>
            {UPI_APPS.map(app => (
              <div key={app.id} onClick={handleCashfree}
                style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6, cursor: loading?'not-allowed':'pointer', opacity: loading?.5:1 }}>
                <div style={{ width:54, height:54, borderRadius:14, background:app.bg, border:'1px solid #eee', overflow:'hidden', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 1px 4px rgba(0,0,0,.1)' }}>
                  {app.icon
                    ? <img src={app.icon} alt={app.name} style={{ width:44, height:44, objectFit:'contain' }}
                        onError={e => { e.target.style.display='none'; }} />
                    : <svg viewBox="0 0 60 26" width="50" height="22">
                        <text x="0" y="20" fontSize="14" fontWeight="700" fontFamily="Arial">
                          <tspan fill="#4285F4">G</tspan><tspan fill="#EA4335">o</tspan>
                          <tspan fill="#FBBC04">o</tspan><tspan fill="#4285F4">g</tspan>
                          <tspan fill="#34A853">l</tspan><tspan fill="#EA4335">e</tspan>
                        </text>
                      </svg>
                  }
                </div>
                <span style={{ fontSize:11, color:'#555', fontWeight:600 }}>{app.name}</span>
              </div>
            ))}
          </div>

          {/* Other methods */}
          <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:16 }}>
            {['Credit / Debit Card','Net Banking','Wallet'].map(m => (
              <div key={m} onClick={handleCashfree}
                style={{ border:'1px solid #ddd', borderRadius:20, padding:'7px 14px', fontSize:12, color:'#333', cursor:'pointer', background:'#fafafa' }}>
                {m}
              </div>
            ))}
          </div>

          {/* Status */}
          {hasCF ? (
            <div style={{ background:'#e8f5e9', border:'1px solid #c8e6c9', borderRadius:4, padding:'8px 12px', fontSize:12, color:'#2e7d32' }}>
              🔒 100% Secure · PhonePe, GPay, Paytm, Cards & Wallets supported
            </div>
          ) : (
            <div style={{ background:'#fff3e0', border:'1px solid #ffe0b2', borderRadius:4, padding:'10px 12px', fontSize:12, color:'#e65100' }}>
              ⚠️ Payment gateway not configured. Please contact the store admin.
            </div>
          )}
        </div>

        {/* No COD */}
        <div style={{ background:'#fff', padding:'12px 16px', marginBottom:2 }}>
          <div style={{ fontSize:13, color:'#d32f2f', fontWeight:600 }}>❌ Cash on Delivery not available.</div>
        </div>

        {/* Safety */}
        <div style={{ background:'#f1f3f6', padding:'12px 16px', display:'flex', alignItems:'center', gap:12 }}>
          <img src="https://rukminim1.flixcart.com/www/60/70/promos/13/02/2019/9b179a8a-a0e2-497b-bd44-20aa733dc0ec.png?q=90"
            alt="" style={{ width:36, height:28, objectFit:'contain' }} />
          <div style={{ fontSize:12, color:'#717478', fontWeight:600, lineHeight:1.5 }}>
            Safe and secure payments.<br/>Easy returns. 100% Authentic products.
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ position:'fixed', bottom:0, left:'50%', transform:'translateX(-50%)', width:'100%', maxWidth:480, background:'#fff', borderTop:'1px solid #eee', display:'flex', alignItems:'center', padding:'10px 14px', zIndex:50, gap:12, boxShadow:'0 -2px 10px rgba(0,0,0,.08)' }}>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:11, textDecoration:'line-through', color:'#878787' }}>₹{Number(product.oldPrice).toLocaleString()}</div>
          <div style={{ fontSize:22, fontWeight:900, color:'#212121' }}>₹{Number(amount).toLocaleString()}</div>
        </div>
        <button onClick={handleCashfree} disabled={loading}
          style={{ flex:1.2, background:loading?'#ccc':'#fb641b', color:'#fff', border:'none', borderRadius:4, padding:14, fontSize:15, fontWeight:700, cursor:loading?'not-allowed':'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
          {loading
            ? <><span style={{ width:16,height:16,border:'2px solid #fff',borderTopColor:'transparent',borderRadius:'50%',display:'inline-block',animation:'spin .7s linear infinite' }}/> Processing...</>
            : 'PAY NOW'}
        </button>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </>
  );
}
