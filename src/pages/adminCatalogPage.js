import { store } from '../state/store.js';
import { showToast } from '../components/toast.js';
import { normalizeImageUrl, isGoogleDriveUrl, readFileAsDataUrl } from '../utils/imageUtils.js';
import { uploadProductImageToStorage } from '../services/firebase.js';

export function renderAdminCatalogPage() {
  const products = store.getProducts();

  return `
    <div class="flex flex-col w-full gap-space-lg">
      <!-- PAGE HEADER -->
      <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-space-sm">
        <div>
          <span class="font-editorial-eyebrow text-editorial-eyebrow text-primary uppercase tracking-widest text-[11px]">Nocturne Atelier Menu & Formulary</span>
          <h1 class="font-headline-lg text-headline-lg text-gold-light mt-1">Confectionery Catalog Manager</h1>
          <p class="font-body-md text-body-md text-on-surface-variant text-sm mt-0.5">
            ${products.length} artisanal formulations · Live pricing and stock allocation across Delhi NCR
          </p>
        </div>
        <div class="flex items-center gap-2">
          <button id="btn-add-product" class="flex items-center gap-2 px-space-md py-2.5 rounded-lg bg-gradient-to-r from-gold-hover to-primary-container text-espresso-deep font-label-action text-label-action uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-[0_4px_16px_rgba(200,151,58,0.25)]">
            <span class="material-symbols-outlined text-[18px]">add_circle</span>
            Add New Item
          </button>
        </div>
      </div>

      <!-- CATALOG ITEMS GRID -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-space-md" id="catalog-grid">
        ${products.length === 0 ? `
          <div class="col-span-full py-16 px-6 text-center rounded-2xl bg-espresso-panel/40 border border-outline-variant/15 flex flex-col items-center justify-center">
            <div class="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4 border border-primary/20">
              <span class="material-symbols-outlined text-3xl">cookie</span>
            </div>
            <h3 class="font-headline-sm text-lg text-gold-light mb-1 font-semibold">Catalog is Empty</h3>
            <p class="text-xs text-on-surface-variant max-w-md mx-auto mb-6 font-body-sm leading-relaxed">
              All hardcoded and legacy items have been removed. Add your first artisanal confection below to publish it live to the storefront and sync it to Firebase.
            </p>
            <button id="btn-add-product-empty" class="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-gold-hover to-primary-container text-espresso-deep font-label-action text-xs uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all shadow-[0_4px_16px_rgba(200,151,58,0.25)] font-bold">
              <span class="material-symbols-outlined text-[18px]">add_circle</span>
              Add First Creation
            </button>
          </div>
        ` : products.map(p => `
          <div class="product-admin-card rounded-xl bg-espresso-panel border border-outline-variant/20 overflow-hidden flex flex-col justify-between group hover:border-primary/40 transition-all" data-id="${p.id}">
            <div class="relative h-44 w-full bg-surface-container overflow-hidden">
              <img src="${p.image}" alt="${p.title}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80'">
              <div class="absolute inset-0 bg-gradient-to-t from-espresso-panel via-transparent to-black/30"></div>
              <div class="absolute top-3 left-3 flex flex-wrap gap-1">
                <span class="px-2 py-0.5 rounded-full text-[10px] font-label-badge uppercase tracking-wider bg-black/60 backdrop-blur-md text-gold-light border border-primary/20">
                  ${p.category || 'Atelier'}
                </span>
                ${p.badge ? `
                  <span class="px-2 py-0.5 rounded-full text-[10px] font-label-badge uppercase tracking-wider bg-primary text-espresso-deep font-bold">
                    ${p.badge}
                  </span>
                ` : ''}
              </div>
              <div class="absolute top-3 right-3">
                <span class="px-2 py-0.5 rounded-full text-[10px] font-label-badge uppercase font-bold ${p.stockStatus !== 'sold_out' ? 'bg-whatsapp-green/20 text-whatsapp-green border border-whatsapp-green/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}">
                  ${p.stockStatus !== 'sold_out' ? 'In Stock' : 'Sold Out'}
                </span>
              </div>
            </div>

            <div class="p-5 flex-1 flex flex-col justify-between gap-4">
              <div>
                <div class="flex items-start justify-between gap-2">
                  <h3 class="font-headline-sm text-lg text-on-surface font-bold leading-snug">${p.title}</h3>
                </div>
                <p class="text-xs text-on-surface-variant line-clamp-2 mt-1 font-body-sm">${p.desc || p.description || ''}</p>
                <div class="flex items-center gap-3 mt-2 text-[11px] text-on-surface-variant">
                  <span class="flex items-center gap-1"><span class="material-symbols-outlined text-[13px] text-primary">scale</span> ${p.weight || '350g'}</span>
                  <span class="flex items-center gap-1"><span class="material-symbols-outlined text-[13px] text-primary">cookie</span> ${p.couverture || '70.5% Callebaut'}</span>
                </div>
              </div>

              <!-- Price & Controls -->
              <div class="pt-3 border-t border-outline-variant/15 flex flex-col gap-2.5">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-1.5">
                    <span class="text-xs text-on-surface-variant font-label-badge uppercase">Price:</span>
                    <div class="relative w-24">
                      <span class="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-primary font-bold">₹</span>
                      <input type="number" value="${p.price}" class="product-price-input w-full pl-6 pr-2 py-1 text-sm font-bold bg-surface-container rounded border border-outline-variant/20 text-gold-light focus:outline-none focus:ring-1 focus:ring-primary" data-id="${p.id}">
                    </div>
                  </div>
                  <button class="btn-toggle-stock text-xs font-label-action uppercase tracking-wider px-2.5 py-1 rounded bg-surface-container hover:bg-surface-bright text-on-surface transition-all" data-id="${p.id}">
                    ${p.stockStatus !== 'sold_out' ? 'Mark Sold Out' : 'Set Available'}
                  </button>
                </div>

                <div class="flex items-center justify-end gap-2">
                  <button class="btn-edit-product text-xs font-label-action uppercase tracking-wider text-primary hover:text-gold-light transition-colors py-1 px-2" data-id="${p.id}">
                    Edit Details
                  </button>
                  <button class="btn-delete-product text-xs font-label-action uppercase tracking-wider text-red-400/80 hover:text-red-400 transition-colors py-1 px-2" data-id="${p.id}">
                    Remove
                  </button>
                </div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- Edit/Add Product Modal -->
    <div id="product-modal" class="fixed inset-0 z-50 hidden items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div class="w-full max-w-lg bg-espresso-deep rounded-2xl shadow-2xl border border-primary/20 my-8">
        <div class="px-6 py-5 border-b border-primary/15 flex items-center justify-between">
          <h2 id="product-modal-title" class="font-headline-md text-headline-md text-gold-light">Artisanal Formulation</h2>
          <button id="product-modal-close" class="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center hover:bg-surface-bright">
            <span class="material-symbols-outlined text-[18px] text-on-surface-variant">close</span>
          </button>
        </div>
        <form id="product-form" class="p-6 space-y-4">
          <input type="hidden" id="form-product-id">
          <div>
            <label class="text-xs font-label-badge uppercase tracking-wider text-gold-cream mb-1 block">Title</label>
            <input id="form-product-title" required type="text" class="w-full px-4 py-2 rounded-lg bg-surface-container text-on-surface text-sm focus:outline-none border border-outline-variant/20">
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-xs font-label-badge uppercase tracking-wider text-gold-cream mb-1 block">Price (₹)</label>
              <input id="form-product-price" required type="number" class="w-full px-4 py-2 rounded-lg bg-surface-container text-on-surface text-sm focus:outline-none border border-outline-variant/20">
            </div>
            <div>
              <label class="text-xs font-label-badge uppercase tracking-wider text-gold-cream mb-1 block">Category</label>
              <select id="form-product-category" class="w-full px-4 py-2 rounded-lg bg-surface-container text-on-surface text-sm focus:outline-none border border-outline-variant/20">
                <option value="brownies">Signature Brownies</option>
                <option value="brookies">Brookies & Cookies</option>
                <option value="dessert_jars">Cheesecakes & Jars</option>
                <option value="hampers">Luxury Hampers</option>
                <option value="beverages">Nocturne Beverages</option>
              </select>
            </div>
          </div>
          <div>
            <label class="text-xs font-label-badge uppercase tracking-wider text-gold-cream mb-1 block">Description</label>
            <textarea id="form-product-desc" rows="3" class="w-full px-4 py-2 rounded-lg bg-surface-container text-on-surface text-sm focus:outline-none border border-outline-variant/20 resize-none"></textarea>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="text-xs font-label-badge uppercase tracking-wider text-gold-cream mb-1 block">Weight / Portions</label>
              <input id="form-product-weight" type="text" placeholder="e.g. 400g (Pack of 4)" class="w-full px-4 py-2 rounded-lg bg-surface-container text-on-surface text-sm focus:outline-none border border-outline-variant/20">
            </div>
            <div>
              <label class="text-xs font-label-badge uppercase tracking-wider text-gold-cream mb-1 block">Badge Tag</label>
              <input id="form-product-tag" type="text" placeholder="e.g. Best Seller / New" class="w-full px-4 py-2 rounded-lg bg-surface-container text-on-surface text-sm focus:outline-none border border-outline-variant/20">
            </div>
          </div>
          <div>
            <div class="flex items-center justify-between mb-1.5">
              <label class="text-xs font-label-badge uppercase tracking-wider text-gold-cream block">
                Product Image
              </label>
              <span id="drive-badge-indicator" class="hidden text-[10px] text-whatsapp-green font-bold uppercase tracking-wider items-center gap-1">
                <span class="material-symbols-outlined text-[13px]">check_circle</span>
                Drive Link Converted
              </span>
            </div>

            <!-- Tab switcher: Upload vs URL -->
            <div class="flex rounded-lg overflow-hidden border border-outline-variant/25 mb-2.5">
              <button type="button" id="img-tab-upload" class="flex-1 py-1.5 text-[11px] font-label-badge uppercase tracking-wider bg-primary text-espresso-deep font-bold transition-all">
                <span class="material-symbols-outlined text-[13px] align-middle">upload</span> Upload File
              </button>
              <button type="button" id="img-tab-url" class="flex-1 py-1.5 text-[11px] font-label-badge uppercase tracking-wider bg-surface-container text-on-surface-variant hover:text-gold-cream transition-all">
                <span class="material-symbols-outlined text-[13px] align-middle">link</span> Paste URL
              </button>
            </div>

            <!-- Upload Panel (default visible) -->
            <div id="img-panel-upload">
              <label for="form-product-image-file" class="flex flex-col items-center justify-center w-full h-24 rounded-xl border-2 border-dashed border-primary/30 bg-surface-container-low hover:border-primary/60 hover:bg-surface-container cursor-pointer transition-all group">
                <span class="material-symbols-outlined text-3xl text-primary/50 group-hover:text-primary transition-colors">add_photo_alternate</span>
                <span class="text-[11px] text-on-surface-variant mt-1">Click to choose an image from your device</span>
                <span class="text-[10px] text-on-surface-variant/60">JPG, PNG, WEBP &middot; Max 5 MB</span>
              </label>
              <input id="form-product-image-file" type="file" accept="image/jpeg,image/png,image/webp,image/gif" class="hidden">
              <div id="upload-progress" class="hidden mt-2 flex items-center gap-2 text-xs text-gold-cream">
                <span class="material-symbols-outlined text-[16px] animate-spin">sync</span>
                <span>Uploading to cloud storage&hellip;</span>
              </div>
            </div>

            <!-- URL Panel (hidden by default) -->
            <div id="img-panel-url" class="hidden">
              <input id="form-product-image" type="text" placeholder="Paste image URL or Google Drive sharing link&hellip;"
                class="w-full px-4 py-2.5 rounded-lg bg-surface-container text-on-surface text-sm focus:outline-none focus:ring-1 focus:ring-primary border border-outline-variant/20 font-mono text-xs">
              <p class="text-[11px] text-on-surface-variant/75 mt-1 leading-relaxed">
                Direct image URLs or Google Drive sharing links. Set Drive permission to <b>&ldquo;Anyone with the link can view&rdquo;</b>.
              </p>
            </div>

            <!-- Hidden field: always holds the final resolved image URL -->
            <input type="hidden" id="form-product-image-final">

            <!-- Live Preview -->
            <div id="image-preview-container" class="mt-2.5 hidden p-2.5 rounded-xl bg-surface-container-low border border-primary/20 items-center gap-3">
              <div class="w-16 h-16 rounded-lg bg-surface-container overflow-hidden flex-shrink-0 border border-outline-variant/30 flex items-center justify-center">
                <img id="image-preview-thumb" src="" alt="Preview" class="w-full h-full object-cover"
                  onerror="this.onerror=null; var s=document.getElementById('image-preview-status'); if(s){s.textContent='Image failed to load'; s.style.color='#f87171';}">
              </div>
              <div class="min-w-0 flex-1">
                <span class="text-[11px] font-bold text-gold-cream block truncate" id="image-preview-status">Image Preview</span>
                <span class="text-[10px] text-on-surface-variant truncate block font-mono" id="image-preview-url"></span>
              </div>
            </div>
          </div>
          <button type="submit" class="w-full py-3 rounded-xl bg-gradient-to-r from-gold-hover to-primary-container text-espresso-deep font-label-action uppercase tracking-widest hover:brightness-110 transition-all font-bold">
            Commit Formulation to Catalog →
          </button>
        </form>
      </div>
    </div>
  `;
}

export function attachAdminCatalogPageEvents() {
  const modal = document.getElementById('product-modal');
  const modalClose = document.getElementById('product-modal-close');
  const form = document.getElementById('product-form');

  if (modalClose && modal) {
    modalClose.onclick = () => modal.classList.replace('flex', 'hidden');
    modal.onclick = (e) => { if (e.target === modal) modal.classList.replace('flex', 'hidden'); };
  }

  // Toggle stock
  document.querySelectorAll('.btn-toggle-stock').forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-id');
      const p = store.getProductById(id);
      if (p) {
        const newStatus = p.stockStatus === 'sold_out' ? 'in_stock' : 'sold_out';
        store.updateProductStock(id, newStatus);
        showToast(`${p.title} is now ${newStatus === 'sold_out' ? 'Sold Out' : 'Available'}`, 'inventory_2');
        window.refreshCurrentPage();
      }
    };
  });

  // Price input change
  document.querySelectorAll('.product-price-input').forEach(inp => {
    inp.onchange = () => {
      const id = inp.getAttribute('data-id');
      const newPrice = parseFloat(inp.value);
      if (!isNaN(newPrice) && newPrice > 0) {
        store.updateProductPrice(id, newPrice);
        showToast(`Price updated to ₹${newPrice}`, 'check_circle');
      }
    };
  });

  // Delete product
  document.querySelectorAll('.btn-delete-product').forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-id');
      const p = store.getProductById(id);
      if (confirm(`Remove "${p?.title}" from the atelier catalog?`)) {
        store.removeProduct(id);
        showToast(`${p?.title} removed from catalog`, 'delete');
        window.refreshCurrentPage();
      }
    };
  });

  const imageFileInput = document.getElementById('form-product-image-file');
  const imageUrlInput = document.getElementById('form-product-image');
  const imageFinalInput = document.getElementById('form-product-image-final');
  const previewContainer = document.getElementById('image-preview-container');
  const previewThumb = document.getElementById('image-preview-thumb');
  const previewUrl = document.getElementById('image-preview-url');
  const previewStatus = document.getElementById('image-preview-status');
  const driveBadge = document.getElementById('drive-badge-indicator');
  const uploadProgress = document.getElementById('upload-progress');
  const tabUpload = document.getElementById('img-tab-upload');
  const tabUrl = document.getElementById('img-tab-url');
  const panelUpload = document.getElementById('img-panel-upload');
  const panelUrl = document.getElementById('img-panel-url');

  // Tab switcher
  function setTab(tab) {
    if (tab === 'upload') {
      tabUpload.className = 'flex-1 py-1.5 text-[11px] font-label-badge uppercase tracking-wider bg-primary text-espresso-deep font-bold transition-all';
      tabUrl.className = 'flex-1 py-1.5 text-[11px] font-label-badge uppercase tracking-wider bg-surface-container text-on-surface-variant hover:text-gold-cream transition-all';
      panelUpload.classList.remove('hidden');
      panelUrl.classList.add('hidden');
    } else {
      tabUrl.className = 'flex-1 py-1.5 text-[11px] font-label-badge uppercase tracking-wider bg-primary text-espresso-deep font-bold transition-all';
      tabUpload.className = 'flex-1 py-1.5 text-[11px] font-label-badge uppercase tracking-wider bg-surface-container text-on-surface-variant hover:text-gold-cream transition-all';
      panelUrl.classList.remove('hidden');
      panelUpload.classList.add('hidden');
    }
  }
  if (tabUpload) tabUpload.onclick = () => setTab('upload');
  if (tabUrl) tabUrl.onclick = () => setTab('url');

  // Show preview from a final resolved URL
  const showPreview = (url, label = 'Image Preview') => {
    if (!url) {
      previewContainer?.classList.add('hidden');
      previewContainer?.classList.remove('flex');
      return;
    }
    if (previewThumb) previewThumb.src = url;
    if (previewUrl) previewUrl.textContent = url.length > 60 ? url.slice(0, 57) + '…' : url;
    if (previewStatus) { previewStatus.textContent = label; previewStatus.style.color = ''; }
    previewContainer?.classList.remove('hidden');
    previewContainer?.classList.add('flex');
  };

  const updateImagePreview = (rawUrl) => {
    if (!rawUrl || !rawUrl.trim()) {
      previewContainer?.classList.add('hidden');
      previewContainer?.classList.remove('flex');
      driveBadge?.classList.add('hidden');
      driveBadge?.classList.remove('flex');
      if (imageFinalInput) imageFinalInput.value = '';
      return;
    }
    const normalized = normalizeImageUrl(rawUrl);
    const isDrive = isGoogleDriveUrl(rawUrl);
    if (driveBadge) {
      if (isDrive) { driveBadge.classList.remove('hidden'); driveBadge.classList.add('flex'); }
      else { driveBadge.classList.remove('flex'); driveBadge.classList.add('hidden'); }
    }
    if (imageFinalInput) imageFinalInput.value = normalized;
    showPreview(normalized, isDrive ? 'Google Drive Image' : 'Image Preview');
  };

  if (imageUrlInput) {
    imageUrlInput.addEventListener('input', (e) => updateImagePreview(e.target.value));
    imageUrlInput.addEventListener('change', (e) => updateImagePreview(e.target.value));
  }

  // File upload handler
  if (imageFileInput) {
    imageFileInput.addEventListener('change', async (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      if (file.size > 5 * 1024 * 1024) {
        showToast('Image must be under 5 MB', 'error');
        return;
      }
      // Show local preview immediately while uploading
      const dataUrl = await readFileAsDataUrl(file);
      if (imageFinalInput) imageFinalInput.value = dataUrl; // temp
      showPreview(dataUrl, 'Uploading…');
      if (uploadProgress) uploadProgress.classList.remove('hidden');

      try {
        const downloadUrl = await uploadProductImageToStorage(file);
        if (imageFinalInput) imageFinalInput.value = downloadUrl;
        showPreview(downloadUrl, '✓ Uploaded to cloud storage');
        showToast('Image uploaded successfully!', 'check_circle');
      } catch (err) {
        // Keep the local data URL as fallback
        showToast('Cloud upload failed — using local preview only', 'warning');
        if (previewStatus) previewStatus.textContent = '⚠ Using local preview (not saved to cloud)';
      } finally {
        if (uploadProgress) uploadProgress.classList.add('hidden');
      }
    });
  }

  // Add Product button
  const addBtn = document.getElementById('btn-add-product');
  const addEmptyBtn = document.getElementById('btn-add-product-empty');
  const triggerAdd = () => {
    document.getElementById('product-modal-title').innerText = 'Add New Formulation';
    document.getElementById('form-product-id').value = '';
    form.reset();
    if (imageFinalInput) imageFinalInput.value = '';
    setTab('upload');
    updateImagePreview('');
    modal.classList.replace('hidden', 'flex');
  };
  if (addBtn && modal) {
    addBtn.onclick = triggerAdd;
  }
  if (addEmptyBtn && modal) {
    addEmptyBtn.onclick = triggerAdd;
  }

  // Edit Product button
  document.querySelectorAll('.btn-edit-product').forEach(btn => {
    btn.onclick = () => {
      const id = btn.getAttribute('data-id');
      const p = store.getProductById(id);
      if (!p || !modal) return;
      document.getElementById('product-modal-title').innerText = 'Edit Formulation';
      document.getElementById('form-product-id').value = p.id;
      document.getElementById('form-product-title').value = p.title || '';
      document.getElementById('form-product-price').value = p.price || '';
      document.getElementById('form-product-category').value = p.category || 'brownies';
      document.getElementById('form-product-desc').value = p.desc || p.description || '';
      document.getElementById('form-product-weight').value = p.weight || '';
      document.getElementById('form-product-tag').value = p.badge || p.tag || '';
      // Pre-fill both the URL field and the final hidden field
      const existingImg = p.image || '';
      if (imageUrlInput) imageUrlInput.value = existingImg;
      if (imageFinalInput) imageFinalInput.value = existingImg;
      setTab('url');
      updateImagePreview(existingImg);
      modal.classList.replace('hidden', 'flex');
    };
  });

  // Handle Form Submit
  if (form) {
    form.onsubmit = (e) => {
      e.preventDefault();
      const id = document.getElementById('form-product-id').value;
      // Use the hidden final field (set by both upload and URL paths)
      const rawImage = (imageFinalInput?.value || imageUrlInput?.value || '').trim();
      const finalImage = rawImage.startsWith('data:') ? rawImage
        : (normalizeImageUrl(rawImage) || 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80');

      const data = {
        title: document.getElementById('form-product-title').value.trim(),
        price: parseFloat(document.getElementById('form-product-price').value),
        category: document.getElementById('form-product-category').value,
        desc: document.getElementById('form-product-desc').value.trim(),
        weight: document.getElementById('form-product-weight').value.trim() || '350g',
        badge: document.getElementById('form-product-tag').value.trim(),
        image: finalImage,
        stockStatus: 'in_stock'
      };

      if (id) {
        store.patchProduct(id, data);
        showToast(`${data.title} updated with direct image link`, 'check_circle');
      } else {
        store.addProduct(data);
        showToast(`${data.title} added with direct image link`, 'check_circle');
      }

      modal.classList.replace('flex', 'hidden');
      window.refreshCurrentPage();
    };
  }
}
