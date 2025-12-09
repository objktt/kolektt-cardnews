'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthenticationStatus, useUserData, useNhostClient } from '@nhost/nextjs';
import { Sidebar } from '@/components/Layout/Sidebar';
import { Header } from '@/components/Layout/Header';
import { HistoryService } from '@/services/history';
import { PostsService } from '@/services/posts';
import { PreviewPanel } from '@/components/Editor/PreviewPanel';
import { StorySidebar } from '@/components/Editor/StorySidebar';
import { ControlPanel } from '@/components/Editor/ControlPanel';
import { ProjectData, SlideData, INITIAL_PROJECT_DATA, INITIAL_SLIDE } from '@/types';
import { ChevronDown, Check } from 'lucide-react';

const CANVAS_SIZE_OPTIONS = [
  { value: '1:1' as const, label: '1:1', dimensions: '1080 x 1080', description: 'Square' },
  { value: '4:5' as const, label: '4:5', dimensions: '1080 x 1350', description: 'Portrait' },
  { value: '9:16' as const, label: '9:16', dimensions: '1080 x 1920', description: 'Story' },
];

export default function EditorPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuthenticationStatus();
  const user = useUserData();
  const nhost = useNhostClient();

  // All hooks must be called before any conditional returns
  const [data, setData] = useState<ProjectData>(INITIAL_PROJECT_DATA);
  const [isSaving, setIsSaving] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUrls, setGeneratedUrls] = useState<string[]>([]);
  const [sizeDropdownOpen, setSizeDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setSizeDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

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

  const updateSlideAtIndex = (index: number, newSlideData: Partial<SlideData>) => {
    const updatedSlides = [...data.slides];
    updatedSlides[index] = { ...updatedSlides[index], ...newSlideData };
    setData({ ...data, slides: updatedSlides });
  };

  const handleAddSlide = () => {
    const newSlide = { ...INITIAL_SLIDE, id: `slide-${Date.now()}` };
    const newSlides = [...data.slides, newSlide];
    setData({ ...data, slides: newSlides });
    setActiveSlideIndex(newSlides.length - 1);
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

        // Save to local history
        HistoryService.add({
          headline: data.slides[0]?.headline || "Untitled Project",
          imageUrls: result.imageUrls,
          projectData: data
        });

        // Save to Nhost database for calendar
        if (user?.id) {
          try {
            const postsService = new PostsService(nhost);
            await postsService.saveDraft({
              user_id: user.id,
              title: data.slides[0]?.headline || 'Untitled Project',
              status: 'generated',
              project_data: data,
              generated_images: result.imageUrls,
            });
          } catch (dbError) {
            console.error('Failed to save to database:', dbError);
          }
        }

        alert('Generation Complete! Images saved to calendar.');
      } else {
        alert('Failed: ' + result.error);
      }
    } catch (e) {
      alert('Error: ' + e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!user?.id) {
      alert('Please log in to save drafts');
      return;
    }
    setIsSaving(true);
    try {
      const postsService = new PostsService(nhost);
      const result = await postsService.saveDraft({
        user_id: user.id,
        title: data.slides[0]?.headline || 'Untitled Project',
        status: 'draft',
        project_data: data,
        generated_images: generatedUrls.length > 0 ? generatedUrls : undefined,
      });
      if (result) {
        alert('Draft saved successfully!');
      } else {
        alert('Failed to save draft');
      }
    } catch (e) {
      console.error('Error saving draft:', e);
      alert('Error saving draft: ' + e);
    } finally {
      setIsSaving(false);
    }
  };

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
    <div className="flex flex-col h-screen w-full bg-neutral-950 overflow-hidden text-neutral-100 font-sans">
      <Header user={user} />

      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar />

        <div className="pl-16 h-full flex shrink-0">
          <ControlPanel
            project={data}
            onProjectChange={updateProject}
            slide={activeSlide}
            onSlideChange={updateActiveSlide}
            isGenerating={isGenerating}
            onGenerate={handleGenerate}
            isSaving={isSaving}
            onSaveDraft={handleSaveDraft}
            generatedUrls={generatedUrls}
          />
        </div>

        <main className="flex-1 relative flex flex-col min-w-0 bg-neutral-950">
          <div className="flex items-center justify-between px-6 py-3 border-b border-neutral-800 bg-neutral-900/50 backdrop-blur-sm z-10">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-widest">
                Canvas
              </span>
            </div>

            {/* Canvas Size Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setSizeDropdownOpen(!sizeDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 text-xs text-neutral-400 hover:text-white bg-neutral-800/50 hover:bg-neutral-800 border border-neutral-700 rounded-lg transition-colors"
              >
                <span>
                  {CANVAS_SIZE_OPTIONS.find(o => o.value === data.canvasSize)?.dimensions || '1080 x 1350'}
                </span>
                <ChevronDown size={14} className={`transition-transform ${sizeDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {sizeDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-neutral-900 border border-neutral-700 rounded-lg shadow-xl overflow-hidden z-50">
                  {CANVAS_SIZE_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        updateProject({ canvasSize: option.value });
                        setSizeDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 text-left text-sm hover:bg-neutral-800 transition-colors ${
                        data.canvasSize === option.value ? 'text-indigo-400' : 'text-neutral-300'
                      }`}
                    >
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-neutral-500">{option.dimensions} · {option.description}</div>
                      </div>
                      {data.canvasSize === option.value && <Check size={16} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-hidden relative flex items-center justify-center p-8">
            <div className="absolute inset-0 bg-[radial-gradient(#262626_1px,transparent_1px)] [background-size:20px_20px] opacity-50 pointer-events-none" />
            <PreviewPanel project={data} slide={activeSlide} />
          </div>
        </main>

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
