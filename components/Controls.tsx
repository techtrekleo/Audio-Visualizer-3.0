import React, { useState, useEffect } from 'react';
import { VisualizationType, FontType, BackgroundColorType, ColorPaletteType, Resolution, GraphicEffectType, WatermarkPosition, SubtitleBgStyle } from '../types';
import Icon from './Icon';
import { ICON_PATHS } from '../constants';

interface ControlsProps {
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
}

const Button: React.FC<React.PropsWithChildren<{ onClick?: () => void; className?: string; disabled?: boolean }>> = ({ children, onClick, className = '', disabled=false }) => (
    <button onClick={onClick} disabled={disabled} className={`px-4 py-2 rounded-md font-semibold transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}>
        {children}
    </button>
);

const SwatchButton: React.FC<{
    color: string;
    onClick: (color: string) => void;
    isActive: boolean;
}> = ({ color, onClick, isActive }) => (
    <button
        type="button"
        onClick={() => onClick(color)}
        className={`w-6 h-6 rounded-full border-2 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-400 ${
            isActive ? 'border-white scale-110' : 'border-gray-700'
        }`}
        style={{ backgroundColor: color }}
        aria-label={`Set text color to ${color}`}
    />
);

const Controls: React.FC<ControlsProps> = ({
    isPlaying,
    onPlayPause,
    isRecording,
    onRecordToggle,
    isLoading,
    visualizationType,
    onVisualizationChange,
    customText,
    onTextChange,
    textColor,
    onTextColorChange,
    fontFamily,
    onFontFamilyChange,
    graphicEffect,
    onGraphicEffectChange,
    sensitivity,
    onSensitivityChange,
    smoothing,
    onSmoothingChange,
    equalization,
    onEqualizationChange,
    audioFile,
    onClearAudio,
    videoUrl,
    videoExtension,
    backgroundColor,
    onBackgroundColorChange,
    colorPalette,
    onColorPaletteChange,
    resolution,
    onResolutionChange,
    backgroundImage,
    onBackgroundImageSelect,
    onClearBackgroundImage,
    watermarkPosition,
    onWatermarkPositionChange,
    waveformStroke,
    onWaveformStrokeChange,
    subtitlesRawText,
    onSubtitlesRawTextChange,
    onGenerateSubtitles,
    isGeneratingSubtitles,
    showSubtitles,
    onShowSubtitlesChange,
    subtitleFontSize,
    onSubtitleFontSizeChange,
    subtitleFontFamily,
    onSubtitleFontFamilyChange,
    subtitleColor,
    onSubtitleColorChange,
    subtitleEffect,
    onSubtitleEffectChange,
    subtitleBgStyle,
    onSubtitleBgStyleChange,
    effectScale,
    onEffectScaleChange,
    effectOffsetX,
    onEffectOffsetXChange,
    effectOffsetY,
    onEffectOffsetYChange,
}) => {
    const [isInvalidLrc, setIsInvalidLrc] = useState(false);

    useEffect(() => {
        if (!subtitlesRawText) {
            setIsInvalidLrc(false);
            return;
        }
        // A line is valid if it contains a timestamp. We check if ANY line is valid.
        // If no lines are valid, but the text is not empty, then the format is invalid.
        const hasAtLeastOneValidLine = subtitlesRawText
            .split('\n')
            .some(line => /\[\d{2}:\d{2}\.\d{2,3}\]/.test(line));

        setIsInvalidLrc(!hasAtLeastOneValidLine);
    }, [subtitlesRawText]);

    const PRESET_COLORS = ['#FFFFFF', '#67E8F9', '#F472B6', '#FFD700', '#FF4500', '#A78BFA'];

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
                onBackgroundImageSelect(file);
            } else {
                alert('請上傳有效的圖片檔案。');
            }
        }
        e.target.value = '';
    };

    return (
        <div className="w-full max-w-7xl p-4 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-lg shadow-lg flex flex-col gap-4">
            {/* --- Main Player Controls --- */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                 <div className="flex items-center space-x-2">
                    <Button onClick={onPlayPause} className="bg-cyan-600 hover:bg-cyan-500 text-white w-12 h-12 text-2xl !p-0">
                        <Icon path={isPlaying ? ICON_PATHS.PAUSE : ICON_PATHS.PLAY} className="w-6 h-6" />
                    </Button>
                    <Button 
                        onClick={onRecordToggle} 
                        className={`${isRecording ? 'bg-red-500 hover:bg-red-400 animate-pulse' : 'bg-gray-600 hover:bg-gray-500'}`}
                        disabled={isLoading || isGeneratingSubtitles}
                    >
                        {isLoading ? 
                            <>
                                <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                                <span>處理中...</span>
                            </>
                            : <>
                                <Icon path={isRecording ? ICON_PATHS.RECORD_STOP : ICON_PATHS.RECORD_START} className="w-5 h-5" />
                                <span>{isRecording ? '停止' : '錄製'}</span>
                            </>
                        }
                    </Button>
                </div>
                <div className="flex items-center space-x-3">
                    {audioFile && (
                         <Button onClick={onClearAudio} className="bg-orange-600 hover:bg-orange-500 text-white">
                           <Icon path={ICON_PATHS.CHANGE_MUSIC} className="w-5 h-5"/>
                           <span>更換音樂</span>
                        </Button>
                    )}
                    {audioFile && (
                        <a href={URL.createObjectURL(audioFile)} download={audioFile.name} className="px-4 py-2 rounded-md font-semibold transition-all duration-200 flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-500 text-white">
                            <Icon path={ICON_PATHS.DOWNLOAD} />
                            <span>音樂</span>
                        </a>
                    )}
                    {videoUrl && (
                        <a href={videoUrl} download={`${audioFile?.name.replace(/\.[^/.]+$/, "") || 'visualization'}.${videoExtension}`} className="px-4 py-2 rounded-md font-semibold transition-all duration-200 flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-500 text-white">
                            <Icon path={ICON_PATHS.DOWNLOAD} />
                            <span>下載 {videoExtension.toUpperCase()}</span>
                        </a>
                    )}
                </div>
            </div>

            <hr className="border-gray-700"/>
            
            {/* --- Customization Controls --- */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-x-4 gap-y-6">
                
                {/* Visual Style */}
                <div className="flex flex-col">
                    <label htmlFor="vis-select" className="text-sm text-gray-400 mb-1">視覺風格</label>
                    <select 
                        id="vis-select"
                        value={visualizationType} 
                        onChange={(e) => onVisualizationChange(e.target.value as VisualizationType)}
                        className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isRecording}
                    >
                        {Object.values(VisualizationType).map(v => (
                            <option key={v} value={v}>{v}</option>
                        ))}
                    </select>
                </div>

                {/* Color Theme */}
                <div className="flex flex-col">
                    <label htmlFor="palette-select" className="text-sm text-gray-400 mb-1">顏色主題</label>
                    <div className="relative">
                        <select
                            id="palette-select"
                            value={colorPalette}
                            onChange={(e) => onColorPaletteChange(e.target.value as ColorPaletteType)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isRecording}
                        >
                            {Object.values(ColorPaletteType).map(v => (
                                <option key={v} value={v}>{v}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Resolution */}
                <div className="flex flex-col">
                    <label htmlFor="res-select" className="text-sm text-gray-400 mb-1">解析度</label>
                    <select
                        id="res-select"
                        value={resolution}
                        onChange={(e) => onResolutionChange(e.target.value as Resolution)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isRecording}
                    >
                        {Object.values(Resolution).map(v => (
                             <option key={v} value={v}>{v}</option>
                        ))}
                    </select>
                </div>
                
                {/* Background Color */}
                <div className="flex flex-col">
                    <div className="flex items-center gap-1 mb-1 relative group">
                        <label htmlFor="bg-select" className="text-sm text-gray-400">背景顏色</label>
                        <div className="text-gray-500 cursor-help">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clipRule="evenodd" /></svg>
                        </div>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-gray-900 border border-gray-600 rounded-md text-xs text-center text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            '透明' 背景會匯出 .webm 檔案，某些編輯器可能需要轉檔。其他背景則會匯出更相容的 .mp4 檔案。
                        </div>
                    </div>
                    <select
                        id="bg-select"
                        value={backgroundColor}
                        onChange={(e) => onBackgroundColorChange(e.target.value as BackgroundColorType)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isRecording}
                    >
                        {Object.values(BackgroundColorType).map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                </div>

                {/* Background Image */}
                <div className="flex flex-col">
                    <label className="text-sm text-gray-400 mb-1">背景圖片</label>
                    <div className="flex items-center gap-2">
                        <label className="flex-grow text-center bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded-md font-semibold transition-all duration-200 cursor-pointer">
                            上傳
                            <input id="bg-image-upload" type="file" className="hidden" accept="image/*" onChange={handleBackgroundImageChange} />
                        </label>
                        {backgroundImage && (
                            <button onClick={onClearBackgroundImage} className="bg-red-600 hover:bg-red-500 text-white px-3 py-2 rounded-md font-semibold transition-colors">
                                清除
                            </button>
                        )}
                    </div>
                </div>

                {/* Custom Text */}
                <div className="flex flex-col">
                    <label htmlFor="text-input" className="text-sm text-gray-400 mb-1">自訂文字</label>
                    <div className="relative">
                        <input
                            id="text-input"
                            type="text"
                            value={customText}
                            onChange={(e) => onTextChange(e.target.value)}
                            placeholder="您的文字"
                            className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                        />
                    </div>
                </div>

                {/* Font Family */}
                <div className="flex flex-col">
                    <label htmlFor="font-select" className="text-sm text-gray-400 mb-1">字體</label>
                    <select
                        id="font-select"
                        value={fontFamily}
                        onChange={(e) => onFontFamilyChange(e.target.value as FontType)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    >
                        {Object.values(FontType).map(v => <option key={v} value={v}>{FONT_MAP[v]}</option>)}
                    </select>
                </div>

                {/* Text Color */}
                 <div className="flex flex-col">
                    <label className="text-sm text-gray-400 mb-1">文字顏色</label>
                    <div className="flex items-center gap-2">
                        <input
                            id="text-color-input"
                            type="color"
                            value={textColor}
                            onChange={(e) => onTextColorChange(e.target.value)}
                            className="bg-gray-700 border border-gray-600 rounded-md p-1 h-10 w-12 cursor-pointer"
                            aria-label="Custom text color"
                        />
                        <div className="flex items-center gap-1.5 p-1 rounded-md bg-gray-900/50 flex-wrap">
                            {PRESET_COLORS.map(color => (
                                <SwatchButton
                                    key={color}
                                    color={color}
                                    onClick={onTextColorChange}
                                    isActive={textColor.toLowerCase() === color.toLowerCase()}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Text Effect */}
                 <div className="flex flex-col">
                    <label htmlFor="effect-select" className="text-sm text-gray-400 mb-1">文字特效</label>
                    <select
                        id="effect-select"
                        value={graphicEffect}
                        onChange={(e) => onGraphicEffectChange(e.target.value as GraphicEffectType)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none disabled:opacity-50"
                        disabled={isRecording}
                    >
                        {Object.values(GraphicEffectType).map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                </div>

                 {/* Watermark Position */}
                <div className="flex flex-col">
                    <label htmlFor="watermark-pos-select" className="text-sm text-gray-400 mb-1">浮水印位置</label>
                    <div className="relative">
                        <select
                            id="watermark-pos-select"
                            value={watermarkPosition}
                            onChange={(e) => onWatermarkPositionChange(e.target.value as WatermarkPosition)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                        >
                            {Object.values(WatermarkPosition).map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                    </div>
                </div>
                 
                {/* Waveform Stroke */}
                <div className="flex flex-col">
                    <div className="flex items-center gap-1 mb-1 relative group">
                        <label htmlFor="waveform-stroke-toggle" className="text-sm text-gray-400">聲波描邊</label>
                         <div className="text-gray-500 cursor-help">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4"><path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clipRule="evenodd" /></svg>
                        </div>
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-gray-900 border border-gray-600 rounded-md text-xs text-center text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                            啟用後，會在視覺化波形周圍增加深色外框，以提高在明亮背景下的可見度。
                        </div>
                    </div>
                     <button
                        id="waveform-stroke-toggle"
                        onClick={() => onWaveformStrokeChange(!waveformStroke)}
                        disabled={isRecording}
                        type="button"
                        className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed ${waveformStroke ? 'bg-cyan-600' : 'bg-gray-600'}`}
                        aria-pressed={waveformStroke}
                    >
                        <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${waveformStroke ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>

                {/* Sensitivity */}
                <div className="flex flex-col">
                    <label htmlFor="sensitivity-slider" className="text-sm text-gray-400 mb-1">靈敏度 ({sensitivity.toFixed(1)})</label>
                    <input
                        id="sensitivity-slider"
                        type="range"
                        min="0.1"
                        max="2.5"
                        step="0.1"
                        value={sensitivity}
                        onChange={(e) => onSensitivityChange(parseFloat(e.target.value))}
                        className="w-full cursor-pointer accent-cyan-500"
                        aria-label="Visualization sensitivity"
                    />
                </div>
                {/* Balance */}
                 <div className="flex flex-col">
                    <label htmlFor="balance-slider" className="text-sm text-gray-400 mb-1">平衡 ({equalization.toFixed(2)})</label>
                    <input
                        id="balance-slider"
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={equalization}
                        onChange={(e) => onEqualizationChange(parseFloat(e.target.value))}
                        className="w-full cursor-pointer accent-cyan-500"
                        aria-label="Visualization frequency balance"
                    />
                </div>
                {/* Smoothing */}
                <div className="flex flex-col">
                    <label htmlFor="smoothing-slider" className="text-sm text-gray-400 mb-1">平滑度 ({smoothing})</label>
                    <input
                        id="smoothing-slider"
                        type="range"
                        min="0"
                        max="10"
                        step="1"
                        value={smoothing}
                        onChange={(e) => onSmoothingChange(parseInt(e.target.value, 10))}
                        className="w-full cursor-pointer accent-cyan-500"
                        aria-label="Visualization smoothing"
                    />
                </div>

                {/* --- Effect Transform Controls --- */}
                <div className="flex flex-col">
                    <label htmlFor="scale-slider" className="text-sm text-gray-400 mb-1">特效大小 ({effectScale.toFixed(2)})</label>
                    <input
                        id="scale-slider"
                        type="range"
                        min="0.1"
                        max="2.0"
                        step="0.05"
                        value={effectScale}
                        onChange={(e) => onEffectScaleChange(parseFloat(e.target.value))}
                        className="w-full cursor-pointer accent-cyan-500"
                        aria-label="Effect scale"
                    />
                </div>
                <div className="flex flex-col">
                    <label htmlFor="offsetx-slider" className="text-sm text-gray-400 mb-1">水平位移 ({effectOffsetX}px)</label>
                    <input
                        id="offsetx-slider"
                        type="range"
                        min="-500"
                        max="500"
                        step="10"
                        value={effectOffsetX}
                        onChange={(e) => onEffectOffsetXChange(parseInt(e.target.value, 10))}
                        className="w-full cursor-pointer accent-cyan-500"
                        aria-label="Effect X offset"
                    />
                </div>
                <div className="flex flex-col">
                    <label htmlFor="offsety-slider" className="text-sm text-gray-400 mb-1">垂直位移 ({effectOffsetY}px)</label>
                    <input
                        id="offsety-slider"
                        type="range"
                        min="-500"
                        max="500"
                        step="10"
                        value={effectOffsetY}
                        onChange={(e) => onEffectOffsetYChange(parseInt(e.target.value, 10))}
                        className="w-full cursor-pointer accent-cyan-500"
                        aria-label="Effect Y offset"
                    />
                </div>
            </div>
            
            <hr className="border-gray-700"/>

            {/* --- Subtitle Section --- */}
            <details className="w-full bg-gray-900/50 p-4 rounded-lg border border-gray-700" open>
                <summary className="cursor-pointer font-semibold text-lg flex items-center gap-2">
                    <Icon path={ICON_PATHS.SUBTITLES} className="w-6 h-6 text-cyan-400" />
                    字幕設定
                </summary>
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="flex flex-col col-span-full">
                        <label htmlFor="subtitle-text" className="text-sm text-gray-400 mb-1">字幕文字 (在此貼上或由 AI 生成)</label>
                        <textarea 
                            id="subtitle-text"
                            value={subtitlesRawText}
                            onChange={(e) => onSubtitlesRawTextChange(e.target.value)}
                            rows={5}
                            className="bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none w-full font-mono text-sm"
                            placeholder="點擊「AI 產生字幕」按鈕自動產生歌詞..."
                        />
                        {isInvalidLrc && (
                            <p className="text-red-400 text-xs mt-1">
                                格式錯誤。請使用標準 LRC 格式，例如：[mm:ss.xx] 歌詞文字
                            </p>
                        )}
                    </div>
                    
                    <div className="flex flex-col justify-end">
                       <div className="relative group">
                           <Button 
                                onClick={onGenerateSubtitles}
                                disabled={isGeneratingSubtitles || !audioFile}
                                className="bg-purple-600 hover:bg-purple-500 text-white w-full"
                            >
                                {isGeneratingSubtitles ? 
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
                             <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-72 p-2 bg-gray-900 border border-gray-600 rounded-md text-xs text-center text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                直接分析音訊檔並使用 AI 產生字幕。過程可能需要一些時間，請耐心等候。結果的準確度取決於音訊的清晰度。
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex flex-col">
                        <label className="text-sm text-gray-400 mb-1">顯示字幕</label>
                         <button
                            onClick={() => onShowSubtitlesChange(!showSubtitles)}
                            type="button"
                            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 ${showSubtitles ? 'bg-cyan-600' : 'bg-gray-600'}`}
                            aria-pressed={showSubtitles}
                        >
                            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${showSubtitles ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>

                    <div className="flex flex-col col-span-full md:col-span-1">
                        <label htmlFor="subtitle-size-slider" className="text-sm text-gray-400 mb-1">字幕大小 ({subtitleFontSize.toFixed(1)}vw)</label>
                        <input
                            id="subtitle-size-slider"
                            type="range" min="1" max="10" step="0.1"
                            value={subtitleFontSize}
                            onChange={(e) => onSubtitleFontSizeChange(parseFloat(e.target.value))}
                            className="w-full cursor-pointer accent-cyan-500"
                            aria-label="Subtitle font size"
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="text-sm text-gray-400 mb-1">字幕字體</label>
                        <select
                            value={subtitleFontFamily}
                            onChange={(e) => onSubtitleFontFamilyChange(e.target.value as FontType)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                        >
                            {Object.values(FontType).map(v => <option key={v} value={v}>{FONT_MAP[v]}</option>)}
                        </select>
                    </div>

                    <div className="flex flex-col">
                        <label className="text-sm text-gray-400 mb-1">字幕顏色</label>
                        <div className="flex items-center gap-2">
                            <input type="color" value={subtitleColor} onChange={(e) => onSubtitleColorChange(e.target.value)} className="bg-gray-700 border border-gray-600 rounded-md p-1 h-10 w-12 cursor-pointer" />
                            <div className="flex items-center gap-1.5 p-1 rounded-md bg-gray-900/50 flex-wrap">
                                {PRESET_COLORS.map(color => <SwatchButton key={color} color={color} onClick={onSubtitleColorChange} isActive={subtitleColor.toLowerCase() === color.toLowerCase()} />)}
                            </div>
                        </div>
                    </div>
                    
                     <div className="flex flex-col">
                        <label className="text-sm text-gray-400 mb-1">字幕特效</label>
                        <select
                            value={subtitleEffect}
                            onChange={(e) => onSubtitleEffectChange(e.target.value as GraphicEffectType)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                        >
                            {Object.values(GraphicEffectType).map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                    </div>

                    <div className="flex flex-col">
                        <label className="text-sm text-gray-400 mb-1">字幕背景</label>
                        <select
                            value={subtitleBgStyle}
                            onChange={(e) => onSubtitleBgStyleChange(e.target.value as SubtitleBgStyle)}
                            className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                        >
                            {Object.values(SubtitleBgStyle).map(v => <option key={v} value={v}>{v}</option>)}
                        </select>
                    </div>
                </div>
            </details>
        </div>
    );
};

export default Controls;