---
layout: home
hero:
  name: DRYcore
  text: 零重复代码的全栈开发框架
  tagline: 基于"Don't Repeat Yourself"原则，配置驱动开发
  actions:
    - theme: brand
      text: 快速开始
      link: /detailed/setup/init
    - theme: alt
      text: 框架概述
      link: /design/overview
    - theme: alt
      text: GitHub
      link: https://github.com/xiangxisheng/DRYcore

features:
  - icon: 🚀
    title: 零重复代码
    details: 通过集中配置、代码生成和约定优于配置，真正做到DRY（不重复自己）
  - icon: 📦
    title: 多应用支持
    details: 单一服务器支持多个应用，通过域名区分，共享核心功能
  - icon: 🔌
    title: 多端适配
    details: 支持管理后台、用户前台、合作伙伴端、员工端、API端等多种终端
  - icon: 🛠️
    title: 集中式配置
    details: 所有配置统一在服务端管理，前端通过接口获取配置
  - icon: 🌐
    title: 域名路由
    details: 基于域名的路由分发，支持子域名配置
  - icon: ⚡
    title: 统一技术栈
    details: Node.js + React + TypeScript + Drizzle，全栈一致的开发体验
---

## DRYcore是什么？

DRYcore是一个基于"Don't Repeat Yourself"原则的全栈开发框架，旨在通过配置驱动开发的方式，实现零重复代码的目标。通过定义数据模型和系统行为，自动生成后端代码，动态加载前端模块，提高开发效率，降低维护成本。

## 快速导航

| 文档类型 | 说明 | 链接 |
|---------|------|------|
| **设计文档** | 框架整体设计、架构和理念 | [查看设计文档](/design/overview) |
| **详细文档** | 包含代码示例的技术文档 | [查看详细文档](/detailed/) |
| **应用文档** | 应用级别的详细设计 | [查看应用文档](/apps/) |
| **API文档** | API接口参考手册 | [查看API文档](/api/) |

## 核心功能

- **配置驱动开发**：通过配置文件定义数据模型和业务逻辑
- **后端代码生成**：基于配置自动生成后端服务代码
- **前端模块加载**：基于配置动态加载通用前端模块，无需生成代码
- **域名路由**：根据域名自动路由到对应应用
- **多端支持**：管理后台、用户前台、合作伙伴端、员工端、API端等
- **集中式配置**：统一在服务端管理配置，前端按需获取
- **权限管理**：基于角色的细粒度权限控制

## 示例应用

框架包含一个示例应用"飞儿云"，实现了云资源管理系统的核心功能：

- 云服务器管理
- 域名管理
- 对象存储
- 数据库服务

[查看飞儿云应用文档](/apps/feieryun) 