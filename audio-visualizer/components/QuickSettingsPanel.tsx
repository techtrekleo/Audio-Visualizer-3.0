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
        <div className="quick-settings-panel bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-sm rounded-xl p-4 border border-cyan-400/30">
            <div className="flex items-center space-x-2 mb-4">
                <Icon path={ICON_PATHS.STAR} className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-semibold text-gray-200">快速設置</h3>
                <span className="px-2 py-1 text-xs font-medium bg-cyan-500/20 text-cyan-300 rounded-full">
                    視覺效果
                </span>
            </div>
            
            <div className="space-y-4">
                {/* 視覺效果選擇 */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">選擇視覺效果</label>
                    <CategorizedEffectSelector
                        currentType={visualizationType}
                        onTypeChange={onVisualizationChange}
                    />
                </div>

                {/* 顏色主題 */}
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">顏色主題</label>
                    <select
                        value={colorPalette}
                        onChange={(e) => onColorPaletteChange(e.target.value as ColorPaletteType)}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
                    >
                        <option value={ColorPaletteType.DEFAULT}>預設</option>
                        <option value={ColorPaletteType.CYBERPUNK}>賽博朋克</option>
                        <option value={ColorPaletteType.SUNSET}>日落</option>
                        <option value={ColorPaletteType.GLACIER}>冰川</option>
                        <option value={ColorPaletteType.LAVA}>熔岩</option>
                        <option value={ColorPaletteType.MIDNIGHT}>午夜</option>
                        <option value={ColorPaletteType.WHITE}>白色</option>
                        <option value={ColorPaletteType.RAINBOW}>彩虹</option>
                    </select>
                </div>

                {/* Picture-in-Picture 控制 */}
                {isPipSupported && (
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                            <span className="text-lg">📺</span>
                            子母畫面
                        </label>
                        <button
                            onClick={isPipActive ? onExitPictureInPicture : onEnterPictureInPicture}
                            disabled={isRecording}
                            type="button"
                            className={`w-full py-2 px-3 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed ${
                                isPipActive 
                                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600 shadow-lg shadow-cyan-500/25' 
                                    : 'bg-gray-700 text-gray-200 hover:bg-gray-600 hover:text-white'
                            }`}
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
                        <p className="text-xs text-gray-400 leading-relaxed">
                            {isPipActive 
                                ? '✅ 可視化已顯示在子母畫面中，可以拖拽調整位置' 
                                : '💡 將可視化畫面固定在螢幕角落。請確保音樂正在播放且可視化已開啟。'
                            }
                        </p>
                    </div>
                )}

                {/* 進階控制選項 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* 聲波描邊 */}
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

                    {/* 特效大小 */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-gray-300">特效大小</label>
                            <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">{effectScale.toFixed(2)}</span>
                        </div>
                        <div className="relative">
                            <div
                                className="w-full h-2 rounded-lg absolute top-0 left-0"
                                style={{
                                    background: `linear-gradient(to right,
                                        #6b7280 0%,
                                        #10b981 50%,
                                        #f59e0b 100%)`
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
                                className="absolute top-0 h-2 bg-white/20 rounded-lg pointer-events-none"
                                style={{
                                    left: 0,
                                    width: `${((effectScale - 0.1) / (2.0 - 0.1)) * 100}%`,
                                    transition: 'width 0.1s ease'
                                }}
                            />
                        </div>
                    </div>

                    {/* 水平位移 */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-gray-300">水平位移</label>
                            <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">{effectOffsetX}</span>
                        </div>
                        <div className="relative">
                            <div
                                className="w-full h-2 rounded-lg absolute top-0 left-0"
                                style={{
                                    background: `linear-gradient(to right,
                                        #3b82f6 0%,
                                        #8b5cf6 50%,
                                        #ec4899 100%)`
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
                                className="absolute top-0 h-2 bg-white/20 rounded-lg pointer-events-none"
                                style={{
                                    left: 0,
                                    width: `${((effectOffsetX - (-500)) / (500 - (-500))) * 100}%`,
                                    transition: 'width 0.1s ease'
                                }}
                            />
                        </div>
                    </div>

                    {/* 垂直位移 */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-gray-300">垂直位移</label>
                            <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">{effectOffsetY}</span>
                        </div>
                        <div className="relative">
                            <div
                                className="w-full h-2 rounded-lg absolute top-0 left-0"
                                style={{
                                    background: `linear-gradient(to right,
                                        #3b82f6 0%,
                                        #8b5cf6 50%,
                                        #ec4899 100%)`
                                }}
                            />
                            <input
                                type="range"
                                min={-500}
                                max={500}
                                step={10}
                                value={effectOffsetY}
                                onChange={(e) => onEffectOffsetYChange(parseFloat(e.target.value))}
                                className="w-full h-2 bg-transparent rounded-lg appearance-none cursor-pointer slider-enhanced relative z-10"
                                style={{ background: 'transparent' }}
                            />
                            <div
                                className="absolute top-0 h-2 bg-white/20 rounded-lg pointer-events-none"
                                style={{
                                    left: 0,
                                    width: `${((effectOffsetY - (-500)) / (500 - (-500))) * 100}%`,
                                    transition: 'width 0.1s ease'
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* 音頻響應設定 */}
                <div className="space-y-4">
                    <label className="text-sm font-medium text-gray-300">音頻響應設定</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* 靈敏度 */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-medium text-gray-300">靈敏度</label>
                                <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">{sensitivity.toFixed(2)}</span>
                            </div>
                            <div className="relative">
                                <div
                                    className="w-full h-2 rounded-lg absolute top-0 left-0"
                                    style={{
                                        background: `linear-gradient(to right,
                                            #ef4444 0%,
                                            #f97316 25%,
                                            #eab308 50%,
                                            #22c55e 75%,
                                            #10b981 100%)`
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
                                    className="absolute top-0 h-2 bg-white/20 rounded-lg pointer-events-none"
                                    style={{
                                        left: 0,
                                        width: `${((sensitivity - 0.1) / (3.0 - 0.1)) * 100}%`,
                                        transition: 'width 0.1s ease'
                                    }}
                                />
                            </div>
                        </div>

                        {/* 平滑度 */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-medium text-gray-300">平滑度</label>
                                <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">{smoothing}</span>
                            </div>
                            <div className="relative">
                                <div
                                    className="w-full h-2 rounded-lg absolute top-0 left-0"
                                    style={{
                                        background: `linear-gradient(to right,
                                            #374151 0%,
                                            #06b6d4 50%,
                                            #8b5cf6 100%)`
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
                                    className="absolute top-0 h-2 bg-white/20 rounded-lg pointer-events-none"
                                    style={{
                                        left: 0,
                                        width: `${(smoothing / 10) * 100}%`,
                                        transition: 'width 0.1s ease'
                                    }}
                                />
                            </div>
                        </div>

                        {/* 均衡器 */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-medium text-gray-300">均衡器</label>
                                <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">{equalization.toFixed(2)}</span>
                            </div>
                            <div className="relative">
                                <div
                                    className="w-full h-2 rounded-lg absolute top-0 left-0"
                                    style={{
                                        background: `linear-gradient(to right,
                                            #374151 0%,
                                            #06b6d4 50%,
                                            #8b5cf6 100%)`
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
                                    className="absolute top-0 h-2 bg-white/20 rounded-lg pointer-events-none"
                                    style={{
                                        left: 0,
                                        width: `${equalization * 100}%`,
                                        transition: 'width 0.1s ease'
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
