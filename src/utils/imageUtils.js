/**
 * Ganachly Image Utilities
 * Advanced image URL scanner, normalizer, webpage scraper, and multi-tier fallback engine.
 * Supports:
 * - Direct image scanning from article / webpage URLs (e.g. blog posts, recipe pages, cake shop links)
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

  const fileMatch = url.match(/\/d\/([a-zA-Z0-9_-]{12,})/i);
  if (fileMatch) return fileMatch[1];

  const folderMatch = url.match(/\/folders\/([a-zA-Z0-9_-]{12,})/i);
  if (folderMatch) return folderMatch[1];

  const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]{12,})/i);
  if (idMatch) return idMatch[1];

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
 * Checks if a URL points to an HTML webpage rather than a direct image file.
 */
export function isWebpageUrl(url) {
  if (!url || typeof url !== 'string') return false;
  const clean = url.trim();
  if (!/^https?:\/\//i.test(clean)) return false;
  if (clean.startsWith('data:')) return false;
  if (isGoogleDriveUrl(clean)) return false;

  // Direct image file extensions
  if (/\.(jpe?g|png|webp|gif|svg|avif|ico)(\?.*)?$/i.test(clean)) return false;

  // Known image CDNs that might omit extensions
  if (clean.includes('images.unsplash.com') || clean.includes('i.imgur.com') || clean.includes('res.cloudinary.com')) {
    return false;
  }

  return true;
}

/**
 * In-memory scan cache to prevent duplicate network fetches
 */
const scannedImageCache = new Map();

/**
 * Scans an external webpage URL (recipe, blog, or shop) and extracts its main product/featured image.
 */
export async function scanAndExtractImageFromUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return null;
  const targetUrl = normalizeImageUrl(rawUrl);
  if (!isWebpageUrl(targetUrl)) return targetUrl;

  if (scannedImageCache.has(targetUrl)) {
    return scannedImageCache.get(targetUrl);
  }

  const proxies = [
    (u) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
    (u) => `https://corsproxy.io/?url=${encodeURIComponent(u)}`
  ];

  for (const makeProxy of proxies) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 4500);
      const res = await fetch(makeProxy(targetUrl), {
        signal: controller.signal,
        headers: { 'Accept': 'text/html,application/xhtml+xml' }
      });
      clearTimeout(timer);

      if (!res.ok) continue;
      const html = await res.text();
      if (!html || html.length < 50) continue;

      // 1. og:image
      const ogMatch = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
                      html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
      let img = ogMatch ? ogMatch[1] : null;

      // 2. twitter:image
      if (!img) {
        const twMatch = html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i) ||
                        html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:image["']/i);
        if (twMatch) img = twMatch[1];
      }

      // 3. link rel="image_src"
      if (!img) {
        const linkMatch = html.match(/<link[^>]*rel=["']image_src["'][^>]*href=["']([^"']+)["']/i);
        if (linkMatch) img = linkMatch[1];
      }

      // 4. itemprop="image"
      if (!img) {
        const itemMatch = html.match(/<meta[^>]*itemprop=["']image["'][^>]*content=["']([^"']+)["']/i);
        if (itemMatch) img = itemMatch[1];
      }

      if (img) {
        // Decode HTML entities
        img = img.replace(/&amp;/g, '&');
        // Resolve relative URLs to absolute
        try {
          img = new URL(img, targetUrl).href;
        } catch (e) {}

        scannedImageCache.set(targetUrl, img);
        return img;
      }
    } catch (e) {
      // Continue to next proxy
    }
  }

  // Fallback to the target URL if extraction failed
  return targetUrl;
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
  if (clean.includes('unsplash.com/photos/')) {
    const unsplashMatch = clean.match(/unsplash\.com\/photos\/(?:[\w-]+-)?([a-zA-Z0-9_-]{8,})/i);
    if (unsplashMatch && unsplashMatch[1]) {
      return `https://images.unsplash.com/photo-${unsplashMatch[1]}?auto=format&fit=crop&w=800&q=80`;
    }
  }

  // 6. Imgur page URL -> direct image link
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
 * Smart multi-tier fallback and recovery handler for <img> onError events.
 * 1. If Google Drive fails, tries thumbnail endpoint, then uc endpoint.
 * 2. If it is an article or webpage link, asynchronously scans for og:image/twitter:image.
 * 3. Final fallback: category-tailored confection image.
 */
export function handleProductImageError(imgEl, rawEncodedUrl = '', category = '') {
  if (!imgEl) return;
  const originalUrl = decodeURIComponent(rawEncodedUrl || '');
  const attempt = parseInt(imgEl.getAttribute('data-img-attempt') || '0', 10);
  const driveId = extractDriveFileId(originalUrl);

  // Attempt 1: Drive thumbnail
  if (driveId && attempt === 0) {
    imgEl.setAttribute('data-img-attempt', '1');
    imgEl.src = `https://drive.google.com/thumbnail?id=${driveId}&sz=w1000`;
    return;
  }

  // Attempt 2: Drive uc export
  if (driveId && attempt === 1) {
    imgEl.setAttribute('data-img-attempt', '2');
    imgEl.src = `https://drive.google.com/uc?export=view&id=${driveId}`;
    return;
  }

  // If it's a webpage URL and hasn't been scanned yet
  if (isWebpageUrl(originalUrl) && attempt === 0) {
    imgEl.setAttribute('data-img-attempt', '1');
    scanAndExtractImageFromUrl(originalUrl)
      .then(extracted => {
        if (extracted && extracted !== originalUrl && !isWebpageUrl(extracted)) {
          imgEl.src = extracted;
        } else {
          imgEl.onerror = null;
          imgEl.src = getCategoryFallbackImage(category);
        }
      })
      .catch(() => {
        imgEl.onerror = null;
        imgEl.src = getCategoryFallbackImage(category);
      });
    return;
  }

  // Final fallback: use category-tailored confection image
  imgEl.onerror = null;
  imgEl.src = getCategoryFallbackImage(category);
}

// Expose on global window object for inline HTML handlers
if (typeof window !== 'undefined') {
  window.handleProductImageError = handleProductImageError;
  window.normalizeImageUrl = normalizeImageUrl;
  window.scanAndExtractImageFromUrl = scanAndExtractImageFromUrl;
}

/**
 * Reads a File object and returns a data: URL string via FileReader.
 */
export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}
