import React, { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { useAuth } from './AuthContext';
import type { BookmarkCategory } from './bookmarks';

interface BookmarksState {
  [category: string]: Record<string, any>; // item_id → data
}

interface BookmarksContextValue {
  isSaved: (category: BookmarkCategory, id: string) => boolean;
  toggle: (category: BookmarkCategory, id: string, data: Record<string, any>) => Promise<boolean>;
  getItems: (category: BookmarkCategory) => any[];
  isLoaded: boolean;
}

const BookmarksContext = createContext<BookmarksContextValue | null>(null);

export function BookmarksProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated, isLoadingAuth } = useAuth();
  const [state, setState] = useState<BookmarksState>({});
  const [isLoaded, setIsLoaded] = useState(false);

  // Load all bookmarks from server when authenticated
  const loadFromServer = useCallback(async () => {
    try {
      const res = await fetch('/api/bookmarks', { credentials: 'include' });
      if (!res.ok) return;
      const { items } = await res.json() as { items: any[] };
      const next: BookmarksState = {};
      for (const item of items) {
        const cat = item._category as string;
        if (!next[cat]) next[cat] = {};
        next[cat][item.id] = item;
      }
      setState(next);
    } catch {}
  }, []);

  useEffect(() => {
    if (isLoadingAuth) return;
    if (isAuthenticated && user) {
      loadFromServer().finally(() => setIsLoaded(true));
    } else {
      setState({});
      setIsLoaded(true);
    }
  }, [isAuthenticated, user, isLoadingAuth, loadFromServer]);

  const isSaved = useCallback((category: BookmarkCategory, id: string): boolean => {
    return !!state[category]?.[id];
  }, [state]);

  const toggle = useCallback(async (
    category: BookmarkCategory,
    id: string,
    data: Record<string, any>,
  ): Promise<boolean> => {
    const currently = !!state[category]?.[id];

    if (currently) {
      // Optimistic remove
      setState(prev => {
        const next = { ...prev, [category]: { ...prev[category] } };
        delete next[category][id];
        return next;
      });
      try {
        await fetch(`/api/bookmarks?category=${category}&item_id=${encodeURIComponent(id)}`, {
          method: 'DELETE',
          credentials: 'include',
        });
      } catch {
        // Roll back on failure
        setState(prev => ({ ...prev, [category]: { ...prev[category], [id]: data } }));
        return true;
      }
      return false;
    } else {
      // Optimistic add
      const enriched = { ...data, id, _category: category };
      setState(prev => ({ ...prev, [category]: { ...prev[category], [id]: enriched } }));
      try {
        await fetch('/api/bookmarks', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ category, item_id: id, data }),
        });
      } catch {
        // Roll back
        setState(prev => {
          const next = { ...prev, [category]: { ...prev[category] } };
          delete next[category][id];
          return next;
        });
        return false;
      }
      return true;
    }
  }, [state]);

  const getItems = useCallback((category: BookmarkCategory): any[] => {
    const map = state[category] ?? {};
    return Object.values(map).sort((a, b) => {
      const at = a.savedAt ?? '';
      const bt = b.savedAt ?? '';
      return bt.localeCompare(at);
    });
  }, [state]);

  return (
    <BookmarksContext.Provider value={{ isSaved, toggle, getItems, isLoaded }}>
      {children}
    </BookmarksContext.Provider>
  );
}

export function useBookmarks() {
  const ctx = useContext(BookmarksContext);
  if (!ctx) throw new Error('useBookmarks must be used within BookmarksProvider');
  return ctx;
}
