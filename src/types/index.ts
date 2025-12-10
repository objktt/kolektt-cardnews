export interface SlideData {
  id: string;
  smallTitle: string;
  headline: string;
  tags: string[];
  imageSrc: string | null;
  caption: string; // Individual caption or combined? Usually one caption for IG post, but per-slide text is key. User said "text for each".
}

export interface FontSettings {
  fontFamily: string;
  smallTitleFontSize: number;
  headlineFontSize: number;
  tagsFontSize: number;
  fontColor: string;
  fontWeight: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
}

// Text Box Style
export type TextBoxStyle = 'none' | 'solid' | 'outline' | 'gradient' | 'blur';

export const TEXT_BOX_STYLES = [
  { value: 'none' as const, label: '없음', description: '배경 없음' },
  { value: 'solid' as const, label: '단색', description: '단색 배경' },
  { value: 'outline' as const, label: '테두리', description: '테두리만' },
  { value: 'gradient' as const, label: '그라데이션', description: '그라데이션 배경' },
  { value: 'blur' as const, label: '블러', description: '블러 배경' },
];

// Text Position (3x3 grid)
export type TextPositionX = 'left' | 'center' | 'right';
export type TextPositionY = 'top' | 'middle' | 'bottom';
export type TextPosition = `${TextPositionY}-${TextPositionX}`;

export const TEXT_POSITIONS: { value: TextPosition; label: string }[] = [
  { value: 'top-left', label: '↖ 좌상' },
  { value: 'top-center', label: '↑ 중상' },
  { value: 'top-right', label: '↗ 우상' },
  { value: 'middle-left', label: '← 좌중' },
  { value: 'middle-center', label: '● 중앙' },
  { value: 'middle-right', label: '→ 우중' },
  { value: 'bottom-left', label: '↙ 좌하' },
  { value: 'bottom-center', label: '↓ 중하' },
  { value: 'bottom-right', label: '↘ 우하' },
];

// Text Box Settings
export interface TextBoxSettings {
  style: TextBoxStyle;
  position: TextPosition;
  verticalOffset: number;  // -50 to 50 percent offset from base position
  backgroundColor: string;
  backgroundOpacity: number;
  gradientEndColor: string;  // for gradient style
  borderColor: string;
  borderWidth: number;
  borderRadius: number;
  padding: number;
}

export const FONT_OPTIONS = [
  { value: 'Pretendard, sans-serif', label: 'Pretendard' },
  { value: 'Inter, sans-serif', label: 'Inter' },
  { value: 'Noto Sans KR, sans-serif', label: 'Noto Sans KR' },
  { value: 'Roboto, sans-serif', label: 'Roboto' },
  { value: 'Montserrat, sans-serif', label: 'Montserrat' },
  { value: 'Poppins, sans-serif', label: 'Poppins' },
  { value: 'Playfair Display, serif', label: 'Playfair Display' },
  { value: 'Georgia, serif', label: 'Georgia' },
];

export const FONT_WEIGHT_OPTIONS = [
  { value: 'normal' as const, label: 'Normal' },
  { value: 'medium' as const, label: 'Medium' },
  { value: 'semibold' as const, label: 'Semibold' },
  { value: 'bold' as const, label: 'Bold' },
  { value: 'extrabold' as const, label: 'Extra Bold' },
];

export interface ProjectData {
  // Global Styles
  templateType: 'card_news_v1';
  canvasSize: '1:1' | '4:5' | '9:16';
  showDate: boolean;
  showSmallTitle: boolean;
  smallTitlePosition: TextPosition;
  smallTitleVerticalOffset: number;  // -50 to 50 percent offset from base position
  showHeadline: boolean;
  showTags: boolean;
  enableOverlay: boolean;
  overlayOpacity: number;
  enableTextBackground: boolean;

  // Font Settings
  fontSettings: FontSettings;

  // Text Box Settings
  textBoxSettings: TextBoxSettings;

  // Brand Kit
  logoSrc: string | null;
  logoPosition: 'top-left' | 'top-right' | 'bottom-center' | 'bottom-right';

  // Export Settings
  exportFormat: 'images' | 'video';
  videoDuration: number; // seconds per slide
  videoTransition: 'fade' | 'slide' | 'none';

  // Content
  slides: SlideData[];
}

export const INITIAL_SLIDE: SlideData = {
  id: 'slide-1',
  smallTitle: "",
  headline: "HEADLINE GOES HERE",
  tags: ["Tag1", "Tag2"],
  imageSrc: null,
  caption: ""
};

export const INITIAL_FONT_SETTINGS: FontSettings = {
  fontFamily: 'Pretendard, sans-serif',
  smallTitleFontSize: 24,
  headlineFontSize: 60,
  tagsFontSize: 26,
  fontColor: '#FFFFFF',
  fontWeight: 'bold',
};

export const INITIAL_TEXT_BOX_SETTINGS: TextBoxSettings = {
  style: 'solid',
  position: 'bottom-left',
  verticalOffset: 0,
  backgroundColor: '#000000',
  backgroundOpacity: 80,
  gradientEndColor: '#FFFFFF',
  borderColor: '#FFFFFF',
  borderWidth: 2,
  borderRadius: 0,
  padding: 24,
};

export const INITIAL_PROJECT_DATA: ProjectData = {
  templateType: 'card_news_v1',
  canvasSize: '4:5',
  showDate: true,
  showSmallTitle: true,
  smallTitlePosition: 'top-left',
  smallTitleVerticalOffset: 0,
  showHeadline: true,
  showTags: true,
  enableOverlay: false,
  overlayOpacity: 30,
  enableTextBackground: true,
  fontSettings: INITIAL_FONT_SETTINGS,
  textBoxSettings: INITIAL_TEXT_BOX_SETTINGS,
  logoSrc: null,
  logoPosition: 'top-left',
  exportFormat: 'images',
  videoDuration: 3,
  videoTransition: 'fade',
  slides: [INITIAL_SLIDE]
};

// Design Template (saves only design settings, not content)
export interface DesignTemplate {
  id: string;
  name: string;
  createdAt: string;
  // Design settings
  canvasSize: ProjectData['canvasSize'];
  showDate: boolean;
  showSmallTitle: boolean;
  smallTitlePosition: TextPosition;
  smallTitleVerticalOffset: number;
  showHeadline: boolean;
  showTags: boolean;
  enableOverlay: boolean;
  overlayOpacity: number;
  enableTextBackground: boolean;
  fontSettings: FontSettings;
  textBoxSettings: TextBoxSettings;
  logoSrc: string | null;
  logoPosition: ProjectData['logoPosition'];
}
