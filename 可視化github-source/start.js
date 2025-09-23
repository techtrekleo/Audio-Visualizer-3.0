#!/usr/bin/env node

import { spawn } from 'child_process';

// 獲取端口，優先使用環境變數，默認為 8080
const PORT = process.env.PORT || 8080;

console.log(`🔧 Starting server...`);
console.log(`🌐 PORT: ${PORT}`);

// 使用 serve 包啟動服務器
const serveProcess = spawn('npx', ['serve', '-s', 'dist', '-l', `tcp://0.0.0.0:${PORT}`], {
  stdio: 'inherit'
});

console.log(`🚀 Serve process started`);

// 錯誤處理
serveProcess.on('error', (error) => {
  console.error(`❌ Error:`, error);
  process.exit(1);
});

serveProcess.on('exit', (code) => {
  console.log(`Process exited with code ${code}`);
  process.exit(code || 0);
});

// 優雅關閉
process.on('SIGTERM', () => {
  serveProcess.kill('SIGTERM');
});

process.on('SIGINT', () => {
  serveProcess.kill('SIGINT');
});
