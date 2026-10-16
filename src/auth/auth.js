import { store } from '../state/store.js';
import { initialPersonas } from '../data/initialData.js';

export const auth = {
  getPersonas() {
    return initialPersonas;
  },

  getCurrentUser() {
    return store.getCurrentUser();
  },

  isAdmin() {
    const user = store.getCurrentUser();
    if (!user) return false;
    const email = (user.id || user.email || '').toLowerCase().trim();
    return user.role === 'admin' || email === 'hardikkush987@gmail.com' || email === 'admin@ganachly.com';
  },

  isStaffOrAdmin() {
    return this.isAdmin();
  },

  isCustomer() {
    return !this.isAdmin();
  },

  switchPersona(personaId) {
    const persona = initialPersonas.find(p => p.id === personaId || p.code === personaId);
    if (persona) {
      store.setCurrentUser(persona);
      return persona;
    }
    return null;
  },

  loginCustom({ id, code, name, role = 'customer', avatar, phone, zone, address }) {
    return store.loginWithCustomId({ id, code, name, role, avatar, phone, zone, address });
  },

  /**
   * Renders the Atelier Security Gate when a non-admin tries to enter /admin
   */
  renderRestrictedGate(targetPath = '#/admin') {
    const user = store.getCurrentUser();
    return `
      <div class="min-h-screen bg-espresso-deep flex items-center justify-center px-4 py-12 relative overflow-hidden">
        <!-- Ambient Background Glow -->
        <div class="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-ambient-glow rounded-full blur-[140px] pointer-events-none opacity-50"></div>
        <div class="absolute -bottom-20 right-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div class="relative z-10 max-w-lg w-full bg-card-surface/90 border border-primary/20 rounded-2xl p-space-xl shadow-2xl backdrop-blur-xl text-center">
          <div class="w-16 h-16 rounded-2xl bg-espresso-panel border border-primary/30 flex items-center justify-center mx-auto mb-space-md shadow-lg">
            <span class="material-symbols-outlined text-primary text-[32px]">lock</span>
          </div>

          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high/80 mb-space-sm">
            <span class="w-2 h-2 rounded-full bg-badge-weekend animate-pulse"></span>
            <span class="font-editorial-eyebrow text-editorial-eyebrow text-gold-cream uppercase tracking-widest text-[11px]">Admin Access Gate</span>
          </div>

          <h2 class="font-headline-lg text-headline-lg text-gold-light uppercase tracking-wider mb-space-xs">
            Admin Portal Only
          </h2>

          <p class="font-editorial-quote text-body-md text-on-surface-variant italic mb-space-md leading-relaxed">
            The live hearth dispatch, couverture vault, and oven telemetry are restricted exclusively to Master Patissier Admin.
          </p>

          <!-- Current Active Identity Pill -->
          <div class="p-space-sm rounded-xl bg-surface-container-low border border-outline-variant/30 text-left mb-space-lg flex items-center justify-between">
            <div class="flex items-center gap-3">
              <span class="text-2xl">${user.avatar || '🛍️'}</span>
              <div class="flex flex-col">
                <span class="font-body-md text-body-md font-semibold text-on-surface leading-tight">${user.name}</span>
                <span class="font-body-sm text-body-sm text-on-surface-variant">${user.id} • ${user.code}</span>
              </div>
            </div>
            <span class="px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-badge text-label-badge uppercase">
              ${user.role}
            </span>
          </div>

          <!-- Action: Sign in with Admin Credentials on /admin -->
          <div class="space-y-space-sm">
            <a href="#/admin" class="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-gold-hover to-primary-container text-espresso-deep font-label-action text-label-action uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 font-bold">
              <span class="material-symbols-outlined text-[18px]">key</span>
              <span>Sign In with Admin Credentials (/admin)</span>
            </a>

            <a href="#/" class="inline-block pt-2 text-on-surface-variant hover:text-primary font-body-sm text-body-sm transition-colors">
              ← Return to Ganachly Customer Storefront
            </a>
          </div>
        </div>
      </div>
    `;
  },

  setupRestrictedGateEvents() {
    // Restricted gate provides direct link to #/login
  }
};
