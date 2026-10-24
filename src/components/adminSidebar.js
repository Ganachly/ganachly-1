import { store } from '../state/store.js';

export function renderAdminSidebar(activeRoute = '#/admin/batches') {
  const user = store.getCurrentUser();
  const kpis = store.getKpis();

  const isBatches = activeRoute === '#/admin' || activeRoute === '#/admin/batches';
  const isOrders = activeRoute === '#/admin/orders';
  const isPatrons = activeRoute === '#/admin/patrons' || activeRoute === '#/admin/users';
  const isCatalog = activeRoute === '#/admin/catalog' || activeRoute === '#/admin/menu-and-catalog-manager';
  const isInventory = activeRoute === '#/admin/inventory' || activeRoute === '#/admin/inventory-and-couverture-stocks';
  const isQueue = activeRoute === '#/admin/queue' || activeRoute === '#/admin/kitchen-production-queue';
  const isZones = activeRoute === '#/admin/zones' || activeRoute === '#/admin/settings-and-delivery-zones';

  const activeClass = "bg-primary-container text-on-primary-container font-bold shadow-[0_0_15px_rgba(200,151,58,0.2)]";
  const inactiveClass = "text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface";

  return `
    <aside id="adminSidebar" class="fixed left-0 top-0 h-full w-72 bg-espresso-panel z-50 -translate-x-full md:translate-x-0 transition-transform duration-300 flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.4)] border-r border-primary/10">
      <div class="flex flex-col">
        <!-- Brand Header -->
        <div class="h-16 px-space-lg flex items-center justify-between bg-surface-container-lowest/60 border-b border-primary/10">
          <div class="flex flex-col">
            <span class="font-brittany text-2xl sm:text-3xl tracking-normal text-primary leading-normal pb-0.5 inline-block select-none">Ganachly</span>
            <span class="font-editorial-eyebrow text-editorial-eyebrow text-gold-cream tracking-widest uppercase text-[10px]">Kitchen Operations</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-surface-container-high">
              <span class="w-1.5 h-1.5 rounded-full bg-whatsapp-green animate-pulse"></span>
              <span class="font-label-badge text-label-badge uppercase text-gold-cream">Live</span>
            </div>
            <button id="closeAdminSidebarMobile" class="md:hidden p-1.5 rounded-lg text-on-surface-variant hover:text-gold-cream">
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
        </div>

        <!-- Navigation -->
        <div class="px-space-md py-space-sm">
          <div class="px-space-sm py-2 text-on-surface-variant/60 font-label-badge text-label-badge uppercase tracking-widest">
            Kitchen Management
          </div>
          
          <nav class="flex flex-col gap-1">
            <a href="#/admin/batches" class="flex items-center gap-space-sm px-space-md py-2.5 rounded-xl transition-all ${isBatches ? activeClass : inactiveClass}">
              <span class="material-symbols-outlined text-[19px]">oven_gen</span>
              <span class="font-body-md text-body-md tracking-wide">Live Batches & Core</span>
            </a>

            <a href="#/admin/orders" class="flex items-center justify-between px-space-md py-2.5 rounded-xl transition-all ${isOrders ? activeClass : inactiveClass}">
              <div class="flex items-center gap-space-sm">
                <span class="material-symbols-outlined text-[19px]">receipt_long</span>
                <span class="font-body-md text-body-md tracking-wide">Orders & Dispatch</span>
              </div>
              <span class="px-1.5 py-0.2 rounded-full text-[10px] font-bold ${isOrders ? 'bg-espresso-deep text-gold-cream' : 'bg-primary/20 text-primary'}">
                ${kpis.hearthQueueCount}
              </span>
            </a>

            <a href="#/admin/patrons" class="flex items-center justify-between px-space-md py-2.5 rounded-xl transition-all ${isPatrons ? activeClass : inactiveClass}">
              <div class="flex items-center gap-space-sm">
                <span class="material-symbols-outlined text-[19px]">group</span>
                <span class="font-body-md text-body-md tracking-wide">Customers & Accounts</span>
              </div>
              <span class="px-1.5 py-0.2 rounded-full text-[10px] font-bold ${isPatrons ? 'bg-espresso-deep text-gold-cream' : 'bg-primary/20 text-primary'}">
                ${store.getPatrons().length}
              </span>
            </a>

            <a href="#/admin/catalog" class="flex items-center gap-space-sm px-space-md py-2.5 rounded-xl transition-all ${isCatalog ? activeClass : inactiveClass}">
              <span class="material-symbols-outlined text-[19px]">menu_book</span>
              <span class="font-body-md text-body-md tracking-wide">Menu & Catalog</span>
            </a>

            <a href="#/admin/inventory" class="flex items-center justify-between px-space-md py-2.5 rounded-xl transition-all ${isInventory ? activeClass : inactiveClass}">
              <div class="flex items-center gap-space-sm">
                <span class="material-symbols-outlined text-[19px]">inventory_2</span>
                <span class="font-body-md text-body-md tracking-wide">Couverture Stocks</span>
              </div>
              <span class="text-[10px] font-mono text-gold-cream">${kpis.remainingCouvertureKg}kg</span>
            </a>

          </nav>
        </div>
      </div>

      <!-- Bottom Telemetry & Switcher Card -->
      <div class="p-space-md bg-surface-container-lowest/80 border-t border-primary/10 space-y-2">
        <div class="p-space-sm rounded-xl bg-card-surface/90 flex flex-col gap-1 border border-primary/15">
          <div class="flex items-center justify-between">
            <span class="font-label-badge text-label-badge text-gold-cream uppercase">Belgian Couverture</span>
            <span class="font-label-badge text-label-badge text-primary">70.5% Callebaut</span>
          </div>
          <div class="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden mt-1">
            <div class="bg-primary h-full w-[68%] rounded-full"></div>
          </div>
          <div class="flex items-center justify-between text-on-surface-variant font-body-sm text-[11px] mt-1">
            <span>Temper Vat #2</span>
            <span class="text-gold-light font-bold">${kpis.vatTempC}°C Active</span>
          </div>
        </div>

        <div>
          <a href="#/" class="w-full flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-surface-container-high hover:bg-surface-bright text-gold-cream hover:text-primary transition-all text-xs font-label-action uppercase tracking-wider">
            <span class="material-symbols-outlined text-[16px]">visibility</span>
            <span>View Storefront</span>
          </a>
        </div>
      </div>
    </aside>
    <!-- Mobile Backdrop -->
    <div id="adminSidebarBackdrop" class="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden hidden transition-opacity"></div>
  `;
}

export function attachAdminSidebarEvents() {
  const closeBtn = document.getElementById('closeAdminSidebarMobile');
  const sidebar = document.getElementById('adminSidebar');
  const backdrop = document.getElementById('adminSidebarBackdrop');

  const closeSidebar = () => {
    if (sidebar) sidebar.classList.add('-translate-x-full');
    if (backdrop) backdrop.classList.add('hidden');
  };

  if (closeBtn) closeBtn.onclick = closeSidebar;
  if (backdrop) backdrop.onclick = closeSidebar;

  // Auto-close on mobile when clicking any navigation link
  if (sidebar) {
    sidebar.querySelectorAll('nav a').forEach(link => {
      link.addEventListener('click', () => {
        if (window.innerWidth < 768) {
          closeSidebar();
        }
      });
    });
  }
}
