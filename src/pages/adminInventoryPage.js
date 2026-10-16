import { store } from '../state/store.js';
import { showToast } from '../components/toast.js';

export function renderAdminInventoryPage() {
  const inventory = store.getInventory();

  function statusBadge(item) {
    const pct = item.maxKg > 0 ? (item.stockKg / item.maxKg) * 100 : 0;
    if (item.stockKg <= item.minThresholdKg) return { label: 'CRITICAL', cls: 'text-red-400 bg-red-400/15 animate-pulse' };
    if (pct <= 30) return { label: 'LOW', cls: 'text-badge-weekend bg-badge-weekend/15' };
    return { label: 'OPTIMAL', cls: 'text-whatsapp-green bg-whatsapp-green/15' };
  }

  function barColor(item) {
    const pct = item.maxKg > 0 ? (item.stockKg / item.maxKg) * 100 : 0;
    if (item.stockKg <= item.minThresholdKg) return 'bg-red-400';
    if (pct <= 30) return 'bg-badge-weekend';
    return 'bg-gradient-to-r from-gold-hover to-secondary';
  }

  const couverture = inventory.find(i => i.category === 'couverture') || inventory[0];
  const totalUsedKg = inventory.reduce((acc, i) => acc + Math.max(0, (i.maxKg || 0) - (i.stockKg || 0)), 0);

  return `
    <div class="flex flex-col w-full gap-space-lg">

      <!-- PAGE HEADER -->
      <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-space-sm">
        <div>
          <span class="font-editorial-eyebrow text-editorial-eyebrow text-primary uppercase tracking-widest text-[11px]">Nocturne Kitchen</span>
          <h1 class="font-headline-lg text-headline-lg text-gold-light mt-1">Inventory Couverture Vault</h1>
          <p class="font-body-md text-body-md text-on-surface-variant text-sm mt-0.5">
            ${inventory.length} ingredient vaults · ${totalUsedKg.toFixed(1)} KG consumed this cycle
          </p>
        </div>
        <div class="flex items-center gap-2">
          <button id="btn-restock-all" class="flex items-center gap-2 px-space-md py-2.5 rounded-lg bg-surface-container-high text-gold-cream font-label-action text-label-action tracking-wider hover:bg-surface-bright transition-all">
            <span class="material-symbols-outlined text-[17px] text-primary">inventory_2</span>
            Restock All
          </button>
          <button id="btn-add-ingredient" class="flex items-center gap-2 px-space-md py-2.5 rounded-lg bg-gradient-to-r from-gold-hover to-primary-container text-espresso-deep font-label-action text-label-action uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-[0_4px_16px_rgba(200,151,58,0.25)]">
            <span class="material-symbols-outlined text-[18px]">add</span>
            Add Ingredient
          </button>
        </div>
      </div>

      <!-- HIGHLIGHT: Main Couverture Vault Card -->
      ${couverture ? `
        <div class="relative overflow-hidden rounded-2xl bg-espresso-panel border border-primary/20 p-space-lg shadow-2xl">
          <div class="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-gradient-to-br from-primary/10 to-transparent blur-3xl"></div>

          <div class="flex flex-col xl:flex-row xl:items-center gap-space-lg">
            <div class="flex-1">
              <div class="flex items-start justify-between gap-2 mb-space-sm">
                <div>
                  <span class="font-editorial-eyebrow text-editorial-eyebrow text-primary text-[11px] uppercase tracking-widest">Primary Vat — Lot ${couverture.lotNumber || 'VAT-2024-09'}</span>
                  <h2 class="font-headline-md text-headline-md text-gold-light mt-1">${couverture.name}</h2>
                  <p class="text-sm text-on-surface-variant mt-0.5">${couverture.purity || 'Ivory Coast Origin · Single Terroir · Callebaut Registered'}</p>
                </div>
                <div class="flex flex-col items-end gap-1">
                  ${(() => { const s = statusBadge(couverture); return `<span class="px-2.5 py-1 rounded-full font-label-badge text-label-badge text-[10px] uppercase ${s.cls}">${s.label}</span>`; })()}
                  <span class="text-xs text-on-surface-variant">Lot: ${couverture.lotNumber || 'LOT-NV-2025'}</span>
                </div>
              </div>

              <!-- Big meter -->
              <div class="flex items-baseline gap-3 mb-3">
                <span class="font-label-stat-number" style="font-size: clamp(2rem, 5vw, 3.5rem); line-height:1; color: var(--color-gold-light);">
                  ${(couverture.stockKg ?? 0).toFixed(1)} <span class="text-xl text-on-surface-variant font-body-md">KG</span>
                </span>
                <span class="font-body-md text-on-surface-variant">/ ${couverture.maxKg || 65} KG capacity</span>
              </div>

              <div class="w-full bg-surface-container-high h-3 rounded-full overflow-hidden shadow-inner mb-2">
                <div class="${barColor(couverture)} h-full rounded-full transition-all duration-1000" style="width:${Math.min(100, ((couverture.stockKg || 0) / (couverture.maxKg || 65)) * 100)}%"></div>
              </div>
              <div class="flex items-center justify-between text-xs text-on-surface-variant">
                <span>${Math.round(((couverture.stockKg || 0) / (couverture.maxKg || 65)) * 100)}% remaining · ~${Math.round((couverture.stockKg || 0) / 0.15)} more brownie batches possible</span>
                <span>Climate: <strong class="text-gold-light">${couverture.climate || '18.2°C • 46% RH'}</strong></span>
              </div>
            </div>

            <!-- SVG Radial Gauge -->
            <div class="flex flex-col items-center gap-3 self-center">
              <div class="relative w-36 h-36">
                <svg viewBox="0 0 120 120" class="w-36 h-36 -rotate-90">
                  <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="12"/>
                  <circle cx="60" cy="60" r="50" fill="none" stroke="url(#gaugeGrad)" stroke-width="12"
                    stroke-dasharray="314"
                    stroke-dashoffset="${couverture.maxKg > 0 ? Math.round(314 - (314 * Math.min(1, couverture.stockKg / couverture.maxKg))) : 314}"
                    stroke-linecap="round"
                    style="transition: stroke-dashoffset 1.5s cubic-bezier(.4,0,.2,1)"/>
                  <defs>
                    <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stop-color="#C8973A"/>
                      <stop offset="100%" stop-color="#D4AF6A"/>
                    </linearGradient>
                  </defs>
                </svg>
                <div class="absolute inset-0 flex flex-col items-center justify-center rotate-0">
                  <span class="text-2xl font-bold text-gold-light">${couverture.maxKg > 0 ? Math.round((couverture.stockKg / couverture.maxKg) * 100) : 0}%</span>
                  <span class="text-[10px] text-on-surface-variant uppercase tracking-wider">Fill Level</span>
                </div>
              </div>
              <button class="btn-restock-item px-4 py-2 rounded-lg bg-primary text-espresso-deep text-xs font-label-action uppercase tracking-wider hover:brightness-110 transition-all" data-item-id="${couverture.id}">
                + Restock Vat
              </button>
            </div>
          </div>
        </div>
      ` : ''}

      <!-- ALL INVENTORY ITEMS GRID -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-space-md" id="inventory-grid">
        ${inventory.length === 0 ? `
          <div class="col-span-full py-12 px-6 text-center rounded-xl bg-espresso-panel/40 border border-outline-variant/15 flex flex-col items-center justify-center">
            <span class="material-symbols-outlined text-[32px] text-primary/40 mb-2">shelves</span>
            <h3 class="font-headline-sm text-base text-gold-light">Inventory Reserve Empty</h3>
            <p class="text-xs text-on-surface-variant max-w-sm mt-1">Add raw ingredients or Couverture reserves via the "+ Add Raw Ingredient" button.</p>
          </div>
        ` : inventory.map(item => {
          const pct = item.maxKg > 0 ? Math.min(100, (item.stockKg / item.maxKg) * 100) : 0;
          const status = statusBadge(item);
          const bar = barColor(item);
          return `
            <div class="inventory-card relative overflow-hidden rounded-xl bg-espresso-panel border border-outline-variant/20 p-5 flex flex-col gap-3 hover:border-primary/30 transition-all group" data-item-id="${item.id}">
              <div class="flex items-start justify-between gap-2">
                <div>
                  <span class="font-body-sm text-[10px] text-on-surface-variant uppercase tracking-widest">${item.category || 'Ingredient'}</span>
                  <h3 class="font-body-md font-bold text-on-surface leading-tight">${item.name}</h3>
                  ${item.purity ? `<p class="text-[11px] text-on-surface-variant">${item.purity}</p>` : ''}
                </div>
                <span class="px-2 py-0.5 rounded-full font-label-badge text-[9px] uppercase ${status.cls} flex-shrink-0">${status.label}</span>
              </div>

              <div class="flex items-baseline gap-2">
                <span class="text-xl font-bold text-primary">${(item.stockKg || 0).toFixed(1)}</span>
                <span class="text-xs text-on-surface-variant">/ ${item.maxKg} KG</span>
              </div>

              <div class="w-full bg-surface-container-high h-2 rounded-full overflow-hidden">
                <div class="${bar} h-full rounded-full transition-all duration-700" style="width:${pct}%"></div>
              </div>

              <div class="flex items-center justify-between text-[11px] text-on-surface-variant">
                <span>${pct.toFixed(0)}% · Climate: ${item.climate || 'Ambient'}</span>
                <span>₹${item.unitCost || 850}/KG</span>
              </div>

              <!-- Restock slider -->
              <div class="pt-1 border-t border-outline-variant/15">
                <label class="text-[10px] font-label-badge uppercase text-gold-cream mb-1 block">Restock Amount (KG)</label>
                <div class="flex items-center gap-2">
                  <input type="number" min="0" max="${item.maxKg}" step="0.5"
                    class="restock-input flex-1 px-3 py-1.5 rounded-lg bg-surface-container text-on-surface text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 border border-outline-variant/20"
                    placeholder="e.g. 10 KG" data-item-id="${item.id}">
                  <button class="btn-restock-item px-3 py-1.5 rounded-lg bg-primary/90 text-espresso-deep text-xs font-label-action uppercase tracking-wider hover:bg-primary transition-all" data-item-id="${item.id}">
                    Add
                  </button>
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>

    </div>

    <!-- Add Ingredient Modal -->
    <div id="add-ingredient-modal" class="fixed inset-0 z-50 hidden items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div class="w-full max-w-md bg-espresso-deep rounded-2xl shadow-2xl border border-primary/20">
        <div class="px-6 py-5 border-b border-primary/15 flex items-center justify-between">
          <h2 class="font-headline-md text-headline-md text-gold-light">New Ingredient Vault</h2>
          <button id="add-ing-modal-close" class="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center hover:bg-surface-bright">
            <span class="material-symbols-outlined text-[18px] text-on-surface-variant">close</span>
          </button>
        </div>
        <div class="p-6 space-y-4">
          <div>
            <label class="text-xs font-label-badge uppercase text-gold-cream mb-1.5 block">Ingredient Name</label>
            <input id="ing-name" type="text" placeholder="e.g. Himalayan Rock Salt" class="w-full px-4 py-2.5 rounded-lg bg-surface-container text-on-surface text-sm focus:outline-none border border-outline-variant/20">
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-xs font-label-badge uppercase text-gold-cream mb-1.5 block">Current Stock (KG)</label>
              <input id="ing-current" type="number" placeholder="15" class="w-full px-4 py-2.5 rounded-lg bg-surface-container text-on-surface text-sm focus:outline-none border border-outline-variant/20">
            </div>
            <div>
              <label class="text-xs font-label-badge uppercase text-gold-cream mb-1.5 block">Total Capacity (KG)</label>
              <input id="ing-total" type="number" placeholder="50" class="w-full px-4 py-2.5 rounded-lg bg-surface-container text-on-surface text-sm focus:outline-none border border-outline-variant/20">
            </div>
          </div>
          <div>
            <label class="text-xs font-label-badge uppercase text-gold-cream mb-1.5 block">Supplier</label>
            <input id="ing-supplier" type="text" placeholder="e.g. Callebaut India" class="w-full px-4 py-2.5 rounded-lg bg-surface-container text-on-surface text-sm focus:outline-none border border-outline-variant/20">
          </div>
          <div>
            <label class="text-xs font-label-badge uppercase text-gold-cream mb-1.5 block">Cost per KG (₹)</label>
            <input id="ing-cost" type="number" placeholder="850" class="w-full px-4 py-2.5 rounded-lg bg-surface-container text-on-surface text-sm focus:outline-none border border-outline-variant/20">
          </div>
          <button id="btn-save-ingredient" class="w-full py-3 rounded-xl bg-gradient-to-r from-gold-hover to-primary-container text-espresso-deep font-label-action uppercase tracking-widest hover:brightness-110 transition-all">
            Add to Vault →
          </button>
        </div>
      </div>
    </div>
  `;
}

export function attachAdminInventoryPageEvents() {
  // Restock buttons
  document.querySelectorAll('.btn-restock-item').forEach(btn => {
    btn.onclick = () => {
      const itemId = btn.getAttribute('data-item-id');
      const input = document.querySelector(`.restock-input[data-item-id="${itemId}"]`);
      let addKg = parseFloat(input?.value || 0);

      if (!addKg || addKg <= 0) {
        const item = store.getInventory().find(i => i.id === itemId);
        if (item) {
          const needed = item.maxKg - item.stockKg;
          addKg = needed > 0 ? parseFloat(Math.min(10, needed).toFixed(1)) : 0;
        }
      }

      if (!addKg || addKg <= 0) {
        showToast('Vault is already at maximum capacity', 'check_circle', 'Couverture Vault');
        return;
      }
      store.restockInventoryItem(itemId, addKg);
      showToast(`Restocked ${addKg} KG successfully`, 'inventory_2');
      window.refreshCurrentPage();
    };
  });

  // Restock all
  const restockAllBtn = document.getElementById('btn-restock-all');
  if (restockAllBtn) {
    restockAllBtn.onclick = () => {
      store.restockAllInventory();
      showToast('All vaults restocked to full capacity', 'check_circle');
      window.refreshCurrentPage();
    };
  }

  // Add ingredient modal
  const addIngBtn = document.getElementById('btn-add-ingredient');
  const ingModal = document.getElementById('add-ingredient-modal');
  if (addIngBtn && ingModal) {
    addIngBtn.onclick = () => ingModal.classList.replace('hidden', 'flex');
    document.getElementById('add-ing-modal-close').onclick = () => ingModal.classList.replace('flex', 'hidden');
    ingModal.onclick = (e) => { if (e.target === ingModal) ingModal.classList.replace('flex', 'hidden'); };
  }

  const saveIngBtn = document.getElementById('btn-save-ingredient');
  if (saveIngBtn) {
    saveIngBtn.onclick = () => {
      const name = document.getElementById('ing-name').value.trim();
      const current = parseFloat(document.getElementById('ing-current').value);
      const total = parseFloat(document.getElementById('ing-total').value);
      const supplier = document.getElementById('ing-supplier').value.trim();
      const cost = parseFloat(document.getElementById('ing-cost').value) || 850;

      if (!name || !total) {
        showToast('Name and capacity are required', 'error');
        return;
      }

      store.addInventoryItem({ name, stockKg: current || 0, maxKg: total, unitCost: cost });
      ingModal.classList.replace('flex', 'hidden');
      showToast(`${name} vault created`, 'check_circle');
      window.refreshCurrentPage();
    };
  }
}
