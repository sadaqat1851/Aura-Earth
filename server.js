const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: 'aura-earth-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Data files
const PRODUCTS_FILE = path.join(__dirname, 'data', 'products.json');
const USERS_FILE = path.join(__dirname, 'data', 'users.json');
const ORDERS_FILE = path.join(__dirname, 'data', 'orders.json');

// Ensure data files exist
if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, '[]');
if (!fs.existsSync(ORDERS_FILE)) fs.writeFileSync(ORDERS_FILE, '[]');

// Helper functions
function readJSON(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')); }
  catch { return []; }
}
function writeJSON(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// Auth middleware
function requireAuth(req, res, next) {
  if (req.session.user) return next();
  res.status(401).json({ error: 'Please login first' });
}
function requireAdmin(req, res, next) {
  if (req.session.user && req.session.user.role === 'admin') return next();
  res.status(403).json({ error: 'Admin access required' });
}

// ============== API ROUTES ==============

// Products API
app.get('/api/products', (req, res) => {
  const products = readJSON(PRODUCTS_FILE);
  const { category, search, sort, page = 1, limit = 25 } = req.query;
  let filtered = [...products];
  
  if (category && category !== 'all') {
    filtered = filtered.filter(p => p.category === category);
  }
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(q) || 
      p.description.toLowerCase().includes(q) ||
      p.categoryLabel.toLowerCase().includes(q)
    );
  }
  if (sort === 'price-asc') filtered.sort((a, b) => a.price - b.price);
  if (sort === 'price-desc') filtered.sort((a, b) => b.price - a.price);
  if (sort === 'name') filtered.sort((a, b) => a.name.localeCompare(b.name));
  if (sort === 'rating') filtered.sort((a, b) => b.rating - a.rating);
  
  const start = (page - 1) * limit;
  const paginated = filtered.slice(start, start + parseInt(limit));
  
  res.json({
    products: paginated,
    total: filtered.length,
    page: parseInt(page),
    totalPages: Math.ceil(filtered.length / limit)
  });
});

app.get('/api/products/:slug', (req, res) => {
  const products = readJSON(PRODUCTS_FILE);
  const product = products.find(p => p.slug === req.params.slug || p.id === parseInt(req.params.slug));
  if (!product) return res.status(404).json({ error: 'Product not found' });
  
  // Get related products from same category
  const related = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);
  
  res.json({ product, related });
});

// Categories API
app.get('/api/categories', (req, res) => {
  const products = readJSON(PRODUCTS_FILE);
  const categories = {};
  products.forEach(p => {
    if (!categories[p.category]) {
      categories[p.category] = { slug: p.category, label: p.categoryLabel, count: 0 };
    }
    categories[p.category].count++;
  });
  res.json(Object.values(categories));
});

// Auth API
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, phone } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email and password are required' });
  }
  
  const users = readJSON(USERS_FILE);
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: 'Email already registered' });
  }
  
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = {
    id: Date.now(),
    name,
    email,
    phone: phone || '',
    password: hashedPassword,
    role: 'customer',
    createdAt: new Date().toISOString(),
    wishlist: [],
    addresses: []
  };
  
  users.push(user);
  writeJSON(USERS_FILE, users);
  
  const { password: _, ...safeUser } = user;
  req.session.user = safeUser;
  res.json({ success: true, user: safeUser });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const users = readJSON(USERS_FILE);
  const user = users.find(u => u.email === email);
  
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }
  
  const { password: _, ...safeUser } = user;
  req.session.user = safeUser;
  res.json({ success: true, user: safeUser });
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

app.get('/api/auth/me', (req, res) => {
  if (req.session.user) {
    res.json({ user: req.session.user });
  } else {
    res.json({ user: null });
  }
});

// Cart API (session-based)
app.get('/api/cart', (req, res) => {
  res.json({ items: req.session.cart || [] });
});

app.post('/api/cart/add', (req, res) => {
  const { productId, quantity = 1 } = req.body;
  if (!req.session.cart) req.session.cart = [];
  
  const products = readJSON(PRODUCTS_FILE);
  const product = products.find(p => p.id === productId);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  
  const existing = req.session.cart.find(item => item.productId === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    req.session.cart.push({
      productId,
      name: product.name,
      price: product.price,
      priceUSD: product.priceUSD,
      image: product.images[0],
      quantity
    });
  }
  
  res.json({ success: true, cart: req.session.cart });
});

app.put('/api/cart/update', (req, res) => {
  const { productId, quantity } = req.body;
  if (!req.session.cart) return res.json({ cart: [] });
  
  if (quantity <= 0) {
    req.session.cart = req.session.cart.filter(item => item.productId !== productId);
  } else {
    const item = req.session.cart.find(item => item.productId === productId);
    if (item) item.quantity = quantity;
  }
  
  res.json({ success: true, cart: req.session.cart });
});

app.delete('/api/cart/remove/:productId', (req, res) => {
  if (!req.session.cart) return res.json({ cart: [] });
  req.session.cart = req.session.cart.filter(
    item => item.productId !== parseInt(req.params.productId)
  );
  res.json({ success: true, cart: req.session.cart });
});

app.delete('/api/cart/clear', (req, res) => {
  req.session.cart = [];
  res.json({ success: true });
});

// Orders API
app.post('/api/orders', requireAuth, (req, res) => {
  const { shippingAddress, paymentMethod } = req.body;
  if (!req.session.cart || req.session.cart.length === 0) {
    return res.status(400).json({ error: 'Cart is empty' });
  }
  
  const orders = readJSON(ORDERS_FILE);
  const order = {
    id: 'AE-' + Date.now().toString(36).toUpperCase(),
    userId: req.session.user.id,
    userName: req.session.user.name,
    userEmail: req.session.user.email,
    items: req.session.cart,
    subtotal: req.session.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    shipping: 500,
    total: req.session.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0) + 500,
    shippingAddress,
    paymentMethod: paymentMethod || 'cod',
    status: 'confirmed',
    createdAt: new Date().toISOString()
  };
  
  orders.push(order);
  writeJSON(ORDERS_FILE, orders);
  req.session.cart = [];
  
  res.json({ success: true, order });
});

app.get('/api/orders', requireAuth, (req, res) => {
  const orders = readJSON(ORDERS_FILE);
  const userOrders = orders.filter(o => o.userId === req.session.user.id);
  res.json({ orders: userOrders });
});

// Wishlist API
app.post('/api/wishlist/toggle', requireAuth, (req, res) => {
  const { productId } = req.body;
  const users = readJSON(USERS_FILE);
  const user = users.find(u => u.id === req.session.user.id);
  
  if (!user.wishlist) user.wishlist = [];
  const idx = user.wishlist.indexOf(productId);
  if (idx > -1) {
    user.wishlist.splice(idx, 1);
  } else {
    user.wishlist.push(productId);
  }
  
  writeJSON(USERS_FILE, users);
  req.session.user.wishlist = user.wishlist;
  res.json({ success: true, wishlist: user.wishlist });
});

app.get('/api/wishlist', requireAuth, (req, res) => {
  const products = readJSON(PRODUCTS_FILE);
  const wishlistIds = req.session.user.wishlist || [];
  const wishlistProducts = products.filter(p => wishlistIds.includes(p.id));
  res.json({ products: wishlistProducts });
});

// Admin API
app.get('/api/admin/stats', requireAdmin, (req, res) => {
  const products = readJSON(PRODUCTS_FILE);
  const orders = readJSON(ORDERS_FILE);
  const users = readJSON(USERS_FILE);
  
  res.json({
    totalProducts: products.length,
    totalOrders: orders.length,
    totalUsers: users.length,
    totalRevenue: orders.reduce((sum, o) => sum + o.total, 0),
    recentOrders: orders.slice(-10).reverse()
  });
});

app.get('/api/admin/orders', requireAdmin, (req, res) => {
  const orders = readJSON(ORDERS_FILE);
  res.json({ orders: orders.reverse() });
});

app.put('/api/admin/orders/:id/status', requireAdmin, (req, res) => {
  const orders = readJSON(ORDERS_FILE);
  const order = orders.find(o => o.id === req.params.id);
  if (!order) return res.status(404).json({ error: 'Order not found' });
  
  order.status = req.body.status;
  writeJSON(ORDERS_FILE, orders);
  res.json({ success: true, order });
});

app.get('/api/admin/users', requireAdmin, (req, res) => {
  const users = readJSON(USERS_FILE);
  const safeUsers = users.map(({ password, ...u }) => u);
  res.json({ users: safeUsers });
});

// Create default admin user
(async () => {
  const users = readJSON(USERS_FILE);
  if (!users.find(u => u.role === 'admin')) {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    users.push({
      id: 1,
      name: 'Admin',
      email: 'admin@auraandearth.com',
      phone: '+92 300 1234567',
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date().toISOString(),
      wishlist: [],
      addresses: []
    });
    writeJSON(USERS_FILE, users);
    console.log('Default admin created: admin@auraandearth.com / admin123');
  }
})();

// Serve SPA - all routes go to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🌿 Aura & Earth is running at http://localhost:${PORT}`);
  console.log(`📦 ${readJSON(PRODUCTS_FILE).length} products loaded`);
  console.log(`🔑 Admin: admin@auraandearth.com / admin123\n`);
});
