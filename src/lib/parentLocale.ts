import { useState, useEffect, useCallback } from 'react';

export const PUBLIC_WEBSITE_ORIGIN = 'https://eraenglish.online';

export type ParentLang = 'en' | 'vi';

const STORAGE_KEY = 'era_parent_portal_lang';
const SYNC_EVENT = 'era-parent-lang-sync';

export function getInitialParentLang(): ParentLang {
  if (typeof window === 'undefined') return 'en';
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved === 'vi' ? 'vi' : 'en';
  } catch {
    return 'en';
  }
}

export function useParentLang(enabled = true): [ParentLang, (next: ParentLang) => void] {
  const [lang, setLangState] = useState<ParentLang>(() =>
    enabled ? getInitialParentLang() : 'en'
  );

  const setLang = useCallback((next: ParentLang) => {
    setLangState(next);
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        // Ignore storage errors in restricted webviews
      }
      window.dispatchEvent(new CustomEvent<ParentLang>(SYNC_EVENT, { detail: next }));
    }
  }, []);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return;

    const handleCustomSync = (e: Event) => {
      const custom = e as CustomEvent<ParentLang>;
      if (custom.detail === 'en' || custom.detail === 'vi') {
        setLangState(custom.detail);
      }
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        setLangState(e.newValue === 'vi' ? 'vi' : 'en');
      }
    };

    window.addEventListener(SYNC_EVENT, handleCustomSync);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener(SYNC_EVENT, handleCustomSync);
      window.removeEventListener('storage', handleStorage);
    };
  }, [enabled]);

  return [enabled ? lang : 'en', setLang];
}
