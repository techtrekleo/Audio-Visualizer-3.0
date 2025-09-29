#!/bin/bash

# 簡單備份腳本
# 用法: ./backup.sh [備份名稱]

BACKUP_NAME=${1:-"backup-$(date '+%Y%m%d-%H%M%S')"}
BACKUP_DIR="backups/$BACKUP_NAME"

echo "📦 創建備份: $BACKUP_NAME"

# 創建備份目錄
mkdir -p "$BACKUP_DIR"

# 備份重要文件
echo "📁 備份 dist 文件夾..."
cp -r audio-visualizer/dist "$BACKUP_DIR/audio-visualizer-dist"
cp -r youtube-seo/dist "$BACKUP_DIR/youtube-seo-dist"
cp -r font-effects/dist "$BACKUP_DIR/font-effects-dist"

# 備份配置文件
echo "⚙️  備份配置文件..."
cp package.json "$BACKUP_DIR/"
cp server.js "$BACKUP_DIR/"
cp railway.json "$BACKUP_DIR/"

# 創建恢復腳本
cat > "$BACKUP_DIR/restore.sh" << 'EOF'
#!/bin/bash
echo "🔄 恢復備份..."

# 恢復 dist 文件夾
cp -r audio-visualizer-dist ../../audio-visualizer/dist
cp -r youtube-seo-dist ../../youtube-seo/dist
cp -r font-effects-dist ../../font-effects/dist

# 恢復配置文件
cp package.json ../../
cp server.js ../../
cp railway.json ../../

echo "✅ 備份已恢復！"
echo "💡 現在可以提交並推送:"
echo "   git add -A && git commit -m '恢復備份' && git push origin main"
EOF

chmod +x "$BACKUP_DIR/restore.sh"

echo "✅ 備份完成: $BACKUP_DIR"
echo "💡 要恢復此備份，運行:"
echo "   cd $BACKUP_DIR && ./restore.sh"


