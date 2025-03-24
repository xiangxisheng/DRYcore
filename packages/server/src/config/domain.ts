/**
 * 域名配置类型
 */
interface DomainConfig {
  app: string;
  type: string;
}

/**
 * 域名配置映射
 */
interface DomainMap {
  [domain: string]: DomainConfig;
}

/**
 * 域名配置
 * 用于根据域名将请求路由到不同的应用和端
 */
export const domainConfig: DomainMap = {
  // 飞儿云应用
  'admin.feieryun.com': { app: 'feieryun', type: 'admin' },
  'www.feieryun.com': { app: 'feieryun', type: 'client' },
  'partner.feieryun.com': { app: 'feieryun', type: 'partner' },
  'staff.feieryun.com': { app: 'feieryun', type: 'staff' },
  'api.feieryun.com': { app: 'feieryun', type: 'api' },
  
  // 本地开发环境
  'localhost': { app: 'feieryun', type: 'admin' }, // 默认为管理后台
  
  // 未来添加的其他应用域名
  // 'admin.other-app.com': { app: 'other-app', type: 'admin' },
  // 'www.other-app.com': { app: 'other-app', type: 'client' }
};

/**
 * 获取域名对应的应用和类型
 * @param host 域名
 * @returns 应用和类型，如果没找到则返回默认值
 */
export function getDomainAppType(host: string): DomainConfig {
  // 提取主域名（去除端口号）
  const domain = host.split(':')[0];
  
  // 查找域名配置
  const config = domainConfig[domain];
  
  // 如果找到配置，返回对应的应用和类型
  if (config) {
    return config;
  }
  
  // 未找到配置，返回默认值
  return { app: 'feieryun', type: 'admin' };
} 