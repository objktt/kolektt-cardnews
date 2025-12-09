import React, { useState } from 'react';
import { ProjectData, SlideData } from '@/types';
import { Download, Upload, Image as ImageIcon, Type, Calendar, AlignLeft, Layers, Plus, Trash2, GripVertical, Sparkles, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormPanelProps {
  project: ProjectData;
  onProjectChange: (data: Partial<ProjectData>) => void;
  slide: SlideData;
  onSlideChange: (data: Partial<SlideData>) => void;
  activeSlideIndex: number;
  onSelectSlide: (index: number) => void;
  onAddSlide: () => void;
  onRemoveSlide: (index: number) => void;
  isGenerating: boolean;
  onGenerate: () => void;
  generatedUrls?: string[];
}

export function FormPanel({ 
    project, onProjectChange, 
    slide, onSlideChange,
    activeSlideIndex, onSelectSlide, onAddSlide, onRemoveSlide,
    isGenerating, onGenerate, generatedUrls 
}: FormPanelProps) {
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [downloadUrls, setDownloadUrls] = useState<string[]>([]);
  
  // AI Generation State
  const [showAiPrompt, setShowAiPrompt] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false); // Renamed to avoid conflict with prop

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onSlideChange({ imageSrc: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt) return;
    setIsGeneratingImage(true);
    try {
        const response = await fetch('/api/ai/generate-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: aiPrompt })
        });
        const data = await response.json();
        if (data.success && data.imageSrc) {
            onSlideChange({ imageSrc: data.imageSrc });
            setShowAiPrompt(false);
            setAiPrompt('');
        } else {
            alert('Failed to generate image: ' + (data.error || 'Unknown error'));
        }
    } catch (error) {
        alert('Error generating image');
        console.error(error);
    } finally {
        setIsGeneratingImage(false);
    }
  };

  const handleTagsChange = (val: string) => {
     const tags = val.split(/[\n,]+/).map(t => t.trim()).filter(Boolean);
     onSlideChange({ tags });
  };

  return (
    <div className="w-80 lg:w-96 flex-shrink-0 bg-white border-r h-full flex flex-col overflow-hidden">
        {/* Panel Header */}
        <div className="h-14 border-b flex items-center px-6 shrink-0 bg-white z-10">
            <h2 className="font-semibold text-sm mr-auto">Editor</h2>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
            
            {/* 0. Slides Management */}
            <section className="space-y-4">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-neutral-400 uppercase tracking-wider">
                        <Layers size={14} /> <span>Slides ({project.slides.length})</span>
                    </div>
                    <button onClick={onAddSlide} className="text-xs flex items-center gap-1 font-medium hover:bg-neutral-100 px-2 py-1 rounded">
                        <Plus size={14} /> Add Slide
                    </button>
                </div>
                
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                    {project.slides.map((s, i) => (
                        <div 
                            key={s.id}
                            onClick={() => onSelectSlide(i)}
                            className={cn(
                                "relative w-16 h-20 flex-shrink-0 border-2 rounded-md overflow-hidden cursor-pointer transition-all",
                                i === activeSlideIndex ? "border-black ring-1 ring-black" : "border-neutral-200 hover:border-neutral-300"
                            )}
                        >
                            {s.imageSrc ? (
                                <img src={s.imageSrc} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-neutral-100 flex items-center justify-center text-xs text-gray-400">
                                    {i + 1}
                                </div>
                            )}
                            
                            {/* Remove Button (only if more than 1) */}
                            {project.slides.length > 1 && (
                                <button 
                                    onClick={(e) => { e.stopPropagation(); onRemoveSlide(i); }}
                                    className="absolute top-0.5 right-0.5 w-4 h-4 bg-white/80 rounded-full flex items-center justify-center text-red-500 hover:bg-white opacity-0 group-hover:opacity-100 hover:opacity-100"
                                >
                                    <Trash2 size={10} />
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </section>

            {/* 1. Image Section (Per Slide) */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-neutral-400 uppercase tracking-wider">
                    <ImageIcon size={14} /> <span>Background</span>
                </div>
                <div className="group relative w-full aspect-[4/5] bg-neutral-100 rounded-lg border-2 border-dashed border-neutral-200 hover:border-neutral-300 transition-colors flex flex-col items-center justify-center text-center overflow-hidden">
                    {slide.imageSrc ? (
                        <>
                            <img src={slide.imageSrc} className="absolute inset-0 w-full h-full object-cover opacity-80" alt="Preview"/>
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-white font-medium text-sm">Change Image</span>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-2 p-4">
                            <Upload className="mx-auto text-neutral-400" size={24} />
                            <p className="text-xs text-neutral-500">Upload background<br/>(1080x1350)</p>
                        </div>
                    )}
                    <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                </div>
            </section>

            {/* 1. Brand Kit (Series Global) */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-neutral-400 uppercase tracking-wider">
                    <Layers size={14} /> <span>Brand Kit</span>
                </div>
                
                <div className="space-y-3 bg-neutral-50 p-4 rounded-lg border">
                    <div className="flex items-center gap-4">
                         {project.logoSrc ? (
                            <div className="w-16 h-16 bg-white border rounded-md p-1 relative group shrink-0">
                                <img src={project.logoSrc} className="w-full h-full object-contain" />
                                <button
                                    onClick={() => onProjectChange({ logoSrc: null })}
                                    className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 size={10} />
                                </button>
                            </div>
                        ) : (
                            <div className="w-16 h-16 bg-white border border-dashed rounded-md flex items-center justify-center text-neutral-300 shrink-0">
                                <Upload size={20} />
                            </div>
                        )}
                        
                        <div className="flex-1">
                            <label className="block text-xs font-medium text-gray-500 mb-2">Upload Logo (PNG)</label>
                             <input 
                                type="file" 
                                accept="image/png,image/jpeg"
                                onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => onProjectChange({ logoSrc: reader.result as string });
                                        reader.readAsDataURL(file);
                                    }
                                }}
                                className="block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-black file:text-white cursor-pointer"
                            />
                        </div>
                    </div>

                    {project.logoSrc && (
                        <div>
                             <label className="block text-xs font-medium text-gray-500 mb-2">Position</label>
                             <div className="grid grid-cols-2 gap-2">
                                {['top-left', 'top-right', 'bottom-center', 'bottom-right'].map((pos) => (
                                    <button
                                        key={pos}
                                        onClick={() => onProjectChange({ logoPosition: pos as any })}
                                        className={cn(
                                            "text-xs py-1.5 px-2 rounded border text-center transition-colors",
                                            project.logoPosition === pos 
                                                ? "bg-black text-white border-black" 
                                                : "bg-white text-gray-600 border-gray-200 hover:border-gray-300"
                                        )}
                                    >
                                        {pos.replace('-', ' ')}
                                    </button>
                                ))}
                             </div>
                        </div>
                    )}
                </div>
            </section>

             {/* 2. Style Options (Global) */}
             <section className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-neutral-400 uppercase tracking-wider">
                    <Layers size={14} /> <span>Global Style</span>
                </div>
                
                <div className="space-y-3 bg-neutral-50 p-4 rounded-lg border">
                    {/* Text Background Toggle */}
                    <label className="flex items-center justify-between cursor-pointer">
                        <span className="text-sm font-medium">Text Background Box</span>
                        <input 
                            type="checkbox"
                            checked={project.enableTextBackground}
                            onChange={(e) => onProjectChange({ enableTextBackground: e.target.checked })}
                            className="toggle-checkbox w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                        />
                    </label>

                    {/* Overlay Toggle */}
                    <label className="flex items-center justify-between cursor-pointer pt-2 border-t">
                        <span className="text-sm font-medium">Full Image Overlay</span>
                        <input 
                            type="checkbox"
                            checked={project.enableOverlay}
                            onChange={(e) => onProjectChange({ enableOverlay: e.target.checked })}
                            className="toggle-checkbox w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                        />
                    </label>

                    {project.enableOverlay && (
                        <div className="pt-2">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>Opacity</span>
                                <span>{project.overlayOpacity}%</span>
                            </div>
                            <input 
                                type="range" 
                                min="0" max="90" 
                                value={project.overlayOpacity}
                                onChange={(e) => onProjectChange({ overlayOpacity: Number(e.target.value) })}
                                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-black"
                            />
                        </div>
                    )}
                </div>
            </section>

            {/* 3. Content Section (Per Slide) */}
            <section className="space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-neutral-400 uppercase tracking-wider">
                    <Type size={14} /> <span>Slide Content</span>
                </div>
                
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-500">Headline</label>
                        <textarea
                            value={slide.headline}
                            onChange={(e) => onSlideChange({ headline: e.target.value })}
                            rows={3}
                            className="w-full text-sm p-3 border rounded-md focus:ring-1 focus:ring-black focus:border-black outline-none transition-shadow resize-none"
                            placeholder="Type headline..."
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-medium text-gray-500">Tags</label>
                        <input
                            defaultValue={slide.tags.join(', ')}
                            onChange={(e) => handleTagsChange(e.target.value)}
                            className="w-full text-sm p-2.5 border rounded-md focus:ring-1 focus:ring-black focus:border-black outline-none"
                            placeholder="news, music"
                        />
                    </div>

                    <div className="flex items-center justify-between py-1">
                         <div className="flex items-center gap-2">
                             <Calendar size={14} className="text-gray-400" />
                             <span className="text-sm">Show Date (Global)</span>
                         </div>
                         <input 
                            type="checkbox"
                            checked={project.showDate}
                            onChange={(e) => onProjectChange({ showDate: e.target.checked })}
                            className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                        />
                    </div>
                </div>
            </section>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t bg-neutral-50 shrink-0 space-y-3">
             {generatedUrls && generatedUrls.length > 0 && (
                <div className="space-y-2">
                    {generatedUrls.map((url, i) => (
                        <a 
                        key={i}
                        href={url} 
                        download={`card-news-${i+1}.png`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center w-full py-2.5 bg-white border text-sm font-medium rounded-md hover:bg-neutral-50 transition-colors gap-2 text-green-600 border-green-200 hover:border-green-300"
                        >
                        <Download size={16} />
                        Download Slide {i + 1}
                        </a>
                    ))}
                </div>
            )}

            <button 
              onClick={onGenerate}
              disabled={isGenerating}
              className="w-full py-3 bg-black text-white text-sm font-bold rounded-md hover:bg-neutral-800 disabled:opacity-70 disabled:cursor-not-allowed transition-all shadow-sm active:transform active:scale-[0.98]"
            >
              {isGenerating ? (
                  <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                  </span>
              ) : 'Generate All Slides'}
            </button>
        </div>
    </div>
  );
}
