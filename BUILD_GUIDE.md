# 打包成可執行檔案指南

本指南說明如何將 Suno 字幕下載工具打包成可執行檔案（.exe、.app 或 Linux 可執行檔）。

## 方法一：使用自動打包腳本（推薦）

### 步驟 1: 安裝 PyInstaller

```bash
pip install pyinstaller
```

### 步驟 2: 執行打包腳本

```bash
python3 build_executable.py
```

腳本會自動：
- 檢查 PyInstaller 是否已安裝
- 如果未安裝，會提示是否安裝
- 執行打包命令
- 生成可執行檔案

### 步驟 3: 找到可執行檔案

打包完成後，可執行檔案位於 `dist/` 目錄：

- **Windows**: `dist/Suno字幕下載工具.exe`
- **macOS**: `dist/Suno字幕下載工具.app` 或 `dist/Suno字幕下載工具`
- **Linux**: `dist/Suno字幕下載工具`

## 方法二：手動使用 PyInstaller

### Windows

```bash
pyinstaller --onefile --windowed --name="Suno字幕下載工具" suno-subtitle-downloader-gui.py
```

### macOS

```bash
pyinstaller --onefile --noconsole --name="Suno字幕下載工具" suno-subtitle-downloader-gui.py
```

### Linux

```bash
pyinstaller --onefile --noconsole --name="Suno字幕下載工具" suno-subtitle-downloader-gui.py
```

## 進階選項

### 添加圖標

如果你有圖標檔案（.ico 用於 Windows，.icns 用於 macOS），可以使用：

```bash
pyinstaller --onefile --windowed --icon=icon.ico --name="Suno字幕下載工具" suno-subtitle-downloader-gui.py
```

### 自訂打包選項

可以建立一個 `.spec` 檔案來自訂打包選項：

```bash
pyinstaller --name="Suno字幕下載工具" suno-subtitle-downloader-gui.py
```

這會生成一個 `.spec` 檔案，你可以編輯它來自訂打包選項。

## 檔案大小

打包後的可執行檔案大小約為：
- **Windows**: 15-25 MB
- **macOS**: 20-30 MB
- **Linux**: 15-25 MB

這是因為 PyInstaller 會將 Python 解釋器和所有依賴套件打包進去。

## 分發可執行檔案

打包完成後，你可以：

1. **直接分發**：將 `dist/` 目錄中的可執行檔案分發給其他使用者
2. **不需要 Python**：使用者不需要安裝 Python 即可執行
3. **跨平台**：需要在對應的作業系統上打包（Windows 上打包的只能在 Windows 上運行）

## 疑難排解

### 問題 1: PyInstaller 未找到

**解決方法：**
```bash
pip install pyinstaller
```

### 問題 2: 打包後無法執行

**可能原因：**
- 缺少依賴套件
- 路徑問題

**解決方法：**
- 檢查是否有錯誤訊息
- 嘗試使用 `--debug=all` 參數查看詳細資訊

### 問題 3: 檔案太大

**解決方法：**
- 使用 `--exclude-module` 排除不需要的模組
- 使用 `--strip` 參數（Linux）

### 問題 4: macOS 安全警告

**問題：** macOS 可能會顯示「無法打開，因為來自身份不明的開發者」

**解決方法：**
1. 右鍵點擊應用程式
2. 選擇「打開」
3. 在彈出的對話框中點擊「打開」

或者使用代碼簽名（需要 Apple Developer 帳號）。

## 注意事項

1. **防毒軟體**：某些防毒軟體可能會誤報打包後的檔案，這是正常現象
2. **首次執行**：首次執行可能會比較慢，因為需要解壓縮檔案
3. **更新**：如果更新了程式碼，需要重新打包

## 其他打包工具

除了 PyInstaller，還有其他打包工具：

- **cx_Freeze**: 跨平台打包工具
- **py2app**: macOS 專用
- **py2exe**: Windows 專用
- **Nuitka**: 將 Python 編譯成 C++

你可以根據需求選擇適合的工具。
