

declare const chrome: any;

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import AudioUploader from './components/AudioUploader';
import AudioVisualizer from './components/AudioVisualizer';
import Controls from './components/Controls';
import OptimizedControls from './components/OptimizedControls';
import Icon from './components/Icon';
import AdSenseAd from './components/AdSenseAd';
import LyricsDisplay from './components/LyricsDisplay';
import { UnifiedHeader } from './components/UnifiedLayout';
import { UnifiedFooter, ModalProvider } from '../shared-components/dist';
// import AdManager from './components/AdManager';
// import PopupAdManager from './components/PopupAdManager';
import { useAudioAnalysis } from './hooks/useAudioAnalysis';
import { useMediaRecorder } from './hooks/useMediaRecorder';
import { VisualizationType, FontType, BackgroundColorType, ColorPaletteType, Palette, Resolution, GraphicEffectType, WatermarkPosition, Subtitle, SubtitleBgStyle, SubtitleDisplayMode, TransitionType, SubtitleFormat, FilterEffectType, ControlCardStyle } from './types';
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
    const [subtitleFormat, setSubtitleFormat] = useState<SubtitleFormat>(SubtitleFormat.BRACKET);
    
    // Lyrics Display State (測試中)
    const [showLyricsDisplay, setShowLyricsDisplay] = useState<boolean>(false);
    const [lyricsFontSize, setLyricsFontSize] = useState<number>(2); // 字體大小百分比
    const [lyricsFontFamily, setLyricsFontFamily] = useState<FontType>(FontType.POPPINS); // 捲軸字幕字體
    const [lyricsPositionX, setLyricsPositionX] = useState<number>(0); // 水平位置偏移 (-50 到 50)
    const [lyricsPositionY, setLyricsPositionY] = useState<number>(0); // 垂直位置偏移 (-50 到 50)
    
    // 字幕拖曳位置狀態
    const [subtitleDragOffset, setSubtitleDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    const [lyricsDragOffset, setLyricsDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
    
    // 可視化拖曳和大小調整狀態
    const [visualizationTransform, setVisualizationTransform] = useState<{
        x: number;
        y: number;
        scale: number;
    }>({ x: 0, y: 0, scale: 1.0 });
    
    // 可視化大小控制
    const [visualizationScale, setVisualizationScale] = useState<number>(1.0);
    
    // CTA 動畫控制
    const [showCtaAnimation, setShowCtaAnimation] = useState<boolean>(false);
    const [ctaChannelName, setCtaChannelName] = useState<string>('口袋裡的貓');
    const [ctaPosition, setCtaPosition] = useState<{ x: number; y: number }>({ x: 50, y: 50 }); // 百分比位置
    
    // 幾何圖形可視化狀態
    const [showGeometricControls, setShowGeometricControls] = useState<boolean>(false); // 幾何圖形控制面板
    const [geometricFrameImage, setGeometricFrameImage] = useState<string | null>(null); // 方框圖片
    const [geometricSemicircleImage, setGeometricSemicircleImage] = useState<string | null>(null); // 半圓圖片
    const [geometricSongName, setGeometricSongName] = useState<string>(''); // 歌曲名稱
    const [geometricArtistName, setGeometricArtistName] = useState<string>(''); // 歌手名稱
    
    // Z總訂製款可視化狀態
    const [showZCustomControls, setShowZCustomControls] = useState<boolean>(false); // Z總訂製款控制面板
    const [zCustomCenterImage, setZCustomCenterImage] = useState<string | null>(null); // 中央圖片
    const [zCustomScale, setZCustomScale] = useState<number>(1.0); // Z總訂製款大小
    const [zCustomPosition, setZCustomPosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 }); // Z總訂製款位置
    
    // 全畫面濾鏡特效狀態
    const [filterEffectType, setFilterEffectType] = useState<FilterEffectType>(FilterEffectType.SNOW); // 濾鏡特效類型
    const [filterEffectIntensity, setFilterEffectIntensity] = useState<number>(0.5); // 濾鏡特效強度 (0-1)
    const [filterEffectOpacity, setFilterEffectOpacity] = useState<number>(0.6); // 濾鏡特效透明度 (0-1)
    const [filterEffectSpeed, setFilterEffectSpeed] = useState<number>(1.0); // 濾鏡特效速度 (0.5-2)
    const [filterEffectEnabled, setFilterEffectEnabled] = useState<boolean>(false); // 濾鏡特效開關
    
    // 可夜訂製版控制卡狀態
    const [controlCardEnabled, setControlCardEnabled] = useState<boolean>(true); // 控制卡開關
    const [controlCardFontSize, setControlCardFontSize] = useState<number>(24); // 控制卡字體大小 (24-50px)
    const [controlCardStyle, setControlCardStyle] = useState<ControlCardStyle>(ControlCardStyle.FILLED); // 控制卡樣式
    const [controlCardColor, setControlCardColor] = useState<string>('#ffffff'); // 控制卡顏色
    const [controlCardBackgroundColor, setControlCardBackgroundColor] = useState<string>('rgba(100, 120, 100, 0.9)'); // 控制卡背景顏色
    const [songNameList, setSongNameList] = useState<string[]>([]); // 歌名列表
    const [currentSongIndex, setCurrentSongIndex] = useState<number>(0); // 當前歌曲索引
    const [autoChangeSong, setAutoChangeSong] = useState<boolean>(false); // 自動切換歌曲
    
    const audioRef = useRef<HTMLAudioElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    
    // Picture-in-Picture 相關狀態
    const [isPipSupported, setIsPipSupported] = useState<boolean>(false);
    const [isPipActive, setIsPipActive] = useState<boolean>(false);
    const [pipVideo, setPipVideo] = useState<HTMLVideoElement | null>(null);
    
    const canvasBgColors: Record<BackgroundColorType, string> = {
        [BackgroundColorType.BLACK]: 'rgba(0, 0, 0, 1)',
        [BackgroundColorType.GREEN]: 'rgba(0, 255, 0, 1)',
        [BackgroundColorType.WHITE]: 'rgba(255, 255, 255, 1)',
        [BackgroundColorType.TRANSPARENT]: 'transparent',
    };
    
    // Picture-in-Picture 功能
    useEffect(() => {
        // 檢測 Picture-in-Picture API 支援
        const checkPipSupport = () => {
            const hasPipSupport = 
                'pictureInPictureEnabled' in document ||
                (document as any).pictureInPictureEnabled ||
                ('requestPictureInPicture' in HTMLVideoElement.prototype);
            
            console.log('Picture-in-Picture 支援檢測:', {
                pictureInPictureEnabledInDocument: 'pictureInPictureEnabled' in document,
                documentPictureInPictureEnabled: (document as any).pictureInPictureEnabled,
                requestPictureInPictureInPrototype: 'requestPictureInPicture' in HTMLVideoElement.prototype,
                hasPipSupport
            });
            
            setIsPipSupported(hasPipSupport);
        };
        
        checkPipSupport();
    }, []);
    
    
    const createVideoFromCanvas = useCallback(() => {
        if (!canvasRef.current) return null;
        
        const canvas = canvasRef.current;
        
        // 檢查 Canvas 是否有內容
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;
        
        // 檢查 Canvas 尺寸
        if (canvas.width === 0 || canvas.height === 0) {
            console.warn('Canvas 尺寸為 0，無法創建 Picture-in-Picture');
            alert('Canvas 尺寸異常，請重新載入頁面');
            return null;
        }
        
        console.log('Canvas 尺寸:', canvas.width, 'x', canvas.height);
        
        // 檢查 Canvas 內容 - 改進檢測邏輯
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        let hasContent = false;
        let nonBlackPixels = 0;
        let totalPixels = 0;
        
        // 檢查是否有非黑色像素 - 降低閾值並計算比例
        for (let i = 0; i < pixels.length; i += 4) {
            totalPixels++;
            const r = pixels[i];
            const g = pixels[i + 1];
            const b = pixels[i + 2];
            const alpha = pixels[i + 3];
            
            // 降低閾值到 5，並檢查透明度
            if (alpha > 0 && (r > 5 || g > 5 || b > 5)) {
                nonBlackPixels++;
                if (!hasContent) {
                    hasContent = true;
                }
            }
        }
        
        const contentRatio = totalPixels > 0 ? (nonBlackPixels / totalPixels) : 0;
        console.log(`Canvas 內容統計: ${nonBlackPixels}/${totalPixels} 非黑色像素 (${(contentRatio * 100).toFixed(2)}%)`);
        
        console.log('Canvas 內容檢查結果:', hasContent ? '有內容' : '空內容');
        
        if (!hasContent) {
            console.warn('Canvas 是空的，但繼續嘗試創建 Picture-in-Picture');
            console.log('Canvas 狀態檢查:');
            console.log('- 可視化顯示:', showVisualizer);
            console.log('- 音頻播放:', isPlaying);
            console.log('- 音頻URL:', audioUrl ? '有' : '無');
            console.log('- 可視化類型:', visualizationType);
            console.log('- Canvas 背景色:', canvas.style.backgroundColor);
            console.log('- Canvas 內容樣式:', getComputedStyle(canvas).getPropertyValue('background-color'));
            // 不阻止，讓用戶試試看
        }
        
        // 嘗試不同的捕獲策略
        let stream;
        try {
            stream = canvas.captureStream(30); // 降低到 30fps
        } catch (error) {
            console.warn('captureStream 失敗，嘗試其他方法:', error);
            try {
                stream = canvas.captureStream(); // 使用預設幀率
            } catch (error2) {
                console.error('所有 captureStream 方法都失敗:', error2);
                return null;
            }
        }
        
        const video = document.createElement('video');
        video.srcObject = stream;
        video.autoplay = true;
        video.muted = true;
        video.playsInline = true;
        video.style.width = '100%';
        video.style.height = '100%';
        
        // 添加調試信息
        console.log('Video 元素創建成功:', video);
        console.log('Stream tracks:', stream.getTracks().length);
        stream.getTracks().forEach((track, index) => {
            console.log(`Track ${index}:`, track.kind, track.label, track.enabled);
        });
        
        // 等待 video metadata 載入
        return new Promise((resolve, reject) => {
            video.onloadedmetadata = () => {
                console.log('Video metadata 載入完成');
                resolve(video);
            };
            
            video.onerror = (error) => {
                console.error('Video 載入錯誤:', error);
                reject(error);
            };
            
            // 設置超時
            setTimeout(() => {
                reject(new Error('Video metadata 載入超時'));
            }, 3000);
        });
    }, []);
    
    const createVideoFromCanvasSync = useCallback(() => {
        if (!canvasRef.current) return null;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        if (canvas.width === 0 || canvas.height === 0) {
            console.warn('Canvas 尺寸為 0，無法創建 Picture-in-Picture');
            return null;
        }

        console.log('Canvas 尺寸:', canvas.width, 'x', canvas.height);

        // 檢查 Canvas 內容 - 改進檢測邏輯
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;
        let hasContent = false;
        let nonBlackPixels = 0;
        let totalPixels = 0;
        
        // 採樣檢測：每10個像素檢測一次，提高性能
        for (let i = 0; i < pixels.length; i += 40) { // 每10個像素檢測一次
            totalPixels++;
            const r = pixels[i];
            const g = pixels[i + 1];
            const b = pixels[i + 2];
            const alpha = pixels[i + 3];
            
            // 降低閾值，但增加更嚴格的內容檢測
            if (alpha > 10 && (r > 3 || g > 3 || b > 3)) {
                nonBlackPixels++;
                if (!hasContent) {
                    hasContent = true;
                }
            }
        }
        
        const contentRatio = totalPixels > 0 ? (nonBlackPixels / totalPixels) : 0;
        console.log(`Canvas 內容統計: ${nonBlackPixels}/${totalPixels} 非黑色像素 (${(contentRatio * 100).toFixed(2)}%)`);
        
        // 更嚴格的內容檢測：需要至少 2% 的非黑色像素
        const hasAnyContent = contentRatio > 0.02; // 2% 的閾值
        console.log('Canvas 內容檢查結果:', hasAnyContent ? '有內容' : '內容不足');
        
        if (!hasAnyContent) {
            console.warn('Canvas 內容不足，建議等待更多可視化內容');
            console.log('Canvas 狀態檢查:');
            console.log('- 可視化顯示:', showVisualizer);
            console.log('- 音頻播放:', isPlaying);
            console.log('- 音頻URL:', audioUrl ? '有' : '無');
            console.log('- 可視化類型:', visualizationType);
            console.log('- Canvas 背景色:', canvas.style.backgroundColor);
            console.log('- Canvas 內容樣式:', getComputedStyle(canvas).getPropertyValue('background-color'));
            
            // 如果內容太少，建議用戶等待
            alert('🎨 Canvas 內容不足\n\n當前可視化內容較少，建議：\n1. 等待音頻播放產生更多可視化效果\n2. 確保音頻有足夠的音量\n3. 調整靈敏度設定\n\n稍後再試子母畫面功能。');
            return null;
        }

        // 使用 requestAnimationFrame 確保渲染完成，避免阻塞主線程
        return new Promise((resolve, reject) => {
            const createVideo = () => {
                try {

                    // 捕獲 stream
                    let stream;
                    try {
                        stream = canvas.captureStream(30);
                    } catch (error) {
                        console.warn('captureStream 失敗，嘗試其他方法:', error);
                        try {
                            stream = canvas.captureStream();
                        } catch (error2) {
                            console.error('所有 captureStream 方法都失敗:', error2);
                            reject(new Error('無法捕獲 Canvas 內容'));
                            return;
                        }
                    }

                    const video = document.createElement('video');
                    video.srcObject = stream;
                    video.autoplay = true;
                    video.muted = true;
                    video.playsInline = true;
                    video.style.width = '100%';
                    video.style.height = '100%';

                    console.log('Video 元素創建成功:', video);
                    console.log('Stream tracks:', stream.getTracks().length);

                    // 等待 metadata 載入
                    video.onloadedmetadata = () => {
                        console.log('Video metadata 載入完成');
                        resolve(video);
                    };
                    
                    video.onerror = (error) => {
                        console.error('Video 載入錯誤:', error);
                        reject(error);
                    };
                    
                    // 設置超時
                    setTimeout(() => {
                        reject(new Error('Video metadata 載入超時'));
                    }, 3000);
                } catch (error) {
                    reject(error);
                }
            };

            // 使用 requestAnimationFrame 確保渲染完成
            requestAnimationFrame(() => {
                requestAnimationFrame(createVideo);
            });
        });
    }, [showVisualizer, isPlaying, audioUrl, visualizationType]);
    
    const enterPictureInPicture = useCallback(() => {
        if (!isPipSupported) {
            alert('❌ 子母畫面功能不支援\n\n您的瀏覽器不支援子母畫面功能。\n請使用 Chrome、Edge 或 Safari 最新版本。');
            return;
        }
        
        if (!audioUrl) {
            alert('🎵 請先上傳音樂\n\n子母畫面需要音樂才能顯示可視化效果。\n請先選擇一個音頻檔案。');
            return;
        }
        
        if (!isPlaying) {
            alert('▶️ 請先播放音樂\n\n子母畫面需要正在播放的音樂才能顯示動畫。\n請點擊播放按鈕開始播放。');
            return;
        }
        
        // 檢查可視化是否正在顯示
        if (!showVisualizer) {
            alert('🎨 請開啟可視化\n\n子母畫面需要顯示可視化效果。\n請確保「顯示可視化」開關已開啟。');
            return;
        }
        
        // 添加延遲等待，讓可視化有時間產生內容
        console.log('等待可視化內容生成...');
        setTimeout(() => {
            console.log('開始創建子母畫面...');
        }, 1000);
        
        try {
            // 等待 video metadata 載入後再調用 PiP
            createVideoFromCanvasSync().then((video) => {
                if (!video) return;
                
                setPipVideo(video as HTMLVideoElement);
                
                console.log('正在進入子母畫面...');
                // 現在可以安全調用 PiP
                (video as HTMLVideoElement).requestPictureInPicture().then(() => {
                    setIsPipActive(true);
                    console.log('子母畫面啟動成功');
                    
                    // 監聽 PiP 關閉事件
                    (video as HTMLVideoElement).addEventListener('leavepictureinpicture', () => {
                        setIsPipActive(false);
                        setPipVideo(null);
                    });
                }).catch((error) => {
                    console.error('進入子母畫面失敗:', error);
                    alert(`🚫 子母畫面啟動失敗\n\n錯誤：${error.message}\n\n請檢查：\n1. 音樂正在播放\n2. 可視化效果已開啟\n3. 瀏覽器支援子母畫面功能\n\n如果問題持續，請重新載入頁面再試。`);
                });
            }).catch((error) => {
                console.error('創建 Video 元素失敗:', error);
                alert(`🎥 視訊元素創建失敗\n\n錯誤：${error.message}\n\n請確保：\n1. 可視化效果正在顯示\n2. 音樂正在播放\n3. 瀏覽器支援 Canvas 捕獲功能`);
            });
            
        } catch (error) {
            console.error('子母畫面初始化失敗:', error);
            alert(`⚙️ 子母畫面初始化失敗\n\n錯誤：${error.message}\n\n請重新載入頁面後再試。`);
        }
    }, [isPipSupported, audioUrl, isPlaying, showVisualizer]);
    
    const exitPictureInPicture = useCallback(async () => {
        if (pipVideo && document.pictureInPictureElement) {
            try {
                await document.exitPictureInPicture();
                setIsPipActive(false);
                setPipVideo(null);
                console.log('子母畫面已關閉');
            } catch (error) {
                console.error('退出子母畫面失敗:', error);
                // 嘗試強制關閉
                try {
                    if (pipVideo) {
                        pipVideo.remove();
                        setPipVideo(null);
                        setIsPipActive(false);
                    }
                } catch (cleanupError) {
                    console.error('強制清理失敗:', cleanupError);
                }
            }
        }
    }, [pipVideo]);
    
    // 滾動檢測自動觸發 Picture-in-Picture (已移除 - 瀏覽器安全限制)
    // 注意：瀏覽器要求 PiP 必須由用戶手勢觸發，不能自動觸發
    
    useEffect(() => {
        const lines = subtitlesRawText.split('\n');
        const newSubtitles: Subtitle[] = [];

        if (subtitleFormat === SubtitleFormat.BRACKET) {
            // 解析 [00:00.00] 格式
            const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2})\]/;
            lines.forEach(line => {
                const match = line.match(timeRegex);
                if (match) {
                    const minutes = parseInt(match[1], 10);
                    const seconds = parseInt(match[2], 10);
                    const centiseconds = parseInt(match[3], 10);
                    const time = minutes * 60 + seconds + centiseconds / 100;
                    const text = line.replace(timeRegex, '').trim();
                    if (text) {
                        // 先不設定 endTime，稍後統一計算
                        newSubtitles.push({ time, text });
                    }
                }
            });
            
            // 為方括號格式計算 endTime：持續到下一句開始前，或預設 10 秒
            newSubtitles.forEach((subtitle, index) => {
                if (index < newSubtitles.length - 1) {
                    // 不是最後一句：endTime 設為下一句的開始時間（保持到下一句出現前）
                    subtitle.endTime = newSubtitles[index + 1].time;
                } else {
                    // 最後一句：預設顯示 10 秒
                    subtitle.endTime = subtitle.time + 10;
                }
            });
        } else if (subtitleFormat === SubtitleFormat.SRT) {
            // 解析 SRT 格式 00:00:14,676 --> 00:00:19,347
            const srtTimeRegex = /^(\d{1,2}):(\d{1,2}):(\d{1,2}),(\d{1,3})\s*-->\s*(\d{1,2}):(\d{1,2}):(\d{1,2}),(\d{1,3})$/;
            
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                if (!line) continue;
                
                const match = line.match(srtTimeRegex);
                if (match) {
                    // 開始時間
                    const startHours = parseInt(match[1], 10);
                    const startMinutes = parseInt(match[2], 10);
                    const startSeconds = parseInt(match[3], 10);
                    const startMilliseconds = parseInt(match[4], 10);
                    const time = startHours * 3600 + startMinutes * 60 + startSeconds + startMilliseconds / 1000;
                    
                    // 結束時間
                    const endHours = parseInt(match[5], 10);
                    const endMinutes = parseInt(match[6], 10);
                    const endSeconds = parseInt(match[7], 10);
                    const endMilliseconds = parseInt(match[8], 10);
                    const endTime = endHours * 3600 + endMinutes * 60 + endSeconds + endMilliseconds / 1000;
                    
                    // 下一行是文字
                    if (i + 1 < lines.length) {
                        const text = lines[i + 1].trim();
                        if (text) {
                            newSubtitles.push({ time, text, endTime });
                            i++; // 跳過文字行
                        }
                    }
                }
            }
        }
        
        setSubtitles(newSubtitles.sort((a, b) => a.time - b.time));
    }, [subtitlesRawText, subtitleFormat]);

    // 基於時間戳的自動切換歌曲邏輯
    useEffect(() => {
        if (!autoChangeSong || !audioRef.current || songNameList.length === 0) return;

        const audio = audioRef.current;
        let lastSongIndex = -1; // 記錄上次切換的歌名索引

        const handleTimeUpdate = () => {
            const currentTime = audio.currentTime;
            
            // 如果使用時間戳模式，從字幕中提取時間和歌名
            if (subtitles.length > 0) {
                // 找到當前時間對應的字幕
                let currentSubtitleIndex = -1;
                for (let i = 0; i < subtitles.length; i++) {
                    const subtitle = subtitles[i];
                    if (currentTime >= subtitle.time && currentTime < (subtitle.endTime || subtitle.time + 5)) {
                        currentSubtitleIndex = i;
                        break;
                    }
                }
                
                // 如果找到了對應的字幕且與上次不同，則切換歌名
                if (currentSubtitleIndex !== -1 && currentSubtitleIndex !== lastSongIndex) {
                    lastSongIndex = currentSubtitleIndex;
                    setGeometricSongName(subtitles[currentSubtitleIndex].text);
                }
            } else {
                // 備用邏輯：當沒有字幕時，使用原來的95%切換邏輯
                const duration = audio.duration;
                if (currentTime >= duration * 0.95) {
                    const nextIndex = (currentSongIndex + 1) % songNameList.length;
                    setCurrentSongIndex(nextIndex);
                    setGeometricSongName(songNameList[nextIndex]);
                }
            }
        };

        audio.addEventListener('timeupdate', handleTimeUpdate);
        return () => audio.removeEventListener('timeupdate', handleTimeUpdate);
    }, [autoChangeSong, subtitles, currentSongIndex, songNameList]);

    // 初始化歌名列表（從字幕中提取）
    useEffect(() => {
        if (subtitles.length > 0) {
            const songNames = subtitles
                .map(subtitle => subtitle.text)
                .filter(text => text.length > 0)
                .slice(0, 10); // 最多取前10個作為歌名列表
            
            if (songNames.length > 0) {
                setSongNameList(songNames);
                if (songNames.length > currentSongIndex) {
                    setGeometricSongName(songNames[currentSongIndex]);
                }
            }
        }
    }, [subtitles]);

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
        
        // 調試信息
        console.log("API Key 狀態:", {
            hasApiKey: !!apiKey,
            apiKeyLength: apiKey ? apiKey.length : 0,
            apiKeyPrefix: apiKey ? apiKey.substring(0, 10) + "..." : "無",
            envKeys: Object.keys((import.meta as any).env || {})
        });

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

            const ai = new GoogleGenerativeAI(apiKey);
            
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
            
            const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });
            
            const response = await model.generateContent([textPart, audioPart]);
            const result = await response.response;
            const text = result.text();

            setSubtitlesRawText(text.trim());

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

    // 幾何圖形圖片處理函數
    const handleGeometricFrameImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setGeometricFrameImage(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGeometricSemicircleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setGeometricSemicircleImage(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const clearGeometricFrameImage = () => {
        setGeometricFrameImage(null);
    };

    const clearGeometricSemicircleImage = () => {
        setGeometricSemicircleImage(null);
    };

    // Z總訂製款圖片處理函數
    const handleZCustomCenterImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setZCustomCenterImage(url);
        }
    };

    const clearZCustomCenterImage = () => {
        if (zCustomCenterImage) {
            URL.revokeObjectURL(zCustomCenterImage);
        }
        setZCustomCenterImage(null);
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
        <ModalProvider>
            <div className="flex flex-col">
                <UnifiedHeader />
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

            <main className="flex flex-col p-4 overflow-y-auto pt-24">
                <div className="w-full max-w-7xl mx-auto flex flex-col items-center gap-4">
                    {/* 頁面標題 */}
                    <div className="text-center mb-6">
                        <h1 className="text-3xl font-bold text-white mb-2">音訊可視化工程</h1>
                        <p className="text-gray-300">將音樂轉化為震撼的視覺效果</p>
                    </div>
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
                                    lyricsFontFamily={lyricsFontFamily}
                                    lyricsPositionX={lyricsPositionX}
                                    lyricsPositionY={lyricsPositionY}
                                    subtitleDisplayMode={subtitleDisplayMode}
                                    disableVisualizer={!showVisualizer}
                                    subtitleDragOffset={subtitleDragOffset}
                                    lyricsDragOffset={lyricsDragOffset}
                                    onSubtitleDragUpdate={setSubtitleDragOffset}
                                    onLyricsDragUpdate={setLyricsDragOffset}
                                    visualizationTransform={visualizationTransform}
                                    onVisualizationTransformUpdate={setVisualizationTransform}
                                    visualizationScale={visualizationScale}
                                    onVisualizationScaleChange={setVisualizationScale}
                                    showCtaAnimation={showCtaAnimation}
                                    ctaChannelName={ctaChannelName}
                                    ctaPosition={ctaPosition}
                                    onCtaPositionUpdate={setCtaPosition}
                                    zCustomCenterImage={zCustomCenterImage}
                                    zCustomScale={zCustomScale}
                                    zCustomPosition={zCustomPosition}
                                    onZCustomPositionUpdate={setZCustomPosition}
                                    geometricFrameImage={geometricFrameImage}
                                    geometricSemicircleImage={geometricSemicircleImage}
                                    geometricSongName={geometricSongName}
                                    geometricArtistName={geometricArtistName}
                                    // Filter Effects props
                                    filterEffectType={filterEffectType}
                                    filterEffectIntensity={filterEffectIntensity}
                                    filterEffectOpacity={filterEffectOpacity}
                                    filterEffectSpeed={filterEffectSpeed}
                                    filterEffectEnabled={filterEffectEnabled}
                                    // Control Card props
                                    controlCardEnabled={controlCardEnabled}
                                    controlCardFontSize={controlCardFontSize}
                                    controlCardStyle={controlCardStyle}
                                    controlCardColor={controlCardColor}
                                    controlCardBackgroundColor={controlCardBackgroundColor}
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
                            subtitleFormat={subtitleFormat}
                            onSubtitleFormatChange={setSubtitleFormat}
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
                            lyricsFontFamily={lyricsFontFamily}
                            onLyricsFontFamilyChange={setLyricsFontFamily}
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
                            showGeometricControls={showGeometricControls}
                            onShowGeometricControlsChange={setShowGeometricControls}
                            geometricFrameImage={geometricFrameImage}
                            onGeometricFrameImageUpload={handleGeometricFrameImageUpload}
                            onClearGeometricFrameImage={clearGeometricFrameImage}
                            geometricSemicircleImage={geometricSemicircleImage}
                            onGeometricSemicircleImageUpload={handleGeometricSemicircleImageUpload}
                            onClearGeometricSemicircleImage={clearGeometricSemicircleImage}
                            geometricSongName={geometricSongName}
                            onGeometricSongNameChange={setGeometricSongName}
                            geometricArtistName={geometricArtistName}
                            onGeometricArtistNameChange={setGeometricArtistName}
                            visualizationScale={visualizationScale}
                            onVisualizationScaleChange={setVisualizationScale}
                            showCtaAnimation={showCtaAnimation}
                            onShowCtaAnimationChange={setShowCtaAnimation}
                            ctaChannelName={ctaChannelName}
                            onCtaChannelNameChange={setCtaChannelName}
                            showZCustomControls={showZCustomControls}
                            onShowZCustomControlsChange={setShowZCustomControls}
                            zCustomCenterImage={zCustomCenterImage}
                            onZCustomCenterImageUpload={handleZCustomCenterImageUpload}
                            onClearZCustomCenterImage={clearZCustomCenterImage}
                            zCustomScale={zCustomScale}
                            onZCustomScaleChange={setZCustomScale}
                            zCustomPosition={zCustomPosition}
                            onZCustomPositionUpdate={setZCustomPosition}
                            // Filter Effects props
                            filterEffectType={filterEffectType}
                            onFilterEffectTypeChange={setFilterEffectType}
                            filterEffectIntensity={filterEffectIntensity}
                            onFilterEffectIntensityChange={setFilterEffectIntensity}
                            filterEffectOpacity={filterEffectOpacity}
                            onFilterEffectOpacityChange={setFilterEffectOpacity}
                            filterEffectSpeed={filterEffectSpeed}
                            onFilterEffectSpeedChange={setFilterEffectSpeed}
                            filterEffectEnabled={filterEffectEnabled}
                            onFilterEffectEnabledChange={setFilterEffectEnabled}
                            // Control Card props
                            controlCardEnabled={controlCardEnabled}
                            onControlCardEnabledChange={setControlCardEnabled}
                            controlCardFontSize={controlCardFontSize}
                            onControlCardFontSizeChange={setControlCardFontSize}
                            controlCardStyle={controlCardStyle}
                            onControlCardStyleChange={setControlCardStyle}
                            controlCardColor={controlCardColor}
                            onControlCardColorChange={setControlCardColor}
                            controlCardBackgroundColor={controlCardBackgroundColor}
                            onControlCardBackgroundColorChange={setControlCardBackgroundColor}
                            songNameList={songNameList}
                            onSongNameListChange={setSongNameList}
                            autoChangeSong={autoChangeSong}
                            onAutoChangeSongChange={setAutoChangeSong}
                            // Picture-in-Picture props
                            isPipSupported={isPipSupported}
                            isPipActive={isPipActive}
                            onEnterPictureInPicture={enterPictureInPicture}
                            onExitPictureInPicture={exitPictureInPicture}
                        />
                    </div>
            </main>
            
            {/* 統一的 Footer */}
            <UnifiedFooter />
        </div>
    </ModalProvider>
    );
}

export default App;