import React, { useRef, useEffect, forwardRef, useCallback } from 'react';
import { VisualizationType, Palette, GraphicEffectType, ColorPaletteType, WatermarkPosition, FontType, Subtitle, SubtitleBgStyle, SubtitleDisplayMode, TransitionType, FilterEffectType, ControlCardStyle, SubtitleOrientation } from '../types';
import ImageBasedVisualizer from './ImageBasedVisualizer';

// 字體映射表
const FONT_MAP: Record<FontType, string> = {
    // 原有字體
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
    // 新增字體
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
    [FontType.FREDOKA_ONE]: 'Fredoka One',
    [FontType.NUNITO]: 'Nunito',
    [FontType.QUICKSAND]: 'Quicksand',
    [FontType.RUBIK]: 'Rubik',
    [FontType.NOTO_SERIF_TC]: 'Noto Serif TC',
    [FontType.MA_SHAN_ZHENG]: 'Poppins',
    [FontType.ZHI_MANG_XING]: 'Poppins',
    [FontType.LONG_CANG]: 'Poppins',
    [FontType.ZCOOL_KUAI_LE]: 'ZCOOL KuaiLe',
    [FontType.ZCOOL_QING_KE]: 'ZCOOL QingKe HuangYou',
    [FontType.LIU_JIAN_MAO_CAO]: 'Liu Jian Mao Cao',
    [FontType.ZCOOL_XIAO_WEI]: 'ZCOOL XiaoWei',
    [FontType.BAKUDAI]: 'Bakudai',
    [FontType.MASA_FONT]: 'Masa Font',
};

interface AudioVisualizerProps {
    analyser: AnalyserNode | null;
    audioRef: React.RefObject<HTMLAudioElement>;
    visualizationType: VisualizationType;
    isPlaying: boolean;
    customText: string;
    textColor: string;
    fontFamily: FontType;
    graphicEffect: GraphicEffectType;
    textSize: number;
    textPositionX: number;
    textPositionY: number;
    sensitivity: number;
    smoothing: number;
    equalization: number;
    backgroundColor: string;
    colors: Palette;
    backgroundImage: string | null;
    backgroundVideo: string | null;
    watermarkPosition: WatermarkPosition;
    waveformStroke: boolean;
    isTransitioning: boolean;
    transitionType: TransitionType;
    backgroundImages: string[];
    currentImageIndex: number;
    // Subtitle props
    subtitles: Subtitle[];
    showSubtitles: boolean;
    subtitleFontSize: number;
    subtitleFontFamily: FontType;
    subtitleColor: string;
    subtitleStrokeColor?: string;
    subtitleEffect?: GraphicEffectType;
    subtitleBgStyle: SubtitleBgStyle;
    effectScale: number;
    effectOffsetX: number;
    effectOffsetY: number;
    // Lyrics Display props
    showLyricsDisplay: boolean;
    currentTime: number;
    lyricsFontSize: number;
    lyricsFontFamily: FontType;
    lyricsPositionX: number;
    lyricsPositionY: number;
    subtitleDisplayMode: SubtitleDisplayMode;
    subtitleOrientation: SubtitleOrientation;
    verticalSubtitlePosition: number;
    horizontalSubtitlePosition: number;
    verticalSubtitleVerticalPosition: number;
    horizontalSubtitleVerticalPosition: number;
    // When true, skip drawing visualizer effects but keep background and subtitles
    disableVisualizer?: boolean;
    // 幾何圖形可視化參數
    geometricFrameImage?: string | null;
    geometricSemicircleImage?: string | null;
    geometricSongName?: string | null;
    geometricArtistName?: string | null;
    // 拖曳位置狀態
    subtitleDragOffset?: { x: number; y: number };
    lyricsDragOffset?: { x: number; y: number };
    onSubtitleDragUpdate?: (offset: { x: number; y: number }) => void;
    onLyricsDragUpdate?: (offset: { x: number; y: number }) => void;
    // 可視化變換狀態
    visualizationTransform?: { x: number; y: number; scale: number };
    onVisualizationTransformUpdate?: (transform: { x: number; y: number; scale: number }) => void;
    visualizationScale?: number;
    onVisualizationScaleChange?: (scale: number) => void;
    // CTA 動畫狀態
    showCtaAnimation?: boolean;
    ctaChannelName?: string;
    ctaFontFamily?: FontType;
    ctaPosition?: { x: number; y: number };
    onCtaPositionUpdate?: (position: { x: number; y: number }) => void;
    // Z總訂製款狀態
    zCustomCenterImage?: string | null;
    zCustomScale?: number;
    zCustomPosition?: { x: number; y: number };
    onZCustomPositionUpdate?: (position: { x: number; y: number }) => void;
    // Filter Effects props
    filterEffectType?: FilterEffectType;
    filterEffectIntensity?: number;
    filterEffectOpacity?: number;
    filterEffectSpeed?: number;
    filterEffectEnabled?: boolean;
    // Control Card props
    controlCardEnabled?: boolean;
    controlCardFontSize?: number;
    controlCardStyle?: ControlCardStyle;
    controlCardColor?: string;
    controlCardBackgroundColor?: string;
    // Vinyl Record props
    vinylImage?: string | null;
    vinylRecordEnabled?: boolean;
    vinylNeedleEnabled?: boolean;
    vinylLayoutMode?: 'horizontal' | 'vertical';
    vinylCenterFixed?: boolean;
    // Piano opacity
    pianoOpacity?: number;
    // Photo Shake props
    photoShakeImage?: string | null;
    photoShakeSongTitle?: string;
    photoShakeSubtitle?: string;
    photoShakeFontFamily?: FontType;
    photoShakeOverlayOpacity?: number;
    photoShakeFontSize?: number;
    photoShakeDecaySpeed?: number;
    // Bass Enhancement props (重低音強化)
    bassEnhancementBlurIntensity?: number;
    bassEnhancementCurveIntensity?: number;
    bassEnhancementText?: string;
    bassEnhancementTextColor?: string;
    bassEnhancementTextFont?: string;
    bassEnhancementTextSize?: number;
    bassEnhancementTextBgOpacity?: number;
    // Frame Pixelation props (方框像素化)
    bassEnhancementCenterOpacity?: number;
    // Circular Wave props (圓形波形)
    circularWaveImage?: string | null;
    // Blurred Edge props (邊緣虛化)
    blurredEdgeSinger?: string;
    blurredEdgeSongTitle?: string;
    blurredEdgeFontFamily?: FontType;
    blurredEdgeTextColor?: string;
    blurredEdgeBgOpacity?: number;
    blurredEdgeFontSize?: number;
    // Ke Ye Custom V2 props (可夜訂製版二號)
    keYeCustomV2BoxOpacity?: number;
    keYeCustomV2Text1?: string;
    keYeCustomV2Text2?: string;
    keYeCustomV2Text1Font?: FontType;
    keYeCustomV2Text2Font?: FontType;
    keYeCustomV2Text1Size?: number;
    keYeCustomV2Text2Size?: number;
}

// 讓繪圖函式能取得當前屬性（不改動所有函式簽名）
let latestPropsRef: AudioVisualizerProps | null = null;
// 平滑拖曳/縮放狀態，避免跳動
let transformState = { cx: 0, cy: 0, scale: 1, initialized: false };

/**
 * Applies an alpha value to a given color string (hex or hsl).
 * @param color The color string (e.g., '#RRGGBB' or 'hsl(...)').
 * @param alpha The alpha value (0 to 1).
 * @returns A color string with alpha (e.g., '#RRGGBBAA' or 'hsla(...)').
 */
const applyAlphaToColor = (color: string, alpha: number): string => {
    const clampedAlpha = Math.max(0, Math.min(1, alpha));
    if (color.startsWith('hsl')) {
        return color.replace('hsl', 'hsla').replace(')', `, ${clampedAlpha})`);
    }
    const alphaHex = Math.round(clampedAlpha * 255).toString(16).padStart(2, '0');
    return `${color.substring(0, 7)}${alphaHex}`;
};

// --- Basic Wave Scrolling (EKG) offscreen buffer ---
let basicWaveScrollCanvas: HTMLCanvasElement | null = null;
let basicWaveScrollCtx: CanvasRenderingContext2D | null = null;
let basicWavePrevY: number | null = null;
let basicWaveBufferSize: { w: number; h: number } | null = null;

// --- Basic Wave Amplitude Decay System ---
let basicWaveDecayBuffer: number[] = [];
let basicWaveDecayTime = 0.1; // 0.1秒衰減時間
let basicWaveLastUpdateTime = 0;


const createRoundedRectPath = (ctx: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) => {
    if (width < 2 * radius) radius = width / 2;
    if (height < 2 * radius) radius = height / 2;
    if (radius < 0) radius = 0;

    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + width, y, x + width, y + height, radius);
    ctx.arcTo(x + width, y + height, x, y + height, radius);
    ctx.arcTo(x, y + height, x, y, radius);
    ctx.arcTo(x, y, x + width, y, radius);
    ctx.closePath();
};

const drawMonstercat = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array | null, width: number, height: number, frame: number, sensitivity: number, colors: Palette, graphicEffect: GraphicEffectType, isBeat?: boolean, waveformStroke?: boolean) => {
    if (!dataArray) return;
    ctx.save();
    
    // Global effects are now handled in drawCustomText
    
    const numBarsOnHalf = 64;
    const totalBars = numBarsOnHalf * 2;
    const barWidth = width / totalBars;
    const centerX = width / 2;
    const centerY = height / 2;
    const maxHeight = height * 0.45;

    const dataSliceEnd = Math.floor(dataArray.length * 0.7);
    const [startHue, endHue] = colors.hueRange;
    const hueRangeSpan = endHue - startHue;
    
    if (waveformStroke) {
        ctx.strokeStyle = 'rgba(0,0,0,0.4)';
        ctx.lineWidth = 1.5;
    }

    for (let i = 0; i < numBarsOnHalf; i++) {
        const dataIndex = Math.floor((i / numBarsOnHalf) * dataSliceEnd);
        const amplitude = dataArray[dataIndex] / 255.0;
        const barHeight = Math.pow(amplitude, 2.5) * maxHeight * sensitivity;

        if (barHeight < 2) continue;

        let color;
        if (colors.name === ColorPaletteType.WHITE) {
            const lightness = 85 + (amplitude * 15);
            color = `hsl(220, 10%, ${lightness}%)`;
        } else {
            const hue = startHue + ((i / numBarsOnHalf) * hueRangeSpan);
            const saturation = isBeat ? 100 : 90;
            const lightness = 60 + (amplitude * 10);
            color = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
        }
        
        ctx.shadowColor = color;
        ctx.shadowBlur = isBeat ? 10 : 5;
       
        ctx.fillStyle = color;

        const barGap = 2;
        const effectiveBarWidth = barWidth - barGap;
        const cornerRadius = Math.min(4, effectiveBarWidth / 3);
        
        const drawBars = (x: number) => {
            createRoundedRectPath(ctx, x, centerY - barHeight, effectiveBarWidth, barHeight, cornerRadius);
            ctx.fill();
            if (waveformStroke) ctx.stroke();

            createRoundedRectPath(ctx, x, centerY, effectiveBarWidth, barHeight, cornerRadius);
            ctx.fill();
            if (waveformStroke) ctx.stroke();
        };

        drawBars(centerX - (i + 1) * barWidth + barGap / 2);
        drawBars(centerX + i * barWidth + barGap / 2);
    }

    ctx.restore();
};


const drawLuminousWave = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array | null, width: number, height: number, frame: number, sensitivity: number, colors: Palette, graphicEffect: GraphicEffectType, isBeat?: boolean, waveformStroke?: boolean) => {
    if (!dataArray) return;
    ctx.save();
    const centerX = width / 2;
    const centerY = height / 2;
    const maxAmplitude = height * 0.35;

    // 1. Draw central light beam
    const beamGradient = ctx.createLinearGradient(0, centerY, width, centerY);
    beamGradient.addColorStop(0, 'rgba(0, 255, 255, 0)');
    beamGradient.addColorStop(0.2, applyAlphaToColor(colors.accent, 0x40 / 255));
    beamGradient.addColorStop(0.5, colors.accent);
    beamGradient.addColorStop(0.8, applyAlphaToColor(colors.accent, 0x40 / 255));
    beamGradient.addColorStop(1, 'rgba(0, 255, 255, 0)');
    ctx.fillStyle = beamGradient;
    ctx.shadowBlur = 30;
    ctx.shadowColor = colors.accent;
    ctx.fillRect(0, centerY - 2, width, 4);
    
    // 2. Setup for the mirrored waves
    const waveGradient = ctx.createLinearGradient(centerX, centerY - maxAmplitude, centerX, centerY + maxAmplitude);
    waveGradient.addColorStop(0, applyAlphaToColor(colors.secondary, 0xcc / 255));
    waveGradient.addColorStop(0.4, colors.primary);
    waveGradient.addColorStop(0.5, colors.accent);
    waveGradient.addColorStop(0.6, colors.primary);
    waveGradient.addColorStop(1, applyAlphaToColor(colors.secondary, 0xcc / 255));

    // 3. New drawing logic for mirrored, separated waves
    const drawMirroredBezierWave = (side: 'left' | 'right') => {
        const numPointsOnSide = 128;
        const dataSliceLength = dataArray.length * 0.5;

        const topPoints: {x: number, y: number}[] = [];
        const bottomPoints: {x: number, y: number}[] = [];

        for (let i = 0; i <= numPointsOnSide; i++) {
            const progress = i / numPointsOnSide;
            const dataIndex = Math.floor(progress * dataSliceLength);
            
            const x = side === 'left' ? centerX - (progress * centerX) : centerX + (progress * centerX);
            const amplitude = (dataArray[dataIndex] / 255) * maxAmplitude * sensitivity;
            const oscillation = Math.sin(i * 0.1 + frame * 0.05) * 5 * (amplitude / maxAmplitude);

            topPoints.push({ x, y: centerY - (amplitude + oscillation) });
            bottomPoints.push({ x, y: centerY + (amplitude + oscillation) });
        }
        
        const drawCurve = (points: {x: number, y: number}[]) => {
            if (points.length < 2) return;
            ctx.beginPath();
            ctx.moveTo(points[0].x, points[0].y);
            
            for (let i = 1; i < points.length - 1; i++) {
                const xc = (points[i].x + points[i+1].x) / 2;
                const yc = (points[i].y + points[i+1].y) / 2;
                ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
            }
            ctx.quadraticCurveTo(points[points.length - 1].x, points[points.length - 1].y, points[points.length - 1].x, points[points.length - 1].y);
            ctx.stroke();
        };

        if (waveformStroke) {
            ctx.save();
            ctx.strokeStyle = 'rgba(0,0,0,0.7)';
            ctx.lineWidth = 4.5;
            ctx.shadowBlur = 0;
            ctx.shadowColor = 'transparent';
            drawCurve(topPoints);
            drawCurve(bottomPoints);
            ctx.restore();
        }

        ctx.strokeStyle = waveGradient;
        ctx.lineWidth = 2.5;
        ctx.shadowBlur = 15;
        ctx.shadowColor = colors.primary;
        drawCurve(topPoints);
        drawCurve(bottomPoints);
    };

    drawMirroredBezierWave('left');
    drawMirroredBezierWave('right');
    
    ctx.restore();
};

const drawBasicWave = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array | null, width: number, height: number, frame: number, sensitivity: number, colors: Palette, graphicEffect: GraphicEffectType, isBeat?: boolean, waveformStroke?: boolean, particles?: Particle[], geometricFrameImage?: HTMLImageElement | null, geometricSemicircleImage?: HTMLImageElement | null, vinylRecordEnabled?: boolean) => {
    if (!dataArray) return;
    ctx.save();
    
    const centerX = width / 2;
    const centerY = height / 2;
    const maxAmplitude = height * 0.15; // 進一步降為0.15，約再扁平 ~40%
    
    // 鼓聲檢測 - 檢測低頻能量
    const bassData = dataArray.slice(0, Math.floor(dataArray.length * 0.1));
    const bassEnergy = bassData.reduce((sum, val) => sum + val, 0) / bassData.length;
    const isDrumHit = bassEnergy > 150; // 鼓聲閾值
    
    // 鼓聲震動效果 - 減少震動幅度
    const drumShake = isDrumHit ? (Math.sin(frame * 0.3) * 8) : 0; // 再降到8
    const drumScale = isDrumHit ? 1.08 : 1.0; // 再降到1.08
    
    // 節奏變化 - 基於整體音頻能量，降低強度讓坡度更平緩
    const totalEnergy = dataArray.reduce((sum, val) => sum + val, 0) / dataArray.length;
    const rhythmIntensity = Math.min(totalEnergy / 120, 1.0); // 再降，整體更平緩
    
    // 波浪點數 - 大幅增加點數讓曲線更平滑細緻
    const numPoints = 800; // 再增加點數以獲得更細膩曲線
    const waveWidth = width * 0.8;
    const waveStartX = centerX - waveWidth / 2;
    
    // 初始化衰減緩衝區
    if (basicWaveDecayBuffer.length !== numPoints + 1) {
        basicWaveDecayBuffer = new Array(numPoints + 1).fill(0);
    }
    
    // 計算時間差和衰減係數
    const currentTime = performance.now() / 1000; // 轉換為秒
    const deltaTime = currentTime - basicWaveLastUpdateTime;
    basicWaveLastUpdateTime = currentTime;
    
    // 衰減係數：每秒衰減到原值的 1/e^(1/decayTime)
    const decayFactor = Math.exp(-deltaTime / basicWaveDecayTime);
    
    // 創建波浪點 - 添加平滑處理消除鋸齒
    const wavePoints: {x: number, y: number}[] = [];
    const reflectionPoints: {x: number, y: number}[] = [];
    
    // 增大平滑半徑，讓波浪更圓滑
    const smoothingRadius = 12; // 進一步增加平滑半徑
    
    for (let i = 0; i <= numPoints; i++) {
        const progress = i / numPoints;
        const x = waveStartX + progress * waveWidth;
        
        // 音頻數據索引 - 使用完整頻譜，確保尾端也有振幅
        const dataIndex = Math.floor(progress * dataArray.length);
        
        // 平滑處理 - 對周圍的數據點進行平均
        let smoothedAmplitude = 0;
        let sampleCount = 0;
        
        for (let j = -smoothingRadius; j <= smoothingRadius; j++) {
            const sampleIndex = Math.max(0, Math.min(dataArray.length - 1, dataIndex + j));
            smoothedAmplitude += dataArray[sampleIndex];
            sampleCount++;
        }
        
        // 應用平方根降低峰值，讓波形更扁平
        const rawAmplitude = smoothedAmplitude / sampleCount / 255;
        // 使用更強的壓縮（平方根），顯著降低峰值；再放大3倍以符合需求
        const amplitudeScale = 3.0;
        const currentAmplitude = Math.pow(rawAmplitude, 0.5) * maxAmplitude * sensitivity * rhythmIntensity * amplitudeScale;
        
        // 應用衰減系統：結合當前振幅和歷史衰減
        const targetAmplitude = currentAmplitude;
        const previousDecay = basicWaveDecayBuffer[i] || 0;
        
        // 如果當前振幅大於衰減值，則更新；否則應用衰減
        if (targetAmplitude > previousDecay) {
            basicWaveDecayBuffer[i] = targetAmplitude;
        } else {
            basicWaveDecayBuffer[i] = previousDecay * decayFactor;
        }
        
        const finalAmplitude = basicWaveDecayBuffer[i];
        
        // 基礎波浪形狀 - 使用更平滑的波形，減少振幅
        const baseWave = Math.sin(progress * Math.PI * 2 + frame * 0.01) * 2; // 再降到2
        
        // 鼓聲震動效果 - 更柔和的震動
        const drumEffect = isDrumHit ? Math.sin(progress * Math.PI * 4 + frame * 0.05) * drumShake * 0.2 : 0; // 再降到0.2
        
        // 最終Y位置
        const y = centerY - finalAmplitude - baseWave - drumEffect;
        const reflectionY = centerY + (finalAmplitude * 0.3) + baseWave + drumEffect;
        
        wavePoints.push({ x, y });
        reflectionPoints.push({ x, y: reflectionY });
    }
    
    // 對已生成的點再次做一次後處理平滑（盒狀濾波），進一步降低局部坡度
    const postSmoothRadius = 6;
    for (let i = 0; i < wavePoints.length; i++) {
        let sumY = 0;
        let count = 0;
        for (let j = -postSmoothRadius; j <= postSmoothRadius; j++) {
            const idx = Math.max(0, Math.min(wavePoints.length - 1, i + j));
            sumY += wavePoints[idx].y;
            count++;
        }
        wavePoints[i].y = sumY / count;
        // 反射點同樣處理
        sumY = 0; count = 0;
        for (let j = -postSmoothRadius; j <= postSmoothRadius; j++) {
            const idx = Math.max(0, Math.min(reflectionPoints.length - 1, i + j));
            sumY += reflectionPoints[idx].y;
            count++;
        }
        reflectionPoints[i].y = sumY / count;
    }

    // 繪製主波浪 - 使用更平滑的貝茲曲線
    ctx.beginPath();
    ctx.moveTo(wavePoints[0].x, wavePoints[0].y);
    
    // 使用三次貝茲曲線創建極度平滑的波浪
    for (let i = 0; i < wavePoints.length - 1; i++) {
        const current = wavePoints[i];
        const next = wavePoints[i + 1];
        
        // 更平滑的控制點計算 - 進一步降低控制點影響
        const dx = next.x - current.x;
        const dy = next.y - current.y;
        
        // 使用更保守的控制點，讓曲線更平滑圓潤
        const cp1x = current.x + dx * 0.33; // 從0.2增加到0.33
        const cp1y = current.y + dy * 0.05; // 從0.1降到0.05
        const cp2x = current.x + dx * 0.67; // 從0.8降到0.67
        const cp2y = next.y - dy * 0.05; // 從0.1降到0.05
        
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, next.x, next.y);
    }
    
    // 關閉 EKG 滾動模式，回到原本的完整波形顯示

    // 主波浪描邊（純白）
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#ffffff';
    ctx.stroke();

    // 以基線填色（填滿主波浪下方至中心線）
    ctx.beginPath();
    ctx.moveTo(wavePoints[0].x, wavePoints[0].y);
    for (let i = 0; i < wavePoints.length - 1; i++) {
        const current = wavePoints[i];
        const next = wavePoints[i + 1];
        const dx = next.x - current.x;
        const dy = next.y - current.y;
        const cp1x = current.x + dx * 0.33;
        const cp1y = current.y + dy * 0.05;
        const cp2x = current.x + dx * 0.67;
        const cp2y = next.y - dy * 0.05;
        ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, next.x, next.y);
    }
    // 關閉到基線（中心線）
    ctx.lineTo(wavePoints[wavePoints.length - 1].x, centerY);
    ctx.lineTo(wavePoints[0].x, centerY);
    ctx.closePath();
    ctx.fillStyle = '#ffffff';
    ctx.fill();
    
    // 取消下方反射波浪，符合「底下空間填色」且維持純白主題
    
    // 鼓聲時的額外效果 - 減少波紋效果讓整體更平緩
    if (isDrumHit) {
        ctx.save();
        ctx.globalAlpha = 0.4; // 從0.6降到0.4
        ctx.strokeStyle = colors.accent;
        ctx.lineWidth = 3; // 從5降到3
        ctx.shadowBlur = 20; // 從30降到20
        ctx.shadowColor = colors.accent;
        
        // 繪製震動波紋
        for (let i = 0; i < 2; i++) { // 從3降到2
            const rippleRadius = (frame % 20) * 2 + i * 10;
            ctx.beginPath();
            ctx.arc(centerX, centerY, rippleRadius, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.restore();
    }
    
    ctx.restore();
};

const drawDynamicControlCard = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array | null, width: number, height: number, frame: number, sensitivity: number, colors: Palette, graphicEffect: GraphicEffectType, isBeat?: boolean, waveformStroke?: boolean, props?: any) => {
    if (!dataArray) return;
    ctx.save();
    
    const centerX = width / 2;
    const centerY = height / 2;
    
    // 音頻分析
    const bass = dataArray.slice(0, 32).reduce((a, b) => a + b, 0) / 32;
    const mid = dataArray.slice(32, 128).reduce((a, b) => a + b, 0) / 96;
    const treble = dataArray.slice(128, 256).reduce((a, b) => a + b, 0) / 128;
    
    const normalizedBass = bass / 255;
    const normalizedMid = mid / 255;
    const normalizedTreble = treble / 255;
    
    // 1. 兩層高斯模糊背景效果 - 只在方格外的區域
    const blurIntensity = latestPropsRef?.bassEnhancementBlurIntensity || 0.5;
    
    // 計算方格區域
    const cardWidth = width * 0.7;
    const cardHeight = height * 0.7;
    const cardX = centerX - cardWidth / 2;
    const cardY = centerY - cardHeight / 2;
    
    // 像素化效果已移除 - 避免邊界問題
    
    // 2. 移除陽光照射效果 - 已移除像太陽的可視化元素
    
    // 3. 重低音強化控制卡 - 使用前面已計算的方格尺寸
    
    // 移除搖晃效果 - 只保留放大縮放
    const shakeX = 0; // 移除左右搖動
    const shakeY = 0; // 移除上下搖動
    
    // 放大縮放效果 - 縮放範圍1到3
    const bassScale = 1.0 + normalizedBass * 2.0; // 從1.0到3.0，放大到3倍
    const smoothScale = bassScale; // 移除震動，只保留純粹的放大縮放
    
    // 計算震動後的方格位置和大小
    const scaledCardWidth = cardWidth * smoothScale;
    const scaledCardHeight = cardHeight * smoothScale;
    const scaledCardX = centerX - scaledCardWidth / 2 + shakeX;
    const scaledCardY = centerY - scaledCardHeight / 2 + shakeY;
    
    // 方框已移除 - 只保留音頻可視化
    
    // 控制卡內容 - 音頻響應式元素
    ctx.fillStyle = colors.primary;
    ctx.font = `bold ${24 + normalizedBass * 8}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // 歌曲名稱已移除
    
    // 音頻可視化位置 - 居中顯示，應用強烈震動效果
    const curveIntensity = latestPropsRef?.bassEnhancementCurveIntensity || 1.0;
    const segmentCount = 24; // 24 個頻段
    const baseMaxHeight = height * 0.3; // 基礎高度較小，為強烈放大留空間
    const maxHeight = baseMaxHeight * smoothScale; // 應用強烈震動縮放
    
    // 音頻可視化寬度和位置 - 居中，無搖晃
    const visualizerWidth = width * 0.3 * smoothScale; // 基礎寬度較小，為放大留空間
    const startX = centerX - visualizerWidth / 2; // 居中，無搖晃
    const endX = startX + visualizerWidth; // 結束位置
    const baselineY = centerY; // 居中，無搖晃
    
    const thickness = 3.0; // Thickness: 3.00
    const softness = 50.0; // Softness: 50.0%
    
    const segmentWidth = visualizerWidth / segmentCount;
    
    // 白色發光基準線 - 純粹放大縮放
    ctx.beginPath();
    ctx.moveTo(startX, baselineY);
    ctx.lineTo(startX + visualizerWidth, baselineY);
    
    // 支援彩虹主題
    if (colors.name === ColorPaletteType.RAINBOW) {
        const gradient = ctx.createLinearGradient(startX, baselineY, startX + visualizerWidth, baselineY);
        const [startHue, endHue] = colors.hueRange;
        const hueRangeSpan = endHue - startHue;
        for (let i = 0; i <= 10; i++) {
            const t = i / 10;
            const hue = startHue + (t * hueRangeSpan);
            gradient.addColorStop(t, `hsl(${hue}, 80%, 70%)`);
        }
        ctx.strokeStyle = gradient;
        // 陰影顏色使用中間色
        const midHue = startHue + (hueRangeSpan / 2);
        ctx.shadowColor = `hsl(${midHue}, 80%, 70%)`;
    } else {
        ctx.strokeStyle = '#FFFFFF';
        ctx.shadowColor = '#FFFFFF';
    }
    
    ctx.lineWidth = thickness * smoothScale;
    ctx.shadowBlur = 15 * smoothScale; // 適中的發光效果
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
    
    // 平滑漸變的動態波形 - 每個點不同頻率和震幅
    const wavePoints = [];
    const totalWidth = visualizerWidth;
    const pointCount = 40; // 40個不同的頻率點
    
    // 生成每個點對應不同頻率
    for (let i = 0; i < pointCount; i++) {
        // 固定間隔，移除左右滑動
        const baseX = (i / (pointCount - 1)) * totalWidth;
        const x = baseX; // 移除隨機偏移
        
        // 固定的頻率分布模式：高低中低高低中低低高
        const freqRatio = i / (pointCount - 1); // 0-1的固定比例
        
        // 為每個柱子設定獨特的震幅和長度參數
        let freqStart, freqEnd, amplitudeMultiplier, widthMultiplier;
        
        // 定義40個柱子的獨特參數設定
        const columnSettings = [
            // 柱子0-9
            { freq: [0.0, 0.2], amp: 1.8, width: 1.5 },  { freq: [0.2, 0.6], amp: 1.2, width: 0.9 },   { freq: [0.6, 1.0], amp: 1.0, width: 0.7 },  { freq: [0.0, 0.15], amp: 2.0, width: 1.8 }, { freq: [0.3, 0.7], amp: 1.1, width: 1.0 },
            { freq: [0.1, 0.3], amp: 1.6, width: 1.3 },  { freq: [0.4, 0.8], amp: 0.9, width: 0.8 },  { freq: [0.0, 0.25], amp: 1.9, width: 1.6 }, { freq: [0.2, 0.4], amp: 1.3, width: 1.1 },  { freq: [0.7, 1.0], amp: 0.8, width: 0.6 },
            
            // 柱子10-19
            { freq: [0.5, 0.9], amp: 1.0, width: 0.9 },  { freq: [0.0, 0.2], amp: 1.7, width: 1.4 }, { freq: [0.8, 1.0], amp: 0.7, width: 0.5 },  { freq: [0.15, 0.35], amp: 1.4, width: 1.2 }, { freq: [0.6, 0.8], amp: 1.1, width: 0.8 },
            { freq: [0.05, 0.25], amp: 1.8, width: 1.5 }, { freq: [0.3, 0.5], amp: 1.2, width: 1.0 },  { freq: [0.9, 1.0], amp: 0.6, width: 0.4 },  { freq: [0.4, 0.6], amp: 1.3, width: 1.1 },  { freq: [0.1, 0.3], amp: 1.6, width: 1.3 },
            
            // 柱子20-29 (重複並變化)
            { freq: [0.0, 0.18], amp: 1.7, width: 1.4 }, { freq: [0.25, 0.65], amp: 1.1, width: 0.8 }, { freq: [0.65, 1.0], amp: 0.9, width: 0.6 }, { freq: [0.02, 0.12], amp: 1.9, width: 1.7 }, { freq: [0.35, 0.75], amp: 1.0, width: 0.9 },
            { freq: [0.08, 0.28], amp: 1.5, width: 1.2 }, { freq: [0.45, 0.85], amp: 0.8, width: 0.7 }, { freq: [0.0, 0.22], amp: 1.8, width: 1.5 }, { freq: [0.18, 0.38], amp: 1.2, width: 1.0 }, { freq: [0.72, 1.0], amp: 0.7, width: 0.5 },
            
            // 柱子30-39
            { freq: [0.52, 0.92], amp: 0.9, width: 0.8 }, { freq: [0.0, 0.19], amp: 1.6, width: 1.3 }, { freq: [0.82, 1.0], amp: 0.6, width: 0.4 }, { freq: [0.12, 0.32], amp: 1.3, width: 1.1 }, { freq: [0.62, 0.82], amp: 1.0, width: 0.7 },
            { freq: [0.03, 0.23], amp: 1.7, width: 1.4 }, { freq: [0.28, 0.48], amp: 1.1, width: 0.9 }, { freq: [0.88, 1.0], amp: 0.5, width: 0.3 }, { freq: [0.38, 0.58], amp: 1.2, width: 1.0 }, { freq: [0.07, 0.27], amp: 1.5, width: 1.2 }
        ];
        
        const setting = columnSettings[i];
        freqStart = setting.freq[0];
        freqEnd = setting.freq[1];
        amplitudeMultiplier = setting.amp;
        widthMultiplier = setting.width;
        
        // 計算該頻率範圍的平均振幅
        const freqStartIndex = Math.floor(freqStart * dataArray.length);
        const freqEndIndex = Math.floor(freqEnd * dataArray.length);
        let totalAmplitude = 0;
        let freqCount = 0;
        
        for (let j = freqStartIndex; j < freqEndIndex && j < dataArray.length; j++) {
            totalAmplitude += dataArray[j];
            freqCount++;
        }
        
        const rawAmplitude = freqCount > 0 ? (totalAmplitude / freqCount) / 255 : 0;
        
        // 平滑的振幅計算 - 沒有音頻時縮到0
        const smoothAmplitude = rawAmplitude * amplitudeMultiplier;
        
        // 計算高度（每個點都有不同的震幅）- 沒有音頻時縮到0
        const baseHeight = smoothAmplitude * maxHeight * curveIntensity;
        const height = baseHeight; // 移除最小高度限制，讓沒有音頻時縮到0
        
        // 計算寬度（每個點都有不同的寬度）- 保持粗細變化
        const baseWidth = 8 + Math.sin(frame * 0.005 + i * 0.1) * 2; // 極慢的寬度變化
        const width = baseWidth * widthMultiplier;
        
        // 計算透明度（極度減少閃爍）- 使用極穩定的透明度
        const alpha = Math.min(0.7, Math.max(0.6, smoothAmplitude * 0.3 + 0.6)); // 透明度範圍0.6-0.7，極穩定
        
        wavePoints.push({
            x: startX + x,
            height: height, // 移除最小高度限制
            width: Math.max(2, width),   // 最小寬度2px
            alpha: alpha,
            freqRatio: freqRatio
        });
    }
    
    // 複製唱片控制卡的音頻可視化效果
    if (dataArray) {
        // 波形區域設定
        const wavePadding = 20;
        const waveX = startX + wavePadding;
        const waveW = visualizerWidth - wavePadding * 2;
        const waveBaseline = baselineY;
        const samples = 64;
        
        // 音頻取樣函數
        const getSample = (t: number, bandStart: number, bandEnd: number) => {
            if (!dataArray) return 0.5;
            const len = dataArray.length;
            const s = Math.max(0, Math.min(len - 1, Math.floor(bandStart * len)));
            const e = Math.max(s + 1, Math.min(len, Math.floor(bandEnd * len)));
            const idx = s + Math.floor(t * (e - s - 1));
            return dataArray[idx] / 255;
        };
        
        // 山形圖（白色，低頻到中低頻）
        const barCount = samples + 1;
        const barWidth = Math.max(2, (waveW / barCount) * 0.6);
        
        for (let i = 0; i < barCount; i++) {
            const t = i / (barCount - 1);
            // 取低頻到中低頻，讓能量更有起伏 - 增強敏感度
            const v = getSample(t, 0.05, 0.35);
            // 調高預設靈敏度
            const amp = Math.max(0, v - 0.2); // 從0.28降低到0.2，提高靈敏度
            const h = Math.pow(amp, 1.2) * maxHeight * 2.4; // 從1.35降低到1.2，讓響應更線性
            const xCenter = waveX + t * waveW;
            const x = xCenter - barWidth / 2;
            const y = waveBaseline - h;
            
            if (h > 0) {
                // 使用顏色主題漸變
                const grad = ctx.createLinearGradient(0, y, 0, waveBaseline);
                
                // 支援彩虹主題
                if (colors.name === ColorPaletteType.RAINBOW) {
                    const [startHue, endHue] = colors.hueRange;
                    const hueRangeSpan = endHue - startHue;
                    const hue = startHue + (t * hueRangeSpan);
                    grad.addColorStop(0, `hsla(${hue}, 70%, 60%, 0.85)`);
                    grad.addColorStop(1, `hsla(${hue}, 70%, 60%, 0.15)`);
                } else {
                    grad.addColorStop(0, colors.primary + '85'); // 85% 透明度
                    grad.addColorStop(1, colors.primary + '15'); // 15% 透明度
                }
                
                ctx.fillStyle = grad;
                ctx.fillRect(x, y, barWidth, h);
                
                // 頂部高光 - 使用顏色主題
                if (colors.name === ColorPaletteType.RAINBOW) {
                    const [startHue, endHue] = colors.hueRange;
                    const hueRangeSpan = endHue - startHue;
                    const hue = startHue + (t * hueRangeSpan);
                    ctx.fillStyle = `hsla(${hue}, 80%, 70%, 0.25)`;
                } else {
                    ctx.fillStyle = colors.primary + '25'; // 25% 透明度
                }
                ctx.fillRect(x, y, barWidth, 2);
            }
        }
        
        // 白色中頻線條 - 放大3倍
        const waveHeight1 = maxHeight * 1.8; // 放大3倍 (0.6 * 3 = 1.8)
        ctx.beginPath();
        for (let i = 0; i <= samples; i++) {
            const t = i / samples;
            const v = getSample(t, 0.25, 0.6);
            // 調高預設靈敏度
            const amp = Math.max(0, v - 0.3); // 從0.4降低到0.3，提高靈敏度
            const y = waveBaseline - Math.pow(amp, 1.15) * waveHeight1; // 從1.25降低到1.15，讓響應更線性
            const x = waveX + t * waveW;
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        
        // 支援彩虹主題
        if (colors.name === ColorPaletteType.RAINBOW) {
            // 彩虹主題：創建漸變線條
            const gradient = ctx.createLinearGradient(waveX, waveBaseline, waveX + waveW, waveBaseline);
            const [startHue, endHue] = colors.hueRange;
            const hueRangeSpan = endHue - startHue;
            for (let i = 0; i <= 10; i++) {
                const t = i / 10;
                const hue = startHue + (t * hueRangeSpan);
                gradient.addColorStop(t, `hsla(${hue}, 70%, 60%, 0.92)`);
            }
            ctx.strokeStyle = gradient;
        } else {
            ctx.strokeStyle = 'rgba(255,255,255,0.92)'; // 維持白色
        }
        
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
    // 移除節拍光環效果 - 已移除會跑出來的球
    
    // 4. 文字顯示 - 在可視化下方，不隨重低音晃動
    const textContent = props?.bassEnhancementText;
    const textColor = props?.bassEnhancementTextColor || '#FFFFFF';
    const textFontFamily = FONT_MAP[props?.bassEnhancementTextFont || FontType.POPPINS];
    const textSize = Math.min(width, height) * ((props?.bassEnhancementTextSize || 4.0) / 100); // 使用props中的字體大小
    const textBgOpacity = typeof props?.bassEnhancementTextBgOpacity === 'number' ? props.bassEnhancementTextBgOpacity : 0.5;
    
    // 文字位置 - 在可視化下方，固定位置不晃動
    const textY = centerY + height * 0.15; // 調整文字位置，使其更靠近可視化
    
    // 只有當文字內容存在時才繪製
    if (textContent && textContent.trim()) {
        // 測量文字寬度和高度
        ctx.font = `bold ${textSize}px ${textFontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const textMetrics = ctx.measureText(textContent);
        const textWidth = textMetrics.width;
        const textHeight = textSize * 1.2; // 估算高度
        
        // 繪製文字背景（如果設置了透明度）
        if (textBgOpacity > 0) {
            const bgPaddingX = textSize * 0.3;
            const bgPaddingY = textSize * 0.2;
            const bgWidth = textWidth + bgPaddingX * 2;
            const bgHeight = textHeight + bgPaddingY * 2;
            const bgX = centerX - bgWidth / 2;
            const bgY = textY - textHeight / 2 - bgPaddingY;
            
            ctx.fillStyle = `rgba(0, 0, 0, ${textBgOpacity})`;
            createRoundedRectPath(ctx, bgX, bgY, bgWidth, bgHeight, textSize * 0.1);
            ctx.fill();
        }
        
        // 繪製文字
        ctx.fillStyle = textColor;
        ctx.font = `bold ${textSize}px ${textFontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // 文字發光效果
        ctx.shadowBlur = 10;
        ctx.shadowColor = textColor;
        ctx.fillText(textContent, centerX, textY);
        
        // 重置陰影
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';
    }
    
    ctx.restore();
};

const drawFramePixelation = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array | null, width: number, height: number, frame: number, sensitivity: number, colors: Palette, graphicEffect: GraphicEffectType, isBeat?: boolean, waveformStroke?: boolean, props?: any) => {
    if (!dataArray) return;
    
    ctx.save();
    const centerX = width / 2;
    const centerY = height / 2;
    
    // 計算音頻數據
    const normalizedBass = Math.pow(dataArray[0] / 255, 2);
    const normalizedMid = Math.pow(dataArray[Math.floor(dataArray.length * 0.3)] / 255, 2);
    const normalizedTreble = Math.pow(dataArray[Math.floor(dataArray.length * 0.7)] / 255, 2);
    
    // 計算方格尺寸
    const cardWidth = width * 0.7;
    const cardHeight = height * 0.7;
    const cardX = centerX - cardWidth / 2;
    const cardY = centerY - cardHeight / 2;
    
    // 像素化效果 - 方格外的區域
    ctx.save();
    
    // 計算解析度降低強度
    const blurIntensity = props?.bassEnhancementBlurIntensity || 0.5;
    const resolutionScale = Math.max(0.05, 0.2 - normalizedBass * 0.15 * blurIntensity);
    const resolutionIntensity = 0.6 + normalizedMid * 0.2;
    
    // 創建解析度降低遮罩
    ctx.globalAlpha = resolutionIntensity;
    
    // 繪製解析度降低效果 - 只在方格外的區域
    const resolutionMargin = Math.max(width, height) * 0.5;
    
    // 創建解析度降低圖案 - 使用網格狀低解析度效果
    const blockSize = Math.max(12, Math.floor(24 - normalizedBass * 12 * blurIntensity));
    
    // 繪製低解析度網格效果
    ctx.fillStyle = 'rgba(20, 20, 30, 0.6)';
    
    // 在填充的區域上添加像素化效果
    for (let x = -resolutionMargin; x < width + resolutionMargin; x += blockSize) {
        for (let y = -resolutionMargin; y < height + resolutionMargin; y += blockSize) {
            // 檢查是否在中央方格內
            if (x >= cardX && x < cardX + cardWidth && y >= cardY && y < cardY + cardHeight) {
                continue; // 跳過中央方格
            }
            
            // 統一透明度確保所有區域顏色一致
            const randomAlpha = 0.3 + Math.random() * 0.3;
            ctx.globalAlpha = randomAlpha * resolutionIntensity;
            ctx.fillStyle = 'rgba(15, 15, 25, 0.7)';
            
            ctx.fillRect(x, y, blockSize, blockSize);
        }
    }
    
    ctx.restore();
    
    // 控制卡震動效果 - 增強重低音響應
    const shakeIntensity = normalizedBass * 12;
    const shakeX = Math.sin(frame * 0.1) * shakeIntensity;
    const shakeY = Math.cos(frame * 0.08) * shakeIntensity;
    
    // 重低音放大震動效果 - 圓滑的縮放
    const bassScale = 1.0 + normalizedBass * 0.15;
    const smoothScale = bassScale + Math.sin(frame * 0.05) * normalizedBass * 0.05;
    
    // 計算震動後的方格位置和大小
    const scaledCardWidth = cardWidth * smoothScale;
    const scaledCardHeight = cardHeight * smoothScale;
    const scaledCardX = centerX - scaledCardWidth / 2 + shakeX;
    const scaledCardY = centerY - scaledCardHeight / 2 + shakeY;
    
    // 控制卡背景 - 使用透明度控制
    ctx.save();
    const centerOpacity = props?.bassEnhancementCenterOpacity ?? 0.3;
    ctx.globalAlpha = centerOpacity;
    ctx.fillStyle = `rgba(25, 25, 35, ${centerOpacity})`;
    ctx.shadowBlur = 25 * smoothScale;
    ctx.shadowColor = '#FFFFFF';
    
    const cornerRadius = 15 * smoothScale;
    ctx.beginPath();
    ctx.moveTo(scaledCardX + cornerRadius, scaledCardY);
    ctx.lineTo(scaledCardX + scaledCardWidth - cornerRadius, scaledCardY);
    ctx.quadraticCurveTo(scaledCardX + scaledCardWidth, scaledCardY, scaledCardX + scaledCardWidth, scaledCardY + cornerRadius);
    ctx.lineTo(scaledCardX + scaledCardWidth, scaledCardY + scaledCardHeight - cornerRadius);
    ctx.quadraticCurveTo(scaledCardX + scaledCardWidth, scaledCardY + scaledCardHeight, scaledCardX + scaledCardWidth - cornerRadius, scaledCardY + scaledCardHeight);
    ctx.lineTo(scaledCardX + cornerRadius, scaledCardY + scaledCardHeight);
    ctx.quadraticCurveTo(scaledCardX, scaledCardY + scaledCardHeight, scaledCardX, scaledCardY + scaledCardHeight - cornerRadius);
    ctx.lineTo(scaledCardX, scaledCardY + cornerRadius);
    ctx.quadraticCurveTo(scaledCardX, scaledCardY, scaledCardX + cornerRadius, scaledCardY);
    ctx.fill();
    ctx.restore();
    
    // 控制卡邊框 - 使用震動後的尺寸
    ctx.strokeStyle = colors.accent;
    ctx.lineWidth = (2 + normalizedTreble) * smoothScale;
    ctx.shadowBlur = 10 * smoothScale;
    ctx.shadowColor = colors.accent;
    ctx.stroke();
    
    // 音頻可視化位置 - 居中顯示，應用強烈震動效果
    const curveIntensity = props?.bassEnhancementCurveIntensity || 1.0;
    const segmentCount = 24;
    const maxHeight = scaledCardHeight * 0.6;
    
    // 減少聲波圖寬度
    const visualizerWidth = scaledCardWidth * 0.3;
    const startX = scaledCardX + scaledCardWidth * 0.1;
    const endX = startX + visualizerWidth;
    const baselineY = scaledCardY + scaledCardHeight * 0.7;
    
    const thickness = 3.0;
    const softness = 50.0;
    
    const segmentWidth = visualizerWidth / segmentCount;
    const waveHeight = maxHeight;
    const waveX = startX;
    const waveY = baselineY - waveHeight;
    
    // 先畫白色發光基準線
    ctx.beginPath();
    ctx.moveTo(waveX, baselineY);
    ctx.lineTo(waveX + visualizerWidth, baselineY);
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = thickness;
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#FFFFFF';
    ctx.stroke();
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
    
    // 複製唱片控制卡的音頻可視化效果
    if (dataArray) {
        // 波形區域設定
        const wavePadding = 20;
        const waveX = startX + wavePadding;
        const waveW = visualizerWidth - wavePadding * 2;
        const waveBaseline = baselineY;
        const samples = 64;
        
        // 音頻取樣函數
        const getSample = (t: number, bandStart: number, bandEnd: number) => {
            if (!dataArray) return 0.5;
            const len = dataArray.length;
            const s = Math.max(0, Math.min(len - 1, Math.floor(bandStart * len)));
            const e = Math.max(s + 1, Math.min(len, Math.floor(bandEnd * len)));
            const idx = s + Math.floor(t * (e - s - 1));
            return dataArray[idx] / 255;
        };
        
        // 山形圖（白色，低頻到中低頻）
        const barCount = samples + 1;
        const barWidth = Math.max(2, (waveW / barCount) * 0.6);
        
        for (let i = 0; i < barCount; i++) {
            const t = i / (barCount - 1);
            const v = getSample(t, 0.05, 0.35);
            // 調高預設靈敏度
            const amp = Math.max(0, v - 0.2);
            const h = Math.pow(amp, 1.2) * maxHeight * 2.4;
            const xCenter = waveX + t * waveW;
            const x = xCenter - barWidth / 2;
            const y = waveBaseline - h;
            
            if (h > 0) {
                // 白色漸變
                const grad = ctx.createLinearGradient(0, y, 0, waveBaseline);
                grad.addColorStop(0, 'rgba(255,255,255,0.9)');
                grad.addColorStop(1, 'rgba(255,255,255,0.3)');
                ctx.fillStyle = grad;
                ctx.shadowBlur = 8;
                ctx.shadowColor = '#FFFFFF';
                ctx.fillRect(x, y, barWidth, h);
            }
        }
        
        // 白色中頻線條 - 放大3倍
        const waveHeight1 = maxHeight * 1.8;
        ctx.beginPath();
        for (let i = 0; i <= samples; i++) {
            const t = i / samples;
            const v = getSample(t, 0.25, 0.6);
            // 調高預設靈敏度
            const amp = Math.max(0, v - 0.3);
            const y = waveBaseline - Math.pow(amp, 1.15) * waveHeight1;
            const x = waveX + t * waveW;
            if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = 'rgba(255,255,255,0.92)';
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
    ctx.restore();
};

const drawFusion = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array | null, width: number, height: number, frame: number, sensitivity: number, colors: Palette, graphicEffect: GraphicEffectType, isBeat?: boolean, waveformStroke?: boolean) => {
    if (!dataArray) return;
    ctx.save();
    const centerY = height / 2;
    const centerX = width / 2;
    const [startHue, endHue] = colors.hueRange;
    const hueRangeSpan = endHue - startHue;

    // --- 1. Draw dotted columns from the bottom ---
    const numColumns = 128;
    const columnSpacingX = width / numColumns;
    for (let i = 0; i < numColumns; i++) {
        const dataIndex = Math.floor(i * (dataArray.length * 0.7 / numColumns));
        const columnHeight = Math.pow(dataArray[dataIndex] / 255, 2) * height * 0.8 * sensitivity;
        if (columnHeight < 1) continue;
        
        let color;
        if (colors.name === ColorPaletteType.WHITE) {
            const lightness = 80 + (dataArray[dataIndex] / 255) * 20;
            color = `hsl(220, 5%, ${lightness}%)`;
        } else {
            const hue = startHue + (i / numColumns) * hueRangeSpan;
            color = `hsl(${hue}, 80%, 60%)`;
        }
        ctx.fillStyle = color;
        ctx.shadowColor = color;
        ctx.shadowBlur = 5;
        
        const x = i * columnSpacingX + columnSpacingX / 2;
        const dotSpacingY = 8;
        const numDots = Math.floor(columnHeight / dotSpacingY);

        for (let j = 0; j < numDots; j++) {
            const y = height - j * dotSpacingY;
            const opacity = 1 - Math.pow(j / numDots, 2);
            ctx.globalAlpha = opacity;
            const radius = 1 + (dataArray[dataIndex] / 255) * 1.5;
            
            ctx.beginPath();
            ctx.arc(x, y - dotSpacingY / 2, radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    ctx.globalAlpha = 1.0;
    ctx.shadowBlur = 0; // Reset shadow for waves

    // --- 2. Create Mirrored Base Wave Data ---
    const numPoints = Math.floor(width / 2);
    const dataSliceLength = dataArray.length * 0.35;
    const wave_base_data: { x: number, y_amp: number }[] = [];

    for (let i = 0; i <= numPoints / 2; i++) {
        const progress = i / (numPoints / 2);
        const x = centerX - (progress * centerX);
        const dataIndex = Math.floor(progress * dataSliceLength);
        const audioAmp = Math.pow(dataArray[dataIndex] / 255, 2) * 150 * sensitivity;
        wave_base_data.push({ x, y_amp: audioAmp });
    }
    const right_half = wave_base_data.slice(1).reverse().map(p => ({ x: width - p.x, y_amp: p.y_amp }));
    const full_wave_data = [...wave_base_data, ...right_half];

    // --- 3. Draw waves ---
    const solidWaveAmpMultiplier = 0.6;
    const dottedWaveAmpMultiplier = 1.2;

    // Draw Solid Wave - Top half
    ctx.beginPath();
    const firstPoint = full_wave_data[0];
    const yOscSolid_first = Math.sin(firstPoint.x * 0.05 + frame * 0.02) * 5; 
    ctx.moveTo(firstPoint.x, centerY + firstPoint.y_amp * solidWaveAmpMultiplier + yOscSolid_first);
    for (const p of full_wave_data) {
        const yOsc = Math.sin(p.x * 0.05 + frame * 0.02) * 5;
        ctx.lineTo(p.x, centerY + p.y_amp * solidWaveAmpMultiplier + yOsc);
    }

    if (waveformStroke) {
        ctx.save();
        ctx.strokeStyle = 'rgba(0,0,0,0.7)';
        ctx.lineWidth = 4.5;
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';
        ctx.stroke();
        ctx.restore();
    }
    
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = colors.primary;
    ctx.shadowBlur = 15;
    ctx.stroke();

    // Draw Solid Wave - Bottom half
    ctx.beginPath();
    for (let i = full_wave_data.length - 1; i >= 0; i--) {
        const p = full_wave_data[i];
        const yOsc = Math.sin(p.x * 0.05 + frame * 0.02) * 5;
        if (i === full_wave_data.length - 1) {
            ctx.moveTo(p.x, centerY - (p.y_amp * solidWaveAmpMultiplier) + yOsc);
        } else {
            ctx.lineTo(p.x, centerY - (p.y_amp * solidWaveAmpMultiplier) + yOsc);
        }
    }

    if (waveformStroke) {
        ctx.save();
        ctx.strokeStyle = 'rgba(0,0,0,0.7)';
        ctx.lineWidth = 4.5;
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';
        ctx.stroke();
        ctx.restore();
    }
    
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = colors.primary;
    ctx.shadowBlur = 15;
    ctx.stroke();

    // Draw Dotted Wave
    ctx.fillStyle = colors.secondary;
    ctx.shadowColor = colors.secondary;
    ctx.shadowBlur = 10;
    for (const p of full_wave_data) {
        const yOsc = Math.sin(p.x * 0.08 + frame * -0.03) * 8; 
        const y_top = centerY + p.y_amp * dottedWaveAmpMultiplier + yOsc;
        const y_bottom = centerY - p.y_amp * dottedWaveAmpMultiplier + yOsc;

        ctx.beginPath();
        ctx.arc(p.x, y_top, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(p.x, y_bottom, 1.5, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.restore();
};

const drawNebulaWave = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array | null, width: number, height: number, frame: number, sensitivity: number, colors: Palette, graphicEffect: GraphicEffectType, isBeat?: boolean, waveformStroke?: boolean) => {
    if (!dataArray) return;
    ctx.save();
    const centerY = height / 2;
    const centerX = width / 2;

    const numPoints = Math.floor(width / 2);
    const dataSliceLength = dataArray.length * 0.35;
    const wave_base_data: { x: number, y_amp: number }[] = [];

    for (let i = 0; i <= numPoints / 2; i++) {
        const progress = i / (numPoints / 2);
        const x = centerX - (progress * centerX);
        const dataIndex = Math.floor(progress * dataSliceLength);
        const audioAmp = Math.pow(dataArray[dataIndex] / 255, 2) * 150 * sensitivity;
        wave_base_data.push({ x, y_amp: audioAmp });
    }
    const right_half = wave_base_data.slice(1).reverse().map(p => ({ x: width - p.x, y_amp: p.y_amp }));
    const full_wave_data = [...wave_base_data, ...right_half];

    const solidWaveAmpMultiplier = 0.6;
    const dottedWaveAmpMultiplier = 1.2;

    // Draw Solid Wave - Top half
    ctx.beginPath();
    const firstPoint = full_wave_data[0];
    const yOscSolid_first = Math.sin(firstPoint.x * 0.05 + frame * 0.02) * 5; 
    ctx.moveTo(firstPoint.x, centerY + firstPoint.y_amp * solidWaveAmpMultiplier + yOscSolid_first);
    for (const p of full_wave_data) {
        const yOsc = Math.sin(p.x * 0.05 + frame * 0.02) * 5;
        ctx.lineTo(p.x, centerY + p.y_amp * solidWaveAmpMultiplier + yOsc);
    }

    if (waveformStroke) {
        ctx.save();
        ctx.strokeStyle = 'rgba(0,0,0,0.7)';
        ctx.lineWidth = 4.5;
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';
        ctx.stroke();
        ctx.restore();
    }

    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = colors.primary;
    ctx.shadowBlur = 15;
    ctx.stroke();

    // Draw Solid Wave - Bottom half
    ctx.beginPath();
    for (let i = full_wave_data.length - 1; i >= 0; i--) {
        const p = full_wave_data[i];
        const yOsc = Math.sin(p.x * 0.05 + frame * 0.02) * 5;
        if (i === full_wave_data.length - 1) {
            ctx.moveTo(p.x, centerY - (p.y_amp * solidWaveAmpMultiplier) + yOsc);
        } else {
            ctx.lineTo(p.x, centerY - (p.y_amp * solidWaveAmpMultiplier) + yOsc);
        }
    }

    if (waveformStroke) {
        ctx.save();
        ctx.strokeStyle = 'rgba(0,0,0,0.7)';
        ctx.lineWidth = 4.5;
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';
        ctx.stroke();
        ctx.restore();
    }

    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = colors.primary;
    ctx.shadowBlur = 15;
    ctx.stroke();

    // Draw Dotted Wave
    ctx.fillStyle = colors.secondary;
    ctx.shadowColor = colors.secondary;
    ctx.shadowBlur = 10;
    for (const p of full_wave_data) {
        const yOsc = Math.sin(p.x * 0.08 + frame * -0.03) * 8; 
        const y_top = centerY + p.y_amp * dottedWaveAmpMultiplier + yOsc;
        const y_bottom = centerY - p.y_amp * dottedWaveAmpMultiplier + yOsc;
        
        ctx.beginPath();
        ctx.arc(p.x, y_top, 1.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(p.x, y_bottom, 1.5, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.restore();
};
const drawSolarSystem = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array | null, width: number, height: number, frame: number, sensitivity: number, colors: Palette, graphicEffect: GraphicEffectType, isBeat?: boolean, waveformStroke?: boolean) => {
    if (!dataArray) return;
    ctx.save();
    
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Audio-reactive parameters for different frequency ranges
    const sunBass = dataArray.slice(0, 16).reduce((a, b) => a + b, 0) / 16;
    const mercuryTreble = dataArray.slice(200, 256).reduce((a, b) => a + b, 0) / 56;
    const venusHighMid = dataArray.slice(150, 200).reduce((a, b) => a + b, 0) / 50;
    const earthMid = dataArray.slice(100, 150).reduce((a, b) => a + b, 0) / 50;
    const marsLowMid = dataArray.slice(64, 100).reduce((a, b) => a + b, 0) / 36;
    const jupiterLow = dataArray.slice(32, 64).reduce((a, b) => a + b, 0) / 32;
    const saturnBass = dataArray.slice(16, 32).reduce((a, b) => a + b, 0) / 16;
    const uranusSubBass = dataArray.slice(8, 16).reduce((a, b) => a + b, 0) / 8;
    const neptuneUltraLow = dataArray.slice(4, 8).reduce((a, b) => a + b, 0) / 4;
    const plutoDeep = dataArray.slice(0, 4).reduce((a, b) => a + b, 0) / 4;
    
    // Normalize audio data
    const normalizedSun = Math.pow(sunBass / 255, 1.5) * sensitivity;
    const normalizedMercury = Math.pow(mercuryTreble / 255, 1.2) * sensitivity;
    const normalizedVenus = Math.pow(venusHighMid / 255, 1.3) * sensitivity;
    const normalizedEarth = Math.pow(earthMid / 255, 1.4) * sensitivity;
    const normalizedMars = Math.pow(marsLowMid / 255, 1.3) * sensitivity;
    const normalizedJupiter = Math.pow(jupiterLow / 255, 1.5) * sensitivity;
    const normalizedSaturn = Math.pow(saturnBass / 255, 1.4) * sensitivity;
    const normalizedUranus = Math.pow(uranusSubBass / 255, 1.6) * sensitivity;
    const normalizedNeptune = Math.pow(neptuneUltraLow / 255, 1.7) * sensitivity;
    const normalizedPluto = Math.pow(plutoDeep / 255, 1.8) * sensitivity;
    
    // Planet properties
    const planets = [
        { name: 'Sun', radius: 25, distance: 0, color: '#FFD700', audio: normalizedSun, speed: 0.01, glow: true },
        { name: 'Mercury', radius: 8, distance: 60, color: '#A0522D', audio: normalizedMercury, speed: 0.03, glow: false },
        { name: 'Venus', radius: 12, distance: 90, color: '#FFA500', audio: normalizedVenus, speed: 0.025, glow: false },
        { name: 'Earth', radius: 13, distance: 130, color: '#4169E1', audio: normalizedEarth, speed: 0.02, glow: false },
        { name: 'Mars', radius: 10, distance: 170, color: '#DC143C', audio: normalizedMars, speed: 0.018, glow: false },
        { name: 'Jupiter', radius: 20, distance: 220, color: '#DAA520', audio: normalizedJupiter, speed: 0.015, glow: false },
        { name: 'Saturn', radius: 18, distance: 280, color: '#F4A460', audio: normalizedSaturn, speed: 0.012, glow: false },
        { name: 'Uranus', radius: 15, distance: 340, color: '#40E0D0', audio: normalizedUranus, speed: 0.01, glow: false },
        { name: 'Neptune', radius: 14, distance: 400, color: '#1E90FF', audio: normalizedNeptune, speed: 0.008, glow: false },
        { name: 'Pluto', radius: 6, distance: 450, color: '#696969', audio: normalizedPluto, speed: 0.005, glow: false }
    ];
    
    // Draw orbital paths with Bezier curve nebula effects
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    planets.forEach(planet => {
        if (planet.distance > 0) {
            ctx.beginPath();
            ctx.arc(centerX, centerY, planet.distance, 0, Math.PI * 2);
            ctx.stroke();
        }
    });
    
    // Draw Bezier curve nebula around each planet
    planets.forEach((planet, index) => {
        if (planet.distance > 0 && planet.audio > 0.1) { // Only draw for planets with audio activity
            const angle = frame * planet.speed + (index * Math.PI / 5);
            const x = centerX + Math.cos(angle) * planet.distance;
            const y = centerY + Math.sin(angle) * planet.distance;
            
            // Create nebula effect with Bezier curves
            const nebulaRadius = planet.radius * 2.5 + planet.audio * 20;
            const controlPoints = 8; // Number of control points for smooth curves
            
            ctx.beginPath();
            
            // Start from the first point
            const startAngle = 0;
            const startX = x + Math.cos(startAngle) * nebulaRadius;
            const startY = y + Math.sin(startAngle) * nebulaRadius;
            ctx.moveTo(startX, startY);
            
            // Create smooth Bezier curve around the planet
            for (let i = 0; i <= controlPoints; i++) {
                const progress = i / controlPoints;
                const currentAngle = progress * Math.PI * 2;
                
                // Add some wave variation based on audio
                const waveOffset = Math.sin(frame * 0.05 + i * 0.8) * (planet.audio * 8);
                const currentRadius = nebulaRadius + waveOffset;
                
                const currentX = x + Math.cos(currentAngle) * currentRadius;
                const currentY = y + Math.sin(currentAngle) * currentRadius;
                
                if (i === 0) {
                    // First point already moved to
                    continue;
                } else if (i === controlPoints) {
                    // Last point - close the path
                    ctx.lineTo(startX, startY);
                } else {
                    // Calculate control points for smooth curves
                    const prevAngle = ((i - 1) / controlPoints) * Math.PI * 2;
                    const prevRadius = nebulaRadius + Math.sin(frame * 0.05 + (i - 1) * 0.8) * (planet.audio * 8);
                    const prevX = x + Math.cos(prevAngle) * prevRadius;
                    const prevY = y + Math.sin(prevAngle) * prevRadius;
                    
                    // Create smooth curve using quadratic curves
                    const midX = (prevX + currentX) / 2;
                    const midY = (prevY + currentY) / 2;
                    
                    ctx.quadraticCurveTo(prevX, prevY, midX, midY);
                }
            }
            
            // Create nebula gradient
            const nebulaGradient = ctx.createRadialGradient(x, y, 0, x, y, nebulaRadius);
            const nebulaColor = planet.color;
            const alpha = planet.audio * 0.3; // Audio-reactive transparency
            
            nebulaGradient.addColorStop(0, applyAlphaToColor(nebulaColor, alpha * 0.8));
            nebulaGradient.addColorStop(0.5, applyAlphaToColor(nebulaColor, alpha * 0.4));
            nebulaGradient.addColorStop(1, 'transparent');
            
            // Fill the nebula
            ctx.fillStyle = nebulaGradient;
            ctx.fill();
            
            // Add subtle stroke for definition
            ctx.strokeStyle = applyAlphaToColor(nebulaColor, alpha * 0.6);
            ctx.lineWidth = 1;
            ctx.stroke();
        }
    });
    
    // Draw planets
    planets.forEach((planet, index) => {
        const angle = frame * planet.speed + (index * Math.PI / 5);
        const x = centerX + Math.cos(angle) * planet.distance;
        const y = centerY + Math.sin(angle) * planet.distance;
        
        // Calculate planet size based on audio - enhanced effect
        const audioScale = 1 + planet.audio * 1.5; // Increased from 0.5 to 1.5
        const currentRadius = planet.radius * audioScale;
        
        // Draw planet glow if enabled - enhanced effect
        if (planet.glow) {
            const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, currentRadius * 3);
            glowGradient.addColorStop(0, planet.color);
            glowGradient.addColorStop(0.3, applyAlphaToColor(planet.color, 0.8));
            glowGradient.addColorStop(0.7, applyAlphaToColor(planet.color, 0.4));
            glowGradient.addColorStop(1, 'transparent');
            
            ctx.fillStyle = glowGradient;
            ctx.beginPath();
            ctx.arc(x, y, currentRadius * 3, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Draw planet with enhanced audio-reactive colors
        const planetGradient = ctx.createRadialGradient(x, y, 0, x, y, currentRadius);
        const enhancedColor = planet.audio > 0.3 ? '#FFFFFF' : planet.color; // Bright white when audio is strong
        planetGradient.addColorStop(0, enhancedColor);
        planetGradient.addColorStop(0.7, applyAlphaToColor(enhancedColor, 0.9));
        planetGradient.addColorStop(1, applyAlphaToColor(enhancedColor, 0.7));
        
        ctx.fillStyle = planetGradient;
        ctx.shadowColor = planet.color;
        ctx.shadowBlur = planet.glow ? 30 : 15; // Enhanced shadow blur
        
        ctx.beginPath();
        ctx.arc(x, y, currentRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // Special effects for specific planets
        if (planet.name === 'Saturn') {
            // Draw Saturn's rings
            const ringGradient = ctx.createRadialGradient(x, y, currentRadius, x, y, currentRadius * 1.8);
            ringGradient.addColorStop(0, 'transparent');
            ringGradient.addColorStop(0.3, applyAlphaToColor(planet.color, 0.4));
            ringGradient.addColorStop(0.7, applyAlphaToColor(planet.color, 0.6));
            ringGradient.addColorStop(1, 'transparent');
            
            ctx.fillStyle = ringGradient;
            ctx.beginPath();
            ctx.ellipse(x, y, currentRadius * 1.8, currentRadius * 0.3, angle, 0, Math.PI * 2);
            ctx.fill();
        }
        
        if (planet.name === 'Earth') {
            // Draw Earth's atmosphere glow
            const atmosphereGradient = ctx.createRadialGradient(x, y, currentRadius, x, y, currentRadius * 1.3);
            atmosphereGradient.addColorStop(0, 'transparent');
            atmosphereGradient.addColorStop(0.5, applyAlphaToColor('#87CEEB', 0.3));
            atmosphereGradient.addColorStop(1, 'transparent');
            
            ctx.fillStyle = atmosphereGradient;
            ctx.beginPath();
            ctx.arc(x, y, currentRadius * 1.3, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Planet name labels removed for cleaner visual
    });
    
    // Shooting stars effect removed for cleaner visual
    
    ctx.restore();
};
const drawTechWave = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array | null, width: number, height: number, frame: number, sensitivity: number, colors: Palette, graphicEffect: GraphicEffectType, isBeat?: boolean, waveformStroke?: boolean) => {
    if (!dataArray) return;
    ctx.save();
    
    const centerX = width / 2;
    const centerY = height / 2;
    
    // 優化的音頻分析
    const bass = dataArray.slice(0, 32).reduce((a, b) => a + b, 0) / 32;
    const mid = dataArray.slice(32, 96).reduce((a, b) => a + b, 0) / 64;
    const treble = dataArray.slice(96, 128).reduce((a, b) => a + b, 0) / 32;
    
    const normalizedBass = bass / 255;
    const normalizedMid = mid / 255;
    const normalizedTreble = treble / 255;
    
    // 簡化的量子場背景
    const fieldRadius = Math.min(width, height) * 0.5;
    const fieldGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, fieldRadius);
    fieldGradient.addColorStop(0, applyAlphaToColor(colors.primary, 0.08));
    fieldGradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = fieldGradient;
    ctx.fillRect(0, 0, width, height);
    
    // 優化的量子能量節點
    const nodeCount = 8; // 減少從12到8
    for (let i = 0; i < nodeCount; i++) {
        const nodeAngle = (i / nodeCount) * Math.PI * 2 + frame * 0.015; // 減慢旋轉速度
        const nodeRadius = fieldRadius * 0.6;
        const nodeX = centerX + Math.cos(nodeAngle) * nodeRadius;
        const nodeY = centerY + Math.sin(nodeAngle) * nodeRadius;
        
        const nodeSize = 6 + normalizedBass * 4 * sensitivity; // 減少大小
        const nodeColor = i % 3 === 0 ? colors.primary : i % 3 === 1 ? colors.secondary : colors.accent;
        
        // 繪製節點核心
        ctx.fillStyle = nodeColor;
        ctx.shadowColor = nodeColor;
        ctx.shadowBlur = 12; // 減少陰影模糊
        ctx.beginPath();
        ctx.arc(nodeX, nodeY, nodeSize, 0, Math.PI * 2);
        ctx.fill();
        
        // 簡化的節點脈衝環
        if (i % 2 === 0) { // 只在偶數節點繪製脈衝環
            const pulseRadius = nodeSize + 8 + normalizedMid * 8 * sensitivity;
            const pulseOpacity = 0.3;
            
            ctx.strokeStyle = applyAlphaToColor(nodeColor, pulseOpacity);
            ctx.lineWidth = 1.5;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.arc(nodeX, nodeY, pulseRadius, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.setLineDash([]);
        
        // 簡化的能量連接
        const nextNodeIndex = (i + 1) % nodeCount;
        const nextNodeAngle = (nextNodeIndex / nodeCount) * Math.PI * 2 + frame * 0.015;
        const nextNodeX = centerX + Math.cos(nextNodeAngle) * nodeRadius;
        const nextNodeY = centerY + Math.sin(nextNodeAngle) * nodeRadius;
        
        const connectionOpacity = 0.2 + normalizedTreble * 0.3;
        ctx.strokeStyle = applyAlphaToColor(colors.accent, connectionOpacity);
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 2]);
        
        ctx.beginPath();
        ctx.moveTo(nodeX, nodeY);
        ctx.lineTo(nextNodeX, nextNodeY);
        ctx.stroke();
    }
    ctx.setLineDash([]);
    
    // 優化的中央量子核心
    const coreRadius = 20 + normalizedBass * 30 * sensitivity; // 減少大小
    
    // 簡化的核心層
    const coreLayers = 2; // 減少從4到2
    for (let i = 0; i < coreLayers; i++) {
        const layerRadius = coreRadius + i * 10;
        const layerOpacity = 0.6 - i * 0.3;
        const layerColor = i % 2 === 0 ? colors.primary : colors.secondary;
        
        const layerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, layerRadius);
        layerGradient.addColorStop(0, applyAlphaToColor(layerColor, layerOpacity));
        layerGradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = layerGradient;
        ctx.shadowColor = layerColor;
        ctx.shadowBlur = 15; // 減少陰影模糊
        ctx.beginPath();
        ctx.arc(centerX, centerY, layerRadius, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // 簡化的量子波函數
    const waveCount = 4; // 減少從6到4
    for (let i = 0; i < waveCount; i++) {
        const waveAngle = (i / waveCount) * Math.PI * 2 + frame * 0.008; // 減慢旋轉速度
        const waveAmplitude = 40 + normalizedMid * 60 * sensitivity; // 減少振幅
        const waveFrequency = 2 + normalizedTreble * 3; // 減少頻率
        
        ctx.strokeStyle = applyAlphaToColor(colors.accent, 0.5);
        ctx.lineWidth = 1.5;
        ctx.shadowColor = colors.accent;
        ctx.shadowBlur = 8; // 減少陰影模糊
        
        ctx.beginPath();
        for (let x = 0; x < width; x += 6) { // 增加步長從3到6
            const normalizedX = x / width;
            const waveHeight = Math.sin(normalizedX * waveFrequency * Math.PI + frame * 0.015) * waveAmplitude;
            const rotatedX = centerX + (x - centerX) * Math.cos(waveAngle) - waveHeight * Math.sin(waveAngle);
            const rotatedY = centerY + (x - centerX) * Math.sin(waveAngle) + waveHeight * Math.cos(waveAngle);
            
            if (x === 0) {
                ctx.moveTo(rotatedX, rotatedY);
            } else {
                ctx.lineTo(rotatedX, rotatedY);
            }
        }
        ctx.stroke();
    }
    
    // 簡化的頻率光譜
    const spectrumBars = 32; // 減少從64到32
    const barWidth = width / spectrumBars;
    
    for (let i = 0; i < spectrumBars; i++) {
        const dataIndex = Math.floor((i / spectrumBars) * dataArray.length);
        const amplitude = dataArray[dataIndex] / 255;
        const barHeight = Math.pow(amplitude, 1.3) * height * 0.25 * sensitivity; // 減少高度
        
        if (barHeight < 3) continue; // 提高閾值
        
        const x = i * barWidth;
        const y = height - barHeight;
        
        // 簡化的量子扭曲效果
        const distortionX = isBeat && Math.random() > 0.9 ? (Math.random() - 0.5) * 4 : 0; // 減少扭曲
        const distortionHeight = isBeat && Math.random() > 0.95 ? Math.random() * 8 : 0; // 減少扭曲
        
        // 簡化的顏色系統
        let barColor;
        if (i < spectrumBars * 0.33) {
            barColor = applyAlphaToColor(colors.primary, 0.7 + amplitude * 0.2);
        } else if (i < spectrumBars * 0.66) {
            barColor = applyAlphaToColor(colors.secondary, 0.7 + amplitude * 0.2);
        } else {
            barColor = applyAlphaToColor(colors.accent, 0.7 + amplitude * 0.2);
        }
        
        ctx.fillStyle = barColor;
        
        // 繪製簡化的矩形
        const barX = x + distortionX;
        const barY = y;
        const finalHeight = barHeight + distortionHeight;
        
        ctx.fillRect(barX, barY, barWidth - 1, finalHeight);
    }
    
    // 簡化的量子粒子
    const particleCount = 40 + normalizedBass * 60 * sensitivity; // 減少粒子數量
    for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2 + frame * 0.003; // 減慢旋轉速度
        const radius = 30 + Math.sin(frame * 0.02 + i * 0.05) * 40; // 減少半徑變化
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        const particleSize = 1.5 + normalizedMid * 2 * sensitivity; // 減少粒子大小
        const particleOpacity = 0.6 + normalizedTreble * 0.2;
        
        // 簡化的粒子效果
        ctx.fillStyle = applyAlphaToColor(colors.accent, particleOpacity);
        ctx.shadowColor = colors.accent;
        ctx.shadowBlur = 8; // 減少陰影模糊
        ctx.beginPath();
        ctx.arc(x, y, particleSize, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // 簡化的能量場線
    const fieldLineCount = 6; // 減少線條數量
    for (let i = 0; i < fieldLineCount; i++) {
        const lineAngle = (i / fieldLineCount) * Math.PI * 2 + frame * 0.01; // 減慢旋轉速度
        const lineLength = fieldRadius * 0.3 + normalizedBass * 40 * sensitivity; // 減少線條長度
        
        ctx.strokeStyle = applyAlphaToColor(colors.primary, 0.3);
        ctx.lineWidth = 1.5;
        ctx.setLineDash([8, 8]);
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
            centerX + Math.cos(lineAngle) * lineLength,
            centerY + Math.sin(lineAngle) * lineLength
        );
        ctx.stroke();
    }
    ctx.setLineDash([]);
    
    ctx.restore();
};
const drawStellarCore = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array | null, width: number, height: number, frame: number, sensitivity: number, colors: Palette, graphicEffect: GraphicEffectType, isBeat?: boolean, waveformStroke?: boolean) => {
    if (!dataArray) return;
    ctx.save();
    const centerX = width / 2;
    const centerY = height / 2;
    
    const bass = dataArray.slice(0, 32).reduce((a, b) => a + b, 0) / 32;
    const mid = dataArray.slice(32, 128).reduce((a, b) => a + b, 0) / 96;
    const treble = dataArray.slice(128, 256).reduce((a, b) => a + b, 0) / 128;
    
    const normalizedBass = bass / 255;
    const normalizedMid = mid / 255;
    const normalizedTreble = treble / 255;
    
    // 1. Pulsating Background Glow (moved to main render loop to be behind background image)
    
    ctx.save();

    // 2. 優化水波漣漪效果 - Optimized Water Ripple Effect
    const rippleCount = 4; // 減少漣漪層數從8到4
    const maxRippleRadius = Math.min(width, height) * 0.5; // 減少漣漪範圍
    
    for (let layer = 0; layer < rippleCount; layer++) {
        const rippleAge = (frame + layer * 20) % 100; // 簡化漣漪生命週期
        const rippleRadius = (rippleAge / 100) * maxRippleRadius;
        const rippleOpacity = Math.max(0, 1 - (rippleAge / 100)) * 0.8; // 減少透明度
        
        if (rippleOpacity > 0.05) { // 提高閾值，減少繪製
            // 根據音頻強度調整漣漪顏色和強度
            const audioIntensity = (normalizedBass * 0.5 + normalizedMid * 0.3 + normalizedTreble * 0.2) * sensitivity;
            const rippleColor = isBeat ? colors.accent : colors.primary;
            
            // 簡化漣漪線條
            ctx.strokeStyle = applyAlphaToColor(rippleColor, rippleOpacity * audioIntensity);
            ctx.lineWidth = Math.max(2, 6 - layer * 1); // 減少線條粗細
            ctx.shadowBlur = 15; // 減少陰影模糊
            ctx.shadowColor = rippleColor;
            
            // 繪製主漣漪圓圈
            ctx.beginPath();
            ctx.arc(centerX, centerY, rippleRadius, 0, Math.PI * 2);
            ctx.stroke();
            
            // 簡化雙重漣漪效果 - 只在特定層數繪製
            if (layer % 3 === 0) {
                ctx.strokeStyle = applyAlphaToColor(colors.secondary, rippleOpacity * audioIntensity * 0.5);
                ctx.lineWidth = Math.max(1, 3 - layer * 0.5);
                ctx.shadowBlur = 8;
                ctx.shadowColor = colors.secondary;
                
                ctx.beginPath();
                ctx.arc(centerX, centerY, rippleRadius + 3, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
    }
    
    // 簡化脈衝漣漪效果
    if (isBeat && Math.random() > 0.5) { // 只在50%的節拍時觸發
        const pulseRippleCount = 2; // 減少從3到2
        for (let pr = 0; pr < pulseRippleCount; pr++) {
            const pulseAge = (frame + pr * 30) % 60; // 簡化生命週期
            const pulseRadius = (pulseAge / 60) * maxRippleRadius * 0.6;
            const pulseOpacity = Math.max(0, 1 - (pulseAge / 60)) * 0.7;
            
            if (pulseOpacity > 0.08) { // 提高閾值
                ctx.strokeStyle = applyAlphaToColor(colors.accent, pulseOpacity);
                ctx.lineWidth = 4; // 減少線條粗細
                ctx.shadowBlur = 20; // 減少陰影模糊
                ctx.shadowColor = colors.accent;
                
                ctx.beginPath();
                ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
    }
    
    // 3. 優化音符漣漪 - Optimized Note-based Ripples
    const noteCount = 8; // 減少音符數量從12到8
    for (let i = 0; i < noteCount; i++) {
        const noteAngle = (i / noteCount) * Math.PI * 2 + frame * 0.02; // 減慢旋轉速度
        const noteRadius = Math.min(width, height) * 0.25;
        const noteX = centerX + Math.cos(noteAngle) * noteRadius;
        const noteY = centerY + Math.sin(noteAngle) * noteRadius;
        
        const noteIntensity = dataArray[Math.floor((i / noteCount) * dataArray.length)] / 255;
        if (noteIntensity > 0.12) { // 提高閾值，減少繪製
            const noteSize = noteIntensity * 25 * sensitivity; // 減少音符大小
            const noteColor = colors.secondary;
            
            // 簡化音符漣漪效果 - 只產生1層漣漪
            const noteRippleAge = (frame + i * 10) % 50;
            const noteRippleRadius = noteSize * 2;
            const noteRippleOpacity = noteIntensity * 0.4;
            
            if (noteRippleOpacity > 0.08) {
                ctx.strokeStyle = applyAlphaToColor(noteColor, noteRippleOpacity);
                ctx.lineWidth = 2;
                ctx.shadowBlur = 8; // 減少陰影模糊
                ctx.shadowColor = noteColor;
                
                ctx.beginPath();
                ctx.arc(noteX, noteY, noteRippleRadius, 0, Math.PI * 2);
                ctx.stroke();
            }
            
            // 音符核心
            ctx.fillStyle = applyAlphaToColor(noteColor, noteIntensity * 1.0);
            ctx.shadowBlur = 15; // 減少陰影
            ctx.shadowColor = noteColor;
            
            ctx.beginPath();
            ctx.arc(noteX, noteY, noteSize, 0, Math.PI * 2);
            ctx.fill();
            
            // 簡化音符光暈
            ctx.shadowBlur = 20;
            ctx.fillStyle = applyAlphaToColor(noteColor, noteIntensity * 0.2);
            ctx.beginPath();
            ctx.arc(noteX, noteY, noteSize * 1.3, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // 4. 優化頻率觸鬚 - Optimized Frequency "Tendrils"
    const spikes = 90; // 減少觸鬚數量從180到90
    const spikeBaseRadius = Math.min(width, height) * 0.12;
    
    for (let i = 0; i < spikes; i++) {
        const dataIndex = Math.floor((i / spikes) * (dataArray.length * 0.5));
        const spikeHeight = Math.pow(dataArray[dataIndex] / 255, 1.5) * 120 * sensitivity; // 減少高度計算複雜度
        if (spikeHeight < 2) continue; // 提高閾值
        
        const angle = (i / spikes) * Math.PI * 2;
        const x1 = centerX + Math.cos(angle) * spikeBaseRadius;
        const y1 = centerY + Math.sin(angle) * spikeBaseRadius;
        const x2 = centerX + Math.cos(angle) * (spikeBaseRadius + spikeHeight);
        const y2 = centerY + Math.sin(angle) * (spikeBaseRadius + spikeHeight);
        
        // 簡化控制點計算
        const controlPointRadius = spikeBaseRadius + spikeHeight / 2;
        const swirlAmount = (spikeHeight / 15) + Math.sin(frame * 0.03 + i * 0.05) * 8; // 減少計算複雜度
        const controlX = centerX + Math.cos(angle) * controlPointRadius;
        const controlY = centerY + Math.sin(angle) * controlPointRadius + Math.sin(frame * 0.03 + i * 0.05) * swirlAmount;
        
        const drawCurve = () => {
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.quadraticCurveTo(controlX, controlY, x2, y2);
            ctx.stroke();
        };

        if (waveformStroke) {
            ctx.save();
            ctx.lineWidth = 4; // 減少線條粗細
            ctx.strokeStyle = 'rgba(0,0,0,0.6)';
            ctx.shadowBlur = 0;
            ctx.shadowColor = 'transparent';
            drawCurve();
            ctx.restore();
        }

        ctx.strokeStyle = colors.primary;
        ctx.shadowColor = colors.primary;
        ctx.shadowBlur = 6; // 減少陰影模糊
        ctx.lineWidth = 3; // 減少線條粗細
        drawCurve();
        
        // 簡化尖端漣漪效果 - 只在特定條件下繪製
        if (spikeHeight > 60 && i % 30 === 0) { // 提高閾值和減少頻率
            const tipRippleRadius = Math.min(12, spikeHeight * 0.08);
            const tipRippleOpacity = (spikeHeight / 120) * 0.5;
            
            ctx.strokeStyle = applyAlphaToColor(colors.accent, tipRippleOpacity);
            ctx.lineWidth = 1.5;
            ctx.shadowBlur = 4;
            ctx.shadowColor = colors.accent;
            
            ctx.beginPath();
            ctx.arc(x2, y2, tipRippleRadius, 0, Math.PI * 2);
            ctx.stroke();
        }
    }
    ctx.restore(); // Restore from tendril shadow/glow effect
    
    // 5. 優化中央核心 - Optimized Central Core
    const coreRadius = Math.min(width, height) * 0.05 + normalizedBass * 40; // 減少核心大小
    const coreGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, coreRadius);
    coreGradient.addColorStop(0, colors.accent);
    coreGradient.addColorStop(0.4, colors.primary);
    coreGradient.addColorStop(1, 'rgba(0, 150, 200, 0)');
    
    ctx.shadowBlur = 30; // 減少核心陰影
    ctx.shadowColor = colors.primary;
    ctx.fillStyle = coreGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, coreRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // 簡化核心漣漪波動
    if (isBeat && Math.random() > 0.6) { // 只在40%的節拍時觸發
        const coreRippleCount = 3; // 減少從5到3
        for (let cr = 0; cr < coreRippleCount; cr++) {
            const coreRippleAge = (frame + cr * 15) % 60; // 簡化生命週期
            const coreRippleRadius = coreRadius + (coreRippleAge / 60) * 30;
            const coreRippleOpacity = Math.max(0, 1 - (coreRippleAge / 60)) * 0.6;
            
            if (coreRippleOpacity > 0.08) { // 提高閾值
                ctx.strokeStyle = applyAlphaToColor(colors.accent, coreRippleOpacity);
                ctx.lineWidth = 3; // 減少線條粗細
                ctx.shadowBlur = 15; // 減少陰影
                ctx.shadowColor = colors.accent;
                
                ctx.beginPath();
                ctx.arc(centerX, centerY, coreRippleRadius, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
    }
    
    // 簡化核心脈衝效果
    if (isBeat && Math.random() > 0.7) { // 只在30%的節拍時觸發
        const pulseCount = 2; // 減少從4到2
        for (let p = 0; p < pulseCount; p++) {
            const pulseAge = (frame + p * 25) % 50; // 簡化生命週期
            const pulseRadius = coreRadius + (pulseAge / 50) * 40;
            const pulseOpacity = Math.max(0, 1 - (pulseAge / 50)) * 0.5;
            
            if (pulseOpacity > 0.08) { // 提高閾值
                ctx.strokeStyle = applyAlphaToColor(colors.accent, pulseOpacity);
                ctx.lineWidth = 4; // 減少線條粗細
                ctx.shadowBlur = 20; // 減少陰影模糊
                ctx.shadowColor = colors.accent;
                
                ctx.beginPath();
                ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
                ctx.stroke();
            }
        }
    }
    
    ctx.restore();
};

const drawWaterRipple = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array | null, width: number, height: number, frame: number, sensitivity: number, colors: Palette, graphicEffect: GraphicEffectType, isBeat?: boolean, waveformStroke?: boolean) => {
    if (!dataArray) return;
    ctx.save();
    const centerX = width / 2;
    const centerY = height / 2;
    
    // 分析音频数据
    const bass = dataArray.slice(0, 32).reduce((a, b) => a + b, 0) / 32;
    const mid = dataArray.slice(32, 128).reduce((a, b) => a + b, 0) / 96;
    const treble = dataArray.slice(128, 256).reduce((a, b) => a + b, 0) / 128;
    
    const normalizedBass = bass / 255;
    const normalizedMid = mid / 255;
    const normalizedTreble = treble / 255;
    
    // 水波涟漪效果
    const rippleCount = 5; // 涟漪层数
    const maxRippleRadius = Math.min(width, height) * 0.45;
    
    for (let layer = 0; layer < rippleCount; layer++) {
        const rippleAge = (frame + layer * 15) % 100; // 涟漪生命周期
        const rippleRadius = (rippleAge / 100) * maxRippleRadius;
        const rippleOpacity = Math.max(0, 1 - (rippleAge / 100)) * 0.7;
        
        if (rippleOpacity > 0.05) {
            // 根据音频强度调整涟漪颜色和强度
            const audioIntensity = (normalizedBass * 0.5 + normalizedMid * 0.3 + normalizedTreble * 0.2) * sensitivity;
            const rippleColor = isBeat ? colors.accent : colors.primary;
            
            ctx.strokeStyle = applyAlphaToColor(rippleColor, rippleOpacity * audioIntensity);
            ctx.lineWidth = Math.max(1, 4 - layer * 0.6);
            ctx.shadowBlur = 20;
            ctx.shadowColor = rippleColor;
            
            // 绘制涟漪圆圈
            ctx.beginPath();
            ctx.arc(centerX, centerY, rippleRadius, 0, Math.PI * 2);
            ctx.stroke();
            
            // 添加涟漪波动效果
            if (layer === 0 && isBeat) {
                const waveCount = 12;
                for (let wave = 0; wave < waveCount; wave++) {
                    const waveAngle = (wave / waveCount) * Math.PI * 2;
                    const waveRadius = rippleRadius + Math.sin(frame * 0.15 + wave) * 8;
                    const waveX = centerX + Math.cos(waveAngle) * waveRadius;
                    const waveY = centerY + Math.sin(waveAngle) * waveRadius;
                    
                    ctx.beginPath();
                    ctx.arc(waveX, waveY, 3, 0, Math.PI * 2);
                    ctx.fillStyle = applyAlphaToColor(rippleColor, rippleOpacity * 0.9);
                    ctx.fill();
                }
            }
        }
    }
    
    // 中心水波纹
    const centerRippleRadius = Math.min(width, height) * 0.08 + normalizedBass * 40;
    const centerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, centerRippleRadius);
    centerGradient.addColorStop(0, colors.accent);
    centerGradient.addColorStop(0.4, colors.primary);
    centerGradient.addColorStop(1, 'rgba(0, 150, 200, 0)');
    
    ctx.shadowBlur = 50;
    ctx.shadowColor = colors.primary;
    ctx.fillStyle = centerGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, centerRippleRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // 添加音符涟漪
    const noteCount = 8;
    for (let i = 0; i < noteCount; i++) {
        const noteAngle = (i / noteCount) * Math.PI * 2 + frame * 0.02;
        const noteRadius = Math.min(width, height) * 0.25;
        const noteX = centerX + Math.cos(noteAngle) * noteRadius;
        const noteY = centerY + Math.sin(noteAngle) * noteRadius;
        
        const noteIntensity = dataArray[Math.floor((i / noteCount) * dataArray.length)] / 255;
        if (noteIntensity > 0.1) {
            const noteSize = noteIntensity * 20 * sensitivity;
            const noteColor = colors.secondary;
            
            ctx.fillStyle = applyAlphaToColor(noteColor, noteIntensity * 0.8);
            ctx.shadowBlur = 15;
            ctx.shadowColor = noteColor;
            
            ctx.beginPath();
            ctx.arc(noteX, noteY, noteSize, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    ctx.restore();
};

const drawRadialBars = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array | null, width: number, height: number, frame: number, sensitivity: number, colors: Palette, graphicEffect: GraphicEffectType, isBeat?: boolean, waveformStroke?: boolean) => {
    if (!dataArray) return;
    ctx.save();
    const centerX = width / 2;
    const centerY = height / 2;
    
    const innerRadius = Math.min(width, height) * 0.22;
    const outerRadius = innerRadius + (width * 0.015);

    const drawSpikes = (radius: number, spikes: number, maxHeight: number, dataStart: number, dataEnd: number, direction: number, mainLineWidth: number) => {
        const color = isBeat ? colors.accent : colors.primary;
        
        for (let i = 0; i < spikes; i++) {
            const dataIndex = Math.floor(dataStart + (i / spikes) * (dataEnd - dataStart));
            const spikeHeight = Math.pow(dataArray[dataIndex] / 255, 2) * maxHeight * sensitivity;
            if (spikeHeight < 1) continue;
            
            const angle = (i / spikes) * Math.PI * 2 - Math.PI / 2;
            const x1 = centerX + Math.cos(angle) * radius;
            const y1 = centerY + Math.sin(angle) * radius;
            const x2 = centerX + Math.cos(angle) * (radius + spikeHeight * direction);
            const y2 = centerY + Math.sin(angle) * (radius + spikeHeight * direction);

            const drawLine = () => {
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
            };

            if (waveformStroke) {
                ctx.save();
                ctx.strokeStyle = 'rgba(0,0,0,0.7)';
                ctx.lineWidth = mainLineWidth + 2;
                ctx.shadowBlur = 0;
                ctx.shadowColor = 'transparent';
                drawLine();
                ctx.restore();
            }

            ctx.strokeStyle = color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = color;
            ctx.lineWidth = mainLineWidth;
            drawLine();
        }
    };

    // Inner Circle (Bass spikes pointing INWARDS)
    drawSpikes(innerRadius, 128, Math.min(width, height) * 0.08, 0, 64, -1, 2);
    // Outer Circle (Treble spikes pointing OUTWARDS)
    drawSpikes(outerRadius, 128, Math.min(width, height) * 0.28, 100, dataArray.length / 4, 1, 2);

    ctx.restore();
};
const drawParticleGalaxy = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array | null, width: number, height: number, frame: number, sensitivity: number, colors: Palette, graphicEffect: GraphicEffectType, isBeat?: boolean, waveformStroke?: boolean) => {
    if (!dataArray) return;
    ctx.save();
    
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Audio-reactive parameters
    const bass = dataArray.slice(0, 32).reduce((a, b) => a + b, 0) / 32;
    const mid = dataArray.slice(32, 96).reduce((a, b) => a + b, 0) / 64;
    const treble = dataArray.slice(96, 128).reduce((a, b) => a + b, 0) / 32;
    
    const normalizedBass = bass / 255;
    const normalizedMid = mid / 255;
    const normalizedTreble = treble / 255;
    
    // 移除背景，让背景透明
    // 不再填充深空蓝色背景
    // 不再绘制星云背景
    
    // 定义星系半径（用于计算螺旋臂和小行星带）
    const nebulaRadius = Math.min(width, height) * 0.6;
    
    // Draw simplified spiral arms (reduced from 4 to 2)
    const numArms = 2;
    const armLength = nebulaRadius * 0.5;
    
    for (let arm = 0; arm < numArms; arm++) {
        const armAngle = (arm / numArms) * Math.PI * 2 + frame * 0.003;
        const armColor = arm % 2 === 0 ? colors.primary : colors.secondary;
        
        // Draw spiral arm with fewer stars (reduced from 50 to 25)
        for (let i = 0; i < 25; i++) {
            const t = i / 25;
            const radius = t * armLength;
            const spiralAngle = armAngle + t * 1.5 * Math.PI + Math.sin(t * Math.PI * 3) * 0.2;
            
            const x = centerX + radius * Math.cos(spiralAngle);
            const y = centerY + radius * Math.sin(spiralAngle);
            
            const starSize = (1 - t) * 2.5 + normalizedBass * 1.5 * sensitivity;
            const starOpacity = (1 - t) * 0.7 + normalizedMid * 0.2;
            
            if (starSize > 0.5) {
                ctx.fillStyle = applyAlphaToColor(armColor, starOpacity);
                ctx.shadowColor = armColor;
                ctx.shadowBlur = starSize * 1.5;
        ctx.beginPath();
                ctx.arc(x, y, starSize, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }
    
    // Draw simplified asteroid belt (reduced count)
    const beltRadius = nebulaRadius * 0.35;
    const beltWidth = 15;
    const asteroidCount = 40 + normalizedTreble * 20 * sensitivity; // Reduced from 100+50
    
    for (let i = 0; i < asteroidCount; i++) {
        const angle = (i / asteroidCount) * Math.PI * 2 + frame * 0.001;
        const radius = beltRadius + (Math.random() - 0.5) * beltWidth;
            const x = centerX + radius * Math.cos(angle);
            const y = centerY + radius * Math.sin(angle);
            
        const asteroidSize = 0.8 + Math.random() * 1.5;
        const asteroidOpacity = 0.5 + normalizedMid * 0.3;
        
        ctx.fillStyle = applyAlphaToColor(colors.accent, asteroidOpacity);
        ctx.beginPath();
        ctx.arc(x, y, asteroidSize, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Draw solar system planets (reduced from 3 to 2 main planets + sun)
    const planetCount = 2;
    for (let i = 0; i < planetCount; i++) {
        const planetAngle = (i / planetCount) * Math.PI * 2 + frame * 0.008;
        const planetRadius = 60 + i * 50; // More realistic spacing
        const planetX = centerX + Math.cos(planetAngle) * planetRadius;
        const planetY = centerY + Math.sin(planetAngle) * planetRadius;
        
        const planetSize = 12 + i * 3 + normalizedBass * 8 * sensitivity;
        const planetColor = i === 0 ? colors.primary : colors.secondary;
        
        // Planet body with more realistic appearance
        const planetGradient = ctx.createRadialGradient(planetX, planetY, 0, planetX, planetY, planetSize);
        planetGradient.addColorStop(0, applyAlphaToColor(planetColor, 0.9));
        planetGradient.addColorStop(0.6, applyAlphaToColor(planetColor, 0.7));
        planetGradient.addColorStop(1, applyAlphaToColor(planetColor, 0.4));
        
        ctx.fillStyle = planetGradient;
        ctx.shadowColor = planetColor;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(planetX, planetY, planetSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Planet rings (only for the outer planet)
        if (i === 1) {
            const ringRadius = planetSize * 1.8;
            ctx.strokeStyle = applyAlphaToColor(planetColor, 0.5);
            ctx.lineWidth = 1.5;
            ctx.setLineDash([8, 8]);
            ctx.beginPath();
            ctx.arc(planetX, planetY, ringRadius, 0, Math.PI * 2);
        ctx.stroke();
    }

        // Simplified moons (reduced count)
        const moonCount = i === 0 ? 1 : 2; // Inner planet 1 moon, outer planet 2 moons
        for (let j = 0; j < moonCount; j++) {
            const moonAngle = (j / moonCount) * Math.PI * 2 + frame * 0.015;
            const moonRadius = planetSize * 2.2;
            const moonX = planetX + Math.cos(moonAngle) * moonRadius;
            const moonY = planetY + Math.sin(moonAngle) * moonRadius;
            const moonSize = 2.5 + normalizedMid * 1.5 * sensitivity;
            
            ctx.fillStyle = applyAlphaToColor(colors.accent, 0.7);
            ctx.beginPath();
            ctx.arc(moonX, moonY, moonSize, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // Draw central sun (replacing black hole)
    const sunRadius = 25 + normalizedBass * 20 * sensitivity;
    
    // Sun glow
    const sunGlowGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, sunRadius * 2);
    sunGlowGradient.addColorStop(0, applyAlphaToColor('#FFFF00', 0.3)); // Yellow glow
    sunGlowGradient.addColorStop(0.5, applyAlphaToColor('#FF8800', 0.2)); // Orange glow
    sunGlowGradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = sunGlowGradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, sunRadius * 2, 0, Math.PI * 2);
    ctx.fill();
    
    // Sun core
    const sunGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, sunRadius);
    sunGradient.addColorStop(0, '#FFFFFF'); // White center
    sunGradient.addColorStop(0.3, '#FFFF00'); // Yellow
    sunGradient.addColorStop(0.7, '#FF8800'); // Orange
    sunGradient.addColorStop(1, '#FF4400'); // Red-orange
    
    ctx.fillStyle = sunGradient;
    ctx.shadowColor = '#FFFF00';
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(centerX, centerY, sunRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Sun energy waves
    const waveCount = 3; // Reduced from 5
    for (let i = 0; i < waveCount; i++) {
        const waveRadius = sunRadius * 1.5 + i * 12 + normalizedBass * 15 * sensitivity;
        const waveOpacity = 0.25 - i * 0.08;
        
        ctx.strokeStyle = applyAlphaToColor('#FFFF00', waveOpacity);
        ctx.lineWidth = 1.5;
        ctx.setLineDash([8, 8]);
        
        ctx.beginPath();
        ctx.arc(centerX, centerY, waveRadius, 0, Math.PI * 2);
        ctx.stroke();
    }
    ctx.setLineDash([]);
    
    // Draw rare shooting star (only one, appears occasionally)
    if (Math.random() > 0.995) { // Very rare - about 0.5% chance per frame
        const startX = Math.random() * width;
        const startY = Math.random() * height;
        const endX = startX + (Math.random() - 0.5) * 150;
        const endY = startY + (Math.random() - 0.5) * 150;
        
        const trailLength = 25 + normalizedTreble * 15 * sensitivity;
        
        // Main shooting star line
        ctx.strokeStyle = applyAlphaToColor('#FFFFFF', 0.9);
        ctx.lineWidth = 2.5;
        ctx.lineCap = 'round';
        ctx.shadowColor = '#FFFFFF';
        ctx.shadowBlur = 8;
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
        
        // Shooting star trail
        ctx.strokeStyle = applyAlphaToColor('#FFFFFF', 0.4);
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(startX - (endX - startX) * 0.25, startY - (endY - startY) * 0.25);
        ctx.stroke();
        
        // Shooting star glow effect
        ctx.fillStyle = applyAlphaToColor('#FFFFFF', 0.3);
        ctx.beginPath();
        ctx.arc(startX, startY, 3, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Draw minimal cosmic dust (reduced count)
    const dustCount = 80 + normalizedMid * 40 * sensitivity; // Reduced from 200+100
    for (let i = 0; i < dustCount; i++) {
        const x = (i * 47) % width; // Changed pattern for better distribution
        const y = (i * 79) % height;
        const dustSize = 0.4 + Math.random() * 0.8;
        const dustOpacity = 0.25 + Math.random() * 0.3;
        
        ctx.fillStyle = applyAlphaToColor(colors.accent, dustOpacity);
        ctx.beginPath();
        ctx.arc(x, y, dustSize, 0, Math.PI * 2);
        ctx.fill();
    }

    ctx.restore();
};
const drawLiquidMetal = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array | null, width: number, height: number, frame: number, sensitivity: number, colors: Palette, graphicEffect: GraphicEffectType, isBeat?: boolean) => {
    if (!dataArray) return;
    ctx.save();
    
    const centerX = width / 2;
    const centerY = height / 2;
    
    // 優化的音頻分析 - 減少計算複雜度
    const bass = dataArray.slice(0, 16).reduce((a, b) => a + b, 0) / 16;
    const mid = dataArray.slice(16, 64).reduce((a, b) => a + b, 0) / 48;
    const treble = dataArray.slice(64, 128).reduce((a, b) => a + b, 0) / 64;
    
    const normalizedBass = bass / 255;
    const normalizedMid = mid / 255;
    const normalizedTreble = treble / 255;
    
    // 貝茲花園特效 - 優化性能
    const numPetals = 6 + Math.floor(normalizedMid * 2 * sensitivity); // 減少花瓣數量
    const basePetalLength = Math.min(width, height) * 0.15;
    const petalLength = basePetalLength + normalizedBass * 80 * sensitivity; // 減少響應範圍
    
    // 繪製優化的貝茲曲線花瓣
    for (let i = 0; i < numPetals; i++) {
        const petalAngle = (i / numPetals) * Math.PI * 2 + frame * 0.008; // 減慢旋轉速度
        const petalColor = i % 2 === 0 ? colors.primary : colors.secondary;
        
        // 簡化的花瓣定位
        const startX = centerX + Math.cos(petalAngle) * 15;
        const startY = centerY + Math.sin(petalAngle) * 15;
        const endX = centerX + Math.cos(petalAngle) * petalLength;
        const endY = centerY + Math.sin(petalAngle) * petalLength;
        
        // 優化的控制點計算
        const control1X = startX + Math.cos(petalAngle + 0.2) * petalLength * 0.4;
        const control1Y = startY + Math.sin(petalAngle + 0.2) * petalLength * 0.4;
        const control2X = startX + Math.cos(petalAngle - 0.2) * petalLength * 0.4;
        const control2Y = startY + Math.sin(petalAngle - 0.2) * petalLength * 0.4;
        
        // 簡化的花瓣寬度
        const petalWidth = 4 + normalizedMid * 6 * sensitivity;
        
        // 優化的花瓣漸變
        const petalGradient = ctx.createLinearGradient(startX, startY, endX, endY);
        petalGradient.addColorStop(0, applyAlphaToColor(petalColor, 0.8));
        petalGradient.addColorStop(0.5, applyAlphaToColor(petalColor, 0.6));
        petalGradient.addColorStop(1, applyAlphaToColor(petalColor, 0.3));
        
        ctx.strokeStyle = petalGradient;
        ctx.lineWidth = petalWidth;
        ctx.lineCap = 'round';
        ctx.shadowColor = petalColor;
        ctx.shadowBlur = 8 + normalizedBass * 8 * sensitivity; // 減少陰影模糊
        
        // 繪製貝茲曲線花瓣
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.bezierCurveTo(control1X, control1Y, control2X, control2Y, endX, endY);
        ctx.stroke();
    }
    
    // 優化的中央花蕊
    const coreRadius = 20 + normalizedBass * 40 * sensitivity;
    
    const coreGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, coreRadius);
    coreGradient.addColorStop(0, colors.accent);
    coreGradient.addColorStop(0.6, colors.primary);
    coreGradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = coreGradient;
    ctx.shadowColor = colors.accent;
    ctx.shadowBlur = 15 + normalizedBass * 10 * sensitivity; // 減少陰影模糊
    ctx.beginPath();
    ctx.arc(centerX, centerY, coreRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // 簡化的能量環
    const numRings = 2 + Math.floor(normalizedMid * sensitivity); // 減少環數
    for (let i = 0; i < numRings; i++) {
        const ringRadius = coreRadius + 20 + i * 15 + normalizedBass * 20 * sensitivity;
        const rotationSpeed = frame * (0.015 + i * 0.008); // 減慢旋轉速度
        const ringOpacity = 0.5 - i * 0.2 + normalizedTreble * 0.1;
        
        ctx.strokeStyle = applyAlphaToColor(colors.accent, ringOpacity);
        ctx.lineWidth = 2 + normalizedMid * sensitivity;
        ctx.setLineDash([10, 10]);
        
        // 簡化的環形分段
        const segments = 4 + Math.floor(normalizedMid * 2 * sensitivity);
        for (let j = 0; j < segments; j++) {
            const startAngle = (j / segments) * Math.PI * 2 + rotationSpeed;
            const endAngle = ((j + 1) / segments) * Math.PI * 2 + rotationSpeed;
            
            ctx.beginPath();
            ctx.arc(centerX, centerY, ringRadius, startAngle, endAngle);
            ctx.stroke();
        }
    }
    ctx.setLineDash([]);
    
    // 簡化的粒子效果
    const particleCount = 8 + normalizedTreble * 20 * sensitivity; // 減少粒子數量
    for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2 + frame * 0.003; // 減慢旋轉速度
        const radius = 60 + Math.sin(frame * 0.02 + i * 0.1) * 30 + normalizedBass * 20 * sensitivity;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        const particleSize = 2 + normalizedMid * 4 * sensitivity;
        const particleOpacity = 0.6 + normalizedTreble * 0.2;
        
        // 簡化的粒子漸變
        const particleGradient = ctx.createRadialGradient(x, y, 0, x, y, particleSize);
        particleGradient.addColorStop(0, colors.accent);
        particleGradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = particleGradient;
        ctx.shadowColor = colors.accent;
        ctx.shadowBlur = 8 + normalizedMid * 5 * sensitivity; // 減少陰影模糊
        ctx.beginPath();
        ctx.arc(x, y, particleSize, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // 簡化的節拍效果
    if (isBeat && Math.random() > 0.6) { // 只在40%的節拍時觸發
        ctx.fillStyle = applyAlphaToColor(colors.primary, 0.2);
        ctx.beginPath();
        ctx.arc(centerX, centerY, coreRadius * 1.5, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.restore();
};

const drawGlitchWave = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array | null, width: number, height: number, frame: number, sensitivity: number, colors: Palette, graphicEffect: GraphicEffectType, isBeat?: boolean, waveformStroke?: boolean) => {
    if (!dataArray) return;
    ctx.save();
    
    const centerY = height / 2;

    const wavePath = new Path2D();
    const sliceWidth = width / (dataArray.length * 0.5);
    let x = 0;
     for (let i = 0; i < dataArray.length * 0.5; i++) {
        const amp = Math.pow(dataArray[i] / 255, 1.5) * height * 0.3 * sensitivity;
        const y = centerY + amp;
        if (i === 0) {
            wavePath.moveTo(x, y);
        } else {
            wavePath.lineTo(x, y);
        }
        x += sliceWidth;
    }
    
    if (waveformStroke) {
        ctx.save();
        ctx.strokeStyle = 'rgba(0,0,0,0.7)';
        ctx.lineWidth = 4.5;
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';
        ctx.stroke(wavePath);
        ctx.restore();
        
        ctx.strokeStyle = colors.primary;
        ctx.lineWidth = 2.5;
        ctx.shadowColor = colors.primary;
        ctx.shadowBlur = 10;
        ctx.stroke(wavePath);
    }

    // Add classic scanlines for the retro feel (further reduced frequency)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'; // Reduced opacity from 0.15 to 0.1
    for (let i = 0; i < height; i += 12) { // Increased from 6 to 12 - reduced frequency by another 50%
        ctx.fillRect(0, i, width, 1);
    }
    
    // The key "wave" effect: horizontal slipping on beat (reduced frequency)
    if (isBeat && Math.random() > 0.6) { // Only 40% chance on beat
        const numSlices = Math.floor(Math.random() * 3) + 1; // Reduced from 3-7 to 1-3 slices
        for (let i = 0; i < numSlices; i++) {
            const sy = Math.random() * height;
            const sh = (Math.random() * height) / 15 + 3; // Reduced height
            const sx = 0;
            const sw = width;
            const dx = (Math.random() - 0.5) * 25; // Reduced displacement from 50 to 25
            const dy = sy;
            try {
               ctx.drawImage(ctx.canvas, sx, sy, sw, sh, dx, dy, sw, sh);
            } catch(e) { /* ignored, can happen on cross-origin canvas */ }
        }
    }
    
    ctx.restore();
};


const drawCrtGlitch = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array | null, width: number, height: number, frame: number, sensitivity: number, colors: Palette, graphicEffect: GraphicEffectType, isBeat?: boolean, waveformStroke?: boolean) => {
    if (!dataArray) return;
    ctx.save();
    
    // Removed screen shake for better viewing experience
    
    const centerY = height / 2;

    const drawWave = (color: string, offsetX = 0, offsetY = 0, customLineWidth?: number) => {
        ctx.strokeStyle = color;
        if(customLineWidth) ctx.lineWidth = customLineWidth;

        ctx.beginPath();
        const sliceWidth = width / (dataArray.length * 0.5);
        let x = 0;
        for (let i = 0; i < dataArray.length * 0.5; i++) {
            const amp = Math.pow(dataArray[i] / 255, 1.5) * height * 0.3 * sensitivity;
            const y = centerY + amp + offsetY;
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
            x += sliceWidth;
        }
        ctx.stroke();
    };

    ctx.globalCompositeOperation = 'source-over';
    
    if (waveformStroke) {
        // Modified effect: Dynamic Chromatic Aberration (reduced frequency)
        // Happens less frequently and with reduced intensity
        const isGlitching = isBeat && Math.random() > 0.5; // Only 50% chance on beat, no random glitching
        if (isGlitching) {
            ctx.globalCompositeOperation = 'lighter';
            const intensity = 6; // Reduced from 12 to 6
            drawWave('rgba(255, 0, 100, 0.5)', (Math.random() - 0.5) * intensity, 0, 2); // Magenta with reduced opacity
            drawWave('rgba(0, 255, 255, 0.5)', (Math.random() - 0.5) * intensity, 0, 2);  // Cyan with reduced opacity
        }
        
        ctx.globalCompositeOperation = 'source-over';
        
        ctx.save();
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';
        drawWave('rgba(0,0,0,0.7)', 0, 0, 4.5);
        ctx.restore();
        
        ctx.shadowColor = colors.primary;
        ctx.shadowBlur = 10;
        drawWave(colors.primary, 0, 0, 2.5);
    }

    // Original effect: Scanlines (reduced frequency)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)'; // Reduced opacity from 0.25 to 0.15
    for (let i = 0; i < height; i += 8) { // Increased from 4 to 8 - reduced frequency by 50%
        ctx.fillRect(0, i, width, 1); // Reduced height from 2 to 1
    }
    
    // Removed Vertical Roll effect for better viewing experience

    // Modified effect: Block Corruption (reduced frequency and intensity)
    if (isBeat && Math.random() > 0.7) { // Only 30% chance on beat
        const numBlocks = Math.floor(Math.random() * 2) + 1; // Reduced from 1-4 to 1-2 blocks
        for (let i = 0; i < numBlocks; i++) {
            const sx = Math.random() * width * 0.8;
            const sy = Math.random() * height * 0.8;
            const sw = Math.random() * width * 0.2 + 8; // Reduced width
            const sh = Math.random() * height * 0.08 + 3; // Reduced height
            const dx = sx + (Math.random() - 0.5) * 30; // Reduced displacement from 60 to 30
            const dy = sy + (Math.random() - 0.5) * 15; // Reduced displacement from 30 to 15
            try {
                // We draw from the canvas onto itself to create the glitch
                ctx.drawImage(ctx.canvas, sx, sy, sw, sh, dx, dy, sw, sh);
            } catch(e) { /* ignore */ }
        }
    }
    
    ctx.restore();
};

// 全局變量聲明
declare global {
    interface Window {
        photoShakeAmplitudes: number[];
    }
}

const drawPhotoShake = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array | null, width: number, height: number, frame: number, sensitivity: number, colors: Palette, graphicEffect: GraphicEffectType, isBeat?: boolean, waveformStroke?: boolean, props?: any) => {
    // 相片晃動不需要音頻數據也能顯示，移除這個限制
    ctx.save();
    
    const centerX = width / 2;
    const centerY = height / 2;
    
    // 相片晃動軌跡參數（只做位置晃動，不旋轉）- 移除鼓聲放大效果
    const shakeIntensity = 8; // 固定晃動強度，不因鼓聲變化
    const shakeSpeed = 0.015;
    const shakeX = Math.sin(frame * shakeSpeed) * shakeIntensity + Math.sin(frame * shakeSpeed * 1.3) * shakeIntensity * 0.5;
    const shakeY = Math.cos(frame * shakeSpeed * 0.8) * shakeIntensity + Math.sin(frame * shakeSpeed * 1.7) * shakeIntensity * 0.3;
    
    // 第一層：繪製背景圖片（使用原本的背景圖片功能）- 實現晃動效果
    if (props?.backgroundImage) {
        // 創建圖片對象並直接繪製（同步方式）
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = props.backgroundImage;
        
        // 如果圖片已經加載完成，直接繪製
        if (img.complete && img.naturalWidth > 0) {
            // 計算圖片尺寸，確保完全覆蓋畫布
            const imgAspect = img.naturalWidth / img.naturalHeight;
            const canvasAspect = width / height;
            
            let drawWidth, drawHeight;
            if (imgAspect > canvasAspect) {
                // 圖片更寬，以寬度為準
                drawWidth = width + shakeIntensity * 4; // 增加緩衝區
                drawHeight = drawWidth / imgAspect;
            } else {
                // 圖片更高，以高度為準
                drawHeight = height + shakeIntensity * 4; // 增加緩衝區
                drawWidth = drawHeight * imgAspect;
            }
            
            // 確保圖片完全覆蓋畫布
            if (drawWidth < width + shakeIntensity * 4) {
                drawWidth = width + shakeIntensity * 4;
                drawHeight = drawWidth / imgAspect;
            }
            if (drawHeight < height + shakeIntensity * 4) {
                drawHeight = height + shakeIntensity * 4;
                drawWidth = drawHeight * imgAspect;
            }
            
            // 計算繪製位置（居中 + 晃動，不旋轉）
            const drawX = centerX - drawWidth / 2 + shakeX;
            const drawY = centerY - drawHeight / 2 + shakeY;
            
            // 繪製圖片（保持正向，不旋轉）
            ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
        }
    }
    
    // 第二層：半透明背景 + 標題 + 向下可視化
    const overlayHeight = height * 0.4; // 改為40%
    const overlayY = centerY - overlayHeight / 2; // 中央位置
    
    // 繪製半透明背景（可調整透明度）
    // 修正透明度處理：使用 ?? 而不是 || 來避免0被當作falsy值
    const overlayOpacity = typeof props?.photoShakeOverlayOpacity === 'number' ? props.photoShakeOverlayOpacity : 0.4;
    ctx.fillStyle = `rgba(0, 0, 0, ${overlayOpacity})`;
    ctx.fillRect(0, overlayY, width, overlayHeight);
    
    // 繪製文字信息（按照正確順序，中央對齊）
    const songTitle = props?.photoShakeSongTitle || '歌曲名稱';
    const subtitle = props?.photoShakeSubtitle || '副標題';
    // 修正字體大小計算：直接使用像素值，確保文字可見
    const fontSizeValue = typeof props?.photoShakeFontSize === 'number' ? props.photoShakeFontSize : 60;
    const fontSize = fontSizeValue; // 直接使用像素值，20-150px
    
    // 1. 主標題（在中央上方）- 白色描邊偽3D效果
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    const actualFontSize = fontSize; // 直接使用像素值
    ctx.font = `bold ${actualFontSize}px "${FONT_MAP[props?.photoShakeFontFamily || FontType.POPPINS]}", "Noto Sans TC", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // 描邊
    ctx.strokeText(songTitle, centerX, overlayY + overlayHeight * 0.15);
    // 主體
    ctx.fillText(songTitle, centerX, overlayY + overlayHeight * 0.15);
    
    // 偽3D效果 - 陰影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillText(songTitle, centerX + 2, overlayY + overlayHeight * 0.15 + 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(songTitle, centerX, overlayY + overlayHeight * 0.15);
    
    // 2. 副標題（在主標題下方）- 白色描邊偽3D效果
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.font = `${fontSize * 0.6}px "${FONT_MAP[props?.photoShakeFontFamily || FontType.POPPINS]}", "Noto Sans TC", sans-serif`;
    
    // 描邊
    ctx.strokeText(subtitle, centerX, overlayY + overlayHeight * 0.45);
    // 主體
    ctx.fillText(subtitle, centerX, overlayY + overlayHeight * 0.45);
    
    // 偽3D效果 - 陰影
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillText(subtitle, centerX + 1, overlayY + overlayHeight * 0.45 + 1);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText(subtitle, centerX, overlayY + overlayHeight * 0.45);
    
    // 3. 向下柱狀音訊可視化（在副標題下方）- 左右長度40%
    const barWidth = 6;
    const barSpacing = 3;
    const maxBarHeight = overlayHeight * 0.3; // 可視化高度為上層的30%
    const visualizerWidth = width * 0.4; // 左右長度40%
    const numBars = Math.floor(visualizerWidth / (barWidth + barSpacing));
    const startX = centerX - visualizerWidth / 2; // 從中央開始
    const baselineY = overlayY + overlayHeight * 0.7; // 基準線位置
    
    // 震幅恢復系統 - 使用全局變量避免props修改
    const decaySpeed = props?.photoShakeDecaySpeed || 0.95;
    if (!window.photoShakeAmplitudes) {
        window.photoShakeAmplitudes = new Array(numBars).fill(0);
    }
    
    // 繪製預設線條（基準線）
    ctx.strokeStyle = colors.primary || '#67E8F9';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(startX, baselineY);
    ctx.lineTo(startX + visualizerWidth, baselineY);
    ctx.stroke();
    
    // 繪製向下音訊柱狀圖 - 每根柱子獨立頻段（動態對稱）
    const dataSliceLength = dataArray ? Math.min(dataArray.length * 0.8, numBars) : numBars;
    const halfBars = Math.floor(numBars / 2); // 左半部分
    
    const leftHeights: number[] = [];
    
    // 使用重低音強化的音頻抓取方式（完全一樣的邏輯）
    const getSample = (t: number, bandStart: number, bandEnd: number) => {
        if (!dataArray) return 0;
        const len = dataArray.length;
        const s = Math.max(0, Math.min(len - 1, Math.floor(bandStart * len)));
        const e = Math.max(s + 1, Math.min(len, Math.floor(bandEnd * len)));
        const idx = s + Math.floor(t * (e - s - 1));
        return dataArray[idx] / 255;
    };
    
    // 為左半的每一根柱子計算獨立響應（完全照搬重低音強化）
    for (let i = 0; i < halfBars; i++) {
        const t = i / (halfBars - 1); // 0 到 1
        
        // 完全按照重低音強化的方式：取低頻到中低頻
        const v = getSample(t, 0.05, 0.35);
        const amp = Math.max(0, v - 0.2); // 提高靈敏度
        const h = Math.pow(amp, 1.2) * maxBarHeight * sensitivity * 2.4;
        
        leftHeights.push(h);
    }
    
    // 繪製左半
    for (let i = 0; i < halfBars; i++) {
        const x = startX + i * (barWidth + barSpacing);
        const barHeight = leftHeights[i];
        
        if (barHeight > 0) {
            // 使用顏色主題
            let barColor: string;
            let shadowColor: string;
            
            if (colors.name === ColorPaletteType.RAINBOW) {
                // 彩虹主題：根據位置動態計算顏色
                const [startHue, endHue] = colors.hueRange;
                const hueRangeSpan = endHue - startHue;
                const hue = startHue + (i / halfBars) * hueRangeSpan;
                barColor = `hsl(${hue}, 70%, 60%)`;
                shadowColor = `hsl(${hue}, 80%, 70%)`;
            } else {
                // 使用主題顏色
                barColor = colors.primary || '#FFFFFF';
                shadowColor = colors.accent || colors.primary || '#FFFFFF';
            }
            
            const gradient = ctx.createLinearGradient(x, baselineY, x, baselineY + barHeight);
            if (colors.name === ColorPaletteType.RAINBOW) {
                const [startHue, endHue] = colors.hueRange;
                const hueRangeSpan = endHue - startHue;
                const hue1 = startHue + (i / halfBars) * hueRangeSpan;
                const hue2 = startHue + ((i + 0.5) / halfBars) * hueRangeSpan;
                gradient.addColorStop(0, `hsl(${hue1}, 80%, 70%)`);
                gradient.addColorStop(0.5, `hsl(${hue1}, 70%, 60%)`);
                gradient.addColorStop(1, `hsl(${hue1}, 60%, 50%)`);
            } else {
                gradient.addColorStop(0, shadowColor);
                gradient.addColorStop(0.5, barColor);
                gradient.addColorStop(1, barColor);
            }
            
            ctx.fillStyle = gradient;
            ctx.shadowColor = shadowColor;
            ctx.shadowBlur = 8;
            ctx.fillRect(x, baselineY, barWidth, barHeight);
            ctx.shadowBlur = 0;
            ctx.shadowColor = 'transparent';
        }
    }
    
    // 鏡像繪製右半：完全對稱（包括最右邊）
    for (let i = 0; i <= halfBars; i++) {
        const mirrorIndex = halfBars - 1 - i; // 鏡像索引
        const barHeight = leftHeights[Math.max(0, mirrorIndex)]; // 確保索引有效
        const x = startX + (halfBars + i) * (barWidth + barSpacing);
        
        // 確保不超出可視化範圍
        if (x + barWidth <= startX + visualizerWidth && barHeight > 0) {
            // 使用顏色主題（與左半對稱）
            const barIndex = halfBars + i; // 完整的索引
            
            let barColor: string;
            let shadowColor: string;
            
            if (colors.name === ColorPaletteType.RAINBOW) {
                // 彩虹主題：根據位置動態計算顏色
                const [startHue, endHue] = colors.hueRange;
                const hueRangeSpan = endHue - startHue;
                const hue = startHue + (barIndex / numBars) * hueRangeSpan;
                barColor = `hsl(${hue}, 70%, 60%)`;
                shadowColor = `hsl(${hue}, 80%, 70%)`;
            } else {
                // 使用主題顏色
                barColor = colors.primary || '#FFFFFF';
                shadowColor = colors.accent || colors.primary || '#FFFFFF';
            }
            
            const gradient = ctx.createLinearGradient(x, baselineY, x, baselineY + barHeight);
            if (colors.name === ColorPaletteType.RAINBOW) {
                const [startHue, endHue] = colors.hueRange;
                const hueRangeSpan = endHue - startHue;
                const hue = startHue + (barIndex / numBars) * hueRangeSpan;
                gradient.addColorStop(0, `hsl(${hue}, 80%, 70%)`);
                gradient.addColorStop(0.5, `hsl(${hue}, 70%, 60%)`);
                gradient.addColorStop(1, `hsl(${hue}, 60%, 50%)`);
            } else {
                gradient.addColorStop(0, shadowColor);
                gradient.addColorStop(0.5, barColor);
                gradient.addColorStop(1, barColor);
            }
            
            ctx.fillStyle = gradient;
            ctx.shadowColor = shadowColor;
            ctx.shadowBlur = 8;
            ctx.fillRect(x, baselineY, barWidth, barHeight);
            ctx.shadowBlur = 0;
            ctx.shadowColor = 'transparent';
        }
    }
    
    // 重置陰影
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
    
    ctx.restore();
};

const drawCircularWave = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array | null, width: number, height: number, frame: number, sensitivity: number, colors: Palette, graphicEffect: GraphicEffectType, isBeat?: boolean, waveformStroke?: boolean, props?: any) => {
    ctx.save();
    
    const centerX = width / 2;
    const centerY = height / 2;
    const circleRadius = Math.min(width, height) * 0.25; // 圓形半徑
    
    // 1. 繪製中間的圓形圖片（從背景圖裁切，不旋轉）
    if (props?.circularWaveImage) {
        const img = getOrCreateCachedImage('circularWave', props.circularWaveImage);
        if (img && img.complete && img.naturalWidth > 0) {
            // 設置裁剪區域為圓形
            ctx.save();
            ctx.beginPath();
            ctx.arc(centerX, centerY, circleRadius, 0, Math.PI * 2);
            ctx.clip();
            
            // 計算圖片尺寸，確保完全覆蓋圓形區域（自動處理方形和長方形）
            const imgAspect = img.naturalWidth / img.naturalHeight;
            const drawSize = circleRadius * 2;
            let drawWidth = drawSize;
            let drawHeight = drawSize;
            
            // 根據圖片寬高比調整尺寸，確保完全覆蓋圓形
            if (imgAspect > 1) {
                // 圖片更寬（橫向長方形）：以高度為準，寬度增加
                drawHeight = drawSize;
                drawWidth = drawSize * imgAspect;
            } else if (imgAspect < 1) {
                // 圖片更高（縱向長方形）：以寬度為準，高度增加
                drawWidth = drawSize;
                drawHeight = drawSize / imgAspect;
            } else {
                // 方形圖片：直接使用圓形直徑
                drawWidth = drawSize;
                drawHeight = drawSize;
            }
            
            // 居中繪製圖片（會自動裁切成圓形）
            ctx.drawImage(img, centerX - drawWidth / 2, centerY - drawHeight / 2, drawWidth, drawHeight);
            ctx.restore();
        }
    }
    
    // 2. 四組1/4圓的線條可視化（逆時針旋轉30度）
    const rotationAngle = -30 * Math.PI / 180; // 逆時針30度
    
    const numLines = 15; // 每組1/4圓的線條數量（60的1/4）
    const maxLineLength = circleRadius * 0.3 * 10; // 最大線條長度（增加10倍）
    const lineWidth = 5; // 加粗線條（從2改為5）
    const minLineLength = circleRadius * 0.02; // 最小線條長度（無音訊時顯示小點）
    const minDotSize = 3; // 無音訊時顯示的小點大小
    
    // 音頻取樣函數
    const getSample = (t: number, bandStart: number, bandEnd: number) => {
        if (!dataArray) return 0;
        const len = dataArray.length;
        const s = Math.max(0, Math.min(len - 1, Math.floor(bandStart * len)));
        const e = Math.max(s + 1, Math.min(len, Math.floor(bandEnd * len)));
        const idx = s + Math.floor(t * (e - s - 1));
        return dataArray[idx] / 255;
    };
    
    ctx.strokeStyle = colors.primary || '#FFFFFF';
    ctx.lineWidth = lineWidth;
    ctx.shadowColor = colors.accent || colors.primary || '#FFFFFF';
    ctx.shadowBlur = 8;
    
    // 獲取顏色函數（支援彩虹主題）
    const getColor = (index: number, total: number) => {
        if (colors.name === ColorPaletteType.RAINBOW) {
            const hue = (index / total) * 360;
            return `hsl(${hue}, 90%, 60%)`;
        } else if (colors.name === ColorPaletteType.WHITE) {
            return '#FFFFFF';
        } else {
            return colors.primary || '#FFFFFF';
        }
    };
    
    const getShadowColor = (index: number, total: number) => {
        if (colors.name === ColorPaletteType.RAINBOW) {
            const hue = (index / total) * 360;
            return `hsl(${hue}, 100%, 80%)`;
        } else {
            return colors.accent || colors.primary || '#FFFFFF';
        }
    };
    
    // 先計算所有象限的線條長度（用於鏡像）
    // 象限1（右上，-π/2 到 0）作為基準
    const quadrant1Lengths: number[] = [];
    for (let i = 0; i < numLines; i++) {
        const t = i / (numLines - 1); // 0 到 1
        const v = getSample(t, 0.05, 0.35);
        const amp = Math.max(0, v - 0.2);
        const lineLength = Math.pow(amp, 1.2) * maxLineLength * sensitivity * 1.5;
        quadrant1Lengths.push(lineLength);
    }
    
    // 根據鏡像關係計算其他象限的線條長度
    // 象限2（左上）：與象限1上下鏡像，使用相同的長度
    const quadrant2Lengths = [...quadrant1Lengths];
    
    // 象限3（左下）：與象限2左右鏡像，需要反轉順序
    const quadrant3Lengths = [...quadrant2Lengths].reverse();
    
    // 象限4（右下）：與象限1左右鏡像，需要反轉順序；與象限3上下鏡像
    const quadrant4Lengths = [...quadrant1Lengths].reverse();
    
    // 繪製單個1/4圓組（改為往外放射）
    const drawQuarterCircle = (startAngle: number, endAngle: number, lengths: number[], quadrantIndex: number) => {
        for (let i = 0; i < numLines; i++) {
            const t = i / (numLines - 1); // 0 到 1
            const angle = startAngle + t * (endAngle - startAngle) + rotationAngle; // 添加旋轉
            
            const lineLength = lengths[i];
            
            // 計算線條起點和終點（改為往外放射）
            const x1 = centerX + Math.cos(angle) * circleRadius;
            const y1 = centerY + Math.sin(angle) * circleRadius;
            
            // 計算全局索引（用於彩虹顏色）
            const globalIndex = i + quadrantIndex * numLines;
            const totalLines = numLines * 4;
            
            if (lineLength < minLineLength) {
                // 沒有音訊時，只顯示小點
                ctx.fillStyle = getColor(globalIndex, totalLines);
                ctx.beginPath();
                ctx.arc(x1, y1, minDotSize / 2, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // 有音訊時，顯示線條
                const x2 = centerX + Math.cos(angle) * (circleRadius + lineLength);
                const y2 = centerY + Math.sin(angle) * (circleRadius + lineLength);
                
                ctx.strokeStyle = getColor(globalIndex, totalLines);
                ctx.shadowColor = getShadowColor(globalIndex, totalLines);
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
            }
        }
    };
    
    // 繪製四個象限
    // 象限1（右上，-π/2 到 0）
    drawQuarterCircle(-Math.PI / 2, 0, quadrant1Lengths, 0);
    // 象限2（左上，-π 到 -π/2）：與象限1上下鏡像
    drawQuarterCircle(-Math.PI, -Math.PI / 2, quadrant2Lengths, 1);
    // 象限3（左下，π/2 到 π）：與象限2左右鏡像
    drawQuarterCircle(Math.PI / 2, Math.PI, quadrant3Lengths, 2);
    // 象限4（右下，0 到 π/2）：與象限1左右鏡像，與象限3上下鏡像
    drawQuarterCircle(0, Math.PI / 2, quadrant4Lengths, 3);
    
    // 3. 左右對稱的柱狀可視化（不旋轉，保持水平）
    const barWidth = lineWidth; // 和圓圈線條一樣粗細（5）
    const barSpacing = 4;
    const maxBarHeight = height * 0.35;
    const visualizerWidth = width * 0.5; // 左右各50%（從40%增加到50%，延伸更長）
    const minBarHeight = maxBarHeight * 0.05; // 最小高度（無音訊時顯示）
    const numBars = Math.floor(visualizerWidth / (barWidth + barSpacing));
    const halfBars = Math.floor(numBars / 2);
    
    const baselineY = centerY;
    const gapSize = circleRadius * 0.1; // 圓圈和柱子之間的間距
    
    // 左側起始位置：從左邊開始，到圓圈左側
    const leftStartX = centerX - circleRadius - gapSize - visualizerWidth;
    const leftEndX = centerX - circleRadius - gapSize;
    
    // 右側起始位置：從圓圈右側開始，到右邊
    const rightStartX = centerX + circleRadius + gapSize;
    const rightEndX = centerX + circleRadius + gapSize + visualizerWidth;
    
    const leftHeights: number[] = [];
    
    // 計算左側柱子高度
    for (let i = 0; i < halfBars; i++) {
        const t = i / (halfBars - 1);
        const v = getSample(t, 0.05, 0.35);
        const amp = Math.max(0, v - 0.2);
        const h = Math.max(minBarHeight, Math.pow(amp, 1.2) * maxBarHeight * sensitivity * 2.4);
        leftHeights.push(h);
    }
    
    // 繪製左側柱子
    const leftBarSpacing = (leftEndX - leftStartX) / halfBars;
    for (let i = 0; i < halfBars; i++) {
        const x = leftStartX + i * leftBarSpacing;
        const barHeight = leftHeights[i];
        
        // 使用顏色主題創建漸變（支援彩虹主題）
        let gradient: CanvasGradient;
        if (colors.name === ColorPaletteType.RAINBOW) {
            const hue = (i / halfBars) * 360;
            const primaryColor = `hsl(${hue}, 90%, 60%)`;
            const accentColor = `hsl(${(hue + 40) % 360}, 100%, 80%)`;
            gradient = ctx.createLinearGradient(x, baselineY - barHeight, x, baselineY + barHeight);
            gradient.addColorStop(0, accentColor);
            gradient.addColorStop(0.5, primaryColor);
            gradient.addColorStop(1, primaryColor);
            ctx.shadowColor = accentColor;
        } else {
            const primaryColor = colors.primary || '#FFFFFF';
            const accentColor = colors.accent || colors.primary || '#FFFFFF';
            gradient = ctx.createLinearGradient(x, baselineY - barHeight, x, baselineY + barHeight);
            gradient.addColorStop(0, accentColor);
            gradient.addColorStop(0.5, primaryColor);
            gradient.addColorStop(1, primaryColor);
            ctx.shadowColor = accentColor;
        }
        
        ctx.fillStyle = gradient;
        ctx.shadowBlur = 8;
        ctx.fillRect(x, baselineY - barHeight, barWidth, barHeight * 2);
    }
    
    // 鏡像繪製右側柱子（完全對稱）
    const rightBarSpacing = (rightEndX - rightStartX) / halfBars;
    for (let i = 0; i < halfBars; i++) {
        const mirrorIndex = halfBars - 1 - i;
        const barHeight = leftHeights[Math.max(0, mirrorIndex)];
        const x = rightStartX + i * rightBarSpacing;
        
        // 使用顏色主題創建漸變（支援彩虹主題）
        let gradient: CanvasGradient;
        if (colors.name === ColorPaletteType.RAINBOW) {
            const hue = (mirrorIndex / halfBars) * 360;
            const primaryColor = `hsl(${hue}, 90%, 60%)`;
            const accentColor = `hsl(${(hue + 40) % 360}, 100%, 80%)`;
            gradient = ctx.createLinearGradient(x, baselineY - barHeight, x, baselineY + barHeight);
            gradient.addColorStop(0, accentColor);
            gradient.addColorStop(0.5, primaryColor);
            gradient.addColorStop(1, primaryColor);
            ctx.shadowColor = accentColor;
        } else {
            const primaryColor = colors.primary || '#FFFFFF';
            const accentColor = colors.accent || colors.primary || '#FFFFFF';
            gradient = ctx.createLinearGradient(x, baselineY - barHeight, x, baselineY + barHeight);
            gradient.addColorStop(0, accentColor);
            gradient.addColorStop(0.5, primaryColor);
            gradient.addColorStop(1, primaryColor);
            ctx.shadowColor = accentColor;
        }
        
        ctx.fillStyle = gradient;
        ctx.shadowBlur = 8;
        ctx.fillRect(x, baselineY - barHeight, barWidth, barHeight * 2);
    }
    
    // 重置陰影
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
    
    ctx.restore();
};

const drawBlurredEdge = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array | null, width: number, height: number, frame: number, sensitivity: number, colors: Palette, graphicEffect: GraphicEffectType, isBeat?: boolean, waveformStroke?: boolean, props?: any) => {
    ctx.save();
    
    const centerX = width / 2;
    const centerY = height / 2;
    
    // 1. 上半部分：文字區域（可選）
    const textAreaHeight = height * 0.175; // 改為50%：從0.35改為0.175
    const textAreaY = 0;
    
    const singer = props?.blurredEdgeSinger || '';
    const songTitle = props?.blurredEdgeSongTitle || '';
    const bgOpacity = typeof props?.blurredEdgeBgOpacity === 'number' ? props.blurredEdgeBgOpacity : 0.5;
    const textColor = props?.blurredEdgeTextColor || '#FFFFFF';
    const fontFamily = props?.blurredEdgeFontFamily || FontType.POPPINS;
    const fontSize = typeof props?.blurredEdgeFontSize === 'number' ? props.blurredEdgeFontSize : 40;
    
    // 繪製文字背景（如果設置了透明度）
    if (bgOpacity > 0 && (singer || songTitle)) {
        ctx.fillStyle = `rgba(0, 0, 0, ${bgOpacity})`;
        ctx.fillRect(0, textAreaY, width, textAreaHeight);
    }
    
    // 繪製文字
    if (singer || songTitle) {
        ctx.fillStyle = textColor;
        ctx.strokeStyle = 'rgba(0, 0, 0, 1)'; // 黑色描邊
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.lineWidth = fontSize * 0.1; // 描邊寬度
        
        // 歌手名稱（使用統一的字體大小）
        if (singer) {
            ctx.font = `bold ${fontSize}px "${FONT_MAP[fontFamily]}", "Noto Sans TC", sans-serif`;
            // 先繪製描邊
            ctx.strokeText(singer, centerX, textAreaHeight * 0.35);
            // 再繪製填充
            ctx.fillText(singer, centerX, textAreaHeight * 0.35);
        }
        
        // 歌曲名稱（使用統一的字體大小）
        if (songTitle) {
            ctx.font = `bold ${fontSize}px "${FONT_MAP[fontFamily]}", "Noto Sans TC", sans-serif`;
            // 先繪製描邊
            ctx.strokeText(songTitle, centerX, textAreaHeight * 0.65);
            // 再繪製填充
            ctx.fillText(songTitle, centerX, textAreaHeight * 0.65);
        }
    }
    
    // 2. 中間：水平金屬條（變細）
    const metalBarY = textAreaHeight + height * 0.025; // 改為50%：從0.05改為0.025
    const metalBarHeight = height * 0.005; // 改為50%：從0.01改為0.005
    
    // 金屬條漸變
    const metalGradient = ctx.createLinearGradient(0, metalBarY, 0, metalBarY + metalBarHeight);
    metalGradient.addColorStop(0, 'rgba(220, 200, 180, 0.9)');
    metalGradient.addColorStop(0.5, 'rgba(240, 220, 200, 1.0)');
    metalGradient.addColorStop(1, 'rgba(200, 180, 160, 0.9)');
    
    ctx.fillStyle = metalGradient;
    ctx.fillRect(0, metalBarY, width, metalBarHeight);
    
    // 金屬條高光
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(0, metalBarY, width, metalBarHeight * 0.3);
    
    // 3. 金屬條下方：單一光柱（兩端虛化，用透明度表現音頻強度，可以超過金屬條一點點）
    // 金屬條底部位置
    const metalBarBottom = metalBarY + metalBarHeight;
    
    // 光柱起始位置（從金屬條稍微向上延伸一點點）
    const barsStartY = metalBarBottom - height * 0.01; // 改為50%：從0.02改為0.01
    
    // 光柱區域高度（向下延伸）
    const barAreaHeight = height - barsStartY;
    const fixedBarHeight = barAreaHeight * 0.35; // 改為50%：從0.7改為0.35
    
    if (dataArray) {
        const numBars = 40;
        const barWidth = width / numBars;
        const barSpacing = barWidth * 0.1;
        const actualBarWidth = barWidth - barSpacing;
        
        // 音頻取樣函數
        const getSample = (index: number) => {
            const t = index / numBars;
            const len = dataArray.length;
            const idx = Math.floor(t * len * 0.8);
            return (dataArray[idx] || 0) / 255;
        };
        
        // 主色調（根據顏色主題）
        let primaryColor: string;
        let accentColor: string;
        
        if (colors.name === ColorPaletteType.RAINBOW) {
            // 彩虹主題使用黃色系
            primaryColor = `hsl(50, 100%, 60%)`;
            accentColor = `hsl(55, 100%, 80%)`;
        } else {
            // 其他主題使用主要顏色
            primaryColor = colors.accent || colors.primary || '#FFD700';
            accentColor = colors.accent || colors.primary || '#FFEB3B';
        }
        
        // 繪製單一光柱（兩端虛化，用透明度表現音頻強度）
        for (let i = 0; i < numBars; i++) {
            const x = i * barWidth + barSpacing / 2;
            const amplitude = getSample(i);
            
            // 根據音頻強度計算透明度（20% 到 100%）
            const minOpacity = 0.2; // 最小透明度20%
            const maxOpacity = 1.0; // 最大透明度100%
            // 調整公式：降低幂次，增加敏感度，更容易達到100%
            const opacity = Math.min(maxOpacity, minOpacity + (maxOpacity - minOpacity) * Math.pow(amplitude, 0.8) * sensitivity * 1.5);
            
            const startY = barsStartY; // 從起始位置開始
            const endY = startY + fixedBarHeight; // 向下延伸
            
            // 創建垂直漸變（兩端虛化，整體透明度根據音頻強度變化）
            const barGradient = ctx.createLinearGradient(x, startY, x, endY);
            
            // 頂部（上方邊緣）：逐漸變透明（虛化），整體透明度受音頻影響
            barGradient.addColorStop(0, applyAlphaToColor(accentColor, 0));
            barGradient.addColorStop(0.1, applyAlphaToColor(accentColor, 0.3 * opacity));
            barGradient.addColorStop(0.2, applyAlphaToColor(primaryColor, 0.6 * opacity));
            
            // 中間：主色調，整體透明度受音頻影響
            barGradient.addColorStop(0.4, applyAlphaToColor(primaryColor, opacity));
            barGradient.addColorStop(0.5, applyAlphaToColor(primaryColor, opacity));
            barGradient.addColorStop(0.6, applyAlphaToColor(primaryColor, opacity));
            
            // 底部（下方邊緣）：逐漸變透明（虛化），整體透明度受音頻影響
            barGradient.addColorStop(0.8, applyAlphaToColor(primaryColor, 0.6 * opacity));
            barGradient.addColorStop(0.9, applyAlphaToColor(primaryColor, 0.3 * opacity));
            barGradient.addColorStop(1, applyAlphaToColor(primaryColor, 0));
            
            ctx.fillStyle = barGradient;
            
            // 添加發光效果（透明度也根據音頻強度變化）
            ctx.shadowColor = applyAlphaToColor(accentColor, opacity);
            ctx.shadowBlur = 15;
            
            // 繪製光柱（圓角矩形）
            const radius = Math.min(actualBarWidth / 4, 4);
            createRoundedRectPath(ctx, x, startY, actualBarWidth, fixedBarHeight, radius);
            ctx.fill();
            
            // 重置陰影
            ctx.shadowBlur = 0;
        }
    }
    
    ctx.restore();
};

const drawKeYeCustomV2 = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array | null, width: number, height: number, frame: number, sensitivity: number, colors: Palette, graphicEffect: GraphicEffectType, isBeat?: boolean, waveformStroke?: boolean, props?: any) => {
    ctx.save();
    
    const centerX = width / 2;
    const centerY = height / 2;
    
    // 獲取配置參數
    const boxOpacity = typeof props?.keYeCustomV2BoxOpacity === 'number' ? props.keYeCustomV2BoxOpacity : 0.5;
    const text1 = props?.keYeCustomV2Text1 || '';
    const text2 = props?.keYeCustomV2Text2 || '';
    const text1FontFamily = props?.keYeCustomV2Text1Font || FontType.POPPINS;
    const text2FontFamily = props?.keYeCustomV2Text2Font || FontType.POPPINS;
    const text1Size = typeof props?.keYeCustomV2Text1Size === 'number' ? props.keYeCustomV2Text1Size : 40;
    const text2Size = typeof props?.keYeCustomV2Text2Size === 'number' ? props.keYeCustomV2Text2Size : 30;
    
    // 白色框的大小和位置
    const boxWidth = width * 0.8;
    const boxHeight = height * 0.2; // 高度減半
    const boxX = centerX - boxWidth / 2;
    const boxY = height - boxHeight - height * 0.05; // 靠近畫布底部，留5%邊距
    const cornerRadius = boxHeight / 2; // 半圓：圓角半徑為高度的一半
    
    // 繪製白色圓角框（半圓形）
    ctx.fillStyle = `rgba(255, 255, 255, ${boxOpacity})`;
    ctx.beginPath();
    ctx.moveTo(boxX + cornerRadius, boxY);
    ctx.lineTo(boxX + boxWidth - cornerRadius, boxY);
    ctx.arcTo(boxX + boxWidth, boxY, boxX + boxWidth, boxY + cornerRadius, cornerRadius);
    ctx.lineTo(boxX + boxWidth, boxY + boxHeight - cornerRadius);
    ctx.arcTo(boxX + boxWidth, boxY + boxHeight, boxX + boxWidth - cornerRadius, boxY + boxHeight, cornerRadius);
    ctx.lineTo(boxX + cornerRadius, boxY + boxHeight);
    ctx.arcTo(boxX, boxY + boxHeight, boxX, boxY + boxHeight - cornerRadius, cornerRadius);
    ctx.lineTo(boxX, boxY + cornerRadius);
    ctx.arcTo(boxX, boxY, boxX + cornerRadius, boxY, cornerRadius);
    ctx.closePath();
    ctx.fill();
    
    // 繪製外框線條
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // 繪製外框外的白線（距離外框2px）
    ctx.strokeStyle = 'rgba(255, 255, 255, 1)';
    ctx.lineWidth = 2;
    const outerMargin = 2; // 距離外框2px
    ctx.beginPath();
    ctx.moveTo(boxX - outerMargin + cornerRadius, boxY - outerMargin);
    ctx.lineTo(boxX + boxWidth + outerMargin - cornerRadius, boxY - outerMargin);
    ctx.arcTo(boxX + boxWidth + outerMargin, boxY - outerMargin, boxX + boxWidth + outerMargin, boxY - outerMargin + cornerRadius, cornerRadius);
    ctx.lineTo(boxX + boxWidth + outerMargin, boxY + boxHeight + outerMargin - cornerRadius);
    ctx.arcTo(boxX + boxWidth + outerMargin, boxY + boxHeight + outerMargin, boxX + boxWidth + outerMargin - cornerRadius, boxY + boxHeight + outerMargin, cornerRadius);
    ctx.lineTo(boxX - outerMargin + cornerRadius, boxY + boxHeight + outerMargin);
    ctx.arcTo(boxX - outerMargin, boxY + boxHeight + outerMargin, boxX - outerMargin, boxY + boxHeight + outerMargin - cornerRadius, cornerRadius);
    ctx.lineTo(boxX - outerMargin, boxY - outerMargin + cornerRadius);
    ctx.arcTo(boxX - outerMargin, boxY - outerMargin, boxX - outerMargin + cornerRadius, boxY - outerMargin, cornerRadius);
    ctx.closePath();
    ctx.stroke();
    
    // 文字區域（上方）
    const textAreaPadding = 30;
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // 第一組文字（上方區域）
    if (text1) {
        const text1Y = boxY + boxHeight * 0.2; // 框頂部20%位置
        ctx.font = `bold ${text1Size}px "${FONT_MAP[text1FontFamily]}", "Noto Sans TC", sans-serif`;
        ctx.fillText(text1, centerX, text1Y);
    }
    
    // 第二組文字（上方區域）
    if (text2) {
        const text2Y = boxY + boxHeight * 0.6; // 框頂部60%位置
        ctx.font = `bold ${text2Size}px "${FONT_MAP[text2FontFamily]}", "Noto Sans TC", sans-serif`;
        ctx.fillText(text2, centerX, text2Y);
    }
    
    // 柱狀可視化區域（最底部）
    const visualizerAreaHeight = boxHeight * 0.25; // 增加高度：佔框高度的25%
    let visualizerAreaY = boxY + boxHeight - visualizerAreaHeight - boxHeight * 0.03; // 底部留3%邊距
    
    // 確保可視化區域在畫布內
    visualizerAreaY = Math.max(0, Math.min(visualizerAreaY, height - visualizerAreaHeight));
    
    const visualizerAreaPadding = 65; // 增加左右邊距，避免超出（從60改為65）
    const visualizerAreaX = boxX + visualizerAreaPadding;
    const visualizerAreaWidth = boxWidth - visualizerAreaPadding * 2; // 減少寬度，避免超出
    
    if (dataArray) {
        const numBars = 40;
        const barWidth = visualizerAreaWidth / numBars;
        const barSpacing = barWidth * 0.1;
        const actualBarWidth = barWidth - barSpacing;
        const maxBarHeight = visualizerAreaHeight * 0.8;
        
        // 音頻取樣函數
        const getSample = (index: number) => {
            const t = index / numBars;
            const len = dataArray.length;
            const idx = Math.floor(t * len * 0.8);
            return (dataArray[idx] || 0) / 255;
        };
        
        // 主色調（根據顏色主題）
        let barColor: string;
        
        if (colors.name === ColorPaletteType.RAINBOW) {
            // 彩虹主題使用動態顏色
            const [startHue, endHue] = colors.hueRange;
            const hueRangeSpan = endHue - startHue;
            barColor = `hsl(${startHue + (frame * 0.5) % hueRangeSpan}, 70%, 50%)`;
        } else {
            barColor = colors.accent || colors.primary || '#000000';
        }
        
        // 繪製柱狀圖
        for (let i = 0; i < numBars; i++) {
            const x = visualizerAreaX + i * barWidth + barSpacing / 2;
            const amplitude = getSample(i);
            
            // 計算柱狀高度
            const barHeight = Math.pow(amplitude, 1.5) * maxBarHeight * sensitivity * 2.0;
            
            // 最小高度（無音頻時顯示小點）
            const minBarHeight = 3; // 小點的高度
            const finalBarHeight = Math.max(minBarHeight, barHeight);
            
            const barY = visualizerAreaY + visualizerAreaHeight - finalBarHeight;
            
            // 確保柱狀圖不會超出可視化區域
            if (x + actualBarWidth > visualizerAreaX + visualizerAreaWidth) {
                continue; // 跳過超出右邊界的柱狀圖
            }
            if (x < visualizerAreaX) {
                continue; // 跳過超出左邊界的柱狀圖
            }
            
            // 設置顏色
            if (colors.name === ColorPaletteType.RAINBOW) {
                const [startHue, endHue] = colors.hueRange;
                const hueRangeSpan = endHue - startHue;
                const hue = startHue + (i / numBars) * hueRangeSpan;
                barColor = `hsl(${hue}, 70%, 50%)`;
            }
            
            ctx.fillStyle = barColor;
            
            // 繪製柱狀（圓角矩形）
            const radius = Math.min(actualBarWidth / 4, 2);
            createRoundedRectPath(ctx, x, barY, actualBarWidth, finalBarHeight, radius);
            ctx.fill();
        }
    } else {
        // 無音頻時顯示小點
        const numBars = 40;
        const barWidth = visualizerAreaWidth / numBars;
        const barSpacing = barWidth * 0.1;
        const actualBarWidth = barWidth - barSpacing;
        const dotSize = 3;
        
        // 使用顏色主題
        let dotColor: string;
        if (colors.name === ColorPaletteType.RAINBOW) {
            const [startHue, endHue] = colors.hueRange;
            const hueRangeSpan = endHue - startHue;
            dotColor = `hsl(${startHue + (frame * 0.5) % hueRangeSpan}, 70%, 50%)`;
        } else {
            dotColor = colors.accent || colors.primary || '#000000';
        }
        
        ctx.fillStyle = dotColor;
        
        for (let i = 0; i < numBars; i++) {
            const x = visualizerAreaX + i * barWidth + barSpacing / 2 + actualBarWidth / 2;
            const y = visualizerAreaY + visualizerAreaHeight - dotSize / 2;
            
            // 確保小點不會超出可視化區域
            if (x + dotSize / 2 > visualizerAreaX + visualizerAreaWidth) {
                continue; // 跳過超出右邊界的小點
            }
            if (x - dotSize / 2 < visualizerAreaX) {
                continue; // 跳過超出左邊界的小點
            }
            
            // 如果使用彩虹主題，每個點使用不同顏色
            if (colors.name === ColorPaletteType.RAINBOW) {
                const [startHue, endHue] = colors.hueRange;
                const hueRangeSpan = endHue - startHue;
                const hue = startHue + (i / numBars) * hueRangeSpan;
                dotColor = `hsl(${hue}, 70%, 50%)`;
                ctx.fillStyle = dotColor;
            }
            
            ctx.beginPath();
            ctx.arc(x, y, dotSize / 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    ctx.restore();
};

const drawMonstercatV2 = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array | null, width: number, height: number, frame: number, sensitivity: number, colors: Palette, graphicEffect: GraphicEffectType, isBeat?: boolean, waveformStroke?: boolean) => {
    if (!dataArray) return;
    ctx.save();
    
    const centerY = height / 2;
    const centerX = width / 2;
    const maxBarHeight = height * 0.4;
    const barSpacing = 20; // Increased space between bars
    const barWidth = 8; // Increased width of each bar
    
    // Check if we have audio data
    const hasAudioData = dataArray.some(value => value > 0);
    
    // Draw base line
    const baseLineY = centerY;
    
    // Calculate number of bars
    const numBars = Math.floor(width / (barWidth + barSpacing));
    
    // Draw base line dots at each bar position
    const drawBaseLineDot = (x: number) => {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.beginPath();
        ctx.arc(x, baseLineY, barWidth / 2, 0, Math.PI * 2);
        ctx.fill();
    };
    
    // Draw vertical bars with simplified mirroring
    const dataSliceLength = dataArray.length * 0.6;
    
    // Function to draw a single bar
    const drawBar = (x: number, y: number, height: number, index: number) => {
        if (height < 1) return;
        
        // Create colorful bars with dynamic colors
        let barColor: string;
        
        if (colors.name === ColorPaletteType.WHITE) {
            // White palette: subtle color variations
            const lightness = 70 + (Math.sin(index * 0.3 + frame * 0.02) * 10);
            const hue = 220 + Math.sin(index * 0.2) * 20;
            barColor = `hsla(${hue}, 15%, ${lightness}%, 0.9)`;
        } else {
            // Colorful palettes: use the palette colors
            const [startHue, endHue] = colors.hueRange;
            const hueRangeSpan = endHue - startHue;
            const hue = startHue + (index / numBars) * hueRangeSpan;
            const saturation = 70 + Math.sin(index * 0.2 + frame * 0.01) * 20;
            const lightness = 50 + Math.sin(index * 0.15 + frame * 0.015) * 15;
            barColor = `hsla(${hue}, ${saturation}%, ${lightness}%, 0.9)`;
        }
        
        // Apply color and shadow effects
        ctx.fillStyle = barColor;
        ctx.shadowColor = barColor;
        ctx.shadowBlur = 8;
        
        // Draw vertical bar
        const barX = x - barWidth / 2;
        const barY = y;
        
        // Create rounded rectangle for the bar
        const cornerRadius = 2;
        createRoundedRectPath(ctx, barX, barY, barWidth, height, cornerRadius);
        ctx.fill();
    };
    
    // AB|BA design: Left side (low to high frequency), Right side (high to low frequency)
    const numBarsOnHalf = Math.floor(numBars / 2);
    
    // Left side: from left to center, frequency from low to high
    for (let i = 0; i < numBarsOnHalf; i++) {
        const x = i * (barWidth + barSpacing) + barWidth / 2;
        const dataIndex = Math.floor((i / numBarsOnHalf) * dataSliceLength);
        const amplitude = dataArray[dataIndex] / 255.0;
        
        let barHeight: number;
        if (hasAudioData && amplitude > 0.01) {
            // Dynamic bars based on audio
            barHeight = Math.pow(amplitude, 1.8) * maxBarHeight * sensitivity;
            if (barHeight < 3) continue;
        } else {
            // Static bars should be at minimum height when no music
            const staticHeight = maxBarHeight * 0.03; // Very minimal height
            const breathingEffect = Math.sin(frame * 0.02 + i * 0.15) * 0.03 + 1; // Very subtle breathing
            barHeight = staticHeight * breathingEffect;
        }
        
        // Draw bar above base line
        drawBar(x, baseLineY - barHeight, barHeight, i);
        
        // Draw bar below base line (up-down mirroring)
        drawBar(x, baseLineY, barHeight, i);
        
        // Draw base line dot
        drawBaseLineDot(x);
        
        // Draw right mirror (symmetrical)
        const rightX = width - x;
        drawBar(rightX, baseLineY - barHeight, barHeight, numBars - i - 1);
        drawBar(rightX, baseLineY, barHeight, numBars - i - 1);
        drawBaseLineDot(rightX);
    }
    
    // Right side: from center to right, frequency from high to low
    for (let i = 0; i < numBarsOnHalf; i++) {
        const x = centerX + i * (barWidth + barSpacing) + barWidth / 2;
        const dataIndex = Math.floor((numBarsOnHalf - i - 1) / numBarsOnHalf) * dataSliceLength;
        const amplitude = dataArray[dataIndex] / 255.0;
        
        let barHeight: number;
        if (hasAudioData && amplitude > 0.01) {
            // Dynamic bars based on audio
            barHeight = Math.pow(amplitude, 1.8) * maxBarHeight * sensitivity;
            if (barHeight < 3) continue;
        } else {
            // Static bars should be at minimum height when no music
            const staticHeight = maxBarHeight * 0.03; // Very minimal height
            const breathingEffect = Math.sin(frame * 0.02 + i * 0.15) * 0.03 + 1; // Very subtle breathing
            barHeight = staticHeight * breathingEffect;
        }
        
        // Draw bar above base line
        drawBar(x, baseLineY - barHeight, barHeight, numBarsOnHalf + i);
        
        // Draw bar below base line (up-down mirroring)
        drawBar(x, baseLineY, barHeight, numBarsOnHalf + i);
        
        // Draw base line dot
        drawBaseLineDot(x);
        
        // Draw left mirror (symmetrical)
        const leftX = centerX - i * (barWidth + barSpacing) - barWidth / 2;
        drawBar(leftX, baseLineY - barHeight, barHeight, numBarsOnHalf - i - 1);
        drawBar(leftX, baseLineY, barHeight, numBarsOnHalf - i - 1);
        drawBaseLineDot(leftX);
    }
    
    ctx.restore();
};

const drawMonstercatGlitch = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array | null, width: number, height: number, frame: number, sensitivity: number, colors: Palette, graphicEffect: GraphicEffectType, isBeat?: boolean, waveformStroke?: boolean) => {
    if (!dataArray) return;
    // 1. Draw the base Monstercat visual
    drawMonstercat(ctx, dataArray, width, height, frame, sensitivity, colors, graphicEffect, isBeat, waveformStroke);

    // 2. Apply subtle glitch effects without screen shake
    if (isBeat) {
        ctx.save();
        
        // Subtle color distortion instead of screen shake
        if (Math.random() > 0.7) {
            ctx.filter = `hue-rotate(${(Math.random() - 0.5) * 30}deg) saturate(${1.2 + Math.random() * 0.3})`;
        }

        // Block Corruption (reduced intensity)
        const numBlocks = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < numBlocks; i++) {
            const sx = Math.random() * width * 0.8;
            const sy = Math.random() * height * 0.8;
            const sw = Math.random() * width * 0.15 + 8;
            const sh = Math.random() * height * 0.08 + 4;
            const dx = sx + (Math.random() - 0.5) * 20; // Reduced displacement
            const dy = sy;
            try {
                ctx.drawImage(ctx.canvas, sx, sy, sw, sh, dx, dy, sw, sh);
            } catch(e) { /* ignore */ }
        }
        ctx.restore();
    }
};

// Module-level state for effects that need persistence across frames
const dataMoshState: { imageData: ImageData | null, framesLeft: number } = {
    imageData: null,
    framesLeft: 0,
};
const drawDataMosh = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array | null, width: number, height: number, frame: number, sensitivity: number, colors: Palette, graphicEffect: GraphicEffectType, isBeat?: boolean, waveformStroke?: boolean) => {
    if (!dataArray) return;
    ctx.save();
    
    // Optimized data mosh with reduced effects for better performance
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Audio-reactive parameters
    const bass = dataArray.slice(0, 32).reduce((a, b) => a + b, 0) / 32;
    const mid = dataArray.slice(32, 96).reduce((a, b) => a + b, 0) / 64;
    const treble = dataArray.slice(96, 128).reduce((a, b) => a + b, 0) / 32;
    
    const normalizedBass = bass / 255;
    const normalizedMid = mid / 255;
    const normalizedTreble = treble / 255;
    
    // Simplified ghost frame effect - reduced frequency
    if (dataMoshState.framesLeft > 0 && dataMoshState.imageData && frame % 3 === 0) {
        ctx.globalAlpha = 0.2;
        ctx.putImageData(dataMoshState.imageData, 0, 0);
        dataMoshState.framesLeft--;
        ctx.globalAlpha = 1;
    }
    
    // Draw simplified wave layer - only one main wave for performance
    const drawWaveLayer = (amplitude: number, frequency: number, color: string) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.shadowColor = color;
        ctx.shadowBlur = 8; // Reduced shadow blur
        
        ctx.beginPath();
        for (let x = 0; x < width; x += 4) { // Increased step size for performance
            const normalizedX = x / width;
            const time = frame * 0.01; // Reduced animation speed
            const waveHeight = Math.sin(normalizedX * frequency * Math.PI + time) * amplitude;
            const y = centerY + waveHeight;
            
            if (x === 0) {
                ctx.moveTo(x, y);
        } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
    };
    
    // Draw only one main wave layer for better performance
    const baseAmplitude = height * 0.12 * sensitivity;
    drawWaveLayer(baseAmplitude * normalizedBass, 2, colors.primary);
    
    // Draw simplified frequency spectrum bars - reduced count
    const numBars = 64; // Reduced from 128
    const barWidth = width / numBars;
    
    for (let i = 0; i < numBars; i++) {
        const dataIndex = Math.floor((i / numBars) * dataArray.length);
        const amplitude = dataArray[dataIndex] / 255;
        const barHeight = Math.pow(amplitude, 1.5) * height * 0.3 * sensitivity; // Reduced height
        
        if (barHeight < 4) continue; // Increased minimum height threshold
        
        const x = i * barWidth;
        const y = height - barHeight;
        
        // Simplified distortion effect - reduced frequency
        const distortionX = isBeat && Math.random() > 0.85 ? (Math.random() - 0.5) * 8 : 0; // Reduced distortion
        const distortionY = isBeat && Math.random() > 0.9 ? (Math.random() - 0.5) * 10 : 0; // Reduced distortion
        
        // Dynamic color based on current color palette and audio data
        let barColor;
        if (i < numBars * 0.33) {
            // Low frequencies - use primary color
            barColor = applyAlphaToColor(colors.primary, 0.7 + amplitude * 0.3);
        } else if (i < numBars * 0.66) {
            // Mid frequencies - use secondary color
            barColor = applyAlphaToColor(colors.secondary, 0.7 + amplitude * 0.3);
        } else {
            // High frequencies - use accent color
            barColor = applyAlphaToColor(colors.accent, 0.7 + amplitude * 0.3);
        }
        
        // Add some color variation based on amplitude and position
        const hueShift = (i / numBars) * 60 - 30; // -30 to +30 degrees
        const saturation = 80 + amplitude * 20; // 80% to 100%
        const lightness = 50 + amplitude * 30; // 50% to 80%
        
        // Create dynamic HSL color with current palette influence
        const dynamicColor = `hsla(${200 + hueShift + (frame * 0.5) % 360}, ${saturation}%, ${lightness}%, ${0.8 + amplitude * 0.2})`;
        
        ctx.fillStyle = dynamicColor;
        
        // Draw rounded rectangle instead of regular rectangle
        const barX = x + distortionX;
        const barY = y + distortionY;
        const radius = Math.min(barWidth * 0.3, barHeight * 0.2); // Dynamic corner radius
        
        // Create rounded rectangle path
        ctx.beginPath();
        ctx.moveTo(barX + radius, barY);
        ctx.lineTo(barX + barWidth - radius, barY);
        ctx.quadraticCurveTo(barX + barWidth, barY, barX + barWidth, barY + radius);
        ctx.lineTo(barX + barWidth, barY + barHeight - radius);
        ctx.quadraticCurveTo(barX + barWidth, barY + barHeight, barX + barWidth - radius, barY + barHeight);
        ctx.lineTo(barX + radius, barY + barHeight);
        ctx.quadraticCurveTo(barX, barY + barHeight, barX, barY + barHeight - radius);
        ctx.lineTo(barX, barY + radius);
        ctx.quadraticCurveTo(barX, barY, barX + radius, barY);
        ctx.closePath();
        ctx.fill();
        
        // Add subtle glow effect
        ctx.shadowColor = dynamicColor;
        ctx.shadowBlur = 3;
        ctx.fill();
        ctx.shadowBlur = 0; // Reset shadow
        
        // Reduced glitch overlay frequency with rounded effect
        if (isBeat && Math.random() > 0.92) {
            ctx.fillStyle = '#FF00FF';
            const glitchHeight = 1;
            const glitchY = barY + Math.random() * barHeight;
            
            // Draw rounded glitch line
            ctx.beginPath();
            ctx.moveTo(barX + radius, glitchY);
            ctx.lineTo(barX + barWidth - radius, glitchY);
            ctx.quadraticCurveTo(barX + barWidth, glitchY, barX + barWidth, glitchY + radius);
            ctx.lineTo(barX + barWidth, glitchY + glitchHeight - radius);
            ctx.quadraticCurveTo(barX + barWidth, glitchY + glitchHeight, barX + barWidth - radius, glitchY + glitchHeight);
            ctx.lineTo(barX + radius, glitchY + glitchHeight);
            ctx.quadraticCurveTo(barX, glitchY + glitchHeight, barX, glitchY + glitchHeight - radius);
            ctx.lineTo(barX, glitchY + radius);
            ctx.quadraticCurveTo(barX, glitchY, barX + radius, glitchY);
            ctx.closePath();
            ctx.fill();
        }
    }
    
    // Draw simplified central core
    const coreRadius = 30 + normalizedBass * 50 * sensitivity; // Reduced size
    
    // Simple core without complex gradients
    ctx.fillStyle = colors.primary;
    ctx.shadowColor = colors.accent;
    ctx.shadowBlur = 20; // Reduced shadow blur
    ctx.beginPath();
    ctx.arc(centerX, centerY, coreRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Reduced rotating rings - only 2 rings
    const numRings = 2; // Reduced from 4
    for (let i = 0; i < numRings; i++) {
        const ringRadius = coreRadius + 20 + i * 15;
        const rotationSpeed = frame * (0.02 + i * 0.01); // Reduced rotation speed
        const ringOpacity = 0.4 - i * 0.2;
        
        ctx.strokeStyle = applyAlphaToColor(colors.accent, ringOpacity);
        ctx.lineWidth = 2; // Reduced line width
        
        // Simplified ring - fewer segments
        const segments = 8; // Reduced from 12
        for (let j = 0; j < segments; j++) {
            const startAngle = (j / segments) * Math.PI * 2 + rotationSpeed;
            const endAngle = ((j + 1) / segments) * Math.PI * 2 + rotationSpeed;
            
            ctx.beginPath();
            ctx.arc(centerX, centerY, ringRadius, startAngle, endAngle);
            ctx.stroke();
        }
    }
    
    // Reduced particle count for better performance
    const particleCount = 20 + normalizedBass * 40 * sensitivity; // Reduced from 50 + 100
    for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2 + frame * 0.005; // Reduced animation speed
        const radius = 50 + Math.sin(frame * 0.01 + i * 0.1) * 20; // Reduced radius variation
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        const particleSize = 1.5 + normalizedMid * 3 * sensitivity; // Reduced size
        const particleOpacity = 0.5 + normalizedTreble * 0.3;
        
        ctx.fillStyle = applyAlphaToColor(colors.accent, particleOpacity);
        ctx.beginPath();
        ctx.arc(x, y, particleSize, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Simplified scanline effect - reduced frequency
    if (frame % 2 === 0) { // Only draw every other frame
        ctx.strokeStyle = applyAlphaToColor(colors.primary, 0.08);
        ctx.lineWidth = 1;
        for (let y = 0; y < height; y += 8) { // Increased spacing
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }
    }
    
    // Reduced mosh effect frequency
    if (isBeat && Math.random() > 0.85) { // Reduced from 0.7
        try {
            dataMoshState.imageData = ctx.getImageData(0, 0, width, height);
            dataMoshState.framesLeft = 3 + Math.floor(Math.random() * 5); // Reduced from 5 + 10
        } catch (e) {
            // Handle cross-origin issues
        }
    }

    ctx.restore();
};

const drawSignalScramble = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array | null, width: number, height: number, frame: number, sensitivity: number, colors: Palette, graphicEffect: GraphicEffectType, isBeat?: boolean, waveformStroke?: boolean) => {
    if (!dataArray) return;
    ctx.save();
    
    // Base wave with intense chromatic aberration
    const centerY = height / 2;
    ctx.globalCompositeOperation = 'lighter';
    const intensity = isBeat ? 15 : 5;
    const drawSubWave = (color: string, offset: number) => {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        const sliceWidth = width / (dataArray.length * 0.5);
        let x = 0;
        for (let i = 0; i < dataArray.length * 0.5; i++) {
            const amp = Math.pow(dataArray[i] / 255, 1.5) * height * 0.3 * sensitivity;
            ctx.lineTo(x, centerY + amp + (Math.random() - 0.5) * offset);
            x += sliceWidth;
        }
        ctx.stroke();
    };
    drawSubWave('rgba(255, 0, 100, 0.6)', intensity);
    drawSubWave('rgba(0, 255, 255, 0.6)', intensity);
    ctx.globalCompositeOperation = 'source-over';
    
    // Main wave on top
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = colors.primary;
    ctx.shadowBlur = 10;
    const mainWavePath = new Path2D();
    let x = 0;
    const sliceWidth = width / (dataArray.length * 0.5);
    for (let i = 0; i < dataArray.length * 0.5; i++) {
        const amp = Math.pow(dataArray[i] / 255, 1.5) * height * 0.3 * sensitivity;
        mainWavePath.lineTo(x, centerY + amp);
        x += sliceWidth;
    }
    ctx.stroke(mainWavePath);

    // Static, snow, and tracking lines
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    for (let i = 0; i < 200; i++) {
        ctx.fillRect(Math.random() * width, Math.random() * height, Math.random() * 2, Math.random() * 2);
    }
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
        const y = height * Math.random();
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
    
    // Screen Tearing on beat
    if (isBeat && Math.random() > 0.5) {
        const tearY = Math.random() * height;
        const tearHeight = Math.random() * 50 + 20;
        const tearShift = (Math.random() - 0.5) * 80;
        try {
            ctx.drawImage(ctx.canvas, 0, tearY, width, tearHeight, tearShift, tearY, width, tearHeight);
        } catch(e) {}
    }

    ctx.restore();
};

// State for the Pixel Rain effect, kept separate to not interfere with other particle systems.
const pixelRainState: {
    particles: {
        x: number;
        y: number;
        vy: number;
        opacity: number;
        color: string;
        length: number;
    }[];
} = {
    particles: [],
};

const drawPixelSort = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array | null, width: number, height: number, frame: number, sensitivity: number, colors: Palette, graphicEffect: GraphicEffectType, isBeat?: boolean, waveformStroke?: boolean) => {
    if (!dataArray) return;
    ctx.save();
    
    // Create a digital storm effect with audio-reactive elements
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Audio-reactive parameters
    const bass = dataArray.slice(0, 16).reduce((a, b) => a + b, 0) / 16;
    const mid = dataArray.slice(16, 64).reduce((a, b) => a + b, 0) / 48;
    const treble = dataArray.slice(64, 128).reduce((a, b) => a + b, 0) / 64;
    
    const normalizedBass = bass / 255;
    const normalizedMid = mid / 255;
    const normalizedTreble = treble / 255;
    
    // Draw digital storm background
    const stormIntensity = (normalizedBass + normalizedMid + normalizedTreble) / 3;
    
    // Create storm clouds
    for (let i = 0; i < 8; i++) {
        const cloudX = (i / 8) * width + Math.sin(frame * 0.02 + i) * 50;
        const cloudY = height * 0.2 + Math.sin(frame * 0.01 + i * 0.5) * 30;
        const cloudSize = 80 + normalizedBass * 100 * sensitivity;
        
        ctx.fillStyle = applyAlphaToColor(colors.primary, 0.1 + stormIntensity * 0.2);
        ctx.beginPath();
        ctx.arc(cloudX, cloudY, cloudSize, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // Draw lightning bolts on beat
    if (isBeat && Math.random() > 0.6) {
        const numBolts = Math.floor(Math.random() * 3) + 1;
        for (let i = 0; i < numBolts; i++) {
            const startX = Math.random() * width;
            const startY = 0;
            const endX = startX + (Math.random() - 0.5) * 200;
            const endY = height;
            
            ctx.strokeStyle = '#FFFFFF';
            ctx.lineWidth = 3;
            ctx.shadowColor = '#00FFFF';
            ctx.shadowBlur = 20;
            
            // Create zigzag lightning
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            
            let currentX = startX;
            let currentY = startY;
            const segments = 8;
            
            for (let j = 1; j <= segments; j++) {
                const progress = j / segments;
                const targetX = startX + (endX - startX) * progress;
                const targetY = startY + (endY - startY) * progress;
                
                const offset = (Math.random() - 0.5) * 40;
                currentX = targetX + offset;
                currentY = targetY;
                
                ctx.lineTo(currentX, currentY);
            }
            
            ctx.stroke();
        }
    }
    
    // Draw digital rain effect
    const rainDrops = 200;
    for (let i = 0; i < rainDrops; i++) {
        const x = (i * 37) % width; // Distribute drops evenly
        const y = (frame * 2 + i * 2) % (height + 100);
        const length = 10 + normalizedTreble * 20 * sensitivity;
        const opacity = 0.3 + normalizedTreble * 0.4;
        
        ctx.strokeStyle = applyAlphaToColor(colors.accent, opacity);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + length);
        ctx.stroke();
    }
    
    // Draw frequency bars with digital distortion
    const numBars = 64;
    const barWidth = width / numBars;
    
    for (let i = 0; i < numBars; i++) {
        const dataIndex = Math.floor((i / numBars) * dataArray.length);
        const amplitude = dataArray[dataIndex] / 255;
        const barHeight = Math.pow(amplitude, 1.5) * height * 0.6 * sensitivity;
        
        if (barHeight < 2) continue;
        
        const x = i * barWidth;
        const y = height - barHeight;
        
        // Create digital glitch effect
        const glitchOffset = isBeat && Math.random() > 0.8 ? (Math.random() - 0.5) * 10 : 0;
        const glitchHeight = isBeat && Math.random() > 0.9 ? Math.random() * 20 : 0;
        
        // Dynamic color based on current color palette and audio data
        let barColor;
        if (i < numBars * 0.33) {
            // Low frequencies - use primary color
            barColor = applyAlphaToColor(colors.primary, 0.8 + amplitude * 0.2);
        } else if (i < numBars * 0.66) {
            // Mid frequencies - use secondary color
            barColor = applyAlphaToColor(colors.secondary, 0.8 + amplitude * 0.2);
        } else {
            // High frequencies - use accent color
            barColor = applyAlphaToColor(colors.accent, 0.8 + amplitude * 0.2);
        }
        
        // Add digital color variation with current palette influence
        const hueShift = (i / numBars) * 80 - 40; // -40 to +40 degrees
        const saturation = 85 + amplitude * 15; // 85% to 100%
        const lightness = 55 + amplitude * 25; // 55% to 80%
        
        // Create dynamic digital color
        const dynamicColor = `hsla(${200 + hueShift + (frame * 0.3) % 360}, ${saturation}%, ${lightness}%, ${0.9 + amplitude * 0.1})`;
        
        ctx.fillStyle = dynamicColor;
        
        // Draw rounded rectangle instead of regular rectangle
        const barX = x + glitchOffset;
        const barY = y;
        const radius = Math.min(barWidth * 0.25, barHeight * 0.15); // Dynamic corner radius
        
        // Create rounded rectangle path
        ctx.beginPath();
        ctx.moveTo(barX + radius, barY);
        ctx.lineTo(barX + barWidth - 1 - radius, barY);
        ctx.quadraticCurveTo(barX + barWidth - 1, barY, barX + barWidth - 1, barY + radius);
        ctx.lineTo(barX + barWidth - 1, barY + barHeight - radius);
        ctx.quadraticCurveTo(barX + barWidth - 1, barY + barHeight, barX + barWidth - 1 - radius, barY + barHeight);
        ctx.lineTo(barX + radius, barY + barHeight);
        ctx.quadraticCurveTo(barX, barY + barHeight, barX, barY + barHeight - radius);
        ctx.lineTo(barX, barY + radius);
        ctx.quadraticCurveTo(barX, barY, barX + radius, barY);
        ctx.closePath();
        ctx.fill();
        
        // Add digital glow effect
        ctx.shadowColor = dynamicColor;
        ctx.shadowBlur = 4;
        ctx.fill();
        ctx.shadowBlur = 0; // Reset shadow
        
        // Draw glitch segments with rounded effect
        if (glitchHeight > 0) {
            ctx.fillStyle = '#FF00FF';
            const glitchY = barY + glitchHeight;
            
            // Draw rounded glitch line
            ctx.beginPath();
            ctx.moveTo(barX + radius, glitchY);
            ctx.lineTo(barX + barWidth - 1 - radius, glitchY);
            ctx.quadraticCurveTo(barX + barWidth - 1, glitchY, barX + barWidth - 1, glitchY + radius);
            ctx.lineTo(barX + barWidth - 1, glitchY + 2 - radius);
            ctx.quadraticCurveTo(barX + barWidth - 1, glitchY + 2, barX + barWidth - 1 - radius, glitchY + 2);
            ctx.lineTo(barX + radius, glitchY + 2);
            ctx.quadraticCurveTo(barX, glitchY + 2, barX, glitchY + 2 - radius);
            ctx.lineTo(barX, glitchY + radius);
            ctx.quadraticCurveTo(barX, glitchY, barX + radius, glitchY);
            ctx.closePath();
            ctx.fill();
        }
        
        // Draw digital scan lines with rounded effect
        if (i % 4 === 0) {
            ctx.strokeStyle = applyAlphaToColor('#00FFFF', 0.4);
            ctx.lineWidth = 1;
            
            // Create rounded scan line
            const scanRadius = Math.min(barWidth * 0.2, 2);
            ctx.beginPath();
            ctx.moveTo(barX + scanRadius, y);
            ctx.lineTo(barX + barWidth - 1 - scanRadius, y);
            ctx.quadraticCurveTo(barX + barWidth - 1, y, barX + barWidth - 1, y + scanRadius);
            ctx.lineTo(barX + barWidth - 1, y + barHeight - scanRadius);
            ctx.quadraticCurveTo(barX + barWidth - 1, y + barHeight, barX + barWidth - 1 - scanRadius, y + barHeight);
            ctx.lineTo(barX + scanRadius, y + barHeight);
            ctx.quadraticCurveTo(barX, y + barHeight, barX, y + barHeight - scanRadius);
            ctx.lineTo(barX, y + scanRadius);
            ctx.quadraticCurveTo(barX, y, barX + scanRadius, y);
            ctx.closePath();
        ctx.stroke();
        }
    }
    
    // Draw central digital core
    const coreRadius = 30 + normalizedBass * 60 * sensitivity;
    const coreGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, coreRadius);
    coreGradient.addColorStop(0, '#FFFFFF');
    coreGradient.addColorStop(0.3, colors.accent);
    coreGradient.addColorStop(0.7, colors.primary);
    coreGradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = coreGradient;
    ctx.shadowColor = colors.accent;
    ctx.shadowBlur = 30;
    ctx.beginPath();
    ctx.arc(centerX, centerY, coreRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw rotating digital rings
    const numRings = 3;
    for (let i = 0; i < numRings; i++) {
        const ringRadius = coreRadius + 20 + i * 15;
        const rotationSpeed = frame * (0.02 + i * 0.01);
        const ringOpacity = 0.4 - i * 0.1;
        
        ctx.strokeStyle = applyAlphaToColor(colors.accent, ringOpacity);
        ctx.lineWidth = 2;
        ctx.setLineDash([10, 10]);
        
        // Create segmented ring effect
        const segments = 8;
        for (let j = 0; j < segments; j++) {
            const startAngle = (j / segments) * Math.PI * 2 + rotationSpeed;
            const endAngle = ((j + 1) / segments) * Math.PI * 2 + rotationSpeed;
            
            ctx.beginPath();
            ctx.arc(centerX, centerY, ringRadius, startAngle, endAngle);
            ctx.stroke();
        }
    }
    ctx.setLineDash([]);
    
    ctx.restore();
};
const drawRepulsorField = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array | null, width: number, height: number, frame: number, sensitivity: number, colors: Palette, graphicEffect: GraphicEffectType, isBeat?: boolean, waveformStroke?: boolean, particles?: Particle[]) => {
    if (!dataArray) return;
    ctx.save();
    const centerX = width / 2;
    const centerY = height / 2;

    // Define the boundary for particles (circular field)
    const fieldRadius = Math.min(width, height) * 0.35;
    
    // Draw enhanced field boundary with pulsing effect
    const bass = dataArray.slice(0, 32).reduce((a, b) => a + b, 0) / 32;
    const normalizedBass = bass / 255;
    const pulseRadius = fieldRadius + normalizedBass * 20 * sensitivity;
    
    // Draw multiple boundary rings for enhanced effect
    for (let i = 0; i < 3; i++) {
        const ringRadius = pulseRadius - i * 8;
        const alpha = 0.4 - i * 0.1;
        const lineWidth = 3 - i * 0.5;
        
        ctx.strokeStyle = applyAlphaToColor(colors.accent, alpha);
        ctx.lineWidth = lineWidth;
        ctx.setLineDash([8, 8]);
    ctx.beginPath();
        ctx.arc(centerX, centerY, ringRadius, 0, Math.PI * 2);
    ctx.stroke();
    }
    ctx.setLineDash([]);

    // Draw energy field lines radiating from center
    const numLines = 12;
    for (let i = 0; i < numLines; i++) {
        const angle = (i / numLines) * Math.PI * 2 + frame * 0.01;
        const lineLength = fieldRadius * 0.3 + normalizedBass * 50 * sensitivity;
        
        ctx.strokeStyle = applyAlphaToColor(colors.primary, 0.3);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
            centerX + Math.cos(angle) * lineLength,
            centerY + Math.sin(angle) * lineLength
        );
        ctx.stroke();
    }

    // The particle updates happen in the main loop, so we just draw here.
    if (particles) {
        particles.forEach(p => {
            // Enhanced particle physics with audio-reactive speed
            const distanceFromCenter = Math.sqrt((p.x - centerX) ** 2 + (p.y - centerY) ** 2);
            
            // Audio-reactive particle speed
            const speedMultiplier = 1 + normalizedBass * 3 * sensitivity;
            p.vx *= speedMultiplier;
            p.vy *= speedMultiplier;
            
            if (distanceFromCenter > fieldRadius) {
                // Push particle back to boundary with enhanced bounce
                const angle = Math.atan2(p.y - centerY, p.x - centerX);
                p.x = centerX + Math.cos(angle) * fieldRadius;
                p.y = centerY + Math.sin(angle) * fieldRadius;
                
                // Enhanced bounce with energy loss
                const normalX = Math.cos(angle);
                const normalY = Math.sin(angle);
                const dotProduct = p.vx * normalX + p.vy * normalY;
                p.vx = (p.vx - 2 * dotProduct * normalX) * 0.8;
                p.vy = (p.vy - 2 * dotProduct * normalY) * 0.8;
            }
            
            // Draw enhanced particles with glow effect
            ctx.save();
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 15;
            
            // Draw particle core
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = applyAlphaToColor(p.color, p.opacity * 0.9);
            ctx.fill();
            
            // Draw particle glow
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius * 1.5, 0, Math.PI * 2);
            ctx.fillStyle = applyAlphaToColor(p.color, p.opacity * 0.3);
            ctx.fill();
            
            ctx.restore();
        });
    }

    // Draw enhanced central core with multiple layers
    const coreRadius = width * 0.02 + normalizedBass * 50 * sensitivity;
    
    // Inner core
    const innerCoreGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, coreRadius);
    innerCoreGradient.addColorStop(0, '#FFFFFF');
    innerCoreGradient.addColorStop(0.3, applyAlphaToColor(colors.accent, 0.9));
    innerCoreGradient.addColorStop(0.7, applyAlphaToColor(colors.primary, 0.7));
    innerCoreGradient.addColorStop(1, 'transparent');
    
    ctx.fillStyle = innerCoreGradient;
    ctx.shadowColor = colors.primary;
    ctx.shadowBlur = isBeat ? 50 : 25;
    ctx.beginPath();
    ctx.arc(centerX, centerY, coreRadius * 1.2, 0, Math.PI * 2);
    ctx.fill();
    
    // Outer energy ring
    const outerRingRadius = coreRadius * 2 + normalizedBass * 30 * sensitivity;
    ctx.strokeStyle = applyAlphaToColor(colors.accent, 0.6);
    ctx.lineWidth = 4;
    ctx.shadowBlur = 20;
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRingRadius, 0, Math.PI * 2);
    ctx.stroke();
    
    ctx.restore();
};

const drawAudioLandscape = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array | null, width: number, height: number, frame: number, sensitivity: number, colors: Palette, graphicEffect: GraphicEffectType, isBeat?: boolean, waveformStroke?: boolean) => {
    if (!dataArray) return;
    ctx.save();
    
    const centerX = width / 2;
    const centerY = height * 0.6; // Push the horizon up
    const fov = width * 0.8; // Field of view
    
    // Grid properties
    const gridSizeX = 40;
    const gridSizeZ = 30;
    const spacing = width / gridSizeX * 1.2;
    const maxTerrainHeight = height * 0.2;

    const angle = frame * 0.002; // Slow rotation

    const project = (x3d: number, y3d: number, z3d: number) => {
        // Rotate around Y axis
        const rotX = x3d * Math.cos(angle) - z3d * Math.sin(angle);
        const rotZ = x3d * Math.sin(angle) + z3d * Math.cos(angle);
        
        const scale = fov / (fov + rotZ);
        const x2d = rotX * scale + centerX;
        const y2d = y3d * scale + centerY;
        return { x: x2d, y: y2d, scale };
    };

    ctx.strokeStyle = colors.primary;
    ctx.shadowColor = colors.primary;
    ctx.shadowBlur = 5;
    ctx.lineWidth = 1.5;

    for (let z = 0; z < gridSizeZ; z++) {
        ctx.beginPath();
        let firstPointProjected = null;

        for (let x = 0; x < gridSizeX; x++) {
            const dataIndex = Math.floor((x / gridSizeX) * (dataArray.length * 0.6));
            const terrainHeight = Math.pow(dataArray[dataIndex] / 255.0, 2) * maxTerrainHeight * sensitivity;
            
            const x3d = (x - gridSizeX / 2) * spacing;
            const y3d = -terrainHeight;
            const z3d = (z - gridSizeZ / 2) * spacing;

            const p = project(x3d, y3d, z3d);
            
            if (p.scale <= 0) continue; // Clip points behind the camera

            if (firstPointProjected === null) {
                ctx.moveTo(p.x, p.y);
                firstPointProjected = p;
            } else {
                ctx.lineTo(p.x, p.y);
            }
        }
        
        if (firstPointProjected) {
            const zProgress = z / gridSizeZ;
            const [startHue, endHue] = colors.hueRange;
            const hue = startHue + (zProgress * (endHue - startHue));
            const lightness = 40 + zProgress * 30;
            ctx.strokeStyle = `hsla(${hue}, 90%, ${lightness}%, ${1 - zProgress * 0.7})`;
            ctx.shadowColor = `hsla(${hue}, 90%, ${lightness}%, ${1 - zProgress * 0.7})`;
            ctx.stroke();
        }
    }
    
    ctx.restore();
};
// 可夜特別訂製版可視化
const drawGeometricBars = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array | null, width: number, height: number, frame: number, sensitivity: number, colors: Palette, graphicEffect: GraphicEffectType, isBeat?: boolean, waveformStroke?: boolean, particles?: Particle[], geometricFrameImage?: HTMLImageElement | null, geometricSemicircleImage?: HTMLImageElement | null, props?: any, controlCardEnabled?: boolean, controlCardFontSize?: number, controlCardStyle?: ControlCardStyle, controlCardColor?: string, controlCardBackgroundColor?: string) => {
    if (!dataArray) return;
    ctx.save();
    
    const centerX = width / 2;
    const centerY = height * 0.4; // 上移中心點，減少上方留白
    
    // 音頻分析
    const bass = dataArray.slice(0, 32).reduce((a, b) => a + b, 0) / 32;
    const mid = dataArray.slice(32, 96).reduce((a, b) => a + b, 0) / 64;
    const treble = dataArray.slice(96, 128).reduce((a, b) => a + b, 0) / 32;
    
    const normalizedBass = bass / 255;
    const normalizedMid = mid / 255;
    const normalizedTreble = treble / 255;
    
    // 1. 中央正方形 (使用貝茲曲線)
    const frameSize = Math.min(width * 0.4, height * 0.5); // 正方形，取較小值
    const frameX = centerX - frameSize / 2;
    const frameY = centerY - frameSize / 2;
    
    // 方框背景
    if (geometricFrameImage) {
        ctx.drawImage(geometricFrameImage, frameX, frameY, frameSize, frameSize);
    } else {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.fillRect(frameX, frameY, frameSize, frameSize);
    }
    
    // 計算震動強度
    const bassIntensity = dataArray ? dataArray[0] / 255 : 0;
    const midIntensity = dataArray ? dataArray[Math.floor(dataArray.length * 0.3)] / 255 : 0;
    const highIntensity = dataArray ? dataArray[Math.floor(dataArray.length * 0.7)] / 255 : 0;
    
    // 震動幅度 (根據頻率強度)
    const vibrationAmplitude = 8;
    const bassVibration = bassIntensity * vibrationAmplitude;
    const midVibration = midIntensity * vibrationAmplitude * 0.7;
    const highVibration = highIntensity * vibrationAmplitude * 0.5;
    
    // 貝茲曲線方框邊框 (隨音樂震動)
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    // 左上角 (隨高音震動)
    ctx.moveTo(frameX + 10 + highVibration, frameY + highVibration);
    ctx.bezierCurveTo(
        frameX + highVibration, frameY + highVibration, 
        frameX + highVibration, frameY + highVibration, 
        frameX + highVibration, frameY + 10 + highVibration
    );
    
    // 左邊 (隨中音震動)
    ctx.lineTo(frameX + midVibration, frameY + frameSize - 10 + midVibration);
    ctx.bezierCurveTo(
        frameX + midVibration, frameY + frameSize + midVibration, 
        frameX + midVibration, frameY + frameSize + midVibration, 
        frameX + 10 + midVibration, frameY + frameSize + midVibration
    );
    
    // 下邊 (隨低音震動)
    ctx.lineTo(frameX + frameSize - 10 + bassVibration, frameY + frameSize + bassVibration);
    ctx.bezierCurveTo(
        frameX + frameSize + bassVibration, frameY + frameSize + bassVibration, 
        frameX + frameSize + bassVibration, frameY + frameSize + bassVibration, 
        frameX + frameSize + bassVibration, frameY + frameSize - 10 + bassVibration
    );
    
    // 右邊 (隨中音震動)
    ctx.lineTo(frameX + frameSize + midVibration, frameY + 10 + midVibration);
    ctx.bezierCurveTo(
        frameX + frameSize + midVibration, frameY + midVibration, 
        frameX + frameSize + midVibration, frameY + midVibration, 
        frameX + frameSize - 10 + midVibration, frameY + midVibration
    );
    
    // 上邊 (隨高音震動)
    ctx.lineTo(frameX + 10 + highVibration, frameY + highVibration);
    
    ctx.stroke();
    
    // 2. 右側半圓 (直徑等於正方形邊長，被正方形遮住一半)
    const semicircleRadius = frameSize / 2; // 半徑等於正方形邊長的一半
    const semicircleCenterX = frameX + frameSize; // 圓形中心在正方形右邊
    const semicircleCenterY = centerY;
    
    // 半圓背景和旋轉
    ctx.save();
    
    // 設置裁剪區域，只顯示右半圓
    ctx.beginPath();
    ctx.arc(semicircleCenterX, semicircleCenterY, semicircleRadius, -Math.PI/2, Math.PI/2); // 只繪製右半圓
    ctx.clip();
    
    // 旋轉內部內容
    ctx.translate(semicircleCenterX, semicircleCenterY);
    ctx.rotate((frame * 0.01) % (Math.PI * 2));
    
    if (geometricSemicircleImage) {
        ctx.drawImage(geometricSemicircleImage, -semicircleRadius, -semicircleRadius, semicircleRadius * 2, semicircleRadius * 2);
    } else {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(0, 0, semicircleRadius, 0, Math.PI * 2); // 完整圓形
        ctx.fill();
    }
    
    ctx.restore();
    
    // 繪製固定的半圓邊框
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(semicircleCenterX, semicircleCenterY, semicircleRadius, -Math.PI/2, Math.PI/2);
    ctx.stroke();
    
    // 3. 左側聲波橫條 (從正方形左邊向左延伸) - 新樣式：寬線條、圓角、無空隙
    const numBars = 18; // 減少條數，讓每條更寬
    const barThickness = Math.max(12, frameSize / numBars * 0.8); // 動態調整厚度，確保無空隙
    const maxBarLength = frameSize * 0.9; // 最大條長度
    
    // 聲波條的起始位置（正方形左邊）
    const barStartX = frameX;
    const startY = frameY + frameSize; // 從正方形左下角開始
    const endY = frameY; // 到正方形左上角結束
    
    // 計算每條的垂直間距，確保無空隙
    const totalBarHeight = frameSize;
    const barSpacing = totalBarHeight / numBars;
    
    for (let i = 0; i < numBars; i++) {
        const dataIndex = Math.floor((i / numBars) * dataArray.length);
        const amplitude = dataArray[dataIndex] / 255;
        const barLength = Math.pow(amplitude, 1.2) * maxBarLength * sensitivity; // 調整振幅曲線
        
        if (barLength < 3) continue; // 最小長度
        
        // 計算條的垂直位置（確保無空隙）
        const barY = startY - (i * barSpacing + barSpacing / 2); // 居中對齊
        
        // 使用快速設置的顏色主題
        let color;
        if (colors.name === ColorPaletteType.WHITE) {
            const lightness = 85 + (amplitude * 15);
            color = `hsla(220, 10%, ${lightness}%, ${0.8 + amplitude * 0.2})`;
        } else if (colors.name === ColorPaletteType.RAINBOW) {
            const hue = (i / numBars) * 360; // 全色譜
            const saturation = 85 + amplitude * 15;
            const lightness = 55 + amplitude * 25;
            color = `hsla(${hue}, ${saturation}%, ${lightness}%, ${0.8 + amplitude * 0.2})`;
        } else {
            // 使用主題的色調範圍
            const [startHue, endHue] = colors.hueRange;
            const hueRangeSpan = endHue - startHue;
            const hue = startHue + ((i / numBars) * hueRangeSpan);
            const saturation = 85 + amplitude * 15;
            const lightness = 55 + amplitude * 25;
            color = `hsla(${hue}, ${saturation}%, ${lightness}%, ${0.8 + amplitude * 0.2})`;
        }
        
        ctx.fillStyle = color;
        
        // 繪製橫向條（向左延伸）
        const barX = barStartX - barLength; // 從方框左邊向左延伸
        
        // 繪製圓角矩形條 - 更大的圓角
        const radius = Math.min(barThickness * 0.4, 8); // 增加圓角大小
        createRoundedRectPath(ctx, barX, barY - barThickness / 2, barLength, barThickness, radius);
        ctx.fill();
        
        // 發光效果 - 使用主題顏色
        if (amplitude > 0.5) {
            // 提取色調用於發光效果
            const hueMatch = color.match(/hsl\(([^,]+)/);
            const hue = hueMatch ? parseFloat(hueMatch[1]) : 220;
            const saturation = 85 + amplitude * 15;
            const lightness = 55 + amplitude * 25;
            
            ctx.shadowColor = `hsla(${hue}, ${saturation}%, ${lightness + 20}%, 0.6)`;
            ctx.shadowBlur = Math.max(5, amplitude * 20);
            ctx.fill();
            ctx.shadowBlur = 0;
        }
        
        // 高振幅時的特殊效果
        if (isBeat && amplitude > 0.8) {
            // 使用更亮的顏色
            const hueMatch = color.match(/hsl\(([^,]+)/);
            const hue = hueMatch ? parseFloat(hueMatch[1]) : 220;
            const saturation = 85 + amplitude * 15;
            const lightness = 55 + amplitude * 25;
            
            ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness + 30}%, 0.9)`;
            createRoundedRectPath(ctx, barX, barY - barThickness / 2, barLength, barThickness, radius);
            ctx.fill();
        }
    }
    
    // 4. 圓形內部的月牙形（只在沒有自定義圖片時顯示）
    if (!geometricSemicircleImage) {
        const crescentRadius = semicircleRadius * 0.6;
        const crescentOffset = semicircleRadius * 0.3;
        
        ctx.save();
        
        // 設置裁剪區域，只顯示右半圓
        ctx.beginPath();
        ctx.arc(semicircleCenterX, semicircleCenterY, semicircleRadius, -Math.PI/2, Math.PI/2);
        ctx.clip();
        
        // 旋轉內部內容
        ctx.translate(semicircleCenterX, semicircleCenterY);
        ctx.rotate((frame * 0.01) % (Math.PI * 2));
        
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(crescentOffset, 0, crescentRadius, 0, Math.PI * 2);
        ctx.arc(0, 0, crescentRadius, 0, Math.PI * 2);
        ctx.fill('evenodd');
        ctx.globalAlpha = 1;
        
        ctx.restore();
    }
    
    // 5. 底部假播放器 (卡片風格 + 持續抖動 + 真實秒數) - 可選顯示
    if (controlCardEnabled !== false) {
        // 控制卡寬度也根據字體大小等比例調整
        const baseWidth = frameSize;
        const cardFontSize = controlCardFontSize || 24;
        // 限制字體大小的影響，避免控制卡過大
        const maxFontSize = 100;
        const clampedFontSize = Math.min(cardFontSize, maxFontSize);
        const widthMultiplier = Math.max(1.0, clampedFontSize / 24); // 字體越大，寬度也越大
        const playerWidth = Math.min(baseWidth * widthMultiplier, width * 0.8); // 最大不超過80%寬度
        // 動態調整控制卡高度，增加空間給按鈕
        const baseHeight = height * 0.18; // 從 0.15 增加到 0.18，增加控制卡高度
        // 更靈活的高度計算：字體越大，控制卡越大
        const heightMultiplier = Math.max(1.2, clampedFontSize / 20); // 從 24 改為 20，讓控制卡更容易放大
        let playerHeight = Math.min(baseHeight * heightMultiplier, height * 0.45); // 從 0.4 增加到 0.45，允許更大的控制卡
        const playerX = centerX - playerWidth / 2;
        // 動態調整Y位置，將控制卡片往下移，與上方框架拉開距離
        const baseY = height * 0.70; // 從 0.65 改為 0.70，往下移以增加與上方框架的距離
        const yOffset = (clampedFontSize - 24) * 0.3; // 增加偏移量
        let playerY = Math.max(height * 0.55, Math.min(baseY - yOffset, height * 0.8)); // 最低55%，最高80%
        
        // 檢查控制卡是否超出畫布邊界
        if (playerY + playerHeight > height - 10) {
            const adjustedPlayerY = height - playerHeight - 10;
            if (adjustedPlayerY < height * 0.6) {
                // 如果調整後位置太低，則縮小控制卡高度
                const maxAllowedHeight = height * 0.25;
                const finalPlayerHeight = Math.min(playerHeight, maxAllowedHeight);
                playerY = height - finalPlayerHeight - 10;
                playerHeight = finalPlayerHeight;
            } else {
                playerY = adjustedPlayerY;
            }
        }
        
        // 持續的小抖動
        const baseShake = Math.sin(frame * 0.1) * 1.5;
        const shakeX = baseShake + Math.sin(frame * 0.07) * 0.8;
        const shakeY = Math.cos(frame * 0.13) * 1.2;
        
        // 卡片背景 - 根據樣式決定
        const cardStyle = controlCardStyle || ControlCardStyle.FILLED;
        const cardBgColor = controlCardBackgroundColor || 'rgba(100, 120, 100, 0.9)';
        const cardColor = controlCardColor || '#ffffff';
        
        if (cardStyle === ControlCardStyle.FILLED || cardStyle === ControlCardStyle.OUTLINE) {
            if (cardStyle === ControlCardStyle.FILLED) {
                ctx.fillStyle = cardBgColor;
            } else {
                ctx.strokeStyle = cardColor;
                ctx.lineWidth = 2;
            }
            
            ctx.beginPath();
            const cornerRadius = 16 + Math.sin(frame * 0.05) * 1;
            ctx.moveTo(playerX + cornerRadius + shakeX, playerY + shakeY);
            ctx.lineTo(playerX + playerWidth - cornerRadius + shakeX, playerY + shakeY);
            ctx.quadraticCurveTo(playerX + playerWidth + shakeX, playerY + shakeY, playerX + playerWidth + shakeX, playerY + cornerRadius + shakeY);
            ctx.lineTo(playerX + playerWidth + shakeX, playerY + playerHeight - cornerRadius + shakeY);
            ctx.quadraticCurveTo(playerX + playerWidth + shakeX, playerY + playerHeight + shakeY, playerX + playerWidth - cornerRadius + shakeX, playerY + playerHeight + shakeY);
            ctx.lineTo(playerX + cornerRadius + shakeX, playerY + playerHeight + shakeY);
            ctx.quadraticCurveTo(playerX + shakeX, playerY + playerHeight + shakeY, playerX + shakeX, playerY + playerHeight - cornerRadius + shakeY);
            ctx.lineTo(playerX + shakeX, playerY + cornerRadius + shakeY);
            ctx.quadraticCurveTo(playerX + shakeX, playerY + shakeY, playerX + cornerRadius + shakeX, playerY + shakeY);
            
            if (cardStyle === ControlCardStyle.FILLED) {
                ctx.fill();
            } else {
                ctx.stroke();
            }
        }
    
        // 專輯封面 (左上角) - 重新定義變數
        const albumSize = playerHeight * 0.12; // 12% 高度
        const albumX = playerX + (playerWidth * 0.05) + shakeX; // 5% 左邊距
        const albumY = playerY + (playerHeight * 0.02) + shakeY; // 2% 頂部間距
    
    // 專輯封面背景 - 使用控制卡顏色和透明度
    // (cardStyle, cardBgColor, cardColor 已在上面定義，重複使用)
    
    // 根據控制卡樣式調整專輯封面透明度
    let albumOpacity = 0.6;
    if (cardStyle === ControlCardStyle.OUTLINE) {
        albumOpacity = 0.3; // 外框模式：更透明
    } else if (cardStyle === ControlCardStyle.TRANSPARENT) {
        albumOpacity = 0.4; // 透明模式：中等透明度
    }
    
    // 使用控制卡背景顏色，但調整透明度和色調變化
    let albumBgColor;
    if (cardBgColor.startsWith('rgba')) {
        // 提取 rgba 值並調整色調
        const rgbaMatch = cardBgColor.match(/rgba?\(([^)]+)\)/);
        if (rgbaMatch) {
            const values = rgbaMatch[1].split(',').map(v => parseFloat(v.trim()));
            const [r, g, b] = values;
            // 增加色調變化：稍微調整 RGB 值創造落差
            const adjustedR = Math.max(0, Math.min(255, r * 0.8 + 20));
            const adjustedG = Math.max(0, Math.min(255, g * 0.8 + 20));
            const adjustedB = Math.max(0, Math.min(255, b * 0.8 + 20));
            albumBgColor = `rgba(${adjustedR}, ${adjustedG}, ${adjustedB}, ${albumOpacity})`;
        } else {
            albumBgColor = cardBgColor.replace(/[\d\.]+\)$/g, `${albumOpacity})`);
        }
    } else if (cardBgColor.startsWith('rgb')) {
        // 提取 rgb 值並調整色調
        const rgbMatch = cardBgColor.match(/rgb\(([^)]+)\)/);
        if (rgbMatch) {
            const values = rgbMatch[1].split(',').map(v => parseInt(v.trim()));
            const [r, g, b] = values;
            // 增加色調變化
            const adjustedR = Math.max(0, Math.min(255, Math.floor(r * 0.8 + 20)));
            const adjustedG = Math.max(0, Math.min(255, Math.floor(g * 0.8 + 20)));
            const adjustedB = Math.max(0, Math.min(255, Math.floor(b * 0.8 + 20)));
            albumBgColor = `rgba(${adjustedR}, ${adjustedG}, ${adjustedB}, ${albumOpacity})`;
        } else {
            albumBgColor = cardBgColor.replace('rgb(', 'rgba(').replace(')', `, ${albumOpacity})`);
        }
    } else {
        // 如果是十六進制顏色，轉換為rgba並調整色調
        const hex = cardBgColor.replace('#', '');
        const r = parseInt(hex.substr(0, 2), 16);
        const g = parseInt(hex.substr(2, 2), 16);
        const b = parseInt(hex.substr(4, 2), 16);
        // 增加色調變化
        const adjustedR = Math.max(0, Math.min(255, Math.floor(r * 0.8 + 20)));
        const adjustedG = Math.max(0, Math.min(255, Math.floor(g * 0.8 + 20)));
        const adjustedB = Math.max(0, Math.min(255, Math.floor(b * 0.8 + 20)));
        albumBgColor = `rgba(${adjustedR}, ${adjustedG}, ${adjustedB}, ${albumOpacity})`;
    }
    
    ctx.fillStyle = albumBgColor;
    ctx.beginPath();
    const albumRadius = 8 + Math.sin(frame * 0.03) * 0.5;
    ctx.moveTo(albumX + albumRadius, albumY);
    ctx.lineTo(albumX + albumSize - albumRadius, albumY);
    ctx.quadraticCurveTo(albumX + albumSize, albumY, albumX + albumSize, albumY + albumRadius);
    ctx.lineTo(albumX + albumSize, albumY + albumSize - albumRadius);
    ctx.quadraticCurveTo(albumX + albumSize, albumY + albumSize, albumX + albumSize - albumRadius, albumY + albumSize);
    ctx.lineTo(albumX + albumRadius, albumY + albumSize);
    ctx.quadraticCurveTo(albumX, albumY + albumSize, albumX, albumY + albumSize - albumRadius);
    ctx.lineTo(albumX, albumY + albumRadius);
    ctx.quadraticCurveTo(albumX, albumY, albumX + albumRadius, albumY);
    ctx.fill();
    
    // 專輯封面裝飾 (抽象圖案) - 使用控制卡文字顏色
    ctx.fillStyle = cardColor;
    ctx.strokeStyle = cardColor;
    
    // 波浪線
    ctx.beginPath();
    for (let i = 0; i < albumSize; i += 2) {
        const x = albumX + i;
        const y = albumY + albumSize * 0.3 + Math.sin(i * 0.1 + frame * 0.05) * 8;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // 小圓點
    for (let i = 0; i < 3; i++) {
        const dotX = albumX + albumSize * 0.2 + i * albumSize * 0.3;
        const dotY = albumY + albumSize * 0.7;
        ctx.beginPath();
        ctx.arc(dotX, dotY, 3, 0, Math.PI * 2);
        ctx.fill();
    }
    
    // 歌曲資訊 (右側) - 重新定義變數
        const infoX = albumX + albumSize + (playerWidth * 0.05); // 5% 間距
        const infoY = playerY + (playerHeight * 0.18); // 18% 位置
        const dynamicSpacing = playerHeight * 0.08; // 8% 行距
        
        // 歌曲名稱 - 使用百分比字體大小
        ctx.fillStyle = cardColor;
        const songFontSize = Math.min(clampedFontSize + 2, playerHeight * 0.2); // 20% 高度
        ctx.font = `bold ${songFontSize}px Arial`;
        ctx.textAlign = 'left';
        const songName = props.geometricSongName || 'Name of the song';
        const songNameY = infoY + Math.cos(frame * 0.03) * 0.3;
        
        // 確保歌曲名稱在控制卡內，不超出頂部邊界
        const songNameHeight = Math.min(clampedFontSize + 2, 60);
        const minSongNameY = playerY + songNameHeight + 15; // 控制卡頂部 + 字體高度 + 15px間距
        const adjustedSongNameY = Math.max(songNameY, minSongNameY);
        
        ctx.fillText(songName, infoX + Math.sin(frame * 0.02) * 0.5, adjustedSongNameY);
        
        // 歌手名稱 - 使用百分比字體大小
        const artistFontSize = Math.min(clampedFontSize, playerHeight * 0.15); // 15% 高度
        ctx.font = `${artistFontSize}px Arial`;
        ctx.fillStyle = cardStyle === ControlCardStyle.OUTLINE ? cardColor : 'rgba(255, 255, 255, 0.8)';
        const artistName = props.geometricArtistName || 'Artist';
        const artistNameY = adjustedSongNameY + dynamicSpacing + Math.cos(frame * 0.035) * 0.2;
        
        // 確保歌手名稱在控制卡內，不超出頂部邊界
        const artistNameHeight = Math.min(clampedFontSize, 55);
        const minArtistNameY = playerY + songNameHeight + artistNameHeight + 25; // 控制卡頂部 + 歌名高度 + 歌手高度 + 25px間距
        const adjustedArtistNameY = Math.max(artistNameY, minArtistNameY);
        
        ctx.fillText(artistName, infoX + Math.sin(frame * 0.025) * 0.3, adjustedArtistNameY);
    
        // 右上角圖標 - 調整位置避免與文字和進度條重疊
        const iconSpacing = Math.max(80, clampedFontSize * 1.5); // 根據字體大小調整右邊距，最小80px
        const iconX = playerX + playerWidth - iconSpacing + shakeX;
        const iconY = Math.max(adjustedSongNameY, albumY + 25) + shakeY; // 從 10 增加到 25，增加間距
        
        // 檢查文字寬度，避免與圖標重疊
        const songNameText = props.geometricSongName || 'Name of the song';
        const songNameWidth = ctx.measureText(songNameText).width;
        const maxTextWidth = iconX - infoX - 20; // 留出20px間距
        
        // 如果文字太長，調整圖標位置
        const adjustedIconX = songNameWidth > maxTextWidth ? infoX + songNameWidth + 30 : iconX;
        
        // 耳機圖標
        ctx.fillStyle = cardColor;
        ctx.font = `${Math.min(clampedFontSize + 4, 70)}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText('🎧', adjustedIconX + Math.sin(frame * 0.04) * 0.3, iconY + Math.cos(frame * 0.05) * 0.2);
        
        // 三點菜單 - 增加間距避免與耳機重疊
        const threeDotsSpacing = Math.max(40, clampedFontSize * 0.8); // 根據字體大小調整間距，最小40px
        ctx.fillText('⋯', adjustedIconX + threeDotsSpacing + Math.sin(frame * 0.06) * 0.2, iconY + Math.cos(frame * 0.04) * 0.2);
    
        // 重新規劃控制卡空間配置 - 明確分配每個區域的百分比
        // 控制卡總高度分配：
        // 0-15%: 專輯封面區域
        // 15-35%: 歌曲資訊區域  
        // 35-50%: 波形顯示區域
        // 50-70%: 進度條區域
        // 70-85%: 時間顯示區域
        // 85-100%: 控制按鈕區域
        
        // 專輯封面 (左上角) - 0-15% 區域
        // albumSize, albumX, albumY 已在上面定義
        
        // 歌曲資訊 (右側) - 15-35% 區域
        // infoX, infoY, dynamicSpacing 已在上面定義
        
        // 波形顯示區域 - 35-50% 區域
        const waveformY = playerY + (playerHeight * 0.40); // 40% 位置
        
        // 進度條區域 - 50-70% 區域
        const progressBarWidth = playerWidth * 0.9; // 90% 寬度
        const progressBarHeight = playerHeight * 0.06; // 6% 高度
        const progressBarX = playerX + (playerWidth * 0.05) + shakeX; // 5% 左邊距
        const progressBarY = playerY + (playerHeight * 0.55) + shakeY; // 55% 位置
        
        // 時間顯示區域 - 70-85% 區域
        const timeY = playerY + (playerHeight * 0.72); // 72% 位置
        
        // 進度條背景
        ctx.fillStyle = cardStyle === ControlCardStyle.OUTLINE ? 'rgba(255, 255, 255, 0.3)' : 'rgba(255, 255, 255, 0.3)';
        ctx.fillRect(progressBarX, progressBarY, progressBarWidth, progressBarHeight);
        
        // 進度條 (真實秒數控制)
        const currentTime = props.audioRef?.current?.currentTime || 0;
        const totalSeconds = props.audioRef?.current?.duration || 240; // 使用實際音頻長度
        const progress = totalSeconds > 0 ? Math.min(currentTime / totalSeconds, 1) : 0;
        const currentProgressWidth = progressBarWidth * progress;
        
        ctx.fillStyle = cardColor;
        ctx.fillRect(progressBarX, progressBarY, currentProgressWidth, progressBarHeight);
        
        // 時間顯示 - 使用新的區域配置
        ctx.fillStyle = cardColor;
        const timeFontSize = Math.min(clampedFontSize * 0.6, playerHeight * 0.10); // 10% 高度
        ctx.font = `${timeFontSize}px Arial`;
        const safeTimeY = timeY; // 使用新的時間區域位置
        ctx.textAlign = 'left';
        const currentMinutes = Math.floor(currentTime / 60);
        const currentSecs = Math.floor(currentTime % 60);
        const totalMinutes = Math.floor(totalSeconds / 60);
        const totalSecs = Math.floor(totalSeconds % 60);
        
        // 確保時間顯示不會與背景重疊，增加額外的安全間距
        // safeTimeY 已在上面定義為 timeY
        ctx.fillText(`${currentMinutes}:${currentSecs.toString().padStart(2, "0")}`, progressBarX + Math.sin(frame * 0.02) * 0.3, safeTimeY + Math.cos(frame * 0.03) * 0.2);
        
        ctx.textAlign = 'right';
        ctx.fillText(`${totalMinutes}:${totalSecs.toString().padStart(2, "0")}`, progressBarX + progressBarWidth + Math.sin(frame * 0.025) * 0.3, safeTimeY + Math.cos(frame * 0.035) * 0.2);
        
        // 控制按鈕區域 - 85-100% 區域
        const buttonY = playerY + (playerHeight * 0.90) + shakeY; // 90% 位置
        
        // 控制按鈕區域 - 使用新的區域配置
        const buttonSpacing = playerWidth * 0.08; // 8% 間距
        const startX = playerX + playerWidth / 2 - (buttonSpacing * 2) + shakeX;
        
        // 設定按鈕字體大小
        const buttonFontSize = Math.min(clampedFontSize + 2, playerHeight * 0.12); // 12% 高度
        ctx.font = `${buttonFontSize}px Arial`;
        ctx.textAlign = 'center';
        
        // 隨機播放按鈕
        const shuffleX = startX;
        ctx.fillStyle = cardColor;
        ctx.fillText('🔀', shuffleX + Math.sin(frame * 0.03) * 0.3, buttonY + Math.cos(frame * 0.04) * 0.2);
        
        // 前一首按鈕
        const prevX = startX + buttonSpacing;
        ctx.fillText('⏮', prevX + Math.sin(frame * 0.035) * 0.2, buttonY + Math.cos(frame * 0.045) * 0.2);
        
        // 播放/暫停按鈕 (中央大按鈕) - 動態調整大小
        const playX = startX + buttonSpacing * 2;
        const baseRadius = Math.max(20, Math.min(clampedFontSize * 0.8, 80)); // 根據字體大小調整按鈕半徑
        const playRadius = baseRadius + Math.sin(frame * 0.08) * 1;
        ctx.fillStyle = cardColor;
        ctx.beginPath();
        ctx.arc(playX, buttonY, playRadius, 0, Math.PI * 2);
        ctx.fill();
        
        // 暫停圖標 (兩條豎線) - 動態調整大小
        const iconSize = Math.max(3, Math.min(clampedFontSize * 0.15, 15)); // 根據字體大小調整圖標大小
        const iconHeight = Math.max(16, Math.min(clampedFontSize * 0.7, 70));
        ctx.fillStyle = cardStyle === ControlCardStyle.OUTLINE ? cardColor : cardBgColor;
        ctx.fillRect(playX - iconSize * 2, buttonY - iconHeight / 2, iconSize, iconHeight);
        ctx.fillRect(playX + iconSize, buttonY - iconHeight / 2, iconSize, iconHeight);
        
        // 下一首按鈕
        const nextX = startX + buttonSpacing * 3;
        ctx.fillStyle = cardColor;
        ctx.fillText('⏭', nextX + Math.sin(frame * 0.04) * 0.2, buttonY + Math.cos(frame * 0.05) * 0.2);
        
        // 重複播放按鈕
        const repeatX = startX + buttonSpacing * 4;
        ctx.fillText('🔁', repeatX + Math.sin(frame * 0.045) * 0.3, buttonY + Math.cos(frame * 0.055) * 0.2);
    }
    
    // 7. 動態效果
    // 正方形內的掃描線
    if (isBeat) {
        const scanLineY = frameY + (frame * 2) % frameSize;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.moveTo(frameX, scanLineY);
        ctx.lineTo(frameX + frameSize, scanLineY);
        ctx.stroke();
        ctx.globalAlpha = 1;
    }
    
    // 圓形內的動態效果（只在沒有自定義圖片時顯示）
    if (!geometricSemicircleImage && normalizedBass > 0.5) {
        const pulseRadius = semicircleRadius * (0.8 + normalizedBass * 0.2);
        
        ctx.save();
        
        // 設置裁剪區域，只顯示右半圓
        ctx.beginPath();
        ctx.arc(semicircleCenterX, semicircleCenterY, semicircleRadius, -Math.PI/2, Math.PI/2);
        ctx.clip();
        
        // 旋轉內部內容
        ctx.translate(semicircleCenterX, semicircleCenterY);
        ctx.rotate((frame * 0.01) % (Math.PI * 2));
        
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.arc(0, 0, pulseRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
        
        ctx.restore();
    }
    
    ctx.restore();
};


// 繪製直式字幕
const drawVerticalSubtitle = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    text: string,
    fontSize: number,
    fontName: string,
    color: string,
    effect: GraphicEffectType,
    bgStyle: SubtitleBgStyle,
    isBeat: boolean | undefined,
    dragOffset: { x: number; y: number },
    horizontalPosition: number = 0.5, // 0.0 = 左側, 1.0 = 右側
    verticalPosition: number = 0.5, // 0.0 = 上方, 1.0 = 下方
    strokeColor?: string // 描邊顏色
) => {
    const characters = text.split('');
    const charSpacing = fontSize * 1.2; // 字元間距
    const totalHeight = charSpacing * characters.length;
    
    // 起始位置：根據位置參數計算水平和垂直位置
    const margin = width * 0.1; // 距離邊緣 10%
    const startX = margin + (width - 2 * margin) * horizontalPosition + dragOffset.x; // 根據水平位置參數計算
    const startY = margin + (height - 2 * margin - totalHeight) * verticalPosition + dragOffset.y; // 根據垂直位置參數計算
    
    ctx.save();
    // 根據特效決定字體粗細
    const fontWeight = (effect === GraphicEffectType.BOLD) ? '900' : 'bold';
    ctx.font = `${fontWeight} ${fontSize}px "${fontName}", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // 繪製背景（如果需要）
    if (bgStyle !== SubtitleBgStyle.NONE) {
        const bgPaddingX = fontSize * 0.6;
        const bgPaddingY = fontSize * 0.4;
        const bgWidth = fontSize + bgPaddingX * 2;
        const bgHeight = totalHeight + bgPaddingY * 2;
        const bgX = startX - bgWidth / 2;
        const bgY = startY - bgPaddingY;
        
        ctx.fillStyle = bgStyle === SubtitleBgStyle.BLACK ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)';
        createRoundedRectPath(ctx, bgX, bgY, bgWidth, bgHeight, 5);
        ctx.fill();
    }
    
    // 重置陰影效果
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    ctx.lineJoin = 'round';
    ctx.lineWidth = Math.max(2, fontSize / 20);
    ctx.miterLimit = 2;
    
    // 逐字繪製
    characters.forEach((char, index) => {
        const charY = startY + (index * charSpacing) + charSpacing / 2;
        
        // 1. 偽3D效果（先繪製，在後層）
        if (effect === GraphicEffectType.FAUX_3D) {
            const depth = Math.max(1, Math.floor(fontSize / 30));
            const depthColor = color.replace('rgb', 'rgba').replace(')', ', 0.6)').replace('#', 'rgba(');
            ctx.fillStyle = depthColor;
            for (let i = 1; i <= depth; i++) {
                ctx.fillText(char, startX + i, charY + i);
            }
        }
        
        // 2. 設定填充顏色
        if (effect === GraphicEffectType.NEON || effect === GraphicEffectType.GLOW) {
            ctx.fillStyle = '#FFFFFF';
        } else {
            ctx.fillStyle = color;
        }
        
        // 3. 陰影設定
        if (effect === GraphicEffectType.NEON || effect === GraphicEffectType.GLOW) {
            ctx.shadowColor = color;
            ctx.shadowBlur = 15;
        } else if (effect === GraphicEffectType.SHADOW) {
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetX = 5;
            ctx.shadowOffsetY = 5;
        }
        
        // 4. 描邊效果
        if (effect === GraphicEffectType.OUTLINE || effect === GraphicEffectType.STROKE) {
            ctx.strokeStyle = strokeColor || color; // 使用自定義描邊顏色，如果沒有則使用主顏色
            ctx.lineWidth = Math.max(2, fontSize / 20);
            ctx.lineJoin = 'round';
            ctx.miterLimit = 2;
            // 多方向描邊
            ctx.strokeText(char, startX - 1, charY - 1);
            ctx.strokeText(char, startX + 1, charY - 1);
            ctx.strokeText(char, startX - 1, charY + 1);
            ctx.strokeText(char, startX + 1, charY + 1);
            ctx.strokeText(char, startX, charY);
        }
        
        // 5. 主要文字填充
        ctx.fillText(char, startX, charY);
        
        // 5.1. 額外的霓虹光增強
        if (effect === GraphicEffectType.NEON || effect === GraphicEffectType.GLOW) {
            ctx.shadowBlur = 30;
            ctx.fillText(char, startX, charY);
        }
        
        // 重置陰影
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // 6. 故障感效果（最後繪製，在最上層）
        if (effect === GraphicEffectType.GLITCH && isBeat) {
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            const glitchIntensity = 8;
            const glitchOffsetX = (Math.random() - 0.5) * glitchIntensity;
            const glitchOffsetY = (Math.random() - 0.5) * glitchIntensity;
            
            // 紅色故障層
            ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
            ctx.fillText(char, startX + glitchOffsetX, charY + glitchOffsetY);
            
            // 藍色故障層
            ctx.fillStyle = 'rgba(0, 0, 255, 0.7)';
            ctx.fillText(char, startX - glitchOffsetX, charY - glitchOffsetY);
            
            // 綠色故障層
            ctx.fillStyle = 'rgba(0, 255, 0, 0.7)';
            ctx.fillText(char, startX + glitchOffsetX * 0.5, charY - glitchOffsetY * 0.5);
            
            ctx.globalCompositeOperation = 'source-over';
            ctx.restore();
            
            // 最後繪製正常文字
            if (effect === GraphicEffectType.NEON || effect === GraphicEffectType.GLOW) {
                ctx.fillStyle = '#FFFFFF';
            } else {
                ctx.fillStyle = color;
            }
            ctx.fillText(char, startX, charY);
        }
    });

    ctx.restore();
};

const drawSubtitles = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    currentSubtitle: Subtitle | undefined,
    { fontSizeVw, fontFamily, color, effect, bgStyle, isBeat, dragOffset = { x: 0, y: 0 }, orientation = SubtitleOrientation.HORIZONTAL, strokeColor }: {
        fontSizeVw: number;
        fontFamily: FontType;
        color: string;
        effect: GraphicEffectType;
        bgStyle: SubtitleBgStyle;
        isBeat?: boolean;
        dragOffset?: { x: number; y: number };
        orientation?: SubtitleOrientation;
        strokeColor?: string;
    }
) => {
    if (!currentSubtitle || !currentSubtitle.text) return;
    
    ctx.save();
    
    const { text } = currentSubtitle;
    
    const fontSize = (fontSizeVw / 100) * width;
    const actualFontName = FONT_MAP[fontFamily] || 'Poppins';
    // 根據特效決定字體粗細
    const fontWeight = (effect === GraphicEffectType.BOLD) ? '900' : 'bold';
    ctx.font = `${fontWeight} ${fontSize}px "${actualFontName}", sans-serif`;
    
    // 直式顯示
    if (orientation === SubtitleOrientation.VERTICAL) {
        const verticalHorizontalPos = (latestPropsRef as any)?.verticalSubtitlePosition ?? 0.5;
        const verticalVerticalPos = (latestPropsRef as any)?.verticalSubtitleVerticalPosition ?? 0.5;
        drawVerticalSubtitle(ctx, width, height, text, fontSize, actualFontName, color, effect, bgStyle, isBeat, dragOffset, verticalHorizontalPos, verticalVerticalPos, strokeColor);
        ctx.restore();
        return;
    }
    
    // 橫式顯示（原有邏輯）
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    
    // 使用新的位置控制參數
    const horizontalPos = (latestPropsRef as any)?.horizontalSubtitlePosition ?? 0.5;
    const horizontalVerticalPos = (latestPropsRef as any)?.horizontalSubtitleVerticalPosition ?? 0.2;
    
    const margin = width * 0.1; // 距離邊緣 10%
    const positionX = margin + (width - 2 * margin) * horizontalPos + dragOffset.x;
    const positionY = margin + (height - 2 * margin) * horizontalVerticalPos + dragOffset.y;

    const metrics = ctx.measureText(text);
    const textHeight = metrics.fontBoundingBoxAscent ?? fontSize;
    const textWidth = metrics.width;

    // Handle background for readability
    if (bgStyle !== SubtitleBgStyle.NONE) {
        const bgPaddingX = fontSize * 0.4;
        const bgPaddingY = fontSize * 0.2;
        const bgWidth = textWidth + bgPaddingX * 2;
        const bgHeight = textHeight + bgPaddingY * 2;
        const bgX = positionX - bgWidth / 2;
        const bgY = positionY - textHeight - bgPaddingY;
        
        ctx.fillStyle = bgStyle === SubtitleBgStyle.BLACK ? 'rgba(0,0,0,0.8)' : 'rgba(0,0,0,0.5)';
        createRoundedRectPath(ctx, bgX, bgY, bgWidth, bgHeight, 5);
        ctx.fill();
    }

    // 重置陰影效果
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    ctx.lineJoin = 'round';
    ctx.lineWidth = Math.max(2, fontSize / 20);
    ctx.miterLimit = 2;
    
    const drawTextWithEffect = (offsetX = 0, offsetY = 0) => {
        ctx.fillText(text, positionX + offsetX, positionY + offsetY);
    };

    // 1. 偽3D效果（先繪製，在後層）
    if (effect === GraphicEffectType.FAUX_3D) {
        const depth = Math.max(1, Math.floor(fontSize / 30));
        // 使用較暗的顏色作為3D深度
        const depthColor = color.replace('rgb', 'rgba').replace(')', ', 0.6)').replace('#', 'rgba(');
        ctx.fillStyle = depthColor;
        for (let i = 1; i <= depth; i++) {
            drawTextWithEffect(i, i);
        }
    }

    // 2. 設定填充顏色
    if (effect === GraphicEffectType.NEON || effect === GraphicEffectType.GLOW) {
        ctx.fillStyle = '#FFFFFF'; // 霓虹光文字通常是白色
    } else {
        ctx.fillStyle = color;
    }

    // 3. 陰影設定（在填充前設定，影響整個物件包括描邊）
    if (effect === GraphicEffectType.NEON || effect === GraphicEffectType.GLOW) {
        ctx.shadowColor = color; // 發光顏色
        ctx.shadowBlur = 15;
    } else if (effect === GraphicEffectType.SHADOW) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;
    }

    // 4. 描邊效果
    if (effect === GraphicEffectType.OUTLINE || effect === GraphicEffectType.STROKE) {
        ctx.strokeStyle = strokeColor || color; // 使用自定義描邊顏色，如果沒有則使用主顏色
        ctx.lineWidth = Math.max(2, fontSize / 20);
        ctx.lineJoin = 'round';
        ctx.miterLimit = 2;
        // 多方向描邊增強效果
        ctx.strokeText(text, positionX - 1, positionY - 1);
        ctx.strokeText(text, positionX + 1, positionY - 1);
        ctx.strokeText(text, positionX - 1, positionY + 1);
        ctx.strokeText(text, positionX + 1, positionY + 1);
        ctx.strokeText(text, positionX, positionY);
    }
    
    // 5. 主要文字填充
    drawTextWithEffect();

    // 5.1. 額外的霓虹光增強
    if (effect === GraphicEffectType.NEON || effect === GraphicEffectType.GLOW) {
        ctx.shadowBlur = 30; // 更強的發光
        drawTextWithEffect();
    }
    
    // 重置陰影
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // 6. 故障感效果（最後繪製，在最上層）
    if (effect === GraphicEffectType.GLITCH) {
        if (isBeat) {
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            const glitchIntensity = 8;
            const glitchOffsetX = (Math.random() - 0.5) * glitchIntensity;
            const glitchOffsetY = (Math.random() - 0.5) * glitchIntensity;
            
            // 紅色故障層
            ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
            drawTextWithEffect(glitchOffsetX, glitchOffsetY);
            
            // 藍色故障層
            ctx.fillStyle = 'rgba(0, 0, 255, 0.7)';
            drawTextWithEffect(-glitchOffsetX, -glitchOffsetY);
            
            // 綠色故障層
            ctx.fillStyle = 'rgba(0, 255, 0, 0.7)';
            drawTextWithEffect(glitchOffsetX * 0.5, -glitchOffsetY * 0.5);
            
            ctx.globalCompositeOperation = 'source-over';
            ctx.restore();
        }
        // 最後繪製正常文字確保可見
        if (effect === GraphicEffectType.NEON || effect === GraphicEffectType.GLOW) {
            ctx.fillStyle = '#FFFFFF';
        } else {
            ctx.fillStyle = color;
        }
        drawTextWithEffect();
    }
    
    ctx.restore();
};
// 逐字顯示字幕函數（打字機風格）
const drawWordByWordSubtitles = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    subtitles: Subtitle[],
    currentTime: number,
    { fontFamily, bgStyle, fontSizeVw, color, effect, isBeat, dragOffset = { x: 0, y: 0 }, strokeColor }: { 
        fontFamily: FontType; 
        bgStyle: SubtitleBgStyle;
        fontSizeVw: number;
        color: string;
        effect: GraphicEffectType;
        isBeat?: boolean;
        dragOffset?: { x: number; y: number };
        strokeColor?: string;
    }
) => {
    if (subtitles.length === 0) return;
    
    ctx.save();
    
    const fontSize = (fontSizeVw / 100) * width;
    const actualFontName = FONT_MAP[fontFamily] || 'Poppins';
    // 根據特效決定字體粗細
    const fontWeight = (effect === GraphicEffectType.BOLD) ? '900' : 'bold';
    ctx.font = `${fontWeight} ${fontSize}px "${actualFontName}", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    
    const positionX = width / 2 + dragOffset.x;
    const positionY = height - (height * 0.08) + dragOffset.y;
    
    // 找到當前時間對應的字幕
    let currentSubtitle: Subtitle | undefined;
    for (let i = subtitles.length - 1; i >= 0; i--) {
        const subtitle = subtitles[i];
        if (currentTime >= subtitle.time) {
            // 檢查結束時間
            if (!subtitle.endTime || currentTime <= subtitle.endTime) {
                currentSubtitle = subtitle;
                break;
            }
        }
    }
    
    if (!currentSubtitle) return;
    
    const { text } = currentSubtitle;
    const words = text.split('');
    
    // 計算每個字的顯示時間（每個字顯示 0.2 秒）
    const wordDuration = 0.2;
    const subtitleStartTime = currentSubtitle.time;
    const elapsedTime = currentTime - subtitleStartTime;
    
    // 計算應該顯示多少個字
    const wordsToShow = Math.min(words.length, Math.floor(elapsedTime / wordDuration));
    
    if (wordsToShow <= 0) return;
    
    // 只顯示前面的字
    const visibleText = words.slice(0, wordsToShow).join('');
    
    // 打字機游標效果
    const cursorBlinkSpeed = 0.5; // 游標閃爍速度（秒）
    const showCursor = Math.floor(currentTime / cursorBlinkSpeed) % 2 === 0;
    const displayText = showCursor && wordsToShow < words.length ? visibleText + '|' : visibleText;
    
    const metrics = ctx.measureText(displayText);
    const textHeight = metrics.fontBoundingBoxAscent ?? fontSize;
    const textWidth = metrics.width;
    
    // Handle background for readability
    if (bgStyle !== SubtitleBgStyle.NONE) {
        const bgPaddingX = fontSize * 0.4;
        const bgPaddingY = fontSize * 0.2;
        const bgWidth = textWidth + bgPaddingX * 2;
        const bgHeight = textHeight + bgPaddingY * 2;
        const bgX = positionX - bgWidth / 2;
        const bgY = positionY - textHeight - bgPaddingY;
        
        if (bgStyle === SubtitleBgStyle.BLACK) {
            ctx.fillStyle = 'rgba(0,0,0,0.8)';
        } else if (bgStyle === SubtitleBgStyle.TRANSPARENT) {
            ctx.fillStyle = 'rgba(0,0,0,0.5)';
        }
        
        createRoundedRectPath(ctx, bgX, bgY, bgWidth, bgHeight, 5);
        ctx.fill();
    }
    
    // 重置陰影效果
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    ctx.lineJoin = 'round';
    ctx.lineWidth = Math.max(2, fontSize / 20);
    ctx.miterLimit = 2;
    
    const drawTextWithEffect = (offsetX = 0, offsetY = 0) => {
        ctx.fillText(displayText, positionX + offsetX, positionY + offsetY);
    };
    
    // 1. 偽3D效果（先繪製，在後層）
    if (effect === GraphicEffectType.FAUX_3D) {
        const depth = Math.max(1, Math.floor(fontSize / 30));
        const depthColor = color.replace('rgb', 'rgba').replace(')', ', 0.6)').replace('#', 'rgba(');
        ctx.fillStyle = depthColor;
        for (let i = 1; i <= depth; i++) {
            drawTextWithEffect(i, i);
        }
    }
    
    // 2. 設定填充顏色
    if (effect === GraphicEffectType.NEON || effect === GraphicEffectType.GLOW) {
        ctx.fillStyle = '#FFFFFF';
    } else {
        ctx.fillStyle = color;
    }
    
    // 3. 陰影設定
    if (effect === GraphicEffectType.NEON || effect === GraphicEffectType.GLOW) {
        ctx.shadowColor = color;
        ctx.shadowBlur = isBeat ? fontSize * 0.5 : 15;
    } else if (effect === GraphicEffectType.SHADOW) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;
    }
    
    // 4. 描邊效果
    if (effect === GraphicEffectType.OUTLINE || effect === GraphicEffectType.STROKE) {
        ctx.strokeStyle = strokeColor || color; // 使用自定義描邊顏色，如果沒有則使用主顏色
        ctx.lineWidth = Math.max(2, fontSize / 20);
        ctx.lineJoin = 'round';
        ctx.miterLimit = 2;
        // 多方向描邊
        ctx.strokeText(displayText, positionX - 1, positionY - 1);
        ctx.strokeText(displayText, positionX + 1, positionY - 1);
        ctx.strokeText(displayText, positionX - 1, positionY + 1);
        ctx.strokeText(displayText, positionX + 1, positionY + 1);
        ctx.strokeText(displayText, positionX, positionY);
    }
    
    // 5. 主要文字填充
    drawTextWithEffect();
    
    // 5.1. 額外的霓虹光增強
    if (effect === GraphicEffectType.NEON || effect === GraphicEffectType.GLOW) {
        ctx.shadowBlur = 30;
        drawTextWithEffect();
    }
    
    // 重置陰影
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // 6. 故障感效果（最後繪製，在最上層）
    if (effect === GraphicEffectType.GLITCH && isBeat) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const glitchIntensity = 8;
        const glitchOffsetX = (Math.random() - 0.5) * glitchIntensity;
        const glitchOffsetY = (Math.random() - 0.5) * glitchIntensity;
        
        // 紅色故障層
        ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
        drawTextWithEffect(glitchOffsetX, glitchOffsetY);
        
        // 藍色故障層
        ctx.fillStyle = 'rgba(0, 0, 255, 0.7)';
        drawTextWithEffect(-glitchOffsetX, -glitchOffsetY);
        
        // 綠色故障層
        ctx.fillStyle = 'rgba(0, 255, 0, 0.7)';
        drawTextWithEffect(glitchOffsetX * 0.5, -glitchOffsetY * 0.5);
        
        ctx.globalCompositeOperation = 'source-over';
        ctx.restore();
        
        // 最後繪製正常文字
        if (effect === GraphicEffectType.NEON || effect === GraphicEffectType.GLOW) {
            ctx.fillStyle = '#FFFFFF';
        } else {
            ctx.fillStyle = color;
        }
        drawTextWithEffect();
    }
    
    // 打字機特效：為正在輸入的字添加特殊效果
    if (wordsToShow < words.length) {
        const currentChar = words[wordsToShow];
        const beforeCurrentText = words.slice(0, wordsToShow).join('');
        const beforeMetrics = ctx.measureText(beforeCurrentText);
        
        // 計算當前字的位置
        const charX = positionX - textWidth / 2 + beforeMetrics.width;
        const charY = positionY;
        
        // 為即將出現的字添加發光效果
        ctx.save();
        ctx.shadowColor = color;
        ctx.shadowBlur = fontSize * 0.3;
        ctx.fillStyle = color;
        ctx.font = `bold ${fontSize * 1.1}px "${fontFamily}", sans-serif`;
        ctx.fillText(currentChar, charX, charY);
        ctx.restore();
    }
    
    ctx.restore();
};

// 辅助函数：绘制单行字幕
const drawSubtitleLine = (
    ctx: CanvasRenderingContext2D,
    text: string,
    textX: number,
    textY: number,
    fontSize: number,
    fontName: string,
    color: string,
    bgStyle: SubtitleBgStyle,
    maxWidth: number,
    effect: GraphicEffectType,
    isBeat?: boolean
) => {
    const metrics = ctx.measureText(text);
    const textWidth = metrics.width;
    const textHeight = fontSize;
    
    // 绘制背景
    if (bgStyle !== SubtitleBgStyle.NONE) {
        const bgPaddingX = fontSize * 0.3;
        const bgPaddingY = fontSize * 0.15;
        const bgWidth = Math.min(textWidth + bgPaddingX * 2, maxWidth * 0.95);
        const bgHeight = textHeight + bgPaddingY * 2;
        const bgX = textX - bgWidth / 2;
        const bgY = textY - textHeight / 2 - bgPaddingY;
        
        if (bgStyle === SubtitleBgStyle.BLACK) {
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
        } else if (bgStyle === SubtitleBgStyle.TRANSPARENT) {
            ctx.fillStyle = 'rgba(0,0,0,0.4)';
        }
        
        createRoundedRectPath(ctx, bgX, bgY, bgWidth, bgHeight, 8);
        ctx.fill();
    }
    
    // 重置陰影效果
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    ctx.lineJoin = 'round';
    ctx.lineWidth = Math.max(2, fontSize / 20);
    ctx.miterLimit = 2;
    
    const drawTextWithEffect = (offsetX = 0, offsetY = 0) => {
        ctx.fillText(text, textX + offsetX, textY + offsetY);
    };
    
    // 1. 偽3D效果（先繪製，在後層）
    if (effect === GraphicEffectType.FAUX_3D) {
        const depth = Math.max(1, Math.floor(fontSize / 30));
        const depthColor = color.replace('rgb', 'rgba').replace(')', ', 0.6)').replace('#', 'rgba(');
        ctx.fillStyle = depthColor;
        for (let i = 1; i <= depth; i++) {
            drawTextWithEffect(i, i);
        }
    }
    
    // 2. 設定填充顏色
    if (effect === GraphicEffectType.NEON || effect === GraphicEffectType.GLOW) {
        ctx.fillStyle = '#FFFFFF';
    } else {
        ctx.fillStyle = color;
    }
    
    // 3. 陰影設定
    if (effect === GraphicEffectType.NEON || effect === GraphicEffectType.GLOW) {
        ctx.shadowColor = color;
        ctx.shadowBlur = isBeat ? fontSize * 0.4 : 15;
    } else if (effect === GraphicEffectType.SHADOW) {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 10;
        ctx.shadowOffsetX = 5;
        ctx.shadowOffsetY = 5;
    }
    
    // 4. 描邊效果
    if (effect === GraphicEffectType.OUTLINE || effect === GraphicEffectType.STROKE) {
        ctx.strokeStyle = color;
        ctx.lineWidth = Math.max(2, fontSize / 20);
        ctx.lineJoin = 'round';
        ctx.miterLimit = 2;
        // 多方向描邊
        ctx.strokeText(text, textX - 1, textY - 1);
        ctx.strokeText(text, textX + 1, textY - 1);
        ctx.strokeText(text, textX - 1, textY + 1);
        ctx.strokeText(text, textX + 1, textY + 1);
        ctx.strokeText(text, textX, textY);
    }
    
    // 5. 主要文字填充
    drawTextWithEffect();
    
    // 5.1. 額外的霓虹光增強
    if (effect === GraphicEffectType.NEON || effect === GraphicEffectType.GLOW) {
        ctx.shadowBlur = 30;
        drawTextWithEffect();
    }
    
    // 重置陰影
    ctx.shadowBlur = 0;
    ctx.shadowColor = 'transparent';
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // 6. 故障感效果（最後繪製，在最上層）
    if (effect === GraphicEffectType.GLITCH && isBeat) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        const glitchIntensity = 8;
        const glitchOffsetX = (Math.random() - 0.5) * glitchIntensity;
        const glitchOffsetY = (Math.random() - 0.5) * glitchIntensity;
        
        // 紅色故障層
        ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
        drawTextWithEffect(glitchOffsetX, glitchOffsetY);
        
        // 藍色故障層
        ctx.fillStyle = 'rgba(0, 0, 255, 0.7)';
        drawTextWithEffect(-glitchOffsetX, -glitchOffsetY);
        
        // 綠色故障層
        ctx.fillStyle = 'rgba(0, 255, 0, 0.7)';
        drawTextWithEffect(glitchOffsetX * 0.5, -glitchOffsetY * 0.5);
        
        ctx.globalCompositeOperation = 'source-over';
        ctx.restore();
        
        // 最後繪製正常文字
        if (effect === GraphicEffectType.NEON || effect === GraphicEffectType.GLOW) {
            ctx.fillStyle = '#FFFFFF';
        } else {
            ctx.fillStyle = color;
        }
        drawTextWithEffect();
    }
};

// 滚动字幕组状态管理
const slidingGroupState: {
    currentGroupIndex: number;
    visibleLines: number; // 当前组中已显示的行数 (0-3)
    slideProgress: number; // 滑动进度 0-1
    isSliding: boolean;
    lastUpdateTime: number;
    currentGroupSubtitles: Subtitle[];
} = {
    currentGroupIndex: 0,
    visibleLines: 0,
    slideProgress: 0,
    isSliding: false,
    lastUpdateTime: 0,
    currentGroupSubtitles: []
};

// 滚动字幕组绘制函数
const drawSlidingGroupSubtitles = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    subtitles: Subtitle[],
    currentTime: number,
    { fontFamily, bgStyle, fontSizeVw, color, effect, isBeat, dragOffset = { x: 0, y: 0 } }: { 
        fontFamily: FontType; 
        bgStyle: SubtitleBgStyle;
        fontSizeVw: number;
        color: string;
        effect: GraphicEffectType;
        isBeat?: boolean;
        dragOffset?: { x: number; y: number };
    }
) => {
    if (subtitles.length === 0) return;
    
    ctx.save();
    
    const fontSize = (fontSizeVw / 100) * width;
    const actualFontName = FONT_MAP[fontFamily] || 'Poppins';
    // 根據特效決定字體粗細
    const fontWeight = (effect === GraphicEffectType.BOLD) ? '900' : 'bold';
    ctx.font = `${fontWeight} ${fontSize}px "${actualFontName}", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // 定义矩形区域（不绘制边框，只是逻辑区域）
    const boxWidth = width * 0.6; // 矩形宽度为画布的60%
    const boxHeight = height * 0.25; // 矩形高度为画布的25%
    const boxX = (width - boxWidth) / 2 + dragOffset.x;
    const boxY = height * 0.65 + dragOffset.y; // 位置在画布下方65%处
    
    const lineHeight = boxHeight / 3.5; // 每行高度，留一些间距
    const padding = fontSize * 0.3;
    
    // 找到当前时间对应的字幕索引
    let currentSubtitleIndex = -1;
    for (let i = subtitles.length - 1; i >= 0; i--) {
        const subtitle = subtitles[i];
        if (currentTime >= subtitle.time) {
            if (!subtitle.endTime || currentTime <= subtitle.endTime) {
                currentSubtitleIndex = i;
                break;
            }
        }
    }
    
    if (currentSubtitleIndex === -1) {
        ctx.restore();
        return;
    }
    
    // 计算当前应该显示的字幕组（每3句一组）
    const targetGroupIndex = Math.floor(currentSubtitleIndex / 3);
    const groupStartIndex = targetGroupIndex * 3;
    const groupSubtitles = subtitles.slice(groupStartIndex, groupStartIndex + 3);
    
    // 计算当前组中应该显示的行数（逐句出现）
    let visibleLines = 0;
    for (let i = 0; i < groupSubtitles.length; i++) {
        const subtitle = groupSubtitles[i];
        if (currentTime >= subtitle.time) {
            if (!subtitle.endTime || currentTime <= subtitle.endTime) {
                visibleLines = i + 1;
            }
        }
    }
    
    // 检查是否需要切换到下一组（当3句都显示完，且下一组应该开始时）
    const slideDuration = 0.5; // 滑动动画持续时间（秒）
    const shouldStartSliding = visibleLines >= 3 && targetGroupIndex < Math.floor((subtitles.length - 1) / 3);
    
    if (shouldStartSliding) {
        const nextGroupStartIndex = (targetGroupIndex + 1) * 3;
        if (nextGroupStartIndex < subtitles.length) {
            const nextSubtitle = subtitles[nextGroupStartIndex];
            // 当下一组的第一个字幕应该开始时，开始滑动
            if (currentTime >= nextSubtitle.time - slideDuration * 0.3) {
                if (!slidingGroupState.isSliding && targetGroupIndex === slidingGroupState.currentGroupIndex) {
                    slidingGroupState.isSliding = true;
                    slidingGroupState.slideProgress = 0;
                }
            }
        }
    }
    
    // 如果切换到新的组，更新状态
    if (targetGroupIndex !== slidingGroupState.currentGroupIndex && !slidingGroupState.isSliding) {
        slidingGroupState.currentGroupIndex = targetGroupIndex;
        slidingGroupState.currentGroupSubtitles = groupSubtitles;
    }
    
    // 更新滑动动画
    if (slidingGroupState.isSliding) {
        const timeDelta = Math.max(0, currentTime - slidingGroupState.lastUpdateTime);
        if (timeDelta > 0) {
            slidingGroupState.slideProgress = Math.min(1, slidingGroupState.slideProgress + timeDelta / slideDuration);
            if (slidingGroupState.slideProgress >= 1) {
                // 滑动完成，切换到新组
                slidingGroupState.isSliding = false;
                slidingGroupState.slideProgress = 0;
                slidingGroupState.currentGroupIndex = targetGroupIndex;
                slidingGroupState.currentGroupSubtitles = groupSubtitles;
            }
        }
    }
    slidingGroupState.lastUpdateTime = currentTime;
    
    // 计算滑动偏移量（使用缓动函数）
    const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    const slideOffsetX = slidingGroupState.isSliding 
        ? width * (easeInOutCubic(slidingGroupState.slideProgress))
        : 0;
    
    // 确定要绘制的组
    const oldGroupIndex = slidingGroupState.currentGroupIndex;
    const newGroupIndex = targetGroupIndex;
    const oldGroupStartIndex = oldGroupIndex * 3;
    const oldGroupSubtitles = subtitles.slice(oldGroupStartIndex, oldGroupStartIndex + 3);
    
    // 如果正在滑动，同时绘制旧组（滑出）和新组（滑入）
    if (slidingGroupState.isSliding && oldGroupIndex !== newGroupIndex) {
        // 绘制旧组（向左滑出）
        const oldVisibleLines = Math.min(3, oldGroupSubtitles.length);
        for (let i = 0; i < oldVisibleLines; i++) {
            if (i >= oldGroupSubtitles.length) break;
            const subtitle = oldGroupSubtitles[i];
            const lineY = boxY + (i * lineHeight) + lineHeight / 2;
            const textX = boxX + boxWidth / 2 - slideOffsetX;
            const textY = lineY;
            
            drawSubtitleLine(ctx, subtitle.text, textX, textY, fontSize, actualFontName, color, bgStyle, boxWidth, effect, isBeat);
        }
        
        // 绘制新组（从右侧滑入）
        const newVisibleLines = Math.min(visibleLines, 3);
        for (let i = 0; i < newVisibleLines; i++) {
            if (i >= groupSubtitles.length) break;
            const subtitle = groupSubtitles[i];
            const lineY = boxY + (i * lineHeight) + lineHeight / 2;
            // 新组从右侧（width）滑入到中心位置
            const textX = boxX + boxWidth / 2 + (width * (1 - slidingGroupState.slideProgress));
            const textY = lineY;
            
            drawSubtitleLine(ctx, subtitle.text, textX, textY, fontSize, actualFontName, color, bgStyle, boxWidth, effect, isBeat);
        }
    } else {
        // 正常显示当前组
        for (let i = 0; i < Math.min(visibleLines, 3); i++) {
            if (i >= groupSubtitles.length) break;
            const subtitle = groupSubtitles[i];
            const lineY = boxY + (i * lineHeight) + lineHeight / 2;
            const textX = boxX + boxWidth / 2;
            const textY = lineY;
            
            drawSubtitleLine(ctx, subtitle.text, textX, textY, fontSize, actualFontName, color, bgStyle, boxWidth, effect, isBeat);
        }
    }
    
    ctx.restore();
};

// 歌詞顯示函數
const drawLyricsDisplay = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    subtitles: Subtitle[],
    currentTime: number,
    { fontFamily, bgStyle, fontSize, positionX, positionY, color, effect, dragOffset = { x: 0, y: 0 } }: { 
        fontFamily: FontType; 
        bgStyle: SubtitleBgStyle;
        fontSize: number;
        positionX: number;
        positionY: number;
        color: string;
        effect: GraphicEffectType;
        dragOffset?: { x: number; y: number };
    }
) => {
    if (subtitles.length === 0) return;
    
    ctx.save();
    
    // 找到當前時間對應的歌詞
    let currentIndex = 0;
    let lastValidIndex = 0;
    
    for (let i = 0; i < subtitles.length; i++) {
        const subtitle = subtitles[i];
        
        // 如果當前時間還沒到這句歌詞，停止搜尋
        if (currentTime < subtitle.time) {
            break;
        }
        
        // 記錄這是最後一句已經開始的歌詞
        lastValidIndex = i;
        
        // 如果這句歌詞還在顯示時間內（沒有結束時間或還沒過結束時間）
        if (!subtitle.endTime || currentTime <= subtitle.endTime) {
            currentIndex = i;
            break;
        }
        // 如果已經過了結束時間，繼續找下一句，但保留這個索引作為備用
        currentIndex = i;
    }
    
    // 獲取要顯示的10行歌詞（當前行前後各5行）
    const startIndex = Math.max(0, currentIndex - 5);
    const endIndex = Math.min(subtitles.length, startIndex + 10);
    const displayLines = subtitles.slice(startIndex, endIndex);
    
    if (displayLines.length === 0) {
        ctx.restore();
        return;
    }
    
    // 計算每行的位置
    const lineHeight = height * 0.08; // 每行高度
    const centerX = width / 2 + (positionX * width / 100) + dragOffset.x; // 水平位置調整
    const centerY = height / 2 + (positionY * height / 100) + dragOffset.y; // 垂直位置調整
    const startY = centerY - (displayLines.length * lineHeight) / 2; // 以調整後的中心為基準
    
    displayLines.forEach((line, index) => {
        const isCurrentLine = startIndex + index === currentIndex;
        const isPastLine = startIndex + index < currentIndex;
        
        // 設置字體大小和顏色
        const baseFontSize = width * (fontSize / 100); // 字體大小百分比
        const currentFontSize = isCurrentLine ? baseFontSize * 1.5 : baseFontSize; // 當前行放大1.5倍
        const actualFontName = FONT_MAP[fontFamily] || 'Poppins';
        // 根據特效決定字體粗細
        const fontWeight = (effect === GraphicEffectType.BOLD) ? '900' : 'bold';
        ctx.font = `${fontWeight} ${currentFontSize}px "${actualFontName}", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const x = centerX;
        const y = startY + (index * lineHeight) + (lineHeight / 2);
        
        // 測量文字寬度用於背景
        const metrics = ctx.measureText(line.text);
        const textWidth = metrics.width;
        const textHeight = metrics.fontBoundingBoxAscent ?? fontSize;
        
        // 繪製背景（如果需要的話）
        if (bgStyle !== SubtitleBgStyle.NONE) {
            const bgPaddingX = fontSize * 0.4;
            const bgPaddingY = fontSize * 0.2;
            const bgWidth = textWidth + bgPaddingX * 2;
            const bgHeight = textHeight + bgPaddingY * 2;
            const bgX = x - bgWidth / 2;
            const bgY = y - textHeight / 2 - bgPaddingY;
            
            // 設置背景顏色
            if (bgStyle === SubtitleBgStyle.BLACK) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            } else if (bgStyle === SubtitleBgStyle.TRANSPARENT) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            }
            
            // 繪製圓角矩形背景
            createRoundedRectPath(ctx, bgX, bgY, bgWidth, bgHeight, 5);
            ctx.fill();
        }
        
        // 設置文字顏色和透明度
        if (isCurrentLine) {
            // 當前歌詞：使用傳入的顏色
            ctx.fillStyle = color;
        } else if (isPastLine) {
            // 過去歌詞：使用傳入顏色的60%透明度
            ctx.fillStyle = color + '99'; // 60% 透明度
        } else {
            // 未來歌詞：使用傳入顏色的80%透明度
            ctx.fillStyle = color + 'CC'; // 80% 透明度
        }
        
        // 應用字幕效果（根據用戶選擇，參考封面產生器）
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // 1. 偽3D效果（先繪製，在後層）
        if (effect === GraphicEffectType.FAUX_3D) {
            const depth = Math.max(1, Math.floor(currentFontSize / 30));
            const depthColor = color.replace('rgb', 'rgba').replace(')', ', 0.6)').replace('#', 'rgba(');
            ctx.fillStyle = depthColor;
            for (let i = 1; i <= depth; i++) {
                ctx.fillText(line.text, x + i, y + i);
            }
        }
        
        // 2. 設定填充顏色
        if (effect === GraphicEffectType.NEON || effect === GraphicEffectType.GLOW) {
            ctx.fillStyle = '#FFFFFF'; // 霓虹光文字通常是白色
        } else {
            ctx.fillStyle = color;
        }
        
        // 3. 陰影設定
        if (effect === GraphicEffectType.NEON || effect === GraphicEffectType.GLOW) {
            ctx.shadowColor = color;
            ctx.shadowBlur = isCurrentLine ? 20 : 15;
        } else if (effect === GraphicEffectType.SHADOW) {
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetX = 5;
            ctx.shadowOffsetY = 5;
        }
        
        // 4. 描邊效果
        if (effect === GraphicEffectType.OUTLINE || effect === GraphicEffectType.STROKE) {
            ctx.strokeStyle = color;
            ctx.lineWidth = Math.max(2, currentFontSize / 20);
            ctx.lineJoin = 'round';
            ctx.miterLimit = 2;
            // 多方向描邊
            ctx.strokeText(line.text, x - 1, y - 1);
            ctx.strokeText(line.text, x + 1, y - 1);
            ctx.strokeText(line.text, x - 1, y + 1);
            ctx.strokeText(line.text, x + 1, y + 1);
            ctx.strokeText(line.text, x, y);
        }
        
        // 5. 主要文字填充
        ctx.fillText(line.text, x, y);
        
        // 5.1. 額外的霓虹光增強
        if (effect === GraphicEffectType.NEON || effect === GraphicEffectType.GLOW) {
            ctx.shadowBlur = 30;
            ctx.fillText(line.text, x, y);
        }
        
        // 重置陰影
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        
        // 6. 故障感效果（最後繪製，在最上層）
        if (effect === GraphicEffectType.GLITCH && isCurrentLine) {
            ctx.save();
            ctx.globalCompositeOperation = 'lighter';
            const glitchIntensity = 8;
            const glitchOffsetX = (Math.random() - 0.5) * glitchIntensity;
            const glitchOffsetY = (Math.random() - 0.5) * glitchIntensity;
            
            // 紅色故障層
            ctx.fillStyle = 'rgba(255, 0, 0, 0.7)';
            ctx.fillText(line.text, x + glitchOffsetX, y + glitchOffsetY);
            
            // 藍色故障層
            ctx.fillStyle = 'rgba(0, 0, 255, 0.7)';
            ctx.fillText(line.text, x - glitchOffsetX, y - glitchOffsetY);
            
            // 綠色故障層
            ctx.fillStyle = 'rgba(0, 255, 0, 0.7)';
            ctx.fillText(line.text, x + glitchOffsetX * 0.5, y - glitchOffsetY * 0.5);
            
            ctx.globalCompositeOperation = 'source-over';
            ctx.restore();
            
            // 最後繪製正常文字
            if (effect === GraphicEffectType.NEON || effect === GraphicEffectType.GLOW) {
                ctx.fillStyle = '#FFFFFF';
            } else {
                ctx.fillStyle = color;
            }
            ctx.fillText(line.text, x, y);
        }
    });
    
    ctx.restore();
};
// 電視雜訊過場動畫
const drawTVStaticTransition = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    progress: number // 0-1 的進度值
) => {
    ctx.save();
    
    // 創建雜訊效果
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;
    
    // 生成隨機雜訊
    for (let i = 0; i < data.length; i += 4) {
        const noise = Math.random() * 255;
        const intensity = Math.sin(progress * Math.PI) * 0.8; // 正弦波強度變化
        
        data[i] = noise * intensity;     // R
        data[i + 1] = noise * intensity; // G
        data[i + 2] = noise * intensity; // B
        data[i + 3] = 255;               // A
    }
    
    // 添加掃描線效果
    for (let y = 0; y < height; y += 4) {
        const scanIntensity = Math.sin((y / height) * Math.PI * 4 + progress * Math.PI * 2) * 0.3;
        for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;
            data[index] += scanIntensity * 100;
            data[index + 1] += scanIntensity * 100;
            data[index + 2] += scanIntensity * 100;
        }
    }
    
    // 添加水平晃動效果
    const shakeIntensity = Math.sin(progress * Math.PI * 8) * 3;
    ctx.putImageData(imageData, shakeIntensity, 0);
    
    // 添加垂直晃動效果
    const verticalShake = Math.sin(progress * Math.PI * 6) * 2;
    ctx.putImageData(imageData, 0, verticalShake);
    
    ctx.restore();
};

// 淡入淡出過場動畫
const drawWaveExpansionTransition = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    progress: number, // 0-1 的進度值
    oldImage: HTMLImageElement | null,
    newImage: HTMLImageElement | null
) => {
    ctx.save();
    
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY);
    const currentRadius = progress * maxRadius;
    
    // 繪製舊圖片作為背景
    if (oldImage) {
        ctx.drawImage(oldImage, 0, 0, width, height);
    }
    
    // 創建圓形遮罩來顯示新圖片
    if (newImage && currentRadius > 0) {
        ctx.save();
        
        // 創建圓形路徑
        ctx.beginPath();
        ctx.arc(centerX, centerY, currentRadius, 0, Math.PI * 2);
        ctx.clip();
        
        // 繪製新圖片
        ctx.drawImage(newImage, 0, 0, width, height);
        
        ctx.restore();
        
        // 添加音波邊緣效果
        if (currentRadius > 10) {
            ctx.save();
            ctx.strokeStyle = `rgba(6, 182, 212, ${0.8 * (1 - progress)})`;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(centerX, centerY, currentRadius, 0, Math.PI * 2);
            ctx.stroke();
            
            // 添加發光效果
            ctx.shadowColor = '#06b6d4';
            ctx.shadowBlur = 10;
            ctx.strokeStyle = `rgba(6, 182, 212, ${0.4 * (1 - progress)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.arc(centerX, centerY, currentRadius, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.restore();
        }
    }
    
    ctx.restore();
};

const drawCustomText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    dataArray: Uint8Array,
    { width, height, color, fontFamily, graphicEffect, position, textSize, textPositionX, textPositionY, isBeat }: {
        width: number;
        height: number;
        color: string;
        fontFamily: string;
        graphicEffect: GraphicEffectType;
        position: WatermarkPosition;
        textSize: number;
        textPositionX: number;
        textPositionY: number;
        isBeat?: boolean;
    }
) => {
    if (!text) return;
    ctx.save();

    const paddingX = width * 0.025;
    const paddingY = height * 0.05;
    let positionX = 0, positionY = 0;
    
    const bass = dataArray.slice(0, 32).reduce((a, b) => a + b, 0) / 32;
    const normalizedBass = bass / 255;
    
    // 使用自訂的文字大小 (vw 單位)
    const baseFontSize = width * (textSize / 100);
    const pulseAmount = baseFontSize * 0.05;
    const fontSize = baseFontSize + (normalizedBass * pulseAmount);

    ctx.font = `bold ${fontSize}px "${fontFamily}", sans-serif`;
    ctx.lineJoin = 'round';
    ctx.lineWidth = fontSize * 0.1;

    // 計算基礎位置
    switch (position) {
        case WatermarkPosition.BOTTOM_RIGHT:
            positionX = width - paddingX;
            positionY = height - paddingY;
            ctx.textAlign = 'right';
            ctx.textBaseline = 'bottom';
            break;
        case WatermarkPosition.BOTTOM_LEFT:
            positionX = paddingX;
            positionY = height - paddingY;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'bottom';
            break;
        case WatermarkPosition.TOP_RIGHT:
            positionX = width - paddingX;
            positionY = paddingY;
            ctx.textAlign = 'right';
            ctx.textBaseline = 'top';
            break;
        case WatermarkPosition.TOP_LEFT:
            positionX = paddingX;
            positionY = paddingY;
            ctx.textAlign = 'left';
            ctx.textBaseline = 'top';
            break;
        case WatermarkPosition.CENTER:
            positionX = width / 2;
            positionY = height / 2;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            break;
    }

    // 應用自訂位置偏移
    const offsetX = width * (textPositionX / 100);
    const offsetY = height * (textPositionY / 100);
    positionX += offsetX;
    positionY += offsetY;

    const drawText = (offsetX = 0, offsetY = 0, customColor?: string) => {
        ctx.fillText(text, positionX + offsetX, positionY + offsetY);
        if (graphicEffect === GraphicEffectType.STROKE) {
            ctx.strokeStyle = customColor ? applyAlphaToColor(customColor, 0.5) : 'rgba(0,0,0,0.5)';
            ctx.strokeText(text, positionX + offsetX, positionY + offsetY);
        }
    };

    switch (graphicEffect) {
        case GraphicEffectType.GLOW:
            ctx.shadowColor = color;
            ctx.shadowBlur = 20;
            drawText();
            ctx.shadowBlur = 10;
            drawText();
            break;
        case GraphicEffectType.GLITCH:
            if (isBeat) {
                ctx.globalCompositeOperation = 'lighter';
                const glitchAmount = fontSize * 0.1;
                ctx.fillStyle = 'rgba(255, 0, 100, 0.7)';
                drawText((Math.random() - 0.5) * glitchAmount, (Math.random() - 0.5) * glitchAmount);
                ctx.fillStyle = 'rgba(0, 255, 255, 0.7)';
                drawText((Math.random() - 0.5) * glitchAmount, (Math.random() - 0.5) * glitchAmount);
                ctx.globalCompositeOperation = 'source-over';
            }
            break;
    }
    
    // Draw the main text fill
    const gradient = ctx.createLinearGradient(0, positionY - fontSize, 0, positionY);
    gradient.addColorStop(0, '#FFFFFF');
    gradient.addColorStop(0.8, color);
    gradient.addColorStop(1, color);
    ctx.fillStyle = gradient;
    drawText();

    ctx.restore();
};

const equalizeDataArray = (data: Uint8Array | null, balance: number): Uint8Array | null => {
    if (!data) return null;
    if (balance <= 0) {
        return data;
    }
    const equalizedData = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) {
        const adjustment = Math.pow(i / data.length, balance);
        equalizedData[i] = data[i] * adjustment;
    }
    return equalizedData;
};


const smoothDataArray = (data: Uint8Array | null, windowSize: number): Uint8Array | null => {
    if (!data) return null;
    if (windowSize <= 0) {
        return data;
    }
    const smoothedData = new Uint8Array(data.length);
    for (let i = 0; i < data.length; i++) {
        const start = Math.max(0, i - windowSize);
        const end = Math.min(data.length - 1, i + windowSize);
        let sum = 0;
        for (let j = start; j <= end; j++) {
            sum += data[j];
        }
        smoothedData[i] = sum / (end - start + 1);
    }
    return smoothedData;
};

type DrawFunction = (
    ctx: CanvasRenderingContext2D, 
    dataArray: Uint8Array | null, 
    width: number, 
    height: number, 
    frame: number,
    sensitivity: number,
    colors: Palette,
    graphicEffect: GraphicEffectType,
    isBeat?: boolean,
    waveformStroke?: boolean,
    particles?: Particle[],
    geometricFrameImage?: HTMLImageElement | null,
    geometricSemicircleImage?: HTMLImageElement | null,
    vinylRecordEnabled?: boolean,
    vinylNeedleEnabled?: boolean,
) => void;
// 實驗款：Vinyl Record 旋轉唱片 + 控制卡
const drawVinylRecord = (
    ctx: CanvasRenderingContext2D,
    dataArray: Uint8Array | null,
    width: number,
    height: number,
    frame: number,
    sensitivity: number,
    colors: Palette,
    graphicEffect: GraphicEffectType,
    isBeat?: boolean,
    waveformStroke?: boolean,
    particles?: Particle[],
    geometricFrameImage?: HTMLImageElement | null,
    geometricSemicircleImage?: HTMLImageElement | null,
    vinylRecordEnabled: boolean = true,
    vinylNeedleEnabled: boolean = true
) => {
    // 不在此重置或覆寫矩陣，讓外層全域 transform（effectScale/effectOffsetX/Y + visualizationTransform）生效
 
     // 支援快速設置中的特效大小與拖曳位置
     const activeProps: any = (latestPropsRef as any)?.current ?? {};
     // Use only quick-setting scale for now (effectScale from QuickSettingsPanel)
     const quickScale = typeof activeProps?.effectScale === 'number' ? activeProps.effectScale : 1.0;
     const transform = activeProps?.visualizationTransform || { x: 0, y: 0, scale: 1.0 };
     // 夾住安全範圍，避免被拖曳/縮放到畫面之外導致整體看似消失
     const scale = Math.max(0.1, Math.min(3.0, quickScale));
     const rawX = typeof transform.x === 'number' && !isNaN(transform.x) ? transform.x : 0;
     const rawY = typeof transform.y === 'number' && !isNaN(transform.y) ? transform.y : 0;
     // 自動偵測像素/百分比：若值大於 50 視為像素，轉為百分比
     const xPercent = Math.abs(rawX) > 50 ? (rawX / width) * 100 : rawX;
     const yPercent = Math.abs(rawY) > 50 ? (rawY / height) * 100 : rawY;
     const offsetXPercent = Math.max(-40, Math.min(40, xPercent));
     const offsetYPercent = Math.max(-40, Math.min(40, yPercent));
     // Also apply quick-setting pixel offsets (effectOffsetX/Y)
     const quickOffsetX = typeof activeProps?.effectOffsetX === 'number' ? activeProps.effectOffsetX : 0;
     const quickOffsetY = typeof activeProps?.effectOffsetY === 'number' ? activeProps.effectOffsetY : 0;
     const targetCX = width / 2 + quickOffsetX + (offsetXPercent / 100) * width;
     const targetCY = height / 2 + quickOffsetY + (offsetYPercent / 100) * height;
     // 初始化或平滑靠攏
     const lerp = (a:number, b:number, t:number) => a + (b - a) * t;
     if (!transformState.initialized) {
         transformState = { cx: targetCX, cy: targetCY, scale, initialized: true };
     } else {
         // 放慢插值係數，拖曳更順不突兀
         transformState.cx = lerp(transformState.cx, targetCX, 0.15);
         transformState.cy = lerp(transformState.cy, targetCY, 0.15);
         transformState.scale = lerp(transformState.scale, scale, 0.15);
     }
    const centerX = width / 2; // 讓外層 transform 控制位置
    // 直式佈局時讓唱片往上移，給控制卡留空間
    const vinylLayoutMode = (latestPropsRef as any)?.vinylLayoutMode || 'horizontal';                                                                           
    const centerY = vinylLayoutMode === 'vertical' ? height * 0.35 : height / 2;
     const smoothScale = 1;     // 讓外層 transform 控制縮放
     // 由全局 transform 控制縮放，基準大小不再乘以 scale，避免雙重縮放
     const baseRadius = Math.min(width, height) * 0.22;
     const discRadius = baseRadius;
     // 調整中圈比例：加大內徑，讓黑膠圈更窄
     const ringRadius = discRadius * 0.82;
 
    // 背景柔霧（降低強度，避免覆蓋透明度效果）
    const bg = ctx.createRadialGradient(centerX, centerY, discRadius * 0.2, centerX, centerY, discRadius * 1.6);
    bg.addColorStop(0, 'rgba(0,0,0,0.05)'); // 大幅降低背景強度
    bg.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, width, height);
 
     // 旋轉角（依唱片轉速計算，放慢至 10 RPM；每幀≈60fps）
     const RPM = 10; // 降低一半速度
     const anglePerFrame = (RPM / 60) * (Math.PI * 2) / 60; // 每幀角度增量
     const angle = frame * anglePerFrame + (isBeat ? 0.001 : 0); // 降低一半速度
    
    // 檢查是否開啟中心照片固定模式
    const vinylCenterFixed = (latestPropsRef as any)?.vinylCenterFixed || false;

    // 只有當唱片啟用時才繪製唱片部分
    if (vinylRecordEnabled) {
        ctx.save();
        ctx.translate(centerX, centerY);
        
        // 整體旋轉邏輯：固定模式下不旋轉整體，讓各層獨立控制
        if (!vinylCenterFixed) {
            ctx.rotate(angle);
        }

        // 修正版：外圈圖片旋轉，中間補半透明黑膠
        
        // 從最新屬性讀取圖片
        const vinylImage = ((latestPropsRef as any)?.vinylImage ?? null) as string | null;
    
    // 第一部分：中心圖片（完全不透明）
    if (vinylImage) {
        const img = getOrCreateCachedImage('vinylImage', vinylImage);
        if (img && img.complete) {
            const centerImageRadius = discRadius * 0.6; // 中心圖片大小
            const size = centerImageRadius * 2;
            ctx.save();
            ctx.beginPath();
            ctx.arc(0, 0, centerImageRadius, 0, Math.PI * 2);
            ctx.clip();
            ctx.drawImage(img, -size / 2, -size / 2, size, size);
            ctx.restore();
        }
    }
    
    // 第二部分：中間半透明黑膠環（70%透明度）- 縮小範圍
    ctx.save();
    ctx.globalAlpha = 0.7; // 70%透明度
    ctx.fillStyle = '#1c1f24'; // 深灰色黑膠
    ctx.beginPath();
    ctx.arc(0, 0, discRadius * 0.75, 0, Math.PI * 2); // 外徑（縮小）
    ctx.arc(0, 0, discRadius * 0.6, 0, Math.PI * 2, true); // 內徑（挖掉中心圖片）
    ctx.fill('evenodd');
    ctx.restore();
    
    // 第三部分：外圈圖片旋轉（70%透明度，圓形裁剪）- 擴大範圍
    if (vinylImage) {
        const img = getOrCreateCachedImage('vinylImageOuter', vinylImage);
        if (img && img.complete) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(0, 0, discRadius, 0, Math.PI * 2); // 外圈
            ctx.arc(0, 0, discRadius * 0.75, 0, Math.PI * 2, true); // 內圈（與黑膠環對齊）
            ctx.clip('evenodd');
            
            ctx.rotate(angle); // 跟著旋轉
            ctx.globalAlpha = 0.7; // 70%透明度
            const size = discRadius * 2;
            ctx.drawImage(img, -size / 2, -size / 2, size, size);
            ctx.restore();
        }
    }
    
    // 中心孔已移除

    ctx.restore();

    // 唱臂與唱針（縮短、左上接觸，含折角）- 根據 vinylNeedleEnabled 決定是否顯示
    if (vinylNeedleEnabled) {
        const baseX = centerX - discRadius * 0.92;
        const baseY = centerY - discRadius * 0.92;
        // 基座
        ctx.fillStyle = 'rgba(30,32,36,0.9)';
        ctx.beginPath();
        ctx.arc(baseX, baseY, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#9aa3ac';
        ctx.beginPath();
        ctx.arc(baseX, baseY, 8, 0, Math.PI * 2);
        ctx.fill();
        // 兩段式唱臂：基座 -> 肘節 -> 接觸點
        const contactAngle = -Math.PI * 0.72; // 左上
        const contactX = centerX + Math.cos(contactAngle) * ringRadius * 1.0;
        const contactY = centerY + Math.sin(contactAngle) * ringRadius * 1.0;
        const elbowX = baseX + (contactX - baseX) * 0.58 + 10;
        const elbowY = baseY + (contactY - baseY) * 0.58 - 6;
        const armGrad = ctx.createLinearGradient(baseX, baseY, contactX, contactY);
        armGrad.addColorStop(0, '#ffffff'); // 純白
        armGrad.addColorStop(1, '#e5e7eb'); // 白色
        ctx.strokeStyle = armGrad;
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        // 段1：基座 -> 肘
        ctx.beginPath();
        ctx.moveTo(baseX, baseY);
        ctx.lineTo(elbowX, elbowY);
        ctx.stroke();
        // 段2：肘 -> 接觸點（細一點）
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(elbowX, elbowY);
        ctx.lineTo(contactX, contactY);
        ctx.stroke();
        // 唱頭（矩形，短一些，停在中圈）
        const headLen = 14;
        const headWide = 8;
        const dirX = (contactX - elbowX);
        const dirY = (contactY - elbowY);
        const len = Math.hypot(dirX, dirY) || 1;
        const nx = dirX / len, ny = dirY / len;
        const px = -ny, py = nx;
        const hx = contactX - nx * (headLen * 0.2);
        const hy = contactY - ny * (headLen * 0.2);
        ctx.fillStyle = '#f3f4f6'; // 近白色唱頭
        ctx.beginPath();
        ctx.moveTo(hx + px * headWide, hy + py * headWide);
        ctx.lineTo(hx - px * headWide, hy - py * headWide);
        ctx.lineTo(hx - px * headWide + nx * headLen, hy - py * headWide + ny * headLen);
        ctx.lineTo(hx + px * headWide + nx * headLen, hy + py * headWide + ny * headLen);
        ctx.closePath();
        ctx.fill();
        // 針尖（小三角形，落在中圈，不進入內圈）
        ctx.fillStyle = '#ffffff'; // 針尖純白
        ctx.beginPath();
        const tipX = contactX;
        const tipY = contactY;
        ctx.moveTo(tipX, tipY);
        ctx.lineTo(tipX - nx * 6 + px * 3, tipY - ny * 6 + py * 3);
        ctx.lineTo(tipX - nx * 6 - px * 3, tipY - ny * 6 - py * 3);
        ctx.closePath();
        ctx.fill();
        // 針尖陰影
        ctx.globalAlpha = 0.25;
        ctx.beginPath();
        ctx.arc(centerX, centerY, ringRadius * 0.95, Math.atan2(hy-centerY, hx-centerX) - 0.02, Math.atan2(hy-centerY, hx-centerX) + 0.02);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 8;
        ctx.stroke();
        ctx.globalAlpha = 1;
    } // 關閉 vinylNeedleEnabled 條件判斷
    
    } // 關閉 vinylRecordEnabled 條件判斷
    
    // 控制卡 (右側) - 短一些、厚一些的樣式（始終顯示）
    const cardW = width * 0.21; // 長度改為目前的 70%
    const cardH = 300; // 高度固定為 300px
    const cardEnabled = (latestPropsRef as any)?.controlCardEnabled !== false; // 預設顯示                                                                      
    
    // 根據配置模式調整控制卡位置
    let cardX, cardY;
    const layoutMode = (latestPropsRef as any)?.vinylLayoutMode || 'horizontal';
    if (layoutMode === 'vertical') {
        // 上下排列：控制卡在唱片下方，確保不重疊
        cardX = centerX - cardW * 0.5;
        // 直接設定控制卡在唱片下方80像素處
        cardY = centerY + discRadius + 80;
        
        // 如果會超出畫布底部，則調整到安全位置
        if (cardY + cardH > height - 10) {
            cardY = height - cardH - 10;
        }
        
        // 確保控制卡不會超出左邊界
        cardX = Math.max(10, cardX);
        // 確保控制卡不會超出右邊界
        cardX = Math.min(cardX, width - cardW - 10);
    } else {
        // 左右排列：控制卡在唱片右側（預設）
        cardX = centerX + discRadius * 1.25;
        cardY = centerY - cardH * 0.5;
        // 確保控制卡不會超出右邊界
        if (cardX + cardW > width - 10) {
            cardX = width - cardW - 10;
        }
        // 確保控制卡不會超出上下邊界
        cardY = Math.max(10, Math.min(cardY, height - cardH - 10));
    }
    
    if (cardEnabled) {

        const style = (latestPropsRef as any)?.controlCardStyle as any;
        const color = (latestPropsRef as any)?.controlCardColor || '#111827';
         const bg = (latestPropsRef as any)?.controlCardBackgroundColor || 'rgba(0, 0, 0, 0.5)'; // 黑色背景，50%透明度

        // 卡片底
        if (style !== 'transparent') {
            ctx.fillStyle = bg;
        } else {
            ctx.fillStyle = 'rgba(0,0,0,0)';
        }
        ctx.strokeStyle = style === 'outline' ? color : 'rgba(0,0,0,0.07)';
        ctx.lineWidth = 2;
        const r = 14;
        ctx.beginPath();
        ctx.moveTo(cardX + r, cardY);
        ctx.lineTo(cardX + cardW - r, cardY);
        ctx.quadraticCurveTo(cardX + cardW, cardY, cardX + cardW, cardY + r);
        ctx.lineTo(cardX + cardW, cardY + cardH - r);
        ctx.quadraticCurveTo(cardX + cardW, cardY + cardH, cardX + cardW - r, cardY + cardH);
        ctx.lineTo(cardX + r, cardY + cardH);
        ctx.quadraticCurveTo(cardX, cardY + cardH, cardX, cardY + cardH - r);
        ctx.lineTo(cardX, cardY + r);
        ctx.quadraticCurveTo(cardX, cardY, cardX + r, cardY);
        ctx.closePath();
        if (style !== 'transparent') ctx.fill();
        if (style === 'outline') ctx.stroke();

        // 進度條和時間（放到底部一起顯示）
        const barMargin = 22;
        const barX = cardX + barMargin;
        const barW = cardW - barMargin * 2;
        // 時間文字（左/右）
        const timeToMMSS = (t: number) => {
            const m = Math.floor(t / 60);
            const s = Math.floor(t % 60);
            return `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
        };
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Poppins, sans-serif';
        ctx.textBaseline = 'middle';
        // 將時間與進度條一起上移，避免貼底
        const barY = cardY + cardH - 140; // 從底部往上 140px
        const timerY = barY + 24; // 置於進度條下方一點
        const bgStroke = 6;
        const fgStroke = 6;
        // 自訂樣式：膠囊形狀 + 漸層 + 刻度 + 斜紋填充
        const drawRoundedRect = (x:number, y:number, w:number, h:number, r:number) => {
            ctx.beginPath();
            ctx.moveTo(x + r, y);
            ctx.lineTo(x + w - r, y);
            ctx.quadraticCurveTo(x + w, y, x + w, y + r);
            ctx.lineTo(x + w, y + h - r);
            ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
            ctx.lineTo(x + r, y + h);
            ctx.quadraticCurveTo(x, y + h, x, y + h - r);
            ctx.lineTo(x, y + r);
            ctx.quadraticCurveTo(x, y, x + r, y);
            ctx.closePath();
        };
        const trackH = 10;
        const trackY = barY - trackH/2;
        // 背景膠囊
        const trackGrad = ctx.createLinearGradient(barX, trackY, barX + barW, trackY);
        trackGrad.addColorStop(0, 'rgba(255,255,255,0.08)');
        trackGrad.addColorStop(1, 'rgba(0,0,0,0.18)');
        ctx.fillStyle = trackGrad;
        drawRoundedRect(barX, trackY, barW, trackH, trackH/2);
        ctx.fill();
        // 內陰影
        ctx.strokeStyle = 'rgba(0,0,0,0.25)';
        ctx.lineWidth = 1;
        drawRoundedRect(barX+0.5, trackY+0.5, barW-1, trackH-1, trackH/2-1);
        ctx.stroke();
        // 刻度（10%）
        ctx.strokeStyle = 'rgba(255,255,255,0.15)';
        ctx.lineWidth = 2;
        for (let i=0;i<=10;i++) {
            const tx = barX + (barW * i/10);
            ctx.beginPath();
            ctx.moveTo(tx, trackY + trackH + 3);
            ctx.lineTo(tx, trackY + trackH + 7);
            ctx.stroke();
        }
        // 進度值（膠囊填充 + 斜紋）
        const audio = (latestPropsRef as any)?.audioRef?.current as HTMLAudioElement | undefined;
        const duration = audio?.duration || 0;
        const curTime = audio?.currentTime || 0;
        const progress = duration > 0 ? (curTime / duration) : 0.0;
        const fillW = Math.max(0, Math.min(barW, barW * progress));
        const fillGrad = ctx.createLinearGradient(barX, trackY, barX + fillW, trackY);
        fillGrad.addColorStop(0, color);
        fillGrad.addColorStop(1, 'rgba(255,255,255,0.85)');
        ctx.fillStyle = fillGrad;
        drawRoundedRect(barX, trackY, fillW, trackH, trackH/2);
        ctx.fill();
        // 斜紋動畫
        const stripeW = 8;
        const offset = ((typeof frame === 'number' ? frame : 0) % stripeW);
        ctx.save();
        ctx.beginPath();
        drawRoundedRect(barX, trackY, fillW, trackH, trackH/2);
        ctx.clip();
        ctx.strokeStyle = 'rgba(255,255,255,0.25)';
        ctx.lineWidth = 3;
        for (let x = barX - stripeW + offset; x < barX + fillW; x += stripeW) {
            ctx.beginPath();
            ctx.moveTo(x, trackY);
            ctx.lineTo(x + 6, trackY + trackH);
            ctx.stroke();
        }
        ctx.restore();
        // 節點
        ctx.fillStyle = '#ffffff';
        const knobX = barX + barW * progress;
        ctx.beginPath();
        ctx.arc(knobX, barY, 9, 0, Math.PI * 2);
        ctx.fill();
        // 左右時間文字與進度條同列
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 16px Poppins, sans-serif';
        ctx.textBaseline = 'middle';
        ctx.fillText(timeToMMSS(curTime), barX + 2, timerY);
        if (duration > 0) ctx.fillText(timeToMMSS(duration), barX + barW - 48, timerY);

        // 細長波形（貼近參考樣式）
        // 波形區域（左右縮短，預留左右 20px padding）
        const wavePadding = 20;
        const waveX = barX + wavePadding;
        const waveW = barW - wavePadding * 2;
        // 將波形再上移，預留更大底部空間
        const waveBaseline = cardY + 100;
        const samples = 64;
        const getSample = (t: number, bandStart: number, bandEnd: number) => {
            if (!dataArray) return 0.5;
            const len = dataArray.length;
            const s = Math.max(0, Math.min(len - 1, Math.floor(bandStart * len)));
            const e = Math.max(s + 1, Math.min(len, Math.floor(bandEnd * len)));
            const idx = s + Math.floor(t * (e - s - 1));
            return dataArray[idx] / 255;
        };
        // 線條波狀圖（白色，取中頻）- 先不繪製，最後覆蓋在山形圖上層
        // 提高線條振幅（x10）
        const waveHeight1 = 1300;
        const drawMidLine = () => {
            ctx.beginPath();
            for (let i = 0; i <= samples; i++) {
                const t = i / samples;
                const v = getSample(t, 0.25, 0.6);
                // 非線性增益，讓峰更高
                const amp = Math.max(0, v - 0.4);
                const y = waveBaseline - Math.pow(amp, 1.25) * waveHeight1;
                const x = waveX + t * waveW;
                if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
            }
            ctx.strokeStyle = 'rgba(255,255,255,0.92)';
            ctx.lineWidth = 2;
            ctx.stroke();
        };
        // 山形圖（黃綠，高頻，振幅明顯）：以折線形成的鋸齒/山峰並向下填滿
        // 條狀聲波圖（黃綠）：與白色線條共用同一條基準線與相同 X 取樣點
        const barCount = samples + 1; // 與線條同樣的取樣點數
        const barWidth = Math.max(2, (waveW / barCount) * 0.6); // 以取樣間距為基礎寬度
        for (let i = 0; i < barCount; i++) {
            const t = i / (barCount - 1);
            // 取低頻到中低頻，讓能量更有起伏
            const v = getSample(t, 0.05, 0.35);
            // 放大振幅，柱形更高
            const amp = Math.max(0, v - 0.28);
            const h = Math.pow(amp, 1.35) * 900; // x10 放大柱狀高度
            const xCenter = waveX + t * waveW;
            const x = xCenter - barWidth / 2; // 讓柱中心對齊線條的取樣 X
            const y = waveBaseline - h;
            const grad = ctx.createLinearGradient(0, y, 0, waveBaseline);
            grad.addColorStop(0, 'rgba(210,230,110,0.85)');
            grad.addColorStop(1, 'rgba(210,230,110,0.15)');
            ctx.fillStyle = grad;
            ctx.fillRect(x, y, barWidth, h);
            // 頂部高光
            ctx.fillStyle = 'rgba(255,255,255,0.25)';
            ctx.fillRect(x, y, barWidth, 2);
        }
        // 最後繪製白色中頻線條，與山形圖同基準線疊加
        drawMidLine();

        // 控制按鈕 (上一首/播放/下一首) 隨進度條整體上移，並與其保持距離
        const iconY = barY + 80;
        const gap = 100;
        const playX = cardX + cardW * 0.5;
        const prevX = playX - gap;
        const nextX = playX + gap;
        // 三個圓形按鈕（僅此一組）
        const drawCircle = (x: number, y: number) => {
            ctx.fillStyle = 'rgba(0,0,0,0.25)';
            ctx.beginPath();
            ctx.arc(x, y, 28, 0, Math.PI * 2);
            ctx.fill();
        };
        drawCircle(prevX, iconY);
        drawCircle(playX, iconY);
        drawCircle(nextX, iconY);
        // Prev ▶◀
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(prevX + 10, iconY - 10);
        ctx.lineTo(prevX - 6, iconY);
        ctx.lineTo(prevX + 10, iconY + 10);
        ctx.closePath();
        ctx.fill();
        // Pause ||
        ctx.fillRect(playX - 8, iconY - 12, 6, 24);
        ctx.fillRect(playX + 2, iconY - 12, 6, 24);
        // Next ◀▶
        ctx.beginPath();
        ctx.moveTo(nextX - 10, iconY - 10);
        ctx.lineTo(nextX + 6, iconY);
        ctx.lineTo(nextX - 10, iconY + 10);
        ctx.closePath();
        ctx.fill();
    }
};

// 圖片快取，避免每幀重建
const imageCache: Record<string, HTMLImageElement> = {};
function getOrCreateCachedImage(key: string, src: string): HTMLImageElement | null {
    const cached = imageCache[key];
    if (cached && cached.src === src) return cached;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = src;
    img.onload = () => {
        // 圖片載入後，下一幀即可繪製出來
        // 這裡不需要做任何事，主渲染迴圈會自動更新
        // 僅供除錯
        console.log('[Vinyl] image loaded', key);
    };
    img.onerror = (e) => {
        console.warn('[Vinyl] image failed to load', key, src, e);
    };
    imageCache[key] = img;
    return img;
}

// 鋼琴演奏家效果（只繪製鋼琴，音符在主要循環中處理）
const drawPianoVirtuoso: DrawFunction = (
    ctx,
    dataArray,
    width,
    height,
    frame,
    sensitivity,
    colors,
    graphicEffect,
    isBeat
) => {
    if (!dataArray) return;
    
    // 獲取鋼琴透明度設定
    const pianoOpacity = (latestPropsRef as any)?.pianoOpacity ?? 1.0;
    
    const keyboardHeight = height * 0.25;
    const numWhiteKeys = 28;
    const whiteKeyWidth = width / numWhiteKeys;
    const blackKeyWidth = whiteKeyWidth * 0.6;
    const blackKeyHeight = keyboardHeight * 0.6;
    
    // 只對鋼琴鍵盤應用透明度
    ctx.save();
    ctx.globalAlpha = pianoOpacity;
    
    // 繪製白鍵
    for (let i = 0; i < numWhiteKeys; i++) {
        const x = i * whiteKeyWidth;
        const keyDataPoints = Math.floor(dataArray.length * 0.7 / numWhiteKeys);
        const dataStart = i * keyDataPoints;
        const dataEnd = dataStart + keyDataPoints;
        
        let pressAmount = 0;
        for (let j = dataStart; j < dataEnd; j++) {
            pressAmount += dataArray[j] || 0;
        }
        pressAmount = pressAmount / (keyDataPoints * 255);
        
        const isPressed = (Math.pow(pressAmount, 2) * sensitivity) > 0.1;
        
        // 白鍵背景
        ctx.fillStyle = isPressed ? colors.accent : '#f8f9fa';
        ctx.strokeStyle = '#dee2e6';
        ctx.lineWidth = 1;
        
        ctx.fillRect(x, height - keyboardHeight, whiteKeyWidth - 1, keyboardHeight);
        ctx.strokeRect(x, height - keyboardHeight, whiteKeyWidth - 1, keyboardHeight);
        
        // 白鍵文字
        ctx.fillStyle = isPressed ? '#ffffff' : '#6c757d';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(String.fromCharCode(65 + (i % 7)), x + whiteKeyWidth / 2, height - 10);
    }
    
    // 繪製黑鍵
    const blackKeyPattern = [1, 1, 0, 1, 1, 1, 0];
    for (let i = 0; i < numWhiteKeys - 1; i++) {
        const patternIndex = i % 7;
        if (blackKeyPattern[patternIndex] === 1) {
            const x = (i + 1) * whiteKeyWidth - blackKeyWidth / 2;
            const pressAmount = ((dataArray[Math.floor(i * dataArray.length * 0.7 / numWhiteKeys)] || 0) + 
                               (dataArray[Math.floor((i + 1) * dataArray.length * 0.7 / numWhiteKeys)] || 0)) / 2 / 255;
            
            const isPressed = (Math.pow(pressAmount, 2) * sensitivity) > 0.15;
            
            ctx.fillStyle = isPressed ? colors.secondary : '#343a40';
            ctx.fillRect(x, height - keyboardHeight, blackKeyWidth, blackKeyHeight);
            
            // 黑鍵高光
            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            ctx.fillRect(x, height - keyboardHeight, blackKeyWidth, 5);
        }
    }
    
    // 恢復透明度設定，讓音符正常顯示
    ctx.restore();
};

const VISUALIZATION_MAP: Record<VisualizationType, DrawFunction> = {
    [VisualizationType.MONSTERCAT]: drawMonstercat,
    [VisualizationType.MONSTERCAT_V2]: drawMonstercatV2,
    [VisualizationType.MONSTERCAT_GLITCH]: drawMonstercatGlitch,
    [VisualizationType.NEBULA_WAVE]: drawNebulaWave,
    [VisualizationType.LUMINOUS_WAVE]: drawLuminousWave,
    [VisualizationType.FUSION]: drawFusion,
    [VisualizationType.TECH_WAVE]: drawTechWave,
    [VisualizationType.STELLAR_CORE]: drawStellarCore,
    [VisualizationType.WATER_RIPPLE]: drawWaterRipple,
    [VisualizationType.RADIAL_BARS]: drawRadialBars,
    [VisualizationType.PARTICLE_GALAXY]: drawSolarSystem,
    [VisualizationType.LIQUID_METAL]: drawLiquidMetal,
    [VisualizationType.CRT_GLITCH]: drawCrtGlitch,
    [VisualizationType.GLITCH_WAVE]: drawGlitchWave,
    [VisualizationType.DATA_MOSH]: drawDataMosh,
    [VisualizationType.SIGNAL_SCRAMBLE]: drawSignalScramble,
    [VisualizationType.PIXEL_SORT]: drawPixelSort,
    [VisualizationType.REPULSOR_FIELD]: drawRepulsorField,
    [VisualizationType.AUDIO_LANDSCAPE]: drawAudioLandscape,
    [VisualizationType.PIANO_VIRTUOSO]: drawPianoVirtuoso,
    [VisualizationType.GEOMETRIC_BARS]: drawGeometricBars,
    [VisualizationType.Z_CUSTOM]: drawGeometricBars, // 暫時使用 drawGeometricBars，稍後會替換
    [VisualizationType.VINYL_RECORD]: drawVinylRecord,
    [VisualizationType.BASIC_WAVE]: drawBasicWave,
    [VisualizationType.CHINESE_CONTROL_CARD]: drawBasicWave, // 暫時使用 drawBasicWave
    [VisualizationType.DYNAMIC_CONTROL_CARD]: drawDynamicControlCard,
    [VisualizationType.FRAME_PIXELATION]: drawFramePixelation,
    [VisualizationType.PHOTO_SHAKE]: drawPhotoShake,
    [VisualizationType.CIRCULAR_WAVE]: drawCircularWave,
    [VisualizationType.BLURRED_EDGE]: drawBlurredEdge,
    [VisualizationType.KE_YE_CUSTOM_V2]: drawKeYeCustomV2,
};

const IGNORE_TRANSFORM_VISUALIZATIONS = new Set([
    VisualizationType.PIANO_VIRTUOSO,
    VisualizationType.MONSTERCAT_GLITCH,
    VisualizationType.CRT_GLITCH,
    VisualizationType.GLITCH_WAVE,
    VisualizationType.DATA_MOSH,
    VisualizationType.SIGNAL_SCRAMBLE,
    VisualizationType.PIXEL_SORT,
]);

type Particle = {
    x: number;
    y: number;
    // Linear motion
    vx: number;
    vy: number;
    // Orbital motion
    angle: number;
    orbitRadius: number;
    baseOrbitRadius: number;
    angleVelocity: number;
    // Common properties
    radius: number;
    opacity: number;
    color: string;
};


type Shockwave = {
    radius: number;
    opacity: number;
    lineWidth: number;
};
const AudioVisualizer = forwardRef<HTMLCanvasElement, AudioVisualizerProps>((props, ref) => {
    const { analyser, audioRef, isPlaying, disableVisualizer } = props;
    const animationFrameId = useRef<number>(0);
    const frame = useRef<number>(0);
    const particlesRef = useRef<Particle[]>([]);
    const shockwavesRef = useRef<Shockwave[]>([]);
    const backgroundImageRef = useRef<HTMLImageElement | null>(null);
    const backgroundVideoRef = useRef<HTMLVideoElement | null>(null);
    const lastVideoFrameRef = useRef<ImageData | null>(null); // 保存最后一帧视频帧，用于循环时平滑过渡
    const geometricFrameImageRef = useRef<HTMLImageElement | null>(null);
    const geometricSemicircleImageRef = useRef<HTMLImageElement | null>(null);
    const propsRef = useRef(props);
    
    // 拖曳狀態管理
    const dragState = useRef({
        isDragging: false,
        draggedElement: null as string | null,
        dragOffset: { x: 0, y: 0 },
        startPosition: { x: 0, y: 0 }
    });
    
    // CTA 動畫狀態
    const ctaAnimationState = useRef({
        isPlaying: false,
        startTime: 0,
        duration: 5000, // 5秒
        currentFrame: 0
    });

    useEffect(() => {
        propsRef.current = props;
        latestPropsRef = props;
    }, [props]);

    useEffect(() => {
        // Clear dynamic elements when visualization changes to prevent artifacts
        particlesRef.current = [];
        shockwavesRef.current = [];
        // Also clear stateful visualizer data
        dataMoshState.imageData = null;
        dataMoshState.framesLeft = 0;
        pixelRainState.particles = [];

    }, [props.visualizationType]);
    
    useEffect(() => {
        if (props.backgroundImage) {
            console.log('Loading background image:', props.backgroundImage);
            const img = new Image();
            img.crossOrigin = 'anonymous'; // Important for canvas tainted issues
            img.src = props.backgroundImage;
            img.onload = () => {
                console.log('Background image loaded successfully');
                backgroundImageRef.current = img;
            };
            img.onerror = (error) => {
                console.error("Failed to load background image:", error);
                backgroundImageRef.current = null;
            }
        } else {
            console.log('No background image prop provided');
            backgroundImageRef.current = null;
        }
    }, [props.backgroundImage]);

    // 載入背景影片
    useEffect(() => {
        if (props.backgroundVideo) {
            console.log('Loading background video:', props.backgroundVideo);
            // 清除舊的影片
            if (backgroundVideoRef.current) {
                backgroundVideoRef.current.pause();
                backgroundVideoRef.current.src = '';
                backgroundVideoRef.current.load();
            }
            
            const video = document.createElement('video');
            video.crossOrigin = 'anonymous';
            video.src = props.backgroundVideo;
            video.loop = false; // 不使用 HTML5 的 loop 屬性，手動控制循環以避免閃爍
            video.muted = true; // 靜音，避免與音頻衝突
            video.playsInline = true;
            video.preload = 'auto'; // 預加載視頻，確保循環時更快準備好
            
            // 使用 seeked 事件確保視頻已跳轉到開始位置，避免黑色閃爍
            let isSeeking = false;
            let seekTimeout: number | null = null;
            
            video.onseeked = () => {
                if (isSeeking && props.isPlaying && audioRef.current && !audioRef.current.ended) {
                    isSeeking = false;
                    if (seekTimeout) {
                        clearTimeout(seekTimeout);
                        seekTimeout = null;
                    }
                    // 確保視頻已準備好再播放
                    if (video.readyState >= 2) {
                        video.play().catch(err => {
                            console.error('Failed to replay background video:', err);
                        });
                    } else {
                        // 如果還沒準備好，等待一下再播放
                        setTimeout(() => {
                            if (video.readyState >= 2 && props.isPlaying && audioRef.current && !audioRef.current.ended) {
                                video.play().catch(err => {
                                    console.error('Failed to replay background video after wait:', err);
                                });
                            }
                        }, 50);
                    }
                }
            };
            
            video.onloadedmetadata = () => {
                console.log('Background video loaded successfully');
                backgroundVideoRef.current = video;
                // 如果音頻正在播放，開始播放影片
                if (props.isPlaying && audioRef.current) {
                    video.currentTime = 0;
                    video.play().catch(err => {
                        console.error('Failed to play background video:', err);
                    });
                }
            };
            
            video.onerror = (error) => {
                console.error("Failed to load background video:", error);
                backgroundVideoRef.current = null;
            };
            
            // 監聽影片結束事件，實現循環播放直到音樂結束
            video.onended = () => {
                if (props.isPlaying && audioRef.current && !audioRef.current.ended) {
                    // 音樂還在播放，繼續循環影片
                    // 先暫停，然後跳轉，等待 seeked 事件後再播放，避免黑色閃爍
                    isSeeking = true;
                    video.pause();
                    // 使用 requestAnimationFrame 確保在下一幀之前完成跳轉
                    requestAnimationFrame(() => {
                        video.currentTime = 0;
                        // 設置超時，如果 seeked 事件沒有觸發，強制播放
                        if (seekTimeout) clearTimeout(seekTimeout);
                        seekTimeout = window.setTimeout(() => {
                            if (isSeeking && props.isPlaying && audioRef.current && !audioRef.current.ended) {
                                isSeeking = false;
                                if (video.readyState >= 2) {
                                    video.play().catch(err => {
                                        console.error('Failed to replay background video (timeout):', err);
                                    });
                                }
                            }
                        }, 200);
                    });
                } else {
                    // 音樂已結束，停止影片
                    video.pause();
                }
            };
            
            // 監聽音樂結束事件，停止影片播放
            const handleAudioEnded = () => {
                if (video && !video.paused) {
                    video.pause();
                }
            };
            
            if (audioRef.current) {
                audioRef.current.addEventListener('ended', handleAudioEnded);
            }
        } else {
            // 清除影片
            if (backgroundVideoRef.current) {
                backgroundVideoRef.current.pause();
                backgroundVideoRef.current.src = '';
                backgroundVideoRef.current.load();
            }
            backgroundVideoRef.current = null;
            lastVideoFrameRef.current = null; // 清除保存的幀
        }
        
        return () => {
            // 清理
            if (backgroundVideoRef.current) {
                backgroundVideoRef.current.pause();
                backgroundVideoRef.current.src = '';
                backgroundVideoRef.current.load();
            }
            lastVideoFrameRef.current = null; // 清除保存的幀
        };
    }, [props.backgroundVideo, props.isPlaying]);

    // 同步影片播放狀態與音頻播放狀態
    useEffect(() => {
        if (backgroundVideoRef.current) {
            if (props.isPlaying) {
                // 如果音頻正在播放，確保影片也在播放
                if (backgroundVideoRef.current.paused) {
                    backgroundVideoRef.current.play().catch(err => {
                        console.error('Failed to play background video:', err);
                    });
                }
            } else {
                // 如果音頻暫停，暫停影片
                if (!backgroundVideoRef.current.paused) {
                    backgroundVideoRef.current.pause();
                }
            }
        }
    }, [props.isPlaying]);

    // 載入幾何圖形圖片
    useEffect(() => {
        if (props.geometricFrameImage) {
            console.log('Loading geometric frame image:', props.geometricFrameImage);
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.src = props.geometricFrameImage;
            img.onload = () => {
                console.log('Geometric frame image loaded successfully');
                geometricFrameImageRef.current = img;
            };
            img.onerror = (error) => {
                console.error('Failed to load geometric frame image:', error);
                geometricFrameImageRef.current = null;
            };
        } else {
            geometricFrameImageRef.current = null;
        }
    }, [props.geometricFrameImage]);

    useEffect(() => {
        if (props.geometricSemicircleImage) {
            console.log('Loading geometric semicircle image:', props.geometricSemicircleImage);
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.src = props.geometricSemicircleImage;
            img.onload = () => {
                console.log('Geometric semicircle image loaded successfully');
                geometricSemicircleImageRef.current = img;
            };
            img.onerror = (error) => {
                console.error('Failed to load geometric semicircle image:', error);
                geometricSemicircleImageRef.current = null;
            };
        } else {
            geometricSemicircleImageRef.current = null;
        }
    }, [props.geometricSemicircleImage]);

    // 濾鏡特效粒子系統狀態
    const filterParticlesRef = useRef<FilterParticle[]>([]);
    const lastFilterTypeRef = useRef<FilterEffectType | null>(null);

    const renderFrame = useCallback(() => {
        const {
            visualizationType, customText, textColor, fontFamily, graphicEffect, 
            textSize, textPositionX, textPositionY,
            sensitivity, smoothing, equalization, backgroundColor, colors, watermarkPosition, 
            waveformStroke, isTransitioning, transitionType, backgroundImages, currentImageIndex,
            subtitles, showSubtitles, subtitleFontSize, subtitleFontFamily, 
            subtitleColor, subtitleEffect, subtitleBgStyle, effectScale, effectOffsetX, effectOffsetY,
            filterEffectType, filterEffectIntensity, filterEffectOpacity, filterEffectSpeed, filterEffectEnabled,
            controlCardEnabled, controlCardFontSize, controlCardStyle, controlCardColor, controlCardBackgroundColor
        } = propsRef.current;

        const canvas = (ref as React.RefObject<HTMLCanvasElement>).current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // If visualizer is disabled, skip visualizer effects but continue with normal flow
        const isVisualizerDisabled = propsRef.current.disableVisualizer;

        // Only require analyser for visualizer effects, not for background/subtitles
        if (!analyser && !isVisualizerDisabled) return;

        frame.current++;
        
        // Only process audio data if analyser is available
        let dataArray: Uint8Array | null = null;
        let bassAvg = 0;
        let isBeat = false;
        
        if (analyser) {
            dataArray = new Uint8Array(analyser.frequencyBinCount);
            analyser.getByteFrequencyData(dataArray as any);
            bassAvg = dataArray.slice(0, 32).reduce((a, b) => a + b, 0) / 32;
            if (bassAvg > 180) {
                isBeat = true;
            }
        }
        
        const balancedData = equalizeDataArray(dataArray, equalization);
        const smoothedData = smoothDataArray(balancedData, smoothing);

        const { width, height } = canvas;
        const centerX = width / 2;
        const centerY = height / 2;
        
        let finalColors = { ...colors };
        if (finalColors.name === ColorPaletteType.RAINBOW) {
            const currentHue = (frame.current * 0.1) % 360;
            const hueRangeStart = currentHue;
            const hueRangeEnd = currentHue + 80; 
            
            finalColors = {
                ...finalColors,
                primary: `hsl(${currentHue}, 90%, 60%)`,
                secondary: `hsl(${(currentHue + 120) % 360}, 80%, 60%)`,
                accent: `hsl(${(currentHue + 40) % 360}, 100%, 80%)`,
                hueRange: [hueRangeStart, hueRangeEnd]
            };
        }
        
        if (backgroundColor === 'transparent') {
            ctx.clearRect(0, 0, width, height);
        } else {
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, width, height);
        }
        
        // 優先繪製影片，如果沒有影片則繪製圖片
        // 檢查是否有背景視頻或圖片需要繪製
        const video = backgroundVideoRef.current;
        const hasBackgroundVideo = video && video.readyState >= 2;
        const hasBackgroundImage = backgroundImageRef.current && backgroundImageRef.current.complete;
        
        if (hasBackgroundVideo && video) {
            const canvasAspect = width / height;
            const videoAspect = video.videoWidth / video.videoHeight;
            let sx, sy, sWidth, sHeight;

            if (canvasAspect > videoAspect) {
                sWidth = video.videoWidth;
                sHeight = sWidth / canvasAspect;
                sx = 0;
                sy = (video.videoHeight - sHeight) / 2;
            } else {
                sHeight = video.videoHeight;
                sWidth = sHeight * canvasAspect;
                sy = 0;
                sx = (video.videoWidth - sWidth) / 2;
            }
            
            // 檢查視頻是否準備好繪製
            if (video.readyState >= 2) {
                try {
                    ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, width, height);
                    // 保存當前幀，用於循環時平滑過渡（每10幀保存一次，避免性能問題）
                    if (frame.current % 10 === 0) {
                        try {
                            lastVideoFrameRef.current = ctx.getImageData(0, 0, width, height);
                        } catch (e) {
                            // 如果無法保存（可能是跨域問題），忽略
                        }
                    }
                } catch (error) {
                    console.error('Error drawing video:', error);
                    // 如果繪製失敗，嘗試使用保存的幀
                    if (lastVideoFrameRef.current) {
                        ctx.putImageData(lastVideoFrameRef.current, 0, 0);
                    }
                }
            } else if (lastVideoFrameRef.current) {
                // 如果視頻還沒準備好（循環時），使用保存的最後一幀
                ctx.putImageData(lastVideoFrameRef.current, 0, 0);
            }
        } else if (hasBackgroundImage) {
            const img = backgroundImageRef.current;
            const canvasAspect = width / height;
            const imageAspect = img.width / img.height;
            let sx, sy, sWidth, sHeight;

            if (canvasAspect > imageAspect) {
                sWidth = img.width;
                sHeight = sWidth / canvasAspect;
                sx = 0;
                sy = (img.height - sHeight) / 2;
            } else {
                sHeight = img.height;
                sWidth = sHeight * canvasAspect;
                sy = 0;
                sx = (img.width - sWidth) / 2;
            }
            ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, width, height);
        }

        // 繪製轉場動畫（只在背景圖片區域）
        if (isTransitioning && backgroundImages.length > 0) {
            // 計算平滑的轉場進度
            const transitionProgress = calculateTransitionProgress(transitionType);
            
            drawTransitionEffect(ctx, width, height, transitionType, transitionProgress);
        }

        // 調試覆蓋層已移除

        const drawFunction = VISUALIZATION_MAP[visualizationType];
        if (drawFunction && !isVisualizerDisabled) {
            const shouldTransform = !IGNORE_TRANSFORM_VISUALIZATIONS.has(visualizationType);

            if (shouldTransform) {
                ctx.save();
                const currentTransform = propsRef.current.visualizationTransform || { x: 0, y: 0, scale: 1.0 };
                const dragOffset = dragState.current.draggedElement === 'visualization' ? dragState.current.dragOffset : { x: 0, y: 0 };
                const scale = propsRef.current.visualizationScale || 1.0;
                ctx.translate(centerX + effectOffsetX + currentTransform.x + dragOffset.x, centerY + effectOffsetY + currentTransform.y + dragOffset.y);
                ctx.scale(effectScale * scale, effectScale * scale);
                ctx.translate(-centerX, -centerY);
            }

            if (visualizationType === VisualizationType.STELLAR_CORE) {
                const bass = smoothedData.slice(0, 32).reduce((a, b) => a + b, 0) / 32;
                const normalizedBass = bass / 255;
                const bgGlowRadius = Math.min(width, height) * 0.5 + normalizedBass * 50;
                const bgGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, bgGlowRadius);
                bgGradient.addColorStop(0, finalColors.backgroundGlow);
                bgGradient.addColorStop(1, 'rgba(10, 20, 40, 0)');
                ctx.fillStyle = bgGradient;
                ctx.fillRect(0, 0, width, height);
            }
            if (visualizationType === VisualizationType.GEOMETRIC_BARS) {
                // 可夜特別訂製版需要特殊處理，傳遞額外參數
                drawGeometricBars(ctx, smoothedData, width, height, frame.current, sensitivity, finalColors, graphicEffect, isBeat, waveformStroke, particlesRef.current, geometricFrameImageRef.current, geometricSemicircleImageRef.current, propsRef.current, controlCardEnabled, controlCardFontSize, controlCardStyle, controlCardColor, controlCardBackgroundColor);
            } else if (visualizationType === VisualizationType.Z_CUSTOM) {
                // Z總訂製款需要特殊處理，傳遞額外參數
                const currentFrame = typeof frame.current === 'number' ? frame.current : 0;
                drawZCustomVisualization(ctx, width, height, propsRef.current.zCustomCenterImage, propsRef, currentFrame);
        } else if (visualizationType === VisualizationType.VINYL_RECORD) {
            // 檢查是否啟用唱片顯示
            const vinylRecordEnabled = propsRef.current?.vinylRecordEnabled !== false;
            const vinylNeedleEnabled = propsRef.current?.vinylNeedleEnabled !== false;
            drawVinylRecord(ctx, smoothedData, width, height, frame.current, sensitivity, finalColors, graphicEffect, isBeat, waveformStroke, particlesRef.current, geometricFrameImageRef.current, geometricSemicircleImageRef.current, vinylRecordEnabled, vinylNeedleEnabled);
        } else if (visualizationType === VisualizationType.PHOTO_SHAKE) {
            // 相片晃動需要傳遞 props
            drawPhotoShake(ctx, smoothedData, width, height, frame.current, sensitivity, finalColors, graphicEffect, isBeat, waveformStroke, propsRef.current);
        } else if (visualizationType === VisualizationType.FRAME_PIXELATION) {
            // 方框 像素化需要傳遞 props
            drawFramePixelation(ctx, smoothedData, width, height, frame.current, sensitivity, finalColors, graphicEffect, isBeat, waveformStroke, propsRef.current);
        } else if (visualizationType === VisualizationType.DYNAMIC_CONTROL_CARD) {
            // 重低音強化需要傳遞 props
            drawDynamicControlCard(ctx, smoothedData, width, height, frame.current, sensitivity, finalColors, graphicEffect, isBeat, waveformStroke, propsRef.current);
        } else if (visualizationType === VisualizationType.CIRCULAR_WAVE) {
            // 圓形波形需要傳遞 props
            drawCircularWave(ctx, smoothedData, width, height, frame.current, sensitivity, finalColors, graphicEffect, isBeat, waveformStroke, propsRef.current);
        } else if (visualizationType === VisualizationType.BLURRED_EDGE) {
            // 邊緣虛化需要傳遞 props
            drawBlurredEdge(ctx, smoothedData, width, height, frame.current, sensitivity, finalColors, graphicEffect, isBeat, waveformStroke, propsRef.current);
        } else if (visualizationType === VisualizationType.KE_YE_CUSTOM_V2) {
            // 可夜訂製版二號需要傳遞 props
            drawKeYeCustomV2(ctx, smoothedData, width, height, frame.current, sensitivity, finalColors, graphicEffect, isBeat, waveformStroke, propsRef.current);
        } else {
            drawFunction(ctx, smoothedData, width, height, frame.current, sensitivity, finalColors, graphicEffect, isBeat, waveformStroke, particlesRef.current);
        }
            
            if (shouldTransform) {
                ctx.restore();
            }
        }
        
        if (visualizationType === VisualizationType.PIANO_VIRTUOSO) {
            const keyboardHeight = height * 0.25;
            const numWhiteKeys = 28;
            const whiteKeyWidth = width / numWhiteKeys;
            const keyDataPoints = Math.floor(smoothedData.length * 0.7 / numWhiteKeys);
            const whiteKeyPresses = new Array(numWhiteKeys).fill(0);
            for (let i = 0; i < numWhiteKeys; i++) {
                let pressAmount = 0;
                const dataStart = i * keyDataPoints;
                const dataEnd = dataStart + keyDataPoints;
                for (let j = dataStart; j < dataEnd; j++) {
                    pressAmount += smoothedData[j] || 0;
                }
                whiteKeyPresses[i] = pressAmount / (keyDataPoints * 255);
            }
            whiteKeyPresses.forEach((pressAmount, i) => {
                const isPressed = (Math.pow(pressAmount, 2) * sensitivity) > 0.1;
                if (isPressed && Math.random() > 0.8) {
                    particlesRef.current.push({ x: i * whiteKeyWidth + whiteKeyWidth / 2, y: height - keyboardHeight, vy: -3 - (pressAmount * 6), vx: (Math.random() - 0.5) * 1.5, opacity: 1, radius: 25 + (pressAmount * 40), color: finalColors.accent, angle: Math.random(), orbitRadius: 0, baseOrbitRadius: 0, angleVelocity: 0 });
                }
            });
            const blackKeyPattern = [1, 1, 0, 1, 1, 1, 0];
            for (let i = 0; i < numWhiteKeys - 1; i++) {
                const patternIndex = i % 7;
                if (blackKeyPattern[patternIndex] === 1) {
                    const pressAmount = (whiteKeyPresses[i] + whiteKeyPresses[i+1]) / 2;
                    const isPressed = (Math.pow(pressAmount, 2) * sensitivity) > 0.15;
                    if (isPressed && Math.random() > 0.8) {
                        particlesRef.current.push({ x: (i + 1) * whiteKeyWidth, y: height - keyboardHeight, vy: -3 - (pressAmount * 6), vx: (Math.random() - 0.5) * 1.5, opacity: 1, radius: 25 + (pressAmount * 30), color: finalColors.secondary, angle: Math.random(), orbitRadius: 0, baseOrbitRadius: 0, angleVelocity: 0 });
                    }
                }
            }
        }
        particlesRef.current.forEach(p => {
            p.y += p.vy;
            p.x += p.vx;
            p.vy += 0.08;
            p.opacity -= 0.015;
        });
        
        // 繪製音符粒子
        particlesRef.current.forEach(p => {
            const noteSymbols = ['♪', '♫', '♬', '♭', '♯'];
            const symbol = noteSymbols[Math.floor(p.angle * noteSymbols.length)];
            
            ctx.save();
            ctx.font = `bold ${p.radius}px "Arial"`;
            ctx.fillStyle = applyAlphaToColor(p.color, p.opacity);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            
            // 添加發光效果
            ctx.shadowColor = applyAlphaToColor(p.color, p.opacity * 0.8);
            ctx.shadowBlur = 15;
            
            ctx.fillText(symbol, p.x, p.y);
            ctx.restore();
        });
        
        particlesRef.current = particlesRef.current.filter(p => p.opacity > 0 && p.y < height + 100);

        // Z總訂製款可視化已在主要繪製循環中處理，無需重複繪製

        // 濾鏡特效處理
        if (filterEffectEnabled && filterEffectType) {
            // 檢查濾鏡類型是否改變，如果改變則重新初始化粒子
            if (lastFilterTypeRef.current !== filterEffectType) {
                filterParticlesRef.current = [];
                lastFilterTypeRef.current = filterEffectType;
            }
            
            // 添加新粒子（增加隨機性，不要一次性創建太多）
            const resolutionScale = Math.max(width / 1920, height / 1080) * 1.5;
            const maxParticleCount = Math.floor((filterEffectIntensity || 0.5) * 80 * resolutionScale);
            
            // 隨機添加新粒子，避免整齊的批次
            if (filterParticlesRef.current.length < maxParticleCount && Math.random() < 0.15) {
                const newParticle = createFilterParticle(filterEffectType, width, height);
                filterParticlesRef.current.push(newParticle);
            }
            
            // 移除超出邊界的粒子
            filterParticlesRef.current = filterParticlesRef.current.filter(particle => {
                // 檢查粒子是否超出邊界
                if (particle.y > height + 20 || 
                    particle.x < -20 || 
                    particle.x > width + 20) {
                    return false;
                }
                return true;
            });
            
            // 繪製濾鏡特效（在所有其他內容之上）
            drawFilterEffects(
                ctx, 
                width, 
                height, 
                filterEffectType, 
                filterEffectIntensity || 0.5, 
                filterEffectOpacity || 0.6, 
                filterEffectSpeed || 1.0, 
                filterParticlesRef.current, 
                frame.current
            );
        }

        // 字幕和自定義文字最後繪製，確保在最上層
        const currentTime = audioRef.current?.currentTime ?? 0;
        let currentSubtitle: Subtitle | undefined = undefined;
        if (showSubtitles && subtitles.length > 0) {
            for (let i = subtitles.length - 1; i >= 0; i--) {
                const subtitle = subtitles[i];
                if (currentTime >= subtitle.time) {
                    // 檢查結束時間
                    if (!subtitle.endTime || currentTime <= subtitle.endTime) {
                        currentSubtitle = subtitle;
                    break;
                    }
                }
            }
        }
        // 根據字幕顯示模式決定顯示內容
        if (propsRef.current.subtitleDisplayMode === SubtitleDisplayMode.LYRICS_SCROLL && subtitles.length > 0) {
            // 捲軸歌詞模式
            const dragOffset = dragState.current.draggedElement === 'lyrics' ? dragState.current.dragOffset : (propsRef.current.lyricsDragOffset || { x: 0, y: 0 });
            drawLyricsDisplay(ctx, width, height, subtitles, currentTime, { 
                fontFamily: propsRef.current.lyricsFontFamily, 
                bgStyle: subtitleBgStyle,
                fontSize: propsRef.current.lyricsFontSize,
                positionX: propsRef.current.lyricsPositionX + (dragOffset.x / width) * 100,
                positionY: propsRef.current.lyricsPositionY + (dragOffset.y / height) * 100,
                color: subtitleColor,
                effect: subtitleEffect || GraphicEffectType.NONE
            });
        } else if (propsRef.current.subtitleDisplayMode === SubtitleDisplayMode.WORD_BY_WORD && subtitles.length > 0) {
            // 逐字顯示模式
            const dragOffset = dragState.current.draggedElement === 'subtitle' ? dragState.current.dragOffset : (propsRef.current.subtitleDragOffset || { x: 0, y: 0 });
            drawWordByWordSubtitles(ctx, width, height, subtitles, currentTime, { 
                fontFamily: subtitleFontFamily, 
                bgStyle: subtitleBgStyle,
                fontSizeVw: subtitleFontSize,
                color: subtitleColor,
                effect: subtitleEffect || GraphicEffectType.NONE,
                isBeat,
                dragOffset,
                strokeColor: propsRef.current.subtitleStrokeColor
            });
        } else if (propsRef.current.subtitleDisplayMode === SubtitleDisplayMode.SLIDING_GROUP && subtitles.length > 0) {
            // 滚动字幕组模式
            const dragOffset = dragState.current.draggedElement === 'subtitle' ? dragState.current.dragOffset : (propsRef.current.subtitleDragOffset || { x: 0, y: 0 });
            drawSlidingGroupSubtitles(ctx, width, height, subtitles, currentTime, { 
                fontFamily: subtitleFontFamily, 
                bgStyle: subtitleBgStyle,
                fontSizeVw: subtitleFontSize,
                color: subtitleColor,
                effect: subtitleEffect || GraphicEffectType.NONE,
                isBeat,
                dragOffset
            });
        } else if (propsRef.current.subtitleDisplayMode === SubtitleDisplayMode.CLASSIC && currentSubtitle) {
            // 傳統字幕模式
            const dragOffset = dragState.current.draggedElement === 'subtitle' ? dragState.current.dragOffset : (propsRef.current.subtitleDragOffset || { x: 0, y: 0 });
            drawSubtitles(ctx, width, height, currentSubtitle, { 
                fontSizeVw: subtitleFontSize, 
                fontFamily: subtitleFontFamily, 
                color: subtitleColor, 
                effect: subtitleEffect || GraphicEffectType.NONE, 
                bgStyle: subtitleBgStyle, 
                isBeat,
                dragOffset,
                orientation: propsRef.current.subtitleOrientation,
                strokeColor: propsRef.current.subtitleStrokeColor
            });
        }
        // 無字幕模式：不顯示任何字幕
        if (customText) {
            const actualFontName = FONT_MAP[fontFamily] || 'Poppins';
            drawCustomText(ctx, customText, smoothedData, { 
                width, 
                height, 
                color: textColor, 
                fontFamily: actualFontName, 
                graphicEffect, 
                position: watermarkPosition, 
                textSize: textSize,
                textPositionX: textPositionX,
                textPositionY: textPositionY,
                isBeat 
            });
        }
        
        // 繪製 CTA 動畫（在字幕之後，但確保不覆蓋字幕）
        if (propsRef.current.showCtaAnimation && propsRef.current.ctaChannelName) {
            // 計算 CTA 位置，包含拖動偏移
            const basePosition = propsRef.current.ctaPosition || { x: 50, y: 50 };
            const dragOffset = dragState.current.isDragging && dragState.current.draggedElement === 'cta' 
                ? dragState.current.dragOffset 
                : { x: 0, y: 0 };
            
            const ctaPosition = {
                x: basePosition.x + (dragOffset.x / width) * 100,
                y: basePosition.y + (dragOffset.y / height) * 100
            };
            
            drawCtaAnimation(ctx, width, height, propsRef.current.ctaChannelName, ctaPosition, propsRef.current.ctaFontFamily);
        }
        
        if (propsRef.current.isPlaying) {
            animationFrameId.current = requestAnimationFrame(renderFrame);
        }
    }, [analyser, ref, disableVisualizer]);

    useEffect(() => {
        if (isPlaying) {
            animationFrameId.current = requestAnimationFrame(renderFrame);
        } else {
            cancelAnimationFrame(animationFrameId.current);
            setTimeout(() => {
                if (!propsRef.current.isPlaying) renderFrame();
            }, 0);
        }
        return () => {
            cancelAnimationFrame(animationFrameId.current);
        };
    }, [isPlaying, renderFrame, disableVisualizer, analyser]);

    useEffect(() => {
        const canvas = (ref as React.RefObject<HTMLCanvasElement>)?.current;
        if (!canvas) return;
        
        const observer = new ResizeObserver(entries => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect;
                 if (canvas.width !== width || canvas.height !== height) {
                    canvas.width = width;
                    canvas.height = height;
                }
            }
        });

        observer.observe(canvas);
        
        return () => {
            observer.disconnect();
        };
    }, [ref]);

    // 拖曳事件處理
    useEffect(() => {
        const canvas = (ref as React.RefObject<HTMLCanvasElement>)?.current;
        if (!canvas) return;

        const getCanvasPosition = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            return {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        };

        const handleMouseDown = (e: MouseEvent) => {
            const pos = getCanvasPosition(e);
            const { width, height } = canvas;
            
            // 檢測點擊的元素
            const clickedElement = detectElementAtPosition(pos, width, height);
            console.log('Mouse down at:', pos, 'Clicked element:', clickedElement);
            if (clickedElement) {
                // 拖曳
                dragState.current.isDragging = true;
                dragState.current.draggedElement = clickedElement;
                dragState.current.startPosition = pos;
                dragState.current.dragOffset = { x: 0, y: 0 };
                canvas.style.cursor = 'grabbing';
                
                console.log('Started dragging:', clickedElement);
                
                // 防止默認行為
                e.preventDefault();
            }
        };

        const handleMouseMove = (e: MouseEvent) => {
            if (dragState.current.isDragging && dragState.current.draggedElement) {
                const pos = getCanvasPosition(e);
                dragState.current.dragOffset = {
                    x: pos.x - dragState.current.startPosition.x,
                    y: pos.y - dragState.current.startPosition.y
                };
                
                // 防止默認行為
                e.preventDefault();
            }
        };

        const handleMouseUp = () => {
            if (dragState.current.isDragging && dragState.current.draggedElement) {
                // 更新元素位置
                updateElementPosition(dragState.current.draggedElement, dragState.current.dragOffset);
                
                // 重置拖曳狀態
                dragState.current.isDragging = false;
                dragState.current.draggedElement = null;
                dragState.current.dragOffset = { x: 0, y: 0 };
                canvas.style.cursor = 'default';
            }
        };

        canvas.addEventListener('mousedown', handleMouseDown, { passive: false });
        canvas.addEventListener('mousemove', handleMouseMove, { passive: false });
        canvas.addEventListener('mouseup', handleMouseUp);
        canvas.addEventListener('mouseleave', handleMouseUp);

        return () => {
            canvas.removeEventListener('mousedown', handleMouseDown);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('mouseup', handleMouseUp);
            canvas.removeEventListener('mouseleave', handleMouseUp);
        };
    }, [ref]);

    // 檢測點擊位置的元素
    const detectElementAtPosition = (pos: { x: number; y: number }, width: number, height: number): string | null => {
        const { visualizationType, showSubtitles, subtitleDisplayMode, subtitles, currentTime } = propsRef.current;
        
        // 優先檢測 CTA 動畫區域（獨立功能，適用於所有可視化）
        if (propsRef.current.showCtaAnimation && propsRef.current.ctaChannelName && propsRef.current.ctaPosition) {
            const basePosition = propsRef.current.ctaPosition || { x: 50, y: 50 };
            const dragOffset = dragState.current.isDragging && dragState.current.draggedElement === 'cta' 
                ? dragState.current.dragOffset 
                : { x: 0, y: 0 };
            
            // 使用與渲染時相同的計算方式
            const ctaPosition = {
                x: basePosition.x + (dragOffset.x / width) * 100,
                y: basePosition.y + (dragOffset.y / height) * 100
            };
            
            const ctaX = (ctaPosition.x / 100) * width;
            const ctaY = (ctaPosition.y / 100) * height;
            const ctaSize = 600; // 擴大 CTA 檢測區域，因為 CTA 動畫比較大 (520x140)
            
            if (pos.x >= ctaX - ctaSize / 2 && pos.x <= ctaX + ctaSize / 2 &&
                pos.y >= ctaY - ctaSize / 2 && pos.y <= ctaY + ctaSize / 2) {
                console.log('CTA detected at:', { ctaX, ctaY, ctaSize, pos });
                return 'cta';
            }
        }
        
        // 檢測可視化區域 - 縮小拖曳範圍
        if (visualizationType === VisualizationType.GEOMETRIC_BARS) {
            const centerX = width / 2;
            const centerY = height * 0.4;
            const frameSize = Math.min(width * 0.4, height * 0.5);
            const frameX = centerX - frameSize / 2;
            const frameY = centerY - frameSize / 2;
            
            // 縮小拖曳範圍，只在中央區域
            const dragMargin = frameSize * 0.2; // 縮小20%的邊界
            if (pos.x >= frameX + dragMargin && pos.x <= frameX + frameSize - dragMargin &&
                pos.y >= frameY + dragMargin && pos.y <= frameY + frameSize - dragMargin) {
                return 'visualization';
            }
            
        } else {
            // 其他可視化類型 - 縮小中央區域
            const centerX = width / 2;
            const centerY = height / 2;
            const vizWidth = width * 0.3; // 縮小到30%
            const vizHeight = height * 0.3; // 縮小到30%
            
            if (pos.x >= centerX - vizWidth / 2 && pos.x <= centerX + vizWidth / 2 &&
                pos.y >= centerY - vizHeight / 2 && pos.y <= centerY + vizHeight / 2) {
                return 'visualization';
            }
        }
        
        // 檢測字幕區域 - 優化拖曳判定
        if (showSubtitles && subtitles.length > 0) {
            if (subtitleDisplayMode === SubtitleDisplayMode.LYRICS_SCROLL) {
                // 捲軸歌詞模式 - 擴大檢測區域
                const centerX = width / 2;
                const centerY = height / 2;
                const lyricsWidth = width * 0.9; // 擴大檢測範圍
                const lyricsHeight = height * 0.7; // 擴大檢測範圍
                
                if (pos.x >= centerX - lyricsWidth / 2 && 
                    pos.x <= centerX + lyricsWidth / 2 &&
                    pos.y >= centerY - lyricsHeight / 2 && 
                    pos.y <= centerY + lyricsHeight / 2) {
                    return 'lyrics';
                }
            } else {
                // 傳統字幕和逐字顯示模式 - 根據方向設定檢測區域
                const orientation = propsRef.current.subtitleOrientation;
                
                if (orientation === SubtitleOrientation.VERTICAL) {
                    // 直式字幕 - 檢測右側區域
                    const subtitleX = width - (width * 0.1); // 距離右邊 10%
                    const subtitleWidth = width * 0.15; // 檢測寬度
                    const centerY = height / 2;
                    const subtitleHeight = height * 0.6; // 檢測高度
                    
                    if (pos.x >= subtitleX - subtitleWidth && pos.x <= subtitleX + subtitleWidth &&
                        pos.y >= centerY - subtitleHeight / 2 && pos.y <= centerY + subtitleHeight / 2) {
                        return 'subtitle';
                    }
                } else {
                    // 橫式字幕 - 檢測底部區域
                const subtitleY = height - (height * 0.08);
                    const subtitleHeight = height * 0.25;
                
                if (pos.y >= subtitleY - subtitleHeight && pos.y <= subtitleY + subtitleHeight) {
                    return 'subtitle';
                    }
                }
            }
        }
        
        return null;
    };
    // 更新元素位置
    const updateElementPosition = (element: string, offset: { x: number; y: number }) => {
        const { width, height } = (ref as React.RefObject<HTMLCanvasElement>).current || { width: 0, height: 0 };
        
        if (element === 'visualization') {
            // 更新可視化位置
            if (propsRef.current.onVisualizationTransformUpdate) {
                const currentTransform = propsRef.current.visualizationTransform || { x: 0, y: 0, scale: 1.0 };
                propsRef.current.onVisualizationTransformUpdate({
                    ...currentTransform,
                    x: currentTransform.x + offset.x,
                    y: currentTransform.y + offset.y
                });
            }
        } else if (element === 'cta') {
            // 更新 CTA 位置
            if (propsRef.current.onCtaPositionUpdate) {
                const currentPosition = propsRef.current.ctaPosition || { x: 50, y: 50 };
                const newX = Math.max(0, Math.min(100, currentPosition.x + (offset.x / width) * 100));
                const newY = Math.max(0, Math.min(100, currentPosition.y + (offset.y / height) * 100));
                propsRef.current.onCtaPositionUpdate({ x: newX, y: newY });
            }
        } else if (element === 'lyrics') {
            // 更新歌詞位置
            const newPositionX = (offset.x / width) * 100;
            const newPositionY = (offset.y / height) * 100;
            
            // 通過回調更新位置
            if (propsRef.current.onLyricsDragUpdate) {
                propsRef.current.onLyricsDragUpdate({ x: offset.x, y: offset.y });
            }
        } else if (element === 'subtitle') {
            // 更新字幕位置
            if (propsRef.current.onSubtitleDragUpdate) {
                propsRef.current.onSubtitleDragUpdate({ x: offset.x, y: offset.y });
            }
        }
    };
    // 繪製 CTA 動畫
    const drawCtaAnimation = (ctx: CanvasRenderingContext2D, width: number, height: number, channelName: string, position: { x: number; y: number }, fontFamily?: FontType) => {
        const currentTime = Date.now();
        const audioCurrentTime = propsRef.current.audioRef?.current?.currentTime || 0;
        
        // 只在音頻開始的前10秒顯示，但允許拖動時或暫停時顯示
        // 修改：如果沒有音頻播放，也顯示 CTA 動畫
        if (audioCurrentTime > 10 && !dragState.current.isDragging && propsRef.current.isPlaying && propsRef.current.audioRef?.current) return;
        
        const ctaX = (position.x / 100) * width;
        const ctaY = (position.y / 100) * height;
        
        // 動畫進度 (0-1)
        const progress = Math.min(audioCurrentTime / 10, 1);
        
        // 淡入效果
        const alpha = progress < 0.1 ? progress * 10 : (progress > 0.9 ? (1 - progress) * 10 : 1);
        
        ctx.save();
        ctx.globalAlpha = alpha;
        
        // 計算動畫階段 - 全部一起閃動
        const flashPhase = Math.min(audioCurrentTime / 6, 1); // 前6秒：全部元素一起閃動
        
        // 美化透明圓角框背景
        const frameWidth = 520;
        const frameHeight = 140;
        const cornerRadius = 25;
        
        // 外層光暈效果
        const outerGlow = ctx.createRadialGradient(ctaX, ctaY, 0, ctaX, ctaY, frameWidth / 2 + 30);
        outerGlow.addColorStop(0, 'rgba(255, 0, 0, 0.1)');
        outerGlow.addColorStop(0.7, 'rgba(255, 0, 0, 0.05)');
        outerGlow.addColorStop(1, 'rgba(255, 0, 0, 0)');
        ctx.fillStyle = outerGlow;
        ctx.fillRect(ctaX - frameWidth / 2 - 30, ctaY - frameHeight / 2 - 30, frameWidth + 60, frameHeight + 60);
        
        // 主背景 - 漸變效果
        const bgGradient = ctx.createLinearGradient(ctaX - frameWidth / 2, ctaY - frameHeight / 2, ctaX + frameWidth / 2, ctaY + frameHeight / 2);
        bgGradient.addColorStop(0, 'rgba(0, 0, 0, 0.4)');
        bgGradient.addColorStop(0.5, 'rgba(20, 20, 20, 0.5)');
        bgGradient.addColorStop(1, 'rgba(0, 0, 0, 0.4)');
        ctx.fillStyle = bgGradient;
        
        // 邊框漸變
        const borderGradient = ctx.createLinearGradient(ctaX - frameWidth / 2, ctaY - frameHeight / 2, ctaX + frameWidth / 2, ctaY + frameHeight / 2);
        borderGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        borderGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.6)');
        borderGradient.addColorStop(1, 'rgba(255, 255, 255, 0.8)');
        ctx.strokeStyle = borderGradient;
        ctx.lineWidth = 3;
        
        // 繪製圓角矩形
        ctx.beginPath();
        ctx.roundRect(ctaX - frameWidth / 2, ctaY - frameHeight / 2, frameWidth, frameHeight, cornerRadius);
        ctx.fill();
        ctx.stroke();
        
        
        // 全部元素一起閃動
        if (flashPhase > 0) {
            const scale = 1 + Math.sin(flashPhase * Math.PI * 4) * 0.2; // 統一閃動效果
            
            // 左側訂閱按鈕
            const subscribeX = ctaX - 160;
            const subscribeY = ctaY;
            
            ctx.save();
            ctx.translate(subscribeX, subscribeY);
            ctx.scale(scale, scale);
            
            // 按鈕陰影
            ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetX = 2;
            ctx.shadowOffsetY = 2;
            
            // YouTube 紅色背景
            ctx.fillStyle = '#FF0000';
            ctx.beginPath();
            ctx.arc(0, 0, 45, 0, Math.PI * 2);
            ctx.fill();
            
            // 白色播放按鈕
            ctx.shadowColor = 'transparent';
            ctx.fillStyle = '#FFFFFF';
            ctx.beginPath();
            ctx.moveTo(-14, -20);
            ctx.lineTo(-14, 20);
            ctx.lineTo(20, 0);
            ctx.closePath();
            ctx.fill();
            
            ctx.restore();
            
            // 中央文字
            ctx.save();
            ctx.translate(ctaX, ctaY);
            ctx.scale(scale, scale);
            ctx.translate(-ctaX, -ctaY);
            
            // 文字陰影效果
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 3;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;
            
            // 訂閱文字（中文）- 使用動態字體
            ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
            const actualFontName = FONT_MAP[fontFamily || FontType.POPPINS] || 'Poppins';
            ctx.font = `bold 36px "${actualFontName}", "Noto Sans TC", sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('訂閱', ctaX, ctaY - 35);
            
            // 訂閱文字（英文）- 使用動態字體
            ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
            ctx.font = `bold 28px "${actualFontName}", "Noto Sans TC", sans-serif`;
            ctx.fillText('SUBSCRIBE', ctaX, ctaY + 5);
            
            // 頻道名稱，使用動態字體
            ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
            ctx.font = `bold 22px "${actualFontName}", "Noto Sans TC", sans-serif`;
            ctx.fillText(channelName, ctaX, ctaY + 50);
            
            ctx.restore();
            
            // 右側鈴鐺 - 使用🔔字元，修正垂直對齊
            const bellX = ctaX + 160;
            const bellY = ctaY; // 與中央文字對齊
            
            ctx.save();
            ctx.translate(bellX, bellY);
            ctx.scale(scale, scale);
            ctx.translate(-bellX, -bellY);
            
            // 文字陰影效果
            ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
            ctx.shadowBlur = 3;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;
            
            // 鈴鐺字元，調整垂直位置使其與文字對齊
            ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
            ctx.font = 'bold 80px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('🔔', bellX, bellY + 10); // 向下調整鈴鐺位置
            
            ctx.restore();
            
            // 移除貓掌動畫
        }
        
        // 清除陰影
        ctx.shadowColor = 'transparent';
        
        // 背景光暈效果
        const glowRadius = 150 + Math.sin(currentTime * 0.002) * 50;
        const glowGradient = ctx.createRadialGradient(ctaX, ctaY, 0, ctaX, ctaY, glowRadius);
        glowGradient.addColorStop(0, 'rgba(255, 0, 0, 0.15)');
        glowGradient.addColorStop(0.5, 'rgba(255, 0, 0, 0.08)');
        glowGradient.addColorStop(1, 'rgba(255, 0, 0, 0)');
        ctx.fillStyle = glowGradient;
        ctx.fillRect(ctaX - glowRadius, ctaY - glowRadius, glowRadius * 2, glowRadius * 2);
        
        ctx.restore();
    };

    return <canvas ref={ref} className="w-full h-full" style={{ backgroundColor: '#000000', border: '2px solid #4ecdc4', borderRadius: '8px' }} />;
});

AudioVisualizer.displayName = 'AudioVisualizer';

// 計算轉場進度的函數
const calculateTransitionProgress = (transitionType: TransitionType): number => {
    // 獲取轉場開始時間（使用 performance.now() 獲取高精度時間戳）
    const transitionStartTime = (window as any).transitionStartTime || performance.now();
    const currentTime = performance.now();
    const elapsed = currentTime - transitionStartTime;
    
    // 根據轉場類型設定不同的持續時間
    const getTransitionDuration = (type: TransitionType): number => {
        switch (type) {
            case TransitionType.TV_STATIC:
                return 800; // 0.8秒，確保震盪效果完整
            case TransitionType.FADE:
                return 800; // 0.8秒
            case TransitionType.SLIDE_LEFT:
            case TransitionType.SLIDE_RIGHT:
            case TransitionType.SLIDE_UP:
            case TransitionType.SLIDE_DOWN:
                return 600; // 0.6秒
            case TransitionType.ZOOM_IN:
            case TransitionType.ZOOM_OUT:
                return 700; // 0.7秒
            case TransitionType.SPIRAL:
                return 1200; // 1.2秒
            case TransitionType.WAVE:
                return 900; // 0.9秒
            case TransitionType.DIAMOND:
            case TransitionType.CIRCLE:
                return 650; // 0.65秒
            case TransitionType.BLINDS:
                return 800; // 0.8秒
            case TransitionType.CHECKERBOARD:
                return 750; // 0.75秒
            case TransitionType.RANDOM_PIXELS:
                return 1000; // 1秒
            default:
                return 1000; // 預設1秒
        }
    };
    
    const duration = getTransitionDuration(transitionType);
    const progress = Math.min(elapsed / duration, 1);
    
    // 使用緩動函數讓動畫更平滑
    return applyEasing(progress, transitionType);
};

// 緩動函數，讓動畫更平滑
const applyEasing = (progress: number, transitionType: TransitionType): number => {
    switch (transitionType) {
        case TransitionType.FADE:
            // 淡入淡出使用正弦緩動
            return Math.sin(progress * Math.PI);
        case TransitionType.SLIDE_LEFT:
        case TransitionType.SLIDE_RIGHT:
        case TransitionType.SLIDE_UP:
        case TransitionType.SLIDE_DOWN:
            // 滑動使用 ease-out
            return 1 - Math.pow(1 - progress, 3);
        case TransitionType.ZOOM_IN:
        case TransitionType.ZOOM_OUT:
            // 縮放使用 ease-in-out
            return progress < 0.5 
                ? 2 * progress * progress 
                : 1 - Math.pow(-2 * progress + 2, 2) / 2;
        case TransitionType.SPIRAL:
            // 螺旋使用線性，但加上正弦波動
            return progress + Math.sin(progress * Math.PI * 4) * 0.1;
        case TransitionType.WAVE:
            // 波浪使用正弦緩動
            return Math.sin(progress * Math.PI);
        case TransitionType.DIAMOND:
        case TransitionType.CIRCLE:
            // 幾何形狀使用 ease-out
            return 1 - Math.pow(1 - progress, 2);
        case TransitionType.BLINDS:
        case TransitionType.CHECKERBOARD:
        case TransitionType.RANDOM_PIXELS:
            // 隨機效果使用線性
            return progress;
        case TransitionType.TV_STATIC:
            // 電視雜訊使用快速震盪，確保在短時間內也有明顯效果
            return Math.sin(progress * Math.PI * 6) * 0.5 + 0.5;
        default:
            return progress;
    }
};

// 轉場效果函數
const drawTransitionEffect = (
    ctx: CanvasRenderingContext2D, 
    width: number, 
    height: number, 
    transitionType: TransitionType, 
    progress: number
) => {
    ctx.save();
    
    switch (transitionType) {
        case TransitionType.TV_STATIC:
            drawTVStatic(ctx, width, height, progress);
            break;
        case TransitionType.FADE:
            drawFade(ctx, width, height, progress);
            break;
        case TransitionType.SLIDE_LEFT:
            drawSlideLeft(ctx, width, height, progress);
            break;
        case TransitionType.SLIDE_RIGHT:
            drawSlideRight(ctx, width, height, progress);
            break;
        case TransitionType.SLIDE_UP:
            drawSlideUp(ctx, width, height, progress);
            break;
        case TransitionType.SLIDE_DOWN:
            drawSlideDown(ctx, width, height, progress);
            break;
        case TransitionType.ZOOM_IN:
            drawZoomIn(ctx, width, height, progress);
            break;
        case TransitionType.ZOOM_OUT:
            drawZoomOut(ctx, width, height, progress);
            break;
        case TransitionType.SPIRAL:
            drawSpiral(ctx, width, height, progress);
            break;
        case TransitionType.WAVE:
            drawWave(ctx, width, height, progress);
            break;
        case TransitionType.DIAMOND:
            drawDiamond(ctx, width, height, progress);
            break;
        case TransitionType.CIRCLE:
            drawCircle(ctx, width, height, progress);
            break;
        case TransitionType.BLINDS:
            drawBlinds(ctx, width, height, progress);
            break;
        case TransitionType.CHECKERBOARD:
            drawCheckerboard(ctx, width, height, progress);
            break;
        case TransitionType.RANDOM_PIXELS:
            drawRandomPixels(ctx, width, height, progress);
            break;
    }
    
    ctx.restore();
};

// 電視雜訊效果
const drawTVStatic = (ctx: CanvasRenderingContext2D, width: number, height: number, progress: number) => {
    ctx.save();
    
    // 使用更強烈的震盪效果
    const intensity = Math.sin(progress * Math.PI * 4) * 0.5 + 0.5; // 0-1 的震盪
    const alpha = Math.sin(progress * Math.PI) * 0.8 + 0.2; // 0.2-1.0 的透明度變化
    
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = alpha;
    
    // 創建雜訊效果
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
        // 使用更強烈的雜訊對比
        const noise = Math.random() * 255;
        const contrast = intensity > 0.5 ? noise : 255 - noise; // 高對比切換
        
        data[i] = contrast;     // R
        data[i + 1] = contrast; // G
        data[i + 2] = contrast; // B
        data[i + 3] = 255;      // A
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    // 添加額外的震盪線條效果
    if (intensity > 0.3) {
        ctx.globalAlpha = intensity * 0.3;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        
        // 繪製水平震盪線
        for (let y = 0; y < height; y += 20) {
            if (Math.random() < intensity) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(width, y);
                ctx.stroke();
            }
        }
        
        // 繪製垂直震盪線
        for (let x = 0; x < width; x += 30) {
            if (Math.random() < intensity * 0.5) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, height);
                ctx.stroke();
            }
        }
    }
    
    ctx.restore();
};

// 淡入淡出效果
const drawFade = (ctx: CanvasRenderingContext2D, width: number, height: number, progress: number) => {
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = progress;
    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    ctx.fillRect(0, 0, width, height);
};

// 向左滑動效果
const drawSlideLeft = (ctx: CanvasRenderingContext2D, width: number, height: number, progress: number) => {
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    const slideWidth = width * progress;
    ctx.fillRect(0, 0, slideWidth, height);
};

// 向右滑動效果
const drawSlideRight = (ctx: CanvasRenderingContext2D, width: number, height: number, progress: number) => {
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    const slideWidth = width * progress;
    ctx.fillRect(width - slideWidth, 0, slideWidth, height);
};

// 向上滑動效果
const drawSlideUp = (ctx: CanvasRenderingContext2D, width: number, height: number, progress: number) => {
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    const slideHeight = height * progress;
    ctx.fillRect(0, 0, width, slideHeight);
};

// 向下滑動效果
const drawSlideDown = (ctx: CanvasRenderingContext2D, width: number, height: number, progress: number) => {
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    const slideHeight = height * progress;
    ctx.fillRect(0, height - slideHeight, width, slideHeight);
};

// 放大效果
const drawZoomIn = (ctx: CanvasRenderingContext2D, width: number, height: number, progress: number) => {
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY);
    const radius = maxRadius * progress;
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
};

// 縮小效果
const drawZoomOut = (ctx: CanvasRenderingContext2D, width: number, height: number, progress: number) => {
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY);
    const radius = maxRadius * (1 - progress);
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
};

// 螺旋效果
const drawSpiral = (ctx: CanvasRenderingContext2D, width: number, height: number, progress: number) => {
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY);
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    
    const maxAngle = progress * Math.PI * 8;
    for (let angle = 0; angle < maxAngle; angle += 0.1) {
        const radius = (angle / (Math.PI * 8)) * maxRadius * progress;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        ctx.lineTo(x, y);
    }
    
    ctx.lineWidth = 20;
    ctx.stroke();
};

// 波浪效果
const drawWave = (ctx: CanvasRenderingContext2D, width: number, height: number, progress: number) => {
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    
    ctx.beginPath();
    ctx.moveTo(0, height);
    
    for (let x = 0; x <= width; x += 5) {
        const waveHeight = height * (1 - progress);
        const waveOffset = Math.sin((x / width) * Math.PI * 4 + progress * Math.PI * 2) * 50 * progress;
        const y = waveHeight + waveOffset;
        ctx.lineTo(x, y);
    }
    
    ctx.lineTo(width, height);
    ctx.closePath();
    ctx.fill();
};

// 菱形效果
const drawDiamond = (ctx: CanvasRenderingContext2D, width: number, height: number, progress: number) => {
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    
    const centerX = width / 2;
    const centerY = height / 2;
    const size = Math.min(width, height) * progress;
    
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - size);
    ctx.lineTo(centerX + size, centerY);
    ctx.lineTo(centerX, centerY + size);
    ctx.lineTo(centerX - size, centerY);
    ctx.closePath();
    ctx.fill();
};

// 圓形效果
const drawCircle = (ctx: CanvasRenderingContext2D, width: number, height: number, progress: number) => {
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) / 2 * progress;
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
};

// 百葉窗效果
const drawBlinds = (ctx: CanvasRenderingContext2D, width: number, height: number, progress: number) => {
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    
    const blindCount = 20;
    const blindHeight = height / blindCount;
    
    for (let i = 0; i < blindCount; i++) {
        const blindProgress = Math.max(0, progress - (i / blindCount) * 0.5);
        if (blindProgress > 0) {
            ctx.fillRect(0, i * blindHeight, width, blindHeight * blindProgress);
        }
    }
};

// 棋盤格效果
const drawCheckerboard = (ctx: CanvasRenderingContext2D, width: number, height: number, progress: number) => {
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    
    const tileSize = 50;
    const tilesX = Math.ceil(width / tileSize);
    const tilesY = Math.ceil(height / tileSize);
    
    for (let x = 0; x < tilesX; x++) {
        for (let y = 0; y < tilesY; y++) {
            const tileProgress = Math.max(0, progress - ((x + y) / (tilesX + tilesY)) * 0.8);
            if ((x + y) % 2 === 0 && tileProgress > 0) {
                ctx.globalAlpha = tileProgress;
                ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
            }
        }
    }
    ctx.globalAlpha = 1;
};

// 隨機像素效果
const drawRandomPixels = (ctx: CanvasRenderingContext2D, width: number, height: number, progress: number) => {
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = 'rgba(0, 0, 0, 1)';
    
    const pixelCount = Math.floor(width * height * progress * 0.1);
    
    for (let i = 0; i < pixelCount; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        ctx.fillRect(x, y, 2, 2);
    }
};
// Z總訂製款 - 黑膠唱片旋轉效果
const drawZCustomVisualization = (ctx: CanvasRenderingContext2D, width: number, height: number, centerImage: string | null, propsRef: React.MutableRefObject<AudioVisualizerProps>, frame: number | null) => {
    // 獲取 Z總訂製款的控制參數
    const zCustomScale = (propsRef.current as any).zCustomScale || 1.0;
    const zCustomPosition = (propsRef.current as any).zCustomPosition || { x: 0, y: 0 };
    const colors = propsRef.current.colors;
    
    // 計算中心位置（包含位置偏移）
    const centerX = width / 2 + (zCustomPosition.x / 100) * width;
    const centerY = height / 2 + (zCustomPosition.y / 100) * height;
    const recordSize = Math.min(width, height) * 0.6 * zCustomScale;
    const recordRadius = recordSize / 2;
    
    // 獲取音頻數據
    const analyser = propsRef.current.analyser;
    let audioData: Uint8Array | null = null;
    if (analyser) {
        audioData = new Uint8Array(analyser.frequencyBinCount);
        analyser.getByteFrequencyData(audioData as any);
    }
    
    // 計算音頻強度
    const bassIntensity = audioData ? audioData.slice(0, 10).reduce((a, b) => a + b, 0) / 10 / 255 : 0;
    const midIntensity = audioData ? audioData.slice(10, 50).reduce((a, b) => a + b, 0) / 40 / 255 : 0;
    const highIntensity = audioData ? audioData.slice(50, 100).reduce((a, b) => a + b, 0) / 50 / 255 : 0;
    
    // 計算旋轉角度（與可夜訂製款相同的速度）
    const frameValue = frame ?? 0;
    const rotationAngle = (frameValue * 0.01) % (Math.PI * 2);
    
    // 調試：檢查 frame 值
    console.log('Z總訂製款 frame:', frame, 'frameValue:', frameValue, 'rotationAngle:', rotationAngle);
    
    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rotationAngle);
    
    // 繪製黑膠唱片外圈
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(0, 0, recordRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // 繪製唱片紋路（同心圓）
    ctx.strokeStyle = '#333333';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 8; i++) {
        const radius = (recordRadius * 0.2) + (recordRadius * 0.8 * i / 8);
        ctx.beginPath();
        ctx.arc(0, 0, radius, 0, Math.PI * 2);
        ctx.stroke();
    }
    
    // 繪製中央黃色標籤
    const labelRadius = recordRadius * 0.25;
    ctx.fillStyle = '#FFD700'; // 金黃色
    ctx.beginPath();
    ctx.arc(0, 0, labelRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // 如果有上傳的圖片，裁切成圓形並繪製在中央標籤上
    if (centerImage) {
        const image = new Image();
        image.src = centerImage;
        
        if (image.complete && image.naturalWidth > 0) {
            // 創建圓形裁切路徑
            ctx.save();
            ctx.beginPath();
            ctx.arc(0, 0, labelRadius, 0, Math.PI * 2);
            ctx.clip();
            
            // 繪製圖片（填滿整個圓形區域）
            ctx.drawImage(image, -labelRadius, -labelRadius, labelRadius * 2, labelRadius * 2);
            ctx.restore();
        }
    }
    
    // 中央孔洞已移除
    
    ctx.restore();
    
    // 繪製螺旋包覆效果
    ctx.save();
    ctx.translate(centerX, centerY);
    
    // 螺旋參數
    const spiralRadius = recordRadius + 15; // 螺旋起始半徑
    const spiralTurns = 3; // 螺旋圈數
    const spiralPoints = 200; // 螺旋點數
    const spiralThickness = 4; // 螺旋線寬
    
    // 繪製第一圈螺旋（內層）
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    for (let i = 0; i < spiralPoints; i++) {
        const t = i / spiralPoints;
        const angle = t * Math.PI * 2 + frameValue * 0.03; // 第一圈
        const radius = spiralRadius + t * 15;
        
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();
    
    // 繪製第二圈柱狀聲波圖
    const barCount = 60; // 柱狀圖數量
    const barWidth = 3; // 柱狀圖寬度
    const baseRadius = spiralRadius + 20; // 第二圈基礎半徑
    
    for (let i = 0; i < barCount; i++) {
        const angle = (i / barCount) * Math.PI * 2 + frameValue * 0.02;
        const barHeight = audioData ? (audioData[i % audioData.length] / 255) * 30 : 0;
        
        // 柱狀圖位置
        const x = Math.cos(angle) * baseRadius;
        const y = Math.sin(angle) * baseRadius;
        
        // 繪製柱狀圖（使用顏色主題）
        ctx.fillStyle = colors.accent;
        ctx.fillRect(x - barWidth/2, y - barHeight/2, barWidth, barHeight);
    }
    
    // 繪製第三圈螺旋（外層，隨柱狀圖震動撐開）
    ctx.strokeStyle = colors.secondary;
    ctx.lineWidth = spiralThickness;
    ctx.beginPath();
    
    for (let i = 0; i < spiralPoints; i++) {
        const t = i / spiralPoints;
        const angle = t * Math.PI * 2 + frameValue * 0.02; // 第三圈
        const baseRadius = spiralRadius + 40;
        
        // 根據柱狀圖高度計算撐開效果
        const barIndex = Math.floor((angle / (Math.PI * 2)) * barCount);
        const barHeight = audioData ? (audioData[barIndex % audioData.length] / 255) * 30 : 0;
        const expansion = barHeight * 0.5; // 撐開係數
        
        const radius = baseRadius + t * 20 + expansion;
        
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.stroke();
    
    ctx.restore();
};

// 濾鏡特效粒子系統
interface FilterParticle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    opacity: number;
    rotation: number;
    rotationSpeed: number;
    color: string;
    life: number;
    maxLife: number;
}
const createFilterParticle = (type: FilterEffectType, width: number, height: number): FilterParticle => {
    const baseSpeed = 1.0;
    // 根據畫布解析度調整粒子大小
    const resolutionScale = Math.max(width / 1920, height / 1080) * 2;
    const baseSize = 8 * resolutionScale;

    switch (type) {
        case FilterEffectType.SNOW:
            return {
                x: Math.random() * width,
                y: -10 - Math.random() * 50, // 從不同高度開始
                vx: (Math.random() - 0.5) * 0.8, // 增加水平擺動
                vy: baseSpeed * 0.5 + Math.random() * baseSpeed * 0.8, // 增加速度變化
                size: baseSize * (0.6 + Math.random() * 0.8), // 增加大小變化
                opacity: 0.3 + Math.random() * 0.5,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.02,
                color: '#ffffff',
                life: 1,
                maxLife: 1
            };

        case FilterEffectType.PARTICLES:
            return {
                x: Math.random() * width,
                y: height + 10 + Math.random() * 30, // 從不同高度開始
                vx: (Math.random() - 0.5) * 1.2, // 增加水平擺動
                vy: -(baseSpeed * 0.3 + Math.random() * baseSpeed * 0.9), // 增加速度變化
                size: baseSize * (0.4 + Math.random() * 1.2), // 增加大小變化
                opacity: 0.4 + Math.random() * 0.6,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.03,
                color: `hsl(${Math.random() * 80 + 160}, 80%, ${50 + Math.random() * 30}%)`,
                life: 1,
                maxLife: 1
            };

        case FilterEffectType.STARS:
            return {
                x: Math.random() * width,
                y: Math.random() * height,
                vx: 0,
                vy: 0,
                size: (3 + Math.random() * 6) * resolutionScale, // 大幅增加星星大小
                opacity: 0.4 + Math.random() * 0.6,
                rotation: 0,
                rotationSpeed: 0,
                color: '#ffffff',
                life: Math.random() * 3 + 1,
                maxLife: Math.random() * 3 + 1
            };

        case FilterEffectType.RAIN:
            return {
                x: Math.random() * width,
                y: -10,
                vx: 0,
                vy: baseSpeed * 2 + Math.random() * baseSpeed,
                size: 1 + Math.random() * 2,
                opacity: 0.3 + Math.random() * 0.4,
                rotation: 0,
                rotationSpeed: 0,
                color: '#87CEEB',
                life: 1,
                maxLife: 1
            };

        case FilterEffectType.CHERRY_BLOSSOM:
            return {
                x: Math.random() * width,
                y: -10,
                vx: (Math.random() - 0.5) * 0.5,
                vy: baseSpeed * 0.5 + Math.random() * baseSpeed * 0.3,
                size: baseSize * 0.6 + Math.random() * baseSize * 0.4,
                opacity: 0.5 + Math.random() * 0.3,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.02,
                color: '#FFB6C1',
                life: 1,
                maxLife: 1
            };


        default:
            return {
                x: 0, y: 0, vx: 0, vy: 0, size: 1, opacity: 1,
                rotation: 0, rotationSpeed: 0, color: '#ffffff', life: 1, maxLife: 1
            };
    }
};

const drawFilterParticle = (ctx: CanvasRenderingContext2D, particle: FilterParticle, type: FilterEffectType) => {
    ctx.save();
    ctx.translate(particle.x, particle.y);
    ctx.rotate(particle.rotation);
    ctx.globalAlpha = particle.opacity;

    switch (type) {
        case FilterEffectType.SNOW:
            // 繪製精緻雪花
            const size = particle.size;
            const glowSize = size * 2;
            
            // 外層光暈
            ctx.save();
            ctx.globalAlpha = particle.opacity * 0.3;
            const glowGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, glowSize);
            glowGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
            glowGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.3)');
            glowGradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = glowGradient;
            ctx.beginPath();
            ctx.arc(0, 0, glowSize, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            
            // 雪花主體 - 六角星形
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = Math.max(1, size * 0.1);
            ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
            ctx.shadowBlur = size * 0.3;
            
            // 主軸線
            for (let i = 0; i < 6; i++) {
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(0, size);
                ctx.stroke();
                
                // 側枝
                ctx.beginPath();
                ctx.moveTo(size * 0.3, 0);
                ctx.lineTo(size * 0.6, 0);
                ctx.stroke();
                
                ctx.rotate(Math.PI / 3);
            }
            
            // 中心圓點
            ctx.beginPath();
            ctx.arc(0, 0, size * 0.15, 0, Math.PI * 2);
            ctx.fill();
            
            // 重置陰影
            ctx.shadowBlur = 0;
            break;

        case FilterEffectType.PARTICLES:
            // 繪製精緻發光粒子
            const particleSize = particle.size;
            
            // 外層大光暈
            ctx.save();
            ctx.globalAlpha = particle.opacity * 0.2;
            const outerGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, particleSize * 3);
            outerGlow.addColorStop(0, particle.color);
            outerGlow.addColorStop(0.3, particle.color.replace(')', ', 0.3)').replace('hsl', 'hsla'));
            outerGlow.addColorStop(1, particle.color.replace(')', ', 0)').replace('hsl', 'hsla'));
            ctx.fillStyle = outerGlow;
            ctx.beginPath();
            ctx.arc(0, 0, particleSize * 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            
            // 中層光暈
            ctx.save();
            ctx.globalAlpha = particle.opacity * 0.6;
            const middleGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, particleSize * 1.5);
            middleGlow.addColorStop(0, particle.color);
            middleGlow.addColorStop(0.5, particle.color.replace(')', ', 0.7)').replace('hsl', 'hsla'));
            middleGlow.addColorStop(1, particle.color.replace(')', ', 0)').replace('hsl', 'hsla'));
            ctx.fillStyle = middleGlow;
            ctx.beginPath();
            ctx.arc(0, 0, particleSize * 1.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            
            // 核心發光
            ctx.globalAlpha = particle.opacity;
            const coreGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, particleSize);
            coreGradient.addColorStop(0, '#ffffff');
            coreGradient.addColorStop(0.3, particle.color);
            coreGradient.addColorStop(0.8, particle.color.replace(')', ', 0.8)').replace('hsl', 'hsla'));
            coreGradient.addColorStop(1, particle.color.replace(')', ', 0)').replace('hsl', 'hsla'));
            ctx.fillStyle = coreGradient;
            ctx.beginPath();
            ctx.arc(0, 0, particleSize, 0, Math.PI * 2);
            ctx.fill();
            
            // 拖尾效果（如果粒子有速度）
            if (Math.abs(particle.vx) > 0.1 || Math.abs(particle.vy) > 0.1) {
                ctx.save();
                ctx.globalAlpha = particle.opacity * 0.4;
                const trailGradient = ctx.createLinearGradient(-particle.vx * 5, -particle.vy * 5, 0, 0);
                trailGradient.addColorStop(0, particle.color.replace(')', ', 0)').replace('hsl', 'hsla'));
                trailGradient.addColorStop(1, particle.color);
                ctx.fillStyle = trailGradient;
                ctx.beginPath();
                ctx.ellipse(-particle.vx * 3, -particle.vy * 3, particleSize * 0.8, particleSize * 0.3, Math.atan2(particle.vy, particle.vx), 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
            break;

        case FilterEffectType.STARS:
            // 繪製精緻閃爍星星
            const starSize = particle.size;
            const twinkleIntensity = Math.sin(Date.now() * 0.005 + particle.x * 0.01 + particle.y * 0.01) * 0.5 + 0.5;
            const currentAlpha = particle.opacity * (0.3 + twinkleIntensity * 0.7);
            
            // 外層大光暈
            ctx.save();
            ctx.globalAlpha = currentAlpha * 0.15;
            const starGlow = ctx.createRadialGradient(0, 0, 0, 0, 0, starSize * 4);
            starGlow.addColorStop(0, '#ffffff');
            starGlow.addColorStop(0.3, '#ffffff');
            starGlow.addColorStop(0.7, '#ffffff');
            starGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = starGlow;
            ctx.beginPath();
            ctx.arc(0, 0, starSize * 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            
            // 十字光線
            ctx.save();
            ctx.globalAlpha = currentAlpha * 0.6;
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = Math.max(1, starSize * 0.15);
            ctx.shadowColor = '#ffffff';
            ctx.shadowBlur = starSize * 0.5;
            
            // 水平線
            ctx.beginPath();
            ctx.moveTo(-starSize * 2, 0);
            ctx.lineTo(starSize * 2, 0);
            ctx.stroke();
            
            // 垂直線
            ctx.beginPath();
            ctx.moveTo(0, -starSize * 2);
            ctx.lineTo(0, starSize * 2);
            ctx.stroke();
            
            ctx.restore();
            
            // 星星主體
            ctx.globalAlpha = currentAlpha;
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
            ctx.shadowBlur = starSize * 0.8;
            
            ctx.beginPath();
            // 五角星形狀
            for (let i = 0; i < 5; i++) {
                const angle = (i * 4 * Math.PI) / 5;
                const x = Math.cos(angle) * starSize;
                const y = Math.sin(angle) * starSize;
                
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
                
                // 內角點
                const innerAngle = ((i * 4 + 2) * Math.PI) / 5;
                const innerX = Math.cos(innerAngle) * starSize * 0.4;
                const innerY = Math.sin(innerAngle) * starSize * 0.4;
                ctx.lineTo(innerX, innerY);
            }
            ctx.closePath();
            ctx.fill();
            
            // 中心亮點
            ctx.beginPath();
            ctx.arc(0, 0, starSize * 0.3, 0, Math.PI * 2);
            ctx.fill();
            
            // 重置陰影
            ctx.shadowBlur = 0;
            break;

        case FilterEffectType.RAIN:
            // 繪製精緻雨滴
            const rainLength = particle.size * 4;
            
            // 速度線效果
            ctx.save();
            ctx.globalAlpha = particle.opacity * 0.3;
            ctx.strokeStyle = particle.color;
            ctx.lineWidth = 2;
            ctx.shadowColor = particle.color;
            ctx.shadowBlur = particle.size * 2;
            ctx.beginPath();
            ctx.moveTo(-particle.vx * 8, -particle.vy * 8);
            ctx.lineTo(0, 0);
            ctx.stroke();
            ctx.restore();
            
            // 雨滴主體
            ctx.strokeStyle = particle.color;
            ctx.lineWidth = Math.max(1, particle.size * 0.3);
            ctx.shadowColor = 'rgba(255, 255, 255, 0.6)';
            ctx.shadowBlur = particle.size * 1.5;
            
            // 雨滴形狀（上細下粗）
            const gradient = ctx.createLinearGradient(0, 0, 0, rainLength);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
            gradient.addColorStop(0.3, particle.color);
            gradient.addColorStop(1, particle.color.replace(')', ', 0.8)').replace('hsl', 'hsla'));
            
            ctx.strokeStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(0, rainLength);
            ctx.stroke();
            
            // 雨滴尖端
            ctx.beginPath();
            ctx.arc(0, rainLength, particle.size * 0.5, 0, Math.PI * 2);
            ctx.fill();
            
            // 重置陰影
            ctx.shadowBlur = 0;
            break;

        case FilterEffectType.CHERRY_BLOSSOM:
            // 繪製精緻櫻花瓣
            const petalSize = particle.size;
            
            // 花瓣陰影
            ctx.save();
            ctx.globalAlpha = particle.opacity * 0.3;
            ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
            ctx.beginPath();
            ctx.ellipse(petalSize * 0.1, petalSize * 0.1, petalSize, petalSize * 0.6, particle.rotation, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            
            // 花瓣主體
            ctx.globalAlpha = particle.opacity;
            const petalGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, petalSize);
            petalGradient.addColorStop(0, '#ffb3d9'); // 淺粉色中心
            petalGradient.addColorStop(0.7, particle.color);
            petalGradient.addColorStop(1, particle.color.replace(')', ', 0.7)').replace('hsl', 'hsla'));
            
            ctx.fillStyle = petalGradient;
            ctx.beginPath();
            
            // 櫻花瓣形狀（心形輪廓）
            const heartShape = (t: number) => {
                const x = 16 * Math.pow(Math.sin(t), 3);
                const y = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
                return { x: x * petalSize * 0.1, y: y * petalSize * 0.1 };
            };
            
            // 繪製心形花瓣
            ctx.beginPath();
            for (let t = 0; t <= Math.PI * 2; t += 0.1) {
                const { x, y } = heartShape(t);
                if (t === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            }
            ctx.closePath();
            ctx.fill();
            
            // 花瓣紋理
            ctx.save();
            ctx.globalAlpha = particle.opacity * 0.6;
            ctx.strokeStyle = '#ff8cc8';
            ctx.lineWidth = Math.max(1, petalSize * 0.08);
            ctx.beginPath();
            // 從中心向外輻射的線條
            for (let i = 0; i < 5; i++) {
                const angle = (i * Math.PI * 2) / 5;
                const endX = Math.cos(angle) * petalSize * 0.7;
                const endY = Math.sin(angle) * petalSize * 0.7;
                ctx.moveTo(0, 0);
                ctx.lineTo(endX, endY);
            }
            ctx.stroke();
            ctx.restore();
            
            // 花瓣高光
            ctx.save();
            ctx.globalAlpha = particle.opacity * 0.8;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.beginPath();
            ctx.ellipse(-petalSize * 0.2, -petalSize * 0.2, petalSize * 0.3, petalSize * 0.2, particle.rotation, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
            break;

    }

    ctx.restore();
};

const drawFilterEffects = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    type: FilterEffectType,
    intensity: number,
    opacity: number,
    speed: number,
    particles: FilterParticle[],
    frame: number
) => {
    ctx.save();
    ctx.globalAlpha = opacity;

    // 特殊效果 - 直接繪製，不使用粒子系統
    if (type === FilterEffectType.LIGHTNING) {
        // 閃電效果 - 跟數位風暴一模一樣
        ctx.globalCompositeOperation = 'screen';
        
        // 在節拍時觸發閃電
        if (Math.random() > 0.6) {
            const numBolts = Math.floor(Math.random() * 3) + 1;
            for (let i = 0; i < numBolts; i++) {
                const startX = Math.random() * width;
                const startY = 0;
                const endX = startX + (Math.random() - 0.5) * 200;
                const endY = height;
                
                ctx.strokeStyle = '#FFFFFF';
                ctx.lineWidth = 3;
                ctx.shadowColor = '#00FFFF';
                ctx.shadowBlur = 20;
                
                // Create zigzag lightning
                ctx.beginPath();
                ctx.moveTo(startX, startY);
                
                let currentX = startX;
                let currentY = startY;
                const segments = 8;
                
                for (let j = 1; j <= segments; j++) {
                    const progress = j / segments;
                    const targetX = startX + (endX - startX) * progress;
                    const targetY = startY + (endY - startY) * progress;
                    
                    const offset = (Math.random() - 0.5) * 40;
                    currentX = targetX + offset;
                    currentY = targetY;
                    
                    ctx.lineTo(currentX, currentY);
                }
                
                ctx.stroke();
            }
        }
    } else if (type === FilterEffectType.GLITCH1) {
        // GLITCH1 - 參考CRT GLITCH的參數，簡化效果
        ctx.globalCompositeOperation = 'lighter';
        
        // 掃描線效果 - 參考CRT GLITCH參數
        ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        for (let i = 0; i < height; i += 8) {
            ctx.fillRect(0, i, width, 1);
        }
        
        // 故障區塊 - 稍微增強一點
        if (Math.random() > 0.85) { // 15% chance，稍微增加觸發頻率
            const numBlocks = Math.floor(Math.random() * 2) + 1; // 1-2 blocks
            for (let i = 0; i < numBlocks; i++) {
                const sx = Math.random() * width * 0.8;
                const sy = Math.random() * height * 0.8;
                const sw = Math.random() * width * 0.18 + 8; // 稍微大一點的區塊
                const sh = Math.random() * height * 0.07 + 3; // 稍微大一點的區塊
                const dx = sx + (Math.random() - 0.5) * 25; // 稍微大一點的位移
                const dy = sy + (Math.random() - 0.5) * 12; // 稍微大一點的位移
                try {
                    ctx.drawImage(ctx.canvas, sx, sy, sw, sh, dx, dy, sw, sh);
                } catch(e) { /* ignore */ }
            }
        }
        
    } else if (type === FilterEffectType.GLITCH2) {
        // GLITCH2 - 參考GLITCH WAVE的參數，簡化效果
        ctx.globalCompositeOperation = 'lighter';
        
        // 掃描線效果 - 參考GLITCH WAVE參數
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        for (let i = 0; i < height; i += 12) {
            ctx.fillRect(0, i, width, 1);
        }
        
        // 橫線雜訊效果 - 更溫和的設定
        if (Math.random() > 0.85) { // 15% chance，更低的觸發頻率
            const numSlices = Math.floor(Math.random() * 2) + 1; // 1-2 slices，減少數量
            for (let i = 0; i < numSlices; i++) {
                const sy = Math.random() * height;
                const sh = (Math.random() * height) / 20 + 2; // 更細的橫線
                const sx = 0;
                const sw = width;
                const dx = (Math.random() - 0.5) * 15; // 更小的位移
                const dy = sy;
                try {
                    ctx.drawImage(ctx.canvas, sx, sy, sw, sh, dx, dy, sw, sh);
                } catch(e) { /* ignored, can happen on cross-origin canvas */ }
            }
        }
    } else {
        // 原有的粒子系統效果
        if (!particles || particles.length === 0) {
            ctx.restore();
            return;
        }

    ctx.globalCompositeOperation = 'screen';

    // 更新和繪製粒子
    particles.forEach((particle, index) => {
            // 增加隨機擺動，讓粒子軌跡更自然
            const windEffect = (Math.random() - 0.5) * 0.3;
            const turbulence = Math.sin(frame * 0.01 + index * 0.1) * 0.2;
            
        // 更新位置
            particle.x += (particle.vx + windEffect + turbulence) * speed;
        particle.y += particle.vy * speed;
        particle.rotation += particle.rotationSpeed * speed;

        // 檢查邊界和生命週期
        let shouldRemove = false;

        if (type === FilterEffectType.STARS) {
            // 星星閃爍效果
            particle.life -= 0.02 * speed;
            if (particle.life <= 0) {
                particle.x = Math.random() * width;
                particle.y = Math.random() * height;
                particle.life = particle.maxLife;
                particle.opacity = 0.3 + Math.random() * 0.7;
            }
        } else {
            // 其他粒子檢查邊界
            if (particle.y > height + 20 || 
                particle.x < -20 || 
                particle.x > width + 20) {
                shouldRemove = true;
            }
        }

        if (!shouldRemove) {
            // 繪製粒子
            drawFilterParticle(ctx, particle, type);
        }
    });
    }

    ctx.restore();
};


export default AudioVisualizer;