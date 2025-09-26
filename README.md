# 音樂脈動-Sonic Pulse | 三合一完整版

## 🎯 專案概述

這是「音樂脈動-Sonic Pulse」的完整工具集合，整合了三大核心音樂創作工具，為音樂創作者提供一站式的專業解決方案。

**品牌名稱**：音樂脈動-Sonic Pulse  
**網路暱稱**：🐱 口袋裡的貓  
**YouTube 頻道**：[音樂脈動-Sonic Pulse](https://www.youtube.com/@%E9%9F%B3%E6%A8%82%E8%84%88%E5%8B%95SonicPulse)

## 📁 專案結構

```
music-pulse-unified-platform/
├── index.html                    # 主頁面（統一入口）
├── server.js                     # Node.js 服務器
├── package.json                  # 專案配置
├── railway.json                  # Railway 部署配置
├── Dockerfile                    # Docker 容器配置
├── assets/                       # 共用資源
│   ├── cat-avatar.png            # 個人頭像 (77K)
│   └── channel-avatar.png        # 頻道頭像
├── shared-components/            # 共享組件庫
│   ├── src/
│   │   ├── components/
│   │   │   ├── UnifiedHeader.tsx
│   │   │   ├── UnifiedFooter.tsx
│   │   │   └── ModalProvider.tsx
│   │   └── index.ts
│   └── dist/                     # 編譯後的組件
├── audio-visualizer/             # 音頻可視化器 Pro
│   ├── src/                      # 源代碼
│   ├── dist/                     # 構建輸出
│   ├── package.json
│   └── vite.config.ts
├── youtube-seo/                  # YouTube SEO 優化器
│   ├── src/                      # 源代碼
│   ├── dist/                     # 構建輸出
│   ├── package.json
│   └── vite.config.ts
├── font-effects/                 # 字體效果生成器
│   ├── src/                      # 源代碼
│   ├── dist/                     # 構建輸出
│   ├── package.json
│   └── vite.config.ts
└── docs/                         # 文檔
    ├── README.md
    ├── CHANGELOG.md
    ├── CONTRIBUTING.md
    ├── SECURITY.md
    └── LICENSE
```

## 🛠️ 三大核心工具

### 1. 🎵 音頻可視化器 Pro (`audio-visualizer/`)
- **功能**：實時音頻可視化，將音樂轉化為震撼的視覺效果
- **技術**：React + TypeScript + Tailwind CSS + Canvas
- **特色**：
  - 多種視覺效果模式（Monstercat、Luminous Wave、Fusion等）
  - AI 字幕生成（使用 Gemini API）
  - 視頻錄製和背景輪播
  - 捲軸字幕錄製
  - 逐字顯示字幕效果
  - 高品質渲染輸出

### 2. 📈 YouTube SEO 優化器 (`youtube-seo/`)
- **功能**：AI 驅動的 YouTube 標題、描述和標籤生成
- **技術**：React + TypeScript + Tailwind CSS
- **特色**：
  - AI 智能標題生成
  - 支援18種音樂風格
  - 自定義音樂風格輸入
  - 風格歷史記錄功能
  - SEO 評分系統
  - 多語言支援

### 3. 🎨 字體效果生成器 (`font-effects/`)
- **功能**：為音樂創作製作精美的字卡和封面
- **技術**：React + TypeScript + Canvas
- **特色**：
  - 多種文字特效（陰影、霓虹光、漸層等）
  - 豐富字體選擇（包含英文手寫體和寬體字）
  - 即時預覽
  - 高解析度輸出
  - 一鍵下載

## 🚀 Railway 部署

### 環境變數設定

在 Railway 中設定以下環境變數：

```bash
# Audio Visualizer 工具
VITE_API_KEY=your_gemini_api_key_here

# YouTube SEO 工具
GEMINI_API_KEY=your_gemini_api_key_here

# 服務器配置
PORT=3000
NODE_ENV=production
```

### 部署步驟

1. **連接 GitHub 倉庫**：
   - 在 Railway 中選擇 "Deploy from GitHub repo"
   - 選擇 `techtrekleo/Audio-Visualizer-3.0`

2. **設定環境變數**：
   - 在 Railway 專案設定中添加上述環境變數
   - 參考 `env.example` 文件獲取詳細說明

3. **部署配置**：
   - Railway 會自動使用 `railway.json` 和 `Dockerfile` 配置
   - 啟動命令：`npm start`

4. **訪問網站**：
   - Railway 會提供一個公開 URL
   - 主頁面：`https://your-app.railway.app/`
   - 工具頁面：
     - Audio Visualizer: `https://your-app.railway.app/audio-visualizer/`
     - YouTube SEO: `https://your-app.railway.app/youtube-seo/`
     - Font Effects: `https://your-app.railway.app/font-effects/`

## 🔧 本地開發

### 統一平台開發

```bash
# 克隆倉庫
git clone https://github.com/techtrekleo/Audio-Visualizer-3.0.git
cd Audio-Visualizer-3.0

# 安裝依賴
npm install

# 啟動開發服務器
npm start
# 訪問 http://localhost:3000
```

### 個別工具開發

1. **音頻可視化器**：
```bash
cd audio-visualizer
npm install
npm run dev
# 訪問 http://localhost:5173
```

2. **YouTube SEO 工具**：
```bash
cd youtube-seo
npm install
npm run dev
# 訪問 http://localhost:5173
```

3. **字體效果生成器**：
```bash
cd font-effects
npm install
npm run dev
# 訪問 http://localhost:5173
```

4. **共享組件庫**：
```bash
cd shared-components
npm install
npm run build
```

## 🤖 AI 整合

### Gemini API 配置

- **音頻可視化器**：使用 `VITE_API_KEY`
- **YouTube SEO 工具**：使用 `GEMINI_API_KEY`

### API 獲取步驟

1. 前往 [Google AI Studio](https://makersuite.google.com/app/apikey)
2. 登入您的 Google 帳戶
3. 點擊 "Create API Key"
4. 複製生成的 API 金鑰
5. 在 Railway 的 Variables 設定中添加相應的環境變數
6. 重新部署專案以讓變更生效

## 🎨 設計風格

- **主色調**：黑色到深灰色漸層背景
- **強調色**：粉紅到青色的漸層 (#ff6b9d → #4ecdc4)
- **字體**：Poppins 字體家族
- **效果**：毛玻璃效果、陰影、動畫

## 📊 技術特色

- ✅ **統一入口**：單一網站整合所有工具
- ✅ **現代化技術棧**：React 18、TypeScript、Tailwind CSS、Vite
- ✅ **AI 整合**：Google Gemini API
- ✅ **Railway 部署**：自動化部署和環境管理
- ✅ **Docker 容器化**：輕量級部署方案
- ✅ **共享組件系統**：統一的 UI 組件庫
- ✅ **響應式設計**：支援各種設備
- ✅ **統一品牌**：一致的視覺設計
- ✅ **版本管理**：Git 標籤和回滾功能
- ✅ **安全措施**：環境變數管理和安全標頭

## 📞 聯絡與支持

- **YouTube 頻道**：[音樂脈動-Sonic Pulse](https://www.youtube.com/@%E9%9F%B3%E6%A8%82%E8%84%88%E5%8B%95SonicPulse)
- **贊助支持**：[Buy Me a Coffee](https://buymeacoffee.com/sonicpulse2025)
- **GitHub**：[techtrekleo/Audio-Visualizer-3.0](https://github.com/techtrekleo/Audio-Visualizer-3.0)
- **Discord**：[加入我們的社群](https://discord.com/users/104427212337332224)
- **Threads**：[@sonicpulse.taiwan](https://www.threads.com/@sonicpulse.taiwan)
- **Email**：contact@sonicpulse.com

## 📚 文檔

- [CHANGELOG.md](CHANGELOG.md) - 版本更新記錄
- [CONTRIBUTING.md](CONTRIBUTING.md) - 貢獻指南
- [SECURITY.md](SECURITY.md) - 安全政策
- [LICENSE](LICENSE) - 授權條款
- [env.example](env.example) - 環境變數配置範例

## 📝 授權

本專案採用 MIT 授權。詳見 [LICENSE](LICENSE) 文件。

© 2025 音樂脈動-Sonic Pulse. 保留所有權利.

---

**用 ❤️ 為音樂創作者打造** | 🐱 口袋裡的貓
