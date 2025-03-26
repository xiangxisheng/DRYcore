# 模块注册模式

## 概述

模块注册模式是DRYcore框架的核心架构模式，用于解决核心层与应用层之间的依赖关系。该模式遵循依赖倒置原则，确保核心层不直接依赖于应用层。

## 问题背景

在传统的应用架构中，核心层经常直接导入应用层的模块，这导致了以下问题：

1. **依赖倒置问题**：核心层不应该依赖应用层，这违反了清晰的架构边界
2. **紧耦合**：直接导入创建了紧密耦合，使系统难以扩展和维护
3. **测试困难**：紧耦合的代码难以进行单元测试，因为核心层的测试需要完整的应用层
4. **灵活性受限**：添加新应用或修改现有应用需要修改核心代码

## 解决方案

模块注册模式通过以下方式解决这些问题：

1. 核心层定义注册接口和存储机制
2. 应用层实现注册接口并向核心层注册自己
3. 核心层通过注册表访问应用功能，而非直接导入

## 实现示例

### 1. 核心层定义注册机制

```typescript
// src/core/controllers/config.controller.ts

// 配置存储
interface ConfigStore {
  admin: { menus: Record<string, any[]> };
  client: { menus: Record<string, any[]> };
  permissions: Record<string, any[]>;
}

// 初始化配置存储
const configStore: ConfigStore = {
  admin: { menus: {} },
  client: { menus: {} },
  permissions: {}
};

// 注册配置的函数
export function registerConfig(
  appName: string,
  configType: 'admin.menus' | 'client.menus' | 'permissions',
  config: any[]
): void {
  const [section, subSection] = configType.split('.');
  
  if (subSection) {
    if (!configStore[section][subSection][appName]) {
      configStore[section][subSection][appName] = [];
    }
    
    configStore[section][subSection][appName] = config;
  } else {
    if (!configStore[section][appName]) {
      configStore[section][appName] = [];
    }
    
    configStore[section][appName] = config;
  }
  
  console.log(`Registered ${configType} for application: ${appName}`);
}

// 获取注册的配置
export function getConfig(
  configType: 'admin.menus' | 'client.menus' | 'permissions',
  appName?: string
): any[] {
  const [section, subSection] = configType.split('.');
  
  if (appName) {
    if (subSection) {
      return configStore[section][subSection][appName] || [];
    } else {
      return configStore[section][appName] || [];
    }
  }
  
  // 返回所有应用的配置
  if (subSection) {
    return Object.values(configStore[section][subSection]).flat();
  } else {
    return Object.values(configStore[section]).flat();
  }
}
```

### 2. 应用层实现注册

```typescript
// src/apps/feieryun/admin/index.ts
import { Hono } from 'hono';
import { registerConfig } from '@/core/controllers/config.controller';
import adminMenuConfig from './config/menu';
import permissionConfig from '../shared/config/permissions';

// 飞儿云管理应用
const adminApp = {
  name: 'feieryun-admin',
  description: '飞儿云管理端应用',
  
  // 注册到核心系统
  register(app: Hono): void {
    // 注册配置
    registerConfig('feieryun', 'admin.menus', adminMenuConfig);
    registerConfig('feieryun', 'permissions', permissionConfig);
    
    // 注册路由
    app.get('/', (c) => c.html(renderAdminPage()));
    
    console.log('飞儿云管理端应用注册成功');
  }
};

export default adminApp;
```

### 3. 核心层通过注册接口访问应用功能

```typescript
// src/core/controllers/config.controller.ts

// 获取管理端菜单配置
export async function getAdminMenuConfig(c): Promise<Response> {
  // 从配置存储中获取所有已注册的菜单配置
  const adminMenus = getConfig('admin.menus');
  
  // 处理权限过滤等
  const user = c.get('user');
  
  // 根据用户权限过滤菜单
  const filteredMenus = filterMenusByPermissions(adminMenus, user);
  
  return c.json(filteredMenus);
}
```

## 应用加载机制

为了简化应用加载，系统提供了自动加载机制：

```typescript
// src/core/app-loader.ts
import { Hono } from 'hono';
import fs from 'fs';
import path from 'path';

/**
 * 加载所有应用到服务器
 */
export async function loadAllApps(server: Hono): Promise<void> {
  const appsDir = path.join(__dirname, '../apps');
  
  // 检查apps目录是否存在
  if (!fs.existsSync(appsDir)) {
    console.warn('应用目录不存在:', appsDir);
    return;
  }
  
  // 获取应用文件夹
  const appFolders = fs.readdirSync(appsDir);
  
  // 遍历所有应用文件夹
  for (const appName of appFolders) {
    const appDir = path.join(appsDir, appName);
    
    // 检查是否为目录
    if (fs.statSync(appDir).isDirectory()) {
      try {
        // 使用路径别名动态导入应用
        const appModule = await import(`@/apps/${appName}`);
        
        if (appModule.default && typeof appModule.default.register === 'function') {
          // 注册应用
          appModule.default.register(server);
          console.log(`成功加载应用: ${appName}`);
        } else {
          console.warn(`应用 ${appName} 没有有效的 register 方法`);
        }
      } catch (error) {
        console.error(`加载应用 ${appName} 失败:`, error);
      }
    }
  }
  
  console.log('所有应用加载完成');
}
```

## 优势

1. **清晰的架构边界**：核心层不依赖应用层，保持清晰的架构边界
2. **松耦合**：应用与核心通过接口通信，降低耦合度
3. **可测试性**：核心层可以独立测试，不需要实际应用
4. **可扩展性**：新增应用只需遵循注册接口，无需修改核心代码
5. **动态加载**：支持运行时动态加载应用，提高灵活性

## 最佳实践

1. **保持注册接口简单**：注册接口应足够简单，易于实现
2. **使用类型安全**：使用TypeScript接口定义注册数据结构
3. **提供清晰的文档**：为每个注册接口提供详细文档
4. **验证注册数据**：核心层应验证注册数据的有效性
5. **适当日志记录**：记录注册过程，便于调试和监控

## 总结

模块注册模式是DRYcore框架的关键架构模式，通过颠倒依赖关系，确保核心层不直接依赖应用层。这种模式增强了系统的模块化、可测试性和可扩展性，同时保持了清晰的架构边界。 