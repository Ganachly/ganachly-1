import { store } from '../state/store.js';
import { showToast } from '../components/toast.js';
import { openProductDetailModal } from '../components/productDetailModal.js';

let activeCategory = 'all';
let searchQuery = '';

function getFilteredProducts() {
  const products = store.getProducts();
  return products.filter(p => {
    const cat = (p.category || '').toLowerCase();
    const title = (p.title || '').toLowerCase();
    const matchesCategory = activeCategory === 'all' || 
      (activeCategory === 'brownie' && (cat.includes('brownie') || title.includes('brownie'))) ||
      (activeCategory === 'brookie' && (cat.includes('brookie') || title.includes('brookie'))) ||
      (activeCategory === 'cookie' && (cat.includes('cookie') || title.includes('cookie'))) ||
      (activeCategory === 'cheesecake' && (cat.includes('cheesecake') || cat.includes('jar') || title.includes('cheesecake'))) ||
      (activeCategory === 'spiral' && (cat.includes('spiral') || cat.includes('roll') || title.includes('spiral'))) ||
      (activeCategory === 'hamper' && (cat.includes('hamper') || cat.includes('box') || cat.includes('gift') || title.includes('box') || title.includes('hamper'))) ||
      (activeCategory === 'hot-chocolate' && (cat.includes('hot-chocolate') || cat.includes('beverage') || title.includes('hot chocolate')));

    const q = searchQuery.toLowerCase().trim();
    const desc = (p.desc || p.description || '').toLowerCase();
    const matchesSearch = !q || title.includes(q) || desc.includes(q) || (Array.isArray(p.tags) && p.tags.some(t => (typeof t === 'string' ? t.toLowerCase() : '').includes(q)));

    return matchesCategory && matchesSearch;
  });
}

function renderProductGridItems(filtered) {
  const totalProducts = store.getProducts().length;
  if (totalProducts === 0) {
    return `
      <div class="py-20 text-center text-on-surface-variant col-span-full max-w-lg mx-auto">
        <div class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4 border border-primary/20">
          <span class="material-symbols-outlined text-3xl">cookie</span>
        </div>
        <h2 class="font-headline-md text-xl text-gold-light uppercase tracking-wide">Nocturne Hearth In Preparation</h2>
        <p class="font-editorial-quote text-sm italic text-gold-cream/80 mt-2 leading-relaxed">
          Our confectionery menu is freshly cleared. Formulate new creations in the Admin Console or sync via Firebase to publish your creations live.
        </p>
        <a href="#/admin/catalog" class="inline-flex items-center gap-2 mt-6 px-6 py-2.5 rounded-xl bg-gradient-to-r from-gold-hover to-primary-container text-espresso-deep font-label-action text-xs uppercase tracking-widest font-bold hover:brightness-110 transition-all shadow-lg">
          <span class="material-symbols-outlined text-[16px]">add_circle</span>
          <span>Formulate First Item</span>
        </a>
      </div>
    `;
  }

  if (filtered.length === 0) {
    return `
      <div class="py-16 text-center text-on-surface-variant col-span-full">
        <span class="material-symbols-outlined text-[40px] text-primary/40 mb-1">search_off</span>
        <p class="font-headline-md text-base text-gold-cream uppercase">No creations found</p>
        <p class="font-editorial-quote text-xs italic mt-0.5">Try another search or filter category.</p>
      </div>
    `;
  }

  const cart = store.getCart();

  return `
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5" id="productGrid">
      ${filtered.map(product => {
        const isSoldOut = product.stockStatus === 'sold_out';
        const isExclusive = product.stockStatus === 'nocturne_exclusive';
        const cartItem = cart.find(c => c.productId === product.id);
        const cartQty = cartItem ? cartItem.qty : 0;

        return `
          <article class="product-item flex flex-col justify-between rounded-2xl overflow-hidden bg-card-surface/70 border border-primary/15 hover:border-primary/40 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(0,0,0,0.5)] group">
            
            <!-- Thumbnail & Badges -->
            <div class="relative h-44 w-full overflow-hidden bg-espresso-panel cursor-pointer" onclick="window.openProductDetailModal('${product.id}')">
              <img class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" src="${product.image}" alt="${product.title}" loading="lazy" decoding="async">
              <div class="absolute inset-0 bg-gradient-to-t from-card-surface/80 via-transparent to-transparent"></div>
              
              ${product.badge ? `
                <span class="absolute top-2.5 right-2.5 px-2.5 py-0.5 rounded-full text-[10px] font-label-badge uppercase tracking-wider bg-black/60 text-gold-light backdrop-blur-md border border-primary/25">
                  ${product.badge}
                </span>
              ` : ''}

              ${isSoldOut ? `
                <div class="absolute inset-0 bg-black/70 backdrop-blur-[2px] flex items-center justify-center">
                  <span class="px-2.5 py-1 rounded-full bg-red-900/80 text-red-200 text-[10px] font-label-badge uppercase tracking-wider font-bold border border-red-500/30">
                    Sold Out
                  </span>
                </div>
              ` : ''}

              ${cartQty > 0 ? `
                <div class="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-primary text-espresso-deep text-[10px] font-label-badge uppercase font-bold tracking-wider shadow-md">
                  ${cartQty} in bag
                </div>
              ` : ''}

              ${isExclusive ? `
                <span class="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-badge-exclusive/20 text-badge-exclusive text-[9px] font-label-badge uppercase tracking-wider backdrop-blur-md border border-badge-exclusive/20">
                  Nocturne Exclusive
                </span>
              ` : ''}
            </div>

            <!-- Details & Actions -->
            <div class="p-3.5 flex flex-col flex-grow justify-between gap-3">
              <div>
                <h3 class="font-headline-md text-base text-on-surface tracking-wide group-hover:text-primary transition-colors cursor-pointer line-clamp-1" onclick="window.openProductDetailModal('${product.id}')" title="${product.title}">
                  ${product.title}
                </h3>
                <p class="font-editorial-quote text-xs text-on-surface-variant italic leading-snug line-clamp-2 mt-1">
                  ${product.desc}
                </p>
              </div>

              <!-- Price & Quick Add / Qty Stepper -->
              <div class="pt-2 flex items-center justify-between border-t border-primary/10">
                <span class="font-label-price text-sm text-gold-cream font-bold">₹${product.price}</span>
                
                ${isSoldOut ? `
                  <span class="text-[10px] text-on-surface-variant/50 uppercase tracking-wider font-semibold">Unavailable</span>
                ` : cartQty > 0 ? `
                  <div class="flex items-center rounded-lg bg-surface-container-high border border-primary/30 overflow-hidden shadow-sm">
                    <button class="btn-card-qty-minus w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-bright transition-all font-bold text-base" data-id="${product.id}" title="Remove one">
                      −
                    </button>
                    <span class="px-2.5 font-body-sm text-xs text-primary font-bold min-w-[1.5rem] text-center">${cartQty}</span>
                    <button class="btn-card-qty-plus w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-primary hover:bg-surface-bright transition-all font-bold text-base" data-id="${product.id}" title="Add one more">
                      +
                    </button>
                  </div>
                ` : `
                  <button class="btn-add-to-cart px-3 py-1.5 rounded-lg bg-primary hover:bg-gold-light text-espresso-deep font-label-action text-xs tracking-wider uppercase font-bold transition-all shadow-sm flex items-center gap-1 active:scale-95" data-id="${product.id}" title="Add to bag">
                    <span class="material-symbols-outlined text-[15px]">add</span>
                    <span>Add</span>
                  </button>
                `}
              </div>

            </div>

          </article>
        `;
      }).join('')}
    </div>
  `;
}

export function renderMenuPage() {
  const products = store.getProducts();
  const filtered = getFilteredProducts();

  return `
    <main class="w-full pt-16 sm:pt-24 bg-surface min-h-screen pb-16">
      <div class="flex flex-col w-full max-w-[1240px] mx-auto px-4 sm:px-6">
        
        <!-- Clean Header -->
        <div class="text-center pt-2 pb-4">
          <h1 class="font-display-hero text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-gold-light via-primary to-primary-container leading-none uppercase select-none drop-shadow-lg" style="font-size: clamp(3rem, 6.5vw, 5.5rem); line-height: 1.05;">
            THE PATISSERIE MENU
          </h1>
        </div>

        <!-- Sticky Filter & Search Bar -->
        <div class="sticky top-16 sm:top-20 z-30 py-2.5 -mx-4 sm:-mx-6 px-4 sm:px-6 bg-espresso-deep/90 backdrop-blur-xl border-y border-primary/10 mb-5">
          <div class="max-w-[1240px] mx-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            
            <!-- Category Pills -->
            <div class="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none" id="menuFilterNav">
              <button class="cat-pill px-3 py-1 rounded-full text-[11px] font-label-badge uppercase tracking-wider transition-all whitespace-nowrap ${activeCategory === 'all' ? 'bg-primary text-espresso-deep font-bold shadow-sm' : 'bg-surface-container-low text-on-surface-variant hover:text-gold-cream'}" data-category="all">
                All (${products.length})
              </button>
              <button class="cat-pill px-3 py-1 rounded-full text-[11px] font-label-badge uppercase tracking-wider transition-all whitespace-nowrap ${activeCategory === 'brownie' ? 'bg-primary text-espresso-deep font-bold shadow-sm' : 'bg-surface-container-low text-on-surface-variant hover:text-gold-cream'}" data-category="brownie">
                Brownies
              </button>
              <button class="cat-pill px-3 py-1 rounded-full text-[11px] font-label-badge uppercase tracking-wider transition-all whitespace-nowrap ${activeCategory === 'brookie' ? 'bg-primary text-espresso-deep font-bold shadow-sm' : 'bg-surface-container-low text-on-surface-variant hover:text-gold-cream'}" data-category="brookie">
                Brookies
              </button>
              <button class="cat-pill px-3 py-1 rounded-full text-[11px] font-label-badge uppercase tracking-wider transition-all whitespace-nowrap ${activeCategory === 'cookie' ? 'bg-primary text-espresso-deep font-bold shadow-sm' : 'bg-surface-container-low text-on-surface-variant hover:text-gold-cream'}" data-category="cookie">
                Cookies
              </button>
              <button class="cat-pill px-3 py-1 rounded-full text-[11px] font-label-badge uppercase tracking-wider transition-all whitespace-nowrap ${activeCategory === 'cheesecake' ? 'bg-primary text-espresso-deep font-bold shadow-sm' : 'bg-surface-container-low text-on-surface-variant hover:text-gold-cream'}" data-category="cheesecake">
                Cheesecakes
              </button>
              <button class="cat-pill px-3 py-1 rounded-full text-[11px] font-label-badge uppercase tracking-wider transition-all whitespace-nowrap ${activeCategory === 'spiral' ? 'bg-primary text-espresso-deep font-bold shadow-sm' : 'bg-surface-container-low text-on-surface-variant hover:text-gold-cream'}" data-category="spiral">
                Spirals
              </button>
              <button class="cat-pill px-3 py-1 rounded-full text-[11px] font-label-badge uppercase tracking-wider transition-all whitespace-nowrap ${activeCategory === 'hamper' ? 'bg-primary text-espresso-deep font-bold shadow-sm' : 'bg-surface-container-low text-on-surface-variant hover:text-gold-cream'}" data-category="hamper">
                Gift Boxes
              </button>
              <button class="cat-pill px-3 py-1 rounded-full text-[11px] font-label-badge uppercase tracking-wider transition-all whitespace-nowrap ${activeCategory === 'hot-chocolate' ? 'bg-primary text-espresso-deep font-bold shadow-sm' : 'bg-surface-container-low text-on-surface-variant hover:text-gold-cream'}" data-category="hot-chocolate">
                Hot Chocolate
              </button>
            </div>

            <!-- Search Field -->
            <div class="relative w-full sm:w-56 flex-shrink-0">
              <span class="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[16px]">search</span>
              <input type="text" id="menuSearchInput" value="${searchQuery}" placeholder="Search menu..."
                class="w-full pl-8 pr-6 py-1.5 rounded-full bg-surface-container-high text-on-surface text-xs border border-outline-variant/30 focus:outline-none focus:border-primary transition-all">
              ${searchQuery ? `<button id="clearMenuSearch" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-gold-cream text-xs">✕</button>` : ''}
            </div>

          </div>
        </div>

        <!-- PRODUCT GRID CONTAINER -->
        <div id="menu-products-container">
          ${renderProductGridItems(filtered)}
        </div>

      </div>
    </main>
  `;
}

export function attachMenuPageEvents() {
  function attachProductEvents() {
    // Add to cart buttons (shown when item not yet in cart)
    document.querySelectorAll('.btn-add-to-cart').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const product = store.getProductById(id);
        if (product) {
          store.addToCart(id, 1);
          showToast(`Added ${product.title} to bag (₹${product.price})`, 'shopping_bag');
        }
      };
    });

    // Qty minus buttons (shown when item already in cart)
    document.querySelectorAll('.btn-card-qty-minus').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const cart = store.getCart();
        const item = cart.find(c => c.productId === id);
        if (item) {
          store.updateCartQty(id, item.qty - 1);
          // updateMenuDisplay will be triggered by store subscriber
        }
      };
    });

    // Qty plus buttons (shown when item already in cart)
    document.querySelectorAll('.btn-card-qty-plus').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        const id = btn.getAttribute('data-id');
        const cart = store.getCart();
        const item = cart.find(c => c.productId === id);
        if (item) {
          store.updateCartQty(id, item.qty + 1);
        }
      };
    });
  }

  function updateMenuDisplay() {
    const container = document.getElementById('menu-products-container');
    if (container) {
      const filtered = getFilteredProducts();
      container.innerHTML = renderProductGridItems(filtered);
      attachProductEvents();
    }
  }

  // Initial attach of cards
  attachProductEvents();

  // Category pill filtering
  document.querySelectorAll('#menuFilterNav .cat-pill').forEach(btn => {
    btn.onclick = () => {
      activeCategory = btn.getAttribute('data-category');
      document.querySelectorAll('#menuFilterNav .cat-pill').forEach(p => {
        const isCurrent = p.getAttribute('data-category') === activeCategory;
        p.className = `cat-pill px-3 py-1 rounded-full text-[11px] font-label-badge uppercase tracking-wider transition-all whitespace-nowrap ${isCurrent ? 'bg-primary text-espresso-deep font-bold shadow-sm' : 'bg-surface-container-low text-on-surface-variant hover:text-gold-cream'}`;
      });
      updateMenuDisplay();
    };
  });

  // Search input without losing focus
  const searchInput = document.getElementById('menuSearchInput');
  if (searchInput) {
    searchInput.oninput = (e) => {
      searchQuery = e.target.value;
      updateMenuDisplay();
    };
  }

  const clearBtn = document.getElementById('clearMenuSearch');
  if (clearBtn) {
    clearBtn.onclick = () => {
      searchQuery = '';
      if (searchInput) searchInput.value = '';
      updateMenuDisplay();
    };
  }

  // Subscribe to live store & Firebase product updates
  store.subscribe(() => {
    updateMenuDisplay();
  });
}

// Exported / imported openProductDetailModal from components/productDetailModal.js
export { openProductDetailModal };

