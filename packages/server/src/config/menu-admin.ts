import { MenuConfig } from '../types/menu';
import { MODULE, PERMISSION, generatePermissionKey } from './module-base';

/**
 * 管理后台菜单配置
 * 用于生成管理后台导航菜单和控制菜单权限
 */
export const adminMenuConfig: MenuConfig[] = [
  {
    key: 'dashboard',
    label: '控制台',
    icon: 'dashboard',
    path: '/dashboard',
    component: '@/pages/dashboard/index',
    order: 1,
  },
  {
    key: MODULE.SERVER.adminKey,
    label: MODULE.SERVER.label,
    icon: 'cloud-server',
    path: `/${MODULE.SERVER.adminKey}`,
    order: 2,
    children: [
      {
        key: `${MODULE.SERVER.adminKey}-list`,
        label: '服务器列表',
        path: `/${MODULE.SERVER.adminKey}/list`,
        component: `@/pages/${MODULE.SERVER.adminKey}/list`,
        order: 1,
      },
      {
        key: `${MODULE.SERVER.adminKey}-create`,
        label: '创建服务器',
        path: `/${MODULE.SERVER.adminKey}/create`,
        component: `@/pages/${MODULE.SERVER.adminKey}/create`,
        permissions: [generatePermissionKey(MODULE.SERVER.apiKey, PERMISSION.CREATE)],
        order: 2,
      },
      {
        key: `${MODULE.SERVER.adminKey}-detail`,
        label: '服务器详情',
        path: `/${MODULE.SERVER.adminKey}/detail/:id`,
        component: `@/pages/${MODULE.SERVER.adminKey}/detail`,
        permissions: [generatePermissionKey(MODULE.SERVER.apiKey, PERMISSION.VIEW)],
        order: 3,
        hideInMenu: true,
      }
    ]
  },
  {
    key: MODULE.DOMAIN.key,
    label: MODULE.DOMAIN.label,
    icon: 'global',
    path: `/${MODULE.DOMAIN.key}`,
    order: 3,
    children: [
      {
        key: `${MODULE.DOMAIN.key}-list`,
        label: '域名列表',
        path: `/${MODULE.DOMAIN.key}/list`,
        component: `@/pages/${MODULE.DOMAIN.key}/list`,
        order: 1,
      },
      {
        key: `${MODULE.DOMAIN.key}-dns`,
        label: 'DNS管理',
        path: `/${MODULE.DOMAIN.key}/dns`,
        component: `@/pages/${MODULE.DOMAIN.key}/dns`,
        order: 2,
      },
      {
        key: `${MODULE.DOMAIN.key}-ssl`,
        label: 'SSL证书',
        path: `/${MODULE.DOMAIN.key}/ssl`,
        component: `@/pages/${MODULE.DOMAIN.key}/ssl`,
        order: 3,
      }
    ]
  },
  {
    key: MODULE.STORAGE.key,
    label: MODULE.STORAGE.label,
    icon: 'database',
    path: `/${MODULE.STORAGE.key}`,
    order: 4,
    children: [
      {
        key: `${MODULE.STORAGE.key}-file`,
        label: '文件管理',
        path: `/${MODULE.STORAGE.key}/file`,
        component: `@/pages/${MODULE.STORAGE.key}/file`,
        order: 1,
      },
      {
        key: `${MODULE.STORAGE.key}-backup`,
        label: '备份管理',
        path: `/${MODULE.STORAGE.key}/backup`,
        component: `@/pages/${MODULE.STORAGE.key}/backup`,
        order: 2,
      }
    ]
  },
  {
    key: MODULE.DATABASE.key,
    label: MODULE.DATABASE.label,
    icon: 'cluster',
    path: `/${MODULE.DATABASE.key}`,
    order: 5,
    children: [
      {
        key: `${MODULE.DATABASE.key}-list`,
        label: '数据库列表',
        path: `/${MODULE.DATABASE.key}/list`,
        component: `@/pages/${MODULE.DATABASE.key}/list`,
        order: 1,
      },
      {
        key: `${MODULE.DATABASE.key}-backup`,
        label: '数据库备份',
        path: `/${MODULE.DATABASE.key}/backup`,
        component: `@/pages/${MODULE.DATABASE.key}/backup`,
        order: 2,
      }
    ]
  },
  {
    key: MODULE.WEBSITE.key,
    label: MODULE.WEBSITE.label,
    icon: 'desktop',
    path: `/${MODULE.WEBSITE.key}`,
    order: 6,
    children: [
      {
        key: `${MODULE.WEBSITE.key}-list`,
        label: '站点列表',
        path: `/${MODULE.WEBSITE.key}/list`,
        component: `@/pages/${MODULE.WEBSITE.key}/list`,
        order: 1,
      },
      {
        key: `${MODULE.WEBSITE.key}-create`,
        label: '创建站点',
        path: `/${MODULE.WEBSITE.key}/create`,
        component: `@/pages/${MODULE.WEBSITE.key}/create`,
        permissions: [generatePermissionKey(MODULE.WEBSITE.key, PERMISSION.CREATE)],
        order: 2,
      }
    ]
  },
  {
    key: MODULE.SYSTEM.key,
    label: MODULE.SYSTEM.label,
    icon: 'setting',
    path: `/${MODULE.SYSTEM.key}`,
    order: 100,
    permissions: [generatePermissionKey(MODULE.SYSTEM.key, PERMISSION.VIEW)],
    children: [
      {
        key: `${MODULE.SYSTEM.key}-${MODULE.SYSTEM.children.USER.key}`,
        label: MODULE.SYSTEM.children.USER.label,
        path: `/${MODULE.SYSTEM.key}/${MODULE.SYSTEM.children.USER.key}`,
        component: `@/pages/${MODULE.SYSTEM.key}/${MODULE.SYSTEM.children.USER.key}`,
        permissions: [generatePermissionKey(MODULE.SYSTEM.children.USER.key, PERMISSION.VIEW)],
        order: 1,
      },
      {
        key: `${MODULE.SYSTEM.key}-${MODULE.SYSTEM.children.ROLE.key}`,
        label: MODULE.SYSTEM.children.ROLE.label,
        path: `/${MODULE.SYSTEM.key}/${MODULE.SYSTEM.children.ROLE.key}`,
        component: `@/pages/${MODULE.SYSTEM.key}/${MODULE.SYSTEM.children.ROLE.key}`,
        permissions: [generatePermissionKey(MODULE.SYSTEM.children.ROLE.key, PERMISSION.VIEW)],
        order: 2,
      },
      {
        key: `${MODULE.SYSTEM.key}-${MODULE.SYSTEM.children.PERMISSION.key}`,
        label: MODULE.SYSTEM.children.PERMISSION.label,
        path: `/${MODULE.SYSTEM.key}/${MODULE.SYSTEM.children.PERMISSION.key}`,
        component: `@/pages/${MODULE.SYSTEM.key}/${MODULE.SYSTEM.children.PERMISSION.key}`,
        permissions: [generatePermissionKey(MODULE.SYSTEM.children.PERMISSION.key, PERMISSION.VIEW)],
        order: 3,
      },
      {
        key: `${MODULE.SYSTEM.key}-${MODULE.SYSTEM.children.CONFIG.key}`,
        label: MODULE.SYSTEM.children.CONFIG.label,
        path: `/${MODULE.SYSTEM.key}/${MODULE.SYSTEM.children.CONFIG.key}`,
        component: `@/pages/${MODULE.SYSTEM.key}/${MODULE.SYSTEM.children.CONFIG.key}`,
        permissions: [generatePermissionKey(MODULE.SYSTEM.children.CONFIG.key, PERMISSION.VIEW)],
        order: 4,
      }
    ]
  }
]; 