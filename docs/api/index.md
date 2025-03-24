# DRYcore API 参考文档

## 概述

DRYcore框架提供了一系列API，用于构建现代化、可扩展的应用程序。本文档提供了对这些API的全面参考，帮助开发者高效地使用DRYcore框架进行开发。

## API类别

DRYcore API分为几个主要类别：

### 核心API

- [配置API](./core/config.md) - 应用配置管理
- [环境API](./core/env.md) - 环境变量处理
- [日志API](./core/logger.md) - 应用日志记录
- [错误处理API](./core/errors.md) - 应用错误处理

### 后端API

- [数据库API](./backend/database.md) - 数据库访问与操作
- [认证API](./backend/auth.md) - 用户认证与授权
- [缓存API](./backend/cache.md) - 数据缓存管理
- [文件API](./backend/files.md) - 文件存储与处理
- [队列API](./backend/queue.md) - 任务队列管理

### 前端API

- [状态管理API](./frontend/state.md) - 前端状态管理
- [UI组件API](./frontend/ui.md) - 可复用UI组件
- [表单API](./frontend/forms.md) - 表单处理
- [路由API](./frontend/router.md) - 前端路由管理
- [请求API](./frontend/requests.md) - API请求管理

### 跨平台API

- [平台检测API](./crossplatform/platform.md) - 平台检测与适配
- [响应式API](./crossplatform/responsive.md) - 响应式布局
- [本地存储API](./crossplatform/storage.md) - 跨平台存储

### 工具API

- [代码生成API](./tools/generator.md) - 代码生成工具
- [迁移API](./tools/migrations.md) - 数据迁移工具
- [CLI命令API](./tools/cli.md) - 命令行工具
- [测试API](./tools/testing.md) - 测试工具

## 如何使用本文档

每个API文档都遵循以下结构：

1. **概述** - API的简要介绍和作用
2. **安装与配置** - 如何安装和配置API（如果需要）
3. **核心概念** - API的核心概念和原理
4. **API参考** - 详细的API方法、参数和返回值参考
5. **示例** - 使用该API的实际代码示例
6. **最佳实践** - 使用该API的推荐最佳实践
7. **常见问题** - 常见问题及其解决方案

## 版本兼容性

| DRYcore版本 | Node.js版本 | TypeScript版本 |
|------------|------------|---------------|
| 1.0.x      | ≥ 16.0.0   | ≥ 4.5.0       |
| 0.9.x      | ≥ 14.0.0   | ≥ 4.3.0       |

## API稳定性

DRYcore使用以下标签来指示API的稳定性级别：

- **稳定** - API已经成熟，不太可能在后续版本中有重大更改
- **实验性** - API正在测试中，可能会在后续版本中有更改
- **弃用** - API计划在未来版本中移除，建议使用替代API

## 贡献

我们欢迎社区为API文档做出贡献。如果你发现文档有误或想要改进文档，请参考[贡献指南](../contribute/documentation.md)。

## 附录

- [API变更日志](./changelog.md) - API变更历史
- [迁移指南](./migration.md) - 不同版本API间的迁移指南
- [API索引](./all.md) - 按字母顺序排列的所有API索引 