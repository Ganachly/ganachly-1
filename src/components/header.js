import { store } from '../state/store.js';

export function renderStorefrontHeader(activeRoute = '#/') {
  const user = store.getCurrentUser();
  const cartCount = store.getCartCount();
  const myOrders = (user && user.id) ? store.getOrdersForCustomer(user.id) : [];
  const activeOrdersCount = myOrders.filter(o => o.stage !== 'completed').length;
  const isAdmin = user && user.role === 'admin';

  const isHome = activeRoute === '#/' || activeRoute === '#/home' || !activeRoute;
  const isMenu = activeRoute === '#/menu';
  const isStory = activeRoute === '#/story' || activeRoute === '#/our-story';
  const isGifting = activeRoute === '#/gifting' || activeRoute === '#/gifting-and-bulk';
  const isMyOrders = activeRoute === '#/my-orders';

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
        
        <!-- Brand Monogram -->
        <div class="flex items-center gap-2 sm:gap-space-md">
          <a class="flex items-center gap-2 group" href="#/">
            <img alt="Ganachly Monogram Logo" class="h-7 sm:h-8 w-auto object-contain transition-transform group-hover:scale-105" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDmKKxb9G0vCEynbGo92kEm76euV2guavQqyVY_OpM9mOgeWCBTfou1JHMYPtETOGOkdfxQSmwWrLT9SLHa0GvdJeucLjrTjVi32WzE61zZh0WNguRwjx1IVq06b4ejtFlDeQBc-_VMkUnX0BNpLhLaTf_JkSS771STZwpLGP8FKb-DjO5fuU019WjoGFX5nrT7ASIlNPWfjmQnU5cZc8S7XSN268HHkw1vxGByeW4hkaBmFOgfLgtNWw"/>
            <span class="font-brittany text-primary group-hover:text-gold-light transition-colors text-2xl sm:text-3xl md:text-4xl leading-none pt-1 select-none">
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
          
          <!-- My Orders Link -->
          <a class="${isMyOrders ? 'bg-primary-container text-on-primary-container rounded-lg px-space-md py-space-xs font-semibold' : 'text-on-surface-variant hover:text-primary font-body-md'} relative transition-colors uppercase tracking-wider text-sm flex items-center gap-1" href="#/my-orders">
            <span>My Orders</span>
            ${activeOrdersCount > 0 ? `
              <span class="w-4 h-4 rounded-full bg-primary text-espresso-deep text-[10px] font-bold flex items-center justify-center animate-pulse">
                ${activeOrdersCount}
              </span>
            ` : ''}
          </a>

          <!-- Login Page Link -->
          <a href="#/login" class="${activeRoute === '#/login' ? 'bg-primary-container text-on-primary-container rounded-lg px-space-md py-space-xs font-semibold' : 'text-on-surface-variant hover:text-primary font-body-md'} transition-colors uppercase tracking-wider text-sm flex items-center gap-1">
            <span class="material-symbols-outlined text-[16px]">key</span>
            <span>Sign In</span>
          </a>

          ${isAdmin ? `
            <!-- Admin Quick Console Link -->
            <a href="#/admin/batches" class="px-3 py-1.5 rounded-lg bg-primary/20 text-primary border border-primary/40 hover:bg-primary hover:text-espresso-deep transition-all uppercase tracking-wider text-xs font-label-action flex items-center gap-1.5 font-bold shadow-sm">
              <span class="material-symbols-outlined text-[16px]">oven_gen</span>
              <span>Atelier Console</span>
            </a>
          ` : ''}

        </nav>

        <!-- Right Side: Cart + Identity Pill -->
        <div class="flex items-center gap-space-sm sm:gap-space-md">
          
          <!-- Cart Button -->
          <button id="headerCartBtn" class="relative flex items-center gap-space-xs py-space-xs px-3 sm:px-space-md rounded-xl bg-card-surface border border-primary/20 text-gold-cream hover:border-primary/50 hover:text-primary transition-all">
            <span class="material-symbols-outlined text-[20px]">shopping_bag</span>
            <span class="font-body-sm text-body-sm font-semibold hidden sm:inline">Bag</span>
            <span id="headerCartBadge" class="w-5 h-5 rounded-full bg-primary text-espresso-deep font-body-sm text-xs flex items-center justify-center font-bold">
              ${cartCount}
            </span>
          </button>

          <!-- Profile Button -->
          <button id="headerProfileBtn" class="flex items-center gap-2 py-1.5 px-3 rounded-xl bg-card-surface border border-primary/25 hover:border-primary text-gold-cream hover:text-primary transition-all group shadow-sm" title="View Profile & Account Details">
            <span class="text-lg group-hover:scale-110 transition-transform">${user.avatar || '👤'}</span>
            <div class="flex flex-col text-left hidden sm:flex">
              <span class="font-body-md text-xs font-semibold text-gold-cream leading-tight group-hover:text-primary transition-colors">
                Profile
              </span>
              <span class="font-body-sm text-[10px] ${isAdmin ? 'text-primary font-bold' : 'text-on-surface-variant'} uppercase tracking-wider truncate max-w-[100px]">
                ${isAdmin ? 'Admin' : (user.id.includes('guest') ? 'Account' : user.name.split(' ')[0])}
              </span>
            </div>
            <span class="material-symbols-outlined text-[16px] text-primary group-hover:scale-110 transition-transform hidden sm:inline">account_circle</span>
          </button>

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
        <a class="${isMyOrders ? 'bg-primary text-espresso-deep font-bold' : 'text-on-surface-variant hover:text-gold-cream bg-surface-container/50'} flex items-center justify-between px-4 py-2.5 rounded-xl uppercase tracking-wider text-xs transition-colors" href="#/my-orders">
          <span>My Orders</span>
          ${activeOrdersCount > 0 ? `<span class="px-2 py-0.5 rounded-full bg-primary text-espresso-deep text-[10px] font-bold">${activeOrdersCount}</span>` : ''}
        </a>
        <a class="${activeRoute === '#/login' ? 'bg-primary text-espresso-deep font-bold' : 'text-on-surface-variant hover:text-gold-cream bg-surface-container/50'} block px-4 py-2.5 rounded-xl uppercase tracking-wider text-xs transition-colors" href="#/login">
          Sign In
        </a>
        ${isAdmin ? `
          <a class="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary/20 text-primary border border-primary/40 uppercase tracking-wider text-xs font-bold transition-colors" href="#/admin/batches">
            <span class="material-symbols-outlined text-[16px]">oven_gen</span>
            <span>Atelier Console</span>
          </a>
        ` : ''}
      </div>
    </header>
  `;
}

export function attachStorefrontHeaderEvents() {
  const cartBtn = document.getElementById('headerCartBtn');
  if (cartBtn) {
    cartBtn.onclick = () => {
      window.openCartDrawer();
    };
  }

  const profileBtn = document.getElementById('headerProfileBtn') || document.getElementById('headerIdentityBtn');
  if (profileBtn) {
    profileBtn.onclick = () => {
      if (typeof window.openProfileModal === 'function') {
        window.openProfileModal();
      } else if (typeof window.openIdentityModal === 'function') {
        window.openIdentityModal();
      }
    };
  }

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
