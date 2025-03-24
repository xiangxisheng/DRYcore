import { Context } from 'hono';
import { adminMenuConfig } from '../config/menu-admin';
import { clientMenuConfig } from '../config/menu-client';
import { permissionConfig } from '../config/permission';
import { authMiddleware } from '../middlewares/auth';

/**
 * 获取管理后台菜单配置
 */
export const getAdminMenuConfig = async (c: Context) => {
  // 从认证中间件获取用户信息
  const user = c.get('user');
  
  if (!user) {
    return c.json({
      status: 'error',
      message: '未授权访问'
    }, 401);
  }
  
  // 通过用户权限过滤菜单
  const userPermissions = user.permissions || [];
  
  // 过滤菜单函数
  const filterMenuByPermission = (menu: any) => {
    // 如果菜单需要权限但用户没有所需权限，则不显示
    if (menu.permissions && menu.permissions.length > 0) {
      const hasPermission = menu.permissions.some((permission: string) => 
        userPermissions.includes(permission)
      );
      
      if (!hasPermission) {
        return false;
      }
    }
    
    // 如果有子菜单，递归过滤
    if (menu.children && menu.children.length > 0) {
      menu.children = menu.children
        .filter(filterMenuByPermission)
        .sort((a: any, b: any) => a.order - b.order);
      
      // 如果过滤后没有子菜单了，且父菜单没有组件，则不显示父菜单
      if (menu.children.length === 0 && !menu.component) {
        return false;
      }
    }
    
    return true;
  };
  
  // 深拷贝菜单并过滤
  const filteredMenu = JSON.parse(JSON.stringify(adminMenuConfig))
    .filter(filterMenuByPermission)
    .sort((a: any, b: any) => a.order - b.order);
  
  return c.json({
    status: 'success',
    data: filteredMenu
  });
};

/**
 * 获取用户前台菜单配置
 */
export const getClientMenuConfig = async (c: Context) => {
  // 从认证中间件获取用户信息
  const user = c.get('user');
  
  if (!user) {
    return c.json({
      status: 'error',
      message: '未授权访问'
    }, 401);
  }
  
  // 用户前台菜单不需要太复杂的权限过滤，直接返回所有菜单
  return c.json({
    status: 'success',
    data: clientMenuConfig
  });
};

/**
 * 获取权限配置
 */
export const getPermissionConfig = async (c: Context) => {
  // 只有管理员可以获取完整的权限配置
  const user = c.get('user');
  
  if (!user) {
    return c.json({
      status: 'error',
      message: '未授权访问'
    }, 401);
  }
  
  // 检查是否有权限管理的权限
  const userPermissions = user.permissions || [];
  if (!userPermissions.includes('permission:view')) {
    return c.json({
      status: 'error',
      message: '没有权限访问'
    }, 403);
  }
  
  return c.json({
    status: 'success',
    data: permissionConfig
  });
};

/**
 * 获取用户权限
 */
export const getUserPermissions = async (c: Context) => {
  const user = c.get('user');
  
  if (!user) {
    return c.json({
      status: 'error',
      message: '未授权访问'
    }, 401);
  }
  
  return c.json({
    status: 'success',
    data: {
      roles: user.roles || [],
      permissions: user.permissions || []
    }
  });
}; 