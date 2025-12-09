import { useState, useEffect, useCallback } from 'react';
import { DesignTemplate, ProjectData } from '@/types';

const TEMPLATES_STORAGE_KEY = 'cardnews_templates';

// Default templates
const DEFAULT_TEMPLATES: DesignTemplate[] = [
  {
    id: 'default-minimal',
    name: '미니멀',
    createdAt: new Date().toISOString(),
    canvasSize: '4:5',
    showDate: false,
    showSmallTitle: false,
    smallTitlePosition: 'top-left',
    showHeadline: true,
    showTags: false,
    enableOverlay: false,
    overlayOpacity: 30,
    enableTextBackground: false,
    fontSettings: {
      fontFamily: 'Pretendard, sans-serif',
      smallTitleFontSize: 24,
      headlineFontSize: 48,
      tagsFontSize: 20,
      fontColor: '#FFFFFF',
      fontWeight: 'medium',
    },
    textBoxSettings: {
      style: 'none',
      position: 'bottom-left',
      backgroundColor: '#000000',
      backgroundOpacity: 0,
      gradientEndColor: '#FFFFFF',
      borderColor: '#FFFFFF',
      borderWidth: 0,
      borderRadius: 0,
      padding: 24,
    },
    logoSrc: null,
    logoPosition: 'top-left',
  },
  {
    id: 'default-bold',
    name: '볼드',
    createdAt: new Date().toISOString(),
    canvasSize: '4:5',
    showDate: true,
    showSmallTitle: true,
    smallTitlePosition: 'top-left',
    showHeadline: true,
    showTags: true,
    enableOverlay: true,
    overlayOpacity: 40,
    enableTextBackground: true,
    fontSettings: {
      fontFamily: 'Pretendard, sans-serif',
      smallTitleFontSize: 28,
      headlineFontSize: 72,
      tagsFontSize: 28,
      fontColor: '#FFFFFF',
      fontWeight: 'extrabold',
    },
    textBoxSettings: {
      style: 'solid',
      position: 'bottom-left',
      backgroundColor: '#000000',
      backgroundOpacity: 90,
      gradientEndColor: '#FFFFFF',
      borderColor: '#FFFFFF',
      borderWidth: 0,
      borderRadius: 16,
      padding: 32,
    },
    logoSrc: null,
    logoPosition: 'top-left',
  },
  {
    id: 'default-gradient',
    name: '그라데이션',
    createdAt: new Date().toISOString(),
    canvasSize: '4:5',
    showDate: false,
    showSmallTitle: true,
    smallTitlePosition: 'top-center',
    showHeadline: true,
    showTags: true,
    enableOverlay: false,
    overlayOpacity: 30,
    enableTextBackground: true,
    fontSettings: {
      fontFamily: 'Pretendard, sans-serif',
      smallTitleFontSize: 24,
      headlineFontSize: 56,
      tagsFontSize: 24,
      fontColor: '#FFFFFF',
      fontWeight: 'bold',
    },
    textBoxSettings: {
      style: 'gradient',
      position: 'bottom-center',
      backgroundColor: '#6366F1',
      backgroundOpacity: 85,
      gradientEndColor: '#EC4899',
      borderColor: '#FFFFFF',
      borderWidth: 0,
      borderRadius: 24,
      padding: 28,
    },
    logoSrc: null,
    logoPosition: 'top-right',
  },
  {
    id: 'default-outline',
    name: '아웃라인',
    createdAt: new Date().toISOString(),
    canvasSize: '4:5',
    showDate: true,
    showSmallTitle: true,
    smallTitlePosition: 'top-left',
    showHeadline: true,
    showTags: true,
    enableOverlay: false,
    overlayOpacity: 30,
    enableTextBackground: true,
    fontSettings: {
      fontFamily: 'Pretendard, sans-serif',
      smallTitleFontSize: 22,
      headlineFontSize: 52,
      tagsFontSize: 22,
      fontColor: '#FFFFFF',
      fontWeight: 'semibold',
    },
    textBoxSettings: {
      style: 'outline',
      position: 'middle-center',
      backgroundColor: '#000000',
      backgroundOpacity: 50,
      gradientEndColor: '#FFFFFF',
      borderColor: '#FFFFFF',
      borderWidth: 3,
      borderRadius: 0,
      padding: 32,
    },
    logoSrc: null,
    logoPosition: 'top-left',
  },
];

export function useTemplates() {
  const [templates, setTemplates] = useState<DesignTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load templates from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(TEMPLATES_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setTemplates([...DEFAULT_TEMPLATES, ...parsed]);
      } else {
        setTemplates(DEFAULT_TEMPLATES);
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
      setTemplates(DEFAULT_TEMPLATES);
    }
    setIsLoading(false);
  }, []);

  // Save custom templates to localStorage
  const saveToStorage = useCallback((customTemplates: DesignTemplate[]) => {
    try {
      localStorage.setItem(TEMPLATES_STORAGE_KEY, JSON.stringify(customTemplates));
    } catch (error) {
      console.error('Failed to save templates:', error);
    }
  }, []);

  // Save current project settings as a new template
  const saveTemplate = useCallback((name: string, project: ProjectData): DesignTemplate => {
    const newTemplate: DesignTemplate = {
      id: `custom-${Date.now()}`,
      name,
      createdAt: new Date().toISOString(),
      canvasSize: project.canvasSize,
      showDate: project.showDate,
      showSmallTitle: project.showSmallTitle,
      smallTitlePosition: project.smallTitlePosition,
      showHeadline: project.showHeadline,
      showTags: project.showTags,
      enableOverlay: project.enableOverlay,
      overlayOpacity: project.overlayOpacity,
      enableTextBackground: project.enableTextBackground,
      fontSettings: { ...project.fontSettings },
      textBoxSettings: { ...project.textBoxSettings },
      logoSrc: project.logoSrc,
      logoPosition: project.logoPosition,
    };

    setTemplates(prev => {
      const customTemplates = prev.filter(t => t.id.startsWith('custom-'));
      const updated = [...customTemplates, newTemplate];
      saveToStorage(updated);
      return [...DEFAULT_TEMPLATES, ...updated];
    });

    return newTemplate;
  }, [saveToStorage]);

  // Delete a custom template
  const deleteTemplate = useCallback((id: string) => {
    if (id.startsWith('default-')) {
      console.warn('Cannot delete default templates');
      return;
    }

    setTemplates(prev => {
      const customTemplates = prev.filter(t => t.id.startsWith('custom-') && t.id !== id);
      saveToStorage(customTemplates);
      return [...DEFAULT_TEMPLATES, ...customTemplates];
    });
  }, [saveToStorage]);

  // Apply template to project (returns partial ProjectData)
  const applyTemplate = useCallback((template: DesignTemplate): Partial<ProjectData> => {
    return {
      canvasSize: template.canvasSize,
      showDate: template.showDate,
      showSmallTitle: template.showSmallTitle,
      smallTitlePosition: template.smallTitlePosition,
      showHeadline: template.showHeadline,
      showTags: template.showTags,
      enableOverlay: template.enableOverlay,
      overlayOpacity: template.overlayOpacity,
      enableTextBackground: template.enableTextBackground,
      fontSettings: { ...template.fontSettings },
      textBoxSettings: { ...template.textBoxSettings },
      logoSrc: template.logoSrc,
      logoPosition: template.logoPosition,
    };
  }, []);

  return {
    templates,
    isLoading,
    saveTemplate,
    deleteTemplate,
    applyTemplate,
    defaultTemplates: DEFAULT_TEMPLATES,
    customTemplates: templates.filter(t => t.id.startsWith('custom-')),
  };
}
