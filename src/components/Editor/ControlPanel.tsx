import React, { useState } from 'react';
import { ProjectData, SlideData, DesignTemplate, FONT_OPTIONS, FONT_WEIGHT_OPTIONS, TEXT_BOX_STYLES, TEXT_POSITIONS, INITIAL_SLIDE } from '@/types';
import { Download, Upload, Image as ImageIcon, Type, Layers, Sparkles, ArrowRight, Paintbrush, Settings, ChevronDown, ChevronRight, Save, LayoutTemplate, Plus, Trash2, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTemplates } from '@/hooks/useTemplates';
import { useToast } from '@/components/ui/Toast';

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

// Accordion Section Component
const AccordionSection = ({
    title,
    icon: Icon,
    isOpen,
    onToggle,
    children
}: {
    title: string;
    icon: any;
    isOpen: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}) => (
    <section className="border border-neutral-800 rounded-xl overflow-hidden">
        <button
            onClick={onToggle}
            className="w-full flex items-center justify-between p-4 bg-neutral-800/30 hover:bg-neutral-800/50 transition-colors"
        >
            <div className="flex items-center gap-2 text-xs font-bold text-neutral-400 uppercase tracking-wider">
                <Icon size={14} /> <span>{title}</span>
            </div>
            {isOpen ? (
                <ChevronDown size={16} className="text-neutral-500" />
            ) : (
                <ChevronRight size={16} className="text-neutral-500" />
            )}
        </button>
        {isOpen && (
            <div className="p-4 space-y-4 animate-in slide-in-from-top-2 duration-200">
                {children}
            </div>
        )}
    </section>
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
  initialTab?: 'slide' | 'design' | 'template';
  slideCount?: number;
}

export function ControlPanel({
    project, onProjectChange,
    slide, onSlideChange,
    isGenerating, onGenerate,
    isSaving, onSaveDraft,
    generatedUrls,
    initialTab = 'slide',
    slideCount = 1
}: ControlPanelProps) {

  const [activeTab, setActiveTab] = useState<'slide' | 'design' | 'template'>(initialTab);

  // Templates
  const { templates, saveTemplate, deleteTemplate, applyTemplate } = useTemplates();
  const toast = useToast();
  const [newTemplateName, setNewTemplateName] = useState('');
  const [showSaveInput, setShowSaveInput] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  // Accordion State
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    image: true,
    text: true,
    font: false,
    brand: true,
    global: true,
    export: true,
    textBox: false,
  });

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // AI Generation State
  const [showAiPrompt, setShowAiPrompt] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // Template handlers
  const handleSaveTemplate = () => {
    if (!newTemplateName.trim()) return;
    saveTemplate(newTemplateName.trim(), project);
    setNewTemplateName('');
    setShowSaveInput(false);
  };

  const handleApplyTemplate = (template: DesignTemplate) => {
    const settings = applyTemplate(template);
    onProjectChange(settings);
    setSelectedTemplateId(template.id);
  };

  const handleDeleteTemplate = (id: string) => {
    if (confirm('이 템플릿을 삭제하시겠습니까?')) {
      deleteTemplate(id);
      if (selectedTemplateId === id) {
        setSelectedTemplateId(null);
      }
    }
  };

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
            toast.success('Image Generated', 'AI image has been applied to your slide.');
        } else {
            toast.error('Generation Failed', data.error || 'Unknown error');
        }
    } catch (error) {
        toast.error('Generation Error', 'Failed to generate image. Please try again.');
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
                Slide
            </TabButton>
            <TabButton
                active={activeTab === 'design'}
                onClick={() => setActiveTab('design')}
                icon={Paintbrush}
            >
                Design
            </TabButton>
            <TabButton
                active={activeTab === 'template'}
                onClick={() => setActiveTab('template')}
                icon={LayoutTemplate}
            >
                Templates
            </TabButton>
        </div>

        {/* Scrollable Content - Always reserve scrollbar space, show on hover */}
        <div className="flex-1 overflow-y-scroll p-6 space-y-8 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-transparent hover:[&::-webkit-scrollbar-thumb]:bg-neutral-700 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:transition-colors">
            
            {activeTab === 'slide' && (
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                    {/* 1. Image Section */}
                    <AccordionSection
                        title="Background Image"
                        icon={ImageIcon}
                        isOpen={openSections.image}
                        onToggle={() => toggleSection('image')}
                    >
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
                    </AccordionSection>

                    {/* 2. Text Content */}
                    <AccordionSection
                        title="Text Details"
                        icon={Type}
                        isOpen={openSections.text}
                        onToggle={() => toggleSection('text')}
                    >
                             <div>
                                <div className="flex items-center justify-between mb-1.5">
                                    <label className="text-xs font-medium text-neutral-500">작은 타이틀</label>
                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                        <span className="text-xs text-neutral-500">Show</span>
                                        <input
                                            type="checkbox"
                                            checked={project.showSmallTitle !== false}
                                            onChange={(e) => onProjectChange({ showSmallTitle: e.target.checked })}
                                            className="accent-indigo-500 w-3.5 h-3.5 bg-neutral-700 border-neutral-600 rounded"
                                        />
                                    </label>
                                </div>
                                <input
                                    value={slide.smallTitle || ''}
                                    onChange={(e) => onSlideChange({ smallTitle: e.target.value })}
                                    disabled={project.showSmallTitle === false}
                                    className={cn(
                                        "w-full text-sm p-3 border border-neutral-700 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-neutral-800/50 text-neutral-200 placeholder:text-neutral-600 transition-colors",
                                        project.showSmallTitle === false && "opacity-50 cursor-not-allowed"
                                    )}
                                    placeholder="Enter small title..."
                                />

                                {/* Small Title Position Grid */}
                                {project.showSmallTitle !== false && (
                                    <div className="mt-3">
                                        <label className="text-xs font-medium text-neutral-500 mb-2 block">위치 (드래그로 조절 가능)</label>
                                        <div className="grid grid-cols-3 gap-1 w-full max-w-[120px]">
                                            {TEXT_POSITIONS.map((pos) => (
                                                <button
                                                    key={pos.value}
                                                    onClick={() => onProjectChange({ smallTitlePosition: pos.value })}
                                                    className={cn(
                                                        "aspect-square rounded flex items-center justify-center text-[10px] transition-all",
                                                        (project.smallTitlePosition || 'top-left') === pos.value
                                                            ? "bg-indigo-500 text-white"
                                                            : "bg-neutral-800 text-neutral-500 hover:bg-neutral-700"
                                                    )}
                                                    title={pos.label}
                                                >
                                                    <div className="w-1.5 h-1.5 rounded-full bg-current" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                             </div>
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
                                    <label className="text-xs font-medium text-neutral-500">서브 타이틀</label>
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
                    </AccordionSection>

                    {/* 3. Font Settings */}
                    <AccordionSection
                        title="Font Settings"
                        icon={Type}
                        isOpen={openSections.font}
                        onToggle={() => toggleSection('font')}
                    >
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

                            {/* Small Title Font Size */}
                            <div>
                                <div className="flex justify-between text-xs mb-2">
                                    <span className="font-medium text-neutral-500">작은 타이틀 Size</span>
                                    <span className="text-neutral-400 font-mono">{project.fontSettings.smallTitleFontSize}px</span>
                                </div>
                                <input
                                    type="range"
                                    min="12" max="40"
                                    value={project.fontSettings.smallTitleFontSize}
                                    onChange={(e) => onProjectChange({
                                        fontSettings: { ...project.fontSettings, smallTitleFontSize: Number(e.target.value) }
                                    })}
                                    className="w-full h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                />
                            </div>

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
                                    <span className="font-medium text-neutral-500">서브 타이틀 Size</span>
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
                    </AccordionSection>
                </div>
            )}

            {activeTab === 'design' && (
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
                    {/* Brand Kit */}
                    <AccordionSection
                        title="Brand Kit"
                        icon={Layers}
                        isOpen={openSections.brand}
                        onToggle={() => toggleSection('brand')}
                    >
                        <div className="space-y-4">
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
                    </AccordionSection>

                    {/* Global Style */}
                    <AccordionSection
                        title="Global Settings"
                        icon={Settings}
                        isOpen={openSections.global}
                        onToggle={() => toggleSection('global')}
                    >
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

                    </AccordionSection>

                    {/* Export Settings */}
                    <AccordionSection
                        title="Export Settings"
                        icon={Download}
                        isOpen={openSections.export || false}
                        onToggle={() => toggleSection('export')}
                    >
                            {/* Export Format */}
                            <div>
                                <label className="text-xs font-medium text-neutral-500 mb-2 block">Export Format</label>
                                <div className="flex bg-neutral-900 border border-neutral-700 rounded-lg p-1">
                                    {[
                                        { value: 'images' as const, label: 'Images' },
                                        { value: 'video' as const, label: 'Video' }
                                    ].map((format) => (
                                        <button
                                            key={format.value}
                                            onClick={() => onProjectChange({ exportFormat: format.value })}
                                            className={cn(
                                                "flex-1 py-1.5 text-xs font-medium rounded-md transition-all",
                                                project.exportFormat === format.value
                                                    ? "bg-neutral-700 text-white shadow-sm"
                                                    : "text-neutral-500 hover:text-neutral-300"
                                            )}
                                        >
                                            {format.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Video Settings */}
                            {project.exportFormat === 'video' && (
                                <>
                                    <hr className="border-neutral-700" />
                                    
                                    {/* Duration per slide */}
                                    <div>
                                        <div className="flex justify-between text-xs mb-2">
                                            <span className="font-medium text-neutral-500">Duration per Slide</span>
                                            <span className="text-neutral-400 font-mono">{project.videoDuration}s</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="2" max="10"
                                            value={project.videoDuration}
                                            onChange={(e) => onProjectChange({ videoDuration: Number(e.target.value) })}
                                            className="w-full h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                        />
                                        <div className="text-[10px] text-neutral-600 mt-1">
                                            Total: {(project.videoDuration * slideCount).toFixed(1)}s ({slideCount} slides)
                                        </div>
                                    </div>

                                    {/* Transition Effect */}
                                    <div>
                                        <label className="text-xs font-medium text-neutral-500 mb-2 block">Transition Effect</label>
                                        <div className="flex bg-neutral-900 border border-neutral-700 rounded-lg p-1">
                                            {[
                                                { value: 'fade' as const, label: 'Fade' },
                                                { value: 'slide' as const, label: 'Slide' },
                                                { value: 'none' as const, label: 'None' }
                                            ].map((transition) => (
                                                <button
                                                    key={transition.value}
                                                    onClick={() => onProjectChange({ videoTransition: transition.value })}
                                                    className={cn(
                                                        "flex-1 py-1.5 text-[10px] font-medium rounded-md transition-all",
                                                        project.videoTransition === transition.value
                                                            ? "bg-neutral-700 text-white shadow-sm"
                                                            : "text-neutral-500 hover:text-neutral-300"
                                                    )}
                                                >
                                                    {transition.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                    </AccordionSection>

                    {/* Text Box Settings */}
                    <AccordionSection
                        title="Text Box Settings"
                        icon={Type}
                        isOpen={openSections.textBox}
                        onToggle={() => toggleSection('textBox')}
                    >
                            {/* Text Box Style */}
                            <div>
                                <label className="text-xs font-medium text-neutral-500 mb-2 block">Box Style</label>
                                <div className="grid grid-cols-5 gap-1 bg-neutral-900 border border-neutral-700 rounded-lg p-1">
                                    {TEXT_BOX_STYLES.map((style) => (
                                        <button
                                            key={style.value}
                                            onClick={() => onProjectChange({
                                                textBoxSettings: { ...project.textBoxSettings, style: style.value }
                                            })}
                                            title={style.description}
                                            className={cn(
                                                "py-1.5 text-[9px] font-medium rounded-md transition-all",
                                                project.textBoxSettings.style === style.value
                                                    ? "bg-neutral-700 text-white shadow-sm"
                                                    : "text-neutral-500 hover:text-neutral-300"
                                            )}
                                        >
                                            {style.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Text Position - 3x3 Grid */}
                            <div>
                                <label className="text-xs font-medium text-neutral-500 mb-2 block">Position</label>
                                <div className="grid grid-cols-3 gap-1 bg-neutral-900 border border-neutral-700 rounded-lg p-2">
                                    {TEXT_POSITIONS.map((pos) => (
                                        <button
                                            key={pos.value}
                                            onClick={() => onProjectChange({
                                                textBoxSettings: { ...project.textBoxSettings, position: pos.value }
                                            })}
                                            className={cn(
                                                "py-2 text-xs font-medium rounded-md transition-all",
                                                project.textBoxSettings.position === pos.value
                                                    ? "bg-indigo-600 text-white shadow-sm"
                                                    : "text-neutral-500 hover:text-neutral-300 hover:bg-neutral-800"
                                            )}
                                        >
                                            {pos.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Style-specific Settings */}
                            {project.textBoxSettings.style !== 'none' && (
                                <>
                                    <hr className="border-neutral-700" />

                                    {/* 단색 (solid): Background only */}
                                    {project.textBoxSettings.style === 'solid' && (
                                        <>
                                            <div>
                                                <label className="text-xs font-medium text-neutral-500 mb-1.5 block">Background Color</label>
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="color"
                                                        value={project.textBoxSettings.backgroundColor}
                                                        onChange={(e) => onProjectChange({
                                                            textBoxSettings: { ...project.textBoxSettings, backgroundColor: e.target.value }
                                                        })}
                                                        className="w-10 h-10 rounded-lg border border-neutral-700 cursor-pointer bg-transparent"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={project.textBoxSettings.backgroundColor}
                                                        onChange={(e) => onProjectChange({
                                                            textBoxSettings: { ...project.textBoxSettings, backgroundColor: e.target.value }
                                                        })}
                                                        className="flex-1 text-sm p-2.5 border border-neutral-700 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-neutral-800/50 text-neutral-200 font-mono uppercase"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex justify-between text-xs mb-2">
                                                    <span className="font-medium text-neutral-500">Background Opacity</span>
                                                    <span className="text-neutral-400 font-mono">{project.textBoxSettings.backgroundOpacity}%</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="0" max="100"
                                                    value={project.textBoxSettings.backgroundOpacity}
                                                    onChange={(e) => onProjectChange({
                                                        textBoxSettings: { ...project.textBoxSettings, backgroundOpacity: Number(e.target.value) }
                                                    })}
                                                    className="w-full h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                                />
                                            </div>
                                        </>
                                    )}

                                    {/* 테두리 (outline): Background + Border */}
                                    {project.textBoxSettings.style === 'outline' && (
                                        <>
                                            <div>
                                                <label className="text-xs font-medium text-neutral-500 mb-1.5 block">Background Color</label>
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="color"
                                                        value={project.textBoxSettings.backgroundColor}
                                                        onChange={(e) => onProjectChange({
                                                            textBoxSettings: { ...project.textBoxSettings, backgroundColor: e.target.value }
                                                        })}
                                                        className="w-10 h-10 rounded-lg border border-neutral-700 cursor-pointer bg-transparent"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={project.textBoxSettings.backgroundColor}
                                                        onChange={(e) => onProjectChange({
                                                            textBoxSettings: { ...project.textBoxSettings, backgroundColor: e.target.value }
                                                        })}
                                                        className="flex-1 text-sm p-2.5 border border-neutral-700 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-neutral-800/50 text-neutral-200 font-mono uppercase"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex justify-between text-xs mb-2">
                                                    <span className="font-medium text-neutral-500">Background Opacity</span>
                                                    <span className="text-neutral-400 font-mono">{project.textBoxSettings.backgroundOpacity}%</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="0" max="100"
                                                    value={project.textBoxSettings.backgroundOpacity}
                                                    onChange={(e) => onProjectChange({
                                                        textBoxSettings: { ...project.textBoxSettings, backgroundOpacity: Number(e.target.value) }
                                                    })}
                                                    className="w-full h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                                />
                                            </div>
                                            <hr className="border-neutral-700" />
                                            <div>
                                                <label className="text-xs font-medium text-neutral-500 mb-1.5 block">Border Color</label>
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="color"
                                                        value={project.textBoxSettings.borderColor}
                                                        onChange={(e) => onProjectChange({
                                                            textBoxSettings: { ...project.textBoxSettings, borderColor: e.target.value }
                                                        })}
                                                        className="w-10 h-10 rounded-lg border border-neutral-700 cursor-pointer bg-transparent"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={project.textBoxSettings.borderColor}
                                                        onChange={(e) => onProjectChange({
                                                            textBoxSettings: { ...project.textBoxSettings, borderColor: e.target.value }
                                                        })}
                                                        className="flex-1 text-sm p-2.5 border border-neutral-700 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-neutral-800/50 text-neutral-200 font-mono uppercase"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex justify-between text-xs mb-2">
                                                    <span className="font-medium text-neutral-500">Border Width</span>
                                                    <span className="text-neutral-400 font-mono">{project.textBoxSettings.borderWidth}px</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="1" max="10"
                                                    value={project.textBoxSettings.borderWidth}
                                                    onChange={(e) => onProjectChange({
                                                        textBoxSettings: { ...project.textBoxSettings, borderWidth: Number(e.target.value) }
                                                    })}
                                                    className="w-full h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                                />
                                            </div>
                                        </>
                                    )}

                                    {/* 그라데이션 (gradient): Base + End Color */}
                                    {project.textBoxSettings.style === 'gradient' && (
                                        <>
                                            <div>
                                                <label className="text-xs font-medium text-neutral-500 mb-1.5 block">Start Color</label>
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="color"
                                                        value={project.textBoxSettings.backgroundColor || '#000000'}
                                                        onChange={(e) => onProjectChange({
                                                            textBoxSettings: { ...project.textBoxSettings, backgroundColor: e.target.value }
                                                        })}
                                                        className="w-10 h-10 rounded-lg border border-neutral-700 cursor-pointer bg-transparent"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={project.textBoxSettings.backgroundColor || '#000000'}
                                                        onChange={(e) => onProjectChange({
                                                            textBoxSettings: { ...project.textBoxSettings, backgroundColor: e.target.value }
                                                        })}
                                                        className="flex-1 text-sm p-2.5 border border-neutral-700 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-neutral-800/50 text-neutral-200 font-mono uppercase"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-xs font-medium text-neutral-500 mb-1.5 block">End Color</label>
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="color"
                                                        value={project.textBoxSettings.gradientEndColor || '#FFFFFF'}
                                                        onChange={(e) => onProjectChange({
                                                            textBoxSettings: { ...project.textBoxSettings, gradientEndColor: e.target.value }
                                                        })}
                                                        className="w-10 h-10 rounded-lg border border-neutral-700 cursor-pointer bg-transparent"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={project.textBoxSettings.gradientEndColor || '#FFFFFF'}
                                                        onChange={(e) => onProjectChange({
                                                            textBoxSettings: { ...project.textBoxSettings, gradientEndColor: e.target.value }
                                                        })}
                                                        className="flex-1 text-sm p-2.5 border border-neutral-700 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-neutral-800/50 text-neutral-200 font-mono uppercase"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex justify-between text-xs mb-2">
                                                    <span className="font-medium text-neutral-500">Opacity</span>
                                                    <span className="text-neutral-400 font-mono">{project.textBoxSettings.backgroundOpacity}%</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="0" max="100"
                                                    value={project.textBoxSettings.backgroundOpacity}
                                                    onChange={(e) => onProjectChange({
                                                        textBoxSettings: { ...project.textBoxSettings, backgroundOpacity: Number(e.target.value) }
                                                    })}
                                                    className="w-full h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                                />
                                            </div>
                                        </>
                                    )}

                                    {/* 블러 (blur): Background only */}
                                    {project.textBoxSettings.style === 'blur' && (
                                        <>
                                            <div>
                                                <label className="text-xs font-medium text-neutral-500 mb-1.5 block">Tint Color</label>
                                                <div className="flex items-center gap-3">
                                                    <input
                                                        type="color"
                                                        value={project.textBoxSettings.backgroundColor}
                                                        onChange={(e) => onProjectChange({
                                                            textBoxSettings: { ...project.textBoxSettings, backgroundColor: e.target.value }
                                                        })}
                                                        className="w-10 h-10 rounded-lg border border-neutral-700 cursor-pointer bg-transparent"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={project.textBoxSettings.backgroundColor}
                                                        onChange={(e) => onProjectChange({
                                                            textBoxSettings: { ...project.textBoxSettings, backgroundColor: e.target.value }
                                                        })}
                                                        className="flex-1 text-sm p-2.5 border border-neutral-700 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-neutral-800/50 text-neutral-200 font-mono uppercase"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex justify-between text-xs mb-2">
                                                    <span className="font-medium text-neutral-500">Tint Opacity</span>
                                                    <span className="text-neutral-400 font-mono">{project.textBoxSettings.backgroundOpacity}%</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="0" max="100"
                                                    value={project.textBoxSettings.backgroundOpacity}
                                                    onChange={(e) => onProjectChange({
                                                        textBoxSettings: { ...project.textBoxSettings, backgroundOpacity: Number(e.target.value) }
                                                    })}
                                                    className="w-full h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                                />
                                            </div>
                                        </>
                                    )}

                                    <hr className="border-neutral-700" />

                                    {/* Border Radius - 모든 스타일 공통 */}
                                    <div>
                                        <div className="flex justify-between text-xs mb-2">
                                            <span className="font-medium text-neutral-500">Border Radius</span>
                                            <span className="text-neutral-400 font-mono">{project.textBoxSettings.borderRadius}px</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="0" max="100"
                                            value={project.textBoxSettings.borderRadius}
                                            onChange={(e) => onProjectChange({
                                                textBoxSettings: { ...project.textBoxSettings, borderRadius: Number(e.target.value) }
                                            })}
                                            className="w-full h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                        />
                                    </div>

                                    {/* Padding - 모든 스타일 공통 */}
                                    <div>
                                        <div className="flex justify-between text-xs mb-2">
                                            <span className="font-medium text-neutral-500">Padding</span>
                                            <span className="text-neutral-400 font-mono">{project.textBoxSettings.padding}px</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="8" max="64"
                                            value={project.textBoxSettings.padding}
                                            onChange={(e) => onProjectChange({
                                                textBoxSettings: { ...project.textBoxSettings, padding: Number(e.target.value) }
                                            })}
                                            className="w-full h-1.5 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                                        />
                                    </div>
                                </>
                            )}
                    </AccordionSection>
                </div>
            )}

            {activeTab === 'template' && (
                <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                    {/* Save Current as Template */}
                    <div className="border border-neutral-800 rounded-xl p-4 space-y-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-neutral-400 uppercase tracking-wider">
                            <Plus size={14} /> <span>Save Current Design</span>
                        </div>
                        {showSaveInput ? (
                            <div className="space-y-2">
                                <input
                                    type="text"
                                    value={newTemplateName}
                                    onChange={(e) => setNewTemplateName(e.target.value)}
                                    placeholder="템플릿 이름 입력..."
                                    className="w-full text-sm p-3 border border-neutral-700 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-neutral-800/50 text-neutral-200 placeholder:text-neutral-600"
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleSaveTemplate();
                                        if (e.key === 'Escape') setShowSaveInput(false);
                                    }}
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleSaveTemplate}
                                        disabled={!newTemplateName.trim()}
                                        className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center justify-center gap-2 transition-all"
                                    >
                                        <Check size={14} /> Save
                                    </button>
                                    <button
                                        onClick={() => { setShowSaveInput(false); setNewTemplateName(''); }}
                                        className="py-2 px-4 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg text-xs font-medium transition-all"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowSaveInput(true)}
                                className="w-full py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-sm font-medium text-neutral-300 hover:bg-neutral-700 hover:text-white transition-colors flex items-center justify-center gap-2"
                            >
                                <Save size={16} /> 현재 디자인을 템플릿으로 저장
                            </button>
                        )}
                    </div>

                    {/* Default Templates */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-xs font-bold text-neutral-400 uppercase tracking-wider">
                            <LayoutTemplate size={14} /> <span>Default Templates</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {templates.filter(t => t.id.startsWith('default-')).map((template) => (
                                <button
                                    key={template.id}
                                    onClick={() => handleApplyTemplate(template)}
                                    className={cn(
                                        "relative p-3 rounded-lg border text-left transition-all group",
                                        selectedTemplateId === template.id
                                            ? "bg-indigo-900/30 border-indigo-500 text-white"
                                            : "bg-neutral-800/50 border-neutral-700 text-neutral-300 hover:bg-neutral-800 hover:border-neutral-600"
                                    )}
                                >
                                    <div className="text-sm font-medium">{template.name}</div>
                                    <div className="text-[10px] text-neutral-500 mt-1">
                                        {template.textBoxSettings.style} · {template.fontSettings.fontWeight}
                                    </div>
                                    {selectedTemplateId === template.id && (
                                        <Check size={12} className="absolute top-2 right-2 text-indigo-400" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Custom Templates */}
                    {templates.filter(t => t.id.startsWith('custom-')).length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-xs font-bold text-neutral-400 uppercase tracking-wider">
                                <Save size={14} /> <span>My Templates</span>
                            </div>
                            <div className="space-y-2">
                                {templates.filter(t => t.id.startsWith('custom-')).map((template) => (
                                    <div
                                        key={template.id}
                                        className={cn(
                                            "relative p-3 rounded-lg border transition-all group flex items-center justify-between",
                                            selectedTemplateId === template.id
                                                ? "bg-indigo-900/30 border-indigo-500"
                                                : "bg-neutral-800/50 border-neutral-700 hover:bg-neutral-800 hover:border-neutral-600"
                                        )}
                                    >
                                        <button
                                            onClick={() => handleApplyTemplate(template)}
                                            className="flex-1 text-left"
                                        >
                                            <div className="text-sm font-medium text-neutral-200">{template.name}</div>
                                            <div className="text-[10px] text-neutral-500 mt-0.5">
                                                {new Date(template.createdAt).toLocaleDateString('ko-KR')}
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => handleDeleteTemplate(template.id)}
                                            className="p-2 text-neutral-500 hover:text-red-400 hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                        {selectedTemplateId === template.id && (
                                            <Check size={12} className="absolute top-2 right-10 text-indigo-400" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Template Info */}
                    <div className="p-4 bg-neutral-800/30 border border-neutral-800 rounded-lg">
                        <p className="text-xs text-neutral-500 leading-relaxed">
                            💡 템플릿은 디자인 설정만 저장합니다. 슬라이드 내용(텍스트, 이미지)은 저장되지 않습니다.
                        </p>
                    </div>
                </div>
            )}

        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-neutral-800 bg-neutral-900 shrink-0 space-y-3 z-30 shadow-[0_-5px_20px_rgba(0,0,0,0.2)]">
             {generatedUrls && generatedUrls.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                    {generatedUrls.map((url, i) => {
                        const isVideo = url.includes('.mp4') || url.includes('.webm');
                        return (
                            <a
                                key={i}
                                href={url}
                                download={isVideo ? `card-news-video.mp4` : `card-news-${i+1}.png`}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center justify-center py-2 bg-green-900/20 border border-green-800/50 text-green-400 text-xs font-bold rounded-lg hover:bg-green-900/40 transition-colors"
                            >
                                {isVideo ? 'Download Video' : `Download #${i + 1}`}
                            </a>
                        );
                    })}
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
                            Generating {slideCount} {slideCount === 1 ? 'slide' : 'slides'}...
                        </>
                    ) : (
                        <>
                            <Download size={16} />
                            Generate {slideCount > 1 ? `(${slideCount})` : ''}
                        </>
                    )}
                </button>
            </div>
        </div>
    </div>
  );
}
