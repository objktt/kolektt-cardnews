import React, { useRef, useState, useCallback } from 'react';
import { ProjectData, SlideData, TextPosition } from '@/types';
import { CardNewsV1 } from '@/components/Templates/CardNewsV1';

const ScaleContainer = ({ children, scale }: { children: React.ReactNode, scale: number }) => (
  <div style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }} className="shadow-2xl">
    {children}
  </div>
);

interface PreviewPanelProps {
  project: ProjectData;
  slide: SlideData;
  onSmallTitlePositionChange?: (position: TextPosition) => void;
}

// Snap position calculation based on coordinates
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

export function PreviewPanel({ project, slide, onSmallTitlePositionChange }: PreviewPanelProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);

  // Check if small title should be shown with draggable overlay
  const hasSmallTitleDrag = onSmallTitlePositionChange && project.showSmallTitle !== false && slide.smallTitle;

  // Merge Project Global Styles + Slide Content for the Template
  // Hide small title in template when draggable overlay is active (to avoid duplicate)
  const templateData = {
    ...slide,
    showDate: project.showDate,
    showSmallTitle: hasSmallTitleDrag ? false : project.showSmallTitle,
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

  // Calculate Height based on Aspect Ratio (Base Width: 1080px)
  const getHeight = () => {
    switch (project.canvasSize) {
        case '1:1': return 1080;
        case '9:16': return 1920;
        case '4:5': default: return 1350;
    }
  };
  const height = getHeight();
  const scale = 0.38;

  // Handle drag start
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!onSmallTitlePositionChange || !containerRef.current) return;
    setIsDragging(true);
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    setDragPosition({ x, y });
  }, [onSmallTitlePositionChange, scale]);

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
    if (!isDragging || !dragPosition || !onSmallTitlePositionChange) {
      setIsDragging(false);
      setDragPosition(null);
      return;
    }
    const newPosition = getSnapPosition(dragPosition.x, dragPosition.y, 1080, height);
    onSmallTitlePositionChange(newPosition);
    setIsDragging(false);
    setDragPosition(null);
  }, [isDragging, dragPosition, height, onSmallTitlePositionChange]);

  // Show small title and allow dragging
  const showSmallTitle = project.showSmallTitle !== false && slide.smallTitle;

  return (
    <ScaleContainer scale={scale}>
      <div
        ref={containerRef}
        style={{ width: 1080, height, transition: 'height 0.3s ease' }}
        className="bg-white shadow-2xl relative"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <CardNewsV1 data={templateData} />

        {/* Draggable overlay for small title */}
        {showSmallTitle && onSmallTitlePositionChange && (
          <div
            className="absolute inset-0 z-20"
            style={{ padding: '60px' }}
          >
            {/* Snap grid indicators */}
            {isDragging && (
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none" style={{ padding: '60px' }}>
                {Array.from({ length: 9 }).map((_, i) => (
                  <div
                    key={i}
                    className="border border-dashed border-white/30 flex items-center justify-center"
                  >
                    <div className="w-3 h-3 rounded-full bg-white/20" />
                  </div>
                ))}
              </div>
            )}

            {/* Draggable small title handle */}
            <div
              className={`absolute cursor-move transition-all ${isDragging ? 'opacity-70' : 'hover:ring-2 hover:ring-indigo-500 hover:ring-offset-2 rounded'}`}
              style={{
                ...(dragPosition ? {
                  left: dragPosition.x - 50,
                  top: dragPosition.y - 20,
                } : getSmallTitleAbsolutePosition(project.smallTitlePosition || 'top-left', 1080, height)),
                padding: '8px 16px',
                pointerEvents: 'auto',
              }}
              onMouseDown={handleMouseDown}
            >
              <span
                className="drop-shadow-md select-none"
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
            </div>
          </div>
        )}
      </div>
    </ScaleContainer>
  );
}

// Helper to get absolute position from TextPosition
function getSmallTitleAbsolutePosition(position: TextPosition, width: number, height: number) {
  const padding = 60;
  const [vertical, horizontal] = position.split('-') as [string, string];

  let left: number | 'auto' = 'auto';
  let right: number | 'auto' = 'auto';
  let top: number | 'auto' = 'auto';
  let bottom: number | 'auto' = 'auto';

  switch (horizontal) {
    case 'left': left = padding; break;
    case 'center': left = width / 2; break;
    case 'right': right = padding; break;
  }

  switch (vertical) {
    case 'top': top = padding; break;
    case 'middle': top = height / 2; break;
    case 'bottom': bottom = padding; break;
  }

  return {
    left: left !== 'auto' ? left : undefined,
    right: right !== 'auto' ? right : undefined,
    top: top !== 'auto' ? top : undefined,
    bottom: bottom !== 'auto' ? bottom : undefined,
    transform: horizontal === 'center' ? 'translateX(-50%)' : undefined,
  };
}
