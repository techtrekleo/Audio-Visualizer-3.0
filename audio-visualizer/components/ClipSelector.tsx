import React, { useRef, useCallback } from 'react';

interface ClipSelectorProps {
    duration: number;
    clipStart: number;
    clipEnd: number;
    currentTime: number;
    enabled: boolean;
    onClipStartChange: (t: number) => void;
    onClipEndChange: (t: number) => void;
    onEnabledChange: (v: boolean) => void;
    onSeek: (t: number) => void;
}

function fmt(sec: number): string {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    const ms = Math.floor((sec % 1) * 10);
    return `${m}:${String(s).padStart(2, '0')}.${ms}`;
}

const ClipSelector: React.FC<ClipSelectorProps> = ({
    duration,
    clipStart,
    clipEnd,
    currentTime,
    enabled,
    onClipStartChange,
    onClipEndChange,
    onEnabledChange,
    onSeek,
}) => {
    const trackRef = useRef<HTMLDivElement>(null);

    const posFromEvent = useCallback((e: React.MouseEvent | React.TouchEvent): number => {
        const track = trackRef.current;
        if (!track || duration <= 0) return 0;
        const rect = track.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        return ratio * duration;
    }, [duration]);

    const startLeft = duration > 0 ? (clipStart / duration) * 100 : 0;
    const endLeft = duration > 0 ? (clipEnd / duration) * 100 : 100;
    const playLeft = duration > 0 ? (currentTime / duration) * 100 : 0;

    if (duration <= 0) return null;

    return (
        <div className="space-y-2">
            {/* 開關列 */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onEnabledChange(!enabled)}
                        className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${enabled ? 'bg-cyan-500' : 'bg-gray-600'}`}
                    >
                        <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${enabled ? 'translate-x-4' : 'translate-x-1'}`} />
                    </button>
                    <span className="text-sm font-medium text-gray-300">片段錄製</span>
                </div>
                {enabled && (
                    <span className="text-xs text-cyan-400 font-mono">
                        {fmt(clipStart)} → {fmt(clipEnd)}
                        <span className="text-gray-500 ml-1">({fmt(clipEnd - clipStart)})</span>
                    </span>
                )}
            </div>

            {/* 時間軸 */}
            {enabled && (
                <div className="relative select-none">
                    {/* 軌道 */}
                    <div
                        ref={trackRef}
                        className="relative h-8 rounded-lg overflow-hidden cursor-pointer"
                        style={{ background: 'rgba(255,255,255,0.08)' }}
                        onClick={(e) => {
                            const t = posFromEvent(e);
                            onSeek(t);
                        }}
                    >
                        {/* 已選範圍高亮 */}
                        <div
                            className="absolute top-0 h-full bg-cyan-500/30 border-t border-b border-cyan-400/50"
                            style={{ left: `${startLeft}%`, width: `${endLeft - startLeft}%` }}
                        />

                        {/* 播放頭 */}
                        <div
                            className="absolute top-0 w-0.5 h-full bg-white/60 z-10 pointer-events-none"
                            style={{ left: `${playLeft}%` }}
                        />

                        {/* 起點把手 */}
                        <input
                            type="range"
                            min={0}
                            max={duration}
                            step={0.1}
                            value={clipStart}
                            onChange={(e) => {
                                const v = Math.min(Number(e.target.value), clipEnd - 0.5);
                                onClipStartChange(v);
                            }}
                            className="clip-handle absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
                            style={{ pointerEvents: 'all' }}
                        />

                        {/* 終點把手（疊在上面，用 dir=rtl 技巧讓右側優先） */}
                        <input
                            type="range"
                            min={0}
                            max={duration}
                            step={0.1}
                            value={clipEnd}
                            onChange={(e) => {
                                const v = Math.max(Number(e.target.value), clipStart + 0.5);
                                onClipEndChange(v);
                            }}
                            className="clip-handle absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
                            style={{ pointerEvents: 'all', direction: 'rtl' }}
                        />

                        {/* 起點標記 */}
                        <div
                            className="absolute top-0 w-1 h-full bg-cyan-400 rounded-sm z-10 pointer-events-none"
                            style={{ left: `calc(${startLeft}% - 2px)` }}
                        >
                            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-cyan-300 whitespace-nowrap font-mono">
                                {fmt(clipStart)}
                            </div>
                        </div>

                        {/* 終點標記 */}
                        <div
                            className="absolute top-0 w-1 h-full bg-orange-400 rounded-sm z-10 pointer-events-none"
                            style={{ left: `calc(${endLeft}% - 2px)` }}
                        >
                            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] text-orange-300 whitespace-nowrap font-mono">
                                {fmt(clipEnd)}
                            </div>
                        </div>
                    </div>

                    {/* 底部時間標籤佔位 */}
                    <div className="h-5" />

                    <p className="text-[11px] text-gray-500 mt-1">
                        拖曳 <span className="text-cyan-400">■ 藍色</span> 設起點、<span className="text-orange-400">■ 橘色</span> 設終點；點擊軌道可跳轉時間
                    </p>
                </div>
            )}
        </div>
    );
};

export default ClipSelector;
