'use client';

import React, { useRef } from 'react';
import { SlideData } from '@/types';
import { Plus, Trash2, Copy, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StoryTimelineProps {
  slides: SlideData[];
  activeSlideIndex: number;
  onSelectSlide: (index: number) => void;
  onUpdateSlide: (index: number, data: Partial<SlideData>) => void;
  onAddSlide: () => void;
  onRemoveSlide: (index: number) => void;
  onDuplicateSlide?: (index: number) => void;
}

export function StoryTimeline({
  slides,
  activeSlideIndex,
  onSelectSlide,
  onUpdateSlide,
  onAddSlide,
  onRemoveSlide,
  onDuplicateSlide,
}: StoryTimelineProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -200, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 200, behavior: 'smooth' });
    }
  };

  return (
    <div className="h-[140px] bg-neutral-900 border-t border-neutral-800 flex items-center px-4 gap-4 shrink-0">
      {/* Scroll Left Button */}
      <button
        onClick={scrollLeft}
        className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors shrink-0 z-10"
      >
        <ChevronLeft size={18} />
      </button>

      {/* Slides Container */}
      <div
        ref={scrollContainerRef}
        className="flex-1 min-w-0 flex items-center gap-4 overflow-x-auto scrollbar-none py-2 px-1"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            onClick={() => onSelectSlide(i)}
            className={cn(
              "group relative flex flex-col items-center gap-2 cursor-pointer shrink-0 transition-all",
              i === activeSlideIndex ? "scale-105" : "hover:scale-102"
            )}
          >
            {/* Thumbnail */}
            <div
              className={cn(
                "w-[80px] h-[100px] rounded-lg border-2 overflow-hidden transition-all relative",
                i === activeSlideIndex
                  ? "border-indigo-500 shadow-lg shadow-indigo-500/20"
                  : "border-neutral-700 hover:border-neutral-500"
              )}
            >
              {slide.imageSrc ? (
                <img
                  src={slide.imageSrc}
                  alt={`Slide ${i + 1}`}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-neutral-800 flex items-center justify-center">
                  <span className="text-neutral-600 text-xs">Empty</span>
                </div>
              )}

              {/* Headline Preview Overlay */}
              {slide.headline && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-1.5">
                  <p className="text-[8px] text-white font-medium line-clamp-2 leading-tight">
                    {slide.headline}
                  </p>
                </div>
              )}

              {/* Hover Actions */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                {onDuplicateSlide && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicateSlide(i);
                    }}
                    className="p-1.5 rounded-md bg-neutral-700 hover:bg-neutral-600 text-white transition-colors"
                    title="Duplicate"
                  >
                    <Copy size={12} />
                  </button>
                )}
                {slides.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveSlide(i);
                    }}
                    className="p-1.5 rounded-md bg-red-900/50 hover:bg-red-800 text-red-300 hover:text-white transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>

            {/* Slide Number */}
            <span
              className={cn(
                "text-xs font-medium transition-colors",
                i === activeSlideIndex ? "text-indigo-400" : "text-neutral-500"
              )}
            >
              {i + 1}
            </span>
          </div>
        ))}

        {/* Add Slide Button */}
        <button
          onClick={onAddSlide}
          className="w-[80px] h-[100px] rounded-lg border-2 border-dashed border-neutral-700 hover:border-indigo-500 flex flex-col items-center justify-center gap-2 text-neutral-500 hover:text-indigo-400 transition-all shrink-0 hover:bg-neutral-800/50 ml-1"
        >
          <Plus size={24} />
          <span className="text-[10px] font-medium">Add</span>
        </button>
      </div>

      {/* Scroll Right Button */}
      <button
        onClick={scrollRight}
        className="p-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors shrink-0 z-10"
      >
        <ChevronRight size={18} />
      </button>

      {/* Slide Count Badge */}
      <div className="shrink-0 flex items-center gap-2 pl-3 border-l border-neutral-700">
        <span className="text-xs text-neutral-400">Slides</span>
        <span className="px-2 py-0.5 bg-neutral-800 rounded-full text-xs font-medium text-white">
          {slides.length}
        </span>
      </div>
    </div>
  );
}
