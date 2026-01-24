#!/bin/bash
# 測試 GUI 是否可以正常啟動

echo "🧪 測試 GUI 工具..."
echo ""

# 檢查 tkinter
echo "1. 檢查 tkinter..."
if python3 -c "import tkinter" 2>/dev/null; then
    echo "   ✅ tkinter 可用"
else
    echo "   ❌ tkinter 不可用"
    echo "   請執行：brew install python-tk"
    exit 1
fi

# 檢查 requests
echo "2. 檢查 requests..."
if python3 -c "import requests" 2>/dev/null; then
    echo "   ✅ requests 可用"
else
    echo "   ⚠️  requests 未安裝（將在啟動時提示安裝）"
fi

# 檢查腳本
echo "3. 檢查 GUI 腳本..."
if [ -f "suno-subtitle-downloader-gui.py" ]; then
    echo "   ✅ GUI 腳本存在"
else
    echo "   ❌ 找不到 GUI 腳本"
    exit 1
fi

echo ""
echo "✅ 所有檢查通過！"
echo ""
echo "現在可以："
echo "  1. 雙擊「啟動工具.command」來啟動 GUI"
echo "  2. 或在終端機執行：python3 suno-subtitle-downloader-gui.py"
echo ""
