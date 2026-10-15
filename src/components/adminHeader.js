import { store } from '../state/store.js';

export function renderAdminHeader() {
  const user = store.getCurrentUser();
  const kpis = store.getKpis();

  return `
    <header class="fixed top-0 left-0 md:left-72 right-0 h-16 bg-espresso-panel/95 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.5)] z-40 flex items-center justify-between px-space-md sm:px-space-lg border-b border-primary/10">
      
      <!-- Left: Mobile Toggle & Status Indicator -->
      <div class="flex items-center gap-space-sm sm:gap-space-md">
        <button id="adminMobileSidebarToggle" class="md:hidden p-2 rounded-xl bg-surface-container-low text-gold-cream hover:text-primary transition-all flex items-center justify-center">
          <span class="material-symbols-outlined text-[20px]">menu</span>
        </button>

        <div class="flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-low border border-primary/20">
          <span class="w-2 h-2 rounded-full bg-whatsapp-green animate-pulse"></span>
          <span class="font-label-badge text-xs uppercase text-gold-cream tracking-wider">
            Kitchen Operations
          </span>
        </div>
      </div>

      <!-- Right: Navigation & Profile -->
      <div class="flex items-center gap-space-sm sm:gap-space-md">

        <a href="#/admin/orders" class="relative p-2 rounded-lg bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors" title="Orders Queue">
          <span class="material-symbols-outlined text-[20px]">notifications</span>
          ${kpis.hearthQueueCount > 0 ? `
            <span class="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
          ` : ''}
        </a>

        <!-- Identity Pill -->
        <button id="adminHeaderIdentityBtn" class="flex items-center gap-2 sm:gap-3 pl-space-sm p-1.5 rounded-xl hover:bg-surface-container-high transition-all group" title="Click to view profile">
          <div class="flex flex-col text-right hidden sm:flex">
            <span class="font-body-md text-body-md font-semibold text-gold-cream leading-tight group-hover:text-primary transition-colors">
              ${user?.name || 'Chef Hardik'}
            </span>
            <span class="font-editorial-eyebrow text-editorial-eyebrow text-on-surface-variant text-[11px] leading-tight">
              ${user?.title || 'Master Patissier'} (${(user?.role || 'admin').toUpperCase()}) ▾
            </span>
          </div>
          <div class="w-9 h-9 rounded-xl bg-primary flex items-center justify-center text-xl shadow-md">
            ${user?.avatar || '👨‍🍳'}
          </div>
        </button>

      </div>
    </header>
  `;
}

export function attachAdminHeaderEvents() {
  const identityBtn = document.getElementById('adminHeaderIdentityBtn');
  if (identityBtn) {
    identityBtn.onclick = () => {
      window.openIdentityModal();
    };
  }

  const mobileToggle = document.getElementById('adminMobileSidebarToggle');
  const sidebar = document.getElementById('adminSidebar');
  if (mobileToggle && sidebar) {
    mobileToggle.onclick = () => {
      sidebar.classList.toggle('-translate-x-full');
    };
  }
}
