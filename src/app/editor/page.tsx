'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthenticationStatus, useUserData, useNhostClient } from '@nhost/nextjs';
import { Sidebar } from '@/components/Layout/Sidebar';
import { Header } from '@/components/Layout/Header';
import { HistoryService } from '@/services/history';
import { PostsService } from '@/services/posts';
import { PreviewPanel } from '@/components/Editor/PreviewPanel';
import { StoryTimeline } from '@/components/Editor/StoryTimeline';
import { ControlPanel } from '@/components/Editor/ControlPanel';
import { ProjectData, SlideData, INITIAL_PROJECT_DATA, INITIAL_SLIDE, TextPosition } from '@/types';
import { ChevronDown, Check, Cloud, CloudOff, Undo2, Redo2, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { NotificationService } from '@/services/notifications';
import { useHistory } from '@/hooks/useHistory';

const CANVAS_SIZE_OPTIONS = [
  { value: '1:1' as const, label: '1:1', dimensions: '1080 x 1080', description: 'Square' },
  { value: '4:5' as const, label: '4:5', dimensions: '1080 x 1350', description: 'Portrait' },
  { value: '9:16' as const, label: '9:16', dimensions: '1080 x 1920', description: 'Story' },
];

// Wrapper component with Suspense boundary for useSearchParams
export default function EditorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center flex-col gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    }>
      <EditorPageContent />
    </Suspense>
  );
}

function EditorPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isLoading } = useAuthenticationStatus();
  const user = useUserData();
  const nhost = useNhostClient();
  const toast = useToast();

  // Get initial tab from URL params
  const tabParam = searchParams.get('tab');
  const initialTab = (tabParam === 'template' || tabParam === 'design') ? tabParam : 'slide';

  // All hooks must be called before any conditional returns
  const {
    state: data,
    setState: setData,
    undo,
    redo,
    canUndo,
    canRedo,
    reset: resetHistory,
  } = useHistory<ProjectData>(INITIAL_PROJECT_DATA, { maxHistory: 50, debounceMs: 500 });
  const [isSaving, setIsSaving] = useState(false);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedUrls, setGeneratedUrls] = useState<string[]>([]);
  const [sizeDropdownOpen, setSizeDropdownOpen] = useState(false);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);
  const [isLoadingDraft, setIsLoadingDraft] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [zoom, setZoom] = useState(0.38);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const initialDataRef = useRef<string>('');

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

  // Track unsaved changes
  useEffect(() => {
    if (!isLoadingDraft && initialDataRef.current) {
      const currentDataStr = JSON.stringify(data);
      setHasUnsavedChanges(currentDataStr !== initialDataRef.current);
    }
  }, [data, isLoadingDraft]);

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [hasUnsavedChanges]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in an input field
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  // Load draft from URL param
  useEffect(() => {
    const draftId = searchParams.get('draft');
    if (draftId && isAuthenticated && !isLoadingDraft) {
      setIsLoadingDraft(true);
      const postsService = new PostsService(nhost);
      postsService.getPostById(draftId).then((post) => {
        if (post && post.project_data) {
          resetHistory(post.project_data);
          setCurrentDraftId(post.id || null);
          initialDataRef.current = JSON.stringify(post.project_data);
          if (post.generated_images) {
            setGeneratedUrls(post.generated_images);
          }
        }
        setIsLoadingDraft(false);
      }).catch(() => {
        setIsLoadingDraft(false);
      });
    } else if (!draftId && !initialDataRef.current) {
      // Set initial data for new project
      initialDataRef.current = JSON.stringify(INITIAL_PROJECT_DATA);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, isAuthenticated, nhost, isLoadingDraft]);

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
      const apiEndpoint = data.exportFormat === 'video' ? '/api/generate-video' : '/api/generate';
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      
      // Handle video response
      if (data.exportFormat === 'video') {
        if (result.success && result.videoUrl) {
          setGeneratedUrls([result.videoUrl]);

          // Save to local history
          HistoryService.add({
            headline: data.slides[0]?.headline || "Untitled Project",
            imageUrls: [result.videoUrl],
            projectData: data
          });

          // Save to Nhost database for calendar
          if (user?.id) {
            try {
              const postsService = new PostsService(nhost);
              if (currentDraftId) {
                await postsService.updatePost(currentDraftId, {
                  title: data.slides[0]?.headline || 'Untitled Project',
                  status: 'generated',
                  project_data: data,
                  generated_images: [result.videoUrl],
                });
              } else {
                const newPost = await postsService.saveDraft({
                  title: data.slides[0]?.headline || 'Untitled Project',
                  status: 'generated',
                  project_data: data,
                  generated_images: [result.videoUrl],
                });
                if (newPost && newPost.id !== currentDraftId) {
                  setCurrentDraftId(newPost.id);
                  router.replace(`/editor?draft=${newPost.id}`, { scroll: false });
                }
              }
            } catch (dbError) {
              console.error('Failed to save to database:', dbError);
              toast.warning('Sync Warning', 'Video generated but failed to save to database.');
            }
          }

          toast.success('Video Generated!', `Duration: ${result.duration}s`);
          NotificationService.notifyGenerated(
            data.slides[0]?.headline || 'Untitled Project',
            1
          );
        } else {
          toast.error('Generation Failed', result.error || 'Unknown error');
        }
      } 
      // Handle images response
      else {
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
              if (currentDraftId) {
                // Update existing draft
                await postsService.updatePost(currentDraftId, {
                  title: data.slides[0]?.headline || 'Untitled Project',
                  status: 'generated',
                  project_data: data,
                  generated_images: result.imageUrls,
                });
              } else {
                // Create new post
                const newPost = await postsService.saveDraft({
                  title: data.slides[0]?.headline || 'Untitled Project',
                  status: 'generated',
                  project_data: data,
                  generated_images: result.imageUrls,
                });
                if (newPost && newPost.id !== currentDraftId) {
                  setCurrentDraftId(newPost.id);
                  router.replace(`/editor?draft=${newPost.id}`, { scroll: false });
                }
              }
            } catch (dbError) {
              console.error('Failed to save to database:', dbError);
              toast.warning('Sync Warning', 'Images generated but failed to save to database.');
            }
          }

          toast.success('Generation Complete!', `${result.imageUrls.length} image(s) created.`);
          NotificationService.notifyGenerated(
            data.slides[0]?.headline || 'Untitled Project',
            result.imageUrls.length
          );
        } else {
          toast.error('Generation Failed', result.error || 'Unknown error');
        }
      }
    } catch (e) {
      toast.error('Generation Error', String(e));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!user?.id) {
      toast.warning('Login Required', 'Please log in to save drafts');
      return;
    }
    setIsSaving(true);
    try {
      const postsService = new PostsService(nhost);

      if (currentDraftId) {
        // Update existing draft
        const success = await postsService.updatePost(currentDraftId, {
          title: data.slides[0]?.headline || 'Untitled Project',
          status: 'draft',
          project_data: data,
          generated_images: generatedUrls.length > 0 ? generatedUrls : [],
        });
        if (success) {
          initialDataRef.current = JSON.stringify(data);
          setHasUnsavedChanges(false);
          toast.success('Draft Updated', 'Your changes have been saved.');
          NotificationService.notifySaved(data.slides[0]?.headline || 'Untitled Project');
        } else {
          toast.error('Update Failed', 'Failed to update draft');
        }
      } else {
        // Create new draft
        const result = await postsService.saveDraft({
          title: data.slides[0]?.headline || 'Untitled Project',
          status: 'draft',
          project_data: data,
          generated_images: generatedUrls.length > 0 ? generatedUrls : undefined,
        });
        if (result) {
          setCurrentDraftId(result.id);
          initialDataRef.current = JSON.stringify(data);
          setHasUnsavedChanges(false);
          // Update URL without reload
          router.replace(`/editor?draft=${result.id}`, { scroll: false });
          toast.success('Draft Saved', 'Your project has been saved.');
          NotificationService.notifySaved(data.slides[0]?.headline || 'Untitled Project');
        } else {
          toast.error('Save Failed', 'Failed to save draft');
        }
      }
    } catch (e) {
      console.error('Error saving draft:', e);
      toast.error('Save Error', String(e));
    } finally {
      setIsSaving(false);
    }
  };

  // Show loading while checking auth or loading draft
  if (isLoading || isLoadingDraft) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center flex-col gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
        {isLoadingDraft && <span className="text-neutral-500 text-sm">Loading draft...</span>}
      </div>
    );
  }

  // Don't render if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const handleDuplicateSlide = (index: number) => {
    const slideToDuplicate = data.slides[index];
    const newSlide = { ...slideToDuplicate, id: `slide-${Date.now()}` };
    const newSlides = [...data.slides];
    newSlides.splice(index + 1, 0, newSlide);
    setData({ ...data, slides: newSlides });
    setActiveSlideIndex(index + 1);
  };

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
            initialTab={initialTab}
            slideCount={data.slides.length}
          />
        </div>

        <main className="flex-1 relative flex flex-col min-w-0 bg-neutral-950">
          <div className="flex items-center justify-between px-6 py-3 border-b border-neutral-800 bg-neutral-900/50 backdrop-blur-sm z-10">
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-widest">
                Canvas
              </span>

              {/* Undo/Redo Buttons */}
              <div className="flex items-center gap-1 border-l border-neutral-700 pl-4">
                <button
                  onClick={undo}
                  disabled={!canUndo}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Undo (Ctrl+Z)"
                >
                  <Undo2 size={16} />
                </button>
                <button
                  onClick={redo}
                  disabled={!canRedo}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-800 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  title="Redo (Ctrl+Shift+Z)"
                >
                  <Redo2 size={16} />
                </button>
              </div>

              {/* Save Status Indicator */}
              <div className={`flex items-center gap-1.5 text-xs ${hasUnsavedChanges ? 'text-yellow-500' : 'text-green-500'}`}>
                {hasUnsavedChanges ? (
                  <>
                    <CloudOff size={14} />
                    <span>Unsaved changes</span>
                  </>
                ) : (
                  <>
                    <Cloud size={14} />
                    <span>Saved</span>
                  </>
                )}
              </div>
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
            <PreviewPanel
              project={data}
              slide={activeSlide}
              onSmallTitlePositionChange={(position: TextPosition) => updateProject({ smallTitlePosition: position })}
              onTextBoxPositionChange={(position: TextPosition) => updateProject({
                textBoxSettings: { ...data.textBoxSettings, position }
              })}
              onSlideChange={updateActiveSlide}
              zoom={zoom}
            />

            {/* Zoom Controls */}
            <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-neutral-900/90 backdrop-blur-sm rounded-lg border border-neutral-700 p-1">
              <button
                onClick={() => setZoom(Math.max(0.2, zoom - 0.05))}
                className="p-2 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                title="Zoom Out"
              >
                <ZoomOut size={16} />
              </button>
              <span className="px-2 text-xs text-neutral-400 min-w-[50px] text-center font-medium">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom(Math.min(1, zoom + 0.05))}
                className="p-2 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                title="Zoom In"
              >
                <ZoomIn size={16} />
              </button>
              <div className="w-px h-5 bg-neutral-700 mx-1" />
              <button
                onClick={() => setZoom(0.38)}
                className="p-2 rounded-md text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
                title="Reset Zoom"
              >
                <RotateCcw size={16} />
              </button>
            </div>
          </div>

          {/* Bottom Timeline */}
          <StoryTimeline
            slides={data.slides}
            activeSlideIndex={activeSlideIndex}
            onSelectSlide={setActiveSlideIndex}
            onUpdateSlide={updateSlideAtIndex}
            onAddSlide={handleAddSlide}
            onRemoveSlide={handleRemoveSlide}
            onDuplicateSlide={handleDuplicateSlide}
          />
        </main>
      </div>
    </div>
  );
}
