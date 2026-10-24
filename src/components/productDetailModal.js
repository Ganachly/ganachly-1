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
    <div id="productModalBackdrop" class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div class="relative w-full max-w-lg bg-espresso-panel border border-primary/30 rounded-2xl overflow-hidden shadow-2xl modal-fade-in max-h-[92vh] overflow-y-auto my-auto">
        
        <button id="closeProductDetailModal" class="absolute top-3 right-3 sm:top-4 sm:right-4 z-10 p-2 rounded-xl bg-black/60 text-gold-cream hover:bg-black transition-all">
          <span class="material-symbols-outlined text-[20px]">close</span>
        </button>

        <div class="h-44 sm:h-60 w-full relative bg-espresso-deep">
          <img src="${(typeof window !== 'undefined' && window.normalizeImageUrl) ? window.normalizeImageUrl(product.image, product.category) : (product.image || '')}" 
               alt="${product.title}" 
               class="w-full h-full object-cover"
               loading="lazy"
               decoding="async"
               referrerpolicy="no-referrer"
               onerror="window.handleProductImageError ? window.handleProductImageError(this, '${encodeURIComponent(product.image || '')}', '${(product.category || '').replace(/'/g, "\\'")}') : (this.src='https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80');">
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
            <div class="flex items-center gap-1.5 bg-surface-container-low border border-primary/30 rounded-xl px-2.5 py-1">
              <span class="text-[10px] text-on-surface-variant font-label-badge uppercase font-bold mr-1">Qty</span>
              <button id="modalQtyMinus" class="w-7 h-7 rounded-lg bg-surface-container-high hover:bg-surface-bright text-gold-cream font-bold text-sm flex items-center justify-center transition-all">
                −
              </button>
              <span id="modalQtyDisplay" class="font-body-md text-gold-cream font-bold text-sm min-w-[1.25rem] text-center">1</span>
              <button id="modalQtyPlus" class="w-7 h-7 rounded-lg bg-surface-container-high hover:bg-surface-bright text-gold-cream font-bold text-sm flex items-center justify-center transition-all">
                +
              </button>
            </div>

            <a id="modalWhatsAppOrderBtn" href="https://wa.me/919810757880?text=Hello%20Chef%20Hardik,%20I%20would%20like%20to%20order%201x%20${encodeURIComponent(product.title)}%20(₹${product.price})" target="_blank" rel="noopener noreferrer" class="flex-1 py-3 rounded-xl bg-whatsapp-green text-white font-label-action text-xs uppercase tracking-widest font-bold hover:brightness-110 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-1.5">
              <span class="material-symbols-outlined text-[18px]">chat</span>
              <span id="modalAddBtnText">Order on WhatsApp (₹${product.price})</span>
            </a>
          </div>
        </div>

      </div>
    </div>
  `;

  let selectedQty = 1;

  const closeBtn = document.getElementById('closeProductDetailModal');
  const backdrop = document.getElementById('productModalBackdrop');
  const whatsappBtn = document.getElementById('modalWhatsAppOrderBtn');
  const minusBtn = document.getElementById('modalQtyMinus');
  const plusBtn = document.getElementById('modalQtyPlus');
  const qtyDisplay = document.getElementById('modalQtyDisplay');
  const addBtnText = document.getElementById('modalAddBtnText');

  const close = () => {
    modalEl.innerHTML = '';
  };

  const updateWhatsAppHref = () => {
    if (whatsappBtn && addBtnText) {
      addBtnText.textContent = `Order on WhatsApp ${selectedQty > 1 ? selectedQty + 'x ' : ''}(₹${product.price * selectedQty})`;
      whatsappBtn.href = `https://wa.me/919810757880?text=Hello%20Chef%20Hardik,%20I%20would%20like%20to%20order%20${selectedQty}x%20${encodeURIComponent(product.title)}%20(Total:%20₹${product.price * selectedQty})`;
    }
  };

  if (closeBtn) closeBtn.onclick = close;
  if (backdrop) {
    backdrop.onclick = (e) => {
      if (e.target === backdrop) close();
    };
  }

  if (minusBtn && plusBtn && qtyDisplay) {
    minusBtn.onclick = () => {
      if (selectedQty > 1) {
        selectedQty--;
        qtyDisplay.textContent = selectedQty;
        updateWhatsAppHref();
      }
    };
    plusBtn.onclick = () => {
      selectedQty++;
      qtyDisplay.textContent = selectedQty;
      updateWhatsAppHref();
    };
  }
}

// Global binding for convenience
if (typeof window !== 'undefined') {
  window.openProductDetailModal = openProductDetailModal;
}
