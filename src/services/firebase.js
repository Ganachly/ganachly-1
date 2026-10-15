// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app';
import { getAnalytics, isSupported as isAnalyticsSupported } from 'firebase/analytics';
import {
  getFirestore,
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  collection,
  doc,
  setDoc,
  deleteDoc,
  addDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';

export {
  collection,
  doc,
  setDoc,
  deleteDoc,
  addDoc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp
};

// Your web app's Firebase configuration
export const firebaseConfig = {
  apiKey: "AIzaSyBPzCiYZ4yVZ1APJA8HnU93iAf0Sn32Dfc",
  authDomain: "ganachly.firebaseapp.com",
  projectId: "ganachly",
  storageBucket: "ganachly.firebasestorage.app",
  messagingSenderId: "1033504960468",
  appId: "1:1033504960468:web:e78944e462c4241f51b041",
  measurementId: "G-RRHRY9QQRM"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);

// Initialize Cloud Firestore with persistent cache memory (IndexedDB multi-tab)
let firestoreDb;
try {
  firestoreDb = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  });
  console.info('[Firebase] Firestore initialized with offline cache memory.');
} catch (e) {
  firestoreDb = getFirestore(app);
}
export const db = firestoreDb;

// Initialize Firebase Analytics safely for browser environments
export let analytics = null;
if (typeof window !== 'undefined') {
  isAnalyticsSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {});
}

import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';

// Initialize Firebase Auth
export const authInstance = getAuth(app);

// Enable browserLocalPersistence so the user does NOT need to login again and again!
if (typeof window !== 'undefined') {
  setPersistence(authInstance, browserLocalPersistence)
    .then(() => {
      console.info('[Firebase Auth] Persistent local cache memory enabled (browserLocalPersistence).');
    })
    .catch((err) => {
      console.debug('[Firebase Auth] Persistence setup notice:', err.message);
    });
}

/**
 * Deep sanitize any data object to prevent Firestore "Unsupported field value: undefined" errors
 */
export function sanitizeForFirestore(val) {
  if (val === undefined) return null;
  if (val === null) return null;
  if (typeof val !== 'object') return val;
  if (Array.isArray(val)) {
    return val.map(sanitizeForFirestore);
  }
  const clean = {};
  for (const [key, value] of Object.entries(val)) {
    if (value !== undefined) {
      clean[key] = sanitizeForFirestore(value);
    }
  }
  return clean;
}

/**
 * Helper to save order to Firestore
 */
export async function saveOrderToFirestore(orderData) {
  try {
    const orderRef = doc(db, 'orders', orderData.id);
    const sanitized = sanitizeForFirestore({
      ...orderData,
      updatedAt: serverTimestamp(),
      syncedAt: Date.now()
    });
    await setDoc(orderRef, sanitized, { merge: true });
    console.info(`[Firebase] Order #${orderData.id} synced to Firestore.`);
    return { success: true, id: orderData.id };
  } catch (error) {
    console.warn('[Firebase] Firestore order save error (fallback to local state active):', error);
    return { success: false, error: error.message };
  }
}

/**
 * Helper to save batch to Firestore
 */
export async function saveBatchToFirestore(batchData) {
  try {
    const batchRef = doc(db, 'batches', batchData.id);
    const sanitized = sanitizeForFirestore({
      ...batchData,
      updatedAt: serverTimestamp()
    });
    await setDoc(batchRef, sanitized, { merge: true });
    return { success: true, id: batchData.id };
  } catch (error) {
    console.warn('[Firebase] Firestore batch save error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Helper to remove a batch from Firestore
 */
export async function deleteBatchFromFirestore(batchId) {
  try {
    const batchRef = doc(db, 'batches', batchId);
    await deleteDoc(batchRef);
    return { success: true, id: batchId };
  } catch (error) {
    console.warn('[Firebase] Firestore batch delete error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Helper to sync inventory items with Firestore
 */
export async function saveInventoryToFirestore(inventoryData) {
  try {
    const invRef = doc(db, 'inventory', 'couverture_stocks');
    const sanitized = sanitizeForFirestore({
      items: inventoryData,
      updatedAt: serverTimestamp()
    });
    await setDoc(invRef, sanitized, { merge: true });
    return { success: true };
  } catch (error) {
    console.warn('[Firebase] Firestore inventory save error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Helper to sync kitchen settings and delivery zones with Firestore
 */
export async function saveSettingsToFirestore(settingsData) {
  try {
    const settingsRef = doc(db, 'settings', 'atelier_config');
    const sanitized = sanitizeForFirestore({
      ...settingsData,
      updatedAt: serverTimestamp()
    });
    await setDoc(settingsRef, sanitized, { merge: true });
    return { success: true };
  } catch (error) {
    console.warn('[Firebase] Firestore settings save error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Helper to save or update a product formulation in Firestore
 */
export async function saveProductToFirestore(productData) {
  try {
    const productRef = doc(db, 'products', productData.id);
    const sanitized = sanitizeForFirestore({
      ...productData,
      updatedAt: serverTimestamp()
    });
    await setDoc(productRef, sanitized, { merge: true });
    return { success: true, id: productData.id };
  } catch (error) {
    console.warn('[Firebase] Firestore product save error (fallback to local state):', error);
    return { success: false, error: error.message };
  }
}

/**
 * Helper to remove a product from Firestore
 */
export async function deleteProductFromFirestore(productId) {
  try {
    const productRef = doc(db, 'products', productId);
    await deleteDoc(productRef);
    return { success: true, id: productId };
  } catch (error) {
    console.warn('[Firebase] Firestore product delete error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Helper to save or update an authenticated user profile in Firestore
 */
export async function saveUserToFirestore(userData) {
  try {
    const userId = userData.id || userData.email || userData.uid;
    if (!userId || userId === 'guest@ganachly.com') return null;
    const userRef = doc(db, 'users', userId);
    const sanitized = sanitizeForFirestore({
      ...userData,
      id: userId,
      email: userData.email || userData.id,
      updatedAt: serverTimestamp(),
      lastSeenAt: Date.now()
    });
    await setDoc(userRef, sanitized, { merge: true });
    console.info(`[Firebase] User auth profile for ${userId} saved to Firestore.`);
    return { success: true, id: userId };
  } catch (error) {
    console.warn('[Firebase] Firestore user auth profile save error:', error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Helper to retrieve all registered users from Firestore
 */
export async function getUsersFromFirestore() {
  try {
    const snap = await getDocs(collection(db, 'users'));
    const users = [];
    snap.forEach(docSnap => {
      const data = docSnap.data();
      if (data && (data.id || data.email)) {
        users.push(data);
      }
    });
    return users;
  } catch (error) {
    console.warn('[Firebase] Firestore getUsers error:', error.message);
    return [];
  }
}

/**
 * Helper to register or sign in a user with Firebase Auth and sync their profile
 */
export async function firebaseRegisterOrLogin({ email, password, name, phone, zone, role = 'customer' }) {
  let firebaseUser = null;
  const userPassword = password || 'ganachly70'; // Default secure password if none provided

  try {
    const userCredential = await signInWithEmailAndPassword(authInstance, email, userPassword);
    firebaseUser = userCredential.user;
    console.info('[Firebase Auth] Signed in successfully:', firebaseUser.email);
  } catch (signInErr) {
    if (signInErr.code === 'auth/user-not-found' || signInErr.code === 'auth/invalid-credential' || signInErr.code === 'auth/invalid-email') {
      try {
        const createCredential = await createUserWithEmailAndPassword(authInstance, email, userPassword);
        firebaseUser = createCredential.user;
        console.info('[Firebase Auth] Created new user successfully:', firebaseUser.email);
      } catch (createErr) {
        console.debug('[Firebase Auth] User create notice:', createErr.code);
      }
    } else {
      console.debug('[Firebase Auth] Sign in notice:', signInErr.code);
    }
  }

  const userProfile = {
    id: email,
    uid: firebaseUser ? firebaseUser.uid : `usr-${Date.now()}`,
    email: email,
    name: name || 'Valued Patron',
    role: role,
    phone: phone || '+91 98110 00000',
    zone: zone || 'Faridabad',
    avatar: role === 'admin' ? '👨‍🍳' : '🍫',
    authProvider: firebaseUser ? 'firebase_email_password' : 'custom_patron',
    lastLoginAt: Date.now()
  };

  await saveUserToFirestore(userProfile);
  return userProfile;
}

/**
 * Sign out of Firebase Auth
 */
export async function firebaseSignOutUser() {
  try {
    await signOut(authInstance);
    console.info('[Firebase Auth] Signed out');
    return true;
  } catch (e) {
    console.warn('[Firebase Auth] Sign out notice:', e.message);
    return false;
  }
}

/**
 * Real-time auth session listener to keep user logged in across page reloads & browser restarts
 */
export function initAuthSessionListener(onUserRestored) {
  if (typeof window === 'undefined') return;
  onAuthStateChanged(authInstance, async (fbUser) => {
    if (fbUser && fbUser.email) {
      try {
        const userDocRef = doc(db, 'users', fbUser.email);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          const profile = userSnap.data();
          if (profile && (profile.id || profile.email)) {
            console.info('[Firebase Auth] Restored user session from cache memory:', profile.email || profile.id);
            onUserRestored(profile);
            return;
          }
        }
      } catch (err) {
        console.debug('[Firebase Auth] Cached profile retrieval notice:', err.message);
      }

      onUserRestored({
        id: fbUser.email,
        email: fbUser.email,
        name: fbUser.displayName || fbUser.email.split('@')[0],
        role: fbUser.email.includes('admin') ? 'admin' : 'customer',
        avatar: fbUser.email.includes('admin') ? '👨‍🍳' : '🍫'
      });
    }
  });
}

/**
 * Cache user cart in Firestore cloud memory
 */
export async function saveUserCartToFirestore(userId, cartItems) {
  if (!userId || userId === 'guest@ganachly.com' || userId.includes('guest')) return;
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      cart: sanitizeForFirestore(cartItems),
      cartUpdatedAt: Date.now()
    }, { merge: true });
    console.info(`[Firebase] Cart cache (${cartItems.length} items) saved for ${userId}`);
  } catch (err) {
    console.debug('[Firebase] Cart cloud cache notice:', err.message);
  }
}

/**
 * Retrieve cached cart from Firestore
 */
export async function getUserCartFromFirestore(userId) {
  if (!userId || userId === 'guest@ganachly.com' || userId.includes('guest')) return [];
  try {
    const userRef = doc(db, 'users', userId);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data();
      if (Array.isArray(data.cart) && data.cart.length > 0) {
        return data.cart;
      }
    }
  } catch (err) {
    console.debug('[Firebase] Cart cloud retrieval notice:', err.message);
  }
  return [];
}

/**
 * Clear cached cart in Firestore once order is placed
 */
export async function clearUserCartInFirestore(userId) {
  if (!userId || userId === 'guest@ganachly.com' || userId.includes('guest')) return;
  try {
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, {
      cart: [],
      cartUpdatedAt: Date.now()
    }, { merge: true });
    console.info(`[Firebase] Cloud cart cache cleared for ${userId} following order placement.`);
  } catch (err) {
    console.debug('[Firebase] Cart cloud clear notice:', err.message);
  }
}

