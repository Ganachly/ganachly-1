import { store } from '../state/store.js';

export function renderMyOrdersPage() {
  const user = store.getCurrentUser();
  const allOrders = store.getOrders();
  
  const userIdLower = (user?.id || '').toLowerCase();
  const userCodeLower = (user?.code || '').toLowerCase();
  const userPhone = user?.phone || '';
  
  // Safely filter orders for this customer ID or email or phone
  const userOrders = allOrders.filter(o => 
    (userIdLower && o.customerEmail && o.customerEmail.toLowerCase() === userIdLower) ||
    (userCodeLower && o.customerId && o.customerId.toLowerCase() === userCodeLower) ||
    (userPhone && o.phone && o.phone === userPhone)
  );

  return `
    <main class="w-full pt-28 bg-surface min-h-screen pb-space-3xl">
      <div class="flex flex-col w-full max-w-[1100px] mx-auto px-margin md:px-margin-desktop">
        
        <!-- Ambient Top Glow -->
        <div class="relative w-full text-center pt-4 pb-8">
          <div class="absolute -top-12 left-1/2 -translate-x-1/2 w-[550px] h-[300px] bg-ambient-glow/30 rounded-full blur-[100px] pointer-events-none -z-10"></div>
          
          <div class="inline-flex items-center gap-space-sm px-space-md py-space-xs rounded-full bg-surface-container-high/60 backdrop-blur-md mb-space-md">
            <span class="w-2 h-2 rounded-full bg-whatsapp-green animate-ping"></span>
            <span class="font-editorial-eyebrow text-editorial-eyebrow text-gold-cream uppercase tracking-[0.25em]">
              Real-time Nocturne Atelier Telemetry
            </span>
          </div>

          <h1 class="font-display-hero text-headline-lg md:text-display-hero tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-gold-light via-primary to-primary-container leading-none uppercase mb-space-xs select-none">
            My Nocturne Orders
          </h1>

          <p class="font-editorial-quote text-body-md text-on-surface-variant italic max-w-lg mx-auto">
            Live dispatch status for orders placed under your customer identity.
          </p>
        </div>

        <!-- Identity Banner (Shown for logged-in patrons) -->
        ${user && !user.id.includes('guest') ? `
        <div class="p-4 rounded-2xl bg-espresso-panel border border-primary/20 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl mb-8">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-card-surface border border-primary/30 flex items-center justify-center text-3xl shadow-inner">
              ${user.avatar || '🍫'}
            </div>
            <div>
              <div class="flex items-center gap-2">
                <span class="font-body-md text-body-md font-bold text-on-surface">${user.name}</span>
                <span class="px-2 py-0.5 rounded-full text-[10px] font-label-badge uppercase ${user.badgeClass || 'bg-secondary text-espresso-deep'}">
                  ${user.role.toUpperCase()}
                </span>
              </div>
              <span class="font-body-sm text-xs text-on-surface-variant font-mono">
                ${user.id} • Ref: ${user.code}
              </span>
            </div>
          </div>

          <div class="flex items-center gap-2 w-full sm:w-auto">
            <button onclick="window.openIdentityModal()" class="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-surface-container-high hover:bg-surface-bright text-gold-cream text-xs font-label-action uppercase tracking-wider transition-all flex items-center justify-center gap-1.5">
              <span class="material-symbols-outlined text-[16px]">account_circle</span>
              <span>Profile</span>
            </button>
            <a href="#/menu" class="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-primary text-espresso-deep text-xs font-label-action uppercase tracking-wider font-bold hover:brightness-110 transition-all flex items-center justify-center gap-1.5">
              <span class="material-symbols-outlined text-[16px]">add_shopping_cart</span>
              <span>Order More</span>
            </a>
          </div>
        </div>
        ` : ''}

        <!-- Orders List -->
        ${userOrders.length === 0 ? `
          <div class="p-12 rounded-2xl bg-card-surface/70 border border-outline-variant/20 text-center text-on-surface-variant">
            <div class="w-16 h-16 rounded-full bg-espresso-panel border border-primary/20 flex items-center justify-center text-primary mx-auto mb-3">
              <span class="material-symbols-outlined text-[32px]">receipt_long</span>
            </div>
            <h3 class="font-headline-md text-headline-md text-gold-cream uppercase">No active orders found</h3>
            <p class="font-editorial-quote text-body-md italic max-w-sm mx-auto mt-1 mb-6">
              ${user.id.includes('guest') 
                ? 'You have not placed an order in this session yet. Explore our handcrafted confections from the menu.'
                : `You haven't placed an order under <strong class="text-on-surface">${user.id}</strong> yet.`}
            </p>
            <div class="flex flex-wrap items-center justify-center gap-3">
              ${user.role === 'admin' ? `
                <a href="#/admin/orders" class="px-6 py-3 rounded-xl bg-gradient-to-r from-gold-hover to-primary text-espresso-deep font-label-action text-label-action uppercase tracking-widest font-bold hover:brightness-110 transition-all shadow-md">
                  View Atelier Orders Console →
                </a>
              ` : `
                <a href="#/menu" class="px-6 py-3 rounded-xl bg-gradient-to-r from-gold-hover to-primary text-espresso-deep font-label-action text-label-action uppercase tracking-widest font-bold hover:brightness-110 transition-all shadow-md">
                  Browse Menu
                </a>
              `}
              ${user.id.includes('guest') ? `
                <a href="#/login" class="px-6 py-3 rounded-xl bg-surface-container-high text-gold-cream font-label-action text-label-action uppercase tracking-wider hover:bg-surface-bright transition-all">
                  Sign In to Account
                </a>
              ` : `
                <button onclick="window.openIdentityModal()" class="px-6 py-3 rounded-xl bg-surface-container-high text-gold-cream font-label-action text-label-action uppercase tracking-wider hover:bg-surface-bright transition-all">
                  View Profile
                </button>
              `}
            </div>
          </div>
        ` : `
          <div class="space-y-6">
            ${userOrders.map(order => {
              const stages = [
                { key: 'new', label: 'Order Logged', icon: 'receipt' },
                { key: 'oven', label: 'In Deck Oven', icon: 'oven_gen' },
                { key: 'boxed', label: 'Glazed & Boxed', icon: 'inventory_2' },
                { key: 'dispatch', label: 'NCR Courier Dispatch', icon: 'local_shipping' },
                { key: 'completed', label: 'Delivered', icon: 'verified' }
              ];

              const currentStageIndex = order.stage === 'new' ? 0 : 
                (order.stage === 'prep' ? 0 : 
                (order.stage === 'oven' ? 1 : 
                (order.stage === 'sliced' || order.stage === 'boxed' ? 2 : 
                (order.stage === 'dispatch' ? 3 : 4))));

              return `
                <div class="rounded-2xl bg-espresso-panel/90 border border-primary/20 p-6 shadow-2xl relative overflow-hidden">
                  <div class="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-gold-light to-secondary"></div>

                  <!-- Header of Order Card -->
                  <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-primary/10">
                    <div>
                      <div class="flex items-center gap-2">
                        <span class="font-headline-md text-headline-md text-primary tracking-wide">#${order.id}</span>
                        <span class="px-2.5 py-0.5 rounded-full text-[10px] font-label-badge uppercase tracking-wider ${
                          order.stage === 'completed' 
                            ? 'bg-whatsapp-green/20 text-whatsapp-green border border-whatsapp-green/30' 
                            : 'bg-primary/20 text-primary border border-primary/30 animate-pulse'
                        }">
                          ${order.stageLabel}
                        </span>
                      </div>
                      <span class="font-body-sm text-xs text-on-surface-variant font-mono mt-0.5 block">
                        Logged at ${order.time} • Payment: <strong class="text-gold-cream">${order.paymentStatus}</strong>
                      </span>
                    </div>

                    <div class="flex items-center gap-3">
                      <div class="text-right">
                        <span class="text-xs text-on-surface-variant uppercase font-label-badge block">Order Total</span>
                        <span class="font-label-price text-xl text-primary font-bold">₹${order.total}</span>
                      </div>
                      <a href="https://wa.me/919811000192?text=Hi%20Chef%20Hardik,%20inquiring%20about%20my%20order%20%23${order.id}" 
                        target="_blank" class="p-2.5 rounded-xl bg-whatsapp-green/20 text-whatsapp-green hover:bg-whatsapp-green hover:text-espresso-deep transition-all" title="WhatsApp Kitchen Inquiry">
                        <span class="material-symbols-outlined text-[20px]">chat</span>
                      </a>
                    </div>
                  </div>

                  <!-- 5-STAGE PROGRESS BAR -->
                  <div class="py-6 border-b border-primary/10">
                    <span class="font-label-badge text-[10px] text-on-surface-variant uppercase tracking-widest block mb-4">
                      Live Confectionery Lifecycle
                    </span>

                    <div class="grid grid-cols-5 gap-1 sm:gap-2 relative">
                      <!-- Connecting Line -->
                      <div class="absolute top-4 sm:top-5 left-[8%] right-[8%] h-0.5 bg-surface-container-high -z-0">
                        <div class="h-full bg-primary transition-all duration-700" style="width: ${(currentStageIndex / (stages.length - 1)) * 100}%"></div>
                      </div>

                      ${stages.map((st, idx) => {
                        const isDone = idx < currentStageIndex;
                        const isCurrent = idx === currentStageIndex;
                        return `
                          <div class="flex flex-col items-center text-center relative z-10">
                            <div class="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all ${
                              isCurrent 
                                ? 'bg-primary text-espresso-deep ring-2 sm:ring-4 ring-primary/30 scale-105 sm:scale-110 shadow-lg' 
                                : (isDone ? 'bg-primary-container text-espresso-deep' : 'bg-surface-container-high text-on-surface-variant/40')
                            }">
                              <span class="material-symbols-outlined text-[14px] sm:text-[18px]">${st.icon}</span>
                            </div>
                            <span class="font-body-sm text-[9px] sm:text-[11px] mt-1.5 sm:mt-2 font-medium leading-tight ${isCurrent ? 'text-gold-light font-bold' : (isDone ? 'text-on-surface' : 'text-on-surface-variant/50')}">
                              ${st.label}
                            </span>
                          </div>
                        `;
                      }).join('')}
                    </div>
                  </div>

                  <!-- Confections & Address Grid -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 text-body-sm">
                    <div>
                      <span class="font-label-badge text-[10px] text-on-surface-variant uppercase tracking-wider block mb-1.5">
                        Confections Breakdown
                      </span>
                      <div class="space-y-1">
                        ${order.items.map(i => `
                          <div class="flex justify-between items-center py-1 border-b border-primary/5">
                            <span class="text-gold-cream"><strong class="text-primary">${i.qty}x</strong> ${i.title}</span>
                            <span class="font-mono text-xs text-on-surface-variant">₹${i.price * i.qty}</span>
                          </div>
                        `).join('')}
                      </div>
                      ${order.specialNote ? `
                        <div class="mt-2 p-2.5 rounded-lg bg-surface-container-low text-xs text-gold-cream/80 italic">
                          “${order.specialNote}”
                        </div>
                      ` : ''}
                    </div>

                    <div>
                      <span class="font-label-badge text-[10px] text-on-surface-variant uppercase tracking-wider block mb-1.5">
                        NCR Courier Destination
                      </span>
                      <div class="p-3 rounded-xl bg-card-surface border border-outline-variant/20 space-y-1">
                        <p class="font-semibold text-on-surface">${order.customerName}</p>
                        <p class="text-xs text-on-surface-variant leading-relaxed">${order.address}</p>
                        <p class="text-xs text-primary font-mono mt-1">${order.zone} • ${order.phone}</p>
                      </div>
                    </div>
                  </div>

                </div>
              `;
            }).join('')}
          </div>
        `}

      </div>
    </main>
  `;
}

export function attachMyOrdersPageEvents() {
  // Any special events if needed
}
