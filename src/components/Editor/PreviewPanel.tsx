import React from 'react';
import { ProjectData, SlideData } from '@/types';
import { CardNewsV1 } from '@/components/Templates/CardNewsV1';

const ScaleContainer = ({ children, scale }: { children: React.ReactNode, scale: number }) => (
  <div style={{ transform: `scale(${scale})`, transformOrigin: 'center center' }} className="shadow-2xl">
    {children}
  </div>
);

interface PreviewPanelProps {
  project: ProjectData;
  slide: SlideData;
}

export function PreviewPanel({ project, slide }: PreviewPanelProps) {
  // Merge Project Global Styles + Slide Content for the Template
  const templateData = {
    ...slide,
    showDate: project.showDate,
    showHeadline: project.showHeadline,
    showTags: project.showTags,
    enableOverlay: project.enableOverlay,
    overlayOpacity: project.overlayOpacity,
    enableTextBackground: project.enableTextBackground,
    templateType: project.templateType,
    logoSrc: project.logoSrc,
    logoPosition: project.logoPosition,
    fontSettings: project.fontSettings,
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

  return (
    <ScaleContainer scale={0.38}>
      <div style={{ width: 1080, height, transition: 'height 0.3s ease' }} className="bg-white shadow-2xl">
          <CardNewsV1 data={templateData} />
      </div>
    </ScaleContainer>
  );
}
