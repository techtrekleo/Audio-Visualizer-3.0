#!/bin/bash

# 版本管理腳本
# 用法: ./version-manager.sh [命令] [版本號]

case "$1" in
    "list")
        echo "📋 可用版本:"
        git tag -l | sort -V
        ;;
    "create")
        if [ -z "$2" ]; then
            echo "❌ 請提供版本號，例如: ./version-manager.sh create v1.0.1"
            exit 1
        fi
        echo "🏷️  創建版本標籤: $2"
        git tag -a "$2" -m "版本 $2 - $(date '+%Y-%m-%d %H:%M:%S')"
        git push origin "$2"
        echo "✅ 版本 $2 已創建並推送"
        ;;
    "rollback")
        if [ -z "$2" ]; then
            echo "❌ 請提供要回滾的版本號，例如: ./version-manager.sh rollback v1.0.0"
            exit 1
        fi
        echo "🔄 回滾到版本: $2"
        git checkout "$2"
        echo "✅ 已回滾到版本 $2"
        echo "💡 要部署此版本，請運行: git push origin $2:main --force"
        ;;
    "deploy")
        if [ -z "$2" ]; then
            echo "❌ 請提供要部署的版本號，例如: ./version-manager.sh deploy v1.0.0"
            exit 1
        fi
        echo "🚀 部署版本: $2"
        git push origin "$2:main" --force
        echo "✅ 版本 $2 已部署到 Railway"
        ;;
    "current")
        echo "📍 當前版本:"
        git describe --tags --exact-match HEAD 2>/dev/null || echo "無標籤版本"
        ;;
    *)
        echo "📖 版本管理工具使用說明:"
        echo ""
        echo "可用命令:"
        echo "  list                    - 列出所有版本"
        echo "  create [版本號]         - 創建新版本標籤"
        echo "  rollback [版本號]       - 回滾到指定版本"
        echo "  deploy [版本號]         - 部署指定版本到 Railway"
        echo "  current                 - 顯示當前版本"
        echo ""
        echo "例子:"
        echo "  ./version-manager.sh list"
        echo "  ./version-manager.sh create v1.0.1"
        echo "  ./version-manager.sh rollback v1.0.0"
        echo "  ./version-manager.sh deploy v1.0.0"
        ;;
esac


