#!/usr/bin/env python3
import http.server
import socketserver
import os
import sys
from urllib.parse import urlparse

class CustomHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # 處理根路徑
        if self.path == '/':
            self.path = '/index.html'
        
        # 處理工具路徑 - 重定向到構建好的文件
        if self.path.startswith('/audio-visualizer-source/'):
            relative_path = self.path.replace('/audio-visualizer-source', '')
            self.path = '/audio-visualizer-source/dist' + relative_path
            print(f"Rewritten audio-visualizer path: {self.path}")
        elif self.path.startswith('/youtube-seo-source/'):
            relative_path = self.path.replace('/youtube-seo-source', '')
            self.path = '/youtube-seo-source/dist' + relative_path
            print(f"Rewritten youtube-seo path: {self.path}")
        elif self.path.startswith('/font-effects-source/'):
            relative_path = self.path.replace('/font-effects-source', '')
            self.path = '/font-effects-source/dist' + relative_path
            print(f"Rewritten font-effects path: {self.path}")
        
        # 處理目錄請求
        if self.path.endswith('/'):
            self.path += 'index.html'
            print(f"Added index.html to directory path: {self.path}")
        
        print(f"Requested path: {self.path}")
        
        # 檢查文件是否存在
        file_path = os.path.join(os.getcwd(), self.path.lstrip('/'))
        if not os.path.exists(file_path):
            print(f"File not found: {file_path}")
            self.send_error(404, "File not found")
            return
        
        # 調用父類的方法
        super().do_GET()

def main():
    PORT = int(os.environ.get('PORT', 8000))
    
    print(f"🔧 Starting Music Pulse Unified Platform...")
    print(f"🌐 PORT: {PORT}")
    print(f"📁 Working directory: {os.getcwd()}")
    
    # 檢查重要文件是否存在
    important_files = [
        'index.html',
        'audio-visualizer-source/dist/index.html',
        'youtube-seo-source/dist/index.html',
        'font-effects-source/dist/index.html'
    ]
    
    for file_path in important_files:
        if os.path.exists(file_path):
            print(f"✅ Found: {file_path}")
        else:
            print(f"❌ Missing: {file_path}")
    
    with socketserver.TCPServer(("", PORT), CustomHTTPRequestHandler) as httpd:
        print(f"🚀 Server running at http://localhost:{PORT}")
        print(f"🚀 Server running at http://0.0.0.0:{PORT}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Server stopped")
            sys.exit(0)

if __name__ == "__main__":
    main()
