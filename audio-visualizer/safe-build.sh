#!/bin/bash

# 安全的構建和部署腳本 - 絕對不會刪除重要檔案
echo "🔧 開始構建音訊可視化工具..."

# 1. 只清理 dist 目錄（保留所有重要檔案）
echo "🧹 清理 dist 目錄..."
rm -rf dist/

# 2. 構建專案
echo "📦 構建專案..."
npm run build

# 3. 檢查構建是否成功
if [ $? -eq 0 ]; then
    echo "✅ 構建成功！"
    
    # 4. 複製檔案到正確位置
    echo "📋 複製檔案..."
    cp dist/index.html index.html
    cp dist/assets/index.js assets/index.js
    cp dist/assets/main.css assets/main.css
    
    # 5. 驗證檔案存在
    if [ -f "index.html" ] && [ -f "assets/index.js" ] && [ -f "assets/main.css" ]; then
        echo "✅ 所有檔案複製成功！"
        echo "🎉 部署完成！可以啟動伺服器了。"
        echo ""
        echo "📁 檔案位置："
        echo "   - index.html: $(pwd)/index.html"
        echo "   - JavaScript: $(pwd)/assets/index.js"
        echo "   - CSS: $(pwd)/assets/main.css"
    else
        echo "❌ 檔案複製失敗！"
        echo "🔍 檢查檔案狀態："
        ls -la index.html assets/index.js assets/main.css 2>/dev/null || echo "檔案不存在"
        exit 1
    fi
else
    echo "❌ 構建失敗！"
    exit 1
fi


