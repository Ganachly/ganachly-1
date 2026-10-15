import { store } from '../state/store.js';
import { showToast } from '../components/toast.js';

export function renderAdminBatchesPage() {
  const kpis = store.getKpis();
  const batches = store.getBatches();
  const orders = store.getOrders();
  const activeOrders = orders.filter(o => o.stage !== 'completed').slice(0, 10);

  const stageColor = {
    prep: 'text-on-surface-variant bg-surface-container-high border border-outline-variant/30',
    baking: 'text-badge-weekend bg-badge-weekend/20 border border-badge-weekend/30',
    cooling: 'text-secondary bg-secondary/20 border border-secondary/30',
    glazed: 'text-whatsapp-green bg-whatsapp-green/20 border border-whatsapp-green/30'
  };

  const nextStageLabel = {
    prep: 'Start Baking',
    baking: 'Move to Cooling',
    cooling: 'Glaze & Finish',
    glazed: 'Complete Batch'
  };

  return `
    <div class="flex flex-col w-full gap-5">

      <!-- CLEAN HEADER -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-espresso-panel border border-primary/15 shadow-xl">
        <div>
          <h1 class="font-headline-md text-2xl text-gold-cream tracking-wide uppercase">
            Live Batches & Production
          </h1>
          <p class="font-body-sm text-xs text-on-surface-variant mt-0.5">
            Monitor real-time oven decks, batch progression, and active kitchen orders.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2.5">
          <button id="btn-create-new-batch" class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary hover:bg-gold-light text-espresso-deep font-label-action text-xs uppercase tracking-wider font-bold transition-all shadow-sm active:scale-95">
            <span class="material-symbols-outlined text-[16px]">add</span>
            <span>+ New Batch</span>
          </button>
          <a href="#/admin/orders" class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-container-high hover:bg-surface-bright text-on-surface-variant hover:text-gold-cream font-label-action text-xs uppercase tracking-wider transition-all border border-outline-variant/20">
            <span class="material-symbols-outlined text-[16px]">receipt_long</span>
            <span>All Orders</span>
          </a>
        </div>
      </div>

      <!-- 4 CLEAN KPI CARDS -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        <!-- Queue -->
        <div class="p-4 rounded-xl bg-card-surface border border-outline-variant/20 shadow-md flex items-center justify-between">
          <div>
            <span class="text-[11px] font-label-badge uppercase tracking-wider text-on-surface-variant block">Pending in Queue</span>
            <span class="font-headline-lg text-3xl text-gold-cream font-bold mt-1 block">${kpis.hearthQueueCount}</span>
            <span class="text-[11px] text-primary mt-0.5 block">Orders waiting for baking</span>
          </div>
          <div class="w-11 h-11 rounded-xl bg-surface-container flex items-center justify-center text-primary border border-primary/20">
            <span class="material-symbols-outlined text-[22px]">local_fire_department</span>
          </div>
        </div>

        <!-- Active Batches -->
        <div class="p-4 rounded-xl bg-card-surface border border-outline-variant/20 shadow-md flex items-center justify-between">
          <div>
            <span class="text-[11px] font-label-badge uppercase tracking-wider text-on-surface-variant block">Active Oven Batches</span>
            <span class="font-headline-lg text-3xl text-gold-cream font-bold mt-1 block">${batches.length}</span>
            <span class="text-[11px] text-whatsapp-green mt-0.5 block">Currently on convection decks</span>
          </div>
          <div class="w-11 h-11 rounded-xl bg-surface-container flex items-center justify-center text-whatsapp-green border border-whatsapp-green/20">
            <span class="material-symbols-outlined text-[22px]">oven_gen</span>
          </div>
        </div>

        <!-- Out for Delivery -->
        <div class="p-4 rounded-xl bg-card-surface border border-outline-variant/20 shadow-md flex items-center justify-between">
          <div>
            <span class="text-[11px] font-label-badge uppercase tracking-wider text-on-surface-variant block">Out for Delivery</span>
            <span class="font-headline-lg text-3xl text-gold-cream font-bold mt-1 block">${kpis.outForDeliveryCount}</span>
            <span class="text-[11px] text-secondary mt-0.5 block">Dispatched with NCR couriers</span>
          </div>
          <div class="w-11 h-11 rounded-xl bg-surface-container flex items-center justify-center text-secondary border border-secondary/20">
            <span class="material-symbols-outlined text-[22px]">local_shipping</span>
          </div>
        </div>

        <!-- Couverture Stock -->
        <div class="p-4 rounded-xl bg-card-surface border border-outline-variant/20 shadow-md flex items-center justify-between">
          <div>
            <span class="text-[11px] font-label-badge uppercase tracking-wider text-on-surface-variant block">Couverture Reserve</span>
            <span class="font-headline-lg text-3xl text-gold-cream font-bold mt-1 block">${kpis.remainingCouvertureKg.toFixed(1)} <span class="text-xs font-normal text-on-surface-variant">KG</span></span>
            <span class="text-[11px] text-gold-light mt-0.5 block">70.5% Callebaut stock</span>
          </div>
          <div class="w-11 h-11 rounded-xl bg-surface-container flex items-center justify-center text-primary border border-primary/20">
            <span class="material-symbols-outlined text-[22px]">cookie</span>
          </div>
        </div>

      </div>

      <!-- MAIN 2-COLUMN VIEW -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-5">

        <!-- Left: Active Inbound Orders (2 Columns) -->
        <div class="lg:col-span-2 flex flex-col gap-3.5 bg-espresso-panel rounded-2xl p-5 border border-primary/15 shadow-xl">
          <div class="flex items-center justify-between pb-3 border-b border-primary/15">
            <div>
              <h2 class="font-headline-sm text-base text-gold-cream uppercase tracking-wide">
                Active Kitchen Orders (${activeOrders.length})
              </h2>
              <p class="font-body-sm text-[11px] text-on-surface-variant mt-0.5">
                Orders currently undergoing prep, baking, or packaging.
              </p>
            </div>
            <a href="#/admin/orders" class="text-xs text-primary hover:text-gold-light transition-colors uppercase font-label-action">
              View All →
            </a>
          </div>

          <!-- Orders List -->
          <div class="space-y-2.5">
            ${activeOrders.length === 0 ? `
              <div class="text-center py-12 text-on-surface-variant">
                <span class="material-symbols-outlined text-[36px] text-primary/40 mb-1 block">receipt_long</span>
                <p class="font-body-md text-xs italic">All current orders completed.</p>
              </div>
            ` : activeOrders.map(order => {
              const stageColors = {
                new: 'bg-surface-container text-on-surface-variant',
                prep: 'bg-surface-container text-on-surface-variant',
                oven: 'bg-badge-weekend/20 text-badge-weekend',
                sliced: 'bg-secondary/20 text-secondary',
                boxed: 'bg-secondary/20 text-secondary',
                dispatch: 'bg-primary/20 text-primary',
                completed: 'bg-whatsapp-green/20 text-whatsapp-green'
              };

              return `
                <div class="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-card-surface border border-outline-variant/20 hover:border-primary/30 transition-all gap-3">
                  <div class="flex items-center gap-3 min-w-0">
                    <div class="w-8 h-8 rounded-lg bg-surface-container flex items-center justify-center flex-shrink-0 text-primary">
                      <span class="material-symbols-outlined text-[16px]">${order.channel === 'whatsapp' ? 'chat' : 'shopping_bag'}</span>
                    </div>
                    <div class="min-w-0">
                      <div class="flex items-center gap-2">
                        <span class="font-body-md text-xs font-bold text-primary font-mono">${order.id}</span>
                        <span class="font-body-sm text-xs font-semibold text-on-surface truncate">${order.customerName}</span>
                        <span class="text-[10px] text-on-surface-variant hidden sm:inline font-mono">(${order.zone || 'NCR'})</span>
                      </div>
                      <p class="text-[11px] text-on-surface-variant truncate mt-0.5">
                        ${order.items.map(i => `${i.qty}x ${i.title}`).join(' · ')}
                      </p>
                    </div>
                  </div>

                  <div class="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-outline-variant/15">
                    <span class="font-label-price text-sm text-gold-cream font-bold">₹${order.total}</span>
                    <span class="px-2 py-0.5 rounded-full text-[9px] font-label-badge uppercase font-bold ${stageColors[order.stage] || stageColors.new}">
                      ${order.stageLabel || order.stage}
                    </span>
                    <select class="bg-surface-container text-gold-cream text-xs rounded-lg px-2.5 py-1 focus:outline-none cursor-pointer border border-outline-variant/30" onchange="window.adminUpdateOrderStage('${order.id}', this.value)">
                      <option value="new" ${order.stage === 'new' ? 'selected' : ''}>New</option>
                      <option value="prep" ${order.stage === 'prep' ? 'selected' : ''}>Prep</option>
                      <option value="oven" ${order.stage === 'oven' ? 'selected' : ''}>In Oven</option>
                      <option value="sliced" ${order.stage === 'sliced' ? 'selected' : ''}>Sliced</option>
                      <option value="boxed" ${order.stage === 'boxed' ? 'selected' : ''}>Boxed</option>
                      <option value="dispatch" ${order.stage === 'dispatch' ? 'selected' : ''}>Dispatched</option>
                      <option value="completed" ${order.stage === 'completed' ? 'selected' : ''}>Delivered</option>
                    </select>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Right: Live Oven Batches (1 Column) -->
        <div class="flex flex-col gap-3.5 bg-espresso-panel rounded-2xl p-5 border border-primary/15 shadow-xl">
          <div class="flex items-center justify-between pb-3 border-b border-primary/15">
            <div>
              <h2 class="font-headline-sm text-base text-gold-cream uppercase tracking-wide">
                Live Oven Batches (${batches.length})
              </h2>
              <p class="font-body-sm text-[11px] text-on-surface-variant mt-0.5">
                Deck convection status and active tray bake times.
              </p>
            </div>
            <button id="btn-quick-new-batch" class="text-xs text-primary hover:text-gold-light uppercase font-label-action">
              + Add
            </button>
          </div>

          <!-- Batches Cards -->
          <div class="space-y-3">
            ${batches.length === 0 ? `
              <div class="text-center py-10 px-4 rounded-xl bg-card-surface border border-outline-variant/15 flex flex-col items-center justify-center">
                <span class="material-symbols-outlined text-[32px] text-primary/40 mb-1">oven_gen</span>
                <p class="font-headline-sm text-xs text-gold-cream uppercase">No active batches</p>
                <p class="text-[11px] text-on-surface-variant italic mt-0.5">Click "+ New Batch" to queue a recipe.</p>
              </div>
            ` : batches.map(batch => {
              const stageClass = stageColor[batch.stage] || stageColor.prep;
              const nextAction = nextStageLabel[batch.stage] || 'Advance';

              return `
                <div class="p-3.5 rounded-xl bg-card-surface border border-outline-variant/20 relative overflow-hidden space-y-2.5">
                  <div class="flex items-start justify-between gap-2">
                    <div>
                      <div class="flex items-center gap-1.5">
                        <span class="text-[10px] font-mono text-primary font-bold">${batch.id}</span>
                        <span class="text-[10px] text-on-surface-variant">• ${batch.deck}</span>
                      </div>
                      <h4 class="font-body-md text-sm font-bold text-on-surface leading-tight mt-0.5">${batch.recipe}</h4>
                    </div>
                    <span class="px-2 py-0.5 rounded-full text-[9px] font-label-badge uppercase font-bold ${stageClass} flex-shrink-0">
                      ${batch.stage}
                    </span>
                  </div>

                  <div class="flex items-center justify-between text-xs text-on-surface-variant">
                    <span>${batch.units} Units (${batch.tempC}°C)</span>
                    <span class="text-gold-light font-semibold font-mono text-xs">
                      ${batch.timeRemainingMins > 0 ? `${batch.timeRemainingMins}m left` : 'Ready'}
                    </span>
                  </div>

                  <!-- Progress Bar -->
                  <div class="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden">
                    <div class="bg-primary h-full rounded-full transition-all duration-500" style="width:${batch.progressPercent}%"></div>
                  </div>

                  <!-- Action Buttons -->
                  <div class="flex items-center gap-2 pt-1">
                    <button class="btn-advance-batch flex-1 py-1.5 rounded-lg bg-surface-container-high hover:bg-primary hover:text-espresso-deep text-gold-cream text-xs font-label-action uppercase tracking-wider transition-all font-bold" data-batch="${batch.id}">
                      ${nextAction} →
                    </button>
                    ${batch.stage === 'glazed' ? `
                      <button class="btn-delete-batch px-2.5 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 text-red-300 text-xs font-label-action uppercase transition-all" data-batch="${batch.id}" title="Remove finished batch">
                        <span class="material-symbols-outlined text-[15px]">delete</span>
                      </button>
                    ` : ''}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

      </div>

      <!-- NEW BATCH MODAL CONTAINER -->
      <div id="newBatchModalContainer"></div>

    </div>
  `;
}

export function attachAdminBatchesPageEvents() {
  // Advance batch stage
  document.querySelectorAll('.btn-advance-batch').forEach(btn => {
    btn.onclick = () => {
      const batchId = btn.getAttribute('data-batch');
      store.advanceBatch(batchId);
      showToast(`Batch ${batchId} advanced to next stage`, 'oven_gen');
      window.refreshCurrentPage();
    };
  });

  // Delete/complete finished batch
  document.querySelectorAll('.btn-delete-batch').forEach(btn => {
    btn.onclick = () => {
      const batchId = btn.getAttribute('data-batch');
      store.deleteBatch(batchId);
      showToast(`Batch ${batchId} cleared from oven queue`, 'check_circle');
      window.refreshCurrentPage();
    };
  });

  // Create new batch modal
  const openNewBatchModal = () => {
    const modalContainer = document.getElementById('newBatchModalContainer');
    if (!modalContainer) return;

    const products = store.getProducts();
    const recipeOptions = products.length > 0
      ? products.map(p => `<option value="${p.title}">${p.title}</option>`).join('')
      : `<option value="Signature Confection Batch">Signature Confection Batch</option>`;

    modalContainer.innerHTML = `
      <div id="newBatchBackdrop" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div class="relative w-full max-w-md bg-espresso-panel border border-primary/30 rounded-2xl p-6 shadow-2xl text-on-surface space-y-4">
          <div class="flex items-center justify-between border-b border-primary/15 pb-3">
            <h3 class="font-headline-sm text-base text-gold-cream uppercase">Start New Deck Batch</h3>
            <button id="closeNewBatchModal" class="p-1 rounded-lg text-on-surface-variant hover:text-on-surface">
              <span class="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>

          <form id="newBatchForm" class="space-y-3">
            <div>
              <label class="text-[11px] font-label-badge uppercase text-gold-cream mb-1 block">Recipe</label>
              <select id="newBatchRecipe" class="w-full px-3 py-2 rounded-lg bg-surface-container text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary border border-outline-variant/30">
                ${recipeOptions}
              </select>
            </div>

            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="text-[11px] font-label-badge uppercase text-gold-cream mb-1 block">Convection Deck</label>
                <select id="newBatchDeck" class="w-full px-3 py-2 rounded-lg bg-surface-container text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary border border-outline-variant/30">
                  <option value="Deck A (Top)">Deck A (Top)</option>
                  <option value="Deck B (Middle)">Deck B (Middle)</option>
                  <option value="Deck C (Bottom)">Deck C (Bottom)</option>
                </select>
              </div>
              <div>
                <label class="text-[11px] font-label-badge uppercase text-gold-cream mb-1 block">Batch Units</label>
                <input id="newBatchUnits" type="number" value="36" min="12" max="96" class="w-full px-3 py-2 rounded-lg bg-surface-container text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-primary border border-outline-variant/30">
              </div>
            </div>

            <button type="submit" class="w-full mt-2 py-2.5 rounded-xl bg-primary hover:bg-gold-light text-espresso-deep font-label-action text-xs uppercase tracking-wider font-bold transition-all shadow-md">
              Start Deck Batch
            </button>
          </form>
        </div>
      </div>
    `;

    const closeBtn = document.getElementById('closeNewBatchModal');
    const backdrop = document.getElementById('newBatchBackdrop');
    const close = () => { modalContainer.innerHTML = ''; };

    if (closeBtn) closeBtn.onclick = close;
    if (backdrop) {
      backdrop.onclick = (e) => {
        if (e.target === backdrop) close();
      };
    }

    const form = document.getElementById('newBatchForm');
    if (form) {
      form.onsubmit = (e) => {
        e.preventDefault();
        const recipe = document.getElementById('newBatchRecipe')?.value;
        const deck = document.getElementById('newBatchDeck')?.value;
        const units = document.getElementById('newBatchUnits')?.value;

        store.createBatch({ recipe, deck, units });
        showToast(`Created batch for ${recipe}`, 'oven_gen');
        close();
        window.refreshCurrentPage();
      };
    }
  };

  const createBatchBtn = document.getElementById('btn-create-new-batch');
  if (createBatchBtn) createBatchBtn.onclick = openNewBatchModal;

  const quickBatchBtn = document.getElementById('btn-quick-new-batch');
  if (quickBatchBtn) quickBatchBtn.onclick = openNewBatchModal;

  // Order stage update handler
  window.adminUpdateOrderStage = (orderId, newStage) => {
    store.updateOrderStatus(orderId, newStage);
    showToast(`Order #${orderId} moved to ${newStage}`, 'check_circle');
    window.refreshCurrentPage();
  };
}
