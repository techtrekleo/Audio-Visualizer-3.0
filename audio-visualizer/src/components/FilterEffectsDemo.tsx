import React, { useState } from 'react';
import FilterEffects, { FilterEffectProps } from './FilterEffects';

const FilterEffectsDemo: React.FC = () => {
  const [currentEffect, setCurrentEffect] = useState<FilterEffectProps['type']>('snow');
  const [intensity, setIntensity] = useState(0.5);
  const [opacity, setOpacity] = useState(0.6);
  const [speed, setSpeed] = useState(1);
  const [enabled, setEnabled] = useState(true);

  const effects = [
    { value: 'snow', label: '雪花飄落', description: '白色六角雪花緩慢飄落' },
    { value: 'particles', label: '光點飄落', description: '彩色發光粒子飄落' },
    { value: 'stars', label: '星空閃爍', description: '背景星空點點閃爍' },
    { value: 'rain', label: '雨滴效果', description: '半透明雨滴從上往下' },
    { value: 'cherry-blossom', label: '櫻花飄落', description: '粉色花瓣飄落旋轉' }
  ] as const;

  return (
    <div style={{ 
      position: 'relative', 
      width: '100%', 
      height: '100vh',
      background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #2d2d2d 100%)',
      overflow: 'hidden',
      fontFamily: 'Arial, sans-serif'
    }}>
      {/* 濾鏡效果 */}
      <FilterEffects
        type={currentEffect}
        intensity={intensity}
        opacity={opacity}
        speed={speed}
        enabled={enabled}
      />

      {/* 控制面板 */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(10px)',
        borderRadius: '15px',
        padding: '20px',
        color: 'white',
        zIndex: 10,
        minWidth: '300px',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <h2 style={{ 
          margin: '0 0 20px 0', 
          fontSize: '1.5rem',
          background: 'linear-gradient(45deg, #4ecdc4, #45b7d1)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          🎨 全畫面濾鏡特效測試
        </h2>

        {/* 效果選擇 */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
            選擇效果：
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {effects.map((effect) => (
              <button
                key={effect.value}
                onClick={() => setCurrentEffect(effect.value)}
                style={{
                  padding: '8px 12px',
                  background: currentEffect === effect.value 
                    ? 'linear-gradient(45deg, #4ecdc4, #45b7d1)' 
                    : 'rgba(255, 255, 255, 0.1)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  if (currentEffect !== effect.value) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentEffect !== effect.value) {
                    e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                  }
                }}
              >
                {effect.label}
              </button>
            ))}
          </div>
          <p style={{ 
            margin: '8px 0 0 0', 
            fontSize: '0.8rem', 
            color: '#b8b8b8',
            fontStyle: 'italic'
          }}>
            {effects.find(e => e.value === currentEffect)?.description}
          </p>
        </div>

        {/* 強度控制 */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            強度: {Math.round(intensity * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={intensity}
            onChange={(e) => setIntensity(parseFloat(e.target.value))}
            style={{
              width: '100%',
              height: '6px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '3px',
              outline: 'none',
              cursor: 'pointer'
            }}
          />
        </div>

        {/* 透明度控制 */}
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            透明度: {Math.round(opacity * 100)}%
          </label>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={opacity}
            onChange={(e) => setOpacity(parseFloat(e.target.value))}
            style={{
              width: '100%',
              height: '6px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '3px',
              outline: 'none',
              cursor: 'pointer'
            }}
          />
        </div>

        {/* 速度控制 */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>
            速度: {speed.toFixed(1)}x
          </label>
          <input
            type="range"
            min="0.5"
            max="2"
            step="0.1"
            value={speed}
            onChange={(e) => setSpeed(parseFloat(e.target.value))}
            style={{
              width: '100%',
              height: '6px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '3px',
              outline: 'none',
              cursor: 'pointer'
            }}
          />
        </div>

        {/* 開關 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={() => setEnabled(!enabled)}
            style={{
              padding: '10px 20px',
              background: enabled 
                ? 'linear-gradient(45deg, #ff6b6b, #4ecdc4)' 
                : 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold',
              transition: 'all 0.3s ease'
            }}
          >
            {enabled ? '關閉特效' : '開啟特效'}
          </button>
          <span style={{ fontSize: '0.9rem', color: '#b8b8b8' }}>
            {enabled ? '特效已開啟' : '特效已關閉'}
          </span>
        </div>
      </div>

      {/* 說明文字 */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(10px)',
        borderRadius: '10px',
        padding: '15px 25px',
        color: 'white',
        textAlign: 'center',
        zIndex: 10,
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem' }}>
          🎵 音樂脈動 - 全畫面濾鏡特效
        </h3>
        <p style={{ margin: '0', fontSize: '0.9rem', color: '#b8b8b8' }}>
          這是一個全畫面濾鏡特效的測試版本，可以疊加在音頻可視化器上
        </p>
        <p style={{ margin: '5px 0 0 0', fontSize: '0.8rem', color: '#888' }}>
          使用 mix-blend-mode: screen 確保效果不會過於突兀
        </p>
      </div>
    </div>
  );
};

export default FilterEffectsDemo;