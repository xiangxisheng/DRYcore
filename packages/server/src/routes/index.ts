import { Hono } from 'hono';
import configRouter from './config.routes';

// 创建API主路由
const apiRouter = new Hono();

// 注册配置路由
apiRouter.route('/config', configRouter);

// TODO: 注册其他API路由

// 健康检查API
apiRouter.get('/health', (c) => {
  return c.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

export default apiRouter; 