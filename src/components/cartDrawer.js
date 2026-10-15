import { store } from '../state/store.js';
import { showToast } from './toast.js';

export function renderCartDrawer() {
  const container = document.getElementById('cartDrawerContainer');
  if (!container) return;

  const cart = store.getCart();
  const subtotal = store.getCartSubtotal();
  const user = store.getCurrentUser();
  const isGuest = !user || user.id.includes('guest');
  const patronName = isGuest ? '' : (user.name || '');
  const patronPhone = isGuest ? '' : (user.phone || '');
  const patronAddress = isGuest ? '' : (user.address || '');
  const zones = store.state.deliveryZones;
  const selectedZoneId = container.dataset.selectedZone || 'fbd';
  const selectedZone = zones.find(z => z.id === selectedZoneId) || zones[0];
  const deliveryFee = selectedZone.fee;
  const total = subtotal + deliveryFee;

  container.innerHTML = `
    <div id="cartDrawerBackdrop" class="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex justify-end">
      <div class="relative w-full max-w-md bg-espresso-panel h-full border-l border-primary/20 flex flex-col justify-between shadow-2xl drawer-slide-in">
        
        <!-- Top bar -->
        <div class="p-space-md border-b border-primary/15 flex items-center justify-between bg-surface-container-lowest/70">
          <div class="flex items-center gap-2">
            <span class="material-symbols-outlined text-primary text-[22px]">shopping_bag</span>
            <div class="flex flex-col">
              <span class="font-headline-sm text-headline-sm text-gold-cream uppercase tracking-wide">Your Nocturne Bag</span>
              <span class="font-body-sm text-[11px] text-on-surface-variant font-mono">
                ${isGuest ? 'Fresh Convection Bakes' : `Order Identity: <strong class="text-primary">${user.name}</strong> (${user.code})`}
              </span>
            </div>
          </div>
          <button id="closeCartDrawerBtn" class="p-2 rounded-xl bg-surface-container-high text-on-surface-variant hover:text-gold-cream hover:bg-surface-bright transition-all">
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <!-- Scrollable items area -->
        <div class="flex-1 overflow-y-auto p-space-md space-y-3">
          ${cart.length === 0 ? `
            <div class="h-64 flex flex-col items-center justify-center text-center p-6 text-on-surface-variant">
              <div class="w-16 h-16 rounded-full bg-card-surface border border-primary/20 flex items-center justify-center text-primary mb-3">
                <span class="material-symbols-outlined text-[32px]">shopping_basket</span>
              </div>
              <p class="font-headline-sm text-headline-sm text-gold-cream uppercase tracking-wider mb-1">Your bag is empty</p>
              <p class="font-editorial-quote text-body-md italic max-w-xs mb-4">Nocturnal evening bake runs fill up quickly. Add your favorite 70.5% couverture treats.</p>
              <a href="#/menu" id="btn-explore-menu-from-cart" class="px-5 py-2.5 rounded-xl bg-primary text-espresso-deep font-label-action text-label-action uppercase tracking-widest font-bold hover:brightness-110 transition-all">
                Explore Menu
              </a>
            </div>
          ` : `
            <div class="space-y-3">
              ${cart.map(item => `
                <div class="p-3 rounded-xl bg-card-surface border border-outline-variant/25 flex items-center gap-3 shadow-md">
                  <img src="${item.image}" alt="${item.title}" class="w-16 h-16 rounded-lg object-cover flex-shrink-0 bg-espresso-deep border border-primary/20">
                  <div class="flex-1 min-w-0">
                    <h4 class="font-body-md text-body-md font-semibold text-on-surface truncate leading-tight">${item.title}</h4>
                    <span class="font-body-sm text-[11px] text-on-surface-variant">${item.weight} • 70% Couverture</span>
                    <div class="flex items-center justify-between mt-2">
                      <span class="font-label-price text-sm text-primary font-bold">₹${item.price * item.qty}</span>
                      <div class="flex items-center rounded-lg bg-surface-container-high px-1.5 py-0.5 border border-outline-variant/20">
                        <button class="btn-qty-minus px-1 text-on-surface-variant hover:text-primary text-sm font-bold" data-id="${item.productId}">−</button>
                        <span class="px-2 font-body-sm text-xs text-on-surface font-semibold">${item.qty}</span>
                        <button class="btn-qty-plus px-1 text-on-surface-variant hover:text-primary text-sm font-bold" data-id="${item.productId}">+</button>
                      </div>
                    </div>
                  </div>
                  <button class="btn-remove-item text-on-surface-variant/40 hover:text-error transition-colors p-1" data-id="${item.productId}" title="Remove item">
                    <span class="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              `).join('')}
            </div>

            <!-- Order Configuration Form -->
            <div class="mt-6 p-4 rounded-xl bg-surface-container-low border border-primary/15 space-y-3">
              <span class="font-label-badge text-label-badge uppercase tracking-widest text-primary block">
                NCR Evening Courier Details
              </span>

              <div>
                <label class="font-body-sm text-[11px] text-on-surface-variant uppercase tracking-wider block mb-1">Delivery Destination</label>
                <select id="checkoutZoneSelect" class="w-full px-3 py-2 rounded-lg bg-espresso-panel border border-outline-variant/40 text-gold-cream font-body-sm text-body-sm focus:outline-none focus:border-primary cursor-pointer">
                  ${zones.map(z => `
                    <option value="${z.id}" ${z.id === selectedZone.id ? 'selected' : ''}>
                      ${z.name} ${z.fee === 0 ? '(Free)' : `(+₹${z.fee})`} • ${z.time}
                    </option>
                  `).join('')}
                </select>
              </div>

              <div>
                <label class="font-body-sm text-[11px] text-on-surface-variant uppercase tracking-wider block mb-1">Delivery Address</label>
                <textarea id="checkoutAddressInput" rows="2" placeholder="House/Flat No., Tower, Street, Landmark, Pincode"
                  class="w-full px-3 py-2 rounded-lg bg-espresso-panel border border-outline-variant/40 text-on-surface font-body-sm text-body-sm focus:outline-none focus:border-primary resize-none">${patronAddress}</textarea>
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label class="font-body-sm text-[11px] text-on-surface-variant uppercase tracking-wider block mb-1">Patron Name</label>
                  <input type="text" id="checkoutNameInput" value="${patronName}" placeholder="Full Name"
                    class="w-full px-3 py-1.5 rounded-lg bg-espresso-panel border border-outline-variant/40 text-on-surface font-body-sm text-body-sm focus:outline-none focus:border-primary">
                </div>
                <div>
                  <label class="font-body-sm text-[11px] text-on-surface-variant uppercase tracking-wider block mb-1">WhatsApp Phone</label>
                  <input type="text" id="checkoutPhoneInput" value="${patronPhone}" placeholder="+91 98110..."
                    class="w-full px-3 py-1.5 rounded-lg bg-espresso-panel border border-outline-variant/40 text-on-surface font-body-sm text-body-sm focus:outline-none focus:border-primary">
                </div>
              </div>

              <div>
                <label class="font-body-sm text-[11px] text-on-surface-variant uppercase tracking-wider block mb-1">Email / Receipt Destination</label>
                <input type="email" id="checkoutEmailInput" value="${user.id && !user.id.includes('guest') ? user.id : ''}" placeholder="patron@gmail.com (for live tracking)"
                  class="w-full px-3 py-1.5 rounded-lg bg-espresso-panel border border-outline-variant/40 text-on-surface font-body-sm text-body-sm focus:outline-none focus:border-primary">
              </div>

              <div>
                <label class="font-body-sm text-[11px] text-on-surface-variant uppercase tracking-wider block mb-1">Special Gift Note / Instructions</label>
                <input type="text" id="checkoutNoteInput" placeholder="e.g. Calligraphy note: Happy Birthday!"
                  class="w-full px-3 py-1.5 rounded-lg bg-espresso-panel border border-outline-variant/40 text-on-surface font-body-sm text-body-sm focus:outline-none focus:border-primary">
              </div>

              <div>
                <label class="font-body-sm text-[11px] text-on-surface-variant uppercase tracking-wider block mb-1">Payment Method</label>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <label class="flex items-center gap-2 p-2 rounded-lg bg-espresso-panel border border-primary/30 cursor-pointer">
                    <input type="radio" name="paymentMethod" value="upi" checked class="accent-primary">
                    <span class="font-body-sm text-xs text-gold-cream">Instant UPI / QR</span>
                  </label>
                  <label class="flex items-center gap-2 p-2 rounded-lg bg-espresso-panel border border-outline-variant/30 cursor-pointer">
                    <input type="radio" name="paymentMethod" value="cod" class="accent-primary">
                    <span class="font-body-sm text-xs text-on-surface">Cash on Evening Run</span>
                  </label>
                </div>
              </div>
            </div>
          `}
        </div>

        <!-- Bottom Checkout Bar -->
        ${cart.length > 0 ? `
          <div class="p-space-md border-t border-primary/15 bg-surface-container-lowest/90 space-y-2">
            <div class="space-y-1 text-body-sm text-on-surface-variant">
              <div class="flex justify-between">
                <span>Confections Subtotal</span>
                <span class="text-on-surface font-semibold">₹${subtotal}</span>
              </div>
              <div class="flex justify-between">
                <span>Courier SLA (${selectedZone.name})</span>
                <span class="text-gold-light">${deliveryFee === 0 ? 'Free Atelier Courier' : `₹${deliveryFee}`}</span>
              </div>
              <div class="flex justify-between pt-1 border-t border-primary/10 text-base font-bold text-gold-cream">
                <span>Grand Total</span>
                <span class="font-label-price text-lg text-primary">₹${total}</span>
              </div>
            </div>

            <button id="btnPlaceOrderSubmit" class="w-full py-3.5 rounded-xl bg-gradient-to-r from-gold-hover via-primary-container to-primary text-espresso-deep font-label-action text-label-action tracking-[0.18em] uppercase font-bold hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_8px_24px_rgba(200,151,58,0.25)] flex items-center justify-center gap-2">
              <span class="material-symbols-outlined text-[19px]">local_fire_department</span>
              <span>Confirm & Place Nocturne Order</span>
            </button>
            <p class="text-center font-editorial-eyebrow text-[10px] text-on-surface-variant/70 uppercase tracking-widest">
              Shift window starts 18:30 IST • 100% Eggless • Belgian Couverture
            </p>
          </div>
        ` : ''}

      </div>
    </div>
  `;

  // Attach event handlers
  const closeBtn = document.getElementById('closeCartDrawerBtn');
  const backdrop = document.getElementById('cartDrawerBackdrop');
  const close = () => {
    container.innerHTML = '';
  };

  if (closeBtn) closeBtn.onclick = close;
  if (backdrop) {
    backdrop.onclick = (e) => {
      if (e.target === backdrop) close();
    };
  }

  const exploreBtn = document.getElementById('btn-explore-menu-from-cart');
  if (exploreBtn) {
    exploreBtn.onclick = () => {
      close();
      window.location.hash = '#/menu';
    };
  }

  // Zone select
  const zoneSelect = document.getElementById('checkoutZoneSelect');
  if (zoneSelect) {
    zoneSelect.onchange = (e) => {
      container.dataset.selectedZone = e.target.value;
      renderCartDrawer();
    };
  }

  // Qty minus / plus / remove
  container.querySelectorAll('.btn-qty-minus').forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-id');
      const item = cart.find(c => c.productId === id);
      if (item) {
        store.updateCartQty(id, item.qty - 1);
        renderCartDrawer();
      }
    };
  });

  container.querySelectorAll('.btn-qty-plus').forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-id');
      const item = cart.find(c => c.productId === id);
      if (item) {
        store.updateCartQty(id, item.qty + 1);
        renderCartDrawer();
      }
    };
  });

  container.querySelectorAll('.btn-remove-item').forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-id');
      store.removeFromCart(id);
      renderCartDrawer();
      showToast('Item removed from order', 'remove_shopping_cart');
    };
  });

  // Place Order Submit
  const placeOrderBtn = document.getElementById('btnPlaceOrderSubmit');
  if (placeOrderBtn) {
    placeOrderBtn.onclick = () => {
      const customerName = document.getElementById('checkoutNameInput')?.value.trim() || user.name || 'Valued Patron';
      const customerPhone = document.getElementById('checkoutPhoneInput')?.value.trim() || user.phone || '+91 98110 00000';
      const customerEmail = document.getElementById('checkoutEmailInput')?.value.trim() || (user.id && !user.id.includes('guest') ? user.id : 'patron@ganachly.com');
      const address = document.getElementById('checkoutAddressInput')?.value.trim();
      const zone = document.getElementById('checkoutZoneSelect')?.value || 'fbd';
      const specialNote = document.getElementById('checkoutNoteInput')?.value.trim() || 'Handcrafted fresh for evening bake dispatch.';
      const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || 'upi';

      if (!address) {
        showToast('Please enter your delivery address', 'error', 'NCR Courier Address Required');
        const addrEl = document.getElementById('checkoutAddressInput');
        if (addrEl) {
          addrEl.focus();
          addrEl.classList.add('ring-2', 'ring-primary');
          setTimeout(() => addrEl.classList.remove('ring-2', 'ring-primary'), 2500);
        }
        return;
      }

      placeOrderBtn.disabled = true;
      placeOrderBtn.innerHTML = `<span class="material-symbols-outlined text-[19px] animate-spin">sync</span><span>Securing Oven Hearth Batch...</span>`;

      try {
        const order = store.placeOrder({
          customerName,
          customerEmail,
          customerPhone,
          address,
          zone,
          specialNote,
          paymentMethod
        });

        if (order) {
          close();
          renderOrderConfirmationModal(order);
          showToast(`Order #${order.id} confirmed! Live batch dispatched to oven.`, 'oven_gen', 'Fresh 70% Couverture');
        } else {
          placeOrderBtn.disabled = false;
          placeOrderBtn.innerHTML = `<span class="material-symbols-outlined text-[19px]">local_fire_department</span><span>Confirm & Place Nocturne Order</span>`;
          showToast('Cart is empty. Please add confections to place an order.', 'error');
        }
      } catch (err) {
        console.error('Order placement error:', err);
        placeOrderBtn.disabled = false;
        placeOrderBtn.innerHTML = `<span class="material-symbols-outlined text-[19px]">local_fire_department</span><span>Confirm & Place Nocturne Order</span>`;
        showToast('An error occurred while securing your order. Please try again.', 'error');
      }
    };
  }
}

function renderOrderConfirmationModal(order) {
  let modalContainer = document.getElementById('orderModalContainer');
  if (!modalContainer) {
    modalContainer = document.createElement('div');
    modalContainer.id = 'orderModalContainer';
    document.body.appendChild(modalContainer);
  }

  modalContainer.innerHTML = `
    <div id="confirmationBackdrop" class="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div class="relative w-full max-w-lg bg-espresso-panel border border-primary/30 rounded-2xl p-6 md:p-8 shadow-2xl modal-fade-in text-center">
        
        <div class="w-16 h-16 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center text-primary mx-auto mb-4">
          <span class="material-symbols-outlined text-[34px] animate-bounce">check_circle</span>
        </div>

        <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/15 text-primary font-label-badge text-label-badge uppercase tracking-wider mb-2">
          <span>Hearth Batch Allocated</span>
        </div>

        <h3 class="font-headline-lg text-headline-lg text-gold-light uppercase tracking-wide leading-none mb-2">
          Order #${order.id} Logged!
        </h3>

        <p class="font-editorial-quote text-body-md text-on-surface-variant italic mb-4">
          “Thank you, ${order.customerName}. Your 70.5% couverture bakes are scheduled for tonight's evening convection oven run.”
        </p>

        <!-- Order Summary Box -->
        <div class="p-4 rounded-xl bg-card-surface border border-outline-variant/30 text-left space-y-2 mb-6">
          <div class="flex justify-between items-center text-xs text-on-surface-variant font-mono">
            <span>Identity ID: <strong class="text-gold-cream">${order.customerEmail}</strong></span>
            <span class="px-2 py-0.5 rounded bg-primary/20 text-primary font-bold">${order.stageLabel}</span>
          </div>
          <div class="text-sm font-semibold text-gold-cream border-t border-primary/10 pt-2">
            ${order.items.map(i => `<div>${i.qty}x ${i.title} (₹${i.price * i.qty})</div>`).join('')}
          </div>
          <div class="flex justify-between items-center text-xs text-on-surface-variant border-t border-primary/10 pt-2">
            <span>Destination: ${order.zone}</span>
            <span class="font-bold text-primary font-label-price text-sm">Total: ₹${order.total}</span>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row gap-3">
          <a href="#/my-orders" id="btnTrackOrderFromConfirm" class="flex-1 py-3 rounded-xl bg-gradient-to-r from-gold-hover to-primary text-espresso-deep font-label-action text-label-action tracking-wider uppercase font-bold hover:brightness-110 transition-all shadow-md flex items-center justify-center gap-2">
            <span class="material-symbols-outlined text-[18px]">track_changes</span>
            <span>Track My Order Live</span>
          </a>
          <button id="btnCloseConfirmBtn" class="px-5 py-3 rounded-xl bg-surface-container-high text-gold-cream font-label-action text-label-action tracking-wider hover:bg-surface-bright transition-all">
            Continue Browsing
          </button>
        </div>

      </div>
    </div>
  `;

  const closeBtn = document.getElementById('btnCloseConfirmBtn');
  const trackBtn = document.getElementById('btnTrackOrderFromConfirm');
  const backdrop = document.getElementById('confirmationBackdrop');

  const closeConfirm = () => {
    modalContainer.innerHTML = '';
  };

  if (closeBtn) closeBtn.onclick = closeConfirm;
  if (trackBtn) {
    trackBtn.onclick = () => {
      closeConfirm();
      window.location.hash = '#/my-orders';
    };
  }
  if (backdrop) {
    backdrop.onclick = (e) => {
      if (e.target === backdrop) closeConfirm();
    };
  }
}

// Global hook
window.openCartDrawer = renderCartDrawer;
