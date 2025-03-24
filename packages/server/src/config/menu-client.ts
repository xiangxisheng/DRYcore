import { MenuConfig } from '../types/menu';

/**
 * 用户前台菜单配置
 * 用于生成用户前台导航菜单
 */
export const clientMenuConfig: MenuConfig[] = [
  {
    key: 'home',
    label: '首页',
    icon: 'home',
    path: '/',
    component: '@/pages/client/home/index',
    order: 1,
  },
  {
    key: 'services',
    label: '我的服务',
    icon: 'appstore',
    path: '/services',
    order: 2,
    children: [
      {
        key: 'servers',
        label: '我的服务器',
        path: '/services/servers',
        component: '@/pages/client/services/servers',
        order: 1,
      },
      {
        key: 'domains',
        label: '我的域名',
        path: '/services/domains',
        component: '@/pages/client/services/domains',
        order: 2,
      },
      {
        key: 'storage',
        label: '我的云空间',
        path: '/services/storage',
        component: '@/pages/client/services/storage',
        order: 3,
      },
      {
        key: 'databases',
        label: '我的数据库',
        path: '/services/databases',
        component: '@/pages/client/services/databases',
        order: 4,
      },
      {
        key: 'websites',
        label: '我的网站',
        path: '/services/websites',
        component: '@/pages/client/services/websites',
        order: 5,
      }
    ]
  },
  {
    key: 'market',
    label: '服务市场',
    icon: 'shop',
    path: '/market',
    order: 3,
    children: [
      {
        key: 'servers-buy',
        label: '购买服务器',
        path: '/market/servers',
        component: '@/pages/client/market/servers',
        order: 1,
      },
      {
        key: 'domains-buy',
        label: '注册域名',
        path: '/market/domains',
        component: '@/pages/client/market/domains',
        order: 2,
      },
      {
        key: 'storage-buy',
        label: '购买云空间',
        path: '/market/storage',
        component: '@/pages/client/market/storage',
        order: 3,
      },
      {
        key: 'databases-buy',
        label: '购买数据库',
        path: '/market/databases',
        component: '@/pages/client/market/databases',
        order: 4,
      }
    ]
  },
  {
    key: 'bills',
    label: '账单管理',
    icon: 'account-book',
    path: '/bills',
    component: '@/pages/client/bills/index',
    order: 4,
  },
  {
    key: 'tickets',
    label: '工单中心',
    icon: 'customer-service',
    path: '/tickets',
    component: '@/pages/client/tickets/index',
    order: 5,
  },
  {
    key: 'account',
    label: '账户中心',
    icon: 'user',
    path: '/account',
    order: 6,
    children: [
      {
        key: 'profile',
        label: '个人信息',
        path: '/account/profile',
        component: '@/pages/client/account/profile',
        order: 1,
      },
      {
        key: 'security',
        label: '安全设置',
        path: '/account/security',
        component: '@/pages/client/account/security',
        order: 2,
      },
      {
        key: 'payment',
        label: '支付方式',
        path: '/account/payment',
        component: '@/pages/client/account/payment',
        order: 3,
      }
    ]
  }
]; 