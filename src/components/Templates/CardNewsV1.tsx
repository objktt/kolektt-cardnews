import React from 'react';
import { ProjectData, SlideData, INITIAL_FONT_SETTINGS } from '@/types';

type TemplateData = SlideData & Partial<ProjectData>;

const FONT_WEIGHT_MAP: Record<string, number> = {
  'normal': 400,
  'medium': 500,
  'semibold': 600,
  'bold': 700,
  'extrabold': 800,
};

export function CardNewsV1({ data }: { data: TemplateData }) {
  // Safe date formatting
  const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit' });

  // Font settings with fallback
  const fontSettings = data.fontSettings || INITIAL_FONT_SETTINGS;
  const fontWeight = FONT_WEIGHT_MAP[fontSettings.fontWeight] || 700;

  return (
    <div id="card-template" className="relative w-full h-full bg-black text-white overflow-hidden">
      {/* Background Image */}
      {data.imageSrc ? (
        <img 
          src={data.imageSrc} 
          alt="Background" 
          className="absolute inset-0 w-full h-full object-cover" 
        />
      ) : (
        <div className="absolute inset-0 bg-neutral-800 flex items-center justify-center">
            <span className="text-4xl text-neutral-600">No Image</span>
        </div>
      )}

      {/* Overlay (Optional) */}
      {data.enableOverlay && (
        <div 
            className="absolute inset-0 bg-black" 
            style={{ opacity: (data.overlayOpacity || 30) / 100 }} 
        />
      )}

      {/* Logo (Optional) */}
      {data.logoSrc && (
        <img 
            src={data.logoSrc} 
            alt="Logo" 
            className={`absolute z-20 w-[180px] object-contain drop-shadow-md
                ${data.logoPosition === 'top-left' ? 'top-[60px] left-[60px]' : ''}
                ${data.logoPosition === 'top-right' ? 'top-[60px] right-[60px]' : ''}
                ${data.logoPosition === 'bottom-right' ? 'bottom-[60px] right-[60px]' : ''}
                ${data.logoPosition === 'bottom-center' ? 'bottom-[60px] left-1/2 -translate-x-1/2' : ''}
            `}
        />
      )}

      {/* Content Layer */}
      <div className="absolute inset-0 flex flex-col justify-between text-white" 
           style={{ padding: '120px 60px 140px 60px' }}>
        
        {/* Top: Date (Optional) */}
        <div className="w-full flex justify-between items-start h-[30px]">
             {data.showDate && (
                 <span className="text-[20px] font-medium tracking-wide opacity-90 drop-shadow-md">
                    {today}
                 </span>
             )}
        </div>
        
        {/* Bottom: Headline + Tags */}
        {(data.showHeadline !== false || data.showTags !== false) && (
          <div className={`flex flex-col gap-8 items-start w-full`}>

            {/* Headline Group */}
            <div className={`flex flex-col gap-6 w-full ${data.enableTextBackground ? 'bg-black/60 backdrop-blur-sm p-8 rounded-xl -ml-8 pr-12' : ''}`}>
              {data.showHeadline !== false && (
                <h1 className="leading-[1.1] whitespace-pre-wrap line-clamp-3 overflow-hidden text-ellipsis drop-shadow-lg"
                    style={{
                      fontSize: `${fontSettings.headlineFontSize}px`,
                      fontFamily: fontSettings.fontFamily,
                      fontWeight: fontWeight,
                      color: fontSettings.fontColor,
                    }}>
                    {data.headline || "Headline\nGoes Here"}
                </h1>
              )}

              {/* Tags */}
              {data.showTags !== false && data.tags && data.tags.length > 0 && (
                <div className="flex flex-wrap gap-x-4 gap-y-2">
                    {data.tags.map((tag: string, i: number) => (
                        <span key={i} className="opacity-100 drop-shadow-md"
                            style={{
                              fontSize: `${fontSettings.tagsFontSize}px`,
                              fontFamily: fontSettings.fontFamily,
                              fontWeight: fontWeight,
                              color: fontSettings.fontColor,
                            }}>
                            #{tag}
                        </span>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
