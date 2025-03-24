# 项目初始化

## 概述

DRYcore 是一个模块化的全栈开发框架，基于"Don't Repeat Yourself"原则构建。本文档将指导您完成项目的初始化和基本设置。

## 系统要求

在开始之前，请确保您的系统满足以下要求：

- **Node.js**: v16.0.0 或更高版本
- **PNPM**: v8.0.0 或更高版本
- **数据库**: MySQL 5.7+ 或 PostgreSQL 12+
- **操作系统**: Windows 10+、macOS 10.15+ 或 Linux

## 安装

您可以通过以下步骤初始化 DRYcore 项目：

### 1. 克隆代码库

```bash
# 克隆代码库
git clone https://github.com/xiangxisheng/DRYcore.git
cd DRYcore
```

### 2. 安装依赖

DRYcore 使用 PNPM 作为包管理工具，管理整个 monorepo 结构：

```bash
# 安装 PNPM（如果尚未安装）
npm install -g pnpm

# 安装项目依赖
pnpm install
```

### 3. 环境设置

创建环境配置文件：

```bash
# 复制示例环境配置
cp packages/server/.env.example packages/server/.env

# 编辑环境配置文件，设置数据库连接和其他选项
```

根据您的需求编辑 `.env` 文件，配置数据库连接和其他环境变量。详细的环境配置请参考 [环境配置文档](./env.md)。

### 4. 数据库设置

确保您已经创建了一个空的数据库，并在 `.env` 文件中配置了正确的连接信息。然后运行：

```bash
# 初始化数据库
pnpm prisma:generate
pnpm prisma:migrate
```

### 5. 启动开发服务器

```bash
# 启动后端服务
pnpm dev
```

## 项目结构

初始化后的项目结构如下：

```
drycore/
├── packages/
│   ├── server/           # 后端服务
│   │   ├── src/
│   │   │   ├── core/     # 核心功能
│   │   │   ├── config/   # 配置文件
│   │   │   ├── types/    # 类型定义
│   │   │   ├── generators/ # 代码生成器
│   │   │   └── apps/     # 应用目录
│   │   ├── tests/          # 测试目录
│   │   │   ├── unit/       # 单元测试
│   │   │   ├── integration/ # 集成测试
│   │   │   └── e2e/        # 端到端测试
│   │   └── prisma/        # Prisma数据库定义
│   ├── web/             # Web前端
│   ├── mobile/          # 移动端
│   ├── desktop/         # 桌面端
│   └── miniapp/         # 小程序
├── docs/                # 文档
└── pnpm-workspace.yaml  # 工作区配置
```

## 命令说明

DRYcore 提供了一系列 NPM 脚本，以简化开发工作流：

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动开发服务器 |
| `pnpm build` | 构建所有包 |
| `pnpm generate` | 生成后端代码 |
| `pnpm prisma:generate` | 生成Prisma客户端 |
| `pnpm prisma:migrate` | 应用数据库迁移 |
| `pnpm prisma:studio` | 启动Prisma Studio数据管理界面 |
| `pnpm test` | 运行所有测试 |
| `pnpm docs:dev` | 启动文档开发服务器 |
| `pnpm docs:build` | 构建文档网站 |

## 创建新应用

在 DRYcore 中创建一个新应用：

```bash
# 创建新应用的目录结构
mkdir -p packages/server/src/apps/your-app-name/{admin,client,partner,staff,api,shared,docs}

# 创建应用基础配置
touch packages/server/src/apps/your-app-name/index.ts
```

然后在 `packages/server/src/config/domain.ts` 中添加您的应用域名配置：

```typescript
export const domainConfig = {
  // 现有应用配置
  
  // 您的新应用
  'admin.your-app-name.com': { app: 'your-app-name', type: 'admin' },
  'www.your-app-name.com': { app: 'your-app-name', type: 'client' },
  'partner.your-app-name.com': { app: 'your-app-name', type: 'partner' },
  'staff.your-app-name.com': { app: 'your-app-name', type: 'staff' },
  'api.your-app-name.com': { app: 'your-app-name', type: 'api' },
};
```

## 下一步

- [路径别名配置](./paths.md) - 配置项目的路径别名
- [环境配置](./env.md) - 详细了解环境变量和配置
- [API驱动开发](../api_driven.md) - 学习如何使用API驱动模式开发
- [多端适配](../multi_platform.md) - 了解多端适配的实现 