#!/bin/bash

# 穩定的構建和部署腳本 - 避免路徑問題
echo "🔧 開始構建音訊可視化工具..."

# 1. 檢查並修復 index.html 的引用路徑
echo "🔍 檢查 index.html 引用路徑..."
if grep -q "/audio-visualizer/assets/" index.html; then
    echo "⚠️  發現錯誤的路徑引用，正在修復..."
    sed -i '' 's|src="/audio-visualizer/assets/index.js"|src="./index.tsx"|g' index.html
    sed -i '' 's|href="/audio-visualizer/assets/main.css"||g' index.html
    echo "✅ 路徑已修復"
else
    echo "✅ 路徑正確"
fi

# 2. 清理舊的構建檔案
echo "🧹 清理舊檔案..."
rm -rf dist/
rm -f assets/index.js
rm -f assets/main.css

# 3. 構建專案
echo "📦 構建專案..."
npm run build

# 4. 檢查構建是否成功
if [ $? -eq 0 ]; then
    echo "✅ 構建成功！"
    
    # 5. 複製檔案到正確位置
    echo "📋 複製檔案..."
    cp dist/index.html index.html
    cp dist/assets/index.js assets/index.js
    cp dist/assets/main.css assets/main.css
    
    # 6. 驗證檔案存在
    if [ -f "index.html" ] && [ -f "assets/index.js" ] && [ -f "assets/main.css" ]; then
        echo "✅ 所有檔案複製成功！"
        echo "🎉 部署完成！"
        echo ""
        echo "📁 檔案位置："
        echo "   - index.html: $(pwd)/index.html"
        echo "   - JavaScript: $(pwd)/assets/index.js"
        echo "   - CSS: $(pwd)/assets/main.css"
        echo ""
        echo "🚀 可以啟動伺服器了！"
    else
        echo "❌ 檔案複製失敗！"
        exit 1
    fi
else
    echo "❌ 構建失敗！"
    exit 1
fi
