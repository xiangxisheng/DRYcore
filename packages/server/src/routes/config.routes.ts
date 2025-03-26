import { Hono } from 'hono';
import { 
  getAdminMenuConfig, 
  getClientMenuConfig, 
  getPermissionConfig, 
  getUserPermissions 
} from '../core/controllers/config.controller';
import { authMiddleware } from '../core/middlewares/auth';

// 创建配置路由
const configRouter = new Hono();

// 添加认证中间件
configRouter.use('*', authMiddleware);

// 管理后台菜单配置
configRouter.get('/admin/menu', getAdminMenuConfig);

// 客户端菜单配置
configRouter.get('/client/menu', getClientMenuConfig);

// 权限配置
configRouter.get('/permissions', getPermissionConfig);

// 用户权限
configRouter.get('/user/permissions', getUserPermissions);

// 应用基本配置
const appConfig = {
  appName: 'DRYcore框架',
  version: process.env.APP_VERSION || 'v0.1.0',
  environment: process.env.NODE_ENV || '开发环境',
  nodeVersion: process.versions.node,
  database: 'PostgreSQL'
};

// 测试用活动日志数据
const activities = [
  { time: '2023-03-24 10:30', description: '用户 admin 登录系统' },
  { time: '2023-03-24 09:45', description: '创建了新服务器 web-01' },
  { time: '2023-03-24 09:15', description: '数据库备份完成' },
  { time: '2023-03-23 18:20', description: '系统例行维护' },
  { time: '2023-03-23 15:10', description: '添加新域名 example.com' }
];

/**
 * 获取应用配置
 * 提供前端需要的应用基本信息
 */
configRouter.get('/app', async (c) => {
  return c.json({
    status: 'success',
    data: appConfig
  });
});

/**
 * 获取活动日志
 * 提供系统最近活动记录
 */
configRouter.get('/activities', authMiddleware(), async (c) => {
  // 实际应用中应该从数据库获取活动日志
  return c.json({
    status: 'success',
    data: activities
  });
});

/**
 * 根据应用名获取特定应用配置
 */
configRouter.get('/app/:appName', async (c) => {
  const appName = c.req.param('appName');
  
  // 这里应该根据应用名从配置存储中获取配置
  // 简化示例，实际应该使用 configStore
  const appSpecificConfig = {
    ...appConfig,
    appName: `${appName} 应用`
  };
  
  return c.json({
    status: 'success',
    data: appSpecificConfig
  });
});

export default configRouter; 