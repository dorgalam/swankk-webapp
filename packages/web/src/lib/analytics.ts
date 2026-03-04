/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

function track(event: string, params?: Record<string, any>) {
  if (typeof window !== 'undefined' && typeof window.gtag === 'function') {
    window.gtag('event', event, params);
  }
}

export const analytics = {
  // ── Navigation ────────────────────────────────────────────────
  nav_click: (label: string) =>
    track('nav_click', { nav_label: label }),

  // ── Search ────────────────────────────────────────────────────
  search_opened: () => track('search_opened'),
  /** Fired ~800ms after the user stops typing (min 2 chars) */
  search_query: (query: string, results_count: number) =>
    track('search', { search_term: query, results_count }),
  search_result_click: (type: string, name: string, slug: string, position: number) =>
    track('search_result_click', { result_type: type, result_name: name, result_slug: slug, position }),

  // ── Content views ─────────────────────────────────────────────
  trend_view: (slug: string, name: string) =>
    track('trend_view', { trend_slug: slug, trend_name: name }),

  // ── Products ──────────────────────────────────────────────────
  product_click: (name: string, context_type: 'trend' | 'designer' | 'style', context_slug: string) =>
    track('product_click', { product_name: name, context_type, context_slug }),

  // ── Style / tag clicks ────────────────────────────────────────
  style_tag_click: (tag_slug: string, tag_name: string, context: string) =>
    track('style_tag_click', { tag_slug, tag_name, context }),

  // ── Bookmarks ─────────────────────────────────────────────────
  bookmark_save: (category: string, item_name?: string) =>
    track('bookmark_save', { bookmark_category: category, item_name }),
  bookmark_remove: (category: string, item_name?: string) =>
    track('bookmark_remove', { bookmark_category: category, item_name }),

  // ── Audio ─────────────────────────────────────────────────────
  designer_audio_play: (slug: string, name: string) =>
    track('designer_audio_play', { designer_slug: slug, designer_name: name }),

  // ── Era filters ───────────────────────────────────────────────
  era_decade_filter: (decade: string | null) =>
    track('era_decade_filter', { decade: decade ?? 'all' }),
  era_designer_filter: (designer_slug: string | null) =>
    track('era_designer_filter', { designer_slug: designer_slug ?? 'all' }),

  // ── Auth ──────────────────────────────────────────────────────
  auth_google_click: () => track('auth_google_click'),
  auth_email_expand: () => track('auth_email_expand'),
  auth_mode_switch: (to: 'login' | 'register') =>
    track('auth_mode_switch', { auth_mode: to }),
  auth_submit: (mode: 'login' | 'register') =>
    track('auth_submit', { auth_mode: mode }),
  auth_success: (method: string) =>
    track('login', { method }),
  auth_error: (mode: string, message: string) =>
    track('auth_error', { auth_mode: mode, error_message: message }),
  auth_logout: () => track('logout'),
};
