#!/usr/bin/env python3
"""
Suno 字幕下載工具
從 Suno 歌曲網址下載 SRT 和 LRC 格式字幕檔案
"""

import re
import sys
import json
import urllib.parse
from pathlib import Path
from typing import List, Dict, Optional

try:
    import requests
except ImportError:
    print("錯誤：需要安裝 requests 套件")
    print("請執行：pip install requests")
    sys.exit(1)


def extract_song_id(url: str) -> Optional[str]:
    """從 Suno URL 中提取歌曲 ID"""
    # 支援多種 URL 格式
    patterns = [
        r'suno\.com/song/([a-zA-Z0-9_-]+)',
        r'suno\.com/song/([^/?]+)',
    ]
    
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    
    return None


def get_safe_filename(title: str, song_id: str) -> str:
    """生成安全的檔案名稱"""
    if not title:
        return song_id or 'suno_song'
    
    # 移除或替換不安全的字元
    safe = re.sub(r'\s+', ' ', title)  # 多個空格變一個
    safe = re.sub(r'[\\/:*?"<>|\[\]]+', '_', safe)  # 替換不安全字元
    safe = safe.strip()
    
    return safe or song_id or 'suno_song'


def strip_meta(text: str) -> str:
    """移除 [xxx] 格式的標籤"""
    return re.sub(r'\[[^\]]*?\]', '', text)


def is_paren_only(text: str) -> bool:
    """檢查是否只有括號內容"""
    return bool(re.match(r'^\([^)]*\)$', text.strip()))


def build_segments(words: List[Dict]) -> List[Dict]:
    """將單詞資料轉換為字幕段落"""
    # 按開始時間排序
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
        
        raw = strip_meta(word)
        if not raw.strip():
            continue
        
        # 檢查是否有換行
        has_double_newline = bool(re.search(r'\n\n\s*$', raw))
        has_single_newline = not has_double_newline and bool(re.search(r'\n\s*$', raw))
        
        # 分割多行
        parts = re.sub(r'\s*$', '', raw).split('\n')
        
        for i, part in enumerate(parts):
            part = part.strip()
            if not part or is_paren_only(part):
                continue
            
            if current_start is None:
                current_start = word_data.get('start_s')
                current_end = word_data.get('end_s')
                current_text = part
            else:
                current_end = max(current_end, word_data.get('end_s', 0))
                current_text += (' ' if current_text else '') + part
            
            # 如果不是最後一部分，推送段落
            if i < len(parts) - 1:
                push_segment()
        
        if has_double_newline or has_single_newline:
            push_segment()
    
    push_segment()  # 推送最後一個段落
    
    return segments


def format_srt_time(seconds: float) -> str:
    """將秒數轉換為 SRT 時間格式 (HH:MM:SS,mmm)"""
    total_ms = int(round(seconds * 1000))
    hours = total_ms // 3600000
    minutes = (total_ms % 3600000) // 60000
    secs = (total_ms % 60000) // 1000
    ms = total_ms % 1000
    
    return f"{hours:02d}:{minutes:02d}:{secs:02d},{ms:03d}"


def format_lrc_time(seconds: float) -> str:
    """將秒數轉換為 LRC 時間格式 [MM:SS.xx]"""
    total_cs = int(round(seconds * 100))
    minutes = total_cs // 6000
    secs = (total_cs % 6000) // 100
    cs = total_cs % 100
    
    return f"[{minutes:02d}:{secs:02d}.{cs:02d}]"


def generate_srt(segments: List[Dict]) -> str:
    """生成 SRT 格式字幕"""
    lines = []
    for i, seg in enumerate(segments, 1):
        lines.append(f"{i}")
        lines.append(f"{format_srt_time(seg['start'])} --> {format_srt_time(seg['end'])}")
        lines.append(seg['text'])
        lines.append('')
    
    return '\n'.join(lines)


def generate_lrc(segments: List[Dict]) -> str:
    """生成 LRC 格式字幕"""
    lines = []
    for seg in segments:
        lines.append(f"{format_lrc_time(seg['start'])}{seg['text']}")
    
    return '\n'.join(lines)


def download_subtitles(song_url: str, session_cookie: str, output_dir: Optional[str] = None) -> bool:
    """下載字幕檔案"""
    # 提取歌曲 ID
    song_id = extract_song_id(song_url)
    if not song_id:
        print(f"❌ 錯誤：無法從 URL 中提取歌曲 ID")
        print(f"   請確認 URL 格式為：https://suno.com/song/[歌曲ID]")
        return False
    
    print(f"📝 歌曲 ID: {song_id}")
    
    # 設定輸出目錄
    if output_dir:
        output_path = Path(output_dir)
    else:
        output_path = Path.cwd()
    
    output_path.mkdir(parents=True, exist_ok=True)
    
    # 準備 API 請求
    api_url = f"https://studio-api.prod.suno.com/api/gen/{song_id}/aligned_lyrics/v2/"
    headers = {
        'Authorization': f'Bearer {session_cookie}',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
    
    print(f"🌐 正在請求字幕資料...")
    
    try:
        response = requests.get(api_url, headers=headers, timeout=30)
        
        if not response.ok:
            print(f"❌ API 回傳錯誤狀態碼: {response.status_code}")
            if response.status_code == 401:
                print("   請確認 session cookie 是否有效")
                print("   建議：在 suno.com 登出後重新登入，然後重新取得 cookie")
            elif response.status_code == 404:
                print("   該歌曲可能不存在或沒有字幕資料")
            return False
        
        data = response.json()
        words = data.get('aligned_words', [])
        
        if not isinstance(words, list) or not words:
            print("❌ 該歌曲沒有字幕資料（aligned_words 為空）")
            return False
        
        print(f"✅ 成功取得 {len(words)} 個單詞資料")
        
        # 建立字幕段落
        segments = build_segments(words)
        if not segments:
            print("❌ 無法建立字幕段落")
            return False
        
        print(f"📄 已建立 {len(segments)} 個字幕段落")
        
        # 生成檔案名稱（使用歌曲 ID，因為我們無法從 API 取得標題）
        filename = get_safe_filename('', song_id)
        
        # 生成 SRT
        srt_content = generate_srt(segments)
        srt_path = output_path / f"{filename}.srt"
        srt_path.write_text(srt_content, encoding='utf-8')
        print(f"✅ 已儲存 SRT: {srt_path}")
        
        # 生成 LRC
        lrc_content = generate_lrc(segments)
        lrc_path = output_path / f"{filename}.lrc"
        lrc_path.write_text(lrc_content, encoding='utf-8')
        print(f"✅ 已儲存 LRC: {lrc_path}")
        
        return True
        
    except requests.exceptions.RequestException as e:
        print(f"❌ 網路請求錯誤: {e}")
        return False
    except json.JSONDecodeError as e:
        print(f"❌ JSON 解析錯誤: {e}")
        return False
    except Exception as e:
        print(f"❌ 發生錯誤: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """主程式"""
    print("=" * 60)
    print("🎵 Suno 字幕下載工具")
    print("=" * 60)
    print()
    
    # 取得輸入
    if len(sys.argv) >= 3:
        song_url = sys.argv[1]
        session_cookie = sys.argv[2]
        output_dir = sys.argv[3] if len(sys.argv) > 3 else None
    else:
        print("使用方法：")
        print(f"  python3 {sys.argv[0]} <歌曲URL> <session_cookie> [輸出目錄]")
        print()
        print("參數說明：")
        print("  歌曲URL: Suno 歌曲頁面網址，例如：https://suno.com/song/xxxxx")
        print("  session_cookie: 從瀏覽器取得的 __session cookie 值")
        print("  輸出目錄: (選填) 儲存檔案的路徑，預設為當前目錄")
        print()
        print("如何取得 session cookie：")
        print("  1. 在瀏覽器中登入 suno.com")
        print("  2. 按 F12 開啟開發者工具")
        print("  3. 切換到「Application」或「儲存空間」標籤")
        print("  4. 在 Cookies 中找到 suno.com")
        print("  5. 複製 __session 的值")
        print()
        
        # 互動式輸入
        song_url = input("請輸入 Suno 歌曲 URL: ").strip()
        if not song_url:
            print("❌ 未輸入 URL")
            sys.exit(1)
        
        session_cookie = input("請輸入 __session cookie: ").strip()
        if not session_cookie:
            print("❌ 未輸入 session cookie")
            sys.exit(1)
        
        output_dir = input("請輸入輸出目錄（直接按 Enter 使用當前目錄）: ").strip() or None
    
    # 執行下載
    success = download_subtitles(song_url, session_cookie, output_dir)
    
    if success:
        print()
        print("=" * 60)
        print("✅ 下載完成！")
        print("=" * 60)
        sys.exit(0)
    else:
        print()
        print("=" * 60)
        print("❌ 下載失敗")
        print("=" * 60)
        sys.exit(1)


if __name__ == '__main__':
    main()
