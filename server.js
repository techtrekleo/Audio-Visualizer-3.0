const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8000;

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);
  
  // 設置 CORS 標頭
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  let filePath;
  
  // 處理各個工具的 dist 目錄
  if (req.url.startsWith('/audio-visualizer')) {
    // audio-visualizer 服務根目錄的 index.html，但資源從 dist 目錄載入
    const relativePath = req.url.replace('/audio-visualizer', '');
    filePath = path.join(__dirname, 'audio-visualizer', relativePath);
    
    // 如果是目錄，添加 index.html
    if (filePath.endsWith('/') || !path.extname(filePath)) {
      filePath = path.join(filePath, 'index.html');
    }
  } else if (req.url.startsWith('/font-effects')) {
    // font-effects 服務根目錄的 index.html，但資源從 dist 目錄載入
    const relativePath = req.url.replace('/font-effects', '');
    filePath = path.join(__dirname, 'font-effects', relativePath);
    
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