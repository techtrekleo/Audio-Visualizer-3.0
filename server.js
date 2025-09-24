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
                  .contact-modal-close:hover, .privacy-modal-close:hover, .terms-modal-close:hover {
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
                  
                  /* 隱私政策和使用條款內容樣式 */
                  .privacy-content, .terms-content {
                    color: #e5e7eb;
                    line-height: 1.6;
                  }
                  .privacy-content h3, .terms-content h3 {
                    color: #4ecdc4;
                    font-size: 1.2rem;
                    margin-top: 2rem;
                    margin-bottom: 1rem;
                    border-left: 3px solid #4ecdc4;
                    padding-left: 1rem;
                  }
                  .privacy-content h3:first-child, .terms-content h3:first-child {
                    margin-top: 0;
                  }
                  .privacy-content p, .terms-content p {
                    margin-bottom: 1rem;
                    text-align: justify;
                  }
                  .privacy-content ul, .terms-content ul {
                    margin-left: 1.5rem;
                    margin-bottom: 1rem;
                  }
                  .privacy-content li, .terms-content li {
                    margin-bottom: 0.5rem;
                  }
                  .privacy-content strong, .terms-content strong {
                    color: #4ecdc4;
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
                      <a href="#" onclick="openPrivacyModal(); return false;">
                        <i class="fas fa-shield-alt"></i> 隱私政策
                      </a>
                      <a href="#" onclick="openTermsModal(); return false;">
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
              const modalHtml = `
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
                
                <!-- 隱私政策彈出視窗 -->
                <div id="privacyModal" class="privacy-modal">
                  <div class="privacy-modal-content">
                    <div class="privacy-modal-header">
                      <h3 class="privacy-modal-title">隱私政策</h3>
                      <span class="privacy-modal-close" onclick="closePrivacyModal()">&times;</span>
                    </div>
                    <div class="privacy-content">
                      <h3>資料收集與使用</h3>
                      <p>我們致力於保護您的隱私權。本政策說明我們如何收集、使用和保護您的個人資料。</p>
                      
                      <h3>收集的資料類型</h3>
                      <ul>
                        <li><strong>使用資料：</strong>當您使用我們的服務時，我們會收集您與服務互動的相關資訊</li>
                        <li><strong>技術資料：</strong>包括 IP 地址、瀏覽器類型、作業系統等技術資訊</li>
                        <li><strong>內容資料：</strong>您上傳或輸入的音樂、文字等創作內容</li>
                      </ul>
                      
                      <h3>資料使用目的</h3>
                      <p>我們使用收集的資料來：</p>
                      <ul>
                        <li>提供、維護和改善我們的服務</li>
                        <li>處理您的請求並提供客戶支援</li>
                        <li>分析使用模式以優化服務體驗</li>
                        <li>確保服務的安全性和穩定性</li>
                      </ul>
                      
                      <h3>資料保護</h3>
                      <p>我們採用業界標準的安全措施來保護您的資料，包括加密傳輸、安全儲存和存取控制。</p>
                      
                      <h3>資料分享</h3>
                      <p>我們不會出售、交易或轉讓您的個人資料給第三方，除非：</p>
                      <ul>
                        <li>獲得您的明確同意</li>
                        <li>法律要求或法院命令</li>
                        <li>保護我們的權利和財產</li>
                      </ul>
                      
                      <h3>您的權利</h3>
                      <p>您有權：</p>
                      <ul>
                        <li>存取、更正或刪除您的個人資料</li>
                        <li>限制或反對資料處理</li>
                        <li>資料可攜權</li>
                        <li>撤回同意</li>
                      </ul>
                      
                      <h3>政策更新</h3>
                      <p>我們可能會不時更新此隱私政策。重大變更將透過網站公告或電子郵件通知您。</p>
                      
                      <p><strong>最後更新：</strong>2025年1月</p>
                    </div>
                  </div>
                </div>
                
                <!-- 使用條款彈出視窗 -->
                <div id="termsModal" class="terms-modal">
                  <div class="terms-modal-content">
                    <div class="terms-modal-header">
                      <h3 class="terms-modal-title">使用條款</h3>
                      <span class="terms-modal-close" onclick="closeTermsModal()">&times;</span>
                    </div>
                    <div class="terms-content">
                      <h3>服務條款</h3>
                      <p>歡迎使用音樂脈動-Sonic Pulse 的服務。使用我們的服務即表示您同意遵守以下條款。</p>
                      
                      <h3>服務描述</h3>
                      <p>我們提供音樂創作、音訊可視化和 YouTube SEO 優化等工具，幫助音樂創作者提升創作效率和作品品質。</p>
                      
                      <h3>使用者責任</h3>
                      <ul>
                        <li><strong>合法使用：</strong>您承諾僅將服務用於合法目的，不得用於任何違法活動</li>
                        <li><strong>內容責任：</strong>您對上傳或創作的內容負完全責任，確保不侵犯他人權利</li>
                        <li><strong>帳戶安全：</strong>您有責任保護帳戶安全，不得與他人分享帳戶資訊</li>
                        <li><strong>遵守規定：</strong>您必須遵守所有適用的法律法規和平台規則</li>
                      </ul>
                      
                      <h3>智慧財產權</h3>
                      <p>服務中的所有內容、功能、設計和技術均受智慧財產權法保護。未經授權，不得複製、修改或分發。</p>
                      
                      <h3>使用者內容</h3>
                      <p>您保留對上傳內容的所有權利。使用我們的服務即表示您授予我們必要的使用權限來提供服務。</p>
                      
                      <h3>服務可用性</h3>
                      <p>我們努力保持服務的穩定運行，但不保證服務不會中斷。我們保留在必要時暫停或終止服務的權利。</p>
                      
                      <h3>免責聲明</h3>
                      <p>服務按「現狀」提供，我們不提供任何明示或暗示的保證。我們不對服務中斷、資料遺失或任何損害負責。</p>
                      
                      <h3>責任限制</h3>
                      <p>在法律允許的最大範圍內，我們的責任限於您為服務支付的費用。</p>
                      
                      <h3>條款修改</h3>
                      <p>我們保留隨時修改這些條款的權利。修改後的條款將在網站上公布，繼續使用服務即表示接受新條款。</p>
                      
                      <h3>爭議解決</h3>
                      <p>任何爭議應透過友好協商解決。如無法解決，應提交有管轄權的法院處理。</p>
                      
                      <p><strong>最後更新：</strong>2025年1月</p>
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
                  
                  // 隱私政策彈出視窗功能
                  function openPrivacyModal() {
                    document.getElementById('privacyModal').style.display = 'block';
                    document.body.style.overflow = 'hidden';
                  }
                  
                  function closePrivacyModal() {
                    document.getElementById('privacyModal').style.display = 'none';
                    document.body.style.overflow = 'auto';
                  }
                  
                  // 使用條款彈出視窗功能
                  function openTermsModal() {
                    document.getElementById('termsModal').style.display = 'block';
                    document.body.style.overflow = 'hidden';
                  }
                  
                  function closeTermsModal() {
                    document.getElementById('termsModal').style.display = 'none';
                    document.body.style.overflow = 'auto';
                  }
                  
                  // 點擊背景關閉彈出視窗
                  window.onclick = function(event) {
                    const contactModal = document.getElementById('contactModal');
                    const privacyModal = document.getElementById('privacyModal');
                    const termsModal = document.getElementById('termsModal');
                    
                    if (event.target === contactModal) {
                      closeContactModal();
                    } else if (event.target === privacyModal) {
                      closePrivacyModal();
                    } else if (event.target === termsModal) {
                      closeTermsModal();
                    }
                  }
                  
                  // ESC鍵關閉彈出視窗
                  document.addEventListener('keydown', function(event) {
                    if (event.key === 'Escape') {
                      closeContactModal();
                      closePrivacyModal();
                      closeTermsModal();
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
  modifiedHtml = modifiedHtml.replace('</body>', `${modalHtml}</body>`);
  
  return modifiedHtml;
}

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);
  
  // 設置 CORS 標頭
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  let filePath;
  
  // 處理各個工具的 dist 目錄 - 使用絕對路徑
  if (req.url.startsWith('/audio-visualizer') && !req.url.startsWith('/audio-visualizer/assets/')) {
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
  } else if ((req.url.startsWith('/assets/') || req.url.startsWith('/audio-visualizer/assets/')) && (req.url.includes('main-') || req.url.includes('cat-avatar'))) {
    // 處理 Audio Visualizer 的 assets 請求
    const distPath = path.join(__dirname, 'audio-visualizer', 'dist');
    const assetPath = req.url.startsWith('/audio-visualizer/assets/') ? req.url.replace('/audio-visualizer', '') : req.url;
    filePath = path.join(distPath, assetPath);
  } else if (req.url.startsWith('/assets/') && req.url.includes('DUtiRxny')) {
    // 處理字體特效產生器的 assets 請求
    const distPath = path.join(__dirname, 'font-effects', 'dist');
    filePath = path.join(distPath, req.url);
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