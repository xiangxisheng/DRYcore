import { Hono } from 'hono';
import { authMiddleware } from '../middlewares/auth';
import {
  getAdminMenuConfig,
  getClientMenuConfig,
  getPermissionConfig,
  getUserPermissions
} from '../controllers/config.controller';

// 创建配置路由
const configRouter = new Hono();

// 菜单配置接口
configRouter.get('/admin-menu', authMiddleware(), getAdminMenuConfig);
configRouter.get('/client-menu', authMiddleware(), getClientMenuConfig);

// 权限配置接口
configRouter.get('/permissions', authMiddleware(['permission:view']), getPermissionConfig);

// 用户权限接口
configRouter.get('/user-permissions', authMiddleware(), getUserPermissions);

export { configRouter }; 