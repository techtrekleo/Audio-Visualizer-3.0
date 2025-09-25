// --- 字體設定 ---
export const fonts = [
  { id: 'noto-sans-tc-900', name: '思源黑體 (黑)', family: 'Noto Sans TC', weight: 900 },
  { id: 'taipei-sans-700', name: '台北黑體 (粗)', family: 'Taipei Sans TC Beta', weight: 700 },
  { id: 'noto-sans-tc-500', name: '思源黑體 (中)', family: 'Noto Sans TC', weight: 500 },
  { id: 'm-plus-rounded-1c-700', name: '圓體 (粗)', family: 'M PLUS Rounded 1c', weight: 700 },
  { id: 'hina-mincho', name: '日式明朝', family: 'Hina Mincho', weight: 400 },
  { id: 'jason-handwriting-1', name: '清松手寫體 v1', family: 'Jason Handwriting 1', weight: 400 },
  { id: 'jason-handwriting-2', name: '清松手寫體 v2', family: 'Jason Handwriting 2', weight: 400 },
  { id: 'rocknroll-one', name: '搖滾圓體', family: 'RocknRoll One', weight: 400 },
  { id: 'reggae-one', name: '雷鬼 Stencil', family: 'Reggae One', weight: 400 },
  { id: 'rampart-one', name: '立體裝甲', family: 'Rampart One', weight: 400 },
  { id: 'poppins-bold', name: 'Poppins (粗體)', family: 'Poppins', weight: 700 },
  { id: 'roboto-mono', name: 'Roboto Mono', family: 'Roboto Mono', weight: 400 },
  { id: 'open-sans', name: 'Open Sans', family: 'Open Sans', weight: 400 },
  { id: 'lato', name: 'Lato', family: 'Lato', weight: 400 },
  { id: 'montserrat', name: 'Montserrat', family: 'Montserrat', weight: 400 },
  { id: 'source-sans-pro', name: 'Source Sans Pro', family: 'Source Sans Pro', weight: 400 },
  { id: 'raleway', name: 'Raleway', family: 'Raleway', weight: 400 },
  { id: 'ubuntu', name: 'Ubuntu', family: 'Ubuntu', weight: 400 },
  { id: 'playfair-display', name: 'Playfair Display', family: 'Playfair Display', weight: 400 },
  { id: 'merriweather', name: 'Merriweather', family: 'Merriweather', weight: 400 },
  { id: 'oswald', name: 'Oswald', family: 'Oswald', weight: 400 },
  { id: 'lobster', name: 'Lobster', family: 'Lobster', weight: 400 },
  { id: 'dancing-script', name: 'Dancing Script (手寫體)', family: 'Dancing Script', weight: 400 },
  { id: 'caveat', name: 'Caveat (手寫體)', family: 'Caveat', weight: 400 },
  { id: 'kalam', name: 'Kalam (手寫體)', family: 'Kalam', weight: 400 },
  { id: 'comfortaa', name: 'Comfortaa (圓體)', family: 'Comfortaa', weight: 400 },
  { id: 'fredoka-one', name: 'Fredoka One (寬體)', family: 'Fredoka One', weight: 400 },
  { id: 'nunito', name: 'Nunito (寬體)', family: 'Nunito', weight: 400 },
  { id: 'quicksand', name: 'Quicksand (寬體)', family: 'Quicksand', weight: 400 },
  { id: 'rubik', name: 'Rubik (寬體)', family: 'Rubik', weight: 400 },
] as const;


// --- 本地 Canvas 特效設定 ---
export const effects = [
  { id: 'none', name: '無' },
  { id: 'bold', name: '粗體' },
  { id: 'shadow', name: '陰影' },
  { id: 'neon', name: '霓虹光' },
  { id: 'outline', name: '描邊' },
  { id: 'faux-3d', name: '偽3D' },
  { id: 'glitch', name: '故障感' },
] as const;

// --- 畫布尺寸設定 ---
export const canvasSizes = [
  { id: 'square', name: '方形 (1:1)', width: 1080, height: 1080 },
  { id: 'youtube_hd', name: 'YT影片 (16:9)', width: 1920, height: 1080 },
  { id: 'youtube_thumb', name: 'YT縮圖 (16:9)', width: 1280, height: 720 },
  { id: 'youtube_short', name: 'YT Short (9:16)', width: 1080, height: 1920 },
] as const;

// --- 預設顏色 ---
export const DEFAULT_COLOR_1 = '#FFFFFF';
export const DEFAULT_COLOR_2 = '#000000';