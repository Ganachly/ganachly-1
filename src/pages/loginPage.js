import { store } from '../state/store.js';
import { defaultGuestUser } from '../data/initialData.js';
import { auth } from '../auth/auth.js';
import { showToast } from '../components/toast.js';
import { renderGoogleButton } from '../auth/googleAuth.js';
import { firebaseRegisterOrLogin, firebaseSignOutUser } from '../services/firebase.js';

export function renderLoginPage() {
  const currentUser = store.getCurrentUser();
  const isLoggedIn = currentUser && !currentUser.id.includes('guest') && currentUser.id !== 'guest@ganachly.com';

  return `
    <main class="w-full pt-20 pb-16 min-h-screen bg-espresso-deep flex flex-col justify-center items-center px-4 relative overflow-hidden">
      
      <!-- Subtle Ambient Lighting -->
      <div class="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-ambient-glow/30 rounded-full blur-[140px] -z-10"></div>
      <div class="pointer-events-none absolute -bottom-24 right-1/4 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px] -z-10"></div>

      <!-- Main Container -->
      <div class="w-full max-w-md mx-auto flex flex-col items-center">

        <!-- Brand Monogram & Eyebrow -->
        <a href="#/" class="flex flex-col items-center gap-2 group mb-6 text-center">
          <div class="w-14 h-14 rounded-2xl bg-card-surface border border-primary/30 flex items-center justify-center p-2 shadow-2xl group-hover:scale-105 transition-transform">
            <img alt="Ganachly Monogram Logo" class="h-full w-auto object-contain" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDmKKxb9G0vCEynbGo92kEm76euV2guavQqyVY_OpM9mOgeWCBTfou1JHMYPtETOGOkdfxQSmwWrLT9SLHa0GvdJeucLjrTjVi32WzE61zZh0WNguRwjx1IVq06b4ejtFlDeQBc-_VMkUnX0BNpLhLaTf_JkSS771STZwpLGP8FKb-DjO5fuU019WjoGFX5nrT7ASIlNPWfjmQnU5cZc8S7XSN268HHkw1vxGByeW4hkaBmFOgfLgtNWw"/>
          </div>
          <h1 class="font-display-hero text-headline-md tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-gold-light via-primary to-primary-container uppercase">
            GANACHLY
          </h1>
          <p class="font-editorial-eyebrow text-gold-cream text-[11px] uppercase tracking-[0.25em]">
            Artisan Eggless Patisserie
          </p>
        </a>

        <!-- Main Card -->
        <div class="w-full bg-espresso-panel/95 border border-primary/25 rounded-2xl shadow-2xl backdrop-blur-xl p-6 sm:p-7 relative">
          
          <!-- Current Active Session Notice (only if signed in) -->
          ${isLoggedIn ? `
            <div class="mb-5 p-3 rounded-xl bg-surface-container-low border border-primary/20 flex items-center justify-between">
              <div class="flex items-center gap-2.5">
                <span class="text-xl">${currentUser.avatar || '👤'}</span>
                <div class="flex flex-col text-left">
                  <div class="flex items-center gap-1.5">
                    <span class="font-body-md text-xs font-semibold text-on-surface">${currentUser.name}</span>
                    <span class="px-1.5 py-0.2 rounded text-[9px] font-label-badge uppercase font-bold ${currentUser.role === 'admin' ? 'bg-primary text-espresso-deep' : 'bg-secondary text-espresso-deep'}">
                      ${currentUser.role}
                    </span>
                  </div>
                  <span class="text-[10px] text-on-surface-variant font-mono truncate max-w-[150px]">${currentUser.id}</span>
                </div>
              </div>
              <button id="btn-logout-session" class="text-[11px] font-label-action uppercase tracking-wider text-red-400 hover:text-red-300 transition-colors px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-bright border border-outline-variant/20">
                Sign Out
              </button>
            </div>
          ` : ''}

          <!-- Header Titles -->
          <div class="text-center mb-5">
            <h2 class="font-headline-md text-lg text-gold-cream uppercase tracking-wide">
              Sign In to Ganachly
            </h2>
            <p class="font-editorial-quote text-xs text-on-surface-variant italic mt-1">
              Sign in to place orders, track live evening bakes, or access the atelier.
            </p>
          </div>

          <!-- Google Sign-In Container -->
          <div class="space-y-2 mb-4">
            <label class="text-[10px] font-label-badge uppercase tracking-wider text-gold-cream/80 text-center block">
              Fast Sign In with Google
            </label>
            <div class="flex justify-center">
              <div id="google-signin-btn-container" class="w-full flex items-center justify-center min-h-[44px]"></div>
            </div>
          </div>

          <!-- Divider -->
          <div class="relative flex items-center justify-center pt-1 pb-4">
            <div class="w-full border-t border-outline-variant/20"></div>
            <span class="absolute bg-espresso-panel px-3 text-[10px] font-label-badge uppercase tracking-wider text-on-surface-variant">
              or sign in with email
            </span>
          </div>

          <!-- Unified Login Form -->
          <form id="unified-login-form" class="space-y-3.5">
            <div>
              <label for="login-email-input" class="text-[11px] font-label-badge uppercase text-gold-cream mb-1 block">
                Email Address <span class="text-primary">*</span>
              </label>
              <input id="login-email-input" type="email" placeholder="name@example.com" required
                class="w-full px-3.5 py-2.5 rounded-lg bg-surface-container text-on-surface text-sm focus:outline-none focus:ring-1 focus:ring-primary border border-outline-variant/20 placeholder-on-surface-variant/40">
            </div>

            <div>
              <div class="flex items-center justify-between mb-1">
                <label for="login-pass-input" class="text-[11px] font-label-badge uppercase text-gold-cream block">
                  Password / Passcode <span class="text-primary">*</span>
                </label>
              </div>
              <input id="login-pass-input" type="password" placeholder="••••••••" required
                class="w-full px-3.5 py-2.5 rounded-lg bg-surface-container text-on-surface text-sm focus:outline-none focus:ring-1 focus:ring-primary border border-outline-variant/20 placeholder-on-surface-variant/40">
            </div>

            <div>
              <label for="login-name-input" class="text-[11px] font-label-badge uppercase text-gold-cream mb-1 block">
                Full Name <span class="text-on-surface-variant/50 text-[10px] lowercase">(optional)</span>
              </label>
              <input id="login-name-input" type="text" placeholder="Your Name"
                class="w-full px-3.5 py-2.5 rounded-lg bg-surface-container text-on-surface text-sm focus:outline-none focus:ring-1 focus:ring-primary border border-outline-variant/20 placeholder-on-surface-variant/40">
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label for="login-phone-input" class="text-[11px] font-label-badge uppercase text-gold-cream mb-1 block">
                  WhatsApp Mobile
                </label>
                <input id="login-phone-input" type="tel" placeholder="+91 98110 00192"
                  class="w-full px-3.5 py-2.5 rounded-lg bg-surface-container text-on-surface text-sm focus:outline-none focus:ring-1 focus:ring-primary border border-outline-variant/20 placeholder-on-surface-variant/40">
              </div>
              <div>
                <label for="login-zone-input" class="text-[11px] font-label-badge uppercase text-gold-cream mb-1 block">
                  NCR Delivery Zone
                </label>
                <select id="login-zone-input" class="w-full px-3 py-2.5 rounded-lg bg-surface-container text-on-surface text-sm focus:outline-none focus:ring-1 focus:ring-primary border border-outline-variant/20">
                  <option value="Faridabad">Faridabad (Sector 14-21)</option>
                  <option value="Gurugram">Gurugram (Cyber City)</option>
                  <option value="South Delhi">South Delhi (GK / Def Col)</option>
                  <option value="Noida">Noida (Sector 18 / Expressway)</option>
                  <option value="Ghaziabad">Ghaziabad (Indirapuram)</option>
                </select>
              </div>
            </div>

            <button type="submit" id="btn-login-submit" class="w-full mt-4 py-3.5 rounded-xl bg-gradient-to-r from-gold-hover via-primary-container to-primary text-espresso-deep font-label-action text-xs uppercase tracking-widest font-bold hover:brightness-110 active:scale-95 transition-all shadow-[0_4px_16px_rgba(200,151,58,0.25)] flex items-center justify-center gap-2">
              <span>Sign In to Ganachly</span>
              <span class="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          </form>

        </div>

        <!-- Back to Storefront Link -->
        <a href="#/" class="mt-5 text-on-surface-variant hover:text-primary font-body-sm text-xs transition-colors flex items-center gap-1.5 uppercase tracking-wider">
          <span class="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Return to Ganachly Storefront</span>
        </a>

      </div>
    </main>
  `;
}

export function attachLoginPageEvents() {
  // Render Google Sign-In button
  renderGoogleButton('google-signin-btn-container');

  // Reset / Sign Out Session
  const logoutBtn = document.getElementById('btn-logout-session');
  if (logoutBtn) {
    logoutBtn.onclick = async () => {
      await firebaseSignOutUser();
      store.setCurrentUser(defaultGuestUser);
      showToast('Signed out successfully', 'logout');
      window.refreshCurrentPage();
    };
  }

  // Unified Form Submit
  const loginForm = document.getElementById('unified-login-form');
  if (loginForm) {
    loginForm.onsubmit = async (e) => {
      e.preventDefault();
      const submitBtn = document.getElementById('btn-login-submit');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span class="material-symbols-outlined text-[16px] animate-spin">sync</span><span>Authenticating...</span>`;
      }

      const email = document.getElementById('login-email-input')?.value.trim();
      const password = document.getElementById('login-pass-input')?.value.trim();
      const name = document.getElementById('login-name-input')?.value.trim();
      const phone = document.getElementById('login-phone-input')?.value.trim() || '+91 98110 00192';
      const zone = document.getElementById('login-zone-input')?.value || 'Faridabad';

      if (!email || !password) {
        showToast('Please enter both email and password', 'error');
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `<span>Sign In to Ganachly</span><span class="material-symbols-outlined text-[16px]">arrow_forward</span>`;
        }
        return;
      }

      const normalizedEmail = email.toLowerCase().trim();
      const isAdminEmail = normalizedEmail === 'hardikkush987@gmail.com' || normalizedEmail === 'admin@ganachly.com';

      // 1. ADMIN AUTHENTICATION CHECK
      if (isAdminEmail) {
        if (password !== 'anoopritu' && password !== 'ganachly70') {
          showToast('Incorrect password for Atelier Admin. Please enter correct passcode.', 'error', 'Security Gate');
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<span>Sign In to Ganachly</span><span class="material-symbols-outlined text-[16px]">arrow_forward</span>`;
          }
          return;
        }

        // Set admin session IMMEDIATELY in state & local cache
        const adminUser = auth.loginCustom({
          id: 'hardikkush987@gmail.com',
          name: name || 'Hardik',
          role: 'admin',
          avatar: '👨‍🍳',
          phone: phone || '+91 98110 00192',
          zone: 'Faridabad Atelier Central'
        });

        // Background non-blocking Firebase cloud sync
        firebaseRegisterOrLogin({
          email: 'hardikkush987@gmail.com',
          password: password,
          name: name || 'Hardik',
          phone: phone || '+91 98110 00192',
          zone: 'Faridabad Atelier Central',
          role: 'admin'
        }).catch(err => console.debug('Firebase admin background sync notice:', err));

        showToast('Authenticated as Master Patissier Hardik! Redirecting to Atelier Portal...', 'security');
        
        // Immediate redirection to admin portal
        window.location.hash = '#/admin/batches';
        return;
      }

      // 2. REGULAR CUSTOMER AUTHENTICATION (any other email & password)
      const customerName = name || email.split('@')[0];
      const patronUser = auth.loginCustom({
        id: normalizedEmail,
        name: customerName,
        role: 'customer',
        avatar: '🍫',
        phone: phone,
        zone: zone
      });

      // Background non-blocking Firebase cloud sync
      firebaseRegisterOrLogin({
        email: normalizedEmail,
        password: password,
        name: customerName,
        phone: phone,
        zone: zone,
        role: 'customer'
      }).catch(err => console.debug('Firebase customer background sync notice:', err));

      showToast(`Welcome, ${patronUser.name}! Signed in to Ganachly.`, 'check_circle');
      // Redirect to menu storefront so user can immediately place orders
      window.location.hash = '#/menu';
    };
  }
}
