import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const img = (product.colorImageUrls || [])[0]?.trim() || '';

  return (
    <div className="product-card" onClick={() => navigate(`/product/${product._id}`)}>
      <img src={img} alt={product.name} className="product-img"
        onError={e => { e.target.src = 'https://via.placeholder.com/200?text=No+Image'; }} />
      <div className="product-name">{product.name}</div>
      <div className="mt-2 d-flex align-items-center flex-wrap">
        <span className="selling-price">₹{product.price.toLocaleString()}</span>
        <span className="old-price">₹{product.oldPrice.toLocaleString()}</span>
        <span className="discount-pct">{product.discount}% off</span>
      </div>
      <div style={{ fontSize: 11, color: '#388e3c', marginTop: 3 }}>
        Free Delivery
      </div>
    </div>
  );
}
