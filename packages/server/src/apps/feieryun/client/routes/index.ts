import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { apiRouter } from './api';
import { clientMenuConfig } from '../config/menu';

// 创建客户端路由
export const clientRouter = new Hono();

// 添加中间件
clientRouter.use('*', cors());

// 添加API路由
try {
  clientRouter.route('/api', apiRouter);
} catch (error) {
  console.warn('加载客户端API路由失败:', error);
  // 创建默认API路由
  const defaultApiRouter = new Hono();
  defaultApiRouter.get('/', (c: { json: (data: any) => any }) => c.json({ status: 'ok', message: '飞儿云客户端API' }));
  clientRouter.route('/api', defaultApiRouter);
}

// 菜单配置API
clientRouter.get('/menu', (c: { json: (data: any) => any }) => {
  return c.json({
    status: 'success',
    data: clientMenuConfig
  });
});

// 公共API
clientRouter.get('/', (c: { json: (data: any) => any }) => {
  return c.json({
    status: 'success',
    message: '飞儿云客户端服务正常运行',
    timestamp: new Date().toISOString()
  });
}); 