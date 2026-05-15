import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const orderId = params.get('order_id') || '';
  const [count, setCount] = useState(5);

  useEffect(() => {
    if (count <= 0) { navigate('/'); return; }
    const t = setTimeout(() => setCount(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count, navigate]);

  return (
    <div style={{ minHeight:'100vh', background:'#f1f2f4', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ background:'#fff', borderRadius:12, padding:32, textAlign:'center', maxWidth:360, width:'100%', boxShadow:'0 4px 20px rgba(0,0,0,.1)' }}>
        {/* Animated checkmark */}
        <div style={{ width:80, height:80, background:'#e8f5e9', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', fontSize:40 }}>
          ✅
        </div>
        <h2 style={{ fontSize:22, fontWeight:800, color:'#212121', marginBottom:8 }}>Payment Successful!</h2>
        <p style={{ fontSize:14, color:'#666', lineHeight:1.6, marginBottom:16 }}>
          Thank you for your order. Your payment has been received and your order is confirmed.
        </p>
        {orderId && (
          <div style={{ background:'#f5f5f5', borderRadius:6, padding:'8px 14px', fontSize:12, color:'#555', marginBottom:16 }}>
            Order ID: <strong style={{ color:'#2874F0' }}>{orderId}</strong>
          </div>
        )}
        <div style={{ fontSize:13, color:'#388e3c', fontWeight:600, marginBottom:20 }}>
          🚚 Your order will be delivered in 2–5 business days.
        </div>
        <div style={{ fontSize:12, color:'#aaa', marginBottom:16 }}>
          Redirecting to home in {count}s...
        </div>
        <button onClick={() => navigate('/')}
          style={{ background:'#2874F0', color:'#fff', border:'none', borderRadius:4, padding:'12px 32px', fontWeight:700, fontSize:14, cursor:'pointer', width:'100%' }}>
          Continue Shopping
        </button>
      </div>
    </div>
  );
}
