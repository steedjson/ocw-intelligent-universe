/**
 * 主服务器入口
 * 
 * 统一 3001 端口方案：
 * - 开发环境：仅 API，前端使用 Vite (localhost:3000)
 * - 生产环境：API + 静态文件服务
 */
import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer } from 'http';

import dashboardRoutes from './routes/dashboard';
import historyRoutes from './routes/history';
import settingsRoutes from './routes/settings';
import { WebSocketService } from '../services/websocket-service';

const PORT = process.env.PORT || 3001;
const isDev = process.env.NODE_ENV === 'development';

const app = express();
const server = createServer(app);

// 中间件
app.use(cors());
app.use(express.json());

// API 路由
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/settings', settingsRoutes);

// 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 静态文件服务（生产环境）
if (!isDev) {
  const frontendDist = path.join(__dirname, '../../src/frontend/dist');
  app.use(express.static(frontendDist));
  
  // 前端路由 fallback
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
} else {
  // 开发环境：根路径返回 API 信息
  app.get('/', (req, res) => {
    res.json({
      name: 'Intelligent Universe Phase 3',
      version: '1.0.0',
      mode: 'development',
      endpoints: {
        dashboard: '/api/dashboard',
        history: '/api/history',
        settings: '/api/settings',
        health: '/health'
      },
      frontend: 'http://localhost:3000 (Vite dev server)'
    });
  });
}

// 启动服务器
server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Dashboard API: http://localhost:${PORT}/api/dashboard`);
  console.log(`📜 History API: http://localhost:${PORT}/api/history`);
  console.log(`⚙️  Settings API: http://localhost:${PORT}/api/settings`);
  console.log(`📡 WebSocket: ws://localhost:${PORT}/ws`);
  if (isDev) {
    console.log(`🎨 Frontend (Dev): http://localhost:3000`);
  } else {
    console.log(`🎨 Frontend (Prod): http://localhost:${PORT}`);
  }
});

// 初始化 WebSocket 服务
const wsService = new WebSocketService(server);

// 导出 WebSocket 服务供其他模块使用
export { wsService };
