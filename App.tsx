

declare const chrome: any;

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import AudioUploader from './components/AudioUploader';
import AudioVisualizer from './components/AudioVisualizer';
import Controls from './components/Controls';
import Icon from './components/Icon';
import { useAudioAnalysis } from './hooks/useAudioAnalysis';
import { useMediaRecorder } from './hooks/useMediaRecorder';
import { VisualizationType, FontType, BackgroundColorType, ColorPaletteType, Palette, Resolution, GraphicEffectType, WatermarkPosition, Subtitle, SubtitleBgStyle } from './types';
import { ICON_PATHS, COLOR_PALETTES, RESOLUTION_MAP } from './constants';

function App() {
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [audioUrl, setAudioUrl] = useState<string>('');
    const [audioDuration, setAudioDuration] = useState<number>(0);
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [videoUrl, setVideoUrl] = useState<string>('');
    const [videoExtension, setVideoExtension] = useState<string>('webm');
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
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

    // Effect Transform State
    const [effectScale, setEffectScale] = useState<number>(1.0);
    const [effectOffsetX, setEffectOffsetX] = useState<number>(0);
    const [effectOffsetY, setEffectOffsetY] = useState<number>(0);

    // Subtitle State
    const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
    const [subtitlesRawText, setSubtitlesRawText] = useState<string>('');
    const [isGeneratingSubtitles, setIsGeneratingSubtitles] = useState<boolean>(false);
    const [showSubtitles, setShowSubtitles] = useState<boolean>(true);
    const [subtitleFontSize, setSubtitleFontSize] = useState<number>(4); // Relative vw unit
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
    
    useEffect(() => {
        const lines = subtitlesRawText.split('\n');
        const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;
        const newSubtitles: Subtitle[] = [];

        lines.forEach(line => {
            const match = line.match(timeRegex);
            if (match) {
                const minutes = parseInt(match[1], 10);
                const seconds = parseInt(match[2], 10);
                const milliseconds = parseInt(match[3].padEnd(3, '0'), 10) / 1000;
                const time = minutes * 60 + seconds + milliseconds;
                const text = line.replace(timeRegex, '').trim();
                if (text) {
                    newSubtitles.push({ time, text });
                }
            }
        });
        setSubtitles(newSubtitles.sort((a, b) => a.time - b.time));
    }, [subtitlesRawText]);

    const handleGenerateSubtitles = async () => {
        if (!audioFile) {
            alert('請先載入音訊檔案。');
            return;
        }
        
        const apiKey = process.env.VITE_API_KEY;

        if (!apiKey) {
            console.error("API Key is not configured. Please set 'VITE_API_KEY' in your deployment environment variables and redeploy.");
            alert("API Key 未設定，無法使用 AI 功能。\n\n請確認您已在 Railway 的 Variables 設定中，新增一個名為 VITE_API_KEY 的變數並填入您的金鑰。如果您已設定，請務必重新部署 (redeploy) 專案以讓變更生效。");
            return;
        }

        setIsGeneratingSubtitles(true);
        setSubtitlesRawText('正在分析音訊檔案並請求 AI 產生字幕，這可能需要一些時間...');

        try {
            const audioAsBase64 = await new Promise<string>((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => {
                    const result = reader.result as string;
                    // result is "data:audio/mpeg;base64,...."
                    // we only need the part after the comma
                    resolve(result.split(',')[1]);
                };
                reader.onerror = error => reject(error);
                reader.readAsDataURL(audioFile);
            });

            const ai = new GoogleGenAI({ apiKey });
            
            const audioPart = {
                inlineData: {
                    mimeType: audioFile.type,
                    data: audioAsBase64,
                },
            };

            const textPart = {
                text: `你是一位專業的音訊轉錄和歌詞同步專家。你的任務是轉錄提供的音訊檔案，並將整個轉錄內容格式化為標準的 LRC 檔案格式。請確保所有轉錄文字都使用**繁體中文**。每一行都必須有時間戳 \`[mm:ss.xx]\`。請確保時間戳準確，並在音訊的整個長度內邏輯分佈。轉錄內容應清晰、標點符號正確。最後一行的時間戳不得超過音訊總長度。\n\n音訊總長度：${audioDuration.toFixed(2)} 秒。請僅回應 LRC 格式的文字，不要添加任何介紹性文字或摘要。`
            };
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: { parts: [textPart, audioPart] },
            });

            setSubtitlesRawText(response.text.trim());

        } catch (error) {
            console.error("Error generating subtitles with AI:", error);
            alert("AI 字幕生成失敗。請檢查您的 API Key、網路連線或稍後再試。");
            setSubtitlesRawText(''); // Clear text on failure
        } finally {
            setIsGeneratingSubtitles(false);
        }
    };


    const handleSetResolution = (newRes: Resolution) => {
        setResolution(newRes);
    };
    
    const handleSetVisualization = (newVis: VisualizationType) => {
        setVisualizationType(newVis);
    };
    
    const handleSetColorPalette = (newPalette: ColorPaletteType) => {
        setColorPalette(newPalette);
    };

    const handleTextChange = (text: string) => {
        setCustomText(text);
    };
    
    const handleWatermarkPositionChange = (position: WatermarkPosition) => {
        setWatermarkPosition(position);
    };

    const handleBackgroundImageSelect = (file: File) => {
        if (backgroundImage) {
            URL.revokeObjectURL(backgroundImage);
        }
        const url = URL.createObjectURL(file);
        setBackgroundImage(url);
    };

    const clearBackgroundImage = () => {
        if (backgroundImage) {
            URL.revokeObjectURL(backgroundImage);
        }
        setBackgroundImage(null);
    };

    const handleRecordingComplete = useCallback((url: string, extension: string) => {
        setVideoUrl(url);
        setVideoExtension(extension);
        setIsLoading(false);
        setShowWarning(false);
    }, []);

    const { analyser, initializeAudio, isAudioInitialized, getAudioStream, resetAudioAnalysis } = useAudioAnalysis();
    const { isRecording, startRecording, stopRecording } = useMediaRecorder(handleRecordingComplete);

    const handleFileSelect = (file: File) => {
        setAudioFile(file);
        const url = URL.createObjectURL(file);
        setAudioUrl(url);
    };

    const handleClearAudio = useCallback(() => {
        if (isPlaying) {
             if (audioRef.current) {
                audioRef.current.pause();
            }
            setIsPlaying(false);
        }
       
        if (audioUrl) {
            URL.revokeObjectURL(audioUrl);
        }
        if (videoUrl) {
            URL.revokeObjectURL(videoUrl);
        }
        
        setAudioFile(null);
        setAudioUrl('');
        setVideoUrl('');
        setShowWarning(false);
        setSubtitlesRawText('');
        setAudioDuration(0);
        setCurrentTime(0);
        
        resetAudioAnalysis();

    }, [audioUrl, videoUrl, isPlaying, resetAudioAnalysis]);


    const handlePlayPause = useCallback(() => {
        if (!audioRef.current) return;

        if (!isAudioInitialized) {
            initializeAudio(audioRef.current);
        }

        const newIsPlaying = !isPlaying;
        if (newIsPlaying) {
            audioRef.current.play().catch(e => console.error("Audio play failed:", e));
        } else {
            audioRef.current.pause();
        }
        setIsPlaying(newIsPlaying);
    }, [isPlaying, isAudioInitialized, initializeAudio]);
    
    const handleMetadataLoaded = () => {
        if (audioRef.current) {
            setAudioDuration(audioRef.current.duration);
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            setCurrentTime(audioRef.current.currentTime);
            if (audioRef.current.ended) {
                setIsPlaying(false);
                if (isRecording) {
                    stopRecording();
                }
            }
        }
    };

    const handleStartRecording = () => {
        if (isRecording) {
            stopRecording();
            setIsLoading(true);
        } else {
            if (showSubtitles && subtitles.length === 0) {
                alert("錄製提示：您已啟用字幕，但尚未產生任何內容。\n\n請先使用「AI 產生字幕」或在文字區塊貼上 LRC 格式的歌詞，然後再開始錄製，以確保字幕能被正確錄進影片中。");
                return;
            }
            
            const audioStream = getAudioStream();
            if (canvasRef.current && audioStream && audioRef.current) {
                setShowWarning(true);
                const isTransparent = backgroundColor === BackgroundColorType.TRANSPARENT;
                startRecording(canvasRef.current, audioStream, isTransparent);
                audioRef.current.currentTime = 0;
                audioRef.current.play().then(() => setIsPlaying(true));
            } else {
                 alert("無法開始錄製。請確認音訊已載入並準備就緒。");
            }
        }
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
            {audioUrl && (
                <audio
                    key={audioUrl}
                    ref={audioRef}
                    src={audioUrl}
                    onPlay={() => setIsPlaying(true)}
                    onPause={() => setIsPlaying(false)}
                    onEnded={() => setIsPlaying(false)}
                    onLoadedMetadata={handleMetadataLoaded}
                    onTimeUpdate={handleTimeUpdate}
                    crossOrigin="anonymous"
                    className="hidden"
                />
            )}

            <header className="w-full max-w-7xl mx-auto flex items-center justify-between p-4 border-b border-gray-700 flex-shrink-0">
                <div className="flex items-center space-x-3">
                    <Icon path={ICON_PATHS.MUSIC_NOTE} className="w-8 h-8 text-cyan-400" />
                    <h1 className="text-2xl font-bold tracking-wider">音訊視覺化工具 Pro</h1>
                </div>
            </header>

            <main className="flex-1 flex flex-col p-4 overflow-y-auto">
                {!audioFile ? (
                    <div className="flex-1 flex items-center justify-center">
                      <AudioUploader onFileSelect={handleFileSelect} />
                    </div>
                ) : (
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
                               <AudioVisualizer 
                                    ref={canvasRef}
                                    analyser={analyser} 
                                    audioRef={audioRef}
                                    visualizationType={visualizationType} 
                                    isPlaying={isPlaying}
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

                        {showWarning && (
                            <div 
                                className="w-full max-w-7xl p-3 bg-yellow-500/10 border border-yellow-400 text-yellow-200 rounded-lg text-center shadow-lg flex items-center justify-center gap-3"
                                role="alert"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-yellow-400 flex-shrink-0"><path fillRule="evenodd" d="M9.401 3.003c1.155-2 4.043-2 5.197 0l7.355 12.74c1.154 2-.29 4.5-2.599 4.5H4.645c-2.309 0-3.752-2.5-2.598-4.5L9.4 3.003ZM12 8.25a.75.75 0 0 1 .75.75v3.75a.75.75 0 0 1-1.5 0V9a.75.75 0 0 1 .75-.75Zm0 8.25a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Z" clipRule="evenodd" /></svg>
                                <p><strong>錄製中...</strong> 為了確保影片完整，請將此分頁保持在前景顯示。高解析度錄製可能會導致介面回應緩慢。</p>
                            </div>
                        )}

                        <Controls
                            isPlaying={isPlaying}
                            onPlayPause={handlePlayPause}
                            isRecording={isRecording}
                            onRecordToggle={handleStartRecording}
                            isLoading={isLoading}
                            visualizationType={visualizationType}
                            onVisualizationChange={handleSetVisualization}
                            customText={customText}
                            onTextChange={handleTextChange}
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
                            onClearAudio={handleClearAudio}
                            videoUrl={videoUrl}
                            videoExtension={videoExtension}
                            backgroundColor={backgroundColor}
                            onBackgroundColorChange={setBackgroundColor}
                            colorPalette={colorPalette}
                            onColorPaletteChange={handleSetColorPalette}
                            resolution={resolution}
                            onResolutionChange={handleSetResolution}
                            backgroundImage={backgroundImage}
                            onBackgroundImageSelect={handleBackgroundImageSelect}
                            onClearBackgroundImage={clearBackgroundImage}
                            watermarkPosition={watermarkPosition}
                            onWatermarkPositionChange={handleWatermarkPositionChange}
                            waveformStroke={waveformStroke}
                            onWaveformStrokeChange={setWaveformStroke}
                            subtitlesRawText={subtitlesRawText}
                            onSubtitlesRawTextChange={setSubtitlesRawText}
                            onGenerateSubtitles={handleGenerateSubtitles}
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
                )}
            </main>
            <footer className="w-full text-center p-4 text-gray-500 text-sm flex-shrink-0">
                一個與 <a href="https://www.youtube.com/channel/UCZVT570EWJ64ibL-re9CFpQ" target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">Sonic Pulse</a> 合作的專案成果。
            </footer>
        </div>
    );
}

export default App;