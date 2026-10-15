/**
 * Ganachly Image Utilities
 * Automatically converts Google Drive sharing/preview links into high-speed direct CDN URLs.
 */

export function normalizeImageUrl(url) {
  if (!url || typeof url !== 'string') return '';
  let clean = url.trim();
  if (!clean) return '';

  // Auto-prepend https if omitted
  if (clean.startsWith('//')) {
    clean = 'https:' + clean;
  } else if (!/^https?:\/\//i.test(clean) && (clean.includes('drive.google.com') || clean.includes('google.com') || clean.includes('dropbox.com'))) {
    clean = 'https://' + clean;
  }

  // Google Drive format 1: /file/d/{id} or /d/{id}
  const driveFileMatch = clean.match(/\/d\/([a-zA-Z0-9_-]+)/i);
  if (driveFileMatch && driveFileMatch[1]) {
    const fileId = driveFileMatch[1];
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }

  // Google Drive format 2: ?id={id} or &id={id}
  const driveIdMatch = clean.match(/[?&]id=([a-zA-Z0-9_-]+)/i);
  if (driveIdMatch && driveIdMatch[1] && (clean.includes('drive.google.com') || clean.includes('docs.google.com'))) {
    const fileId = driveIdMatch[1];
    return `https://lh3.googleusercontent.com/d/${fileId}`;
  }

  // Dropbox direct link normalization (dl=0 -> raw=1)
  if (clean.includes('dropbox.com')) {
    return clean.replace(/[?&]dl=0/, '?raw=1');
  }

  return clean;
}

export function isGoogleDriveUrl(url) {
  if (!url || typeof url !== 'string') return false;
  return url.includes('drive.google.com') || url.includes('docs.google.com') || url.includes('lh3.googleusercontent.com/d/');
}
