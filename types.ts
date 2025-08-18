

export enum VisualizationType {
    MONSTERCAT = 'Monstercat',
    MONSTERCAT_GLITCH = 'Monstercat (故障版)',
    NEBULA_WAVE = 'Nebula Wave',
    LUMINOUS_WAVE = 'Luminous Wave',
    FUSION = 'Fusion',
    TECH_WAVE = 'Tech Wave',
    STELLAR_CORE = 'Stellar Core',
    RADIAL_BARS = 'Radial Bars',
    PARTICLE_GALAXY = 'Particle Galaxy',
    LIQUID_METAL = 'Liquid Metal',
    CRT_GLITCH = 'CRT Glitch',
    GLITCH_WAVE = 'Glitch Wave',
    DATA_MOSH = '數據熔接 (Data Mosh)',
    SIGNAL_SCRAMBLE = '訊號干擾 (Signal Scramble)',
    PIXEL_SORT = '像素排序 (Pixel Sort)',
    REPULSOR_FIELD = '排斥力場',
    AUDIO_LANDSCAPE = '音訊地貌',
    PIANO_VIRTUOSO = '鋼琴演奏家',
    RECORD_PLAYER = '唱片機',
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
    SHADOW = '陰影',
    STROKE = '描邊',
    GLITCH = '故障感',
    NONE = '無',
}

export enum Resolution {
    P720 = '720p (1280x720)',
    P1080 = '1080p (1920x1080)',
    P4K = '4K (3840x2160)',
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
    NONE = '無',
    SEMI_TRANSPARENT = '半透明',
    SOLID = '實色',
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