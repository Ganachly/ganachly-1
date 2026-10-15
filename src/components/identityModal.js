import { store } from '../state/store.js';
import { defaultGuestUser } from '../data/initialData.js';
import { showToast } from './toast.js';
import { firebaseSignOutUser } from '../services/firebase.js';

let isEditingProfile = false;

export function renderProfileModal() {
  const modalEl = document.getElementById('identityModalContainer');
  if (!modalEl) return;

  const currentUser = store.getCurrentUser() || defaultGuestUser;
  const cartCount = store.getCartCount();
  const customerOrders = store.getOrdersForCustomer(currentUser?.id || '');
  const activeOrdersCount = customerOrders.filter(o => o.stage !== 'completed').length;
  const isGuest = !currentUser || (currentUser.id || '').includes('guest') || currentUser.id === 'guest@ganachly.com';
  const isAdmin = currentUser && currentUser.role === 'admin';

  modalEl.innerHTML = `
    <div id="identityModalBackdrop" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div class="relative w-full max-w-2xl bg-espresso-panel border border-primary/25 rounded-2xl p-4 sm:p-6 md:p-8 shadow-2xl modal-fade-in my-4 sm:my-8 text-on-surface">
        
        <!-- Close Button -->
        <button id="closeProfileModalBtn" class="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-xl bg-surface-container-high text-on-surface-variant hover:text-gold-cream hover:bg-surface-bright transition-all" title="Close Profile">
          <span class="material-symbols-outlined text-[20px]">close</span>
        </button>

        <!-- Header -->
        <div class="flex items-center gap-3 mb-6">
          <div class="w-11 h-11 rounded-xl bg-card-surface border border-primary/30 flex items-center justify-center text-primary shadow-sm">
            <span class="material-symbols-outlined text-[24px]">account_circle</span>
          </div>
          <div>
            <h2 class="font-headline-md text-headline-md text-gold-light uppercase tracking-wide leading-none">
              Patron Profile & Account Details
            </h2>
            <p class="font-editorial-eyebrow text-gold-cream text-[11px] uppercase tracking-widest mt-0.5">
              Personal coordinates, delivery address & live order telemetry
            </p>
          </div>
        </div>

        <!-- HERO IDENTITY CARD -->
        <div class="p-5 rounded-2xl bg-card-surface border border-primary/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg relative overflow-hidden">
          <div class="flex items-center gap-4">
            <!-- Avatar with emoji picker indicator -->
            <div class="relative group">
              <div class="w-14 h-14 rounded-2xl bg-surface-container-high border border-primary/40 flex items-center justify-center text-3xl shadow-inner group-hover:scale-105 transition-transform">
                ${currentUser.avatar || '👤'}
              </div>
            </div>

            <div>
              <div class="flex items-center gap-2">
                <h3 class="font-body-md text-lg font-bold text-on-surface leading-snug">${currentUser.name}</h3>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-label-badge uppercase tracking-wider font-bold ${isAdmin ? 'bg-primary text-espresso-deep' : 'bg-secondary text-espresso-deep'}">
                  ${currentUser.role.toUpperCase()}
                </span>
                <span class="material-symbols-outlined text-primary text-[16px]" title="Verified Patron">verified</span>
              </div>
              <p class="font-body-sm text-xs text-on-surface-variant font-mono mt-0.5">
                Ref: <span class="text-gold-cream font-bold">${currentUser.code || 'GAN-CUST'}</span> • <span class="text-primary">${currentUser.title || 'Patron'}</span>
              </p>
              <p class="text-[11px] text-on-surface-variant font-mono truncate max-w-[280px]">
                ${currentUser.id}
              </p>
            </div>
          </div>

          <!-- Quick Live Stats Pills -->
          <div class="flex sm:flex-col gap-2">
            <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container border border-outline-variant/30 text-xs">
              <span class="material-symbols-outlined text-primary text-[16px]">local_shipping</span>
              <span class="font-mono text-gold-cream font-bold">${activeOrdersCount}</span>
              <span class="text-on-surface-variant text-[11px]">Active Orders</span>
            </div>
            <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container border border-outline-variant/30 text-xs">
              <span class="material-symbols-outlined text-primary text-[16px]">shopping_bag</span>
              <span class="font-mono text-gold-cream font-bold">${cartCount}</span>
              <span class="text-on-surface-variant text-[11px]">In Bag</span>
            </div>
          </div>
        </div>

        <!-- DETAILS VIEW (ALL DETAILS PRESENT) -->
        <div class="mt-6 space-y-4">
          <div class="flex items-center justify-between">
            <h4 class="font-label-badge uppercase tracking-widest text-gold-cream text-[11px] flex items-center gap-1.5">
              <span class="material-symbols-outlined text-[16px] text-primary">contact_mail</span>
              <span>Account & Delivery Details</span>
            </h4>
            <button id="btn-toggle-edit-profile" class="text-xs font-label-action text-primary hover:text-gold-light uppercase tracking-wider flex items-center gap-1 transition-colors px-2.5 py-1 rounded-lg bg-surface-container-high border border-primary/20">
              <span class="material-symbols-outlined text-[14px]">${isEditingProfile ? 'close' : 'edit'}</span>
              <span>${isEditingProfile ? 'Cancel Edit' : 'Edit Details'}</span>
            </button>
          </div>

          <!-- VIEW MODE: ALL DETAILS PRESENT -->
          <div id="profile-details-display" class="${isEditingProfile ? 'hidden' : 'block'}">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              
              <!-- Email / Customer ID -->
              <div class="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/25">
                <span class="text-[10px] font-label-badge uppercase tracking-wider text-on-surface-variant block mb-1">
                  Email Address / Customer ID
                </span>
                <p class="font-body-md text-xs font-semibold text-on-surface font-mono truncate">
                  ${currentUser.id}
                </p>
              </div>

              <!-- Phone / WhatsApp -->
              <div class="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/25">
                <span class="text-[10px] font-label-badge uppercase tracking-wider text-on-surface-variant block mb-1">
                  WhatsApp Contact Mobile
                </span>
                <p class="font-body-md text-xs font-semibold text-on-surface font-mono">
                  ${currentUser.phone || '+91 98110 00192'}
                </p>
              </div>

              <!-- NCR Delivery Zone -->
              <div class="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/25">
                <span class="text-[10px] font-label-badge uppercase tracking-wider text-on-surface-variant block mb-1">
                  NCR Delivery Zone
                </span>
                <p class="font-body-md text-xs font-semibold text-gold-cream flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-primary text-[15px]">location_on</span>
                  <span>${currentUser.zone || 'Faridabad (Sector 14-21)'}</span>
                </p>
              </div>

              <!-- Dispatch Slot -->
              <div class="p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/25">
                <span class="text-[10px] font-label-badge uppercase tracking-wider text-on-surface-variant block mb-1">
                  Courier Evening Dispatch
                </span>
                <p class="font-body-md text-xs font-semibold text-on-surface flex items-center gap-1.5">
                  <span class="material-symbols-outlined text-whatsapp-green text-[15px]">schedule</span>
                  <span>6:30 PM - 9:30 PM Daily</span>
                </p>
              </div>

            </div>

            <!-- Full Saved Address -->
            <div class="mt-3 p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/25">
              <span class="text-[10px] font-label-badge uppercase tracking-wider text-on-surface-variant block mb-1">
                Primary Delivery Address
              </span>
              <p class="font-body-md text-xs text-on-surface leading-relaxed">
                ${currentUser.address || 'Pocket A, Sector 14, Faridabad, Haryana - 121007'}
              </p>
            </div>
          </div>

          <!-- EDIT MODE: FORM -->
          <form id="profile-edit-form" class="${isEditingProfile ? 'block' : 'hidden'} space-y-3 p-4 rounded-xl bg-surface-container-low border border-primary/30">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="text-[11px] font-label-badge uppercase text-gold-cream mb-1 block">Full Name</label>
                <input id="input-edit-name" type="text" value="${currentUser.name}" required
                  class="w-full px-3 py-2 rounded-lg bg-surface-container text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary border border-outline-variant/30">
              </div>
              <div>
                <label class="text-[11px] font-label-badge uppercase text-gold-cream mb-1 block">WhatsApp Mobile</label>
                <input id="input-edit-phone" type="tel" value="${currentUser.phone || '+91 98110 00192'}" required
                  class="w-full px-3 py-2 rounded-lg bg-surface-container text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary border border-outline-variant/30">
              </div>
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="text-[11px] font-label-badge uppercase text-gold-cream mb-1 block">NCR Delivery Zone</label>
                <select id="input-edit-zone" class="w-full px-3 py-2 rounded-lg bg-surface-container text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary border border-outline-variant/30">
                  <option value="Faridabad" ${currentUser.zone?.includes('Faridabad') ? 'selected' : ''}>Faridabad (Sector 14-21)</option>
                  <option value="Gurugram" ${currentUser.zone?.includes('Gurugram') ? 'selected' : ''}>Gurugram (Cyber City / Golf Course)</option>
                  <option value="South Delhi" ${currentUser.zone?.includes('Delhi') ? 'selected' : ''}>South Delhi (GK / Defence Colony)</option>
                  <option value="Noida" ${currentUser.zone?.includes('Noida') ? 'selected' : ''}>Noida (Sector 18 / Expressway)</option>
                  <option value="Ghaziabad" ${currentUser.zone?.includes('Ghaziabad') ? 'selected' : ''}>Ghaziabad (Indirapuram)</option>
                </select>
              </div>
              <div>
                <label class="text-[11px] font-label-badge uppercase text-gold-cream mb-1 block">Avatar Persona</label>
                <select id="input-edit-avatar" class="w-full px-3 py-2 rounded-lg bg-surface-container text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary border border-outline-variant/30">
                  <option value="👤" ${currentUser.avatar === '👤' ? 'selected' : ''}>👤 Classic Connoisseur</option>
                  <option value="🛍️" ${currentUser.avatar === '🛍️' ? 'selected' : ''}>🛍️ Luxury Shopper</option>
                  <option value="👨‍🍳" ${currentUser.avatar === '👨‍🍳' ? 'selected' : ''}>👨‍🍳 Master Chef</option>
                  <option value="👑" ${currentUser.avatar === '👑' ? 'selected' : ''}>👑 Royal Patron</option>
                  <option value="✨" ${currentUser.avatar === '✨' ? 'selected' : ''}>✨ Ganache Lover</option>
                  <option value="🍫" ${currentUser.avatar === '🍫' ? 'selected' : ''}>🍫 Couverture Fanatic</option>
                </select>
              </div>
            </div>

            <div>
              <label class="text-[11px] font-label-badge uppercase text-gold-cream mb-1 block">Delivery Street Address</label>
              <textarea id="input-edit-address" rows="2" required
                class="w-full px-3 py-2 rounded-lg bg-surface-container text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary border border-outline-variant/30">${currentUser.address || 'Pocket A, Sector 14, Faridabad, Haryana - 121007'}</textarea>
            </div>

            <button type="submit" class="w-full py-2.5 rounded-xl bg-gradient-to-r from-gold-hover to-primary-container text-espresso-deep font-label-action text-xs uppercase tracking-widest font-bold hover:brightness-110 active:scale-95 transition-all shadow-md">
              Save Profile Changes
            </button>
          </form>
        </div>

        <!-- QUICK ACCESS ACTIONS -->
        <div class="mt-6 pt-5 border-t border-primary/20 flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-2">
            <a href="#/my-orders" id="btn-modal-my-orders" class="px-3.5 py-2 rounded-xl bg-surface-container-high hover:bg-surface-bright text-gold-cream hover:text-primary transition-all text-xs font-label-action uppercase tracking-wider flex items-center gap-1.5 border border-outline-variant/20">
              <span class="material-symbols-outlined text-[16px]">receipt_long</span>
              <span>My Orders & Invoices</span>
            </a>

            ${isAdmin ? `
              <a href="#/admin/batches" id="btn-modal-admin" class="px-3.5 py-2 rounded-xl bg-primary text-espresso-deep hover:brightness-110 transition-all text-xs font-label-action uppercase tracking-wider flex items-center gap-1.5 font-bold shadow-sm">
                <span class="material-symbols-outlined text-[16px]">oven_gen</span>
                <span>Atelier Console</span>
              </a>
            ` : ''}
          </div>

          <div class="flex items-center gap-2">
            <a href="#/login" id="btn-modal-switch-login" class="px-3.5 py-2 rounded-xl bg-surface-container hover:bg-surface-bright text-on-surface-variant hover:text-gold-cream transition-all text-xs font-label-action uppercase tracking-wider flex items-center gap-1.5 border border-outline-variant/20">
              <span class="material-symbols-outlined text-[16px]">key</span>
              <span>${isGuest ? 'Sign In / Register' : 'Switch Account'}</span>
            </a>

            ${!isGuest ? `
              <button id="btn-modal-sign-out" class="px-3 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 text-red-300 transition-all text-xs font-label-action uppercase tracking-wider flex items-center gap-1.5 border border-red-500/20">
                <span class="material-symbols-outlined text-[16px]">logout</span>
                <span>Sign Out</span>
              </button>
            ` : ''}
          </div>
        </div>

      </div>
    </div>
  `;

  // Close handlers
  const closeBtn = document.getElementById('closeProfileModalBtn');
  const backdrop = document.getElementById('identityModalBackdrop');
  const close = () => {
    isEditingProfile = false;
    modalEl.innerHTML = '';
  };

  if (closeBtn) closeBtn.onclick = close;
  if (backdrop) {
    backdrop.onclick = (e) => {
      if (e.target === backdrop) close();
    };
  }

  // Toggle edit profile view
  const toggleEditBtn = document.getElementById('btn-toggle-edit-profile');
  if (toggleEditBtn) {
    toggleEditBtn.onclick = () => {
      isEditingProfile = !isEditingProfile;
      renderProfileModal();
    };
  }

  // Handle edit form submit
  const editForm = document.getElementById('profile-edit-form');
  if (editForm) {
    editForm.onsubmit = (e) => {
      e.preventDefault();
      const updatedName = document.getElementById('input-edit-name')?.value.trim() || currentUser.name;
      const updatedPhone = document.getElementById('input-edit-phone')?.value.trim() || currentUser.phone;
      const updatedZone = document.getElementById('input-edit-zone')?.value || currentUser.zone;
      const updatedAvatar = document.getElementById('input-edit-avatar')?.value || currentUser.avatar;
      const updatedAddress = document.getElementById('input-edit-address')?.value.trim() || currentUser.address;

      const updatedUser = {
        ...currentUser,
        name: updatedName,
        phone: updatedPhone,
        zone: updatedZone,
        avatar: updatedAvatar,
        address: updatedAddress
      };

      store.setCurrentUser(updatedUser);
      showToast('Profile details updated successfully!', 'check_circle', 'Saved');
      isEditingProfile = false;
      renderProfileModal();
      window.refreshCurrentPage();
    };
  }

  // Route nav links inside modal
  const myOrdersBtn = document.getElementById('btn-modal-my-orders');
  if (myOrdersBtn) {
    myOrdersBtn.onclick = () => close();
  }

  const adminBtn = document.getElementById('btn-modal-admin');
  if (adminBtn) {
    adminBtn.onclick = () => close();
  }

  const switchLoginBtn = document.getElementById('btn-modal-switch-login');
  if (switchLoginBtn) {
    switchLoginBtn.onclick = () => close();
  }

  // Sign out button
  const signOutBtn = document.getElementById('btn-modal-sign-out');
  if (signOutBtn) {
    signOutBtn.onclick = async () => {
      await firebaseSignOutUser();
      store.setCurrentUser(defaultGuestUser);
      showToast('Signed out of session', 'logout');
      close();
      window.refreshCurrentPage();
    };
  }
}

// Global hooks for backwards compatibility
export const renderIdentityModal = renderProfileModal;
window.openProfileModal = renderProfileModal;
window.openIdentityModal = renderProfileModal;
