# 使用更輕量的 Node.js 官方鏡像
FROM node:18-alpine

# 設置工作目錄
WORKDIR /app

# 複製 package.json 和 package-lock.json（如果存在）
COPY package*.json ./

# 安裝依賴
RUN npm ci --only=production

# 複製所有文件
COPY . .

# 先建置 shared-components
WORKDIR /app/shared-components
RUN npm install
RUN npm run build

# 建置音頻可視化器
WORKDIR /app/audio-visualizer
RUN npm install
RUN npm run build

# 建置字體效果生成器
WORKDIR /app/font-effects
RUN npm install
RUN npm run build

# 建置 YouTube SEO 工具
WORKDIR /app/youtube-seo
RUN npm install
# 確保環境變數在構建時可用
ARG GEMINI_API_KEY
ENV GEMINI_API_KEY=$GEMINI_API_KEY
RUN npm run build

# Tools removed

# 回到根目錄
WORKDIR /app

# 暴露端口
EXPOSE 3000

# 設置環境變數
ENV PORT=3000

# 啟動命令
CMD ["npm", "start"]
