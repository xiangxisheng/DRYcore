# DRYcore 文档中心

## 文档结构

```
docs/
├── design/           # 设计文档（无代码示例）
│   ├── overview.md   # 框架设计概述
│   └── architecture-guidelines.md  # 架构最佳实践指南
├── detailed/         # 详细文档（含代码示例）
│   ├── setup/        # 快速开始相关文档
│   │   ├── init.md     # 项目初始化
│   │   ├── paths.md    # 路径别名配置
│   │   └── env.md      # 环境配置
│   ├── testing/       # 测试相关文档
│   │   └── strategy.md # 测试策略
│   ├── multi_platform.md # 多端适配详解
│   └── api_driven.md  # API驱动开发详解
├── api/              # API参考文档
│   └── README.md     # API文档索引
├── apps/             # 应用文档索引（指向应用目录下的文档）
│   └── README.md     # 应用文档列表
├── implementation-record.md # 实现记录与改进历史
└── CONTRIBUTING.md   # 文档贡献指南
```

## 文档分类

1. **框架设计文档**：[design/overview.md](design/overview.md)
   - 框架整体架构
   - 开发理念
   - 技术选型
   - 目录结构
   - 环境配置
   - 多端适配
   - 测试体系
   - [架构最佳实践指南](design/architecture-guidelines.md) - 架构设计原则和常见问题解决方案

2. **详细实现文档**：[detailed/README.md](detailed/README.md)
   - [API驱动开发](detailed/api_driven.md) - API驱动开发的详细实现和示例代码
   - [多端适配](detailed/multi_platform.md) - 多端适配的具体实现和使用方法
   - [环境配置](detailed/setup/env.md) - 环境变量配置和多环境支持
   - [测试策略](detailed/testing/strategy.md) - 测试体系设计和实现
   - [配置注册机制](detailed/config-registry.md) - 核心层与应用层解耦的配置注册系统
   - [实现总结](detailed/implementation-summary.md) - 架构改进总结和待解决问题
   - 包含代码示例的详细技术文档

3. **应用文档**：[apps/README.md](apps/README.md)
   - 路径：`packages/server/src/apps/{应用名}/docs/design.md`
   - 示例：`packages/server/src/apps/feieryun/docs/design.md`

4. **API文档**：[api/README.md](api/README.md)
   - API接口详细说明
   - 接口参数与返回值
   - 错误码说明

5. **实现记录**：[implementation-record.md](implementation-record.md)
   - 最近改进记录
   - 主要架构改进
   - 下一步计划

6. **贡献指南**：[CONTRIBUTING.md](CONTRIBUTING.md)
   - 文档贡献流程
   - Markdown格式规范
   - 文档编写原则

## 文档开发

本项目使用 [VitePress](https://vitepress.dev/) 生成文档网站。

```bash
# 启动文档开发服务器
pnpm run docs:dev

# 构建文档网站
pnpm run docs:build
```

## 文档编写规范

1. **设计文档** (`design/`)
   - 纯概念性描述，不包含代码示例
   - 重点说明设计理念和架构
   - 面向项目管理者和架构师

2. **详细文档** (`detailed/`)
   - 包含具体的代码示例和实现细节
   - 按功能模块组织
   - 面向开发人员

3. **应用文档** (`apps/{应用名}/docs/`)
   - 特定应用的业务逻辑和实现细节
   - 包含应用特有的配置和定制化内容
   - 面向应用开发者

遵循DRY原则，各文档之间应避免内容重复，通过引用关联相关内容。 

## 文档更新指南

1. **代码变更时同步更新文档**
   - 架构变更：更新架构文档
   - API变更：更新API文档
   - 配置变更：更新配置文档
   
2. **使用真实代码示例**
   - 文档中的代码示例应该是可执行的
   - 示例应反映当前系统的实际状态
   
3. **添加架构决策记录**
   - 对于重要的架构决策，记录决策原因和影响
   - 使用统一格式记录：上下文、决策、状态、后果 