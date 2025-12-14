import { VisualizationType, FontType, BackgroundColorType, ColorPaletteType, Resolution, GraphicEffectType, WatermarkPosition, SubtitleBgStyle, SubtitleDisplayMode } from '../types';

export interface SavedSettings {
    // Allow forward-compatible settings without constantly updating this interface
    // (the UI stores many effect-specific fields).
    [key: string]: any;
    visualizationType: VisualizationType;
    // Multi-visualization (composite) mode
    multiEffectEnabled?: boolean;
    selectedVisualizationTypes?: VisualizationType[];
    customText: string;
    textColor: string;
    textStrokeColor: string;
    fontFamily: FontType;
    graphicEffect: GraphicEffectType;
    sensitivity: number;
    smoothing: number;
    equalization: number;
    backgroundColor: BackgroundColorType;
    colorPalette: ColorPaletteType;
    resolution: Resolution;
    watermarkPosition: WatermarkPosition;
    waveformStroke: boolean;
    subtitleFontSize: number;
    subtitleFontFamily: FontType;
    subtitleColor: string;
    subtitleEffect: GraphicEffectType;
    subtitleBgStyle: SubtitleBgStyle;
    subtitleDisplayMode: SubtitleDisplayMode;
    subtitleFadeInSeconds: number;
    subtitleFadeOutSeconds: number;
    subtitleFadeLinesEnabled: boolean;
    subtitleLineColor: string;
    subtitleLineThickness: number;
    subtitleLineGap: number;
    effectScale: number;
    effectOffsetX: number;
    effectOffsetY: number;
    effectRotation: number;
    lyricsFontSize: number;
    lyricsFontFamily: FontType;
    lyricsPositionX: number;
    lyricsPositionY: number;

    // Intro Overlay（開場文字動畫）
    showIntroOverlay: boolean;
    introTitle: string;
    introArtist: string;
    introDescription: string;
    introFontFamily: FontType;
    introEffect: GraphicEffectType;
    introColor: string;
    introStrokeColor: string;
    introTitleSize: number;
    introArtistSize: number;
    introDescriptionSize: number;
    introFadeIn: number;
    introHold: number;
    introFadeOut: number;
    introBgOpacity: number;
    introPositionX: number;
    introPositionY: number;
    introLightBarsEnabled: boolean;

    // CTA Animation
    showCtaAnimation: boolean;
    ctaChannelName: string;
    ctaFontFamily: FontType;
    ctaTextColor: string;
    ctaStrokeColor: string;
    ctaTextEffect: GraphicEffectType;
    ctaPositionX: number;
    ctaPositionY: number;

    // Control Card (text)
    controlCardFontFamily: FontType;
    controlCardTextEffect: GraphicEffectType;
    controlCardStrokeColor: string;

    // Ke Ye Custom V2 (可夜訂製版二號) text styling
    keYeCustomV2BoxColor: string;
    keYeCustomV2VisualizerColor: string;
    keYeCustomV2Text1Color: string;
    keYeCustomV2Text2Color: string;
    keYeCustomV2Text1Effect: GraphicEffectType;
    keYeCustomV2Text2Effect: GraphicEffectType;
    keYeCustomV2Text1StrokeColor: string;
    keYeCustomV2Text2StrokeColor: string;

    // Fusion
    fusionCenterOpacity: number;

    // Stellar Core
    stellarCoreInnerOpacity: number;
    stellarCoreTentaclesOpacity: number;
}

export class SettingsManager {
    private static readonly STORAGE_KEY = 'audio-visualizer-settings';
    private static readonly PRESET_KEY_PREFIX = 'audio-visualizer-preset-';

    // 保存當前設置
    static saveSettings(settings: Partial<SavedSettings>): void {
        try {
            const existingSettings = this.loadSettings();
            const mergedSettings = { ...existingSettings, ...settings };
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(mergedSettings));
        } catch (error) {
            console.error('Failed to save settings:', error);
        }
    }

    // 載入設置
    static loadSettings(): Partial<SavedSettings> {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            return saved ? JSON.parse(saved) : {};
        } catch (error) {
            console.error('Failed to load settings:', error);
            return {};
        }
    }

    // 清除所有設置
    static clearSettings(): void {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
        } catch (error) {
            console.error('Failed to clear settings:', error);
        }
    }

    // 保存為預設
    static savePreset(name: string, settings: Partial<SavedSettings>): void {
        try {
            const presetKey = `${this.PRESET_KEY_PREFIX}${name}`;
            localStorage.setItem(presetKey, JSON.stringify(settings));
        } catch (error) {
            console.error('Failed to save preset:', error);
        }
    }

    // 載入預設
    static loadPreset(name: string): Partial<SavedSettings> | null {
        try {
            const presetKey = `${this.PRESET_KEY_PREFIX}${name}`;
            const saved = localStorage.getItem(presetKey);
            return saved ? JSON.parse(saved) : null;
        } catch (error) {
            console.error('Failed to load preset:', error);
            return null;
        }
    }

    // 獲取所有預設名稱
    static getPresetNames(): string[] {
        try {
            const presets: string[] = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(this.PRESET_KEY_PREFIX)) {
                    presets.push(key.replace(this.PRESET_KEY_PREFIX, ''));
                }
            }
            return presets;
        } catch (error) {
            console.error('Failed to get preset names:', error);
            return [];
        }
    }

    // 刪除預設
    static deletePreset(name: string): void {
        try {
            const presetKey = `${this.PRESET_KEY_PREFIX}${name}`;
            localStorage.removeItem(presetKey);
        } catch (error) {
            console.error('Failed to delete preset:', error);
        }
    }

    // 導出設置為JSON
    static exportSettings(settings: Partial<SavedSettings>): string {
        return JSON.stringify(settings, null, 2);
    }

    // 從JSON導入設置
    static importSettings(jsonString: string): Partial<SavedSettings> | null {
        try {
            return JSON.parse(jsonString);
        } catch (error) {
            console.error('Failed to import settings:', error);
            return null;
        }
    }
}
