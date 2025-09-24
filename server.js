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
      
                  /* 統一頁尾樣式 - 工具頁面使用純色背景 */
                  .unified-footer {
                    background: #000000;
                    padding: 3rem 0 2rem;
                    text-align: center;
                    border-top: 1px solid #000000;
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
                  
                  /* 覆蓋工具頁面的灰色邊框 */
                  .border-gray-700 {
                    border-color: #000000 !important;
                  }
                  .border-gray-600 {
                    border-color: #000000 !important;
                  }
                  .border-gray-500 {
                    border-color: #000000 !important;
                  }
                  .border-gray-400 {
                    border-color: #000000 !important;
                  }
                  
                  /* 聯繫我們彈出視窗樣式 */
                  .contact-modal {
                    display: none;
                    position: fixed;
                    z-index: 1000;
                    left: 0;
                    top: 0;
                    width: 100%;
                    height: 100%;
                    background-color: rgba(0, 0, 0, 0.8);
                    backdrop-filter: blur(5px);
                  }
                  .contact-modal-content {
                    background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
                    margin: 10% auto;
                    padding: 2rem;
                    border: 1px solid #4ecdc4;
                    border-radius: 20px;
                    width: 90%;
                    max-width: 500px;
                    position: relative;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
                  }
                  .contact-modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                  }
                  .contact-modal-title {
                    color: #4ecdc4;
                    font-size: 1.5rem;
                    font-weight: bold;
                    margin: 0;
                  }
                  .contact-modal-close {
                    color: #aaa;
                    font-size: 2rem;
                    font-weight: bold;
                    cursor: pointer;
                    transition: color 0.3s ease;
                  }
                  .contact-modal-close:hover {
                    color: #4ecdc4;
                  }
                  .contact-options {
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                  }
                  .contact-option {
                    display: flex;
                    align-items: center;
                    padding: 1rem;
                    background: rgba(78, 205, 196, 0.1);
                    border: 1px solid rgba(78, 205, 196, 0.3);
                    border-radius: 15px;
                    transition: all 0.3s ease;
                    cursor: pointer;
                    text-decoration: none;
                    color: white;
                  }
                  .contact-option:hover {
                    background: rgba(78, 205, 196, 0.2);
                    border-color: #4ecdc4;
                    transform: translateY(-2px);
                  }
                  .contact-option-icon {
                    width: 40px;
                    height: 40px;
                    margin-right: 1rem;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                  }
                  .contact-option-text {
                    flex: 1;
                  }
                  .contact-option-title {
                    font-weight: bold;
                    margin-bottom: 0.25rem;
                  }
                  .contact-option-desc {
                    font-size: 0.9rem;
                    color: #b8b8b8;
                  }
                  
                  /* Buy Me a Coffee 按鈕樣式 */
                  .btn-coffee {
                    background: linear-gradient(135deg, #ff6b9d 0%, #4ecdc4 100%);
                    color: white;
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    border-radius: 15px;
                    padding: 1rem 2rem;
                    font-weight: 600;
                    text-decoration: none;
                    display: inline-flex;
                    align-items: center;
                    gap: 1rem;
                    transition: all 0.3s ease;
                    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
                    position: relative;
                    overflow: hidden;
                    font-family: 'Poppins', sans-serif;
                    backdrop-filter: blur(10px);
                  }
                  
                  .btn-coffee::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: -100%;
                    width: 100%;
                    height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
                    transition: left 0.5s ease;
                  }
                  
                  .btn-coffee:hover::before {
                    left: 100%;
                  }
                  
                  .btn-coffee:hover {
                    background: linear-gradient(135deg, #ff8fb3 0%, #5dd5d5 100%);
                    transform: translateY(-3px);
                    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
                    color: white;
                  }
                  
                  .btn-coffee:active {
                    transform: translateY(-1px) scale(1.02);
                  }
                  
                  .coffee-cat-icon {
                    width: 2.5rem;
                    height: 2.5rem;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 2px solid rgba(255, 255, 255, 0.3);
                    animation: coffeeSteam 2s ease-in-out infinite;
                  }
                  
                  @keyframes coffeeSteam {
                    0%, 100% { transform: translateY(0px) scale(1); }
                    50% { transform: translateY(-3px) scale(1.05); }
                  }
                  
                  .coffee-text {
                    display: flex;
                    flex-direction: column;
                    align-items: flex-start;
                    line-height: 1.2;
                  }
                  
                  .coffee-main {
                    font-size: 1.1rem;
                    font-weight: 700;
                    display: block;
                  }
                  
                  .coffee-sub {
                    font-size: 0.8rem;
                    opacity: 0.9;
                    display: block;
                    margin-top: 0.3rem;
                  }
                  
                  .btn-coffee-large {
                    padding: 1.5rem 3rem;
                    font-size: 1.1rem;
                  }
                  
                  .btn-coffee-large .coffee-main {
                    font-size: 1.2rem;
                  }
                  
                  .btn-coffee-large .coffee-sub {
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

              // 統一的頁尾 HTML - 使用首頁樣式
              const unifiedFooter = `
                <!-- 統一頁尾 -->
                <footer class="unified-footer">
                  <div class="footer-content">
                    <div class="footer-links">
                      <a href="https://www.youtube.com/@%E9%9F%B3%E6%A8%82%E8%84%88%E5%8B%95SonicPulse" target="_blank">
                        <i class="fab fa-youtube"></i> YouTube
                      </a>
                      <a href="#" onclick="openContactModal()">
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
                      <a href="https://buymeacoffee.com/sonicpulse2025" target="_blank" class="btn btn-coffee btn-coffee-large">
                        <img src="/assets/cat-avatar.png" alt="口袋裡的貓" class="coffee-cat-icon">
                        <div class="coffee-text">
                          <span class="coffee-main">贊助口袋裡的貓</span>
                          <span class="coffee-sub">Buy me a coffee</span>
                        </div>
                      </a>
                    </div>
                    
                    <div class="footer-bottom">
                      <p>&copy; <span id="currentYear"></span> 音樂脈動-Sonic Pulse. 保留所有權利. | 用 ❤️ 為音樂創作者打造</p>
                    </div>
                  </div>
                </footer>
              `;

              // 添加彈出視窗HTML到body最後
              const contactModalHtml = `
                <!-- 聯繫我們彈出視窗 -->
                <div id="contactModal" class="contact-modal">
                  <div class="contact-modal-content">
                    <div class="contact-modal-header">
                      <h3 class="contact-modal-title">聯繫我們</h3>
                      <span class="contact-modal-close" onclick="closeContactModal()">&times;</span>
                    </div>
                    <div class="contact-options">
                      <a href="https://discord.com/users/104427212337332224" target="_blank" class="contact-option">
                        <div class="contact-option-icon">
                          <i class="fab fa-discord" style="color: #5865F2;"></i>
                        </div>
                        <div class="contact-option-text">
                          <div class="contact-option-title">Discord</div>
                          <div class="contact-option-desc">即時聊天與技術支援</div>
                        </div>
                      </a>
                      <a href="https://www.threads.com/@sonicpulse.taiwan" target="_blank" class="contact-option">
                        <div class="contact-option-icon">
                          <i class="fas fa-at" style="color: #000000;"></i>
                        </div>
                        <div class="contact-option-text">
                          <div class="contact-option-title">Threads</div>
                          <div class="contact-option-desc">社群互動與最新消息</div>
                        </div>
                      </a>
                      <a href="https://www.youtube.com/@%E9%9F%B3%E6%A8%82%E8%84%88%E5%8B%95SonicPulse" target="_blank" class="contact-option">
                        <div class="contact-option-icon">
                          <i class="fab fa-youtube" style="color: #FF0000;"></i>
                        </div>
                        <div class="contact-option-text">
                          <div class="contact-option-title">YouTube 音樂頻道</div>
                          <div class="contact-option-desc">音樂脈動-Sonic Pulse</div>
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
                
                <script>
                  // 更新年份
                  document.getElementById('currentYear').textContent = new Date().getFullYear();
                  
                  // 聯繫我們彈出視窗功能
                  function openContactModal() {
                    document.getElementById('contactModal').style.display = 'block';
                    document.body.style.overflow = 'hidden';
                  }
                  
                  function closeContactModal() {
                    document.getElementById('contactModal').style.display = 'none';
                    document.body.style.overflow = 'auto';
                  }
                  
                  // 點擊背景關閉彈出視窗
                  window.onclick = function(event) {
                    const modal = document.getElementById('contactModal');
                    if (event.target === modal) {
                      closeContactModal();
                    }
                  }
                  
                  // ESC鍵關閉彈出視窗
                  document.addEventListener('keydown', function(event) {
                    if (event.key === 'Escape') {
                      closeContactModal();
                    }
                  });
                </script>
              `;

  // 注入樣式到 head
  let modifiedHtml = htmlContent.replace('</head>', `${unifiedStyles}</head>`);
  
  // 注入頁首到 body 開始
  modifiedHtml = modifiedHtml.replace('<body>', `<body>${unifiedHeader}`);
  
  // 注入頁尾到 body 結束
  modifiedHtml = modifiedHtml.replace('</body>', `${unifiedFooter}</body>`);
  
  // 注入彈出視窗到 body 最後
  modifiedHtml = modifiedHtml.replace('</body>', `${contactModalHtml}</body>`);
  
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
  } else if (req.url.startsWith('/assets/') && req.url.includes('index-')) {
    // 處理 YouTube SEO 的 assets 請求
    const distPath = path.join(__dirname, 'youtube-seo', 'dist');
    filePath = path.join(distPath, req.url);
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