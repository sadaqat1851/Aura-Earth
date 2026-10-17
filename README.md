# 🌿 Aura & Earth — Artisanal Tableware E-Commerce Platform

> **Artisanal Tableware Curated for Hotels, Restaurants & Cafés**  
> *From Moodboard to Tabletop — Crafting luxury that feels like haven.*

---

## ✨ Overview

**Aura & Earth** is an ultra-realistic, full-stack artisanal e-commerce web application inspired by luxury tableware curations (Haven Hearth style). The platform features an earthy aesthetic palette (Terracotta, Olive Leaf, Warm Cream, Linen Sand, Charcoal Stone), sophisticated typography, micro-animations, and complete end-to-end shopping and management capabilities.

---

## 🌟 Key Features

- **25 Signature Artisanal Products**:
  - Divided across 5 core curations:
    1. *Servings & Dinnerware*
    2. *Drinkware & Vessels*
    3. *Metals & Cutlery*
    4. *Serveware & Centerpieces*
    5. *Table Styling & Décor*
- **4 HD Studio Views per Product**:
  - Master Hero Shot
  - Macro Artisan Texture & Clay Detail
  - Angled Table Perspective
  - Atmospheric Warm Dining Setting
- **Seamless Single-Page Application (SPA)**:
  - Fast hash-based routing (`#home`, `#shop`, `#product/:slug`, `#about`, `#checkout`, `#orders`, `#admin`)
  - Dynamic interactive cart drawer with live subtotal calculation
  - Real-time instant search and category filter toolbar
  - Price sorting (Low to High, High to Low, Top Rated, Alphabetical)
  - Interactive product image switcher gallery
- **Full Backend & REST APIs**:
  - Built on Node.js and Express
  - Session-based authentication & persistent customer carts
  - Secure password hashing with `bcryptjs`
  - Customer order checkout (Cash on Delivery & Bank Transfer)
  - Customer order history dashboard
  - Full Admin Portal (`/admin`):
    - Real-time revenue & sales statistics
    - Order status management (Pending, Confirmed, Shipped, Delivered)
    - Product and user management
- **Bespoke Earthy Brand Identity**:
  - High-resolution brand logo with terracotta sun and olive leaf crest
  - Cormorant Garamond & Outfit luxury typography
  - Warm neutral glassmorphism and tactile elevation shadows

---

## 🗂️ Project Structure

```
aura-and-earth/
├── data/
│   ├── products.json       # 25 curated artisanal tableware products
│   ├── users.json          # Persistent user database
│   └── orders.json         # Customer orders database
├── public/
│   ├── css/
│   │   └── style.css       # Complete luxury earthy design system
│   ├── js/
│   │   └── app.js          # SPA router, cart, catalog, checkout, & admin panel
│   ├── images/
│   │   ├── brand/
│   │   │   └── logo.jpg    # Aura & Earth brand logo
│   │   └── products/       # 100 HD studio photos (4 views per product)
│   └── index.html          # Semantic HTML shell
├── scripts/
│   ├── setup_images.py     # HD studio photography generator & processor
│   └── update_products_json.py # Product metadata sync
├── server.js               # Express backend server with full REST APIs
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/)

### 2. Installation
```bash
git clone https://github.com/sadaqat1851/Aura-Earth.git
cd Aura-Earth
npm install
```

### 3. Run Locally
```bash
npm start
```
The server will start at:
👉 **`http://localhost:3000`**

---

## 🔑 Default Credentials

- **Admin Account**:
  - **Email**: `admin@auraandearth.com`
  - **Password**: `admin123`
- *Or register your own customer account directly via the account button in the navbar.*

---

## 🛠️ Tech Stack

- **Frontend**: Vanilla HTML5, CSS3 Custom Properties (Design Tokens), Modern JavaScript (ES6+ SPA)
- **Backend**: Node.js, Express, Express-Session
- **Security**: bcryptjs password encryption
- **Data Store**: Persistent JSON data storage engine

---

## 📄 License

ISC License. Handcrafted with intention by Aura & Earth.
