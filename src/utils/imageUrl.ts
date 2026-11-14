import { apiBaseUrl } from '../services/localApi';

/**
 * Resolves any image URL from CMS data, local uploads, or external CDN.
 * Handles:
 * - Full URLs: https://... or http://...
 * - Data URLs: data:image/...
 * - Blob URLs: blob:...
 * - Relative upload URLs: /uploads/... (prepended with apiBaseUrl if configured)
 * - Empty / null / undefined: returns fallback
 */
export function resolveImageUrl(url?: string | null, fallback = '/fenu-brand.png'): string {
  if (!url || typeof url !== 'string' || !url.trim()) {
    return fallback;
  }

  const trimmed = url.trim();

  // If already absolute or embedded data URI, return as-is
  if (
    trimmed.startsWith('data:') ||
    trimmed.startsWith('blob:') ||
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://')
  ) {
    return trimmed;
  }

  // If starts with /uploads and an external API host is configured in Vite
  if (trimmed.startsWith('/uploads') && apiBaseUrl) {
    return `${apiBaseUrl}${trimmed}`;
  }

  // Root-relative path (e.g. /uploads/... on same origin or /fenu-brand.png)
  return trimmed;
}
