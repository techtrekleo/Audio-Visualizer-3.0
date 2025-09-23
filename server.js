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

  // 處理根路徑
  if (req.url === '/') {
    req.url = '/index.html';
  }

  // 處理工具路徑 - 重定向到構建好的文件
  if (req.url.startsWith('/audio-visualizer-source/')) {
    const relativePath = req.url.replace('/audio-visualizer-source', '');
    req.url = '/audio-visualizer-source/dist' + relativePath;
  } else if (req.url.startsWith('/youtube-seo-source/')) {
    const relativePath = req.url.replace('/youtube-seo-source', '');
    req.url = '/youtube-seo-source/dist' + relativePath;
  } else if (req.url.startsWith('/font-effects-source/')) {
    const relativePath = req.url.replace('/font-effects-source', '');
    req.url = '/font-effects-source/dist' + relativePath;
  }

  let filePath = path.join(__dirname, req.url);
  
  // 處理目錄請求
  if (filePath.endsWith('/')) {
    filePath = path.join(filePath, 'index.html');
  }

  const extname = String(path.extname(filePath)).toLowerCase();
  const mimeType = mimeTypes[extname] || 'application/octet-stream';

  // 讀取文件
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        res.writeHead(404);
        res.end('File not found');
      } else {
        res.writeHead(500);
        res.end(`Server Error: ${error.code}`);
      }
    } else {
      res.writeHead(200, { 'Content-Type': mimeType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, '0.0.0.0', () => {
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