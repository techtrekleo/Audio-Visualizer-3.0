const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8000;

// 統一頁首頁尾注入函數
function injectUnifiedLayout(htmlContent) {
  // 統一的頁首頁尾樣式
  const unifiedStyles = `
    <style>
      /* 統一頁首樣式 */
      .unified-navbar {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        background: rgba(0, 0, 0, 0.95);
        backdrop-filter: blur(10px);
        border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        z-index: 1000;
        padding: 1rem 0;
      }
      .unified-navbar .nav-container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 2rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .unified-navbar .logo {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }
      .unified-navbar .logo-cat {
        width: 2.5rem;
        height: 2.5rem;
        border-radius: 50%;
      }
      .unified-navbar .logo-text {
        color: white;
      }
      .unified-navbar .logo-main {
        font-weight: bold;
        font-size: 1.125rem;
      }
      .unified-navbar .logo-sub {
        color: #9ca3af;
        font-size: 0.875rem;
      }
      .unified-navbar .nav-links {
        display: flex;
        align-items: center;
        gap: 1.5rem;
        list-style: none;
        margin: 0;
        padding: 0;
      }
      .unified-navbar .nav-links a {
        color: #d1d5db;
        text-decoration: none;
        transition: color 0.3s ease;
      }
      .unified-navbar .nav-links a:hover {
        color: white;
      }
      
      /* 統一頁尾樣式 */
      .unified-footer {
        background: rgba(26, 26, 26, 0.8);
        padding: 3rem 0 2rem;
        text-align: center;
        border-top: 1px solid rgba(255, 255, 255, 0.1);
        margin-top: 2rem;
      }
      .unified-footer .footer-content {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 2rem;
      }
      .unified-footer .footer-links {
        display: flex;
        justify-content: center;
        gap: 2rem;
        margin-bottom: 2rem;
        flex-wrap: wrap;
      }
      .unified-footer .footer-links a {
        color: #b8b8b8;
        text-decoration: none;
        transition: color 0.3s ease;
      }
      .unified-footer .footer-links a:hover {
        color: #4ecdc4;
      }
      .unified-footer .footer-bottom {
        color: #666;
        font-size: 0.9rem;
      }
      
      /* 為 React 應用添加 padding-top */
      #root {
        padding-top: 5rem;
      }
    </style>
  `;

  // 統一的頁首 HTML
  const unifiedHeader = `
    <!-- 統一頁首 -->
    <nav class="unified-navbar">
      <div class="nav-container">
        <div class="logo">
          <img src="/assets/cat-avatar.png" alt="口袋裡的貓" class="logo-cat">
          <div class="logo-text">
            <div class="logo-main">Sonic Pulse</div>
            <div class="logo-sub">🐱 口袋裡的貓</div>
          </div>
        </div>
        <ul class="nav-links">
          <li><a href="/">首頁</a></li>
          <li><a href="/#tools">工具</a></li>
          <li><a href="/articles/index.html">文章</a></li>
          <li><a href="/#channel">頻道</a></li>
          <li><a href="/#contact">聯繫</a></li>
        </ul>
      </div>
    </nav>
  `;

  // 統一的頁尾 HTML
  const unifiedFooter = `
    <!-- 統一頁尾 -->
    <footer class="unified-footer">
      <div class="footer-content">
        <div class="footer-links">
          <a href="https://www.youtube.com/@%E9%9F%B3%E6%A8%82%E8%84%88%E5%8B%95SonicPulse" target="_blank">
            <i class="fab fa-youtube"></i> YouTube
          </a>
          <a href="mailto:contact@sonicpulse.com">
            <i class="fas fa-envelope"></i> 聯繫我們
          </a>
          <a href="#privacy">
            <i class="fas fa-shield-alt"></i> 隱私政策
          </a>
          <a href="#terms">
            <i class="fas fa-file-contract"></i> 使用條款
          </a>
        </div>
        
        <!-- Buy Me a Coffee 按鈕 -->
        <div style="margin: 2rem 0; text-align: center;">
          <p style="color: #b8b8b8; margin-bottom: 1rem;">喜歡我的工具嗎？請我喝杯咖啡吧！</p>
          <a href="https://buymeacoffee.com/sonicpulse2025" target="_blank" style="display: inline-flex; align-items: center; gap: 0.75rem; background: linear-gradient(to right, #eab308, #ea580c); color: white; padding: 0.75rem 1.5rem; border-radius: 0.5rem; text-decoration: none; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <img src="/assets/cat-avatar.png" alt="口袋裡的貓" style="width: 2rem; height: 2rem; border-radius: 50%;">
            <div style="text-align: left;">
              <div style="font-weight: 600;">贊助口袋裡的貓</div>
              <div style="font-size: 0.875rem; opacity: 0.9;">Buy me a coffee</div>
            </div>
          </a>
        </div>
        
        <div class="footer-bottom">
          <p>&copy; <span id="currentYear"></span> 音樂脈動-Sonic Pulse. 保留所有權利. | 用 ❤️ 為音樂創作者打造</p>
        </div>
      </div>
    </footer>
    
    <script>
      // 更新年份
      document.getElementById('currentYear').textContent = new Date().getFullYear();
    </script>
  `;

  // 注入樣式到 head
  let modifiedHtml = htmlContent.replace('</head>', `${unifiedStyles}</head>`);
  
  // 注入頁首到 body 開始
  modifiedHtml = modifiedHtml.replace('<body>', `<body>${unifiedHeader}`);
  
  // 注入頁尾到 body 結束
  modifiedHtml = modifiedHtml.replace('</body>', `${unifiedFooter}</body>`);
  
  return modifiedHtml;
}

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);
  
  // 設置 CORS 標頭
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  let filePath;
  
  // 處理各個工具的 dist 目錄
  if (req.url.startsWith('/audio-visualizer')) {
    const distPath = path.join(__dirname, 'audio-visualizer', 'dist');
    const relativePath = req.url.replace('/audio-visualizer', '');
    filePath = path.join(distPath, relativePath);
    
    // 如果是目錄，添加 index.html
    if (filePath.endsWith('/') || !path.extname(filePath)) {
      filePath = path.join(filePath, 'index.html');
    }
  } else if (req.url.startsWith('/font-effects')) {
    const distPath = path.join(__dirname, 'font-effects', 'dist');
    const relativePath = req.url.replace('/font-effects', '');
    filePath = path.join(distPath, relativePath);
    
    // 如果是目錄，添加 index.html
    if (filePath.endsWith('/') || !path.extname(filePath)) {
      filePath = path.join(filePath, 'index.html');
    }
  } else if (req.url.startsWith('/youtube-seo')) {
    const distPath = path.join(__dirname, 'youtube-seo', 'dist');
    const relativePath = req.url.replace('/youtube-seo', '');
    filePath = path.join(distPath, relativePath);
    
    // 如果是目錄，添加 index.html
    if (filePath.endsWith('/') || !path.extname(filePath)) {
      filePath = path.join(filePath, 'index.html');
    }
  } else {
    // 其他路由服務根目錄
    filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
    
    // 如果是目錄，添加 index.html
    if (filePath.endsWith('/')) {
      filePath = path.join(filePath, 'index.html');
    }
  }
  
  fs.readFile(filePath, (error, content) => {
    if (error) {
      res.writeHead(404);
      res.end('File not found');
    } else {
      const ext = path.extname(filePath);
      const mimeType = {
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.json': 'application/json',
        '.png': 'image/png',
        '.jpg': 'image/jpg'
      }[ext] || 'text/plain';
      
      // 如果是工具頁面的 index.html，注入統一的頁首頁尾
      if (ext === '.html' && (
        req.url.startsWith('/audio-visualizer') || 
        req.url.startsWith('/youtube-seo') || 
        req.url.startsWith('/font-effects')
      )) {
        content = injectUnifiedLayout(content.toString());
      }
      
      res.writeHead(200, { 'Content-Type': mimeType });
      res.end(content);
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});