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
import { adminMenuConfig } from '@/apps/feieryun/admin/config/menu';
import { clientMenuConfig } from '@/apps/feieryun/client/config/menu';
import { feieryunPermissionConfig } from '@/apps/feieryun/shared/config/permissions';

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

// 在合适的地方注册这些配置
console.log('已加载飞儿云管理后台菜单配置:', adminMenuConfig.length);
console.log('已加载飞儿云用户前台菜单配置:', clientMenuConfig.length);
console.log('已加载飞儿云权限配置:', feieryunPermissionConfig.length);

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