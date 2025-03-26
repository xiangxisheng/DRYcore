# DRYcore 架构最佳实践指南

## 核心原则

DRYcore 框架的主要架构原则是：**核心层不应依赖应用层**。这是一个重要的设计原则，确保系统的模块化和可扩展性。

## 常见的架构错误

### 1. 核心层直接导入应用层代码

**问题描述**：
最常见的错误是在核心层组件中直接导入和使用应用层的模块或配置。

例如，以下代码违反了架构原则：

```typescript
// BAD: 核心控制器直接导入应用配置
// src/core/controllers/config.controller.ts
import { adminMenuConfig } from '@/apps/feieryun/admin/config/menu';
import { clientMenuConfig } from '@/apps/feieryun/client/config/menu';
import { feieryunPermissionConfig } from '@/apps/feieryun/shared/config/permissions';
```

**正确做法**：
使用注册机制，让应用向核心系统注册自己的配置和功能。

```typescript
// GOOD: 使用配置注册系统
// src/core/controllers/config.controller.ts
const configStore = {
  admin: { menus: {} },
  client: { menus: {} },
  permissions: {}
};

export function registerConfig(
  appName: string,
  configType: 'admin.menus' | 'client.menus' | 'permissions',
  config: any[]
) {
  // 注册配置到存储中
}
```

### 2. 缺少明确的模块边界

**问题描述**：
核心层和应用层的职责边界不明确，导致代码重复或职责混乱。

**正确做法**：
- 核心层：提供通用功能、基础设施和抽象接口
- 应用层：实现特定业务逻辑和具体功能
- 使用继承和扩展而非直接修改

### 3. 类型定义不完善

**问题描述**：
过度使用`any`类型，缺少明确的接口定义。

**正确做法**：
- 为所有重要组件定义明确的接口
- 避免使用`any`类型
- 使用泛型增强类型安全

### 4. 硬编码依赖

**问题描述**：
在代码中硬编码应用名称或路径。

**正确做法**：
- 使用配置或服务注册机制
- 基于约定优于配置原则设计API

## 设计模式建议

### 1. 注册模式

对于配置、路由和控制器等组件，使用注册模式允许应用向核心系统注册自己的组件。

```typescript
// 应用注册示例
export function registerApp(server: Hono, app: AppModule): void {
  // 提取应用名称
  const appName = app.name.split('-')[0];
  
  // 调用应用注册方法
  app.register(server);
  
  // 加载并注册配置
  const config = require(`../apps/${appName}/config`).default;
  registerConfig(appName, config);
}
```

### 2. 插件架构

核心系统可以提供插件机制，允许应用作为插件加载。

```typescript
// 插件架构示例
export interface Plugin {
  name: string;
  initialize: (app: Application) => void;
}

export function loadPlugins(app: Application, plugins: Plugin[]): void {
  plugins.forEach(plugin => {
    console.log(`加载插件: ${plugin.name}`);
    plugin.initialize(app);
  });
}
```

### 3. 策略模式

对于同一功能的不同实现，使用策略模式。

```typescript
// 策略模式示例
export interface AuthStrategy {
  authenticate(req: Request): Promise<User | null>;
}

// 不同的认证策略实现
export class JwtAuthStrategy implements AuthStrategy { 
  // 实现JWT认证
}

export class OAuthStrategy implements AuthStrategy {
  // 实现OAuth认证
}
```

## 文档最佳实践

### 1. 代码更改时同步更新文档

每次代码变更时，同步更新相关文档：

- 架构变更：更新架构文档
- API变更：更新API文档
- 配置变更：更新配置说明文档

### 2. 使用文档代码示例

在文档中使用真实的代码示例，而非伪代码。示例应该是可执行的，并且反映当前系统的实际状态。

### 3. 添加架构决策记录

对于重要的架构决策，记录做出该决策的原因：

```markdown
# 架构决策记录: 使用配置注册机制

## 上下文
核心控制器需要访问应用特定的配置，但直接导入会造成依赖倒置。

## 决策
实现配置注册系统，允许应用向核心系统注册配置。

## 状态
已接受

## 后果
- 优点: 降低了核心与应用的耦合度
- 缺点: 增加了额外的注册代码
```

## 代码审查清单

在代码审查时，检查以下项目：

- [ ] 核心层是否依赖应用层
- [ ] 是否使用了清晰的类型定义，避免any
- [ ] 是否遵循了注册模式而非直接导入
- [ ] 是否有足够的文档说明
- [ ] 错误处理是否完善

## 测试策略

为确保架构边界清晰：

- 单独测试核心层，不依赖特定应用
- 测试应用层时，验证与核心层的集成
- 使用模拟(mock)技术隔离测试环境 