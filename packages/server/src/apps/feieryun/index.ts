import { Hono } from 'hono';
import { registerModules } from '@/core/controllers/config.controller';
import { APP_MODULES } from './shared/config/modules';
import adminApp from './admin';
import clientApp from './client';

/**
 * 飞儿云应用
 * 演示如何正确注册应用到核心系统
 */
const feieryunApp = {
  name: 'feieryun',
  description: '飞儿云平台应用',
  
  /**
   * 注册应用到核心系统
   * 通过注册机制将应用与核心层解耦
   * 
   * @param app Hono服务器实例
   */
  register(app: Hono): void {
    // 1. 注册模块定义
    registerModules('feieryun', APP_MODULES);
    console.log('已注册飞儿云模块定义');
    
    // 2. 注册路由
    // 管理后台路由
    app.route('/admin', adminApp);
    
    // 客户端路由
    app.route('/client', clientApp);
    
    console.log('飞儿云应用注册成功');
  }
};

export default feieryunApp; 