const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8000;

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);
  
  // 設置 CORS 標頭
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
  
  // 處理 assets 路徑
  if (req.url.startsWith('/assets/')) {
    // 檢查各個工具目錄中的 assets
    const toolDirs = ['audio-visualizer', 'youtube-seo', 'font-effects'];
    for (const toolDir of toolDirs) {
      const assetPath = path.join(__dirname, toolDir, 'dist', req.url);
      if (fs.existsSync(assetPath)) {
        filePath = assetPath;
        break;
      }
    }
  }
  
  // 如果是目錄，添加 index.html
  if (filePath.endsWith('/')) {
    filePath = path.join(filePath, 'index.html');
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