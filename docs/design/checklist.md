# DRYcore框架代码审查清单

## 目的

本清单旨在帮助开发者和代码审查者检查代码是否符合DRYcore框架的核心原则，特别是DRY（Don't Repeat Yourself）原则和层次分离原则。通过使用此清单，可以确保代码库保持高质量并符合架构设计指南。

## 核心层与应用层分离

### 核心层代码检查

- [ ] 核心层代码不直接导入应用层代码或模块
- [ ] 核心层不包含特定应用的业务逻辑或功能
- [ ] 核心层不包含特定应用的模块定义（如SERVER、DOMAIN等）
- [ ] 核心层使用注册模式而非直接依赖获取应用层功能
- [ ] 核心层不包含硬编码的应用特定配置

### 应用层代码检查

- [ ] 应用模块通过注册机制与核心层集成
- [ ] 应用特定的模块定义位于应用目录中
- [ ] 应用层实现了所有必要的注册接口
- [ ] 应用层不修改核心层的基础功能
- [ ] 多个应用之间不共享代码（应共享代码放入核心层）

## 依赖方向检查

- [ ] 依赖方向正确：应用层可以依赖核心层，核心层不应依赖应用层
- [ ] 使用依赖注入而非直接导入
- [ ] 使用接口定义而非具体实现
- [ ] 所有导入使用路径别名（如`@/core/*`）而非相对路径
- [ ] 避免循环依赖

## DRY原则检查

- [ ] 无重复的代码块或功能
- [ ] 共享功能已提取到适当的工具类或服务中
- [ ] 配置信息集中管理，避免分散定义
- [ ] 使用常量而非硬编码值
- [ ] 使用生成器函数生成重复模式的代码

## 注册模式检查

- [ ] 所有配置通过注册机制而非直接导入
- [ ] 所有模块通过注册机制而非直接导入
- [ ] 应用入口正确注册到核心层
- [ ] 应用加载使用动态加载机制
- [ ] 注册过程有适当的错误处理和日志记录

## 代码风格和最佳实践

- [ ] 代码遵循项目风格指南
- [ ] 使用TypeScript类型增强代码安全性
- [ ] 代码有适当的注释和文档
- [ ] 避免过长函数，提取复杂逻辑到辅助函数
- [ ] 测试覆盖关键功能

## 具体文件与目录检查

### 核心目录检查

检查以下目录或文件中是否包含特定应用的代码：

- [ ] `packages/server/src/config/`
- [ ] `packages/server/src/core/`
- [ ] `packages/server/src/utils/`
- [ ] `packages/server/src/middleware/`
- [ ] `packages/server/src/types/`

### 特定文件检查

特别关注以下文件是否符合架构规范：

- [ ] `packages/server/src/config/module-base.ts`（不应包含特定应用模块）
- [ ] `packages/server/src/core/controllers/config.controller.ts`（应使用注册模式）
- [ ] `packages/server/src/core/app-loader.ts`（应使用动态加载应用）

## 模块定义规范

应用特定模块应当：

- [ ] 定义在应用目录下（例如`packages/server/src/apps/feieryun/shared/config/modules.ts`）
- [ ] 从核心模块扩展而非替换（如`import { CORE_MODULES } from '@/config/module-base'`）
- [ ] 通过注册机制集成到系统（如`registerModules('feieryun', APP_MODULES)`）

## 导入规范

- [ ] 检查是否存在以下错误导入：
  ```typescript
  import { SERVER, DOMAIN } from '@/config/module-base'; // 错误：直接导入应用特定模块
  ```

- [ ] 应该使用以下正确导入：
  ```typescript
  import { getRegisteredModules } from '@/core/controllers/config.controller';
  
  // 获取模块
  const modules = getRegisteredModules('feieryun');
  // 使用模块
  const serverLabel = modules.SERVER.label;
  ```

## 常见错误模式示例

### 错误：核心层定义应用特定模块

```typescript
// packages/server/src/config/module-base.ts
export const MODULE = {
  // 系统管理（核心模块，允许）
  SYSTEM: { key: 'system', label: '系统管理' },
  
  // 错误：应用特定模块不应该在核心层定义
  SERVER: { key: 'server', label: '云服务器' },
  DOMAIN: { key: 'domain', label: '域名管理' },
};
```

### 错误：核心层直接引用应用特定配置

```typescript
// packages/server/src/core/controllers/menu.controller.ts
import { feieryunBaseMenuItems } from '@/apps/feieryun/shared/config/base-menu';

// 错误：核心层不应直接引用应用特定配置
export function getMenuItems() {
  return feieryunBaseMenuItems;
}
```

### 正确：使用注册模式获取配置

```typescript
// packages/server/src/core/controllers/menu.controller.ts
import { getConfig } from './config.controller';

// 正确：通过注册机制获取配置
export function getMenuItems() {
  return getConfig('admin.menus');
}
```

## 代码审查流程

1. **自我审查**：开发者提交前使用此清单自查
2. **PR审查**：代码审查者使用此清单检查PR
3. **定期审计**：定期全面审计代码库
4. **自动化检查**：配置lint规则检查常见错误

## 违规处理流程

1. **标记**：在代码审查中标记违规
2. **修复**：制定修复计划并执行
3. **学习**：总结经验，避免类似问题
4. **优化**：必要时优化架构设计或开发流程

## 总结

坚持使用此清单进行代码审查，有助于维护DRYcore框架的架构完整性，确保核心层与应用层之间的清晰分离，并遵循DRY原则。这将使系统更易于维护、测试和扩展，同时降低技术债务的累积。 