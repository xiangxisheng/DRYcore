import { Context, Next } from 'hono';
import { getCookie } from 'hono/cookie';

/**
 * 管理后台授权中间件
 * 用于验证用户是否登录，以及是否有权限访问特定路由
 */
export const adminAuthMiddleware = (requiredPermissions?: string[]) => {
  return async (c: Context, next: Next) => {
    // 从cookie中获取token
    const token = getCookie(c, 'admin_token');
    
    if (!token) {
      // 未登录，返回401
      return c.json({ success: false, message: '未授权，请先登录' }, 401);
    }
    
    try {
      // 这里将来需要调用服务验证token并获取用户信息
      // 临时模拟已登录用户
      const user = {
        id: 1,
        username: 'admin',
        role: 'administrator',
        permissions: [
          'system:view', 'user:view', 'role:view', 'permission:view', 'config:view',
          'server:view', 'server:create', 'domain:view', 'domain:create',
          'storage:view', 'database:view', 'website:view', 'website:create'
        ]
      };
      
      // 将用户信息添加到请求上下文
      c.set('user', user);
      
      // 如果需要特定权限
      if (requiredPermissions && requiredPermissions.length > 0) {
        // 验证用户是否有所需权限
        const hasPermission = requiredPermissions.every(permission => 
          user.permissions.includes(permission)
        );
        
        if (!hasPermission) {
          return c.json({ success: false, message: '没有足够的权限访问此资源' }, 403);
        }
      }
      
      // 继续处理请求
      return next();
    } catch (error) {
      return c.json({ success: false, message: '授权验证失败' }, 401);
    }
  };
}; 