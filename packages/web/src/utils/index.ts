export function createPageUrl(pageName: string) {
    return '/' + pageName.replace(/ /g, '-');
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const R2_PUBLIC_BASE = 'https://pub-3abdbdf94a8c487bbb5eeb5056e7baa7.r2.dev';

/** Converts /api/assets/<key> paths to the direct R2 CDN URL. Pass-through for external URLs. */
export function cdnUrl(url: string | undefined | null): string {
  if (!url) return '';
  if (url.startsWith('/api/assets/')) {
    return R2_PUBLIC_BASE + '/' + url.slice('/api/assets/'.length);
  }
  return url;
}