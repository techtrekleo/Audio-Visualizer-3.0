import React, { useState, useRef, useCallback, useEffect } from 'react';
import { DownloadIcon, ClearIcon, InspirationIcon, PhotoIcon } from './components/Icons';
import { DraggableTextBlock } from './components/DraggableTextBlock';
import { VisualCanvas } from './components/VisualCanvas';
import { PresetManager } from './components/PresetManager';
import { UnifiedHeader } from './components/UnifiedLayout';
import { ModalProvider } from '../../shared-components/dist';
import { renderComposition, getRandomItem, getRandomHexColor } from './utils/canvas';
import { fonts, effects, canvasSizes, chineseFrames, DEFAULT_COLOR_1, DEFAULT_COLOR_2 } from './constants';
import type { TextBlock, CanvasSizeId, EffectId, SavedPreset, ChineseFrameId } from './types';

const App: React.FC = () => {
  const [canvasSizeId, setCanvasSizeId] = useState<CanvasSizeId>('youtube_thumb');
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [outputImage, setOutputImage] = useState<string | null>(null);
  const [selectedTextBlockId, setSelectedTextBlockId] = useState<string | null>('main');
  const [chineseFrameId, setChineseFrameId] = useState<ChineseFrameId>('none');
  const [frameSize, setFrameSize] = useState({ width: 0.7, height: 0.5 }); // 邊框大小比例
  const [framePosition, setFramePosition] = useState({ x: 0.15, y: 0.25 }); // 邊框位置比例
  const [frameColor, setFrameColor] = useState('#2C3E50'); // 邊框主色
  const [frameOpacity, setFrameOpacity] = useState(1.0); // 邊框透明度

  const fileInputRef = useRef<HTMLInputElement>(null);
  const renderRef = useRef(0);

  const activeCanvasSize = canvasSizes.find(s => s.id === canvasSizeId) || canvasSizes[0];

  // 初始化三個文字區塊 (YT 縮圖 16:9 優化)
  const initialTextBlocks: TextBlock[] = [
    {
      id: 'main',
      type: 'main',
      text: '口袋裡的貓',
      fontId: 'jason-handwriting-1',
      effectIds: ['shadow'],
      color1: DEFAULT_COLOR_1,
      color2: DEFAULT_COLOR_2,
      fontSize: 120,
      x: activeCanvasSize.width * 0.5 - 200, // 16:9 居中位置
      y: activeCanvasSize.height * 0.4 - 60, // 16:9 上中位置
      orientation: 'horizontal',
    },
    {
      id: 'sub1',
      type: 'sub1',
      text: 'Sonic Pulse',
      fontId: 'jason-handwriting-1',
      effectIds: [],
      color1: DEFAULT_COLOR_1,
      color2: DEFAULT_COLOR_2,
      fontSize: 60,
      x: activeCanvasSize.width * 0.1,
      y: activeCanvasSize.height * 0.6,
      orientation: 'horizontal',
    },
    {
      id: 'sub2',
      type: 'sub2',
      text: '',
      fontId: 'jason-handwriting-1',
      effectIds: [],
      color1: DEFAULT_COLOR_1,
      color2: DEFAULT_COLOR_2,
      fontSize: 40,
      x: activeCanvasSize.width * 0.1,
      y: activeCanvasSize.height * 0.8,
      orientation: 'horizontal',
    },
  ];

  const [textBlocks, setTextBlocks] = useState<TextBlock[]>(initialTextBlocks);
  const updateTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const updateImage = useCallback(async () => {
    const renderId = ++renderRef.current;
    
    const dataUrl = await renderComposition(backgroundImage, textBlocks, activeCanvasSize.width, activeCanvasSize.height, chineseFrameId, frameSize, framePosition, frameColor, frameOpacity);
    
    if (renderId === renderRef.current) {
        setOutputImage(dataUrl);
    }
  }, [backgroundImage, textBlocks, activeCanvasSize, chineseFrameId, frameSize, framePosition, frameColor, frameOpacity]);

  // 使用 debounce 來減少拖動時的重新渲染頻率
  useEffect(() => {
    // 清除之前的計時器
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }
    
    // 設定新的計時器，延遲更新
    updateTimeoutRef.current = setTimeout(() => {
      updateImage();
    }, 50); // 50ms 延遲
    
    // 清理函數
    return () => {
      if (updateTimeoutRef.current) {
        clearTimeout(updateTimeoutRef.current);
      }
    };
  }, [updateImage]);

  
  // 壓縮圖片以減少存儲空間
  const compressImage = (file: File, maxWidth: number = 1920, quality: number = 0.8): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // 計算縮放比例
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        
        // 繪製壓縮後的圖片
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // 轉換為 base64，使用較低的質量
        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        resolve(compressedDataUrl);
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        // 壓縮圖片以減少存儲空間
        const compressedImage = await compressImage(file, 1920, 0.8);
        setBackgroundImage(compressedImage);
      } catch (error) {
        console.error('圖片壓縮失敗:', error);
        // 如果壓縮失敗，使用原始方法
        const reader = new FileReader();
        reader.onload = (e) => {
          setBackgroundImage(e.target?.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
    if(event.target) {
      event.target.value = '';
    }
  };

  const handleClear = () => {
    setTextBlocks(initialTextBlocks);
    setBackgroundImage(null);
    setCanvasSizeId('square');
    setSelectedTextBlockId('main');
    setChineseFrameId('none');
  };
  
  const handleClearImage = () => {
    setBackgroundImage(null);
  };

  const handleDownload = () => {
    if (!outputImage) return;
    const link = document.createElement('a');
    link.href = outputImage;
    link.download = `text-effect-composite-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleTextBlockUpdate = (updatedTextBlock: TextBlock) => {
    setTextBlocks(prev => prev.map(tb => 
      tb.id === updatedTextBlock.id ? updatedTextBlock : tb
    ));
  };

  const handleFramePositionChange = (position: { x: number; y: number }) => {
    setFramePosition(position);
  };

  const handleInspiration = () => {
    const randomFont = getRandomItem(fonts);
    const effectsToSample = effects.filter(e => e.id !== 'none');
    const numEffects = Math.floor(Math.random() * 3) + 1; // 1 to 3 effects
    const randomEffectIds: EffectId[] = [];
    while (randomEffectIds.length < numEffects && effectsToSample.length > 0) {
        const randomIndex = Math.floor(Math.random() * effectsToSample.length);
        const randomEffect = effectsToSample.splice(randomIndex, 1)[0];
        // Avoid incompatible combinations for better results
        // (No gradient effect anymore)
        randomEffectIds.push(randomEffect.id);
    }
    
    setTextBlocks(prev => prev.map(textBlock => {
        const newText = !textBlock.text.trim()
            ? getRandomItem(['靈感湧現', '創意無限', '設計之美', '風格獨具', '你好世界'])
            : textBlock.text;

        return {
            ...textBlock,
            text: newText,
            fontId: randomFont.id,
            effectIds: randomEffectIds.sort(),
            color1: getRandomHexColor(),
            color2: getRandomHexColor(),
            fontSize: textBlock.fontSize // Keep existing font size
        };
    }));
  };

  const handleLoadPreset = (preset: SavedPreset) => {
    setCanvasSizeId(preset.canvasSizeId);
    setBackgroundImage(preset.backgroundImage);
    setSelectedTextBlockId(preset.selectedTextBlockId);
    setChineseFrameId(preset.chineseFrameId || 'none');
    
    // 確保所有文字區塊都有 orientation 屬性
    const updatedTextBlocks = preset.textBlocks.map(block => ({
      ...block,
      orientation: block.orientation || 'horizontal'
    }));
    setTextBlocks(updatedTextBlocks);
  };

  const isPristine = 
    JSON.stringify(textBlocks) === JSON.stringify(initialTextBlocks) &&
    backgroundImage === null &&
    canvasSizeId === 'square' &&
    chineseFrameId === 'none';

  return (
    <ModalProvider>
      <div className="flex flex-col items-center p-4 sm:p-6 lg:p-8" style={{ fontFamily: "'Noto Sans TC', sans-serif", background: 'linear-gradient(135deg, #F5F5F0 0%, #E8E8E3 50%, #F0E8E0 100%)', color: '#4A4A4A', minHeight: '100vh' }}>
        <UnifiedHeader />
      <main className="w-full max-w-7xl space-y-8 pt-24">
        {/* 頂部預覽區域 - 佔滿一整行 */}
        <div className="bg-white/95 backdrop-blur-sm rounded-lg shadow-lg border border-gray-200 p-6" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderColor: 'rgba(139, 157, 195, 0.3)' }}>
          <div className="text-center mb-4">
            <h1 className="text-3xl mb-2" style={{ color: '#4A4A4A' }}>封面產生器</h1>
            <h2 className="text-xl" style={{ color: '#5C5C5C' }}>即時預覽</h2>
            <p className="text-sm" style={{ color: '#6B7280' }}>點擊文字區塊進行編輯</p>
          </div>
          <div className="flex justify-center">
            <VisualCanvas
              textBlocks={textBlocks}
              backgroundImage={backgroundImage}
              canvasWidth={activeCanvasSize.width}
              canvasHeight={activeCanvasSize.height}
              selectedTextBlockId={selectedTextBlockId}
              onTextBlockClick={setSelectedTextBlockId}
              onTextBlockUpdate={handleTextBlockUpdate}
              chineseFrameId={chineseFrameId}
              frameSize={frameSize}
              framePosition={framePosition}
              onFramePositionChange={handleFramePositionChange}
              frameColor={frameColor}
              frameOpacity={frameOpacity}
            />
          </div>
        </div>

        {/* 底部設定區域 - 左右兩欄 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左側設定面板 */}
          <div className="space-y-6">
            {/* 基礎設置 */}
            <div className="backdrop-blur-sm rounded-lg shadow-lg border p-6" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderColor: 'rgba(139, 157, 195, 0.3)' }}>
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-3">
                  <label className="block text-lg" style={{ color: '#4A4A4A' }}>選擇畫布尺寸</label>
                  <div className="grid grid-cols-2 gap-3">
                    {canvasSizes.map(size => (
                      <button
                        key={size.id}
                        onClick={() => setCanvasSizeId(size.id)}
                        className={`py-2 px-3 rounded-lg text-center transition-all duration-200 border-2 text-sm truncate ${
                          canvasSizeId === size.id ? '' : ''
                        }`}
                        style={canvasSizeId === size.id 
                          ? { backgroundColor: '#8B9DC3', borderColor: '#9CA3AF', color: '#FFFFFF' }
                          : { backgroundColor: 'rgba(255, 255, 255, 0.8)', borderColor: 'rgba(139, 157, 195, 0.4)', color: '#4A4A4A' }
                        }
                        onMouseEnter={(e) => {
                          if (canvasSizeId !== size.id) {
                            e.currentTarget.style.backgroundColor = 'rgba(139, 157, 195, 0.2)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (canvasSizeId !== size.id) {
                            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
                          }
                        }}
                        title={`${size.name} (${size.width}x${size.height})`}
                      >
                        {size.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <label className="block text-lg" style={{ color: '#4A4A4A' }}>中國風邊框</label>
                  <select
                    value={chineseFrameId}
                    onChange={(e) => {
                      console.log('邊框選擇變更:', e.target.value);
                      setChineseFrameId(e.target.value as ChineseFrameId);
                    }}
                    className="w-full rounded-lg px-3 py-2 focus:outline-none focus:ring-2"
                    style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid rgba(139, 157, 195, 0.4)', color: '#4A4A4A' }}
                  >
                    {chineseFrames.map(frame => (
                      <option key={frame.id} value={frame.id}>
                        {frame.name}
                      </option>
                    ))}
                  </select>
                  
                  {chineseFrameId !== 'none' && (
                    <div className="space-y-4 mt-4">
                      <div className="flex flex-col gap-2">
                        <label className="text-sm" style={{ color: '#6B7280' }}>邊框寬度</label>
                        <input
                          type="range"
                          min="0.05"
                          max="0.95"
                          step="0.05"
                          value={frameSize.width}
                          onChange={(e) => setFrameSize(prev => ({ ...prev, width: parseFloat(e.target.value) }))}
                          className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                          style={{ background: 'rgba(139, 157, 195, 0.2)' }}
                        />
                        <span className="text-xs" style={{ color: '#6B7280' }}>{Math.round(frameSize.width * 100)}%</span>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <label className="text-sm" style={{ color: '#6B7280' }}>邊框高度</label>
                        <input
                          type="range"
                          min="0.05"
                          max="0.95"
                          step="0.05"
                          value={frameSize.height}
                          onChange={(e) => setFrameSize(prev => ({ ...prev, height: parseFloat(e.target.value) }))}
                          className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                          style={{ background: 'rgba(139, 157, 195, 0.2)' }}
                        />
                        <span className="text-xs" style={{ color: '#6B7280' }}>{Math.round(frameSize.height * 100)}%</span>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <label className="text-sm" style={{ color: '#6B7280' }}>水平位置</label>
                        <input
                          type="range"
                          min="0"
                          max="0.8"
                          step="0.05"
                          value={framePosition.x}
                          onChange={(e) => setFramePosition(prev => ({ ...prev, x: parseFloat(e.target.value) }))}
                          className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                          style={{ background: 'rgba(139, 157, 195, 0.2)' }}
                        />
                        <span className="text-xs" style={{ color: '#6B7280' }}>{Math.round(framePosition.x * 100)}%</span>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <label className="text-sm" style={{ color: '#6B7280' }}>垂直位置</label>
                        <input
                          type="range"
                          min="0"
                          max="0.9"
                          step="0.05"
                          value={framePosition.y}
                          onChange={(e) => setFramePosition(prev => ({ ...prev, y: parseFloat(e.target.value) }))}
                          className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                          style={{ background: 'rgba(139, 157, 195, 0.2)' }}
                        />
                        <span className="text-xs" style={{ color: '#6B7280' }}>{Math.round(framePosition.y * 100)}%</span>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <label className="text-sm" style={{ color: '#6B7280' }}>邊框顏色</label>
                        <div className="flex items-center gap-3">
                          <input
                            type="color"
                            value={frameColor}
                            onChange={(e) => setFrameColor(e.target.value)}
                            className="w-16 h-10 rounded cursor-pointer"
                            style={{ border: '1px solid rgba(139, 157, 195, 0.4)' }}
                          />
                          <input
                            type="text"
                            value={frameColor}
                            onChange={(e) => setFrameColor(e.target.value)}
                            className="flex-1 rounded px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2"
                            style={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', border: '1px solid rgba(139, 157, 195, 0.4)', color: '#4A4A4A' }}
                            placeholder="#2C3E50"
                          />
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <label className="text-sm" style={{ color: '#6B7280' }}>邊框透明度</label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={frameOpacity}
                          onChange={(e) => setFrameOpacity(parseFloat(e.target.value))}
                          className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                          style={{ background: 'rgba(139, 157, 195, 0.2)' }}
                        />
                        <span className="text-xs" style={{ color: '#6B7280' }}>{Math.round(frameOpacity * 100)}%</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="backdrop-blur-sm rounded-lg shadow-lg border p-6" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderColor: 'rgba(139, 157, 195, 0.3)' }}>
              <div className="flex flex-col gap-3">
                <label className="block text-lg" style={{ color: '#4A4A4A' }}>上傳背景 (選用)</label>
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                <div className="flex gap-3">
                  <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition" style={{ background: 'linear-gradient(135deg, #8B9DC3 0%, #9CA3AF 100%)', color: '#FFFFFF' }}>
                    <PhotoIcon /> 上傳圖片
                  </button>
                  {backgroundImage && (
                    <button onClick={handleClearImage} className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg transition" style={{ background: 'linear-gradient(135deg, #D4A5A5 0%, #C89B9B 100%)', color: '#FFFFFF' }}>
                      <ClearIcon /> 清除圖片
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* 文字區塊選擇 */}
            <div className="backdrop-blur-sm rounded-lg shadow-lg border p-6" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderColor: 'rgba(139, 157, 195, 0.3)' }}>
              <div className="flex flex-col gap-3">
                <label className="block text-lg" style={{ color: '#4A4A4A' }}>選擇文字區塊</label>
                <div className="grid grid-cols-3 gap-2">
                  {textBlocks.map(textBlock => (
                    <button
                      key={textBlock.id}
                      onClick={() => setSelectedTextBlockId(textBlock.id)}
                      className="py-2 px-3 rounded-lg transition-colors text-sm"
                      style={selectedTextBlockId === textBlock.id 
                        ? { background: 'linear-gradient(135deg, #8B9DC3 0%, #9CA3AF 100%)', color: '#FFFFFF' }
                        : { backgroundColor: 'rgba(255, 255, 255, 0.8)', color: '#4A4A4A', border: '1px solid rgba(139, 157, 195, 0.4)' }
                      }
                      onMouseEnter={(e) => {
                        if (selectedTextBlockId !== textBlock.id) {
                          e.currentTarget.style.backgroundColor = 'rgba(139, 157, 195, 0.2)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (selectedTextBlockId !== textBlock.id) {
                          e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
                        }
                      }}
                    >
                      {textBlock.type === 'main' ? '主標題' : textBlock.type === 'sub1' ? '副標題一' : '副標題二'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 預設管理 */}
            <div className="backdrop-blur-sm rounded-lg shadow-lg border p-6" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderColor: 'rgba(139, 157, 195, 0.3)' }}>
              <div className="flex flex-col gap-4">
                <h3 className="text-lg" style={{ color: '#4A4A4A' }}>預設管理</h3>
                <PresetManager
                  textBlocks={textBlocks}
                  backgroundImage={backgroundImage}
                  canvasSizeId={canvasSizeId}
                  selectedTextBlockId={selectedTextBlockId}
                  chineseFrameId={chineseFrameId}
                  onLoadPreset={handleLoadPreset}
                />
              </div>
            </div>

            {/* 操作按鈕 */}
            <div className="backdrop-blur-sm rounded-lg shadow-lg border p-6" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderColor: 'rgba(139, 157, 195, 0.3)' }}>
              <div className="flex flex-col gap-4">
                <button onClick={handleInspiration} className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg" style={{ background: 'linear-gradient(135deg, #8B9DC3 0%, #9CA3AF 100%)', color: '#FFFFFF' }}>
                  <InspirationIcon /> 給我靈感！
                </button>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button onClick={handleDownload} disabled={!outputImage} className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg disabled:cursor-not-allowed" style={!outputImage ? { background: 'rgba(156, 163, 175, 0.5)', color: '#9CA3AF', cursor: 'not-allowed' } : { background: 'linear-gradient(135deg, #A8B5C4 0%, #9CA3AF 100%)', color: '#FFFFFF' }}>
                    <DownloadIcon /> 下載圖片
                  </button>
                  <button onClick={handleClear} disabled={isPristine} className="w-full sm:w-auto flex items-center justify-center gap-2 py-3 px-6 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg disabled:cursor-not-allowed" style={isPristine ? { background: 'rgba(156, 163, 175, 0.5)', color: '#9CA3AF', cursor: 'not-allowed' } : { background: 'linear-gradient(135deg, #D4A5A5 0%, #C89B9B 100%)', color: '#FFFFFF' }}>
                    <ClearIcon /> 全部清除
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 右側編輯面板 */}
          <div className="space-y-6">
            {/* 文字編輯面板 */}
            {selectedTextBlockId && (
              <div className="backdrop-blur-sm rounded-lg shadow-lg border p-6" style={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', borderColor: 'rgba(139, 157, 195, 0.3)' }}>
                <h3 className="text-lg mb-4" style={{ color: '#4A4A4A' }}>編輯選中文字區塊</h3>
                <DraggableTextBlock
                  textBlock={textBlocks.find(tb => tb.id === selectedTextBlockId)!}
                  onUpdate={handleTextBlockUpdate}
                  isSelected={true}
                />
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* 統一的 Footer 由 server.js 注入，不需要在這裡渲染 */}
    </div>
  </ModalProvider>
  );
};

export default App;
// Test comment
