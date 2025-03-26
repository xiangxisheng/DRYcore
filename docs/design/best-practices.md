# DRYcore框架开发最佳实践

## 架构原则

DRYcore框架基于以下核心架构原则设计：

1. **DRY原则**：Don't Repeat Yourself，避免重复代码、配置和逻辑
2. **关注点分离**：核心层与应用层职责明确分离
3. **依赖倒置**：高层模块不应依赖低层模块，两者都应依赖于抽象
4. **显式依赖**：通过依赖注入和注册模式管理依赖关系
5. **接口设计**：提供清晰、一致的接口

## 目录结构

遵循以下目录结构分离核心层和应用层：

```
packages/server/
├── src/
│   ├── config/         # 核心配置（不包含应用特定配置）
│   ├── core/           # 核心功能
│   ├── utils/          # 通用工具
│   ├── types/          # 类型定义
│   ├── middlewares/    # 中间件
│   └── apps/           # 应用层（按应用分组）
│       ├── feieryun/   # 飞儿云应用
│       │   ├── admin/  # 管理端
│       │   ├── client/ # 用户端
│       │   └── shared/ # 应用共享代码
│       └── other-app/  # 其他应用
```

## 核心层开发指南

### 1. 避免在核心层包含应用特定内容

❌ **错误示例**：在核心层定义应用特定模块

```typescript
// packages/server/src/config/module-base.ts
export const MODULE = {
  SYSTEM: { key: 'system', label: '系统管理' },
  SERVER: { key: 'server', label: '云服务器' }, // 错误：应用特定模块
};
```

✅ **正确示例**：核心层只包含通用模块

```typescript
// packages/server/src/config/module-base.ts
export const CORE_MODULES = {
  SYSTEM: { key: 'system', label: '系统管理' },
  // 不包含应用特定模块
};
```

### 2. 使用注册模式获取应用层功能

❌ **错误示例**：核心层直接导入应用层模块

```typescript
// packages/server/src/core/controllers/menu.controller.ts
import { feieryunMenuItems } from '@/apps/feieryun/client/menu';

export function getMenuItems() {
  return feieryunMenuItems; // 错误：直接依赖应用层
}
```

✅ **正确示例**：通过注册机制获取应用层功能

```typescript
// packages/server/src/core/controllers/menu.controller.ts
import { getConfig } from './config.controller';

export function getMenuItems(appName: string) {
  return getConfig('client.menus', appName); // 从配置存储获取
}
```

### 3. 设计通用接口而非特定实现

❌ **错误示例**：特定于某个应用的接口设计

```typescript
// packages/server/src/core/services/email.service.ts
export function sendServerNotification(serverId: string, action: string) {
  // 特定于服务器应用的逻辑
}
```

✅ **正确示例**：设计通用接口

```typescript
// packages/server/src/core/services/notification.service.ts
export function sendNotification(
  resourceType: string,
  resourceId: string,
  action: string
) {
  // 通用的通知接口
}
```

## 应用层开发指南

### 1. 在应用层定义应用特定模块

✅ **正确示例**：应用层定义自己的模块

```typescript
// packages/server/src/apps/feieryun/shared/config/modules.ts
import { CORE_MODULES } from '@/config/module-base';

export const APP_MODULES = {
  ...CORE_MODULES, // 继承核心模块
  SERVER: { key: 'server', label: '云服务器' },
  DOMAIN: { key: 'domain', label: '域名管理' },
};
```

### 2. 通过注册机制与核心层集成

✅ **正确示例**：应用通过注册机制集成到系统

```typescript
// packages/server/src/apps/feieryun/index.ts
import { registerModules } from '@/core/controllers/config.controller';
import { APP_MODULES } from './shared/config/modules';

export default {
  name: 'feieryun',
  register(app) {
    // 注册模块到核心系统
    registerModules('feieryun', APP_MODULES);
    
    // 注册路由
    app.route('/admin', adminApp);
    app.route('/client', clientApp);
  }
};
```

### 3. 复用核心层功能

✅ **正确示例**：应用层复用核心层功能

```typescript
// packages/server/src/apps/feieryun/admin/controllers/server.controller.ts
import { generatePermission } from '@/config/module-base';
import { getRegisteredModules } from '@/core/controllers/config.controller';

// 获取应用模块
const modules = getRegisteredModules('feieryun');
const serverModule = modules.SERVER;

// 生成权限
const viewPermission = generatePermission(
  serverModule.apiKey,
  'view',
  serverModule.label
);
```

## DRY原则最佳实践

### 1. 集中定义常量和配置

✅ **正确示例**：集中定义常量

```typescript
// packages/server/src/config/constants.ts
export const STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending',
};

// 在多处使用
import { STATUS } from '@/config/constants';
```

### 2. 使用生成器函数

✅ **正确示例**：使用生成器函数创建相似结构

```typescript
// packages/server/src/utils/form-generator.ts
export function generateFormConfig(entity, fields) {
  return {
    entity,
    fields: fields.map(field => ({
      name: field.name,
      label: field.label,
      type: field.type || 'text',
      required: field.required || false,
      // 其他通用配置
    })),
  };
}

// 使用生成器
const userForm = generateFormConfig('user', [
  { name: 'username', label: '用户名', required: true },
  { name: 'email', label: '邮箱', type: 'email', required: true },
]);
```

### 3. 提取重复逻辑到工具函数

✅ **正确示例**：提取重复逻辑

```typescript
// packages/server/src/utils/request.ts
export async function fetchWithErrorHandling(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

// 在多处使用
import { fetchWithErrorHandling } from '@/utils/request';
```

## 代码审查清单

进行代码审查时，请检查以下几点：

1. **核心层代码是否包含应用特定内容？**
   - 核心层应只包含通用功能
   - 应用特定功能应放在应用层

2. **核心层是否直接导入应用层模块？**
   - 应使用注册机制获取应用功能

3. **是否有重复代码或配置？**
   - 重复代码应提取到共享函数
   - 重复配置应集中定义

4. **模块之间的依赖关系是否合理？**
   - 核心层不应依赖应用层
   - 应用层可以依赖核心层

5. **接口设计是否足够通用？**
   - 应设计通用接口而非特定实现

## 性能优化

在保持架构清晰的同时，请注意以下性能优化实践：

1. **延迟加载**：应用按需加载，避免一次性加载所有模块
2. **缓存优化**：合理使用缓存，减少重复计算和请求
3. **批量操作**：合并多个小操作为批量操作
4. **异步处理**：耗时操作使用异步处理，避免阻塞

## 文档规范

遵循以下文档规范确保知识共享：

1. **代码注释**：关键函数和复杂逻辑需要注释
2. **类型定义**：使用TypeScript类型增强代码安全性
3. **设计文档**：重要模块需要设计文档
4. **API文档**：所有公共API需要文档说明
5. **示例代码**：提供使用示例

## 总结

遵循这些最佳实践，可以确保DRYcore框架的代码保持高质量、易于维护和扩展。关键是保持核心层与应用层的清晰分离，遵循DRY原则，并使用注册模式管理依赖关系。 