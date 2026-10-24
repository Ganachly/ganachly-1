import { store } from '../state/store.js';
import { showToast } from '../components/toast.js';

let giftingFilters = {
  search: '',
  status: 'all'
};

function getFilteredGiftingRequests() {
  let requests = store.getGiftingRequests();

  if (giftingFilters.status !== 'all') {
    requests = requests.filter(r => (r.status || 'New').toLowerCase() === giftingFilters.status.toLowerCase());
  }

  if (giftingFilters.search.trim()) {
    const q = giftingFilters.search.toLowerCase();
    requests = requests.filter(r =>
      (r.fullName || '').toLowerCase().includes(q) ||
      (r.companyOccasion || '').toLowerCase().includes(q) ||
      (r.whatsappNumber || '').toLowerCase().includes(q) ||
      (r.deliveryLocations || '').toLowerCase().includes(q) ||
      (r.flavorPreferences || '').toLowerCase().includes(q)
    );
  }

  return requests;
}

function getStatusBadge(status) {
  const s = (status || 'New').toLowerCase();
  if (s === 'new') {
    return `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-primary text-espresso-deep shadow-sm animate-pulse">
      <span class="w-1.5 h-1.5 rounded-full bg-espresso-deep"></span>
      NEW
    </span>`;
  } else if (s === 'contacted') {
    return `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400 border border-blue-500/30">
      <span class="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
      CONTACTED
    </span>`;
  } else if (s === 'quoted') {
    return `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
      <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
      QUOTED
    </span>`;
  } else if (s === 'confirmed') {
    return `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-whatsapp-green/20 text-whatsapp-green border border-whatsapp-green/40">
      <span class="w-1.5 h-1.5 rounded-full bg-whatsapp-green"></span>
      CONFIRMED
    </span>`;
  } else if (s === 'completed') {
    return `<span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-surface-container-highest text-on-surface-variant">
      <span class="w-1.5 h-1.5 rounded-full bg-on-surface-variant"></span>
      COMPLETED
    </span>`;
  }
  return `<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-surface-container-high text-on-surface">${status}</span>`;
}

function renderGiftingRow(req) {
  const cleanPhone = (req.whatsappNumber || '').replace(/[^0-9]/g, '');
  const waPhone = cleanPhone.startsWith('91') ? cleanPhone : (cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone);
  const waReplyMsg = encodeURIComponent(
    `Hello ${req.fullName || 'there'}! This is Hardik from Ganachly regarding your gifting inquiry for ${req.companyOccasion || 'your upcoming event'}. I have reviewed your request for ${req.boxQuantity || 'custom'} boxes for delivery on ${req.deliveryDate || 'your preferred date'}. Let me know if you would like me to share our corporate catalogue and bespoke pricing.`
  );
  const waLink = waPhone ? `https://wa.me/${waPhone}?text=${waReplyMsg}` : `https://wa.me/919810757880`;

  return `
    <div class="gifting-row grid grid-cols-1 lg:grid-cols-12 gap-4 items-center p-4 sm:p-5 rounded-2xl bg-card-surface/90 border border-primary/15 hover:border-primary/40 transition-all shadow-md group">
      
      <!-- Col 1: Client & Occasion Info (lg:col-span-4) -->
      <div class="lg:col-span-4 flex items-start gap-3.5">
        <div class="w-12 h-12 rounded-xl bg-surface-container-high border border-primary/25 flex items-center justify-center text-xl flex-shrink-0 text-primary shadow-inner">
          <span class="material-symbols-outlined text-[24px]">card_giftcard</span>
        </div>
        <div class="flex flex-col min-w-0">
          <div class="flex items-center gap-2">
            <span class="font-headline-sm text-base text-on-surface font-bold tracking-wide truncate">${req.fullName || 'Anonymous Client'}</span>
            <span class="text-[10px] font-mono text-primary/80">${req.id ? req.id.split('-').slice(0, 2).join('-') : 'GIFT'}</span>
          </div>
          <span class="text-xs font-semibold text-gold-light mt-0.5 truncate flex items-center gap-1">
            <span class="material-symbols-outlined text-[14px]">corporate_fare</span>
            ${req.companyOccasion || 'Private Event / Bulk'}
          </span>
          <div class="flex items-center gap-2 text-[11px] text-on-surface-variant mt-1 font-mono">
            <span class="material-symbols-outlined text-[13px] text-whatsapp-green">call</span>
            <span>${req.whatsappNumber || 'No phone provided'}</span>
          </div>
        </div>
      </div>

      <!-- Col 2: Specifications: Qty, Date & Locations (lg:col-span-3) -->
      <div class="lg:col-span-3 flex flex-col gap-1 border-t lg:border-t-0 pt-2 lg:pt-0 border-primary/10">
        <div class="flex items-center gap-2">
          <span class="px-2 py-0.5 rounded-lg bg-surface-container text-xs font-bold text-primary font-mono border border-primary/20">
            📦 ${req.boxQuantity || 'Bespoke'} Boxes
          </span>
          <span class="text-[11px] font-medium text-on-surface-variant flex items-center gap-1">
            <span class="material-symbols-outlined text-[13px]">calendar_today</span>
            ${req.deliveryDate || 'Flexible'}
          </span>
        </div>
        <div class="text-xs text-on-surface-variant flex items-center gap-1.5 truncate mt-1">
          <span class="material-symbols-outlined text-[14px] text-primary/60 flex-shrink-0">location_on</span>
          <span class="truncate">${req.deliveryLocations || 'Faridabad / NCR'}</span>
        </div>
      </div>

      <!-- Col 3: Notes & Preferences (lg:col-span-3) -->
      <div class="lg:col-span-3 flex flex-col min-w-0 border-t lg:border-t-0 pt-2 lg:pt-0 border-primary/10">
        <span class="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">Preferences / Notes</span>
        <p class="text-xs text-on-surface-variant line-clamp-2 italic mt-0.5 bg-surface-container-lowest/60 p-2 rounded-lg border border-primary/10">
          "${req.flavorPreferences || 'No specific flavor preference stated.'}"
        </p>
      </div>

      <!-- Col 4: Status & Actions (lg:col-span-2) -->
      <div class="lg:col-span-2 flex flex-row lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-2 border-t lg:border-t-0 pt-2 lg:pt-0 border-primary/10">
        <div>
          ${getStatusBadge(req.status)}
        </div>
        <div class="flex items-center gap-1.5 mt-1">
          <a href="${waLink}" target="_blank" rel="noopener noreferrer" class="px-2.5 py-1.5 rounded-lg bg-whatsapp-green text-espresso-deep hover:brightness-110 transition-all font-bold text-xs flex items-center gap-1 shadow-sm" title="Reply on WhatsApp">
            <span class="material-symbols-outlined text-[16px]">chat</span>
            <span>WhatsApp</span>
          </a>
          <button class="status-menu-btn p-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface border border-primary/20 transition-all" data-request-id="${req.id}" title="Update Status">
            <span class="material-symbols-outlined text-[16px]">edit_note</span>
          </button>
          <button class="delete-request-btn p-1.5 rounded-lg bg-surface-container hover:bg-red-500/20 text-on-surface-variant hover:text-red-400 border border-primary/20 transition-all" data-request-id="${req.id}" title="Delete Inquiry">
            <span class="material-symbols-outlined text-[16px]">delete</span>
          </button>
        </div>
      </div>

    </div>
  `;
}

export function renderAdminGiftingPage() {
  const allRequests = store.getGiftingRequests();
  const filteredRequests = getFilteredGiftingRequests();

  const newCount = allRequests.filter(r => (r.status || 'New').toLowerCase() === 'new').length;
  const inProgressCount = allRequests.filter(r => ['contacted', 'quoted'].includes((r.status || '').toLowerCase())).length;
  const confirmedCount = allRequests.filter(r => (r.status || '').toLowerCase() === 'confirmed').length;

  return `
    <div class="w-full space-y-6">
      
      <!-- Top Title Header -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-primary/15">
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/15 text-primary text-xs font-bold uppercase tracking-wider mb-2">
            <span class="material-symbols-outlined text-[16px]">featured_seasonal_and_gifts</span>
            Corporate &amp; Bulk Registry
          </div>
          <h1 class="font-headline-lg text-2xl sm:text-3xl md:text-4xl text-on-surface tracking-wide">
            GIFTING &amp; EVENT INQUIRIES
          </h1>
          <p class="font-body-sm text-body-sm text-on-surface-variant mt-1">
            Real-time inbound inquiries from the Gifting portal, backed by instant Firebase Firestore synchronization.
          </p>
        </div>

        <div class="flex items-center gap-2.5">
          <button id="refreshGiftingBtn" class="px-3.5 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-primary/20 text-on-surface font-body-sm text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm">
            <span class="material-symbols-outlined text-[18px]">sync</span>
            <span>Refresh</span>
          </button>
          <button id="openManualInquiryBtn" class="px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-gold-hover text-espresso-deep font-bold font-body-sm text-xs flex items-center gap-1.5 hover:brightness-105 transition-all shadow-md">
            <span class="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Log Inquiry</span>
          </button>
        </div>
      </div>

      <!-- KPI Metrics Row -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div class="p-4 rounded-2xl bg-card-surface/90 border border-primary/20 shadow-md">
          <span class="text-xs uppercase font-bold text-on-surface-variant tracking-wider">Total Inquiries</span>
          <div class="flex items-baseline justify-between mt-2">
            <p class="font-headline-sm text-3xl font-bold text-on-surface">${allRequests.length}</p>
            <span class="material-symbols-outlined text-primary/40 text-[24px]">inbox</span>
          </div>
          <span class="text-[11px] text-on-surface-variant mt-1 block">All logged bulk leads</span>
        </div>

        <div class="p-4 rounded-2xl bg-card-surface/90 border border-primary/20 shadow-md">
          <span class="text-xs uppercase font-bold text-primary tracking-wider">New / Unread</span>
          <div class="flex items-baseline justify-between mt-2">
            <p class="font-headline-sm text-3xl font-bold text-primary">${newCount}</p>
            <span class="w-3 h-3 rounded-full bg-primary animate-ping"></span>
          </div>
          <span class="text-[11px] text-on-surface-variant mt-1 block">Awaiting first contact</span>
        </div>

        <div class="p-4 rounded-2xl bg-card-surface/90 border border-primary/20 shadow-md">
          <span class="text-xs uppercase font-bold text-amber-400 tracking-wider">In Discussion / Quoted</span>
          <div class="flex items-baseline justify-between mt-2">
            <p class="font-headline-sm text-3xl font-bold text-amber-400">${inProgressCount}</p>
            <span class="material-symbols-outlined text-amber-400/50 text-[24px]">chat</span>
          </div>
          <span class="text-[11px] text-on-surface-variant mt-1 block">Pricing &amp; samples dispatched</span>
        </div>

        <div class="p-4 rounded-2xl bg-card-surface/90 border border-primary/20 shadow-md">
          <span class="text-xs uppercase font-bold text-whatsapp-green tracking-wider">Confirmed Orders</span>
          <div class="flex items-baseline justify-between mt-2">
            <p class="font-headline-sm text-3xl font-bold text-whatsapp-green">${confirmedCount}</p>
            <span class="material-symbols-outlined text-whatsapp-green/50 text-[24px]">task_alt</span>
          </div>
          <span class="text-[11px] text-on-surface-variant mt-1 block">Production slots reserved</span>
        </div>
      </div>

      <!-- Filter Controls Strip -->
      <div class="p-4 rounded-2xl bg-card-surface/80 border border-primary/15 shadow-md flex flex-col md:flex-row items-center justify-between gap-4">
        
        <!-- Status Tabs -->
        <div class="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          ${['all', 'new', 'contacted', 'quoted', 'confirmed', 'completed'].map(tab => `
            <button class="status-filter-tab px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap ${giftingFilters.status === tab ? 'bg-primary text-espresso-deep shadow-sm' : 'bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high'}" data-status="${tab}">
              ${tab}
            </button>
          `).join('')}
        </div>

        <!-- Search Input -->
        <div class="relative w-full md:w-72">
          <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[18px]">search</span>
          <input id="giftingSearchInput" type="text" placeholder="Search client, company, phone..." value="${giftingFilters.search}" class="w-full bg-surface-container pl-9 pr-3 py-2 rounded-xl text-xs font-body-md text-on-surface placeholder:text-on-surface-variant/40 border border-primary/10 focus:outline-none focus:ring-1 focus:ring-primary"/>
          ${giftingFilters.search ? `
            <button id="clearGiftingSearchBtn" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface text-xs">
              <span class="material-symbols-outlined text-[16px]">close</span>
            </button>
          ` : ''}
        </div>

      </div>

      <!-- Inquiries List Container -->
      <div class="space-y-3">
        ${filteredRequests.length > 0 ? `
          <div class="flex items-center justify-between text-xs text-on-surface-variant px-1 font-mono">
            <span>SHOWING ${filteredRequests.length} OF ${allRequests.length} INQUIRIES</span>
            <span class="text-whatsapp-green flex items-center gap-1">
              <span class="w-1.5 h-1.5 rounded-full bg-whatsapp-green animate-pulse"></span>
              FIRESTORE CLOUD ACTIVE
            </span>
          </div>
          <div class="space-y-3">
            ${filteredRequests.map(renderGiftingRow).join('')}
          </div>
        ` : `
          <div class="p-12 rounded-2xl bg-card-surface/60 border border-primary/15 text-center flex flex-col items-center justify-center space-y-3">
            <div class="w-16 h-16 rounded-full bg-surface-container-high flex items-center justify-center text-primary mb-1">
              <span class="material-symbols-outlined text-[32px]">featured_seasonal_and_gifts</span>
            </div>
            <h3 class="font-headline-sm text-lg text-on-surface">No Inquiries Found</h3>
            <p class="text-xs text-on-surface-variant max-w-md">
              ${giftingFilters.search || giftingFilters.status !== 'all' ? 'Try adjusting your filters or search keywords.' : 'No gifting or corporate inquiries have been submitted yet. When users submit the form on the Gifting page, they will instantly appear here.'}
            </p>
            ${giftingFilters.search || giftingFilters.status !== 'all' ? `
              <button id="resetFiltersBtn" class="px-3.5 py-1.5 rounded-xl bg-primary/20 text-primary hover:bg-primary hover:text-espresso-deep text-xs font-bold transition-all">
                Reset Filters
              </button>
            ` : ''}
          </div>
        `}
      </div>

    </div>

    <!-- Status Change Modal Container -->
    <div id="statusChangeModal" class="fixed inset-0 z-50 bg-espresso-deep/80 backdrop-blur-sm hidden flex items-center justify-center p-4">
      <div class="w-full max-w-md bg-espresso-panel rounded-2xl border border-primary/30 p-6 shadow-2xl space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-primary/15">
          <h3 class="font-headline-sm text-lg text-primary">Update Inquiry Status</h3>
          <button id="closeStatusModalBtn" class="p-1 rounded-lg text-on-surface-variant hover:text-on-surface">
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        <p class="text-xs text-on-surface-variant" id="modalClientInfo">Select the new lifecycle stage for this consignment:</p>
        <div class="space-y-2">
          ${[
            { id: 'New', label: 'New / Unreviewed', color: 'bg-primary text-espresso-deep' },
            { id: 'Contacted', label: 'Contacted Customer', color: 'bg-blue-500/20 text-blue-400' },
            { id: 'Quoted', label: 'Quotation / Samples Sent', color: 'bg-amber-500/20 text-amber-400' },
            { id: 'Confirmed', label: 'Order Confirmed (Payment Received)', color: 'bg-whatsapp-green/20 text-whatsapp-green' },
            { id: 'Completed', label: 'Completed & Delivered', color: 'bg-surface-container-highest text-on-surface-variant' }
          ].map(opt => `
            <button class="select-status-opt w-full text-left px-4 py-3 rounded-xl bg-card-surface border border-primary/15 hover:border-primary/50 text-xs font-bold flex items-center justify-between transition-all" data-status-val="${opt.id}">
              <span class="text-on-surface">${opt.label}</span>
              <span class="px-2 py-0.5 rounded-md text-[10px] font-bold ${opt.color}">${opt.id}</span>
            </button>
          `).join('')}
        </div>
      </div>
    </div>

    <!-- Manual Log Inquiry Modal Container -->
    <div id="manualInquiryModal" class="fixed inset-0 z-50 bg-espresso-deep/80 backdrop-blur-sm hidden flex items-center justify-center p-4">
      <div class="w-full max-w-lg bg-espresso-panel rounded-2xl border border-primary/30 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between pb-3 border-b border-primary/15">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary">add_circle</span>
            <h3 class="font-headline-sm text-lg text-primary">Log Manual Gifting Lead</h3>
          </div>
          <button id="closeManualModalBtn" class="p-1 rounded-lg text-on-surface-variant hover:text-on-surface">
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>
        <form id="manualInquiryForm" class="space-y-3">
          <div>
            <label class="block text-xs font-bold text-gold-cream uppercase mb-1">Client Full Name *</label>
            <input required id="manualFullName" type="text" placeholder="e.g. Karan Singhania" class="w-full bg-surface-container px-3 py-2 rounded-xl text-xs text-on-surface border border-primary/15 focus:outline-none focus:ring-1 focus:ring-primary"/>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-gold-cream uppercase mb-1">Company / Occasion *</label>
              <input required id="manualCompany" type="text" placeholder="e.g. Wedding Favors / Tech Corp" class="w-full bg-surface-container px-3 py-2 rounded-xl text-xs text-on-surface border border-primary/15 focus:outline-none focus:ring-1 focus:ring-primary"/>
            </div>
            <div>
              <label class="block text-xs font-bold text-gold-cream uppercase mb-1">WhatsApp Phone *</label>
              <input required id="manualPhone" type="tel" placeholder="+91 98123 45678" class="w-full bg-surface-container px-3 py-2 rounded-xl text-xs text-on-surface border border-primary/15 focus:outline-none focus:ring-1 focus:ring-primary"/>
            </div>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-bold text-gold-cream uppercase mb-1">Estimated Quantity *</label>
              <select id="manualQty" class="w-full bg-surface-container px-3 py-2 rounded-xl text-xs text-on-surface border border-primary/15 focus:outline-none focus:ring-1 focus:ring-primary">
                <option value="10-25">10 – 25 Boxes</option>
                <option value="26-50" selected>26 – 50 Boxes</option>
                <option value="51-100">51 – 100 Boxes</option>
                <option value="100+">100+ Boxes</option>
              </select>
            </div>
            <div>
              <label class="block text-xs font-bold text-gold-cream uppercase mb-1">Target Delivery Date</label>
              <input id="manualDate" type="date" class="w-full bg-surface-container px-3 py-2 rounded-xl text-xs text-on-surface border border-primary/15 focus:outline-none focus:ring-1 focus:ring-primary"/>
            </div>
          </div>
          <div>
            <label class="block text-xs font-bold text-gold-cream uppercase mb-1">Delivery Location(s)</label>
            <input id="manualLocation" type="text" placeholder="e.g. Sector 77 Faridabad &amp; Gurugram" class="w-full bg-surface-container px-3 py-2 rounded-xl text-xs text-on-surface border border-primary/15 focus:outline-none focus:ring-1 focus:ring-primary"/>
          </div>
          <div>
            <label class="block text-xs font-bold text-gold-cream uppercase mb-1">Special Preferences / Custom Notes</label>
            <textarea id="manualNotes" rows="2" placeholder="Flavor preferences, custom sleeve branding requirements..." class="w-full bg-surface-container px-3 py-2 rounded-xl text-xs text-on-surface border border-primary/15 focus:outline-none focus:ring-1 focus:ring-primary resize-none"></textarea>
          </div>
          <div class="pt-2 flex justify-end gap-2">
            <button type="button" id="cancelManualModalBtn" class="px-4 py-2 rounded-xl bg-surface-container text-xs font-bold text-on-surface hover:bg-surface-container-high transition-all">
              Cancel
            </button>
            <button type="submit" class="px-5 py-2 rounded-xl bg-gradient-to-r from-primary to-gold-hover text-espresso-deep font-bold text-xs shadow-md hover:brightness-105 transition-all">
              Save Lead to Firebase
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}

let activeTargetRequestId = null;

export function attachAdminGiftingPageEvents() {
  // Re-render helper
  function triggerRefresh() {
    const mainEl = document.querySelector('main');
    if (mainEl) {
      mainEl.innerHTML = renderAdminGiftingPage();
      attachAdminGiftingPageEvents();
    }
  }

  // Subscribe to store updates for real-time Firestore sync
  const unsubscribe = store.subscribe(() => {
    // Only refresh if still on the admin gifting page
    if (window.location.hash.includes('/admin/gifting')) {
      const mainEl = document.querySelector('main');
      if (mainEl && !document.getElementById('manualInquiryModal')?.classList.contains('flex')) {
        mainEl.innerHTML = renderAdminGiftingPage();
        attachAdminGiftingPageEvents();
      }
    }
  });

  // Filter Tabs
  document.querySelectorAll('.status-filter-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      giftingFilters.status = tab.getAttribute('data-status') || 'all';
      triggerRefresh();
    });
  });

  // Search Input
  const searchInput = document.getElementById('giftingSearchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      giftingFilters.search = e.target.value;
      triggerRefresh();
    });
  }

  const clearSearchBtn = document.getElementById('clearGiftingSearchBtn');
  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      giftingFilters.search = '';
      triggerRefresh();
    });
  }

  const resetFiltersBtn = document.getElementById('resetFiltersBtn');
  if (resetFiltersBtn) {
    resetFiltersBtn.addEventListener('click', () => {
      giftingFilters.search = '';
      giftingFilters.status = 'all';
      triggerRefresh();
    });
  }

  const refreshBtn = document.getElementById('refreshGiftingBtn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      showToast('Refreshing gifting inquiries from Firestore...', 'sync', 'Cloud Sync');
      triggerRefresh();
    });
  }

  // Status Change Modal
  const statusModal = document.getElementById('statusChangeModal');
  document.querySelectorAll('.status-menu-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeTargetRequestId = btn.getAttribute('data-request-id');
      const req = store.getGiftingRequestById(activeTargetRequestId);
      const infoEl = document.getElementById('modalClientInfo');
      if (infoEl && req) {
        infoEl.textContent = `Updating status for ${req.fullName} (${req.companyOccasion}):`;
      }
      if (statusModal) {
        statusModal.classList.remove('hidden');
        statusModal.classList.add('flex');
      }
    });
  });

  const closeStatusModalBtn = document.getElementById('closeStatusModalBtn');
  if (closeStatusModalBtn && statusModal) {
    closeStatusModalBtn.addEventListener('click', () => {
      statusModal.classList.add('hidden');
      statusModal.classList.remove('flex');
    });
  }

  document.querySelectorAll('.select-status-opt').forEach(opt => {
    opt.addEventListener('click', async () => {
      const newStatus = opt.getAttribute('data-status-val');
      if (activeTargetRequestId && newStatus) {
        await store.updateGiftingRequestStatus(activeTargetRequestId, newStatus);
        showToast(`Status updated to "${newStatus}" & synced to Firebase!`, 'check_circle', 'Inquiry Updated');
      }
      if (statusModal) {
        statusModal.classList.add('hidden');
        statusModal.classList.remove('flex');
      }
      triggerRefresh();
    });
  });

  // Delete Inquiry
  document.querySelectorAll('.delete-request-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const reqId = btn.getAttribute('data-request-id');
      if (confirm('Are you sure you want to delete this gifting inquiry? This will also remove it from Firebase.')) {
        await store.deleteGiftingRequest(reqId);
        showToast('Gifting inquiry deleted from Firebase.', 'delete', 'Inquiry Removed');
        triggerRefresh();
      }
    });
  });

  // Manual Log Modal
  const manualModal = document.getElementById('manualInquiryModal');
  const openManualBtn = document.getElementById('openManualInquiryBtn');
  if (openManualBtn && manualModal) {
    openManualBtn.addEventListener('click', () => {
      manualModal.classList.remove('hidden');
      manualModal.classList.add('flex');
    });
  }

  const closeManualBtn = document.getElementById('closeManualModalBtn');
  const cancelManualBtn = document.getElementById('cancelManualModalBtn');
  [closeManualBtn, cancelManualBtn].forEach(btn => {
    if (btn && manualModal) {
      btn.addEventListener('click', () => {
        manualModal.classList.add('hidden');
        manualModal.classList.remove('flex');
      });
    }
  });

  const manualForm = document.getElementById('manualInquiryForm');
  if (manualForm) {
    manualForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const newInquiry = {
        id: `GIFT-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
        fullName: document.getElementById('manualFullName')?.value?.trim() || 'Direct Client',
        companyOccasion: document.getElementById('manualCompany')?.value?.trim() || 'Corporate Event',
        whatsappNumber: document.getElementById('manualPhone')?.value?.trim() || '',
        boxQuantity: document.getElementById('manualQty')?.value || '26-50',
        deliveryDate: document.getElementById('manualDate')?.value || 'Upcoming',
        deliveryLocations: document.getElementById('manualLocation')?.value?.trim() || 'Faridabad',
        flavorPreferences: document.getElementById('manualNotes')?.value?.trim() || 'Manual admin lead',
        status: 'New',
        createdAt: Date.now(),
        submittedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', dateStyle: 'medium', timeStyle: 'short' })
      };

      await store.addGiftingRequest(newInquiry);
      showToast('New gifting inquiry logged & saved to Firebase!', 'verified', 'Lead Created');
      
      if (manualModal) {
        manualModal.classList.add('hidden');
        manualModal.classList.remove('flex');
      }
      triggerRefresh();
    });
  }
}
