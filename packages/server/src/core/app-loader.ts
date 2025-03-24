import { Hono } from 'hono';
import { getDomainAppType } from '../config/domain';
import { AppModule } from '../types/app';

/**
 * 注册应用
 * @param server Hono服务器实例
 * @param app 应用模块
 */
export function registerApp(server: Hono, app: AppModule): void {
  console.log(`注册应用: ${app.name} (${app.type})`);
  
  // 调用应用的注册方法
  app.register(server);
}

/**
 * 域名路由中间件
 * 根据请求域名路由到对应的应用
 */
export function domainRoutingMiddleware() {
  return async (c: any, next: any) => {
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
    
    // 这里应该实现扫描apps目录，自动加载所有应用
    // 为了简单起见，先硬编码导入飞儿云应用的管理端
    const feieryunAdminApp = (await import('../apps/feieryun/admin')).default;
    registerApp(server, feieryunAdminApp);
    
    // 未来应该动态加载所有应用
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