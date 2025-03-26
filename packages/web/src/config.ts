/**
 * API基础URL
 * 开发环境指向本地开发服务器
 * 生产环境将使用相对路径
 */
export const API_BASE_URL = import.meta.env.DEV 
  ? 'http://localhost:3000/api'
  : '/api';

/**
 * 应用配置
 */
export const APP_CONFIG = {
  appName: 'DRYcore框架',
  version: import.meta.env.VITE_APP_VERSION || 'v0.1.0',
  environment: import.meta.env.MODE,
  nodeVersion: 'v16+',
  database: 'PostgreSQL'
}; 