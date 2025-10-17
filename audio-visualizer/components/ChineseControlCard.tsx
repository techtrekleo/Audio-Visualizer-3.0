import React, { useRef, useEffect, forwardRef, useCallback } from 'react';
import { FontType } from '../types';

interface ChineseControlCardProps {
    width: number;
    height: number;
    dataArray: Uint8Array | null;
    smoothedData: Uint8Array | null;
    isPlaying: boolean;
    isBeat?: boolean;
    frame: number;
    audioElement: React.RefObject<HTMLAudioElement>;
    // 中國風控制卡專用參數
    chineseCardAlbumImage?: string | null;
    chineseCardSongTitle?: string;
    chineseCardArtist?: string;
    chineseCardFontFamily?: FontType;
    chineseCardPrimaryColor?: string;
    chineseCardBackgroundOpacity?: number;
}

// 字體映射 - 簡化版本，只映射存在的值
const getFontFamily = (fontType: FontType = FontType.POPPINS): string => {
    const fontMap: Partial<Record<FontType, string>> = {
        [FontType.POPPINS]: 'Poppins',
        [FontType.ORBITRON]: 'Orbitron',
        [FontType.LOBSTER]: 'Lobster',
        [FontType.BUNGEE]: 'Bungee',
        [FontType.PRESS_START_2P]: 'Press Start 2P',
        [FontType.PACIFICO]: 'Pacifico',
        [FontType.DANCING_SCRIPT]: 'Dancing Script',
        [FontType.ROCKNROLL_ONE]: 'RocknRoll One',
        [FontType.REGGAE_ONE]: 'Reggae One',
        [FontType.VT323]: 'VT323',
        [FontType.NOTO_SANS_TC]: 'Noto Sans TC',
        [FontType.SOURCE_HAN_SANS]: 'Source Han Sans TC',
        [FontType.CW_TEX_KAI]: 'cwTeXKai',
        [FontType.KLEE_ONE]: 'Klee One',
        [FontType.QINGSONG_1]: 'Jason Handwriting 1',
        [FontType.QINGSONG_2]: 'Jason Handwriting 2',
        [FontType.TAIPEI_SANS]: 'Taipei Sans TC Beta',
        [FontType.M_PLUS_ROUNDED]: 'M PLUS Rounded 1c',
        [FontType.HINA_MINCHO]: 'Hina Mincho',
        [FontType.RAMPART_ONE]: 'Rampart One',
        [FontType.ROBOTO_MONO]: 'Roboto Mono',
        [FontType.OPEN_SANS]: 'Open Sans',
        [FontType.LATO]: 'Lato',
        [FontType.MONTSERRAT]: 'Montserrat',
        [FontType.SOURCE_SANS_PRO]: 'Source Sans Pro',
        [FontType.RALEWAY]: 'Raleway',
        [FontType.UBUNTU]: 'Ubuntu',
        [FontType.PLAYFAIR_DISPLAY]: 'Playfair Display',
        [FontType.MERRIWEATHER]: 'Merriweather',
        [FontType.OSWALD]: 'Oswald',
        [FontType.CAVEAT]: 'Caveat',
        [FontType.KALAM]: 'Kalam',
        [FontType.COMFORTAA]: 'Comfortaa',
    };
    return fontMap[fontType] || 'Poppins';
};

// 圖片緩存
const imageCache = new Map<string, HTMLImageElement>();

const getOrCreateCachedImage = (src: string): HTMLImageElement | null => {
    if (!src) return null;
    
    if (imageCache.has(src)) {
        return imageCache.get(src)!;
    }
    
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
        imageCache.set(src, img);
    };
    img.src = src;
    
    return img.complete && img.naturalWidth > 0 ? img : null;
};

const ChineseControlCard = forwardRef<HTMLCanvasElement, ChineseControlCardProps>((props, ref) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const backgroundCanvasRef = useRef<HTMLCanvasElement>(null);
    const animationRef = useRef<number>();
    const frameRef = useRef(0);

    const {
        width,
        height,
        dataArray,
        smoothedData,
        isPlaying,
        isBeat,
        frame,
        audioElement,
        chineseCardAlbumImage,
        chineseCardSongTitle = 'Sonic Pulse',
        chineseCardArtist = '口袋裡的貓',
        chineseCardFontFamily = FontType.POPPINS,
        chineseCardPrimaryColor = '#ffb6c1',
        chineseCardBackgroundOpacity = 0.8
    } = props;

    // 繪製背景層（櫻花、閃亮亮、模糊效果）
    const drawBackground = useCallback((ctx: CanvasRenderingContext2D, frame: number) => {
        ctx.clearRect(0, 0, width, height);
        
        const primaryColor = chineseCardPrimaryColor;
        
        // 背景色
        const backgroundColor = primaryColor + '4D'; // 30% 透明度
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);
        
        // 櫻花花瓣
        const petalCount = 25;
        for (let i = 0; i < petalCount; i++) {
            const petalX = (i * width / petalCount + frame * 0.5) % (width + 50) - 25;
            const petalY = (frame * 0.8 + i * 30) % (height + 100);
            const petalSize = 8 + (i % 4) * 3;
            const petalRotation = frame * 0.02 + i;
            const petalOpacity = 0.6 + Math.sin(frame * 0.01 + i) * 0.4;
            
            ctx.save();
            ctx.translate(petalX, petalY);
            ctx.rotate(petalRotation);
            ctx.globalAlpha = petalOpacity;
            
            // 櫻花花瓣形狀
            ctx.fillStyle = primaryColor + 'E6';
            ctx.beginPath();
            ctx.ellipse(0, 0, petalSize, petalSize * 1.5, 0, 0, Math.PI * 2);
            ctx.fill();
            
            // 花瓣紋理
            ctx.strokeStyle = primaryColor + 'B3';
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, -petalSize * 1.5);
            ctx.lineTo(0, petalSize * 1.5);
            ctx.moveTo(-petalSize, 0);
            ctx.lineTo(petalSize, 0);
            ctx.stroke();
            
            ctx.restore();
        }
        
        // 閃亮亮效果
        const sparkleCount = 40;
        for (let i = 0; i < sparkleCount; i++) {
            const sparkleX = (i * 73 + frame * 0.4) % width;
            const sparkleY = (i * 47 + frame * 0.3) % height;
            const sparkleSize = 2 + Math.sin(frame * 0.06 + i) * 2;
            const sparkleOpacity = 0.5 + Math.sin(frame * 0.04 + i) * 0.5;
            
            ctx.save();
            ctx.globalAlpha = sparkleOpacity;
            
            const sparkleGradient = ctx.createRadialGradient(sparkleX, sparkleY, 0, sparkleX, sparkleY, sparkleSize);
            sparkleGradient.addColorStop(0, primaryColor + 'FF');
            sparkleGradient.addColorStop(0.5, primaryColor + 'CC');
            sparkleGradient.addColorStop(1, primaryColor + '1A');
            
            ctx.fillStyle = sparkleGradient;
            ctx.beginPath();
            ctx.arc(sparkleX, sparkleY, sparkleSize, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.shadowColor = primaryColor + 'CC';
            ctx.shadowBlur = sparkleSize * 3;
            ctx.fill();
            
            ctx.restore();
        }
    }, [width, height, chineseCardPrimaryColor]);

    // 繪製前景層（控制卡）
    const drawForeground = useCallback((ctx: CanvasRenderingContext2D, frame: number) => {
        ctx.clearRect(0, 0, width, height);
        
        const primaryColor = chineseCardPrimaryColor;
        
        // 創建70%的矩形區域（清晰區域）
        const centerX = width / 2;
        const centerY = height / 2;
        const effectWidth = width * 0.7;
        const effectHeight = height * 0.7;
        const effectX = centerX - effectWidth / 2;
        const effectY = centerY - effectHeight / 2;
        
        // 控制卡區域（左側30%，但限制最大寬度）
        const cardWidth = Math.min(width * 0.3, 400); // 最大400px寬度
        const cardHeight = Math.min(height * 0.8, 600); // 最大600px高度
        const cardX = 20;
        const cardY = (height - cardHeight) / 2;
        
        // 控制卡背景
        const cardGradient = ctx.createLinearGradient(cardX, cardY, cardX + cardWidth, cardY + cardHeight);
        cardGradient.addColorStop(0, `rgba(0, 0, 0, ${chineseCardBackgroundOpacity})`);
        cardGradient.addColorStop(1, `rgba(0, 0, 0, ${chineseCardBackgroundOpacity * 0.7})`);
        
        ctx.fillStyle = cardGradient;
        ctx.roundRect(cardX, cardY, cardWidth, cardHeight, 15);
        ctx.fill();
        
        // 專輯圖片
        const albumSize = Math.min(cardWidth * 0.6, cardHeight * 0.25, 120); // 限制最大120px
        const albumX = cardX + (cardWidth - albumSize) / 2;
        const albumY = cardY + 25;
        
        if (chineseCardAlbumImage) {
            const albumImg = getOrCreateCachedImage(chineseCardAlbumImage);
            if (albumImg && albumImg.complete && albumImg.naturalWidth > 0) {
                ctx.save();
                ctx.beginPath();
                ctx.roundRect(albumX, albumY, albumSize, albumSize, 8);
                ctx.clip();
                ctx.drawImage(albumImg, albumX, albumY, albumSize, albumSize);
                ctx.restore();
            } else {
                // 載入中提示
                ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
                ctx.fillRect(albumX, albumY, albumSize, albumSize);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.font = '12px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('載入中...', albumX + albumSize / 2, albumY + albumSize / 2);
            }
        } else {
            // 預設專輯圖片
            ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
            ctx.fillRect(albumX, albumY, albumSize, albumSize);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.lineWidth = 2;
            ctx.strokeRect(albumX, albumY, albumSize, albumSize);
        }
        
        // 歌曲標題
        const titleY = albumY + albumSize + 35;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = `bold 16px ${getFontFamily(chineseCardFontFamily)}`;
        ctx.textAlign = 'center';
        ctx.fillText(chineseCardSongTitle, cardX + cardWidth / 2, titleY);
        
        // 歌手名稱
        const artistY = titleY + 35;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = `14px ${getFontFamily(chineseCardFontFamily)}`;
        ctx.fillText(chineseCardArtist, cardX + cardWidth / 2, artistY);
        
        // 音波圖
        const waveY = artistY + 50;
        const waveHeight = cardHeight * 0.2;
        const waveWidth = Math.min(cardWidth * 0.9, 350); // 限制最大350px寬度
        const waveX = cardX + (cardWidth - waveWidth) / 2;
        
        if (dataArray && smoothedData) {
            // 專業音波圖（32頻段）
            const frequencyBands = 32;
            const startFrequency = 20;
            const endFrequency = 2000;
            const maxHeight = 240; // 50% 高度
            const thickness = 1; // 最細線條
            const softness = 0.5;
            
            const nyquist = 22050; // 假設採樣率
            
            for (let i = 0; i < frequencyBands; i++) {
                const frequency = startFrequency + (endFrequency - startFrequency) * (i / frequencyBands);
                const dataIndex = Math.floor((frequency / nyquist) * dataArray.length);
                const amplitude = dataArray[dataIndex] / 255;
                
                const barHeight = amplitude * maxHeight * softness;
                const barWidth = waveWidth / frequencyBands;
                const barX = waveX + i * barWidth;
                const barY = waveY + (maxHeight - barHeight) / 2;
                
                // 主音波條
                const insideColor = primaryColor;
                const outsideColor = '#ff91a4';
                
                const barGradient = ctx.createLinearGradient(barX, barY, barX, barY + barHeight);
                barGradient.addColorStop(0, insideColor);
                barGradient.addColorStop(1, outsideColor);
                
                ctx.fillStyle = barGradient;
                ctx.shadowColor = primaryColor + 'CC';
                ctx.shadowBlur = 8;
                ctx.fillRect(barX, barY, barWidth - 1, barHeight);
                
                // 反射效果
                const reflectionHeight = barHeight * 0.2;
                const reflectionY = waveY + maxHeight / 2 + 5;
                
                const reflectionGradient = ctx.createLinearGradient(barX, reflectionY, barX, reflectionY + reflectionHeight);
                reflectionGradient.addColorStop(0, primaryColor + '80');
                reflectionGradient.addColorStop(1, primaryColor + '20');
                
                ctx.fillStyle = reflectionGradient;
                ctx.shadowColor = primaryColor + '80';
                ctx.shadowBlur = 12;
                ctx.fillRect(barX, reflectionY, barWidth - 1, reflectionHeight);
            }
        }
        
        // 進度條
        const progressBarY = waveY + waveHeight + 40;
        const progressBarWidth = Math.min(cardWidth * 0.9, 350); // 限制最大350px寬度
        const progressBarHeight = 4;
        const progressBarX = cardX + (cardWidth - progressBarWidth) / 2;
        
        // 進度條背景
        ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.fillRect(progressBarX, progressBarY, progressBarWidth, progressBarHeight);
        
        // 進度條進度
        if (audioElement.current) {
            const progress = audioElement.current.currentTime / audioElement.current.duration || 0;
            const progressColor = primaryColor;
            
            const progressGradient = ctx.createLinearGradient(progressBarX, progressBarY, progressBarX + progressBarWidth, progressBarY);
            progressGradient.addColorStop(0, progressColor);
            progressGradient.addColorStop(1, 'rgba(0, 0, 0, 0.8)');
            
            ctx.fillStyle = progressGradient;
            ctx.fillRect(progressBarX, progressBarY, progressBarWidth * progress, progressBarHeight);
        }
        
        // 時間顯示
        const timeY = progressBarY + 25;
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        
        if (audioElement.current) {
            const currentTime = Math.floor(audioElement.current.currentTime);
            const duration = Math.floor(audioElement.current.duration || 0);
            const timeText = `${Math.floor(currentTime / 60)}:${(currentTime % 60).toString().padStart(2, '0')} / ${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}`;
            ctx.fillText(timeText, cardX + cardWidth / 2, timeY);
        }
        
        // 播放控制按鈕
        const buttonY = progressBarY + 75;
        const buttonSize = 30;
        const buttonX = cardX + (cardWidth - buttonSize) / 2;
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        ctx.arc(buttonX + buttonSize / 2, buttonY + buttonSize / 2, buttonSize / 2, 0, Math.PI * 2);
        ctx.fill();
        
        // 播放/暫停圖標
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        if (isPlaying) {
            // 暫停圖標（兩個豎線）
            ctx.fillRect(buttonX + buttonSize / 2 - 6, buttonY + buttonSize / 2 - 6, 3, 12);
            ctx.fillRect(buttonX + buttonSize / 2 + 3, buttonY + buttonSize / 2 - 6, 3, 12);
        } else {
            // 播放圖標（三角形）
            ctx.beginPath();
            ctx.moveTo(buttonX + buttonSize / 2 - 4, buttonY + buttonSize / 2 - 6);
            ctx.lineTo(buttonX + buttonSize / 2 - 4, buttonY + buttonSize / 2 + 6);
            ctx.lineTo(buttonX + buttonSize / 2 + 6, buttonY + buttonSize / 2);
            ctx.closePath();
            ctx.fill();
        }
        
        // 中央70%區域的發光效果
        ctx.save();
        
        // 使用徑向漸變創造從角落向外擴散的柔和發光
        const glowRadius = Math.max(effectWidth, effectHeight) * 0.8;
        const glowCenterX = effectX + effectWidth / 2;
        const glowCenterY = effectY + effectHeight / 2;
        
        const glowGradient = ctx.createRadialGradient(glowCenterX, glowCenterY, 0, glowCenterX, glowCenterY, glowRadius);
        glowGradient.addColorStop(0, 'rgba(255, 150, 150, 0)');
        glowGradient.addColorStop(0.6, 'rgba(255, 150, 150, 0)');
        glowGradient.addColorStop(0.8, 'rgba(255, 100, 100, 0.1)');
        glowGradient.addColorStop(1, 'rgba(255, 80, 80, 0.3)');
        
        ctx.fillStyle = glowGradient;
        ctx.roundRect(effectX, effectY, effectWidth, effectHeight, 50);
        ctx.fill();
        
        ctx.restore();
    }, [width, height, dataArray, smoothedData, isPlaying, audioElement, chineseCardAlbumImage, chineseCardSongTitle, chineseCardArtist, chineseCardFontFamily, chineseCardPrimaryColor, chineseCardBackgroundOpacity]);

    // 動畫循環
    const animate = useCallback(() => {
        const backgroundCanvas = backgroundCanvasRef.current;
        const foregroundCanvas = canvasRef.current;
        
        if (!backgroundCanvas || !foregroundCanvas) return;
        
        const backgroundCtx = backgroundCanvas.getContext('2d');
        const foregroundCtx = foregroundCanvas.getContext('2d');
        
        if (!backgroundCtx || !foregroundCtx) return;
        
        // 繪製背景層
        drawBackground(backgroundCtx, frameRef.current);
        
        // 繪製前景層
        drawForeground(foregroundCtx, frameRef.current);
        
        frameRef.current++;
        animationRef.current = requestAnimationFrame(animate);
    }, [drawBackground, drawForeground]);

    useEffect(() => {
        if (isPlaying) {
            animate();
        } else {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        }
        
        return () => {
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, [isPlaying, animate]);

    return (
        <div className="chinese-control-card-container" style={{ position: 'relative', width: '100%', height: '100%' }}>
            {/* 背景層 - 櫻花、閃亮亮 */}
            <canvas
                ref={backgroundCanvasRef}
                width={width}
                height={height}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    filter: 'blur(20px)', // CSS 模糊效果
                    zIndex: 1
                }}
            />
            {/* 前景層 - 控制卡 */}
            <canvas
                ref={canvasRef}
                width={width}
                height={height}
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    zIndex: 2
                }}
            />
        </div>
    );
});

ChineseControlCard.displayName = 'ChineseControlCard';

export default ChineseControlCard;
