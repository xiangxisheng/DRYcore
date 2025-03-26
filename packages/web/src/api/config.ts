import { API_BASE_URL } from '@/config';

/**
 * 应用配置接口
 */
export interface AppConfig {
  appName: string;
  version: string;
  environment: string;
  nodeVersion: string;
  database: string;
  [key: string]: any;
}

/**
 * 获取应用配置
 * 从后端获取应用配置，实现真正的DRY
 */
export const fetchAppConfig = async (): Promise<AppConfig> => {
  try {
    const response = await fetch(`${API_BASE_URL}/config/app`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
    });

    if (!response.ok) {
      throw new Error('获取应用配置失败');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('获取应用配置出错:', error);
    // 如果获取失败，使用默认配置（仅作为fallback，不应依赖）
    return {
      appName: 'DRYcore框架',
      version: 'v0.1.0',
      environment: '开发环境',
      nodeVersion: 'v16+',
      database: 'PostgreSQL'
    };
  }
};

/**
 * 获取活动日志
 */
export const fetchActivities = async (): Promise<Array<{time: string, description: string}>> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/activities`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
    });

    if (!response.ok) {
      throw new Error('获取活动日志失败');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('获取活动日志出错:', error);
    return [];
  }
}; 