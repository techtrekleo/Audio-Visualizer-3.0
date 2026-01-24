# 快速開始指南

## 🚀 最簡單的使用方式

### 步驟 1: 安裝依賴

```bash
pip install requests
```

### 步驟 2: 啟動 GUI 版本

```bash
python3 suno-subtitle-downloader-gui.py
```

就是這麼簡單！🎉

---

## 📋 詳細步驟

### 1. 取得 Session Cookie

1. 在瀏覽器中登入 https://suno.com
2. 按 `F12` 開啟開發者工具
3. 切換到「Application」標籤（Chrome）或「儲存空間」標籤（Firefox）
4. 找到 `Cookies` > `https://suno.com` > `__session`
5. 複製 `Value` 欄位的內容

### 2. 使用工具

#### GUI 版本（推薦）

```bash
python3 suno-subtitle-downloader-gui.py
```

然後：
1. 貼上 Suno 歌曲 URL
2. 貼上 Session Cookie
3. 選擇輸出目錄（可選）
4. 點擊「開始下載」

#### 命令行版本

```bash
python3 suno-subtitle-downloader.py "https://suno.com/song/xxxxx" "your_cookie_here"
```

### 3. 取得檔案

下載完成後，你會得到兩個檔案：
- `[歌曲ID].srt` - 影片播放器用
- `[歌曲ID].lrc` - 音樂播放器用

---

## 💻 打包成可執行檔案

如果你想打包成可執行檔案（不需要 Python 就能運行）：

```bash
# 1. 安裝 PyInstaller
pip install pyinstaller

# 2. 執行打包
python3 build_executable.py
```

打包後的檔案在 `dist/` 目錄。

---

## ❓ 遇到問題？

查看 [SUNO_SUBTITLE_DOWNLOADER.md](./SUNO_SUBTITLE_DOWNLOADER.md) 的「疑難排解」章節。
