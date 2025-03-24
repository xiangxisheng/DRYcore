# DRYcore API 文档

本节包含DRYcore框架的API接口文档，详细说明各接口的用法、参数和返回值。

## 接口分类

### 系统接口

| 接口名称 | 描述 | 文档链接 |
|---------|------|---------|
| 配置接口 | 获取菜单、站点等配置 | [查看文档](./system/config.md) |
| 用户接口 | 用户登录、注册、权限 | [查看文档](./system/user.md) |
| 权限接口 | 权限和角色管理 | [查看文档](./system/permission.md) |
| UI配置 | 前端模块配置接口 | [查看文档](./system/ui.md) |

### 飞儿云应用接口

| 接口名称 | 描述 | 文档链接 |
|---------|------|---------|
| 云服务器 | 服务器的创建、管理、监控 | [查看文档](./feieryun/server.md) |
| 域名管理 | 域名注册、解析、转移 | [查看文档](./feieryun/domain.md) |
| 对象存储 | 文件上传、存储桶管理 | [查看文档](./feieryun/storage.md) |
| 数据库 | 数据库创建、管理、备份 | [查看文档](./feieryun/database.md) |

## API 约定

### 请求格式

所有API请求使用JSON格式：

```json
{
  "param1": "value1",
  "param2": "value2"
}
```

### 响应格式

所有API响应遵循统一的JSON格式：

```json
{
  "code": 0,         // 0表示成功，非0表示错误
  "message": "操作成功", // 操作结果描述
  "data": {          // 返回的数据
    "key1": "value1",
    "key2": "value2"
  }
}
```

### 错误码说明

| 错误码 | 描述 |
|-------|------|
| 0 | 成功 |
| 1000 | 参数错误 |
| 1001 | 未授权 |
| 1002 | 禁止访问 |
| 1003 | 资源不存在 |
| 2000 | 系统内部错误 |

## 前端模块配置

DRYcore使用模块化的前端架构，前端代码作为通用模块包被动态加载，而不是通过代码生成。API配置决定了哪些模块被加载以及如何组合它们：

```json
{
  "modules": ["data-table", "form", "detail-view"],
  "layouts": ["admin", "client"],
  "components": {
    "form": {
      "fields": ["input", "select", "date-picker"]
    }
  }
}
```

## API文档生成

所有API文档通过Swagger自动生成，并使用VitePress进行展示。开发者在编写API时，应当按照规范添加注释，以便自动生成文档。

接口文档实时更新地址：`http://你的域名/api/docs` 