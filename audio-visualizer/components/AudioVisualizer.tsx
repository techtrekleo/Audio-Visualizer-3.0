import React, { useRef, useEffect, forwardRef, useCallback } from 'react';
import { VisualizationType, Palette, GraphicEffectType, ColorPaletteType, WatermarkPosition, FontType, Subtitle, SubtitleBgStyle, SubtitleDisplayMode, TransitionType } from '../types';
import ImageBasedVisualizer from './ImageBasedVisualizer';

// 字體映射表
const FONT_MAP: Record<FontType, string> = {
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
    subtitleBgStyle: SubtitleBgStyle;
    effectScale: number;
    effectOffsetX: number;
    effectOffsetY: number;
    // Lyrics Display props
    showLyricsDisplay: boolean;
    currentTime: number;
    lyricsFontSize: number;
    lyricsPositionX: number;
    lyricsPositionY: number;
    subtitleDisplayMode: SubtitleDisplayMode;
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
    // CTA 動畫狀態
    showCtaAnimation?: boolean;
    ctaChannelName?: string;
    ctaPosition?: { x: number; y: number };
    onCtaPositionUpdate?: (position: { x: number; y: number }) => void;
    // Z總訂製款狀態
    zCustomCenterImage?: string | null;
}

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
    }
    
    ctx.strokeStyle = colors.primary;
    ctx.lineWidth = 2.5;
    ctx.shadowColor = colors.primary;
    ctx.shadowBlur = 10;
    ctx.stroke(wavePath);

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
    
    if (waveformStroke) {
        ctx.save();
        ctx.shadowBlur = 0;
        ctx.shadowColor = 'transparent';
        drawWave('rgba(0,0,0,0.7)', 0, 0, 4.5);
        ctx.restore();
    }
    
    ctx.shadowColor = colors.primary;
    ctx.shadowBlur = 10;
    drawWave(colors.primary, 0, 0, 2.5);

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
const drawGeometricBars = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array | null, width: number, height: number, frame: number, sensitivity: number, colors: Palette, graphicEffect: GraphicEffectType, isBeat?: boolean, waveformStroke?: boolean, particles?: Particle[], geometricFrameImage?: HTMLImageElement | null, geometricSemicircleImage?: HTMLImageElement | null, props?: any) => {
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
    
    // 3. 左側聲波橫條 (從正方形左邊向左延伸)
    const numBars = 20;
    const barThickness = 8; // 條的厚度（加粗）
    const maxBarLength = frameSize * 0.8; // 最大條長度
    
    // 聲波條的起始位置（正方形左邊）
    const barStartX = frameX;
    const startY = frameY + frameSize; // 從正方形左下角開始
    const endY = frameY; // 到正方形左上角結束
    
    for (let i = 0; i < numBars; i++) {
        const dataIndex = Math.floor((i / numBars) * dataArray.length);
        const amplitude = dataArray[dataIndex] / 255;
        const barLength = Math.pow(amplitude, 1.5) * maxBarLength * sensitivity;
        
        if (barLength < 2) continue;
        
        // 計算條的垂直位置（沿著正方形左邊分布）
        const progress = i / (numBars - 1);
        const barY = startY - progress * frameSize; // 從下到上
        
        // 動態顏色
        const hue = (i / numBars) * 60 + 200; // 藍色到青色範圍
        const saturation = 80 + amplitude * 20;
        const lightness = 50 + amplitude * 30;
        const alpha = 0.7 + amplitude * 0.3;
        
        ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${alpha})`;
        
        // 繪製橫向條（向左延伸）
        const barX = barStartX - barLength; // 從方框左邊向左延伸
        
        // 繪製圓角矩形條
        const radius = Math.min(barThickness * 0.3, barLength * 0.1);
        createRoundedRectPath(ctx, barX, barY - barThickness / 2, barLength, barThickness, radius);
        ctx.fill();
        
        // 發光效果
        if (isBeat && amplitude > 0.7) {
            ctx.shadowColor = `hsl(${hue}, ${saturation}%, ${lightness}%)`;
            ctx.shadowBlur = 15;
            ctx.fill();
            ctx.shadowBlur = 0;
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
    
    // 5. 底部假播放器 (卡片風格 + 持續抖動 + 真實秒數)
    const playerWidth = frameSize; // 與中央方塊同寬
    const playerHeight = height * 0.15;
    const playerX = centerX - playerWidth / 2;
    const playerY = height * 0.7; // 上移播放器，減少下方留白
    
    // 持續的小抖動
    const baseShake = Math.sin(frame * 0.1) * 1.5;
    const shakeX = baseShake + Math.sin(frame * 0.07) * 0.8;
    const shakeY = Math.cos(frame * 0.13) * 1.2;
    
    // 卡片背景 (灰綠色)
    ctx.fillStyle = 'rgba(100, 120, 100, 0.9)';
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
    ctx.fill();
    
    // 專輯封面 (左上角)
    const albumSize = playerHeight * 0.6;
    const albumX = playerX + 20 + shakeX;
    const albumY = playerY + 20 + shakeY;
    
    // 專輯封面背景
    ctx.fillStyle = 'rgba(80, 100, 80, 0.8)';
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
    
    // 專輯封面裝飾 (抽象圖案)
    ctx.fillStyle = 'rgba(120, 140, 120, 0.6)';
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
    
    // 歌曲資訊 (右側)
    const infoX = albumX + albumSize + 20;
    const infoY = albumY + 10;
    
    // 歌曲名稱
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'left';
    const songName = props.geometricSongName || 'Name of the song';
    ctx.fillText(songName, infoX + Math.sin(frame * 0.02) * 0.5, infoY + Math.cos(frame * 0.03) * 0.3);
    
    // 歌手名稱
    ctx.font = '14px Arial';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    const artistName = props.geometricArtistName || 'Artist';
    ctx.fillText(artistName, infoX + Math.sin(frame * 0.025) * 0.3, infoY + 25 + Math.cos(frame * 0.035) * 0.2);
    
    // 右上角圖標
    const iconX = playerX + playerWidth - 60 + shakeX;
    const iconY = albumY + 10 + shakeY;
    
    // 耳機圖標
    ctx.fillStyle = '#ffffff';
    ctx.font = '18px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🎧', iconX + Math.sin(frame * 0.04) * 0.3, iconY + Math.cos(frame * 0.05) * 0.2);
    
    // 三點菜單
    ctx.fillText('⋯', iconX + 25 + Math.sin(frame * 0.06) * 0.2, iconY + Math.cos(frame * 0.04) * 0.2);
    
    // 進度條
    const progressBarWidth = playerWidth - 40;
    const progressBarHeight = 4;
    const progressBarX = playerX + 20 + shakeX;
    const progressBarY = playerY + playerHeight - 60 + shakeY;
    
    // 進度條背景
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(progressBarX, progressBarY, progressBarWidth, progressBarHeight);
    
    // 進度條 (真實秒數控制)
    const currentTime = props.audioRef?.current?.currentTime || 0;
    const totalSeconds = props.audioRef?.current?.duration || 240; // 使用實際音頻長度
    const progress = totalSeconds > 0 ? Math.min(currentTime / totalSeconds, 1) : 0;
    const currentProgressWidth = progressBarWidth * progress;
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(progressBarX, progressBarY, currentProgressWidth, progressBarHeight);
    
    // 時間顯示
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    const currentMinutes = Math.floor(currentTime / 60);
    const currentSecs = Math.floor(currentTime % 60);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const totalSecs = Math.floor(totalSeconds % 60);
    ctx.fillText(`${currentMinutes}:${currentSecs.toString().padStart(2, '0')}`, progressBarX + Math.sin(frame * 0.02) * 0.3, progressBarY - 8 + Math.cos(frame * 0.03) * 0.2);
    
    ctx.textAlign = 'right';
    ctx.fillText(`${totalMinutes}:${totalSecs.toString().padStart(2, '0')}`, progressBarX + progressBarWidth + Math.sin(frame * 0.025) * 0.3, progressBarY - 8 + Math.cos(frame * 0.035) * 0.2);
    
    // 控制按鈕區域
    const buttonY = playerY + playerHeight - 25 + shakeY;
    const buttonSpacing = 40;
    const startX = playerX + playerWidth / 2 - (buttonSpacing * 2) + shakeX;
    
    // 隨機播放按鈕
    const shuffleX = startX;
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🔀', shuffleX + Math.sin(frame * 0.03) * 0.3, buttonY + Math.cos(frame * 0.04) * 0.2);
    
    // 前一首按鈕
    const prevX = startX + buttonSpacing;
    ctx.fillText('⏮', prevX + Math.sin(frame * 0.035) * 0.2, buttonY + Math.cos(frame * 0.045) * 0.2);
    
    // 播放/暫停按鈕 (中央大按鈕)
    const playX = startX + buttonSpacing * 2;
    const playRadius = 20 + Math.sin(frame * 0.08) * 1;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(playX, buttonY, playRadius, 0, Math.PI * 2);
    ctx.fill();
    
    // 暫停圖標 (兩條豎線)
    ctx.fillStyle = 'rgba(100, 120, 100, 0.9)';
    ctx.fillRect(playX - 6, buttonY - 8, 3, 16);
    ctx.fillRect(playX + 3, buttonY - 8, 3, 16);
    
    // 下一首按鈕
    const nextX = startX + buttonSpacing * 3;
    ctx.fillStyle = '#ffffff';
    ctx.font = '16px Arial';
    ctx.fillText('⏭', nextX + Math.sin(frame * 0.04) * 0.2, buttonY + Math.cos(frame * 0.05) * 0.2);
    
    // 重複播放按鈕
    const repeatX = startX + buttonSpacing * 4;
    ctx.fillText('🔁', repeatX + Math.sin(frame * 0.045) * 0.3, buttonY + Math.cos(frame * 0.055) * 0.2);
    
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

const drawPianoVirtuoso = (ctx: CanvasRenderingContext2D, dataArray: Uint8Array | null, width: number, height: number, frame: number, sensitivity: number, colors: Palette, graphicEffect: GraphicEffectType, isBeat?: boolean, waveformStroke?: boolean, particles?: Particle[]) => {
    if (!dataArray) return;
    ctx.save();

    const keyboardHeight = height * 0.25; // Made keyboard slightly taller
    const keyboardY = height - keyboardHeight;

    // --- Keyboard Glow on Beat ---
    if (isBeat) {
        ctx.shadowColor = colors.accent;
        ctx.shadowBlur = 40; // Increased glow
    }

    // --- Data Mapping ---
    const numWhiteKeys = 28;
    const whiteKeyWidth = width / numWhiteKeys;
    const blackKeyWidth = whiteKeyWidth * 0.6;
    const blackKeyHeight = keyboardHeight * 0.6;
    const keyDataPoints = Math.floor(dataArray.length * 0.7 / numWhiteKeys);

    const whiteKeyPresses = new Array(numWhiteKeys).fill(0);

    // --- Draw White Keys ---
    for (let i = 0; i < numWhiteKeys; i++) {
        let pressAmount = 0;
        const dataStart = i * keyDataPoints;
        const dataEnd = dataStart + keyDataPoints;
        for (let j = dataStart; j < dataEnd; j++) {
            pressAmount += dataArray[j] || 0;
        }
        pressAmount /= (keyDataPoints * 255); // Normalize
        whiteKeyPresses[i] = pressAmount;

        const isPressed = (Math.pow(pressAmount, 2) * sensitivity) > 0.1;
        
        const keyX = i * whiteKeyWidth;
        const keyYOffset = isPressed ? 2 : 0; // Key press down animation
        
        // Add gradient for 3D effect
        const whiteKeyGradient = ctx.createLinearGradient(keyX, keyboardY, keyX, keyboardY + keyboardHeight);
        whiteKeyGradient.addColorStop(0, isPressed ? '#bbb' : '#fff');
        whiteKeyGradient.addColorStop(1, isPressed ? '#999' : '#e0e0e0');

        ctx.fillStyle = whiteKeyGradient;
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        ctx.fillRect(keyX, keyboardY + keyYOffset, whiteKeyWidth, keyboardHeight);
        ctx.strokeRect(keyX, keyboardY + keyYOffset, whiteKeyWidth, keyboardHeight);
    }

    // Reset shadow for subsequent drawings
    ctx.shadowBlur = 0;

    // --- Draw Black Keys ---
    const blackKeyPattern = [1, 1, 0, 1, 1, 1, 0]; // C#, D#, F#, G#, A#
    for (let i = 0; i < numWhiteKeys - 1; i++) {
         const patternIndex = i % 7;
         if (blackKeyPattern[patternIndex] === 1) {
            const pressAmount = (whiteKeyPresses[i] + whiteKeyPresses[i+1]) / 2;
            const isPressed = (Math.pow(pressAmount, 2) * sensitivity) > 0.15;

            const keyX = (i + 1) * whiteKeyWidth - (blackKeyWidth / 2);
            const keyYOffset = isPressed ? 2 : 0;

            const blackKeyGradient = ctx.createLinearGradient(keyX, keyboardY, keyX, keyboardY + blackKeyHeight);
            blackKeyGradient.addColorStop(0, isPressed ? '#555' : '#333');
            blackKeyGradient.addColorStop(1, isPressed ? '#333' : '#000');

            ctx.fillStyle = blackKeyGradient;
            ctx.fillRect(keyX, keyboardY + keyYOffset, blackKeyWidth, blackKeyHeight);
         }
    }

    // --- Draw Particles (Musical Notes) ---
    if (particles) {
        particles.forEach(p => {
            const noteSymbols = ['♪', '♫', '♬', '♭', '♯'];
            const symbol = noteSymbols[Math.floor(p.angle * noteSymbols.length)];

            ctx.font = `bold ${p.radius}px "Arial"`;
            ctx.fillStyle = applyAlphaToColor(p.color, p.opacity);
            ctx.textAlign = 'center';
            
            // Add glow to particles
            ctx.shadowColor = applyAlphaToColor(p.color, p.opacity * 0.8);
            ctx.shadowBlur = 15;

            ctx.fillText(symbol, p.x, p.y);
        });
    }

    ctx.restore();
};

const drawSubtitles = (
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    currentSubtitle: Subtitle | undefined,
    { fontSizeVw, fontFamily, color, effect, bgStyle, isBeat, dragOffset = { x: 0, y: 0 } }: {
        fontSizeVw: number;
        fontFamily: FontType;
        color: string;
        effect: GraphicEffectType;
        bgStyle: SubtitleBgStyle;
        isBeat?: boolean;
        dragOffset?: { x: number; y: number };
    }
) => {
    if (!currentSubtitle || !currentSubtitle.text) return;
    
    ctx.save();
    
    const { text } = currentSubtitle;
    
    const fontSize = (fontSizeVw / 100) * width;
    const actualFontName = FONT_MAP[fontFamily] || 'Poppins';
    console.log('傳統字幕字體設定:', { fontFamily, actualFontName, fontSize });
    ctx.font = `bold ${fontSize}px "${actualFontName}", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    
    const positionX = width / 2 + dragOffset.x;
    const positionY = height - (height * 0.08) + dragOffset.y;

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

    ctx.lineJoin = 'round';
    ctx.lineWidth = fontSize * 0.1;
    
    const drawTextWithEffect = (offsetX = 0, offsetY = 0) => {
        ctx.fillText(text, positionX + offsetX, positionY + offsetY);
        if (effect === GraphicEffectType.STROKE) {
            ctx.strokeStyle = 'rgba(0,0,0,0.5)';
            ctx.strokeText(text, positionX + offsetX, positionY + offsetY);
        }
    };

    // Handle text effects
    switch (effect) {
        case GraphicEffectType.GLOW:
            ctx.shadowColor = color;
            ctx.shadowBlur = 15;
            break;
        case GraphicEffectType.GLITCH:
            if (isBeat) {
                ctx.globalCompositeOperation = 'lighter';
                const glitchAmount = fontSize * 0.1;
                ctx.fillStyle = 'rgba(255, 0, 100, 0.7)';
                drawTextWithEffect((Math.random() - 0.5) * glitchAmount, (Math.random() - 0.5) * glitchAmount);
                ctx.fillStyle = 'rgba(0, 255, 255, 0.7)';
                drawTextWithEffect((Math.random() - 0.5) * glitchAmount, (Math.random() - 0.5) * glitchAmount);
                ctx.globalCompositeOperation = 'source-over';
            }
            break;
    }
    
    ctx.fillStyle = color;
    drawTextWithEffect();
    
    ctx.restore();
};

// 逐字顯示字幕函數（打字機風格）
const drawWordByWordSubtitles = (
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
    console.log('打字機字幕字體設定:', { fontFamily, actualFontName, fontSize });
    ctx.font = `bold ${fontSize}px "${actualFontName}", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    
    const positionX = width / 2 + dragOffset.x;
    const positionY = height - (height * 0.08) + dragOffset.y;
    
    // 找到當前時間對應的字幕
    let currentSubtitle: Subtitle | undefined;
    for (let i = subtitles.length - 1; i >= 0; i--) {
        if (currentTime >= subtitles[i].time) {
            currentSubtitle = subtitles[i];
            break;
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
    
    ctx.lineJoin = 'round';
    ctx.lineWidth = fontSize * 0.1;
    
    // Apply effects
    if (effect === GraphicEffectType.GLOW && isBeat) {
        ctx.shadowColor = color;
        ctx.shadowBlur = fontSize * 0.5;
    } else {
        ctx.shadowBlur = 0;
    }
    
    // Draw text outline
    ctx.strokeStyle = 'rgba(0,0,0,0.8)';
    ctx.strokeText(displayText, positionX, positionY);
    
    // Draw main text
    ctx.fillStyle = color;
    ctx.fillText(displayText, positionX, positionY);
    
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
    for (let i = 0; i < subtitles.length; i++) {
        if (currentTime >= subtitles[i].time) {
            currentIndex = i;
        } else {
            break;
        }
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
        console.log('捲軸歌詞字體設定:', { fontFamily, actualFontName, currentFontSize });
        ctx.font = `bold ${currentFontSize}px "${actualFontName}", sans-serif`;
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
            // 當前歌詞：使用傳入的顏色，發光效果
            ctx.fillStyle = color;
            ctx.shadowColor = color;
            ctx.shadowBlur = 20;
        } else if (isPastLine) {
            // 過去歌詞：使用傳入顏色的60%透明度
            ctx.fillStyle = color + '99'; // 60% 透明度
            ctx.shadowBlur = 0;
        } else {
            // 未來歌詞：使用傳入顏色的80%透明度
            ctx.fillStyle = color + 'CC'; // 80% 透明度
            ctx.shadowBlur = 0;
        }
        
        // 應用字幕效果
        if (effect === GraphicEffectType.GLOW) {
            ctx.shadowColor = color;
            ctx.shadowBlur = 15;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
        } else if (effect === GraphicEffectType.STROKE) {
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
            ctx.lineWidth = 3;
            ctx.strokeText(line.text, x, y);
        }
        
        // 繪製文字
        ctx.fillText(line.text, x, y);
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
) => void;

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
    });

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

    const renderFrame = useCallback(() => {
        const {
            visualizationType, customText, textColor, fontFamily, graphicEffect, 
            textSize, textPositionX, textPositionY,
            sensitivity, smoothing, equalization, backgroundColor, colors, watermarkPosition, 
            waveformStroke, isTransitioning, transitionType, backgroundImages, currentImageIndex,
            subtitles, showSubtitles, subtitleFontSize, subtitleFontFamily, 
            subtitleColor, subtitleBgStyle, effectScale, effectOffsetX, effectOffsetY
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
        
        if (backgroundImageRef.current) {
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
                drawGeometricBars(ctx, smoothedData, width, height, frame.current, sensitivity, finalColors, graphicEffect, isBeat, waveformStroke, particlesRef.current, geometricFrameImageRef.current, geometricSemicircleImageRef.current, propsRef.current);
            } else if (visualizationType === VisualizationType.Z_CUSTOM) {
                // Z總訂製款需要特殊處理，傳遞額外參數
                const currentFrame = typeof frame.current === 'number' ? frame.current : 0;
                drawZCustomVisualization(ctx, width, height, propsRef.current.zCustomCenterImage, propsRef, currentFrame);
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
        particlesRef.current = particlesRef.current.filter(p => p.opacity > 0 && p.y < height + 100);

        // Z總訂製款可視化已在主要繪製循環中處理，無需重複繪製

        // 字幕和自定義文字最後繪製，確保在最上層
        const currentTime = audioRef.current?.currentTime ?? 0;
        let currentSubtitle: Subtitle | undefined = undefined;
        if (showSubtitles && subtitles.length > 0) {
            for (let i = subtitles.length - 1; i >= 0; i--) {
                if (currentTime >= subtitles[i].time) {
                    currentSubtitle = subtitles[i];
                    break;
                }
            }
        }
        // 根據字幕顯示模式決定顯示內容
        if (propsRef.current.subtitleDisplayMode === SubtitleDisplayMode.LYRICS_SCROLL && subtitles.length > 0) {
            // 捲軸歌詞模式
            const dragOffset = dragState.current.draggedElement === 'lyrics' ? dragState.current.dragOffset : (propsRef.current.lyricsDragOffset || { x: 0, y: 0 });
            drawLyricsDisplay(ctx, width, height, subtitles, currentTime, { 
                fontFamily: subtitleFontFamily, 
                bgStyle: subtitleBgStyle,
                fontSize: propsRef.current.lyricsFontSize,
                positionX: propsRef.current.lyricsPositionX + (dragOffset.x / width) * 100,
                positionY: propsRef.current.lyricsPositionY + (dragOffset.y / height) * 100,
                color: subtitleColor,
                effect: GraphicEffectType.NONE
            });
        } else if (propsRef.current.subtitleDisplayMode === SubtitleDisplayMode.WORD_BY_WORD && subtitles.length > 0) {
            // 逐字顯示模式
            const dragOffset = dragState.current.draggedElement === 'subtitle' ? dragState.current.dragOffset : (propsRef.current.subtitleDragOffset || { x: 0, y: 0 });
            drawWordByWordSubtitles(ctx, width, height, subtitles, currentTime, { 
                fontFamily: subtitleFontFamily, 
                bgStyle: subtitleBgStyle,
                fontSizeVw: subtitleFontSize,
                color: subtitleColor,
                effect: GraphicEffectType.NONE,
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
                effect: GraphicEffectType.NONE, 
                bgStyle: subtitleBgStyle, 
                isBeat,
                dragOffset
            });
        }
        // 無字幕模式：不顯示任何字幕
        if (customText) {
            drawCustomText(ctx, customText, smoothedData, { 
                width, 
                height, 
                color: textColor, 
                fontFamily, 
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
            
            drawCtaAnimation(ctx, width, height, propsRef.current.ctaChannelName, ctaPosition);
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
            const vizWidth = width * 0.6; // 從0.8縮小到0.6
            const vizHeight = height * 0.6; // 從0.8縮小到0.6
            
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
                // 傳統字幕和逐字顯示模式 - 擴大底部檢測區域
                const subtitleY = height - (height * 0.08);
                const subtitleHeight = height * 0.25; // 從0.15擴大到0.25
                
                if (pos.y >= subtitleY - subtitleHeight && pos.y <= subtitleY + subtitleHeight) {
                    return 'subtitle';
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
    const drawCtaAnimation = (ctx: CanvasRenderingContext2D, width: number, height: number, channelName: string, position: { x: number; y: number }) => {
        const currentTime = Date.now();
        const audioCurrentTime = propsRef.current.audioRef?.current?.currentTime || 0;
        
        // 只在音頻開始的前10秒顯示，但允許拖動時或暫停時顯示
        if (audioCurrentTime > 10 && !dragState.current.isDragging && propsRef.current.isPlaying) return;
        
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
            
            // 訂閱文字（中文）- 搖滾圓體字體，增加行距
            ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
            ctx.font = 'bold 36px "RocknRoll One", "Noto Sans TC", sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('訂閱', ctaX, ctaY - 35);
            
            // 訂閱文字（英文）- 搖滾圓體字體，增加行距
            ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
            ctx.font = 'bold 28px "RocknRoll One", "Noto Sans TC", sans-serif';
            ctx.fillText('SUBSCRIBE', ctaX, ctaY + 5);
            
            // 頻道名稱，搖滾圓體字體，增加行距
            ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
            ctx.font = 'bold 22px "RocknRoll One", "Noto Sans TC", sans-serif';
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

    return <canvas ref={ref} className="w-full h-full" style={{ backgroundColor: 'transparent', border: '2px solid #4ecdc4', borderRadius: '8px' }} />;
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
    
    // 繪製中央孔洞
    const holeRadius = labelRadius * 0.15;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.arc(0, 0, holeRadius, 0, Math.PI * 2);
    ctx.fill();
    
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


export default AudioVisualizer;
