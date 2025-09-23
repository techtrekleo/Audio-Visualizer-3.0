

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
}

// 特效分類系統
export enum EffectCategory {
    BASIC = '基礎款',
    ADVANCED = '進階款',
    EXPERIMENTAL = '實驗款',
    SPECIAL = '特殊款'
}

export interface EffectInfo {
    type: VisualizationType;
    category: EffectCategory;
    description: string;
    difficulty: 'easy' | 'medium' | 'hard';
    performance: 'low' | 'medium' | 'high';
    tags: string[];
}

export enum FontType {
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
}

export enum GraphicEffectType {
    GLOW = '霓虹光',
    STROKE = '描邊',
    GLITCH = '故障感',
    NONE = '無',
}

export enum Resolution {
    P720 = '720p (1280x720)',
    P1080 = '1080p (1920x1080)',
    P4K = '4K (3840x2160)',
    SQUARE_1080 = '1:1 (1080x1080)',
    SQUARE_4K = '1:1 (2160x2160)',
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
};

export type Palette = {
    name: ColorPaletteType;
    primary: string;
    secondary: string;
    accent: string;
    backgroundGlow: string;
    hueRange: [number, number];
};