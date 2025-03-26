/**
 * API基础URL
 * 开发环境指向本地开发服务器
 * 生产环境将使用相对路径
 */
export const API_BASE_URL = import.meta.env.DEV 
  ? 'http://localhost:3000/api'
  : '/api';

// 不再使用静态配置，改为从API获取
// 请使用 api/config.ts 中的 fetchAppConfig 获取配置 