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

// Direct page modules for 100% synchronous, bulletproof rendering
import { renderHomePage, attachHomePageEvents } from './pages/homePage.js';
import { renderMenuPage, attachMenuPageEvents } from './pages/menuPage.js';
import { renderStoryPage, attachStoryPageEvents } from './pages/storyPage.js';
import { renderGiftingPage, attachGiftingPageEvents } from './pages/giftingPage.js';
import { renderMyOrdersPage, attachMyOrdersPageEvents } from './pages/myOrdersPage.js';
import { renderAdminBatchesPage, attachAdminBatchesPageEvents } from './pages/adminBatchesPage.js';
import { renderAdminOrdersPage, attachAdminOrdersPageEvents } from './pages/adminOrdersPage.js';
import { renderAdminInventoryPage, attachAdminInventoryPageEvents } from './pages/adminInventoryPage.js';
import { renderAdminCatalogPage, attachAdminCatalogPageEvents } from './pages/adminCatalogPage.js';
import { renderAdminPatronsPage, attachAdminPatronsPageEvents } from './pages/adminPatronsPage.js';
import { renderAdminLoginPage, attachAdminLoginPageEvents } from './pages/adminLoginPage.js';
import { renderLoginPage, attachLoginPageEvents } from './pages/loginPage.js';

// Expose global drawer & modal helpers
window.openCartDrawer = renderCartDrawer;
window.openIdentityModal = renderIdentityModal;
window.openProductDetailModal = openProductDetailModal;
window.showToast = showToast;

/**
 * Main Router & Synchronous Renderer (Guaranteed Instant Rendering)
 */
function renderRoute() {
  const app = document.getElementById('app');
  if (!app) return;

  const rawHash = window.location.hash || '#/';
  const cleanHash = rawHash.split('?')[0].toLowerCase();

  // Scroll to top on page navigation
  window.scrollTo({ top: 0, behavior: 'instant' });

  // 1. ADMIN ROUTES
  if (cleanHash.startsWith('#/admin')) {
    dismissGoogleOneTap();

    // If unauthenticated / not admin, render dedicated Admin Login directly on /admin
    if (!auth.isAdmin()) {
      document.title = 'Admin Login • Ganachly Operations';
      app.innerHTML = renderAdminLoginPage(cleanHash);
      attachAdminLoginPageEvents(cleanHash);
      return;
    }

    // If authenticated as admin and visiting #/admin, #/admin/, or #/admin/login, redirect to batches
    if (cleanHash === '#/admin' || cleanHash === '#/admin/' || cleanHash === '#/admin/login') {
      window.location.hash = '#/admin/batches';
      return;
    }

    let adminPageContent = '';
    let attachEventsFn = null;
    let pageTitle = 'Admin Dashboard';

    if (cleanHash === '#/admin/orders') {
      pageTitle = 'Orders & Dispatch';
      adminPageContent = renderAdminOrdersPage();
      attachEventsFn = attachAdminOrdersPageEvents;
    } else if (cleanHash === '#/admin/patrons' || cleanHash === '#/admin/users') {
      pageTitle = 'Customers & Accounts Directory';
      adminPageContent = renderAdminPatronsPage();
      attachEventsFn = attachAdminPatronsPageEvents;
    } else if (cleanHash === '#/admin/inventory' || cleanHash === '#/admin/inventory-and-couverture-stocks') {
      pageTitle = 'Couverture Vault & Stocks';
      adminPageContent = renderAdminInventoryPage();
      attachEventsFn = attachAdminInventoryPageEvents;
    } else if (cleanHash === '#/admin/catalog' || cleanHash === '#/admin/menu-and-catalog-manager') {
      pageTitle = 'Menu & Catalog Manager';
      adminPageContent = renderAdminCatalogPage();
      attachEventsFn = attachAdminCatalogPageEvents;
    } else if (cleanHash === '#/admin/queue' || cleanHash === '#/admin/kitchen-production-queue') {
      pageTitle = 'Kitchen Production Queue';
      adminPageContent = renderAdminBatchesPage();
      attachEventsFn = attachAdminBatchesPageEvents;
    } else if (cleanHash === '#/admin/zones' || cleanHash === '#/admin/settings-and-delivery-zones') {
      pageTitle = 'Zones & FSSAI Settings';
      adminPageContent = renderAdminInventoryPage();
      attachEventsFn = attachAdminInventoryPageEvents;
    } else {
      // Default admin: batches & core operations
      pageTitle = 'Live Batches & Hearth Operations';
      adminPageContent = renderAdminBatchesPage();
      attachEventsFn = attachAdminBatchesPageEvents;
    }

    document.title = `Ganachly Admin • ${pageTitle}`;

    app.innerHTML = `
      <div class="min-h-screen bg-espresso-deep text-on-surface flex w-full">
        ${renderAdminSidebar(cleanHash)}
        <div class="flex-1 min-w-0 flex flex-col md:pl-72 w-full">
          ${renderAdminHeader()}
          <main class="w-full min-w-0 pt-20 sm:pt-24 px-4 sm:px-6 md:px-8 pb-16 min-h-[calc(100vh-4rem)]">
            ${adminPageContent}
          </main>
        </div>
      </div>
    `;

    // Attach admin layout & page events
    attachAdminSidebarEvents();
    attachAdminHeaderEvents();
    if (attachEventsFn) attachEventsFn();
    return;
  }

  // 2. STOREFRONT ROUTES
  let storefrontPageContent = '';
  let attachStorefrontEventsFn = null;
  let pageTitle = 'Luxury Artisan Eggless Patisserie';

  if (cleanHash === '#/menu') {
    pageTitle = 'Menu & Formulations';
    storefrontPageContent = renderMenuPage();
    attachStorefrontEventsFn = attachMenuPageEvents;
  } else if (cleanHash === '#/story' || cleanHash === '#/our-story') {
    pageTitle = 'Our Story';
    storefrontPageContent = renderStoryPage();
    attachStorefrontEventsFn = attachStoryPageEvents;
  } else if (cleanHash === '#/gifting' || cleanHash === '#/gifting-and-bulk') {
    pageTitle = 'Corporate & Luxury Gifting';
    storefrontPageContent = renderGiftingPage();
    attachStorefrontEventsFn = attachGiftingPageEvents;
  } else if (cleanHash === '#/login' || cleanHash === '#/signin') {
    pageTitle = 'Authentication & Identity Portal';
    storefrontPageContent = renderLoginPage();
    attachStorefrontEventsFn = attachLoginPageEvents;
  } else if (cleanHash === '#/my-orders' || cleanHash === '#/track') {
    pageTitle = 'My Orders';
    storefrontPageContent = renderMyOrdersPage();
    attachStorefrontEventsFn = attachMyOrdersPageEvents;
  } else {
    pageTitle = 'Luxury Artisan Eggless Patisserie';
    storefrontPageContent = renderHomePage();
    attachStorefrontEventsFn = attachHomePageEvents;
  }

  document.title = `Ganachly • ${pageTitle}`;

  app.innerHTML = `
    <div class="min-h-screen bg-surface flex flex-col justify-between">
      ${renderStorefrontHeader(cleanHash)}
      ${storefrontPageContent}
      ${renderStorefrontFooter()}
    </div>
  `;

  attachStorefrontHeaderEvents();
  if (attachStorefrontEventsFn) attachStorefrontEventsFn();
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
