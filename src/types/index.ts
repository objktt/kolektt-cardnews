export interface SlideData {
  id: string;
  headline: string;
  tags: string[];
  imageSrc: string | null;
  caption: string; // Individual caption or combined? Usually one caption for IG post, but per-slide text is key. User said "text for each".
}

export interface ProjectData {
  // Global Styles
  templateType: 'card_news_v1';
  canvasSize: '1:1' | '4:5' | '9:16';
  showDate: boolean;
  enableOverlay: boolean;
  overlayOpacity: number;
  enableTextBackground: boolean;
  
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

export const INITIAL_PROJECT_DATA: ProjectData = {
  templateType: 'card_news_v1',
  canvasSize: '4:5',
  showDate: true,
  enableOverlay: false,
  overlayOpacity: 30,
  enableTextBackground: true,
  logoSrc: null,
  logoPosition: 'top-left',
  slides: [INITIAL_SLIDE]
};
