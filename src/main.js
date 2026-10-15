import './css/main.css';
import { store } from './state/store.js';
import { auth } from './auth/auth.js';
import { initGoogleAuth, dismissGoogleOneTap } from './auth/googleAuth.js';
import { renderStorefrontHeader, attachStorefrontHeaderEvents } from './components/header.js';
import { renderStorefrontFooter } from './components/footer.js';
import { renderAdminSidebar, attachAdminSidebarEvents } from './components/adminSidebar.js';
import { renderAdminHeader, attachAdminHeaderEvents } from './components/adminHeader.js';
import { renderCartDrawer } from './components/cartDrawer.js';
import { renderIdentityModal } from './components/identityModal.js';
import { openProductDetailModal } from './components/productDetailModal.js';
import { showToast } from './components/toast.js';

// Dynamic route loaders for lightning-fast initial page load & code splitting
const pageLoaders = {
  home: () => import('./pages/homePage.js'),
  menu: () => import('./pages/menuPage.js'),
  story: () => import('./pages/storyPage.js'),
  gifting: () => import('./pages/giftingPage.js'),
  login: () => import('./pages/loginPage.js'),
  myOrders: () => import('./pages/myOrdersPage.js'),
  adminOrders: () => import('./pages/adminOrdersPage.js'),
  adminPatrons: () => import('./pages/adminPatronsPage.js'),
  adminInventory: () => import('./pages/adminInventoryPage.js'),
  adminCatalog: () => import('./pages/adminCatalogPage.js'),
  adminBatches: () => import('./pages/adminBatchesPage.js')
};

const moduleCache = new Map();

async function getPageModule(key) {
  if (moduleCache.has(key)) {
    return moduleCache.get(key);
  }
  const loader = pageLoaders[key];
  if (!loader) return null;
  const mod = await loader();
  moduleCache.set(key, mod);
  return mod;
}

// Idle route prefetcher for instant 0ms subsequent navigations
function prefetchCommonRoutes() {
  const common = ['menu', 'home', 'story', 'gifting'];
  const idleFn = window.requestIdleCallback || ((cb) => setTimeout(cb, 400));
  idleFn(() => {
    common.forEach((key) => {
      if (!moduleCache.has(key) && pageLoaders[key]) {
        pageLoaders[key]().then((mod) => moduleCache.set(key, mod)).catch(() => {});
      }
    });
  });
}

// Expose global drawer & modal helpers
window.openCartDrawer = renderCartDrawer;
window.openIdentityModal = renderIdentityModal;
window.openProductDetailModal = openProductDetailModal;
window.showToast = showToast;

/**
 * Main Router & Renderer (Code Split & Instant Cached Transitions)
 */
let currentRenderToken = 0;

async function renderRoute() {
  const app = document.getElementById('app');
  if (!app) return;

  const renderId = ++currentRenderToken;
  const rawHash = window.location.hash || '#/';
  const cleanHash = rawHash.split('?')[0].toLowerCase();

  // Scroll to top on page navigation
  window.scrollTo({ top: 0, behavior: 'instant' });

  // Direct alias for admin login
  if (cleanHash === '#/admin/login') {
    dismissGoogleOneTap();
    window.location.hash = '#/login?tab=admin';
    return;
  }

  // 1. ADMIN ROUTES
  if (cleanHash.startsWith('#/admin')) {
    dismissGoogleOneTap();
    // Permission check (Admin only)
    if (!auth.isAdmin()) {
      document.title = 'Atelier Gate | Ganachly Operations';
      app.innerHTML = auth.renderRestrictedGate(cleanHash);
      auth.setupRestrictedGateEvents();
      return;
    }

    let pageKey = 'adminBatches';
    let pageTitle = 'Atelier Dashboard';

    if (cleanHash === '#/admin/orders') {
      pageTitle = 'Orders & Concierge';
      pageKey = 'adminOrders';
    } else if (cleanHash === '#/admin/patrons' || cleanHash === '#/admin/users') {
      pageTitle = 'Patrons & Accounts Directory';
      pageKey = 'adminPatrons';
    } else if (cleanHash === '#/admin/inventory' || cleanHash === '#/admin/inventory-and-couverture-stocks') {
      pageTitle = 'Couverture Vault & Stocks';
      pageKey = 'adminInventory';
    } else if (cleanHash === '#/admin/catalog' || cleanHash === '#/admin/menu-and-catalog-manager') {
      pageTitle = 'Menu & Catalog Manager';
      pageKey = 'adminCatalog';
    } else if (cleanHash === '#/admin/queue' || cleanHash === '#/admin/kitchen-production-queue') {
      pageTitle = 'Kitchen Production Queue';
      pageKey = 'adminBatches';
    } else if (cleanHash === '#/admin/zones' || cleanHash === '#/admin/settings-and-delivery-zones') {
      pageTitle = 'Zones & FSSAI Settings';
      pageKey = 'adminInventory';
    } else {
      pageTitle = 'Live Batches & Hearth Operations';
      pageKey = 'adminBatches';
    }

    document.title = `Ganachly Atelier • ${pageTitle}`;

    // Load module (instant if in memory cache)
    const mod = await getPageModule(pageKey);
    if (renderId !== currentRenderToken) return; // Stale navigation safeguard

    let adminPageContent = '';
    let attachEventsFn = null;

    if (pageKey === 'adminOrders' && mod) {
      adminPageContent = mod.renderAdminOrdersPage();
      attachEventsFn = mod.attachAdminOrdersPageEvents;
    } else if (pageKey === 'adminPatrons' && mod) {
      adminPageContent = mod.renderAdminPatronsPage();
      attachEventsFn = mod.attachAdminPatronsPageEvents;
    } else if (pageKey === 'adminInventory' && mod) {
      adminPageContent = mod.renderAdminInventoryPage();
      attachEventsFn = mod.attachAdminInventoryPageEvents;
    } else if (pageKey === 'adminCatalog' && mod) {
      adminPageContent = mod.renderAdminCatalogPage();
      attachEventsFn = mod.attachAdminCatalogPageEvents;
    } else if (mod) {
      adminPageContent = mod.renderAdminBatchesPage();
      attachEventsFn = mod.attachAdminBatchesPageEvents;
    }

    app.innerHTML = `
      <div class="min-h-screen bg-espresso-deep text-on-surface flex">
        ${renderAdminSidebar(cleanHash)}
        <div class="flex-1 flex flex-col md:pl-72">
          ${renderAdminHeader()}
          <main class="w-full pt-20 p-3.5 sm:p-5 md:p-space-lg min-h-[calc(100vh-4rem)]">
            ${adminPageContent}
          </main>
        </div>
      </div>
    `;

    attachAdminSidebarEvents();
    attachAdminHeaderEvents();
    if (attachEventsFn) attachEventsFn();
    return;
  }

  // 2. STOREFRONT ROUTES
  let pageKey = 'home';
  let pageTitle = 'Luxury Artisan Eggless Patisserie';

  if (cleanHash === '#/menu') {
    pageTitle = 'Atelier Menu & Formulations';
    pageKey = 'menu';
  } else if (cleanHash === '#/story' || cleanHash === '#/our-story') {
    pageTitle = 'Our Nocturne Story';
    pageKey = 'story';
  } else if (cleanHash === '#/gifting' || cleanHash === '#/gifting-and-bulk') {
    pageTitle = 'Corporate & Luxury Gifting';
    pageKey = 'gifting';
  } else if (cleanHash === '#/login' || cleanHash === '#/signin') {
    pageTitle = 'Authentication & Identity Portal';
    pageKey = 'login';
  } else if (cleanHash === '#/my-orders' || cleanHash === '#/track') {
    pageTitle = 'My Nocturne Orders';
    pageKey = 'myOrders';
  } else {
    pageTitle = 'Luxury Artisan Eggless Patisserie';
    pageKey = 'home';
  }

  document.title = `Ganachly • ${pageTitle}`;

  // Load module (instant if cached)
  const mod = await getPageModule(pageKey);
  if (renderId !== currentRenderToken) return; // Stale navigation safeguard

  let storefrontPageContent = '';
  let attachStorefrontEventsFn = null;

  if (pageKey === 'menu' && mod) {
    storefrontPageContent = mod.renderMenuPage();
    attachStorefrontEventsFn = mod.attachMenuPageEvents;
  } else if (pageKey === 'story' && mod) {
    storefrontPageContent = mod.renderStoryPage();
    attachStorefrontEventsFn = mod.attachStoryPageEvents;
  } else if (pageKey === 'gifting' && mod) {
    storefrontPageContent = mod.renderGiftingPage();
    attachStorefrontEventsFn = mod.attachGiftingPageEvents;
  } else if (pageKey === 'login' && mod) {
    storefrontPageContent = mod.renderLoginPage();
    attachStorefrontEventsFn = mod.attachLoginPageEvents;
  } else if (pageKey === 'myOrders' && mod) {
    storefrontPageContent = mod.renderMyOrdersPage();
    attachStorefrontEventsFn = mod.attachMyOrdersPageEvents;
  } else if (mod) {
    storefrontPageContent = mod.renderHomePage();
    attachStorefrontEventsFn = mod.attachHomePageEvents;
  }

  app.innerHTML = `
    <div class="min-h-screen bg-surface flex flex-col justify-between">
      ${renderStorefrontHeader(cleanHash)}
      ${storefrontPageContent}
      ${renderStorefrontFooter()}
    </div>
  `;

  attachStorefrontHeaderEvents();
  if (attachStorefrontEventsFn) attachStorefrontEventsFn();

  // Prefetch other storefront pages in background for zero-latency subsequent clicks
  prefetchCommonRoutes();
}

// Global page refresher for mutations
window.refreshCurrentPage = () => {
  renderRoute();
};

// Re-render when route changes
window.addEventListener('hashchange', renderRoute);

// Listen to state store mutations (cross-tab sync & in-tab updates)
let reRenderDebounceTimer = null;
store.subscribe((event) => {
  // Update header cart badge without full re-render if present
  const badge = document.getElementById('headerCartBadge');
  if (badge) {
    badge.textContent = store.getCartCount();
  }

  // Smoothly refresh admin or tracking page, but protect active user interactions
  const hash = window.location.hash || '';
  if (hash.startsWith('#/admin') || hash === '#/my-orders') {
    // Check if user is currently interacting with an open modal or active form input
    const isModalOpen = document.querySelector('#product-modal.flex') || 
                        document.querySelector('#productModalBackdrop') ||
                        document.querySelector('#confirmationBackdrop') ||
                        document.querySelector('#identityModalBackdrop') ||
                        document.querySelector('#newBatchBackdrop') ||
                        document.querySelector('#batchModalContainer > div');
    const isUserTyping = document.activeElement && 
                         (document.activeElement.tagName === 'INPUT' || 
                          document.activeElement.tagName === 'TEXTAREA' || 
                          document.activeElement.tagName === 'SELECT');

    if (isModalOpen || isUserTyping) {
      // Don't disrupt active user interaction
      return;
    }

    if (reRenderDebounceTimer) clearTimeout(reRenderDebounceTimer);
    reRenderDebounceTimer = setTimeout(() => {
      renderRoute();
    }, 200);
  }
});

// Single guarded initial boot
let hasBooted = false;
function boot() {
  if (hasBooted) return;
  hasBooted = true;
  renderRoute();
  initGoogleAuth();
}

if (document.readyState === 'complete' || document.readyState === 'interactive') {
  boot();
} else {
  document.addEventListener('DOMContentLoaded', boot);
}
