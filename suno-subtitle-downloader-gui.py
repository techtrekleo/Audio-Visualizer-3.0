#!/usr/bin/env python3
"""
Suno 字幕下載工具 - 圖形界面版本
從 Suno 歌曲網址下載 SRT 和 LRC 格式字幕檔案
"""

import re
import json
import threading
import tkinter as tk
from tkinter import ttk, messagebox, filedialog, scrolledtext
from pathlib import Path
from typing import List, Dict, Optional
from datetime import datetime

try:
    import requests
except ImportError:
    messagebox.showerror(
        "錯誤",
        "需要安裝 requests 套件\n\n請執行：pip install requests"
    )
    exit(1)


class SunoSubtitleDownloaderGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("Suno 字幕下載工具")
        self.root.geometry("700x600")
        self.root.resizable(True, True)
        
        # 設定樣式
        style = ttk.Style()
        style.theme_use('clam')
        
        self.setup_ui()
        
    def setup_ui(self):
        """建立使用者界面"""
        # 主容器
        main_frame = ttk.Frame(self.root, padding="10")
        main_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # 配置網格權重
        self.root.columnconfigure(0, weight=1)
        self.root.rowconfigure(0, weight=1)
        main_frame.columnconfigure(1, weight=1)
        
        # 標題
        title_label = ttk.Label(
            main_frame,
            text="🎵 Suno 字幕下載工具",
            font=("Arial", 16, "bold")
        )
        title_label.grid(row=0, column=0, columnspan=3, pady=(0, 20))
        
        # 歌曲 URL 輸入
        ttk.Label(main_frame, text="歌曲 URL:").grid(
            row=1, column=0, sticky=tk.W, pady=5
        )
        self.url_var = tk.StringVar()
        url_entry = ttk.Entry(main_frame, textvariable=self.url_var, width=50)
        url_entry.grid(row=1, column=1, columnspan=2, sticky=(tk.W, tk.E), pady=5)
        
        # Session Cookie 輸入
        ttk.Label(main_frame, text="Session Cookie:").grid(
            row=2, column=0, sticky=tk.W, pady=5
        )
        self.cookie_var = tk.StringVar()
        cookie_entry = ttk.Entry(
            main_frame,
            textvariable=self.cookie_var,
            width=50,
            show="*"
        )
        cookie_entry.grid(row=2, column=1, columnspan=2, sticky=(tk.W, tk.E), pady=5)
        
        # Cookie 說明按鈕
        cookie_help_btn = ttk.Button(
            main_frame,
            text="如何取得 Cookie?",
            command=self.show_cookie_help,
            width=15
        )
        cookie_help_btn.grid(row=2, column=2, sticky=tk.E, padx=(5, 0))
        
        # 輸出目錄選擇
        ttk.Label(main_frame, text="輸出目錄:").grid(
            row=3, column=0, sticky=tk.W, pady=5
        )
        self.output_dir_var = tk.StringVar(value=str(Path.cwd()))
        output_entry = ttk.Entry(main_frame, textvariable=self.output_dir_var, width=50)
        output_entry.grid(row=3, column=1, sticky=(tk.W, tk.E), pady=5)
        
        browse_btn = ttk.Button(
            main_frame,
            text="瀏覽...",
            command=self.browse_output_dir,
            width=10
        )
        browse_btn.grid(row=3, column=2, sticky=tk.E, padx=(5, 0))
        
        # 下載按鈕
        self.download_btn = ttk.Button(
            main_frame,
            text="開始下載",
            command=self.start_download,
            style="Accent.TButton"
        )
        self.download_btn.grid(row=4, column=0, columnspan=3, pady=20)
        
        # 進度條
        self.progress_var = tk.StringVar(value="就緒")
        progress_label = ttk.Label(
            main_frame,
            textvariable=self.progress_var,
            font=("Arial", 10)
        )
        progress_label.grid(row=5, column=0, columnspan=3, pady=5)
        
        self.progress_bar = ttk.Progressbar(
            main_frame,
            mode='indeterminate',
            length=400
        )
        self.progress_bar.grid(row=6, column=0, columnspan=3, sticky=(tk.W, tk.E), pady=5)
        
        # 日誌區域
        log_frame = ttk.LabelFrame(main_frame, text="執行日誌", padding="5")
        log_frame.grid(row=7, column=0, columnspan=3, sticky=(tk.W, tk.E, tk.N, tk.S), pady=10)
        log_frame.columnconfigure(0, weight=1)
        log_frame.rowconfigure(0, weight=1)
        main_frame.rowconfigure(7, weight=1)
        
        self.log_text = scrolledtext.ScrolledText(
            log_frame,
            height=10,
            wrap=tk.WORD,
            font=("Consolas", 9)
        )
        self.log_text.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S))
        
        # 狀態欄
        self.status_var = tk.StringVar(value="就緒")
        status_bar = ttk.Label(
            main_frame,
            textvariable=self.status_var,
            relief=tk.SUNKEN,
            anchor=tk.W
        )
        status_bar.grid(row=8, column=0, columnspan=3, sticky=(tk.W, tk.E), pady=(10, 0))
        
        # 初始日誌
        self.log("歡迎使用 Suno 字幕下載工具！")
        self.log("請輸入歌曲 URL 和 Session Cookie，然後點擊「開始下載」")
        
    def log(self, message: str, level: str = "INFO"):
        """記錄日誌訊息"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        prefix = {
            "INFO": "ℹ️",
            "SUCCESS": "✅",
            "ERROR": "❌",
            "WARNING": "⚠️"
        }.get(level, "ℹ️")
        
        log_message = f"[{timestamp}] {prefix} {message}\n"
        self.log_text.insert(tk.END, log_message)
        self.log_text.see(tk.END)
        self.root.update_idletasks()
        
    def show_cookie_help(self):
        """顯示 Cookie 取得說明"""
        help_text = """如何取得 Session Cookie：

1. 在瀏覽器中登入 https://suno.com

2. 按 F12 開啟開發者工具
   - Chrome/Edge: F12 或 Ctrl+Shift+I
   - Firefox: F12 或 Ctrl+Shift+I
   - Safari: Cmd+Option+I

3. 切換到「Application」標籤（Chrome）或「儲存空間」標籤（Firefox）

4. 在左側找到「Cookies」>「https://suno.com」

5. 找到名為「__session」的項目

6. 複製其「Value」欄位的內容

7. 貼到此處的「Session Cookie」欄位

⚠️ 注意：Session Cookie 包含你的登入憑證，請妥善保管！"""
        
        messagebox.showinfo("如何取得 Session Cookie", help_text)
        
    def browse_output_dir(self):
        """選擇輸出目錄"""
        directory = filedialog.askdirectory(
            title="選擇輸出目錄",
            initialdir=self.output_dir_var.get()
        )
        if directory:
            self.output_dir_var.set(directory)
            
    def extract_song_id(self, url: str) -> Optional[str]:
        """從 Suno URL 中提取歌曲 ID"""
        patterns = [
            r'suno\.com/song/([a-zA-Z0-9_-]+)',
            r'suno\.com/song/([^/?]+)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, url)
            if match:
                return match.group(1)
        
        return None
        
    def get_safe_filename(self, title: str, song_id: str) -> str:
        """生成安全的檔案名稱"""
        if not title:
            return song_id or 'suno_song'
        
        safe = re.sub(r'\s+', ' ', title)
        safe = re.sub(r'[\\/:*?"<>|\[\]]+', '_', safe)
        safe = safe.strip()
        
        return safe or song_id or 'suno_song'
        
    def strip_meta(self, text: str) -> str:
        """移除 [xxx] 格式的標籤"""
        return re.sub(r'\[[^\]]*?\]', '', text)
        
    def is_paren_only(self, text: str) -> bool:
        """檢查是否只有括號內容"""
        return bool(re.match(r'^\([^)]*\)$', text.strip()))
        
    def build_segments(self, words: List[Dict]) -> List[Dict]:
        """將單詞資料轉換為字幕段落"""
        words = sorted(words, key=lambda x: x.get('start_s', 0))
        
        segments = []
        current_text = ''
        current_start = None
        current_end = None
        
        def push_segment():
            nonlocal current_text, current_start, current_end
            text = current_text.strip()
            if current_start is not None and text:
                segments.append({
                    'start': current_start,
                    'end': current_end,
                    'text': text
                })
            current_text = ''
            current_start = None
            current_end = None
        
        for word_data in words:
            word = word_data.get('word')
            if not word:
                continue
            
            raw = self.strip_meta(word)
            if not raw.strip():
                continue
            
            has_double_newline = bool(re.search(r'\n\n\s*$', raw))
            has_single_newline = not has_double_newline and bool(re.search(r'\n\s*$', raw))
            
            parts = re.sub(r'\s*$', '', raw).split('\n')
            
            for i, part in enumerate(parts):
                part = part.strip()
                if not part or self.is_paren_only(part):
                    continue
                
                if current_start is None:
                    current_start = word_data.get('start_s')
                    current_end = word_data.get('end_s')
                    current_text = part
                else:
                    current_end = max(current_end, word_data.get('end_s', 0))
                    current_text += (' ' if current_text else '') + part
                
                if i < len(parts) - 1:
                    push_segment()
            
            if has_double_newline or has_single_newline:
                push_segment()
        
        push_segment()
        
        return segments
        
    def format_srt_time(self, seconds: float) -> str:
        """將秒數轉換為 SRT 時間格式"""
        total_ms = int(round(seconds * 1000))
        hours = total_ms // 3600000
        minutes = (total_ms % 3600000) // 60000
        secs = (total_ms % 60000) // 1000
        ms = total_ms % 1000
        
        return f"{hours:02d}:{minutes:02d}:{secs:02d},{ms:03d}"
        
    def format_lrc_time(self, seconds: float) -> str:
        """將秒數轉換為 LRC 時間格式"""
        total_cs = int(round(seconds * 100))
        minutes = total_cs // 6000
        secs = (total_cs % 6000) // 100
        cs = total_cs % 100
        
        return f"[{minutes:02d}:{secs:02d}.{cs:02d}]"
        
    def generate_srt(self, segments: List[Dict]) -> str:
        """生成 SRT 格式字幕"""
        lines = []
        for i, seg in enumerate(segments, 1):
            lines.append(f"{i}")
            lines.append(f"{self.format_srt_time(seg['start'])} --> {self.format_srt_time(seg['end'])}")
            lines.append(seg['text'])
            lines.append('')
        
        return '\n'.join(lines)
        
    def generate_lrc(self, segments: List[Dict]) -> str:
        """生成 LRC 格式字幕"""
        lines = []
        for seg in segments:
            lines.append(f"{self.format_lrc_time(seg['start'])}{seg['text']}")
        
        return '\n'.join(lines)
        
    def download_subtitles(self):
        """下載字幕檔案（在背景執行緒中執行）"""
        song_url = self.url_var.get().strip()
        session_cookie = self.cookie_var.get().strip()
        output_dir = self.output_dir_var.get().strip()
        
        # 驗證輸入
        if not song_url:
            self.log("錯誤：請輸入歌曲 URL", "ERROR")
            messagebox.showerror("錯誤", "請輸入歌曲 URL")
            self.download_btn.config(state=tk.NORMAL)
            self.progress_bar.stop()
            return
            
        if not session_cookie:
            self.log("錯誤：請輸入 Session Cookie", "ERROR")
            messagebox.showerror("錯誤", "請輸入 Session Cookie")
            self.download_btn.config(state=tk.NORMAL)
            self.progress_bar.stop()
            return
        
        # 提取歌曲 ID
        song_id = self.extract_song_id(song_url)
        if not song_id:
            self.log(f"錯誤：無法從 URL 中提取歌曲 ID", "ERROR")
            messagebox.showerror(
                "錯誤",
                "無法從 URL 中提取歌曲 ID\n\n請確認 URL 格式為：https://suno.com/song/[歌曲ID]"
            )
            self.download_btn.config(state=tk.NORMAL)
            self.progress_bar.stop()
            return
        
        self.log(f"歌曲 ID: {song_id}", "INFO")
        
        # 設定輸出目錄
        output_path = Path(output_dir) if output_dir else Path.cwd()
        try:
            output_path.mkdir(parents=True, exist_ok=True)
        except Exception as e:
            self.log(f"錯誤：無法建立輸出目錄 - {e}", "ERROR")
            messagebox.showerror("錯誤", f"無法建立輸出目錄：{e}")
            self.download_btn.config(state=tk.NORMAL)
            self.progress_bar.stop()
            return
        
        # 準備 API 請求
        api_url = f"https://studio-api.prod.suno.com/api/gen/{song_id}/aligned_lyrics/v2/"
        headers = {
            'Authorization': f'Bearer {session_cookie}',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        
        self.log("正在請求字幕資料...", "INFO")
        self.progress_var.set("正在連接 API...")
        
        try:
            response = requests.get(api_url, headers=headers, timeout=30)
            
            if not response.ok:
                error_msg = f"API 回傳錯誤狀態碼: {response.status_code}"
                self.log(error_msg, "ERROR")
                
                if response.status_code == 401:
                    detail = "請確認 session cookie 是否有效，建議重新登入 Suno 後取得新的 cookie"
                elif response.status_code == 404:
                    detail = "該歌曲可能不存在或沒有字幕資料"
                else:
                    detail = f"HTTP {response.status_code}"
                
                messagebox.showerror("錯誤", f"{error_msg}\n\n{detail}")
                self.download_btn.config(state=tk.NORMAL)
                self.progress_bar.stop()
                return
            
            data = response.json()
            words = data.get('aligned_words', [])
            
            if not isinstance(words, list) or not words:
                self.log("錯誤：該歌曲沒有字幕資料", "ERROR")
                messagebox.showerror("錯誤", "該歌曲沒有字幕資料（aligned_words 為空）")
                self.download_btn.config(state=tk.NORMAL)
                self.progress_bar.stop()
                return
            
            self.log(f"成功取得 {len(words)} 個單詞資料", "SUCCESS")
            self.progress_var.set("正在處理字幕資料...")
            
            # 建立字幕段落
            segments = self.build_segments(words)
            if not segments:
                self.log("錯誤：無法建立字幕段落", "ERROR")
                messagebox.showerror("錯誤", "無法建立字幕段落")
                self.download_btn.config(state=tk.NORMAL)
                self.progress_bar.stop()
                return
            
            self.log(f"已建立 {len(segments)} 個字幕段落", "SUCCESS")
            self.progress_var.set("正在生成檔案...")
            
            # 生成檔案名稱
            filename = self.get_safe_filename('', song_id)
            
            # 生成 SRT
            srt_content = self.generate_srt(segments)
            srt_path = output_path / f"{filename}.srt"
            srt_path.write_text(srt_content, encoding='utf-8')
            self.log(f"已儲存 SRT: {srt_path}", "SUCCESS")
            
            # 生成 LRC
            lrc_content = self.generate_lrc(segments)
            lrc_path = output_path / f"{filename}.lrc"
            lrc_path.write_text(lrc_content, encoding='utf-8')
            self.log(f"已儲存 LRC: {lrc_path}", "SUCCESS")
            
            self.progress_var.set("下載完成！")
            self.status_var.set(f"成功下載到: {output_path}")
            
            messagebox.showinfo(
                "下載完成",
                f"✅ 字幕檔案已成功下載！\n\n"
                f"SRT: {srt_path.name}\n"
                f"LRC: {lrc_path.name}\n\n"
                f"儲存位置: {output_path}"
            )
            
        except requests.exceptions.RequestException as e:
            error_msg = f"網路請求錯誤: {e}"
            self.log(error_msg, "ERROR")
            messagebox.showerror("錯誤", error_msg)
        except json.JSONDecodeError as e:
            error_msg = f"JSON 解析錯誤: {e}"
            self.log(error_msg, "ERROR")
            messagebox.showerror("錯誤", error_msg)
        except Exception as e:
            error_msg = f"發生錯誤: {e}"
            self.log(error_msg, "ERROR")
            messagebox.showerror("錯誤", error_msg)
        finally:
            self.download_btn.config(state=tk.NORMAL)
            self.progress_bar.stop()
            
    def start_download(self):
        """開始下載（在背景執行緒中執行）"""
        self.download_btn.config(state=tk.DISABLED)
        self.progress_bar.start(10)
        self.progress_var.set("準備中...")
        self.status_var.set("正在下載...")
        
        # 在背景執行緒中執行下載
        thread = threading.Thread(target=self.download_subtitles, daemon=True)
        thread.start()


def main():
    """主程式"""
    root = tk.Tk()
    app = SunoSubtitleDownloaderGUI(root)
    root.mainloop()


if __name__ == '__main__':
    main()
