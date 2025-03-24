import { MODULE, PERMISSION, generatePermissionKey } from '@/config/module-base';
import { MenuConfig } from '@/types/menu';

/**
 * 基础菜单项类型定义
 */
interface BaseMenuItem {
  id: string;
  module: {
    key?: string;
    adminKey?: string;
    apiKey?: string;
    label: string;
  };
  icon: string;
  order: number;
  availableFor: string[];
  path?: string;
  permissions?: string[];
  clientLabel?: string;
  children?: BaseMenuChild[];
}

/**
 * 基础菜单子项类型定义
 */
interface BaseMenuChild {
  id: string;
  label: string;
  availableFor: string[];
  permissions?: string[];
  path?: string;
  hideInMenu?: boolean;
  order?: number;
}

/**
 * 飞儿云应用基础菜单项
 * 定义所有可能的菜单及其可用的端类型
 */
export const feieryunBaseMenuItems: BaseMenuItem[] = [
  {
    id: 'dashboard',
    module: { key: 'dashboard', label: '控制台' },
    icon: 'dashboard',
    order: 1,
    // 定义哪些端可以使用此菜单
    availableFor: ['admin', 'partner', 'staff'] 
  },
  {
    id: MODULE.SERVER.adminKey,
    module: MODULE.SERVER,
    icon: 'cloud-server',
    order: 2,
    availableFor: ['admin', 'client', 'partner'],
    children: [
      {
        id: 'list',
        label: '服务器列表',
        availableFor: ['admin', 'client', 'partner']
      },
      {
        id: 'create',
        label: '创建服务器',
        permissions: [generatePermissionKey(MODULE.SERVER.apiKey, PERMISSION.CREATE)],
        availableFor: ['admin']
      },
      {
        id: 'detail',
        label: '服务器详情',
        path: 'detail/:id',
        permissions: [generatePermissionKey(MODULE.SERVER.apiKey, PERMISSION.VIEW)],
        availableFor: ['admin'],
        hideInMenu: true
      }
    ]
  },
  {
    id: MODULE.DOMAIN.key,
    module: MODULE.DOMAIN,
    icon: 'global',
    order: 3,
    availableFor: ['admin', 'client', 'partner'],
    children: [
      {
        id: 'list',
        label: '域名列表',
        availableFor: ['admin', 'client', 'partner']
      },
      {
        id: 'dns',
        label: 'DNS管理',
        availableFor: ['admin', 'client']
      },
      {
        id: 'ssl',
        label: 'SSL证书',
        availableFor: ['admin', 'client']
      }
    ]
  },
  {
    id: MODULE.STORAGE.key,
    module: MODULE.STORAGE,
    icon: 'database',
    order: 4,
    availableFor: ['admin', 'client', 'partner'],
    children: [
      {
        id: 'file',
        label: '文件管理',
        availableFor: ['admin', 'client', 'partner']
      },
      {
        id: 'backup',
        label: '备份管理',
        availableFor: ['admin']
      }
    ]
  },
  {
    id: MODULE.DATABASE.key,
    module: MODULE.DATABASE,
    icon: 'cluster',
    order: 5,
    availableFor: ['admin', 'client', 'partner'],
    children: [
      {
        id: 'list',
        label: '数据库列表',
        availableFor: ['admin', 'client', 'partner']
      },
      {
        id: 'backup',
        label: '数据库备份',
        availableFor: ['admin', 'client']
      }
    ]
  },
  {
    id: MODULE.WEBSITE.key,
    module: MODULE.WEBSITE,
    icon: 'desktop',
    order: 6,
    availableFor: ['admin', 'client', 'partner'],
    children: [
      {
        id: 'list',
        label: '站点列表',
        availableFor: ['admin', 'client', 'partner']
      },
      {
        id: 'create',
        label: '创建站点',
        permissions: [generatePermissionKey(MODULE.WEBSITE.key, PERMISSION.CREATE)],
        availableFor: ['admin']
      }
    ]
  },
  {
    id: MODULE.SYSTEM.key,
    module: MODULE.SYSTEM,
    icon: 'setting',
    order: 100,
    permissions: [generatePermissionKey(MODULE.SYSTEM.key, PERMISSION.VIEW)],
    availableFor: ['admin'],
    children: [
      {
        id: MODULE.SYSTEM.children.USER.key,
        label: MODULE.SYSTEM.children.USER.label,
        permissions: [generatePermissionKey(MODULE.SYSTEM.children.USER.key, PERMISSION.VIEW)],
        availableFor: ['admin']
      },
      {
        id: MODULE.SYSTEM.children.ROLE.key,
        label: MODULE.SYSTEM.children.ROLE.label,
        permissions: [generatePermissionKey(MODULE.SYSTEM.children.ROLE.key, PERMISSION.VIEW)],
        availableFor: ['admin']
      },
      {
        id: MODULE.SYSTEM.children.PERMISSION.key,
        label: MODULE.SYSTEM.children.PERMISSION.label,
        permissions: [generatePermissionKey(MODULE.SYSTEM.children.PERMISSION.key, PERMISSION.VIEW)],
        availableFor: ['admin']
      },
      {
        id: MODULE.SYSTEM.children.CONFIG.key,
        label: MODULE.SYSTEM.children.CONFIG.label,
        permissions: [generatePermissionKey(MODULE.SYSTEM.children.CONFIG.key, PERMISSION.VIEW)],
        availableFor: ['admin']
      }
    ]
  },
  // 客户端特有菜单
  {
    id: MODULE.CLIENT.HOME.key,
    module: MODULE.CLIENT.HOME,
    icon: 'home',
    order: 1,
    availableFor: ['client']
  },
  {
    id: MODULE.CLIENT.SERVICES.key,
    module: MODULE.CLIENT.SERVICES,
    icon: 'appstore',
    order: 2,
    availableFor: ['client'],
    children: [
      {
        id: 'servers',
        label: `服务器`,
        availableFor: ['client']
      },
      {
        id: 'domains',
        label: `域名`,
        availableFor: ['client']
      },
      {
        id: 'storage',
        label: `云空间`,
        availableFor: ['client']
      },
      {
        id: 'databases',
        label: `数据库`,
        availableFor: ['client']
      },
      {
        id: 'websites',
        label: `网站`,
        availableFor: ['client']
      }
    ]
  },
  {
    id: MODULE.CLIENT.MARKET.key,
    module: MODULE.CLIENT.MARKET,
    icon: 'shop',
    order: 3,
    availableFor: ['client'],
    children: [
      {
        id: 'servers',
        label: `购买服务器`,
        availableFor: ['client']
      },
      {
        id: 'domains',
        label: `注册域名`,
        availableFor: ['client']
      },
      {
        id: 'storage',
        label: `购买云空间`,
        availableFor: ['client']
      },
      {
        id: 'databases',
        label: `购买数据库`,
        availableFor: ['client']
      }
    ]
  },
  {
    id: MODULE.CLIENT.BILLS.key,
    module: MODULE.CLIENT.BILLS,
    icon: 'account-book',
    order: 4,
    availableFor: ['client']
  },
  {
    id: MODULE.CLIENT.TICKETS.key,
    module: MODULE.CLIENT.TICKETS,
    icon: 'customer-service',
    order: 5,
    availableFor: ['client']
  },
  {
    id: MODULE.CLIENT.ACCOUNT.key,
    module: MODULE.CLIENT.ACCOUNT,
    icon: 'user',
    order: 6,
    availableFor: ['client'],
    children: [
      {
        id: MODULE.CLIENT.ACCOUNT.children.PROFILE.key,
        label: MODULE.CLIENT.ACCOUNT.children.PROFILE.label,
        availableFor: ['client']
      },
      {
        id: MODULE.CLIENT.ACCOUNT.children.SECURITY.key,
        label: MODULE.CLIENT.ACCOUNT.children.SECURITY.label,
        availableFor: ['client']
      },
      {
        id: MODULE.CLIENT.ACCOUNT.children.PAYMENT.key,
        label: MODULE.CLIENT.ACCOUNT.children.PAYMENT.label,
        availableFor: ['client']
      }
    ]
  }
];

/**
 * 菜单生成函数
 * @param endpointType 端类型，如'admin'、'client'
 * @param customizer 自定义修改函数，可选
 * @returns 生成的菜单配置
 */
export function generateMenuConfig(
  endpointType: string, 
  customizer?: (items: any[]) => any[]
): MenuConfig[] {
  // 过滤出适用于当前端的菜单项
  let filteredItems = feieryunBaseMenuItems
    .filter(item => item.availableFor.includes(endpointType))
    .map(item => {
      // 深复制以避免修改原始对象
      const menuItem = { ...item };
      
      // 处理子菜单
      if (item.children) {
        menuItem.children = item.children
          .filter(child => child.availableFor.includes(endpointType))
          .map(child => ({ ...child }));
      }
      
      return menuItem;
    });
  
  // 应用自定义修改（如果提供）
  if (customizer) {
    filteredItems = customizer(filteredItems);
  }
  
  // 转换为最终的菜单配置格式
  return filteredItems.map(item => {
    // 获取模块标签，根据端类型可能需要调整
    let label = item.module.label;
    if (endpointType === 'client' && item.id !== MODULE.CLIENT.HOME.key) {
      // 客户端可能需要调整标签，如"我的服务器"而不是"云服务器"
      if (item.clientLabel) {
        label = item.clientLabel;
      } else if (
        item.id === MODULE.SERVER.adminKey || 
        item.id === MODULE.DOMAIN.key || 
        item.id === MODULE.STORAGE.key || 
        item.id === MODULE.DATABASE.key || 
        item.id === MODULE.WEBSITE.key
      ) {
        label = `我的${label}`;
      }
    }
    
    // 基本菜单项
    const menuConfig: MenuConfig = {
      key: item.id,
      label,
      icon: item.icon,
      path: item.path || `/${item.id}`,
      order: item.order,
    };
    
    // 添加权限（如果有）
    if (item.permissions) {
      menuConfig.permissions = item.permissions;
    }
    
    // 添加组件路径（如果没有子菜单）
    if (!item.children || item.children.length === 0) {
      menuConfig.component = `@/pages/${endpointType}/${item.id}/index`;
    }
    
    // 处理子菜单
    if (item.children && item.children.length > 0) {
      menuConfig.children = item.children.map(child => {
        // 子菜单基本配置
        const childConfig: any = {
          key: `${item.id}-${child.id}`,
          label: child.label,
          path: child.path || `/${item.id}/${child.id}`,
          component: `@/pages/${endpointType}/${item.id}/${child.id}`,
          order: child.order || 1,
        };
        
        // 添加权限（如果有）
        if (child.permissions) {
          childConfig.permissions = child.permissions;
        }
        
        // 添加其他特定属性
        if (child.hideInMenu) {
          childConfig.hideInMenu = true;
        }
        
        return childConfig;
      });
    }
    
    return menuConfig;
  });
} 