# DRYcore框架重构计划

## 问题背景

根据代码审查，我们发现DRYcore框架存在几个核心架构问题，主要体现在核心层与应用层之间的依赖关系混乱。具体问题包括：

1. **核心层包含应用特定模块**：在`packages/server/src/config/module-base.ts`中定义了应用特定的模块如`SERVER`、`DOMAIN`等
2. **应用层未使用注册模式**：应用层的功能直接被核心层导入，而非通过注册机制集成
3. **依赖方向错误**：核心层依赖应用层，违反了依赖倒置原则
4. **硬编码配置**：配置数据直接硬编码在核心层，而非通过配置注册

## 重构目标

1. **清晰的架构边界**：核心层不应依赖应用层，应用层可以依赖核心层
2. **统一的注册模式**：应用通过注册机制将自身功能暴露给核心层
3. **模块化设计**：每个应用可以独立开发、测试和部署
4. **减少耦合**：降低系统各部分之间的耦合度
5. **消除重复**：避免不同应用之间的代码重复

## 重构步骤

### 1. 模块定义重构

1. **修改`packages/server/src/config/module-base.ts`**
   - 移除应用特定模块（SERVER, DOMAIN等）
   - 只保留核心系统模块（SYSTEM）
   - 添加明确的模块注册接口

2. **创建应用特定模块文件**
   - 在`packages/server/src/apps/feieryun/shared/config/modules.ts`创建应用模块定义
   - 导入核心模块并进行扩展
   - 实现应用特定模块定义

### 2. 注册机制实现

1. **在`config.controller.ts`中添加模块注册功能**
   - 实现`ModuleStore`接口和存储
   - 实现`registerModules`和`getRegisteredModules`方法
   - 添加日志记录和错误处理

2. **修改现有配置注册机制**
   - 确保`registerConfig`方法支持动态注册
   - 优化`getConfig`方法，支持从注册表中获取数据

### 3. 应用集成更新

1. **更新应用入口文件**
   - 在`packages/server/src/apps/feieryun/index.ts`中实现注册逻辑
   - 调用`registerModules`注册应用模块
   - 调用`registerConfig`注册应用配置

2. **更新应用加载器**
   - 修改`app-loader.ts`使用路径别名
   - 实现动态导入应用模块
   - 添加应用注册检查和错误处理

### 4. 配置使用更新

1. **修改菜单生成逻辑**
   - 更新`base-menu.ts`从注册表获取模块
   - 修改菜单项使用注册模块而非直接引用

2. **更新权限配置**
   - 修改权限生成逻辑使用注册模块

### 5. 文档和最佳实践

1. **创建模块注册模式文档**
   - 详细说明注册模式工作原理
   - 提供使用示例和最佳实践

2. **更新架构指南**
   - 添加明确的规则防止核心层依赖应用层
   - 提供代码审查清单

## 代码修改详情

### 修改1：核心模块定义

```typescript
// packages/server/src/config/module-base.ts

// 定义核心模块（只包含系统通用模块）
export const CORE_MODULES = {
  // 系统管理
  SYSTEM: {
    key: 'system',
    label: '系统管理',
  },
};

// 临时导出MODULE以保持向后兼容
// 注意：在完成迁移后应移除此导出
export const MODULE = {
  ...CORE_MODULES,
};
```

### 修改2：应用特定模块定义

```typescript
// packages/server/src/apps/feieryun/shared/config/modules.ts

import { CORE_MODULES } from '@/config/module-base';

// 应用特定模块定义（飞儿云应用）
export const APP_MODULES = {
  ...CORE_MODULES, // 包含核心模块
  
  // 云服务器
  SERVER: {
    adminKey: 'cloud-server',
    apiKey: 'server',
    label: '云服务器',
  },
  
  // 域名管理
  DOMAIN: {
    key: 'domain',
    label: '域名管理',
  },
  
  // 其他应用特定模块...
};
```

### 修改3：模块注册机制

```typescript
// packages/server/src/core/controllers/config.controller.ts

// 模块存储接口
interface ModuleStore {
  [appName: string]: {
    [moduleKey: string]: any;
  };
}

// 初始化模块存储
const moduleStore: ModuleStore = {};

/**
 * 注册应用模块
 * @param appName 应用名称
 * @param modules 模块定义对象
 */
export function registerModules(appName: string, modules: Record<string, any>): void {
  if (!moduleStore[appName]) {
    moduleStore[appName] = {};
  }
  
  moduleStore[appName] = {
    ...moduleStore[appName],
    ...modules,
  };
  
  console.log(`Registered modules for application: ${appName}`);
}

/**
 * 获取注册的模块
 * @param appName 可选，应用名称
 * @returns 注册的模块对象
 */
export function getRegisteredModules(appName?: string): Record<string, any> {
  if (appName) {
    return moduleStore[appName] || {};
  }
  
  // 合并所有应用的模块
  return Object.values(moduleStore).reduce((all, modules) => ({
    ...all,
    ...modules,
  }), {});
}
```

### 修改4：应用注册实现

```typescript
// packages/server/src/apps/feieryun/index.ts

import { Hono } from 'hono';
import { registerModules } from '@/core/controllers/config.controller';
import { APP_MODULES } from './shared/config/modules';
import adminApp from './admin';
import clientApp from './client';

// 飞儿云应用
const feieryunApp = {
  name: 'feieryun',
  description: '飞儿云综合服务平台',
  
  // 注册到核心系统
  register(app: Hono): void {
    // 注册模块
    registerModules('feieryun', APP_MODULES);
    
    // 注册子应用
    app.route('/admin', adminApp.routes);
    app.route('/client', clientApp.routes);
    
    console.log('飞儿云应用注册成功');
  }
};

export default feieryunApp;
```

### 修改5：优化应用加载器

```typescript
// packages/server/src/core/app-loader.ts

import { Hono } from 'hono';
import fs from 'fs';
import path from 'path';

/**
 * 加载所有应用到服务器
 * @param server Hono服务器实例
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

## 预期成果

1. **清晰的架构边界**：核心层只包含通用功能，不包含应用特定代码
2. **灵活的应用注册**：新增应用只需实现注册接口，无需修改核心代码
3. **提高可维护性**：降低系统各部分之间的耦合度，便于独立维护
4. **增强可测试性**：核心层可独立测试，无需依赖应用层
5. **支持多应用**：轻松支持多个应用并行开发和部署

## 实施时间线

1. **准备阶段（1-2天）**
   - 代码审查和问题分析
   - 详细设计和文档撰写

2. **核心重构（2-3天）**
   - 模块定义重构
   - 注册机制实现

3. **应用集成（2-3天）**
   - 应用入口更新
   - 加载器优化

4. **测试和验证（1-2天）**
   - 功能测试
   - 集成测试

5. **文档和培训（1天）**
   - 更新开发文档
   - 团队代码规范培训

## 风险和缓解策略

1. **兼容性风险**
   - 风险：重构可能破坏现有功能
   - 缓解：实施渐进式重构，保持临时兼容层

2. **团队适应风险**
   - 风险：团队成员可能不熟悉新架构
   - 缓解：提供清晰文档和培训，展示具体示例

3. **性能风险**
   - 风险：注册机制可能引入性能开销
   - 缓解：进行性能测试，必要时进行优化

## 总结

本重构计划旨在解决DRYcore框架中核心层与应用层之间的依赖问题，通过实施模块注册模式，确保核心层不直接依赖应用层，从而提高系统的模块化、可测试性和可扩展性。重构完成后，系统将具有更清晰的架构边界，更低的耦合度，以及更高的可维护性和可扩展性。 