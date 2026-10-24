/**
 * Ganachly Image Utilities
 * Advanced image URL scanner, normalizer, and multi-tier fallback engine.
 * Supports:
 * - Google Drive (view, share, uc, open, thumbnail, folder) -> direct Google CDN
 * - Google Search / imgres / url redirect links -> decoded direct target URL
 * - Unsplash web page links -> direct Unsplash CDN image
 * - Imgur gallery & page links -> direct i.imgur.com image
 * - Dropbox sharing links -> raw=1 binary image
 * - Markdown / HTML / CSS wrapped URLs -> unwrapped clean URL
 * - Category-specific high-resolution fallbacks (prevents "single image only" issue)
 */

export const CATEGORY_FALLBACK_IMAGES = {
  brownie: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80',
  brownies: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80',
  brookie: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=600&q=80',
  brookies: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=600&q=80',
  cookie: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80',
  cookies: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=600&q=80',
  cheesecake: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=600&q=80',
  dessert_jars: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=600&q=80',
  jar: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=600&q=80',
  hamper: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80',
  hampers: 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80',
  beverage: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?auto=format&fit=crop&w=600&q=80',
  beverages: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?auto=format&fit=crop&w=600&q=80',
  'hot-chocolate': 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?auto=format&fit=crop&w=600&q=80',
  default: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=80'
};

export const DEFAULT_PRODUCT_IMAGE = CATEGORY_FALLBACK_IMAGES.default;

export function getCategoryFallbackImage(category = '') {
  const cat = (category || '').toLowerCase().trim();
  for (const [key, val] of Object.entries(CATEGORY_FALLBACK_IMAGES)) {
    if (key !== 'default' && cat.includes(key)) {
      return val;
    }
  }
  return DEFAULT_PRODUCT_IMAGE;
}

/**
 * Extracts the Google Drive file ID from any Drive URL variant.
 */
export function extractDriveFileId(url) {
  if (!url || typeof url !== 'string') return null;

  // Format: /file/d/{id} or /d/{id}
  const fileMatch = url.match(/\/d\/([a-zA-Z0-9_-]{12,})/i);
  if (fileMatch) return fileMatch[1];

  // Format: /folders/{id}
  const folderMatch = url.match(/\/folders\/([a-zA-Z0-9_-]{12,})/i);
  if (folderMatch) return folderMatch[1];

  // Format: ?id={id} or &id={id} or open?id={id} or uc?id={id}
  const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]{12,})/i);
  if (idMatch) return idMatch[1];

  // Format: googleusercontent.com/d/{id}
  const lh3Match = url.match(/googleusercontent\.com\/d\/([a-zA-Z0-9_-]{12,})/i);
  if (lh3Match) return lh3Match[1];

  return null;
}

/**
 * Checks if a URL is a Google Drive link
 */
export function isGoogleDriveUrl(url) {
  if (!url || typeof url !== 'string') return false;
  return url.includes('drive.google.com') || url.includes('docs.google.com') || url.includes('googleusercontent.com/d/');
}

/**
 * Scans, cleans, and converts any raw image link into an embeddable image URL.
 */
export function normalizeImageUrl(url, category = '') {
  if (!url || typeof url !== 'string') return getCategoryFallbackImage(category);
  let clean = url.trim();
  if (!clean || clean === 'undefined' || clean === 'null') return getCategoryFallbackImage(category);

  // 1. Unwrap Markdown ![...](URL), HTML <img src="URL">, or CSS url("...")
  const mdMatch = clean.match(/!\[.*?\]\((https?:\/\/[^\s'")]+)\)/i);
  if (mdMatch) clean = mdMatch[1];
  const htmlMatch = clean.match(/src=["'](https?:\/\/[^\s'"]+)["']/i);
  if (htmlMatch) clean = htmlMatch[1];
  const cssMatch = clean.match(/url\(["']?(https?:\/\/[^\s'")]+)["']?\)/i);
  if (cssMatch) clean = cssMatch[1];

  // 2. Decode Google Search image redirect links (imgres, google.com/url)
  if (clean.includes('google.') && (clean.includes('imgres') || clean.includes('/url?'))) {
    try {
      const parsedUrl = new URL(clean.startsWith('http') ? clean : 'https://' + clean);
      const imgurl = parsedUrl.searchParams.get('imgurl') || parsedUrl.searchParams.get('url') || parsedUrl.searchParams.get('q');
      if (imgurl) {
        clean = decodeURIComponent(imgurl);
      }
    } catch (e) {}
  }

  // 3. Auto-prepend https if protocol is omitted
  if (clean.startsWith('//')) {
    clean = 'https:' + clean;
  } else if (!/^https?:\/\//i.test(clean) && !clean.startsWith('data:')) {
    clean = 'https://' + clean;
  }

  // 4. Google Drive conversion to direct Google public CDN
  if (isGoogleDriveUrl(clean)) {
    const fileId = extractDriveFileId(clean);
    if (fileId) {
      return `https://lh3.googleusercontent.com/d/${fileId}`;
    }
  }

  // 5. Unsplash page URL -> direct Unsplash image CDN
  // Example: https://unsplash.com/photos/chocolate-brownie-ABC123xyz or https://unsplash.com/photos/ABC123xyz
  if (clean.includes('unsplash.com/photos/')) {
    const unsplashMatch = clean.match(/unsplash\.com\/photos\/(?:[\w-]+-)?([a-zA-Z0-9_-]{8,})/i);
    if (unsplashMatch && unsplashMatch[1]) {
      return `https://images.unsplash.com/photo-${unsplashMatch[1]}?auto=format&fit=crop&w=800&q=80`;
    }
  }

  // 6. Imgur page URL -> direct image link
  // Example: https://imgur.com/aBcDeFg or https://imgur.com/gallery/aBcDeFg
  if (clean.includes('imgur.com/') && !clean.includes('i.imgur.com')) {
    const imgurMatch = clean.match(/imgur\.com\/(?:gallery\/|a\/)?([a-zA-Z0-9]{5,8})/i);
    if (imgurMatch && imgurMatch[1]) {
      return `https://i.imgur.com/${imgurMatch[1]}.jpg`;
    }
  }

  // 7. Dropbox sharing link -> raw=1 binary stream
  if (clean.includes('dropbox.com')) {
    return clean.replace(/[?&]dl=0/, '').replace(/([?&]?)raw=1/, '') + (clean.includes('?') ? '&raw=1' : '?raw=1');
  }

  return clean;
}

/**
 * Smart multi-tier fallback handler for <img> onError events.
 * If a Google Drive link fails on lh3, it automatically tries the Drive thumbnail endpoint,
 * then the uc endpoint, and finally the category-specific fallback image.
 */
export function handleProductImageError(imgEl, rawEncodedUrl = '', category = '') {
  if (!imgEl) return;
  const originalUrl = decodeURIComponent(rawEncodedUrl || '');
  const attempt = parseInt(imgEl.getAttribute('data-img-attempt') || '0', 10);
  const driveId = extractDriveFileId(originalUrl);

  if (driveId) {
    if (attempt === 0) {
      imgEl.setAttribute('data-img-attempt', '1');
      imgEl.src = `https://drive.google.com/thumbnail?id=${driveId}&sz=w1000`;
      return;
    } else if (attempt === 1) {
      imgEl.setAttribute('data-img-attempt', '2');
      imgEl.src = `https://drive.google.com/uc?export=view&id=${driveId}`;
      return;
    }
  }

  // Final fallback: use category-tailored confection image so it NEVER shows a single repetitive image
  imgEl.onerror = null;
  imgEl.src = getCategoryFallbackImage(category);
}

// Expose on global window object for inline HTML onerror handlers
if (typeof window !== 'undefined') {
  window.handleProductImageError = handleProductImageError;
  window.normalizeImageUrl = normalizeImageUrl;
}

/**
 * Reads a File object and returns a data: URL string via FileReader.
 * Used for local image file upload preview before upload to Firebase Storage.
 */
export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}
