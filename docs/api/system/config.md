# 配置接口

本文档详细说明DRYcore框架的配置接口，用于获取菜单、站点等配置信息。

## 获取菜单配置

### 接口说明

获取当前用户可访问的菜单配置

- **路径**: `/api/config/menu`
- **方法**: `GET`
- **权限**: 需要登录

### 请求参数

无

### 响应数据

```json
{
  "code": 0,
  "message": "操作成功",
  "data": {
    "menus": [
      {
        "key": "dashboard",
        "name": "仪表盘",
        "icon": "DashboardOutlined",
        "path": "/dashboard",
        "children": []
      },
      {
        "key": "servers",
        "name": "云服务器",
        "icon": "CloudServerOutlined",
        "path": "/servers",
        "children": [
          {
            "key": "servers-list",
            "name": "服务器列表",
            "path": "/servers/list"
          },
          {
            "key": "servers-create",
            "name": "创建服务器",
            "path": "/servers/create"
          }
        ]
      }
    ]
  }
}
```

## 获取站点配置

### 接口说明

获取站点的基本配置信息

- **路径**: `/api/config/site`
- **方法**: `GET`
- **权限**: 无需登录

### 请求参数

无

### 响应数据

```json
{
  "code": 0,
  "message": "操作成功",
  "data": {
    "siteName": "DRYcore云平台",
    "logo": "/images/logo.png",
    "contact": {
      "email": "support@example.com",
      "phone": "400-123-4567"
    },
    "copyright": "© 2024 DRYcore",
    "beian": "沪ICP备xxxxxxxx号-1",
    "theme": {
      "primaryColor": "#1890ff",
      "layout": "side"
    }
  }
}
```

## 获取用户配置

### 接口说明

获取当前用户的个性化配置

- **路径**: `/api/config/user`
- **方法**: `GET`
- **权限**: 需要登录

### 请求参数

无

### 响应数据

```json
{
  "code": 0,
  "message": "操作成功",
  "data": {
    "theme": "light",
    "language": "zh-CN",
    "notifications": {
      "email": true,
      "sms": false,
      "browser": true
    },
    "dashboard": {
      "layout": "grid",
      "widgets": ["usage", "billing", "servers", "domains"]
    }
  }
}
```

## 更新用户配置

### 接口说明

更新当前用户的个性化配置

- **路径**: `/api/config/user`
- **方法**: `POST`
- **权限**: 需要登录

### 请求参数

```json
{
  "theme": "dark",
  "language": "en-US",
  "notifications": {
    "email": true,
    "sms": true,
    "browser": true
  },
  "dashboard": {
    "layout": "list",
    "widgets": ["billing", "servers", "domains", "storage"]
  }
}
```

### 响应数据

```json
{
  "code": 0,
  "message": "配置已更新",
  "data": {
    "theme": "dark",
    "language": "en-US",
    "notifications": {
      "email": true,
      "sms": true,
      "browser": true
    },
    "dashboard": {
      "layout": "list",
      "widgets": ["billing", "servers", "domains", "storage"]
    }
  }
}
```

## 错误码

| 错误码 | 描述 |
|-------|------|
| 0 | 成功 |
| 1001 | 未登录 |
| 1003 | 配置不存在 |
| 1005 | 参数格式不正确 | 