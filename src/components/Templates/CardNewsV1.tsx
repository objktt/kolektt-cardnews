import React from 'react';
import { ProjectData, SlideData, INITIAL_FONT_SETTINGS, INITIAL_TEXT_BOX_SETTINGS, TextPosition } from '@/types';

type TemplateData = SlideData & Partial<ProjectData>;

const FONT_WEIGHT_MAP: Record<string, number> = {
  'normal': 400,
  'medium': 500,
  'semibold': 600,
  'bold': 700,
  'extrabold': 800,
};

// Position mapping for the 3x3 grid
const getPositionStyles = (position: TextPosition) => {
  const [vertical, horizontal] = position.split('-') as [string, string];

  // Vertical alignment (cross axis in row flex → alignItems)
  const alignItems = {
    'top': 'flex-start',
    'middle': 'center',
    'bottom': 'flex-end',
  }[vertical] || 'flex-end';

  // Horizontal alignment (main axis in row flex → justifyContent)
  const justifyContent = {
    'left': 'flex-start',
    'center': 'center',
    'right': 'flex-end',
  }[horizontal] || 'flex-start';

  const textAlign = {
    'left': 'left' as const,
    'center': 'center' as const,
    'right': 'right' as const,
  }[horizontal] || 'left' as const;

  return { justifyContent, alignItems, textAlign };
};

// Get text box style
const getTextBoxStyles = (settings: typeof INITIAL_TEXT_BOX_SETTINGS) => {
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

export function CardNewsV1({ data }: { data: TemplateData }) {
  // Font settings with fallback
  const fontSettings = data.fontSettings || INITIAL_FONT_SETTINGS;
  const fontWeight = FONT_WEIGHT_MAP[fontSettings.fontWeight] || 700;

  // Text box settings with fallback
  const textBoxSettings = data.textBoxSettings || INITIAL_TEXT_BOX_SETTINGS;
  const positionStyles = getPositionStyles(textBoxSettings.position);
  const textBoxStyles = data.enableTextBackground ? getTextBoxStyles(textBoxSettings) : {};

  // Small title position (independent from text box)
  const smallTitlePosition = data.smallTitlePosition || 'top-left';
  const smallTitlePositionStyles = getPositionStyles(smallTitlePosition);

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

      {/* Small Title - Independent position */}
      {data.showSmallTitle !== false && data.smallTitle && (
        <div
          className="absolute inset-0 flex pointer-events-none z-10"
          style={{
            padding: '60px',
            justifyContent: smallTitlePositionStyles.justifyContent,
            alignItems: smallTitlePositionStyles.alignItems,
          }}
        >
          <span
            className="drop-shadow-md"
            style={{
              fontSize: `${fontSettings.smallTitleFontSize}px`,
              fontFamily: fontSettings.fontFamily,
              fontWeight: fontWeight,
              color: fontSettings.fontColor,
              textAlign: smallTitlePositionStyles.textAlign,
            }}
          >
            {data.smallTitle}
          </span>
        </div>
      )}

      {/* Content Layer - positioned based on textBoxSettings */}
      <div
        className="absolute inset-0 flex text-white pointer-events-none"
        style={{
          padding: '120px 60px 140px 60px',
          justifyContent: positionStyles.justifyContent,
          alignItems: positionStyles.alignItems,
        }}
      >
        {/* Headline + Tags - Inside text box */}
        {(data.showHeadline !== false || data.showTags !== false) && (
          <div
            className="flex flex-col gap-6 max-w-full pointer-events-auto"
            style={{
              ...textBoxStyles,
              textAlign: positionStyles.textAlign,
              alignItems: positionStyles.justifyContent, // flex-col: alignItems controls horizontal
            }}
          >
            {data.showHeadline !== false && (
              <h1
                className="leading-[1.1] whitespace-pre-wrap line-clamp-3 overflow-hidden text-ellipsis drop-shadow-lg"
                style={{
                  fontSize: `${fontSettings.headlineFontSize}px`,
                  fontFamily: fontSettings.fontFamily,
                  fontWeight: fontWeight,
                  color: fontSettings.fontColor,
                  textAlign: positionStyles.textAlign,
                }}
              >
                {data.headline || "Headline\nGoes Here"}
              </h1>
            )}

            {/* Tags */}
            {data.showTags !== false && data.tags && data.tags.length > 0 && (
              <div
                className="flex flex-wrap gap-x-4 gap-y-2"
                style={{ justifyContent: positionStyles.justifyContent }}
              >
                {data.tags.map((tag: string, i: number) => (
                  <span
                    key={i}
                    className="opacity-100 drop-shadow-md"
                    style={{
                      fontSize: `${fontSettings.tagsFontSize}px`,
                      fontFamily: fontSettings.fontFamily,
                      fontWeight: fontWeight,
                      color: fontSettings.fontColor,
                    }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
