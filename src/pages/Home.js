import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProducts } from '../store';

const CATEGORIES = [
  { label: 'Top Offers',   img: 'https://rukminim1.flixcart.com/fk-p-flap/64/64/image/085406bae47866d5.png?q=100', bg: '#f97316' },
  { label: 'Mobiles',      img: 'https://rukminim1.flixcart.com/fk-p-flap/64/64/image/64f1cc66052c66ef.png?q=100', bg: '#8b5cf6' },
  { label: 'Electronics',  img: 'https://rukminim1.flixcart.com/fk-p-flap/64/64/image/1fd83847b32a09d1.png?q=100', bg: '#0ea5e9' },
  { label: 'TVs',          img: 'https://rukminim1.flixcart.com/fk-p-flap/64/64/image/6c0716819ac55121.png?q=100', bg: '#6366f1' },
  { label: 'Fashion',      img: 'https://rukminim1.flixcart.com/fk-p-flap/64/64/image/6dbed7ba5417672f.jpg?q=100', bg: '#ec4899' },
];

const SLIDES = ['/zeb.jpg', '/iphone.jpg', '/plane.jpg'];

function useCountdown() {
  const [time, setTime] = useState('');
  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const secs = d.getMinutes() * 60 + d.getSeconds();
      const left = 900 - (secs % 900);
      const m = Math.floor(left / 60), s = left % 60;
      setTime(`${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`);
    };
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, []);
  return time;
}

function AssuredBadge() {
  return (
    <div style={{ display:'inline-flex', alignItems:'center', gap:4, background:'#2874f0', borderRadius:3, padding:'2px 7px' }}>
      <div style={{ background:'#FFD000', borderRadius:'50%', width:13, height:13, display:'flex', alignItems:'center', justifyContent:'center', fontSize:8, fontWeight:900, color:'#2874f0' }}>f</div>
      <span style={{ color:'#fff', fontSize:10, fontWeight:700 }}>Assured</span>
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [slide, setSlide] = useState(0);
  const countdown = useCountdown();
  const allProducts = useMemo(() => getProducts(), []);

  useEffect(() => {
    const id = setInterval(() => setSlide(s => (s + 1) % SLIDES.length), 3500);
    return () => clearInterval(id);
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return allProducts;
    const q = query.toLowerCase();
    return allProducts.filter(p => p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q));
  }, [query, allProducts]);

  return (
    <div style={{ fontFamily:'Roboto,Helvetica,Arial,sans-serif', background:'#f1f2f4', maxWidth:480, margin:'0 auto', minHeight:'100vh' }}>

      {/* ── Navbar ── */}
      <div style={{ background:'#2874f0', padding:'10px 12px 0' }}>
        {/* Row 1: logo + cart */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:6 }}>
              <span style={{ color:'#fff', fontWeight:900, fontSize:20, fontStyle:'italic' }}>Flipkart</span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:4, marginTop:1 }}>
              <span style={{ color:'#ffe500', fontSize:11, fontStyle:'italic' }}>Explore</span>
              <span style={{ color:'#ffe500', fontSize:11, fontWeight:700, fontStyle:'italic' }}>Plus</span>
              <span style={{ color:'#ffe500', fontSize:11 }}>✦</span>
            </div>
          </div>
          <svg width="22" height="22" viewBox="0 0 15 15" xmlns="http://www.w3.org/2000/svg">
            <g fill="#fff" fillRule="evenodd">
              <path d="m5.189 13.04c0 .996-.791 1.804-1.767 1.804-.976 0-1.767-.808-1.767-1.804 0-.996.791-1.804 1.767-1.804.976 0 1.767.808 1.767 1.804"/>
              <path d="m14.912 2.259h-14.298l2.247 6.917c.042.129.16.216.293.216h8.06c-.064.69-.629 1.841-1.702 1.841h-6.04l1.072 1.991h5.611c1.881 0 2.938-2.278 3.657-4.719.888-3.01 1.219-6.245 1.106-6.245"/>
              <path d="m.615 2.259l-.592-1.828c-.08-.207.069-.431.287-.431h1.482c.126 0 .24.079.287.198l.682 2.061c0 0-.63 1.642-1.942.066"/>
              <path d="m13.424 13.325c0 .837-.664 1.516-1.484 1.516-.82 0-1.484-.679-1.484-1.516 0-.837.664-1.516 1.484-1.516.82 0 1.484.679 1.484 1.516"/>
            </g>
          </svg>
        </div>
        {/* Row 2: Search bar */}
        <div style={{ background:'#fff', borderRadius:3, display:'flex', alignItems:'center', padding:'9px 14px', marginBottom:0 }}>
          <svg width="16" height="16" fill="none" stroke="#aaa" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink:0, marginRight:10 }}>
            <circle cx="11" cy="11" r="7"/><path d="m16.5 16.5 4 4"/>
          </svg>
          <input
            type="text"
            placeholder="Search for Products, Brands and More"
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{ border:'none', outline:'none', flex:1, fontSize:14, color:'#333', background:'transparent' }}
          />
        </div>
      </div>

      {/* ── Category strip ── */}
      <div style={{ background:'#fff', padding:'14px 8px', display:'flex', justifyContent:'space-around', borderBottom:'1px solid #f0f0f0' }}>
        {CATEGORIES.map(c => (
          <div key={c.label} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6, cursor:'pointer', minWidth:52 }}>
            <div style={{ width:52, height:52, borderRadius:'50%', background:c.bg, display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
              <img src={c.img} alt={c.label} style={{ width:40, height:40, objectFit:'contain' }}
                onError={e => { e.target.style.display='none'; }} />
            </div>
            <span style={{ fontSize:11, fontWeight:600, color:'#212121', textAlign:'center' }}>{c.label}</span>
          </div>
        ))}
      </div>

      {/* ── Carousel ── */}
      <div style={{ position:'relative', overflow:'hidden', background:'#fff' }}>
        <img
          src={SLIDES[slide]} alt="banner"
          style={{ width:'100%', maxHeight:200, objectFit:'cover', display:'block' }}
          onError={e => { e.target.style.minHeight='160px'; e.target.style.background='#2874f0'; }}
        />
        {/* Arrows */}
        <button onClick={() => setSlide(s => (s - 1 + SLIDES.length) % SLIDES.length)}
          style={{ position:'absolute', left:0, top:'50%', transform:'translateY(-50%)', background:'rgba(255,255,255,.85)', border:'none', width:28, height:48, cursor:'pointer', fontSize:20, color:'#555', display:'flex', alignItems:'center', justifyContent:'center' }}>‹</button>
        <button onClick={() => setSlide(s => (s + 1) % SLIDES.length)}
          style={{ position:'absolute', right:0, top:'50%', transform:'translateY(-50%)', background:'rgba(255,255,255,.85)', border:'none', width:28, height:48, cursor:'pointer', fontSize:20, color:'#555', display:'flex', alignItems:'center', justifyContent:'center' }}>›</button>
        {/* Dots */}
        <div style={{ position:'absolute', bottom:8, left:'50%', transform:'translateX(-50%)', display:'flex', gap:5 }}>
          {SLIDES.map((_, i) => (
            <div key={i} onClick={() => setSlide(i)}
              style={{ width: i===slide ? 18:7, height:7, borderRadius:4, background: i===slide ? '#2874f0':'rgba(255,255,255,.7)', transition:'all .3s', cursor:'pointer' }} />
          ))}
        </div>
      </div>

      {/* ── Deals of the Day ── */}
      <div style={{ background:'#fff', padding:'14px 16px', marginTop:8, textAlign:'center', borderBottom:'1px solid #f0f0f0' }}>
        <div style={{ fontSize:18, fontWeight:700, color:'#2874f0', marginBottom:6 }}>Deals of the Day</div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:8, marginBottom:10 }}>
          <span style={{ fontSize:20 }}>⏰</span>
          <span style={{ fontSize:24, fontWeight:900, color:'#e53935', letterSpacing:1 }}>{countdown}</span>
        </div>
        <div style={{ display:'inline-block', border:'1px solid #e53935', color:'#e53935', borderRadius:3, padding:'6px 20px', fontSize:13, fontWeight:700, letterSpacing:1 }}>
          SALE IS LIVE
        </div>
      </div>

      {/* ── Product grid ── */}
      <div style={{ marginTop:2 }}>
        {filtered.length === 0 ? (
          <div style={{ textAlign:'center', padding:'48px 16px', color:'#888', background:'#fff' }}>
            <div style={{ fontSize:40, marginBottom:12 }}>🔍</div>
            <div style={{ fontSize:15, fontWeight:600 }}>No results for "{query}"</div>
          </div>
        ) : (
          <div style={{ display:'flex', flexWrap:'wrap', gap:2, background:'#e8e8e8' }}>
            {filtered.map(p => {
              const img = (p.colorImageUrls || [])[0]?.trim() || '';
              return (
                <div key={p._id}
                  onClick={() => navigate(`/product/${p._id}`)}
                  style={{ width:'calc(50% - 1px)', background:'#fff', padding:'12px 10px 14px', cursor:'pointer', position:'relative' }}>

                  {/* Wishlist heart */}
                  <div style={{ position:'absolute', top:8, right:10, color:'#ccc', fontSize:20, lineHeight:1 }}>♡</div>

                  {/* Product image */}
                  <div style={{ width:'100%', minHeight:160, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:10 }}>
                    <img src={img} alt={p.name}
                      style={{ maxWidth:'100%', maxHeight:155, objectFit:'contain' }}
                      onError={e => { e.target.src='https://via.placeholder.com/155'; }} />
                  </div>

                  {/* Brand */}
                  <div style={{ fontSize:12, color:'#878787', marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.brand}</div>

                  {/* Name */}
                  <div style={{ fontSize:13, color:'#212121', lineHeight:1.4, marginBottom:6, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                    {p.name}
                  </div>

                  {/* Price row */}
                  <div style={{ display:'flex', alignItems:'center', gap:4, marginBottom:5, flexWrap:'wrap' }}>
                    <span style={{ fontSize:13, fontWeight:700, color:'#388e3c' }}>{p.discount}%</span>
                    <span style={{ fontSize:12, color:'#878787', textDecoration:'line-through' }}>₹{Number(p.oldPrice).toLocaleString()}</span>
                    <span style={{ fontSize:16, fontWeight:800, color:'#212121' }}>₹{Number(p.price).toLocaleString()}</span>
                  </div>

                  {/* Assured badge */}
                  <AssuredBadge />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
