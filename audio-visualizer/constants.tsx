
import { ColorPaletteType, Palette, Resolution } from './types';

export const ICON_PATHS = {
    UPLOAD: 'M9.25 15.5V11.375L7.25 13.375L6 12L10 8L14 12L12.75 13.375L10.75 11.375V15.5H9.25ZM5.625 20C5.175 20 4.79375 19.8562 4.48125 19.5687C4.16875 19.2812 4.0125 18.9187 4.0125 18.4812L4 16.5H5.5V18.5H14.5V16.5H16V18.4812C16 18.9187 15.8438 19.2812 15.5313 19.5687C15.2188 19.8562 14.8375 20 14.375 20H5.625Z',
    PLAY: 'M8 19V5L19 12L8 19Z',
    PAUSE: 'M6 19H10V5H6V19ZM14 5V19H18V5H14Z',
    RECORD_START: 'M12 12m-3.5 0a3.5 3.5 0 1 0 7 0a3.5 3.5 0 1 0-7 0',
    RECORD_STOP: 'M10 10h4v4h-4z',
    DOWNLOAD: 'M5 20H19V18H5V20ZM19 9H15V3H9V9H5L12 16L19 9Z',
    MUSIC_NOTE: 'M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z',
    CHANGE_MUSIC: 'M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z',
    SUBTITLES: 'M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z',
    AI_SPARKLE: 'M10 21.65 8.95 20.6l-2.6-2.6L7.4 16.95l2.6 2.6L11.05 20.6Zm-4.9-4.9L4.05 15.7l-2.6-2.6L2.5 12.05l2.6 2.6ZM20 12.5l-2.6-2.6-1.05-1.05L15.3 9.9l2.6 2.6ZM10 12q-1.25 0-2.125-.875T7 9q0-1.25.875-2.125T10 6q1.25 0 2.125.875T13 9q0 1.25-.875 2.125T10 12Zm10.1-6.55-1.05-1.05-2.6-2.6 1.05-1.05 2.6 2.6ZM10 4.5q-.4 0-.7-.125t-.55-.375L8.6 3.85 7.75 3q-.25-.25-.25-.6t.25-.6q.25-.25.6-.25t.6.25l.85.85.15.15q.25.25.375.55t.125.7q0 .4-.3.7t-.7.3Z',
    CHEVRON_UP: 'M7 14l5-5 5 5z',
    CHEVRON_DOWN: 'M7 10l5 5 5-5z',
    STAR: 'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z',
    SETTINGS: 'M12 15.5A3.5 3.5 0 0 1 8.5 12A3.5 3.5 0 0 1 12 8.5a3.5 3.5 0 0 1 3.5 3.5a3.5 3.5 0 0 1-3.5 3.5M19.43 12.97c.04-.32.07-.64.07-.97c0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1c0 .33.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66Z',
    ADVANCED: 'M9.5 3A6.5 6.5 0 0 1 16 9.5c0 1.61-.59 3.09-1.56 4.23l.27.27h.79l5 5l-1.5 1.5l-5-5v-.79l-.27-.27A6.516 6.516 0 0 1 9.5 16A6.5 6.5 0 0 1 3 9.5A6.5 6.5 0 0 1 9.5 3m0 2C7 5 5 7 5 9.5S7 14 9.5 14S14 12 14 9.5S12 5 9.5 5Z',
};

export const RESOLUTION_MAP: Record<Resolution, {width: number, height: number} | null> = {
    [Resolution.P720]: { width: 1280, height: 720 },
    [Resolution.P1080]: { width: 1920, height: 1080 },
    [Resolution.P4K]: { width: 3840, height: 2160 },
    [Resolution.SQUARE_1080]: { width: 1080, height: 1080 },
    [Resolution.SQUARE_4K]: { width: 2160, height: 2160 },
    [Resolution.RATIO_2_1_4K]: { width: 4096, height: 2048 },
    [Resolution.RATIO_2_1_1080]: { width: 1920, height: 960 },
    [Resolution.RATIO_2_1_720]: { width: 1280, height: 640 },
    [Resolution.CURRENT]: null,
};

export const COLOR_PALETTES: Record<ColorPaletteType, Palette> = {
    [ColorPaletteType.DEFAULT]: {
        name: ColorPaletteType.DEFAULT,
        primary: '#67E8F9', // Cyan
        secondary: '#F472B6', // Pink
        accent: '#FFFFFF',
        backgroundGlow: 'rgba(10, 80, 150, 0.2)',
        hueRange: [180, 300], // Cyan to Magenta
    },
    [ColorPaletteType.CYBERPUNK]: {
        name: ColorPaletteType.CYBERPUNK,
        primary: '#00F0FF', // Bright Cyan
        secondary: '#FF00C7', // Hot Pink
        accent: '#F5F5F5',
        backgroundGlow: 'rgba(80, 10, 150, 0.25)',
        hueRange: [185, 310],
    },
    [ColorPaletteType.SUNSET]: {
        name: ColorPaletteType.SUNSET,
        primary: '#FFD700', // Gold
        secondary: '#FF8C00', // Dark Orange
        accent: '#FF4500', // OrangeRed
        backgroundGlow: 'rgba(150, 50, 10, 0.2)',
        hueRange: [25, 60], // Orange to Yellow
    },
    [ColorPaletteType.GLACIER]: {
        name: ColorPaletteType.GLACIER,
        primary: '#FFFFFF',
        secondary: '#ADD8E6', // Light Blue
        accent: '#87CEEB', // Sky Blue
        backgroundGlow: 'rgba(100, 120, 180, 0.15)',
        hueRange: [180, 240], // Cyan to Blue
    },
    [ColorPaletteType.LAVA]: {
        name: ColorPaletteType.LAVA,
        primary: '#FF4500', // OrangeRed
        secondary: '#FF0000', // Red
        accent: '#FFFF00', // Yellow
        backgroundGlow: 'rgba(180, 20, 0, 0.3)',
        hueRange: [0, 50], // Red to Orange
    },
    [ColorPaletteType.MIDNIGHT]: {
        name: ColorPaletteType.MIDNIGHT,
        primary: '#581C87', // Deep Purple
        secondary: '#1E40AF', // Dark Blue
        accent: '#E5E7EB',   // Light Gray
        backgroundGlow: 'rgba(40, 40, 80, 0.2)',
        hueRange: [240, 280], // Blue to Purple
    },
    [ColorPaletteType.WHITE]: {
        name: ColorPaletteType.WHITE,
        primary: '#FFFFFF',
        secondary: '#E5E7EB', // light gray
        accent: '#FFFFFF',
        backgroundGlow: 'rgba(220, 220, 230, 0.2)',
        hueRange: [0, 0], // Not used, logic is handled in visualizer
    },
    [ColorPaletteType.RAINBOW]: {
        name: ColorPaletteType.RAINBOW,
        primary: '#FF0000', // Placeholder, will be generated dynamically
        secondary: '#00FF00', // Placeholder
        accent: '#0000FF', // Placeholder
        backgroundGlow: 'rgba(128, 128, 128, 0.2)',
        hueRange: [0, 360], // Full spectrum
    },
};