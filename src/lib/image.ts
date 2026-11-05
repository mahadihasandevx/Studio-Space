// Hosts that Next.js Image can optimize (mirrors next.config.ts remotePatterns).
// Any other host renders unoptimized so arbitrary public image URLs never throw
// "hostname not configured under images" errors.
export const optimizedImageHosts = new Set([
  "images.unsplash.com",
  "i.ibb.co",
  "images.pexels.com",
]);

export function isOptimizedImageHost(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return optimizedImageHosts.has(hostname);
  } catch {
    return false;
  }
}

/**
 * Props for <Image> loading of arbitrary public URLs. Unoptimized delivery
 * bypasses the Next.js image optimizer entirely, so hosts outside the
 * configured allowlist are safe to render.
 */
export function imageUnoptimized(url: string): boolean {
  return !isOptimizedImageHost(url);
}
