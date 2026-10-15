/**
 * Ganachly Image Utilities
 * Converts Google Drive sharing/preview links into embeddable thumbnail URLs.
 * Uses the /thumbnail endpoint which works publicly without CORS issues.
 */

/**
 * Extracts the Google Drive file ID from any Drive URL variant.
 */
function extractDriveFileId(url) {
  if (!url) return null;

  // Format: /file/d/{id}/view or /d/{id}
  const fileMatch = url.match(/\/d\/([a-zA-Z0-9_-]{10,})/i);
  if (fileMatch) return fileMatch[1];

  // Format: ?id={id} or &id={id}
  const idMatch = url.match(/[?&]id=([a-zA-Z0-9_-]{10,})/i);
  if (idMatch) return idMatch[1];

  // Format: open?id= (Drive open link)
  const openMatch = url.match(/open\?id=([a-zA-Z0-9_-]{10,})/i);
  if (openMatch) return openMatch[1];

  return null;
}

/**
 * Converts any image URL to its best embeddable form.
 * - Google Drive links → /thumbnail endpoint (sz=w800, works without CORS)
 * - Dropbox links → raw=1 format
 * - Other URLs → cleaned and returned as-is
 */
export function normalizeImageUrl(url) {
  if (!url || typeof url !== 'string') return '';
  let clean = url.trim();
  if (!clean) return '';

  // Auto-prepend https if omitted
  if (clean.startsWith('//')) {
    clean = 'https:' + clean;
  } else if (!/^https?:\/\//i.test(clean)) {
    clean = 'https://' + clean;
  }

  // Google Drive: convert to thumbnail endpoint (embeds cleanly in <img> tags)
  if (clean.includes('drive.google.com') || clean.includes('docs.google.com')) {
    const fileId = extractDriveFileId(clean);
    if (fileId) {
      // sz=w800 gives ~800px wide thumbnail; works for public files
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`;
    }
  }

  // Already a converted thumbnail URL — return as-is
  if (clean.includes('drive.google.com/thumbnail')) {
    return clean;
  }

  // Dropbox: dl=0 → raw=1
  if (clean.includes('dropbox.com')) {
    return clean.replace(/[?&]dl=0/, '').replace(/([?&]?)raw=1/, '') + (clean.includes('?') ? '&raw=1' : '?raw=1');
  }

  return clean;
}

/**
 * Returns true if the URL is a Google Drive / Drive thumbnail URL.
 */
export function isGoogleDriveUrl(url) {
  if (!url || typeof url !== 'string') return false;
  return url.includes('drive.google.com') || url.includes('docs.google.com');
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
