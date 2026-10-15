# 🍫 GANACHLY — Luxury Artisan Eggless Patisserie
### *Nocturne Couverture Atelier • Faridabad & Delhi NCR*

![Ganachly Banner](https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=1200&q=80)

Ganachly is a modern, production-grade web application and live operations portal for a luxury, 100% eggless confectionery atelier specializing in micro-batch bakes with 70.5% Belgian Callebaut couverture.

The platform provides a dual-facing architecture: a **luxury customer storefront** with live courier tracking and persistent cart caching, alongside an **integrated atelier operations console** featuring real-time oven deck telemetry, catalog formulations, couverture inventory tracking, and concierge dispatch.

---

## ✨ Key Features

### 🛍️ 1. Customer Storefront
- **Dynamic Confectionery Formulary:** Real-time catalog populated directly from Firebase Cloud Firestore (brownies, brookies, cheesecakes, luxury hampers, and couverture beverages).
- **Persistent Cart Cache Memory:** 
  - Cart state persists indefinitely across browser refreshes, tab closures, and navigation.
  - Synced to the user's Firestore cloud profile when authenticated.
  - Cleared **strictly and only** when an order is finalized and placed.
- **Real-Time Live Order Tracking:** Track active batches through kitchen deck progression: `In Kitchen Deck Oven` ➔ `Sliced & Hand-Glazed` ➔ `Sealed Broken Bar Box` ➔ `Out for NCR Courier` ➔ `Delivered`.
- **Delhi NCR Delivery Zones:** Intelligent SLAs covering Faridabad, Gurugram, South/Central Delhi, Noida, West Delhi, and Ghaziabad.
- **WhatsApp Concierge & Bulk Gifting:** Direct prefilled WhatsApp inquiry generator for corporate gifting and custom event hampers.

### 🔐 2. Smart Authentication & Cache Memory
- **No Repeated Logins:** Firebase Auth configured with `browserLocalPersistence` plus local session cache (`ganachly_cached_user`).
- **Unified Sign-In Interface:** Single streamlined authentication screen without separate staff/customer toggle tabs.
- **Smart Credential Redirection:**
  - **Atelier Admin:** Logging in with `hardikkush987@gmail.com` and password `anoopritu` automatically redirects to the **Atelier Operations Console** (`#/admin/batches`).
  - **Patron Storefront:** All other credentials authenticate as patrons and redirect directly to the **Menu Storefront** (`#/menu`) to place orders.
- **Google Identity Services:** Integrated Google OAuth and One Tap sign-in.

### 👨‍🍳 3. Atelier Operations Console (`#/admin`)
- **Live Batches & Oven Decks:** Real-time deck telemetry (Decks A, B, C) with stage progression controls (`Prep` ➔ `Baking` ➔ `Cooling` ➔ `Glazed`).
- **Confectionery Catalog Manager:** Add, edit, price-adjust, and toggle stock availability (`In Stock` / `Sold Out`) live to the storefront.
- **Orders & Concierge Dispatch:** Multi-stage Kanban queue for inbound storefront and WhatsApp orders with stage transitions.
- **Couverture Vault & Stocks:** Automated inventory telemetry that deducts Belgian couverture kilogram consumption upon order submission.
- **Patrons Directory:** Real-time database of registered connoisseurs, spend telemetry, and delivery addresses.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Build & Bundler** | [Vite](https://vitejs.dev/) |
| **Frontend Core** | Modern Vanilla JavaScript (ES Modules, reactive state store, hash router) |
| **Styling & Theme** | Tailwind CSS with custom luxury palette (`espresso-deep`, `gold-cream`, `primary-container`) |
| **Typography** | EB Garamond (Editorial quotes), Bebas Neue / Montserrat (Display headlines), Inter |
| **Database** | Google Cloud Firestore (Real-time snapshots with offline multi-tab IndexedDB cache) |
| **Authentication** | Firebase Authentication (Email/Password & Google OAuth) + Google Identity Services (GSI) |
| **Deployment** | Configured for Vercel and Firebase Hosting |

---

## 📁 Project Architecture

```
Ganachly/
├── public/                     # Static public assets
├── src/
│   ├── auth/
│   │   ├── auth.js             # Role helpers & Atelier security gate
│   │   └── googleAuth.js       # Google OAuth JWT decoding & One Tap handler
│   ├── components/
│   │   ├── adminHeader.js      # Atelier console navigation header
│   │   ├── adminSidebar.js     # Atelier operational sidebar
│   │   ├── cartDrawer.js       # Persistent slide-over bag & order checkout
│   │   ├── footer.js           # Luxury brand footer
│   │   ├── header.js           # Storefront navigation bar & live badge
│   │   ├── identityModal.js    # Connoisseur account details modal
│   │   ├── productDetailModal.js# Confectionery specifications modal
│   │   └── toast.js            # Luxury status notification toasts
│   ├── css/
│   │   └── main.css            # Custom CSS scrollbars & animations
│   ├── data/
│   │   └── initialData.js      # Initial seed schemas & delivery zone data
│   ├── pages/
│   │   ├── templates/          # HTML view templates (home, story, gifting)
│   │   ├── adminBatchesPage.js # Live oven decks & hearth production
│   │   ├── adminCatalogPage.js # Confectionery formulary manager
│   │   ├── adminInventoryPage.js # Couverture vault & stock allocations
│   │   ├── adminOrdersPage.js  # Concierge dispatch & orders console
│   │   ├── adminPatronsPage.js # Customer accounts directory
│   │   ├── giftingPage.js      # Luxury & corporate bulk hampers
│   │   ├── homePage.js         # Editorial brand landing page
│   │   ├── loginPage.js        # Unified sign-in with smart role redirect
│   │   ├── menuPage.js         # Dynamic formulations menu
│   │   ├── myOrdersPage.js     # Live patron order tracking
│   │   └── storyPage.js        # Nocturne origin and artisanal craft story
│   ├── services/
│   │   └── firebase.js         # Cloud Firestore & Firebase Auth client SDK
│   ├── state/
│   │   └── store.js            # Central reactive store & Firestore cloud sync
│   └── main.js                 # App entry point, hash router, debounced reactivity
├── firestore.rules             # Production Cloud Firestore security rules
├── firebase.json               # Firebase Hosting configuration
├── vercel.json                 # Vercel single-page rewrite configuration
├── vite.config.js              # Vite configuration
└── package.json                # Project dependencies & scripts
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or later recommended)
- `npm` or `yarn`

### Installation
1. Clone or open the repository folder:
   ```bash
   cd Ganachly
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the local development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:5173` (or the port specified in terminal) in your browser.

---

## 🔑 Operational Credentials

| Portal | Email / ID | Password | Destination |
|---|---|---|---|
| **Master Patissier Admin** | `hardikkush987@gmail.com` | `anoopritu` | `#/admin/batches` (Atelier Console) |
| **Customer Storefront** | Any email | Any password | `#/menu` (Storefront Formulary) |

---

## 📦 Production Build & Deployment

### Build
Generate the production bundle:
```bash
npm run build
```
The optimized output is compiled into the `dist/` directory.

### Preview Production Build
```bash
npm run preview
```

### Deploying to Vercel
The project includes a `vercel.json` configured with SPA fallback rewrites:
```bash
npx vercel
```

### Deploying to Firebase Hosting
```bash
npm run build
firebase deploy --only hosting
```

---

## 🔒 Security & Firestore Rules
The `firestore.rules` file enforces database authorization:
- `orders`: Public creation for storefront patrons; read/update for concierge operations.
- `products`: Publicly readable by storefront patrons; managed via Admin Console.
- `batches`: Real-time hearth kitchen telemetry.
- `users`: User-scoped read/write with admin overview access for `hardikkush987@gmail.com`.

---

## 📜 License
Private & Proprietary — Ganachly Confectionery Atelier. All Rights Reserved.
