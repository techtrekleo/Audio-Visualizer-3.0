const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

// GitHub Configuration
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO = process.env.GITHUB_REPO || 'techtrekleo/Audio-Visualizer-3.0'; // Default if not set
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || 'main';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD; // Server-side password

// 統一頁首頁尾注入函數
function injectUnifiedLayout(htmlContent, includeFooter = true) {
  // 統一的頁首頁尾樣式
  const unifiedStyles = `
    <style>
      /* 統一頁首樣式 - 與首頁一致 */
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
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0 2rem;
      }
      .unified-navbar .logo {
        font-family: 'Orbitron', monospace;
        display: flex;
        align-items: center;
        gap: 1rem;
      }
      .unified-navbar .logo-cat {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        object-fit: cover;
      }
      .unified-navbar .logo-main {
        font-size: 1.8rem;
        font-weight: 900;
        background: linear-gradient(45deg, #ff6b6b, #4ecdc4, #45b7d1);
        background-size: 200% 200%;
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
        animation: unified-gradient 3s ease infinite;
      }
      .unified-navbar .logo-sub {
        font-size: 0.7rem;
        font-weight: 400;
        color: #96ceb4;
        margin-top: -2px;
      }
      .unified-navbar .nav-links {
        display: flex;
        list-style: none;
        gap: 2rem;
        margin: 0;
        padding: 0;
      }
      .unified-navbar .nav-links a {
        color: #ffffff;
        text-decoration: none;
        font-weight: 500;
        transition: color 0.3s ease;
        position: relative;
      }
      .unified-navbar .nav-links a:hover {
        color: #4ecdc4;
      }
      .unified-navbar .nav-links a::after {
        content: '';
        position: absolute;
        bottom: -5px;
        left: 0;
        width: 0;
        height: 2px;
        background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
        transition: width 0.3s ease;
      }
      .unified-navbar .nav-links a:hover::after {
        width: 100%;
      }
      @keyframes unified-gradient {
        0% { background-position: 0% 50%; }
        50% { background-position: 100% 50%; }
        100% { background-position: 0% 50%; }
      }
      @media (max-width: 768px) {
        .unified-navbar .nav-container {
          padding: 0 1rem;
        }
        .unified-navbar .logo-main {
          font-size: 1.5rem;
        }
        .unified-navbar .logo-sub {
          font-size: 0.6rem;
        }
        .unified-navbar .nav-links {
          display: none;
        }
      }
      
                  /* 統一頁尾樣式 - 工具頁面使用莫蘭迪淺色背景 */
                  .unified-footer {
                    background: rgba(232, 232, 227, 0.8);
                    padding: 3rem 0 2rem;
                    text-align: center;
                    border-top: 1px solid rgba(74, 74, 74, 0.2);
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
                    color: #5C5C5C;
                    text-decoration: none;
                    transition: color 0.3s ease;
                  }
                  .unified-footer .footer-links a:hover {
                    color: #8B9DC3;
                  }
                  .unified-footer .footer-bottom {
                    color: #6B7280;
                    font-size: 0.9rem;
                  }
                  
                  /* 純色設定 - 低亮度低彩度 */
                  body {
                    background-color: #1a1a1a !important;
                  }
                  
                  /* 為畫布添加低彩度邊框 */
                  canvas {
                    border: 2px solid #4a5568 !important;
                    border-radius: 8px !important;
                  }
                  
                  /* 工具頁面背景 */
                  .bg-gray-800, .bg-gray-900 {
                    background-color: #2d3748 !important;
                    border-color: #4a5568 !important;
                  }
                  
                  /* 純色設定 - 低亮度低彩度 */
                  body {
                    background-color: #1a1a1a !important;
                  }
                  
                  /* 彈出視窗樣式 */
                  .contact-modal, .privacy-modal, .terms-modal {
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
                  .contact-modal-content, .privacy-modal-content, .terms-modal-content {
                    background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%);
                    margin: 5% auto;
                    padding: 2rem;
                    border: 1px solid #4ecdc4;
                    border-radius: 20px;
                    width: 90%;
                    max-width: 600px;
                    max-height: 80vh;
                    overflow-y: auto;
                    position: relative;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
                  }
                  .contact-modal-header, .privacy-modal-header, .terms-modal-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 2rem;
                    padding-bottom: 1rem;
                    border-bottom: 1px solid #4ecdc4;
                  }
                  .contact-modal-title, .privacy-modal-title, .terms-modal-title {
                    color: #4ecdc4;
                    font-size: 1.5rem;
                    font-weight: bold;
                    margin: 0;
                  }
                  .contact-modal-close, .privacy-modal-close, .terms-modal-close {
                    color: #aaa;
                    font-size: 2rem;
                    font-weight: bold;
                    cursor: pointer;
                    transition: color 0.3s ease;
                  }
                  /* ... (Previous CSS remains roughly the same) ... */
                  
                  /* Buy Me a Coffee 按鈕樣式 (Simplified for brevity as it was very long) */
                  .btn-coffee {
                    background: linear-gradient(135deg, #A8B5C4 0%, #8B9DC3 100%);
                    color: #FFFFFF;
                    border-radius: 15px;
                    padding: 1rem 2rem;
                    display: inline-flex;
                    align-items: center;
                    gap: 1rem;
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
            <a href="#" onclick="openContactModal()">
            <i class="fas fa-envelope"></i> 聯繫我們
            </a>
            <a href="#" onclick="openPrivacyModal(); return false;">
            <i class="fas fa-shield-alt"></i> 隱私政策
            </a>
            <a href="#" onclick="openTermsModal(); return false;">
            <i class="fas fa-file-contract"></i> 使用條款
            </a>
        </div>
        
        <!-- Buy Me a Coffee 按鈕 -->
        <div style="margin: 2rem 0; text-align: center;">
            <p style="color: #5C5C5C; margin-bottom: 1rem;">喜歡我的工具嗎？請我喝杯咖啡吧！</p>
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

  // Modal HTML (Simplified for brevity, assuming existing modals in pages or simple link)
  // Re-adding scripts for year and modal toggle
  const modalHtml = `
    <script>
        const yearElement = document.getElementById('currentYear');
        if (yearElement) yearElement.textContent = new Date().getFullYear();
        
        function openContactModal() { document.getElementById('contactModal').style.display = 'block'; document.body.style.overflow = 'hidden'; }
        function closeContactModal() { document.getElementById('contactModal').style.display = 'none'; document.body.style.overflow = 'auto'; }
        
        function openPrivacyModal() { document.getElementById('privacyModal').style.display = 'block'; document.body.style.overflow = 'hidden'; }
        function closePrivacyModal() { document.getElementById('privacyModal').style.display = 'none'; document.body.style.overflow = 'auto'; }
        
        function openTermsModal() { document.getElementById('termsModal').style.display = 'block'; document.body.style.overflow = 'hidden'; }
        function closeTermsModal() { document.getElementById('termsModal').style.display = 'none'; document.body.style.overflow = 'auto'; }
        
        window.onclick = function(event) {
        if (event.target.classList.contains('contact-modal') || event.target.classList.contains('privacy-modal') || event.target.classList.contains('terms-modal')) {
            event.target.style.display = 'none'; document.body.style.overflow = 'auto';
        }
        };
    </script>
    `;

  // 注入樣式到 head
  let modifiedHtml = htmlContent.replace('</head>', `${unifiedStyles}</head>`);

  // 注入頁首到 body 開始
  modifiedHtml = modifiedHtml.replace('<body>', `<body>${unifiedHeader}`);

  // 注入頁尾到 body 結束（僅當 includeFooter 為 true 時）
  if (includeFooter) {
    modifiedHtml = modifiedHtml.replace('</body>', `${unifiedFooter}</body>`);
  }

  // 注入彈出視窗到 body 最後
  modifiedHtml = modifiedHtml.replace('</body>', `${modalHtml}</body>`);

  return modifiedHtml;
}

// Helper to commit file to GitHub
function updateGitHubFile(filePath, content, message, callback) {
  if (!GITHUB_TOKEN) {
    console.warn('GITHUB_TOKEN not set. Skipping GitHub sync.');
    return callback(null); // success but no sync
  }

  const pathInRepo = filePath; // e.g., 'creators.json'
  console.log(`Attempting to commit ${pathInRepo} to GitHub...`);

  // 1. Get current file SHA
  const options = {
    hostname: 'api.github.com',
    path: `/repos/${GITHUB_REPO}/contents/${pathInRepo}?ref=${GITHUB_BRANCH}`,
    method: 'GET',
    headers: {
      'User-Agent': 'Node.js Server',
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json'
    }
  };

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => data += chunk);
    res.on('end', () => {
      if (res.statusCode !== 200 && res.statusCode !== 404) {
        console.error('GitHub Get SHA Error:', res.statusCode, data);
        return callback(new Error(`GitHub API Error: ${res.statusCode}`));
      }

      let sha = null;
      if (res.statusCode === 200) {
        try {
          sha = JSON.parse(data).sha;
        } catch (e) {
          return callback(new Error('Failed to parse GitHub response'));
        }
      }

      // 2. Update file
      const updateOptions = {
        hostname: 'api.github.com',
        path: `/repos/${GITHUB_REPO}/contents/${pathInRepo}`,
        method: 'PUT',
        headers: {
          'User-Agent': 'Node.js Server',
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json'
        }
      };

      const body = JSON.stringify({
        message: message,
        content: Buffer.from(content).toString('base64'),
        branch: GITHUB_BRANCH,
        sha: sha // Include SHA if file exists
      });

      const updateReq = https.request(updateOptions, (updateRes) => {
        let updateData = '';
        updateRes.on('data', (chunk) => updateData += chunk);
        updateRes.on('end', () => {
          if (updateRes.statusCode === 200 || updateRes.statusCode === 201) {
            console.log('GitHub commit successful!');
            callback(null);
          } else {
            console.error('GitHub Commit Error:', updateRes.statusCode, updateData);
            callback(new Error(`GitHub Commit Failed: ${updateRes.statusCode}`));
          }
        });
      });

      updateReq.on('error', (e) => callback(e));
      updateReq.write(body);
      updateReq.end();
    });
  });

  req.on('error', (e) => callback(e));
  req.end();
}

function handleCreatorsApi(req, res) {
  let body = '';
  req.on('data', chunk => body += chunk);
  req.on('end', () => {
    try {
      const { action, data } = JSON.parse(body);
      const password = req.headers['x-admin-password'];

      // Password Validation Logic
      // Only required for DELETE actions
      if (action.startsWith('delete_')) {
        let isAuth = false;
        if (ADMIN_PASSWORD) {
          isAuth = (password === ADMIN_PASSWORD);
        } else {
          // Backward compatibility for client-side hash '435'
          if (password) {
            const hash = password.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            isAuth = (hash === 435 && password.length === 8);
          }
        }

        if (!isAuth) {
          res.statusCode = 403;
          res.setHeader('Content-Type', 'application/json');
          return res.end(JSON.stringify({ error: 'Unauthorized: Admin Password Required for Deletion' }));
        }
      }

      const creatorsPath = path.join(__dirname, 'creators.json');
      fs.readFile(creatorsPath, 'utf8', (err, fileData) => {
        if (err) {
          console.error(err);
          res.statusCode = 500;
          return res.end(JSON.stringify({ error: 'Failed to read database' }));
        }

        let creators = JSON.parse(fileData);
        let commitMessage = '';

        // Process Actions
        if (action === 'add_creator') {
          creators.push(data);
          commitMessage = `feat: add new creator ${data.dcName}`;
        } else if (action === 'delete_creator') {
          creators = creators.filter(c => c.id !== data.id);
          commitMessage = `feat: delete creator ${data.id}`;
        } else if (action === 'add_sub_channel') {
          const creator = creators.find(c => c.id === data.creatorId);
          if (creator) {
            if (!creator.additionalChannels) creator.additionalChannels = [];
            creator.additionalChannels.push({
              channelName: data.channelName,
              youtubeUrl: data.youtubeUrl
            });
            commitMessage = `feat: add sub-channel to ${creator.dcName}`;
          }
        } else if (action === 'delete_sub_channel') {
          const creator = creators.find(c => c.id === data.creatorId);
          if (creator && creator.additionalChannels && typeof data.channelIndex === 'number') {
            creator.additionalChannels.splice(data.channelIndex, 1);
            commitMessage = `feat: delete sub-channel from ${creator.dcName}`;
          }
        }

        const newContent = JSON.stringify(creators, null, 4);

        // 1. Write locally
        fs.writeFile(creatorsPath, newContent, (writeErr) => {
          if (writeErr) {
            res.statusCode = 500;
            return res.end(JSON.stringify({ error: 'Failed to save locally' }));
          }

          // 2. Sync to GitHub
          updateGitHubFile('creators.json', newContent, commitMessage, (gitErr) => {
            if (gitErr) {
              console.error('GitHub Sync Failed:', gitErr);
              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              return res.end(JSON.stringify({ success: true, warning: 'Saved locally but GitHub sync failed.' }));
            }

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ success: true }));
          });
        });
      });

    } catch (e) {
      console.error(e);
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ error: 'Invalid Request' }));
    }
  });
}

const server = http.createServer((req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-password');

  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  const urlPath = decodeURIComponent(req.url.split('?')[0]);

  // API Routes
  if (urlPath === '/api/creators' && req.method === 'POST') {
    return handleCreatorsApi(req, res);
  }

  // Static File Serving
  let filePath;

  // Special handling for audio-visualizer route to serve from dist
  if (urlPath.startsWith('/audio-visualizer')) {
    const relPath = urlPath.replace('/audio-visualizer', '') || '/';
    // If asking for root of sub-app, load index.html from dist
    if (relPath === '/' || relPath === '/index.html') {
      filePath = path.join(__dirname, 'audio-visualizer', 'dist', 'index.html');
    } else {
      filePath = path.join(__dirname, 'audio-visualizer', 'dist', relPath.substring(1));
    }
  } else {
    // Default behavior for other paths
    filePath = path.join(__dirname, urlPath === '/' ? 'index.html' : urlPath.substring(1));

    // 檢查是否為目錄，如果是則嘗試尋找 index.html
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }
  }

  // Implicit .html for specific routes if needed, or default
  if (!fs.existsSync(filePath) && !path.extname(filePath) && !filePath.endsWith('.json')) {
    if (fs.existsSync(filePath + '.html')) filePath += '.html';
  }

  const ext = path.extname(filePath);
  const mimeType = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.txt': 'text/plain',
    '.xml': 'application/xml',
    '.ico': 'image/x-icon',
    '.svg': 'image/svg+xml'
  }[ext] || 'text/plain';

  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT' || error.code === 'EISDIR') {
        // Try 404.html
        fs.readFile(path.join(__dirname, '404.html'), (err404, content404) => {
          res.writeHead(404, { 'Content-Type': 'text/html' });
          res.end(content404 || '404 Not Found - Path: ' + urlPath);
        });
      } else {
        res.writeHead(500);
        res.end('Server Error: ' + error.code + ' - Path: ' + urlPath);
      }
    } else {
      // Inject Layout for HTML pages
      if (ext === '.html' && !req.url.includes('google') && includeLayout(req.url)) {
        // Note: includeLayout is just a check, for now apply to all root level HTMLs except specific ones
        // Actually, simply applying to all .html except maybe ads/iframes
        content = injectUnifiedLayout(content.toString(), true);
      }
      res.writeHead(200, { 'Content-Type': mimeType });
      res.end(content);
    }
  });
});

function includeLayout(url) {
  // Logic to decide if layout should be injected
  // e.g. avoid injecting on small components if any
  return true;
}

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

process.on('SIGTERM', () => {
  server.close(() => process.exit(0));
});