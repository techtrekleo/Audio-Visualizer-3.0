import React from 'react';
import type { TextBlock, EffectId, FontId } from '../types';
import { fonts, effects } from '../constants';
import { ColorInput } from './ColorInput';

interface DraggableTextBlockProps {
  textBlock: TextBlock;
  onUpdate: (updatedTextBlock: TextBlock) => void;
  isSelected: boolean;
}

export const DraggableTextBlock: React.FC<DraggableTextBlockProps> = ({
  textBlock,
  onUpdate,
  isSelected
}) => {
  // 移除未使用的拖動相關代碼，因為我們使用滑塊控制位置

  const handleEffectToggle = (effectId: EffectId) => {
    if (effectId === 'none') {
      onUpdate({ ...textBlock, effectIds: [] });
      return;
    }
    
    const currentEffectIds = textBlock.effectIds || [];
    const newEffectIds = new Set(currentEffectIds);
    
    if (newEffectIds.has(effectId)) {
      newEffectIds.delete(effectId);
    } else {
      newEffectIds.add(effectId);
    }
    
    onUpdate({
      ...textBlock,
      effectIds: Array.from(newEffectIds).sort()
    });
  };

  const renderColorPickers = () => {
    const effects = new Set(textBlock.effectIds);
    const pickers: React.ReactNode[] = [];

    if (effects.has('neon')) {
      pickers.push(
        <ColorInput key="neon1" label="光暈顏色" value={textBlock.color1} onChange={(c) => onUpdate({ ...textBlock, color1: c })} />
      );
    } else {
      pickers.push(
        <ColorInput key="c1" label="文字顏色" value={textBlock.color1} onChange={(c) => onUpdate({ ...textBlock, color1: c })} />
      );
    }

    const hasColor2Effect = effects.has('shadow') || effects.has('outline') || effects.has('faux-3d');
    if (hasColor2Effect) {
      const labels = [];
      if (effects.has('shadow')) labels.push('陰影');
      if (effects.has('outline')) labels.push('描邊');
      if (effects.has('faux-3d')) labels.push('立體');
      
      pickers.push(
        <ColorInput key="c2" label={`${labels.join('/')} 顏色`} value={textBlock.color2} onChange={(c) => onUpdate({ ...textBlock, color2: c })} />
      );
    }
    
    return <>{pickers}</>;
  };

  const getTypeLabel = () => {
    switch (textBlock.type) {
      case 'main': return '主標題';
      case 'sub1': return '副標題一';
      case 'sub2': return '副標題二';
      default: return '文字';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold" style={{ color: '#4A4A4A' }}>{getTypeLabel()}</h3>
        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: isSelected ? '#8B9DC3' : '#9CA3AF' }}></div>
      </div>

      <div className="space-y-3">
        <input
          type="text"
          value={textBlock.text}
          onChange={(e) => onUpdate({ ...textBlock, text: e.target.value })}
          placeholder={`輸入${getTypeLabel()}...`}
          className="w-full p-3 rounded-lg focus:ring-2 transition"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid rgba(139, 157, 195, 0.4)', color: '#4A4A4A' }}
        />
        <p className="text-right text-sm -mt-2" style={{ color: '#6B7280' }}>{textBlock.text.length} 字元</p>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-semibold" style={{ color: '#4A4A4A' }}>字體</label>
        <select
          value={textBlock.fontId}
          onChange={(e) => onUpdate({ ...textBlock, fontId: e.target.value as FontId })}
          className="w-full p-3 rounded-lg focus:ring-2 transition"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid rgba(139, 157, 195, 0.4)', color: '#4A4A4A' }}
        >
          {fonts.map(font => (
            <option key={font.id} value={font.id} style={{ fontFamily: `"${font.family}"`, fontWeight: font.weight }}>
              {font.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-semibold" style={{ color: '#4A4A4A' }}>文字方向</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onUpdate({ ...textBlock, orientation: 'horizontal' })}
            className="py-2 px-3 rounded-lg text-center font-semibold transition-all duration-200 border text-sm"
            style={textBlock.orientation === 'horizontal'
              ? { background: 'linear-gradient(135deg, #8B9DC3 0%, #9CA3AF 100%)', borderColor: '#9CA3AF', color: '#FFFFFF' }
              : { backgroundColor: 'rgba(255, 255, 255, 0.8)', borderColor: 'rgba(139, 157, 195, 0.4)', color: '#4A4A4A' }
            }
            onMouseEnter={(e) => {
              if (textBlock.orientation !== 'horizontal') {
                e.currentTarget.style.backgroundColor = 'rgba(139, 157, 195, 0.2)';
              }
            }}
            onMouseLeave={(e) => {
              if (textBlock.orientation !== 'horizontal') {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
              }
            }}
          >
            ↔️ 橫式
          </button>
          <button
            onClick={() => onUpdate({ ...textBlock, orientation: 'vertical' })}
            className="py-2 px-3 rounded-lg text-center font-semibold transition-all duration-200 border text-sm"
            style={textBlock.orientation === 'vertical'
              ? { background: 'linear-gradient(135deg, #8B9DC3 0%, #9CA3AF 100%)', borderColor: '#9CA3AF', color: '#FFFFFF' }
              : { backgroundColor: 'rgba(255, 255, 255, 0.8)', borderColor: 'rgba(139, 157, 195, 0.4)', color: '#4A4A4A' }
            }
            onMouseEnter={(e) => {
              if (textBlock.orientation !== 'vertical') {
                e.currentTarget.style.backgroundColor = 'rgba(139, 157, 195, 0.2)';
              }
            }}
            onMouseLeave={(e) => {
              if (textBlock.orientation !== 'vertical') {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
              }
            }}
          >
            ↕️ 直式
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-semibold" style={{ color: '#4A4A4A' }}>特效 (可複選)</label>
        <div className="grid grid-cols-3 gap-2">
          {effects.map(effect => {
            const isActive = effect.id === 'none' 
              ? textBlock.effectIds.length === 0 
              : textBlock.effectIds.includes(effect.id);
            return (
              <button
                key={effect.id}
                onClick={() => handleEffectToggle(effect.id)}
                className="py-2 px-2 rounded-lg text-center font-semibold transition-all duration-200 border text-xs"
                style={isActive
                  ? { background: 'linear-gradient(135deg, #8B9DC3 0%, #9CA3AF 100%)', borderColor: '#9CA3AF', color: '#FFFFFF' }
                  : { backgroundColor: 'rgba(255, 255, 255, 0.8)', borderColor: 'rgba(139, 157, 195, 0.4)', color: '#4A4A4A' }
                }
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'rgba(139, 157, 195, 0.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
                  }
                }}
              >
                {effect.name}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <label className="block text-sm font-semibold" style={{ color: '#4A4A4A' }}>字體大小</label>
        <div className="p-3 rounded-lg border" style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)', borderColor: 'rgba(139, 157, 195, 0.3)' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="font-medium" style={{ color: '#4A4A4A' }}>當前大小</span>
            <span className="font-bold text-lg" style={{ color: '#8B9DC3' }}>{textBlock.fontSize}px</span>
          </div>
          
          {/* 手動輸入 */}
          <div className="mb-3">
            <label className="block text-xs mb-1" style={{ color: '#6B7280' }}>手動輸入字體大小</label>
            <input
              type="number"
              min="10"
              max="500"
              value={textBlock.fontSize}
              onChange={(e) => onUpdate({ ...textBlock, fontSize: Number(e.target.value) })}
              className="w-full p-2 rounded text-sm focus:outline-none focus:ring-2"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid rgba(139, 157, 195, 0.4)', color: '#4A4A4A' }}
              placeholder="輸入字體大小 (10-500px)"
            />
          </div>
          
          <div className="text-xs mb-2" style={{ color: '#6B7280' }}>
            💡 提示：可以直接輸入數字，或在右側畫布上拖動右下角藍色控制點
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => onUpdate({ ...textBlock, fontSize: 120 })}
              className="px-3 py-1 text-xs rounded transition"
              style={{ background: 'linear-gradient(135deg, #8B9DC3 0%, #9CA3AF 100%)', color: '#FFFFFF' }}
            >
              重置為 120px
            </button>
            <button
              onClick={() => onUpdate({ ...textBlock, fontSize: 60 })}
              className="px-3 py-1 text-xs rounded transition"
              style={{ background: 'linear-gradient(135deg, #A8B5C4 0%, #9CA3AF 100%)', color: '#FFFFFF' }}
            >
              重置為 60px
            </button>
            <button
              onClick={() => onUpdate({ ...textBlock, fontSize: 400 })}
              className="px-3 py-1 text-xs rounded transition"
              style={{ background: 'linear-gradient(135deg, #9CA3AF 0%, #8B9DC3 100%)', color: '#FFFFFF' }}
            >
              大標題 400px
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-3">{renderColorPickers()}</div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold" style={{ color: '#4A4A4A' }}>位置</label>
        <div className="text-xs p-3 rounded-lg border" style={{ backgroundColor: 'rgba(255, 255, 255, 0.7)', borderColor: 'rgba(139, 157, 195, 0.3)', color: '#5C5C5C' }}>
          <div className="flex items-center gap-2 mb-2">
            <span style={{ color: '#D4A5A5' }}>💡</span>
            <span className="font-semibold">拖動操作說明</span>
          </div>
          <p className="mb-1">• 直接在右側畫布上拖動文字區塊來調整位置</p>
          <p className="mb-1">• 選中的文字區塊會顯示青色邊框</p>
          <p>• 拖動時會顯示黃色邊框和提示</p>
        </div>
        <div className="text-xs p-2 rounded" style={{ backgroundColor: 'rgba(255, 255, 255, 0.6)', color: '#6B7280' }}>
          當前位置：X: {Math.round(textBlock.x)}px, Y: {Math.round(textBlock.y)}px
        </div>
      </div>
    </div>
  );
};
