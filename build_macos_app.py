#!/usr/bin/env python3
"""
macOS 專用打包腳本 - 將 GUI 應用程式打包成 .app 應用程式
適用於 iMac 和 MacBook
"""

import subprocess
import sys
import os
import shutil
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

def build_macos_app():
    """打包成 macOS .app 應用程式"""
    script_path = Path(__file__).parent / "suno-subtitle-downloader-gui.py"
    
    if not script_path.exists():
        print(f"❌ 錯誤：找不到 {script_path}")
        return False
    
    print("=" * 60)
    print("🍎 開始打包 macOS 應用程式...")
    print("=" * 60)
    print()
    
    app_name = "Suno字幕下載工具"
    
    # PyInstaller 命令 - macOS 專用設定
    cmd = [
        "pyinstaller",
        "--onefile",  # 打包成單一檔案
        "--windowed",  # 不顯示終端視窗（macOS 使用 --windowed）
        f"--name={app_name}",  # 應用程式名稱
        "--osx-bundle-identifier=com.suno.subtitle.downloader",  # Bundle ID
        "--add-data=requirements.txt:.",  # 包含 requirements.txt
        "--hidden-import=tkinter",  # 確保 tkinter 被包含
        "--hidden-import=requests",  # 確保 requests 被包含
        str(script_path)
    ]
    
    try:
        print("執行命令：")
        print(" ".join(cmd))
        print()
        
        # 清理舊的 build 和 dist 目錄
        if Path("build").exists():
            print("清理舊的 build 目錄...")
            shutil.rmtree("build")
        if Path("dist").exists():
            print("清理舊的 dist 目錄...")
            shutil.rmtree("dist")
        
        subprocess.check_call(cmd)
        
        print()
        print("=" * 60)
        print("✅ 打包完成！")
        print("=" * 60)
        print()
        
        # 檢查生成的 .app
        app_path = Path("dist") / f"{app_name}.app"
        if app_path.exists():
            print(f"✅ 應用程式已建立：{app_path}")
            print()
            print("📦 應用程式資訊：")
            print(f"   位置: {app_path.absolute()}")
            print(f"   大小: {get_folder_size(app_path)} MB")
            print()
            print("🚀 使用方式：")
            print("   1. 雙擊應用程式即可啟動")
            print("   2. 如果出現安全警告，請：")
            print("      - 右鍵點擊應用程式")
            print("      - 選擇「打開」")
            print("      - 在彈出對話框中點擊「打開」")
            print()
            print("💡 提示：")
            print("   - 可以將應用程式拖到「應用程式」資料夾")
            print("   - 可以建立別名（Alias）放在桌面")
            print("   - 可以拖到 Dock 方便使用")
            print()
            
            # 嘗試打開 Finder 顯示應用程式
            try:
                subprocess.run(["open", "-R", str(app_path)])
                print("✅ 已在 Finder 中顯示應用程式")
            except:
                pass
            
            return True
        else:
            print("⚠️  警告：未找到 .app 檔案，但可能已成功打包")
            print(f"   請檢查 dist/ 目錄")
            return True
            
    except subprocess.CalledProcessError as e:
        print(f"❌ 打包失敗：{e}")
        return False
    except Exception as e:
        print(f"❌ 發生錯誤：{e}")
        import traceback
        traceback.print_exc()
        return False

def get_folder_size(path):
    """計算資料夾大小（MB）"""
    total = 0
    try:
        for entry in Path(path).rglob('*'):
            if entry.is_file():
                total += entry.stat().st_size
    except:
        pass
    return round(total / (1024 * 1024), 2)

def create_dmg():
    """建立 DMG 安裝檔（選用）"""
    app_name = "Suno字幕下載工具"
    app_path = Path("dist") / f"{app_name}.app"
    
    if not app_path.exists():
        print("❌ 找不到應用程式，無法建立 DMG")
        return False
    
    response = input("\n是否要建立 DMG 安裝檔？(y/n): ").strip().lower()
    if response != 'y':
        return False
    
    dmg_name = f"{app_name}.dmg"
    dmg_path = Path("dist") / dmg_name
    
    print(f"\n正在建立 DMG: {dmg_name}...")
    
    try:
        # 使用 hdiutil 建立 DMG
        cmd = [
            "hdiutil", "create",
            "-volname", app_name,
            "-srcfolder", str(app_path),
            "-ov",
            "-format", "UDZO",
            str(dmg_path)
        ]
        
        subprocess.check_call(cmd)
        print(f"✅ DMG 已建立：{dmg_path}")
        return True
    except Exception as e:
        print(f"❌ 建立 DMG 失敗：{e}")
        print("   提示：可以手動使用「磁碟工具程式」建立 DMG")
        return False

def main():
    """主程式"""
    print("🍎 macOS 應用程式打包工具")
    print("=" * 60)
    print()
    
    # 檢查作業系統
    if sys.platform != "darwin":
        print("⚠️  警告：此腳本專為 macOS 設計")
        print("   你正在使用：", sys.platform)
        response = input("是否繼續？(y/n): ").strip().lower()
        if response != 'y':
            return
    
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
    success = build_macos_app()
    
    if success:
        # 詢問是否建立 DMG
        create_dmg()
        
        print()
        print("=" * 60)
        print("🎉 完成！")
        print("=" * 60)
        print()
        print("📝 下一步：")
        print("   1. 測試應用程式是否正常運行")
        print("   2. 可以分發給其他 macOS 使用者")
        print("   3. 如需建立 DMG，可以重新執行此腳本")
    else:
        print("打包失敗，請檢查錯誤訊息")

if __name__ == '__main__':
    main()
