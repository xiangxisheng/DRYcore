import { Context } from 'hono';
import { Hono } from 'hono';
import * as fs from 'fs';
import * as path from 'path';
import { getDomainAppType } from '../config/domain';
import { AppModule } from '../types/app';
import { registerConfig } from './controllers/config.controller';

// 环境变量类型定义
declare const __dirname: string;
declare const process: {
  env: {
    NODE_ENV: string;
    [key: string]: string | undefined;
  };
};

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
      const permissionsConfig = require(`../apps/${appName}/shared/config/permissions`).permissionConfig;
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
    
    // 读取应用目录
    const fs = require('fs');
    const path = require('path');
    const appsDir = path.join(__dirname, '../apps');
    
    // 检查是否为开发环境，开发环境下手动加载飞儿云应用
    if (process.env.NODE_ENV === 'development') {
      // 开发环境下手动加载应用
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
    } else {
      // 生产环境下动态读取并加载所有应用
      try {
        const appFolders = fs.readdirSync(appsDir);
        
        for (const appName of appFolders) {
          const appPath = path.join(appsDir, appName);
          if (fs.statSync(appPath).isDirectory()) {
            // 尝试加载管理端应用
            try {
              const adminApp = (await import(`../apps/${appName}/admin`)).default;
              registerApp(server, adminApp);
            } catch (err) {
              console.warn(`加载${appName}管理端应用失败`);
            }
            
            // 尝试加载客户端应用
            try {
              const clientApp = (await import(`../apps/${appName}/client/index`)).default;
              registerApp(server, clientApp);
            } catch (err) {
              console.warn(`加载${appName}客户端应用失败`);
            }
          }
        }
      } catch (err) {
        console.error('动态加载应用失败:', err);
      }
    }
    
    console.log('应用加载完成');
  } catch (error) {
    console.error('加载应用失败:', error);
    throw error;
  }
} 