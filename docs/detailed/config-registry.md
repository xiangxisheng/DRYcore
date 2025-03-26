# 配置注册机制

配置注册机制是DRYcore框架的核心设计模式之一，用于解决核心层与应用层之间的依赖问题。本文详细介绍配置注册机制的实现和使用方法。

## 设计目标

配置注册机制旨在实现以下目标：

1. **解耦核心层与应用层** - 核心层不应直接依赖应用层的配置
2. **支持多应用** - 允许多个应用注册自己的配置
3. **动态加载** - 根据请求上下文动态选择正确的配置
4. **类型安全** - 提供类型定义确保配置格式正确

## 实现原理

配置注册机制主要包含三个部分：

1. **配置存储** - 中央存储所有应用的配置
2. **注册API** - 允许应用注册配置的接口
3. **获取API** - 从存储中检索配置的接口

### 配置存储

配置存储是一个简单的对象，按应用名和配置类型组织配置数据：

```typescript
// src/core/controllers/config.controller.ts
interface ConfigStore {
  admin: {
    menus: Record<string, any[]>;
  };
  client: {
    menus: Record<string, any[]>;
  };
  permissions: Record<string, any[]>;
}

// 初始化配置存储
const configStore: ConfigStore = {
  admin: { menus: {} },
  client: { menus: {} },
  permissions: {}
};
```

### 注册API

注册API允许应用在启动时注册自己的配置：

```typescript
// src/core/controllers/config.controller.ts
export function registerConfig(
  appName: string,
  configType: 'admin.menus' | 'client.menus' | 'permissions',
  config: any[]
) {
  if (configType === 'admin.menus') {
    configStore.admin.menus[appName] = config;
  } else if (configType === 'client.menus') {
    configStore.client.menus[appName] = config;
  } else if (configType === 'permissions') {
    configStore.permissions[appName] = config;
  }
}
```

### 配置获取API

通过HTTP接口获取配置，根据请求上下文动态选择配置：

```typescript
// src/core/controllers/config.controller.ts
export const getAdminMenuConfig = async (c: Context) => {
  // 获取应用信息
  const appInfo = c.get('appInfo');
  
  // 获取当前应用的管理菜单配置
  const menuConfig = configStore.admin.menus[appInfo.app] || [];
  
  // 返回配置
  return c.json({
    status: 'success',
    data: menuConfig
  });
};
```

## 使用方法

### 注册配置

在应用加载过程中注册配置：

```typescript
// src/core/app-loader.ts
export function registerApp(server: Hono, app: AppModule): void {
  const appName = app.name.split('-')[0];
  
  // 加载应用的菜单和权限配置
  try {
    if (app.type === 'admin') {
      // 加载并注册管理后台菜单
      const adminMenuConfig = require(`../apps/${appName}/admin/config/menu`).adminMenuConfig;
      registerConfig(appName, 'admin.menus', adminMenuConfig);
    } else if (app.type === 'client') {
      // 加载并注册客户端菜单
      const clientMenuConfig = require(`../apps/${appName}/client/config/menu`).clientMenuConfig;
      registerConfig(appName, 'client.menus', clientMenuConfig);
    }
    
    // 加载并注册权限配置
    const permissionsConfig = require(`../apps/${appName}/shared/config/permissions`).feieryunPermissionConfig;
    registerConfig(appName, 'permissions', permissionsConfig);
  } catch (err) {
    console.warn(`加载${app.name}配置失败:`, err.message);
  }
}
```

### 配置路由

配置API路由用于前端获取配置：

```typescript
// src/routes/config.routes.ts
import { Hono } from 'hono';
import { 
  getAdminMenuConfig, 
  getClientMenuConfig, 
  getPermissionConfig 
} from '../core/controllers/config.controller';
import { authMiddleware } from '../core/middlewares/auth';

// 创建配置路由
const configRouter = new Hono();

// 添加认证中间件
configRouter.use('*', authMiddleware);

// 管理后台菜单配置
configRouter.get('/admin/menu', getAdminMenuConfig);

// 客户端菜单配置
configRouter.get('/client/menu', getClientMenuConfig);

// 权限配置
configRouter.get('/permissions', getPermissionConfig);

export default configRouter;
```

### 前端使用

前端可以通过API获取配置：

```typescript
// 前端获取配置示例
async function fetchAdminMenuConfig() {
  const response = await fetch('/api/config/admin/menu', {
    headers: {
      'Authorization': `Bearer ${getToken()}`
    }
  });
  
  const result = await response.json();
  
  if (result.status === 'success') {
    return result.data;
  }
  
  throw new Error(result.message || '获取菜单配置失败');
}
```

## 类型定义

为确保类型安全，我们应定义清晰的配置类型：

```typescript
// src/types/menu.ts
export interface MenuItem {
  key: string;
  label: string;
  icon: string;
  path: string;
  order: number;
  permissions?: string[];
  component?: string;
  children?: MenuItem[];
}

// src/types/permission.ts
export interface Permission {
  key: string;
  label: string;
}

export interface PermissionGroup {
  key: string;
  label: string;
  permissions: Permission[];
  children?: PermissionGroup[];
}
```

然后在配置注册和获取时使用这些类型，而不是any：

```typescript
// 改进后的配置存储类型
interface ConfigStore {
  admin: {
    menus: Record<string, MenuItem[]>;
  };
  client: {
    menus: Record<string, MenuItem[]>;
  };
  permissions: Record<string, PermissionGroup[]>;
}
```

## 最佳实践

1. **扩展而非修改** - 新增配置类型时，扩展ConfigStore接口而非修改现有代码
2. **按应用分离配置** - 每个应用的配置应该独立存储和获取
3. **提供默认值** - 获取配置时始终提供默认值，防止空引用错误
4. **添加验证** - 在注册配置时验证格式是否正确
5. **缓存机制** - 考虑添加缓存以提高性能，特别是对于不经常变化的配置

## 高级功能

### 配置热更新

通过WebSocket或轮询实现配置热更新：

```typescript
// 配置热更新示例
export function enableConfigHotReload(server: Hono): void {
  // 创建WebSocket服务器
  const wss = new WebSocketServer({ server: server.server });
  
  // 监听配置变更
  configEmitter.on('configChanged', (appName, configType) => {
    // 向相关客户端广播配置变更
    wss.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({
          type: 'configChanged',
          appName,
          configType
        }));
      }
    });
  });
}
```

### 配置继承

支持配置继承，允许应用继承核心配置并扩展：

```typescript
// 配置继承示例
export function registerConfigWithInheritance(
  appName: string,
  configType: string,
  config: any,
  options: { inherit?: boolean } = {}
) {
  if (options.inherit && configStore[configType].core) {
    // 合并核心配置和应用配置
    configStore[configType][appName] = deepMerge(
      configStore[configType].core,
      config
    );
  } else {
    configStore[configType][appName] = config;
  }
}
```

## 故障排除

### 常见问题

1. **配置未加载**
   - 检查应用名称是否正确
   - 确认文件路径存在
   - 查看控制台错误日志

2. **配置格式错误**
   - 验证配置格式是否符合接口定义
   - 检查必要字段是否缺失

3. **权限问题**
   - 确认用户拥有访问配置的权限
   - 检查认证中间件是否正确设置 