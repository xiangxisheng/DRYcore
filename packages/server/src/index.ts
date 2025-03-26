import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import { config } from './config';
import { errorMiddleware } from './middlewares/error';
import apiRouter from './routes';
import { setupSwagger } from './utils/swagger';
import { loadAllApps, domainRoutingMiddleware } from './core/app-loader';

// 创建Hono应用
const app = new Hono();

// 添加中间件
app.use('*', logger());
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
  exposeHeaders: ['Content-Length'],
  maxAge: 86400,
}));
app.use('*', secureHeaders());
app.use('*', errorMiddleware);
app.use('*', domainRoutingMiddleware());

// 添加API文档
if (config.apiDocs.enabled) {
  setupSwagger(app);
}

// 添加健康检查路由
app.get('/health', (c) => c.json({ status: 'ok', timestamp: new Date().toISOString() }));

// 添加API路由
app.route('/api', apiRouter);

// 异步启动函数
async function bootstrap() {
  try {
    // 加载所有应用
    await loadAllApps(app);
    
    // 启动服务器
    const port = config.server.port;
    console.log(`服务器启动成功，监听端口 ${port}`);
    console.log(`访问管理后台: http://localhost:${port}`);
    
    serve({
      fetch: app.fetch,
      port
    });
  } catch (error) {
    console.error('服务器启动失败:', error);
    process.exit(1);
  }
}

// 启动服务器
bootstrap(); 