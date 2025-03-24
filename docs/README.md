# DRYcore 文档中心

## 文档结构

```
docs/
├── design/         # 设计文档（无代码示例）
│   └── overview.md   # 框架设计概述
├── detailed/       # 详细文档（含代码示例）
│   ├── setup/        # 快速开始相关文档
│   └── api_driven.md # API驱动开发详解
├── api/            # API参考文档
│   └── README.md     # API文档索引
├── apps/           # 应用文档索引（指向应用目录下的文档）
│   └── README.md     # 应用文档列表
└── CONTRIBUTING.md # 文档贡献指南
```

## 文档分类

1. **框架设计文档**：[design/overview.md](design/overview.md)
   - 框架整体架构
   - 开发理念
   - 技术选型
   - 目录结构

2. **详细实现文档**：[detailed/README.md](detailed/README.md)
   - [API驱动开发](detailed/api_driven.md) - API驱动开发的详细实现和示例代码
   - 包含代码示例的详细技术文档

3. **应用文档**：[apps/README.md](apps/README.md)
   - 路径：`packages/server/src/apps/{应用名}/docs/design.md`
   - 示例：`packages/server/src/apps/feieryun/docs/design.md`

4. **API文档**：[api/README.md](api/README.md)
   - API接口详细说明
   - 接口参数与返回值
   - 错误码说明

5. **贡献指南**：[CONTRIBUTING.md](CONTRIBUTING.md)
   - 文档贡献流程
   - Markdown格式规范
   - 文档编写原则

## 文档开发

本项目使用 [VitePress](https://vitepress.dev/) 生成文档网站。

```bash
# 启动文档开发服务器
npm run docs:dev

# 构建文档网站
npm run docs:build
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