import React from 'react';
import { VisualizationType, ColorPaletteType } from '../types';
import Icon from './Icon';
import { ICON_PATHS } from '../constants';
import CategorizedEffectSelector from './CategorizedEffectSelector';

interface QuickSettingsPanelProps {
    visualizationType: VisualizationType;
    onVisualizationChange: (type: VisualizationType) => void;
    waveformStroke: boolean;
    onWaveformStrokeChange: (value: boolean) => void;
    effectScale: number;
    onEffectScaleChange: (value: number) => void;
    effectOffsetX: number;
    onEffectOffsetXChange: (value: number) => void;
    effectOffsetY: number;
    onEffectOffsetYChange: (value: number) => void;
    isRecording: boolean;
    colorPalette: ColorPaletteType;
    onColorPaletteChange: (palette: ColorPaletteType) => void;
    // 自選色彩相關 props
    customPrimaryColor?: string;
    customSecondaryColor?: string;
    customAccentColor?: string;
    onCustomPrimaryColorChange?: (color: string) => void;
    onCustomSecondaryColorChange?: (color: string) => void;
    onCustomAccentColorChange?: (color: string) => void;
    sensitivity: number;
    onSensitivityChange: (value: number) => void;
    smoothing: number;
    onSmoothingChange: (value: number) => void;
    equalization: number;
    onEqualizationChange: (value: number) => void;
    // Picture-in-Picture 相關 props
    isPipSupported: boolean;
    isPipActive: boolean;
    onEnterPictureInPicture: () => void;
    onExitPictureInPicture: () => void;
}

const QuickSettingsPanel: React.FC<QuickSettingsPanelProps> = ({
    visualizationType,
    onVisualizationChange,
    waveformStroke,
    onWaveformStrokeChange,
    effectScale,
    onEffectScaleChange,
    effectOffsetX,
    onEffectOffsetXChange,
    effectOffsetY,
    onEffectOffsetYChange,
    isRecording,
    colorPalette,
    onColorPaletteChange,
    customPrimaryColor = '#67E8F9',
    customSecondaryColor = '#F472B6',
    customAccentColor = '#FFFFFF',
    onCustomPrimaryColorChange,
    onCustomSecondaryColorChange,
    onCustomAccentColorChange,
    sensitivity,
    onSensitivityChange,
    smoothing,
    onSmoothingChange,
    equalization,
    onEqualizationChange,
    isPipSupported,
    isPipActive,
    onEnterPictureInPicture,
    onExitPictureInPicture,
}) => {
    return (
        <div className="quick-settings-panel backdrop-blur-sm rounded-xl p-4 border" style={{ background: 'rgba(255, 255, 255, 0.95)', borderColor: 'rgba(139, 157, 195, 0.3)' }}>
            <div className="flex items-center space-x-2 mb-4">
                <Icon path={ICON_PATHS.STAR} className="w-5 h-5" style={{ color: '#8B9DC3' }} />
                <h3 className="text-lg font-semibold" style={{ color: '#4A4A4A' }}>快速設置</h3>
                <span className="px-2 py-1 text-xs font-medium rounded-full" style={{ backgroundColor: 'rgba(139, 157, 195, 0.2)', color: '#4A4A4A' }}>
                    視覺效果
                </span>
            </div>
            
            <div className="space-y-4">
                {/* 視覺效果選擇 */}
                <div className="space-y-2">
                    <label className="text-sm font-medium" style={{ color: '#4A4A4A' }}>選擇視覺效果</label>
                    <CategorizedEffectSelector
                        currentType={visualizationType}
                        onTypeChange={onVisualizationChange}
                    />
                </div>

                {/* 顏色主題 */}
                <div className="space-y-2">
                    <label className="text-sm font-medium" style={{ color: '#4A4A4A' }}>顏色主題</label>
                    <select
                        value={colorPalette}
                        onChange={(e) => onColorPaletteChange(e.target.value as ColorPaletteType)}
                        className="w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
                        style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid rgba(139, 157, 195, 0.4)', color: '#4A4A4A' }}
                    >
                        <option value={ColorPaletteType.DEFAULT}>預設</option>
                        <option value={ColorPaletteType.CYBERPUNK}>賽博朋克</option>
                        <option value={ColorPaletteType.SUNSET}>日落</option>
                        <option value={ColorPaletteType.GLACIER}>冰川</option>
                        <option value={ColorPaletteType.LAVA}>熔岩</option>
                        <option value={ColorPaletteType.MIDNIGHT}>午夜</option>
                        <option value={ColorPaletteType.WHITE}>白色</option>
                        <option value={ColorPaletteType.RAINBOW}>彩虹</option>
                        <option value={ColorPaletteType.CUSTOM}>自選色彩</option>
                    </select>
                    
                    {/* 自選色彩選擇器 - 僅在選擇自選色彩時顯示 */}
                    {colorPalette === ColorPaletteType.CUSTOM && (
                        <div className="mt-3 p-3 rounded-lg border space-y-3" style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)', borderColor: 'rgba(139, 157, 195, 0.3)' }}>
                            <label className="text-xs font-medium" style={{ color: '#4A4A4A' }}>自訂顏色</label>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs" style={{ color: '#6B7280' }}>主色</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={customPrimaryColor}
                                            onChange={(e) => onCustomPrimaryColorChange?.(e.target.value)}
                                            className="w-10 h-10 rounded cursor-pointer"
                                            style={{ border: '1px solid rgba(139, 157, 195, 0.4)' }}
                                        />
                                        <input
                                            type="text"
                                            value={customPrimaryColor}
                                            onChange={(e) => onCustomPrimaryColorChange?.(e.target.value)}
                                            className="flex-1 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1"
                                            style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid rgba(139, 157, 195, 0.4)', color: '#4A4A4A' }}
                                            placeholder="#67E8F9"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs" style={{ color: '#6B7280' }}>次色</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={customSecondaryColor}
                                            onChange={(e) => onCustomSecondaryColorChange?.(e.target.value)}
                                            className="w-10 h-10 rounded cursor-pointer"
                                            style={{ border: '1px solid rgba(139, 157, 195, 0.4)' }}
                                        />
                                        <input
                                            type="text"
                                            value={customSecondaryColor}
                                            onChange={(e) => onCustomSecondaryColorChange?.(e.target.value)}
                                            className="flex-1 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1"
                                            style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid rgba(139, 157, 195, 0.4)', color: '#4A4A4A' }}
                                            placeholder="#F472B6"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs" style={{ color: '#6B7280' }}>強調色</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={customAccentColor}
                                            onChange={(e) => onCustomAccentColorChange?.(e.target.value)}
                                            className="w-10 h-10 rounded cursor-pointer"
                                            style={{ border: '1px solid rgba(139, 157, 195, 0.4)' }}
                                        />
                                        <input
                                            type="text"
                                            value={customAccentColor}
                                            onChange={(e) => onCustomAccentColorChange?.(e.target.value)}
                                            className="flex-1 rounded px-2 py-1 text-xs focus:outline-none focus:ring-1"
                                            style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid rgba(139, 157, 195, 0.4)', color: '#4A4A4A' }}
                                            placeholder="#FFFFFF"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Picture-in-Picture 控制 */}
                <div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium flex items-center gap-2" style={{ color: '#4A4A4A' }}>
                            <span className="text-lg">📺</span>
                            子母畫面
                        </label>
                        <button
                            onClick={isPipActive ? onExitPictureInPicture : onEnterPictureInPicture}
                            disabled={isRecording}
                            type="button"
                            className="w-full py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            style={isPipActive 
                                ? { background: 'linear-gradient(135deg, #8B9DC3 0%, #9CA3AF 100%)', color: '#FFFFFF', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }
                                : { backgroundColor: 'rgba(255, 255, 255, 0.8)', color: '#4A4A4A', border: '1px solid rgba(139, 157, 195, 0.4)' }
                            }
                            onMouseEnter={(e) => {
                                if (!isRecording && !isPipActive) {
                                    e.currentTarget.style.backgroundColor = 'rgba(139, 157, 195, 0.2)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (!isRecording && !isPipActive) {
                                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
                                }
                            }}
                            title={isPipActive ? '退出子母畫面' : '開啟子母畫面 (需要播放音頻)'}
                        >
                            <span className="flex items-center justify-center gap-2">
                                {isPipActive ? (
                                    <>
                                        <span className="text-base">📺</span>
                                        退出子母畫面
                                    </>
                                ) : (
                                    <>
                                        <span className="text-base">🖼️</span>
                                        開啟子母畫面
                                    </>
                                )}
                            </span>
                        </button>
                        <p className="text-xs leading-relaxed" style={{ color: '#6B7280' }}>
                            {isPipActive 
                                ? '✅ 可視化已顯示在子母畫面中，可以拖拽調整位置' 
                                : isPipSupported 
                                    ? '💡 將可視化畫面固定在螢幕角落。請確保音樂正在播放且可視化已開啟。'
                                    : '⚠️ 您的瀏覽器可能不支援子母畫面功能。建議使用 Chrome、Edge 或 Safari 最新版本。'
                            }
                        </p>
                    </div>
                </div>

                {/* 進階控制選項 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* 聲波描邊 - 僅在特殊款特效時顯示 */}
                    {(visualizationType === VisualizationType.CRT_GLITCH || visualizationType === VisualizationType.GLITCH_WAVE) && (
                        <div className="space-y-2">
                            <label className="text-sm font-medium" style={{ color: '#4A4A4A' }}>中間線條</label>
                            <button
                                onClick={() => onWaveformStrokeChange(!waveformStroke)}
                                disabled={isRecording}
                                type="button"
                                className="relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{ backgroundColor: waveformStroke ? '#8B9DC3' : 'rgba(156, 163, 175, 0.5)' }}
                                aria-pressed={waveformStroke}
                            >
                                <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${waveformStroke ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    )}

                    {/* 特效大小 */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium" style={{ color: '#4A4A4A' }}>特效大小</label>
                            <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)', color: '#6B7280' }}>{effectScale.toFixed(2)}</span>
                        </div>
                        <div className="relative">
                            <div
                                className="w-full h-2 rounded-lg absolute top-0 left-0"
                                style={{
                                    background: `linear-gradient(to right,
                                        #E8E8E3 0%,
                                        #D1D5DB 50%,
                                        #9CAF9C 100%)`
                                }}
                            />
                            <input
                                type="range"
                                min={0.1}
                                max={2.0}
                                step={0.05}
                                value={effectScale}
                                onChange={(e) => onEffectScaleChange(parseFloat(e.target.value))}
                                className="w-full h-2 bg-transparent rounded-lg appearance-none cursor-pointer slider-enhanced relative z-10"
                                style={{ background: 'transparent' }}
                            />
                            <div
                                className="absolute top-0 h-2 rounded-lg pointer-events-none"
                                style={{
                                    left: 0,
                                    width: `${((effectScale - 0.1) / (2.0 - 0.1)) * 100}%`,
                                    transition: 'width 0.1s ease',
                                    backgroundColor: 'rgba(156, 163, 175, 0.4)'
                                }}
                            />
                        </div>
                    </div>

                    {/* 水平位移 */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium" style={{ color: '#4A4A4A' }}>水平位移</label>
                            <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)', color: '#6B7280' }}>{effectOffsetX}</span>
                        </div>
                        <div className="relative">
                            <div
                                className="w-full h-2 rounded-lg absolute top-0 left-0"
                                style={{
                                    background: `linear-gradient(to right,
                                        #8B9DC3 0%,
                                        #A5A0B0 50%,
                                        #C4A5A5 100%)`
                                }}
                            />
                            <input
                                type="range"
                                min={-500}
                                max={500}
                                step={10}
                                value={effectOffsetX}
                                onChange={(e) => onEffectOffsetXChange(parseFloat(e.target.value))}
                                className="w-full h-2 bg-transparent rounded-lg appearance-none cursor-pointer slider-enhanced relative z-10"
                                style={{ background: 'transparent' }}
                            />
                            <div
                                className="absolute top-0 h-2 rounded-lg pointer-events-none"
                                style={{
                                    left: 0,
                                    width: `${((effectOffsetX - (-500)) / (500 - (-500))) * 100}%`,
                                    transition: 'width 0.1s ease',
                                    backgroundColor: 'rgba(156, 163, 175, 0.4)'
                                }}
                            />
                        </div>
                    </div>

                    {/* 垂直位移 */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium" style={{ color: '#4A4A4A' }}>垂直位移</label>
                            <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)', color: '#6B7280' }}>{effectOffsetY}</span>
                        </div>
                        <div className="relative">
                            <div
                                className="w-full h-2 rounded-lg absolute top-0 left-0"
                                style={{
                                    background: `linear-gradient(to right,
                                        #8B9DC3 0%,
                                        #A5A0B0 50%,
                                        #C4A5A5 100%)`
                                }}
                            />
                            <input
                                type="range"
                                min={-1000}
                                max={1000}
                                step={10}
                                value={effectOffsetY}
                                onChange={(e) => onEffectOffsetYChange(parseFloat(e.target.value))}
                                className="w-full h-2 bg-transparent rounded-lg appearance-none cursor-pointer slider-enhanced relative z-10"
                                style={{ background: 'transparent' }}
                            />
                            <div
                                className="absolute top-0 h-2 rounded-lg pointer-events-none"
                                style={{
                                    left: 0,
                                    width: `${((effectOffsetY - (-1000)) / (1000 - (-1000))) * 100}%`,
                                    transition: 'width 0.1s ease',
                                    backgroundColor: 'rgba(156, 163, 175, 0.4)'
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* 音頻響應設定 */}
                <div className="space-y-4">
                    <label className="text-sm font-medium" style={{ color: '#4A4A4A' }}>音頻響應設定</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* 靈敏度 */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-medium" style={{ color: '#4A4A4A' }}>靈敏度</label>
                                <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)', color: '#6B7280' }}>{sensitivity.toFixed(2)}</span>
                            </div>
                            <div className="relative">
                                <div
                                    className="w-full h-2 rounded-lg absolute top-0 left-0"
                                    style={{
                                        background: `linear-gradient(to right,
                                            #D1B5B5 0%,
                                            #C4A5A5 25%,
                                            #B8B5A0 50%,
                                            #A8B5A0 75%,
                                            #9CAF9C 100%)`
                                    }}
                                />
                                <input
                                    type="range"
                                    min={0.1}
                                    max={3.0}
                                    step={0.1}
                                    value={sensitivity}
                                    onChange={(e) => onSensitivityChange(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-transparent rounded-lg appearance-none cursor-pointer slider-enhanced relative z-10"
                                    style={{ background: 'transparent' }}
                                />
                                <div
                                    className="absolute top-0 h-2 rounded-lg pointer-events-none"
                                    style={{
                                        left: 0,
                                        width: `${((sensitivity - 0.1) / (3.0 - 0.1)) * 100}%`,
                                        transition: 'width 0.1s ease',
                                        backgroundColor: 'rgba(156, 163, 175, 0.4)'
                                    }}
                                />
                            </div>
                        </div>

                        {/* 平滑度 */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-medium" style={{ color: '#4A4A4A' }}>平滑度</label>
                                <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)', color: '#6B7280' }}>{smoothing}</span>
                            </div>
                            <div className="relative">
                                <div
                                    className="w-full h-2 rounded-lg absolute top-0 left-0"
                                    style={{
                                        background: `linear-gradient(to right,
                                            #9CA3AF 0%,
                                            #A5A0B0 50%,
                                            #B8B5C0 100%)`
                                    }}
                                />
                                <input
                                    type="range"
                                    min={0}
                                    max={10}
                                    step={1}
                                    value={smoothing}
                                    onChange={(e) => onSmoothingChange(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-transparent rounded-lg appearance-none cursor-pointer slider-enhanced relative z-10"
                                    style={{ background: 'transparent' }}
                                />
                                <div
                                    className="absolute top-0 h-2 rounded-lg pointer-events-none"
                                    style={{
                                        left: 0,
                                        width: `${(smoothing / 10) * 100}%`,
                                        transition: 'width 0.1s ease',
                                        backgroundColor: 'rgba(156, 163, 175, 0.4)'
                                    }}
                                />
                            </div>
                        </div>

                        {/* 均衡器 */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-medium" style={{ color: '#4A4A4A' }}>均衡器</label>
                                <span className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)', color: '#6B7280' }}>{equalization.toFixed(2)}</span>
                            </div>
                            <div className="relative">
                                <div
                                    className="w-full h-2 rounded-lg absolute top-0 left-0"
                                    style={{
                                        background: `linear-gradient(to right,
                                            #9CA3AF 0%,
                                            #A5A0B0 50%,
                                            #B8B5C0 100%)`
                                    }}
                                />
                                <input
                                    type="range"
                                    min={0}
                                    max={1}
                                    step={0.05}
                                    value={equalization}
                                    onChange={(e) => onEqualizationChange(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-transparent rounded-lg appearance-none cursor-pointer slider-enhanced relative z-10"
                                    style={{ background: 'transparent' }}
                                />
                                <div
                                    className="absolute top-0 h-2 rounded-lg pointer-events-none"
                                    style={{
                                        left: 0,
                                        width: `${equalization * 100}%`,
                                        transition: 'width 0.1s ease',
                                        backgroundColor: 'rgba(156, 163, 175, 0.4)'
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default QuickSettingsPanel;
