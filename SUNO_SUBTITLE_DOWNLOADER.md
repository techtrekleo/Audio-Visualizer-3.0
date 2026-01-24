# Suno 字幕下載工具

這是一個本地工具，可以從 Suno 歌曲網址下載 SRT 和 LRC 格式的字幕檔案。

## 版本

本工具提供兩個版本：

1. **命令行版本** (`suno-subtitle-downloader.py`) - 適合自動化和腳本使用
2. **圖形界面版本** (`suno-subtitle-downloader-gui.py`) - 適合一般使用者，有友好的 GUI 介面

## 功能特點

- ✅ 支援從 Suno 歌曲 URL 自動提取歌曲 ID
- ✅ 下載 SRT 格式字幕（適用於影片播放器）
- ✅ 下載 LRC 格式字幕（適用於音樂播放器）
- ✅ 自動處理時間軸和文字格式
- ✅ 支援自訂輸出目錄
- ✅ **GUI 版本**：直觀的圖形界面，即點即用
- ✅ **可打包成可執行檔案**：無需安裝 Python 即可使用

## 安裝需求

### Python 版本
- Python 3.8 或更高版本

### 安裝依賴套件

```bash
pip install requests
```

或使用 requirements.txt：

```bash
pip install -r requirements.txt
```

## 使用方法

### GUI 版本（推薦）

**最簡單的方式，適合一般使用者：**

```bash
python3 suno-subtitle-downloader-gui.py
```

或直接雙擊執行（如果已設置執行權限）。

GUI 版本提供：
- 📝 直觀的輸入欄位
- 📊 即時執行日誌
- 📈 進度條顯示
- 📁 圖形化目錄選擇
- ✅ 成功/錯誤提示

### 命令行版本

#### 方法一：命令列參數

```bash
python3 suno-subtitle-downloader.py <歌曲URL> <session_cookie> [輸出目錄]
```

**範例：**

```bash
python3 suno-subtitle-downloader.py "https://suno.com/song/abc123" "your_session_cookie_here" "./subtitles"
```

#### 方法二：互動式輸入

直接執行腳本，然後按照提示輸入：

```bash
python3 suno-subtitle-downloader.py
```

## 如何取得 Session Cookie

1. **在瀏覽器中登入 Suno**
   - 前往 https://suno.com 並登入你的帳號

2. **開啟開發者工具**
   - **Chrome/Edge**: 按 `F12` 或 `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
   - **Firefox**: 按 `F12` 或 `Ctrl+Shift+I` (Windows) / `Cmd+Option+I` (Mac)
   - **Safari**: 需要先啟用開發者選單（偏好設定 > 進階 > 顯示開發選單），然後按 `Cmd+Option+I`

3. **找到 Cookie**
   - 切換到「**Application**」標籤（Chrome/Edge）或「**儲存空間**」標籤（Firefox）
   - 在左側找到「**Cookies**」>「**https://suno.com**」
   - 找到名為「**__session**」的項目
   - 複製其「**Value**」欄位的內容

4. **使用 Cookie**
   - 將複製的值作為 `session_cookie` 參數傳入腳本

## 輸出檔案

工具會在同一個目錄下產生兩個檔案：

- `[歌曲ID].srt` - SRT 格式字幕檔案
- `[歌曲ID].lrc` - LRC 格式字幕檔案

### SRT 格式範例

```
1
00:00:00,000 --> 00:00:05,000
第一句歌詞

2
00:00:05,000 --> 00:00:10,000
第二句歌詞
```

### LRC 格式範例

```
[00:00.00]第一句歌詞
[00:05.00]第二句歌詞
```

## 疑難排解

### 問題 1: 無法提取歌曲 ID

**錯誤訊息：** `❌ 錯誤：無法從 URL 中提取歌曲 ID`

**解決方法：**
- 確認 URL 格式為：`https://suno.com/song/[歌曲ID]`
- 確認 URL 完整且正確

### 問題 2: API 回傳 401 錯誤

**錯誤訊息：** `❌ API 回傳錯誤狀態碼: 401`

**解決方法：**
- 確認 session cookie 是否正確
- 重新登入 Suno 並取得新的 cookie
- 確認 cookie 沒有過期

### 問題 3: API 回傳 404 錯誤

**錯誤訊息：** `❌ API 回傳錯誤狀態碼: 404`

**解決方法：**
- 確認歌曲 ID 是否正確
- 確認該歌曲是否存在
- 確認該歌曲是否有字幕資料

### 問題 4: 沒有字幕資料

**錯誤訊息：** `❌ 該歌曲沒有字幕資料（aligned_words 為空）`

**解決方法：**
- 該歌曲可能沒有生成字幕
- 確認歌曲頁面是否有顯示歌詞

### 問題 5: 需要安裝 requests

**錯誤訊息：** `錯誤：需要安裝 requests 套件`

**解決方法：**
```bash
pip install requests
```

## 安全注意事項

⚠️ **重要：**

- Session cookie 包含你的登入憑證，請妥善保管
- 不要分享你的 session cookie 給他人
- 不要在公共電腦上使用此工具
- 使用完畢後可以考慮登出 Suno 以更換 session

## 技術細節

### API 端點

工具使用以下 Suno API：

```
GET https://studio-api.prod.suno.com/api/gen/{song_id}/aligned_lyrics/v2/
Authorization: Bearer {session_cookie}
```

### 資料處理

1. 從 API 取得 `aligned_words` 陣列
2. 按時間排序並合併連續單詞
3. 處理換行和特殊字元
4. 轉換為 SRT 和 LRC 格式

## 打包成可執行檔案

### macOS 使用者（iMac / MacBook）

**專為 macOS 設計的打包腳本：**

```bash
# 1. 安裝 PyInstaller
pip3 install pyinstaller

# 2. 執行 macOS 專用打包腳本
python3 build_macos_app.py
```

打包後會生成 `.app` 應用程式，可以：
- 雙擊直接運行
- 拖到「應用程式」資料夾
- 在 Spotlight 中搜尋使用

詳細說明請參考：[macOS使用指南.md](./macOS使用指南.md)

### 其他平台

如果想將工具打包成可執行檔案（.exe 或 Linux 可執行檔），請參考 [BUILD_GUIDE.md](./BUILD_GUIDE.md)。

### 快速打包（通用）

```bash
# 1. 安裝 PyInstaller
pip install pyinstaller

# 2. 執行打包腳本
python3 build_executable.py
```

打包後的可執行檔案位於 `dist/` 目錄，可以直接分發給其他使用者使用，無需安裝 Python。

## 授權

本工具為開源專案，遵循 MIT 授權。

## 更新日誌

- **2025-01-22**: 
  - ✅ 初始版本
  - ✅ 支援 SRT 和 LRC 格式下載
  - ✅ 互動式和命令列兩種使用方式
  - ✅ 完整的錯誤處理
  - ✅ **新增 GUI 圖形界面版本**
  - ✅ **支援打包成可執行檔案**
