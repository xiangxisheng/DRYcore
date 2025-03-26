# DRYcore - 零重复代码的全栈开发框架

<p align="center">
  <strong>零重复代码的全栈开发框架</strong>
</p>

<p align="center">
  基于"Don't Repeat Yourself"原则构建的现代化Web应用框架
</p>

## 项目概述

DRYcore 是一个专注于消除代码重复的全栈开发框架，通过以下核心设计实现了高效开发：

- **核心与应用分离**：框架核心与具体应用解耦，实现真正的可插拔架构
- **统一配置注册**：所有应用通过统一的配置注册机制进行管理
- **类型安全**：全面的TypeScript支持，提供端到端的类型安全
- **自动化加载**：组件、路由和配置的自动化注册和加载
- **多端一体化**：支持Web、移动端和桌面应用的统一开发

## 项目结构

```
packages/
├── server/         # 服务端核心框架
├── web/            # Web客户端框架
├── mobile/         # 移动端应用框架
├── miniapp/        # 小程序应用框架
└── desktop/        # 桌面应用框架
```

## 快速开始

DRYcore是一个多包项目，可根据需要选择启动不同的包：

```bash
# 安装所有依赖
pnpm install

# 启动开发服务器（默认启动server包）
pnpm run dev

# 启动特定包（例如web）
pnpm run dev --filter @drycore/web

# 构建整个项目
pnpm run build

# 启动生产服务器
pnpm run start
```

## 使用指南

1. **创建新应用**：在`packages/server/src/apps`目录下创建新的应用目录
2. **注册应用配置**：在应用入口文件中使用`registerConfig`注册应用配置（参考`feieryun`应用）
3. **创建API路由**：在应用目录下创建路由文件并导出路由配置
4. **启动服务**：运行`pnpm run dev`启动开发服务器

详细教程请参考[快速开始指南](docs/detailed/setup/init.md)。

## 文档

- [🔍 架构设计文档](docs/design/overview.md) - 框架设计理念和架构说明
- [📝 详细实现文档](docs/detailed/README.md) - 具体功能模块的实现详情
- [📊 API文档](docs/api/README.md) - API接口说明
- [📋 实现记录](docs/implementation-record.md) - 改进记录和实现历史
- [👥 贡献指南](docs/CONTRIBUTING.md) - 参与项目开发的指南

所有文档均可在[文档中心](docs/README.md)查看。

## 许可

MIT 