const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 8000;

// MIME 類型映射
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.wav': 'audio/wav',
  '.mp4': 'video/mp4',
  '.woff': 'application/font-woff',
  '.ttf': 'application/font-ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'application/font-otf',
  '.wasm': 'application/wasm'
};

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  // 設置 CORS 標頭
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  let filePath = path.join(__dirname, 'unified-website', req.url === '/' ? 'index.html' : req.url);
  
  // 處理目錄請求 - 如果請求以 / 結尾，添加 index.html
  if (filePath.endsWith('/')) {
    filePath = path.join(filePath, 'index.html');
  }
  
  // 安全檢查：防止路徑遍歷攻擊
  const safePath = path.resolve(filePath);
  const rootPath = path.resolve(path.join(__dirname, 'unified-website'));
  
  if (!safePath.startsWith(rootPath)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  const extname = String(path.extname(filePath)).toLowerCase();
  const mimeType = mimeTypes[extname] || 'application/octet-stream';

  // 檢查文件是否存在且是文件（不是目錄）
  fs.stat(filePath, (err, stats) => {
    if (err) {
      // 文件不存在，嘗試返回主頁面
      fs.readFile(path.join(__dirname, 'unified-website', 'index.html'), (err, content) => {
        if (err) {
          res.writeHead(404);
          res.end('File not found');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(content, 'utf-8');
        }
      });
      return;
    }

    // 如果是目錄，嘗試讀取目錄中的 index.html
    if (stats.isDirectory()) {
      const indexPath = path.join(filePath, 'index.html');
      fs.readFile(indexPath, (err, content) => {
        if (err) {
          res.writeHead(404);
          res.end('Directory index not found');
        } else {
          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(content, 'utf-8');
        }
      });
      return;
    }

    // 讀取文件
    fs.readFile(filePath, (error, content) => {
      if (error) {
        res.writeHead(500);
        res.end(`Server Error: ${error.code}`);
      } else {
        res.writeHead(200, { 'Content-Type': mimeType });
        res.end(content, 'utf-8');
      }
    });
  });
});

server.listen(PORT, () => {
  console.log(`Music Pulse Unified Platform running on port ${PORT}`);
  console.log(`Access the site at: http://localhost:${PORT}`);
});

// 優雅關閉
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});
