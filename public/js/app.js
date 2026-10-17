/* ============================================
   AURA & EARTH — Main Application JavaScript
   ============================================ */

// ===== State Management =====
const state = {
  products: [],
  cart: [],
  user: null,
  currentPage: 'home',
  currentCategory: 'all',
  searchQuery: '',
  sortBy: 'default'
};

// ===== SVG Icons =====
const icons = {
  star: '★',
  starEmpty: '☆',
  heart: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
  cart: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
  eye: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
  truck: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>',
  shield: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>',
  refresh: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>',
  leaf: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2-8 2s-1 3-5 5"/></svg>',
  check: '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>'
};

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', async () => {
  await loadProducts();
  await checkAuth();
  await loadCart();
  
  // Handle scroll effects
  window.addEventListener('scroll', handleScroll);
  
  // Route from hash
  handleRoute();
  window.addEventListener('hashchange', handleRoute);
});

// ===== Data Loading =====
async function loadProducts() {
  try {
    const res = await fetch('/api/products?limit=100');
    const data = await res.json();
    state.products = data.products;
  } catch (e) {
    console.error('Failed to load products:', e);
  }
}

async function checkAuth() {
  try {
    const res = await fetch('/api/auth/me');
    const data = await res.json();
    state.user = data.user;
    updateAccountUI();
  } catch (e) {
    console.error('Auth check failed:', e);
  }
}

async function loadCart() {
  try {
    const res = await fetch('/api/cart');
    const data = await res.json();
    state.cart = data.items;
    updateCartUI();
  } catch (e) {
    console.error('Cart load failed:', e);
  }
}

// ===== Routing =====
function navigate(page, param) {
  if (param) {
    window.location.hash = `${page}/${param}`;
  } else {
    window.location.hash = page;
  }
}

function handleRoute() {
  const hash = window.location.hash.slice(1) || 'home';
  const parts = hash.split('/');
  const page = parts[0];
  const param = parts[1] || null;
  
  state.currentPage = page;
  
  // Update active nav
  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
  const activeLink = document.querySelector(`.nav-links a[data-page="${page}"]`);
  if (activeLink) activeLink.classList.add('active');
  
  // Close mobile menu
  document.getElementById('navLinks').classList.remove('mobile-open');
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  switch(page) {
    case 'home': renderHome(); break;
    case 'shop': renderShop(param); break;
    case 'product': renderProductDetail(param); break;
    case 'about': renderAbout(); break;
    case 'checkout': renderCheckout(); break;
    case 'orders': renderOrders(); break;
    case 'admin': renderAdmin(param); break;
    case 'order-confirmed': renderOrderConfirmed(param); break;
    default: renderHome();
  }
}

// ===== Scroll Effects =====
function handleScroll() {
  const navbar = document.getElementById('navbar');
  const scrollTop = document.getElementById('scrollTop');
  
  if (window.scrollY > 50) {
    navbar.classList.add('scrolled');
  } else {
    navbar.classList.remove('scrolled');
  }
  
  if (window.scrollY > 500) {
    scrollTop.classList.add('visible');
  } else {
    scrollTop.classList.remove('visible');
  }
}

// ===== Mobile Menu =====
function toggleMobileMenu() {
  document.getElementById('navLinks').classList.toggle('mobile-open');
}

// ===== Cart Functions =====
function toggleCart() {
  document.getElementById('cartOverlay').classList.toggle('active');
  document.getElementById('cartDrawer').classList.toggle('active');
  document.body.style.overflow = document.getElementById('cartDrawer').classList.contains('active') ? 'hidden' : '';
}

async function addToCart(productId, qty = 1) {
  try {
    const res = await fetch('/api/cart/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity: qty })
    });
    const data = await res.json();
    if (data.success) {
      state.cart = data.cart;
      updateCartUI();
      renderCartItems();
      showToast('Added to cart', 'success');
    }
  } catch (e) {
    showToast('Failed to add to cart', 'error');
  }
}

async function updateCartItem(productId, quantity) {
  try {
    const res = await fetch('/api/cart/update', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity })
    });
    const data = await res.json();
    state.cart = data.cart;
    updateCartUI();
    renderCartItems();
  } catch (e) {
    showToast('Failed to update cart', 'error');
  }
}

async function removeFromCart(productId) {
  try {
    const res = await fetch(`/api/cart/remove/${productId}`, { method: 'DELETE' });
    const data = await res.json();
    state.cart = data.cart;
    updateCartUI();
    renderCartItems();
    showToast('Removed from cart', 'info');
  } catch (e) {
    showToast('Failed to remove item', 'error');
  }
}

function updateCartUI() {
  const count = state.cart.reduce((sum, item) => sum + item.quantity, 0);
  const countEl = document.getElementById('cartCount');
  if (count > 0) {
    countEl.style.display = 'flex';
    countEl.textContent = count;
  } else {
    countEl.style.display = 'none';
  }
}

function renderCartItems() {
  const container = document.getElementById('cartItems');
  const footer = document.getElementById('cartFooter');
  
  if (state.cart.length === 0) {
    footer.style.display = 'none';
    container.innerHTML = `
      <div class="cart-empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
        <p>Your cart is empty</p>
        <br>
        <button class="btn btn-secondary btn-sm" onclick="navigate('shop'); toggleCart();">Browse Collection</button>
      </div>
    `;
    return;
  }
  
  footer.style.display = 'block';
  
  container.innerHTML = state.cart.map(item => `
    <div class="cart-item">
      <div class="cart-item-image">
        <img src="/images/products/${item.image}" alt="${item.name}" onerror="this.parentElement.innerHTML='<div class=\\'placeholder-img cat-servings\\'></div>'">
      </div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-price">Rs. ${item.price.toLocaleString()}</div>
        <div class="cart-item-qty">
          <button onclick="updateCartItem(${item.productId}, ${item.quantity - 1})">−</button>
          <span>${item.quantity}</span>
          <button onclick="updateCartItem(${item.productId}, ${item.quantity + 1})">+</button>
        </div>
        <button class="cart-item-remove" onclick="removeFromCart(${item.productId})">Remove</button>
      </div>
    </div>
  `).join('');
  
  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  document.getElementById('cartSubtotal').textContent = `Rs. ${subtotal.toLocaleString()}`;
  document.getElementById('cartTotal').textContent = `Rs. ${(subtotal + 500).toLocaleString()}`;
}

// ===== Auth Functions =====
function toggleAuth() {
  if (state.user) {
    if (state.user.role === 'admin') {
      navigate('admin');
    } else {
      navigate('orders');
    }
    return;
  }
  openAuthModal('login');
}

function openAuthModal(mode) {
  const modal = document.getElementById('authModal');
  modal.classList.add('active');
  document.body.style.overflow = 'hidden';
  renderAuthForm(mode);
}

function closeAuthModal() {
  document.getElementById('authModal').classList.remove('active');
  document.body.style.overflow = '';
}

function renderAuthForm(mode) {
  const container = document.getElementById('authContent');
  
  if (mode === 'login') {
    container.innerHTML = `
      <h2>Welcome Back</h2>
      <p class="subtitle">Sign in to your Aura & Earth account</p>
      <form onsubmit="handleLogin(event)">
        <div class="form-group">
          <label>Email Address</label>
          <input type="email" id="loginEmail" placeholder="your@email.com" required>
        </div>
        <div class="form-group">
          <label>Password</label>
          <input type="password" id="loginPassword" placeholder="••••••••" required>
        </div>
        <div id="loginError" class="form-error" style="display:none"></div>
        <br>
        <button type="submit" class="btn btn-primary" style="width:100%">Sign In</button>
      </form>
      <p class="modal-switch">Don't have an account? <a onclick="renderAuthForm('register')">Create one</a></p>
    `;
  } else {
    container.innerHTML = `
      <h2>Create Account</h2>
      <p class="subtitle">Join the Aura & Earth community</p>
      <form onsubmit="handleRegister(event)">
        <div class="form-group">
          <label>Full Name</label>
          <input type="text" id="regName" placeholder="Your full name" required>
        </div>
        <div class="form-group">
          <label>Email Address</label>
          <input type="email" id="regEmail" placeholder="your@email.com" required>
        </div>
        <div class="form-group">
          <label>Phone Number</label>
          <input type="tel" id="regPhone" placeholder="+92 300 1234567">
        </div>
        <div class="form-group">
          <label>Password</label>
          <input type="password" id="regPassword" placeholder="Min 6 characters" required minlength="6">
        </div>
        <div id="regError" class="form-error" style="display:none"></div>
        <br>
        <button type="submit" class="btn btn-primary" style="width:100%">Create Account</button>
      </form>
      <p class="modal-switch">Already have an account? <a onclick="renderAuthForm('login')">Sign in</a></p>
    `;
  }
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    
    if (data.success) {
      state.user = data.user;
      updateAccountUI();
      closeAuthModal();
      showToast(`Welcome back, ${data.user.name}!`, 'success');
    } else {
      document.getElementById('loginError').style.display = 'block';
      document.getElementById('loginError').textContent = data.error;
    }
  } catch (e) {
    showToast('Login failed', 'error');
  }
}

async function handleRegister(e) {
  e.preventDefault();
  const name = document.getElementById('regName').value;
  const email = document.getElementById('regEmail').value;
  const phone = document.getElementById('regPhone').value;
  const password = document.getElementById('regPassword').value;
  
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, phone, password })
    });
    const data = await res.json();
    
    if (data.success) {
      state.user = data.user;
      updateAccountUI();
      closeAuthModal();
      showToast(`Welcome to Aura & Earth, ${data.user.name}!`, 'success');
    } else {
      document.getElementById('regError').style.display = 'block';
      document.getElementById('regError').textContent = data.error;
    }
  } catch (e) {
    showToast('Registration failed', 'error');
  }
}

async function handleLogout() {
  await fetch('/api/auth/logout', { method: 'POST' });
  state.user = null;
  updateAccountUI();
  navigate('home');
  showToast('Signed out successfully', 'info');
}

function updateAccountUI() {
  const label = document.getElementById('accountLabel');
  if (state.user) {
    label.textContent = state.user.name.split(' ')[0];
  } else {
    label.textContent = '';
  }
}

// ===== Toast Notifications =====
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${message}</span>`;
  container.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ===== Product Image Helper =====
function productImage(product, cls = '') {
  const img = product.images[0];
  const catClass = `cat-${product.category}`;
  return `<img src="/images/products/${img}" alt="${product.name}" class="${cls}" 
    onerror="this.style.display='none'; this.parentElement.insertAdjacentHTML('beforeend', '<div class=\\'placeholder-img ${catClass}\\'>${product.name.slice(0,1)}</div>')">`;
}

// ===== Rating Stars =====
function ratingStars(rating, count) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5 ? 1 : 0;
  const empty = 5 - full - half;
  return `
    <div class="product-rating">
      ${'★'.repeat(full)}${half ? '★' : ''}${'☆'.repeat(empty)}
      <span>(${count})</span>
    </div>
  `;
}

// ===== Product Badge =====
function badgeHtml(badge) {
  if (!badge) return '';
  const cls = badge.toLowerCase().replace(/\s+/g, '-');
  return `<div class="product-badge ${cls}">${badge}</div>`;
}

// ===== FORMAT PRICE =====
function formatPrice(price) {
  return `Rs. ${price.toLocaleString()}`;
}

// ========================================================
//  PAGE RENDERERS
// ========================================================

// ===== HOME PAGE =====
function renderHome() {
  const featured = state.products.slice(0, 8);
  const bestsellers = state.products.filter(p => p.badge === 'Bestseller');
  
  document.getElementById('app').innerHTML = `
    <div class="page">
      <!-- Hero -->
      <section class="hero">
        <div class="hero-bg-pattern"></div>
        <div class="hero-content container">
          <div class="hero-text">
            <div class="hero-badge">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2-8 2s-1 3-5 5"/></svg>
              Artisanal Tableware
            </div>
            <h1 class="hero-title">From <em>Earth</em><br>To Your Table.</h1>
            <p class="hero-subtitle">Discover handcrafted ceramics, metals, and textiles curated for hotels, restaurants, and homes that celebrate the beauty of imperfection.</p>
            <div class="hero-actions">
              <button class="btn btn-primary btn-lg" onclick="navigate('shop')">Explore Collection</button>
              <button class="btn btn-secondary btn-lg" onclick="navigate('about')">Our Story</button>
            </div>
          </div>
          <div class="hero-images">
            <img src="/images/products/product-1.jpg" class="hero-img-main" alt="Artisan Bowl" onerror="this.style.background='linear-gradient(135deg, #E4A98A, #F5E6DC)'; this.style.minHeight='460px'">
            <img src="/images/products/product-8.jpg" class="hero-img-secondary left" alt="Teapot" onerror="this.style.background='linear-gradient(135deg, #D4BC82, #F0EAE0)'; this.style.minHeight='280px'">
            <img src="/images/products/product-11.jpg" class="hero-img-secondary right" alt="Flatware" onerror="this.style.background='linear-gradient(135deg, #C4A96A, #E8E4DC)'; this.style.minHeight='280px'">
          </div>
        </div>
      </section>

      <!-- Categories -->
      <section class="categories-section section">
        <div class="container">
          <div class="categories-header">
            <span class="text-accent">Curations</span>
            <h2 class="heading-lg">Shop by Category</h2>
          </div>
          <div class="categories-grid">
            ${[
              { slug: 'servings', label: 'Servings & Dinnerware', img: 'product-2.jpg', count: 5 },
              { slug: 'drinkware', label: 'Drinkware & Vessels', img: 'product-6.jpg', count: 5 },
              { slug: 'metals', label: 'Metals & Cutlery', img: 'product-11.jpg', count: 5 },
              { slug: 'serveware', label: 'Serveware & Centerpieces', img: 'product-9.jpg', count: 5 },
              { slug: 'decor', label: 'Table Styling & Décor', img: 'product-3.jpg', count: 5 }
            ].map(cat => `
              <div class="category-card" onclick="navigate('shop', '${cat.slug}')">
                <img src="/images/products/${cat.img}" alt="${cat.label}" onerror="this.style.background='linear-gradient(135deg, #E4A98A, #F5E6DC)'; this.alt=''">
                <div class="category-overlay">
                  <h3>${cat.label}</h3>
                  <span>${cat.count} Products</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </section>

      <!-- Featured Products -->
      <section class="products-section section">
        <div class="container">
          <div class="categories-header">
            <span class="text-accent">Handpicked</span>
            <h2 class="heading-lg">Featured Collection</h2>
          </div>
          <div class="products-grid">
            ${featured.map(p => productCard(p)).join('')}
          </div>
          <div style="text-align:center; margin-top: var(--space-3xl)">
            <button class="btn btn-secondary btn-lg" onclick="navigate('shop')">View All Products</button>
          </div>
        </div>
      </section>

      <!-- Featured Banner -->
      <section class="featured-banner">
        <div class="featured-banner-inner">
          <div class="featured-banner-content">
            <span class="text-accent">Flagship Collection</span>
            <h2>The Aura Grand<br>16-Piece Tasting Suite</h2>
            <p>The ultimate expression of the Aura & Earth aesthetic — a complete table setting for four that harmonizes our most beloved pieces into one cohesive, transformative collection.</p>
            <div>
              <button class="btn btn-terracotta btn-lg" onclick="navigate('product', 'aura-grand-16-piece-tasting-suite')">Discover — Rs. 22,500</button>
            </div>
          </div>
          <div class="featured-banner-image">
            <img src="/images/products/product-4.jpg" alt="Grand Tasting Suite" onerror="this.style.background='linear-gradient(135deg, #3A3A3A, #5A5A5A)'; this.style.minHeight='500px'">
          </div>
        </div>
      </section>

      <!-- Values -->
      <section class="values-section section">
        <div class="container">
          <div class="categories-header">
            <span class="text-accent">Our Promise</span>
            <h2 class="heading-lg">Crafted with Intention</h2>
          </div>
          <div class="values-grid">
            <div class="value-card">
              <div class="value-icon">${icons.leaf}</div>
              <h3>Handcrafted</h3>
              <p>Every piece is individually shaped by skilled artisans, ensuring genuine uniqueness in each item.</p>
            </div>
            <div class="value-card">
              <div class="value-icon">${icons.shield}</div>
              <h3>Premium Materials</h3>
              <p>Sourced from the finest clays, metals, and natural fibers — materials that age beautifully over time.</p>
            </div>
            <div class="value-card">
              <div class="value-icon">${icons.truck}</div>
              <h3>Secure Delivery</h3>
              <p>Each piece is wrapped in protective eco-packaging and shipped with care to arrive in perfect condition.</p>
            </div>
            <div class="value-card">
              <div class="value-icon">${icons.refresh}</div>
              <h3>Easy Returns</h3>
              <p>Not satisfied? Return within 14 days for a full refund. No questions asked — we stand behind our craft.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Testimonials -->
      <section class="testimonials-section section">
        <div class="container">
          <div class="categories-header">
            <span class="text-accent">Client Stories</span>
            <h2 class="heading-lg">What Our Clients Say</h2>
          </div>
          <div class="testimonials-grid">
            <div class="testimonial-card">
              <div class="testimonial-stars">★★★★★</div>
              <p class="testimonial-text">"The terracotta pasta bowls have completely transformed our restaurant's presentation. Guests constantly ask where we source our tableware. Truly exceptional craftsmanship."</p>
              <p class="testimonial-author">— Sarah Chen, Executive Chef</p>
            </div>
            <div class="testimonial-card">
              <div class="testimonial-stars">★★★★★</div>
              <p class="testimonial-text">"We furnished our entire boutique hotel with Aura & Earth pieces. The warmth and authenticity they bring to our dining experience is irreplaceable. Worth every rupee."</p>
              <p class="testimonial-author">— Ahmed Raza, Hotelier</p>
            </div>
            <div class="testimonial-card">
              <div class="testimonial-stars">★★★★★</div>
              <p class="testimonial-text">"The Grand Tasting Suite was my wedding gift to my sister. She was moved to tears. These aren't just dishes — they're heirlooms that tell the story of earth and fire."</p>
              <p class="testimonial-author">— Maria Fernandez, Art Director</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Newsletter -->
      <section class="newsletter-section">
        <div class="container">
          <h2>Curious About Our Process?</h2>
          <p>Join our community and receive stories from the studio, early access to new collections, and exclusive offers.</p>
          <form class="newsletter-form" onsubmit="event.preventDefault(); showToast('Welcome to the community!', 'success'); this.reset();">
            <input type="email" placeholder="Your email address" required>
            <button type="submit" class="btn btn-terracotta">Subscribe</button>
          </form>
        </div>
      </section>

      <!-- Footer -->
      ${renderFooter()}
    </div>
  `;
}

// ===== PRODUCT CARD COMPONENT =====
function productCard(p) {
  const catClass = `cat-${p.category}`;
  return `
    <div class="product-card" onclick="navigate('product', '${p.slug}')">
      <div class="product-card-image">
        ${badgeHtml(p.badge)}
        <img src="/images/products/${p.images[0]}" alt="${p.name}"
          onerror="this.style.display='none'; this.parentElement.insertAdjacentHTML('beforeend', '<div class=\\'placeholder-img ${catClass}\\'></div>')">
        <div class="product-quick-actions">
          <button class="quick-action-btn" onclick="event.stopPropagation(); addToCart(${p.id})" title="Add to Cart">
            ${icons.cart}
          </button>
          <button class="quick-action-btn" onclick="event.stopPropagation(); navigate('product', '${p.slug}')" title="Quick View">
            ${icons.eye}
          </button>
        </div>
      </div>
      <div class="product-card-info">
        <span class="product-card-category">${p.categoryLabel}</span>
        <h3 class="product-card-name">${p.name}</h3>
        <p class="product-card-desc">${p.description}</p>
        <div class="product-card-footer">
          <div>
            <span class="product-price">${formatPrice(p.price)}</span>
            <span class="product-price-usd">($${p.priceUSD.toFixed(2)})</span>
          </div>
          ${ratingStars(p.rating, p.reviews)}
        </div>
      </div>
    </div>
  `;
}

// ===== SHOP PAGE =====
function renderShop(category) {
  state.currentCategory = category || 'all';
  
  let filtered = [...state.products];
  if (state.currentCategory !== 'all') {
    filtered = filtered.filter(p => p.category === state.currentCategory);
  }
  
  const categories = [
    { slug: 'all', label: 'All Products' },
    { slug: 'servings', label: 'Servings' },
    { slug: 'drinkware', label: 'Drinkware' },
    { slug: 'metals', label: 'Metals' },
    { slug: 'serveware', label: 'Serveware' },
    { slug: 'decor', label: 'Décor' }
  ];
  
  const catLabel = state.currentCategory === 'all' ? 'All Products' : 
    categories.find(c => c.slug === state.currentCategory)?.label || 'Products';
  
  document.getElementById('app').innerHTML = `
    <div class="page">
      <section class="products-section section">
        <div class="container">
          <div class="categories-header">
            <span class="text-accent">Collection</span>
            <h2 class="heading-lg">${catLabel}</h2>
          </div>
          
          <div class="products-toolbar">
            <div class="filter-bar">
              ${categories.map(c => `
                <button class="filter-btn ${state.currentCategory === c.slug ? 'active' : ''}" 
                  onclick="navigate('shop', '${c.slug === 'all' ? '' : c.slug}')">${c.label}</button>
              `).join('')}
            </div>
            <div style="display:flex; gap: var(--space-md); align-items:center">
              <span class="products-count">${filtered.length} products</span>
              <select class="sort-select" onchange="sortProducts(this.value)">
                <option value="default">Sort by: Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name">Name: A to Z</option>
                <option value="rating">Top Rated</option>
              </select>
            </div>
          </div>
          
          <div class="products-grid" id="productsGrid">
            ${filtered.map(p => productCard(p)).join('')}
          </div>
        </div>
      </section>
      ${renderFooter()}
    </div>
  `;
}

function sortProducts(sortBy) {
  state.sortBy = sortBy;
  let filtered = [...state.products];
  
  if (state.currentCategory !== 'all') {
    filtered = filtered.filter(p => p.category === state.currentCategory);
  }
  
  switch(sortBy) {
    case 'price-asc': filtered.sort((a, b) => a.price - b.price); break;
    case 'price-desc': filtered.sort((a, b) => b.price - a.price); break;
    case 'name': filtered.sort((a, b) => a.name.localeCompare(b.name)); break;
    case 'rating': filtered.sort((a, b) => b.rating - a.rating); break;
  }
  
  document.getElementById('productsGrid').innerHTML = filtered.map(p => productCard(p)).join('');
}

// ===== PRODUCT DETAIL PAGE =====
function renderProductDetail(slug) {
  const product = state.products.find(p => p.slug === slug);
  if (!product) {
    document.getElementById('app').innerHTML = `<div class="page"><div class="container" style="padding:80px 20px; text-align:center"><h2 class="heading-md">Product not found</h2><br><button class="btn btn-primary" onclick="navigate('shop')">Back to Shop</button></div></div>`;
    return;
  }
  
  const related = state.products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
  const catClass = `cat-${product.category}`;
  
  document.getElementById('app').innerHTML = `
    <div class="page">
      <section class="product-detail">
        <div class="container">
          <!-- Breadcrumb -->
          <div style="margin-bottom: var(--space-xl); font-size: 0.8rem; color: var(--gray-400)">
            <a href="#" onclick="navigate('home')" style="color: var(--gray-400)">Home</a> / 
            <a href="#" onclick="navigate('shop', '${product.category}')" style="color: var(--gray-400)">${product.categoryLabel}</a> / 
            <span style="color: var(--charcoal)">${product.name}</span>
          </div>
          
          <div class="product-detail-grid">
            <!-- Gallery -->
            <div class="product-gallery">
              <div class="product-gallery-main">
                <img src="/images/products/${product.images[0]}" alt="${product.name}" id="mainProductImage"
                  onerror="this.style.display='none'; this.parentElement.insertAdjacentHTML('beforeend', '<div class=\\'placeholder-img ${catClass}\\' style=\\'font-size:2rem\\'>${product.name.slice(0,2)}</div>')">
              </div>
              <div class="product-gallery-thumbs">
                ${product.images.map((img, i) => `
                  <div class="gallery-thumb ${i === 0 ? 'active' : ''}" onclick="switchImage('/images/products/${img}', this)">
                    <img src="/images/products/${img}" alt="${product.name} view ${i+1}"
                      onerror="this.parentElement.style.background='var(--linen-light)'">
                  </div>
                `).join('')}
                ${product.images.length < 4 ? Array(4 - product.images.length).fill('').map((_, i) => `
                  <div class="gallery-thumb" style="background: var(--linen-light)"></div>
                `).join('') : ''}
              </div>
            </div>
            
            <!-- Info -->
            <div class="product-info">
              <span class="text-accent">${product.categoryLabel}</span>
              ${badgeHtml(product.badge)}
              <h1>${product.name}</h1>
              
              <div style="display:flex; align-items:center; gap: var(--space-md); margin-bottom: var(--space-md)">
                ${ratingStars(product.rating, product.reviews)}
              </div>
              
              <div class="product-price-large">
                ${formatPrice(product.price)} 
                <span style="font-size:1rem; color:var(--gray-400); font-weight:400">($${product.priceUSD.toFixed(2)})</span>
              </div>
              
              <p class="product-description">${product.longDescription}</p>
              
              <div class="product-specs">
                <div class="spec-item">
                  <label>Material</label>
                  <span>${product.material}</span>
                </div>
                <div class="spec-item">
                  <label>Dimensions</label>
                  <span>${product.dimensions}</span>
                </div>
                <div class="spec-item">
                  <label>Weight</label>
                  <span>${product.weight}</span>
                </div>
                <div class="spec-item">
                  <label>Care</label>
                  <span>${product.care}</span>
                </div>
              </div>
              
              <label style="font-family: var(--font-accent); font-size: 0.68rem; letter-spacing: 0.15em; text-transform: uppercase; color: var(--gray-500);">Quantity</label>
              <div class="quantity-selector">
                <button class="qty-btn" onclick="adjustQty(-1)">−</button>
                <span class="qty-value" id="productQty">1</span>
                <button class="qty-btn" onclick="adjustQty(1)">+</button>
              </div>
              
              <div class="product-actions">
                <button class="btn btn-primary btn-lg" onclick="addToCart(${product.id}, getQty())">Add to Cart — ${formatPrice(product.price)}</button>
                <button class="btn btn-secondary btn-lg btn-icon" onclick="addToCart(${product.id}, getQty()); toggleCart();" title="Buy Now">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
                </button>
              </div>
              
              <div class="product-trust">
                <div class="trust-item">${icons.truck} Free shipping over Rs. 10,000</div>
                <div class="trust-item">${icons.shield} Secure checkout</div>
                <div class="trust-item">${icons.refresh} 14-day returns</div>
              </div>
            </div>
          </div>
          
          <!-- Related Products -->
          ${related.length > 0 ? `
          <div style="margin-top: var(--space-5xl)">
            <div class="categories-header">
              <span class="text-accent">You May Also Like</span>
              <h2 class="heading-md">Related Products</h2>
            </div>
            <div class="products-grid">
              ${related.map(p => productCard(p)).join('')}
            </div>
          </div>
          ` : ''}
        </div>
      </section>
      ${renderFooter()}
    </div>
  `;
}

function switchImage(src, thumb) {
  document.getElementById('mainProductImage').src = src;
  document.querySelectorAll('.gallery-thumb').forEach(t => t.classList.remove('active'));
  thumb.classList.add('active');
}

function adjustQty(delta) {
  const el = document.getElementById('productQty');
  let val = parseInt(el.textContent) + delta;
  if (val < 1) val = 1;
  if (val > 10) val = 10;
  el.textContent = val;
}

function getQty() {
  return parseInt(document.getElementById('productQty')?.textContent || 1);
}

// ===== ABOUT PAGE =====
function renderAbout() {
  document.getElementById('app').innerHTML = `
    <div class="page">
      <section class="about-hero">
        <div>
          <span class="text-accent" style="color: var(--terracotta); display:block; margin-bottom: var(--space-md)">Our Story</span>
          <h1 class="heading-xl">From Earth,<br>With <em style="color: var(--terracotta); font-style:italic">Intention</em></h1>
        </div>
      </section>
      
      <section class="about-content">
        <p>Welcome to <strong>Aura & Earth</strong>, a signature brand dedicated to redefining hospitality through timeless tableware and curated dining collections designed for hotels, restaurants, and cafés.</p>
        
        <p>We believe every dining experience is an opportunity to make a lasting impression. From luxury hotels to intimate restaurants and artisanal cafés, our collections are designed to dress every table with exceptional craft, sustainability, warmth, safety, and refined aesthetics.</p>
        
        <p>At Aura & Earth, every piece creates a seamless bridge between the past and the present, bringing together elegance, functionality, and sophistication for spaces where memorable moments are shared.</p>
        
        <p>Our artisans work with time-honored techniques passed down through generations — hand-throwing on the potter's wheel, hand-hammering metals, steam-bending natural materials, and botanically dyeing textiles. Each piece carries the subtle fingerprint of its maker, a testament to genuine handcraft in an age of mass production.</p>
        
        <h2 class="heading-md" style="margin: var(--space-3xl) 0 var(--space-xl); text-align: center">Our Pillars</h2>
        
        <div class="values-grid" style="margin-bottom: var(--space-3xl)">
          <div class="value-card">
            <div class="value-icon">${icons.leaf}</div>
            <h3>Sustainability</h3>
            <p>We source responsibly, use natural and recycled materials, and minimize waste at every step of production.</p>
          </div>
          <div class="value-card">
            <div class="value-icon">${icons.shield}</div>
            <h3>Authenticity</h3>
            <p>No two pieces are identical. Natural variation is a hallmark of genuine handcraft, not a flaw.</p>
          </div>
          <div class="value-card">
            <div class="value-icon">${icons.truck}</div>
            <h3>Durability</h3>
            <p>Built for daily use in demanding hospitality environments. Our pieces are as tough as they are beautiful.</p>
          </div>
          <div class="value-card">
            <div class="value-icon">${icons.refresh}</div>
            <h3>Timelessness</h3>
            <p>We design pieces that transcend trends — tableware you'll love using for decades, not seasons.</p>
          </div>
        </div>
      </section>
      
      <section class="newsletter-section">
        <div class="container">
          <h2>Let's Create Together</h2>
          <p>Whether you're a hotel, restaurant, café, or a home that loves to host — we'd love to hear your vision.</p>
          <form class="newsletter-form" onsubmit="event.preventDefault(); showToast('Thank you! We\\'ll be in touch.', 'success'); this.reset();">
            <input type="email" placeholder="Your email address" required>
            <button type="submit" class="btn btn-terracotta">Get in Touch</button>
          </form>
        </div>
      </section>
      ${renderFooter()}
    </div>
  `;
}

// ===== CHECKOUT PAGE =====
function renderCheckout() {
  if (state.cart.length === 0) {
    document.getElementById('app').innerHTML = `
      <div class="page">
        <div class="container" style="padding:80px 20px; text-align:center">
          <h2 class="heading-md">Your cart is empty</h2>
          <p style="color: var(--gray-500); margin-top: var(--space-md)">Add some products before checking out.</p>
          <br><button class="btn btn-primary" onclick="navigate('shop')">Browse Collection</button>
        </div>
        ${renderFooter()}
      </div>`;
    return;
  }
  
  const subtotal = state.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  document.getElementById('app').innerHTML = `
    <div class="page">
      <section class="checkout-page">
        <div class="container">
          <div class="categories-header" style="text-align:left; margin-bottom: var(--space-2xl)">
            <span class="text-accent" style="color: var(--terracotta)">Checkout</span>
            <h2 class="heading-lg">Complete Your Order</h2>
          </div>
          
          <div class="checkout-grid">
            <div class="checkout-form-section">
              ${!state.user ? `
                <div style="background: var(--cream); padding: var(--space-lg); border-radius: var(--radius-md); margin-bottom: var(--space-xl)">
                  <p style="font-size:0.9rem; color: var(--gray-600)">
                    <strong>Have an account?</strong> 
                    <a href="#" onclick="openAuthModal('login')" style="color: var(--terracotta); font-weight:500">Sign in</a> for faster checkout, or 
                    <a href="#" onclick="openAuthModal('register')" style="color: var(--terracotta); font-weight:500">create one</a>.
                  </p>
                </div>
              ` : `<p style="margin-bottom: var(--space-xl); font-size: 0.9rem; color: var(--gray-500)">Ordering as <strong>${state.user.name}</strong> (${state.user.email})</p>`}
              
              <h2>Shipping Details</h2>
              <form onsubmit="handleCheckout(event)">
                <div style="display:grid; grid-template-columns:1fr 1fr; gap: var(--space-md)">
                  <div class="form-group">
                    <label>First Name</label>
                    <input type="text" id="shipFirst" required value="${state.user ? state.user.name.split(' ')[0] : ''}">
                  </div>
                  <div class="form-group">
                    <label>Last Name</label>
                    <input type="text" id="shipLast" required value="${state.user ? state.user.name.split(' ').slice(1).join(' ') : ''}">
                  </div>
                </div>
                <div class="form-group">
                  <label>Email</label>
                  <input type="email" id="shipEmail" required value="${state.user ? state.user.email : ''}">
                </div>
                <div class="form-group">
                  <label>Phone</label>
                  <input type="tel" id="shipPhone" required value="${state.user ? state.user.phone || '' : ''}">
                </div>
                <div class="form-group">
                  <label>Address</label>
                  <input type="text" id="shipAddress" placeholder="Street address" required>
                </div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap: var(--space-md)">
                  <div class="form-group">
                    <label>City</label>
                    <input type="text" id="shipCity" required>
                  </div>
                  <div class="form-group">
                    <label>Postal Code</label>
                    <input type="text" id="shipZip" required>
                  </div>
                </div>
                
                <h2 style="margin-top: var(--space-2xl)">Payment Method</h2>
                <div class="form-group">
                  <div style="display:flex; flex-direction:column; gap: var(--space-sm); margin-top: var(--space-sm)">
                    <label style="display:flex; align-items:center; gap: var(--space-sm); cursor:pointer; font-size:0.9rem; text-transform:none; letter-spacing:0; color: var(--charcoal)">
                      <input type="radio" name="payment" value="cod" checked> Cash on Delivery
                    </label>
                    <label style="display:flex; align-items:center; gap: var(--space-sm); cursor:pointer; font-size:0.9rem; text-transform:none; letter-spacing:0; color: var(--charcoal)">
                      <input type="radio" name="payment" value="bank"> Bank Transfer
                    </label>
                  </div>
                </div>
                
                <button type="submit" class="btn btn-primary btn-lg" style="width:100%; margin-top: var(--space-xl)">Place Order — ${formatPrice(subtotal + 500)}</button>
              </form>
            </div>
            
            <div class="checkout-summary">
              <h3>Order Summary</h3>
              ${state.cart.map(item => `
                <div class="checkout-item">
                  <div class="checkout-item-img">
                    <img src="/images/products/${item.image}" alt="${item.name}" onerror="this.parentElement.style.background='var(--linen-light)'">
                  </div>
                  <div class="checkout-item-details">
                    <div class="checkout-item-name">${item.name}</div>
                    <div class="checkout-item-qty">Qty: ${item.quantity}</div>
                  </div>
                  <div class="checkout-item-price">${formatPrice(item.price * item.quantity)}</div>
                </div>
              `).join('')}
              
              <div class="checkout-totals">
                <div class="row"><span>Subtotal</span><span>${formatPrice(subtotal)}</span></div>
                <div class="row"><span>Shipping</span><span>Rs. 500</span></div>
                <div class="row total"><span>Total</span><span>${formatPrice(subtotal + 500)}</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>
      ${renderFooter()}
    </div>
  `;
}

async function handleCheckout(e) {
  e.preventDefault();
  
  if (!state.user) {
    openAuthModal('login');
    showToast('Please sign in to place your order', 'info');
    return;
  }
  
  const shippingAddress = {
    firstName: document.getElementById('shipFirst').value,
    lastName: document.getElementById('shipLast').value,
    email: document.getElementById('shipEmail').value,
    phone: document.getElementById('shipPhone').value,
    address: document.getElementById('shipAddress').value,
    city: document.getElementById('shipCity').value,
    zip: document.getElementById('shipZip').value
  };
  
  const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
  
  try {
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ shippingAddress, paymentMethod })
    });
    const data = await res.json();
    
    if (data.success) {
      state.cart = [];
      updateCartUI();
      navigate('order-confirmed', data.order.id);
    } else {
      showToast(data.error || 'Order failed', 'error');
    }
  } catch (e) {
    showToast('Order placement failed', 'error');
  }
}

// ===== ORDER CONFIRMED =====
function renderOrderConfirmed(orderId) {
  document.getElementById('app').innerHTML = `
    <div class="page">
      <div class="order-confirmed">
        <div class="checkmark">${icons.check}</div>
        <h1>Order Confirmed!</h1>
        <p class="order-id">Order #${orderId || 'AE-XXXXX'}</p>
        <p>Thank you for your order! Your artisanal pieces are being carefully prepared and wrapped with love. You'll receive a confirmation email with tracking details shortly.</p>
        <div style="display:flex; gap: var(--space-md); justify-content:center; margin-top: var(--space-xl)">
          <button class="btn btn-primary" onclick="navigate('shop')">Continue Shopping</button>
          <button class="btn btn-secondary" onclick="navigate('orders')">View Orders</button>
        </div>
      </div>
      ${renderFooter()}
    </div>
  `;
}

// ===== ORDERS PAGE =====
async function renderOrders() {
  if (!state.user) {
    openAuthModal('login');
    return;
  }
  
  let ordersHtml = '<div style="text-align:center; padding:40px; color: var(--gray-400)">Loading orders...</div>';
  
  document.getElementById('app').innerHTML = `
    <div class="page">
      <section class="section" style="background: var(--cream-warm)">
        <div class="container">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: var(--space-2xl)">
            <div>
              <span class="text-accent" style="color: var(--terracotta); display:block; margin-bottom: var(--space-sm)">My Account</span>
              <h2 class="heading-lg">Welcome, ${state.user.name}</h2>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="handleLogout()">Sign Out</button>
          </div>
          <div id="ordersContent">${ordersHtml}</div>
        </div>
      </section>
      ${renderFooter()}
    </div>
  `;
  
  try {
    const res = await fetch('/api/orders');
    const data = await res.json();
    
    if (data.orders.length === 0) {
      document.getElementById('ordersContent').innerHTML = `
        <div style="text-align:center; padding:60px 20px; background: var(--white); border-radius: var(--radius-lg)">
          <h3 class="heading-sm">No orders yet</h3>
          <p style="color: var(--gray-500); margin: var(--space-md) 0 var(--space-xl)">Start exploring our collection and place your first order.</p>
          <button class="btn btn-primary" onclick="navigate('shop')">Browse Collection</button>
        </div>
      `;
    } else {
      document.getElementById('ordersContent').innerHTML = data.orders.map(order => `
        <div style="background: var(--white); border-radius: var(--radius-lg); padding: var(--space-xl); margin-bottom: var(--space-md); box-shadow: var(--shadow-sm)">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: var(--space-md)">
            <div>
              <strong style="font-size:1.1rem">Order #${order.id}</strong>
              <p style="font-size:0.8rem; color:var(--gray-400); margin-top:4px">${new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
            <span class="status-badge ${order.status}">${order.status}</span>
          </div>
          <div style="display:flex; gap: var(--space-md); flex-wrap:wrap">
            ${order.items.map(item => `
              <div style="display:flex; gap: var(--space-sm); align-items:center">
                <div style="width:40px; height:40px; border-radius: var(--radius-sm); overflow:hidden; background: var(--linen-light)">
                  <img src="/images/products/${item.image}" style="width:100%; height:100%; object-fit:cover" onerror="this.style.display='none'">
                </div>
                <span style="font-size:0.8rem">${item.name} × ${item.quantity}</span>
              </div>
            `).join('')}
          </div>
          <div style="margin-top: var(--space-md); padding-top: var(--space-md); border-top: 1px solid var(--gray-100); text-align:right">
            <strong>${formatPrice(order.total)}</strong>
          </div>
        </div>
      `).join('');
    }
  } catch (e) {
    document.getElementById('ordersContent').innerHTML = '<p style="color: var(--gray-500)">Failed to load orders.</p>';
  }
}

// ===== ADMIN DASHBOARD =====
async function renderAdmin(tab) {
  if (!state.user || state.user.role !== 'admin') {
    showToast('Admin access required', 'error');
    navigate('home');
    return;
  }
  
  const activeTab = tab || 'dashboard';
  
  document.getElementById('app').innerHTML = `
    <div class="admin-layout">
      <aside class="admin-sidebar">
        <h3>Aura <span>&</span> Earth</h3>
        <p style="font-size:0.75rem; color:var(--gray-500); margin-bottom: var(--space-xl)">Admin Panel</p>
        <nav class="admin-nav">
          <a href="#" onclick="navigate('admin', 'dashboard')" class="${activeTab === 'dashboard' ? 'active' : ''}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
            Dashboard
          </a>
          <a href="#" onclick="navigate('admin', 'orders')" class="${activeTab === 'orders' ? 'active' : ''}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg>
            Orders
          </a>
          <a href="#" onclick="navigate('admin', 'products')" class="${activeTab === 'products' ? 'active' : ''}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            Products
          </a>
          <a href="#" onclick="navigate('admin', 'users')" class="${activeTab === 'users' ? 'active' : ''}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            Users
          </a>
        </nav>
        <div style="margin-top: auto; padding-top: var(--space-2xl)">
          <a href="#" onclick="navigate('home')" style="font-size:0.8rem; color:var(--gray-500)">← Back to Store</a>
          <br><br>
          <a href="#" onclick="handleLogout()" style="font-size:0.8rem; color:var(--terracotta-light)">Sign Out</a>
        </div>
      </aside>
      <main class="admin-main" id="adminContent">
        <div style="text-align:center; padding:40px; color: var(--gray-400)">Loading...</div>
      </main>
    </div>
  `;
  
  switch(activeTab) {
    case 'dashboard': await renderAdminDashboard(); break;
    case 'orders': await renderAdminOrders(); break;
    case 'products': renderAdminProducts(); break;
    case 'users': await renderAdminUsers(); break;
  }
}

async function renderAdminDashboard() {
  try {
    const res = await fetch('/api/admin/stats');
    const data = await res.json();
    
    document.getElementById('adminContent').innerHTML = `
      <div class="admin-header">
        <h1>Dashboard</h1>
        <span style="font-size:0.85rem; color: var(--gray-400)">${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
      </div>
      
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">Total Products</div>
          <div class="stat-value">${data.totalProducts}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Total Orders</div>
          <div class="stat-value">${data.totalOrders}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Total Users</div>
          <div class="stat-value">${data.totalUsers}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Total Revenue</div>
          <div class="stat-value revenue">${formatPrice(data.totalRevenue)}</div>
        </div>
      </div>
      
      <h2 style="font-family: var(--font-display); font-size: 1.5rem; margin-bottom: var(--space-lg)">Recent Orders</h2>
      ${data.recentOrders.length > 0 ? `
        <table class="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            ${data.recentOrders.map(o => `
              <tr>
                <td><strong>${o.id}</strong></td>
                <td>${o.userName}</td>
                <td>${o.items.length} items</td>
                <td>${formatPrice(o.total)}</td>
                <td><span class="status-badge ${o.status}">${o.status}</span></td>
                <td>${new Date(o.createdAt).toLocaleDateString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : '<p style="color: var(--gray-400); text-align:center; padding:40px">No orders yet</p>'}
    `;
  } catch (e) {
    document.getElementById('adminContent').innerHTML = '<p>Failed to load dashboard data</p>';
  }
}

async function renderAdminOrders() {
  try {
    const res = await fetch('/api/admin/orders');
    const data = await res.json();
    
    document.getElementById('adminContent').innerHTML = `
      <div class="admin-header">
        <h1>All Orders</h1>
        <span style="font-size:0.85rem; color: var(--gray-400)">${data.orders.length} orders</span>
      </div>
      
      ${data.orders.length > 0 ? `
        <table class="admin-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Email</th>
              <th>Items</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${data.orders.map(o => `
              <tr>
                <td><strong>${o.id}</strong></td>
                <td>${o.userName}</td>
                <td>${o.userEmail}</td>
                <td>${o.items.length} items</td>
                <td>${formatPrice(o.total)}</td>
                <td style="text-transform:uppercase; font-size:0.75rem">${o.paymentMethod}</td>
                <td><span class="status-badge ${o.status}">${o.status}</span></td>
                <td>
                  <select onchange="updateOrderStatus('${o.id}', this.value)" style="padding:4px 8px; font-size:0.75rem; border:1px solid var(--gray-200); border-radius:4px">
                    <option value="confirmed" ${o.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                    <option value="processing" ${o.status === 'processing' ? 'selected' : ''}>Processing</option>
                    <option value="shipped" ${o.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                    <option value="delivered" ${o.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                  </select>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : '<p style="color: var(--gray-400); text-align:center; padding:40px">No orders yet</p>'}
    `;
  } catch (e) {
    document.getElementById('adminContent').innerHTML = '<p>Failed to load orders</p>';
  }
}

async function updateOrderStatus(orderId, status) {
  try {
    await fetch(`/api/admin/orders/${orderId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    showToast(`Order ${orderId} updated to ${status}`, 'success');
  } catch (e) {
    showToast('Failed to update order', 'error');
  }
}

function renderAdminProducts() {
  document.getElementById('adminContent').innerHTML = `
    <div class="admin-header">
      <h1>Products</h1>
      <span style="font-size:0.85rem; color: var(--gray-400)">${state.products.length} products</span>
    </div>
    
    <table class="admin-table">
      <thead>
        <tr>
          <th>Image</th>
          <th>Name</th>
          <th>Category</th>
          <th>Price (PKR)</th>
          <th>Price (USD)</th>
          <th>Rating</th>
          <th>Reviews</th>
        </tr>
      </thead>
      <tbody>
        ${state.products.map(p => `
          <tr>
            <td>
              <div style="width:50px; height:50px; border-radius:var(--radius-sm); overflow:hidden; background:var(--linen-light)">
                <img src="/images/products/${p.images[0]}" style="width:100%; height:100%; object-fit:cover" onerror="this.style.display='none'">
              </div>
            </td>
            <td><strong>${p.name}</strong></td>
            <td>${p.categoryLabel}</td>
            <td>${formatPrice(p.price)}</td>
            <td>$${p.priceUSD.toFixed(2)}</td>
            <td>★ ${p.rating}</td>
            <td>${p.reviews}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

async function renderAdminUsers() {
  try {
    const res = await fetch('/api/admin/users');
    const data = await res.json();
    
    document.getElementById('adminContent').innerHTML = `
      <div class="admin-header">
        <h1>Users</h1>
        <span style="font-size:0.85rem; color: var(--gray-400)">${data.users.length} registered users</span>
      </div>
      
      <table class="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Role</th>
            <th>Joined</th>
          </tr>
        </thead>
        <tbody>
          ${data.users.map(u => `
            <tr>
              <td><strong>${u.name}</strong></td>
              <td>${u.email}</td>
              <td>${u.phone || '—'}</td>
              <td><span class="status-badge ${u.role === 'admin' ? 'shipped' : 'confirmed'}">${u.role}</span></td>
              <td>${new Date(u.createdAt).toLocaleDateString()}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  } catch (e) {
    document.getElementById('adminContent').innerHTML = '<p>Failed to load users</p>';
  }
}

// ===== SEARCH =====
function openSearch() {
  const query = prompt('Search products:');
  if (query && query.trim()) {
    const results = state.products.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.description.toLowerCase().includes(query.toLowerCase()) ||
      p.categoryLabel.toLowerCase().includes(query.toLowerCase())
    );
    
    state.currentCategory = 'all';
    document.getElementById('app').innerHTML = `
      <div class="page">
        <section class="products-section section">
          <div class="container">
            <div class="categories-header">
              <span class="text-accent">Search Results</span>
              <h2 class="heading-lg">"${query}" — ${results.length} found</h2>
            </div>
            <div class="products-grid">
              ${results.length > 0 ? results.map(p => productCard(p)).join('') : '<p style="text-align:center; padding:40px; color: var(--gray-400); grid-column:1/-1">No products found matching your search.</p>'}
            </div>
          </div>
        </section>
        ${renderFooter()}
      </div>
    `;
  }
}

// ===== FOOTER COMPONENT =====
function renderFooter() {
  return `
    <footer class="footer">
      <div class="container">
        <div class="footer-grid">
          <div class="footer-brand">
            <h3>Aura <span>&</span> Earth</h3>
            <p>Handcrafted artisanal tableware for hotels, restaurants, and homes that celebrate the beauty of imperfection and the warmth of natural materials.</p>
            <div class="footer-social">
              <a href="#" title="Instagram"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg></a>
              <a href="#" title="Pinterest"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2C6.48 2 2 6.48 2 12c0 4.25 2.67 7.87 6.43 9.29-.09-.78-.17-1.98.04-2.83.18-.77 1.19-5.03 1.19-5.03s-.3-.61-.3-1.51c0-1.42.82-2.47 1.84-2.47.87 0 1.29.65 1.29 1.43 0 .87-.56 2.18-.84 3.39-.24 1.01.5 1.83 1.49 1.83 1.79 0 3.16-1.89 3.16-4.61 0-2.41-1.73-4.1-4.21-4.1-2.87 0-4.55 2.15-4.55 4.37 0 .87.33 1.79.75 2.3.08.1.09.19.07.29-.08.31-.25 1.01-.28 1.15-.05.19-.15.23-.35.14-1.31-.61-2.13-2.52-2.13-4.06 0-3.31 2.41-6.35 6.94-6.35 3.64 0 6.48 2.6 6.48 6.07 0 3.62-2.28 6.53-5.45 6.53-1.06 0-2.07-.55-2.41-1.21l-.66 2.5c-.24.91-.88 2.05-1.31 2.74A10 10 0 0 0 22 12c0-5.52-4.48-10-10-10z"/></svg></a>
              <a href="#" title="Facebook"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></a>
            </div>
          </div>
          <div class="footer-column">
            <h4>Shop</h4>
            <ul>
              <li><a href="#" onclick="navigate('shop', 'servings')">Servings</a></li>
              <li><a href="#" onclick="navigate('shop', 'drinkware')">Drinkware</a></li>
              <li><a href="#" onclick="navigate('shop', 'metals')">Metals</a></li>
              <li><a href="#" onclick="navigate('shop', 'serveware')">Serveware</a></li>
              <li><a href="#" onclick="navigate('shop', 'decor')">Décor</a></li>
            </ul>
          </div>
          <div class="footer-column">
            <h4>Company</h4>
            <ul>
              <li><a href="#" onclick="navigate('about')">Our Story</a></li>
              <li><a href="#">Sustainability</a></li>
              <li><a href="#">Press</a></li>
              <li><a href="#">Careers</a></li>
            </ul>
          </div>
          <div class="footer-column">
            <h4>Support</h4>
            <ul>
              <li><a href="#">Contact Us</a></li>
              <li><a href="#">Shipping Info</a></li>
              <li><a href="#">Returns Policy</a></li>
              <li><a href="#">FAQ</a></li>
            </ul>
          </div>
        </div>
        <div class="footer-bottom">
          <span>© ${new Date().getFullYear()} Aura & Earth. All rights reserved.</span>
          <span>Designed by <a href="#">Sadaqat Hussain</a></span>
        </div>
      </div>
    </footer>
  `;
}
