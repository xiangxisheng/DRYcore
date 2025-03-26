import { CORE_MODULES } from '@/config/module-base';

/**
 * 飞儿云应用特定模块定义
 * 这些模块定义应该存在于应用层而非核心层
 */
export const APP_MODULES = {
  // 继承核心模块
  ...CORE_MODULES,
  
  // 云服务器
  SERVER: { 
    key: 'server',
    adminKey: 'cloud-server',
    apiKey: 'cloud-servers',
    label: '云服务器'
  },
  
  // 域名管理
  DOMAIN: {
    key: 'domain',
    adminKey: 'domain',
    apiKey: 'domains',
    label: '域名管理'
  },
  
  // 云存储
  STORAGE: {
    key: 'storage',
    adminKey: 'storage',
    apiKey: 'storages',
    label: '云存储'
  },
  
  // 云数据库
  DATABASE: {
    key: 'database',
    adminKey: 'database',
    apiKey: 'databases',
    label: '云数据库'
  },
  
  // 云Web站点
  WEBSITE: {
    key: 'website',
    adminKey: 'website',
    apiKey: 'websites',
    label: '云Web站点'
  },
  
  // 用户前台
  CLIENT: {
    key: 'client',
    adminKey: 'client',
    apiKey: 'client',
    label: '用户前台'
  }
};

// 注册模块到核心系统的函数将在此导入并调用
// 使应用层模块向核心层注册，而非核心层直接引用应用层 