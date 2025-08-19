import React, { useRef, useEffect, forwardRef, useCallback } from 'react';
import { VisualizationType, Palette, GraphicEffectType, ColorPaletteType, WatermarkPosition, FontType, Subtitle, SubtitleBgStyle } from '../../types';
import { drawMonstercat, drawMonstercatGlitch, drawNebulaWave, drawLuminousWave, drawFusion, drawTechWave, drawStellarCore, drawRadialBars, drawParticleGalaxy, drawLiquidMetal, drawCrtGlitch, drawGlitchWave, drawDataMosh, drawSignalScramble, drawPixelSort, drawRepulsorField, drawAudioLandscape, drawPianoVirtuoso, drawRecordPlayer } from '../../components/AudioVisualizer'; // This is a bit of a hack, but it's for testing only

// NOTE: This is a test component. I've copied the original AudioVisualizer and modified it to generate fake data.
// I also had to change the imports to be relative to this new location.

interface AudioVisualizerProps {
    analyser: AnalyserNode | null;
    audioRef: React.RefObject<HTMLAudioElement>;
    visualizationType: VisualizationType;
    isPlaying: boolean;
    customText: string;
    textColor: string;
    fontFamily: FontType;
    graphicEffect: GraphicEffectType;
    sensitivity: number;
    smoothing: number;
    equalization: number;
    backgroundColor: string;
    colors: Palette;
    backgroundImage: string | null;
    watermarkPosition: WatermarkPosition;
    waveformStroke: boolean;
    subtitles: Subtitle[];
    showSubtitles: boolean;
    subtitleFontSize: number;
    subtitleFontFamily: FontType;
    subtitleColor: string;
    subtitleEffect: GraphicEffectType;
    subtitleBgStyle: SubtitleBgStyle;
    effectScale: number;
    effectOffsetX: number;
    effectOffsetY: number;
}

const TestAudioVisualizer = forwardRef<HTMLCanvasElement, AudioVisualizerProps>((props, ref) => {
    const { analyser, audioRef, isPlaying } = props;
    const animationFrameId = useRef<number>(0);
    const frame = useRef<number>(0);
    const propsRef = useRef(props);

    useEffect(() => {
        propsRef.current = props;
    });

    const renderFrame = useCallback(() => {
        const {
            visualizationType, customText, textColor, fontFamily, graphicEffect,
            sensitivity, smoothing, equalization, backgroundColor, colors, watermarkPosition,
            waveformStroke, subtitles, showSubtitles, subtitleFontSize, subtitleFontFamily,
            subtitleColor, subtitleEffect, subtitleBgStyle, effectScale, effectOffsetX, effectOffsetY
        } = propsRef.current;

        const canvas = (ref as React.RefObject<HTMLCanvasElement>).current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        frame.current++;
        let dataArray = new Uint8Array(1024);
        // Create a fake data array for screenshot verification
        dataArray = new Uint8Array(1024).map((_, i) => {
            const progress = i / 1024;
            // Create a pattern that is high at the start and low at the end
            // This will show high bars in the center due to the reversed logic
            return Math.max(0, 220 * (1 - progress) * (Math.sin(frame.current * 0.1 + i * 0.05) * 0.5 + 0.5));
        });

        const balancedData = dataArray;
        const smoothedData = dataArray;

        const { width, height } = canvas;

        if (backgroundColor === 'transparent') {
            ctx.clearRect(0, 0, width, height);
        } else {
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, width, height);
        }

        const VISUALIZATION_MAP: Record<VisualizationType, any> = {
            [VisualizationType.MONSTERCAT]: drawMonstercat,
            [VisualizationType.MONSTERCAT_GLITCH]: drawMonstercatGlitch,
            [VisualizationType.NEBULA_WAVE]: drawNebulaWave,
            [VisualizationType.LUMINOUS_WAVE]: drawLuminousWave,
            [VisualizationType.FUSION]: drawFusion,
            [VisualizationType.TECH_WAVE]: drawTechWave,
            [VisualizationType.STELLAR_CORE]: drawStellarCore,
            [VisualizationType.RADIAL_BARS]: drawRadialBars,
            [VisualizationType.PARTICLE_GALAXY]: drawParticleGalaxy,
            [VisualizationType.LIQUID_METAL]: drawLiquidMetal,
            [VisualizationType.CRT_GLITCH]: drawCrtGlitch,
            [VisualizationType.GLITCH_WAVE]: drawGlitchWave,
            [VisualizationType.DATA_MOSH]: drawDataMosh,
            [VisualizationType.SIGNAL_SCRAMBLE]: drawSignalScramble,
            [VisualizationType.PIXEL_SORT]: drawPixelSort,
            [VisualizationType.REPULSOR_FIELD]: drawRepulsorField,
            [VisualizationType.AUDIO_LANDSCAPE]: drawAudioLandscape,
            [VisualizationType.PIANO_VIRTUOSO]: drawPianoVirtuoso,
            [VisualizationType.RECORD_PLAYER]: drawRecordPlayer,
        };

        const drawFunction = VISUALIZATION_MAP[visualizationType];
        if (drawFunction) {
            drawFunction(ctx, smoothedData, width, height, frame.current, sensitivity, colors, graphicEffect, false, waveformStroke, []);
        }

        if (propsRef.current.isPlaying) {
            animationFrameId.current = requestAnimationFrame(renderFrame);
        }
    }, [analyser, ref, audioRef]);

    useEffect(() => {
        if (isPlaying) {
            animationFrameId.current = requestAnimationFrame(renderFrame);
        } else {
            cancelAnimationFrame(animationFrameId.current);
        }
        return () => {
            cancelAnimationFrame(animationFrameId.current);
        };
    }, [isPlaying, renderFrame]);

    return <canvas ref={ref} className="w-full h-full" />;
});

TestAudioVisualizer.displayName = 'TestAudioVisualizer';

export default TestAudioVisualizer;
