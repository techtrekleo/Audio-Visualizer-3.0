import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import AudioUploader from '../../components/AudioUploader';
import TestAudioVisualizer from './TestAudioVisualizer';
import Controls from '../../components/Controls';
import Icon from '../../components/Icon';
import { useAudioAnalysis } from '../../hooks/useAudioAnalysis';
import { useMediaRecorder } from '../../hooks/useMediaRecorder';
import { VisualizationType, FontType, BackgroundColorType, ColorPaletteType, Palette, Resolution, GraphicEffectType, WatermarkPosition, Subtitle, SubtitleBgStyle } from '../../types';
import { ICON_PATHS, COLOR_PALETTES, RESOLUTION_MAP } from '../../constants';

function TestApp() {
    const [audioFile, setAudioFile] = useState<File | null>(new File([], "fake.mp3"));
    const [audioUrl, setAudioUrl] = useState<string>('');
    const [audioDuration, setAudioDuration] = useState<number>(0);
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [videoUrl, setVideoUrl] = useState<string>('');
    const [videoExtension, setVideoExtension] = useState<string>('webm');
    const [isPlaying, setIsPlaying] = useState<boolean>(true);
    const [visualizationType, setVisualizationType] = useState<VisualizationType>(VisualizationType.MONSTERCAT);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [customText, setCustomText] = useState<string>('Sonic Pulse');
    const [textColor, setTextColor] = useState<string>('#67E8F9');
    const [fontFamily, setFontFamily] = useState<FontType>(FontType.ROCKNROLL_ONE);
    const [graphicEffect, setGraphicEffect] = useState<GraphicEffectType>(GraphicEffectType.GLOW);
    const [sensitivity, setSensitivity] = useState<number>(1.0);
    const [smoothing, setSmoothing] = useState<number>(0);
    const [equalization, setEqualization] = useState<number>(0.25);
    const [showWarning, setShowWarning] = useState<boolean>(false);
    const [backgroundColor, setBackgroundColor] = useState<BackgroundColorType>(BackgroundColorType.BLACK);
    const [colorPalette, setColorPalette] = useState<ColorPaletteType>(ColorPaletteType.DEFAULT);
    const [resolution, setResolution] = useState<Resolution>(Resolution.P1080);
    const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
    const [watermarkPosition, setWatermarkPosition] = useState<WatermarkPosition>(WatermarkPosition.BOTTOM_RIGHT);
    const [waveformStroke, setWaveformStroke] = useState<boolean>(true);
    const [effectScale, setEffectScale] = useState<number>(1.0);
    const [effectOffsetX, setEffectOffsetX] = useState<number>(0);
    const [effectOffsetY, setEffectOffsetY] = useState<number>(0);
    const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
    const [subtitlesRawText, setSubtitlesRawText] = useState<string>('');
    const [isGeneratingSubtitles, setIsGeneratingSubtitles] = useState<boolean>(false);
    const [showSubtitles, setShowSubtitles] = useState<boolean>(true);
    const [subtitleFontSize, setSubtitleFontSize] = useState<number>(4);
    const [subtitleFontFamily, setSubtitleFontFamily] = useState<FontType>(FontType.POPPINS);
    const [subtitleColor, setSubtitleColor] = useState<string>('#FFFFFF');
    const [subtitleEffect, setSubtitleEffect] = useState<GraphicEffectType>(GraphicEffectType.SHADOW);
    const [subtitleBgStyle, setSubtitleBgStyle] = useState<SubtitleBgStyle>(SubtitleBgStyle.SEMI_TRANSPARENT);

    const audioRef = useRef<HTMLAudioElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const canvasBgColors: Record<BackgroundColorType, string> = {
        [BackgroundColorType.BLACK]: 'rgba(0, 0, 0, 1)',
        [BackgroundColorType.GREEN]: 'rgba(0, 255, 0, 1)',
        [BackgroundColorType.WHITE]: 'rgba(255, 255, 255, 1)',
        [BackgroundColorType.TRANSPARENT]: 'transparent',
    };

    const { analyser, initializeAudio, isAudioInitialized, getAudioStream, resetAudioAnalysis } = useAudioAnalysis();

    const handleSetVisualization = (newVis: VisualizationType) => {
        setVisualizationType(newVis);
    };

    const resValue = RESOLUTION_MAP[resolution];
    const visualizerContainerStyle = {
        width: resValue ? `${resValue.width}px` : '100%',
        height: resValue ? `${resValue.height}px` : '100%',
        flexShrink: 0,
    };
    const wrapperStyle = resValue ? {} : { width: '100%', aspectRatio: '16/9' };

    const isTransparentBg = backgroundColor === BackgroundColorType.TRANSPARENT;
    const checkerboardSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><rect width="10" height="10" x="0" y="0" fill="#888" /><rect width="10" height="10" x="10" y="10" fill="#888" /><rect width="10" height="10" x="10" y="0" fill="#444" /><rect width="10" height="10" x="0" y="10" fill="#444" /></svg>`;
    const checkerboardUrl = `url("data:image/svg+xml,${encodeURIComponent(checkerboardSvg)}")`;

    return (
        <div className="h-full flex flex-col">
            <header className="w-full max-w-7xl mx-auto flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
                <div className="flex items-center space-x-3">
                    <Icon path={ICON_PATHS.MUSIC_NOTE} className="w-8 h-8 text-cyan-400" />
                    <h1 className="text-2xl font-bold tracking-wider">音訊視覺化工具 Pro (Test)</h1>
                </div>
            </header>

            <main className="flex-1 flex flex-col p-4 overflow-y-auto">
                <div className="w-full max-w-7xl mx-auto flex flex-col items-center gap-4">
                    <div style={wrapperStyle} className="flex items-center justify-center bg-black rounded-lg border border-gray-700 overflow-hidden">
                        <div
                            style={{
                                ...visualizerContainerStyle,
                                backgroundImage: isTransparentBg ? checkerboardUrl : 'none',
                                backgroundSize: '20px 20px',
                            }}
                            className="relative shadow-2xl shadow-cyan-500/10"
                        >
                            <TestAudioVisualizer
                                ref={canvasRef}
                                analyser={analyser}
                                audioRef={audioRef}
                                visualizationType={visualizationType}
                                isPlaying={true}
                                customText={customText}
                                textColor={textColor}
                                fontFamily={fontFamily}
                                graphicEffect={graphicEffect}
                                sensitivity={sensitivity}
                                smoothing={smoothing}
                                equalization={equalization}
                                backgroundColor={canvasBgColors[backgroundColor]}
                                colors={COLOR_PALETTES[colorPalette]}
                                backgroundImage={backgroundImage}
                                watermarkPosition={watermarkPosition}
                                waveformStroke={waveformStroke}
                                subtitles={subtitles}
                                showSubtitles={showSubtitles}
                                subtitleFontSize={subtitleFontSize}
                                subtitleFontFamily={subtitleFontFamily}
                                subtitleColor={subtitleColor}
                                subtitleEffect={subtitleEffect}
                                subtitleBgStyle={subtitleBgStyle}
                                effectScale={effectScale}
                                effectOffsetX={effectOffsetX}
                                effectOffsetY={effectOffsetY}
                            />
                        </div>
                    </div>
                    <Controls
                        isPlaying={isPlaying}
                        onPlayPause={() => {}}
                        isRecording={false}
                        onRecordToggle={() => {}}
                        isLoading={isLoading}
                        visualizationType={visualizationType}
                        onVisualizationChange={handleSetVisualization}
                        customText={customText}
                        onTextChange={setCustomText}
                        textColor={textColor}
                        onTextColorChange={setTextColor}
                        fontFamily={fontFamily}
                        onFontFamilyChange={setFontFamily}
                        graphicEffect={graphicEffect}
                        onGraphicEffectChange={setGraphicEffect}
                        sensitivity={sensitivity}
                        onSensitivityChange={setSensitivity}
                        smoothing={smoothing}
                        onSmoothingChange={setSmoothing}
                        equalization={equalization}
                        onEqualizationChange={setEqualization}
                        audioFile={audioFile}
                        onClearAudio={() => {}}
                        videoUrl={videoUrl}
                        videoExtension={videoExtension}
                        backgroundColor={backgroundColor}
                        onBackgroundColorChange={setBackgroundColor}
                        colorPalette={colorPalette}
                        onColorPaletteChange={setColorPalette}
                        resolution={resolution}
                        onResolutionChange={setResolution}
                        backgroundImage={backgroundImage}
                        onBackgroundImageSelect={() => {}}
                        onClearBackgroundImage={() => {}}
                        watermarkPosition={watermarkPosition}
                        onWatermarkPositionChange={setWatermarkPosition}
                        waveformStroke={waveformStroke}
                        onWaveformStrokeChange={setWaveformStroke}
                        subtitlesRawText={subtitlesRawText}
                        onSubtitlesRawTextChange={setSubtitlesRawText}
                        onGenerateSubtitles={() => {}}
                        isGeneratingSubtitles={isGeneratingSubtitles}
                        showSubtitles={showSubtitles}
                        onShowSubtitlesChange={setShowSubtitles}
                        subtitleFontSize={subtitleFontSize}
                        onSubtitleFontSizeChange={setSubtitleFontSize}
                        subtitleFontFamily={subtitleFontFamily}
                        onSubtitleFontFamilyChange={setSubtitleFontFamily}
                        subtitleColor={subtitleColor}
                        onSubtitleColorChange={setSubtitleColor}
                        subtitleEffect={subtitleEffect}
                        onSubtitleEffectChange={setSubtitleEffect}
                        subtitleBgStyle={subtitleBgStyle}
                        onSubtitleBgStyleChange={setSubtitleBgStyle}
                        effectScale={effectScale}
                        onEffectScaleChange={setEffectScale}
                        effectOffsetX={effectOffsetX}
                        onEffectOffsetXChange={setEffectOffsetX}
                        effectOffsetY={effectOffsetY}
                        onEffectOffsetYChange={setEffectOffsetY}
                    />
                </div>
            </main>
        </div>
    );
}

export default TestApp;
