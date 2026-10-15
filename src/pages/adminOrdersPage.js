import { store } from '../state/store.js';
import { showToast } from '../components/toast.js';

const STAGES = [
  { key: 'new',       label: 'New Inbound',  color: 'text-on-surface-variant bg-surface-container' },
  { key: 'prep',      label: 'Cold Prep',    color: 'text-on-surface bg-surface-container-high' },
  { key: 'oven',      label: 'In Oven',      color: 'text-badge-weekend bg-badge-weekend/20' },
  { key: 'sliced',    label: 'Sliced',       color: 'text-secondary bg-secondary/20' },
  { key: 'boxed',     label: 'Boxed',        color: 'text-secondary bg-secondary/20' },
  { key: 'dispatch',  label: 'Dispatched',   color: 'text-primary bg-primary/20' },
  { key: 'completed', label: 'Delivered',    color: 'text-whatsapp-green bg-whatsapp-green/20' },
];

let currentFilters = {
  stage: 'all',
  channel: 'all',
  search: '',
};

function getFilteredOrders() {
  let orders = store.getOrders();
  if (currentFilters.stage !== 'all') {
    orders = orders.filter(o => o.stage === currentFilters.stage);
  }
  if (currentFilters.channel !== 'all') {
    orders = orders.filter(o => o.channel === currentFilters.channel);
  }
  if (currentFilters.search.trim()) {
    const q = currentFilters.search.toLowerCase();
    orders = orders.filter(o =>
      (o.id || '').toLowerCase().includes(q) ||
      (o.customerName || '').toLowerCase().includes(q) ||
      (o.items || []).some(i => (i.title || '').toLowerCase().includes(q))
    );
  }
  return orders.sort((a, b) => {
    const timeB = new Date(b.placedAt || b.timestamp || 0).getTime();
    const timeA = new Date(a.placedAt || a.timestamp || 0).getTime();
    return timeB - timeA;
  });
}

function renderOrderRow(order) {
  const stageObj = STAGES.find(s => s.key === order.stage) || STAGES[0];
  const channelIcon = order.channel === 'whatsapp' ? 'chat' : 'laptop';
  const itemSummary = (order.items || []).map(i => `${i.qty}x ${i.title}`).join(', ');
  const orderDate = new Date(order.placedAt || order.timestamp || Date.now());
  const elapsed = isNaN(orderDate.getTime()) ? 0 : Math.max(0, Math.round((Date.now() - orderDate.getTime()) / 60000));
  const elapsedStr = elapsed < 1 ? 'Just now' : (elapsed < 60 ? `${elapsed}m ago` : `${Math.floor(elapsed / 60)}h ago`);

  return `
    <div class="order-row flex flex-col sm:grid sm:grid-cols-[auto_1fr_auto_auto_auto] items-stretch sm:items-center gap-2.5 sm:gap-3 p-3 sm:px-4 sm:py-3 rounded-xl bg-card-surface/80 border border-outline-variant/20 hover:bg-surface-container-high transition-all group" data-order-id="${order.id}">
      
      <!-- Top Section on Mobile (Channel + ID + Customer + Price) -->
      <div class="flex items-center justify-between sm:contents">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center flex-shrink-0">
            <span class="material-symbols-outlined text-primary text-[16px]">${channelIcon}</span>
          </div>
          <div class="flex flex-col">
            <span class="font-body-sm text-[11px] font-mono text-primary font-bold">#${order.id}</span>
            <span class="text-[10px] text-on-surface-variant">${elapsedStr}</span>
          </div>
        </div>

        <div class="sm:hidden text-right">
          <span class="font-label-price text-sm font-bold text-primary">₹${order.total}</span>
          <span class="text-[10px] text-on-surface-variant capitalize block">${order.paymentMethod || 'UPI'}</span>
        </div>
      </div>

      <!-- Customer + Items -->
      <div class="min-w-0 flex-1">
        <div class="flex items-center gap-2">
          <span class="font-body-md text-sm sm:text-body-md font-bold text-on-surface truncate">${order.customerName}</span>
          <span class="text-[10px] text-gold-light/80 font-mono sm:hidden">• ${order.zone || 'Faridabad'}</span>
          <span class="hidden lg:block text-[10px] text-on-surface-variant font-mono">${order.zone || '—'}</span>
        </div>
        <p class="text-[11px] text-on-surface-variant truncate mt-0.5">${itemSummary || '—'}</p>
      </div>

      <!-- Total (Desktop) -->
      <div class="hidden sm:flex flex-col items-end">
        <span class="font-label-price text-sm font-bold text-primary">₹${order.total}</span>
        <span class="text-[10px] text-on-surface-variant capitalize">${order.paymentMethod || 'UPI'}</span>
      </div>

      <!-- Bottom Controls on Mobile (Stage badge + selector + Actions) -->
      <div class="flex items-center justify-between sm:justify-start gap-2 pt-2 sm:pt-0 border-t border-primary/10 sm:border-0">
        <div class="flex items-center gap-1.5 flex-1 sm:flex-initial">
          <span class="px-2 py-0.5 rounded-full text-[9px] font-label-badge uppercase font-bold ${stageObj.color} whitespace-nowrap hidden sm:inline-block">
            ${stageObj.label}
          </span>
          <select class="order-stage-select bg-surface-container-low text-gold-cream text-xs rounded-lg px-2 py-1.5 focus:outline-none cursor-pointer border border-outline-variant/20 w-full sm:w-auto" data-order-id="${order.id}">
            ${STAGES.map(s => `<option value="${s.key}" ${order.stage === s.key ? 'selected' : ''}>${s.label}</option>`).join('')}
          </select>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-1.5">
          <button class="btn-print-slip p-1.5 rounded-lg bg-surface-container hover:bg-surface-bright text-on-surface-variant hover:text-primary transition-all flex items-center gap-1 text-xs" data-order-id="${order.id}" title="Print kitchen slip">
            <span class="material-symbols-outlined text-[16px]">print</span>
            <span class="sm:hidden text-[10px] uppercase font-label-badge">Slip</span>
          </button>
        </div>
      </div>

    </div>
  `;
}

export function renderAdminOrdersPage() {
  const orders = store.getOrders();
  const filtered = getFilteredOrders();

  const countByStage = (stage) => orders.filter(o => o.stage === stage).length;

  return `
    <div class="flex flex-col w-full gap-space-lg">

      <!-- PAGE HEADER -->
      <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-space-sm">
        <div>
          <span class="font-editorial-eyebrow text-editorial-eyebrow text-primary uppercase tracking-widest text-[11px]">Nocturne Operations</span>
          <h1 class="font-headline-lg text-headline-lg text-gold-light mt-1">Orders Dispatch Console</h1>
          <p id="orders-subtitle-count" class="font-body-md text-body-md text-on-surface-variant text-sm mt-0.5">${orders.length} total orders · ${orders.filter(o => o.stage !== 'completed').length} in progress</p>
        </div>
        <div class="flex items-center gap-2">
          <button id="btn-sync-cloud-orders" class="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container text-primary hover:text-gold-light hover:bg-surface-container-high transition-all text-xs font-label-action uppercase tracking-wider" title="Fetch latest orders from Firebase Firestore">
            <span class="material-symbols-outlined text-[16px]">cloud_sync</span>
            <span>Sync Cloud</span>
          </button>
          ${orders.length > 0 ? `
            <button id="btn-clear-all-orders" class="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container text-red-400 hover:text-red-300 hover:bg-surface-container-high transition-all text-xs font-label-action uppercase tracking-wider">
              <span class="material-symbols-outlined text-[16px]">delete_sweep</span>
              <span>Clear Orders</span>
            </button>
          ` : ''}
        </div>
      </div>

      <!-- STAGE SUMMARY PILLS -->
      <div id="stage-filter-pills-container" class="flex flex-wrap gap-2">
        <button class="stage-filter-pill px-3 py-1.5 rounded-full font-label-badge text-label-badge text-[10px] uppercase tracking-widest transition-all ${currentFilters.stage === 'all' ? 'bg-primary text-espresso-deep' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}" data-stage="all">
          All <span class="ml-1 opacity-70">${orders.length}</span>
        </button>
        ${STAGES.map(s => `
          <button class="stage-filter-pill px-3 py-1.5 rounded-full font-label-badge text-label-badge text-[10px] uppercase tracking-widest transition-all ${currentFilters.stage === s.key ? 'bg-primary text-espresso-deep' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}" data-stage="${s.key}">
            ${s.label} <span class="ml-1 opacity-70">${countByStage(s.key)}</span>
          </button>
        `).join('')}
      </div>

      <!-- SEARCH + CHANNEL FILTER BAR -->
      <div class="flex flex-wrap items-center gap-space-sm p-space-md bg-espresso-panel rounded-xl border border-primary/10">
        <div class="flex-1 min-w-[200px] relative">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-on-surface-variant">search</span>
          <input id="orders-search" type="text" value="${currentFilters.search}" placeholder="Search order ID, customer, or item…" 
            class="w-full pl-9 pr-4 py-2 rounded-lg bg-surface-container text-on-surface text-sm font-body-md focus:outline-none focus:ring-2 focus:ring-primary/50 border border-outline-variant/20 placeholder-on-surface-variant/50">
        </div>
        <select id="orders-channel-filter" class="bg-surface-container text-gold-cream text-sm rounded-lg px-3 py-2 focus:outline-none border border-outline-variant/20">
          <option value="all" ${currentFilters.channel === 'all' ? 'selected' : ''}>All Channels</option>
          <option value="whatsapp" ${currentFilters.channel === 'whatsapp' ? 'selected' : ''}>WhatsApp Direct</option>
          <option value="web" ${currentFilters.channel === 'web' ? 'selected' : ''}>Web Storefront</option>
        </select>
        <button id="orders-export-csv" class="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container text-on-surface-variant text-xs font-label-action uppercase tracking-wider hover:bg-surface-container-high transition-all">
          <span class="material-symbols-outlined text-[16px]">download</span>
          Export CSV
        </button>
      </div>

      <!-- ORDERS LIST -->
      <div class="flex flex-col gap-2" id="orders-list-container">
        ${filtered.length === 0 ? `
          <div class="text-center py-16 bg-espresso-panel rounded-xl border border-primary/10 flex flex-col items-center justify-center p-6">
            <div class="w-16 h-16 rounded-full bg-card-surface border border-primary/20 flex items-center justify-center text-primary mb-3">
              <span class="material-symbols-outlined text-[32px]">receipt_long</span>
            </div>
            <h3 class="font-headline-sm text-headline-sm text-gold-cream uppercase tracking-wider">
              ${orders.length === 0 ? 'No Orders in Queue' : 'No Matching Orders'}
            </h3>
            <p class="text-on-surface-variant font-body-md text-xs mt-1 max-w-sm">
              ${orders.length === 0 
                ? 'Queue is clean. Orders placed by customers on the storefront or logged from WhatsApp will stream here in real time.' 
                : 'No orders match your active filter or search criteria.'}
            </p>
          </div>
        ` : filtered.map(renderOrderRow).join('')}
      </div>

    </div>
  `;
}

export function attachAdminOrdersPageEvents() {
  function attachRowEvents() {
    // Stage selects on rows
    document.querySelectorAll('.order-stage-select').forEach(sel => {
      sel.onchange = () => {
        const orderId = sel.getAttribute('data-order-id');
        store.updateOrderStatus(orderId, sel.value);
        showToast(`Order #${orderId} → ${sel.value}`, 'check_circle');
        window.refreshCurrentPage();
      };
    });

    // Print slip
    document.querySelectorAll('.btn-print-slip').forEach(btn => {
      btn.onclick = () => {
        const orderId = btn.getAttribute('data-order-id');
        const order = store.getOrders().find(o => o.id === orderId);
        if (!order) return;
        const formattedDate = new Date(order.placedAt || order.timestamp || Date.now()).toLocaleString();
        const win = window.open('', '_blank', 'width=380,height=600');
        if (!win) return;
        win.document.write(`
          <html><head><title>Kitchen Slip #${order.id}</title>
          <style>
            body { font-family: monospace; font-size: 13px; padding: 16px; }
            h2 { font-size: 16px; border-bottom: 2px solid #000; pb: 8px; }
            .row { display: flex; justify-content: space-between; }
          </style>
          </head><body>
          <h2>GANACHLY KITCHEN SLIP</h2>
          <p>#${order.id} · ${formattedDate}</p>
          <p><strong>Customer:</strong> ${order.customerName}</p>
          <p><strong>Zone:</strong> ${order.zone || 'N/A'}</p>
          <hr/>
          ${(order.items || []).map(i => `<div class="row"><span>${i.qty}x ${i.title}</span><span>₹${i.price * i.qty}</span></div>`).join('')}
          <hr/>
          <div class="row"><strong>TOTAL</strong><strong>₹${order.total}</strong></div>
          <p>Payment: ${order.paymentMethod || 'UPI'}</p>
          <script>window.print(); window.close();</script>
          </body></html>
        `);
      };
    });
  }

  function refreshOrdersList() {
    const listContainer = document.getElementById('orders-list-container');
    if (listContainer) {
      const filtered = getFilteredOrders();
      listContainer.innerHTML = filtered.length === 0 ? `
        <div class="text-center py-16 bg-espresso-panel rounded-xl border border-primary/10 flex flex-col items-center justify-center p-6">
          <div class="w-16 h-16 rounded-full bg-card-surface border border-primary/20 flex items-center justify-center text-primary mb-3">
            <span class="material-symbols-outlined text-[32px]">receipt_long</span>
          </div>
          <h3 class="font-headline-sm text-headline-sm text-gold-cream uppercase tracking-wider">
            No Matching Orders
          </h3>
          <p class="text-on-surface-variant font-body-md text-xs mt-1 max-w-sm">
            No orders match your active filter or search criteria.
          </p>
        </div>
      ` : filtered.map(renderOrderRow).join('');
      attachRowEvents();
    }
  }

  function updateHeaderStats() {
    const orders = store.getOrders();
    const countByStage = (stage) => orders.filter(o => o.stage === stage).length;
    
    const countSub = document.getElementById('orders-subtitle-count');
    if (countSub) {
      countSub.textContent = `${orders.length} total orders · ${orders.filter(o => o.stage !== 'completed').length} in progress`;
    }

    const pillsContainer = document.getElementById('stage-filter-pills-container');
    if (pillsContainer) {
      pillsContainer.innerHTML = `
        <button class="stage-filter-pill px-3 py-1.5 rounded-full font-label-badge text-label-badge text-[10px] uppercase tracking-widest transition-all ${currentFilters.stage === 'all' ? 'bg-primary text-espresso-deep' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}" data-stage="all">
          All <span class="ml-1 opacity-70">${orders.length}</span>
        </button>
        ${STAGES.map(s => `
          <button class="stage-filter-pill px-3 py-1.5 rounded-full font-label-badge text-label-badge text-[10px] uppercase tracking-widest transition-all ${currentFilters.stage === s.key ? 'bg-primary text-espresso-deep' : 'bg-surface-container text-on-surface-variant hover:bg-surface-container-high'}" data-stage="${s.key}">
            ${s.label} <span class="ml-1 opacity-70">${countByStage(s.key)}</span>
          </button>
        `).join('')}
      `;
      attachPillEvents();
    }
  }

  function attachPillEvents() {
    document.querySelectorAll('.stage-filter-pill').forEach(pill => {
      pill.onclick = () => {
        currentFilters.stage = pill.getAttribute('data-stage');
        refreshOrdersList();
        updateHeaderStats();
      };
    });
  }

  // Initial attach of rows and pills
  attachRowEvents();
  attachPillEvents();

  // Subscribe to real-time order placements and Firebase sync
  store.subscribe(() => {
    refreshOrdersList();
    updateHeaderStats();
  });

  // Sync Cloud button
  const syncBtn = document.getElementById('btn-sync-cloud-orders');
  if (syncBtn) {
    syncBtn.onclick = async () => {
      syncBtn.disabled = true;
      syncBtn.innerHTML = `<span class="material-symbols-outlined text-[16px] animate-spin">sync</span><span>Syncing...</span>`;
      try {
        await store.refreshOrdersFromFirebase();
        showToast('Orders synced with Firebase', 'cloud_done');
      } catch (e) {
        showToast('Sync updated local queue', 'cloud_done');
      } finally {
        syncBtn.disabled = false;
        syncBtn.innerHTML = `<span class="material-symbols-outlined text-[16px]">cloud_sync</span><span>Sync Cloud</span>`;
        refreshOrdersList();
        updateHeaderStats();
      }
    };
  }

  // Search without losing input focus
  const searchEl = document.getElementById('orders-search');
  if (searchEl) {
    searchEl.oninput = () => {
      currentFilters.search = searchEl.value;
      refreshOrdersList();
    };
  }

  // Channel filter
  const channelEl = document.getElementById('orders-channel-filter');
  if (channelEl) {
    channelEl.onchange = () => {
      currentFilters.channel = channelEl.value;
      refreshOrdersList();
    };
  }

  // CSV Export
  const exportBtn = document.getElementById('orders-export-csv');
  if (exportBtn) {
    exportBtn.onclick = () => {
      const orders = store.getOrders();
      const rows = [
        ['Order ID', 'Customer', 'Zone', 'Items', 'Total', 'Stage', 'Channel', 'Placed At'],
        ...orders.map(o => [
          o.id, o.customerName, o.zone || '',
          (o.items || []).map(i => `${i.qty}x ${i.title}`).join(' | '),
          o.total, o.stage, o.channel || 'web', o.placedAt
        ])
      ];
      const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'ganachly_orders.csv';
      a.click();
      showToast('Orders exported as CSV', 'download');
    };
  }

  // Clear all orders
  const clearOrdersBtn = document.getElementById('btn-clear-all-orders');
  if (clearOrdersBtn) {
    clearOrdersBtn.onclick = () => {
      if (confirm('Clear all orders from the queue?')) {
        store.clearAllOrders();
        showToast('All orders cleared from queue', 'delete_sweep');
        window.refreshCurrentPage();
      }
    };
  }
}
