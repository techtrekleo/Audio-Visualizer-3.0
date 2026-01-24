✅ 安裝完成！現在可以使用了
================================

已完成的設定：
✅ tkinter 已安裝（GUI 界面支援）
✅ requests 已安裝（網路請求功能）

🚀 使用方式（三種選擇）
====================

方法一：HTML 版本（最簡單，推薦！）⭐⭐⭐
------------------------------------
1. 雙擊「suno-subtitle-downloader.html」檔案
2. 瀏覽器會自動開啟工具
3. 不需要安裝任何東西！

方法二：Python GUI 版本
----------------------
1. 雙擊「啟動工具.command」檔案
2. GUI 工具會自動開啟

方法三：終端機啟動
----------------
打開「終端機」，執行：
  python3 suno-subtitle-downloader-gui.py

📝 使用步驟
==========
1. 在瀏覽器中登入 https://suno.com
2. 按 F12 開啟開發者工具
3. 找到 Cookies > https://suno.com > __session
4. 複製 __session 的值
5. 在 GUI 工具中：
   - 貼上 Suno 歌曲 URL
   - 貼上 Session Cookie
   - 選擇輸出目錄（可選）
   - 點擊「開始下載」

📦 打包成 .app 應用程式（選用）
=============================
如果想打包成獨立的應用程式：

  pip3 install pyinstaller
  python3 build_macos_app.py

打包後會在 dist/ 目錄生成「Suno字幕下載工具.app」

❓ 遇到問題？
===========
查看詳細說明：
- macOS使用指南.md
- SUNO_SUBTITLE_DOWNLOADER.md
