import React from 'react';
import { SlideData } from '@/types';
import { Plus, Trash2, GripVertical, Image as ImageIcon, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StorySidebarProps {
    slides: SlideData[];
    activeSlideIndex: number;
    onSelectSlide: (index: number) => void;
    onUpdateSlide: (index: number, data: Partial<SlideData>) => void;
    onAddSlide: () => void;
    onRemoveSlide: (index: number) => void;
}

export function StorySidebar({
    slides,
    activeSlideIndex,
    onSelectSlide,
    onUpdateSlide,
    onAddSlide,
    onRemoveSlide
}: StorySidebarProps) {
    return (
        <div className="w-[300px] flex-shrink-0 bg-neutral-900 border-l border-neutral-800 h-full flex flex-col z-20 shadow-xl">
            {/* Header */}
            <div className="h-14 border-b border-neutral-800 flex items-center px-4 bg-neutral-900 shrink-0 justify-between">
                <h2 className="font-semibold text-sm text-white">Storyline</h2>
                <span className="text-xs text-neutral-500 border border-neutral-700 px-2 py-0.5 rounded-full">
                    {slides.length}
                </span>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-neutral-900 scrollbar-thin scrollbar-thumb-neutral-700">
                {slides.map((slide, i) => (
                    <div 
                        key={slide.id}
                        onClick={() => onSelectSlide(i)}
                        className={cn(
                            "group relative flex gap-3 p-3 rounded-xl border transition-all cursor-pointer",
                            i === activeSlideIndex 
                                ? "bg-neutral-800 border-indigo-500/50 ring-1 ring-indigo-500/50" 
                                : "bg-neutral-900 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-800/50"
                        )}
                    >
                        {/* Number & Grip */}
                        <div className="flex flex-col items-center gap-1 text-neutral-600 py-1 cursor-grab active:cursor-grabbing">
                            <span className={cn("text-[10px] font-bold w-4 text-center", i === activeSlideIndex ? "text-indigo-400" : "")}>{i + 1}</span>
                            <GripVertical size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>

                        {/* Thumbnail - Click to upload */}
                        <div
                            className="w-16 h-20 shrink-0 bg-neutral-800 rounded-lg border border-neutral-700 overflow-hidden relative cursor-pointer hover:border-indigo-500/50 transition-colors"
                            onClick={(e) => {
                                e.stopPropagation();
                                const input = document.getElementById(`slide-image-${slide.id}`) as HTMLInputElement;
                                input?.click();
                            }}
                        >
                            <input
                                type="file"
                                id={`slide-image-${slide.id}`}
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                            onUpdateSlide(i, { imageSrc: reader.result as string });
                                        };
                                        reader.readAsDataURL(file);
                                    }
                                }}
                            />
                            {slide.imageSrc ? (
                                <>
                                    <img src={slide.imageSrc} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Upload size={14} className="text-white" />
                                    </div>
                                </>
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-neutral-600 hover:text-indigo-400 transition-colors gap-1">
                                    <ImageIcon size={16} />
                                    <span className="text-[8px] font-medium">Upload</span>
                                </div>
                            )}
                        </div>

                        {/* Content Preview/Edit */}
                        <div className="flex-1 min-w-0 flex flex-col gap-1">
                            <label className="text-[10px] uppercase font-bold text-neutral-500 tracking-wider">
                                Headline
                            </label>
                            <textarea
                                value={slide.headline}
                                onChange={(e) => onUpdateSlide(i, { headline: e.target.value })}
                                placeholder="Type headline..."
                                rows={3}
                                className={cn(
                                    "w-full text-xs font-medium bg-transparent overflow-hidden resize-none outline-none leading-snug transition-colors",
                                    slide.headline ? "text-neutral-300 focus:text-white" : "text-neutral-600 italic focus:not-italic focus:text-neutral-400"
                                )}
                                onClick={(e) => e.stopPropagation()} 
                            />
                        </div>

                        {/* Actions */}
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             {slides.length > 1 && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onRemoveSlide(i); }}
                                    className="p-1 hover:bg-red-900/30 text-neutral-600 hover:text-red-400 rounded transition-colors"
                                >
                                    <Trash2 size={12} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}

                {/* Add Slide Button */}
                <button 
                    onClick={onAddSlide}
                    className="w-full py-4 border-2 border-dashed border-neutral-800 rounded-xl flex items-center justify-center gap-2 text-neutral-500 hover:border-neutral-600 hover:bg-neutral-800 hover:text-neutral-300 transition-all group"
                >
                    <div className="w-6 h-6 rounded-full bg-neutral-800 group-hover:bg-neutral-700 flex items-center justify-center transition-colors">
                        <Plus size={14} />
                    </div>
                    <span className="text-xs font-medium">Add New Slide</span>
                </button>
            </div>
        </div>
    );
}
