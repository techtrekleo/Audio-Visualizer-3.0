#!/bin/bash
# macOS 快速啟動腳本
# 雙擊此檔案即可啟動 GUI 工具

cd "$(dirname "$0")"

# 檢查 Python
if ! command -v python3 &> /dev/null; then
    osascript -e 'display dialog "錯誤：找不到 Python 3\n\n請先安裝 Python 3.8 或更高版本" buttons {"確定"} default button 1 with icon stop'
    exit 1
fi

# 檢查 tkinter
if ! python3 -c "import tkinter" 2>/dev/null; then
    osascript -e 'display dialog "錯誤：找不到 tkinter 模組\n\n請執行以下命令安裝：\nbrew install python-tk" buttons {"確定"} default button 1 with icon stop'
    exit 1
fi

# 檢查 requests
if ! python3 -c "import requests" 2>/dev/null; then
    response=$(osascript -e 'display dialog "需要安裝 requests 套件\n\n是否要現在安裝？" buttons {"取消", "安裝"} default button 2')
    if [[ $response == *"安裝"* ]]; then
        pip3 install --break-system-packages requests
    fi
fi

# 啟動 GUI
python3 suno-subtitle-downloader-gui.py
