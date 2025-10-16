export interface SRTSubtitle {
  index: number;
  startTime: string;
  endTime: string;
  text: string;
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
}

export interface TranslationProgress {
  current: number;
  total: number;
  language: string;
}

export interface TranslationResult {
  language: Language;
  subtitles: SRTSubtitle[];
  filename: string;
}



