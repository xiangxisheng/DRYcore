import { MenuConfig } from '../types/menu';

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
    key: 'cloud-server',
    label: '云服务器',
    icon: 'cloud-server',
    path: '/cloud-server',
    order: 2,
    children: [
      {
        key: 'cloud-server-list',
        label: '服务器列表',
        path: '/cloud-server/list',
        component: '@/pages/cloud-server/list',
        order: 1,
      },
      {
        key: 'cloud-server-create',
        label: '创建服务器',
        path: '/cloud-server/create',
        component: '@/pages/cloud-server/create',
        permissions: ['server:create'],
        order: 2,
      },
      {
        key: 'cloud-server-detail',
        label: '服务器详情',
        path: '/cloud-server/detail/:id',
        component: '@/pages/cloud-server/detail',
        permissions: ['server:view'],
        order: 3,
        hideInMenu: true,
      }
    ]
  },
  {
    key: 'domain',
    label: '域名管理',
    icon: 'global',
    path: '/domain',
    order: 3,
    children: [
      {
        key: 'domain-list',
        label: '域名列表',
        path: '/domain/list',
        component: '@/pages/domain/list',
        order: 1,
      },
      {
        key: 'domain-dns',
        label: 'DNS管理',
        path: '/domain/dns',
        component: '@/pages/domain/dns',
        order: 2,
      },
      {
        key: 'domain-ssl',
        label: 'SSL证书',
        path: '/domain/ssl',
        component: '@/pages/domain/ssl',
        order: 3,
      }
    ]
  },
  {
    key: 'storage',
    label: '云空间',
    icon: 'database',
    path: '/storage',
    order: 4,
    children: [
      {
        key: 'storage-file',
        label: '文件管理',
        path: '/storage/file',
        component: '@/pages/storage/file',
        order: 1,
      },
      {
        key: 'storage-backup',
        label: '备份管理',
        path: '/storage/backup',
        component: '@/pages/storage/backup',
        order: 2,
      }
    ]
  },
  {
    key: 'database',
    label: '云数据库',
    icon: 'cluster',
    path: '/database',
    order: 5,
    children: [
      {
        key: 'database-list',
        label: '数据库列表',
        path: '/database/list',
        component: '@/pages/database/list',
        order: 1,
      },
      {
        key: 'database-backup',
        label: '数据库备份',
        path: '/database/backup',
        component: '@/pages/database/backup',
        order: 2,
      }
    ]
  },
  {
    key: 'website',
    label: '云Web站点',
    icon: 'desktop',
    path: '/website',
    order: 6,
    children: [
      {
        key: 'website-list',
        label: '站点列表',
        path: '/website/list',
        component: '@/pages/website/list',
        order: 1,
      },
      {
        key: 'website-create',
        label: '创建站点',
        path: '/website/create',
        component: '@/pages/website/create',
        permissions: ['website:create'],
        order: 2,
      }
    ]
  },
  {
    key: 'system',
    label: '系统管理',
    icon: 'setting',
    path: '/system',
    order: 100,
    permissions: ['system:view'],
    children: [
      {
        key: 'system-user',
        label: '用户管理',
        path: '/system/user',
        component: '@/pages/system/user',
        permissions: ['user:view'],
        order: 1,
      },
      {
        key: 'system-role',
        label: '角色管理',
        path: '/system/role',
        component: '@/pages/system/role',
        permissions: ['role:view'],
        order: 2,
      },
      {
        key: 'system-permission',
        label: '权限管理',
        path: '/system/permission',
        component: '@/pages/system/permission',
        permissions: ['permission:view'],
        order: 3,
      },
      {
        key: 'system-config',
        label: '系统配置',
        path: '/system/config',
        component: '@/pages/system/config',
        permissions: ['config:view'],
        order: 4,
      }
    ]
  }
]; 