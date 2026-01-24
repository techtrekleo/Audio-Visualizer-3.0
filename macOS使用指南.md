# macOS 使用指南

專為 iMac 和 MacBook 使用者設計的完整指南。

## 🚀 快速開始

### 方法一：直接運行 Python 腳本（最簡單）

```bash
# 1. 打開「終端機」（Terminal）
#    可以在「應用程式」>「工具程式」中找到

# 2. 安裝依賴
pip3 install requests

# 3. 運行 GUI 版本
python3 suno-subtitle-downloader-gui.py
```

### 方法二：打包成 .app 應用程式（推薦）

打包後可以像一般 macOS 應用程式一樣使用，不需要打開終端機。

```bash
# 1. 安裝打包工具
pip3 install pyinstaller

# 2. 執行 macOS 專用打包腳本
python3 build_macos_app.py
```

打包完成後：
- 應用程式位於 `dist/Suno字幕下載工具.app`
- 雙擊即可運行
- 可以拖到「應用程式」資料夾
- 可以建立別名放在桌面

## 📦 打包成 .app 應用程式

### 步驟 1: 安裝 PyInstaller

```bash
pip3 install pyinstaller
```

### 步驟 2: 執行打包腳本

```bash
python3 build_macos_app.py
```

腳本會自動：
- ✅ 清理舊的打包檔案
- ✅ 建立 macOS .app 應用程式
- ✅ 設定正確的 Bundle ID
- ✅ 在 Finder 中顯示應用程式
- ✅ 可選：建立 DMG 安裝檔

### 步驟 3: 使用應用程式

1. **找到應用程式**
   - 在 `dist/` 目錄中找到 `Suno字幕下載工具.app`

2. **首次運行**
   - 雙擊應用程式
   - 如果出現「無法打開，因為來自身份不明的開發者」：
     - 右鍵點擊應用程式
     - 選擇「打開」
     - 在彈出對話框中點擊「打開」

3. **移動到應用程式資料夾**
   - 將 `.app` 拖到「應用程式」資料夾
   - 之後可以在 Launchpad 或 Spotlight 中找到

4. **建立桌面快捷方式**
   - 右鍵點擊應用程式
   - 選擇「製作別名」
   - 將別名拖到桌面

## 🔒 解決安全警告

### 問題：無法打開應用程式

macOS 可能會阻止未簽名的應用程式運行。

**解決方法：**

1. **方法一：右鍵打開**
   - 右鍵點擊應用程式
   - 選擇「打開」
   - 在彈出對話框中點擊「打開」

2. **方法二：系統偏好設定**
   - 打開「系統偏好設定」>「安全性與隱私」
   - 在「一般」標籤中，點擊「仍要打開」

3. **方法三：終端機命令（進階）**
   ```bash
   sudo xattr -rd com.apple.quarantine "dist/Suno字幕下載工具.app"
   ```

## 📁 檔案結構

打包後的結構：

```
dist/
└── Suno字幕下載工具.app/
    └── Contents/
        ├── MacOS/
        │   └── Suno字幕下載工具  (可執行檔)
        ├── Resources/
        └── Info.plist
```

## 🎨 自訂應用程式

### 添加圖標

1. 準備圖標檔案（.icns 格式）
   - 可以使用線上工具將 PNG 轉換為 .icns
   - 或使用 `iconutil` 命令

2. 修改打包命令：
   ```bash
   pyinstaller --onefile --windowed --icon=icon.icns --name="Suno字幕下載工具" suno-subtitle-downloader-gui.py
   ```

### 建立 DMG 安裝檔

打包腳本會詢問是否建立 DMG。你也可以手動建立：

```bash
# 在 dist 目錄中
hdiutil create -volname "Suno字幕下載工具" -srcfolder "Suno字幕下載工具.app" -ov -format UDZO "Suno字幕下載工具.dmg"
```

## 💡 使用技巧

### 1. 使用 Spotlight 快速啟動

1. 將應用程式移到「應用程式」資料夾
2. 按 `Cmd + Space` 開啟 Spotlight
3. 輸入「Suno」即可找到應用程式

### 2. 加入 Dock

1. 運行應用程式
2. 在 Dock 中的應用程式圖示上右鍵
3. 選擇「選項」>「在 Dock 中保留」

### 3. 建立快速指令（選用）

在 `~/.zshrc` 或 `~/.bash_profile` 中添加：

```bash
alias suno-downloader="open -a 'Suno字幕下載工具'"
```

然後就可以在終端機中輸入 `suno-downloader` 來啟動。

## ❓ 常見問題

### Q: 應用程式無法啟動？

**A:** 檢查以下幾點：
1. 確認已安裝 Python 3.8+
2. 確認已安裝 requests：`pip3 install requests`
3. 檢查終端機是否有錯誤訊息
4. 嘗試從終端機運行：`python3 suno-subtitle-downloader-gui.py`

### Q: 打包後的應用程式很大？

**A:** 這是正常的，因為包含了 Python 解釋器和所有依賴。通常約 20-30 MB。

### Q: 可以分享給其他 Mac 使用者嗎？

**A:** 可以！直接分享 `.app` 檔案即可。對方可能需要處理安全警告（見上方說明）。

### Q: 需要網路連線嗎？

**A:** 是的，工具需要連線到 Suno API 下載字幕資料。

## 🔧 進階設定

### 使用 Homebrew 安裝 Python（如果沒有）

```bash
brew install python3
```

### 使用虛擬環境（推薦）

```bash
# 建立虛擬環境
python3 -m venv venv

# 啟動虛擬環境
source venv/bin/activate

# 安裝依賴
pip install requests pyinstaller

# 運行或打包
python suno-subtitle-downloader-gui.py
```

## 📝 系統需求

- **macOS**: 10.13 (High Sierra) 或更高版本
- **Python**: 3.8 或更高版本
- **記憶體**: 至少 100 MB 可用空間
- **網路**: 需要連線到網際網路

## 🎉 完成！

現在你已經可以在 macOS 上使用 Suno 字幕下載工具了！

如有問題，請查看主文件 [SUNO_SUBTITLE_DOWNLOADER.md](./SUNO_SUBTITLE_DOWNLOADER.md)。
