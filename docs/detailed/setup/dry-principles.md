# 遵循DRY原则

## 概述

DRYcore框架的核心设计理念之一是严格遵循"Don't Repeat Yourself"(不要重复自己)原则。本文档详细介绍了DRYcore中应用DRY原则的实践和示例，帮助开发者理解如何通过消除重复来提高代码质量和可维护性。

## DRY原则基础

DRY原则由Andy Hunt和Dave Thomas在《程序员修炼之道》一书中提出，核心思想是：

> 系统中的每一个知识点都必须有一个单一的、明确的、权威的表示。

违反DRY原则会导致：

1. **维护困难** - 修改一个功能需要在多处更改代码
2. **不一致风险** - 在某处更新而忘记在其他地方同步更新
3. **代码膨胀** - 冗余代码增加代码库大小
4. **测试负担** - 需要测试相同功能的多个实现

## DRYcore中的实践

### 1. 模块化基础配置

DRYcore使用集中式基础配置定义系统中的核心概念，避免在多个文件中重复定义相同的信息。

**示例：模块基础配置**

```typescript
// packages/server/src/config/module-base.ts
export const MODULE = {
  // 系统管理
  SYSTEM: {
    key: 'system',
    label: '系统管理',
    children: {
      USER: {
        key: 'user',
        label: '用户管理'
      },
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
```

这种方式确保了模块名称、键值等在整个系统中保持一致，当需要更改时只需在一处修改。

### 2. 权限常量与生成器

为避免在多处硬编码权限标识和标签，DRYcore提供了集中的权限定义和生成函数：

```typescript
export const PERMISSION = {
  VIEW: 'view',
  CREATE: 'create',
  UPDATE: 'update',
  DELETE: 'delete',
  // 其他操作...
};

export function generatePermissionKey(module: string, action: string): string {
  return `${module}:${action}`;
}

export function generatePermission(
  module: string, 
  action: string, 
  moduleLabel: string,
  actionLabel?: string
): { key: string; label: string } {
  // 实现逻辑...
}
```

### 3. 配置驱动

DRYcore使用基础配置驱动多个相关文件的实现，避免在这些文件中重复定义相同的信息。

**改进前**（违反DRY原则）：

以下三个文件中重复定义了相同的模块和标签信息：

```typescript
// menu-admin.ts (片段)
{
  key: 'system',
  label: '系统管理',
  // 其他配置...
}

// menu-client.ts (片段)
{
  key: 'account',
  label: '账户中心',
  // 其他配置...
}

// permission.ts (片段)
{
  key: 'system',
  label: '系统管理',
  // 其他配置...
}
```

**改进后**（遵循DRY原则）：

所有文件引用同一个基础配置：

```typescript
// menu-admin.ts
import { MODULE } from './module-base';

{
  key: MODULE.SYSTEM.key,
  label: MODULE.SYSTEM.label,
  // 其他配置...
}

// permission.ts
import { MODULE } from './module-base';

{
  key: MODULE.SYSTEM.key,
  label: MODULE.SYSTEM.label,
  // 其他配置...
}
```

## 具体案例分析

### 管理后台菜单与权限配置

在DRYcore中，管理后台菜单和权限配置需要共享大量相同的模块信息和权限定义。通过集中配置，我们消除了这种重复。

**菜单配置示例**：

```typescript
// 管理后台菜单示例
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
    // 其他子菜单...
  ]
}
```

**权限配置示例**：

```typescript
// 权限配置示例
{
  key: MODULE.SERVER.apiKey,
  label: MODULE.SERVER.label,
  permissions: [
    generatePermission(MODULE.SERVER.apiKey, PERMISSION.VIEW, MODULE.SERVER.label),
    generatePermission(MODULE.SERVER.apiKey, PERMISSION.CREATE, MODULE.SERVER.label),
    // 其他权限...
  ]
}
```

### 动态标签生成

通过基础配置和工具函数，DRYcore实现了动态标签生成，避免了硬编码标签：

```typescript
// 用户前台菜单示例
{
  key: 'servers',
  label: `我的${MODULE.SERVER.label}`, // 动态生成"我的云服务器"
  path: `/${MODULE.CLIENT.SERVICES.key}/servers`,
  component: '@/pages/client/services/servers',
  order: 1,
}
```

## DRY原则的管理与平衡

虽然DRY原则非常重要，但也需要在实践中保持平衡：

1. **适度抽象** - 过度抽象可能导致代码难以理解
2. **考虑变化点** - 针对可能的变化点应用DRY原则
3. **权衡性能** - 某些情况下，轻微的重复可能带来性能优势
4. **维护成本** - 评估抽象带来的复杂性与消除重复带来的好处

## 最佳实践

1. **使用常量与枚举** - 定义核心概念和标识符
2. **集中配置** - 将共享配置集中管理
3. **工具函数** - 创建生成常用格式和结构的工具函数
4. **类型系统** - 利用TypeScript类型系统减少重复并提高类型安全
5. **组件化** - 将重复的UI和业务逻辑封装为可复用组件

## 总结

遵循DRY原则是DRYcore框架的核心设计理念之一。通过集中定义模块配置、权限常量和提供生成工具，DRYcore大大减少了代码重复，提高了代码质量和可维护性。开发人员应当在日常开发中时刻牢记DRY原则，避免引入不必要的重复代码。 