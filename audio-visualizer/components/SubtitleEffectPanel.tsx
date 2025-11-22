import React from 'react';
import { SubtitleEffectType } from '../types';

interface SubtitleEffectPanelProps {
    subtitleEffectIds: SubtitleEffectType[];
    onSubtitleEffectIdsChange: (effectIds: SubtitleEffectType[]) => void;
    subtitleColor: string;
    onSubtitleColorChange: (color: string) => void;
    subtitleColor2: string;
    onSubtitleColor2Change: (color: string) => void;
}

const SUBTITLE_EFFECTS = [
    { id: SubtitleEffectType.NONE, name: '無' },
    { id: SubtitleEffectType.BOLD, name: '粗體' },
    { id: SubtitleEffectType.SHADOW, name: '陰影' },
    { id: SubtitleEffectType.NEON, name: '霓虹光' },
    { id: SubtitleEffectType.OUTLINE, name: '描邊' },
    { id: SubtitleEffectType.FAUX_3D, name: '偽3D' },
    { id: SubtitleEffectType.GLITCH, name: '故障感' },
] as const;

export const SubtitleEffectPanel: React.FC<SubtitleEffectPanelProps> = ({
    subtitleEffectIds,
    onSubtitleEffectIdsChange,
    subtitleColor,
    onSubtitleColorChange,
    subtitleColor2,
    onSubtitleColor2Change,
}) => {
    const handleEffectToggle = (effectId: SubtitleEffectType) => {
        if (effectId === SubtitleEffectType.NONE) {
            onSubtitleEffectIdsChange([]);
            return;
        }
        
        const newEffectIds = new Set(subtitleEffectIds);
        
        if (newEffectIds.has(effectId)) {
            newEffectIds.delete(effectId);
        } else {
            newEffectIds.add(effectId);
        }
        
        onSubtitleEffectIdsChange(Array.from(newEffectIds).sort());
    };

    const renderColorPickers = () => {
        const effects = new Set(subtitleEffectIds);
        const pickers: React.ReactNode[] = [];

        // 霓虹光時，額外顯示光暈顏色（使用次色）
        if (effects.has(SubtitleEffectType.NEON)) {
            pickers.push(
                <div key="neon-glow" className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">光暈顏色</label>
                    <div className="flex items-center gap-2">
                        <input
                            type="color"
                            value={subtitleColor2}
                            onChange={(e) => onSubtitleColor2Change(e.target.value)}
                            className="w-12 h-12 rounded border border-gray-600 cursor-pointer bg-transparent"
                        />
                        <input
                            type="text"
                            value={subtitleColor2}
                            onChange={(e) => onSubtitleColor2Change(e.target.value)}
                            className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-cyan-400"
                            placeholder="#67E8F9"
                        />
                    </div>
                </div>
            );
        }

        // 次色（用於陰影、描邊、偽3D）
        const hasColor2Effect = effects.has(SubtitleEffectType.SHADOW) || 
                                effects.has(SubtitleEffectType.OUTLINE) || 
                                effects.has(SubtitleEffectType.FAUX_3D);
        if (hasColor2Effect) {
            const labels = [];
            if (effects.has(SubtitleEffectType.SHADOW)) labels.push('陰影');
            if (effects.has(SubtitleEffectType.OUTLINE)) labels.push('描邊');
            if (effects.has(SubtitleEffectType.FAUX_3D)) labels.push('立體');
            
            pickers.push(
                <div key="c2" className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">{`${labels.join('/')} 顏色`}</label>
                    <div className="flex items-center gap-2">
                        <input
                            type="color"
                            value={subtitleColor2}
                            onChange={(e) => onSubtitleColor2Change(e.target.value)}
                            className="w-12 h-12 rounded border border-gray-600 cursor-pointer bg-transparent"
                        />
                        <input
                            type="text"
                            value={subtitleColor2}
                            onChange={(e) => onSubtitleColor2Change(e.target.value)}
                            className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-cyan-400"
                            placeholder="#67E8F9"
                        />
                    </div>
                </div>
            );
        }
        
        return <>{pickers}</>;
    };

    return (
        <div className="space-y-3">
            {/* 特效選擇 */}
            <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-300">字幕特效 (可複選)</label>
                <div className="grid grid-cols-3 gap-2">
                    {SUBTITLE_EFFECTS.map(effect => {
                        const isActive = effect.id === SubtitleEffectType.NONE 
                            ? subtitleEffectIds.length === 0 
                            : subtitleEffectIds.includes(effect.id);
                        return (
                            <button
                                key={effect.id}
                                onClick={() => handleEffectToggle(effect.id)}
                                className={`py-2 px-2 rounded-lg text-center font-semibold transition-all duration-200 border text-xs ${
                                    isActive ? 'bg-cyan-600 border-cyan-400 text-white' : 'bg-gray-700 border-gray-600 hover:bg-gray-600 text-gray-200'
                                }`}
                            >
                                {effect.name}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* 其他顏色選擇器（光暈、陰影、描邊等） */}
            <div className="space-y-2">{renderColorPickers()}</div>
        </div>
    );
};

export default SubtitleEffectPanel;

