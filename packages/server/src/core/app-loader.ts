import { Hono } from 'hono';
import { getDomainAppType } from '../config/domain';
import { AppModule } from '../types/app';
import { registerConfig } from './controllers/config.controller';

interface Context {
  req: {
    header: (name: string) => string | undefined;
  };
  set: (key: string, value: any) => void;
  header: (name: string, value: string) => void;
  next: () => Promise<any>;
}

/**
 * 注册应用
 * @param server Hono服务器实例
 * @param app 应用模块
 */
export function registerApp(server: Hono, app: AppModule): void {
  const appName = app.name.split('-')[0]; // 提取应用名称（去除端类型后缀）
  console.log(`注册应用: ${app.name} (${app.type})`);
  
  // 调用应用的注册方法
  app.register(server);
  
  // 加载应用的菜单和权限配置（如果存在）
  try {
    if (app.type === 'admin') {
      // 加载并注册管理后台菜单
      const adminMenuConfig = require(`../apps/${appName}/admin/config/menu`).adminMenuConfig;
      registerConfig(appName, 'admin.menus', adminMenuConfig);
      console.log(`已加载${appName}管理后台菜单配置:`, adminMenuConfig.length);
    } else if (app.type === 'client') {
      // 加载并注册客户端菜单
      const clientMenuConfig = require(`../apps/${appName}/client/config/menu`).clientMenuConfig;
      registerConfig(appName, 'client.menus', clientMenuConfig);
      console.log(`已加载${appName}用户前台菜单配置:`, clientMenuConfig.length);
    }
    
    // 加载并注册权限配置（无论端类型）
    try {
      const permissionsConfig = require(`../apps/${appName}/shared/config/permissions`).feieryunPermissionConfig;
      registerConfig(appName, 'permissions', permissionsConfig);
      console.log(`已加载${appName}权限配置:`, permissionsConfig.length);
    } catch (err) {
      // 如果没有权限配置，忽略错误
    }
  } catch (err: any) {
    console.warn(`加载${app.name}配置失败:`, err.message);
  }
}

/**
 * 域名路由中间件
 * 根据请求域名路由到对应的应用
 */
export function domainRoutingMiddleware() {
  return async (c: Context, next: () => Promise<any>) => {
    const host = c.req.header('host') || 'localhost';
    const { app, type } = getDomainAppType(host);
    
    // 将应用和类型信息添加到请求上下文
    c.set('appInfo', { app, type });
    
    // 给HTML响应添加标识，方便前端识别
    c.header('X-App', app);
    c.header('X-App-Type', type);
    
    await next();
  };
}

/**
 * 自动加载所有应用
 * @param server Hono服务器实例
 */
export async function loadAllApps(server: Hono): Promise<void> {
  try {
    console.log('自动加载应用...');
    
    // 加载飞儿云管理端应用
    const feieryunAdminApp = (await import('../apps/feieryun/admin')).default;
    registerApp(server, feieryunAdminApp);
    
    // 加载飞儿云客户端应用
    try {
      const feieryunClientApp = (await import('../apps/feieryun/client/index')).default;
      registerApp(server, feieryunClientApp);
    } catch (err: any) {
      console.warn('加载飞儿云客户端应用失败:', err.message);
    }
    
    // 未来应该动态加载所有应用
    // TODO: 扫描apps目录，自动加载所有应用
    // const appModules = await Promise.all([
    //   import('../apps/feieryun/admin').then(m => m.default),
    //   import('../apps/feieryun/client').then(m => m.default),
    //   // 其他应用...
    // ]);
    // 
    // appModules.forEach(app => registerApp(server, app));
    
    console.log('应用加载完成');
  } catch (error) {
    console.error('加载应用失败:', error);
    throw error;
  }
} 