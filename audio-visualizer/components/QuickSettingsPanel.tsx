import React from 'react';
import { VisualizationType, ColorPaletteType, MultiEffectTransform } from '../types';
import Icon from './Icon';
import { ICON_PATHS } from '../constants';
import CategorizedEffectSelector from './CategorizedEffectSelector';

interface QuickSettingsPanelProps {
    visualizationType: VisualizationType;
    onVisualizationChange: (type: VisualizationType) => void;
    // Multi-visualization (composite) mode
    multiEffectEnabled?: boolean;
    onMultiEffectEnabledChange?: (enabled: boolean) => void;
    selectedVisualizationTypes?: VisualizationType[];
    onToggleVisualizationType?: (type: VisualizationType) => void;
    multiEffectOffsets?: Partial<Record<VisualizationType, { x: number; y: number }>>;
    onActiveMultiEffectNudge?: (dx: number, dy: number) => void;
    onActiveMultiEffectOffsetChange?: (next: { x: number; y: number }) => void;
    onActiveMultiEffectOffsetReset?: () => void;
    multiEffectTransforms?: Partial<Record<VisualizationType, MultiEffectTransform>>;
    onActiveMultiEffectTransformChange?: (patch: Partial<MultiEffectTransform>) => void;
    onActiveMultiEffectTransformReset?: () => void;
    waveformStroke: boolean;
    onWaveformStrokeChange: (value: boolean) => void;
    effectScale: number;
    onEffectScaleChange: (value: number) => void;
    effectOffsetX: number;
    onEffectOffsetXChange: (value: number) => void;
    effectOffsetY: number;
    onEffectOffsetYChange: (value: number) => void;
    effectRotation: number;
    onEffectRotationChange: (value: number) => void;
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
    multiEffectEnabled = false,
    onMultiEffectEnabledChange,
    selectedVisualizationTypes = [],
    onToggleVisualizationType,
    multiEffectOffsets = {},
    onActiveMultiEffectNudge,
    onActiveMultiEffectOffsetChange,
    onActiveMultiEffectOffsetReset,
    multiEffectTransforms = {},
    onActiveMultiEffectTransformChange,
    onActiveMultiEffectTransformReset,
    waveformStroke,
    onWaveformStrokeChange,
    effectScale,
    onEffectScaleChange,
    effectOffsetX,
    onEffectOffsetXChange,
    effectOffsetY,
    onEffectOffsetYChange,
    effectRotation,
    onEffectRotationChange,
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
    const activeTransform: MultiEffectTransform = (multiEffectTransforms?.[visualizationType] as any) || {
        x: multiEffectOffsets?.[visualizationType]?.x ?? 0,
        y: multiEffectOffsets?.[visualizationType]?.y ?? 0,
        scale: 1,
        rotation: 0,
    };

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
                    <div className="flex items-center justify-between gap-3">
                        <label className="text-sm font-medium text-gray-300">選擇視覺效果</label>
                        <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={multiEffectEnabled}
                                onChange={(e) => onMultiEffectEnabledChange?.(e.target.checked)}
                                className="w-4 h-4 text-red-500 bg-gray-700 border-gray-600 rounded focus:ring-red-500 focus:ring-2"
                            />
                            多重疊加（高耗能）
                        </label>
                    </div>
                    {multiEffectEnabled && (
                        <div className="text-xs text-red-200 bg-red-500/10 border border-red-400/30 rounded-lg px-3 py-2">
                            ⚠️ 已啟用多重疊加：會大量消耗電腦效能，可能造成掉禎或當機。
                        </div>
                    )}
                    <CategorizedEffectSelector
                        currentType={visualizationType}
                        onTypeChange={onVisualizationChange}
                        multiSelectEnabled={multiEffectEnabled}
                        selectedTypes={selectedVisualizationTypes}
                        onToggleType={onToggleVisualizationType}
                    />
                    {multiEffectEnabled && (
                        <div className="mt-3 p-3 bg-gray-800/50 rounded-lg border border-red-400/30 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="text-xs font-medium text-red-200">
                                    疊加位置調整（目前：{visualizationType}）
                                </div>
                                <button
                                    type="button"
                                    onClick={() => {
                                        onActiveMultiEffectTransformReset?.();
                                        onActiveMultiEffectOffsetReset?.();
                                    }}
                                    className="text-xs px-2 py-1 rounded bg-gray-700 hover:bg-gray-600 text-gray-200 border border-gray-600"
                                >
                                    重置
                                </button>
                            </div>
                            <div className="grid grid-cols-3 gap-2 items-center justify-items-center">
                                <div />
                                <button
                                    type="button"
                                    onClick={() => onActiveMultiEffectNudge?.(0, -20)}
                                    className="w-10 h-10 rounded-lg bg-gray-700 hover:bg-gray-600 text-white border border-gray-600"
                                    title="上移"
                                >
                                    ↑
                                </button>
                                <div />
                                <button
                                    type="button"
                                    onClick={() => onActiveMultiEffectNudge?.(-20, 0)}
                                    className="w-10 h-10 rounded-lg bg-gray-700 hover:bg-gray-600 text-white border border-gray-600"
                                    title="左移"
                                >
                                    ←
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onActiveMultiEffectNudge?.(0, 0)}
                                    className="w-10 h-10 rounded-lg bg-gray-700 text-gray-300 border border-gray-600 cursor-default"
                                    title="使用方向鍵移動"
                                >
                                    +
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onActiveMultiEffectNudge?.(20, 0)}
                                    className="w-10 h-10 rounded-lg bg-gray-700 hover:bg-gray-600 text-white border border-gray-600"
                                    title="右移"
                                >
                                    →
                                </button>
                                <div />
                                <button
                                    type="button"
                                    onClick={() => onActiveMultiEffectNudge?.(0, 20)}
                                    className="w-10 h-10 rounded-lg bg-gray-700 hover:bg-gray-600 text-white border border-gray-600"
                                    title="下移"
                                >
                                    ↓
                                </button>
                                <div />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-300">X</label>
                                    <input
                                        type="number"
                                        value={(activeTransform?.x ?? 0)}
                                        onChange={(e) => {
                                            const x = Number(e.target.value || 0);
                                            const y = activeTransform?.y ?? 0;
                                            onActiveMultiEffectOffsetChange?.({ x, y });
                                            onActiveMultiEffectTransformChange?.({ x, y });
                                        }}
                                        className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-gray-200 focus:outline-none focus:ring-1 focus:ring-red-400"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-300">Y</label>
                                    <input
                                        type="number"
                                        value={(activeTransform?.y ?? 0)}
                                        onChange={(e) => {
                                            const y = Number(e.target.value || 0);
                                            const x = activeTransform?.x ?? 0;
                                            onActiveMultiEffectOffsetChange?.({ x, y });
                                            onActiveMultiEffectTransformChange?.({ x, y });
                                        }}
                                        className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-gray-200 focus:outline-none focus:ring-1 focus:ring-red-400"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-300">縮放</label>
                                    <input
                                        type="number"
                                        step="0.05"
                                        min="0.1"
                                        max="2"
                                        value={(activeTransform?.scale ?? 1)}
                                        onChange={(e) => {
                                            const scale = Math.max(0.1, Math.min(2, Number(e.target.value || 1)));
                                            onActiveMultiEffectTransformChange?.({ scale });
                                        }}
                                        className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-gray-200 focus:outline-none focus:ring-1 focus:ring-red-400"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-300">旋轉 (°)</label>
                                    <input
                                        type="number"
                                        step="5"
                                        min="-180"
                                        max="180"
                                        value={(activeTransform?.rotation ?? 0)}
                                        onChange={(e) => {
                                            const rotation = Math.max(-180, Math.min(180, Number(e.target.value || 0)));
                                            onActiveMultiEffectTransformChange?.({ rotation });
                                        }}
                                        className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-gray-200 focus:outline-none focus:ring-1 focus:ring-red-400"
                                    />
                                </div>
                            </div>
                            <div className="text-[11px] text-gray-400">
                                提示：點選任一特效卡片會切換「目前」特效，這裡調整的 X/Y/縮放/旋轉只影響目前特效。
                            </div>
                        </div>
                    )}
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
                        <option value={ColorPaletteType.CUSTOM}>自選色彩</option>
                    </select>
                    
                    {/* 自選色彩選擇器 - 僅在選擇自選色彩時顯示 */}
                    {colorPalette === ColorPaletteType.CUSTOM && (
                        <div className="mt-3 p-3 bg-gray-800/50 rounded-lg border border-cyan-400/30 space-y-3">
                            <label className="text-xs font-medium text-cyan-300">自訂顏色</label>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-400">主色</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={customPrimaryColor}
                                            onChange={(e) => onCustomPrimaryColorChange?.(e.target.value)}
                                            className="w-10 h-10 rounded border border-gray-600 cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={customPrimaryColor}
                                            onChange={(e) => onCustomPrimaryColorChange?.(e.target.value)}
                                            className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-gray-200 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                                            placeholder="#67E8F9"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-400">次色</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={customSecondaryColor}
                                            onChange={(e) => onCustomSecondaryColorChange?.(e.target.value)}
                                            className="w-10 h-10 rounded border border-gray-600 cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={customSecondaryColor}
                                            onChange={(e) => onCustomSecondaryColorChange?.(e.target.value)}
                                            className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-gray-200 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                                            placeholder="#F472B6"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-gray-400">強調色</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={customAccentColor}
                                            onChange={(e) => onCustomAccentColorChange?.(e.target.value)}
                                            className="w-10 h-10 rounded border border-gray-600 cursor-pointer"
                                        />
                                        <input
                                            type="text"
                                            value={customAccentColor}
                                            onChange={(e) => onCustomAccentColorChange?.(e.target.value)}
                                            className="flex-1 bg-gray-700 border border-gray-600 rounded px-2 py-1 text-xs text-gray-200 focus:outline-none focus:ring-1 focus:ring-cyan-400"
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
                            <label className="text-sm font-medium text-gray-300">中間線條</label>
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
                    )}

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
                                        #374151 0%,
                                        #4B5563 50%,
                                        #6B7280 100%)`
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
                            <label className="text-sm font-medium text-gray-300">水平位移</label>
                            <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">{effectOffsetX}</span>
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
                            <label className="text-sm font-medium text-gray-300">垂直位移</label>
                            <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">{effectOffsetY}</span>
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

                    {/* 旋轉角度 */}
                    <div className="space-y-2">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-medium text-gray-300">旋轉角度</label>
                            <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">{Math.round(effectRotation)}°</span>
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
                                min={-180}
                                max={180}
                                step={1}
                                value={effectRotation}
                                onChange={(e) => onEffectRotationChange(parseFloat(e.target.value))}
                                className="w-full h-2 bg-transparent rounded-lg appearance-none cursor-pointer slider-enhanced relative z-10"
                                style={{ background: 'transparent' }}
                            />
                            <div
                                className="absolute top-0 h-2 rounded-lg pointer-events-none"
                                style={{
                                    left: 0,
                                    width: `${((effectRotation - (-180)) / (180 - (-180))) * 100}%`,
                                    transition: 'width 0.1s ease',
                                    backgroundColor: 'rgba(156, 163, 175, 0.4)'
                                }}
                            />
                        </div>
                        <p className="text-xs text-gray-400">
                            旋轉可視化特效（部分故障/實驗特效會自動跳過旋轉）
                        </p>
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
                                <label className="text-sm font-medium text-gray-300">平滑度</label>
                                <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">{smoothing}</span>
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
                                <label className="text-sm font-medium text-gray-300">均衡器</label>
                                <span className="text-xs text-gray-400 bg-gray-700 px-2 py-1 rounded">{equalization.toFixed(2)}</span>
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
