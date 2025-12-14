

export enum VisualizationType {
    MONSTERCAT = 'Monstercat',
    MONSTERCAT_V2 = 'Monstercat (新版)',
    MONSTERCAT_GLITCH = 'Monstercat (故障版)',
    NEBULA_WAVE = 'Nebula Wave',
    LUMINOUS_WAVE = 'Luminous Wave',
    FUSION = 'Fusion',
    TECH_WAVE = '量子脈衝 (Quantum Pulse)',
    STELLAR_CORE = 'Stellar Core',
    WATER_RIPPLE = '水波涟漪 (Water Ripple)',
    RADIAL_BARS = 'Radial Bars',
    PARTICLE_GALAXY = '完整星系 (Full Galaxy)',
    LIQUID_METAL = '金屬花朵 (Metal Flower)',
    CRT_GLITCH = 'CRT Glitch',
    GLITCH_WAVE = 'Glitch Wave',
    DATA_MOSH = '數位熔接 (Digital Mosh)',
    SIGNAL_SCRAMBLE = '訊號干擾 (Signal Scramble)',
    PIXEL_SORT = '數位風暴 (Digital Storm)',
    REPULSOR_FIELD = '排斥力場 (Repulsion Field)',
    AUDIO_LANDSCAPE = '音訊地貌',
    PIANO_VIRTUOSO = '鋼琴演奏家',
    GEOMETRIC_BARS = '可夜特別訂製版',
    Z_CUSTOM = 'Z總訂製款',
    VINYL_RECORD = '唱片加控制卡',
    CHINESE_CONTROL_CARD = '中國風控制卡',
    BASIC_WAVE = '歐皇訂製版',
    LYRIC_PULSE_LINE = '歌詞脈衝線 (Lyric Pulse Line)',
    DYNAMIC_CONTROL_CARD = '重低音強化',
    FRAME_PIXELATION = '方框 像素化',
    PHOTO_SHAKE = '相片晃動',
    CIRCULAR_WAVE = '圓形波形',
    BLURRED_EDGE = '邊緣虛化',
    KE_YE_CUSTOM_V2 = '可夜訂製版二號',
}

// 特效分類系統
export enum EffectCategory {
    BASIC = '基礎款',
    ADVANCED = '進階款',
    EXPERIMENTAL = '實驗款',
    SPECIAL = '特殊款',
    DYNAMIC_CONTROL = '動態控制卡'
}

export interface EffectInfo {
    type: VisualizationType;
    category: EffectCategory;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
    performance: 'low' | 'medium' | 'high';
    tags: string[];
}

// 全畫面濾鏡特效類型
export enum FilterEffectType {
    SNOW = 'snow',
    PARTICLES = 'particles', 
    STARS = 'stars',
    RAIN = 'rain',
    CHERRY_BLOSSOM = 'cherry-blossom',
    LIGHTNING = 'lightning',
    GLITCH1 = 'glitch1',
    GLITCH2 = 'glitch2'
}

// 可夜訂製版控制卡樣式類型
export enum ControlCardStyle {
    FILLED = 'filled',      // 填充模式
    OUTLINE = 'outline',    // 外框模式
    TRANSPARENT = 'transparent' // 透明模式
}

export enum FontType {
    // 原有字體
    POPPINS = 'Poppins',
    ORBITRON = 'Orbitron',
    LOBSTER = 'Lobster',
    BUNGEE = 'Bungee',
    PRESS_START_2P = 'Press Start 2P',
    PACIFICO = 'Pacifico',
    DANCING_SCRIPT = 'Dancing Script',
    ROCKNROLL_ONE = 'RocknRoll One',
    REGGAE_ONE = 'Reggae One',
    VT323 = 'VT323',
    NOTO_SANS_TC = 'Noto Sans TC',
    SOURCE_HAN_SANS = 'Source Han Sans',
    CW_TEX_KAI = 'cwTeXKai',
    KLEE_ONE = 'Klee One',
    QINGSONG_1 = 'QingSong 1',
    QINGSONG_2 = 'QingSong 2',
    // 新增字體（來自封面產生器）
    TAIPEI_SANS = 'Taipei Sans TC Beta',
    M_PLUS_ROUNDED = 'M PLUS Rounded 1c',
    HINA_MINCHO = 'Hina Mincho',
    RAMPART_ONE = 'Rampart One',
    ROBOTO_MONO = 'Roboto Mono',
    OPEN_SANS = 'Open Sans',
    LATO = 'Lato',
    MONTSERRAT = 'Montserrat',
    SOURCE_SANS_PRO = 'Source Sans Pro',
    RALEWAY = 'Raleway',
    UBUNTU = 'Ubuntu',
    PLAYFAIR_DISPLAY = 'Playfair Display',
    MERRIWEATHER = 'Merriweather',
    OSWALD = 'Oswald',
    CAVEAT = 'Caveat',
    KALAM = 'Kalam',
    COMFORTAA = 'Comfortaa',
    FREDOKA_ONE = 'Fredoka One',
    NUNITO = 'Nunito',
    QUICKSAND = 'Quicksand',
    RUBIK = 'Rubik',
    NOTO_SERIF_TC = 'Noto Serif TC',
    MA_SHAN_ZHENG = 'Ma Shan Zheng',
    ZHI_MANG_XING = 'Zhi Mang Xing',
    LONG_CANG = 'Long Cang',
    ZCOOL_KUAI_LE = 'ZCOOL KuaiLe',
    ZCOOL_QING_KE = 'ZCOOL QingKe HuangYou',
    LIU_JIAN_MAO_CAO = 'Liu Jian Mao Cao',
    ZCOOL_XIAO_WEI = 'ZCOOL XiaoWei',
    BAKUDAI = 'Bakudai',
    MASA_FONT = 'Masa Font',
}

export enum BackgroundColorType {
    BLACK = '黑色',
    GREEN = '綠色',
    WHITE = '白色',
    TRANSPARENT = '透明',
}

export enum ColorPaletteType {
    DEFAULT = '預設',
    CYBERPUNK = '賽博龐克',
    SUNSET = '日落',
    GLACIER = '冰川',
    LAVA = '熔岩',
    MIDNIGHT = '午夜',
    WHITE = '純白',
    RAINBOW = '彩虹',
    CUSTOM = '自選色彩',
}

export enum GraphicEffectType {
    NONE = '無',
    BOLD = '粗體',
    SHADOW = '陰影',
    NEON = '霓虹光',
    OUTLINE = '描邊',
    FAUX_3D = '偽3D',
    GLITCH = '故障感',
}

// 字幕特效類型（參考封面產生器）
export enum SubtitleEffectType {
    NONE = '無',
    BOLD = '粗體',
    SHADOW = '陰影',
    NEON = '霓虹光',
    OUTLINE = '描邊',
    FAUX_3D = '偽3D',
    GLITCH = '故障感',
}

export enum Resolution {
    P720 = '720p (1280x720)',
    P1080 = '1080p (1920x1080)',
    P4K = '4K (3840x2160)',
    SQUARE_1080 = '1:1 (1080x1080)',
    SQUARE_4K = '1:1 (2160x2160)',
    RATIO_2_1_4K = '2:1 (4096x2048)',
    RATIO_2_1_1080 = '2:1 (1920x960)',
    RATIO_2_1_720 = '2:1 (1280x640)',
    CURRENT = '符合螢幕',
}

export enum WatermarkPosition {
    BOTTOM_RIGHT = '右下角',
    BOTTOM_LEFT = '左下角',
    TOP_RIGHT = '右上角',
    TOP_LEFT = '左上角',
    CENTER = '正中心',
}

export enum SubtitleBgStyle {
    NONE = '無背景',
    TRANSPARENT = '透明背景',
    BLACK = '黑色背景',
}

export enum SubtitleDisplayMode {
    NONE = '無字幕',
    CLASSIC = '傳統字幕',
    LYRICS_SCROLL = '捲軸歌詞',
    WORD_BY_WORD = '逐字顯示',
    SLIDING_GROUP = '滾動字幕組',
    FADE_LINES = '淡入淡出（上下線）',
    PARTIAL_BLUR = '局部模糊',
}

export enum SubtitleFormat {
    BRACKET = '方括號格式 [00:00.00]',
    SRT = 'SRT格式 00:00:14,676 --> 00:00:19,347',
}

export enum SubtitleLanguage {
    CHINESE = '繁體中文',
    ENGLISH = 'English',
    KOREAN = '한국어',
    JAPANESE = '日本語',
}

export enum SubtitleOrientation {
    HORIZONTAL = '橫式',
    VERTICAL = '直式',
}

export enum TransitionType {
    TV_STATIC = '電視雜訊',
    FADE = '淡入淡出',
    SLIDE_LEFT = '向左滑動',
    SLIDE_RIGHT = '向右滑動',
    SLIDE_UP = '向上滑動',
    SLIDE_DOWN = '向下滑動',
    ZOOM_IN = '放大',
    ZOOM_OUT = '縮小',
    SPIRAL = '螺旋',
    WAVE = '波浪',
    DIAMOND = '菱形',
    CIRCLE = '圓形',
    BLINDS = '百葉窗',
    CHECKERBOARD = '棋盤格',
    RANDOM_PIXELS = '隨機像素',
}

export type Subtitle = {
    time: number;
    text: string;
    endTime?: number; // 結束時間（可選）
};

export interface AudioVisualizerProps {
    analyser: AnalyserNode | null;
    audioRef: React.RefObject<HTMLAudioElement>;
    visualizationType: VisualizationType;
    // When enabled, the visualizer will draw multiple selected visualization types sequentially in one frame.
    multiEffectEnabled?: boolean;
    selectedVisualizationTypes?: VisualizationType[];
    // Per-effect offsets used in multi-effect mode (pixels)
    multiEffectOffsets?: Partial<Record<VisualizationType, { x: number; y: number }>>;
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
    // Fade-lines subtitle mode options
    subtitleFadeInSeconds?: number;
    subtitleFadeOutSeconds?: number;
    subtitleLineColor?: string;
    subtitleLineThickness?: number;
    subtitleLineGap?: number;
    subtitleFadeLinesEnabled?: boolean;
    effectScale: number;
    effectOffsetX: number;
    effectOffsetY: number;
    effectRotation: number; // degrees
    // Lyrics Display props
    showLyricsDisplay: boolean;
    currentTime: number;
    lyricsFontSize: number;
    lyricsFontFamily: FontType;
    lyricsPositionX: number;
    lyricsPositionY: number;
    subtitleDisplayMode: SubtitleDisplayMode;
    subtitleOrientation?: SubtitleOrientation;
    verticalSubtitlePosition?: number;
    horizontalSubtitlePosition?: number;
    verticalSubtitleVerticalPosition?: number;
    horizontalSubtitleVerticalPosition?: number;
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
    ctaFontFamily?: FontType;
    ctaTextColor?: string;
    ctaStrokeColor?: string;
    ctaTextEffect?: GraphicEffectType;
    ctaPosition?: { x: number; y: number };
    onCtaPositionUpdate?: (position: { x: number; y: number }) => void;
    // Z總訂製款狀態
    zCustomCenterImage?: string | null;
    zCustomScale?: number;
    zCustomPosition?: { x: number; y: number };
    onZCustomPositionUpdate?: (position: { x: number; y: number }) => void;
    // Vinyl Record 實驗款
    vinylImage?: string | null;
    vinylLayoutMode?: 'horizontal' | 'vertical';
    vinylRecordEnabled?: boolean;
    vinylNeedleEnabled?: boolean;
    // 中國風控制卡
    chineseCardAlbumImage?: string | null;
    chineseCardSongTitle?: string;
    chineseCardArtist?: string;
    chineseCardFontFamily?: FontType;
    chineseCardPrimaryColor?: string;
    chineseCardBackgroundOpacity?: number;

    // Stellar Core (進階款) opacities
    stellarCoreInnerOpacity?: number; // 0-1
    stellarCoreTentaclesOpacity?: number; // 0-1
}

export type Palette = {
    name: ColorPaletteType;
    primary: string;
    secondary: string;
    accent: string;
    backgroundGlow: string;
    hueRange: [number, number];
};

// 批量上传歌曲数据结构
export interface SongItem {
    id: string; // 唯一标识
    audioFile: File | null;
    audioUrl: string;
    audioDuration: number;
    backgroundImage: string | null; // 图片URL
    backgroundVideo: string | null; // 视频URL
    subtitlesRawText: string; // 字幕原始文本
    subtitles: Subtitle[]; // 解析后的字幕
    songName?: string; // 歌曲名称（可选）
}
