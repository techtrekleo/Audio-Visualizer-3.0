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
import ApiKeyModal from './components/ApiKeyModal';
import { UnifiedHeader } from './components/UnifiedLayout';
// import { UnifiedFooter, ModalProvider } from '../shared-components/dist';
// import AdManager from './components/AdManager';
// import PopupAdManager from './components/PopupAdManager';
import { useAudioAnalysis } from './hooks/useAudioAnalysis';
import { useMediaRecorder } from './hooks/useMediaRecorder';
import { VisualizationType, FontType, BackgroundColorType, ColorPaletteType, Palette, Resolution, GraphicEffectType, WatermarkPosition, Subtitle, SubtitleBgStyle, SubtitleDisplayMode, TransitionType, SubtitleFormat, SubtitleLanguage, SubtitleOrientation, FilterEffectType, ControlCardStyle, CustomTextOverlay, MultiEffectTransform } from './types';
import { ICON_PATHS, COLOR_PALETTES, RESOLUTION_MAP } from './constants';
import FilterEffectsDemo from './src/components/FilterEffectsDemo';

// 測試模式切換 - 在 URL 中加入 ?test=filter 來啟用濾鏡測試
const isFilterTestMode = window.location.search.includes('test=filter');

function App() {
    // 如果是濾鏡測試模式，直接顯示濾鏡測試組件
    if (isFilterTestMode) {
        return (
            <div style={{ width: '100vw', height: '100vh' }}>
                <FilterEffectsDemo />
                <div style={{
                    position: 'absolute',
                    top: '10px',
                    right: '10px',
                    background: 'rgba(0, 0, 0, 0.8)',
                    color: 'white',
                    padding: '10px',
                    borderRadius: '5px',
                    zIndex: 1000
                }}>
                    <a href="/audio-visualizer/" style={{ color: '#4ecdc4', textDecoration: 'none' }}>
                        ← 返回主頁
                    </a>
                </div>
            </div>
        );
    }
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [audioUrl, setAudioUrl] = useState<string>('');
    const [audioDuration, setAudioDuration] = useState<number>(0);
    const [currentTime, setCurrentTime] = useState<number>(0);
    const [videoUrl, setVideoUrl] = useState<string>('');
    const [videoExtension, setVideoExtension] = useState<string>('webm');
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [visualizationType, setVisualizationType] = useState<VisualizationType>(VisualizationType.MONSTERCAT);
    // Multi-visualization (composite) mode
    const [multiEffectEnabled, setMultiEffectEnabled] = useState<boolean>(false);
    const [selectedVisualizationTypes, setSelectedVisualizationTypes] = useState<VisualizationType[]>([VisualizationType.MONSTERCAT]);
    const [multiEffectOffsets, setMultiEffectOffsets] = useState<Partial<Record<VisualizationType, { x: number; y: number }>>>({});
    const [multiEffectTransforms, setMultiEffectTransforms] = useState<Partial<Record<VisualizationType, MultiEffectTransform>>>({});
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [customTextOverlays, setCustomTextOverlays] = useState<CustomTextOverlay[]>(() => ([
        {
            enabled: true,
            text: 'Sonic Pulse',
            color: '#67E8F9',
            strokeColor: '#000000',
            fontFamily: FontType.ROCKNROLL_ONE,
            graphicEffect: GraphicEffectType.NEON,
            textSize: 4,
            textPositionX: 0,
            textPositionY: 0,
            rotationDeg: 0,
            anchor: WatermarkPosition.BOTTOM_RIGHT,
        },
        {
            enabled: false,
            text: '',
            color: '#FFFFFF',
            strokeColor: '#000000',
            fontFamily: FontType.POPPINS,
            graphicEffect: GraphicEffectType.NONE,
            textSize: 4,
            textPositionX: 0,
            textPositionY: 0,
            rotationDeg: 0,
            anchor: WatermarkPosition.CENTER,
        },
        {
            enabled: false,
            text: '',
            color: '#FFFFFF',
            strokeColor: '#000000',
            fontFamily: FontType.POPPINS,
            graphicEffect: GraphicEffectType.NONE,
            textSize: 4,
            textPositionX: 0,
            textPositionY: 0,
            rotationDeg: 0,
            anchor: WatermarkPosition.CENTER,
        },
    ]));
    const [sensitivity, setSensitivity] = useState<number>(1.0);
    const [smoothing, setSmoothing] = useState<number>(0);
    const [equalization, setEqualization] = useState<number>(0.25);
    const [showWarning, setShowWarning] = useState<boolean>(false);
    const [backgroundColor, setBackgroundColor] = useState<BackgroundColorType>(BackgroundColorType.BLACK);
    const [colorPalette, setColorPalette] = useState<ColorPaletteType>(ColorPaletteType.DEFAULT);
    // 自選色彩狀態
    const [customPrimaryColor, setCustomPrimaryColor] = useState<string>('#67E8F9');
    const [customSecondaryColor, setCustomSecondaryColor] = useState<string>('#F472B6');
    const [customAccentColor, setCustomAccentColor] = useState<string>('#FFFFFF');
    const [resolution, setResolution] = useState<Resolution>(Resolution.P1080);
    const [backgroundImage, setBackgroundImage] = useState<string | null>(null);
    const [backgroundImages, setBackgroundImages] = useState<string[]>([]); // 多張背景圖片
    const [currentImageIndex, setCurrentImageIndex] = useState<number>(0); // 當前圖片索引
    const [isSlideshowEnabled, setIsSlideshowEnabled] = useState<boolean>(false); // 輪播開關
    const [slideshowInterval, setSlideshowInterval] = useState<number>(15); // 輪播間隔（秒）
    const [isTransitioning, setIsTransitioning] = useState<boolean>(false); // 是否正在過場
    const [transitionType, setTransitionType] = useState<TransitionType>(TransitionType.TV_STATIC); // 轉場效果類型
    const [backgroundVideo, setBackgroundVideo] = useState<string | null>(null); // 背景影片
    const updateCustomTextOverlay = useCallback((index: number, patch: Partial<CustomTextOverlay>) => {
        setCustomTextOverlays(prev => {
            const next = [...prev];
            // Ensure we always have 3 overlays
            while (next.length < 3) {
                next.push({
                    enabled: false,
                    text: '',
                    color: '#FFFFFF',
                    strokeColor: '#000000',
                    fontFamily: FontType.POPPINS,
                    graphicEffect: GraphicEffectType.NONE,
                    textSize: 4,
                    textPositionX: 0,
                    textPositionY: 0,
                    rotationDeg: 0,
                    anchor: WatermarkPosition.CENTER,
                });
            }
            next[index] = { ...next[index], ...patch };
            return next.slice(0, 3);
        });
    }, []);
    const [waveformStroke, setWaveformStroke] = useState<boolean>(true);
    // Toggles
    const [showVisualizer, setShowVisualizer] = useState<boolean>(true);
    const [showBackgroundImage, setShowBackgroundImage] = useState<boolean>(true);

    // Effect Transform State
    const [effectScale, setEffectScale] = useState<number>(1.0);
    const [effectOffsetX, setEffectOffsetX] = useState<number>(0);
    const [effectOffsetY, setEffectOffsetY] = useState<number>(0);
    const [effectRotation, setEffectRotation] = useState<number>(0); // degrees

    // Subtitle State
    const [subtitles, setSubtitles] = useState<Subtitle[]>([]);
    const [subtitlesRawText, setSubtitlesRawText] = useState<string>('');
    const [isGeneratingSubtitles, setIsGeneratingSubtitles] = useState<boolean>(false);
    const [showSubtitles, setShowSubtitles] = useState<boolean>(true);
    const [subtitleFontSize, setSubtitleFontSize] = useState<number>(4); // Relative vw unit
    const [subtitleFontFamily, setSubtitleFontFamily] = useState<FontType>(FontType.POPPINS);
    const [subtitleColor, setSubtitleColor] = useState<string>('#FFFFFF'); // 字幕顏色預設為白色
    const [subtitleStrokeColor, setSubtitleStrokeColor] = useState<string>('#000000'); // 字幕描邊顏色預設為黑色
    const [subtitleEffect, setSubtitleEffect] = useState<GraphicEffectType>(GraphicEffectType.NONE);
    const [subtitleBgStyle, setSubtitleBgStyle] = useState<SubtitleBgStyle>(SubtitleBgStyle.TRANSPARENT);
    const [subtitleDisplayMode, setSubtitleDisplayMode] = useState<SubtitleDisplayMode>(SubtitleDisplayMode.CLASSIC);
    // Fade subtitles with top/bottom lines
    const [subtitleFadeInSeconds, setSubtitleFadeInSeconds] = useState<number>(0.25);
    const [subtitleFadeOutSeconds, setSubtitleFadeOutSeconds] = useState<number>(0.25);
    const [subtitleFadeLinesEnabled, setSubtitleFadeLinesEnabled] = useState<boolean>(true);
    const [subtitleLineColor, setSubtitleLineColor] = useState<string>('#FFFFFF');
    const [subtitleLineThickness, setSubtitleLineThickness] = useState<number>(3);
    const [subtitleLineGap, setSubtitleLineGap] = useState<number>(10);
    const [subtitleFormat, setSubtitleFormat] = useState<SubtitleFormat>(SubtitleFormat.BRACKET);
    const [subtitleLanguage, setSubtitleLanguage] = useState<SubtitleLanguage>(SubtitleLanguage.CHINESE);
    const [subtitleOrientation, setSubtitleOrientation] = useState<SubtitleOrientation>(() => SubtitleOrientation.HORIZONTAL);
    // 字幕位置控制
    const [verticalSubtitlePosition, setVerticalSubtitlePosition] = useState<number>(1); // 直式字幕水平位置 0.0 = 左側, 1.0 = 右側，預設更靠近右邊
    const [horizontalSubtitlePosition, setHorizontalSubtitlePosition] = useState<number>(0.5); // 橫式字幕水平位置 0.0 = 左側, 1.0 = 右側
    const [verticalSubtitleVerticalPosition, setVerticalSubtitleVerticalPosition] = useState<number>(0.5); // 直式字幕垂直位置 0.0 = 上方, 1.0 = 下方
    const [horizontalSubtitleVerticalPosition, setHorizontalSubtitleVerticalPosition] = useState<number>(1.2); // 橫式字幕垂直位置 0.0 = 上方, 1.0 = 下方，預設更接近底部
    // Vinyl Record 圖片
    const [vinylImage, setVinylImage] = useState<string | null>(null);
    const [vinylLayoutMode, setVinylLayoutMode] = useState<'horizontal' | 'vertical'>('horizontal');
    const [vinylCenterFixed, setVinylCenterFixed] = useState<boolean>(false); // 中心照片固定
    const [vinylRecordEnabled, setVinylRecordEnabled] = useState<boolean>(true); // 唱片開關
    const [vinylNeedleEnabled, setVinylNeedleEnabled] = useState<boolean>(true); // 唱片指針開關
    
    // Chinese Control Card State
    const [chineseCardAlbumImage, setChineseCardAlbumImage] = useState<string | null>(null);
    const [chineseCardSongTitle, setChineseCardSongTitle] = useState<string>('憶新愁');
    const [chineseCardArtist, setChineseCardArtist] = useState<string>('張福樂');
    const [chineseCardFontFamily, setChineseCardFontFamily] = useState<FontType>(FontType.POPPINS);
    
    // Photo Shake State
    const [photoShakeImage, setPhotoShakeImage] = useState<string | null>(null);
    const [photoShakeSongTitle, setPhotoShakeSongTitle] = useState<string>('歌曲名稱');
    const [photoShakeSubtitle, setPhotoShakeSubtitle] = useState<string>('副標題');
    const [photoShakeFontFamily, setPhotoShakeFontFamily] = useState<FontType>(FontType.POPPINS);
    const [photoShakeOverlayOpacity, setPhotoShakeOverlayOpacity] = useState<number>(0);
    const [photoShakeFontSize, setPhotoShakeFontSize] = useState<number>(60);
    const [photoShakeDecaySpeed, setPhotoShakeDecaySpeed] = useState<number>(0.95);
    
    // Circular Wave State (圓形波形)
    const [circularWaveImage, setCircularWaveImage] = useState<string | null>(null);
    
    // Blurred Edge State (邊緣虛化)
    const [blurredEdgeSinger, setBlurredEdgeSinger] = useState<string>('');
    const [blurredEdgeSongTitle, setBlurredEdgeSongTitle] = useState<string>('');
    const [blurredEdgeFontFamily, setBlurredEdgeFontFamily] = useState<FontType>(FontType.POPPINS);
    const [blurredEdgeTextColor, setBlurredEdgeTextColor] = useState<string>('#FFFFFF');
    const [blurredEdgeBgOpacity, setBlurredEdgeBgOpacity] = useState<number>(0.5);
    const [blurredEdgeFontSize, setBlurredEdgeFontSize] = useState<number>(40);
    
    // Ke Ye Custom V2 State (可夜訂製版二號)
    const [keYeCustomV2BoxOpacity, setKeYeCustomV2BoxOpacity] = useState<number>(0.5);
    const [keYeCustomV2BoxColor, setKeYeCustomV2BoxColor] = useState<string>('#FFFFFF');
    const [keYeCustomV2VisualizerColor, setKeYeCustomV2VisualizerColor] = useState<string>('#FFFFFF');
    const [keYeCustomV2Text1, setKeYeCustomV2Text1] = useState<string>('');
    const [keYeCustomV2Text2, setKeYeCustomV2Text2] = useState<string>('');
    const [keYeCustomV2Text1Font, setKeYeCustomV2Text1Font] = useState<FontType>(FontType.POPPINS);
    const [keYeCustomV2Text2Font, setKeYeCustomV2Text2Font] = useState<FontType>(FontType.POPPINS);
    const [keYeCustomV2Text1Size, setKeYeCustomV2Text1Size] = useState<number>(40);
    const [keYeCustomV2Text2Size, setKeYeCustomV2Text2Size] = useState<number>(30);
    const [keYeCustomV2Text1Color, setKeYeCustomV2Text1Color] = useState<string>('#000000');
    const [keYeCustomV2Text2Color, setKeYeCustomV2Text2Color] = useState<string>('#000000');
    const [keYeCustomV2Text1Effect, setKeYeCustomV2Text1Effect] = useState<GraphicEffectType>(GraphicEffectType.NONE);
    const [keYeCustomV2Text2Effect, setKeYeCustomV2Text2Effect] = useState<GraphicEffectType>(GraphicEffectType.NONE);
    const [keYeCustomV2Text1StrokeColor, setKeYeCustomV2Text1StrokeColor] = useState<string>('#FFFFFF');
    const [keYeCustomV2Text2StrokeColor, setKeYeCustomV2Text2StrokeColor] = useState<string>('#FFFFFF');
    
  // Bass Enhancement State (重低音強化)
  const [bassEnhancementBlurIntensity, setBassEnhancementBlurIntensity] = useState<number>(0.5);
  const [bassEnhancementCurveIntensity, setBassEnhancementCurveIntensity] = useState<number>(1.0);
  const [bassEnhancementText, setBassEnhancementText] = useState<string>('');
  const [bassEnhancementTextColor, setBassEnhancementTextColor] = useState<string>('#FFFFFF');
  const [bassEnhancementTextFont, setBassEnhancementTextFont] = useState<FontType>(FontType.POPPINS);
  const [bassEnhancementTextSize, setBassEnhancementTextSize] = useState<number>(4.0);
  const [bassEnhancementTextBgOpacity, setBassEnhancementTextBgOpacity] = useState<number>(0.5);
  // Frame Pixelation State (方框像素化)
  const [bassEnhancementCenterOpacity, setBassEnhancementCenterOpacity] = useState<number>(0.3);
    
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
    const [ctaFontFamily, setCtaFontFamily] = useState<FontType>(FontType.POPPINS); // CTA 字體
    const [ctaTextColor, setCtaTextColor] = useState<string>('#FFFFFF');
    const [ctaStrokeColor, setCtaStrokeColor] = useState<string>('#000000');
    const [ctaTextEffect, setCtaTextEffect] = useState<GraphicEffectType>(GraphicEffectType.NONE);
    const [ctaPositionX, setCtaPositionX] = useState<number>(50); // CTA 水平位置 (0-100)
    const [ctaPositionY, setCtaPositionY] = useState<number>(50); // CTA 垂直位置 (0-100)
    // CTA Video (user-uploaded)
    const [ctaVideoUrl, setCtaVideoUrl] = useState<string | null>(null);
    const [ctaVideoFileName, setCtaVideoFileName] = useState<string>('');
    const [ctaVideoEnabled, setCtaVideoEnabled] = useState<boolean>(false);
    const [ctaVideoIncludeAudio, setCtaVideoIncludeAudio] = useState<boolean>(false);
    const [ctaVideoReplaceCtaAnimation, setCtaVideoReplaceCtaAnimation] = useState<boolean>(false);
    const ctaVideoRef = useRef<HTMLVideoElement | null>(null);

    const { analyser, initializeAudio, isAudioInitialized, getAudioStream, resetAudioAnalysis, setAuxMediaElement } = useAudioAnalysis();

    // 開場文字動畫（Intro Overlay）
    const [showIntroOverlay, setShowIntroOverlay] = useState<boolean>(false);
    const [introTitle, setIntroTitle] = useState<string>('');
    const [introArtist, setIntroArtist] = useState<string>('');
    const [introDescription, setIntroDescription] = useState<string>('');
    const [introFontFamily, setIntroFontFamily] = useState<FontType>(FontType.POPPINS);
    const [introEffect, setIntroEffect] = useState<GraphicEffectType>(GraphicEffectType.NEON);
    const [introColor, setIntroColor] = useState<string>('#FFFFFF');
    const [introStrokeColor, setIntroStrokeColor] = useState<string>('#000000');
    const [introTitleSize, setIntroTitleSize] = useState<number>(6); // vw
    const [introArtistSize, setIntroArtistSize] = useState<number>(4); // vw
    const [introDescriptionSize, setIntroDescriptionSize] = useState<number>(2.8); // vw
    const [introFadeIn, setIntroFadeIn] = useState<number>(0.8); // sec
    const [introHold, setIntroHold] = useState<number>(1.6); // sec
    const [introFadeOut, setIntroFadeOut] = useState<number>(0.8); // sec
    const [introBgOpacity, setIntroBgOpacity] = useState<number>(0.35); // 0-1
    const [introPositionX, setIntroPositionX] = useState<number>(50); // 0-100
    const [introPositionY, setIntroPositionY] = useState<number>(50); // 0-100
    const [introStartTime, setIntroStartTime] = useState<number>(0); // seconds in audio timeline
    const [introTriggerId, setIntroTriggerId] = useState<number>(0); // force re-trigger
    const [introLightBarsEnabled, setIntroLightBarsEnabled] = useState<boolean>(true);
    
    // CTA 位置變更處理函數
    const handleCtaPositionXChange = (value: number) => {
        setCtaPositionX(value);
        setCtaPosition(prev => ({ ...prev, x: value }));
    };
    
    const handleCtaPositionYChange = (value: number) => {
        setCtaPositionY(value);
        setCtaPosition(prev => ({ ...prev, y: value }));
    };

    const handleCtaVideoSelect = useCallback((file: File) => {
        if (!file) return;
        const isVideo = file.type.startsWith('video/');
        if (!isVideo) {
            alert('請上傳影片檔案（video/*）。');
            return;
        }
        // Replace existing url
        setCtaVideoUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return URL.createObjectURL(file);
        });
        setCtaVideoFileName(file.name);
        setCtaVideoEnabled(true);
        setCtaVideoReplaceCtaAnimation(true);
    }, []);

    const handleClearCtaVideo = useCallback(() => {
        setCtaVideoUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return null;
        });
        setCtaVideoFileName('');
        setCtaVideoEnabled(false);
        setCtaVideoIncludeAudio(false);
        setCtaVideoReplaceCtaAnimation(false);
        // Ensure aux audio is detached
        setAuxMediaElement(null, false);
    }, [setAuxMediaElement]);

    // When enabling CTA video, restart from 0 and play once (no loop).
    useEffect(() => {
        const el = ctaVideoRef.current;
        if (!el) return;
        if (!ctaVideoUrl || !ctaVideoEnabled) return;
        try {
            // best-effort: restart playback when toggled on
            el.currentTime = 0;
        } catch {
            // ignore
        }
        // Autoplay works reliably when muted; if user includes audio, play may still require gesture.
        el.play().catch(() => {});
    }, [ctaVideoUrl, ctaVideoEnabled]);
    
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
    
    // 鋼琴演奏家透明度
    const [pianoOpacity, setPianoOpacity] = useState<number>(1.0); // 鋼琴透明度 (0-1)

    // Fusion 中間特效透明度（藍+粉紅波形）
    const [fusionCenterOpacity, setFusionCenterOpacity] = useState<number>(1.0); // (0-1)

    // Stellar Core 透明度（核心 / 觸手）
    const [stellarCoreInnerOpacity, setStellarCoreInnerOpacity] = useState<number>(1.0);
    const [stellarCoreTentaclesOpacity, setStellarCoreTentaclesOpacity] = useState<number>(1.0);
    
    // 可夜訂製版控制卡狀態
    const [controlCardEnabled, setControlCardEnabled] = useState<boolean>(true); // 控制卡開關
    const [controlCardFontSize, setControlCardFontSize] = useState<number>(24); // 控制卡字體大小 (24-50px)
    const [controlCardFontFamily, setControlCardFontFamily] = useState<FontType>(FontType.POPPINS); // 控制卡字體
    const [controlCardTextEffect, setControlCardTextEffect] = useState<GraphicEffectType>(GraphicEffectType.NONE); // 控制卡文字特效
    const [controlCardStrokeColor, setControlCardStrokeColor] = useState<string>('#000000'); // 控制卡描邊顏色
    
    
    // API Key 管理狀態
    const [showApiKeyModal, setShowApiKeyModal] = useState<boolean>(false); // 是否顯示 API Key 彈出視窗
    const [userApiKey, setUserApiKey] = useState<string>(''); // 用戶自定義 API Key
    const [apiQuotaExceeded, setApiQuotaExceeded] = useState<boolean>(false); // API 配額是否用完
    const [controlCardStyle, setControlCardStyle] = useState<ControlCardStyle>(ControlCardStyle.FILLED); // 控制卡樣式
    const [controlCardColor, setControlCardColor] = useState<string>('#ffffff'); // 控制卡顏色
    const [controlCardBackgroundColor, setControlCardBackgroundColor] = useState<string>('rgba(0, 0, 0, 0.5)'); // 控制卡背景顏色
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
    
    // 檢查本地存儲的 API Key
    useEffect(() => {
        const storedApiKey = localStorage.getItem('user_gemini_api_key');
        if (storedApiKey) {
            setUserApiKey(storedApiKey);
        }
    }, []);

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
            
            // 更寬鬆的檢測條件，適應不同環境
            if (alpha > 1 && (r > 1 || g > 1 || b > 1)) {
                nonBlackPixels++;
                if (!hasContent) {
                    hasContent = true;
                }
            }
        }
        
        // 額外的調試信息
        console.log('Canvas 調試信息:');
        console.log('- 可視化顯示:', showVisualizer);
        console.log('- 音頻播放:', isPlaying);
        console.log('- 可視化類型:', visualizationType);
        console.log('- Canvas 背景色:', canvas.style.backgroundColor);
        console.log('- Canvas 計算樣式:', getComputedStyle(canvas).getPropertyValue('background-color'));
        console.log('- Canvas 尺寸樣式:', canvas.style.width, 'x', canvas.style.height);
        console.log('- Canvas 實際尺寸:', canvas.width, 'x', canvas.height);
        
        const contentRatio = totalPixels > 0 ? (nonBlackPixels / totalPixels) : 0;
        console.log(`Canvas 內容統計: ${nonBlackPixels}/${totalPixels} 非黑色像素 (${(contentRatio * 100).toFixed(2)}%)`);
        
        // 合理的內容檢測：需要至少 1% 的非黑色像素
        const hasAnyContent = contentRatio > 0.01; // 1% 的閾值
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
            alert(`🎨 Canvas 內容不足 (${(contentRatio * 100).toFixed(2)}%)\n\n當前可視化內容較少，建議：\n1. 等待音頻播放產生更多可視化效果\n2. 確保音頻有足夠的音量\n3. 調整靈敏度設定\n4. 嘗試不同的可視化類型\n\n需要至少 1% 的非黑色像素才能啟動子母畫面。`);
            return null;
        }

        // 使用多重 requestAnimationFrame 確保渲染完成
        return new Promise((resolve, reject) => {
            const createVideo = () => {
                try {
                    // 確保 Canvas 有內容：如果沒有內容，強制繪製一個測試圖形
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                        const pixels = imageData.data;
                        let hasContent = false;
                        
                        // 檢查是否有非透明像素
                        for (let i = 3; i < pixels.length; i += 4) {
                            if (pixels[i] > 0) {
                                hasContent = true;
                                break;
                            }
                        }
                        
                        // 如果沒有內容，繪製一個測試圖形
                        if (!hasContent) {
                            console.log('Canvas 沒有內容，繪製測試圖形');
                            ctx.fillStyle = '#ff0000';
                            ctx.fillRect(10, 10, 100, 100);
                            ctx.fillStyle = '#00ff00';
                            ctx.fillRect(120, 10, 100, 100);
                            ctx.fillStyle = '#0000ff';
                            ctx.fillRect(230, 10, 100, 100);
                        }
                    }
                    
                    // 捕獲 stream
                    let stream;
                    try {
                        // 強制重繪 Canvas 確保內容是最新的
                        const ctx = canvas.getContext('2d');
                        if (ctx) {
                            // 觸發一次重繪
                            ctx.save();
                            ctx.restore();
                        }
                        
                        stream = canvas.captureStream(30);
                        console.log('Stream 捕獲成功:', {
                            videoTracks: stream.getVideoTracks().length,
                            audioTracks: stream.getAudioTracks().length,
                            canvasWidth: canvas.width,
                            canvasHeight: canvas.height
                        });
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
                    
                    // 添加 video 狀態監聽
                    video.addEventListener('loadeddata', () => {
                        console.log('Video loadeddata 事件觸發');
                    });
                    
                    video.addEventListener('canplay', () => {
                        console.log('Video canplay 事件觸發');
                        // 明確調用 play() 確保內容在子母畫面中顯示
                        video.play().then(() => {
                            console.log('Video play() 成功');
                        }).catch((error) => {
                            console.error('Video play() 失敗:', error);
                        });
                    });
                    
                    video.addEventListener('playing', () => {
                        console.log('Video playing 事件觸發');
                    });
                    
                    // 檢查 video 是否真的在播放
                    setTimeout(() => {
                        console.log('Video 狀態檢查:', {
                            readyState: video.readyState,
                            paused: video.paused,
                            currentTime: video.currentTime,
                            duration: video.duration,
                            videoWidth: video.videoWidth,
                            videoHeight: video.videoHeight
                        });
                    }, 1000);

                    // 等待 metadata 載入
                    video.onloadedmetadata = () => {
                        console.log('Video metadata 載入完成');
                        // 確保 video 開始播放
                        video.play().then(() => {
                            console.log('Video metadata 載入後 play() 成功');
                        }).catch((error) => {
                            console.warn('Video metadata 載入後 play() 失敗:', error);
                        });
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

            // 使用三重 requestAnimationFrame 確保渲染完成
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    requestAnimationFrame(createVideo);
                });
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
        
        // 立即創建子母畫面，保持用戶手勢有效性
        console.log('開始創建子母畫面...');
        
        try {
            // 立即調用，保持用戶手勢上下文
            // 使用 async/await 保持用戶手勢上下文
            (async () => {
                try {
                    const video = await createVideoFromCanvasSync();
                    if (!video) return;
                    
                    setPipVideo(video as HTMLVideoElement);
                    
                    console.log('正在進入子母畫面...');
                    
                    // 立即進入子母畫面，不等待任何其他 Promise
                    await (video as HTMLVideoElement).requestPictureInPicture();
                    setIsPipActive(true);
                    console.log('子母畫面啟動成功');
                    
                    // 監聽 PiP 關閉事件
                    (video as HTMLVideoElement).addEventListener('leavepictureinpicture', () => {
                        setIsPipActive(false);
                        setPipVideo(null);
                    });
                } catch (error) {
                    console.error('子母畫面操作失敗:', error);
                    if (error.message.includes('user gesture')) {
                        alert(`🚫 子母畫面啟動失敗\n\n錯誤：用戶手勢已失效\n\n請重新點擊「開啟子母畫面」按鈕。`);
                    } else if (error.message.includes('Video')) {
                        alert(`🎥 視訊元素創建失敗\n\n錯誤：${error.message}\n\n請確保：\n1. 可視化效果正在顯示\n2. 音樂正在播放\n3. 瀏覽器支援 Canvas 捕獲功能`);
                    } else {
                        alert(`🚫 子母畫面啟動失敗\n\n錯誤：${error.message}\n\n請檢查：\n1. 音樂正在播放\n2. 可視化效果已開啟\n3. 瀏覽器支援子母畫面功能\n\n如果問題持續，請重新載入頁面再試。`);
                    }
                }
            })();
                
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
        
        // 優先使用用戶自定義的 API Key，否則使用內建的
        let apiKey = userApiKey || (import.meta as any).env.VITE_API_KEY;
        
        // 調試信息
        console.log("API Key 狀態:", {
            hasUserApiKey: !!userApiKey,
            hasBuiltInApiKey: !!(import.meta as any).env.VITE_API_KEY,
            apiKeyLength: apiKey ? apiKey.length : 0,
            apiKeyPrefix: apiKey ? apiKey.substring(0, 10) + "..." : "無",
            isUsingUserApiKey: !!userApiKey
        });

        if (!apiKey) {
            console.error("No API Key available");
            setShowApiKeyModal(true);
            setApiQuotaExceeded(false);
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

            // 根據選擇的語言生成相應的 AI 提示詞
            const getLanguagePrompt = (language: SubtitleLanguage): string => {
                switch (language) {
                    case SubtitleLanguage.CHINESE:
                        return `你是一位專業的音訊轉錄和歌詞同步專家，專門處理繁體中文內容。

**重要要求：**
1. **語言限制**：所有轉錄內容必須使用繁體中文，絕對不能使用簡體中文
2. **字體規範**：使用標準繁體中文字體，如「臺灣」、「香港」等
3. **標點符號**：使用繁體中文標點符號，如「，」「。」「？」「！」等

**任務說明：**
- 轉錄提供的音訊檔案內容為繁體中文
- 將內容格式化為標準的 LRC 檔案格式
- 每一行都必須有時間戳 \`[mm:ss.xx]\`
- 時間戳必須準確，並在音訊的整個長度內邏輯分佈
- 轉錄內容應清晰、標點符號正確
- 最後一行的時間戳不得超過音訊總長度

**音訊總長度：** ${audioDuration.toFixed(2)} 秒

**回應格式：** 僅回應 LRC 格式的文字，不要添加任何介紹性文字、摘要或說明。`;

                    case SubtitleLanguage.ENGLISH:
                        return `You are a professional audio transcription and lyrics synchronization expert, specializing in English content.

**Important Requirements:**
1. **Language**: All transcription content must be in English
2. **Format**: Use standard English punctuation and grammar
3. **Style**: Maintain natural English flow and rhythm

**Task Description:**
- Transcribe the provided audio file content in English
- Format the content as standard LRC file format
- Each line must have a timestamp \`[mm:ss.xx]\`
- Timestamps must be accurate and logically distributed throughout the audio length
- Transcription should be clear with proper punctuation
- The last line's timestamp must not exceed the total audio length

**Audio Duration:** ${audioDuration.toFixed(2)} seconds

**Response Format:** Only respond with LRC format text, do not add any introductory text, summaries, or explanations.`;

                    case SubtitleLanguage.KOREAN:
                        return `당신은 한국어 콘텐츠 전문 오디오 전사 및 가사 동기화 전문가입니다.

**중요 요구사항:**
1. **언어**: 모든 전사 내용은 한국어로 작성해야 합니다
2. **형식**: 표준 한국어 문장부호와 문법을 사용하세요
3. **스타일**: 자연스러운 한국어 흐름과 리듬을 유지하세요

**작업 설명:**
- 제공된 오디오 파일 내용을 한국어로 전사하세요
- 내용을 표준 LRC 파일 형식으로 포맷하세요
- 각 줄에는 타임스탬프 \`[mm:ss.xx]\`가 있어야 합니다
- 타임스탬프는 정확해야 하며 오디오 길이 전체에 걸쳐 논리적으로 분포되어야 합니다
- 전사 내용은 명확하고 적절한 문장부호를 사용해야 합니다
- 마지막 줄의 타임스탬프는 총 오디오 길이를 초과하지 않아야 합니다

**오디오 길이:** ${audioDuration.toFixed(2)}초

**응답 형식:** LRC 형식의 텍스트만 응답하고, 소개 텍스트, 요약 또는 설명을 추가하지 마세요.`;

                    case SubtitleLanguage.JAPANESE:
                        return `あなたは日本語コンテンツ専門の音声転写・歌詞同期の専門家です。

**重要な要件：**
1. **言語**: すべての転写内容は日本語で記述する必要があります
2. **形式**: 標準的な日本語の句読点と文法を使用してください
3. **スタイル**: 自然な日本語の流れとリズムを維持してください

**タスク説明：**
- 提供された音声ファイルの内容を日本語で転写してください
- 内容を標準的なLRCファイル形式でフォーマットしてください
- 各行にはタイムスタンプ \`[mm:ss.xx]\` が必要です
- タイムスタンプは正確で、音声の全長にわたって論理的に分布されている必要があります
- 転写内容は明確で、適切な句読点を使用してください
- 最後の行のタイムスタンプは総音声長を超えてはいけません

**音声長:** ${audioDuration.toFixed(2)}秒

**応答形式:** LRC形式のテキストのみを応答し、紹介テキスト、要約、または説明を追加しないでください。`;

                    default:
                        return getLanguagePrompt(SubtitleLanguage.CHINESE);
                }
            };

            const textPart = {
                text: getLanguagePrompt(subtitleLanguage)
            };
            
            const model = ai.getGenerativeModel({ model: 'gemini-2.5-flash' });
            
            const response = await model.generateContent([textPart, audioPart]);
            const result = await response.response;
            const text = result.text();

            setSubtitlesRawText(text.trim());

        } catch (error: any) {
            console.error("Error generating subtitles with AI:", error);
            
            // 檢查是否是 API 配額用完的錯誤
            const errorMessage = error?.message || error?.toString() || '';
            const isQuotaExceeded = errorMessage.includes('quota') || 
                                  errorMessage.includes('limit') || 
                                  errorMessage.includes('exceeded') ||
                                  error?.status === 429 ||
                                  error?.code === 429;
            
            if (isQuotaExceeded && !userApiKey) {
                // 內建 API Key 配額用完，提示用戶輸入自己的 API Key
                setShowApiKeyModal(true);
                setApiQuotaExceeded(true);
                setSubtitlesRawText('內建的 AI API 配額已用完，請輸入您自己的 API Key 以繼續使用。');
            } else {
                // 其他錯誤
                alert("AI 字幕生成失敗。請檢查您的 API Key、網路連線或稍後再試。");
                setSubtitlesRawText('');
            }
        } finally {
            setIsGeneratingSubtitles(false);
        }
    };

    // 處理 API Key 彈出視窗
    const handleApiKeySave = (apiKey: string) => {
        setUserApiKey(apiKey);
        setApiQuotaExceeded(false);
        console.log('User API Key saved successfully');
    };

    const handleApiKeySkip = () => {
        console.log('User skipped API Key input');
        setSubtitlesRawText('已跳過 API Key 輸入，AI 功能暫時無法使用。');
    };

    const handleApiKeyModalClose = () => {
        setShowApiKeyModal(false);
    };

    const handleSetResolution = (newRes: Resolution) => {
        setResolution(newRes);
    };
    
    const handleSetVisualization = (newVis: VisualizationType) => {
        setVisualizationType(newVis);
        // Keep selection list in sync when multi mode is enabled (and ensure list is never empty)
        setSelectedVisualizationTypes((prev) => {
            if (!multiEffectEnabled) return [newVis];
            if (prev.includes(newVis)) return prev;
            return [...prev, newVis];
        });
    };

    const handleMultiEffectEnabledChange = (enabled: boolean) => {
        if (enabled && !multiEffectEnabled) {
            const ok = window.confirm(
                '⚠️ 警告：開啟「複數可視化特效疊加」會大量消耗電腦效能，可能造成掉禎或當機。\n\n確定要開啟嗎？'
            );
            if (!ok) return;
        }
        setMultiEffectEnabled(enabled);
        // When disabling, collapse back to a single active visualizationType.
        if (!enabled) {
            setSelectedVisualizationTypes([visualizationType]);
        } else {
            setSelectedVisualizationTypes((prev) => (prev.length > 0 ? prev : [visualizationType]));
        }
    };

    const handleToggleVisualizationType = (type: VisualizationType) => {
        if (!multiEffectEnabled) {
            handleSetVisualization(type);
            return;
        }

        setSelectedVisualizationTypes((prev) => {
            const has = prev.includes(type);
            if (has) {
                // Don't allow removing the last one (avoid "no visualizer" confusion)
                if (prev.length === 1) return prev;
                const next = prev.filter((t) => t !== type);
                // If we removed the active one, switch active to the first remaining.
                if (visualizationType === type) {
                    setVisualizationType(next[0]);
                }
                return next;
            }
            // Add and make it active so effect-specific controls show up.
            setVisualizationType(type);
            return [...prev, type];
        });
    };

    const handleSelectedVisualizationTypesChange = (types: VisualizationType[]) => {
        const list = (types || []).filter(Boolean);
        if (list.length === 0) return;
        setSelectedVisualizationTypes(list);
        // Keep active type consistent with the list
        if (!list.includes(visualizationType)) {
            setVisualizationType(list[list.length - 1]);
        }
    };

    const handleSetActiveMultiEffectOffset = (type: VisualizationType, next: { x: number; y: number }) => {
        setMultiEffectOffsets((prev) => ({ ...prev, [type]: { x: next.x, y: next.y } }));
        setMultiEffectTransforms((prev) => {
            const current = prev[type] || { x: 0, y: 0, scale: 1, rotation: 0 };
            return { ...prev, [type]: { ...current, x: next.x, y: next.y } };
        });
    };

    const handleNudgeActiveMultiEffect = (dx: number, dy: number) => {
        const type = visualizationType;
        setMultiEffectOffsets((prev) => {
            const current = prev[type] || { x: 0, y: 0 };
            return { ...prev, [type]: { x: current.x + dx, y: current.y + dy } };
        });
        setMultiEffectTransforms((prev) => {
            const current = prev[type] || { x: 0, y: 0, scale: 1, rotation: 0 };
            return { ...prev, [type]: { ...current, x: (current.x || 0) + dx, y: (current.y || 0) + dy } };
        });
    };

    const handleResetActiveMultiEffectOffset = () => {
        const type = visualizationType;
        setMultiEffectOffsets((prev) => ({ ...prev, [type]: { x: 0, y: 0 } }));
        setMultiEffectTransforms((prev) => {
            const current = prev[type] || { x: 0, y: 0, scale: 1, rotation: 0 };
            return { ...prev, [type]: { ...current, x: 0, y: 0 } };
        });
    };

    const handleMultiEffectOffsetsChange = (next: Partial<Record<VisualizationType, { x: number; y: number }>>) => {
        if (!next) return;
        setMultiEffectOffsets(next);
        // Best-effort migrate offset-only into full transforms (keep scale/rotation as-is).
        setMultiEffectTransforms((prev) => {
            const merged = { ...prev };
            for (const [k, v] of Object.entries(next as any)) {
                const type = k as VisualizationType;
                const current = merged[type] || { x: 0, y: 0, scale: 1, rotation: 0 };
                const vv = (v as any) as { x?: number; y?: number };
                merged[type] = { ...current, x: vv?.x ?? current.x, y: vv?.y ?? current.y };
            }
            return merged;
        });
    };

    // Per-effect full transform helpers (for multi-effect mode)
    const ensureMultiEffectTransform = useCallback((type: VisualizationType) => {
        setMultiEffectTransforms((prev) => {
            if (prev[type]) return prev;
            const legacyOffset = multiEffectOffsets?.[type] || { x: 0, y: 0 };
            // Seed with current global transform so enabling multi mode doesn't visually jump.
            const seeded: MultiEffectTransform = {
                x: (legacyOffset.x || 0) + (effectOffsetX || 0) + (visualizationTransform?.x || 0),
                y: (legacyOffset.y || 0) + (effectOffsetY || 0) + (visualizationTransform?.y || 0),
                scale: (effectScale || 1.0) * (visualizationScale || 1.0),
                rotation: typeof effectRotation === 'number' ? effectRotation : 0,
            };
            return { ...prev, [type]: seeded };
        });
    }, [effectOffsetX, effectOffsetY, effectRotation, effectScale, multiEffectOffsets, visualizationScale, visualizationTransform]);

    useEffect(() => {
        if (!multiEffectEnabled) return;
        // Ensure every selected type has its own transform initialized.
        (selectedVisualizationTypes || []).forEach((t) => ensureMultiEffectTransform(t));
    }, [multiEffectEnabled, selectedVisualizationTypes, ensureMultiEffectTransform]);

    const handleSetActiveMultiEffectTransform = (type: VisualizationType, patch: Partial<MultiEffectTransform>) => {
        setMultiEffectTransforms((prev) => {
            const current = prev[type] || { x: 0, y: 0, scale: 1, rotation: 0 };
            return { ...prev, [type]: { ...current, ...patch } };
        });
    };

    const handleResetActiveMultiEffectTransform = () => {
        const type = visualizationType;
        setMultiEffectTransforms((prev) => ({ ...prev, [type]: { x: 0, y: 0, scale: 1, rotation: 0 } }));
        // Keep legacy offset map in sync (so old UI paths remain consistent)
        setMultiEffectOffsets((prev) => ({ ...prev, [type]: { x: 0, y: 0 } }));
    };
    
    const handleSetColorPalette = (newPalette: ColorPaletteType) => {
        setColorPalette(newPalette);
    };

    // 將十六進制顏色轉換為 HSL 的 Hue 值
    const hexToHue = (hex: string): number => {
        // 確保 hex 格式正確
        if (!hex || !hex.startsWith('#')) {
            return 180; // 預設為青色
        }
        
        // 處理 3 位或 6 位 hex
        let normalizedHex = hex.slice(1);
        if (normalizedHex.length === 3) {
            normalizedHex = normalizedHex.split('').map(c => c + c).join('');
        }
        
        if (normalizedHex.length !== 6) {
            return 180; // 預設為青色
        }
        
        const r = parseInt(normalizedHex.slice(0, 2), 16) / 255;
        const g = parseInt(normalizedHex.slice(2, 4), 16) / 255;
        const b = parseInt(normalizedHex.slice(4, 6), 16) / 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h = 0;
        
        if (max !== min) {
            if (max === r) {
                h = ((g - b) / (max - min)) % 6;
            } else if (max === g) {
                h = (b - r) / (max - min) + 2;
            } else {
                h = (r - g) / (max - min) + 4;
            }
        }
        
        h = h * 60;
        if (h < 0) h += 360;
        return h;
    };

    // 獲取當前使用的顏色調色板（如果是自選色彩，則使用自定義顏色）
    const getCurrentPalette = (): Palette => {
        if (colorPalette === ColorPaletteType.CUSTOM) {
            const primaryHue = hexToHue(customPrimaryColor);
            const secondaryHue = hexToHue(customSecondaryColor);
            const accentHue = hexToHue(customAccentColor);
            
            // 計算 hueRange（從最小到最大）
            const hues = [primaryHue, secondaryHue, accentHue];
            const minHue = Math.min(...hues);
            const maxHue = Math.max(...hues);
            
            return {
                name: ColorPaletteType.CUSTOM,
                primary: customPrimaryColor,
                secondary: customSecondaryColor,
                accent: customAccentColor,
                backgroundGlow: 'rgba(10, 80, 150, 0.2)', // 可以根據需要調整
                hueRange: [minHue, maxHue],
            };
        }
        return COLOR_PALETTES[colorPalette];
    };

    const handleTextChange = (text: string) => {
        updateCustomTextOverlay(0, { text });
    };
    
    const handleWatermarkPositionChange = (position: WatermarkPosition) => {
        updateCustomTextOverlay(0, { anchor: position });
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

    const handleBackgroundVideoSelect = (file: File) => {
        if (backgroundVideo) {
            URL.revokeObjectURL(backgroundVideo);
        }
        const url = URL.createObjectURL(file);
        setBackgroundVideo(url);
    };

    const clearBackgroundVideo = () => {
        if (backgroundVideo) {
            URL.revokeObjectURL(backgroundVideo);
        }
        setBackgroundVideo(null);
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

    // Vinyl Record 圖片處理函數
    const handleVinylImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        if (vinylImage) URL.revokeObjectURL(vinylImage);
        setVinylImage(url);
    };

    const clearVinylImage = () => {
        if (vinylImage) URL.revokeObjectURL(vinylImage);
        setVinylImage(null);
    };


    const handleRecordingComplete = useCallback((url: string, extension: string) => {
        setVideoUrl(url);
        setVideoExtension(extension);
        setIsLoading(false);
        setShowWarning(false);
    }, []);

    const { isRecording, startRecording, stopRecording } = useMediaRecorder(handleRecordingComplete);

    const handleFileSelect = (file: File) => {
        const isVideo = file.type.startsWith('video/') || file.name.toLowerCase().endsWith('.mp4');
        console.log(`選擇${isVideo ? '影片' : '音訊'}文件:`, { name: file.name, type: file.type, size: file.size });
        
        // 停止當前播放
        if (isPlaying && audioRef.current) {
            audioRef.current.pause();
            setIsPlaying(false);
        }
        
        // 重置音頻分析
        resetAudioAnalysis();
        
        // 清除舊的背景視頻（如果有）
        if (backgroundVideo) {
            URL.revokeObjectURL(backgroundVideo);
            setBackgroundVideo(null);
        }
        
        setAudioFile(file);
        const url = URL.createObjectURL(file);
        setAudioUrl(url);
        
        // 如果是视频文件，自動設置為背景視頻
        if (isVideo) {
            console.log('已選擇 MP4 影片檔案，將使用其音訊軌道進行可視化，並顯示影片畫面');
            setBackgroundVideo(url);
            // 自動啟用背景顯示
            setShowBackgroundImage(true);
        } else {
            // 如果是音頻文件，清除背景視頻
            setBackgroundVideo(null);
        }
    };

    const handleClearAudio = useCallback(() => {
        if (isPlaying) {
             if (audioRef.current) {
                audioRef.current.pause();
            }
            setIsPlaying(false);
        }
       
        // 保存當前的 URL 用於比較
        const currentAudioUrl = audioUrl;
        const currentBackgroundVideo = backgroundVideo;
       
        // 如果背景視頻和音頻 URL 相同（即從 MP4 文件自動設置的），只需要清除一次
        if (currentBackgroundVideo && currentBackgroundVideo === currentAudioUrl) {
            // 清除共享的 URL
            if (currentAudioUrl) {
                URL.revokeObjectURL(currentAudioUrl);
            }
            setBackgroundVideo(null);
        } else {
            // 分別清除
            if (currentAudioUrl) {
                URL.revokeObjectURL(currentAudioUrl);
            }
            if (currentBackgroundVideo) {
                URL.revokeObjectURL(currentBackgroundVideo);
                setBackgroundVideo(null);
            }
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
                // 若從頭開始播放，觸發一次開場動畫
                if (showIntroOverlay && (audioRef.current?.currentTime ?? 0) < 0.1) {
                    setIntroStartTime(0);
                    setIntroTriggerId((v) => v + 1);
                }
            }).catch(e => {
                console.error("Audio play failed:", e);
                setIsPlaying(false);
            });
        } else {
            audioRef.current.pause();
            console.log('音頻暫停');
            setIsPlaying(false);
        }
    }, [isPlaying, isAudioInitialized, initializeAudio, showIntroOverlay]);

    // Attach/detach CTA video audio into the recording stream (and speakers) when enabled.
    useEffect(() => {
        const el = ctaVideoRef.current;
        const enabled = !!(ctaVideoUrl && ctaVideoEnabled && ctaVideoIncludeAudio);
        if (!el) {
            setAuxMediaElement(null, false);
            return;
        }
        // Keep element muted when we don't want its audio
        el.muted = !enabled;
        setAuxMediaElement(el, enabled);
    }, [ctaVideoUrl, ctaVideoEnabled, ctaVideoIncludeAudio, setAuxMediaElement]);
    
    const handleMetadataLoaded = () => {
        if (audioRef.current) {
            setAudioDuration(audioRef.current.duration);
        }
    };

    const restartCtaVideoIfNeeded = useCallback((audioTimeSec: number, reason: string) => {
        // Only restart when user is using CTA video as a replacement for the CTA pill animation.
        if (!ctaVideoUrl || !ctaVideoEnabled || !ctaVideoReplaceCtaAnimation) return;
        const v = ctaVideoRef.current;
        if (!v) return;

        // Only trigger replay when we are (re)at the beginning.
        if (audioTimeSec > 0.06) return;

        try {
            v.pause();
            v.currentTime = 0;
        } catch {
            // ignore
        }
        // Play once (no loop). This is in response to a user action (seek/record),
        // so it should usually be allowed even when audio is enabled.
        v.play().catch(() => {});
    }, [ctaVideoUrl, ctaVideoEnabled, ctaVideoReplaceCtaAnimation]);

    const prevAudioTimeRef = useRef<number>(0);

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            const t = audioRef.current.currentTime;
            setCurrentTime(t);

            // If user scrubbed backwards to the beginning via the native audio element,
            // ensure CTA replacement video can replay.
            const prev = prevAudioTimeRef.current;
            prevAudioTimeRef.current = t;
            if (t <= 0.06 && prev > 0.30) {
                restartCtaVideoIfNeeded(t, 'rewind');
            }

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
            // If user seeks back to the beginning, replay CTA replacement video.
            restartCtaVideoIfNeeded(newTime, 'seek');
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
                // Ensure CTA replacement video also starts from 0 for recording.
                restartCtaVideoIfNeeded(0, 'record');
                // 錄影一定從 0 開始，因此可觸發開場動畫
                if (showIntroOverlay) {
                    setIntroStartTime(0);
                    setIntroTriggerId((v) => v + 1);
                }
                audioRef.current.play().then(() => setIsPlaying(true));
            } else {
                 alert("無法開始錄製。請確認音訊已載入並準備就緒。");
            }
        }
    };

    // 手動預覽開場動畫（不重置音樂，從當前時間開始播放一次）
    const handlePreviewIntro = useCallback(() => {
        const t = audioRef.current?.currentTime ?? 0;
        setIntroStartTime(t);
        setIntroTriggerId((v) => v + 1);
    }, []);
    
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

    // ===== Dragging & Scaling (Effect Transform) =====
    const isDraggingRef = useRef<boolean>(false);
    const lastPointerPosRef = useRef<{ x: number; y: number } | null>(null);
    const dragStartRef = useRef<{ pointerX: number; pointerY: number; startX: number; startY: number } | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        if (e.button !== 0) return;
        (e.currentTarget as HTMLDivElement).setPointerCapture?.(e.pointerId);
        isDraggingRef.current = true;
        lastPointerPosRef.current = { x: e.clientX, y: e.clientY };
        dragStartRef.current = {
            pointerX: e.clientX,
            pointerY: e.clientY,
            startX: (visualizationTransform?.x || 0),
            startY: (visualizationTransform?.y || 0)
        };
        if (e.cancelable) e.preventDefault();
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDraggingRef.current || !lastPointerPosRef.current) return;
        lastPointerPosRef.current = { x: e.clientX, y: e.clientY };
        const start = dragStartRef.current;
        const damp = 0.5; // sensitivity
        if (start) {
            const dx = (e.clientX - start.pointerX) * damp;
            const dy = (e.clientY - start.pointerY) * damp;
            const nextX = start.startX + dx;
            const nextY = start.startY + dy;
            setVisualizationTransform(prevTransform => ({
                x: nextX,
                y: nextY,
                scale: prevTransform?.scale ?? 1.0,
            }));
        }
        if (e.cancelable) e.preventDefault();
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        isDraggingRef.current = false;
        lastPointerPosRef.current = null;
        dragStartRef.current = null;
        (e.currentTarget as HTMLDivElement).releasePointerCapture?.(e.pointerId);
        if (e.cancelable) e.preventDefault();
    };

    return (
        <>
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
                        if (isRecording) {
                            stopRecording();
                        }
                    }}
                    onLoadedMetadata={handleMetadataLoaded}
                    onTimeUpdate={handleTimeUpdate}
                    crossOrigin="anonymous"
                    className="hidden"
                />
            )}

            {/* Hidden CTA video element used as a draw source for canvas + optional audio mixing */}
            <video
                ref={ctaVideoRef}
                src={ctaVideoUrl || undefined}
                muted={!ctaVideoIncludeAudio}
                playsInline
                preload="auto"
                className="hidden"
            />

            <main className="flex flex-col p-4 overflow-y-auto pt-24">
                <div className="w-full max-w-7xl mx-auto flex flex-col items-center gap-4">
                    {/* 頁面標題 */}
                    <div className="text-center mb-6">
                        <h1 className="text-3xl font-bold text-white mb-2">音訊可視化工程</h1>
                        <p className="text-gray-300">將音樂轉化為震撼的視覺效果</p>
                    </div>

                        <div style={wrapperStyle} className="flex items-center justify-center bg-black rounded-lg border border-gray-700 overflow-hidden">
                            <div 
                                ref={containerRef}
                                onPointerDown={handlePointerDown}
                                onPointerMove={handlePointerMove}
                                onPointerUp={handlePointerUp}
                                onPointerCancel={handlePointerUp}
                                style={{
                                    ...visualizerContainerStyle,
                                    backgroundImage: isTransparentBg ? checkerboardUrl : 'none',
                                    backgroundSize: '20px 20px',
                                    touchAction: 'none',
                                    cursor: isDraggingRef.current ? 'grabbing' : 'grab'
                                }} 
                                className="relative shadow-2xl shadow-cyan-500/10"
                            >
                               <AudioVisualizer 
                                    key={showVisualizer ? 'vis-on' : 'vis-off'}
                                    ref={canvasRef}
                                    analyser={analyser} 
                                    audioRef={audioRef}
                                    visualizationType={visualizationType} 
                                    multiEffectEnabled={multiEffectEnabled}
                                    selectedVisualizationTypes={selectedVisualizationTypes}
                                    multiEffectOffsets={multiEffectOffsets}
                                    multiEffectTransforms={multiEffectTransforms}
                                    isPlaying={isPlaying}
                                    customTextOverlays={customTextOverlays}
                                    customText={(customTextOverlays?.[0]?.enabled ?? true) ? (customTextOverlays?.[0]?.text ?? '') : ''}
                                    textColor={customTextOverlays?.[0]?.color ?? '#FFFFFF'}
                                    textStrokeColor={customTextOverlays?.[0]?.strokeColor ?? '#000000'}
                                    fontFamily={customTextOverlays?.[0]?.fontFamily ?? FontType.POPPINS}
                                    graphicEffect={customTextOverlays?.[0]?.graphicEffect ?? GraphicEffectType.NONE}
                                    textSize={customTextOverlays?.[0]?.textSize ?? 4}
                                    textPositionX={customTextOverlays?.[0]?.textPositionX ?? 0}
                                    textPositionY={customTextOverlays?.[0]?.textPositionY ?? 0}
                                    sensitivity={sensitivity}
                                    smoothing={smoothing}
                                    equalization={equalization}
                                    backgroundColor={canvasBgColors[backgroundColor]}
                                    colors={getCurrentPalette()}
                                    backgroundImage={showBackgroundImage ? backgroundImage : null}
                                    backgroundVideo={showBackgroundImage ? backgroundVideo : null}
                                    watermarkPosition={customTextOverlays?.[0]?.anchor ?? WatermarkPosition.BOTTOM_RIGHT}
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
                                    subtitleStrokeColor={subtitleStrokeColor}
                                    subtitleEffect={subtitleEffect}
                                    subtitleBgStyle={subtitleBgStyle}
                                    subtitleFadeInSeconds={subtitleFadeInSeconds}
                                    subtitleFadeOutSeconds={subtitleFadeOutSeconds}
                                    subtitleLineColor={subtitleLineColor}
                                    subtitleLineThickness={subtitleLineThickness}
                                    subtitleLineGap={subtitleLineGap}
                                    effectScale={effectScale}
                                    effectOffsetX={effectOffsetX}
                                    effectOffsetY={effectOffsetY}
                                    effectRotation={effectRotation}
                                    showLyricsDisplay={showLyricsDisplay}
                                    currentTime={currentTime}
                                    lyricsFontSize={lyricsFontSize}
                                    lyricsFontFamily={lyricsFontFamily}
                                    lyricsPositionX={lyricsPositionX}
                                    lyricsPositionY={lyricsPositionY}
                                    subtitleDisplayMode={subtitleDisplayMode}
                                    subtitleOrientation={subtitleOrientation}
                                    verticalSubtitlePosition={verticalSubtitlePosition}
                                    horizontalSubtitlePosition={horizontalSubtitlePosition}
                                    verticalSubtitleVerticalPosition={verticalSubtitleVerticalPosition}
                                    horizontalSubtitleVerticalPosition={horizontalSubtitleVerticalPosition}
                                    subtitleFadeLinesEnabled={subtitleFadeLinesEnabled}
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
                                    ctaFontFamily={ctaFontFamily}
                                    ctaTextColor={ctaTextColor}
                                    ctaStrokeColor={ctaStrokeColor}
                                    ctaTextEffect={ctaTextEffect}
                                    ctaPosition={ctaPosition}
                                    onCtaPositionUpdate={setCtaPosition}
                                    ctaVideoElement={ctaVideoRef.current}
                                    ctaVideoEnabled={ctaVideoEnabled}
                                    ctaVideoReplaceCtaAnimation={ctaVideoReplaceCtaAnimation}
                                    // Intro Overlay props
                                    showIntroOverlay={showIntroOverlay}
                                    introTitle={introTitle}
                                    introArtist={introArtist}
                                    introDescription={introDescription}
                                    introFontFamily={introFontFamily}
                                    introEffect={introEffect}
                                    introColor={introColor}
                                    introStrokeColor={introStrokeColor}
                                    introTitleSize={introTitleSize}
                                    introArtistSize={introArtistSize}
                                    introDescriptionSize={introDescriptionSize}
                                    introFadeIn={introFadeIn}
                                    introHold={introHold}
                                    introFadeOut={introFadeOut}
                                    introBgOpacity={introBgOpacity}
                                    introPositionX={introPositionX}
                                    introPositionY={introPositionY}
                                    introStartTime={introStartTime}
                                    introTriggerId={introTriggerId}
                                    introLightBarsEnabled={introLightBarsEnabled}
                                    zCustomCenterImage={zCustomCenterImage}
                                    zCustomScale={zCustomScale}
                                    zCustomPosition={zCustomPosition}
                                    onZCustomPositionUpdate={setZCustomPosition}
                                    vinylImage={vinylImage}
                                    vinylLayoutMode={vinylLayoutMode}
                                    vinylCenterFixed={vinylCenterFixed}
                                    pianoOpacity={pianoOpacity}
                                    fusionCenterOpacity={fusionCenterOpacity}
                                    stellarCoreInnerOpacity={stellarCoreInnerOpacity}
                                    stellarCoreTentaclesOpacity={stellarCoreTentaclesOpacity}
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
                                    controlCardFontFamily={controlCardFontFamily}
                                    controlCardTextEffect={controlCardTextEffect}
                                    controlCardStrokeColor={controlCardStrokeColor}
                                    // Vinyl Record props
                                    vinylRecordEnabled={vinylRecordEnabled}
                                    vinylNeedleEnabled={vinylNeedleEnabled}
                                    // Chinese Control Card props
                                    // chineseCardAlbumImage={chineseCardAlbumImage}
                                    // chineseCardSongTitle={chineseCardSongTitle}
                                    // chineseCardArtist={chineseCardArtist}
                                    // chineseCardFontFamily={chineseCardFontFamily}
                                    // Photo Shake props
                                    photoShakeImage={photoShakeImage}
                                    photoShakeSongTitle={photoShakeSongTitle}
                                    photoShakeSubtitle={photoShakeSubtitle}
                                    photoShakeFontFamily={photoShakeFontFamily}
                                    photoShakeOverlayOpacity={photoShakeOverlayOpacity}
                                    photoShakeFontSize={photoShakeFontSize}
                                    photoShakeDecaySpeed={photoShakeDecaySpeed}
                                    // Bass Enhancement props (重低音強化)
                                    bassEnhancementBlurIntensity={bassEnhancementBlurIntensity}
                                    bassEnhancementCurveIntensity={bassEnhancementCurveIntensity}
                                    bassEnhancementText={bassEnhancementText}
                                    bassEnhancementTextColor={bassEnhancementTextColor}
                                    bassEnhancementTextFont={bassEnhancementTextFont}
                                    bassEnhancementTextSize={bassEnhancementTextSize}
                                    bassEnhancementTextBgOpacity={bassEnhancementTextBgOpacity}
                                    // Frame Pixelation props (方框像素化)
                                    bassEnhancementCenterOpacity={bassEnhancementCenterOpacity}
                                    // Circular Wave props (圓形波形)
                                    circularWaveImage={circularWaveImage}
                                    // Blurred Edge props (邊緣虛化)
                                    blurredEdgeSinger={blurredEdgeSinger}
                                    blurredEdgeSongTitle={blurredEdgeSongTitle}
                                    blurredEdgeFontFamily={blurredEdgeFontFamily}
                                    blurredEdgeTextColor={blurredEdgeTextColor}
                                    blurredEdgeBgOpacity={blurredEdgeBgOpacity}
                                    blurredEdgeFontSize={blurredEdgeFontSize}
                                    // Ke Ye Custom V2 props (可夜訂製版二號)
                                    keYeCustomV2BoxOpacity={keYeCustomV2BoxOpacity}
                                    keYeCustomV2BoxColor={keYeCustomV2BoxColor}
                                    keYeCustomV2VisualizerColor={keYeCustomV2VisualizerColor}
                                    keYeCustomV2Text1={keYeCustomV2Text1}
                                    keYeCustomV2Text2={keYeCustomV2Text2}
                                    keYeCustomV2Text1Font={keYeCustomV2Text1Font}
                                    keYeCustomV2Text2Font={keYeCustomV2Text2Font}
                                    keYeCustomV2Text1Size={keYeCustomV2Text1Size}
                                    keYeCustomV2Text2Size={keYeCustomV2Text2Size}
                                    keYeCustomV2Text1Color={keYeCustomV2Text1Color}
                                    keYeCustomV2Text2Color={keYeCustomV2Text2Color}
                                    keYeCustomV2Text1Effect={keYeCustomV2Text1Effect}
                                    keYeCustomV2Text2Effect={keYeCustomV2Text2Effect}
                                    keYeCustomV2Text1StrokeColor={keYeCustomV2Text1StrokeColor}
                                    keYeCustomV2Text2StrokeColor={keYeCustomV2Text2StrokeColor}
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
                            // Photo Shake controls
                            photoShakeImage={photoShakeImage}
                            onPhotoShakeImageUpload={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                        setPhotoShakeImage(event.target?.result as string);
                                    };
                                    reader.readAsDataURL(file);
                                }
                            }}
                            photoShakeSongTitle={photoShakeSongTitle}
                            onPhotoShakeSongTitleChange={setPhotoShakeSongTitle}
                            photoShakeSubtitle={photoShakeSubtitle}
                            onPhotoShakeSubtitleChange={setPhotoShakeSubtitle}
                            photoShakeFontFamily={photoShakeFontFamily}
                            onPhotoShakeFontFamilyChange={setPhotoShakeFontFamily}
                            photoShakeOverlayOpacity={photoShakeOverlayOpacity}
                            onPhotoShakeOverlayOpacityChange={setPhotoShakeOverlayOpacity}
                            photoShakeFontSize={photoShakeFontSize}
                            onPhotoShakeFontSizeChange={setPhotoShakeFontSize}
                            photoShakeDecaySpeed={photoShakeDecaySpeed}
                            onPhotoShakeDecaySpeedChange={setPhotoShakeDecaySpeed}
                            // Circular Wave controls (圓形波形)
                            circularWaveImage={circularWaveImage}
                            onCircularWaveImageUpload={(e: React.ChangeEvent<HTMLInputElement>) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    const reader = new FileReader();
                                    reader.onload = (event) => {
                                        setCircularWaveImage(event.target?.result as string);
                                    };
                                    reader.readAsDataURL(file);
                                }
                            }}
                            onClearCircularWaveImage={() => setCircularWaveImage(null)}
                            // Blurred Edge controls (邊緣虛化)
                            blurredEdgeSinger={blurredEdgeSinger}
                            onBlurredEdgeSingerChange={setBlurredEdgeSinger}
                            blurredEdgeSongTitle={blurredEdgeSongTitle}
                            onBlurredEdgeSongTitleChange={setBlurredEdgeSongTitle}
                            blurredEdgeFontFamily={blurredEdgeFontFamily}
                            onBlurredEdgeFontFamilyChange={setBlurredEdgeFontFamily}
                            blurredEdgeTextColor={blurredEdgeTextColor}
                            onBlurredEdgeTextColorChange={setBlurredEdgeTextColor}
                            blurredEdgeBgOpacity={blurredEdgeBgOpacity}
                            onBlurredEdgeBgOpacityChange={setBlurredEdgeBgOpacity}
                            blurredEdgeFontSize={blurredEdgeFontSize}
                            onBlurredEdgeFontSizeChange={setBlurredEdgeFontSize}
                            // Ke Ye Custom V2 controls (可夜訂製版二號)
                            keYeCustomV2BoxOpacity={keYeCustomV2BoxOpacity}
                            onKeYeCustomV2BoxOpacityChange={setKeYeCustomV2BoxOpacity}
                            keYeCustomV2BoxColor={keYeCustomV2BoxColor}
                            onKeYeCustomV2BoxColorChange={setKeYeCustomV2BoxColor}
                            keYeCustomV2VisualizerColor={keYeCustomV2VisualizerColor}
                            onKeYeCustomV2VisualizerColorChange={setKeYeCustomV2VisualizerColor}
                            keYeCustomV2Text1={keYeCustomV2Text1}
                            onKeYeCustomV2Text1Change={setKeYeCustomV2Text1}
                            keYeCustomV2Text2={keYeCustomV2Text2}
                            onKeYeCustomV2Text2Change={setKeYeCustomV2Text2}
                            keYeCustomV2Text1Font={keYeCustomV2Text1Font}
                            onKeYeCustomV2Text1FontChange={setKeYeCustomV2Text1Font}
                            keYeCustomV2Text2Font={keYeCustomV2Text2Font}
                            onKeYeCustomV2Text2FontChange={setKeYeCustomV2Text2Font}
                            keYeCustomV2Text1Size={keYeCustomV2Text1Size}
                            onKeYeCustomV2Text1SizeChange={setKeYeCustomV2Text1Size}
                            keYeCustomV2Text2Size={keYeCustomV2Text2Size}
                            onKeYeCustomV2Text2SizeChange={setKeYeCustomV2Text2Size}
                            keYeCustomV2Text1Color={keYeCustomV2Text1Color}
                            onKeYeCustomV2Text1ColorChange={setKeYeCustomV2Text1Color}
                            keYeCustomV2Text2Color={keYeCustomV2Text2Color}
                            onKeYeCustomV2Text2ColorChange={setKeYeCustomV2Text2Color}
                            keYeCustomV2Text1Effect={keYeCustomV2Text1Effect}
                            onKeYeCustomV2Text1EffectChange={setKeYeCustomV2Text1Effect}
                            keYeCustomV2Text2Effect={keYeCustomV2Text2Effect}
                            onKeYeCustomV2Text2EffectChange={setKeYeCustomV2Text2Effect}
                            keYeCustomV2Text1StrokeColor={keYeCustomV2Text1StrokeColor}
                            onKeYeCustomV2Text1StrokeColorChange={setKeYeCustomV2Text1StrokeColor}
                            keYeCustomV2Text2StrokeColor={keYeCustomV2Text2StrokeColor}
                            onKeYeCustomV2Text2StrokeColorChange={setKeYeCustomV2Text2StrokeColor}
                            // Bass Enhancement controls (重低音強化)
                            bassEnhancementBlurIntensity={bassEnhancementBlurIntensity}
                            onBassEnhancementBlurIntensityChange={setBassEnhancementBlurIntensity}
                            bassEnhancementCurveIntensity={bassEnhancementCurveIntensity}
                            onBassEnhancementCurveIntensityChange={setBassEnhancementCurveIntensity}
                            bassEnhancementText={bassEnhancementText}
                            onBassEnhancementTextChange={setBassEnhancementText}
                            bassEnhancementTextColor={bassEnhancementTextColor}
                            onBassEnhancementTextColorChange={setBassEnhancementTextColor}
                            bassEnhancementTextFont={bassEnhancementTextFont}
                            onBassEnhancementTextFontChange={setBassEnhancementTextFont}
                            bassEnhancementTextSize={bassEnhancementTextSize}
                            onBassEnhancementTextSizeChange={setBassEnhancementTextSize}
                            bassEnhancementTextBgOpacity={bassEnhancementTextBgOpacity}
                            onBassEnhancementTextBgOpacityChange={setBassEnhancementTextBgOpacity}
                            isLoading={isLoading}
                            visualizationType={visualizationType}
                            onVisualizationChange={handleSetVisualization}
                            multiEffectEnabled={multiEffectEnabled}
                            onMultiEffectEnabledChange={handleMultiEffectEnabledChange}
                            selectedVisualizationTypes={selectedVisualizationTypes}
                            onToggleVisualizationType={handleToggleVisualizationType}
                            onSelectedVisualizationTypesChange={handleSelectedVisualizationTypesChange}
                            multiEffectOffsets={multiEffectOffsets}
                            onMultiEffectOffsetsChange={handleMultiEffectOffsetsChange}
                            onActiveMultiEffectNudge={handleNudgeActiveMultiEffect}
                            onActiveMultiEffectOffsetChange={(next) => handleSetActiveMultiEffectOffset(visualizationType, next)}
                            onActiveMultiEffectOffsetReset={handleResetActiveMultiEffectOffset}
                            multiEffectTransforms={multiEffectTransforms}
                            onMultiEffectTransformsChange={setMultiEffectTransforms}
                            onActiveMultiEffectTransformChange={(patch) => handleSetActiveMultiEffectTransform(visualizationType, patch)}
                            onActiveMultiEffectTransformReset={handleResetActiveMultiEffectTransform}
                            // Vinyl Record controls
                            vinylImage={vinylImage}
                            onVinylImageUpload={handleVinylImageUpload}
                            onClearVinylImage={clearVinylImage}
                            vinylLayoutMode={vinylLayoutMode}
                            onVinylLayoutModeChange={setVinylLayoutMode}
                            vinylCenterFixed={vinylCenterFixed}
                            onVinylCenterFixedChange={setVinylCenterFixed}
                            pianoOpacity={pianoOpacity}
                            onPianoOpacityChange={setPianoOpacity}
                            fusionCenterOpacity={fusionCenterOpacity}
                            onFusionCenterOpacityChange={setFusionCenterOpacity}
                            stellarCoreInnerOpacity={stellarCoreInnerOpacity}
                            onStellarCoreInnerOpacityChange={setStellarCoreInnerOpacity}
                            stellarCoreTentaclesOpacity={stellarCoreTentaclesOpacity}
                            onStellarCoreTentaclesOpacityChange={setStellarCoreTentaclesOpacity}
                            customTextOverlays={customTextOverlays}
                            onCustomTextOverlaysChange={setCustomTextOverlays}
                            onUpdateCustomTextOverlay={updateCustomTextOverlay}
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
                            // 自選色彩 props
                            customPrimaryColor={customPrimaryColor}
                            customSecondaryColor={customSecondaryColor}
                            customAccentColor={customAccentColor}
                            onCustomPrimaryColorChange={setCustomPrimaryColor}
                            onCustomSecondaryColorChange={setCustomSecondaryColor}
                            onCustomAccentColorChange={setCustomAccentColor}
                            resolution={resolution}
                            onResolutionChange={handleSetResolution}
                            backgroundImage={backgroundImage}
                            onBackgroundImageSelect={handleBackgroundImageSelect}
                            onClearBackgroundImage={clearBackgroundImage}
                            backgroundImages={backgroundImages}
                            onMultipleBackgroundImagesSelect={handleMultipleBackgroundImagesSelect}
                            onClearAllBackgroundImages={clearAllBackgroundImages}
                            backgroundVideo={backgroundVideo}
                            onBackgroundVideoSelect={handleBackgroundVideoSelect}
                            onClearBackgroundVideo={clearBackgroundVideo}
                            currentImageIndex={currentImageIndex}
                            isSlideshowEnabled={isSlideshowEnabled}
                            onSlideshowEnabledChange={setIsSlideshowEnabled}
                            slideshowInterval={slideshowInterval}
                            onSlideshowIntervalChange={setSlideshowInterval}
                            isTransitioning={isTransitioning}
                            transitionType={transitionType}
                            onTransitionTypeChange={setTransitionType}
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
                            subtitleStrokeColor={subtitleStrokeColor}
                            onSubtitleStrokeColorChange={setSubtitleStrokeColor}
                            subtitleEffect={subtitleEffect}
                            onSubtitleEffectChange={setSubtitleEffect}
                            subtitleBgStyle={subtitleBgStyle}
                            onSubtitleBgStyleChange={setSubtitleBgStyle}
                            subtitleFormat={subtitleFormat}
                            onSubtitleFormatChange={setSubtitleFormat}
                            subtitleLanguage={subtitleLanguage}
                            onSubtitleLanguageChange={setSubtitleLanguage}
                            subtitleOrientation={subtitleOrientation}
                            onSubtitleOrientationChange={setSubtitleOrientation}
                            verticalSubtitlePosition={verticalSubtitlePosition}
                            onVerticalSubtitlePositionChange={setVerticalSubtitlePosition}
                            horizontalSubtitlePosition={horizontalSubtitlePosition}
                            onHorizontalSubtitlePositionChange={setHorizontalSubtitlePosition}
                            verticalSubtitleVerticalPosition={verticalSubtitleVerticalPosition}
                            onVerticalSubtitleVerticalPositionChange={setVerticalSubtitleVerticalPosition}
                            horizontalSubtitleVerticalPosition={horizontalSubtitleVerticalPosition}
                            onHorizontalSubtitleVerticalPositionChange={setHorizontalSubtitleVerticalPosition}
                            effectScale={effectScale}
                            onEffectScaleChange={setEffectScale}
                            effectOffsetX={effectOffsetX}
                            onEffectOffsetXChange={setEffectOffsetX}
                            effectOffsetY={effectOffsetY}
                            onEffectOffsetYChange={setEffectOffsetY}
                            effectRotation={effectRotation}
                            onEffectRotationChange={setEffectRotation}
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
                            subtitleFadeInSeconds={subtitleFadeInSeconds}
                            onSubtitleFadeInSecondsChange={setSubtitleFadeInSeconds}
                            subtitleFadeOutSeconds={subtitleFadeOutSeconds}
                            onSubtitleFadeOutSecondsChange={setSubtitleFadeOutSeconds}
                            subtitleFadeLinesEnabled={subtitleFadeLinesEnabled}
                            onSubtitleFadeLinesEnabledChange={setSubtitleFadeLinesEnabled}
                            subtitleLineColor={subtitleLineColor}
                            onSubtitleLineColorChange={setSubtitleLineColor}
                            subtitleLineThickness={subtitleLineThickness}
                            onSubtitleLineThicknessChange={setSubtitleLineThickness}
                            subtitleLineGap={subtitleLineGap}
                            onSubtitleLineGapChange={setSubtitleLineGap}
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
                            ctaFontFamily={ctaFontFamily}
                            onCtaFontFamilyChange={setCtaFontFamily}
                            ctaTextColor={ctaTextColor}
                            onCtaTextColorChange={setCtaTextColor}
                            ctaStrokeColor={ctaStrokeColor}
                            onCtaStrokeColorChange={setCtaStrokeColor}
                            ctaTextEffect={ctaTextEffect}
                            onCtaTextEffectChange={setCtaTextEffect}
                            ctaPositionX={ctaPositionX}
                            onCtaPositionXChange={handleCtaPositionXChange}
                            ctaPositionY={ctaPositionY}
                            onCtaPositionYChange={handleCtaPositionYChange}
                            ctaVideoUrl={ctaVideoUrl}
                            ctaVideoFileName={ctaVideoFileName}
                            onCtaVideoSelect={handleCtaVideoSelect}
                            onClearCtaVideo={handleClearCtaVideo}
                            ctaVideoEnabled={ctaVideoEnabled}
                            onCtaVideoEnabledChange={setCtaVideoEnabled}
                            ctaVideoIncludeAudio={ctaVideoIncludeAudio}
                            onCtaVideoIncludeAudioChange={setCtaVideoIncludeAudio}
                            ctaVideoReplaceCtaAnimation={ctaVideoReplaceCtaAnimation}
                            onCtaVideoReplaceCtaAnimationChange={setCtaVideoReplaceCtaAnimation}
                            // Intro Overlay props
                            showIntroOverlay={showIntroOverlay}
                            onShowIntroOverlayChange={setShowIntroOverlay}
                            introTitle={introTitle}
                            onIntroTitleChange={setIntroTitle}
                            introArtist={introArtist}
                            onIntroArtistChange={setIntroArtist}
                            introDescription={introDescription}
                            onIntroDescriptionChange={setIntroDescription}
                            introFontFamily={introFontFamily}
                            onIntroFontFamilyChange={setIntroFontFamily}
                            introEffect={introEffect}
                            onIntroEffectChange={setIntroEffect}
                            introColor={introColor}
                            onIntroColorChange={setIntroColor}
                            introStrokeColor={introStrokeColor}
                            onIntroStrokeColorChange={setIntroStrokeColor}
                            introTitleSize={introTitleSize}
                            onIntroTitleSizeChange={setIntroTitleSize}
                            introArtistSize={introArtistSize}
                            onIntroArtistSizeChange={setIntroArtistSize}
                            introDescriptionSize={introDescriptionSize}
                            onIntroDescriptionSizeChange={setIntroDescriptionSize}
                            introFadeIn={introFadeIn}
                            onIntroFadeInChange={setIntroFadeIn}
                            introHold={introHold}
                            onIntroHoldChange={setIntroHold}
                            introFadeOut={introFadeOut}
                            onIntroFadeOutChange={setIntroFadeOut}
                            introBgOpacity={introBgOpacity}
                            onIntroBgOpacityChange={setIntroBgOpacity}
                            introPositionX={introPositionX}
                            onIntroPositionXChange={setIntroPositionX}
                            introPositionY={introPositionY}
                            onIntroPositionYChange={setIntroPositionY}
                            introLightBarsEnabled={introLightBarsEnabled}
                            onIntroLightBarsEnabledChange={setIntroLightBarsEnabled}
                            onPreviewIntro={handlePreviewIntro}
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
                            controlCardFontFamily={controlCardFontFamily}
                            onControlCardFontFamilyChange={setControlCardFontFamily}
                            controlCardTextEffect={controlCardTextEffect}
                            onControlCardTextEffectChange={setControlCardTextEffect}
                            controlCardStrokeColor={controlCardStrokeColor}
                            onControlCardStrokeColorChange={setControlCardStrokeColor}
                            // Vinyl Record props
                            vinylRecordEnabled={vinylRecordEnabled}
                            onVinylRecordEnabledChange={setVinylRecordEnabled}
                            vinylNeedleEnabled={vinylNeedleEnabled}
                            onVinylNeedleEnabledChange={setVinylNeedleEnabled}
                            // Chinese Control Card props
                            // chineseCardAlbumImage={chineseCardAlbumImage}
                            // onChineseCardAlbumImageChange={setChineseCardAlbumImage}
                            // chineseCardSongTitle={chineseCardSongTitle}
                            // onChineseCardSongTitleChange={setChineseCardSongTitle}
                            // chineseCardArtist={chineseCardArtist}
                            // onChineseCardArtistChange={setChineseCardArtist}
                            // chineseCardFontFamily={chineseCardFontFamily}
                            // onChineseCardFontFamilyChange={setChineseCardFontFamily}
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
            {/* <UnifiedFooter /> */}
        </div>
        
        {/* API Key 輸入彈出視窗 */}
        <ApiKeyModal
            isOpen={showApiKeyModal}
            onClose={handleApiKeyModalClose}
            onSave={handleApiKeySave}
            onSkip={handleApiKeySkip}
            title={apiQuotaExceeded ? "API 配額已用完" : "API Key 設定"}
            message={apiQuotaExceeded 
                ? "內建的 Gemini API 配額已用完，請輸入您自己的 API Key 以繼續使用 AI 功能。"
                : "請輸入您的 Gemini API Key 以使用 AI 字幕生成功能。"
            }
        />
        </>
    );
}

export default App;