export interface Notification {
  id: string;
  type: 'generated' | 'saved' | 'published';
  title: string;
  message: string;
  time: Date;
  read: boolean;
}

const STORAGE_KEY = 'notifications';
const MAX_NOTIFICATIONS = 20;

export const NotificationService = {
  getAll(): Notification[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    try {
      const parsed = JSON.parse(stored);
      return parsed.map((n: Notification) => ({ ...n, time: new Date(n.time) }));
    } catch {
      return [];
    }
  },

  add(notification: Omit<Notification, 'id' | 'time' | 'read'>): void {
    if (typeof window === 'undefined') return;
    const notifications = this.getAll();
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      time: new Date(),
      read: false,
    };
    const updated = [newNotification, ...notifications].slice(0, MAX_NOTIFICATIONS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    // Dispatch custom event to notify Header component
    window.dispatchEvent(new CustomEvent('notification-added', { detail: newNotification }));
  },

  markAsRead(id: string): void {
    if (typeof window === 'undefined') return;
    const notifications = this.getAll();
    const updated = notifications.map(n =>
      n.id === id ? { ...n, read: true } : n
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  markAllAsRead(): void {
    if (typeof window === 'undefined') return;
    const notifications = this.getAll();
    const updated = notifications.map(n => ({ ...n, read: true }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  },

  clear(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(STORAGE_KEY);
  },

  // Helper methods for common notification types
  notifyGenerated(title: string, slideCount: number): void {
    this.add({
      type: 'generated',
      title: 'Images Generated',
      message: `"${title}" - ${slideCount} image${slideCount !== 1 ? 's' : ''} created`,
    });
  },

  notifySaved(title: string): void {
    this.add({
      type: 'saved',
      title: 'Draft Saved',
      message: `"${title}" has been saved`,
    });
  },

  notifyPublished(title: string): void {
    this.add({
      type: 'published',
      title: 'Post Published',
      message: `"${title}" is now live`,
    });
  },
};
