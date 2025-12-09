export interface SlideData {
  id: string;
  headline: string;
  tags: string[];
  imageSrc: string | null;
  caption: string; // Individual caption or combined? Usually one caption for IG post, but per-slide text is key. User said "text for each".
}

export interface FontSettings {
  fontFamily: string;
  headlineFontSize: number;
  tagsFontSize: number;
  fontColor: string;
  fontWeight: 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';
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
  showHeadline: boolean;
  showTags: boolean;
  enableOverlay: boolean;
  overlayOpacity: number;
  enableTextBackground: boolean;

  // Font Settings
  fontSettings: FontSettings;

  // Brand Kit
  logoSrc: string | null;
  logoPosition: 'top-left' | 'top-right' | 'bottom-center' | 'bottom-right';

  // Content
  slides: SlideData[];
}

export const INITIAL_SLIDE: SlideData = {
  id: 'slide-1',
  headline: "HEADLINE GOES HERE",
  tags: ["Tag1", "Tag2"],
  imageSrc: null,
  caption: ""
};

export const INITIAL_FONT_SETTINGS: FontSettings = {
  fontFamily: 'Pretendard, sans-serif',
  headlineFontSize: 60,
  tagsFontSize: 26,
  fontColor: '#FFFFFF',
  fontWeight: 'bold',
};

export const INITIAL_PROJECT_DATA: ProjectData = {
  templateType: 'card_news_v1',
  canvasSize: '4:5',
  showDate: true,
  showHeadline: true,
  showTags: true,
  enableOverlay: false,
  overlayOpacity: 30,
  enableTextBackground: true,
  fontSettings: INITIAL_FONT_SETTINGS,
  logoSrc: null,
  logoPosition: 'top-left',
  slides: [INITIAL_SLIDE]
};
