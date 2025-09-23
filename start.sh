#!/bin/bash

# Railway 部署啟動腳本
echo "Starting Music Pulse Unified Platform..."

# 檢查 index.html 是否存在
if [ ! -f "index.html" ]; then
    echo "Error: index.html not found in current directory!"
    exit 1
fi

# 啟動 Python HTTP 服務器
echo "Starting HTTP server on port $PORT..."
python3 -m http.server $PORT
