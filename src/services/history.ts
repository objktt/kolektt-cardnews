
export interface HistoryItem {
  id: string; // timestamp-random
  date: string; // ISO string
  headline: string;
  imageUrls: string[];
  projectData: any; // partial ProjectData for restoration if needed
}

const STORAGE_KEY = 'kolektt_history';

export const HistoryService = {
  add: (item: Omit<HistoryItem, 'id' | 'date'>) => {
    if (typeof window === 'undefined') return;
    const history = HistoryService.getAll();
    const newItem: HistoryItem = {
      ...item,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    };
    history.push(newItem);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  },

  getAll: (): HistoryItem[] => {
    if (typeof window === 'undefined') return [];
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  },
  
  clear: () => {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
  }
};
