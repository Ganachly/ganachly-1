export function showToast(message, icon = 'check_circle', subtitle = 'Ganachly Atelier Notification') {
  if (typeof document === 'undefined' || !document.body) return;
  let toastContainer = document.getElementById('luxuryToastContainer');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'luxuryToastContainer';
    toastContainer.className = 'fixed bottom-6 right-6 z-[9999] flex flex-col gap-2 pointer-events-none';
    document.body.appendChild(toastContainer);
  }

  // Cap visible toasts to prevent DOM overload
  while (toastContainer.children.length >= 4) {
    toastContainer.removeChild(toastContainer.firstElementChild);
  }

  const toastItem = document.createElement('div');
  toastItem.className = 'transform translate-y-8 opacity-0 transition-all duration-300 pointer-events-auto flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-espresso-panel/95 border border-primary/30 shadow-[0_16px_40px_rgba(0,0,0,0.8)] backdrop-blur-xl min-w-[300px] max-w-md';

  toastItem.innerHTML = `
    <div class="w-9 h-9 rounded-xl bg-card-surface border border-primary/30 flex items-center justify-center text-primary shadow-sm flex-shrink-0">
      <span class="material-symbols-outlined text-[20px]">${icon}</span>
    </div>
    <div class="flex flex-col flex-1 min-w-0">
      <p class="font-body-md text-body-md font-semibold text-gold-cream leading-snug truncate">${message}</p>
      <span class="font-body-sm text-[11px] text-on-surface-variant truncate">${subtitle}</span>
    </div>
    <button class="text-on-surface-variant/60 hover:text-gold-cream text-sm ml-2 flex-shrink-0" onclick="this.parentElement.remove()">✕</button>
  `;

  toastContainer.appendChild(toastItem);

  // Trigger enter animation
  requestAnimationFrame(() => {
    toastItem.classList.remove('translate-y-8', 'opacity-0');
    toastItem.classList.add('translate-y-0', 'opacity-100');
  });

  // Auto remove after 3.8s
  setTimeout(() => {
    toastItem.classList.remove('translate-y-0', 'opacity-100');
    toastItem.classList.add('translate-y-8', 'opacity-0');
    setTimeout(() => {
      toastItem.remove();
    }, 350);
  }, 3800);
}

// Make global
window.showToast = showToast;
