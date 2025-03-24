# 菜单系统设计

## 概述

DRYcore菜单系统遵循DRY(Don't Repeat Yourself)原则，采用多层继承的方式设计，实现了灵活、可扩展且易于维护的菜单配置机制。本文档详细介绍了菜单系统的设计原理、文件结构和使用方法。

## 设计原则

1. **遵循DRY原则**：避免在多处重复定义相同的模块名称、标签和路径
2. **分离核心与应用**：基础模块定义与应用特定菜单分离
3. **多级继承**：通过基础配置、共享配置和特定端配置的三级结构，减少重复
4. **灵活扩展**：允许各端在共享基础上添加特定功能

## 文件结构

```
packages/server/
├── src/
│   ├── config/
│   │   └── module-base.ts      # 基础模块和权限常量定义
│   └── apps/
│       └── feieryun/
│           ├── shared/
│           │   └── config/
│           │       ├── base-menu.ts   # 应用共享菜单配置
│           │       └── permissions.ts # 应用权限配置
│           ├── admin/
│           │   └── config/
│           │       └── menu.ts        # 管理后台特定菜单
│           └── client/
│               └── config/
│                   └── menu.ts        # 用户前台特定菜单
```

## 基础模块定义

`module-base.ts`文件定义了系统中所有模块的基础信息和权限常量，是菜单和权限系统的基础：

```typescript
// config/module-base.ts
export const MODULE = {
  // 系统管理
  SYSTEM: {
    key: 'system',
    label: '系统管理',
    children: {
      USER: { key: 'user', label: '用户管理' },
      // 其他子模块...
    }
  },
  
  // 云服务器
  SERVER: {
    adminKey: 'cloud-server', // 管理后台使用的key
    apiKey: 'server',         // 权限和API中使用的key
    label: '云服务器',
  },
  
  // 其他模块...
};

// 权限操作类型常量
export const PERMISSION = {
  VIEW: 'view',
  CREATE: 'create',
  // 其他操作...
};

// 生成权限标识和权限配置项的工具函数
export function generatePermissionKey(module: string, action: string): string {
  return `${module}:${action}`;
}

export function generatePermission(module: string, action: string, moduleLabel: string): { key: string; label: string } {
  // 实现细节...
}
```

## 应用共享菜单配置

`base-menu.ts`定义了特定应用的所有可能菜单项，并提供基于端类型过滤和自定义的生成函数：

```typescript
// apps/feieryun/shared/config/base-menu.ts
import { MODULE, PERMISSION, generatePermissionKey } from '@/config/module-base';

// 定义所有可能的菜单项
export const feieryunBaseMenuItems = [
  {
    id: 'dashboard',
    module: { key: 'dashboard', label: '控制台' },
    icon: 'dashboard',
    availableFor: ['admin', 'partner', 'staff'] // 定义哪些端可以使用此菜单
  },
  {
    id: MODULE.SERVER.adminKey,
    module: MODULE.SERVER,
    icon: 'cloud-server',
    availableFor: ['admin', 'client', 'partner'],
    children: [
      {
        id: 'list',
        label: '服务器列表',
        availableFor: ['admin', 'client', 'partner']
      },
      // 其他子菜单...
    ]
  },
  // 其他菜单项...
];

// 菜单生成函数
export function generateMenuConfig(endpointType: string, customizer?: (items: any[]) => any[]) {
  // 基于端类型过滤菜单项
  // 应用自定义修改
  // 生成最终配置
}
```

## 特定端菜单配置

各端只需要使用生成函数并提供自定义修改逻辑：

```typescript
// apps/feieryun/admin/config/menu.ts
import { generateMenuConfig } from '@/apps/feieryun/shared/config/base-menu';

export const adminMenuConfig = generateMenuConfig('admin', (items) => {
  // 这里可以添加管理员特有的菜单项或修改现有项
  return items;
});

// apps/feieryun/client/config/menu.ts
import { generateMenuConfig } from '@/apps/feieryun/shared/config/base-menu';

export const clientMenuConfig = generateMenuConfig('client', (items) => {
  // 这里可以添加客户端特有的菜单项或修改现有项
  return items;
});
```

## 菜单生成机制

1. **基础过滤**：根据`availableFor`属性过滤出适用于当前端的菜单项
2. **自定义修改**：应用客户端提供的自定义函数，添加或修改菜单项
3. **格式转换**：将内部菜单定义转换为路由系统所需的标准格式
4. **标签处理**：根据端类型动态调整标签，如客户端显示"我的服务器"而非"云服务器"

## 权限配置

权限配置与菜单系统紧密集成，使用相同的基础模块定义：

```typescript
// apps/feieryun/shared/config/permissions.ts
import { MODULE, PERMISSION, generatePermission } from '@/config/module-base';

export const feieryunPermissionConfig = [
  {
    key: MODULE.SYSTEM.key,
    label: MODULE.SYSTEM.label,
    children: [
      {
        key: MODULE.SYSTEM.children.USER.key,
        label: MODULE.SYSTEM.children.USER.label,
        permissions: [
          generatePermission(MODULE.SYSTEM.children.USER.key, PERMISSION.VIEW, MODULE.SYSTEM.children.USER.label),
          // 其他权限...
        ]
      },
      // 其他子模块...
    ]
  },
  // 其他模块...
];
```

## 使用示例

### 添加新模块

1. 在`module-base.ts`中定义新模块：

```typescript
export const MODULE = {
  // 现有模块...
  
  // 新模块
  NOTIFICATION: {
    key: 'notification',
    label: '消息通知',
  },
};
```

2. 在应用基础菜单中添加：

```typescript
export const feieryunBaseMenuItems = [
  // 现有菜单项...
  
  // 新菜单项
  {
    id: MODULE.NOTIFICATION.key,
    module: MODULE.NOTIFICATION,
    icon: 'bell',
    order: 7,
    availableFor: ['admin', 'client'],
    children: [
      {
        id: 'list',
        label: '消息列表',
        availableFor: ['admin', 'client']
      },
      {
        id: 'settings',
        label: '通知设置',
        availableFor: ['admin', 'client']
      }
    ]
  }
];
```

3. 无需修改各端菜单配置，新菜单会自动被包含

### 端特定自定义

管理后台可以添加特定功能：

```typescript
export const adminMenuConfig = generateMenuConfig('admin', (items) => {
  // 找到通知菜单
  const notificationMenu = items.find(item => item.id === 'notification');
  if (notificationMenu && notificationMenu.children) {
    // 添加管理员特有的子菜单
    notificationMenu.children.push({
      id: 'broadcast',
      label: '群发通知',
      availableFor: ['admin']
    });
  }
  return items;
});
```

## 优势

1. **集中管理**：模块信息集中定义，避免重复和不一致
2. **类型安全**：利用TypeScript类型系统确保配置正确
3. **代码精简**：各端菜单配置代码量大幅减少
4. **易于维护**：添加或修改功能只需在一处更改
5. **灵活扩展**：支持多应用、多端类型的扩展需求

## 最佳实践

1. **模块命名规范**：在`module-base.ts`中使用全大写常量命名模块
2. **清晰的可用性标记**：明确指定菜单项可用的端类型
3. **适度自定义**：仅在必要时在特定端配置中添加自定义逻辑
4. **保持简单**：避免在生成函数中添加过于复杂的逻辑 