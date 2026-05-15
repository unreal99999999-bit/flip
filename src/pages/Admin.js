import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getProducts, getOrders, getPaymentUrl, savePaymentUrl,
  addProduct, deleteProduct, isAdminLoggedIn, adminLogout,
  getCashfreeCreds, saveCashfreeCreds,
} from '../store';

const EMPTY = { name:'', brand:'', description:'', price:'', discount:'', oldPrice:'', colors:'', colorImageUrls:'' };

export default function Admin() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('products');
  const [products, setProducts]   = useState([]);
  const [orders, setOrders]       = useState([]);
  const [upiUrl, setUpiUrl]       = useState('');
  const [newUpi, setNewUpi]       = useState('');
  const [creds, setCreds]         = useState({ appId:'', secretKey:'', environment:'production' });
  const [showSecret, setShowSecret] = useState(false);
  const [showAdd, setShowAdd]     = useState(false);
  const [form, setForm]           = useState(EMPTY);
  const [msg, setMsg]             = useState({ text:'', type:'success' });

  useEffect(() => {
    if (!isAdminLoggedIn()) { navigate('/login'); return; }
    setProducts(getProducts());
    setOrders(getOrders());
    const url = getPaymentUrl(); setUpiUrl(url); setNewUpi(url);
    setCreds(getCashfreeCreds());
  }, [navigate]);

  const notify = (text, type='success') => { setMsg({ text, type }); setTimeout(() => setMsg({ text:'', type:'success' }), 3000); };

  const handleLogout = () => { adminLogout(); navigate('/login'); };

  const handleDelete = id => {
    if (!window.confirm('Delete this product?')) return;
    deleteProduct(id); setProducts(getProducts()); notify('Product deleted.');
  };

  const handleAdd = e => {
    e.preventDefault();
    addProduct({ ...form, price:Number(form.price), discount:Number(form.discount), oldPrice:Number(form.oldPrice),
      colors: form.colors.split(',').map(s=>s.trim()).filter(Boolean),
      colorImageUrls: form.colorImageUrls.split(',').map(s=>s.trim()).filter(Boolean) });
    setProducts(getProducts()); setForm(EMPTY); setShowAdd(false); notify('✅ Product added!');
  };

  const handleSaveUpi = e => {
    e.preventDefault(); savePaymentUrl(newUpi); setUpiUrl(newUpi); notify('✅ UPI ID saved!');
  };

  const handleSaveCreds = e => {
    e.preventDefault(); saveCashfreeCreds(creds); notify('✅ Payment gateway saved!');
  };

  const TABS = [
    ['products', `Products (${products.length})`],
    ['orders',   `Orders (${orders.length})`],
    ['payment',  'Payment Gateway'],
  ];

  return (
    <div style={{ minHeight:'100vh', background:'#f1f2f4', fontFamily:'Inter,sans-serif', fontSize:13 }}>

      {/* Top bar */}
      <div style={{ background:'#2874F0', color:'#fff', padding:'12px 16px', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, zIndex:100 }}>
        <span style={{ fontWeight:800, fontSize:17 }}>🛒 Admin Panel</span>
        <div style={{ display:'flex', gap:16, alignItems:'center' }}>
          <a href="/" style={{ color:'#FFD000', fontSize:13, fontWeight:600 }}>View Store ↗</a>
          <button onClick={handleLogout} style={{ background:'#fff', color:'#2874F0', border:'none', borderRadius:4, padding:'6px 14px', fontWeight:700, cursor:'pointer' }}>Logout</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background:'#fff', borderBottom:'2px solid #eee', display:'flex' }}>
        {TABS.map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{ border:'none', background:'none', padding:'13px 16px', fontWeight:700, fontSize:13, color: tab===key ? '#2874F0' : '#666', borderBottom: tab===key ? '3px solid #2874F0' : '3px solid transparent', cursor:'pointer' }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ padding:'12px 12px 40px', maxWidth:800, margin:'0 auto' }}>

        {/* Global feedback */}
        {msg.text && (
          <div style={{ background: msg.type==='error' ? '#ffebee' : '#e8f5e9', border:`1px solid ${msg.type==='error' ? '#ffcdd2' : '#c8e6c9'}`, borderRadius:4, padding:'10px 14px', fontSize:13, color: msg.type==='error' ? '#c62828' : '#2e7d32', marginBottom:12 }}>
            {msg.text}
          </div>
        )}

        {/* ═══════════════════ PRODUCTS ═══════════════════ */}
        {tab === 'products' && (
          <>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
              <span style={{ fontWeight:700, fontSize:15 }}>All Products</span>
              <button onClick={() => setShowAdd(!showAdd)}
                style={{ background: showAdd ? '#f5f5f5' : '#2874F0', color: showAdd ? '#333' : '#fff', border:'none', borderRadius:4, padding:'8px 16px', fontWeight:700, cursor:'pointer' }}>
                {showAdd ? '✕ Cancel' : '+ Add Product'}
              </button>
            </div>

            {showAdd && (
              <div style={{ background:'#fff', borderRadius:4, padding:16, marginBottom:12, boxShadow:'0 1px 4px rgba(0,0,0,.1)' }}>
                <div style={{ fontWeight:700, marginBottom:14, color:'#2874F0' }}>➕ New Product</div>
                <form onSubmit={handleAdd}>
                  <div style={{ display:'flex', gap:8, marginBottom:8 }}>
                    <input style={inp} placeholder="Product Name *" required value={form.name} onChange={e => setForm({...form,name:e.target.value})} />
                    <input style={inp} placeholder="Brand *" required value={form.brand} onChange={e => setForm({...form,brand:e.target.value})} />
                  </div>
                  <div style={{ display:'flex', gap:8, marginBottom:8 }}>
                    <input style={inp} type="number" placeholder="Price ₹ *" required value={form.price} onChange={e => setForm({...form,price:e.target.value})} />
                    <input style={inp} type="number" placeholder="Old Price ₹ *" required value={form.oldPrice} onChange={e => setForm({...form,oldPrice:e.target.value})} />
                    <input style={inp} type="number" placeholder="Discount % *" required value={form.discount} onChange={e => setForm({...form,discount:e.target.value})} />
                  </div>
                  <input style={{ ...inp, width:'100%', marginBottom:8 }} placeholder="Colors (comma-separated, e.g. Black, White)" value={form.colors} onChange={e => setForm({...form,colors:e.target.value})} />
                  <input style={{ ...inp, width:'100%', marginBottom:8 }} placeholder="Image URLs (comma-separated)" value={form.colorImageUrls} onChange={e => setForm({...form,colorImageUrls:e.target.value})} />
                  <textarea style={{ ...inp, width:'100%', height:80, resize:'vertical' }} placeholder="Description" value={form.description} onChange={e => setForm({...form,description:e.target.value})} />
                  <button type="submit" style={{ background:'#388e3c', color:'#fff', border:'none', borderRadius:4, padding:'10px 24px', fontWeight:700, cursor:'pointer', marginTop:10 }}>Add Product</button>
                </form>
              </div>
            )}

            <div style={{ background:'#fff', borderRadius:4, overflow:'hidden', boxShadow:'0 1px 3px rgba(0,0,0,.08)' }}>
              <table style={{ width:'100%', borderCollapse:'collapse' }}>
                <thead>
                  <tr style={{ background:'#2874F0', color:'#fff' }}>
                    {['Image','Name','Brand','Price','MRP','Off','Action'].map(h => (
                      <th key={h} style={{ padding:'10px 8px', textAlign:'left', fontWeight:600, fontSize:12 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map((p,i) => (
                    <tr key={p._id} style={{ background: i%2===0 ? '#fff' : '#fafafa', borderBottom:'1px solid #f0f0f0' }}>
                      <td style={{ padding:'8px' }}><img src={(p.colorImageUrls||[])[0]?.trim()} alt="" style={{ width:42, height:42, objectFit:'contain' }} onError={e=>{e.target.src='https://via.placeholder.com/42'}}/></td>
                      <td style={{ padding:'8px', maxWidth:180, fontSize:12 }}>{p.name}</td>
                      <td style={{ padding:'8px' }}>{p.brand}</td>
                      <td style={{ padding:'8px', fontWeight:700 }}>₹{Number(p.price).toLocaleString()}</td>
                      <td style={{ padding:'8px', textDecoration:'line-through', color:'#888' }}>₹{Number(p.oldPrice).toLocaleString()}</td>
                      <td style={{ padding:'8px', color:'#388e3c', fontWeight:700 }}>{p.discount}%</td>
                      <td style={{ padding:'8px' }}>
                        <button onClick={() => handleDelete(p._id)} style={{ background:'#ffebee', color:'#c62828', border:'1px solid #ffcdd2', borderRadius:4, padding:'4px 10px', cursor:'pointer', fontWeight:600 }}>Delete</button>
                      </td>
                    </tr>
                  ))}
                  {!products.length && <tr><td colSpan={7} style={{ padding:24, textAlign:'center', color:'#aaa' }}>No products yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ═══════════════════ ORDERS ═══════════════════ */}
        {tab === 'orders' && (
          <>
            <div style={{ fontWeight:700, fontSize:15, marginBottom:10 }}>All Orders</div>
            <div style={{ background:'#fff', borderRadius:4, overflow:'auto', boxShadow:'0 1px 3px rgba(0,0,0,.08)' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', minWidth:600 }}>
                <thead>
                  <tr style={{ background:'#2874F0', color:'#fff' }}>
                    {['#','Customer','Mobile','Address','Product','Amount','Date','Status'].map(h => (
                      <th key={h} style={{ padding:'10px 8px', textAlign:'left', fontWeight:600, fontSize:12 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o,i) => (
                    <tr key={o._id} style={{ background: i%2===0 ? '#fff' : '#fafafa', borderBottom:'1px solid #f0f0f0' }}>
                      <td style={{ padding:'8px' }}>{i+1}</td>
                      <td style={{ padding:'8px', fontWeight:600 }}>{o.name}</td>
                      <td style={{ padding:'8px' }}>{o.number}</td>
                      <td style={{ padding:'8px', maxWidth:160, fontSize:12 }}>{o.flat ? `${o.flat}, ${o.area}, ${o.city} ${o.pin}, ${o.state}` : '—'}</td>
                      <td style={{ padding:'8px', maxWidth:160, fontSize:12 }}>{o.productName || o.productId}</td>
                      <td style={{ padding:'8px', fontWeight:700 }}>₹{Number(o.productPrice).toLocaleString()}</td>
                      <td style={{ padding:'8px', fontSize:11 }}>{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                      <td style={{ padding:'8px' }}>
                        <span style={{ background: o.status==='pending' ? '#ff9800' : o.status==='delivered' ? '#4caf50' : '#2196f3', color:'#fff', borderRadius:3, padding:'2px 8px', fontSize:11, fontWeight:600 }}>
                          {o.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {!orders.length && <tr><td colSpan={8} style={{ padding:24, textAlign:'center', color:'#aaa' }}>No orders yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </>
        )}

        {/* ═══════════════════ PAYMENT GATEWAY ═══════════════════ */}
        {tab === 'payment' && (
          <div style={{ maxWidth:520 }}>

            {/* ── SETUP GUIDE ── */}
            <div style={{ background:'#e3f2fd', border:'1px solid #90caf9', borderRadius:8, padding:16, marginBottom:16 }}>
              <div style={{ fontWeight:800, fontSize:14, color:'#1565c0', marginBottom:12 }}>
                📖 How to Set Up Cashfree Payment Gateway
              </div>
              {[
                { step:'1', title:'Create a Cashfree Account', desc:'Go to cashfree.com → Click "Sign Up" → Complete KYC verification (takes 1–2 business days). You need: PAN card, Bank account details, Business details.' },
                { step:'2', title:'Get Your API Keys', desc:'After KYC approval → Login to Cashfree Dashboard → Go to Developers → API Keys → Copy your "App ID" and "Secret Key". Keep Secret Key private — never share it.' },
                { step:'3', title:'Choose Environment', desc:'Use "Test / Sandbox" mode first to test payments without real money. Switch to "Production" only when you\'re ready to accept real payments.' },
                { step:'4', title:'Paste Keys Below', desc:'Copy App ID and Secret Key from Cashfree dashboard and paste them in the form below. Click Save. Done — your site will now accept PhonePe, GPay, Paytm, Cards & more!' },
                { step:'5', title:'Set Return URL in Cashfree', desc:'In Cashfree Dashboard → Settings → Webhooks → set Return URL to: your-site.netlify.app/payment-success — customers return here after paying.' },
              ].map(s => (
                <div key={s.step} style={{ display:'flex', gap:12, marginBottom:12 }}>
                  <div style={{ background:'#2874F0', color:'#fff', width:26, height:26, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:13, flexShrink:0 }}>{s.step}</div>
                  <div>
                    <div style={{ fontWeight:700, color:'#1a237e', marginBottom:2 }}>{s.title}</div>
                    <div style={{ color:'#455a64', lineHeight:1.6 }}>{s.desc}</div>
                  </div>
                </div>
              ))}
              <a href="https://merchant.cashfree.com/merchants/signup" target="_blank" rel="noreferrer"
                style={{ display:'inline-block', background:'#2874F0', color:'#fff', borderRadius:4, padding:'9px 20px', fontWeight:700, fontSize:13, marginTop:4 }}>
                Open Cashfree Dashboard ↗
              </a>
            </div>

            {/* ── CASHFREE KEYS FORM ── */}
            <div style={{ background:'#fff', borderRadius:8, padding:16, boxShadow:'0 1px 4px rgba(0,0,0,.1)', marginBottom:16 }}>
              <div style={{ fontWeight:800, fontSize:14, color:'#212121', marginBottom:4 }}>🔑 Payment Gateway Credentials</div>
              <div style={{ fontSize:12, color:'#777', marginBottom:14 }}>Your keys are stored only in your browser. They are sent securely to process payments and never shown to customers.</div>

              <form onSubmit={handleSaveCreds}>
                <div style={{ marginBottom:12 }}>
                  <label style={lbl}>App ID <span style={{ color:'#e53935' }}>*</span></label>
                  <input style={{ ...inp, width:'100%' }} placeholder="e.g. CF10234TESTAPP" value={creds.appId}
                    onChange={e => setCreds({...creds, appId:e.target.value})} />
                  <div style={{ fontSize:11, color:'#888', marginTop:3 }}>Found in: Cashfree Dashboard → Developers → API Keys</div>
                </div>

                <div style={{ marginBottom:12 }}>
                  <label style={lbl}>Secret Key <span style={{ color:'#e53935' }}>*</span></label>
                  <div style={{ position:'relative' }}>
                    <input
                      style={{ ...inp, width:'100%', paddingRight:44 }}
                      type={showSecret ? 'text' : 'password'}
                      placeholder="Your Cashfree secret key"
                      value={creds.secretKey}
                      onChange={e => setCreds({...creds, secretKey:e.target.value})}
                    />
                    <button type="button" onClick={() => setShowSecret(s => !s)}
                      style={{ position:'absolute', right:8, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'#888', fontSize:16 }}>
                      {showSecret ? '🙈' : '👁️'}
                    </button>
                  </div>
                  <div style={{ fontSize:11, color:'#e53935', marginTop:3 }}>⚠️ Never share this key with anyone.</div>
                </div>

                <div style={{ marginBottom:16 }}>
                  <label style={lbl}>Environment</label>
                  <div style={{ display:'flex', gap:10, marginTop:6 }}>
                    {[['sandbox','🧪 Test / Sandbox'],['production','🚀 Production (Live)']].map(([val, label]) => (
                      <label key={val} style={{ display:'flex', alignItems:'center', gap:6, cursor:'pointer', background: creds.environment===val ? '#e8f0fe' : '#f5f5f5', border:`2px solid ${creds.environment===val ? '#2874F0' : '#ddd'}`, borderRadius:6, padding:'8px 14px', flex:1, fontWeight: creds.environment===val ? 700 : 400, color: creds.environment===val ? '#2874F0' : '#555' }}>
                        <input type="radio" name="env" value={val} checked={creds.environment===val} onChange={() => setCreds({...creds, environment:val})} style={{ display:'none' }} />
                        {label}
                      </label>
                    ))}
                  </div>
                  {creds.environment === 'sandbox' && (
                    <div style={{ background:'#fff8e1', border:'1px solid #ffe082', borderRadius:4, padding:'8px 12px', fontSize:12, color:'#5d4037', marginTop:8 }}>
                      🧪 Test mode — use Cashfree test card numbers. No real money charged.
                    </div>
                  )}
                </div>

                {/* Status indicator */}
                {creds.appId && creds.secretKey && (
                  <div style={{ background:'#e8f5e9', border:'1px solid #c8e6c9', borderRadius:4, padding:'8px 12px', fontSize:12, color:'#2e7d32', marginBottom:12 }}>
                    ✅ Payment gateway is configured. Customers can now pay via PhonePe, GPay, Paytm, Cards & more.
                  </div>
                )}
                {(!creds.appId || !creds.secretKey) && (
                  <div style={{ background:'#fff3e0', border:'1px solid #ffe0b2', borderRadius:4, padding:'8px 12px', fontSize:12, color:'#e65100', marginBottom:12 }}>
                    ⚠️ Keys not set. Payments will use UPI fallback link until you add your App ID & Secret Key.
                  </div>
                )}

                <button type="submit" style={{ background:'#2874F0', color:'#fff', border:'none', borderRadius:4, padding:'11px 28px', fontWeight:700, cursor:'pointer', fontSize:14 }}>
                  💾 Save Credentials
                </button>
                {creds.appId && (
                  <button type="button" onClick={() => { saveCashfreeCreds({ appId:'', secretKey:'', environment:'production' }); setCreds({ appId:'', secretKey:'', environment:'production' }); notify('Credentials cleared.'); }}
                    style={{ background:'#ffebee', color:'#c62828', border:'1px solid #ffcdd2', borderRadius:4, padding:'11px 16px', fontWeight:700, cursor:'pointer', fontSize:13, marginLeft:10 }}>
                    🗑️ Clear
                  </button>
                )}
              </form>
            </div>

            {/* ── FALLBACK UPI ── */}
            <div style={{ background:'#fff', borderRadius:8, padding:16, boxShadow:'0 1px 4px rgba(0,0,0,.1)' }}>
              <div style={{ fontWeight:800, fontSize:14, color:'#212121', marginBottom:4 }}>📱 Fallback UPI ID</div>
              <div style={{ fontSize:12, color:'#777', marginBottom:12 }}>Used as backup if payment gateway is not configured. Customers tap Pay Now and are redirected to their UPI app.</div>
              <form onSubmit={handleSaveUpi}>
                <input style={{ ...inp, width:'100%', marginBottom:10 }} placeholder="e.g. yourname@upi or https://payment.link/..."
                  value={newUpi} onChange={e => setNewUpi(e.target.value)} />
                {upiUrl && (
                  <div style={{ fontSize:12, color:'#555', marginBottom:10 }}>
                    Current: <strong style={{ color:'#2874F0' }}>{upiUrl}</strong>
                  </div>
                )}
                <button type="submit" style={{ background:'#388e3c', color:'#fff', border:'none', borderRadius:4, padding:'10px 24px', fontWeight:700, cursor:'pointer' }}>
                  💾 Save UPI ID
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* shared micro-styles */
const inp = {
  border:'1px solid #ddd', borderRadius:4, padding:'9px 12px',
  fontSize:13, outline:'none', background:'#fff', flex:1,
};
const lbl = { display:'block', fontSize:12, fontWeight:700, color:'#555', marginBottom:5 };
