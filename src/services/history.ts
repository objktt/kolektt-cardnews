export interface HistoryItem {
  id: string; // timestamp-random
  date: string; // ISO string
  headline: string;
  imageUrls: string[];
  projectData: any; // partial ProjectData for restoration if needed
}

const STORAGE_KEY = 'kolektt_history';
const MAX_HISTORY_ITEMS = 10; // Limit to prevent quota issues

export const HistoryService = {
  add: (item: Omit<HistoryItem, 'id' | 'date'>) => {
    if (typeof window === 'undefined') return;

    try {
      const history = HistoryService.getAll();
      const newItem: HistoryItem = {
        ...item,
        id: Date.now().toString(),
        date: new Date().toISOString(),
        // Don't store base64 images in localStorage - only external URLs
        imageUrls: item.imageUrls.filter(url => !url.startsWith('data:')),
        // Store minimal project data to save space
        projectData: null,
      };

      history.push(newItem);

      // Keep only the most recent items
      const trimmedHistory = history.slice(-MAX_HISTORY_ITEMS);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedHistory));
    } catch (e) {
      // Handle quota exceeded - clear old history and try again
      console.warn('LocalStorage quota exceeded, clearing history:', e);
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Ignore if even removal fails
      }
    }
  },

  getAll: (): HistoryItem[] => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  },

  clear: () => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore errors
    }
  }
};
