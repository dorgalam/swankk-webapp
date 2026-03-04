export type BookmarkCategory = 'images' | 'designers' | 'products' | 'styles';

export interface ImageBookmark {
  id: string;
  imageUrl: string;
  title: string;
  subtitle?: string;
  linkTo: string;
  savedAt: number;
}

export interface DesignerBookmark {
  id: string;
  imageUrl: string;
  name: string;
  phonetic?: string;
  slug: string;
  savedAt: number;
}

export interface ProductBookmark {
  id: string;
  imageUrl: string;
  name: string;
  brand?: string;
  price?: string;
  link?: string;
  savedAt: number;
}

export interface KeywordBookmark {
  id: string;
  name: string;
  slug: string;
  type: 'style' | 'trend' | 'era';
  imageUrl?: string;
  savedAt: number;
}

const STORAGE_KEYS: Record<BookmarkCategory, string> = {
  images: 'swankk_bookmarks_images',
  designers: 'swankk_bookmarks_designers',
  products: 'swankk_bookmarks_products',
  styles: 'swankk_bookmarks_styles',
};

function load(category: BookmarkCategory): any[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS[category]) || '[]');
  } catch {
    return [];
  }
}

function persist(category: BookmarkCategory, items: any[]) {
  localStorage.setItem(STORAGE_KEYS[category], JSON.stringify(items));
}

export const bookmarks = {
  get: (category: BookmarkCategory): any[] => load(category),

  has: (category: BookmarkCategory, id: string): boolean =>
    load(category).some((item: any) => item.id === id),

  add: (category: BookmarkCategory, item: { id: string;[key: string]: any }) => {
    const items = load(category);
    if (!items.some((i: any) => i.id === item.id)) {
      items.push({ ...item, savedAt: Date.now() });
      persist(category, items);
    }
  },

  remove: (category: BookmarkCategory, id: string) => {
    persist(category, load(category).filter((i: any) => i.id !== id));
  },

  /** Returns true if added, false if removed */
  toggle: (category: BookmarkCategory, item: { id: string;[key: string]: any }): boolean => {
    const items = load(category);
    const idx = items.findIndex((i: any) => i.id === item.id);
    if (idx >= 0) {
      items.splice(idx, 1);
      persist(category, items);
      return false;
    } else {
      items.push({ ...item, savedAt: Date.now() });
      persist(category, items);
      return true;
    }
  },
};

/** Deterministic short ID for products (no database ID) */
export function productBookmarkId(name: string, imageUrl: string): string {
  const raw = `${name}|${imageUrl}`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) - hash + raw.charCodeAt(i)) | 0;
  }
  return `prod_${Math.abs(hash).toString(36)}`;
}
