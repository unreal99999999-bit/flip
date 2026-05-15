import PRODUCTS_DEFAULT from './products';

const KEYS = {
  ORDERS: 'shop_orders',
  PAYMENT: 'shop_payment',
  PRODUCTS: 'shop_products',
  ADMIN: 'shop_admin_token',
};

// ─── PRODUCTS ────────────────────────────────────────────────
export function getProducts() {
  try {
    const stored = localStorage.getItem(KEYS.PRODUCTS);
    if (stored) return JSON.parse(stored);
  } catch {}
  return PRODUCTS_DEFAULT;
}

export function saveProducts(products) {
  localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(products));
}

export function addProduct(product) {
  const products = getProducts();
  const newProduct = { ...product, _id: Date.now().toString(), id: Date.now() };
  const updated = [...products, newProduct];
  saveProducts(updated);
  return newProduct;
}

export function deleteProduct(id) {
  const products = getProducts();
  const updated = products.filter(p => String(p._id) !== String(id));
  saveProducts(updated);
}

export function getProductById(id) {
  return getProducts().find(p => String(p._id) === String(id) || String(p.id) === String(id));
}

// ─── ORDERS ──────────────────────────────────────────────────
export function getOrders() {
  try {
    const stored = localStorage.getItem(KEYS.ORDERS);
    return stored ? JSON.parse(stored) : [];
  } catch {}
  return [];
}

export function saveOrder(order) {
  const orders = getOrders();
  const newOrder = { ...order, _id: Date.now().toString(), createdAt: new Date().toISOString(), status: 'pending' };
  orders.unshift(newOrder);
  localStorage.setItem(KEYS.ORDERS, JSON.stringify(orders));
  return newOrder;
}

// ─── PAYMENT URL ─────────────────────────────────────────────
export function getPaymentUrl() {
  return localStorage.getItem(KEYS.PAYMENT) || 'Mswp.2520092325649458@axisbank';
}

export function savePaymentUrl(url) {
  localStorage.setItem(KEYS.PAYMENT, url);
}

// ─── ADMIN AUTH ───────────────────────────────────────────────
const ADMIN_PASSWORD = 'zadi@1';

export function adminLogin(password) {
  if (password === ADMIN_PASSWORD) {
    localStorage.setItem(KEYS.ADMIN, 'true');
    return true;
  }
  return false;
}

export function isAdminLoggedIn() {
  return localStorage.getItem(KEYS.ADMIN) === 'true';
}

export function adminLogout() {
  localStorage.removeItem(KEYS.ADMIN);
}

// ─── CASHFREE CREDENTIALS (stored locally, sent to serverless function) ──────
const CF_KEY = 'shop_cf_creds';

export function getCashfreeCreds() {
  try {
    const stored = localStorage.getItem(CF_KEY);
    return stored ? JSON.parse(stored) : { appId: '', secretKey: '', environment: 'production' };
  } catch { return { appId: '', secretKey: '', environment: 'production' }; }
}

export function saveCashfreeCreds(creds) {
  localStorage.setItem(CF_KEY, JSON.stringify(creds));
}
