# DRYcore 详细文档

这里包含DRYcore框架的详细技术文档，包括具体实现方法和代码示例。

## 目录

### 快速开始

- [项目初始化](./setup/init.md)
- [路径别名配置](./setup/paths.md)
- [环境配置](./setup/env.md)

### 核心概念

- [API驱动开发](./api_driven.md)
- [配置驱动开发](./config_driven.md)
- [多端适配](./multi_platform.md)

### 后端实现

- [服务器架构](./backend/architecture.md)
- [数据模型定义](./backend/data_model.md)
- [路由系统](./backend/routing.md)
- [中间件](./backend/middleware.md)

### 前端实现

- [前端架构](./frontend/architecture.md)
- [组件系统](./frontend/components.md)
- [状态管理](./frontend/state.md)
- [主题与样式](./frontend/styling.md)

### 测试指南

- [测试策略](./testing/strategy.md)
- [单元测试](./testing/unit.md)
- [集成测试](./testing/integration.md)
- [端到端测试](./testing/e2e.md)

### 部署与运维

- [开发环境部署](./deployment/development.md)
- [生产环境部署](./deployment/production.md)
- [容器化部署](./deployment/containers.md)
- [监控与日志](./deployment/monitoring.md)

## 文档贡献

如果您想为本文档做出贡献，请参阅[贡献指南](../CONTRIBUTING.md)。

# 详细实现文档

本节包含DRYcore框架的详细实现文档，包括代码示例和实现细节。

## 系统架构

- [配置注册机制](config-registry.md) - 核心层与应用层解耦的配置注册系统
- [API驱动开发](api_driven.md) - API驱动开发的详细实现和示例代码
- [多端适配](multi_platform.md) - 多端适配的具体实现和使用方法
- [实现总结](implementation-summary.md) - 架构改进总结和待解决问题

## 项目设置

- [项目初始化](setup/init.md) - 项目初始化和目录结构
- [路径别名配置](setup/paths.md) - 路径别名配置和使用方法
- [环境配置](setup/env.md) - 环境变量配置和多环境支持

## 测试

- [测试策略](testing/strategy.md) - 测试体系设计和实现

## 常见问题和解决方案

- [架构问题排查](troubleshooting/architecture.md) - 常见架构问题和解决方案
- [性能优化](troubleshooting/performance.md) - 性能瓶颈和优化方法 