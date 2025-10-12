import React, { useRef, useEffect, useState, useCallback } from 'react';
import type { TextBlock } from '../types';
import { renderComposition } from '../utils/canvas';

interface VisualCanvasProps {
  textBlocks: TextBlock[];
  backgroundImage: string | null;
  canvasWidth: number;
  canvasHeight: number;
  selectedTextBlockId: string | null;
  onTextBlockClick: (textBlockId: string) => void;
  onTextBlockUpdate: (updatedTextBlock: TextBlock) => void;
  chineseFrameId?: string;
  frameSize?: { width: number; height: number };
  framePosition?: { x: number; y: number };
  onFramePositionChange?: (position: { x: number; y: number }) => void;
  frameColor?: string;
  frameOpacity?: number;
}

export const VisualCanvas: React.FC<VisualCanvasProps> = ({
  textBlocks,
  backgroundImage,
  canvasWidth,
  canvasHeight,
  selectedTextBlockId,
  onTextBlockClick,
  onTextBlockUpdate,
  chineseFrameId = 'none',
  frameSize = { width: 0.7, height: 0.5 },
  framePosition = { x: 0.15, y: 0.25 },
  onFramePositionChange,
  frameColor = '#2C3E50',
  frameOpacity = 1.0
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [draggedTextBlockId, setDraggedTextBlockId] = useState<string | null>(null);
  const [dragMode, setDragMode] = useState<'move' | 'resize' | 'frame'>('move');
  const [initialFontSize, setInitialFontSize] = useState(0);
  const [animationFrameId, setAnimationFrameId] = useState<number | null>(null);
  const [alignmentGuides, setAlignmentGuides] = useState<{
    vertical: number[];
    horizontal: number[];
  }>({ vertical: [], horizontal: [] });
  const [isDraggingFrame, setIsDraggingFrame] = useState(false);
  const drawCanvasTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 使用 useRef 來緩存背景圖片，避免重複載入
  const backgroundImageRef = useRef<HTMLImageElement | null>(null);
  const backgroundImageLoadedRef = useRef<boolean>(false);

  // 載入背景圖片
  useEffect(() => {
    if (backgroundImage) {
      const img = new Image();
      img.onload = () => {
        backgroundImageRef.current = img;
        backgroundImageLoadedRef.current = true;
        drawCanvas();
      };
      img.src = backgroundImage;
    } else {
      backgroundImageRef.current = null;
      backgroundImageLoadedRef.current = true;
      drawCanvas();
    }
  }, [backgroundImage]);

  // 繪製 canvas 內容
  const drawCanvas = useCallback(async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清除畫布
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 使用 renderComposition 生成完整的圖片（包含邊框和直式文字）
    try {
      const dataUrl = await renderComposition(
        backgroundImage,
        textBlocks,
        canvasWidth,
        canvasHeight,
        chineseFrameId,
        frameSize,
        framePosition,
        frameColor,
        frameOpacity
      );
      
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // 繪製對齊線（在拖動時）
        if (isDragging && alignmentGuides) {
          ctx.save();
          ctx.strokeStyle = '#00ff00'; // 綠色對齊線
          ctx.lineWidth = 1;
          ctx.setLineDash([5, 5]); // 虛線樣式
          
          // 繪製垂直對齊線
          alignmentGuides.vertical.forEach(x => {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
          });
          
          // 繪製水平對齊線
          alignmentGuides.horizontal.forEach(y => {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
          });
          
          ctx.restore();
        }
      };
      img.src = dataUrl;
    } catch (error) {
      console.error('繪製 canvas 時發生錯誤:', error);
    }
  }, [textBlocks, canvasWidth, canvasHeight, backgroundImage, chineseFrameId, frameSize, framePosition, frameColor, frameOpacity, isDragging, alignmentGuides]);

  // 當文字區塊或畫布尺寸改變時重新繪製（使用 debounce 避免頻繁渲染）
  useEffect(() => {
    if (backgroundImageLoadedRef.current) {
      // 清除之前的計時器
      if (drawCanvasTimeoutRef.current) {
        clearTimeout(drawCanvasTimeoutRef.current);
      }
      
      // 如果正在拖動邊框，立即渲染以保持即時反饋；否則使用延遲
      const delay = isDraggingFrame ? 0 : 100;
      
      // 設定新的計時器
      if (delay === 0) {
        drawCanvas();
      } else {
        drawCanvasTimeoutRef.current = setTimeout(() => {
          drawCanvas();
        }, delay);
      }
      
      // 清理函數
      return () => {
        if (drawCanvasTimeoutRef.current) {
          clearTimeout(drawCanvasTimeoutRef.current);
        }
      };
    }
  }, [drawCanvas, isDraggingFrame]);

  // 計算文字實際寬度
  const getTextWidth = (text: string, fontSize: number): number => {
    const canvas = canvasRef.current;
    if (!canvas) return text.length * fontSize * 0.6; // 備用計算
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return text.length * fontSize * 0.6; // 備用計算
    
    ctx.font = `${fontSize}px Arial`;
    const metrics = ctx.measureText(text);
    return metrics.width;
  };


  // 計算對齊線
  const calculateAlignmentGuides = (draggedBlock: TextBlock, otherBlocks: TextBlock[]) => {
    const tolerance = 5; // 對齊容差（像素）
    const verticalGuides: number[] = [];
    const horizontalGuides: number[] = [];
    
    // 獲取拖動區塊的邊界 - 考慮直式文字
    const draggedWidth = draggedBlock.orientation === 'vertical' 
      ? draggedBlock.fontSize * 0.8
      : getTextWidth(draggedBlock.text, draggedBlock.fontSize);
    const draggedHeight = draggedBlock.orientation === 'vertical'
      ? draggedBlock.text.length * draggedBlock.fontSize * 1.2
      : draggedBlock.fontSize;
    const draggedLeft = draggedBlock.x;
    const draggedRight = draggedBlock.x + draggedWidth;
    const draggedTop = draggedBlock.y;
    const draggedBottom = draggedBlock.y + draggedHeight;
    const draggedCenterX = draggedBlock.x + draggedWidth / 2;
    const draggedCenterY = draggedBlock.y + draggedHeight / 2;
    
    // 檢查與其他區塊的對齊
    otherBlocks.forEach(block => {
      if (block.id === draggedBlock.id || !block.text.trim()) return;
      
      const blockWidth = block.orientation === 'vertical' 
        ? block.fontSize * 0.8
        : getTextWidth(block.text, block.fontSize);
      const blockHeight = block.orientation === 'vertical'
        ? block.text.length * block.fontSize * 1.2
        : block.fontSize;
      const blockLeft = block.x;
      const blockRight = block.x + blockWidth;
      const blockTop = block.y;
      const blockBottom = block.y + blockHeight;
      const blockCenterX = block.x + blockWidth / 2;
      const blockCenterY = block.y + blockHeight / 2;
      
      // 垂直對齊線
      if (Math.abs(draggedLeft - blockLeft) <= tolerance) {
        verticalGuides.push(blockLeft);
      }
      if (Math.abs(draggedRight - blockRight) <= tolerance) {
        verticalGuides.push(blockRight);
      }
      if (Math.abs(draggedCenterX - blockCenterX) <= tolerance) {
        verticalGuides.push(blockCenterX);
      }
      if (Math.abs(draggedLeft - blockRight) <= tolerance) {
        verticalGuides.push(blockRight);
      }
      if (Math.abs(draggedRight - blockLeft) <= tolerance) {
        verticalGuides.push(blockLeft);
      }
      
      // 水平對齊線
      if (Math.abs(draggedTop - blockTop) <= tolerance) {
        horizontalGuides.push(blockTop);
      }
      if (Math.abs(draggedBottom - blockBottom) <= tolerance) {
        horizontalGuides.push(blockBottom);
      }
      if (Math.abs(draggedCenterY - blockCenterY) <= tolerance) {
        horizontalGuides.push(blockCenterY);
      }
      if (Math.abs(draggedTop - blockBottom) <= tolerance) {
        horizontalGuides.push(blockBottom);
      }
      if (Math.abs(draggedBottom - blockTop) <= tolerance) {
        horizontalGuides.push(blockTop);
      }
    });
    
    // 檢查與畫布邊界的對齊
    if (Math.abs(draggedLeft) <= tolerance) verticalGuides.push(0);
    if (Math.abs(draggedRight - canvasWidth) <= tolerance) verticalGuides.push(canvasWidth);
    if (Math.abs(draggedCenterX - canvasWidth / 2) <= tolerance) verticalGuides.push(canvasWidth / 2);
    if (Math.abs(draggedTop) <= tolerance) horizontalGuides.push(0);
    if (Math.abs(draggedBottom - canvasHeight) <= tolerance) horizontalGuides.push(canvasHeight);
    if (Math.abs(draggedCenterY - canvasHeight / 2) <= tolerance) horizontalGuides.push(canvasHeight / 2);
    
    return { vertical: verticalGuides, horizontal: horizontalGuides };
  };

  const getCanvasRect = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    return canvas.getBoundingClientRect();
  };

  const getCanvasCoordinates = (clientX: number, clientY: number) => {
    const rect = getCanvasRect();
    if (!rect) return { x: 0, y: 0 };
    
    // 計算相對於畫布的座標
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    // 轉換到畫布內部座標系統
    const scaleX = canvasWidth / rect.width;
    const scaleY = canvasHeight / rect.height;
    
    const result = {
      x: x * scaleX,
      y: y * scaleY
    };
    
    return result;
  };

  const isPointInFrame = (x: number, y: number): boolean => {
    if (chineseFrameId === 'none' || !frameSize || !framePosition) return false;
    
    const frameWidth = canvasWidth * frameSize.width;
    const frameHeight = canvasHeight * frameSize.height;
    const frameX = canvasWidth * framePosition.x;
    const frameY = canvasHeight * framePosition.y;
    
    return x >= frameX && x <= frameX + frameWidth && y >= frameY && y <= frameY + frameHeight;
  };

  const findTextBlockAtPosition = (x: number, y: number): { textBlock: TextBlock; mode: 'move' | 'resize' } | null => {
    // 從後往前檢查，優先選擇最上層的文字區塊
    for (let i = textBlocks.length - 1; i >= 0; i--) {
      const textBlock = textBlocks[i];
      if (!textBlock.text.trim()) continue;
      
      // 根據文字方向計算寬度和高度
      const textWidth = textBlock.orientation === 'vertical' 
        ? textBlock.fontSize * 0.8  // 直式文字寬度調整為字體大小的80%
        : getTextWidth(textBlock.text, textBlock.fontSize);
      const textHeight = textBlock.orientation === 'vertical'
        ? textBlock.text.length * textBlock.fontSize * 1.2
        : textBlock.fontSize;
      
      // 對於直式文字，調整邊界框的位置以匹配文字偏移
      const adjustedX = textBlock.orientation === 'vertical' 
        ? textBlock.x - textBlock.fontSize * 0.7  // 邊界框往左偏移70%
        : textBlock.x;
      const adjustedY = textBlock.orientation === 'vertical'
        ? textBlock.y - textBlock.fontSize * 0.9  // 邊界框再高一點（90%）
        : textBlock.y;
      
      // 檢查是否在調整大小的控制點上（右下角）
      const resizeHandleSize = 16; // 控制點大小
      const resizeHandleX = adjustedX + textWidth - resizeHandleSize;
      const resizeHandleY = adjustedY + textHeight - resizeHandleSize;
      
      if (x >= resizeHandleX && x <= resizeHandleX + resizeHandleSize &&
          y >= resizeHandleY && y <= resizeHandleY + resizeHandleSize) {
        return { textBlock, mode: 'resize' };
      }
      
      // 檢查是否在文字區域內（移動模式）
      if (x >= adjustedX && x <= adjustedX + textWidth &&
          y >= adjustedY && y <= adjustedY + textHeight) {
        return { textBlock, mode: 'move' };
      }
    }
    return null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const coords = getCanvasCoordinates(e.clientX, e.clientY);
    
    // 首先檢查是否點擊了邊框
    if (isPointInFrame(coords.x, coords.y) && onFramePositionChange) {
      setIsDraggingFrame(true);
      setDragOffset({
        x: coords.x - (canvasWidth * framePosition.x),
        y: coords.y - (canvasHeight * framePosition.y)
      });
      return;
    }
    
    // 然後檢查是否點擊了文字區塊
    const clickedResult = findTextBlockAtPosition(coords.x, coords.y);
    
    if (clickedResult) {
      setIsDragging(true);
      setDraggedTextBlockId(clickedResult.textBlock.id);
      setDragMode(clickedResult.mode);
      onTextBlockClick(clickedResult.textBlock.id);
      
      if (clickedResult.mode === 'resize') {
        // 調整大小模式：記錄初始字體大小
        setInitialFontSize(clickedResult.textBlock.fontSize);
        setDragOffset({
          x: coords.x - (clickedResult.textBlock.x + clickedResult.textBlock.text.length * clickedResult.textBlock.fontSize * 0.8),
          y: coords.y - (clickedResult.textBlock.y + clickedResult.textBlock.fontSize)
        });
      } else {
        // 移動模式：計算拖動偏移量
        setDragOffset({
          x: coords.x - clickedResult.textBlock.x,
          y: coords.y - clickedResult.textBlock.y
        });
      }
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    // 處理邊框拖動
    if (isDraggingFrame && onFramePositionChange) {
      // 取消之前的動畫幀
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      
      // 使用 requestAnimationFrame 來優化性能，確保流暢的視覺反饋
      const frameId = requestAnimationFrame(() => {
        const coords = getCanvasCoordinates(e.clientX, e.clientY);
        const newX = (coords.x - dragOffset.x) / canvasWidth;
        const newY = (coords.y - dragOffset.y) / canvasHeight;
        
        // 限制在合理範圍內
        const constrainedX = Math.max(0, Math.min(0.8, newX));
        const constrainedY = Math.max(0, Math.min(0.9, newY));
        
        onFramePositionChange({ x: constrainedX, y: constrainedY });
      });
      
      setAnimationFrameId(frameId);
      return;
    }
    
    if (!isDragging || !draggedTextBlockId) return;
    
    // 取消之前的動畫幀
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }
    
    // 使用 requestAnimationFrame 來優化性能
    const frameId = requestAnimationFrame(() => {
      const coords = getCanvasCoordinates(e.clientX, e.clientY);
      const textBlock = textBlocks.find(tb => tb.id === draggedTextBlockId);
      
      if (!textBlock) return;
      
      if (dragMode === 'resize') {
        // 調整大小模式：根據拖動距離計算新的字體大小
        const textWidth = getTextWidth(textBlock.text, textBlock.fontSize);
        const textHeight = textBlock.fontSize;
        
        // 計算從控制點開始的拖動距離
        const deltaX = coords.x - (textBlock.x + textWidth);
        const deltaY = coords.y - (textBlock.y + textHeight);
        
        // 使用對角線距離來調整字體大小
        const delta = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        const scaleFactor = 0.2; // 降低靈敏度，更容易控制
        
        let newFontSize = initialFontSize + delta * scaleFactor;
        
        // 限制字體大小範圍（支持大標題）
        newFontSize = Math.max(10, Math.min(500, newFontSize));
        
        // 更新文字區塊字體大小
        onTextBlockUpdate({
          ...textBlock,
          fontSize: Math.round(newFontSize)
        });
      } else {
        // 移動模式：計算新位置
        const newX = coords.x - dragOffset.x;
        const newY = coords.y - dragOffset.y;
        
        // 限制在畫布範圍內 - 根據文字方向計算正確的寬度和高度
        const textWidth = textBlock.orientation === 'vertical' 
          ? textBlock.fontSize * 0.8  // 直式文字寬度調整為字體大小的80%
          : getTextWidth(textBlock.text, textBlock.fontSize);
        const textHeight = textBlock.orientation === 'vertical'
          ? textBlock.text.length * textBlock.fontSize * 1.2
          : textBlock.fontSize;
        
        // 對於直式文字，減少約束範圍以允許更大的拖動空間
        const adjustedTextWidth = textBlock.orientation === 'vertical' 
          ? textWidth - textBlock.fontSize * 0.7  // 減少約束範圍
          : textWidth;
        const adjustedTextHeight = textBlock.orientation === 'vertical'
          ? textHeight - textBlock.fontSize * 0.9  // 減少約束範圍
          : textHeight;
        
        const constrainedX = Math.max(0, Math.min(newX, canvasWidth - adjustedTextWidth));
        const constrainedY = Math.max(0, Math.min(newY, canvasHeight - adjustedTextHeight));
        
        // 創建臨時文字區塊來計算對齊線
        const tempTextBlock = {
          ...textBlock,
          x: constrainedX,
          y: constrainedY
        };
        
        // 計算對齊線
        const guides = calculateAlignmentGuides(tempTextBlock, textBlocks);
        setAlignmentGuides(guides);
        
        // 更新文字區塊位置
        onTextBlockUpdate({
          ...textBlock,
          x: constrainedX,
          y: constrainedY
        });
      }
    });
    
    setAnimationFrameId(frameId);
  };

  const handleMouseUp = () => {
    // 取消動畫幀
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      setAnimationFrameId(null);
    }
    
    setIsDragging(false);
    setIsDraggingFrame(false);
    setDraggedTextBlockId(null);
    setDragMode('move');
    setInitialFontSize(0);
    setDragOffset({ x: 0, y: 0 });
    setAlignmentGuides({ vertical: [], horizontal: [] }); // 清除對齊線
  };

  useEffect(() => {
    if (isDragging || isDraggingFrame) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isDraggingFrame, dragOffset, draggedTextBlockId, dragMode, initialFontSize, textBlocks, canvasWidth, canvasHeight, onTextBlockUpdate, onFramePositionChange]);

  // 清理動畫幀
  useEffect(() => {
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [animationFrameId]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={canvasWidth}
        height={canvasHeight}
        className={`border-2 border-cyan-400 rounded-lg ${
          isDragging ? 'cursor-grabbing' : 'cursor-pointer'
        }`}
        onMouseDown={handleMouseDown}
        style={{ 
          width: '100%', 
          height: 'auto',
          maxWidth: '100%',
          aspectRatio: `${canvasWidth} / ${canvasHeight}`
        }}
      />
      
      {/* 顯示文字區塊邊界和拖動提示 */}
      {textBlocks.map(textBlock => {
        if (!textBlock.text.trim()) return null;
        
        const isSelected = selectedTextBlockId === textBlock.id;
        const isDragged = draggedTextBlockId === textBlock.id;
        const isResizing = isDragged && dragMode === 'resize';
        
        return (
          <div
            key={textBlock.id}
            className={`absolute border-2 pointer-events-none transition-all duration-200 ${
              isSelected ? 'border-cyan-400 bg-cyan-400/10' : 'border-transparent'
            } ${isDragged ? 'border-yellow-400 bg-yellow-400/20' : ''}`}
            style={{
              left: textBlock.orientation === 'vertical' 
                ? `${((textBlock.x - textBlock.fontSize * 0.7) / canvasWidth) * 100}%`
                : `${(textBlock.x / canvasWidth) * 100}%`,
              top: textBlock.orientation === 'vertical'
                ? `${((textBlock.y - textBlock.fontSize * 0.9) / canvasHeight) * 100}%`
                : `${(textBlock.y / canvasHeight) * 100}%`,
              width: textBlock.orientation === 'vertical' 
                ? `${(textBlock.fontSize * 0.8) / canvasWidth * 100}%`
                : `${Math.max(100, getTextWidth(textBlock.text, textBlock.fontSize)) / canvasWidth * 100}%`,
              height: textBlock.orientation === 'vertical'
                ? `${(textBlock.text.length * textBlock.fontSize * 1.2) / canvasHeight * 100}%`
                : `${textBlock.fontSize / canvasHeight * 100}%`,
              minWidth: '20px',
              minHeight: '20px'
            }}
          >
            {/* 文字區塊標籤 */}
            <div className={`absolute -top-6 left-0 text-xs font-semibold transition-colors ${
              isDragged ? 'text-yellow-400' : 'text-cyan-400'
            }`}>
              {textBlock.type === 'main' ? '主標題' : textBlock.type === 'sub1' ? '副標題一' : '副標題二'}
              {isDragged && (isResizing ? ' (調整大小中)' : ' (拖動中)')}
            </div>
            
            {/* 調試標記 - 邊界框左上角 */}
            <div className="absolute -top-2 -left-2 w-2 h-2 bg-red-500 rounded-full"></div>
            
            {/* 調整大小的控制點 */}
            {isSelected && (
              <div
                className="absolute w-4 h-4 bg-blue-500 border-2 border-white rounded-full cursor-nw-resize shadow-lg hover:bg-blue-600 transition-colors"
                style={{
                  right: '-8px',
                  bottom: '-8px',
                  transform: 'translate(50%, 50%)',
                  pointerEvents: 'auto'
                }}
                title="拖動調整字體大小"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setIsDragging(true);
                  setDraggedTextBlockId(textBlock.id);
                  setDragMode('resize');
                  setInitialFontSize(textBlock.fontSize);
                  onTextBlockClick(textBlock.id);
                  
                  const canvas = canvasRef.current;
                  if (!canvas) return;
                  
                  const coords = getCanvasCoordinates(e.clientX, e.clientY);
                  const textWidth = getTextWidth(textBlock.text, textBlock.fontSize);
                  setDragOffset({
                    x: coords.x - (textBlock.x + textWidth),
                    y: coords.y - (textBlock.y + textBlock.fontSize)
                  });
                }}
              />
            )}
          </div>
        );
      })}
      
      {/* 拖動提示 */}
      {(isDragging || isDraggingFrame) && (
        <div className="absolute top-4 left-4 bg-yellow-500/90 text-black px-3 py-2 rounded-lg text-sm font-semibold">
          {isDraggingFrame ? (
            <>🖼️ 拖動邊框中... 放開滑鼠完成移動</>
          ) : dragMode === 'resize' ? (
            <>🔧 調整字體大小中... 放開滑鼠完成調整</>
          ) : (
            <>🖱️ 拖動文字中... 放開滑鼠完成移動</>
          )}
        </div>
      )}
      
      {/* 如果沒有任何文字，顯示提示 */}
      {textBlocks.every(tb => !tb.text.trim()) && (
        <div className="absolute inset-0 flex items-center justify-center text-gray-500 bg-gray-800/50 rounded-lg">
          <div className="text-center">
            <p className="text-xl">您的藝術字體將會顯示在此</p>
            <p className="mt-2">請在左側輸入文字以開始</p>
            <p className="mt-1 text-sm text-gray-400">💡 提示：拖動文字區塊移動位置，拖動右下角藍點調整字體大小</p>
          </div>
        </div>
      )}
    </div>
  );
};
