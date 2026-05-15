import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { isAdminLoggedIn } from './store';
import './index.css';

import Home          from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Cart          from './pages/Cart';
import OrderSummary  from './pages/OrderSummary';
import Payment       from './pages/Payment';
import PaymentSuccess from './pages/PaymentSuccess';
import Login         from './pages/Login';
import Admin         from './pages/Admin';

function ProtectedAdmin() {
  return isAdminLoggedIn() ? <Admin /> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Routes>
          <Route path="/"                element={<Home />} />
          <Route path="/product/:id"     element={<ProductDetail />} />
          <Route path="/cart"            element={<Cart />} />
          <Route path="/order-summary"   element={<OrderSummary />} />
          <Route path="/payment"         element={<Payment />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/login"           element={<Login />} />
          <Route path="/admin"           element={<ProtectedAdmin />} />
          <Route path="*"               element={<Navigate to="/" replace />} />
        </Routes>
      </CartProvider>
    </BrowserRouter>
  );
}
