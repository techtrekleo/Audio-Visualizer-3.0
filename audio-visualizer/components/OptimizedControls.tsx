import React, { useState } from 'react';
import { VisualizationType, FontType, BackgroundColorType, ColorPaletteType, Resolution, GraphicEffectType, WatermarkPosition, SubtitleBgStyle, SubtitleDisplayMode, TransitionType, SubtitleFormat, SubtitleLanguage, FilterEffectType, ControlCardStyle } from '../types';
import Icon from './Icon';
import { ICON_PATHS } from '../constants';
import CollapsibleControlSection from './CollapsibleControlSection';
import QuickSettingsPanel from './QuickSettingsPanel';
import SettingsManagerComponent from './SettingsManagerComponent';

// 將原始字幕文本轉換為標準SRT格式
// 解析字幕文字，支援兩種格式
const parseSubtitles = (rawText: string, format: 'bracket' | 'srt'): Array<{ time: number; text: string; endTime?: number }> => {
    if (!rawText.trim()) return [];
    
    const lines = rawText.trim().split('\n');
    const subtitles: Array<{ time: number; text: string; endTime?: number }> = [];
    
    if (format === 'bracket') {
        // 解析 [00:00.00] 格式
        const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2})\]/;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            const match = line.match(timeRegex);
            if (match) {
                const minutes = parseInt(match[1], 10);
                const seconds = parseInt(match[2], 10);
                const centiseconds = parseInt(match[3], 10);
                const time = minutes * 60 + seconds + centiseconds / 100;
                const text = line.replace(timeRegex, '').trim();
                
                if (text) {
                    // 預設顯示3秒
                    const endTime = time + 3;
                    subtitles.push({ time, text, endTime });
                }
            }
        }
    } else if (format === 'srt') {
        // 解析 SRT 格式 00:00:14,676 --> 00:00:19,347
        const srtTimeRegex = /^(\d{1,2}):(\d{1,2}):(\d{1,2}),(\d{1,3})\s*-->\s*(\d{1,2}):(\d{1,2}):(\d{1,2}),(\d{1,3})$/;
        
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;
            
            const match = line.match(srtTimeRegex);
            if (match) {
                // 開始時間
                const startHours = parseInt(match[1], 10);
                const startMinutes = parseInt(match[2], 10);
                const startSeconds = parseInt(match[3], 10);
                const startMilliseconds = parseInt(match[4], 10);
                const time = startHours * 3600 + startMinutes * 60 + startSeconds + startMilliseconds / 1000;
                
                // 結束時間
                const endHours = parseInt(match[5], 10);
                const endMinutes = parseInt(match[6], 10);
                const endSeconds = parseInt(match[7], 10);
                const endMilliseconds = parseInt(match[8], 10);
                const endTime = endHours * 3600 + endMinutes * 60 + endSeconds + endMilliseconds / 1000;
                
                // 下一行是文字
                if (i + 1 < lines.length) {
                    const text = lines[i + 1].trim();
                    if (text) {
                        subtitles.push({ time, text, endTime });
                        i++; // 跳過文字行
                    }
                }
            }
        }
    }
    
    // 按時間排序
    subtitles.sort((a, b) => a.time - b.time);
    return subtitles;
};

// 轉換為指定格式
const convertToFormat = (rawText: string, fromFormat: 'bracket' | 'srt', toFormat: 'bracket' | 'srt'): string => {
    const subtitles = parseSubtitles(rawText, fromFormat);
    
    if (toFormat === 'bracket') {
        // 轉換為 [00:00.00] 格式
        return subtitles.map(subtitle => {
            const minutes = Math.floor(subtitle.time / 60);
            const seconds = Math.floor(subtitle.time % 60);
            const centiseconds = Math.floor((subtitle.time % 1) * 100);
            return `[${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${centiseconds.toString().padStart(2, '0')}] ${subtitle.text}`;
        }).join('\n');
    } else if (toFormat === 'srt') {
        // 轉換為 SRT 格式
        let srtContent = '';
        subtitles.forEach((subtitle, index) => {
            const startTime = formatSRTTime(subtitle.time);
            const endTime = formatSRTTime(subtitle.time + 3); // 預設3秒持續時間
            
            srtContent += `${index + 1}\n`;
            srtContent += `${startTime} --> ${endTime}\n`;
            srtContent += `${subtitle.text}\n\n`;
        });
        return srtContent;
    }
    
    return rawText;
};

// 舊的 convertToSRT 函數，保持向後相容
const convertToSRT = (rawText: string): string => {
    return convertToFormat(rawText, 'bracket', 'srt');
};

// 格式化時間為SRT格式 (HH:MM:SS,mmm)
const formatSRTTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const milliseconds = Math.floor((seconds % 1) * 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${milliseconds.toString().padStart(3, '0')}`;
};
import { SettingsManager, SavedSettings } from '../utils/settingsManager';

interface OptimizedControlsProps {
    isPlaying: boolean;
    onPlayPause: () => void;
    isRecording: boolean;
    onRecordToggle: () => void;
    isLoading: boolean;
    visualizationType: VisualizationType;
    onVisualizationChange: (type: VisualizationType) => void;
    customText: string;
    onTextChange: (text: string) => void;
    textColor: string;
    onTextColorChange: (color: string) => void;
    fontFamily: FontType;
    onFontFamilyChange: (font: FontType) => void;
    graphicEffect: GraphicEffectType;
    onGraphicEffectChange: (effect: GraphicEffectType) => void;
    textSize: number;
    onTextSizeChange: (size: number) => void;
    textPositionX: number;
    onTextPositionXChange: (value: number) => void;
    textPositionY: number;
    onTextPositionYChange: (value: number) => void;
    sensitivity: number;
    onSensitivityChange: (value: number) => void;
    smoothing: number;
    onSmoothingChange: (value: number) => void;
    equalization: number;
    onEqualizationChange: (value: number) => void;
    audioFile: File | null;
    onClearAudio: () => void;
    onFileSelect: (file: File) => void;
    videoUrl: string;
    videoExtension: string;
    backgroundColor: BackgroundColorType;
    onBackgroundColorChange: (color: BackgroundColorType) => void;
    colorPalette: ColorPaletteType;
    onColorPaletteChange: (palette: ColorPaletteType) => void;
    resolution: Resolution;
    onResolutionChange: (resolution: Resolution) => void;
    backgroundImage: string | null;
    onBackgroundImageSelect: (file: File) => void;
    onClearBackgroundImage: () => void;
    backgroundImages: string[];
    onMultipleBackgroundImagesSelect: (files: FileList) => void;
    onClearAllBackgroundImages: () => void;
    currentImageIndex: number;
    isSlideshowEnabled: boolean;
    onSlideshowEnabledChange: (enabled: boolean) => void;
    slideshowInterval: number;
    onSlideshowIntervalChange: (interval: number) => void;
    isTransitioning: boolean;
    transitionType: TransitionType;
    onTransitionTypeChange: (type: TransitionType) => void;
    watermarkPosition: WatermarkPosition;
    onWatermarkPositionChange: (position: WatermarkPosition) => void;
    waveformStroke: boolean;
    onWaveformStrokeChange: (value: boolean) => void;
    // Subtitle props
    subtitlesRawText: string;
    onSubtitlesRawTextChange: (text: string) => void;
    onGenerateSubtitles: () => void;
    isGeneratingSubtitles: boolean;
    showSubtitles: boolean;
    onShowSubtitlesChange: (show: boolean) => void;
    subtitleFontSize: number;
    onSubtitleFontSizeChange: (size: number) => void;
    subtitleFontFamily: FontType;
    onSubtitleFontFamilyChange: (font: FontType) => void;
    subtitleColor: string;
    onSubtitleColorChange: (color: string) => void;
    subtitleBgStyle: SubtitleBgStyle;
    onSubtitleBgStyleChange: (style: SubtitleBgStyle) => void;
    subtitleFormat: SubtitleFormat;
    onSubtitleFormatChange: (format: SubtitleFormat) => void;
    subtitleLanguage: SubtitleLanguage;
    onSubtitleLanguageChange: (language: SubtitleLanguage) => void;
    effectScale: number;
    onEffectScaleChange: (value: number) => void;
    effectOffsetX: number;
    onEffectOffsetXChange: (value: number) => void;
    effectOffsetY: number;
    onEffectOffsetYChange: (value: number) => void;
    // Lyrics Display props
    showLyricsDisplay: boolean;
    onShowLyricsDisplayChange: (show: boolean) => void;
    lyricsFontSize: number;
    onLyricsFontSizeChange: (size: number) => void;
    lyricsFontFamily: FontType;
    onLyricsFontFamilyChange: (font: FontType) => void;
    lyricsPositionX: number;
    onLyricsPositionXChange: (value: number) => void;
    lyricsPositionY: number;
    onLyricsPositionYChange: (value: number) => void;
    subtitleDisplayMode: SubtitleDisplayMode;
    onSubtitleDisplayModeChange: (mode: SubtitleDisplayMode) => void;
    // Progress bar props
    currentTime: number;
    audioDuration: number;
    onSeek: (time: number) => void;
    // Toggles
    showVisualizer: boolean;
    onShowVisualizerChange: (show: boolean) => void;
    showBackgroundImage: boolean;
    onShowBackgroundImageChange: (show: boolean) => void;
    // 幾何圖形控制面板
    showGeometricControls: boolean;
    onShowGeometricControlsChange: (show: boolean) => void;
    geometricFrameImage: string | null;
    onGeometricFrameImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onClearGeometricFrameImage: () => void;
    geometricSemicircleImage: string | null;
    onGeometricSemicircleImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onClearGeometricSemicircleImage: () => void;
    geometricSongName: string | null;
    onGeometricSongNameChange?: (name: string) => void;
    geometricArtistName: string | null;
    onGeometricArtistNameChange?: (name: string) => void;
    // 可視化大小控制
    visualizationScale?: number;
    onVisualizationScaleChange?: (scale: number) => void;
    // CTA 動畫控制
    showCtaAnimation?: boolean;
    onShowCtaAnimationChange?: (show: boolean) => void;
    ctaChannelName?: string;
    onCtaChannelNameChange?: (name: string) => void;
    // Z總訂製款控制
    showZCustomControls?: boolean;
    onShowZCustomControlsChange?: (show: boolean) => void;
    zCustomCenterImage?: string | null;
    onZCustomCenterImageUpload?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onClearZCustomCenterImage?: () => void;
    zCustomScale?: number;
    onZCustomScaleChange?: (scale: number) => void;
    zCustomPosition?: { x: number; y: number };
    onZCustomPositionUpdate?: (position: { x: number; y: number }) => void;
    // Filter Effects props
    filterEffectType?: FilterEffectType;
    onFilterEffectTypeChange?: (type: FilterEffectType) => void;
    filterEffectIntensity?: number;
    onFilterEffectIntensityChange?: (intensity: number) => void;
    filterEffectOpacity?: number;
    onFilterEffectOpacityChange?: (opacity: number) => void;
    filterEffectSpeed?: number;
    onFilterEffectSpeedChange?: (speed: number) => void;
    filterEffectEnabled?: boolean;
    onFilterEffectEnabledChange?: (enabled: boolean) => void;
    // Control Card props
    controlCardEnabled?: boolean;
    onControlCardEnabledChange?: (enabled: boolean) => void;
    controlCardFontSize?: number;
    onControlCardFontSizeChange?: (size: number) => void;
    controlCardStyle?: ControlCardStyle;
    onControlCardStyleChange?: (style: ControlCardStyle) => void;
    controlCardColor?: string;
    onControlCardColorChange?: (color: string) => void;
    controlCardBackgroundColor?: string;
    onControlCardBackgroundColorChange?: (color: string) => void;
    songNameList?: string[];
    onSongNameListChange?: (list: string[]) => void;
    autoChangeSong?: boolean;
    onAutoChangeSongChange?: (enabled: boolean) => void;
    // Picture-in-Picture props
    isPipSupported?: boolean;
    isPipActive?: boolean;
    onEnterPictureInPicture?: () => void;
    onExitPictureInPicture?: () => void;
}

const Button: React.FC<React.PropsWithChildren<{ onClick?: () => void; className?: string; disabled?: boolean; variant?: 'primary' | 'secondary' | 'danger' }>> = ({ children, onClick, className = '', disabled=false, variant = 'primary' }) => {
    const baseClasses = 'px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800';
    
    const variantClasses = {
        primary: 'bg-cyan-500 hover:bg-cyan-600 text-white shadow-lg hover:shadow-xl focus:ring-cyan-400',
        secondary: 'bg-gray-600 hover:bg-gray-700 text-white shadow-md hover:shadow-lg focus:ring-gray-400',
        danger: 'bg-red-500 hover:bg-red-600 text-white shadow-lg hover:shadow-xl focus:ring-red-400'
    };
    
    return (
        <button 
            onClick={onClick} 
            disabled={disabled} 
            className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        >
            {children}
        </button>
    );
};

const SwatchButton: React.FC<{
    color: string;
    onClick: (color: string) => void;
    isActive: boolean;
}> = ({ color, onClick, isActive }) => (
    <button
        type="button"
        onClick={() => onClick(color)}
        className={`w-8 h-8 rounded-full border-3 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-400 hover:scale-110 ${
            isActive ? 'border-white scale-110 shadow-lg' : 'border-gray-600 hover:border-gray-400'
        }`}
        style={{ backgroundColor: color }}
        aria-label={`Set text color to ${color}`}
    />
);

const SliderControl: React.FC<{
    label: string;
    value: number;
    onChange: (value: number) => void;
    min: number;
    max: number;
    step: number;
    className?: string;
    colorType?: 'default' | 'sensitivity' | 'position' | 'scale';
}> = ({ label, value, onChange, min, max, step, className = '', colorType = 'default' }) => {
    // 計算滑桿的百分比位置
    const percentage = ((value - min) / (max - min)) * 100;
    
    // 根據不同類型設置顏色
    const getSliderStyle = () => {
        switch (colorType) {
            case 'sensitivity':
                return {
                    background: `linear-gradient(to right, 
                        #ef4444 0%, 
                        #f97316 25%, 
                        #eab308 50%, 
                        #22c55e 75%, 
                        #10b981 100%)`
                };
            case 'position':
                return {
                    background: `linear-gradient(to right, 
                        #3b82f6 0%, 
                        #8b5cf6 50%, 
                        #ec4899 100%)`
                };
            case 'scale':
                return {
                    background: `linear-gradient(to right, 
                        #6b7280 0%, 
                        #10b981 50%, 
                        #f59e0b 100%)`
                };
            default:
                return {
                    background: `linear-gradient(to right, 
                        #374151 0%, 
                        #06b6d4 50%, 
                        #8b5cf6 100%)`
                };
        }
    };

    return (
        <div className={`space-y-2 ${className}`}>
            <div className="flex justify-between items-center">
                <label className="text-sm font-medium text-gray-300">{label}</label>
                <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">{value.toFixed(2)}</span>
            </div>
            <div className="relative">
                {/* 背景漸變條 */}
                <div 
                    className="w-full h-2 rounded-lg absolute top-0 left-0"
                    style={getSliderStyle()}
                />
                {/* 滑桿 */}
                <input
                    type="range"
                    min={min}
                    max={max}
                    step={step}
                    value={value}
                    onChange={(e) => onChange(parseFloat(e.target.value))}
                    className="w-full h-2 bg-transparent rounded-lg appearance-none cursor-pointer slider-enhanced relative z-10"
                    style={{
                        background: 'transparent'
                    }}
                />
                {/* 當前值指示器 */}
                <div 
                    className="absolute top-0 h-2 bg-white/20 rounded-lg pointer-events-none"
                    style={{
                        left: 0,
                        width: `${percentage}%`,
                        transition: 'width 0.1s ease'
                    }}
                />
            </div>
        </div>
    );
};

const SelectControl: React.FC<{
    label: string;
    value: string;
    onChange: (value: string) => void;
    options: { value: string; label: string }[];
    className?: string;
}> = ({ label, value, onChange, options, className = '' }) => (
    <div className={`space-y-2 ${className}`}>
        <label className="text-sm font-medium text-gray-300">{label}</label>
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
        >
            {options.map((option) => (
                <option key={option.value} value={option.value}>
                    {option.label}
                </option>
            ))}
        </select>
    </div>
);

const ProgressBar: React.FC<{
    currentTime: number;
    duration: number;
    onSeek: (time: number) => void;
    className?: string;
}> = ({ currentTime, duration, onSeek, className = '' }) => {
    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
    
    const formatTime = (time: number) => {
        const minutes = Math.floor(time / 60);
        const seconds = Math.floor(time % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = parseFloat(e.target.value);
        onSeek(newTime);
    };

    return (
        <div className={`space-y-2 ${className}`}>
            <div className="flex justify-between items-center text-sm text-gray-300">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
            </div>
            <div className="relative">
                {/* 背景漸變條 */}
                <div 
                    className="w-full h-2 rounded-lg absolute top-0 left-0 bg-gradient-to-r from-cyan-500 to-purple-500"
                />
                {/* 進度條 */}
                <input
                    type="range"
                    min={0}
                    max={duration || 0}
                    step={0.1}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-2 bg-transparent rounded-lg appearance-none cursor-pointer slider-enhanced relative z-10"
                    style={{
                        background: 'transparent'
                    }}
                />
                {/* 當前進度指示器 */}
                <div 
                    className="absolute top-0 h-2 bg-white/30 rounded-lg pointer-events-none"
                    style={{
                        left: 0,
                        width: `${progress}%`,
                        transition: 'width 0.1s ease'
                    }}
                />
            </div>
        </div>
    );
};

const OptimizedControls: React.FC<OptimizedControlsProps> = (props) => {
    const [showQuickSettings, setShowQuickSettings] = useState(true);
    const PRESET_COLORS = ['#FFFFFF', '#67E8F9', '#F472B6', '#FFD700', '#FF4500', '#A78BFA'];

    // 獲取當前設置
    const getCurrentSettings = (): Partial<SavedSettings> => ({
        visualizationType: props.visualizationType,
        customText: props.customText,
        textColor: props.textColor,
        fontFamily: props.fontFamily,
        graphicEffect: props.graphicEffect,
        sensitivity: props.sensitivity,
        smoothing: props.smoothing,
        equalization: props.equalization,
        backgroundColor: props.backgroundColor,
        colorPalette: props.colorPalette,
        resolution: props.resolution,
        watermarkPosition: props.watermarkPosition,
        waveformStroke: props.waveformStroke,
        subtitleFontSize: props.subtitleFontSize,
        subtitleFontFamily: props.subtitleFontFamily,
        subtitleColor: props.subtitleColor,
        subtitleEffect: props.subtitleEffect,
        subtitleBgStyle: props.subtitleBgStyle,
        subtitleDisplayMode: props.subtitleDisplayMode,
        effectScale: props.effectScale,
        effectOffsetX: props.effectOffsetX,
        effectOffsetY: props.effectOffsetY,
        lyricsFontSize: props.lyricsFontSize,
        lyricsFontFamily: props.lyricsFontFamily,
        lyricsPositionX: props.lyricsPositionX,
        lyricsPositionY: props.lyricsPositionY,
    });

    // 載入設置
    const handleLoadSettings = (settings: Partial<SavedSettings>) => {
        if (settings.visualizationType) props.onVisualizationChange(settings.visualizationType);
        if (settings.customText !== undefined) props.onTextChange(settings.customText);
        if (settings.textColor) props.onTextColorChange(settings.textColor);
        if (settings.fontFamily) props.onFontFamilyChange(settings.fontFamily);
        if (settings.graphicEffect) props.onGraphicEffectChange(settings.graphicEffect);
        if (settings.sensitivity !== undefined) props.onSensitivityChange(settings.sensitivity);
        if (settings.smoothing !== undefined) props.onSmoothingChange(settings.smoothing);
        if (settings.equalization !== undefined) props.onEqualizationChange(settings.equalization);
        if (settings.backgroundColor) props.onBackgroundColorChange(settings.backgroundColor);
        if (settings.colorPalette) props.onColorPaletteChange(settings.colorPalette);
        if (settings.resolution) props.onResolutionChange(settings.resolution);
        if (settings.watermarkPosition) props.onWatermarkPositionChange(settings.watermarkPosition);
        if (settings.waveformStroke !== undefined) props.onWaveformStrokeChange(settings.waveformStroke);
        if (settings.subtitleFontSize !== undefined) props.onSubtitleFontSizeChange(settings.subtitleFontSize);
        if (settings.subtitleFontFamily) props.onSubtitleFontFamilyChange(settings.subtitleFontFamily);
        if (settings.subtitleColor) props.onSubtitleColorChange(settings.subtitleColor);
        if (settings.subtitleEffect) props.onSubtitleEffectChange(settings.subtitleEffect);
        if (settings.subtitleBgStyle) props.onSubtitleBgStyleChange(settings.subtitleBgStyle);
        if (settings.subtitleDisplayMode) props.onSubtitleDisplayModeChange(settings.subtitleDisplayMode);
        if (settings.effectScale !== undefined) props.onEffectScaleChange(settings.effectScale);
        if (settings.effectOffsetX !== undefined) props.onEffectOffsetXChange(settings.effectOffsetX);
        if (settings.effectOffsetY !== undefined) props.onEffectOffsetYChange(settings.effectOffsetY);
        if (settings.lyricsFontSize !== undefined) props.onLyricsFontSizeChange(settings.lyricsFontSize);
        if (settings.lyricsFontFamily !== undefined) props.onLyricsFontFamilyChange(settings.lyricsFontFamily);
        if (settings.lyricsPositionX !== undefined) props.onLyricsPositionXChange(settings.lyricsPositionX);
        if (settings.lyricsPositionY !== undefined) props.onLyricsPositionYChange(settings.lyricsPositionY);
    };

    const FONT_MAP: Record<FontType, string> = {
        [FontType.POPPINS]: 'Poppins',
        [FontType.ORBITRON]: 'Orbitron',
        [FontType.LOBSTER]: 'Lobster',
        [FontType.BUNGEE]: 'Bungee',
        [FontType.PRESS_START_2P]: 'Press Start 2P',
        [FontType.PACIFICO]: 'Pacifico',
        [FontType.DANCING_SCRIPT]: 'Dancing Script',
        [FontType.ROCKNROLL_ONE]: 'RocknRoll One',
        [FontType.REGGAE_ONE]: 'Reggae One',
        [FontType.VT323]: 'VT323',
        [FontType.NOTO_SANS_TC]: 'Noto Sans TC',
        [FontType.SOURCE_HAN_SANS]: 'Source Han Sans TC',
        [FontType.CW_TEX_KAI]: 'cwTeXKai',
        [FontType.KLEE_ONE]: 'Klee One',
        [FontType.QINGSONG_1]: 'Jason Handwriting 1',
        [FontType.QINGSONG_2]: 'Jason Handwriting 2',
    };

    const handleBackgroundImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.type.startsWith('image/')) {
                props.onBackgroundImageSelect(file);
            } else {
                alert('請上傳有效的圖片檔案。');
            }
        }
        e.target.value = '';
    };

    return (
        <div className="w-full max-w-7xl space-y-4">
            {/* 快速設置面板 */}
            {showQuickSettings && (
                <div className="mb-6">
                    <QuickSettingsPanel
                        visualizationType={props.visualizationType}
                        onVisualizationChange={props.onVisualizationChange}
                        waveformStroke={props.waveformStroke}
                        onWaveformStrokeChange={props.onWaveformStrokeChange}
                        effectScale={props.effectScale}
                        onEffectScaleChange={props.onEffectScaleChange}
                        effectOffsetX={props.effectOffsetX}
                        onEffectOffsetXChange={props.onEffectOffsetXChange}
                        effectOffsetY={props.effectOffsetY}
                        onEffectOffsetYChange={props.onEffectOffsetYChange}
                        isRecording={props.isRecording}
                        colorPalette={props.colorPalette}
                        onColorPaletteChange={props.onColorPaletteChange}
                        sensitivity={props.sensitivity}
                        onSensitivityChange={props.onSensitivityChange}
                        smoothing={props.smoothing}
                        onSmoothingChange={props.onSmoothingChange}
                        equalization={props.equalization}
                        onEqualizationChange={props.onEqualizationChange}
                        isPipSupported={props.isPipSupported}
                        isPipActive={props.isPipActive}
                        onEnterPictureInPicture={props.onEnterPictureInPicture}
                        onExitPictureInPicture={props.onExitPictureInPicture}
                    />
                </div>
            )}

            {/* 主要控制面板 */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-2xl p-6">
                {/* 額外開關 */}
                <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center justify-between bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3">
                        <span className="text-sm text-gray-200">顯示可視化</span>
                        <button
                            onClick={() => props.onShowVisualizerChange(!props.showVisualizer)}
                            type="button"
                            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 ${props.showVisualizer ? 'bg-cyan-600' : 'bg-gray-500'}`}
                            aria-pressed={props.showVisualizer}
                        >
                            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${props.showVisualizer ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                    <div className="flex items-center justify-between bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3">
                        <span className="text-sm text-gray-200">顯示背景圖片</span>
                        <button
                            onClick={() => props.onShowBackgroundImageChange(!props.showBackgroundImage)}
                            type="button"
                            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 ${props.showBackgroundImage ? 'bg-cyan-600' : 'bg-gray-500'}`}
                            aria-pressed={props.showBackgroundImage}
                        >
                            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${props.showBackgroundImage ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                    
                </div>
                {/* 播放控制 - 始終顯示 */}
                <div className="mb-6">
                    <div className="flex items-center space-x-2 mb-4">
                        <Icon path={ICON_PATHS.PLAY} className="w-5 h-5 text-cyan-400" />
                        <h3 className="text-lg font-semibold text-gray-200">播放控制</h3>
                    </div>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center space-x-3">
                            <Button 
                                onClick={props.onPlayPause} 
                                variant="primary" 
                                className="w-14 h-14 text-2xl !p-0 shadow-xl"
                                disabled={!props.audioFile}
                            >
                                <Icon path={props.isPlaying ? ICON_PATHS.PAUSE : ICON_PATHS.PLAY} className="w-7 h-7" />
                            </Button>
                            <Button 
                                onClick={props.onRecordToggle} 
                                variant={props.isRecording ? 'danger' : 'secondary'}
                                className={`${props.isRecording ? 'animate-pulse shadow-red-500/50' : ''}`}
                                disabled={props.isLoading || props.isGeneratingSubtitles}
                            >
                                {props.isLoading ? 
                                    <>
                                        <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                                        <span>處理中...</span>
                                    </>
                                    : <>
                                        <Icon path={props.isRecording ? ICON_PATHS.RECORD_STOP : ICON_PATHS.RECORD_START} className="w-5 h-5" />
                                        <span>{props.isRecording ? '停止錄製' : '開始錄製'}</span>
                                    </>
                                }
                            </Button>
                        </div>
                        
                        {/* 播放進度條 - 只在有音訊檔案時顯示 */}
                        {props.audioFile && props.audioDuration > 0 && (
                            <div className="flex-1 mx-6 min-w-0">
                                <ProgressBar
                                    currentTime={props.currentTime}
                                    duration={props.audioDuration}
                                    onSeek={props.onSeek}
                                />
                            </div>
                        )}
                        
                        <div className="flex items-center space-x-3">
                            <label className="px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white shadow-lg hover:shadow-xl cursor-pointer">
                                <Icon path={ICON_PATHS.UPLOAD} className="w-5 h-5"/>
                                <span>{props.audioFile ? '更換音樂' : '上傳音樂'}</span>
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    accept="audio/*" 
                                    onChange={(e) => {
                                        console.log('文件輸入變化:', e.target.files);
                                        if (e.target.files && e.target.files[0]) {
                                            console.log('選擇文件:', e.target.files[0]);
                                            props.onFileSelect(e.target.files[0]);
                                        }
                                        e.target.value = '';
                                    }} 
                                />
                            </label>
                            
                            {/* CTA 動畫控制 */}
                            <div className="flex items-center justify-between bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3">
                                <span className="text-sm text-gray-200">加入 CTA 動畫</span>
                                <button
                                    onClick={() => props.onShowCtaAnimationChange?.(!props.showCtaAnimation)}
                                    type="button"
                                    className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 ${props.showCtaAnimation ? 'bg-cyan-600' : 'bg-gray-500'}`}
                                    aria-pressed={props.showCtaAnimation}
                                >
                                    <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${props.showCtaAnimation ? 'translate-x-6' : 'translate-x-1'}`} />
                                </button>
                            </div>
                            {props.audioFile && (
                                <Button onClick={props.onClearAudio} variant="danger">
                                    <Icon path={ICON_PATHS.CHANGE_MUSIC} className="w-5 h-5"/>
                                    <span>清除音樂</span>
                                </Button>
                            )}
                            {props.audioFile && (
                                <a href={URL.createObjectURL(props.audioFile)} download={props.audioFile.name} className="px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-500 text-white shadow-lg hover:shadow-xl">
                                    <Icon path={ICON_PATHS.DOWNLOAD} />
                                    <span>下載音樂</span>
                                </a>
                            )}
                            {props.videoUrl && (
                                <a href={props.videoUrl} download={`${props.audioFile?.name.replace(/\.[^/.]+$/, "") || 'visualization'}.${props.videoExtension}`} className="px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-500 text-white shadow-lg hover:shadow-xl">
                                    <Icon path={ICON_PATHS.DOWNLOAD} />
                                    <span>下載 {props.videoExtension.toUpperCase()}</span>
                                </a>
                            )}
                        </div>
                        
                        {/* CTA 動畫頻道名稱輸入 */}
                        {props.showCtaAnimation && (
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                    頻道名稱
                                </label>
                                <input
                                    type="text"
                                    value={props.ctaChannelName || ''}
                                    onChange={(e) => props.onCtaChannelNameChange?.(e.target.value)}
                                    placeholder="輸入頻道名稱..."
                                    className="w-full px-3 py-2 bg-gray-900 border-2 border-black rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* 摺疊控制區塊 */}
                <div className="space-y-4">
                    {/* 視覺風格設定 */}
                    <CollapsibleControlSection
                        title="視覺風格設定"
                        icon={ICON_PATHS.SETTINGS}
                        priority="high"
                        defaultExpanded={false}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="space-y-2">
                                <SelectControl
                                    label="解析度"
                                    value={props.resolution}
                                    onChange={(value) => props.onResolutionChange(value as Resolution)}
                                    options={Object.values(Resolution).map(v => ({ value: v, label: v }))}
                                />
                                {(props.resolution === Resolution.SQUARE_1080 || props.resolution === Resolution.SQUARE_4K) && (
                                    <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-3 text-sm">
                                        <div className="flex items-center gap-2 text-blue-300">
                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                            </svg>
                                            <span className="font-medium">YouTube Shorts 專用</span>
                                        </div>
                                        <p className="text-blue-200 text-xs mt-1">
                                            1:1 畫面比例完美適合 YouTube Shorts、Instagram 和 TikTok
                                        </p>
                                    </div>
                                )}
                            </div>
                            
                            <SelectControl
                                label="背景顏色"
                                value={props.backgroundColor}
                                onChange={(value) => props.onBackgroundColorChange(value as BackgroundColorType)}
                                options={Object.values(BackgroundColorType).map(v => ({ value: v, label: v }))}
                            />
                            
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">背景圖片</label>
                                <div className="flex flex-col gap-2">
                                    <label className="text-center bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded-lg font-semibold transition-all duration-200 cursor-pointer">
                                        上傳單張圖片
                                        <input type="file" className="hidden" accept="image/*" onChange={handleBackgroundImageChange} />
                                    </label>
                                    <label className="text-center bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-lg font-semibold transition-all duration-200 cursor-pointer">
                                        上傳多張圖片 (輪播)
                                        <input 
                                            type="file" 
                                            className="hidden" 
                                            accept="image/*" 
                                            multiple 
                                            onChange={(e) => {
                                                if (e.target.files) {
                                                    props.onMultipleBackgroundImagesSelect(e.target.files);
                                                }
                                                e.target.value = '';
                                            }} 
                                        />
                                    </label>
                                    
                                    {/* 清除按鈕 - 單張圖片或多張圖片 */}
                                    {(props.backgroundImage || props.backgroundImages.length > 0) && (
                                        <div className="flex gap-2">
                                            {props.backgroundImage && (
                                                <Button 
                                                    onClick={() => {
                                                        console.log('清除單張背景圖片');
                                                        props.onClearBackgroundImage();
                                                    }} 
                                                    variant="danger" 
                                                    className="px-2 py-1 text-sm flex-1"
                                                >
                                                    🗑️ 清除單張圖片
                                                </Button>
                                            )}
                                            {props.backgroundImages.length > 0 && (
                                                <Button 
                                                    onClick={() => {
                                                        console.log('清除所有背景圖片，當前數量:', props.backgroundImages.length);
                                                        props.onClearAllBackgroundImages();
                                                    }} 
                                                    variant="danger" 
                                                    className="px-2 py-1 text-sm flex-1"
                                                >
                                                    🗑️ 清除所有圖片
                                                </Button>
                                            )}
                                        </div>
                                    )}
                                </div>
                                
                                {/* 圖片預覽和輪播控制 */}
                                {props.backgroundImages.length > 0 && (
                                    <div className="mt-4 space-y-3">
                                        <div className="text-sm text-gray-300">
                                            已上傳 {props.backgroundImages.length} 張圖片，當前顯示第 {props.currentImageIndex + 1} 張
                                        </div>
                                        
                                        {/* 輪播開關 */}
                                        {props.backgroundImages.length > 1 && (
                                            <div className="flex items-center space-x-3">
                                                <label className="flex items-center space-x-2 cursor-pointer">
                                                    <input
                                                        type="checkbox"
                                                        checked={props.isSlideshowEnabled}
                                                        onChange={(e) => props.onSlideshowEnabledChange(e.target.checked)}
                                                        className="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500 focus:ring-2"
                                                    />
                                                    <span className="text-sm text-gray-300">啟用自動輪播</span>
                                                </label>
                                            </div>
                                        )}
                                        
                                        {/* 輪播間隔設定 */}
                                        {props.isSlideshowEnabled && (
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-300">輪播間隔 (秒)</label>
                                                <input
                                                    type="number"
                                                    min="5"
                                                    max="60"
                                                    value={props.slideshowInterval}
                                                    onChange={(e) => props.onSlideshowIntervalChange(parseInt(e.target.value))}
                                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                                                />
                                            </div>
                                        )}
                                        
                                        {/* 轉場效果選擇 */}
                                        {props.isSlideshowEnabled && (
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-gray-300">轉場效果</label>
                                                <select
                                                    value={props.transitionType}
                                                    onChange={(e) => props.onTransitionTypeChange(e.target.value as TransitionType)}
                                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                                                >
                                                    <option value={TransitionType.TV_STATIC}>📺 電視雜訊</option>
                                                    <option value={TransitionType.FADE}>🌅 淡入淡出</option>
                                                    <option value={TransitionType.SLIDE_LEFT}>⬅️ 向左滑動</option>
                                                    <option value={TransitionType.SLIDE_RIGHT}>➡️ 向右滑動</option>
                                                    <option value={TransitionType.SLIDE_UP}>⬆️ 向上滑動</option>
                                                    <option value={TransitionType.SLIDE_DOWN}>⬇️ 向下滑動</option>
                                                    <option value={TransitionType.ZOOM_IN}>🔍 放大</option>
                                                    <option value={TransitionType.ZOOM_OUT}>🔍 縮小</option>
                                                    <option value={TransitionType.SPIRAL}>🌀 螺旋</option>
                                                    <option value={TransitionType.WAVE}>🌊 波浪</option>
                                                    <option value={TransitionType.DIAMOND}>💎 菱形</option>
                                                    <option value={TransitionType.CIRCLE}>⭕ 圓形</option>
                                                    <option value={TransitionType.BLINDS}>🪟 百葉窗</option>
                                                    <option value={TransitionType.CHECKERBOARD}>🏁 棋盤格</option>
                                                    <option value={TransitionType.RANDOM_PIXELS}>🎲 隨機像素</option>
                                                </select>
                                            </div>
                                        )}
                                        
                                        {/* 過場動畫提示 */}
                                        {props.isSlideshowEnabled && (
                                            <div className="p-3 bg-purple-500/20 border border-purple-400/30 rounded-lg text-sm">
                                                <div className="flex items-center gap-2 text-purple-300">
                                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                                    </svg>
                                                    <span className="font-medium">
                                                        {getTransitionEmoji(props.transitionType)} {props.transitionType}過場
                                                    </span>
                                                </div>
                                                <p className="text-purple-200 text-xs mt-1">
                                                    每 {props.slideshowInterval} 秒自動切換，使用{props.transitionType}效果過場
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </CollapsibleControlSection>

                    {/* 自訂文字設定 */}
                    <CollapsibleControlSection
                        title="自訂文字設定"
                        icon={ICON_PATHS.SETTINGS}
                        priority="medium"
                        defaultExpanded={false}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">自訂文字</label>
                                <input
                                    type="text"
                                    value={props.customText}
                                    onChange={(e) => props.onTextChange(e.target.value)}
                                    placeholder="輸入自訂文字..."
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                                />
                            </div>
                            
                            <SelectControl
                                label="字體"
                                value={props.fontFamily}
                                onChange={(value) => props.onFontFamilyChange(value as FontType)}
                                options={[
                                    // 中文字體
                                    { value: FontType.NOTO_SANS_TC, label: '思源黑體' },
                                    { value: FontType.SOURCE_HAN_SANS, label: '思源黑體 (TC)' },
                                    { value: FontType.CW_TEX_KAI, label: 'cwTeXKai' },
                                    { value: FontType.KLEE_ONE, label: 'Klee One' },
                                    { value: FontType.QINGSONG_1, label: '清松手寫體1' },
                                    { value: FontType.QINGSONG_2, label: '清松手寫體2' },
                                    // 英文字體
                                    { value: FontType.POPPINS, label: '現代 (Poppins)' },
                                    { value: FontType.DANCING_SCRIPT, label: 'Dancing Script' },
                                    { value: FontType.PACIFICO, label: 'Pacifico' },
                                    { value: FontType.LOBSTER, label: 'Lobster' },
                                    { value: FontType.BUNGEE, label: 'Bungee' },
                                    { value: FontType.ORBITRON, label: 'Orbitron' },
                                    { value: FontType.PRESS_START_2P, label: 'Press Start 2P' },
                                    { value: FontType.ROCKNROLL_ONE, label: '搖滾圓體 (RocknRoll One)' },
                                    { value: FontType.REGGAE_ONE, label: 'Reggae One' },
                                    { value: FontType.VT323, label: 'VT323' }
                                ]}
                            />
                            
                            <SelectControl
                                label="視覺效果"
                                value={props.graphicEffect}
                                onChange={(value) => props.onGraphicEffectChange(value as GraphicEffectType)}
                                options={Object.values(GraphicEffectType).map(v => ({ value: v, label: v }))}
                            />
                            
                            <SelectControl
                                label="浮水印位置"
                                value={props.watermarkPosition}
                                onChange={(value) => props.onWatermarkPositionChange(value as WatermarkPosition)}
                                options={Object.values(WatermarkPosition).map(v => ({ value: v, label: v }))}
                            />
                            
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">文字顏色</label>
                                <div className="flex space-x-2">
                                    {PRESET_COLORS.map(color => (
                                        <SwatchButton
                                            key={color}
                                            color={color}
                                            onClick={props.onTextColorChange}
                                            isActive={props.textColor === color}
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                        
                        {/* 文字大小和位置控制 */}
                        <div className="mt-6">
                            <div className="flex items-center space-x-2 mb-4">
                                <Icon path={ICON_PATHS.SETTINGS} className="w-4 h-4 text-cyan-400" />
                                <h4 className="text-md font-semibold text-gray-200">文字大小與位置</h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <SliderControl
                                    label="字體大小 (vw)"
                                    value={props.textSize}
                                    onChange={props.onTextSizeChange}
                                    min={1}
                                    max={10}
                                    step={0.5}
                                    colorType="scale"
                                />
                                
                                <SliderControl
                                    label="水平位置 (%)"
                                    value={props.textPositionX}
                                    onChange={props.onTextPositionXChange}
                                    min={-50}
                                    max={50}
                                    step={5}
                                    colorType="position"
                                />
                                
                                <SliderControl
                                    label="垂直位置 (%)"
                                    value={props.textPositionY}
                                    onChange={props.onTextPositionYChange}
                                    min={-50}
                                    max={50}
                                    step={5}
                                    colorType="position"
                                />
                            </div>
                            
                            {/* 拖拽提示 */}
                            <div className="mt-4 p-3 bg-blue-500/20 border border-blue-400/30 rounded-lg text-sm">
                                <div className="flex items-center gap-2 text-blue-300">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                    <span className="font-medium">💡 拖拽提示</span>
                                </div>
                                <p className="text-blue-200 text-xs mt-1">
                                    使用滑桿調整文字大小和位置，數值範圍為 -50% 到 +50%，0% 為畫面中心位置
                                </p>
                            </div>
                        </div>
                    </CollapsibleControlSection>

                    {/* 字幕設定 */}
                    <CollapsibleControlSection
                        title="字幕設定"
                        icon={ICON_PATHS.SUBTITLES}
                        priority="high"
                        defaultExpanded={false}
                        badge="AI 功能"
                    >
                        <div className="space-y-6">
                            {/* 字幕格式選擇 */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">字幕格式</label>
                                <SelectControl
                                    value={props.subtitleFormat}
                                    onChange={(value) => props.onSubtitleFormatChange(value as SubtitleFormat)}
                                    options={[
                                        { value: SubtitleFormat.BRACKET, label: '方括號格式 [00:00.00]' },
                                        { value: SubtitleFormat.SRT, label: 'SRT格式 00:00:14,676 --> 00:00:19,347' }
                                    ]}
                                />
                            </div>

                            {/* 字幕語言選擇 */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                    <span className="text-lg">🌐</span>
                                    字幕語言
                                </label>
                                <SelectControl
                                    value={props.subtitleLanguage}
                                    onChange={(value) => props.onSubtitleLanguageChange(value as SubtitleLanguage)}
                                    options={[
                                        { value: SubtitleLanguage.CHINESE, label: '🇹🇼 繁體中文' },
                                        { value: SubtitleLanguage.ENGLISH, label: '🇺🇸 English' },
                                        { value: SubtitleLanguage.KOREAN, label: '🇰🇷 한국어' },
                                        { value: SubtitleLanguage.JAPANESE, label: '🇯🇵 日本語' }
                                    ]}
                                />
                                <p className="text-xs text-gray-400 leading-relaxed">
                                    💡 選擇 AI 產生字幕時使用的語言。確保音訊內容與選擇的語言匹配以獲得最佳效果。
                                </p>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">字幕文字</label>
                                <textarea 
                                    value={props.subtitlesRawText}
                                    onChange={(e) => props.onSubtitlesRawTextChange(e.target.value)}
                                    rows={5}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent font-mono text-sm"
                                    placeholder={props.subtitleFormat === SubtitleFormat.BRACKET 
                                        ? "使用格式 [00:00.00] 歌詞文字，或點擊「AI 產生字幕」按鈕自動產生歌詞..."
                                        : "使用格式 00:00:14,676 --> 00:00:19,347 歌詞文字，或點擊「AI 產生字幕」按鈕自動產生歌詞..."
                                    }
                                />
                            </div>
                            
                            <div className="flex items-center justify-between">
                                <div className="relative group">
                                    <Button 
                                        onClick={props.onGenerateSubtitles}
                                        disabled={props.isGeneratingSubtitles || !props.audioFile}
                                        variant="secondary"
                                        className="bg-purple-600 hover:bg-purple-500"
                                    >
                                        {props.isGeneratingSubtitles ? 
                                            <>
                                             <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                                             <span>產生中...</span>
                                            </>
                                            : <>
                                               <Icon path={ICON_PATHS.AI_SPARKLE} className="w-5 h-5" />
                                               <span>AI 產生字幕</span>
                                              </>
                                        }
                                    </Button>
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-80 p-3 bg-gray-900 border border-gray-600 rounded-md text-xs text-left text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                        <div className="space-y-2">
                                            <div className="font-medium text-cyan-300">AI 字幕生成功能</div>
                                            <div>• 直接分析音訊檔並使用 AI 產生字幕</div>
                                            <div>• 過程可能需要一些時間，請耐心等候</div>
                                            <div>• 結果的準確度取決於音訊的清晰度</div>
                                            <div className="text-green-300 font-medium">• 🌟 自動轉換為繁體中文</div>
                                            <div className="text-green-300">• 支援多種語言音訊轉繁體中文</div>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* 字幕下載按鈕 */}
                                <Button
                                    onClick={() => {
                                        if (!props.subtitlesRawText.trim()) {
                                            alert('請先產生字幕！\n\n您可以：\n1. 手動輸入字幕文字\n2. 點擊「AI 產生字幕」按鈕自動產生');
                                            return;
                                        }
                                        
                                        // 根據選擇的格式轉換字幕
                                        const currentFormat = props.subtitleFormat === SubtitleFormat.BRACKET ? 'bracket' : 'srt';
                                        const targetFormat = 'srt'; // 下載時統一轉換為 SRT 格式
                                        const srtContent = convertToFormat(props.subtitlesRawText, currentFormat, targetFormat);
                                        const blob = new Blob([srtContent], { type: 'text/plain;charset=utf-8' });
                                        const url = URL.createObjectURL(blob);
                                        const a = document.createElement('a');
                                        a.href = url;
                                        a.download = 'subtitles.srt';
                                        document.body.appendChild(a);
                                        a.click();
                                        document.body.removeChild(a);
                                        URL.revokeObjectURL(url);
                                    }}
                                    variant="secondary"
                                    className={`${props.subtitlesRawText.trim() ? 'bg-green-600 hover:bg-green-500' : 'bg-gray-500 hover:bg-gray-400'}`}
                                    disabled={!props.subtitlesRawText.trim()}
                                >
                                    <Icon path={ICON_PATHS.DOWNLOAD} className="w-5 h-5" />
                                    <span>下載字幕 (SRT)</span>
                                </Button>
                            </div>
                            
                            {/* 字幕顯示模式選擇器 */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">字幕顯示模式</label>
                                <div className="flex space-x-2">
                                    {Object.values(SubtitleDisplayMode).map((mode) => (
                                        <button
                                            key={mode}
                                            onClick={() => props.onSubtitleDisplayModeChange(mode)}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                                props.subtitleDisplayMode === mode
                                                    ? 'bg-cyan-600 text-white'
                                                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                            }`}
                                        >
                                            {mode === SubtitleDisplayMode.NONE && (
                                                <span className="flex items-center space-x-2">
                                                    <span>🚫</span>
                                                    <span>無字幕</span>
                                                </span>
                                            )}
                                            {mode === SubtitleDisplayMode.CLASSIC && (
                                                <span className="flex items-center space-x-2">
                                                    <span>📝</span>
                                                    <span>傳統字幕</span>
                                                </span>
                                            )}
                                            {mode === SubtitleDisplayMode.LYRICS_SCROLL && (
                                                <span className="flex items-center space-x-2">
                                                    <span>🎵</span>
                                                    <span>捲軸字幕</span>
                                                </span>
                                            )}
                                            {mode === SubtitleDisplayMode.WORD_BY_WORD && (
                                                <span className="flex items-center space-x-2">
                                                    <span>✨</span>
                                                    <span>逐字顯示</span>
                                                </span>
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                <SliderControl
                                    label="字幕字體大小"
                                    value={props.subtitleFontSize}
                                    onChange={props.onSubtitleFontSizeChange}
                                    min={2}
                                    max={8}
                                    step={0.5}
                                />
                                
                                <SelectControl
                                    label="字幕字體"
                                    value={props.subtitleFontFamily}
                                    onChange={(value) => props.onSubtitleFontFamilyChange(value as FontType)}
                                    options={[
                                        // 中文字體
                                        { value: FontType.NOTO_SANS_TC, label: '思源黑體' },
                                        { value: FontType.SOURCE_HAN_SANS, label: '思源黑體 (TC)' },
                                        { value: FontType.CW_TEX_KAI, label: 'cwTeXKai' },
                                        { value: FontType.KLEE_ONE, label: 'Klee One' },
                                        { value: FontType.QINGSONG_1, label: '清松手寫體1' },
                                        { value: FontType.QINGSONG_2, label: '清松手寫體2' },
                                        // 英文字體
                                        { value: FontType.POPPINS, label: '現代 (Poppins)' },
                                        { value: FontType.DANCING_SCRIPT, label: 'Dancing Script' },
                                        { value: FontType.PACIFICO, label: 'Pacifico' },
                                        { value: FontType.LOBSTER, label: 'Lobster' },
                                        { value: FontType.BUNGEE, label: 'Bungee' },
                                        { value: FontType.ORBITRON, label: 'Orbitron' },
                                        { value: FontType.PRESS_START_2P, label: 'Press Start 2P' },
                                        { value: FontType.ROCKNROLL_ONE, label: '搖滾圓體 (RocknRoll One)' },
                                        { value: FontType.REGGAE_ONE, label: 'Reggae One' },
                                        { value: FontType.VT323, label: 'VT323' }
                                    ]}
                                />
                                
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-gray-300">字幕顏色</label>
                                    <div className="flex space-x-2">
                                        {PRESET_COLORS.map(color => (
                                            <SwatchButton
                                                key={color}
                                                color={color}
                                                onClick={props.onSubtitleColorChange}
                                                isActive={props.subtitleColor === color}
                                            />
                                        ))}
                                    </div>
                                </div>
                                
                                <SelectControl
                                    label="字幕背景樣式"
                                    value={props.subtitleBgStyle}
                                    onChange={(value) => props.onSubtitleBgStyleChange(value as SubtitleBgStyle)}
                                    options={Object.values(SubtitleBgStyle).map(v => ({ value: v, label: v }))}
                                />
                            </div>
                        </div>
                    </CollapsibleControlSection>

                    {/* 卷軸歌詞設定 - 只在捲軸歌詞模式下顯示 */}
                    {props.subtitleDisplayMode === SubtitleDisplayMode.LYRICS_SCROLL && (
                        <CollapsibleControlSection
                            title="捲軸歌詞設定"
                            icon={ICON_PATHS.SETTINGS}
                            priority="medium"
                            defaultExpanded={true}
                        >
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-300">捲軸歌詞控制選項</div>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <SliderControl
                                        label="字體大小 (%)"
                                        value={props.lyricsFontSize}
                                        onChange={props.onLyricsFontSizeChange}
                                        min={0.5}
                                        max={10}
                                        step={0.1}
                                        colorType="scale"
                                    />
                                    
                                    <SelectControl
                                        label="字體"
                                        value={props.lyricsFontFamily}
                                        onChange={props.onLyricsFontFamilyChange}
                                        options={[
                                            // 中文字體
                                            { value: FontType.NOTO_SANS_TC, label: '思源黑體' },
                                            { value: FontType.SOURCE_HAN_SANS, label: '思源黑體 (TC)' },
                                            { value: FontType.CW_TEX_KAI, label: 'cwTeXKai' },
                                            { value: FontType.KLEE_ONE, label: 'Klee One' },
                                            { value: FontType.QINGSONG_1, label: '清松手寫體1' },
                                            { value: FontType.QINGSONG_2, label: '清松手寫體2' },
                                            // 英文字體
                                            { value: FontType.POPPINS, label: '現代 (Poppins)' },
                                            { value: FontType.DANCING_SCRIPT, label: 'Dancing Script' },
                                            { value: FontType.PACIFICO, label: 'Pacifico' },
                                            { value: FontType.LOBSTER, label: 'Lobster' },
                                            { value: FontType.BUNGEE, label: 'Bungee' },
                                            { value: FontType.ORBITRON, label: 'Orbitron' },
                                            { value: FontType.PRESS_START_2P, label: 'Press Start 2P' },
                                            { value: FontType.ROCKNROLL_ONE, label: '搖滾圓體 (RocknRoll One)' },
                                            { value: FontType.REGGAE_ONE, label: 'Reggae One' },
                                            { value: FontType.VT323, label: 'VT323' }
                                        ]}
                                        className="sm:col-span-1 md:col-span-2"
                                    />
                                    
                                    <SliderControl
                                        label="水平位置 (%)"
                                        value={props.lyricsPositionX}
                                        onChange={props.onLyricsPositionXChange}
                                        min={-50}
                                        max={50}
                                        step={5}
                                        colorType="position"
                                    />
                                    
                                    <SliderControl
                                        label="垂直位置 (%)"
                                        value={props.lyricsPositionY}
                                        onChange={props.onLyricsPositionYChange}
                                        min={-50}
                                        max={50}
                                        step={5}
                                        colorType="position"
                                    />
                                </div>
                            </div>
                        </CollapsibleControlSection>
                    )}

                    {/* 可夜視覺化專用面板 */}
                    {props.visualizationType === VisualizationType.GEOMETRIC_BARS && (
                        <CollapsibleControlSection
                            title="可夜視覺化專用面板"
                            icon="🔧"
                            priority="high"
                            defaultExpanded={true}
                            badge="自定義"
                        >
                            <div className="space-y-6">
                                {/* 歌曲資訊輸入 */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            歌曲名稱
                                        </label>
                                        <input
                                            type="text"
                                            value={props.geometricSongName || ''}
                                            onChange={(e) => props.onGeometricSongNameChange?.(e.target.value)}
                                            placeholder="輸入歌曲名稱..."
                                            className="w-full px-3 py-2 bg-gray-900 border-2 border-black rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                                        />
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            歌手名稱
                                        </label>
                                        <input
                                            type="text"
                                            value={props.geometricArtistName || ''}
                                            onChange={(e) => props.onGeometricArtistNameChange?.(e.target.value)}
                                            placeholder="輸入歌手名稱..."
                                            className="w-full px-3 py-2 bg-gray-900 border-2 border-black rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition"
                                        />
                                    </div>
                                </div>
                                
                                {/* 方框圖片上傳 */}
                                <div className="space-y-3">
                                    <label className="block text-sm font-medium text-gray-300">
                                        方框圖片
                                    </label>
                                    <div className="flex items-center space-x-3">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={props.onGeometricFrameImageUpload}
                                            className="hidden"
                                            id="frame-image-upload"
                                        />
                                        <label
                                            htmlFor="frame-image-upload"
                                            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg cursor-pointer transition-colors"
                                        >
                                            選擇圖片
                                        </label>
                                        {props.geometricFrameImage && (
                                            <button
                                                onClick={props.onClearGeometricFrameImage}
                                                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                            >
                                                清除
                                            </button>
                                        )}
                                    </div>
                                    {props.geometricFrameImage && (
                                        <div className="mt-2">
                                            <img
                                                src={props.geometricFrameImage}
                                                alt="方框預覽"
                                                className="w-20 h-20 object-cover rounded border"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* 半圓圖片上傳 */}
                                <div className="space-y-3">
                                    <label className="block text-sm font-medium text-gray-300">
                                        半圓圖片
                                    </label>
                                    <div className="flex items-center space-x-3">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={props.onGeometricSemicircleImageUpload}
                                            className="hidden"
                                            id="semicircle-image-upload"
                                        />
                                        <label
                                            htmlFor="semicircle-image-upload"
                                            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg cursor-pointer transition-colors"
                                        >
                                            選擇圖片
                                        </label>
                                        {props.geometricSemicircleImage && (
                                            <button
                                                onClick={props.onClearGeometricSemicircleImage}
                                                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                            >
                                                清除
                                            </button>
                                        )}
                                    </div>
                                    {props.geometricSemicircleImage && (
                                        <div className="mt-2">
                                            <img
                                                src={props.geometricSemicircleImage}
                                                alt="半圓預覽"
                                                className="w-20 h-20 object-cover rounded border"
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* 控制卡設置 */}
                                <div className="space-y-4 border-t border-gray-600 pt-4">
                                    <h4 className="text-sm font-medium text-cyan-400">控制卡設置</h4>
                                    
                                    {/* 控制卡開關 */}
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-medium text-gray-300">
                                            顯示控制卡
                                        </label>
                                        <button
                                            onClick={() => props.onControlCardEnabledChange?.(!props.controlCardEnabled)}
                                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
                                                props.controlCardEnabled ? 'bg-cyan-500' : 'bg-gray-600'
                                            }`}
                                        >
                                            <span
                                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                    props.controlCardEnabled ? 'translate-x-6' : 'translate-x-1'
                                                }`}
                                            />
                                        </button>
                                    </div>

                                    {props.controlCardEnabled && (
                                        <>
                                            {/* 字體大小 */}
                                            <SliderControl
                                                label="字體大小"
                                                value={props.controlCardFontSize || 24}
                                                onChange={props.onControlCardFontSizeChange || (() => {})}
                                                min={24}
                                                max={100}
                                                step={1}
                                                unit="px"
                                            />

                                            {/* 控制卡樣式 */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                                    控制卡樣式
                                                </label>
                                                <select
                                                    value={props.controlCardStyle}
                                                    onChange={(e) => props.onControlCardStyleChange?.(e.target.value as ControlCardStyle)}
                                                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                                >
                                                    <option value={ControlCardStyle.FILLED}>🎨 填充模式</option>
                                                    <option value={ControlCardStyle.OUTLINE}>📦 外框模式</option>
                                                    <option value={ControlCardStyle.TRANSPARENT}>👻 透明模式</option>
                                                </select>
                                            </div>

                                            {/* 文字顏色 */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-300 mb-2">
                                                    文字顏色
                                                </label>
                                                <div className="flex space-x-2">
                                                    <input
                                                        type="color"
                                                        value={props.controlCardColor || '#ffffff'}
                                                        onChange={(e) => props.onControlCardColorChange?.(e.target.value)}
                                                        className="w-12 h-8 rounded border border-gray-600 cursor-pointer"
                                                    />
                                                    <input
                                                        type="text"
                                                        value={props.controlCardColor || '#ffffff'}
                                                        onChange={(e) => props.onControlCardColorChange?.(e.target.value)}
                                                        className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                                                        placeholder="#ffffff"
                                                    />
                                                </div>
                                            </div>

                                            {/* 背景顏色 (僅填充模式) */}
                                            {props.controlCardStyle === ControlCardStyle.FILLED && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                                        背景顏色
                                                    </label>
                                                    <div className="flex space-x-2">
                                                        <input
                                                            type="color"
                                                            value={props.controlCardBackgroundColor || 'rgba(100, 120, 100, 0.9)'}
                                                            onChange={(e) => props.onControlCardBackgroundColorChange?.(e.target.value)}
                                                            className="w-12 h-8 rounded border border-gray-600 cursor-pointer"
                                                        />
                                                        <input
                                                            type="text"
                                                            value={props.controlCardBackgroundColor || 'rgba(100, 120, 100, 0.9)'}
                                                            onChange={(e) => props.onControlCardBackgroundColorChange?.(e.target.value)}
                                                            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent text-sm"
                                                            placeholder="rgba(100, 120, 100, 0.9)"
                                                        />
                                                    </div>
                                                </div>
                                            )}

                                            {/* 自動切換歌曲 */}
                                            <div className="flex items-center justify-between">
                                                <label className="text-sm font-medium text-gray-300">
                                                    自動切換歌曲
                                                </label>
                                                <button
                                                    onClick={() => props.onAutoChangeSongChange?.(!props.autoChangeSong)}
                                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
                                                        props.autoChangeSong ? 'bg-cyan-500' : 'bg-gray-600'
                                                    }`}
                                                >
                                                    <span
                                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                                            props.autoChangeSong ? 'translate-x-6' : 'translate-x-1'
                                                        }`}
                                                    />
                                                </button>
                                            </div>

                                            {/* 歌名列表 */}
                                            {props.songNameList && props.songNameList.length > 0 && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                                        歌名列表 ({props.songNameList.length} 首)
                                                    </label>
                                                    <div className="bg-gray-800 rounded-lg p-3 max-h-32 overflow-y-auto">
                                                        {props.songNameList.map((song, index) => (
                                                            <div key={index} className="text-xs text-gray-300 py-1">
                                                                {index + 1}. {song}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        歌名會從字幕中自動提取，播放到 95% 時自動切換到下一首
                                                    </p>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>

                            </div>
                        </CollapsibleControlSection>
                    )}

                    {/* Z總訂製款控制面板 */}
                    {props.visualizationType === VisualizationType.Z_CUSTOM && (
                        <CollapsibleControlSection
                            title="Z總訂製款控制"
                            icon={ICON_PATHS.SETTINGS}
                            priority="high"
                            defaultExpanded={true}
                            badge="黑膠唱片"
                        >
                            <div className="space-y-4">
                                {/* 中央圖片上傳 */}
                                <div className="space-y-3">
                                    <label className="block text-sm font-medium text-gray-300">
                                        中央圖片
                                    </label>
                                    <div className="flex items-center space-x-3">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={props.onZCustomCenterImageUpload}
                                            className="hidden"
                                            id="z-custom-center-image-upload"
                                        />
                                        <label
                                            htmlFor="z-custom-center-image-upload"
                                            className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg cursor-pointer transition-colors"
                                        >
                                            選擇圖片
                                        </label>
                                        {props.zCustomCenterImage && (
                                            <button
                                                onClick={props.onClearZCustomCenterImage}
                                                className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                            >
                                                清除
                                            </button>
                                        )}
                                    </div>
                                    {props.zCustomCenterImage && (
                                        <div className="mt-2">
                                            <img
                                                src={props.zCustomCenterImage}
                                                alt="中央圖片預覽"
                                                className="w-20 h-20 object-cover rounded border"
                                            />
                                        </div>
                                    )}
                                </div>
                                
                                {/* 大小控制 */}
                                <SliderControl
                                    label="可視化大小"
                                    value={props.zCustomScale || 1.0}
                                    onChange={props.onZCustomScaleChange || (() => {})}
                                    min={0.1}
                                    max={3.0}
                                    step={0.1}
                                    unit="倍"
                                />
                                
                                {/* 位置控制 */}
                                <div className="space-y-3">
                                    <label className="block text-sm font-medium text-gray-300">
                                        位置調整
                                    </label>
                                    <div className="grid grid-cols-2 gap-3">
                                        <SliderControl
                                            label="水平位置"
                                            value={props.zCustomPosition?.x || 0}
                                            onChange={(x) => props.onZCustomPositionUpdate?.({ 
                                                x, 
                                                y: props.zCustomPosition?.y || 0 
                                            })}
                                            min={-100}
                                            max={100}
                                            step={1}
                                            unit="%"
                                        />
                                        <SliderControl
                                            label="垂直位置"
                                            value={props.zCustomPosition?.y || 0}
                                            onChange={(y) => props.onZCustomPositionUpdate?.({ 
                                                x: props.zCustomPosition?.x || 0, 
                                                y 
                                            })}
                                            min={-100}
                                            max={100}
                                            step={1}
                                            unit="%"
                                        />
                                    </div>
                                </div>
                            </div>
                        </CollapsibleControlSection>
                    )}

                    {/* 設置管理 */}
                    <CollapsibleControlSection
                        title="設置管理"
                        icon={ICON_PATHS.SETTINGS}
                        priority="low"
                        defaultExpanded={false}
                        badge="保存/載入"
                    >
                        <SettingsManagerComponent
                            onLoadSettings={handleLoadSettings}
                            currentSettings={getCurrentSettings()}
                        />
                    </CollapsibleControlSection>

                    {/* 全畫面濾鏡特效控制 */}
                    <CollapsibleControlSection
                        title="全畫面濾鏡特效"
                        icon="✨"
                        priority="medium"
                        defaultExpanded={false}
                        badge={props.filterEffectEnabled ? "開啟" : "關閉"}
                    >
                        <div className="space-y-4">
                            {/* 濾鏡特效開關 */}
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium text-gray-300">
                                    啟用濾鏡特效
                                </label>
                                <button
                                    onClick={() => props.onFilterEffectEnabledChange?.(!props.filterEffectEnabled)}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-800 ${
                                        props.filterEffectEnabled ? 'bg-cyan-500' : 'bg-gray-600'
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                            props.filterEffectEnabled ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                    />
                                </button>
                            </div>

                            {props.filterEffectEnabled && (
                                <>
                                    {/* 濾鏡特效類型選擇 */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">
                                            特效類型
                                        </label>
                                        <select
                                            value={props.filterEffectType}
                                            onChange={(e) => props.onFilterEffectTypeChange?.(e.target.value as FilterEffectType)}
                                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                                        >
                                            <option value={FilterEffectType.SNOW}>❄️ 雪花飄落</option>
                                            <option value={FilterEffectType.PARTICLES}>✨ 光點飄落</option>
                                            <option value={FilterEffectType.STARS}>⭐ 星空閃爍</option>
                                            <option value={FilterEffectType.RAIN}>🌧️ 雨滴效果</option>
                                            <option value={FilterEffectType.CHERRY_BLOSSOM}>🌸 櫻花飄落</option>
                                        </select>
                                    </div>

                                    {/* 濾鏡特效強度 */}
                                    <SliderControl
                                        label="特效強度"
                                        value={props.filterEffectIntensity || 0.5}
                                        onChange={props.onFilterEffectIntensityChange || (() => {})}
                                        min={0}
                                        max={1}
                                        step={0.1}
                                        unit="%"
                                        transform={(v) => Math.round(v * 100)}
                                    />

                                    {/* 濾鏡特效透明度 */}
                                    <SliderControl
                                        label="透明度"
                                        value={props.filterEffectOpacity || 0.6}
                                        onChange={props.onFilterEffectOpacityChange || (() => {})}
                                        min={0}
                                        max={1}
                                        step={0.1}
                                        unit="%"
                                        transform={(v) => Math.round(v * 100)}
                                    />

                                    {/* 濾鏡特效速度 */}
                                    <SliderControl
                                        label="特效速度"
                                        value={props.filterEffectSpeed || 1.0}
                                        onChange={props.onFilterEffectSpeedChange || (() => {})}
                                        min={0.5}
                                        max={2}
                                        step={0.1}
                                        unit="x"
                                        transform={(v) => v.toFixed(1)}
                                    />
                                </>
                            )}
                        </div>
                    </CollapsibleControlSection>

                </div>
            </div>
        </div>
    );
};

// 獲取轉場效果對應的表情符號
const getTransitionEmoji = (transitionType: TransitionType): string => {
    switch (transitionType) {
        case TransitionType.TV_STATIC:
            return '📺';
        case TransitionType.FADE:
            return '🌅';
        case TransitionType.SLIDE_LEFT:
            return '⬅️';
        case TransitionType.SLIDE_RIGHT:
            return '➡️';
        case TransitionType.SLIDE_UP:
            return '⬆️';
        case TransitionType.SLIDE_DOWN:
            return '⬇️';
        case TransitionType.ZOOM_IN:
            return '🔍';
        case TransitionType.ZOOM_OUT:
            return '🔍';
        case TransitionType.SPIRAL:
            return '🌀';
        case TransitionType.WAVE:
            return '🌊';
        case TransitionType.DIAMOND:
            return '💎';
        case TransitionType.CIRCLE:
            return '⭕';
        case TransitionType.BLINDS:
            return '🪟';
        case TransitionType.CHECKERBOARD:
            return '🏁';
        case TransitionType.RANDOM_PIXELS:
            return '🎲';
        default:
            return '📺';
    }
};

export default OptimizedControls;
