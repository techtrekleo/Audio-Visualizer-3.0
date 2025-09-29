import React from 'react';
import { VisualizationType, FontType, BackgroundColorType, ColorPaletteType, Resolution, GraphicEffectType, WatermarkPosition, SubtitleBgStyle, SubtitleDisplayMode } from '../types';
import Icon from './Icon';
import { ICON_PATHS } from '../constants';
import CategorizedEffectSelector from './CategorizedEffectSelector';

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
    // Lyrics Display props (測試中)
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
    // Ad dashboard - temporarily removed
    // onOpenAdDashboard?: () => void;
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

const ControlSection: React.FC<React.PropsWithChildren<{ title: string; className?: string }>> = ({ children, title, className = '' }) => (
    <div className={`bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 ${className}`}>
        <h3 className="text-lg font-semibold text-gray-200 mb-4 flex items-center">
            <div className="w-2 h-2 bg-cyan-400 rounded-full mr-3"></div>
            {title}
        </h3>
        {children}
    </div>
);

const SliderControl: React.FC<{
    label: string;
    value: number;
    onChange: (value: number) => void;
    min: number;
    max: number;
    step: number;
    className?: string;
}> = ({ label, value, onChange, min, max, step, className = '' }) => (
    <div className={`space-y-2 ${className}`}>
        <div className="flex justify-between items-center">
            <label className="text-sm font-medium text-gray-300">{label}</label>
            <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">{value.toFixed(2)}</span>
        </div>
        <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
        />
    </div>
);

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

// Convert various subtitle formats to standard SRT format
const convertToSRT = (rawText: string): string => {
    if (!rawText.trim()) return '';
    
    const lines = rawText.trim().split('\n');
    const subtitles: Array<{ time: number; text: string }> = [];
    
    // First, try to parse [00:00.00] format
    const timeRegex1 = /\[(\d{2}):(\d{2})\.(\d{2})\]/;
    
    // Then, try to parse "00:00:05 - 文本" format
    const timeRegex2 = /^(\d{1,2}):(\d{1,2}):(\d{1,2})(?:\.(\d{1,3}))?\s*[-–]\s*(.+)$/;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        let time: number | null = null;
        let text: string | null = null;
        
        // Try [00:00.00] format first
        const match1 = line.match(timeRegex1);
        if (match1) {
            const minutes = parseInt(match1[1], 10);
            const seconds = parseInt(match1[2], 10);
            const centiseconds = parseInt(match1[3], 10);
            time = minutes * 60 + seconds + centiseconds / 100;
            text = line.replace(timeRegex1, '').trim();
        } else {
            // Try "00:00:05 - 文本" format
            const match2 = line.match(timeRegex2);
            if (match2) {
                const [, hours, minutes, seconds, milliseconds = '0', subtitleText] = match2;
                time = parseInt(hours) * 3600 + parseInt(minutes) * 60 + parseInt(seconds) + parseInt(milliseconds) / 1000;
                text = subtitleText;
            }
        }
        
        if (time !== null && text) {
            subtitles.push({ time, text });
        }
    }
    
    // If no time information found, treat each line as a subtitle with estimated timing
    if (subtitles.length === 0) {
        lines.forEach((line, index) => {
            if (line.trim()) {
                const estimatedTime = index * 2; // 2 second intervals
                subtitles.push({ time: estimatedTime, text: line.trim() });
            }
        });
    } else {
        // Sort by time if we have time information
        subtitles.sort((a, b) => a.time - b.time);
    }
    
    // Generate SRT content
    let srtContent = '';
    subtitles.forEach((subtitle, index) => {
        const startTime = formatSRTTime(subtitle.time);
        const endTime = formatSRTTime(subtitle.time + 3); // Default 3 second duration
        
        srtContent += `${index + 1}\n`;
        srtContent += `${startTime} --> ${endTime}\n`;
        srtContent += `${subtitle.text}\n\n`;
    });
    
    return srtContent.trim();
};

// Format time for SRT (HH:MM:SS,mmm)
const formatSRTTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    const ms = Math.floor((seconds % 1) * 1000);
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')},${ms.toString().padStart(3, '0')}`;
};



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
    // Lyrics Display props (測試中)
    showLyricsDisplay,
    onShowLyricsDisplayChange,
    lyricsFontSize,
    onLyricsFontSizeChange,
    lyricsPositionX,
    onLyricsPositionXChange,
    lyricsPositionY,
    onLyricsPositionYChange,
    subtitleDisplayMode,
    onSubtitleDisplayModeChange,
}) => {
    const PRESET_COLORS = ['#FFFFFF', '#67E8F9', '#F472B6', '#FFD700', '#FF4500', '#A78BFA'];

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
                onBackgroundImageSelect(file);
            } else {
                alert('請上傳有效的圖片檔案。');
            }
        }
        e.target.value = '';
    };

    return (
        <div className="w-full max-w-7xl p-6 bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl shadow-2xl">
            {/* --- Main Player Controls --- */}
            <ControlSection title="播放控制" className="mb-6">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center space-x-3">
                        <Button 
                            onClick={onPlayPause} 
                            variant="primary" 
                            className="w-14 h-14 text-2xl !p-0 shadow-xl"
                            disabled={!audioFile}
                        >
                            <Icon path={isPlaying ? ICON_PATHS.PAUSE : ICON_PATHS.PLAY} className="w-7 h-7" />
                        </Button>
                        <Button 
                            onClick={onRecordToggle} 
                            variant={isRecording ? 'danger' : 'secondary'}
                            className={`${isRecording ? 'animate-pulse shadow-red-500/50' : ''}`}
                            disabled={isLoading || isGeneratingSubtitles}
                        >
                            {isLoading ? 
                                <>
                                    <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                                    <span>處理中...</span>
                                </>
                                : <>
                                    <Icon path={isRecording ? ICON_PATHS.RECORD_STOP : ICON_PATHS.RECORD_START} className="w-5 h-5" />
                                    <span>{isRecording ? '停止錄製' : '開始錄製'}</span>
                                </>
                            }
                        </Button>
                    </div>
                    <div className="flex items-center space-x-3">
                        {audioFile && (
                            <Button onClick={onClearAudio} variant="secondary">
                                <Icon path={ICON_PATHS.CHANGE_MUSIC} className="w-5 h-5"/>
                                <span>更換音樂</span>
                            </Button>
                        )}
                        {audioFile && (
                            <a href={URL.createObjectURL(audioFile)} download={audioFile.name} className="px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-500 text-white shadow-lg hover:shadow-xl">
                                <Icon path={ICON_PATHS.DOWNLOAD} />
                                <span>下載音樂</span>
                            </a>
                        )}
                        {videoUrl && (
                            <a href={videoUrl} download={`${audioFile?.name.replace(/\.[^/.]+$/, "") || 'visualization'}.${videoExtension}`} className="px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 bg-purple-600 hover:bg-purple-500 text-white shadow-lg hover:shadow-xl">
                                <Icon path={ICON_PATHS.DOWNLOAD} />
                                <span>下載 {videoExtension.toUpperCase()}</span>
                            </a>
                        )}
                    </div>
                </div>
            </ControlSection>
            
            {/* --- Visual Style Controls --- */}
            <ControlSection title="視覺風格設定" className="mb-6">
                {/* 分類特效選擇器 */}
                <CategorizedEffectSelector
                    currentType={visualizationType}
                    onTypeChange={onVisualizationChange}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
                    <SelectControl
                        label="顏色主題"
                        value={colorPalette}
                        onChange={(value) => onColorPaletteChange(value as ColorPaletteType)}
                        options={Object.values(ColorPaletteType).map(v => ({ value: v, label: v }))}
                    />
                    
                    <div className="space-y-2">
                        <SelectControl
                            label="解析度"
                            value={resolution}
                            onChange={(value) => onResolutionChange(value as Resolution)}
                            options={Object.values(Resolution).map(v => ({ value: v, label: v }))}
                        />
                        {(resolution === Resolution.SQUARE_1080 || resolution === Resolution.SQUARE_4K) && (
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
                        value={backgroundColor}
                        onChange={(value) => onBackgroundColorChange(value as BackgroundColorType)}
                        options={Object.values(BackgroundColorType).map(v => ({ value: v, label: v }))}
                    />
                    
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">背景圖片</label>
                        <div className="flex flex-col gap-2">
                            <label className="text-center bg-gray-600 hover:bg-gray-500 px-4 py-2 rounded-lg font-semibold transition-all duration-200 cursor-pointer">
                                上傳圖片
                                <input type="file" className="hidden" accept="image/*" onChange={handleBackgroundImageChange} />
                            </label>
                            {backgroundImage && (
                                <Button onClick={onClearBackgroundImage} variant="danger" className="px-2 py-1 text-sm">
                                    清除
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </ControlSection>
            
            {/* --- Audio Response Controls --- */}
            <ControlSection title="音頻響應設定" className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <SliderControl
                        label="靈敏度"
                        value={sensitivity}
                        onChange={onSensitivityChange}
                        min={0.1}
                        max={3.0}
                        step={0.1}
                    />
                    
                    <SliderControl
                        label="平滑度"
                        value={smoothing}
                        onChange={onSmoothingChange}
                        min={0}
                        max={10}
                        step={1}
                    />
                    
                    <SliderControl
                        label="均衡器"
                        value={equalization}
                        onChange={onEqualizationChange}
                        min={0}
                        max={1}
                        step={0.05}
                    />
                </div>
            </ControlSection>
            
            {/* --- Custom Text Controls --- */}
            <ControlSection title="自訂文字設定" className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">自訂文字</label>
                        <input
                            type="text"
                            value={customText}
                            onChange={(e) => onTextChange(e.target.value)}
                            placeholder="輸入自訂文字..."
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                        />
                    </div>
                    
                    <SelectControl
                        label="字體"
                        value={fontFamily}
                        onChange={(value) => onFontFamilyChange(value as FontType)}
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
                        value={graphicEffect}
                        onChange={(value) => onGraphicEffectChange(value as GraphicEffectType)}
                        options={Object.values(GraphicEffectType).map(v => ({ value: v, label: v }))}
                    />
                    
                    <SelectControl
                        label="浮水印位置"
                        value={watermarkPosition}
                        onChange={(value) => onWatermarkPositionChange(value as WatermarkPosition)}
                        options={Object.values(WatermarkPosition).map(v => ({ value: v, label: v }))}
                    />
                    
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">文字顏色</label>
                        <div className="flex space-x-2">
                            {PRESET_COLORS.map(color => (
                                <SwatchButton
                                    key={color}
                                    color={color}
                                    onClick={onTextColorChange}
                                    isActive={textColor === color}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </ControlSection>
            
            {/* --- Subtitle Section --- */}
            <ControlSection title="字幕設定" className="mb-6">
                <div className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">字幕文字 (使用格式 [00:00.00] 或由 AI 生成)</label>
                        <textarea 
                            value={subtitlesRawText}
                            onChange={(e) => onSubtitlesRawTextChange(e.target.value)}
                            rows={5}
                            className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent font-mono text-sm"
                            placeholder="使用格式 [00:00.00] 歌詞文字，或點擊「AI 產生字幕」按鈕自動產生歌詞..."
                        />
                    </div>
                    
                    <div className="flex items-center justify-between">
                        <div className="relative group">
                            <Button 
                                onClick={onGenerateSubtitles}
                                disabled={isGeneratingSubtitles || !audioFile}
                                variant="secondary"
                                className="bg-purple-600 hover:bg-purple-500"
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
                        
                        <div className="flex items-center space-x-4">
                            {/* Download Subtitles Button - Always visible */}
                            <Button
                                onClick={() => {
                                    if (!subtitlesRawText.trim()) {
                                        alert('請先產生字幕！\n\n您可以：\n1. 手動輸入字幕文字\n2. 點擊「AI 產生字幕」按鈕自動產生');
                                        return;
                                    }
                                    
                                    // 將原始字幕文本轉換為標準SRT格式
                                    const srtContent = convertToSRT(subtitlesRawText);
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
                                className={`${subtitlesRawText.trim() ? 'bg-green-600 hover:bg-green-500' : 'bg-gray-500 hover:bg-gray-400'}`}
                                disabled={!subtitlesRawText.trim()}
                            >
                                <Icon path={ICON_PATHS.DOWNLOAD} className="w-5 h-5" />
                                <span>下載字幕 (SRT)</span>
                            </Button>
                            
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="show-subtitles"
                                    checked={showSubtitles}
                                    onChange={(e) => onShowSubtitlesChange(e.target.checked)}
                                    className="w-4 h-4 text-cyan-600 bg-gray-700 border-gray-600 rounded focus:ring-cyan-500 focus:ring-2"
                                />
                                <label htmlFor="show-subtitles" className="text-sm text-gray-300">顯示字幕</label>
                            </div>
                        </div>
                    </div>
                    
                    {/* 字幕顯示模式選擇器 */}
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">字幕顯示模式</label>
                        <div className="grid grid-cols-3 gap-3">
                            {Object.values(SubtitleDisplayMode).map((mode) => (
                                <button
                                    key={mode}
                                    onClick={() => onSubtitleDisplayModeChange(mode)}
                                    className={`p-4 rounded-lg border-2 transition-all duration-200 text-center ${
                                        subtitleDisplayMode === mode
                                            ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200'
                                            : 'border-gray-600 bg-gray-700 hover:border-gray-500 hover:bg-gray-600 text-gray-300'
                                    }`}
                                >
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-center">
                                            {mode === SubtitleDisplayMode.NONE && (
                                                <div className="w-8 h-5 bg-transparent border border-gray-400 rounded flex items-center justify-center">
                                                    <span className="text-gray-400 text-xs">✕</span>
                                                </div>
                                            )}
                                            {mode === SubtitleDisplayMode.CLASSIC && (
                                                <div className="w-8 h-5 bg-black/50 border border-gray-400 rounded flex items-center justify-center">
                                                    <span className="text-white text-xs">A</span>
                                                </div>
                                            )}
                                            {mode === SubtitleDisplayMode.LYRICS_SCROLL && (
                                                <div className="w-8 h-5 bg-black/50 border border-gray-400 rounded flex items-center justify-center">
                                                    <span className="text-white text-xs">📜</span>
                                                </div>
                                            )}
                                            {mode === SubtitleDisplayMode.WORD_BY_WORD && (
                                                <div className="w-8 h-5 bg-black/50 border border-gray-400 rounded flex items-center justify-center">
                                                    <span className="text-white text-xs">✨</span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-center text-xs font-medium">{mode}</div>
                                        {mode === SubtitleDisplayMode.LYRICS_SCROLL && (
                                            <div className="text-xs text-yellow-400">🧪 測試中</div>
                                        )}
                                        {mode === SubtitleDisplayMode.WORD_BY_WORD && (
                                            <div className="text-xs text-cyan-400">🎵 邊唱邊顯示</div>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <SliderControl
                            label="字幕字體大小"
                            value={subtitleFontSize}
                            onChange={onSubtitleFontSizeChange}
                            min={2}
                            max={8}
                            step={0.5}
                        />
                        
                        <SelectControl
                            label="字幕字體"
                            value={subtitleFontFamily}
                            onChange={(value) => onSubtitleFontFamilyChange(value as FontType)}
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
                                        onClick={onSubtitleColorChange}
                                        isActive={subtitleColor === color}
                                    />
                                ))}
                            </div>
                        </div>
                        
                        <SelectControl
                            label="字幕效果"
                            value={subtitleEffect}
                            onChange={(value) => onSubtitleEffectChange(value as GraphicEffectType)}
                            options={Object.values(GraphicEffectType).map(v => ({ value: v, label: v }))}
                        />
                        
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <label className="text-sm font-medium text-gray-300">字幕背景</label>
                                <div className="relative group">
                                    <svg className="w-4 h-4 text-gray-400 cursor-help" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-2 bg-gray-900 border border-gray-600 rounded-md text-xs text-center text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                                        <strong>字幕背景樣式說明：</strong><br/>
                                        • <strong>無</strong>：純文字，無背景<br/>
                                        • <strong>半透明</strong>：黑色半透明背景<br/>
                                        • <strong>實色</strong>：黑色實心背景
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                {Object.values(SubtitleBgStyle).map((style) => (
                                    <button
                                        key={style}
                                        onClick={() => onSubtitleBgStyleChange(style)}
                                        className={`p-3 rounded-lg border-2 transition-all duration-200 text-xs font-medium ${
                                            subtitleBgStyle === style
                                                ? 'border-cyan-400 bg-cyan-500/20 text-cyan-200'
                                                : 'border-gray-600 bg-gray-700 hover:border-gray-500 hover:bg-gray-600 text-gray-300'
                                        }`}
                                    >
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-center">
                                                {style === SubtitleBgStyle.NONE && (
                                                    <div className="w-8 h-5 bg-transparent border border-gray-400 rounded flex items-center justify-center">
                                                        <span className="text-gray-400 text-xs">A</span>
                                                    </div>
                                                )}
                                                {style === SubtitleBgStyle.SEMI_TRANSPARENT && (
                                                    <div className="w-8 h-5 bg-black/50 border border-gray-400 rounded flex items-center justify-center">
                                                        <span className="text-white text-xs">A</span>
                                                    </div>
                                                )}
                                                {style === SubtitleBgStyle.SOLID && (
                                                    <div className="w-8 h-5 bg-black border border-gray-400 rounded flex items-center justify-center">
                                                        <span className="text-white text-xs">A</span>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="text-center text-xs">{style}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </ControlSection>
            
            {/* --- Lyrics Display Controls (測試中) - 只在捲軸歌詞模式下顯示 --- */}
            {subtitleDisplayMode === SubtitleDisplayMode.LYRICS_SCROLL && (
                <ControlSection title="捲軸歌詞設定 (測試中)" className="mb-6">
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="text-sm text-gray-300">捲軸歌詞控制選項</div>
                            <div className="text-xs text-yellow-400 bg-yellow-400/20 px-2 py-1 rounded">
                                🧪 測試中
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <SliderControl
                                label="字體大小 (%)"
                                value={lyricsFontSize}
                                onChange={onLyricsFontSizeChange}
                                min={2}
                                max={10}
                                step={0.5}
                            />
                            
                            <SliderControl
                                label="水平位置 (%)"
                                value={lyricsPositionX}
                                onChange={onLyricsPositionXChange}
                                min={-50}
                                max={50}
                                step={5}
                            />
                            
                            <SliderControl
                                label="垂直位置 (%)"
                                value={lyricsPositionY}
                                onChange={onLyricsPositionYChange}
                                min={-50}
                                max={50}
                                step={5}
                            />
                        </div>
                    </div>
                </ControlSection>
            )}
            
            {/* --- Advanced Controls --- */}
            <ControlSection title="進階設定" className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300">聲波描邊</label>
                        <button
                            onClick={() => onWaveformStrokeChange(!waveformStroke)}
                            disabled={isRecording}
                            type="button"
                            className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed ${waveformStroke ? 'bg-cyan-600' : 'bg-gray-600'}`}
                            aria-pressed={waveformStroke}
                        >
                            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${waveformStroke ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                    </div>
                    
                    <SliderControl
                        label="特效大小"
                        value={effectScale}
                        onChange={onEffectScaleChange}
                        min={0.1}
                        max={2.0}
                        step={0.05}
                    />
                    
                    <SliderControl
                        label="水平位移"
                        value={effectOffsetX}
                        onChange={onEffectOffsetXChange}
                        min={-500}
                        max={500}
                        step={10}
                    />
                    
                    <SliderControl
                        label="垂直位移"
                        value={effectOffsetY}
                        onChange={onEffectOffsetYChange}
                        min={-500}
                        max={500}
                        step={10}
                    />
                </div>
            </ControlSection>
            
            {/* --- Ad Dashboard --- */}
            {/* Temporarily removed for debugging
            {onOpenAdDashboard && (
                <ControlSection title="廣告管理" className="mb-6">
                    <div className="flex justify-center">
                        <Button
                            onClick={onOpenAdDashboard}
                            variant="secondary"
                            className="bg-purple-700 hover:bg-purple-800 text-white"
                        >
                            📊 查看廣告效果
                        </Button>
                    </div>
                </ControlSection>
            )}
            */}
        </div>
    );
};

export default Controls;