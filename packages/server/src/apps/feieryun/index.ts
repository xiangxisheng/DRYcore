import { Hono } from 'hono';
import { registerModules } from '@/core/controllers/config.controller';
import { APP_MODULES } from './shared/config/modules';
import adminApp from './admin';
import clientApp from './client';

// 飞儿云应用注册
const feieryunApp = {
  name: 'feieryun',
  description: '飞儿云平台应用',
  
  // 注册应用到核心系统
  register(app: Hono): void {
    // 注册模块定义
    registerModules('feieryun', APP_MODULES);
    
    // 注册Admin应用
    app.route('/admin', adminApp);
    
    // 注册客户端应用
    app.route('/client', clientApp);
    
    console.log('Registered feieryun application');
  }
};

export default feieryunApp; 