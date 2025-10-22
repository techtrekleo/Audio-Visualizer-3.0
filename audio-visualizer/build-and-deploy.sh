#!/bin/bash

# 自動化構建和部署腳本
echo "🔧 開始構建音訊可視化工具..."

# 1. 清理舊的構建檔案
echo "🧹 清理舊檔案..."
rm -rf dist/
# 不要刪除 index.html，因為構建需要它
rm -f assets/index.js
rm -f assets/main.css

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
    else
        echo "❌ 檔案複製失敗！"
        exit 1
    fi
else
    echo "❌ 構建失敗！"
    exit 1
fi
