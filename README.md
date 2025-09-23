# 音樂脈動-Sonic Pulse | 三合一完整版

## 🎯 專案概述

這是「音樂脈動-Sonic Pulse」的完整工具集合，整合了三大核心音樂創作工具，為音樂創作者提供一站式的專業解決方案。

**品牌名稱**：音樂脈動-Sonic Pulse  
**網路暱稱**：🐱 口袋裡的貓  
**YouTube 頻道**：[音樂脈動-Sonic Pulse](https://www.youtube.com/@%E9%9F%B3%E6%A8%82%E8%84%88%E5%8B%95SonicPulse)

## 📁 統一網站結構

```
unified-website/
├── index.html                    # 主頁面（統一入口）
├── assets/                       # 共用資源
│   ├── cat-avatar.png            # 個人頭像
│   └── channel-avatar.png        # 頻道頭像
├── config/
│   └── env.js                    # 統一環境變數管理
└── tools/                        # 工具集合
    ├── visualizer/               # 音頻可視化器 Pro
    │   └── index.html            # 重定向到 可視化github-source/
    ├── seo/                      # YouTube SEO 優化器
    │   └── index.html            # 重定向到 youtube-title-seo-github/
    └── font-effects/             # 字體效果生成器
        └── index.html            # 重定向到 font-effects-generator-github/
```

## 🛠️ 三大核心工具

### 1. 🎵 音頻可視化器 Pro (`可視化github-source/`)
- **功能**：實時音頻可視化，將音樂轉化為震撼的視覺效果
- **技術**：React + TypeScript + Tailwind CSS + Canvas
- **特色**：
  - 多種視覺效果模式（Monstercat、Luminous Wave、Fusion等）
  - AI 字幕生成（使用 Gemini API）
  - 視頻錄製和背景輪播
  - 捲軸字幕錄製
  - 高品質渲染輸出

### 2. 📈 YouTube SEO 優化器 (`youtube-title-seo-github/`)
- **功能**：AI 驅動的 YouTube 標題、描述和標籤生成
- **技術**：React + TypeScript + Tailwind CSS
- **特色**：
  - AI 智能標題生成
  - 支援18種音樂風格
  - SEO 評分系統
  - 多語言支援
  - 歷史紀錄功能

### 3. 🎨 字體效果生成器 (`font-effects-generator-github/`)
- **功能**：為音樂創作製作精美的字卡和封面
- **技術**：React + TypeScript + Canvas
- **特色**：
  - 多種文字特效（陰影、霓虹光、漸層等）
  - 豐富字體選擇
  - 即時預覽
  - 高解析度輸出
  - 一鍵下載

## 🚀 Railway 部署

### 環境變數設定

在 Railway 中設定以下環境變數：

```bash
# YouTube Title SEO 工具
VITE_GEMINI_API_KEY_SEO=your_gemini_api_key_here

# Audio Visualizer 工具  
VITE_GEMINI_API_KEY_VISUALIZER=your_gemini_api_key_here
```

### 部署步驟

1. **連接 GitHub 倉庫**：
   - 在 Railway 中選擇 "Deploy from GitHub repo"
   - 選擇 `techtrekleo/Audio-Visualizer-3.0`

2. **設定環境變數**：
   - 在 Railway 專案設定中添加上述環境變數

3. **部署配置**：
   - Railway 會自動使用 `railway.json` 配置
   - 啟動命令：`cd unified-website && python3 -m http.server 8000`

4. **訪問網站**：
   - Railway 會提供一個公開 URL
   - 主頁面：`https://your-app.railway.app/`
   - 工具頁面：`https://your-app.railway.app/tools/visualizer/`

## 🔧 本地開發

### 統一網站開發

```bash
# 啟動統一網站
cd unified-website
python3 -m http.server 3000
# 訪問 http://localhost:3000
```

### 個別工具開發

1. **音頻可視化器**：
```bash
cd 可視化github-source
npm install
npm run dev
```

2. **YouTube SEO 工具**：
```bash
cd youtube-title-seo-github
npm install
npm run dev
```

3. **字體效果生成器**：
```bash
cd font-effects-generator-github
npm install
npm run dev
```

## 🤖 AI 整合

### Gemini API 配置

- **音頻可視化器**：使用 `VITE_GEMINI_API_KEY_VISUALIZER`
- **YouTube SEO 工具**：使用 `VITE_GEMINI_API_KEY_SEO`

### API 調度

Railway 會自動處理 API 調度，確保各工具使用正確的 API 金鑰。

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
- ✅ **響應式設計**：支援各種設備
- ✅ **統一品牌**：一致的視覺設計

## 📞 聯絡與支持

- **YouTube 頻道**：[音樂脈動-Sonic Pulse](https://www.youtube.com/@%E9%9F%B3%E6%A8%82%E8%84%88%E5%8B%95SonicPulse)
- **贊助支持**：[Buy Me a Coffee](https://buymeacoffee.com/sonicpulse2025)
- **GitHub**：[techtrekleo/Audio-Visualizer-3.0](https://github.com/techtrekleo/Audio-Visualizer-3.0)
- **Email**：contact@sonicpulse.com

## 📝 授權

© 2025 音樂脈動-Sonic Pulse. 保留所有權利.

---

**用 ❤️ 為音樂創作者打造** | 🐱 口袋裡的貓
