import { Hono } from 'hono';
import { adminAuthMiddleware } from '../middlewares/auth';

/**
 * 管理后台仪表盘路由
 */
const adminDashboardRouter = new Hono();

// 添加授权中间件
adminDashboardRouter.use('*', adminAuthMiddleware());

// 获取仪表盘数据
adminDashboardRouter.get('/', async (c) => {
  // 这里将来需要调用服务获取实际数据
  const dashboardData = {
    serverCount: 25,
    domainCount: 48,
    storageUsage: {
      total: 1000, // GB
      used: 320,   // GB
    },
    databaseCount: 15,
    websiteCount: 35,
    userCount: 150,
    recentOrders: 12,
    pendingTickets: 5
  };
  
  return c.json({ success: true, data: dashboardData });
});

// 获取系统状态
adminDashboardRouter.get('/status', async (c) => {
  const systemStatus = {
    cpuUsage: 35, // %
    memoryUsage: 42, // %
    diskUsage: 68, // %
    uptime: 15 * 24 * 60 * 60, // 15天的秒数
    services: [
      { name: 'web', status: 'running' },
      { name: 'database', status: 'running' },
      { name: 'queue', status: 'running' },
      { name: 'cron', status: 'running' }
    ]
  };
  
  return c.json({ success: true, data: systemStatus });
});

export { adminDashboardRouter }; 