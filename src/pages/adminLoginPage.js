import { store } from '../state/store.js';
import { auth } from '../auth/auth.js';
import { showToast } from '../components/toast.js';
import { firebaseRegisterOrLogin } from '../services/firebase.js';

export function renderAdminLoginPage(targetPath = '#/admin/batches') {
  const currentUser = store.getCurrentUser();
  const isCurrentlyAdmin = auth.isAdmin();

  return `
    <div class="min-h-screen bg-espresso-deep flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      
      <!-- Ambient Background Lighting -->
      <div class="pointer-events-none absolute -top-36 left-1/2 -translate-x-1/2 w-[750px] h-[480px] bg-ambient-glow/35 rounded-full blur-[140px] -z-10"></div>
      <div class="pointer-events-none absolute -bottom-24 right-1/4 w-[450px] h-[450px] bg-primary/15 rounded-full blur-[120px] -z-10"></div>
      <div class="pointer-events-none absolute top-1/3 -left-20 w-[350px] h-[350px] bg-gold-hover/10 rounded-full blur-[100px] -z-10"></div>

      <!-- Main Portal Box -->
      <div class="w-full max-w-md mx-auto flex flex-col items-center">

        <!-- Atelier Brand Monogram -->
        <a href="#/" class="flex flex-col items-center gap-2 group mb-6 text-center">
          <div class="w-16 h-16 rounded-2xl bg-card-surface border border-primary/40 flex items-center justify-center p-2.5 shadow-2xl group-hover:scale-105 transition-transform">
            <img alt="Ganachly Monogram Logo" class="h-full w-auto object-contain" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDmKKxb9G0vCEynbGo92kEm76euV2guavQqyVY_OpM9mOgeWCBTfou1JHMYPtETOGOkdfxQSmwWrLT9SLHa0GvdJeucLjrTjVi32WzE61zZh0WNguRwjx1IVq06b4ejtFlDeQBc-_VMkUnX0BNpLhLaTf_JkSS771STZwpLGP8FKb-DjO5fuU019WjoGFX5nrT7ASIlNPWfjmQnU5cZc8S7XSN268HHkw1vxGByeW4hkaBmFOgfLgtNWw"/>
          </div>
          <div class="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-surface-container-high/90 border border-primary/20 mt-1">
            <span class="w-2 h-2 rounded-full bg-badge-weekend animate-pulse"></span>
            <span class="font-editorial-eyebrow text-gold-cream text-[11px] uppercase tracking-[0.25em]">
              Operations Terminal
            </span>
          </div>
          <h1 class="font-brittany text-4xl sm:text-5xl text-transparent bg-clip-text bg-gradient-to-b from-gold-light via-primary to-primary-container leading-tight pt-1 select-none">
            Ganachly
          </h1>
          <span class="font-editorial-eyebrow text-gold-cream text-[11px] uppercase tracking-[0.25em] -mt-1">
            Atelier Backoffice
          </span>
        </a>

        <!-- Admin Login Card -->
        <div class="w-full bg-espresso-panel/95 border border-primary/30 rounded-2xl shadow-2xl backdrop-blur-xl p-6 sm:p-8 relative">
          
          <!-- Header info -->
          <div class="text-center mb-6">
            <div class="w-12 h-12 rounded-xl bg-espresso-deep/80 border border-primary/30 flex items-center justify-center mx-auto mb-3 shadow-inner">
              <span class="material-symbols-outlined text-primary text-[26px]">admin_panel_settings</span>
            </div>
            <h2 class="font-headline-md text-xl text-gold-light uppercase tracking-wide">
              Master Patissier Sign In
            </h2>
            <p class="font-editorial-quote text-xs text-on-surface-variant italic mt-1.5 leading-relaxed">
              Enter your Atelier credentials to access live hearth oven telemetry, orders queue, couverture vault, and formulations.
            </p>
          </div>

          <!-- Error Alert Banner (Hidden by default) -->
          <div id="admin-login-error" class="hidden mb-4 p-3 rounded-xl bg-red-950/70 border border-red-500/40 text-red-200 text-xs flex items-center gap-2.5 animate-fadeIn">
            <span class="material-symbols-outlined text-red-400 text-[18px] flex-shrink-0">error</span>
            <span id="admin-login-error-text">Invalid Atelier credentials. Please verify your ID and password.</span>
          </div>

          <!-- Admin Login Form -->
          <form id="admin-login-form" class="space-y-4">
            
            <!-- Email / ID Input -->
            <div>
              <label for="admin-login-email" class="text-[11px] font-label-badge uppercase tracking-wider text-gold-cream mb-1.5 flex items-center justify-between">
                <span>Atelier Master ID <span class="text-primary">*</span></span>
                <span class="text-[10px] text-on-surface-variant font-mono lowercase">hardikkush987@gmail.com</span>
              </label>
              <div class="relative">
                <input 
                  id="admin-login-email" 
                  type="email" 
                  value="hardikkush987@gmail.com" 
                  required
                  autocomplete="username"
                  placeholder="hardikkush987@gmail.com"
                  class="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-container text-on-surface text-sm focus:outline-none focus:ring-1 focus:ring-primary border border-outline-variant/30 placeholder-on-surface-variant/40 font-mono">
                <span class="material-symbols-outlined text-on-surface-variant/70 text-[18px] absolute left-3 top-1/2 -translate-y-1/2">
                  badge
                </span>
              </div>
            </div>

            <!-- Password Input -->
            <div>
              <div class="flex items-center justify-between mb-1.5">
                <label for="admin-login-pass" class="text-[11px] font-label-badge uppercase tracking-wider text-gold-cream">
                  Atelier Passcode <span class="text-primary">*</span>
                </label>
              </div>
              <div class="relative">
                <input 
                  id="admin-login-pass" 
                  type="password" 
                  required
                  autocomplete="current-password"
                  placeholder="Enter passcode"
                  class="w-full pl-10 pr-11 py-2.5 rounded-xl bg-surface-container text-on-surface text-sm focus:outline-none focus:ring-1 focus:ring-primary border border-outline-variant/30 placeholder-on-surface-variant/40 font-mono">
                <span class="material-symbols-outlined text-on-surface-variant/70 text-[18px] absolute left-3 top-1/2 -translate-y-1/2">
                  key
                </span>
                <button type="button" id="btn-toggle-admin-pass" class="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-gold-cream transition-colors p-1" title="Toggle password visibility">
                  <span class="material-symbols-outlined text-[18px]" id="icon-toggle-admin-pass">visibility</span>
                </button>
              </div>
            </div>

            <!-- Remember Terminal session badge -->
            <div class="flex items-center justify-between text-[11px] text-on-surface-variant pt-1">
              <label class="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" id="admin-remember-me" checked class="rounded bg-surface-container border-outline-variant/40 text-primary focus:ring-0">
                <span>Keep terminal authenticated</span>
              </label>
              <span class="text-gold-cream/70 font-mono text-[10px]">256-bit Cloud Sync</span>
            </div>

            <!-- Submit Button -->
            <button 
              type="submit" 
              id="btn-admin-submit" 
              class="w-full mt-2 py-3.5 rounded-xl bg-gradient-to-r from-gold-hover via-primary-container to-primary text-espresso-deep font-label-action text-xs uppercase tracking-widest font-bold hover:brightness-110 active:scale-95 transition-all shadow-[0_4px_16px_rgba(200,151,58,0.25)] flex items-center justify-center gap-2">
              <span class="material-symbols-outlined text-[18px]">lock_open</span>
              <span>Authenticate & Enter Atelier</span>
            </button>
          </form>

          <!-- Security Notice -->
          <div class="mt-5 pt-4 border-t border-primary/15 text-center">
            <p class="text-[11px] text-on-surface-variant font-mono">
              Restricted to Master Patissier Admin & Atelier staff.
            </p>
          </div>

        </div>

        <!-- Back to Customer Storefront -->
        <a href="#/" class="mt-6 text-on-surface-variant hover:text-primary font-body-sm text-xs transition-colors flex items-center gap-1.5 uppercase tracking-wider">
          <span class="material-symbols-outlined text-[16px]">arrow_back</span>
          <span>Return to Customer Storefront</span>
        </a>

      </div>
    </div>
  `;
}

export function attachAdminLoginPageEvents(targetPath = '#/admin/batches') {
  // Password show/hide toggle
  const togglePassBtn = document.getElementById('btn-toggle-admin-pass');
  const passInput = document.getElementById('admin-login-pass');
  const passIcon = document.getElementById('icon-toggle-admin-pass');

  if (togglePassBtn && passInput && passIcon) {
    togglePassBtn.onclick = () => {
      if (passInput.type === 'password') {
        passInput.type = 'text';
        passIcon.textContent = 'visibility_off';
      } else {
        passInput.type = 'password';
        passIcon.textContent = 'visibility';
      }
    };
  }

  // Admin Login form submit
  const form = document.getElementById('admin-login-form');
  const errorBox = document.getElementById('admin-login-error');
  const errorText = document.getElementById('admin-login-error-text');

  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();

      if (errorBox) errorBox.classList.add('hidden');

      const submitBtn = document.getElementById('btn-admin-submit');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span class="material-symbols-outlined text-[16px] animate-spin">sync</span><span>Verifying Credentials...</span>`;
      }

      const email = document.getElementById('admin-login-email')?.value.trim();
      const password = document.getElementById('admin-login-pass')?.value.trim();

      const normalizedEmail = (email || '').toLowerCase();
      const isAdminId = normalizedEmail === 'hardikkush987@gmail.com' || normalizedEmail === 'admin@ganachly.com';
      const isCorrectPass = password === 'anoopritu' || password === 'ganachly70';

      if (!isAdminId || !isCorrectPass) {
        // Authentication failed
        if (errorBox && errorText) {
          if (!isAdminId) {
            errorText.textContent = 'Unrecognized Atelier ID. Only authorized Master Patissier accounts may sign in.';
          } else {
            errorText.textContent = 'Incorrect Atelier passcode. Please re-enter the authorized password.';
          }
          errorBox.classList.remove('hidden');
        }

        showToast('Atelier authentication failed. Please check ID and password.', 'error', 'Security Gate');

        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `
            <span class="material-symbols-outlined text-[18px]">lock_open</span>
            <span>Authenticate & Enter Atelier</span>
          `;
        }
        return;
      }

      // Valid Admin credentials!
      const adminSession = {
        id: 'hardikkush987@gmail.com',
        email: 'hardikkush987@gmail.com',
        name: 'Hardik',
        role: 'admin',
        avatar: '👨‍🍳',
        title: 'Master Patissier & Founder',
        phone: '+91 98110 00192',
        zone: 'Faridabad Atelier Central',
        address: 'Ganachly Nocturne Atelier, Sector 15, Faridabad'
      };

      // Set user session in store & local persistent cache
      auth.loginCustom(adminSession);

      // Cloud sync with Firebase Auth in the background
      firebaseRegisterOrLogin({
        email: 'hardikkush987@gmail.com',
        password: password,
        name: 'Hardik',
        role: 'admin',
        phone: '+91 98110 00192',
        zone: 'Faridabad Atelier Central'
      }).catch(err => {
        console.debug('[Firebase] Admin background sync status:', err?.message);
      });

      showToast('Welcome, Master Patissier Hardik! Access granted to Atelier Operations.', 'check_circle', 'Atelier Access');

      // Determine destination route
      let dest = targetPath;
      if (!dest || dest === '#/admin' || dest === '#/admin/' || dest === '#/admin/login') {
        dest = '#/admin/batches';
      }

      window.location.hash = dest;
    };
  }
}
