import { store } from '../state/store.js';
import { showToast } from './toast.js';

export function openProductDetailModal(productId) {
  const product = store.getProductById(productId);
  if (!product) return;

  let modalEl = document.getElementById('productDetailModalContainer');
  if (!modalEl) {
    modalEl = document.createElement('div');
    modalEl.id = 'productDetailModalContainer';
    document.body.appendChild(modalEl);
  }

  modalEl.innerHTML = `
    <div id="productModalBackdrop" class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div class="relative w-full max-w-lg bg-espresso-panel border border-primary/30 rounded-2xl overflow-hidden shadow-2xl modal-fade-in">
        
        <button id="closeProductDetailModal" class="absolute top-4 right-4 z-10 p-2 rounded-xl bg-black/60 text-gold-cream hover:bg-black transition-all">
          <span class="material-symbols-outlined text-[20px]">close</span>
        </button>

        <div class="h-60 w-full relative bg-espresso-deep">
          <img src="${product.image}" alt="${product.title}" class="w-full h-full object-cover">
          <div class="absolute inset-0 bg-gradient-to-t from-espresso-panel via-transparent to-transparent"></div>
          ${product.badge ? `
            <span class="absolute top-4 left-4 px-3 py-1 rounded-full bg-primary/20 text-primary font-label-badge text-xs uppercase tracking-wider backdrop-blur-md border border-primary/30 font-bold">
              ${product.badge}
            </span>
          ` : ''}
        </div>

        <div class="p-6 space-y-4">
          <div>
            <div class="flex items-center justify-between">
              <h2 class="font-headline-lg text-headline-md text-gold-cream uppercase tracking-wide">${product.title}</h2>
              <span class="font-label-price text-xl text-primary font-bold">₹${product.price}</span>
            </div>
            <p class="font-editorial-quote text-body-md text-on-surface-variant italic mt-1">${product.desc || product.description || ''}</p>
          </div>

          <!-- Formulation Specs -->
          <div class="grid grid-cols-2 gap-2 text-xs">
            <div class="p-2.5 rounded-lg bg-surface-container-low border border-primary/10">
              <span class="text-on-surface-variant block text-[10px] uppercase font-label-badge">Couverture Purity</span>
              <span class="text-gold-light font-semibold">${product.couverture || '70.5% Belgian Callebaut'}</span>
            </div>
            <div class="p-2.5 rounded-lg bg-surface-container-low border border-primary/10">
              <span class="text-on-surface-variant block text-[10px] uppercase font-label-badge">Portion Mass</span>
              <span class="text-gold-light font-semibold">${product.weight || '110g'}</span>
            </div>
            <div class="p-2.5 rounded-lg bg-surface-container-low border border-primary/10">
              <span class="text-on-surface-variant block text-[10px] uppercase font-label-badge">Dietary Compliance</span>
              <span class="text-whatsapp-green font-semibold">100% Eggless • Zero Gelatin</span>
            </div>
            <div class="p-2.5 rounded-lg bg-surface-container-low border border-primary/10">
              <span class="text-on-surface-variant block text-[10px] uppercase font-label-badge">Warming Recommendation</span>
              <span class="text-gold-light font-semibold">8–10 Sec in Microwave (Molten)</span>
            </div>
          </div>

          <div class="pt-2 flex items-center justify-between gap-3">
            <button id="modalAddOrderBtn" class="flex-1 py-3 rounded-xl bg-gradient-to-r from-gold-hover to-primary-container text-espresso-deep font-label-action text-label-action uppercase tracking-widest font-bold hover:brightness-110 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2">
              <span class="material-symbols-outlined text-[18px]">add_shopping_cart</span>
              <span>Add to Order (₹${product.price})</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  `;

  const closeBtn = document.getElementById('closeProductDetailModal');
  const backdrop = document.getElementById('productModalBackdrop');
  const addBtn = document.getElementById('modalAddOrderBtn');

  const close = () => {
    modalEl.innerHTML = '';
  };

  if (closeBtn) closeBtn.onclick = close;
  if (backdrop) {
    backdrop.onclick = (e) => {
      if (e.target === backdrop) close();
    };
  }
  if (addBtn) {
    addBtn.onclick = () => {
      store.addToCart(product.id, 1);
      showToast(`${product.title} added to bag`, 'shopping_bag');
      close();
    };
  }
}

// Global binding for convenience
if (typeof window !== 'undefined') {
  window.openProductDetailModal = openProductDetailModal;
}
