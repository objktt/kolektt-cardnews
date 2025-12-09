'use client';

import React, { useState } from 'react';
import { Sidebar } from '@/components/Layout/Sidebar';
import { Header } from '@/components/Layout/Header';
import { HistoryService } from '@/services/history'; // Added import
import { PreviewPanel } from '@/components/Editor/PreviewPanel';
import { StorySidebar } from '@/components/Editor/StorySidebar';
import { ControlPanel } from '@/components/Editor/ControlPanel'; 
import { ProjectData, SlideData, INITIAL_PROJECT_DATA, INITIAL_SLIDE } from '@/types';

export default function Home() {
  const [data, setData] = useState<ProjectData>(INITIAL_PROJECT_DATA);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUrls, setGeneratedUrls] = useState<string[]>([]);

  // Helpers
  const activeSlide = data.slides[activeSlideIndex] || data.slides[0];

  const updateProject = (newData: Partial<ProjectData>) => {
    setData({ ...data, ...newData });
  };

  const updateActiveSlide = (newSlideData: Partial<SlideData>) => {
    const updatedSlides = [...data.slides];
    updatedSlides[activeSlideIndex] = { ...updatedSlides[activeSlideIndex], ...newSlideData };
    setData({ ...data, slides: updatedSlides });
  };

  // Allow updating any specific slide (for sidebar editing)
  const updateSlideAtIndex = (index: number, newSlideData: Partial<SlideData>) => {
    const updatedSlides = [...data.slides];
    updatedSlides[index] = { ...updatedSlides[index], ...newSlideData };
    setData({ ...data, slides: updatedSlides });
  };

  const handleAddSlide = () => {
    const newSlide = { ...INITIAL_SLIDE, id: `slide-${Date.now()}` };
    const newSlides = [...data.slides, newSlide];
    setData({ ...data, slides: newSlides });
    setActiveSlideIndex(newSlides.length - 1); // Switch to new slide
  };

  const handleRemoveSlide = (index: number) => {
    if (data.slides.length <= 1) return;
    const newSlides = data.slides.filter((_, i) => i !== index);
    setData({ ...data, slides: newSlides });
    if (activeSlideIndex >= index && activeSlideIndex > 0) {
      setActiveSlideIndex(activeSlideIndex - 1);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setGeneratedUrls([]);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (result.success && result.imageUrls) {
        setGeneratedUrls(result.imageUrls);
        
        // Save to History
        HistoryService.add({
            headline: data.slides[0]?.headline || "Untitled Project",
            imageUrls: result.imageUrls,
            projectData: data
        });

        alert('Generation Complete!');
      } else {
        alert('Failed: ' + result.error);
      }
    } catch (e) {
      alert('Error: ' + e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-neutral-950 overflow-hidden text-neutral-100 font-sans">
      <Header />
      
      <div className="flex flex-1 overflow-hidden relative">
        {/* 1. Navigation Sidebar (Hover to expand) */}
        <Sidebar />

        {/* 2. Control Panel (Editor Tools) - "Second Pane" */}
        <div className="pl-16 h-full flex shrink-0"> {/* pl-16 to clear the fixed sidebar */}
             <ControlPanel 
                project={data} 
                onProjectChange={updateProject}
                slide={activeSlide}
                onSlideChange={updateActiveSlide}
                isGenerating={isGenerating}
                onGenerate={handleGenerate}
                generatedUrls={generatedUrls}
            />
        </div>

        {/* 3. Main Workspace (Preview) - "Canvas" */}
        <main className="flex-1 relative flex flex-col min-w-0 bg-neutral-950">
            <div className="flex items-center justify-between px-6 py-3 border-b border-neutral-800 bg-neutral-900/50 backdrop-blur-sm z-10">
                 <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-neutral-500 uppercase tracking-widest">
                        Canvas
                    </span>
                 </div>
                 <div className="text-xs text-neutral-500">
                    Preview Mode (1080x1350)
                 </div>
            </div>
            
            <div className="flex-1 overflow-hidden relative flex items-center justify-center p-8">
                 {/* Canvas Background Grid */}
                 <div className="absolute inset-0 bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:20px_20px] opacity-50 pointer-events-none" />
                 
                 <PreviewPanel project={data} slide={activeSlide} />
            </div>
        </main>

        {/* 4. Storyline Sidebar (Flow) - "Right Pane" */}
        <StorySidebar 
            slides={data.slides}
            activeSlideIndex={activeSlideIndex}
            onSelectSlide={setActiveSlideIndex}
            onUpdateSlide={updateSlideAtIndex}
            onAddSlide={handleAddSlide}
            onRemoveSlide={handleRemoveSlide}
        />

      </div>
    </div>
  );
}
