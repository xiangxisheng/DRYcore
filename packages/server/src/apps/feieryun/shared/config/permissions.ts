import { PermissionConfig } from '@/types/permission';
import { 
  MODULE, 
  PERMISSION, 
  generatePermission 
} from '@/config/module-base';

/**
 * 飞儿云应用权限配置
 * 基于模块基础配置生成
 */
export const feieryunPermissionConfig: PermissionConfig[] = [
  {
    key: MODULE.SYSTEM.key,
    label: MODULE.SYSTEM.label,
    children: [
      {
        key: MODULE.SYSTEM.children.USER.key,
        label: MODULE.SYSTEM.children.USER.label,
        permissions: [
          generatePermission(MODULE.SYSTEM.children.USER.key, PERMISSION.VIEW, MODULE.SYSTEM.children.USER.label),
          generatePermission(MODULE.SYSTEM.children.USER.key, PERMISSION.CREATE, MODULE.SYSTEM.children.USER.label),
          generatePermission(MODULE.SYSTEM.children.USER.key, PERMISSION.UPDATE, MODULE.SYSTEM.children.USER.label),
          generatePermission(MODULE.SYSTEM.children.USER.key, PERMISSION.DELETE, MODULE.SYSTEM.children.USER.label)
        ]
      },
      {
        key: MODULE.SYSTEM.children.ROLE.key,
        label: MODULE.SYSTEM.children.ROLE.label,
        permissions: [
          generatePermission(MODULE.SYSTEM.children.ROLE.key, PERMISSION.VIEW, MODULE.SYSTEM.children.ROLE.label),
          generatePermission(MODULE.SYSTEM.children.ROLE.key, PERMISSION.CREATE, MODULE.SYSTEM.children.ROLE.label),
          generatePermission(MODULE.SYSTEM.children.ROLE.key, PERMISSION.UPDATE, MODULE.SYSTEM.children.ROLE.label),
          generatePermission(MODULE.SYSTEM.children.ROLE.key, PERMISSION.DELETE, MODULE.SYSTEM.children.ROLE.label)
        ]
      },
      {
        key: MODULE.SYSTEM.children.PERMISSION.key,
        label: MODULE.SYSTEM.children.PERMISSION.label,
        permissions: [
          generatePermission(MODULE.SYSTEM.children.PERMISSION.key, PERMISSION.VIEW, MODULE.SYSTEM.children.PERMISSION.label),
          generatePermission(MODULE.SYSTEM.children.PERMISSION.key, PERMISSION.CREATE, MODULE.SYSTEM.children.PERMISSION.label),
          generatePermission(MODULE.SYSTEM.children.PERMISSION.key, PERMISSION.UPDATE, MODULE.SYSTEM.children.PERMISSION.label),
          generatePermission(MODULE.SYSTEM.children.PERMISSION.key, PERMISSION.DELETE, MODULE.SYSTEM.children.PERMISSION.label)
        ]
      },
      {
        key: MODULE.SYSTEM.children.CONFIG.key,
        label: MODULE.SYSTEM.children.CONFIG.label,
        permissions: [
          generatePermission(MODULE.SYSTEM.children.CONFIG.key, PERMISSION.VIEW, MODULE.SYSTEM.children.CONFIG.label),
          generatePermission(MODULE.SYSTEM.children.CONFIG.key, PERMISSION.UPDATE, MODULE.SYSTEM.children.CONFIG.label)
        ]
      }
    ]
  },
  {
    key: MODULE.SERVER.apiKey,
    label: MODULE.SERVER.label,
    permissions: [
      generatePermission(MODULE.SERVER.apiKey, PERMISSION.VIEW, MODULE.SERVER.label),
      generatePermission(MODULE.SERVER.apiKey, PERMISSION.CREATE, MODULE.SERVER.label),
      generatePermission(MODULE.SERVER.apiKey, PERMISSION.UPDATE, MODULE.SERVER.label),
      generatePermission(MODULE.SERVER.apiKey, PERMISSION.DELETE, MODULE.SERVER.label),
      generatePermission(MODULE.SERVER.apiKey, PERMISSION.REBOOT, MODULE.SERVER.label),
      generatePermission(MODULE.SERVER.apiKey, PERMISSION.SHUTDOWN, MODULE.SERVER.label),
      generatePermission(MODULE.SERVER.apiKey, PERMISSION.START, MODULE.SERVER.label)
    ]
  },
  {
    key: MODULE.DOMAIN.key,
    label: MODULE.DOMAIN.label,
    permissions: [
      generatePermission(MODULE.DOMAIN.key, PERMISSION.VIEW, MODULE.DOMAIN.label),
      generatePermission(MODULE.DOMAIN.key, PERMISSION.CREATE, MODULE.DOMAIN.label),
      generatePermission(MODULE.DOMAIN.key, PERMISSION.UPDATE, MODULE.DOMAIN.label),
      generatePermission(MODULE.DOMAIN.key, PERMISSION.DELETE, MODULE.DOMAIN.label),
      generatePermission(MODULE.DOMAIN.key, PERMISSION.DNS, MODULE.DOMAIN.label),
      generatePermission(MODULE.DOMAIN.key, PERMISSION.SSL, MODULE.DOMAIN.label)
    ]
  },
  {
    key: MODULE.STORAGE.key,
    label: MODULE.STORAGE.label,
    permissions: [
      generatePermission(MODULE.STORAGE.key, PERMISSION.VIEW, MODULE.STORAGE.label),
      generatePermission(MODULE.STORAGE.key, PERMISSION.CREATE, MODULE.STORAGE.label),
      generatePermission(MODULE.STORAGE.key, PERMISSION.UPDATE, MODULE.STORAGE.label),
      generatePermission(MODULE.STORAGE.key, PERMISSION.DELETE, MODULE.STORAGE.label),
      generatePermission(MODULE.STORAGE.key, PERMISSION.UPLOAD, MODULE.STORAGE.label),
      generatePermission(MODULE.STORAGE.key, PERMISSION.DOWNLOAD, MODULE.STORAGE.label)
    ]
  },
  {
    key: MODULE.DATABASE.key,
    label: MODULE.DATABASE.label,
    permissions: [
      generatePermission(MODULE.DATABASE.key, PERMISSION.VIEW, MODULE.DATABASE.label),
      generatePermission(MODULE.DATABASE.key, PERMISSION.CREATE, MODULE.DATABASE.label),
      generatePermission(MODULE.DATABASE.key, PERMISSION.UPDATE, MODULE.DATABASE.label),
      generatePermission(MODULE.DATABASE.key, PERMISSION.DELETE, MODULE.DATABASE.label),
      generatePermission(MODULE.DATABASE.key, PERMISSION.BACKUP, MODULE.DATABASE.label),
      generatePermission(MODULE.DATABASE.key, PERMISSION.RESTORE, MODULE.DATABASE.label)
    ]
  },
  {
    key: MODULE.WEBSITE.key,
    label: MODULE.WEBSITE.label,
    permissions: [
      generatePermission(MODULE.WEBSITE.key, PERMISSION.VIEW, MODULE.WEBSITE.label),
      generatePermission(MODULE.WEBSITE.key, PERMISSION.CREATE, MODULE.WEBSITE.label),
      generatePermission(MODULE.WEBSITE.key, PERMISSION.UPDATE, MODULE.WEBSITE.label),
      generatePermission(MODULE.WEBSITE.key, PERMISSION.DELETE, MODULE.WEBSITE.label),
      generatePermission(MODULE.WEBSITE.key, PERMISSION.DEPLOY, MODULE.WEBSITE.label)
    ]
  }
]; 