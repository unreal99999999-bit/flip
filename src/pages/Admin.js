import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getProducts, getOrders, addProduct, deleteProduct, updateProduct,
  isAdminLoggedIn, adminLogout,
  getCashfreeCreds, saveCashfreeCreds,
  getGithubSettings, saveGithubSettings,
  getBanners, saveBanners,
} from '../store';

const EMPTY = { name:'', brand:'', description:'', price:'', discount:'', oldPrice:'', colors:'', colorImageUrls:'' };
const inp = { border:'1px solid #ddd', borderRadius:4, padding:'9px 12px', fontSize:13, outline:'none', background:'#fff', width:'100%' };
const lbl = { display:'block', fontSize:12, fontWeight:700, color:'#555', marginBottom:5 };

export default function Admin() {
  const navigate = useNavigate();
  const [tab, setTab]             = useState('products');
  const [products, setProducts]   = useState([]);
  const [orders, setOrders]       = useState([]);
  const [creds, setCreds]         = useState({ appId:'', secretKey:'', environment:'production' });
  const [ghSettings, setGhSettings] = useState({ token:'', owner:'', repo:'' });
  const [banners, setBannersState]= useState([]);
  const [showSecret, setShowSecret] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [showAdd, setShowAdd]     = useState(false);
  const [editId, setEditId]       = useState(null);   // product being edited
  const [editForm, setEditForm]   = useState({});
  const [form, setForm]           = useState(EMPTY);
  const [syncing, setSyncing]     = useState(false);
  const [msg, setMsg]             = useState({ text:'', type:'success' });

  useEffect(() => {
    if (!isAdminLoggedIn()) { navigate('/login'); return; }
    setProducts(getProducts());
    setOrders(getOrders());
    setCreds(getCashfreeCreds());
    setGhSettings(getGithubSettings());
    setBannersState(getBanners());
  }, [navigate]);

  const notify = (text, type='success') => { setMsg({ text, type }); setTimeout(() => setMsg({ text:'', type:'success' }), 4000); };
  const handleLogout = () => { adminLogout(); navigate('/login'); };

  /* ── Products ── */
  const handleAdd = e => {
    e.preventDefault();
    addProduct({ ...form, price:Number(form.price), discount:Number(form.discount), oldPrice:Number(form.oldPrice),
      colors: form.colors.split(',').map(s=>s.trim()).filter(Boolean),
      colorImageUrls: form.colorImageUrls.split(',').map(s=>s.trim()).filter(Boolean) });
    setProducts(getProducts()); setForm(EMPTY); setShowAdd(false);
    notify('✅ Product added. Click "🚀 Sync to Website" to publish.');
  };

  const handleDelete = id => {
    if (!window.confirm('Delete this product?')) return;
    deleteProduct(id); setProducts(getProducts());
    notify('Product deleted. Click "🚀 Sync to Website" to publish.');
  };

  const startEdit = p => {
    setEditId(p._id);
    setEditForm({
      name: p.name, brand: p.brand, description: p.description||'',
      price: p.price, discount: p.discount, oldPrice: p.oldPrice,
      colors: (p.colors||[]).join(', '),
      colorImageUrls: (p.colorImageUrls||[]).join(', '),
    });
  };

  const handleSaveEdit = e => {
    e.preventDefault();
    updateProduct(editId, {
      ...editForm, price:Number(editForm.price), discount:Number(editForm.discount), oldPrice:Number(editForm.oldPrice),
      colors: editForm.colors.split(',').map(s=>s.trim()).filter(Boolean),
      colorImageUrls: editForm.colorImageUrls.split(',').map(s=>s.trim()).filter(Boolean),
    });
    setProducts(getProducts()); setEditId(null);
    notify('✅ Product updated. Click "🚀 Sync to Website" to publish.');
  };

  /* ── Sync ── */
  const handleSync = async () => {
    const gh = getGithubSettings();
    if (!gh.token || !gh.owner || !gh.repo) { setTab('github'); notify('Set up GitHub settings first.', 'error'); return; }
    setSyncing(true);
    notify('⏳ Syncing to GitHub...', 'info');
    try {
      const res = await fetch('/api/sync-products', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ products: getProducts(), githubToken:gh.token, repoOwner:gh.owner, repoName:gh.repo }),
      });
      const data = await res.json();
      if (!res.ok || data.error) notify(data.error||'Sync failed.', 'error');
      else notify('🎉 ' + data.message);
    } catch { notify('Network error. Try again.', 'error'); }
    finally { setSyncing(false); }
  };

  /* ── Banners ── */
  const handleBannerChange = (i, val) => {
    const updated = [...banners];
    updated[i] = val;
    setBannersState(updated);
  };
  const handleSaveBanners = () => {
    const filtered = banners.filter(b => b.trim());
    if (!filtered.length) { notify('Add at least 1 banner URL.', 'error'); return; }
    saveBanners(filtered);
    notify('✅ Banners saved! Refresh the home page to see changes.');
  };
  const addBannerSlot = () => { if (banners.length < 6) setBannersState([...banners, '']); };
  const removeBanner = i => { const b = banners.filter((_,idx)=>idx!==i); setBannersState(b.length ? b : ['']); };

  /* ── Payment ── */
  const handleSaveCreds = () => {
    if (!creds.appId || !creds.secretKey) { notify('Enter both App ID and Secret Key.', 'error'); return; }
    saveCashfreeCreds(creds); notify('✅ Payment credentials saved!');
  };

  /* ── GitHub ── */
  const handleSaveGithub = () => {
    if (!ghSettings.token || !ghSettings.owner || !ghSettings.repo) { notify('Fill all 3 fields.', 'error'); return; }
    saveGithubSettings(ghSettings); notify('✅ GitHub settings saved!');
  };

  const TABS = [
    ['products', `Products (${products.length})`],
    ['orders',   `Orders (${orders.length})`],
    ['banners',  '🖼️ Banners'],
    ['github',   '🔗 GitHub Sync'],
    ['payment',  '💳 Payment'],
  ];

  return (
    <div style={{ minHeight:'100vh', background:'#f1f2f4', fontFamily:'Inter,sans-serif', fontSize:13 }}>

      {/* Topbar */}
      <div style={{ background:'#2874F0', color:'#fff', padding:'12px 16px', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, zIndex:100 }}>
        <span style={{ fontWeight:800, fontSize:17 }}>🛒 Admin Panel</span>
        <div style={{ display:'flex', gap:14, alignItems:'center' }}>
          <a href="/" style={{ color:'#FFD000', fontSize:13, fontWeight:600 }}>View Store ↗</a>
          <button onClick={handleLogout} style={{ background:'#fff', color:'#2874F0', border:'none', borderRadius:4, padding:'6px 14px', fontWeight:700, cursor:'pointer' }}>Logout</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ background:'#fff', borderBottom:'2px solid #eee', display:'flex', overflowX:'auto' }}>
        {TABS.map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)}
            style={{ border:'none', background:'none', padding:'13px 14px', fontWeight:700, fontSize:12, color:tab===key?'#2874F0':'#666', borderBottom:tab===key?'3px solid #2874F0':'3px solid transparent', cursor:'pointer', whiteSpace:'nowrap' }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ padding:'12px 12px 60px', maxWidth:860, margin:'0 auto' }}>

        {/* Toast */}
        {msg.text && (
          <div style={{ background:msg.type==='error'?'#ffebee':msg.type==='info'?'#e3f2fd':'#e8f5e9', border:`1px solid ${msg.type==='error'?'#ffcdd2':msg.type==='info'?'#90caf9':'#c8e6c9'}`, borderRadius:4, padding:'10px 14px', fontSize:13, color:msg.type==='error'?'#c62828':msg.type==='info'?'#1565c0':'#2e7d32', marginBottom:12 }}>
            {msg.text}
          </div>
        )}

        {/* ══════════ PRODUCTS ══════════ */}
        {tab === 'products' && (
          <div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10, flexWrap:'wrap', gap:8 }}>
              <span style={{ fontWeight:700, fontSize:15 }}>All Products</span>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                <button onClick={handleSync} disabled={syncing}
                  style={{ background:syncing?'#ccc':'#4caf50', color:'#fff', border:'none', borderRadius:4, padding:'8px 14px', fontWeight:700, cursor:syncing?'not-allowed':'pointer', display:'flex', alignItems:'center', gap:5, fontSize:12 }}>
                  {syncing ? <><span style={{ width:11,height:11,border:'2px solid #fff',borderTopColor:'transparent',borderRadius:'50%',display:'inline-block',animation:'spin .7s linear infinite' }}/> Syncing...</> : '🚀 Sync to Website'}
                </button>
                <button onClick={() => { setShowAdd(!showAdd); setEditId(null); }}
                  style={{ background:showAdd?'#f5f5f5':'#2874F0', color:showAdd?'#333':'#fff', border:'none', borderRadius:4, padding:'8px 14px', fontWeight:700, cursor:'pointer', fontSize:12 }}>
                  {showAdd ? '✕ Cancel' : '+ Add Product'}
                </button>
              </div>
            </div>

            <div style={{ background:'#e3f2fd', border:'1px solid #90caf9', borderRadius:6, padding:10, marginBottom:12, fontSize:12, color:'#1565c0', lineHeight:1.6 }}>
              <strong>ℹ️</strong> Add/Edit/Delete products → click <strong>🚀 Sync to Website</strong> → all customers see changes in ~2 min. Setup <strong>🔗 GitHub Sync</strong> tab first.
            </div>

            {/* Add form */}
            {showAdd && (
              <div style={{ background:'#fff', borderRadius:4, padding:16, marginBottom:12, boxShadow:'0 1px 4px rgba(0,0,0,.1)' }}>
                <div style={{ fontWeight:700, marginBottom:12, color:'#2874F0', fontSize:14 }}>➕ Add New Product</div>
                <form onSubmit={handleAdd}>
                  <div style={{ display:'flex', gap:8, marginBottom:8 }}>
                    <div style={{ flex:1 }}><label style={lbl}>Product Name *</label><input style={inp} placeholder="e.g. iPhone 16 Pro" required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></div>
                    <div style={{ flex:1 }}><label style={lbl}>Brand *</label><input style={inp} placeholder="e.g. Apple" required value={form.brand} onChange={e=>setForm({...form,brand:e.target.value})}/></div>
                  </div>
                  <div style={{ display:'flex', gap:8, marginBottom:8 }}>
                    <div style={{ flex:1 }}><label style={lbl}>Selling Price ₹ *</label><input style={inp} type="number" placeholder="499" required value={form.price} onChange={e=>setForm({...form,price:e.target.value})}/></div>
                    <div style={{ flex:1 }}><label style={lbl}>Original MRP ₹ *</label><input style={inp} type="number" placeholder="89999" required value={form.oldPrice} onChange={e=>setForm({...form,oldPrice:e.target.value})}/></div>
                    <div style={{ flex:1 }}><label style={lbl}>Discount % *</label><input style={inp} type="number" placeholder="99" required value={form.discount} onChange={e=>setForm({...form,discount:e.target.value})}/></div>
                  </div>
                  <div style={{ marginBottom:8 }}><label style={lbl}>Colors (comma-separated)</label><input style={inp} placeholder="Black, White, Blue" value={form.colors} onChange={e=>setForm({...form,colors:e.target.value})}/></div>
                  <div style={{ marginBottom:8 }}><label style={lbl}>Image URLs (comma-separated) *</label><input style={inp} placeholder="https://img1.jpg, https://img2.jpg" value={form.colorImageUrls} onChange={e=>setForm({...form,colorImageUrls:e.target.value})}/></div>
                  <div style={{ marginBottom:10 }}><label style={lbl}>Description</label><textarea style={{ ...inp, height:64, resize:'vertical' }} value={form.description} onChange={e=>setForm({...form,description:e.target.value})}/></div>
                  <button type="submit" style={{ background:'#388e3c', color:'#fff', border:'none', borderRadius:4, padding:'10px 24px', fontWeight:700, cursor:'pointer' }}>✅ Add Product</button>
                </form>
              </div>
            )}

            {/* Edit form */}
            {editId && (
              <div style={{ background:'#fff8e1', border:'2px solid #FFD000', borderRadius:4, padding:16, marginBottom:12 }}>
                <div style={{ fontWeight:700, marginBottom:12, color:'#e65100', fontSize:14 }}>✏️ Edit Product</div>
                <form onSubmit={handleSaveEdit}>
                  <div style={{ display:'flex', gap:8, marginBottom:8 }}>
                    <div style={{ flex:1 }}><label style={lbl}>Product Name *</label><input style={inp} required value={editForm.name} onChange={e=>setEditForm({...editForm,name:e.target.value})}/></div>
                    <div style={{ flex:1 }}><label style={lbl}>Brand *</label><input style={inp} required value={editForm.brand} onChange={e=>setEditForm({...editForm,brand:e.target.value})}/></div>
                  </div>
                  <div style={{ display:'flex', gap:8, marginBottom:8 }}>
                    <div style={{ flex:1 }}><label style={lbl}>Selling Price ₹ *</label><input style={inp} type="number" required value={editForm.price} onChange={e=>setEditForm({...editForm,price:e.target.value})}/></div>
                    <div style={{ flex:1 }}><label style={lbl}>Original MRP ₹ *</label><input style={inp} type="number" required value={editForm.oldPrice} onChange={e=>setEditForm({...editForm,oldPrice:e.target.value})}/></div>
                    <div style={{ flex:1 }}><label style={lbl}>Discount % *</label><input style={inp} type="number" required value={editForm.discount} onChange={e=>setEditForm({...editForm,discount:e.target.value})}/></div>
                  </div>
                  <div style={{ marginBottom:8 }}><label style={lbl}>Colors</label><input style={inp} value={editForm.colors} onChange={e=>setEditForm({...editForm,colors:e.target.value})}/></div>
                  <div style={{ marginBottom:8 }}><label style={lbl}>Image URLs</label><input style={inp} value={editForm.colorImageUrls} onChange={e=>setEditForm({...editForm,colorImageUrls:e.target.value})}/></div>
                  <div style={{ marginBottom:10 }}><label style={lbl}>Description</label><textarea style={{ ...inp, height:64, resize:'vertical' }} value={editForm.description} onChange={e=>setEditForm({...editForm,description:e.target.value})}/></div>
                  <div style={{ display:'flex', gap:8 }}>
                    <button type="submit" style={{ background:'#e65100', color:'#fff', border:'none', borderRadius:4, padding:'10px 24px', fontWeight:700, cursor:'pointer' }}>💾 Save Changes</button>
                    <button type="button" onClick={() => setEditId(null)} style={{ background:'#f5f5f5', color:'#333', border:'1px solid #ddd', borderRadius:4, padding:'10px 18px', fontWeight:700, cursor:'pointer' }}>Cancel</button>
                  </div>
                </form>
              </div>
            )}

            {/* Table */}
            <div style={{ background:'#fff', borderRadius:4, overflow:'auto', boxShadow:'0 1px 3px rgba(0,0,0,.08)' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', minWidth:560 }}>
                <thead>
                  <tr style={{ background:'#2874F0', color:'#fff' }}>
                    {['Image','Name','Brand','Price','MRP','Off','Actions'].map(h=>(
                      <th key={h} style={{ padding:'10px 8px', textAlign:'left', fontWeight:600, fontSize:12 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {products.map((p,i) => (
                    <tr key={p._id} style={{ background:editId===p._id?'#fff8e1':i%2===0?'#fff':'#fafafa', borderBottom:'1px solid #f0f0f0' }}>
                      <td style={{ padding:8 }}>
                        <img src={(p.colorImageUrls||[])[0]?.trim()} alt="" style={{ width:44,height:44,objectFit:'contain' }}
                          onError={e=>{e.target.src='https://via.placeholder.com/44';}}/>
                      </td>
                      <td style={{ padding:8, maxWidth:180, fontSize:12 }}>{p.name}</td>
                      <td style={{ padding:8 }}>{p.brand}</td>
                      <td style={{ padding:8, fontWeight:700 }}>₹{Number(p.price).toLocaleString()}</td>
                      <td style={{ padding:8, textDecoration:'line-through', color:'#888' }}>₹{Number(p.oldPrice).toLocaleString()}</td>
                      <td style={{ padding:8, color:'#388e3c', fontWeight:700 }}>{p.discount}%</td>
                      <td style={{ padding:8 }}>
                        <div style={{ display:'flex', gap:5 }}>
                          <button onClick={() => startEdit(p)}
                            style={{ background:'#e8f0fe', color:'#2874F0', border:'1px solid #c5d5ff', borderRadius:4, padding:'4px 10px', cursor:'pointer', fontWeight:600, fontSize:11 }}>
                            ✏️ Edit
                          </button>
                          <button onClick={() => handleDelete(p._id)}
                            style={{ background:'#ffebee', color:'#c62828', border:'1px solid #ffcdd2', borderRadius:4, padding:'4px 10px', cursor:'pointer', fontWeight:600, fontSize:11 }}>
                            🗑️ Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!products.length && <tr><td colSpan={7} style={{ padding:24, textAlign:'center', color:'#aaa' }}>No products yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══════════ ORDERS ══════════ */}
        {tab === 'orders' && (
          <div>
            <div style={{ fontWeight:700, fontSize:15, marginBottom:10 }}>All Orders</div>
            <div style={{ background:'#fff', borderRadius:4, overflow:'auto', boxShadow:'0 1px 3px rgba(0,0,0,.08)' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', minWidth:600 }}>
                <thead>
                  <tr style={{ background:'#2874F0', color:'#fff' }}>
                    {['#','Customer','Mobile','Address','Product','Amount','Date','Status'].map(h=>(
                      <th key={h} style={{ padding:'10px 8px', textAlign:'left', fontWeight:600, fontSize:12 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o,i) => (
                    <tr key={o._id} style={{ background:i%2===0?'#fff':'#fafafa', borderBottom:'1px solid #f0f0f0' }}>
                      <td style={{ padding:8 }}>{i+1}</td>
                      <td style={{ padding:8, fontWeight:600 }}>{o.name}</td>
                      <td style={{ padding:8 }}>{o.number}</td>
                      <td style={{ padding:8, maxWidth:160, fontSize:11 }}>{o.flat?`${o.flat}, ${o.area}, ${o.city} ${o.pin}, ${o.state}`:'—'}</td>
                      <td style={{ padding:8, maxWidth:160, fontSize:11 }}>{o.productName||o.productId}</td>
                      <td style={{ padding:8, fontWeight:700 }}>₹{Number(o.productPrice).toLocaleString()}</td>
                      <td style={{ padding:8, fontSize:11 }}>{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                      <td style={{ padding:8 }}>
                        <span style={{ background:o.status==='delivered'?'#4caf50':o.status==='shipped'?'#9c27b0':o.status==='confirmed'?'#2196f3':'#ff9800', color:'#fff', borderRadius:3, padding:'2px 8px', fontSize:11, fontWeight:600 }}>{o.status}</span>
                      </td>
                    </tr>
                  ))}
                  {!orders.length && <tr><td colSpan={8} style={{ padding:24, textAlign:'center', color:'#aaa' }}>No orders yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ══════════ BANNERS ══════════ */}
        {tab === 'banners' && (
          <div style={{ maxWidth:560 }}>
            <div style={{ fontWeight:700, fontSize:15, marginBottom:6 }}>🖼️ Manage Banners</div>
            <div style={{ background:'#e8f5e9', border:'1px solid #c8e6c9', borderRadius:6, padding:10, marginBottom:16, fontSize:12, color:'#2e7d32', lineHeight:1.6 }}>
              <strong>ℹ️ How it works:</strong> Paste any image URL for each banner slot. Changes take effect immediately after Save — no rebuild needed! Use direct image links (ending in .jpg / .png / .webp).
            </div>

            <div style={{ background:'#fff', borderRadius:8, padding:16, boxShadow:'0 1px 4px rgba(0,0,0,.1)' }}>
              {banners.map((url, i) => (
                <div key={i} style={{ marginBottom:14 }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:6 }}>
                    <label style={{ ...lbl, marginBottom:0 }}>Banner {i + 1}</label>
                    {banners.length > 1 && (
                      <button onClick={() => removeBanner(i)}
                        style={{ background:'none', border:'none', color:'#e53935', cursor:'pointer', fontSize:18, lineHeight:1 }}>✕</button>
                    )}
                  </div>
                  <input style={inp} placeholder="https://example.com/banner.jpg"
                    value={url} onChange={e => handleBannerChange(i, e.target.value)} />
                  {url.trim() && (
                    <img src={url.trim()} alt=""
                      style={{ width:'100%', maxHeight:100, objectFit:'cover', borderRadius:4, marginTop:6, border:'1px solid #eee' }}
                      onError={e => { e.target.style.display='none'; }} />
                  )}
                </div>
              ))}

              {banners.length < 6 && (
                <button onClick={addBannerSlot}
                  style={{ background:'#f5f5f5', color:'#555', border:'1px dashed #ccc', borderRadius:4, padding:'8px 16px', cursor:'pointer', fontWeight:600, fontSize:12, width:'100%', marginBottom:14 }}>
                  + Add Banner Slot
                </button>
              )}

              <button onClick={handleSaveBanners}
                style={{ background:'#2874F0', color:'#fff', border:'none', borderRadius:4, padding:'12px 24px', fontWeight:700, cursor:'pointer', fontSize:14, width:'100%' }}>
                💾 Save Banners
              </button>

              <div style={{ fontSize:11, color:'#888', marginTop:10, lineHeight:1.6 }}>
                💡 Tip: Right-click any image on the web → "Copy image address" → paste here.<br/>
                Works with: Flipkart product images, Google images, or your own hosted images.
              </div>
            </div>
          </div>
        )}

        {/* ══════════ GITHUB SYNC ══════════ */}
        {tab === 'github' && (
          <div style={{ maxWidth:520 }}>
            <div style={{ background:'#e8f5e9', border:'1px solid #c8e6c9', borderRadius:8, padding:16, marginBottom:16 }}>
              <div style={{ fontWeight:800, fontSize:14, color:'#1b5e20', marginBottom:12 }}>📖 Get GitHub Token (3 steps)</div>
              {[
                { step:'1', title:'Open GitHub Settings', desc:'github.com → Profile picture → Settings → Developer settings (bottom of left menu)' },
                { step:'2', title:'Create Token', desc:'Personal access tokens → Tokens (classic) → Generate new token → Name: "shop-sync" → Check "repo" → Generate token' },
                { step:'3', title:'Copy & Paste Below', desc:'Copy the token (ghp_...) immediately — GitHub shows it only once! Paste below with your repo details.' },
              ].map(s => (
                <div key={s.step} style={{ display:'flex', gap:12, marginBottom:10 }}>
                  <div style={{ background:'#388e3c', color:'#fff', width:24, height:24, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:12, flexShrink:0 }}>{s.step}</div>
                  <div>
                    <div style={{ fontWeight:700, color:'#1b5e20', fontSize:13 }}>{s.title}</div>
                    <div style={{ color:'#33691e', fontSize:12, lineHeight:1.5 }}>{s.desc}</div>
                  </div>
                </div>
              ))}
              <a href="https://github.com/settings/tokens/new" target="_blank" rel="noreferrer"
                style={{ display:'inline-block', background:'#388e3c', color:'#fff', borderRadius:4, padding:'8px 18px', fontWeight:700, fontSize:13, marginTop:4 }}>
                Open GitHub Token Page ↗
              </a>
            </div>
            <div style={{ background:'#fff3e0', border:'1px solid #ffe0b2', borderRadius:6, padding:12, marginBottom:14, fontSize:12, color:'#e65100' }}>
              <strong>Your values:</strong> Owner = <code>unreal99999999-bit</code> · Repo = <code>flip</code>
            </div>
            <div style={{ background:'#fff', borderRadius:8, padding:16, boxShadow:'0 1px 4px rgba(0,0,0,.1)' }}>
              <div style={{ fontWeight:800, fontSize:14, marginBottom:14 }}>🔗 GitHub Settings</div>
              <div style={{ marginBottom:12 }}><label style={lbl}>Repo Owner *</label><input style={inp} placeholder="unreal99999999-bit" value={ghSettings.owner} onChange={e=>setGhSettings({...ghSettings,owner:e.target.value})}/></div>
              <div style={{ marginBottom:12 }}><label style={lbl}>Repo Name *</label><input style={inp} placeholder="flip" value={ghSettings.repo} onChange={e=>setGhSettings({...ghSettings,repo:e.target.value})}/></div>
              <div style={{ marginBottom:14 }}>
                <label style={lbl}>Personal Access Token *</label>
                <div style={{ position:'relative' }}>
                  <input style={{ ...inp, paddingRight:44 }} type={showToken?'text':'password'} placeholder="ghp_xxxxxxxxxxxx" value={ghSettings.token} onChange={e=>setGhSettings({...ghSettings,token:e.target.value})}/>
                  <button type="button" onClick={()=>setShowToken(s=>!s)} style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:16 }}>{showToken?'🙈':'👁️'}</button>
                </div>
              </div>
              {ghSettings.token && ghSettings.owner && ghSettings.repo ? (
                <div style={{ background:'#e8f5e9', border:'1px solid #c8e6c9', borderRadius:4, padding:'8px 12px', fontSize:12, color:'#2e7d32', marginBottom:12 }}>✅ Configured for {ghSettings.owner}/{ghSettings.repo}</div>
              ) : (
                <div style={{ background:'#fff3e0', border:'1px solid #ffe0b2', borderRadius:4, padding:'8px 12px', fontSize:12, color:'#e65100', marginBottom:12 }}>⚠️ Fill all fields to enable syncing.</div>
              )}
              <button onClick={handleSaveGithub} style={{ background:'#2874F0', color:'#fff', border:'none', borderRadius:4, padding:'12px 24px', fontWeight:700, cursor:'pointer', fontSize:14, width:'100%' }}>💾 Save GitHub Settings</button>
            </div>
          </div>
        )}

        {/* ══════════ PAYMENT ══════════ */}
        {tab === 'payment' && (
          <div style={{ maxWidth:520 }}>
            <div style={{ background:'#e3f2fd', border:'1px solid #90caf9', borderRadius:8, padding:16, marginBottom:16 }}>
              <div style={{ fontWeight:800, fontSize:14, color:'#1565c0', marginBottom:12 }}>📖 Cashfree Setup</div>
              {[
                {step:'1',title:'Create Account',desc:'cashfree.com → Sign Up → KYC (PAN + Bank). Takes 1–2 days.'},
                {step:'2',title:'Get API Keys',desc:'Login → Developers → API Keys → Copy App ID & Secret Key.'},
                {step:'3',title:'Save Below',desc:'Paste keys, pick environment, click Save. Done!'},
                {step:'4',title:'Set Return URL',desc:'Cashfree → Settings → Return URL: your-site.netlify.app/payment-success'},
              ].map(s=>(
                <div key={s.step} style={{ display:'flex', gap:12, marginBottom:8 }}>
                  <div style={{ background:'#2874F0', color:'#fff', width:22, height:22, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:800, fontSize:11, flexShrink:0 }}>{s.step}</div>
                  <div><div style={{ fontWeight:700, color:'#1a237e', fontSize:12 }}>{s.title}</div><div style={{ color:'#455a64', fontSize:12 }}>{s.desc}</div></div>
                </div>
              ))}
              <a href="https://merchant.cashfree.com/merchants/signup" target="_blank" rel="noreferrer" style={{ display:'inline-block', background:'#2874F0', color:'#fff', borderRadius:4, padding:'7px 16px', fontWeight:700, fontSize:12, marginTop:6 }}>Open Cashfree ↗</a>
            </div>
            <div style={{ background:'#fff', borderRadius:8, padding:16, boxShadow:'0 1px 4px rgba(0,0,0,.1)' }}>
              <div style={{ fontWeight:800, fontSize:14, marginBottom:14 }}>🔑 Credentials</div>
              <div style={{ marginBottom:12 }}><label style={lbl}>App ID *</label><input style={inp} placeholder="CF10234TESTAPP" value={creds.appId} onChange={e=>setCreds({...creds,appId:e.target.value})}/></div>
              <div style={{ marginBottom:12 }}>
                <label style={lbl}>Secret Key *</label>
                <div style={{ position:'relative' }}>
                  <input style={{ ...inp, paddingRight:44 }} type={showSecret?'text':'password'} placeholder="Secret key" value={creds.secretKey} onChange={e=>setCreds({...creds,secretKey:e.target.value})}/>
                  <button type="button" onClick={()=>setShowSecret(s=>!s)} style={{ position:'absolute', right:10, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:16 }}>{showSecret?'🙈':'👁️'}</button>
                </div>
              </div>
              <div style={{ display:'flex', gap:10, marginBottom:14 }}>
                {[['sandbox','🧪 Test'],['production','🚀 Production']].map(([val,label])=>(
                  <div key={val} onClick={()=>setCreds({...creds,environment:val})}
                    style={{ flex:1, textAlign:'center', padding:'9px 8px', borderRadius:6, cursor:'pointer', border:`2px solid ${creds.environment===val?'#2874F0':'#ddd'}`, background:creds.environment===val?'#e8f0fe':'#f9f9f9', fontWeight:creds.environment===val?700:400, color:creds.environment===val?'#2874F0':'#555', fontSize:13 }}>
                    {label}
                  </div>
                ))}
              </div>
              {creds.appId && creds.secretKey
                ? <div style={{ background:'#e8f5e9', border:'1px solid #c8e6c9', borderRadius:4, padding:'8px 12px', fontSize:12, color:'#2e7d32', marginBottom:12 }}>✅ Gateway configured.</div>
                : <div style={{ background:'#fff3e0', border:'1px solid #ffe0b2', borderRadius:4, padding:'8px 12px', fontSize:12, color:'#e65100', marginBottom:12 }}>⚠️ Enter keys and save.</div>}
              <div style={{ display:'flex', gap:10 }}>
                <button onClick={handleSaveCreds} style={{ background:'#2874F0', color:'#fff', border:'none', borderRadius:4, padding:'12px 24px', fontWeight:700, cursor:'pointer', fontSize:14, flex:1 }}>💾 Save</button>
                {creds.appId && <button onClick={()=>{const e={appId:'',secretKey:'',environment:'production'};saveCashfreeCreds(e);setCreds(e);notify('Cleared.');}} style={{ background:'#ffebee', color:'#c62828', border:'1px solid #ffcdd2', borderRadius:4, padding:'12px 14px', fontWeight:700, cursor:'pointer' }}>🗑️</button>}
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
