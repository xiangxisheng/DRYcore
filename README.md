# DRYcore

<p align="center">
  <strong>零重复代码的全栈开发框架</strong>
</p>

<p align="center">
  基于"Don't Repeat Yourself"原则构建的现代化Web应用框架
</p>

## 简介

DRYcore是一个基于"Don't Repeat Yourself"原则的全栈开发框架，旨在通过配置驱动开发的方式，实现零重复代码的目标。它采用统一服务器端入口模式，所有用户请求先由服务端处理，根据域名返回相应的HTML页面，然后动态加载前端JS文件，实现集中式配置管理和多端应用支持。

## 核心特性

- **零重复代码** - 严格遵循DRY原则，避免在各端重复相同逻辑
- **多应用支持** - 单一服务器实例支持多个应用，通过域名区分
- **多端适配** - 支持Web、移动端、桌面端、小程序等多种前端平台
- **集中式配置** - 所有配置统一在服务端管理，前端通过API获取
- **基于域名的路由** - 根据域名智能分发到不同应用和端类型
- **统一技术栈** - 使用Node.js、React、TypeScript等现代技术栈

## 架构

DRYcore采用分层架构设计：

- **核心层** - 提供共享功能和基础设施
- **应用层** - 每个应用独立实现业务逻辑
- **前端层** - 基于React的多端适配UI

每个应用可以有多种端类型：

- 管理后台(admin)
- 用户前台(client)
- 合作伙伴端(partner)
- 员工端(staff)
- API端(api)
- 及其他自定义端类型

## 快速开始

```bash
# 安装依赖
npm install

# 开发环境运行
npm run dev

# 构建项目
npm run build

# 启动生产环境
npm run start
```

## 文档

详细文档请参阅[docs目录](docs/README.md)。

## 许可

MIT 