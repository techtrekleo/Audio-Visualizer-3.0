import React, { useState, useRef, useCallback, useEffect } from 'react';
import { DownloadIcon, ClearIcon, InspirationIcon, PhotoIcon } from './components/Icons';
import { DraggableTextBlock } from './components/DraggableTextBlock';
import { VisualCanvas } from './components/VisualCanvas';
import { PresetManager } from './components/PresetManager';
import { UnifiedHeader } from './components/UnifiedLayout';
import { renderComposition, getRandomItem, getRandomHexColor } from './utils/canvas';
import { fonts, effects, canvasSizes, DEFAULT_COLOR_1, DEFAULT_COLOR_2 } from './constants';
import type { TextBlock, CanvasSizeId, EffectId, SavedPreset } from './types';

const App: React.FC = () => {
  const [canvasSizeId, setCanvasSizeId] = useState<CanvasSizeId>('youtube_thumb');
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
  const [outputImage, setOutputImage] = useState<string | null>(null);
  const [selectedTextBlockId, setSelectedTextBlockId] = useState<string | null>('main');

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
    },
  ];

  const [textBlocks, setTextBlocks] = useState<TextBlock[]>(initialTextBlocks);

  const updateImage = useCallback(async () => {
    const renderId = ++renderRef.current;
    
    const dataUrl = await renderComposition(backgroundImage, textBlocks, activeCanvasSize.width, activeCanvasSize.height);
    
    if (renderId === renderRef.current) {
        setOutputImage(dataUrl);
    }
  }, [backgroundImage, textBlocks, activeCanvasSize]);

  useEffect(() => {
    updateImage();
  }, [updateImage]);
  
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setBackgroundImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
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
    setTextBlocks(preset.textBlocks);
    setSelectedTextBlockId(preset.selectedTextBlockId);
  };

  const isPristine = 
    JSON.stringify(textBlocks) === JSON.stringify(initialTextBlocks) &&
    backgroundImage === null &&
    canvasSizeId === 'square';

  return (
    <div className="text-white min-h-screen flex flex-col items-center p-4 sm:p-6 lg:p-8" style={{ fontFamily: "'Noto Sans TC', sans-serif", background: '#000000' }}>
      <UnifiedHeader />
      <main className="w-full max-w-7xl space-y-8 pt-24">
        {/* 頂部預覽區域 - 佔滿一整行 */}
        <div className="bg-gray-800/20 p-6 rounded-2xl border border-dashed border-gray-700">
          <div className="text-center mb-4">
            <h2 className="text-xl font-semibold text-gray-300">即時預覽</h2>
            <p className="text-sm text-gray-400">點擊文字區塊進行編輯</p>
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
            />
          </div>
        </div>

        {/* 底部設定區域 - 左右兩欄 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左側設定面板 */}
          <div className="space-y-6">
            {/* 基礎設置 */}
            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border border-gray-700">
              <div className="flex flex-col gap-3">
                <label className="block text-lg font-semibold text-gray-300">選擇畫布尺寸</label>
                <div className="grid grid-cols-2 gap-3">
                  {canvasSizes.map(size => (
                    <button
                      key={size.id}
                      onClick={() => setCanvasSizeId(size.id)}
                      className={`py-2 px-3 rounded-lg text-center font-semibold transition-all duration-200 border-2 text-sm truncate ${
                        canvasSizeId === size.id ? 'bg-cyan-600 border-cyan-400' : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                      }`}
                      title={`${size.name} (${size.width}x${size.height})`}
                    >
                      {size.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border border-gray-700">
              <div className="flex flex-col gap-3">
                <label className="block text-lg font-semibold text-gray-300">上傳背景 (選用)</label>
                <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                <div className="flex gap-3">
                  <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-lg transition">
                    <PhotoIcon /> 上傳圖片
                  </button>
                  {backgroundImage && (
                    <button onClick={handleClearImage} className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition">
                      <ClearIcon /> 清除圖片
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* 文字區塊選擇 */}
            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border border-gray-700">
              <div className="flex flex-col gap-3">
                <label className="block text-lg font-semibold text-gray-300">選擇文字區塊</label>
                <div className="grid grid-cols-3 gap-2">
                  {textBlocks.map(textBlock => (
                    <button
                      key={textBlock.id}
                      onClick={() => setSelectedTextBlockId(textBlock.id)}
                      className={`py-2 px-3 rounded-lg font-semibold transition-colors text-sm ${
                        selectedTextBlockId === textBlock.id ? 'bg-cyan-600 text-white' : 'bg-gray-700 hover:bg-gray-600'
                      }`}
                    >
                      {textBlock.type === 'main' ? '主標題' : textBlock.type === 'sub1' ? '副標題一' : '副標題二'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* 預設管理 */}
            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border border-gray-700">
              <div className="flex flex-col gap-4">
                <h3 className="text-lg font-semibold text-gray-300">預設管理</h3>
                <PresetManager
                  textBlocks={textBlocks}
                  backgroundImage={backgroundImage}
                  canvasSizeId={canvasSizeId}
                  selectedTextBlockId={selectedTextBlockId}
                  onLoadPreset={handleLoadPreset}
                />
              </div>
            </div>

            {/* 操作按鈕 */}
            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border border-gray-700">
              <div className="flex flex-col gap-4">
                <button onClick={handleInspiration} className="w-full flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg">
                  <InspirationIcon /> 給我靈感！
                </button>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button onClick={handleDownload} disabled={!outputImage} className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg">
                    <DownloadIcon /> 下載圖片
                  </button>
                  <button onClick={handleClear} disabled={isPristine} className="w-full sm:w-auto flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 shadow-lg disabled:bg-gray-600 disabled:cursor-not-allowed">
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
              <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border border-gray-700">
                <h3 className="text-lg font-semibold text-gray-300 mb-4">編輯選中文字區塊</h3>
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
    </div>
  );
};

export default App;
