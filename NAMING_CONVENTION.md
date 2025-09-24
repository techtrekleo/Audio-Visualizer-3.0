# 音樂脈動-Sonic Pulse 統一命名規範

## 1. AI API 變數命名規範

### 環境變數命名
```
VITE_GEMINI_API_KEY_AUDIO_VISUALIZER  # 音頻可視化工具專用
VITE_GEMINI_API_KEY_YOUTUBE_SEO       # YouTube SEO 工具專用  
VITE_GEMINI_API_KEY_FONT_EFFECTS      # 字體特效工具專用
```

### 代碼中的變數命名
```typescript
// 音頻可視化工具
const audioVisualizerApiKey = (import.meta as any).env.VITE_GEMINI_API_KEY_AUDIO_VISUALIZER;

// YouTube SEO 工具
const youtubeSeoApiKey = (import.meta as any).env.VITE_GEMINI_API_KEY_YOUTUBE_SEO;

// 字體特效工具
const fontEffectsApiKey = (import.meta as any).env.VITE_GEMINI_API_KEY_FONT_EFFECTS;
```

## 2. 函數命名規範

### 組件命名
```typescript
// 音頻可視化工具
AudioVisualizerApp
AudioVisualizerControls
AudioVisualizerCanvas

// YouTube SEO 工具
YouTubeSeoApp
YouTubeSeoForm
YouTubeSeoResult

// 字體特效工具
FontEffectsApp
FontEffectsCanvas
FontEffectsControls
```

### 工具函數命名
```typescript
// 音頻可視化工具
audioVisualizerUtils
drawAudioVisualization
processAudioData

// YouTube SEO 工具
youtubeSeoUtils
generateYouTubeTitle
optimizeYouTubeDescription

// 字體特效工具
fontEffectsUtils
renderFontEffect
generateFontImage
```

## 3. CSS 類名規範

### 命名空間前綴
```css
/* 音頻可視化工具 */
.av-app
.av-controls
.av-canvas
.av-visualization

/* YouTube SEO 工具 */
.yt-app
.yt-form
.yt-result
.yt-optimization

/* 字體特效工具 */
.fe-app
.fe-canvas
.fe-controls
.fe-text-block
```

## 4. 依賴包統一規範

### 核心依賴版本
```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "typescript": "^5.2.2",
  "vite": "^5.2.0",
  "@google/generative-ai": "^0.2.1"
}
```

### 開發依賴版本
```json
{
  "@types/react": "^18.2.66",
  "@types/react-dom": "^18.2.22",
  "@vitejs/plugin-react": "^4.2.1",
  "tailwindcss": "^3.4.3"
}
```

## 5. 構建配置統一規範

### package.json scripts
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "start": "node start.js",
    "postinstall": "npm run build"
  }
}
```

### vite.config.ts 統一配置
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  }
})
```

## 6. 服務器配置統一規範

### 統一使用 Node.js HTTP 服務器
```javascript
// start.js
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8000;

const server = http.createServer((req, res) => {
  // 統一的靜態文件服務邏輯
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
```

## 7. 文件結構規範

### 統一目錄結構
```
tool-name/
├── src/
│   ├── components/
│   ├── utils/
│   ├── types/
│   └── App.tsx
├── dist/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
└── start.js
```

## 8. 環境變數規範

### Railway 環境變數設置
```
VITE_GEMINI_API_KEY_AUDIO_VISUALIZER=your_key_here
VITE_GEMINI_API_KEY_YOUTUBE_SEO=your_key_here
VITE_GEMINI_API_KEY_FONT_EFFECTS=your_key_here
PORT=8000
```

## 9. Git 提交規範

### 提交訊息格式
```
feat(audio-visualizer): 添加新的可視化效果
fix(youtube-seo): 修復標題生成問題
docs(font-effects): 更新使用說明
refactor(shared): 統一命名規範
```

## 10. 測試規範

### 測試文件命名
```
audio-visualizer.test.ts
youtube-seo.test.ts
font-effects.test.ts
shared-utils.test.ts
```

---

**注意事項：**
1. 所有變數名必須包含工具前綴
2. 避免使用通用名稱如 `App`, `Main`, `Utils`
3. 保持命名的一致性和可讀性
4. 定期檢查和更新依賴包版本
5. 確保所有工具使用相同的構建和部署流程
