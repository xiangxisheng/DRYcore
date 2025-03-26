import { ModuleConfig } from '../types/module';

/**
 * 模块基础配置
 * 集中定义所有核心模块的基本信息，避免在多处重复定义
 * 遵循DRY原则
 * 
 * 注意：应用特定模块应定义在各自的应用目录中，不应在核心层定义
 * 例如: packages/server/src/apps/feieryun/shared/config/modules.ts
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
  
  // 用户前台通用模块（仅包含核心系统需要的部分）
  CLIENT: {
    HOME: {
      key: 'home',
      label: '首页',
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

/**
 * 为了保持向后兼容，临时保留MODULE导出
 * 在项目完全迁移到新的注册模式后，应当移除此导出
 * 
 * @deprecated 请使用getRegisteredModules()获取模块，而非直接引用此对象
 */
export const MODULE = {
  ...CORE_MODULES,
  
  // 以下是为了保持向后兼容的空模块定义
  // 实际定义已移至各应用目录
  SERVER: {},
  DOMAIN: {},
  STORAGE: {},
  DATABASE: {},
  WEBSITE: {}
}; 