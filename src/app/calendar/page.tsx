'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthenticationStatus, useUserData } from '@nhost/nextjs';
import { Sidebar } from '@/components/Layout/Sidebar';
import { Header } from '@/components/Layout/Header';
import { HistoryService, HistoryItem } from '@/services/history';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, Image as ImageIcon } from 'lucide-react';

import { nhost } from '@/utils/nhost';

export default function CalendarPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthenticationStatus();
  const user = useUserData();

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    async function fetchPosts() {
        try {
            // Check if configured (simplistic check)
            if (!process.env.NEXT_PUBLIC_NHOST_SUBDOMAIN) {
                 setHistory(HistoryService.getAll());
                 return;
            }

            const GET_POSTS = `
              query {
                posts(order_by: {created_at: desc}) {
                  id
                  created_at
                  title
                  status
                  generated_images
                  project_data
                }
              }
            `;

            const { data, error } = await nhost.graphql.request(GET_POSTS);

            if (data && data.posts) {
                const mapped: HistoryItem[] = data.posts.map((p: any) => ({
                    id: p.id,
                    date: p.created_at,
                    headline: p.title,
                    imageUrls: Array.isArray(p.generated_images) ? p.generated_images : [],
                    projectData: p.project_data
                }));
                setHistory(mapped);
            } else {
                setHistory(HistoryService.getAll());
            }
        } catch (e) {
            console.error("Nhost load failed, falling back to local", e);
            setHistory(HistoryService.getAll());
        }
    }
    fetchPosts();
  }, []);

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Get items for specific day
  const getItemsForDay = (day: Date) => {
    return history.filter(item => isSameDay(new Date(item.date), day));
  };
  
  const selectedDayItems = selectedDay ? getItemsForDay(selectedDay) : [];

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen w-full bg-neutral-950 text-neutral-100 font-sans">
      <Header user={user} />
      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar />
        
        <main className="flex-1 overflow-y-auto p-8 pl-24 flex gap-8">
            {/* Calendar Grid */}
            <div className="flex-1 flex flex-col gap-6">
                 <div className="flex items-center justify-between">
                     <h1 className="text-2xl font-bold">{format(currentDate, 'MMMM yyyy')}</h1>
                     <div className="flex gap-2">
                         <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className="p-2 hover:bg-neutral-800 rounded-lg"><ChevronLeft /></button>
                         <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className="p-2 hover:bg-neutral-800 rounded-lg"><ChevronRight /></button>
                     </div>
                 </div>

                 <div className="grid grid-cols-7 gap-4">
                     {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                         <div key={day} className="text-neutral-500 font-medium text-sm text-center py-2">{day}</div>
                     ))}
                     {days.map(day => {
                         const items = getItemsForDay(day);
                         const isSelected = selectedDay && isSameDay(day, selectedDay);
                         return (
                             <div 
                                key={day.toISOString()} 
                                onClick={() => setSelectedDay(day)}
                                className={`
                                    min-h-[120px] bg-neutral-900/50 border rounded-xl p-3 cursor-pointer transition-all hover:bg-neutral-900
                                    ${isSelected ? 'border-indigo-500 ring-1 ring-indigo-500' : 'border-neutral-800'}
                                `}
                             >
                                 <div className={`text-sm mb-2 font-medium ${isSameDay(day, new Date()) ? 'text-indigo-400' : 'text-neutral-400'}`}>
                                     {format(day, 'd')}
                                 </div>
                                 
                                 {/* Thumbnails / Dots */}
                                 <div className="flex flex-wrap gap-1">
                                     {items.map(item => (
                                         <div key={item.id} className="w-8 h-8 rounded bg-neutral-800 overflow-hidden relative group">
                                             {item.imageUrls[0] ? (
                                                <img src={item.imageUrls[0]} className="w-full h-full object-cover" />
                                             ) : (
                                                 <ImageIcon size={12} className="m-auto mt-2 opacity-50"/>
                                             )}
                                         </div>
                                     ))}
                                 </div>
                             </div>
                         );
                     })}
                 </div>
            </div>

            {/* Side Panel: Day Details */}
            {selectedDay && (
                <div className="w-96 bg-neutral-900 border-l border-neutral-800 flex flex-col animate-in slide-in-from-right-10 duration-200">
                    <div className="p-6 border-b border-neutral-800">
                        <h2 className="text-xl font-bold">{format(selectedDay, 'EEEE, MMMM d')}</h2>
                        <div className="text-neutral-500 text-sm mt-1">{selectedDayItems.length} Posts Created</div>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {selectedDayItems.length === 0 ? (
                            <div className="text-center text-neutral-600 py-10">No content created on this day.</div>
                        ) : (
                            selectedDayItems.map(item => (
                                <div key={item.id} className="space-y-3 pb-6 border-b border-neutral-800 last:border-0">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-semibold text-sm line-clamp-2">{item.headline}</h3>
                                        <span className="text-xs text-neutral-500">{format(new Date(item.date), 'HH:mm')}</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                        {item.imageUrls.map((url, i) => (
                                            <a key={i} href={url} target="_blank" className="aspect-[4/5] bg-neutral-800 rounded-lg overflow-hidden border border-neutral-700 hover:border-indigo-500 transition-colors">
                                                <img src={url} className="w-full h-full object-cover" loading="lazy" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </main>
      </div>
    </div>
  );
}
