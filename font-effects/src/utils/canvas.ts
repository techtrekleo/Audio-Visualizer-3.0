import type { TextBlock } from '../types';
import { fonts } from '../constants';

const drawImageToCanvas = (ctx: CanvasRenderingContext2D, image: HTMLImageElement) => {
    const canvas = ctx.canvas;
    const canvasAspect = canvas.width / canvas.height;
    const imageAspect = image.width / image.height;
    let sx, sy, sWidth, sHeight;

    // This logic performs a "center crop" on the source image to fit the canvas dimensions.
    if (imageAspect > canvasAspect) { // Image is wider than canvas aspect ratio
        sHeight = image.height;
        sWidth = sHeight * canvasAspect;
        sx = (image.width - sWidth) / 2;
        sy = 0;
    } else { // Image is taller or same aspect ratio
        sWidth = image.width;
        sHeight = sWidth / canvasAspect;
        sx = 0;
        sy = (image.height - sHeight) / 2;
    }
    ctx.drawImage(image, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height);
}

const drawText = (ctx: CanvasRenderingContext2D, config: TextBlock, position?: 'center' | 'corner') => {
    if (!config.text.trim()) return;

    const { text, fontId, effectIds, color1, color2, fontSize, x, y, orientation } = config;
    const fontObject = fonts.find(f => f.id === fontId);
    if (!fontObject) return;

    const effects = new Set(effectIds || []);

    // Reset any lingering shadow effects from previous renders
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Font settings: apply bold if selected
    const fontWeight = effects.has('bold') ? '900' : fontObject.weight;
    ctx.font = `${fontWeight} ${fontSize}px "${fontObject.family}"`;
    
    let textX, textY;
    
    // 使用新的座標系統
    if (x !== undefined && y !== undefined) {
        textX = x;
        textY = y;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'top';
    } else if (position === 'center') {
        textX = ctx.canvas.width / 2;
        textY = ctx.canvas.height / 2;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
    } else { // corner
        const PADDING_X = ctx.canvas.width * 0.05;
        const PADDING_Y = ctx.canvas.height * 0.05;
        textX = PADDING_X;
        textY = ctx.canvas.height - PADDING_Y;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'bottom';
    }

    // 處理直式文字
    if (orientation === 'vertical') {
        console.log('繪製直式文字:', { text, textX, textY, orientation });
        drawVerticalText(ctx, text, textX, textY, fontObject, fontWeight as string, fontSize, color1, color2, effects);
        return;
    }

    // --- Rendering Pipeline ---

    // 1. Faux 3D (drawn first, in the back)
    if (effects.has('faux-3d')) {
        const depth = Math.max(1, Math.floor(fontSize / 30));
        ctx.fillStyle = color2;
        for (let i = 1; i <= depth; i++) {
            ctx.fillText(text, textX + i, textY + i);
        }
    }

    // 2. Fill Style setup
    if (effects.has('neon')) {
        ctx.fillStyle = '#FFFFFF'; // Neon text is typically white on a glow
    } else {
        ctx.fillStyle = color1;
    }

    // 3. Shadow setup (applied before fill to affect the whole object including stroke)
    if (effects.has('neon')) {
        ctx.shadowColor = color1; // Glow color
        ctx.shadowBlur = 15;
    } else if (effects.has('shadow')) {
        ctx.shadowColor = color2;
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;
    }

    // 4. Stroke
    if (effects.has('outline')) {
        ctx.strokeStyle = color2;
        ctx.lineWidth = Math.max(2, fontSize / 20);
        ctx.lineJoin = 'round';
        ctx.miterLimit = 2;
        ctx.strokeText(text, textX, textY);
    }
    
    // 5. Main text fill
    ctx.fillText(text, textX, textY);

    // 5.1. Extra Neon pass for more intensity
    if (effects.has('neon')) {
        ctx.shadowBlur = 30; // Stronger glow
        ctx.fillText(text, textX, textY);
    }
    
    // Reset shadow before glitch effect
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // 6. Glitch effect (drawn last, on top)
    if (effects.has('glitch')) {
        ctx.fillStyle = 'rgba(255, 0, 255, 0.5)'; // Magenta
        ctx.fillText(text, textX - 5, textY);
        ctx.fillStyle = 'rgba(0, 255, 255, 0.5)'; // Cyan
        ctx.fillText(text, textX + 5, textY);
        // We draw the original text one more time if there's no solid fill, to ensure it's visible
        if (effects.has('neon')) {
            ctx.fillStyle = '#FFFFFF';
            ctx.fillText(text, textX, textY);
        } else {
             ctx.fillStyle = color1;
             ctx.fillText(text, textX, textY);
        }
    }
    
     // Final reset for the next text block
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
};

// 繪製中國風邊框 - 可調整大小和位置
const drawChineseFrame = (
    ctx: CanvasRenderingContext2D, 
    frameId: string, 
    canvasWidth: number, 
    canvasHeight: number,
    frameSize?: { width: number; height: number },
    framePosition?: { x: number; y: number },
    frameColor: string = '#2C3E50',
    frameOpacity: number = 1.0
) => {
    if (frameId === 'none') {
        console.log('邊框設定為 none，跳過繪製');
        return;
    }
    
    console.log('drawChineseFrame 被調用:', frameId);
    ctx.save();
    
    // 計算邊框尺寸和位置（可調整）
    const size = frameSize || { width: 0.7, height: 0.5 };
    const position = framePosition || { x: 0.15, y: 0.25 };
    
    const frameWidth = canvasWidth * size.width;
    const frameHeight = canvasHeight * size.height;
    const frameX = canvasWidth * position.x;
    const frameY = canvasHeight * position.y;
    
    console.log('邊框計算結果:', {
        canvasWidth, canvasHeight,
        frameWidth, frameHeight,
        frameX, frameY,
        size, position
    });
    
    // 設定全局透明度
    ctx.globalAlpha = frameOpacity;
    
    // 根據邊框類型設定樣式
    switch (frameId) {
        case 'classic':
            drawClassicFrame(ctx, frameX, frameY, frameWidth, frameHeight, frameColor);
            break;
        case 'royal':
            drawRoyalFrame(ctx, frameX, frameY, frameWidth, frameHeight, frameColor);
            break;
        case 'minimal':
            drawMinimalFrame(ctx, frameX, frameY, frameWidth, frameHeight, frameColor);
            break;
        case 'elegant':
            drawElegantFrame(ctx, frameX, frameY, frameWidth, frameHeight, frameColor);
            break;
    }
    
    ctx.restore();
};

// 輔助函數：調整顏色亮度
const adjustBrightness = (hex: string, percent: number): string => {
    // 移除 # 符號
    hex = hex.replace(/^#/, '');
    
    // 轉換為 RGB
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // 調整亮度
    const newR = Math.min(255, Math.max(0, Math.round(r * (1 + percent))));
    const newG = Math.min(255, Math.max(0, Math.round(g * (1 + percent))));
    const newB = Math.min(255, Math.max(0, Math.round(b * (1 + percent))));
    
    // 轉回十六進位
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
};

// 古典邊框 - 可調整大小和位置
const drawClassicFrame = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, baseColor: string = '#2C3E50') => {
    console.log('繪製古典邊框:', { x, y, width, height, baseColor });
    
    // 保存當前狀態
    ctx.save();
    
    // 生成三種深淺色調
    const darkColor = baseColor; // 使用基礎色作為深色
    const midColor = adjustBrightness(baseColor, 0.3); // 亮30%
    const lightColor = adjustBrightness(baseColor, 0.6); // 亮60%
    
    // 外框 - 基礎色，較粗
    ctx.strokeStyle = darkColor;
    ctx.lineWidth = 10;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeRect(x, y, width, height);
    
    // 中框 - 中間色調，中等粗細
    ctx.strokeStyle = midColor;
    ctx.lineWidth = 5;
    ctx.strokeRect(x + 15, y + 15, width - 30, height - 30);
    
    // 內框 - 淺色調，較細
    ctx.strokeStyle = lightColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 25, y + 25, width - 50, height - 50);
    
    // 繪製現代化角落裝飾
    drawModernCornerDecorations(ctx, x, y, width, height, lightColor, darkColor);
    
    console.log('邊框已繪製在位置:', x, y, '尺寸:', width, height);
    
    // 恢復狀態
    ctx.restore();
};

// 皇家邊框 - 可調整大小和位置
const drawRoyalFrame = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, baseColor: string = '#4A148C') => {
    // 保存當前狀態
    ctx.save();
    
    // 生成三種深淺色調
    const darkColor = baseColor;
    const midColor = adjustBrightness(baseColor, 0.3);
    const lightColor = adjustBrightness(baseColor, 0.6);
    
    // 外框 - 基礎色，較粗
    ctx.strokeStyle = darkColor;
    ctx.lineWidth = 10;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeRect(x, y, width, height);
    
    // 中框 - 中間色調，中等粗細
    ctx.strokeStyle = midColor;
    ctx.lineWidth = 5;
    ctx.strokeRect(x + 15, y + 15, width - 30, height - 30);
    
    // 內框 - 淺色調，較細
    ctx.strokeStyle = lightColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 25, y + 25, width - 50, height - 50);
    
    // 繪製奢華角落裝飾
    drawLuxuryCornerDecorations(ctx, x, y, width, height, lightColor, darkColor);
    
    // 恢復狀態
    ctx.restore();
};

// 簡約邊框 - 可調整大小和位置
const drawMinimalFrame = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, baseColor: string = '#2F4F4F') => {
    // 保存當前狀態
    ctx.save();
    
    // 生成三種深淺色調
    const darkColor = baseColor;
    const midColor = adjustBrightness(baseColor, 0.3);
    const lightColor = adjustBrightness(baseColor, 0.6);
    
    // 外框 - 基礎色，較粗
    ctx.strokeStyle = darkColor;
    ctx.lineWidth = Math.max(6, width * 0.025);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeRect(x, y, width, height);
    
    // 中框 - 中間色調，中等粗細
    ctx.strokeStyle = midColor;
    ctx.lineWidth = Math.max(3, width * 0.015);
    const padding1 = Math.max(12, width * 0.04);
    ctx.strokeRect(x + padding1, y + padding1, width - padding1 * 2, height - padding1 * 2);
    
    // 內框 - 淺色調，較細
    ctx.strokeStyle = lightColor;
    ctx.lineWidth = Math.max(1, width * 0.008);
    const padding2 = Math.max(20, width * 0.06);
    ctx.strokeRect(x + padding2, y + padding2, width - padding2 * 2, height - padding2 * 2);
    
    // 恢復狀態
    ctx.restore();
};

// 優雅邊框 - 模仿圖片中的捲曲裝飾
const drawElegantFrame = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, baseColor: string = '#A0A0A0') => {
    // 保存當前狀態
    ctx.save();
    
    // 生成三種深淺色調
    const darkColor = baseColor;
    const midColor = adjustBrightness(baseColor, 0.3);
    const lightColor = adjustBrightness(baseColor, 0.6);
    
    // 外框 - 淺色調，較粗
    ctx.strokeStyle = lightColor;
    ctx.lineWidth = 12;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeRect(x, y, width, height);
    
    // 中框 - 基礎色，中等粗細
    ctx.strokeStyle = darkColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 8, y + 8, width - 16, height - 16);
    
    // 內框 - 淺色調，較細
    ctx.strokeStyle = lightColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 12, y + 12, width - 24, height - 24);
    
    // 繪製內凹角落美化
    drawInsetCornerDecorations(ctx, x, y, width, height, lightColor, midColor, darkColor);
    
    // 恢復狀態
    ctx.restore();
};

// 優雅角落裝飾 - 捲曲裝飾 (未使用)
// // const drawElegantCornerDecorations = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) => {
//     const decorationSize = Math.max(20, Math.min(width, height) * 0.08);
//     
//     // 保存當前狀態
//     ctx.save();
//     
//     // 設定裝飾樣式
//     ctx.fillStyle = '#E8E8E8'; // 淺灰色
//     ctx.strokeStyle = '#A0A0A0'; // 深灰色邊框
//     ctx.lineWidth = 1;
//     
//     // 繪製捲曲裝飾
//     const drawScrollDecoration = (centerX: number, centerY: number, size: number, rotation: number = 0) => {
//         ctx.save();
//         ctx.translate(centerX, centerY);
//         ctx.rotate(rotation);
//         
//         // 主捲曲部分
//         ctx.beginPath();
//         ctx.arc(0, 0, size * 0.8, 0, Math.PI * 1.5);
//         ctx.arc(size * 0.4, size * 0.4, size * 0.6, Math.PI * 1.5, Math.PI * 2);
//         ctx.arc(size * 0.8, 0, size * 0.4, Math.PI, Math.PI * 2);
//         ctx.closePath();
//         ctx.fill();
//         ctx.stroke();
//         
//         // 內部細節
//         ctx.beginPath();
//         ctx.arc(size * 0.2, size * 0.2, size * 0.2, 0, Math.PI * 2);
//         ctx.fill();
//         
//         ctx.restore();
//     };
//     
//     // 四個角落的捲曲裝飾
//     // 左上角
//     drawScrollDecoration(x + decorationSize, y + decorationSize, decorationSize, 0);
//     
//     // 右上角
//     drawScrollDecoration(x + width - decorationSize, y + decorationSize, decorationSize, Math.PI / 2);
//     
//     // 左下角
//     drawScrollDecoration(x + decorationSize, y + height - decorationSize, decorationSize, -Math.PI / 2);
//     
//     // 右下角
//     drawScrollDecoration(x + width - decorationSize, y + height - decorationSize, decorationSize, Math.PI);
//     
//     // 恢復狀態
//     ctx.restore();
// };

// 內凹角落美化
const drawInsetCornerDecorations = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, lightColor: string = '#F0F0F0', midColor: string = '#E0E0E0', darkColor: string = '#D0D0D0') => {
    const insetSize = Math.max(15, Math.min(width, height) * 0.06);
    const insetDepth = Math.max(8, Math.min(width, height) * 0.03);
    
    // 保存當前狀態
    ctx.save();
    
    // 繪製內凹效果
    const drawInsetCorner = (cornerX: number, cornerY: number, size: number, depth: number, rotation: number = 0) => {
        ctx.save();
        ctx.translate(cornerX, cornerY);
        ctx.rotate(rotation);
        
        // 外層陰影（深色）
        ctx.fillStyle = darkColor;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(size, 0);
        ctx.lineTo(0, size);
        ctx.closePath();
        ctx.fill();
        
        // 內層高光（淺色）
        ctx.fillStyle = lightColor;
        ctx.beginPath();
        ctx.moveTo(depth, depth);
        ctx.lineTo(size - depth, depth);
        ctx.lineTo(depth, size - depth);
        ctx.closePath();
        ctx.fill();
        
        // 中間層次
        ctx.fillStyle = midColor;
        ctx.beginPath();
        ctx.moveTo(depth * 0.5, depth * 0.5);
        ctx.lineTo(size - depth * 0.5, depth * 0.5);
        ctx.lineTo(depth * 0.5, size - depth * 0.5);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    };
    
    // 四個角落的內凹效果
    // 左上角
    drawInsetCorner(x + 15, y + 15, insetSize, insetDepth, 0);
    
    // 右上角
    drawInsetCorner(x + width - 15, y + 15, insetSize, insetDepth, Math.PI / 2);
    
    // 左下角
    drawInsetCorner(x + 15, y + height - 15, insetSize, insetDepth, -Math.PI / 2);
    
    // 右下角
    drawInsetCorner(x + width - 15, y + height - 15, insetSize, insetDepth, Math.PI);
    
    // 恢復狀態
    ctx.restore();
};

// 現代化角落裝飾
const drawModernCornerDecorations = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, lightColor: string = '#85C1E9', darkColor: string = '#2C3E50') => {
    const cornerSize = Math.max(20, Math.min(width, height) * 0.08);
    
    // 保存當前狀態
    ctx.save();
    
    // 設定裝飾樣式
    ctx.fillStyle = lightColor;
    ctx.strokeStyle = darkColor;
    ctx.lineWidth = 2;
    
    // 繪製現代化幾何裝飾
    const drawModernCorner = (cornerX: number, cornerY: number, size: number, rotation: number = 0) => {
        ctx.save();
        ctx.translate(cornerX, cornerY);
        ctx.rotate(rotation);
        
        // 外層菱形
        ctx.beginPath();
        ctx.moveTo(0, -size);
        ctx.lineTo(size, 0);
        ctx.lineTo(0, size);
        ctx.lineTo(-size, 0);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // 內層圓形
        ctx.fillStyle = darkColor;
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    };
    
    // 四個角落的現代化裝飾
    // 左上角
    drawModernCorner(x + cornerSize, y + cornerSize, cornerSize * 0.8, 0);
    
    // 右上角
    drawModernCorner(x + width - cornerSize, y + cornerSize, cornerSize * 0.8, Math.PI / 2);
    
    // 左下角
    drawModernCorner(x + cornerSize, y + height - cornerSize, cornerSize * 0.8, -Math.PI / 2);
    
    // 右下角
    drawModernCorner(x + width - cornerSize, y + height - cornerSize, cornerSize * 0.8, Math.PI);
    
    // 恢復狀態
    ctx.restore();
};

// 奢華角落裝飾
const drawLuxuryCornerDecorations = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, lightColor: string = '#BA68C8', darkColor: string = '#4A148C') => {
    const cornerSize = Math.max(20, Math.min(width, height) * 0.08);
    
    // 保存當前狀態
    ctx.save();
    
    // 設定裝飾樣式
    ctx.fillStyle = lightColor;
    ctx.strokeStyle = darkColor;
    ctx.lineWidth = 2;
    
    // 繪製奢華裝飾
    const drawLuxuryCorner = (cornerX: number, cornerY: number, size: number, rotation: number = 0) => {
        ctx.save();
        ctx.translate(cornerX, cornerY);
        ctx.rotate(rotation);
        
        // 外層花瓣形
        for (let i = 0; i < 6; i++) {
            ctx.save();
            ctx.rotate((i * Math.PI * 2) / 6);
            
            ctx.beginPath();
            ctx.ellipse(0, -size * 0.8, size * 0.2, size * 0.6, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            
            ctx.restore();
        }
        
        // 中心寶石
        ctx.fillStyle = '#FFD700'; // 金色
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    };
    
    // 四個角落的奢華裝飾
    // 左上角
    drawLuxuryCorner(x + cornerSize, y + cornerSize, cornerSize * 0.8, 0);
    
    // 右上角
    drawLuxuryCorner(x + width - cornerSize, y + cornerSize, cornerSize * 0.8, Math.PI / 2);
    
    // 左下角
    drawLuxuryCorner(x + cornerSize, y + height - cornerSize, cornerSize * 0.8, -Math.PI / 2);
    
    // 右下角
    drawLuxuryCorner(x + width - cornerSize, y + height - cornerSize, cornerSize * 0.8, Math.PI);
    
    // 恢復狀態
    ctx.restore();
};

// 角落裝飾 - 根據邊框大小調整
// const drawCornerDecorations = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) => {
//     const cornerSize = Math.max(15, Math.min(width, height) * 0.06); // 根據邊框大小調整裝飾大小
//     
//     // 保存當前狀態
//     ctx.save();
//     
//     // 設定裝飾樣式
//     ctx.fillStyle = '#CD7F32'; // 古銅色
//     ctx.strokeStyle = '#654321'; // 深棕色邊框
//     ctx.lineWidth = 2;
//     
//     // 左上角 - 更精緻的設計
//     ctx.beginPath();
//     ctx.moveTo(x, y + cornerSize);
//     ctx.lineTo(x + cornerSize * 0.3, y + cornerSize * 0.3);
//     ctx.lineTo(x + cornerSize, y);
//     ctx.lineTo(x + cornerSize * 0.7, y + cornerSize * 0.3);
//     ctx.lineTo(x + cornerSize * 0.3, y + cornerSize * 0.7);
//     ctx.closePath();
//     ctx.fill();
//     ctx.stroke();
//     
//     // 右上角
//     ctx.beginPath();
//     ctx.moveTo(x + width - cornerSize, y);
//     ctx.lineTo(x + width - cornerSize * 0.3, y + cornerSize * 0.3);
//     ctx.lineTo(x + width, y + cornerSize);
//     ctx.lineTo(x + width - cornerSize * 0.3, y + cornerSize * 0.7);
//     ctx.lineTo(x + width - cornerSize * 0.7, y + cornerSize * 0.3);
//     ctx.closePath();
//     ctx.fill();
//     ctx.stroke();
//     
//     // 左下角
//     ctx.beginPath();
//     ctx.moveTo(x, y + height - cornerSize);
//     ctx.lineTo(x + cornerSize * 0.3, y + height - cornerSize * 0.3);
//     ctx.lineTo(x + cornerSize, y + height);
//     ctx.lineTo(x + cornerSize * 0.7, y + height - cornerSize * 0.3);
//     ctx.lineTo(x + cornerSize * 0.3, y + height - cornerSize * 0.7);
//     ctx.closePath();
//     ctx.fill();
//     ctx.stroke();
//     
//     // 右下角
//     ctx.beginPath();
//     ctx.moveTo(x + width - cornerSize, y + height);
//     ctx.lineTo(x + width - cornerSize * 0.3, y + height - cornerSize * 0.3);
//     ctx.lineTo(x + width, y + height - cornerSize);
//     ctx.lineTo(x + width - cornerSize * 0.3, y + height - cornerSize * 0.7);
//     ctx.lineTo(x + width - cornerSize * 0.7, y + height - cornerSize * 0.3);
//     ctx.closePath();
//     ctx.fill();
//     ctx.stroke();
//     
//     // 恢復狀態
//     ctx.restore();
// };
// 
// // 龍紋裝飾 - 根據邊框大小調整
// const drawDragonDecorations = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) => {
//     // 簡化的龍紋圖案（雲朵狀）
//     ctx.fillStyle = '#CD7F32'; // 古銅色
//     ctx.globalAlpha = 0.7;
//     
//     // 根據邊框大小調整雲朵大小
//     const cloudSize = Math.max(8, Math.min(width, height) * 0.03);
//     const padding = Math.max(5, Math.min(width, height) * 0.02);
//     
//     // 四個角落的雲朵裝飾
//     // 左上
//     drawCloud(ctx, x + padding, y + padding, cloudSize);
//     // 右上
//     drawCloud(ctx, x + width - padding - cloudSize, y + padding, cloudSize);
//     // 左下
//     drawCloud(ctx, x + padding, y + height - padding - cloudSize, cloudSize);
//     // 右下
//     drawCloud(ctx, x + width - padding - cloudSize, y + height - padding - cloudSize, cloudSize);
//     
//     ctx.globalAlpha = 1;
// };
// 
// // 繪製雲朵
// const drawCloud = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number) => {
//     ctx.beginPath();
//     ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
//     ctx.arc(x + size * 0.5, y, size * 0.7, 0, Math.PI * 2);
//     ctx.arc(x + size, y, size * 0.5, 0, Math.PI * 2);
//     ctx.arc(x + size * 0.5, y - size * 0.3, size * 0.4, 0, Math.PI * 2);
//     ctx.fill();
// };
// 
// // 繪製雲紋裝飾（多個雲紋）
// const drawCloudDecorations = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) => {
//     ctx.fillStyle = '#CD7F32'; // 古銅色雲紋
//     
//     // 上邊雲紋
//     const cloudSize = Math.min(width, height) * 0.04;
//     const cloudSpacing = width / 8;
//     for (let i = 1; i < 7; i++) {
//         drawCloud(ctx, x + i * cloudSpacing, y + cloudSize, cloudSize);
//     }
//     
//     // 下邊雲紋
//     for (let i = 1; i < 7; i++) {
//         drawCloud(ctx, x + i * cloudSpacing, y + height - cloudSize, cloudSize);
//     }
//     
//     // 左邊雲紋
//     const leftCloudSpacing = height / 8;
//     for (let i = 1; i < 7; i++) {
//         drawCloud(ctx, x + cloudSize, y + i * leftCloudSpacing, cloudSize);
//     }
//     
//     // 右邊雲紋
//     for (let i = 1; i < 7; i++) {
//         drawCloud(ctx, x + width - cloudSize, y + i * leftCloudSpacing, cloudSize);
//     }
// };
// 
// // 繪製花紋裝飾
// const drawFlowerPatterns = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number) => {
//     ctx.save();
//     
//     // 設定花紋樣式
//     ctx.fillStyle = '#8B4513'; // 深棕色
//     ctx.strokeStyle = '#654321'; // 深棕色邊框
//     ctx.lineWidth = 1;
//     
//     const flowerSize = Math.min(width, height) * 0.03;
//     const spacing = Math.min(width, height) * 0.08;
//     
//     // 繪製梅花圖案
//     const drawPlumBlossom = (centerX: number, centerY: number, size: number) => {
//         ctx.save();
//         ctx.translate(centerX, centerY);
//         
//         // 繪製5個花瓣
//         for (let i = 0; i < 5; i++) {
//             ctx.save();
//             ctx.rotate((i * Math.PI * 2) / 5);
//             
//             // 花瓣形狀
//             ctx.beginPath();
//             ctx.ellipse(0, -size * 0.6, size * 0.3, size * 0.6, 0, 0, Math.PI * 2);
//             ctx.fill();
//             ctx.stroke();
//             
//             ctx.restore();
//         }
//         
//         // 花心
//         ctx.fillStyle = '#D2691E'; // 橙色花心
//         ctx.beginPath();
//         ctx.arc(0, 0, size * 0.2, 0, Math.PI * 2);
//         ctx.fill();
//         
//         ctx.restore();
//     };
//     
//     // 在邊框四周繪製梅花
//     // 上邊
//     for (let i = 2; i < 6; i++) {
//         drawPlumBlossom(x + i * spacing, y + spacing, flowerSize);
//     }
//     
//     // 下邊
//     for (let i = 2; i < 6; i++) {
//         drawPlumBlossom(x + i * spacing, y + height - spacing, flowerSize);
//     }
//     
//     // 左邊
//     for (let i = 2; i < 6; i++) {
//         drawPlumBlossom(x + spacing, y + i * spacing, flowerSize);
//     }
//     
//    // 右邊
//    for (let i = 2; i < 6; i++) {
//        drawPlumBlossom(x + width - spacing, y + i * spacing, flowerSize);
//    }
//    
//    ctx.restore();
// };

// 繪製直式文字 - 簡化版本
const drawVerticalText = (
    ctx: CanvasRenderingContext2D, 
    text: string, 
    startX: number, 
    startY: number, 
    fontObject: any, 
    fontWeight: string, 
    fontSize: number, 
    color1: string, 
    color2: string, 
    effects: Set<string>
) => {
    console.log('開始繪製直式文字:', text, '起始位置:', startX, startY, '顏色:', color1);
    
    // 設定字體
    ctx.font = `${fontWeight} ${fontSize}px "${fontObject.family}"`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // 計算字元間距
    const charSpacing = fontSize * 1.2;
    
    // 分割文字為單個字元
    const characters = text.split('');
    
    // 調整位置：往左邊和往上一點
    characters.forEach((char, index) => {
        const charX = startX - fontSize * 0.25; // 往右邊一點（減少左偏移）
        const charY = startY + (index * charSpacing) - fontSize * 0.35; // 往上一點（減少上偏移）
        
        // 調試：繪製文字位置標記
        if (index === 0) {
            ctx.save();
            ctx.strokeStyle = 'red';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(charX, charY, 5, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }
        
        // 應用特效
        if (effects.has('faux-3d')) {
            const depth = Math.max(1, Math.floor(fontSize / 30));
            ctx.fillStyle = color2;
            for (let i = 1; i <= depth; i++) {
                ctx.fillText(char, charX + i, charY + i);
            }
        }
        
        // 設定填充樣式
        if (effects.has('neon')) {
            ctx.fillStyle = '#FFFFFF';
        } else {
            ctx.fillStyle = color1; // 使用用戶選擇的顏色
        }
        
        // 設定陰影
        if (effects.has('neon')) {
            ctx.shadowColor = color1;
            ctx.shadowBlur = 15;
        } else if (effects.has('shadow')) {
            ctx.shadowColor = color2;
            ctx.shadowBlur = 10;
            ctx.shadowOffsetX = 5;
            ctx.shadowOffsetY = 5;
        }
        
        // 繪製文字
        ctx.fillText(char, charX, charY);
        
        // 繪製邊框
        if (effects.has('outline')) {
            ctx.strokeStyle = color2;
            ctx.lineWidth = Math.max(0.5, fontSize / 40); // 調細描邊
            ctx.strokeText(char, charX, charY);
        }
        
        console.log('繪製字元:', char, '在位置:', charX, charY, '顏色:', ctx.fillStyle);
    });
};

export const renderComposition = (
    backgroundImage: string | null,
    textBlocks: TextBlock[],
    width: number,
    height: number,
    chineseFrameId: string = 'none',
    frameSize?: { width: number; height: number },
    framePosition?: { x: number; y: number },
    frameColor: string = '#2C3E50',
    frameOpacity: number = 1.0
): Promise<string> => {
    return new Promise(async (resolve) => {
        await document.fonts.ready;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return resolve('');

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const drawAllText = () => {
            // 先繪製中國風邊框
            console.log('drawAllText - 繪製邊框:', { chineseFrameId, width, height, frameSize, framePosition, frameColor, frameOpacity });
            drawChineseFrame(ctx, chineseFrameId, width, height, frameSize, framePosition, frameColor, frameOpacity);
            // 再繪製文字
            textBlocks.forEach(textBlock => {
                drawText(ctx, textBlock);
            });
            resolve(canvas.toDataURL('image/png'));
        };

        if (backgroundImage) {
            const img = new Image();
            img.onload = () => {
                drawImageToCanvas(ctx, img);
                // 先繪製邊框（在背景圖片之上）
                console.log('有背景圖片 - 繪製邊框:', { chineseFrameId, width, height, frameSize, framePosition });
                drawChineseFrame(ctx, chineseFrameId, width, height, frameSize, framePosition);
                // 再繪製文字（在最上層）
                textBlocks.forEach(textBlock => {
                    console.log('繪製文字區塊:', textBlock.text, '方向:', textBlock.orientation);
                    drawText(ctx, textBlock);
                });
                resolve(canvas.toDataURL('image/png'));
            };
            img.onerror = () => {
                // if image fails to load, draw text on a transparent background
                drawAllText();
            };
            img.src = backgroundImage;
        } else {
            drawAllText();
        }
    });
};

export const getRandomItem = <T,>(arr: readonly T[]): T => {
    return arr[Math.floor(Math.random() * arr.length)];
};

export const getRandomHexColor = (): string => {
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
};