import React, { useEffect, useRef } from 'react';

interface ImageBasedVisualizerProps {
  type: 'liquid-metal' | 'solar-system';
  dataArray: Uint8Array;
  width: number;
  height: number;
  frame: number;
  sensitivity: number;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  isBeat?: boolean;
}

const ImageBasedVisualizer: React.FC<ImageBasedVisualizerProps> = ({
  type,
  dataArray,
  width,
  height,
  frame,
  sensitivity,
  colors,
  isBeat = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Audio analysis
  const bass = dataArray.slice(0, 16).reduce((a, b) => a + b, 0) / 16;
  const mid = dataArray.slice(16, 64).reduce((a, b) => a + b, 0) / 48;
  const treble = dataArray.slice(64, 128).reduce((a, b) => a + b, 0) / 64;
  
  const normalizedBass = bass / 255;
  const normalizedMid = mid / 255;
  const normalizedTreble = treble / 255;

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    
    if (type === 'liquid-metal') {
      renderLiquidMetal(container);
    } else if (type === 'solar-system') {
      renderSolarSystem(container);
    }
  }, [type, dataArray, frame, sensitivity, colors, isBeat]);

  const renderLiquidMetal = (container: HTMLDivElement) => {
    container.innerHTML = '';
    
    // 創建金屬花朵的HTML結構
    const flowerContainer = document.createElement('div');
    flowerContainer.className = 'liquid-metal-flower';
    flowerContainer.style.cssText = `
      position: relative;
      width: 100%;
      height: 100%;
      background: #000000;
      overflow: hidden;
    `;

    // 太陽花圖片作為基礎
    const sunflowerImg = document.createElement('img');
    sunflowerImg.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjMDAwIi8+CjxjaXJjbGUgY3g9IjEwMCIgY3k9IjEwMCIgcj0iMjAiIGZpbGw9IiNmZmZmZmYiLz4KPHBhdGggZD0iTTEwMCAyMGMwIDAgMjAgNDAgMjAgODBjMCA0MC0yMCA4MC0yMCA4MHMtMjAtNDAtMjAtODBjMC00MCAyMC04MCAyMC04MHoiIGZpbGw9IiNmZmZmZmYiLz4KPHBhdGggZD0iTTE4MCAxMDBjMCAwLTQwIDIwLTgwIDIwcy04MC0yMC04MC0yMCA0MCAyMCA4MCAyMCA4MC0yMHoiIGZpbGw9IiNmZmZmZmYiLz4KPHBhdGggZD0iTTEwMCAxODBjMCAwLTIwLTQwLTIwLTgwczIwLTgwIDIwLTgwIDIwIDQwIDIwIDgwLTIwIDgwLTIwIDgweiIgZmlsbD0iI2ZmZmZmZiIvPgo8cGF0aCBkPSJNMjAgMTAwYzAgMCA0MC0yMCA4MC0yMHM4MCAyMCA4MCAyMC00MCAyMC04MCAyMC04MC0yMHoiIGZpbGw9IiNmZmZmZmYiLz4KPC9zdmc+';
    sunflowerImg.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) scale(${1 + normalizedBass * 0.5});
      width: 150px;
      height: 150px;
      filter: hue-rotate(${normalizedMid * 360}deg) saturate(${1 + normalizedTreble * 2});
      transition: all 0.1s ease;
    `;

    // 金屬光澤效果
    const metallicOverlay = document.createElement('div');
    metallicOverlay.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        45deg,
        transparent 30%,
        rgba(255, 255, 255, ${0.1 + normalizedBass * 0.2}) 50%,
        transparent 70%
      );
      animation: metallic-shine 2s infinite;
    `;

    // 花瓣動畫
    const petals = document.createElement('div');
    petals.className = 'flower-petals';
    petals.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      width: 200px;
      height: 200px;
      transform: translate(-50%, -50%);
    `;

    // 創建8個花瓣
    for (let i = 0; i < 8; i++) {
      const petal = document.createElement('div');
      const angle = (i / 8) * 360;
      const petalLength = 80 + normalizedBass * 40;
      
      petal.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        width: 4px;
        height: ${petalLength}px;
        background: linear-gradient(to bottom, ${colors.primary}, ${colors.secondary});
        border-radius: 2px;
        transform: translate(-50%, -50%) rotate(${angle}deg) translateY(-${petalLength/2}px);
        transform-origin: center bottom;
        box-shadow: 0 0 20px ${colors.primary};
        animation: petal-wave 1s infinite ease-in-out;
        animation-delay: ${i * 0.1}s;
      `;
      
      petals.appendChild(petal);
    }

    flowerContainer.appendChild(sunflowerImg);
    flowerContainer.appendChild(metallicOverlay);
    flowerContainer.appendChild(petals);
    container.appendChild(flowerContainer);

    // 添加CSS動畫
    addLiquidMetalStyles();
  };

  const renderSolarSystem = (container: HTMLDivElement) => {
    container.innerHTML = '';
    
    const solarContainer = document.createElement('div');
    solarContainer.className = 'solar-system';
    solarContainer.style.cssText = `
      position: relative;
      width: 100%;
      height: 100%;
      background: #000000;
      overflow: hidden;
    `;

    // 太陽
    const sun = document.createElement('div');
    sun.className = 'sun';
    sun.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      width: ${60 + normalizedBass * 20}px;
      height: ${60 + normalizedBass * 20}px;
      background: radial-gradient(circle, #ffff00 0%, #ff6600 50%, #ff0000 100%);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      box-shadow: 0 0 50px #ffff00, 0 0 100px #ff6600;
      z-index: 10;
      animation: sun-pulse 2s infinite ease-in-out;
    `;

    // 九大行星
    const planets = [
      { name: '水星', color: '#8C7853', size: 8, distance: 80, speed: 0.02, features: '最靠近太陽，表面佈滿隕石坑' },
      { name: '金星', color: '#E7CDCD', size: 12, distance: 120, speed: 0.015, features: '最亮的行星，有濃厚的大氣層' },
      { name: '地球', color: '#6B93D6', size: 13, distance: 160, speed: 0.012, features: '藍色星球，有液態水和大氣層' },
      { name: '火星', color: '#CD5C5C', size: 11, distance: 200, speed: 0.01, features: '紅色星球，有沙塵暴和極冠' },
      { name: '木星', color: '#DAA520', size: 25, distance: 280, speed: 0.008, features: '最大的行星，有大紅斑風暴' },
      { name: '土星', color: '#F4A460', size: 22, distance: 360, speed: 0.006, features: '有美麗的光環系統' },
      { name: '天王星', color: '#40E0D0', size: 18, distance: 440, speed: 0.004, features: '側躺著自轉，有淡藍色光環' },
      { name: '海王星', color: '#4169E1', size: 17, distance: 520, speed: 0.003, features: '最遠的氣態巨行星，有強烈風暴' },
      { name: '冥王星', color: '#C0C0C0', size: 6, distance: 580, speed: 0.002, features: '矮行星，有冰凍表面' }
    ];

    planets.forEach((planet, index) => {
      const planetElement = document.createElement('div');
      planetElement.className = `planet ${planet.name.toLowerCase()}`;
      
      const currentAngle = frame * planet.speed + (index * Math.PI * 2) / planets.length;
      const x = 50 + Math.cos(currentAngle) * (planet.distance / 10);
      const y = 50 + Math.sin(currentAngle) * (planet.distance / 10);
      
      planetElement.style.cssText = `
        position: absolute;
        top: ${y}%;
        left: ${x}%;
        width: ${planet.size + normalizedMid * 5}px;
        height: ${planet.size + normalizedMid * 5}px;
        background: radial-gradient(circle, ${planet.color} 0%, ${planet.color}dd 70%, ${planet.color}88 100%);
        border-radius: 50%;
        transform: translate(-50%, -50%);
        box-shadow: 0 0 20px ${planet.color};
        cursor: pointer;
        transition: all 0.3s ease;
        z-index: ${10 - index};
      `;

      // 行星軌道
      const orbit = document.createElement('div');
      orbit.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        width: ${planet.distance * 2}px;
        height: ${planet.distance * 2}px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 50%;
        transform: translate(-50%, -50%);
        z-index: 1;
      `;

      // 行星特徵提示
      planetElement.title = `${planet.name}: ${planet.features}`;
      
      // 點擊顯示詳細信息
      planetElement.addEventListener('click', () => {
        showPlanetInfo(planet);
      });

      solarContainer.appendChild(orbit);
      solarContainer.appendChild(planetElement);
    });

    // 小行星帶
    const asteroidBelt = document.createElement('div');
    asteroidBelt.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      width: 400px;
      height: 400px;
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 50%;
      transform: translate(-50%, -50%);
      z-index: 1;
    `;

    // 流星效果（偶爾出現）
    if (Math.random() > 0.995) {
      const shootingStar = document.createElement('div');
      shootingStar.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 2px;
        height: 2px;
        background: white;
        border-radius: 50%;
        box-shadow: 0 0 10px white;
        animation: shooting-star 3s linear forwards;
      `;
      solarContainer.appendChild(shootingStar);
    }

    solarContainer.appendChild(sun);
    container.appendChild(solarContainer);

    // 添加CSS動畫
    addSolarSystemStyles();
  };

  const addLiquidMetalStyles = () => {
    if (document.getElementById('liquid-metal-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'liquid-metal-styles';
    style.textContent = `
      @keyframes metallic-shine {
        0%, 100% { transform: translateX(-100%) translateY(-100%); }
        50% { transform: translateX(100%) translateY(100%); }
      }
      
      @keyframes petal-wave {
        0%, 100% { transform: translate(-50%, -50%) rotate(var(--angle)) translateY(-40px) scale(1); }
        50% { transform: translate(-50%, -50%) rotate(var(--angle)) translateY(-50px) scale(1.1); }
      }
      
      .liquid-metal-flower {
        perspective: 1000px;
      }
      
      .flower-petals {
        animation: rotate 20s linear infinite;
      }
      
      @keyframes rotate {
        from { transform: translate(-50%, -50%) rotate(0deg); }
        to { transform: translate(-50%, -50%) rotate(360deg); }
      }
    `;
    document.head.appendChild(style);
  };

  const addSolarSystemStyles = () => {
    if (document.getElementById('solar-system-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'solar-system-styles';
    style.textContent = `
      @keyframes sun-pulse {
        0%, 100% { transform: translate(-50%, -50%) scale(1); }
        50% { transform: translate(-50%, -50%) scale(1.1); }
      }
      
      @keyframes shooting-star {
        0% { 
          transform: translate(0, 0) rotate(45deg);
          opacity: 1;
        }
        100% { 
          transform: translate(200px, 200px) rotate(45deg);
          opacity: 0;
        }
      }
      
      .planet:hover {
        transform: translate(-50%, -50%) scale(1.5) !important;
        z-index: 100 !important;
      }
      
      .solar-system {
        perspective: 1000px;
      }
    `;
    document.head.appendChild(style);
  };

  const showPlanetInfo = (planet: any) => {
    // 創建行星信息彈窗
    const infoBox = document.createElement('div');
    infoBox.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 20px;
      border-radius: 10px;
      border: 2px solid ${planet.color};
      z-index: 1000;
      max-width: 300px;
      text-align: center;
    `;
    
    infoBox.innerHTML = `
      <h3 style="color: ${planet.color}; margin: 0 0 10px 0;">${planet.name}</h3>
      <p style="margin: 0; line-height: 1.5;">${planet.features}</p>
      <button onclick="this.parentElement.remove()" style="margin-top: 15px; padding: 8px 16px; background: ${planet.color}; border: none; color: white; border-radius: 5px; cursor: pointer;">關閉</button>
    `;
    
    document.body.appendChild(infoBox);
    
    // 3秒後自動關閉
    setTimeout(() => {
      if (infoBox.parentElement) {
        infoBox.remove();
      }
    }, 3000);
  };

  return (
    <div 
      ref={containerRef}
      style={{ 
        width: `${width}px`, 
        height: `${height}px`,
        position: 'relative'
      }}
    />
  );
};

export default ImageBasedVisualizer;
