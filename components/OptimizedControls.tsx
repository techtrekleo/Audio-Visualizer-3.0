import React, { useState } from 'react';
import { VisualizationType, FontType, BackgroundColorType, ColorPaletteType, Resolution, GraphicEffectType, WatermarkPosition, SubtitleBgStyle, SubtitleDisplayMode } from '../types';
import Icon from './Icon';
import { ICON_PATHS } from '../constants';
import CollapsibleControlSection from './CollapsibleControlSection';
import QuickSettingsPanel from './QuickSettingsPanel';
import SettingsManagerComponent from './SettingsManagerComponent';
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
    subtitleEffect: GraphicEffectType;
    onSubtitleEffectChange: (effect: GraphicEffectType) => void;
    subtitleBgStyle: SubtitleBgStyle;
    onSubtitleBgStyleChange: (style: SubtitleBgStyle) => void;
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
    lyricsPositionX: number;
    onLyricsPositionXChange: (value: number) => void;
    lyricsPositionY: number;
    onLyricsPositionYChange: (value: number) => void;
    subtitleDisplayMode: SubtitleDisplayMode;
    onSubtitleDisplayModeChange: (mode: SubtitleDisplayMode) => void;
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
        [FontType.ROCKNROLL_ONE]: '搖滾圓體',
        [FontType.REGGAE_ONE]: '雷鬼 Stencil',
        [FontType.VT323]: '立體裝甲',
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
                    />
                </div>
            )}

            {/* 主要控制面板 */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-2xl p-6">
                {/* 播放控制 - 始終顯示 */}
                <div className="mb-6">
                    <div className="flex items-center space-x-2 mb-4">
                        <Icon path={ICON_PATHS.PLAY} className="w-5 h-5 text-cyan-400" />
                        <h3 className="text-lg font-semibold text-gray-200">播放控制</h3>
                    </div>
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center space-x-3">
                            <Button onClick={props.onPlayPause} variant="primary" className="w-14 h-14 text-2xl !p-0 shadow-xl">
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
                        <div className="flex items-center space-x-3">
                            <label className="px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-500 text-white shadow-lg hover:shadow-xl cursor-pointer">
                                <Icon path={ICON_PATHS.UPLOAD} className="w-5 h-5"/>
                                <span>{props.audioFile ? '更換音樂' : '上傳音樂'}</span>
                                <input 
                                    type="file" 
                                    className="hidden" 
                                    accept="audio/*" 
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            props.onFileSelect(e.target.files[0]);
                                        }
                                        e.target.value = '';
                                    }} 
                                />
                            </label>
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                                        上傳圖片
                                        <input type="file" className="hidden" accept="image/*" onChange={handleBackgroundImageChange} />
                                    </label>
                                    {props.backgroundImage && (
                                        <Button onClick={props.onClearBackgroundImage} variant="danger" className="px-2 py-1 text-sm">
                                            清除
                                        </Button>
                                    )}
                                </div>
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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                                options={Object.entries(FONT_MAP).map(([value, label]) => ({ value, label }))}
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
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">字幕文字 (使用格式 [00:00.00] 或由 AI 生成)</label>
                                <textarea 
                                    value={props.subtitlesRawText}
                                    onChange={(e) => props.onSubtitlesRawTextChange(e.target.value)}
                                    rows={5}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent font-mono text-sm"
                                    placeholder="使用格式 [00:00.00] 歌詞文字，或點擊「AI 產生字幕」按鈕自動產生歌詞..."
                                />
                            </div>
                            
                            <div className="flex items-center justify-between">
                                </div>
                                
                                {/* 下載字幕按鈕 */}
                                {props.subtitlesRawText.trim() && (
                                    <Button
                                        onClick={() => {
                                            const blob = new Blob([props.subtitlesRawText], { type: 'text/plain;charset=utf-8' });
                                            const url = URL.createObjectURL(blob);
                                            const a = document.createElement('a');
                                            a.href = url;
                                            a.download = `${props.audioFile?.name.replace(/\.[^/.]+$/, "") || 'subtitles'}.lrc`;
                                            document.body.appendChild(a);
                                            a.click();
                                            document.body.removeChild(a);
                                            URL.revokeObjectURL(url);
                                        }}
                                        variant="secondary"
                                        className="bg-green-600 hover:bg-green-500"
                                    >
                                        <Icon path={ICON_PATHS.DOWNLOAD} className="w-5 h-5" />
                                        <span>下載字幕</span>
                                    </Button>
                                )}
                            </div>                                <div className="relative group">
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
                                        </button>
                                    ))}
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                                    options={Object.entries(FONT_MAP).map(([value, label]) => ({ value, label }))}
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
                                    label="字幕效果"
                                    value={props.subtitleEffect}
                                    onChange={(value) => props.onSubtitleEffectChange(value as GraphicEffectType)}
                                    options={Object.values(GraphicEffectType).map(v => ({ value: v, label: v }))}
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
                                        min={2}
                                        max={10}
                                        step={0.5}
                                        colorType="scale"
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
                </div>
            </div>
        </div>
    );
};

export default OptimizedControls;
