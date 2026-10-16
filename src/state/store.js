import {
  initialProducts,
  initialPersonas,
  initialOrders,
  initialInventory,
  initialBatches,
  initialDeliveryZones,
  defaultGuestUser
} from '../data/initialData.js';
import {
  saveOrderToFirestore,
  saveBatchToFirestore,
  deleteBatchFromFirestore,
  saveProductToFirestore,
  deleteProductFromFirestore,
  saveUserToFirestore,
  getUsersFromFirestore,
  initAuthSessionListener,
  saveUserCartToFirestore,
  getUserCartFromFirestore,
  clearUserCartInFirestore,
  db,
  collection,
  onSnapshot,
  getDocs
} from '../services/firebase.js';
import { normalizeImageUrl } from '../utils/imageUtils.js';

export const STORAGE_KEY = 'ganachly_master_state_v8';
export const USER_CACHE_KEY = 'ganachly_cached_user';
export const CART_CACHE_KEY = 'ganachly_persistent_cart';
const broadcastChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('ganachly_broadcast') : null;

// Wipe legacy mock storage versions if present
try {
  localStorage.removeItem('ganachly_master_state_v1');
  localStorage.removeItem('ganachly_master_state_v2');
  localStorage.removeItem('ganachly_master_state_v3');
  localStorage.removeItem('ganachly_master_state_v4');
  localStorage.removeItem('ganachly_master_state_v5');
  localStorage.removeItem('ganachly_master_state_v6');
  localStorage.removeItem('ganachly_master_state_v7');
} catch (e) {}

class GanachlyStore {
  constructor() {
    this.subscribers = new Set();
    this.state = this.loadState();

    // Check URL parameters for initial identity override (e.g. ?id=admin@ganachly.com or ?role=admin)
    this.checkUrlIdentity();

    // Initialize Firebase Firestore cloud sync
    this.initFirebaseSync();

    // Listen to cross-tab updates
    if (broadcastChannel) {
      broadcastChannel.onmessage = (event) => {
        if (event.data && event.data.type === 'STATE_UPDATED') {
          this.state = this.loadState();
          this.notifySubscribers();
        }
      };
    }

    window.addEventListener('storage', (e) => {
      if (e.key === STORAGE_KEY || e.key === CART_CACHE_KEY || e.key === USER_CACHE_KEY) {
        this.state = this.loadState();
        this.notifySubscribers();
      }
    });
  }

  loadState() {
    let cachedUser = null;
    try {
      const cachedUserStr = localStorage.getItem(USER_CACHE_KEY);
      if (cachedUserStr) {
        const parsedU = JSON.parse(cachedUserStr);
        if (parsedU && parsedU.id && !parsedU.id.includes('guest') && parsedU.id !== 'guest@ganachly.com') {
          if (parsedU.id?.toLowerCase() === 'hardikkush987@gmail.com' || parsedU.email?.toLowerCase() === 'hardikkush987@gmail.com') {
            parsedU.role = 'admin';
            parsedU.avatar = '👨‍🍳';
            parsedU.title = 'Master Patissier & Founder';
          }
          cachedUser = parsedU;
        }
      }
    } catch (e) {}

    let cachedCart = [];
    try {
      const cachedCartStr = localStorage.getItem(CART_CACHE_KEY);
      if (cachedCartStr) {
        const parsedC = JSON.parse(cachedCartStr);
        if (Array.isArray(parsedC)) {
          cachedCart = parsedC;
        }
      }
    } catch (e) {}

    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const legacyMockProductIds = new Set([
          'prod-1', 'prod-2', 'prod-3', 'prod-4', 'prod-5', 'prod-6',
          'prod-7', 'prod-8', 'prod-9', 'prod-10', 'prod-11', 'prod-12'
        ]);
        const legacyMockIds = new Set(['GAN-8425', 'GAN-8421', 'GAN-8422', 'GAN-8423', 'GAN-8420', 'GAN-8418']);
        const legacyMockBatches = new Set(['BAT-902', 'BAT-903', 'B-408', 'B-409', 'B-410']);
        const isLegacyDummyCustomer = parsed.currentUser && (
          parsed.currentUser.id === 'sakshi@delhincr.com' ||
          parsed.currentUser.id === 'arjun@zomato.com' ||
          parsed.currentUser.name === 'Sakshi Sharma' ||
          parsed.currentUser.name === 'Arjun Mehra'
        );

        const finalCart = (cachedCart && cachedCart.length > 0) ? cachedCart : (parsed.cart || []);

        return {
          currentUser: cachedUser || ((parsed.currentUser && !isLegacyDummyCustomer) ? parsed.currentUser : defaultGuestUser),
          products: (parsed.products || []).filter(p => !legacyMockProductIds.has(p.id)).map(p => {
            if (p.image) p.image = normalizeImageUrl(p.image);
            return p;
          }),
          orders: (parsed.orders || []).filter(o => !legacyMockIds.has(o.id)),
          cart: finalCart,
          inventory: (parsed.inventory || []).filter(i => !['inv-1', 'inv-2', 'inv-3', 'inv-4', 'inv-5', 'inv-6'].includes(i.id)),
          batches: (parsed.batches || []).filter(b => !legacyMockBatches.has(b.id)),
          deliveryZones: parsed.deliveryZones || initialDeliveryZones,
          users: parsed.users || [],
          settings: parsed.settings || {
            cutoffTime: '17:00 IST',
            eveningBakeActive: true,
            vatTempC: 31.5,
            ovenDeckTempC: 172,
            whatsappApiConnected: true
          }
        };
      }
    } catch (e) {
      console.warn('Error loading state from localStorage:', e);
    }

    return {
      currentUser: cachedUser || defaultGuestUser,
      products: initialProducts,
      orders: initialOrders,
      cart: cachedCart || [],
      inventory: initialInventory,
      batches: initialBatches,
      deliveryZones: initialDeliveryZones,
      users: [],
      settings: {
        cutoffTime: '17:00 IST',
        eveningBakeActive: true,
        vatTempC: 31.5,
        ovenDeckTempC: 172,
        whatsappApiConnected: true
      }
    };
  }

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      if (broadcastChannel) {
        broadcastChannel.postMessage({ type: 'STATE_UPDATED', timestamp: Date.now() });
      }
    } catch (e) {
      console.warn('Failed to save state:', e);
    }
    this.notifySubscribers();
  }

  saveStateSilent() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.warn('Failed to save state silently:', e);
    }
    this.notifySubscribers();
  }

  checkUrlIdentity() {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const urlId = urlParams.get('id') || urlParams.get('user');
      const urlRole = urlParams.get('role') || urlParams.get('as');

      if (urlId) {
        const found = initialPersonas.find(p => p.id.toLowerCase() === urlId.toLowerCase() || p.code.toLowerCase() === urlId.toLowerCase());
        if (found) {
          this.state.currentUser = found;
          sessionStorage.setItem('ganachly_session_user', JSON.stringify(found));
          return;
        }
      }

      if (urlRole === 'admin') {
        this.state.currentUser = initialPersonas[0]; // Hardik
        sessionStorage.setItem('ganachly_session_user', JSON.stringify(initialPersonas[0]));
      } else if (urlRole === 'customer') {
        this.state.currentUser = defaultGuestUser;
        sessionStorage.setItem('ganachly_session_user', JSON.stringify(defaultGuestUser));
      }
    } catch (e) {
      // Ignore URL parse errors
    }
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notifySubscribers() {
    this.subscribers.forEach(cb => {
      try {
        cb(this.state);
      } catch (err) {
        console.error('Subscriber error:', err);
      }
    });
  }

  // --- USER & AUTH ---
  getCurrentUser() {
    return this.state.currentUser;
  }

  setCurrentUser(user) {
    if (user && (user.id?.toLowerCase() === 'hardikkush987@gmail.com' || user.email?.toLowerCase() === 'hardikkush987@gmail.com')) {
      user.role = 'admin';
      user.avatar = '👨‍🍳';
      user.title = 'Master Patissier & Founder';
      user.badgeClass = 'bg-primary text-espresso-deep';
      user.zone = 'Faridabad Central Kitchen';
    }
    this.state.currentUser = user;
    
    // Save to persistent cache memory so user does not need to login again and again
    if (user && user.id && !user.id.includes('guest') && user.id !== 'guest@ganachly.com') {
      try {
        localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user));
        sessionStorage.setItem('ganachly_session_user', JSON.stringify(user));
      } catch (e) {}

      // Track in local users directory & save to Firebase Firestore
      const userMap = new Map();
      (this.state.users || []).forEach(u => userMap.set(u.id, u));
      userMap.set(user.id, user);
      this.state.users = Array.from(userMap.values());
      saveUserToFirestore(user);

      // Cloud cart sync: if current local cart has items, cache them to user profile in Firestore
      if (this.state.cart && this.state.cart.length > 0) {
        saveUserCartToFirestore(user.id, this.state.cart);
      } else {
        // If local cart is empty, check if cloud has their saved cart from previous session
        getUserCartFromFirestore(user.id).then(cloudCart => {
          if (cloudCart && cloudCart.length > 0 && this.state.cart.length === 0) {
            this.state.cart = cloudCart;
            try {
              localStorage.setItem(CART_CACHE_KEY, JSON.stringify(cloudCart));
            } catch (e) {}
            this.saveState();
            this.notifySubscribers();
          }
        });
      }
    } else {
      // Guest or sign-out: clear cached login memory
      try {
        localStorage.removeItem(USER_CACHE_KEY);
        sessionStorage.removeItem('ganachly_session_user');
      } catch (e) {}
    }
    
    this.saveState();
  }

  loginWithCustomId({ id, code, name, role, avatar, phone, zone, address }) {
    const isHardik = (id || '').toLowerCase() === 'hardikkush987@gmail.com' || (id || '').toLowerCase() === 'admin@ganachly.com';
    const effectiveRole = isHardik ? 'admin' : (role || 'customer');
    const uniqueCustomerCode = code || (isHardik ? 'ADMIN-GANACHLY-01' : `GAN-CUST-${Math.floor(100000 + Math.random() * 900000)}`);
    const newUser = {
      id: id || (isHardik ? 'hardikkush987@gmail.com' : 'patron@ganachly.com'),
      code: uniqueCustomerCode,
      name: name || (isHardik ? 'Hardik' : 'Valued Patron'),
      title: isHardik ? 'Master Patissier & Founder' : 'Delhi NCR Connoisseur',
      role: effectiveRole,
      avatar: avatar || (isHardik ? '👨‍🍳' : '🍫'),
      badgeClass: isHardik ? 'bg-primary text-espresso-deep' : 'bg-secondary text-espresso-deep',
      phone: phone || (isHardik ? '+91 98110 00192' : '+91 98110 00000'),
      zone: zone || (isHardik ? 'Faridabad Central Kitchen' : 'Delhi NCR'),
      address: address || 'Faridabad, Delhi NCR',
      description: isHardik ? 'Full master access: Live Batches, Dispatch Console, Catalog Manager & Stocks.' : `Connoisseur Patron (${uniqueCustomerCode})`
    };
    this.setCurrentUser(newUser);
    return newUser;
  }

  // --- PRODUCTS ---
  getProducts() {
    return this.state.products;
  }

  getProductById(id) {
    return this.state.products.find(p => p.id === id);
  }

  updateProductStock(productId, stockStatus) {
    const product = this.getProductById(productId);
    if (product) {
      product.stockStatus = stockStatus;
      this.saveState();
      saveProductToFirestore(product);
    }
  }

  updateProductPrice(productId, newPrice) {
    const product = this.getProductById(productId);
    if (product) {
      product.price = parseInt(newPrice, 10) || product.price;
      this.saveState();
      saveProductToFirestore(product);
    }
  }

  patchProduct(productId, updates) {
    const product = this.getProductById(productId);
    if (product) {
      if (updates.image) {
        updates.image = normalizeImageUrl(updates.image);
      }
      Object.assign(product, updates);
      this.saveState();
      saveProductToFirestore(product);
    }
  }

  removeProduct(productId) {
    this.state.products = this.state.products.filter(p => p.id !== productId);
    this.saveState();
    deleteProductFromFirestore(productId);
  }

  addProduct(newProd) {
    const id = newProd.id || ('prod-' + Date.now().toString(36) + '-' + Math.floor(100 + Math.random() * 900));
    const normalizedImg = normalizeImageUrl(newProd.image) || 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80';
    const item = {
      id,
      title: newProd.title || 'Seasonal Couverture Specialty',
      price: parseInt(newProd.price, 10) || 220,
      category: newProd.category || 'brownie',
      image: normalizedImg,
      desc: newProd.desc || newProd.description || 'Micro-batch seasonal confection made with 70.5% Belgian dark couverture.',
      badge: newProd.badge || newProd.tag || '',
      tags: newProd.tags || ['100% Eggless', '70% Couverture'],
      stockStatus: newProd.stockStatus || 'in_stock',
      weight: newProd.weight || '350g',
      couverture: newProd.couverture || '70.5% Callebaut Dark Belgian Couverture',
      eggless: true
    };
    this.state.products.unshift(item);
    this.saveState();
    saveProductToFirestore(item);
    return item;
  }

  // --- CART ---
  getCart() {
    return this.state.cart;
  }

  getCartCount() {
    return this.state.cart.reduce((total, item) => total + item.qty, 0);
  }

  getCartSubtotal() {
    return this.state.cart.reduce((total, item) => total + (item.price * item.qty), 0);
  }

  persistCart() {
    try {
      localStorage.setItem(CART_CACHE_KEY, JSON.stringify(this.state.cart));
    } catch (e) {}

    const user = this.getCurrentUser();
    if (user && user.id && !user.id.includes('guest') && user.id !== 'guest@ganachly.com') {
      saveUserCartToFirestore(user.id, this.state.cart);
    }
  }

  clearCachedCart() {
    try {
      localStorage.removeItem(CART_CACHE_KEY);
    } catch (e) {}

    const user = this.getCurrentUser();
    if (user && user.id && !user.id.includes('guest') && user.id !== 'guest@ganachly.com') {
      clearUserCartInFirestore(user.id);
    }
  }

  addToCart(productId, qty = 1) {
    const product = this.getProductById(productId);
    if (!product) return;
    if (product.stockStatus === 'sold_out') return false;

    const existingIndex = this.state.cart.findIndex(item => item.productId === productId);
    if (existingIndex > -1) {
      this.state.cart[existingIndex].qty += qty;
    } else {
      this.state.cart.push({
        productId,
        title: product.title,
        price: product.price,
        image: product.image,
        weight: product.weight,
        qty: Math.max(1, qty)
      });
    }
    this.persistCart();
    this.saveState();
    return true;
  }

  updateCartQty(productId, qty) {
    if (qty <= 0) {
      this.removeFromCart(productId);
      return;
    }
    const item = this.state.cart.find(c => c.productId === productId);
    if (item) {
      item.qty = qty;
      this.persistCart();
      this.saveState();
    }
  }

  removeFromCart(productId) {
    this.state.cart = this.state.cart.filter(item => item.productId !== productId);
    this.persistCart();
    this.saveState();
  }

  clearCart() {
    this.state.cart = [];
    this.clearCachedCart();
    this.saveState();
  }

  // --- ORDERS ---
  getOrders() {
    return this.state.orders;
  }

  clearAllOrders() {
    this.state.orders = [];
    this.saveState();
  }

  getOrdersForCustomer(customerEmailOrId) {
    if (!customerEmailOrId) return [];
    const query = customerEmailOrId.toLowerCase();
    return this.state.orders.filter(o => 
      (o.customerEmail && o.customerEmail.toLowerCase() === query) ||
      (o.customerId && o.customerId.toLowerCase() === query)
    );
  }

  placeOrder({ customerName, customerEmail, customerPhone, address, zone, serviceType, specialNote, paymentMethod, paymentRef }) {
    if (this.state.cart.length === 0) return null;

    const subtotal = this.getCartSubtotal();
    const deliveryFee = 0; // Dine-In and Takeaway have zero delivery charges
    const total = subtotal;
    const timestampSuffix = Date.now().toString().slice(-4);
    const randomCode = Math.floor(100 + Math.random() * 900);
    const orderId = `GAN-${timestampSuffix}-${randomCode}`;
    const user = this.getCurrentUser();
    const effectiveServiceType = serviceType || zone || 'Dine-In';

    // Map items
    const orderItems = this.state.cart.map(item => ({
      id: item.productId || item.id,
      title: item.title,
      qty: item.qty,
      price: item.price
    }));

    const approxCouvertureKg = parseFloat((this.state.cart.reduce((tot, i) => tot + (i.qty * 0.15), 0)).toFixed(2));

    const newOrder = {
      id: orderId,
      customerName: customerName || user.name || 'Patron',
      customerEmail: customerEmail || user.id || 'patron@ganachly.com',
      customerId: user.code || `CUST-${Math.floor(1000 + Math.random() * 9000)}`,
      phone: customerPhone || user.phone || '+91 98110 00000',
      serviceType: effectiveServiceType,
      zone: effectiveServiceType,
      address: address || (effectiveServiceType === 'Dine-In' ? 'Dine-In (Table Service)' : 'Takeaway (Self Pickup)'),
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) + ' • Storefront',
      timestamp: Date.now(),
      placedAt: new Date().toISOString(),
      channel: 'web',
      specialNote: specialNote || `Fresh order for ${effectiveServiceType}`,
      items: orderItems,
      subtotal,
      deliveryFee: 0,
      total,
      paymentMethod: paymentMethod || 'upi',
      paymentStatus: paymentMethod === 'cod' ? 'Cash on Pickup / Pay at Counter' : 'UPI Verified Instant',
      paymentRef: paymentRef || (paymentMethod === 'cod' ? 'PAY-AT-COUNTER' : `UPI-${Math.floor(1000000000 + Math.random() * 9000000000)}`),
      stage: 'oven', // Starts immediately in the Convection Oven Queue!
      stageLabel: 'In Kitchen Deck Oven',
      couvertureUsedKg: approxCouvertureKg
    };

    // Add order to orders array
    this.state.orders.unshift(newOrder);

    // Deduct Couverture inventory automatically!
    const cal70 = this.state.inventory.find(i => i.id === 'inv-1');
    if (cal70 && cal70.stockKg >= approxCouvertureKg) {
      cal70.stockKg = parseFloat((cal70.stockKg - approxCouvertureKg).toFixed(1));
    }

    // Clear cart from state & cache memory ONLY when order is placed
    this.state.cart = [];
    this.clearCachedCart();

    this.saveState();

    // Persist to Firebase Cloud Firestore
    saveOrderToFirestore(newOrder).then(res => {
      if (res && res.success) {
        console.info(`[Store] Order #${newOrder.id} successfully recorded in Firestore database.`);
      }
    });

    return newOrder;
  }

  placeWAOrder({ name, total, desc, zone }) {
    const timestampSuffix = Date.now().toString().slice(-4);
    const randomCode = Math.floor(100 + Math.random() * 900);
    const orderId = `GAN-WA-${timestampSuffix}-${randomCode}`;
    const now = Date.now();
    const approxCouvertureKg = 0.45;

    const newOrder = {
      id: orderId,
      customerName: name || 'WhatsApp Direct Patron',
      customerEmail: 'whatsapp@direct.order',
      customerId: `WA-${Math.floor(1000 + Math.random() * 9000)}`,
      phone: '+91 WhatsApp Direct',
      zone: zone || 'Faridabad',
      address: `${zone || 'Faridabad'}, Delhi NCR (Via WhatsApp Direct)`,
      time: new Date(now).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) + ' • WhatsApp',
      timestamp: now,
      placedAt: new Date(now).toISOString(),
      channel: 'whatsapp',
      specialNote: desc || 'Direct WhatsApp order logged by kitchen team.',
      items: [
        {
          id: 'wa-item',
          title: desc || 'Custom WhatsApp Selection',
          qty: 1,
          price: parseFloat(total) || 0
        }
      ],
      subtotal: parseFloat(total) || 0,
      deliveryFee: 0,
      total: parseFloat(total) || 0,
      paymentMethod: 'upi',
      paymentStatus: 'UPI Pending Verification',
      paymentRef: `WA-UPI-${Math.floor(100000 + Math.random() * 900000)}`,
      stage: 'oven',
      stageLabel: 'In Kitchen Deck Oven',
      couvertureUsedKg: approxCouvertureKg
    };

    this.state.orders.unshift(newOrder);

    // Deduct Couverture inventory
    const cal70 = this.state.inventory.find(i => i.id === 'inv-1');
    if (cal70 && cal70.stockKg >= approxCouvertureKg) {
      cal70.stockKg = parseFloat((cal70.stockKg - approxCouvertureKg).toFixed(1));
    }

    this.saveState();

    // Persist to Firebase Cloud Firestore
    saveOrderToFirestore(newOrder);

    return newOrder;
  }

  updateOrderStatus(orderId, newStage) {
    const order = this.state.orders.find(o => o.id === orderId);
    if (!order) return;

    order.stage = newStage;
    const stageLabels = {
      new: 'New Inbound Order',
      prep: 'Cold Prep & Melt',
      oven: 'In Kitchen Deck Oven',
      sliced: 'Sliced & Hand-Glazed',
      boxed: 'Sealed Broken Bar Box',
      dispatch: 'Out for NCR Courier',
      completed: 'Delivered'
    };
    order.stageLabel = stageLabels[newStage] || newStage;
    this.saveState();

    // Sync updated stage to Firebase Cloud Firestore
    saveOrderToFirestore(order);
  }

  // --- INVENTORY ---
  getInventory() {
    return this.state.inventory;
  }

  logInwardStock(itemId, addedKg, invoiceRef) {
    const item = this.state.inventory.find(i => i.id === itemId);
    if (item) {
      item.stockKg = parseFloat((item.stockKg + parseFloat(addedKg)).toFixed(1));
      if (item.stockKg > item.maxKg) item.stockKg = item.maxKg;
      this.saveState();
      return true;
    }
    return false;
  }

  restockInventoryItem(itemId, addedKg) {
    return this.logInwardStock(itemId, addedKg);
  }

  restockAllInventory() {
    this.state.inventory.forEach(item => {
      item.stockKg = item.maxKg;
    });
    this.saveState();
  }

  addInventoryItem({ name, stockKg, maxKg, purity, unitCost, category }) {
    const id = 'inv-' + (this.state.inventory.length + 1 + Date.now().toString(36));
    this.state.inventory.push({
      id,
      sku: 'CUSTOM-' + id.toUpperCase(),
      name: name || 'Custom Ingredient',
      category: category || 'ingredient',
      purity: purity || '',
      stockKg: parseFloat(stockKg) || 0,
      maxKg: parseFloat(maxKg) || 10,
      minThresholdKg: parseFloat(maxKg) * 0.2 || 2,
      unitCost: parseFloat(unitCost) || 850,
      lotNumber: 'LOT-CUSTOM',
      location: 'Dry Storage',
      climate: 'Ambient',
      status: 'optimal'
    });
    this.saveState();
  }

  // --- LIVE BATCHES ---
  getBatches() {
    return this.state.batches;
  }

  advanceBatch(batchId) {
    const batch = this.state.batches.find(b => b.id === batchId);
    if (!batch) return;

    if (batch.stage === 'prep') {
      batch.stage = 'baking';
      batch.progressPercent = 50;
      batch.timeRemainingMins = 16;
    } else if (batch.stage === 'baking') {
      batch.stage = 'cooling';
      batch.progressPercent = 90;
      batch.timeRemainingMins = 5;
    } else if (batch.stage === 'cooling') {
      batch.stage = 'glazed';
      batch.progressPercent = 100;
      batch.timeRemainingMins = 0;
    }
    this.saveState();

    // Sync batch stage to Firebase Cloud Firestore
    saveBatchToFirestore(batch);
  }

  createBatch({ recipe, deck = 'Deck 1 (Middle Convection)', units = 36, patissier = 'Chef Hardik' }) {
    const newBatch = {
      id: `BAT-${Math.floor(100 + Math.random() * 900)}`,
      recipe: recipe || 'Artisanal Batch',
      deck,
      tempC: 175,
      units: Number(units) || 36,
      stage: 'prep',
      progressPercent: 20,
      timeRemainingMins: 25,
      patissier
    };
    this.state.batches.unshift(newBatch);
    this.saveState();

    // Persist new batch to Firebase Cloud Firestore
    saveBatchToFirestore(newBatch);

    return newBatch;
  }

  deleteBatch(batchId) {
    this.state.batches = this.state.batches.filter(b => b.id !== batchId);
    this.saveState();
    deleteBatchFromFirestore(batchId);
  }

  // --- Real-time Firebase Cloud Firestore Sync ---
  initFirebaseSync() {
    if (typeof window === 'undefined' || !db || !collection || !onSnapshot) return;
    try {
      // 1. Initial one-time fetch for orders to guarantee instantaneous population
      if (getDocs) {
        getDocs(collection(db, 'orders')).then(snapshot => {
          if (snapshot && !snapshot.empty) {
            const firestoreOrders = [];
            snapshot.forEach(docSnap => {
              const data = docSnap.data();
              if (data && data.id) {
                firestoreOrders.push(data);
              }
            });
            if (firestoreOrders.length > 0) {
              const orderMap = new Map();
              this.state.orders.forEach(o => orderMap.set(o.id, o));
              firestoreOrders.forEach(o => orderMap.set(o.id, o));
              this.state.orders = Array.from(orderMap.values()).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
              this.saveStateSilent();
            }
          }
        }).catch(err => {
          console.debug('[Firebase] Orders initial load notice:', err.message);
        });
      }

      // 2. Real-time snapshot synchronization for orders
      onSnapshot(collection(db, 'orders'), (snapshot) => {
        if (snapshot && !snapshot.empty) {
          const firestoreOrders = [];
          snapshot.forEach(docSnap => {
            const data = docSnap.data();
            if (data && data.id) {
              firestoreOrders.push(data);
            }
          });
          if (firestoreOrders.length > 0) {
            const orderMap = new Map();
            this.state.orders.forEach(o => orderMap.set(o.id, o));
            firestoreOrders.forEach(o => orderMap.set(o.id, o));
            this.state.orders = Array.from(orderMap.values()).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
            this.saveStateSilent();
          }
        }
      }, (err) => {
        console.debug('Firestore orders listener notice:', err.message);
      });

      // Real-time synchronization for batches
      onSnapshot(collection(db, 'batches'), (snapshot) => {
        if (snapshot && !snapshot.empty) {
          const firestoreBatches = [];
          snapshot.forEach(docSnap => {
            const data = docSnap.data();
            if (data && data.id) {
              firestoreBatches.push(data);
            }
          });
          if (firestoreBatches.length > 0) {
            const batchMap = new Map();
            this.state.batches.forEach(b => batchMap.set(b.id, b));
            firestoreBatches.forEach(b => batchMap.set(b.id, b));
            this.state.batches = Array.from(batchMap.values());
            this.saveStateSilent();
          }
        }
      }, (err) => {
        console.debug('Firestore batches listener notice:', err.message);
      });

      // Real-time synchronization for products catalog
      onSnapshot(collection(db, 'products'), (snapshot) => {
        if (snapshot && !snapshot.empty) {
          const firestoreProducts = [];
          snapshot.forEach(docSnap => {
            const data = docSnap.data();
            if (data && data.id) {
              firestoreProducts.push(data);
            }
          });

          if (firestoreProducts.length > 0) {
            const prodMap = new Map();
            // Start with current products
            this.state.products.forEach(p => prodMap.set(p.id, p));
            // Overlay Firestore products
            firestoreProducts.forEach(p => prodMap.set(p.id, p));

            this.state.products = Array.from(prodMap.values());
            this.saveStateSilent();
          }
        }
      }, (err) => {
        console.debug('Firestore products listener notice:', err.message);
      });
      // Real-time synchronization for registered users / patrons
      onSnapshot(collection(db, 'users'), (snapshot) => {
        if (snapshot && !snapshot.empty) {
          const firestoreUsers = [];
          snapshot.forEach(docSnap => {
            const data = docSnap.data();
            if (data && (data.id || data.email)) {
              firestoreUsers.push(data);
            }
          });
          if (firestoreUsers.length > 0) {
            const userMap = new Map();
            (this.state.users || []).forEach(u => userMap.set(u.id || u.email, u));
            firestoreUsers.forEach(u => userMap.set(u.id || u.email, u));
            this.state.users = Array.from(userMap.values());
            this.saveStateSilent();
          }
        }
      }, (err) => {
        console.debug('Firestore users listener notice:', err.message);
      });

      // Auth session cache restoration: automatically restore authenticated user session from cache memory
      initAuthSessionListener((restoredUser) => {
        try {
          if (sessionStorage.getItem('ganachly_explicit_signed_out') === 'true') {
            return;
          }
        } catch (e) {}

        const current = this.getCurrentUser();
        if (!current || current.id.includes('guest') || current.id === 'guest@ganachly.com' || current.id === restoredUser.id) {
          console.info('[Store] Restoring user session from Firebase cache memory:', restoredUser.email || restoredUser.id);
          this.setCurrentUser(restoredUser);
        }
      });
    } catch (e) {
      console.debug('Firebase sync setup:', e);
    }
  }

  getPatrons() {
    return this.state.users || [];
  }

  async refreshUsersFromFirebase() {
    if (typeof window === 'undefined' || !db || !collection || !getDocs) return this.state.users || [];
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      if (snapshot && !snapshot.empty) {
        const firestoreUsers = [];
        snapshot.forEach(docSnap => {
          const data = docSnap.data();
          if (data && (data.id || data.email)) {
            firestoreUsers.push(data);
          }
        });
        if (firestoreUsers.length > 0) {
          const userMap = new Map();
          (this.state.users || []).forEach(u => userMap.set(u.id || u.email, u));
          firestoreUsers.forEach(u => userMap.set(u.id || u.email, u));
          this.state.users = Array.from(userMap.values());
          this.saveState();
          this.notifySubscribers();
        }
      }
    } catch (e) {
      console.debug('[Firebase] Users refresh notice:', e.message);
    }
    return this.state.users || [];
  }

  async refreshOrdersFromFirebase() {
    if (typeof window === 'undefined' || !db || !collection || !getDocs) return this.state.orders;
    try {
      const snapshot = await getDocs(collection(db, 'orders'));
      if (snapshot && !snapshot.empty) {
        const firestoreOrders = [];
        snapshot.forEach(docSnap => {
          const data = docSnap.data();
          if (data && data.id) {
            firestoreOrders.push(data);
          }
        });
        if (firestoreOrders.length > 0) {
          const orderMap = new Map();
          this.state.orders.forEach(o => orderMap.set(o.id, o));
          firestoreOrders.forEach(o => orderMap.set(o.id, o));
          this.state.orders = Array.from(orderMap.values()).sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
          this.saveState();
          this.notifySubscribers();
        }
      }
    } catch (e) {
      console.debug('[Firebase] Orders refresh notice:', e.message);
    }
    return this.state.orders;
  }

  // --- KPI Telemetry ---
  getKpis() {
    const orders = this.state.orders;
    const hearthQueueCount = orders.filter(o => o.stage === 'oven' || o.stage === 'prep' || o.stage === 'new').length;
    const outForDeliveryCount = orders.filter(o => o.stage === 'dispatch').length;
    const deliveredCount = orders.filter(o => o.stage === 'completed').length;
    const cal70 = this.state.inventory.find(i => i.id === 'inv-1');
    const remainingCouvertureKg = cal70 ? cal70.stockKg : 46.8;

    return {
      hearthQueueCount,
      outForDeliveryCount,
      deliveredCount,
      totalOrdersCount: orders.length,
      remainingCouvertureKg,
      vatTempC: this.state.settings.vatTempC,
      ovenDeckTempC: this.state.settings.ovenDeckTempC,
      activeBatchesCount: this.state.batches.length
    };
  }
}

export const store = new GanachlyStore();
