# 📝 文章系統使用指南

## 🎯 系統特色

這是一個簡單的靜態文章系統，專為音樂門戶網站設計。只有你可以通過 GitHub 提交新文章，完全控制內容發布。

## 📁 檔案結構

```
articles/
├── index.html          # 文章列表頁面
├── welcome.html        # 示例文章
├── template.html       # 文章模板
└── README.md          # 使用說明
```

## ✍️ 如何添加新文章

### 步驟 1：複製模板
```bash
cp template.html 你的文章名稱.html
```

### 步驟 2：修改文章內容
編輯新文章的 HTML 檔案：

1. **修改標題**：
   ```html
   <title>你的文章標題 - 音樂脈動</title>
   <h1 class="article-title">你的文章標題</h1>
   ```

2. **修改元資料**：
   ```html
   <div class="meta-item">
       <i class="fas fa-calendar"></i>
       <span>2025-01-23</span>  <!-- 發布日期 -->
   </div>
   <div class="meta-item">
       <i class="fas fa-tag"></i>
       <span>分類</span>  <!-- 文章分類 -->
   </div>
   ```

3. **撰寫內容**：
   在 `<div class="article-content">` 內撰寫你的文章內容。

### 步驟 3：更新文章列表
編輯 `index.html`，在 `articles` 陣列中添加新文章：

```javascript
const articles = [
    {
        title: "歡迎來到音樂脈動！",
        excerpt: "文章摘要...",
        date: "2025-01-23",
        category: "介紹",
        filename: "welcome.html"
    },
    {
        title: "你的新文章標題",
        excerpt: "新文章的摘要...",
        date: "2025-01-24",
        category: "教學",
        filename: "你的文章名稱.html"
    }
    // 添加更多文章...
];
```

### 步驟 4：提交到 GitHub
```bash
git add .
git commit -m "添加新文章：你的文章標題"
git push origin main
```

## 🎨 文章樣式指南

### 標題層級
- `<h2>` - 主要章節標題
- `<h3>` - 子章節標題

### 特殊樣式
```html
<!-- 提示框 -->
<div class="highlight-box">
    <h4>💡 提示</h4>
    <p>重要內容</p>
</div>

<!-- 工具連結 -->
<a href="../index.html" class="tool-link">
    <i class="fas fa-home"></i>
    回到首頁
</a>
```

### 列表
```html
<!-- 無序列表 -->
<ul>
    <li>項目 1</li>
    <li>項目 2</li>
</ul>

<!-- 有序列表 -->
<ol>
    <li>步驟 1</li>
    <li>步驟 2</li>
</ol>
```

## 📱 響應式設計

文章頁面已經針對各種螢幕尺寸進行優化：
- 桌面版：最佳閱讀體驗
- 平板版：適中的字體大小
- 手機版：單欄佈局，易於閱讀

## 🔧 自訂功能

### 添加新分類
在 CSS 中添加新的分類樣式：
```css
.category-新分類 {
    background: rgba(顏色, 0.2);
    border: 1px solid rgba(顏色, 0.3);
}
```

### 修改文章佈局
所有樣式都在文章頁面的 `<style>` 標籤中，可以直接修改。

## 📊 SEO 優化

每篇文章都包含：
- 獨特的 `<title>` 標籤
- 結構化的 HTML
- 適當的標題層級
- 描述性的連結文字

## 🚀 部署

文章系統會自動部署到：
- GitHub Pages（如果啟用）
- 任何靜態網站託管服務

## 💡 最佳實踐

1. **定期發布**：保持內容更新
2. **優質內容**：提供有價值的資訊
3. **適當分類**：幫助讀者找到相關內容
4. **互動元素**：添加工具連結和相關資源

## 🆘 故障排除

### 文章不顯示
- 檢查 `index.html` 中的 `articles` 陣列
- 確認檔案名稱正確
- 檢查檔案是否已提交到 GitHub

### 樣式問題
- 檢查 HTML 結構是否正確
- 確認 CSS 類別名稱正確
- 查看瀏覽器開發者工具

## 📞 支援

如有問題，請通過以下方式聯繫：
- GitHub Issues
- YouTube 頻道：音樂脈動-Sonic Pulse

---

**祝你寫作愉快！** ✍️🎵
