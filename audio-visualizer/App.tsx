

declare const chrome: any;

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import AudioUploader from './components/AudioUploader';
import AudioVisualizer from './components/AudioVisualizer';
import Controls from './components/Controls';
import OptimizedControls from './components/OptimizedControls';
import Icon from './components/Icon';
import AdSenseAd from './components/AdSenseAd';
import LyricsDisplay from './components/LyricsDisplay';
// import AdManager from './components/AdManager';
// import PopupAdManager from './components/PopupAdManager';
import { useAudioAnalysis } from './hooks/useAudioAnalysis';
import { useMediaRecorder } from './hooks/useMediaRecorder';
import { VisualizationType, FontType, BackgroundColorType, ColorPaletteType, Palette, Resolution, GraphicEffectType, WatermarkPosition, Subtitle, SubtitleBgStyle, SubtitleDisplayMode, TransitionType } from './types';
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
    const [textSize, setTextSize] = useState<number>(4); // 字體大小 (vw 單位)
    const [textPositionX, setTextPositionX] = useState<number>(0); // 水平位置偏移 (-50 到 50)
    const [textPositionY, setTextPositionY] = useState<number>(0); // 垂直位置偏移 (-50 到 50)
    const [sensitivity, setSensitivity] = useState<number>(1.0);
    const [smoothing, setSmoothing] = useState<number>(0);
    const [equalization, setEqualization] = useState<number>(0.25);
    const [showWarning, setShowWarning] = useState<boolean>(false);
    const [backgroundColor, setBackgroundColor] = useState<BackgroundColorType>(BackgroundColorType.BLACK);
    const [colorPalette, setColorPalette] = useState<ColorPaletteType>(ColorPaletteType.DEFAULT);
    const [resolution, setResolution] = useState<Resolution>(Resolution.P1080);
    const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
    const [backgroundImages, setBackgroundImages] = useState<string[]>([]); // 多張背景圖片
    const [currentImageIndex, setCurrentImageIndex] = useState<number>(0); // 當前圖片索引
    const [isSlideshowEnabled, setIsSlideshowEnabled] = useState<boolean>(false); // 輪播開關
    const [slideshowInterval, setSlideshowInterval] = useState<number>(15); // 輪播間隔（秒）
    const [isTransitioning, setIsTransitioning] = useState<boolean>(false); // 是否正在過場
    const [transitionType, setTransitionType] = useState<TransitionType>(TransitionType.TV_STATIC); // 轉場效果類型
    const [watermarkPosition, setWatermarkPosition] = useState<WatermarkPosition>(WatermarkPosition.BOTTOM_RIGHT);
    const [waveformStroke, setWaveformStroke] = useState<boolean>(true);
    // Toggles
    const [showVisualizer, setShowVisualizer] = useState<boolean>(true);
    const [showBackgroundImage, setShowBackgroundImage] = useState<boolean>(true);

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
    const [subtitleBgStyle, setSubtitleBgStyle] = useState<SubtitleBgStyle>(SubtitleBgStyle.TRANSPARENT);
    const [subtitleDisplayMode, setSubtitleDisplayMode] = useState<SubtitleDisplayMode>(SubtitleDisplayMode.CLASSIC);
    
    // Lyrics Display State (測試中)
    const [showLyricsDisplay, setShowLyricsDisplay] = useState<boolean>(false);
    const [lyricsFontSize, setLyricsFontSize] = useState<number>(4); // 字體大小百分比
    const [lyricsPositionX, setLyricsPositionX] = useState<number>(0); // 水平位置偏移 (-50 到 50)
    const [lyricsPositionY, setLyricsPositionY] = useState<number>(0); // 垂直位置偏移 (-50 到 50)
    
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
        const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2})\]/;
        const newSubtitles: Subtitle[] = [];

        lines.forEach(line => {
            const match = line.match(timeRegex);
            if (match) {
                const minutes = parseInt(match[1], 10);
                const seconds = parseInt(match[2], 10);
                const centiseconds = parseInt(match[3], 10);
                const time = minutes * 60 + seconds + centiseconds / 100;
                const text = line.replace(timeRegex, '').trim();
                if (text) {
                    newSubtitles.push({ time, text });
                }
            }
        });
        setSubtitles(newSubtitles.sort((a, b) => a.time - b.time));
    }, [subtitlesRawText]);

    // 背景圖片輪播邏輯
    useEffect(() => {
        console.log('輪播 useEffect 觸發:', { isSlideshowEnabled, backgroundImagesLength: backgroundImages.length, isPlaying });
        
        if (!isSlideshowEnabled || backgroundImages.length <= 1 || !isPlaying) {
            console.log('輪播條件不滿足:', { isSlideshowEnabled, backgroundImagesLength: backgroundImages.length, isPlaying });
            return;
        }

        console.log('開始設置輪播 interval');
        const interval = setInterval(() => {
            console.log('Interval 執行:', { backgroundImagesLength: backgroundImages.length, isPlaying });
            if (backgroundImages.length > 1 && isPlaying) {
                console.log('開始轉場動畫');
                
                // 設置轉場開始時間
                (window as any).transitionStartTime = performance.now();
                setIsTransitioning(true);
                
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
                
                const transitionDuration = getTransitionDuration(transitionType);
                const switchTime = transitionDuration * 0.5; // 在中間時間切換圖片
                
                setTimeout(() => {
                    console.log('切換圖片');
                    setCurrentImageIndex((prevIndex) => 
                        (prevIndex + 1) % backgroundImages.length
                    );
                }, switchTime);
                
                setTimeout(() => {
                    console.log('結束轉場動畫');
                    setIsTransitioning(false);
                }, transitionDuration);
            }
        }, slideshowInterval * 1000);

        return () => {
            console.log('清理輪播 interval');
            clearInterval(interval);
        };
    }, [isSlideshowEnabled, backgroundImages.length, slideshowInterval, isPlaying]);

    // 更新當前背景圖片
    useEffect(() => {
        if (backgroundImages.length > 0) {
            setBackgroundImage(backgroundImages[currentImageIndex]);
        }
    }, [backgroundImages, currentImageIndex]);

    const handleGenerateSubtitles = async () => {
        if (!audioFile) {
            alert('請先載入音訊檔案。');
            return;
        }
        
        const apiKey = (import.meta as any).env.VITE_API_KEY;

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
                text: `你是一位專業的音訊轉錄和歌詞同步專家，專門處理繁體中文內容。

**重要要求：**
1. **語言限制**：所有轉錄內容必須使用繁體中文，絕對不能使用簡體中文
2. **字體規範**：使用標準繁體中文字體，如「臺灣」、「香港」等
3. **標點符號**：使用繁體中文標點符號，如「，」「。」「？」「！」等

**任務說明：**
- 轉錄提供的音訊檔案內容
- 將內容格式化為標準的 LRC 檔案格式
- 每一行都必須有時間戳 \`[mm:ss.xx]\`
- 時間戳必須準確，並在音訊的整個長度內邏輯分佈
- 轉錄內容應清晰、標點符號正確
- 最後一行的時間戳不得超過音訊總長度

**音訊總長度：** ${audioDuration.toFixed(2)} 秒

**回應格式：** 僅回應 LRC 格式的文字，不要添加任何介紹性文字、摘要或說明。`
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

    const handleMultipleBackgroundImagesSelect = (files: FileList) => {
        // 清除舊的圖片
        backgroundImages.forEach(url => URL.revokeObjectURL(url));
        
        const newUrls: string[] = [];
        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
                newUrls.push(URL.createObjectURL(file));
            }
        });
        
        setBackgroundImages(newUrls);
        setCurrentImageIndex(0);
        
        // 如果只有一張圖片，關閉輪播
        if (newUrls.length <= 1) {
            setIsSlideshowEnabled(false);
        }
    };

    const clearBackgroundImage = () => {
        if (backgroundImage) {
            URL.revokeObjectURL(backgroundImage);
        }
        setBackgroundImage(null);
    };

    const clearAllBackgroundImages = () => {
        console.log('清除所有背景圖片，當前數量:', backgroundImages.length);
        backgroundImages.forEach(url => URL.revokeObjectURL(url));
        setBackgroundImages([]);
        setCurrentImageIndex(0);
        setBackgroundImage(null);
        setIsSlideshowEnabled(false);
        console.log('背景圖片已清除');
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
        console.log('選擇音訊文件:', { name: file.name, type: file.type, size: file.size });
        
        // 停止當前播放
        if (isPlaying && audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
        }
        
        // 重置音頻分析
        resetAudioAnalysis();
        
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
        console.log('播放/暫停:', { currentIsPlaying: isPlaying, newIsPlaying });
        
        if (newIsPlaying) {
            audioRef.current.play().then(() => {
                console.log('音頻播放成功');
                setIsPlaying(true);
            }).catch(e => {
                console.error("Audio play failed:", e);
                setIsPlaying(false);
            });
        } else {
            audioRef.current.pause();
            console.log('音頻暫停');
            setIsPlaying(false);
        }
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

    const handleSeek = (newTime: number) => {
        if (audioRef.current) {
            audioRef.current.currentTime = newTime;
            setCurrentTime(newTime);
        }
    };

    const handleStartRecording = () => {
        if (isRecording) {
            stopRecording();
            setIsLoading(true);
        } else {
            // 只有在字幕顯示模式不是「無字幕」時才檢查字幕內容
            if (subtitleDisplayMode !== SubtitleDisplayMode.NONE) {
                if (showSubtitles && subtitles.length === 0) {
                    alert("錄製提示：您已啟用字幕，但尚未產生任何內容。\n\n請先使用「AI 產生字幕」或在文字區塊貼上 [00:00.00] 格式的歌詞，然後再開始錄製，以確保字幕能被正確錄進影片中。");
                    return;
                }
                
                if (showLyricsDisplay && subtitles.length === 0) {
                    alert("錄製提示：您已啟用歌詞顯示，但尚未產生任何內容。\n\n請先使用「AI 產生字幕」或在文字區塊貼上 [00:00.00] 格式的歌詞，然後再開始錄製，以確保歌詞能被正確錄進影片中。");
                    return;
                }
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
                    onPlay={() => {
                        console.log('音頻 onPlay 事件觸發');
                        setIsPlaying(true);
                    }}
                    onPause={() => {
                        console.log('音頻 onPause 事件觸發');
                        setIsPlaying(false);
                    }}
                    onEnded={() => {
                        console.log('音頻 onEnded 事件觸發');
                        setIsPlaying(false);
                    }}
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
                                    key={showVisualizer ? 'vis-on' : 'vis-off'}
                                    ref={canvasRef}
                                    analyser={analyser} 
                                    audioRef={audioRef}
                                    visualizationType={visualizationType} 
                                    isPlaying={isPlaying}
                                    customText={customText}
                                    textColor={textColor}
                                    fontFamily={fontFamily}
                                    graphicEffect={graphicEffect}
                                    textSize={textSize}
                                    textPositionX={textPositionX}
                                    textPositionY={textPositionY}
                                    sensitivity={sensitivity}
                                    smoothing={smoothing}
                                    equalization={equalization}
                                    backgroundColor={canvasBgColors[backgroundColor]}
                                    colors={COLOR_PALETTES[colorPalette]}
                                    backgroundImage={showBackgroundImage ? backgroundImage : null}
                                    watermarkPosition={watermarkPosition}
                                    waveformStroke={waveformStroke}
                                    isTransitioning={isTransitioning}
                                    transitionType={transitionType}
                                    backgroundImages={showBackgroundImage ? backgroundImages : []}
                                    currentImageIndex={currentImageIndex}
                                    subtitles={subtitles}
                                    showSubtitles={showSubtitles}
                                    subtitleFontSize={subtitleFontSize}
                                    subtitleFontFamily={subtitleFontFamily}
                                    subtitleColor={subtitleColor}
                                    subtitleBgStyle={subtitleBgStyle}
                                    effectScale={effectScale}
                                    effectOffsetX={effectOffsetX}
                                    effectOffsetY={effectOffsetY}
                                    showLyricsDisplay={showLyricsDisplay}
                                    currentTime={currentTime}
                                    lyricsFontSize={lyricsFontSize}
                                    lyricsPositionX={lyricsPositionX}
                                    lyricsPositionY={lyricsPositionY}
                                    subtitleDisplayMode={subtitleDisplayMode}
                                    disableVisualizer={!showVisualizer}
                                />
                            </div>
                        </div>

                        {/* 橫幅廣告 */}
                        <div className="w-full max-w-7xl mx-auto mb-6">
                            <AdSenseAd type="banner" />
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

                        <OptimizedControls
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
                            textSize={textSize}
                            onTextSizeChange={setTextSize}
                            textPositionX={textPositionX}
                            onTextPositionXChange={setTextPositionX}
                            textPositionY={textPositionY}
                            onTextPositionYChange={setTextPositionY}
                            sensitivity={sensitivity}
                            onSensitivityChange={setSensitivity}
                            smoothing={smoothing}
                            onSmoothingChange={setSmoothing}
                            equalization={equalization}
                            onEqualizationChange={setEqualization}
                            audioFile={audioFile}
                            onClearAudio={handleClearAudio}
                            onFileSelect={handleFileSelect}
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
                            backgroundImages={backgroundImages}
                            onMultipleBackgroundImagesSelect={handleMultipleBackgroundImagesSelect}
                            onClearAllBackgroundImages={clearAllBackgroundImages}
                            currentImageIndex={currentImageIndex}
                            isSlideshowEnabled={isSlideshowEnabled}
                            onSlideshowEnabledChange={setIsSlideshowEnabled}
                            slideshowInterval={slideshowInterval}
                            onSlideshowIntervalChange={setSlideshowInterval}
                            isTransitioning={isTransitioning}
                            transitionType={transitionType}
                            onTransitionTypeChange={setTransitionType}
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
                            subtitleBgStyle={subtitleBgStyle}
                            onSubtitleBgStyleChange={setSubtitleBgStyle}
                            effectScale={effectScale}
                            onEffectScaleChange={setEffectScale}
                            effectOffsetX={effectOffsetX}
                            onEffectOffsetXChange={setEffectOffsetX}
                            effectOffsetY={effectOffsetY}
                            onEffectOffsetYChange={setEffectOffsetY}
                            showLyricsDisplay={showLyricsDisplay}
                            onShowLyricsDisplayChange={setShowLyricsDisplay}
                            lyricsFontSize={lyricsFontSize}
                            onLyricsFontSizeChange={setLyricsFontSize}
                            lyricsPositionX={lyricsPositionX}
                            onLyricsPositionXChange={setLyricsPositionX}
                            lyricsPositionY={lyricsPositionY}
                            onLyricsPositionYChange={setLyricsPositionY}
                            subtitleDisplayMode={subtitleDisplayMode}
                            onSubtitleDisplayModeChange={setSubtitleDisplayMode}
                            currentTime={currentTime}
                            audioDuration={audioDuration}
                            onSeek={handleSeek}
                            showVisualizer={showVisualizer}
                            onShowVisualizerChange={setShowVisualizer}
                            showBackgroundImage={showBackgroundImage}
                            onShowBackgroundImageChange={setShowBackgroundImage}
                        />
                    </div>
            </main>
            {/* 頁腳廣告 */}
            <div className="w-full max-w-7xl mx-auto px-4 mb-4">
                <AdSenseAd type="footer" />
            </div>
            
            <footer className="w-full text-center p-4 bg-gray-900/80 backdrop-blur-sm border-t border-gray-600 flex-shrink-0">
                <div className="mb-4">
                    <p className="text-gray-300">© {new Date().getFullYear()} Sonic Pulse. Built with ❤️ by 音樂脈動-Sonic Pulse</p>
                    <p className="mt-2">
                        <a 
                            href="https://www.youtube.com/@%E9%9F%B3%E6%A8%82%E8%84%88%E5%8B%95SonicPulse" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300 font-medium transition-colors duration-200"
                        >
                            🎵 Sonic Pulse YouTube Channel
                        </a>
                    </p>
                </div>
                
                
            </footer>
            
        </div>
    );
}

export default App;