import { store } from '../state/store.js';
import { showToast } from '../components/toast.js';

let patronFilters = {
  search: '',
  role: 'all',
  zone: 'all'
};

function getFilteredPatrons() {
  const allUsers = store.getPatrons();
  const orders = store.getOrders();

  // Combine users registered directly and customers inferred from orders
  const patronMap = new Map();

  allUsers.forEach(u => {
    if (u && (u.id || u.email) && !u.id?.includes('guest')) {
      patronMap.set(u.id || u.email, {
        ...u,
        source: 'registered'
      });
    }
  });

  // Also include customers who placed orders but might not have created a separate account
  orders.forEach(o => {
    const key = o.customerEmail || o.customerId || o.customerName;
    if (key && !key.includes('guest')) {
      if (!patronMap.has(key)) {
        patronMap.set(key, {
          id: o.customerEmail || key,
          email: o.customerEmail || key,
          name: o.customerName || 'Order Patron',
          role: 'customer',
          avatar: '🛍️',
          phone: o.phone || '',
          zone: o.zone || 'Faridabad',
          address: o.address || '',
          code: o.customerId || 'CUST',
          lastSeenAt: o.timestamp || Date.now(),
          source: 'order'
        });
      }
    }
  });

  let patrons = Array.from(patronMap.values());

  if (patronFilters.role !== 'all') {
    patrons = patrons.filter(p => p.role === patronFilters.role);
  }

  if (patronFilters.zone !== 'all') {
    patrons = patrons.filter(p => (p.zone || '').toLowerCase().includes(patronFilters.zone.toLowerCase()));
  }

  if (patronFilters.search.trim()) {
    const q = patronFilters.search.toLowerCase();
    patrons = patrons.filter(p =>
      (p.name || '').toLowerCase().includes(q) ||
      (p.email || p.id || '').toLowerCase().includes(q) ||
      (p.phone || '').toLowerCase().includes(q) ||
      (p.code || '').toLowerCase().includes(q)
    );
  }

  return patrons;
}

function renderPatronRow(patron) {
  const patronOrders = store.getOrdersForCustomer(patron.id || patron.email);
  const totalSpent = patronOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const isAdmin = patron.role === 'admin';
  const lastActiveDate = patron.lastSeenAt ? new Date(patron.lastSeenAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Recent';

  return `
    <div class="patron-row grid grid-cols-1 md:grid-cols-[auto_1fr_auto_auto_auto] items-center gap-4 p-4 rounded-xl bg-card-surface/90 border border-outline-variant/20 hover:border-primary/40 transition-all shadow-md group">
      <!-- Avatar & Code -->
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-xl bg-surface-container-high border border-primary/30 flex items-center justify-center text-2xl flex-shrink-0 shadow-inner group-hover:scale-105 transition-transform">
          ${patron.avatar || (isAdmin ? '👨‍🍳' : '🍫')}
        </div>
        <div class="flex flex-col md:hidden">
          <span class="font-body-md font-bold text-on-surface">${patron.name}</span>
          <span class="text-xs text-on-surface-variant font-mono">${patron.email || patron.id}</span>
        </div>
      </div>

      <!-- Identity Details -->
      <div class="hidden md:flex flex-col min-w-0">
        <div class="flex items-center gap-2">
          <span class="font-body-md text-sm font-bold text-on-surface truncate">${patron.name}</span>
          <span class="px-2 py-0.2 rounded-full text-[9px] font-label-badge uppercase font-bold ${isAdmin ? 'bg-primary text-espresso-deep' : 'bg-secondary text-espresso-deep'}">
            ${patron.role || 'customer'}
          </span>
          <span class="text-[10px] font-mono text-primary font-semibold">${patron.code || 'GAN-CUST'}</span>
        </div>
        <div class="flex items-center gap-3 text-xs text-on-surface-variant mt-0.5">
          <span class="font-mono text-[11px] truncate">${patron.email || patron.id}</span>
          ${patron.phone ? `<span>• ${patron.phone}</span>` : ''}
          ${patron.zone ? `<span>• 📍 ${patron.zone}</span>` : ''}
        </div>
      </div>

      <!-- Order History Count -->
      <div class="flex flex-col items-start md:items-center">
        <span class="text-[10px] font-label-badge uppercase text-on-surface-variant">Orders</span>
        <span class="font-mono font-bold text-gold-cream text-sm">${patronOrders.length}</span>
      </div>

      <!-- Total Spend -->
      <div class="flex flex-col items-start md:items-end">
        <span class="text-[10px] font-label-badge uppercase text-on-surface-variant">Total Spend</span>
        <span class="font-label-price text-sm font-bold text-primary">₹${totalSpent}</span>
      </div>

      <!-- Last Active & Auth Badge -->
      <div class="flex items-center gap-2 justify-end">
        <div class="text-right hidden lg:block">
          <span class="text-[10px] text-on-surface-variant/70 block">Last Active</span>
          <span class="text-xs font-mono text-gold-cream">${lastActiveDate}</span>
        </div>
        ${patron.phone && !patron.phone.includes('WhatsApp Direct') ? `
          <a href="https://wa.me/${patron.phone.replace(/[^0-9]/g, '')}" target="_blank" rel="noopener" 
            class="p-2 rounded-lg bg-whatsapp-green/20 text-whatsapp-green hover:bg-whatsapp-green hover:text-espresso-deep transition-all" title="Message on WhatsApp">
            <span class="material-symbols-outlined text-[16px]">chat</span>
          </a>
        ` : ''}
      </div>
    </div>
  `;
}

export function renderAdminPatronsPage() {
  const patrons = getFilteredPatrons();
  const allUsers = store.getPatrons();
  const orders = store.getOrders();

  const totalPatronsCount = patrons.length;
  const customersWithOrders = patrons.filter(p => store.getOrdersForCustomer(p.id || p.email).length > 0).length;

  return `
    <div class="flex flex-col w-full gap-space-lg">

      <!-- PAGE HEADER -->
      <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-space-sm p-5 rounded-2xl bg-espresso-panel border border-primary/15 shadow-xl">
        <div>
          <span class="font-editorial-eyebrow text-editorial-eyebrow text-primary uppercase tracking-widest text-[11px]">Authentication & Identity Directory</span>
          <h1 class="font-headline-lg text-headline-lg text-gold-light mt-1">Customers & Registered Accounts</h1>
          <p id="patrons-subtitle-count" class="font-body-md text-body-md text-on-surface-variant text-sm mt-0.5">
            ${totalPatronsCount} registered customer profiles synced with Firebase Firestore.
          </p>
        </div>
        <div class="flex items-center gap-2">
          <button id="btn-sync-cloud-patrons" class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary hover:bg-gold-light text-espresso-deep font-label-action text-xs uppercase tracking-wider font-bold transition-all shadow-sm active:scale-95">
            <span class="material-symbols-outlined text-[16px]">cloud_sync</span>
            <span>Sync Cloud Customers</span>
          </button>
        </div>
      </div>

      <!-- 3 TELEMETRY CARDS -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="p-4 rounded-xl bg-card-surface border border-outline-variant/20 shadow-md flex items-center justify-between">
          <div>
            <span class="text-[11px] font-label-badge uppercase tracking-wider text-on-surface-variant block">Total Customers</span>
            <span class="font-headline-lg text-3xl text-gold-cream font-bold mt-1 block">${totalPatronsCount}</span>
            <span class="text-[11px] text-primary mt-0.5 block">Registered profiles in Firebase</span>
          </div>
          <div class="w-11 h-11 rounded-xl bg-surface-container flex items-center justify-center text-primary border border-primary/20">
            <span class="material-symbols-outlined text-[22px]">group</span>
          </div>
        </div>

        <div class="p-4 rounded-xl bg-card-surface border border-outline-variant/20 shadow-md flex items-center justify-between">
          <div>
            <span class="text-[11px] font-label-badge uppercase tracking-wider text-on-surface-variant block">Active Ordering Customers</span>
            <span class="font-headline-lg text-3xl text-gold-cream font-bold mt-1 block">${customersWithOrders}</span>
            <span class="text-[11px] text-whatsapp-green mt-0.5 block">Placed orders with us</span>
          </div>
          <div class="w-11 h-11 rounded-xl bg-surface-container flex items-center justify-center text-whatsapp-green border border-whatsapp-green/20">
            <span class="material-symbols-outlined text-[22px]">loyalty</span>
          </div>
        </div>

        <div class="p-4 rounded-xl bg-card-surface border border-outline-variant/20 shadow-md flex items-center justify-between">
          <div>
            <span class="text-[11px] font-label-badge uppercase tracking-wider text-on-surface-variant block">Cloud Auth Engine</span>
            <span class="font-headline-lg text-xl text-gold-light font-bold mt-2 block flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full bg-whatsapp-green animate-pulse"></span>
              <span>Firestore Sync</span>
            </span>
            <span class="text-[11px] text-on-surface-variant mt-0.5 block">Collection: users</span>
          </div>
          <div class="w-11 h-11 rounded-xl bg-surface-container flex items-center justify-center text-primary border border-primary/20">
            <span class="material-symbols-outlined text-[22px]">security</span>
          </div>
        </div>
      </div>

      <!-- SEARCH & FILTER BAR -->
      <div class="flex flex-wrap items-center gap-space-sm p-space-md bg-espresso-panel rounded-xl border border-primary/10">
        <div class="flex-1 min-w-[220px] relative">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">search</span>
          <input id="patrons-search" type="text" value="${patronFilters.search}" placeholder="Search customer by name, email, phone, or code…" 
            class="w-full pl-9 pr-4 py-2 rounded-lg bg-surface-container text-on-surface text-sm font-body-md focus:outline-none focus:ring-2 focus:ring-primary/50 border border-outline-variant/20 placeholder-on-surface-variant/50">
        </div>

        <select id="patrons-role-filter" class="bg-surface-container text-gold-cream text-sm rounded-lg px-3 py-2 focus:outline-none border border-outline-variant/20">
          <option value="all" ${patronFilters.role === 'all' ? 'selected' : ''}>All Roles</option>
          <option value="customer" ${patronFilters.role === 'customer' ? 'selected' : ''}>Customers</option>
          <option value="admin" ${patronFilters.role === 'admin' ? 'selected' : ''}>Master Patissier / Admins</option>
        </select>
      </div>

      <!-- PATRONS LIST CONTAINER -->
      <div class="flex flex-col gap-2.5" id="patrons-list-container">
        ${patrons.length === 0 ? `
          <div class="text-center py-16 bg-espresso-panel rounded-xl border border-primary/10 flex flex-col items-center justify-center p-6">
            <div class="w-16 h-16 rounded-full bg-card-surface border border-primary/20 flex items-center justify-center text-primary mb-3">
              <span class="material-symbols-outlined text-[32px]">person_search</span>
            </div>
            <h3 class="font-headline-sm text-headline-sm text-gold-cream uppercase tracking-wider">
              No Customers Found
            </h3>
            <p class="text-on-surface-variant font-body-md text-xs mt-1 max-w-sm">
              As customers authenticate or place orders on the storefront, their profiles will automatically stream here.
            </p>
          </div>
        ` : patrons.map(renderPatronRow).join('')}
      </div>

    </div>
  `;
}

export function attachAdminPatronsPageEvents() {
  function refreshPatronsList() {
    const container = document.getElementById('patrons-list-container');
    if (container) {
      const filtered = getFilteredPatrons();
      container.innerHTML = filtered.length === 0 ? `
        <div class="text-center py-16 bg-espresso-panel rounded-xl border border-primary/10 flex flex-col items-center justify-center p-6">
          <div class="w-16 h-16 rounded-full bg-card-surface border border-primary/20 flex items-center justify-center text-primary mb-3">
            <span class="material-symbols-outlined text-[32px]">person_search</span>
          </div>
          <h3 class="font-headline-sm text-headline-sm text-gold-cream uppercase tracking-wider">
            No Customers Found
          </h3>
          <p class="text-on-surface-variant font-body-md text-xs mt-1 max-w-sm">
            No customers match your search filter.
          </p>
        </div>
      ` : filtered.map(renderPatronRow).join('');
    }

    const countSub = document.getElementById('patrons-subtitle-count');
    if (countSub) {
      const filtered = getFilteredPatrons();
      countSub.textContent = `${filtered.length} authenticated customer profiles synced with Firebase Firestore.`;
    }
  }

  // Search input without losing focus
  const searchEl = document.getElementById('patrons-search');
  if (searchEl) {
    searchEl.oninput = () => {
      patronFilters.search = searchEl.value;
      refreshPatronsList();
    };
  }

  // Role filter
  const roleEl = document.getElementById('patrons-role-filter');
  if (roleEl) {
    roleEl.onchange = () => {
      patronFilters.role = roleEl.value;
      refreshPatronsList();
    };
  }

  // Sync Cloud Patrons button
  const syncBtn = document.getElementById('btn-sync-cloud-patrons');
  if (syncBtn) {
    syncBtn.onclick = async () => {
      syncBtn.disabled = true;
      syncBtn.innerHTML = `<span class="material-symbols-outlined text-[16px] animate-spin">sync</span><span>Syncing...</span>`;
      try {
        await store.refreshUsersFromFirebase();
        showToast('Customer profiles synced from Firebase', 'cloud_done');
      } catch (e) {
        showToast('Local customers updated', 'cloud_done');
      } finally {
        syncBtn.disabled = false;
        syncBtn.innerHTML = `<span class="material-symbols-outlined text-[16px]">cloud_sync</span><span>Sync Cloud Customers</span>`;
        refreshPatronsList();
      }
    };
  }

  // Subscribe to real-time updates
  store.subscribe(() => {
    refreshPatronsList();
  });
}
