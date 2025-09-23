# 🎯 Google AdSense 完整設置指南

這個指南將幫助你完成 Google AdSense 的申請和設置，並將其整合到你的音樂視覺化網站中。

## 📋 申請前準備

### 1. 網站要求檢查清單
- [ ] 網站運行至少 6 個月
- [ ] 有穩定的原創內容
- [ ] 每月有 1000+ 訪問者
- [ ] 網站有 SSL 證書 (HTTPS)
- [ ] 響應式設計，支持手機訪問
- [ ] 無版權問題或違規內容
- [ ] 符合 Google 政策

### 2. 技術準備
- [ ] 確保網站可以正常訪問
- [ ] 檢查網站載入速度
- [ ] 確認沒有彈出式廣告
- [ ] 移除其他廣告網絡代碼

## 🚀 申請步驟

### 第一步：創建 Google 帳戶
1. 前往 [Google AdSense](https://www.google.com/adsense)
2. 點擊「開始使用」
3. 使用你的 Google 帳戶登入

### 第二步：填寫網站信息
```
網站 URL: https://your-music-visualizer.com
網站語言: 繁體中文
網站類別: 藝術與娛樂
內容類型: 音樂視覺化工具，幫助用戶創建音樂視頻
```

### 第三步：個人信息
```
國家/地區: 台灣
付款國家: 台灣
稅務識別號碼: 你的身分證字號
聯繫電話: 你的手機號碼
地址: 你的真實地址
```

### 第四步：等待審核
- **審核時間**: 1-2 週
- **審核內容**: 網站內容、政策合規性
- **審核結果**: 通過或拒絕（會發送郵件通知）

## 🔧 獲取廣告代碼

### 1. 登入 AdSense 控制台
- 前往 [AdSense 控制台](https://www.google.com/adsense)
- 點擊「廣告」→「廣告單元」

### 2. 創建廣告單元

#### 頂部橫幅廣告
```
名稱: 頂部橫幅廣告
尺寸: 728 x 90
類型: 顯示廣告
```

#### 側邊欄廣告
```
名稱: 側邊欄廣告
尺寸: 160 x 600
類型: 顯示廣告
```

#### 底部橫幅廣告
```
名稱: 底部橫幅廣告
尺寸: 728 x 90
類型: 顯示廣告
```

#### 內容區域廣告
```
名稱: 內容區域廣告
尺寸: 300 x 250
類型: 顯示廣告
```

### 3. 複製廣告代碼
每個廣告單元都會生成類似這樣的代碼：
```html
<ins class="adsbygoogle"
     style="display:block"
     data-ad-client="ca-pub-1234567890123456"
     data-ad-slot="1234567890"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({});
</script>
```

## ⚙️ 配置你的網站

### 1. 更新 AdSense 配置

編輯 `constants/adsenseConfig.ts` 文件：

```typescript
export const ADSENSE_CONFIGS: AdSenseConfig[] = [
    {
        id: 'top-banner',
        name: '頂部橫幅廣告',
        adSlot: '1234567890', // 替換為你的廣告單元 ID
        adFormat: 'horizontal',
        position: 'top',
        responsive: true,
        enabled: true
    },
    {
        id: 'sidebar-ad',
        name: '側邊欄廣告',
        adSlot: '0987654321', // 替換為你的廣告單元 ID
        adFormat: 'vertical',
        position: 'sidebar',
        responsive: false,
        enabled: true
    }
    // ... 其他廣告配置
];
```

### 2. 更新發布商 ID

編輯 `components/GoogleAdSense.tsx` 文件：

```typescript
<ins
    className="adsbygoogle"
    style={getAdStyle()}
    data-ad-client="ca-pub-1234567890123456" // 替換為你的發布商 ID
    data-ad-slot={adSlot}
    data-ad-format={adFormat}
    data-full-width-responsive={responsive}
/>
```

### 3. 在 HTML 中添加 AdSense 腳本

編輯 `index.html` 文件，在 `<head>` 標籤中添加：

```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1234567890123456"
     crossorigin="anonymous"></script>
```

## 📊 監控和優化

### 1. 關鍵指標
- **頁面 RPM**: 每千次展示的收入
- **點擊率 (CTR)**: 點擊次數 ÷ 展示次數
- **有效每千次展示費用 (eCPM)**: 實際收入指標

### 2. 優化建議
- **廣告位置**: 將廣告放在用戶視線範圍內
- **廣告數量**: 避免過多廣告影響用戶體驗
- **內容相關性**: 確保廣告與音樂創作相關
- **載入速度**: 監控廣告對頁面速度的影響

### 3. 常見問題解決

#### 廣告不顯示
- 檢查廣告代碼是否正確
- 確認網站已通過 AdSense 審核
- 檢查瀏覽器是否屏蔽廣告

#### 收入過低
- 優化廣告位置
- 增加網站流量
- 改善用戶體驗
- 測試不同廣告格式

## 💰 收款設置

### 1. 付款信息
- **最低付款**: $100 USD
- **付款週期**: 每月
- **付款方式**: 銀行轉帳、支票

### 2. 稅務設置
- 填寫 W-8BEN 表格（非美國居民）
- 提供稅務識別號碼
- 確認稅務協定

## 🚨 重要注意事項

### 1. 政策遵守
- 禁止點擊自己的廣告
- 禁止鼓勵他人點擊廣告
- 遵守 AdSense 計劃政策
- 定期檢查政策更新

### 2. 技術要求
- 確保廣告代碼正確載入
- 監控網站性能
- 定期更新廣告配置
- 備份廣告設置

### 3. 用戶體驗
- 廣告不應過度干擾
- 提供關閉選項
- 保持頁面載入速度
- 響應式設計支持

## 🔮 進階功能

### 1. 自動廣告
```html
<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1234567890123456"
     crossorigin="anonymous"></script>
<script>
     (adsbygoogle = window.adsbygoogle || []).push({
          google_ad_client: "ca-pub-1234567890123456",
          enable_page_level_ads: true
     });
</script>
```

### 2. 響應式廣告
```html
<ins class="adsbygoogle"
     style="display:block"
     data-ad-format="auto"
     data-full-width-responsive="true"></ins>
```

### 3. 廣告攔截器檢測
```javascript
// 檢測用戶是否使用廣告攔截器
function detectAdBlocker() {
    if (typeof window.adsbygoogle === 'undefined') {
        console.log('Ad blocker detected');
        // 顯示提示信息
    }
}
```

## 📞 技術支持

### 1. 官方資源
- [AdSense 幫助中心](https://support.google.com/adsense)
- [AdSense 政策中心](https://support.google.com/adsense/answer/48182)
- [AdSense 論壇](https://productforums.google.com/forum/#!forum/adsense)

### 2. 常見問題
- **申請被拒**: 檢查網站內容和政策合規性
- **廣告不顯示**: 確認代碼正確性和審核狀態
- **收入問題**: 優化廣告位置和用戶體驗

---

**🎵 成功設置 AdSense 後，你的音樂視覺化網站就能開始產生廣告收入了！**

記住：耐心等待審核，專注於創建優質內容，AdSense 收入會隨著網站流量增長而提升。

