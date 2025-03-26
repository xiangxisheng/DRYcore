import { API_BASE_URL } from '../config';

/**
 * 仪表板数据接口
 */
export interface DashboardData {
  serverCount: number;
  domainCount: number;
  storageUsage: {
    total: number; // GB
    used: number;  // GB
  };
  databaseCount: number;
  websiteCount: number;
  userCount: number;
  recentOrders: number;
  pendingTickets: number;
}

/**
 * 系统状态接口
 */
export interface SystemStatus {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  uptime: number;
  services: Array<{
    name: string;
    status: string;
  }>;
}

/**
 * 获取仪表板数据
 */
export const fetchDashboardData = async (): Promise<DashboardData> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
    });

    if (!response.ok) {
      throw new Error('获取仪表板数据失败');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('获取仪表板数据出错:', error);
    throw error;
  }
};

/**
 * 获取系统状态
 */
export const fetchSystemStatus = async (): Promise<SystemStatus> => {
  try {
    const response = await fetch(`${API_BASE_URL}/admin/dashboard/status`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
    });

    if (!response.ok) {
      throw new Error('获取系统状态失败');
    }

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error('获取系统状态出错:', error);
    throw error;
  }
}; 