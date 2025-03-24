# DRYcore 应用文档索引

本索引提供对各应用文档的快速访问。所有应用的详细文档都位于各自的应用目录中，便于与应用源码的关联性。

## 应用文档路径

各应用文档统一位于：

```
packages/server/src/apps/{应用名}/docs/design.md
```

## 已有应用文档

| 应用名 | 文档路径 | 说明 |
|-------|---------|------|
| feieryun | [packages/server/src/apps/feieryun/docs/design.md](../../packages/server/src/apps/feieryun/docs/design.md) | 飞儿云业务系统 |

## 添加新应用文档

创建新应用时，请按照以下步骤添加文档：

1. 在应用目录下创建 `docs` 目录：
   ```bash
   mkdir -p packages/server/src/apps/your-app/docs
   ```

2. 创建应用设计文档：
   ```bash
   touch packages/server/src/apps/your-app/docs/design.md
   ```

3. 在文档中至少包含以下内容：
   ```markdown
   # 应用名称
   
   ## 应用概述
   简要描述应用的目的和功能
   
   ## 业务模块
   列出主要业务模块
   
   ## 数据模型
   描述核心数据模型和关系
   
   ## 应用配置
   特定于应用的配置说明
   ```

4. 更新本索引文件，将新应用添加到已有应用列表中

## 应用文档与框架文档的关系

- **框架文档**：描述整个DRYcore框架的设计理念、架构和通用功能
- **应用文档**：描述特定应用的业务逻辑、数据模型和特有配置

应用开发者应先熟悉框架文档，再参考应用文档进行具体实现。 