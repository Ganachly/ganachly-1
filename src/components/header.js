import { store } from '../state/store.js';

export function renderStorefrontHeader(activeRoute = '#/') {
  const user = store.getCurrentUser();
  const isAdmin = user && user.role === 'admin';

  const isHome = activeRoute === '#/' || activeRoute === '#/home' || !activeRoute;
  const isMenu = activeRoute === '#/menu';
  const isStory = activeRoute === '#/story' || activeRoute === '#/our-story';
  const isGifting = activeRoute === '#/gifting' || activeRoute === '#/gifting-and-bulk';

  return `
    <header class="fixed top-0 left-0 right-0 z-50 bg-espresso-deep/90 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.5)]">
      <!-- Announcement Bar -->
      <div class="bg-surface-container-lowest text-center py-space-xs px-margin border-b border-primary/10 flex items-center justify-center gap-2">
        <p class="font-editorial-eyebrow text-editorial-eyebrow text-gold-cream uppercase tracking-wider text-[11px] truncate">
          ✦ Handcrafted in Small Batches · 100% Eggless · 70.5% Belgian Callebaut Couverture
        </p>
        <span class="hidden md:inline text-primary text-[10px]">• Order via WhatsApp</span>
      </div>

      <!-- Main Navigation Strip -->
      <div class="h-16 sm:h-20 max-w-[1280px] mx-auto px-3 sm:px-6 md:px-8 flex items-center justify-between gap-2 sm:gap-4">
        
        <!-- Brand Name -->
        <div class="flex items-center gap-2 sm:gap-space-md">
          <a class="flex items-center group" href="#/">
            <span class="font-brittany text-primary group-hover:text-gold-light transition-colors text-2xl sm:text-3xl md:text-4xl leading-normal pt-1 pb-1 inline-block select-none">
              Ganachly
            </span>
          </a>
        </div>

        <!-- Desktop Nav -->
        <nav class="hidden lg:flex items-center gap-space-md">
          <a class="${isHome ? 'bg-primary-container text-on-primary-container rounded-lg px-space-md py-space-xs font-semibold' : 'text-on-surface-variant hover:text-primary font-body-md'} transition-colors uppercase tracking-wider text-sm" href="#/">Home</a>
          <a class="${isMenu ? 'bg-primary-container text-on-primary-container rounded-lg px-space-md py-space-xs font-semibold' : 'text-on-surface-variant hover:text-primary font-body-md'} transition-colors uppercase tracking-wider text-sm" href="#/menu">Menu</a>
          <a class="${isStory ? 'bg-primary-container text-on-primary-container rounded-lg px-space-md py-space-xs font-semibold' : 'text-on-surface-variant hover:text-primary font-body-md'} transition-colors uppercase tracking-wider text-sm" href="#/story">Our Story</a>
          <a class="${isGifting ? 'bg-primary-container text-on-primary-container rounded-lg px-space-md py-space-xs font-semibold' : 'text-on-surface-variant hover:text-primary font-body-md'} transition-colors uppercase tracking-wider text-sm" href="#/gifting">Gifting</a>

          ${isAdmin ? `
            <!-- Admin Quick Console Link -->
            <a href="#/admin/batches" class="px-3 py-1.5 rounded-lg bg-primary/20 text-primary border border-primary/40 hover:bg-primary hover:text-espresso-deep transition-all uppercase tracking-wider text-xs font-label-action flex items-center gap-1.5 font-bold shadow-sm">
              <span class="material-symbols-outlined text-[16px]">oven_gen</span>
              <span>Admin Console</span>
            </a>
          ` : ''}
        </nav>

        <!-- Right Side: Direct WhatsApp Order + Mobile Toggle -->
        <div class="flex items-center gap-space-sm sm:gap-space-md">
          
          <a href="https://wa.me/919810757880?text=Hello%20Ganachly,%20I%20would%20like%20to%20order" target="_blank" rel="noopener noreferrer" class="hidden sm:inline-flex items-center gap-1.5 py-2 px-4 rounded-xl bg-whatsapp-green hover:brightness-110 text-white font-label-action text-xs tracking-wider uppercase font-bold transition-all shadow-md">
            <span class="material-symbols-outlined text-[16px]">chat</span>
            <span>WhatsApp Order</span>
          </a>

          <!-- Mobile Menu Hamburger Button -->
          <button id="mobileNavToggleBtn" class="lg:hidden p-2 rounded-xl bg-card-surface border border-primary/25 text-gold-cream hover:text-primary hover:border-primary transition-all flex items-center justify-center shadow-sm" aria-label="Toggle Navigation Menu">
            <span class="material-symbols-outlined text-[22px]">menu</span>
          </button>

        </div>

      </div>

      <!-- Mobile Navigation Drawer -->
      <div id="mobileNavDrawer" class="hidden lg:hidden border-t border-primary/15 bg-espresso-panel/95 backdrop-blur-2xl px-4 py-4 space-y-2 shadow-2xl">
        <a class="${isHome ? 'bg-primary text-espresso-deep font-bold' : 'text-on-surface-variant hover:text-gold-cream bg-surface-container/50'} block px-4 py-2.5 rounded-xl uppercase tracking-wider text-xs transition-colors" href="#/">Home</a>
        <a class="${isMenu ? 'bg-primary text-espresso-deep font-bold' : 'text-on-surface-variant hover:text-gold-cream bg-surface-container/50'} block px-4 py-2.5 rounded-xl uppercase tracking-wider text-xs transition-colors" href="#/menu">Menu & Formulations</a>
        <a class="${isStory ? 'bg-primary text-espresso-deep font-bold' : 'text-on-surface-variant hover:text-gold-cream bg-surface-container/50'} block px-4 py-2.5 rounded-xl uppercase tracking-wider text-xs transition-colors" href="#/story">Our Story</a>
        <a class="${isGifting ? 'bg-primary text-espresso-deep font-bold' : 'text-on-surface-variant hover:text-gold-cream bg-surface-container/50'} block px-4 py-2.5 rounded-xl uppercase tracking-wider text-xs transition-colors" href="#/gifting">Gifting & Hampers</a>
        <a class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-whatsapp-green text-white uppercase tracking-wider text-xs font-bold transition-all" href="https://wa.me/919810757880?text=Hello%20Ganachly,%20I%20would%20like%20to%20order" target="_blank" rel="noopener noreferrer">
          <span class="material-symbols-outlined text-[16px]">chat</span>
          <span>WhatsApp Quick Order</span>
        </a>
        ${isAdmin ? `
          <a class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/20 text-primary border border-primary/40 uppercase tracking-wider text-xs font-bold transition-colors" href="#/admin/batches">
            <span class="material-symbols-outlined text-[16px]">oven_gen</span>
            <span>Admin Console</span>
          </a>
        ` : ''}
      </div>
    </header>
  `;
}

export function attachStorefrontHeaderEvents() {
  const mobileToggle = document.getElementById('mobileNavToggleBtn');
  const mobileDrawer = document.getElementById('mobileNavDrawer');
  if (mobileToggle && mobileDrawer) {
    mobileToggle.onclick = () => {
      mobileDrawer.classList.toggle('hidden');
    };
    // Close drawer when clicking any link inside it
    mobileDrawer.querySelectorAll('a').forEach(link => {
      link.onclick = () => {
        mobileDrawer.classList.add('hidden');
      };
    });
  }
}
