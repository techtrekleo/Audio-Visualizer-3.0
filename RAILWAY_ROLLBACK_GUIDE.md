# Railway 版本回滾指南

## 🚀 Railway 控制台回滾

### 步驟 1: 登入 Railway
1. 前往 https://railway.app
2. 登入你的帳號
3. 選擇你的專案

### 步驟 2: 查看部署歷史
1. 點擊專案名稱
2. 選擇 "Deployments" 標籤
3. 查看所有部署記錄

### 步驟 3: 回滾到特定版本
1. 找到你想要回滾的部署
2. 點擊該部署右側的 "..." 按鈕
3. 選擇 "Redeploy" 或 "Rollback"

## 📋 部署記錄說明

每次 Git 推送都會創建一個新的部署記錄：
- ✅ 成功的部署會顯示綠色
- ❌ 失敗的部署會顯示紅色
- ⏳ 進行中的部署會顯示黃色

## 🔄 自動回滾

如果最新部署失敗，Railway 會自動回滾到上一個成功版本。

## 💡 最佳實踐

1. **重要更新前創建標籤**：
   ```bash
   ./version-manager.sh create v1.0.1
   ```

2. **測試後再部署**：
   ```bash
   git push origin main
   ```

3. **出問題時快速回滾**：
   ```bash
   ./version-manager.sh deploy v1.0.0
   ```


