#!/usr/bin/env python3
"""
打包腳本 - 將 GUI 應用程式打包成可執行檔案
"""

import subprocess
import sys
import os
from pathlib import Path

def check_pyinstaller():
    """檢查 PyInstaller 是否已安裝"""
    try:
        import PyInstaller
        return True
    except ImportError:
        return False

def install_pyinstaller():
    """安裝 PyInstaller"""
    print("正在安裝 PyInstaller...")
    subprocess.check_call([sys.executable, "-m", "pip", "install", "pyinstaller"])
    print("✅ PyInstaller 安裝完成")

def build_executable():
    """打包可執行檔案"""
    script_path = Path(__file__).parent / "suno-subtitle-downloader-gui.py"
    
    if not script_path.exists():
        print(f"❌ 錯誤：找不到 {script_path}")
        return False
    
    print("=" * 60)
    print("開始打包 Suno 字幕下載工具...")
    print("=" * 60)
    print()
    
    # PyInstaller 命令
    cmd = [
        "pyinstaller",
        "--onefile",  # 打包成單一檔案
        "--windowed",  # 不顯示控制台視窗（Windows/Mac）
        "--name=Suno字幕下載工具",  # 可執行檔案名稱
        "--icon=NONE",  # 可以指定圖標檔案
        "--add-data=requirements.txt;.",  # 包含 requirements.txt（Windows 用 ;）
        str(script_path)
    ]
    
    # 根據作業系統調整
    if sys.platform == "darwin":  # macOS
        cmd[2] = "--noconsole"  # macOS 使用 --noconsole
        cmd[4] = "--add-data=requirements.txt:."  # macOS/Linux 用 :
    elif sys.platform == "linux":  # Linux
        cmd[2] = "--noconsole"
        cmd[4] = "--add-data=requirements.txt:."
    
    try:
        print("執行命令：")
        print(" ".join(cmd))
        print()
        subprocess.check_call(cmd)
        print()
        print("=" * 60)
        print("✅ 打包完成！")
        print("=" * 60)
        print()
        print("可執行檔案位置：")
        if sys.platform == "win32":
            print("  dist/Suno字幕下載工具.exe")
        else:
            print("  dist/Suno字幕下載工具")
        print()
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ 打包失敗：{e}")
        return False
    except Exception as e:
        print(f"❌ 發生錯誤：{e}")
        return False

def main():
    """主程式"""
    # 檢查 PyInstaller
    if not check_pyinstaller():
        print("PyInstaller 未安裝")
        response = input("是否要安裝 PyInstaller？(y/n): ").strip().lower()
        if response == 'y':
            install_pyinstaller()
        else:
            print("請先安裝 PyInstaller：pip install pyinstaller")
            return
    
    # 打包
    success = build_executable()
    
    if success:
        print("💡 提示：")
        print("  - 可執行檔案位於 dist/ 目錄")
        print("  - 可以直接分發給其他使用者使用")
        print("  - 不需要安裝 Python 即可執行")
    else:
        print("打包失敗，請檢查錯誤訊息")

if __name__ == '__main__':
    main()
