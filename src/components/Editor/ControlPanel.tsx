import React, { useState } from 'react';
import { ProjectData, SlideData, FONT_OPTIONS, FONT_WEIGHT_OPTIONS } from '@/types';
import { Download, Upload, Image as ImageIcon, Type, Calendar, Layers, Sparkles, ArrowRight, Paintbrush, Settings, ChevronDown, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

// Tab Button
const TabButton = ({ active, onClick, children, icon: Icon }: any) => (
    <button
        onClick={onClick}
        className={cn(
            "flex-1 flex items-center justify-center gap-2 py-3 text-xs font-semibold border-b-2 transition-colors",
            active 
                ? "border-indigo-500 text-white" 
                : "border-transparent text-neutral-500 hover:text-neutral-300 hover:border-neutral-700"
        )}
    >
        <Icon size={14} />
        {children}
    </button>
);

interface ControlPanelProps {
  project: ProjectData;
  onProjectChange: (data: Partial<ProjectData>) => void;
  slide: SlideData;
  onSlideChange: (data: Partial<SlideData>) => void;
  isGenerating: boolean;
  onGenerate: () => void;
  isSaving: boolean;
  onSaveDraft: () => void;
  generatedUrls?: string[];
}

export function ControlPanel({
    project, onProjectChange,
    slide, onSlideChange,
    isGenerating, onGenerate,
    isSaving, onSaveDraft,
    generatedUrls
}: ControlPanelProps) {
  
  const [activeTab, setActiveTab] = useState<'slide' | 'design'>('slide');

  // AI Generation State
  const [showAiPrompt, setShowAiPrompt] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

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
    <div className="w-[340px] flex-shrink-0 bg-neutral-900 border-r border-neutral-800 h-full flex flex-col overflow-hidden shadow-xl z-20">
        {/* Tabs */}
        <div className="flex border-b border-neutral-800 bg-neutral-900 shrink-0">
            <TabButton 
                active={activeTab === 'slide'} 
                onClick={() => setActiveTab('slide')}
                icon={ImageIcon}
            >
                Slide Image
            </TabButton>
            <TabButton 
                active={activeTab === 'design'} 
                onClick={() => setActiveTab('design')}
                icon={Paintbrush}
            >
                Global Design
            </TabButton>
        </div>

        {/* Scrollable Content - Hidden scrollbar, scroll on hover */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 [&::-webkit-scrollbar]:w-0 hover:[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-neutral-700 [&::-webkit-scrollbar-thumb]:rounded-full transition-all">
            
            {activeTab === 'slide' && (
                <div className="space-y-8 animate-in fade-in zoom-in-95 duration-200">
                    {/* 1. Image Section */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                            <ImageIcon size={14} /> <span>Background Image</span>
                        </div>
                        
                        <div className="bg-neutral-800/30 p-4 rounded-xl border border-neutral-800 space-y-4">
                             {/* Preview */}
                            <div className="relative w-full aspect-[2/3] bg-neutral-800/50 rounded-lg overflow-hidden border border-neutral-700/50 shadow-inner">
                                {slide.imageSrc ? (
                                    <img src={slide.imageSrc} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-neutral-600 gap-2">
                                        <ImageIcon size={32} strokeWidth={1.5} />
                                        <span className="text-xs font-medium">No Image Selected</span>
                                    </div>
                                )}
                            </div>

                            {/* Actions */}
                            <div className="grid grid-cols-2 gap-2">
                                <label className="flex items-center justify-center gap-2 py-2 px-3 bg-neutral-800 border border-neutral-700 rounded-lg text-xs font-medium cursor-pointer hover:bg-neutral-700 hover:text-white text-neutral-300 transition-colors">
                                    <Upload size={14} /> Upload
                                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                                </label>
                                <button
                                    onClick={() => setShowAiPrompt(!showAiPrompt)}
                                    className={cn(
                                        "flex items-center justify-center gap-2 py-2 px-3 border rounded-lg text-xs font-medium transition-colors",
                                        showAiPrompt ? "bg-indigo-900/40 border-indigo-500/50 text-indigo-400" : "bg-neutral-800 border-neutral-700 text-neutral-300 hover:bg-neutral-700 hover:text-white"
                                    )}
                                >
                                    <Sparkles size={14} /> AI Generate
                                </button>
                            </div>

                             {/* AI Prompt Input */}
                            {showAiPrompt && (
                                <div className="space-y-2 pt-2 border-t border-neutral-800 animate-in slide-in-from-top-2">
                                    <textarea
                                        value={aiPrompt}
                                        onChange={(e) => setAiPrompt(e.target.value)}
                                        placeholder="Describe image (e.g., 'Cyberpunk city')..."
                                        className="w-full text-xs p-3 rounded-lg border border-neutral-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 min-h-[80px] resize-none bg-neutral-900 text-neutral-200 placeholder:text-neutral-600"
                                    />
                                    <button
                                        onClick={handleAiGenerate}
                                        disabled={isGeneratingImage || !aiPrompt.trim()}
                                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-900/20"
                                    >
                                        {isGeneratingImage ? "Generating..." : "Generate Background"}
                                        {!isGeneratingImage && <ArrowRight size={12} />}
                                    </button>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* 2. Text Content */}
                     <section className="space-y-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                            <Type size={14} /> <span>Text Details</span>
                        </div>

                        <div className="space-y-4">
                             <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-xs font-medium text-neutral-500">Headline</label>
                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                        <span className="text-xs text-neutral-500">Show</span>
                                        <input
                                            type="checkbox"
                                            checked={project.showHeadline}
                                            onChange={(e) => onProjectChange({ showHeadline: e.target.checked })}
                                            className="accent-indigo-500 w-3.5 h-3.5 bg-neutral-700 border-neutral-600 rounded"
                                        />
                                    </label>
                                </div>
                                <textarea
                                    value={slide.headline}
                                    onChange={(e) => onSlideChange({ headline: e.target.value })}
                                    rows={3}
                                    disabled={!project.showHeadline}
                                    className={cn(
                                        "w-full text-sm p-3 border border-neutral-700 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none bg-neutral-800/50 text-neutral-200 placeholder:text-neutral-600 transition-colors",
                                        !project.showHeadline && "opacity-50 cursor-not-allowed"
                                    )}
                                    placeholder="Enter slide headline..."
                                />
                             </div>
                             <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-xs font-medium text-neutral-500">Tags</label>
                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                        <span className="text-xs text-neutral-500">Show</span>
                                        <input
                                            type="checkbox"
                                            checked={project.showTags}
                                            onChange={(e) => onProjectChange({ showTags: e.target.checked })}
                                            className="accent-indigo-500 w-3.5 h-3.5 bg-neutral-700 border-neutral-600 rounded"
                                        />
                                    </label>
                                </div>
                                <input
                                    defaultValue={slide.tags.join(', ')}
                                    onChange={(e) => handleTagsChange(e.target.value)}
                                    disabled={!project.showTags}
                                    className={cn(
                                        "w-full text-sm p-3 border border-neutral-700 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-neutral-800/50 text-neutral-200 placeholder:text-neutral-600 transition-colors",
                                        !project.showTags && "opacity-50 cursor-not-allowed"
                                    )}
                                    placeholder="Separate with commas"
                                />
                             </div>
                        </div>
                    </section>

                    {/* 3. Font Settings */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                            <Type size={14} /> <span>Font Settings</span>
                        </div>

                        <div className="bg-neutral-800/30 p-4 rounded-xl border border-neutral-800 space-y-4">
                            {/* Font Family */}
                            <div>
                                <label className="text-xs font-medium text-neutral-500 mb-1.5 block">Font Family</label>
                                <div className="relative">
                                    <select
                                        value={project.fontSettings.fontFamily}
                                        onChange={(e) => onProjectChange({
                                            fontSettings: { ...project.fontSettings, fontFamily: e.target.value }
                                        })}
                                        className="w-full text-sm p-3 pr-10 border border-neutral-700 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-neutral-800/50 text-neutral-200 appearance-none cursor-pointer"
                                    >
                                        {FONT_OPTIONS.map((font) => (
                                            <option key={font.value} value={font.value}>{font.label}</option>
                                        ))}
                                    </select>
                                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500 pointer-events-none" />
                                </div>
                            </div>

                            {/* Font Weight */}
                            <div>
                                <label className="text-xs font-medium text-neutral-500 mb-1.5 block">Font Weight</label>
                                <div className="flex bg-neutral-900 border border-neutral-700 rounded-lg p-1">
                                    {FONT_WEIGHT_OPTIONS.map((weight) => (
                                        <button
                                            key={weight.value}
                                            onClick={() => onProjectChange({
                                                fontSettings: { ...project.fontSettings, fontWeight: weight.value }
                                            })}
                                            className={cn(
                                                "flex-1 py-1.5 text-[10px] font-medium rounded-md transition-all",
                                                project.fontSettings.fontWeight === weight.value
                                                    ? "bg-neutral-700 text-white shadow-sm"
                                                    : "text-neutral-500 hover:text-neutral-300"
                                            )}
                                        >
                                            {weight.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Font Color */}
                            <div>
                                <label className="text-xs font-medium text-neutral-500 mb-1.5 block">Font Color</label>
                                <div className="flex items-center gap-3">
                                    <div className="relative">
                                        <input
                                            type="color"
                                            value={project.fontSettings.fontColor}
                                            onChange={(e) => onProjectChange({
                                                fontSettings: { ...project.fontSettings, fontColor: e.target.value }
                                            })}
                                            className="w-10 h-10 rounded-lg border border-neutral-700 cursor-pointer bg-transparent"
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        value={project.fontSettings.fontColor}
                                        onChange={(e) => onProjectChange({
                                            fontSettings: { ...project.fontSettings, fontColor: e.target.value }
                                        })}
                                        className="flex-1 text-sm p-2.5 border border-neutral-700 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-neutral-800/50 text-neutral-200 font-mono uppercase"
                                        placeholder="#FFFFFF"
                                    />
                                </div>
                            </div>

                            <hr className="border-neutral-700" />

                            {/* Headline Font Size */}
                            <div>
                                <div className="flex justify-between text-xs mb-2">
                                    <span className="font-medium text-neutral-500">Headline Size</span>
                                    <span className="text-neutral-400 font-mono">{project.fontSettings.headlineFontSize}px</span>
                                </div>
                                <input
                                    type="range"
                                    min="32" max="100"
                                    value={project.fontSettings.headlineFontSize}
                                    onChange={(e) => onProjectChange({
                                        fontSettings: { ...project.fontSettings, headlineFontSize: Number(e.target.value) }
                                    })}
                                    className="w-full h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                />
                            </div>

                            {/* Tags Font Size */}
                            <div>
                                <div className="flex justify-between text-xs mb-2">
                                    <span className="font-medium text-neutral-500">Tags Size</span>
                                    <span className="text-neutral-400 font-mono">{project.fontSettings.tagsFontSize}px</span>
                                </div>
                                <input
                                    type="range"
                                    min="14" max="40"
                                    value={project.fontSettings.tagsFontSize}
                                    onChange={(e) => onProjectChange({
                                        fontSettings: { ...project.fontSettings, tagsFontSize: Number(e.target.value) }
                                    })}
                                    className="w-full h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                />
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {activeTab === 'design' && (
                <div className="space-y-8 animate-in fade-in zoom-in-95 duration-200">
                    {/* Brand Kit */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                            <Layers size={14} /> <span>Brand Kit</span>
                        </div>
                        
                        <div className="space-y-4 bg-neutral-800/30 p-4 rounded-xl border border-neutral-800">
                            <div className="flex items-center gap-4">
                                {project.logoSrc ? (
                                    <div className="w-16 h-16 bg-neutral-900 border border-neutral-700 rounded-lg p-2 relative group shrink-0">
                                        <img src={project.logoSrc} className="w-full h-full object-contain" />
                                        <button
                                            onClick={() => onProjectChange({ logoSrc: null })}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                                        >
                                            <Settings size={12} /> {/* Trash icon fallback */}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="w-16 h-16 bg-neutral-900 border border-dashed border-neutral-700 rounded-lg flex items-center justify-center text-neutral-600 shrink-0">
                                        <Upload size={20} />
                                    </div>
                                )}
                                
                                <div className="flex-1">
                                    <label className="block text-xs font-medium text-neutral-500 mb-2">Upload Logo (PNG)</label>
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
                                        className="block w-full text-xs text-neutral-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-neutral-700 file:text-neutral-200 cursor-pointer"
                                    />
                                </div>
                            </div>

                            {project.logoSrc && (
                                <div className="grid grid-cols-2 gap-2">
                                    {['top-left', 'top-right', 'bottom-center', 'bottom-right'].map((pos) => (
                                        <button
                                            key={pos}
                                            onClick={() => onProjectChange({ logoPosition: pos as any })}
                                            className={cn(
                                                "text-[10px] py-2 px-2 rounded-lg border text-center transition-all font-medium",
                                                project.logoPosition === pos 
                                                    ? "bg-neutral-100 text-black border-neutral-100" 
                                                    : "bg-neutral-900 text-neutral-500 border-neutral-800 hover:border-neutral-600 hover:text-neutral-300"
                                            )}
                                        >
                                            {pos.replace('-', ' ').toUpperCase()}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>
                    
                    {/* Global Style */}
                    <section className="space-y-4">
                        <div className="flex items-center gap-2 text-xs font-bold text-neutral-500 uppercase tracking-wider">
                            <Settings size={14} /> <span>Global Settings</span>
                        </div>
                        
                        <div className="bg-neutral-800/30 p-4 rounded-xl border border-neutral-800 space-y-4">
                            {/* Aspect Ratio */}
                            <div>
                                <label className="text-xs font-medium text-neutral-500 mb-2 block">Aspect Ratio</label>
                                <div className="flex bg-neutral-900 border border-neutral-700 rounded-lg p-1">
                                    {['1:1', '4:5', '9:16'].map((ratio) => (
                                        <button
                                            key={ratio}
                                            onClick={() => onProjectChange({ canvasSize: ratio as any })}
                                            className={cn(
                                                "flex-1 py-1.5 text-xs font-medium rounded-md transition-all",
                                                project.canvasSize === ratio 
                                                    ? "bg-neutral-700 text-white shadow-sm" 
                                                    : "text-neutral-500 hover:text-neutral-300"
                                            )}
                                        >
                                            {ratio}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <hr className="border-neutral-800" />

                            <label className="flex items-center justify-between cursor-pointer">
                                <span className="text-sm font-medium text-neutral-300">Text Background Box</span>
                                <input 
                                    type="checkbox"
                                    checked={project.enableTextBackground}
                                    onChange={(e) => onProjectChange({ enableTextBackground: e.target.checked })}
                                    className="accent-indigo-500 w-4 h-4 bg-neutral-700 border-neutral-600 rounded"
                                />
                            </label>
                            
                            <hr className="border-neutral-800" />

                            <label className="flex items-center justify-between cursor-pointer">
                                <span className="text-sm font-medium text-neutral-300">Dark Overlay</span>
                                <input 
                                    type="checkbox"
                                    checked={project.enableOverlay}
                                    onChange={(e) => onProjectChange({ enableOverlay: e.target.checked })}
                                    className="accent-indigo-500 w-4 h-4 bg-neutral-700 border-neutral-600 rounded"
                                />
                            </label>
                            
                            {project.enableOverlay && (
                                <div className="pt-2">
                                    <div className="flex justify-between text-xs text-neutral-500 mb-2">
                                        <span>Opacity</span>
                                        <span>{project.overlayOpacity}%</span>
                                    </div>
                                    <input 
                                        type="range" 
                                        min="0" max="90" 
                                        value={project.overlayOpacity}
                                        onChange={(e) => onProjectChange({ overlayOpacity: Number(e.target.value) })}
                                        className="w-full h-1 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                    />
                                </div>
                            )}

                             <hr className="border-neutral-800" />

                            {/* Show Date Option */}
                            <label className="flex items-center justify-between cursor-pointer">
                                <div className="flex items-center gap-2">
                                    <Calendar size={14} className="text-neutral-500" />
                                    <span className="text-sm font-medium text-neutral-300">Show Date</span>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={project.showDate}
                                    onChange={(e) => onProjectChange({ showDate: e.target.checked })}
                                    className="accent-indigo-500 w-4 h-4 bg-neutral-700 border-neutral-600 rounded"
                                />
                            </label>
                        </div>
                    </section>
                </div>
            )}

        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-neutral-800 bg-neutral-900 shrink-0 space-y-3 z-30 shadow-[0_-5px_20px_rgba(0,0,0,0.2)]">
             {generatedUrls && generatedUrls.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                    {generatedUrls.map((url, i) => (
                        <a
                        key={i}
                        href={url}
                        download={`card-news-${i+1}.png`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-center py-2 bg-green-900/20 border border-green-800/50 text-green-400 text-xs font-bold rounded-lg hover:bg-green-900/40 transition-colors"
                        >
                        Download #{i + 1}
                        </a>
                    ))}
                </div>
            )}

            <div className="flex gap-2">
                <button
                    onClick={onSaveDraft}
                    disabled={isSaving}
                    className="flex-1 py-3 bg-neutral-800 text-neutral-200 text-sm font-bold rounded-xl hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all border border-neutral-700 active:transform active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    {isSaving ? (
                        <>
                            <div className="w-4 h-4 border-2 border-neutral-500/30 border-t-neutral-300 rounded-full animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save size={16} />
                            Save Draft
                        </>
                    )}
                </button>

                <button
                    onClick={onGenerate}
                    disabled={isGenerating}
                    className="flex-1 py-3 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-900/20 active:transform active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    {isGenerating ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <Download size={16} />
                            Generate
                        </>
                    )}
                </button>
            </div>
        </div>
    </div>
  );
}
