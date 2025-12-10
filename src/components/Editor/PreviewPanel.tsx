import React, { useRef, useState, useCallback, useEffect } from 'react';
import { ProjectData, SlideData, TextPosition, TextBoxSettings, INITIAL_TEXT_BOX_SETTINGS } from '@/types';
import { CardNewsV1 } from '@/components/Templates/CardNewsV1';
import { Move, Type } from 'lucide-react';

const ScaleContainer = ({ children, scale }: { children: React.ReactNode, scale: number }) => (
  <div style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }} className="shadow-2xl">
    {children}
  </div>
);

// Get text box style (same as CardNewsV1)
const getTextBoxStyles = (settings: TextBoxSettings) => {
  const bgOpacityHex = Math.round(settings.backgroundOpacity * 2.55).toString(16).padStart(2, '0');

  // Base styles without border (only padding and radius)
  const baseStyles: React.CSSProperties = {
    padding: `${settings.padding}px`,
    borderRadius: `${settings.borderRadius}px`,
  };

  switch (settings.style) {
    case 'none':
      return {};
    case 'solid':
      // 단색: background only, no border
      return {
        ...baseStyles,
        backgroundColor: `${settings.backgroundColor}${bgOpacityHex}`,
      };
    case 'outline':
      // 테두리: background + border
      return {
        ...baseStyles,
        backgroundColor: settings.backgroundOpacity > 0
          ? `${settings.backgroundColor}${bgOpacityHex}`
          : 'transparent',
        border: `${settings.borderWidth}px solid ${settings.borderColor}`,
      };
    case 'gradient':
      // 그라데이션: start + end color, no border
      const endColor = settings.gradientEndColor || '#FFFFFF';
      return {
        ...baseStyles,
        background: `linear-gradient(135deg, ${settings.backgroundColor}${bgOpacityHex}, ${endColor}${bgOpacityHex})`,
      };
    case 'blur':
      // 블러: background only, no border
      return {
        ...baseStyles,
        backgroundColor: `${settings.backgroundColor}${bgOpacityHex}`,
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      };
    default:
      return baseStyles;
  }
};

interface PreviewPanelProps {
  project: ProjectData;
  slide: SlideData;
  onSmallTitlePositionChange?: (position: TextPosition) => void;
  onTextBoxPositionChange?: (position: TextPosition) => void;
  onSlideChange?: (data: Partial<SlideData>) => void;
  zoom?: number;
}

type EditableElement = 'smallTitle' | 'headline' | 'textBox' | null;

// Position grid for snap
const POSITION_GRID: TextPosition[] = [
  'top-left', 'top-center', 'top-right',
  'middle-left', 'middle-center', 'middle-right',
  'bottom-left', 'bottom-center', 'bottom-right',
];

// Get position from coordinates
const getSnapPosition = (x: number, y: number, width: number, height: number): TextPosition => {
  const xRatio = x / width;
  const yRatio = y / height;

  let horizontal: 'left' | 'center' | 'right';
  let vertical: 'top' | 'middle' | 'bottom';

  if (xRatio < 0.33) horizontal = 'left';
  else if (xRatio < 0.67) horizontal = 'center';
  else horizontal = 'right';

  if (yRatio < 0.33) vertical = 'top';
  else if (yRatio < 0.67) vertical = 'middle';
  else vertical = 'bottom';

  return `${vertical}-${horizontal}` as TextPosition;
};

// Get position styles based on TextPosition
const getPositionStyles = (position: TextPosition, canvasWidth: number, canvasHeight: number, verticalOffset: number = 0) => {
  const [vertical, horizontal] = position.split('-') as [string, string];
  const padding = 60;
  const contentPadding = 40; // Additional padding for content

  // Calculate available movement range based on position
  // Each position has a defined range it can move within
  const topZone = { min: padding, max: canvasHeight * 0.33 };
  const middleZone = { min: canvasHeight * 0.25, max: canvasHeight * 0.75 };
  const bottomZone = { min: canvasHeight * 0.67, max: canvasHeight - padding };

  // Calculate position and transform based on horizontal alignment
  let left: number | undefined;
  let right: number | undefined;
  let transformX = '0';
  let textAlign: 'left' | 'center' | 'right' = 'left';
  let maxWidth: number;

  switch (horizontal) {
    case 'left':
      left = padding;
      transformX = '0';
      textAlign = 'left';
      maxWidth = canvasWidth - padding * 2 - contentPadding;
      break;
    case 'center':
      left = canvasWidth / 2;
      transformX = '-50%';
      textAlign = 'center';
      maxWidth = canvasWidth - padding * 2;
      break;
    case 'right':
      right = padding;
      transformX = '0';
      textAlign = 'right';
      maxWidth = canvasWidth - padding * 2 - contentPadding;
      break;
    default:
      left = padding;
      transformX = '0';
      textAlign = 'left';
      maxWidth = canvasWidth - padding * 2;
  }

  // Calculate vertical position and transform
  let top: number | undefined;
  let bottom: number | undefined;
  let transformY = '0';

  switch (vertical) {
    case 'top': {
      // Offset moves within top zone (padding to 33% of canvas)
      // Negative offset = move down, Positive offset = move up
      const range = topZone.max - topZone.min;
      const offsetPx = (-verticalOffset / 100) * range;
      top = Math.max(topZone.min, Math.min(topZone.max, padding + offsetPx));
      transformY = '0';
      break;
    }
    case 'middle': {
      // Offset moves within middle zone (25% to 75% of canvas)
      // Negative offset = move down, Positive offset = move up
      const range = middleZone.max - middleZone.min;
      const offsetPx = (-verticalOffset / 100) * range;
      top = Math.max(middleZone.min, Math.min(middleZone.max, canvasHeight / 2 + offsetPx));
      transformY = '-50%';
      break;
    }
    case 'bottom': {
      // Offset moves within bottom zone (67% to padding from bottom)
      // Negative offset = move down, Positive offset = move up
      // Note: For CSS 'bottom', larger value = higher position, so we subtract offsetPx
      const range = bottomZone.max - bottomZone.min;
      const offsetPx = (-verticalOffset / 100) * range;
      bottom = Math.max(padding, Math.min(canvasHeight - bottomZone.min, padding - offsetPx));
      transformY = '0';
      break;
    }
    default: {
      const range = topZone.max - topZone.min;
      const offsetPx = (-verticalOffset / 100) * range;
      top = Math.max(topZone.min, Math.min(topZone.max, padding + offsetPx));
      transformY = '0';
    }
  }

  return {
    left,
    right,
    top,
    bottom,
    transform: `translate(${transformX}, ${transformY})`,
    textAlign,
    maxWidth,
    horizontal,
    vertical,
  };
};

export function PreviewPanel({
  project,
  slide,
  onSmallTitlePositionChange,
  onTextBoxPositionChange,
  onSlideChange,
  zoom = 0.38
}: PreviewPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedElement, setSelectedElement] = useState<EditableElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);
  const [editingText, setEditingText] = useState<'smallTitle' | 'headline' | null>(null);
  const [editValue, setEditValue] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Merge Project Global Styles + Slide Content for the Template
  const templateData = {
    ...slide,
    showDate: project.showDate,
    showSmallTitle: project.showSmallTitle,
    smallTitlePosition: project.smallTitlePosition,
    showHeadline: project.showHeadline,
    showTags: project.showTags,
    enableOverlay: project.enableOverlay,
    overlayOpacity: project.overlayOpacity,
    enableTextBackground: project.enableTextBackground,
    templateType: project.templateType,
    logoSrc: project.logoSrc,
    logoPosition: project.logoPosition,
    fontSettings: project.fontSettings,
    textBoxSettings: project.textBoxSettings,
    caption: slide.caption || '',
  };

  // Calculate Height based on Aspect Ratio
  const getHeight = () => {
    switch (project.canvasSize) {
      case '1:1': return 1080;
      case '9:16': return 1920;
      case '4:5': default: return 1350;
    }
  };
  const height = getHeight();
  const scale = zoom;

  // Focus input when editing
  useEffect(() => {
    if (editingText && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingText]);

  // Handle click outside to deselect
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setSelectedElement(null);
        if (editingText) {
          handleSaveEdit();
        }
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [editingText, editValue]);

  // Handle element click
  const handleElementClick = (element: EditableElement, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedElement(element);
  };

  // Handle double click to edit
  const handleElementDoubleClick = (element: 'smallTitle' | 'headline', e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingText(element);
    setEditValue(element === 'smallTitle' ? slide.smallTitle : slide.headline);
  };

  // Save edited text
  const handleSaveEdit = () => {
    if (editingText && onSlideChange) {
      onSlideChange({ [editingText]: editValue });
    }
    setEditingText(null);
    setEditValue('');
  };

  // Handle key press in edit mode
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    }
    if (e.key === 'Escape') {
      setEditingText(null);
      setEditValue('');
    }
  };

  // Handle drag start
  const handleDragStart = (element: 'smallTitle' | 'textBox', e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!containerRef.current) return;

    setIsDragging(true);
    setSelectedElement(element);
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    setDragPosition({ x, y });
  };

  // Handle drag move
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    setDragPosition({ x, y });
  }, [isDragging, scale]);

  // Handle drag end
  const handleMouseUp = useCallback(() => {
    if (!isDragging || !dragPosition) {
      setIsDragging(false);
      setDragPosition(null);
      return;
    }

    const newPosition = getSnapPosition(dragPosition.x, dragPosition.y, 1080, height);

    if (selectedElement === 'smallTitle' && onSmallTitlePositionChange) {
      onSmallTitlePositionChange(newPosition);
    } else if (selectedElement === 'textBox' && onTextBoxPositionChange) {
      onTextBoxPositionChange(newPosition);
    }

    setIsDragging(false);
    setDragPosition(null);
  }, [isDragging, dragPosition, height, selectedElement, onSmallTitlePositionChange, onTextBoxPositionChange]);

  // Get position styles for small title and text box
  const smallTitleStyles = getPositionStyles(project.smallTitlePosition || 'top-left', 1080, height, project.smallTitleVerticalOffset || 0);
  const textBoxPositionStyles = getPositionStyles(project.textBoxSettings?.position || 'bottom-left', 1080, height, project.textBoxSettings?.verticalOffset || 0);

  // Get text box visual styles (background, border, blur, etc.)
  const textBoxSettings = project.textBoxSettings || INITIAL_TEXT_BOX_SETTINGS;
  const textBoxVisualStyles = project.enableTextBackground ? getTextBoxStyles(textBoxSettings) : {};

  return (
    <ScaleContainer scale={scale}>
      <div
        ref={containerRef}
        style={{ width: 1080, height, transition: 'height 0.3s ease' }}
        className="bg-white shadow-2xl relative"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={() => setSelectedElement(null)}
      >
        {/* Render the template (hide text elements - they're rendered in the interactive overlay) */}
        <CardNewsV1 data={{
          ...templateData,
          showSmallTitle: false,
          showHeadline: false,
          showTags: false,
        }} />

        {/* Interactive Overlay */}
        <div className="absolute inset-0 z-30 pointer-events-none">

          {/* Snap Grid (visible when dragging) */}
          {isDragging && (
            <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none" style={{ padding: '60px' }}>
              {POSITION_GRID.map((pos) => {
                const currentPos = dragPosition ? getSnapPosition(dragPosition.x, dragPosition.y, 1080, height) : null;
                const isActive = currentPos === pos;
                return (
                  <div
                    key={pos}
                    className={`border border-dashed flex items-center justify-center transition-colors ${
                      isActive ? 'border-indigo-400 bg-indigo-500/10' : 'border-white/20'
                    }`}
                  >
                    <div className={`w-3 h-3 rounded-full transition-colors ${
                      isActive ? 'bg-indigo-400' : 'bg-white/20'
                    }`} />
                  </div>
                );
              })}
            </div>
          )}

          {/* Small Title Interactive Element */}
          {project.showSmallTitle !== false && slide.smallTitle && (
            <div
              className={`absolute pointer-events-auto cursor-move transition-all ${
                selectedElement === 'smallTitle' ? 'ring-2 ring-indigo-500 ring-offset-2 rounded' : ''
              } ${isDragging && selectedElement === 'smallTitle' ? 'opacity-70' : 'hover:ring-2 hover:ring-indigo-500/50 hover:ring-offset-1 rounded'}`}
              style={{
                left: smallTitleStyles.left,
                right: smallTitleStyles.right,
                top: smallTitleStyles.top,
                bottom: smallTitleStyles.bottom,
                transform: smallTitleStyles.transform,
                textAlign: smallTitleStyles.textAlign,
                maxWidth: smallTitleStyles.maxWidth,
                padding: '8px 16px',
              }}
              onClick={(e) => handleElementClick('smallTitle', e)}
              onDoubleClick={(e) => handleElementDoubleClick('smallTitle', e)}
              onMouseDown={(e) => handleDragStart('smallTitle', e)}
            >
              {editingText === 'smallTitle' ? (
                <textarea
                  ref={inputRef}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="bg-transparent border-none outline-none resize-none drop-shadow-md w-full"
                  style={{
                    fontSize: `${project.fontSettings.smallTitleFontSize}px`,
                    fontFamily: project.fontSettings.fontFamily,
                    fontWeight: project.fontSettings.fontWeight === 'normal' ? 400 :
                               project.fontSettings.fontWeight === 'medium' ? 500 :
                               project.fontSettings.fontWeight === 'semibold' ? 600 :
                               project.fontSettings.fontWeight === 'extrabold' ? 800 : 700,
                    color: project.fontSettings.fontColor,
                    textAlign: smallTitleStyles.textAlign,
                  }}
                  rows={1}
                />
              ) : (
                <span
                  className="drop-shadow-md select-none block"
                  style={{
                    fontSize: `${project.fontSettings.smallTitleFontSize}px`,
                    fontFamily: project.fontSettings.fontFamily,
                    fontWeight: project.fontSettings.fontWeight === 'normal' ? 400 :
                               project.fontSettings.fontWeight === 'medium' ? 500 :
                               project.fontSettings.fontWeight === 'semibold' ? 600 :
                               project.fontSettings.fontWeight === 'extrabold' ? 800 : 700,
                    color: project.fontSettings.fontColor,
                  }}
                >
                  {slide.smallTitle}
                </span>
              )}

              {/* Element Controls */}
              {selectedElement === 'smallTitle' && !editingText && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-neutral-900 rounded-lg px-2 py-1 shadow-lg whitespace-nowrap">
                  <Move size={12} className="text-neutral-400" />
                  <span className="text-[10px] text-neutral-400">Drag to move</span>
                  <div className="w-px h-3 bg-neutral-700 mx-1" />
                  <Type size={12} className="text-neutral-400" />
                  <span className="text-[10px] text-neutral-400">Double-click to edit</span>
                </div>
              )}
            </div>
          )}

          {/* Headline Interactive Element */}
          {project.showHeadline !== false && (
            <div
              className={`absolute pointer-events-auto transition-all ${
                selectedElement === 'headline' ? 'ring-2 ring-indigo-500 ring-offset-2 rounded' : ''
              } ${!isDragging ? 'hover:ring-2 hover:ring-indigo-500/50 hover:ring-offset-1 rounded cursor-text' : ''}`}
              style={{
                left: textBoxPositionStyles.left,
                right: textBoxPositionStyles.right,
                top: textBoxPositionStyles.top,
                bottom: textBoxPositionStyles.bottom,
                transform: textBoxPositionStyles.transform,
                textAlign: textBoxPositionStyles.textAlign,
                maxWidth: textBoxPositionStyles.maxWidth,
                // Apply text box visual styles (background, border, blur, etc.)
                ...textBoxVisualStyles,
              }}
              onClick={(e) => handleElementClick('headline', e)}
              onDoubleClick={(e) => handleElementDoubleClick('headline', e)}
            >
              {editingText === 'headline' ? (
                <textarea
                  ref={inputRef}
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="bg-transparent border-none outline-none resize-none drop-shadow-lg w-full"
                  style={{
                    fontSize: `${project.fontSettings.headlineFontSize}px`,
                    fontFamily: project.fontSettings.fontFamily,
                    fontWeight: project.fontSettings.fontWeight === 'normal' ? 400 :
                               project.fontSettings.fontWeight === 'medium' ? 500 :
                               project.fontSettings.fontWeight === 'semibold' ? 600 :
                               project.fontSettings.fontWeight === 'extrabold' ? 800 : 700,
                    color: project.fontSettings.fontColor,
                    lineHeight: 1.1,
                    textAlign: textBoxPositionStyles.textAlign,
                  }}
                  rows={3}
                />
              ) : (
                <>
                  <h1
                    className="leading-[1.1] whitespace-pre-wrap drop-shadow-lg select-none"
                    style={{
                      fontSize: `${project.fontSettings.headlineFontSize}px`,
                      fontFamily: project.fontSettings.fontFamily,
                      fontWeight: project.fontSettings.fontWeight === 'normal' ? 400 :
                                 project.fontSettings.fontWeight === 'medium' ? 500 :
                                 project.fontSettings.fontWeight === 'semibold' ? 600 :
                                 project.fontSettings.fontWeight === 'extrabold' ? 800 : 700,
                      color: project.fontSettings.fontColor,
                    }}
                  >
                    {slide.headline || "Headline Goes Here"}
                  </h1>
                  {/* Tags/Subtitle - positioned below headline */}
                  {project.showTags && slide.tags && slide.tags.length > 0 && (
                    <p
                      className="mt-4 drop-shadow-md select-none"
                      style={{
                        fontSize: `${Math.round(project.fontSettings.headlineFontSize * 0.4)}px`,
                        fontFamily: project.fontSettings.fontFamily,
                        fontWeight: project.fontSettings.fontWeight === 'normal' ? 400 :
                                   project.fontSettings.fontWeight === 'medium' ? 500 :
                                   project.fontSettings.fontWeight === 'semibold' ? 600 :
                                   project.fontSettings.fontWeight === 'extrabold' ? 800 : 700,
                        color: project.fontSettings.fontColor,
                        opacity: 0.8,
                      }}
                    >
                      {slide.tags.join(' · ')}
                    </p>
                  )}
                </>
              )}

              {/* Element Controls */}
              {selectedElement === 'headline' && !editingText && (
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-neutral-900 rounded-lg px-2 py-1 shadow-lg whitespace-nowrap">
                  <Type size={12} className="text-neutral-400" />
                  <span className="text-[10px] text-neutral-400">Double-click to edit</span>
                </div>
              )}
            </div>
          )}

          {/* Text Box Drag Handle (for moving the entire text box) */}
          {(project.showHeadline !== false || project.showTags !== false) && onTextBoxPositionChange && (
            <div
              className={`absolute pointer-events-auto cursor-move w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                selectedElement === 'textBox'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-neutral-900/80 text-neutral-400 hover:bg-indigo-500 hover:text-white'
              }`}
              style={{
                // Position drag handle based on alignment
                ...(textBoxPositionStyles.horizontal === 'left' ? { left: 60 + 920 } : {}),
                ...(textBoxPositionStyles.horizontal === 'center' ? { left: 1080 / 2 + 300 } : {}),
                ...(textBoxPositionStyles.horizontal === 'right' ? { right: 60 + 20 } : {}),
                ...(textBoxPositionStyles.vertical === 'top' ? { top: 60 } : {}),
                ...(textBoxPositionStyles.vertical === 'middle' ? { top: height / 2 - 50 } : {}),
                ...(textBoxPositionStyles.vertical === 'bottom' ? { bottom: 60 + 50 } : {}),
              }}
              onClick={(e) => handleElementClick('textBox', e)}
              onMouseDown={(e) => handleDragStart('textBox', e)}
              title="Drag to move text box"
            >
              <Move size={14} />
            </div>
          )}
        </div>
      </div>
    </ScaleContainer>
  );
}
