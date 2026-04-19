import React, { useRef } from 'react';

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

const MIN_GAP = 0.5;

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
    const dragging = useRef<'start' | 'end' | null>(null);

    const timeFromPointer = (e: React.PointerEvent): number => {
        const track = trackRef.current;
        if (!track || duration <= 0) return 0;
        const rect = track.getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        return ratio * duration;
    };

    const handleTrackPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        const t = timeFromPointer(e);
        // 點擊哪個把手比較近就拖哪個
        const distStart = Math.abs(t - clipStart);
        const distEnd = Math.abs(t - clipEnd);
        dragging.current = distStart <= distEnd ? 'start' : 'end';
        (e.currentTarget as HTMLDivElement).setPointerCapture(e.pointerId);
        e.preventDefault();
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!dragging.current) return;
        const t = timeFromPointer(e);
        if (dragging.current === 'start') {
            onClipStartChange(Math.max(0, Math.min(t, clipEnd - MIN_GAP)));
        } else {
            onClipEndChange(Math.min(duration, Math.max(t, clipStart + MIN_GAP)));
        }
    };

    const handlePointerUp = () => {
        if (!dragging.current) return;
        dragging.current = null;
    };

    const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
        // 僅在非拖曳狀態且點擊選取範圍外才跳轉
        if (dragging.current) return;
        const track = trackRef.current;
        if (!track || duration <= 0) return;
        const rect = track.getBoundingClientRect();
        const t = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)) * duration;
        onSeek(t);
    };

    if (duration <= 0) return null;

    const pct = (t: number) => `${(t / duration) * 100}%`;

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
                <div className="relative select-none pb-6">
                    <div
                        ref={trackRef}
                        className="relative h-8 rounded-lg cursor-pointer"
                        style={{ background: 'rgba(255,255,255,0.08)' }}
                        onPointerDown={handleTrackPointerDown}
                        onPointerMove={handlePointerMove}
                        onPointerUp={handlePointerUp}
                        onPointerCancel={handlePointerUp}
                        onClick={handleTrackClick}
                    >
                        {/* 選取範圍高亮 */}
                        <div
                            className="absolute top-0 h-full bg-cyan-500/25 border-t border-b border-cyan-400/40 pointer-events-none"
                            style={{ left: pct(clipStart), width: pct(clipEnd - clipStart) }}
                        />

                        {/* 播放頭 */}
                        <div
                            className="absolute top-0 w-0.5 h-full bg-white/50 pointer-events-none z-10"
                            style={{ left: pct(currentTime) }}
                        />

                        {/* 起點把手（藍色） */}
                        <div
                            className="absolute top-0 h-full flex items-center pointer-events-none"
                            style={{ left: pct(clipStart) }}
                        >
                            <div className="w-3 h-full bg-cyan-400 rounded-l-sm -translate-x-1.5 flex items-center justify-center">
                                <div className="w-0.5 h-4 bg-cyan-900/60 rounded" />
                            </div>
                            <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 text-[10px] text-cyan-300 whitespace-nowrap font-mono">
                                {fmt(clipStart)}
                            </div>
                        </div>

                        {/* 終點把手（橘色） */}
                        <div
                            className="absolute top-0 h-full flex items-center pointer-events-none"
                            style={{ left: pct(clipEnd) }}
                        >
                            <div className="w-3 h-full bg-orange-400 rounded-r-sm -translate-x-1.5 flex items-center justify-center">
                                <div className="w-0.5 h-4 bg-orange-900/60 rounded" />
                            </div>
                            <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 text-[10px] text-orange-300 whitespace-nowrap font-mono">
                                {fmt(clipEnd)}
                            </div>
                        </div>
                    </div>

                    <p className="text-[11px] text-gray-500 mt-1 pt-1">
                        拖曳 <span className="text-cyan-400">■ 藍色</span> 設起點、<span className="text-orange-400">■ 橘色</span> 設終點；點擊軌道跳轉時間
                    </p>
                </div>
            )}
        </div>
    );
};

export default ClipSelector;
