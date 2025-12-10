'use client';

import { useState, useRef, useEffect } from 'react';
import { Bell, Search, LogOut, Image, FileText, CheckCircle } from 'lucide-react';
import { useSignOut } from '@nhost/nextjs';
import { useRouter } from 'next/navigation';
import type { User } from '@nhost/nextjs';

interface Notification {
  id: string;
  type: 'generated' | 'saved' | 'published';
  title: string;
  message: string;
  time: Date;
  read: boolean;
}

interface HeaderProps {
  user?: User | null;
}

export function Header({ user }: HeaderProps) {
  const { signOut } = useSignOut();
  const router = useRouter();
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Load notifications from localStorage
  useEffect(() => {
    const loadNotifications = () => {
      const stored = localStorage.getItem('notifications');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setNotifications(parsed.map((n: Notification) => ({ ...n, time: new Date(n.time) })));
        } catch {
          setNotifications([]);
        }
      }
    };

    loadNotifications();

    // Listen for new notifications
    const handleNewNotification = () => loadNotifications();
    window.addEventListener('notification-added', handleNewNotification);
    return () => window.removeEventListener('notification-added', handleNewNotification);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setNotificationOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    localStorage.setItem('notifications', JSON.stringify(updated));
  };

  const clearAll = () => {
    setNotifications([]);
    localStorage.removeItem('notifications');
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'generated':
        return <Image size={16} className="text-green-400" />;
      case 'saved':
        return <FileText size={16} className="text-blue-400" />;
      case 'published':
        return <CheckCircle size={16} className="text-purple-400" />;
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/login');
  };

  // Get initials from user display name or email
  const getInitials = () => {
    if (!user) return '??';
    const name = user.displayName || user.email || '';
    const parts = name.split(/[@\s]+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="h-16 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between px-6 shrink-0 z-[100]">
      {/* Logo */}
      <div className="flex items-center gap-3 -ml-0.5">
        <img src="/logo.png" alt="Kardyy" className="w-6 h-6 brightness-0 invert" />
        <span className="font-bold text-xl text-white -ml-1">Kardyy</span>
      </div>

      {/* Search / Context */}
      <div className="flex items-center gap-4 flex-1 ml-8">
        <div className="relative w-64 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500 group-hover:text-neutral-400 transition-colors" size={16} />
          <input
            type="text"
            placeholder="Search projects..."
            className="w-full bg-neutral-800 text-sm text-white pl-10 pr-4 py-2 rounded-lg border border-neutral-700/50 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none placeholder:text-neutral-600 transition-all"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4">
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setNotificationOpen(!notificationOpen)}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors relative"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-neutral-900" />
            )}
          </button>

          {notificationOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 bg-neutral-900 border border-neutral-700 rounded-xl shadow-2xl overflow-hidden z-[9999]">
              <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
                <h3 className="text-sm font-semibold text-white">Notifications</h3>
                {notifications.length > 0 && (
                  <div className="flex gap-2">
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-neutral-400 hover:text-white transition-colors"
                    >
                      Mark all read
                    </button>
                    <span className="text-neutral-600">·</span>
                    <button
                      onClick={clearAll}
                      className="text-xs text-neutral-400 hover:text-red-400 transition-colors"
                    >
                      Clear
                    </button>
                  </div>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <Bell size={24} className="mx-auto text-neutral-600 mb-2" />
                    <p className="text-sm text-neutral-500">No notifications yet</p>
                    <p className="text-xs text-neutral-600 mt-1">Activity will appear here</p>
                  </div>
                ) : (
                  notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`px-4 py-3 border-b border-neutral-800/50 hover:bg-neutral-800/50 transition-colors ${
                        !notification.read ? 'bg-neutral-800/30' : ''
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          {getNotificationIcon(notification.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-white font-medium truncate">{notification.title}</p>
                          <p className="text-xs text-neutral-400 mt-0.5">{notification.message}</p>
                          <p className="text-xs text-neutral-500 mt-1">{formatTime(notification.time)}</p>
                        </div>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-indigo-500 rounded-full flex-shrink-0 mt-1.5" />
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {user && (
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm text-white font-medium">{user.displayName || 'User'}</p>
              <p className="text-xs text-neutral-500">{user.email}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold ring-2 ring-neutral-800 cursor-pointer">
              {getInitials()}
            </div>
            <button
              onClick={handleSignOut}
              className="p-2 text-neutral-400 hover:text-red-400 hover:bg-neutral-800 rounded-lg transition-colors"
              title="Sign out"
            >
              <LogOut size={18} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
