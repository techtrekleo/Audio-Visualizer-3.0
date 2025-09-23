#!/bin/bash

# Railway 部署啟動腳本
echo "Starting Music Pulse Unified Platform..."

# 檢查 unified-website 目錄是否存在
if [ ! -d "unified-website" ]; then
    echo "Error: unified-website directory not found!"
    exit 1
fi

# 進入 unified-website 目錄
cd unified-website

# 檢查 index.html 是否存在
if [ ! -f "index.html" ]; then
    echo "Error: index.html not found in unified-website directory!"
    exit 1
fi

# 啟動 Python HTTP 服務器
echo "Starting HTTP server on port $PORT..."
python3 -m http.server $PORT
