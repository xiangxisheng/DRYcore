import { ModuleConfig } from '../types/module';

/**
 * 模块基础配置
 * 集中定义所有模块的基本信息，避免在多处重复定义
 * 遵循DRY原则
 */
export const CORE_MODULES = {
  // 系统管理
  SYSTEM: {
    key: 'system',
    adminKey: 'system', // admin模块的key
    apiKey: 'system', // API路由的key
    label: '系统管理',
    children: {
      USER: {
        key: 'user',
        label: '用户管理'
      },
      ROLE: {
        key: 'role',
        label: '角色管理'
      },
      PERMISSION: {
        key: 'permission',
        label: '权限管理'
      },
      CONFIG: {
        key: 'config',
        label: '系统配置'
      }
    }
  },
  
  // 云服务器
  SERVER: {
    adminKey: 'cloud-server', // 管理后台使用的key
    apiKey: 'server',         // 权限和API中使用的key
    label: '云服务器',
  },
  
  // 域名管理
  DOMAIN: {
    key: 'domain',
    label: '域名管理',
  },
  
  // 云空间
  STORAGE: {
    key: 'storage',
    label: '云空间',
  },
  
  // 云数据库
  DATABASE: {
    key: 'database',
    label: '云数据库',
  },
  
  // 云Web站点
  WEBSITE: {
    key: 'website',
    label: '云Web站点',
  },
  
  // 用户前台特有模块
  CLIENT: {
    HOME: {
      key: 'home',
      label: '首页',
    },
    SERVICES: {
      key: 'services',
      label: '我的服务',
    },
    MARKET: {
      key: 'market',
      label: '服务市场',
    },
    BILLS: {
      key: 'bills',
      label: '账单管理',
    },
    TICKETS: {
      key: 'tickets',
      label: '工单中心',
    },
    ACCOUNT: {
      key: 'account',
      label: '账户中心',
      children: {
        PROFILE: {
          key: 'profile',
          label: '个人信息',
        },
        SECURITY: {
          key: 'security',
          label: '安全设置',
        },
        PAYMENT: {
          key: 'payment',
          label: '支付方式',
        }
      }
    }
  }
};

/**
 * 权限操作类型常量
 * 集中定义所有权限操作类型
 */
export const PERMISSION = {
  VIEW: 'view',
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  REBOOT: 'reboot',
  SHUTDOWN: 'shutdown',
  START: 'start',
  DNS: 'dns',
  SSL: 'ssl',
  UPLOAD: 'upload',
  DOWNLOAD: 'download',
  BACKUP: 'backup',
  RESTORE: 'restore',
  DEPLOY: 'deploy'
};

/**
 * 生成权限标识
 * @param module 模块名称
 * @param action 操作类型
 * @returns 格式化的权限标识，如 'user:view'
 */
export function generatePermissionKey(module: string, action: string): string {
  return `${module}:${action}`;
}

/**
 * 生成权限配置项
 * @param module 模块名称
 * @param action 操作类型
 * @param actionLabel 操作标签前缀，默认为"查看"、"创建"等
 * @returns 权限配置对象
 */
export function generatePermission(
  module: string, 
  action: string, 
  moduleLabel: string,
  actionLabel?: string
): { key: string; label: string } {
  const actionMap: Record<string, string> = {
    [PERMISSION.VIEW]: '查看',
    [PERMISSION.CREATE]: '创建',
    [PERMISSION.UPDATE]: '更新',
    [PERMISSION.DELETE]: '删除',
    [PERMISSION.REBOOT]: '重启',
    [PERMISSION.SHUTDOWN]: '关闭',
    [PERMISSION.START]: '启动',
    [PERMISSION.DNS]: '管理DNS',
    [PERMISSION.SSL]: '管理SSL证书',
    [PERMISSION.UPLOAD]: '上传文件',
    [PERMISSION.DOWNLOAD]: '下载文件',
    [PERMISSION.BACKUP]: '备份',
    [PERMISSION.RESTORE]: '恢复',
    [PERMISSION.DEPLOY]: '部署'
  };
  
  return {
    key: generatePermissionKey(module, action),
    label: actionLabel || `${actionMap[action]}${moduleLabel}`
  };
}

// 为了保持向后兼容，临时保留MODULE导出但内容与CORE_MODULES相同
// 在完成迁移后应当移除此导出
export const MODULE = CORE_MODULES; 