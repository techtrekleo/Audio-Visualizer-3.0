import { VisualizationType, FontType, BackgroundColorType, ColorPaletteType, Resolution, GraphicEffectType, WatermarkPosition, SubtitleBgStyle, SubtitleDisplayMode } from '../types';

export interface SavedSettings {
    visualizationType: VisualizationType;
    customText: string;
    textColor: string;
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
    effectScale: number;
    effectOffsetX: number;
    effectOffsetY: number;
    lyricsFontSize: number;
    lyricsPositionX: number;
    lyricsPositionY: number;
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
