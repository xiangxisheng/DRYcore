import { MenuConfig } from '../types/menu';
import { MODULE } from './module-base';

/**
 * 用户前台菜单配置
 * 用于生成用户前台导航菜单
 */
export const clientMenuConfig: MenuConfig[] = [
  {
    key: MODULE.CLIENT.HOME.key,
    label: MODULE.CLIENT.HOME.label,
    icon: 'home',
    path: '/',
    component: '@/pages/client/home/index',
    order: 1,
  },
  {
    key: MODULE.CLIENT.SERVICES.key,
    label: MODULE.CLIENT.SERVICES.label,
    icon: 'appstore',
    path: `/${MODULE.CLIENT.SERVICES.key}`,
    order: 2,
    children: [
      {
        key: 'servers',
        label: `我的${MODULE.SERVER.label}`,
        path: `/${MODULE.CLIENT.SERVICES.key}/servers`,
        component: '@/pages/client/services/servers',
        order: 1,
      },
      {
        key: 'domains',
        label: `我的${MODULE.DOMAIN.label.replace('管理', '')}`,
        path: `/${MODULE.CLIENT.SERVICES.key}/domains`,
        component: '@/pages/client/services/domains',
        order: 2,
      },
      {
        key: 'storage',
        label: `我的${MODULE.STORAGE.label}`,
        path: `/${MODULE.CLIENT.SERVICES.key}/storage`,
        component: '@/pages/client/services/storage',
        order: 3,
      },
      {
        key: 'databases',
        label: `我的${MODULE.DATABASE.label}`,
        path: `/${MODULE.CLIENT.SERVICES.key}/databases`,
        component: '@/pages/client/services/databases',
        order: 4,
      },
      {
        key: 'websites',
        label: `我的${MODULE.WEBSITE.label}`,
        path: `/${MODULE.CLIENT.SERVICES.key}/websites`,
        component: '@/pages/client/services/websites',
        order: 5,
      }
    ]
  },
  {
    key: MODULE.CLIENT.MARKET.key,
    label: MODULE.CLIENT.MARKET.label,
    icon: 'shop',
    path: `/${MODULE.CLIENT.MARKET.key}`,
    order: 3,
    children: [
      {
        key: 'servers-buy',
        label: `购买${MODULE.SERVER.label}`,
        path: `/${MODULE.CLIENT.MARKET.key}/servers`,
        component: '@/pages/client/market/servers',
        order: 1,
      },
      {
        key: 'domains-buy',
        label: `注册${MODULE.DOMAIN.label.replace('管理', '')}`,
        path: `/${MODULE.CLIENT.MARKET.key}/domains`,
        component: '@/pages/client/market/domains',
        order: 2,
      },
      {
        key: 'storage-buy',
        label: `购买${MODULE.STORAGE.label}`,
        path: `/${MODULE.CLIENT.MARKET.key}/storage`,
        component: '@/pages/client/market/storage',
        order: 3,
      },
      {
        key: 'databases-buy',
        label: `购买${MODULE.DATABASE.label}`,
        path: `/${MODULE.CLIENT.MARKET.key}/databases`,
        component: '@/pages/client/market/databases',
        order: 4,
      }
    ]
  },
  {
    key: MODULE.CLIENT.BILLS.key,
    label: MODULE.CLIENT.BILLS.label,
    icon: 'account-book',
    path: `/${MODULE.CLIENT.BILLS.key}`,
    component: '@/pages/client/bills/index',
    order: 4,
  },
  {
    key: MODULE.CLIENT.TICKETS.key,
    label: MODULE.CLIENT.TICKETS.label,
    icon: 'customer-service',
    path: `/${MODULE.CLIENT.TICKETS.key}`,
    component: '@/pages/client/tickets/index',
    order: 5,
  },
  {
    key: MODULE.CLIENT.ACCOUNT.key,
    label: MODULE.CLIENT.ACCOUNT.label,
    icon: 'user',
    path: `/${MODULE.CLIENT.ACCOUNT.key}`,
    order: 6,
    children: [
      {
        key: MODULE.CLIENT.ACCOUNT.children.PROFILE.key,
        label: MODULE.CLIENT.ACCOUNT.children.PROFILE.label,
        path: `/${MODULE.CLIENT.ACCOUNT.key}/${MODULE.CLIENT.ACCOUNT.children.PROFILE.key}`,
        component: `@/pages/client/account/${MODULE.CLIENT.ACCOUNT.children.PROFILE.key}`,
        order: 1,
      },
      {
        key: MODULE.CLIENT.ACCOUNT.children.SECURITY.key,
        label: MODULE.CLIENT.ACCOUNT.children.SECURITY.label,
        path: `/${MODULE.CLIENT.ACCOUNT.key}/${MODULE.CLIENT.ACCOUNT.children.SECURITY.key}`,
        component: `@/pages/client/account/${MODULE.CLIENT.ACCOUNT.children.SECURITY.key}`,
        order: 2,
      },
      {
        key: MODULE.CLIENT.ACCOUNT.children.PAYMENT.key,
        label: MODULE.CLIENT.ACCOUNT.children.PAYMENT.label,
        path: `/${MODULE.CLIENT.ACCOUNT.key}/${MODULE.CLIENT.ACCOUNT.children.PAYMENT.key}`,
        component: `@/pages/client/account/${MODULE.CLIENT.ACCOUNT.children.PAYMENT.key}`,
        order: 3,
      }
    ]
  }
]; 