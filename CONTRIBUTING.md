# Contributing to 音樂脈動-Sonic Pulse

感謝您對音樂脈動-Sonic Pulse 專案的關注！我們歡迎各種形式的貢獻。

## 🎯 專案概述

音樂脈動-Sonic Pulse 是一個為音樂創作者打造的三合一工具平台，包含：
- 🎵 Audio Visualizer Pro - 音頻可視化工具
- 📈 YouTube SEO 優化器 - AI 標題生成工具  
- 🎨 字體效果生成器 - 字卡製作工具

## 🤝 如何貢獻

### 報告問題 (Bug Reports)

如果您發現了問題，請：

1. 檢查 [Issues](https://github.com/techtrekleo/Audio-Visualizer-3.0/issues) 是否已有相同問題
2. 創建新的 Issue，包含：
   - 問題描述
   - 重現步驟
   - 預期行為 vs 實際行為
   - 環境信息（瀏覽器、操作系統等）
   - 截圖或錄屏（如適用）

### 功能建議 (Feature Requests)

我們歡迎新功能建議！請：

1. 檢查現有 Issues 避免重複
2. 詳細描述功能需求
3. 說明使用場景和預期效果
4. 提供設計草圖或參考（如適用）

### 代碼貢獻 (Code Contributions)

#### 開發環境設置

1. **克隆倉庫**
   ```bash
   git clone https://github.com/techtrekleo/Audio-Visualizer-3.0.git
   cd Audio-Visualizer-3.0
   ```

2. **安裝依賴**
   ```bash
   npm install
   ```

3. **啟動開發服務器**
   ```bash
   npm start
   ```

4. **個別工具開發**
   ```bash
   # Audio Visualizer
   cd audio-visualizer
   npm install
   npm run dev

   # YouTube SEO
   cd youtube-seo
   npm install
   npm run dev

   # Font Effects
   cd font-effects
   npm install
   npm run dev
   ```

#### 提交規範

我們使用 [Conventional Commits](https://www.conventionalcommits.org/) 規範：

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**類型 (Types):**
- `feat`: 新功能
- `fix`: 修復問題
- `docs`: 文檔更新
- `style`: 代碼格式調整
- `refactor`: 代碼重構
- `test`: 測試相關
- `chore`: 構建過程或輔助工具的變動

**範例:**
```
feat(audio-visualizer): add new visual effect mode
fix(youtube-seo): resolve API key validation issue
docs: update README with new deployment instructions
```

#### Pull Request 流程

1. **創建分支**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **提交更改**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

3. **推送分支**
   ```bash
   git push origin feature/your-feature-name
   ```

4. **創建 Pull Request**
   - 填寫 PR 描述
   - 關聯相關 Issues
   - 添加截圖或錄屏（如適用）

#### 代碼規範

- **TypeScript**: 使用 TypeScript 進行類型安全開發
- **ESLint**: 遵循 ESLint 規則
- **Prettier**: 使用 Prettier 進行代碼格式化
- **命名規範**: 使用有意義的變數和函數名稱
- **註釋**: 為複雜邏輯添加註釋

#### 測試

- 確保新功能在主要瀏覽器中正常工作
- 測試響應式設計
- 驗證無障礙功能
- 檢查性能影響

## 🎨 設計指南

### 品牌規範

- **主色調**: 黑色到深灰色漸層背景
- **強調色**: 粉紅到青色的漸層 (#ff6b9d → #4ecdc4)
- **字體**: Poppins 字體家族
- **圖標**: Font Awesome 6.4.0
- **效果**: 毛玻璃效果、陰影、動畫

### UI 組件

- 使用 Tailwind CSS 進行樣式設計
- 遵循現有的組件結構
- 保持響應式設計
- 確保無障礙功能

## 📝 文檔貢獻

我們歡迎文檔改進：

- 修復錯別字或語法錯誤
- 改進說明清晰度
- 添加使用範例
- 翻譯文檔

## 🐛 安全問題

如果您發現安全漏洞，請：

1. **不要** 在公開 Issues 中報告
2. 發送郵件至：security@sonicpulse.com
3. 包含詳細的重現步驟
4. 我們會盡快回應並修復

## 📞 聯絡方式

- **GitHub**: [techtrekleo/Audio-Visualizer-3.0](https://github.com/techtrekleo/Audio-Visualizer-3.0)
- **YouTube**: [音樂脈動-Sonic Pulse](https://www.youtube.com/@%E9%9F%B3%E6%A8%82%E8%84%88%E5%8B%95SonicPulse)
- **Email**: contact@sonicpulse.com
- **Discord**: [加入我們的社群](https://discord.com/users/104427212337332224)

## 📄 授權

本專案採用 MIT 授權。詳見 [LICENSE](LICENSE) 文件。

## 🙏 致謝

感謝所有貢獻者的支持！您的每一份貢獻都讓這個專案變得更好。

---

**用 ❤️ 為音樂創作者打造** | 🐱 口袋裡的貓

