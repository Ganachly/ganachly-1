import { auth } from './auth.js';
import { store } from '../state/store.js';
import { showToast } from '../components/toast.js';

export const GOOGLE_CLIENT_ID = '363852627233-vpspppi68bhb9ipqf09scdtmjuj7or8e.apps.googleusercontent.com';

/**
 * Safely decodes Google ID Token (JWT Payload)
 */
export function decodeJwt(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    console.error('Failed to parse Google JWT token:', e);
    return null;
  }
}

/**
 * Handles Google OAuth Credential from One Tap or Google Sign-In Button
 */
export function handleGoogleCredentialResponse(response) {
  if (!response || !response.credential) {
    console.warn('No credential received from Google Identity Services');
    return;
  }

  const payload = decodeJwt(response.credential);
  if (!payload || !payload.email) {
    showToast('Failed to authenticate with Google', 'error');
    return;
  }

  const normalizedEmail = payload.email.toLowerCase();
  const isAdmin = normalizedEmail === 'hardikkush987@gmail.com' || normalizedEmail === 'admin@ganachly.com';

  // Create or switch to user identity using verified Google details
  const user = auth.loginCustom({
    id: payload.email,
    name: payload.name || payload.given_name || (isAdmin ? 'Hardik Kushwaha' : 'Connoisseur'),
    role: isAdmin ? 'admin' : 'customer',
    avatar: payload.picture || (isAdmin ? '👨‍🍳' : '👤'),
    phone: '',
    zone: isAdmin ? 'Faridabad Atelier Central' : 'Faridabad (Sector 14-21)'
  });

  if (isAdmin) {
    showToast(`Welcome Master Patissier Hardik! Signed in via Google.`, 'security');
    window.location.hash = '#/admin/batches';
  } else {
    showToast(`Welcome, ${user.name}! Signed in via Google.`, 'verified', 'Google OAuth Patron');
    // If on login page, redirect to menu storefront so user can immediately place orders
    if (window.location.hash === '#/login' || window.location.hash === '#/signin') {
      window.location.hash = '#/menu';
    } else {
      window.refreshCurrentPage();
    }
  }
}

/**
 * Dismisses / cancels any active Google One Tap prompt
 */
export function dismissGoogleOneTap() {
  if (typeof window !== 'undefined' && window.google?.accounts?.id) {
    try {
      window.google.accounts.id.cancel();
    } catch (e) {
      console.debug('Google One Tap cancel:', e);
    }
  }
}

/**
 * Initializes Google Identity Services & triggers One Tap for customers
 */
export function initGoogleAuth() {
  const checkGoogleInterval = setInterval(() => {
    if (typeof window.google !== 'undefined' && window.google.accounts && window.google.accounts.id) {
      clearInterval(checkGoogleInterval);

      try {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
          itp_support: true,
          use_fedcm_for_prompt: true
        });

        // Trigger Google One Tap ONLY for storefront customers (strictly never on admin routes or admin login)
        const user = store.getCurrentUser();
        const currentHash = (window.location.hash || '').toLowerCase();
        const isAdminContext = currentHash.startsWith('#/admin') || 
                               currentHash.includes('tab=admin') || 
                               currentHash.includes('role=admin');

        if (!isAdminContext && (!user || user.id.includes('guest') || user.role !== 'admin')) {
          // Delay One Tap slightly for optimal UX after page transition
          setTimeout(() => {
            const currentHashNow = (window.location.hash || '').toLowerCase();
            if (currentHashNow.startsWith('#/admin') || currentHashNow.includes('tab=admin') || currentHashNow.includes('role=admin')) {
              dismissGoogleOneTap();
              return;
            }
            window.google.accounts.id.prompt((notification) => {
              if (notification.isNotDisplayed()) {
                console.log('Google One Tap suppressed:', notification.getNotDisplayedReason());
              } else if (notification.isSkippedMoment()) {
                console.log('Google One Tap skipped:', notification.getSkippedReason());
              } else if (notification.isDismissedMoment()) {
                console.log('Google One Tap dismissed:', notification.getDismissedReason());
              }
            });
          }, 1200);
        } else {
          dismissGoogleOneTap();
        }
      } catch (err) {
        console.warn('Google Identity initialization error:', err);
      }
    }
  }, 100);

  // Stop checking after 10 seconds if GSI script fails to load
  setTimeout(() => clearInterval(checkGoogleInterval), 10000);
}

// Global listener to immediately cancel Google One Tap whenever user enters admin context
if (typeof window !== 'undefined') {
  window.addEventListener('hashchange', () => {
    const hash = (window.location.hash || '').toLowerCase();
    if (hash.startsWith('#/admin') || hash.includes('tab=admin') || hash.includes('role=admin')) {
      dismissGoogleOneTap();
    }
  });
}

/**
 * Renders the official Google Sign-In Button inside a specified container
 */
export function renderGoogleButton(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const tryRender = () => {
    if (typeof window.google !== 'undefined' && window.google.accounts && window.google.accounts.id) {
      container.innerHTML = '';
      window.google.accounts.id.renderButton(container, {
        type: 'standard',
        shape: 'pill',
        theme: 'filled_black',
        text: 'signin_with',
        size: 'large',
        logo_alignment: 'left',
        width: 320
      });
    } else {
      setTimeout(tryRender, 200);
    }
  };

  tryRender();
}
