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

export default configRouter; 