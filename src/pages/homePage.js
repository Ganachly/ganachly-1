import homeHtml from './templates/home.html?raw';
import { store } from '../state/store.js';
import { showToast } from '../components/toast.js';

export function renderHomePage() {
  return homeHtml;
}

// Global quick add handler invoked by inline onclick in home.html
window.handleQuickAdd = function(productName, price) {
  const products = store.getProducts();
  if (!products || products.length === 0) {
    showToast('Confections are currently being formulated. Please explore the menu!', 'cookie');
    return;
  }
  const prodNameLower = (productName || '').toLowerCase().trim();
  const matched = products.find(p => {
    const t = (p.title || '').toLowerCase().trim();
    return t === prodNameLower || prodNameLower.includes(t) || t.includes(prodNameLower);
  }) || products[0];

  if (!matched) return;
  store.addToCart(matched.id, 1);
  showToast(`${matched.title} (₹${matched.price}) added to bag`, 'add_shopping_cart', 'Batch reserved for evening run');
};

export function attachHomePageEvents() {
  const container = document.querySelector('main');
  if (!container) return;

  // Intercept data-path links to work with our hash router
  container.querySelectorAll('a[data-path]').forEach(link => {
    const path = link.getAttribute('data-path');
    if (path === 'menu') link.href = '#/menu';
    else if (path === 'our-story') link.href = '#/story';
    else if (path === 'gifting-and-bulk') link.href = '#/gifting';
    else if (path === 'cart-and-checkout') {
      link.href = '#';
      link.onclick = (e) => {
        e.preventDefault();
        window.openCartDrawer();
      };
    }
  });

  // Dynamically populate Nightly Selection grid from store / Firebase
  const grid = document.getElementById('home-nightly-selection-grid');
  if (grid) {
    const products = store.getProducts().slice(0, 4);
    if (products.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full py-12 px-6 rounded-2xl bg-espresso-panel/60 border border-primary/20 text-center">
          <div class="w-12 h-12 rounded-xl bg-card-surface border border-primary/30 flex items-center justify-center text-primary mx-auto mb-3">
            <span class="material-symbols-outlined text-[24px]">oven_gen</span>
          </div>
          <h3 class="font-headline-md text-lg text-gold-cream uppercase tracking-wider">Confections In Preparation</h3>
          <p class="font-editorial-quote text-xs text-on-surface-variant italic mt-1 max-w-sm mx-auto">
            Micro-batch creations added in the Admin Catalog will dynamically appear here in real time.
          </p>
          <a href="#/menu" class="inline-flex items-center gap-1.5 mt-4 px-4 py-2 rounded-xl bg-primary text-espresso-deep font-label-action text-xs uppercase tracking-widest font-bold hover:brightness-110 transition-all">
            <span>View Menu</span>
            <span class="material-symbols-outlined text-[15px]">east</span>
          </a>
        </div>
      `;
    } else {
      grid.innerHTML = products.map(product => `
        <div class="group relative flex flex-col rounded-2xl bg-gradient-to-b from-card-surface to-surface-container-lowest overflow-hidden shadow-xl hover:-translate-y-1.5 transition-all duration-300 border border-primary/15 hover:border-primary/40">
          <div class="relative h-56 w-full overflow-hidden bg-espresso-panel cursor-pointer" onclick="window.openProductDetailModal('${product.id}')">
            <img class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" src="${product.image}" alt="${product.title}" loading="lazy" decoding="async"/>
            <div class="absolute inset-0 bg-gradient-to-t from-card-surface via-transparent to-black/30"></div>
            ${product.badge ? `
              <span class="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-primary/20 backdrop-blur-md text-primary font-label-badge text-label-badge tracking-[0.2em] uppercase font-bold border border-primary/30">
                ${product.badge}
              </span>
            ` : ''}
          </div>
          <div class="flex flex-col flex-1 p-space-md justify-between">
            <div class="space-y-1">
              <h3 class="font-headline-md text-xl text-gold-cream tracking-wide group-hover:text-primary transition-colors cursor-pointer" onclick="window.openProductDetailModal('${product.id}')">
                ${product.title}
              </h3>
              <p class="font-editorial-quote text-xs md:text-sm leading-relaxed text-on-surface-variant italic line-clamp-2">
                ${product.desc || ''}
              </p>
            </div>
            <div class="pt-space-md mt-space-md flex items-center justify-between border-t border-primary/10">
              <div>
                <span class="text-[10px] text-on-surface-variant tracking-wider uppercase block">Fresh Bake</span>
                <span class="font-label-price text-lg text-primary font-bold">₹${product.price}</span>
              </div>
              <button class="btn-quick-add-cart inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-surface-container-high hover:bg-primary hover:text-espresso-deep text-gold-cream font-label-action text-xs tracking-wider uppercase font-bold transition-all shadow-sm" data-id="${product.id}">
                <span class="material-symbols-outlined text-[16px]">add</span>
                <span>ADD</span>
              </button>
            </div>
          </div>
        </div>
      `).join('');

      grid.querySelectorAll('.btn-quick-add-cart').forEach(btn => {
        btn.onclick = (e) => {
          e.preventDefault();
          const id = btn.getAttribute('data-id');
          store.addToCart(id, 1);
          const p = store.getProductById(id);
          showToast(`${p ? p.title : 'Item'} added to bag`, 'add_shopping_cart', 'Fresh Couverture Bake');
        };
      });
    }
  }
}
