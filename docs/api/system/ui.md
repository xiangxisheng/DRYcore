# UI配置接口

本文档详细说明DRYcore框架的UI配置接口，用于前端模块动态加载和组装。

## 获取UI配置

### 接口说明

获取当前用户可访问的UI模块配置

- **路径**: `/api/config/ui`
- **方法**: `GET`
- **权限**: 需要登录

### 请求参数

| 参数名 | 类型 | 必填 | 描述 |
|-------|------|------|------|
| type | string | 否 | UI类型，默认为"default" |
| module | string | 否 | 模块名称，不指定则返回所有模块 |

### 响应数据

```json
{
  "code": 0,
  "message": "操作成功",
  "data": {
    "modules": {
      "user": {
        "type": "entity",
        "components": ["list", "form", "detail"],
        "config": {
          "list": {
            "columns": [
              { "field": "id", "title": "ID", "width": 80 },
              { "field": "username", "title": "用户名", "width": 150 },
              { "field": "email", "title": "邮箱", "width": 200 },
              { "field": "createdAt", "title": "创建时间", "width": 180 }
            ],
            "operations": ["view", "edit", "delete"]
          },
          "form": {
            "groups": [
              {
                "title": "基本信息",
                "fields": [
                  { "field": "username", "label": "用户名", "component": "Input" },
                  { "field": "password", "label": "密码", "component": "Password" },
                  { "field": "email", "label": "邮箱", "component": "Input" }
                ]
              },
              {
                "title": "角色分配",
                "fields": [
                  { "field": "roles", "label": "角色", "component": "Select", "props": { "multiple": true } }
                ]
              }
            ]
          },
          "detail": {
            "sections": [
              {
                "title": "基本信息",
                "fields": [
                  { "field": "username", "label": "用户名" },
                  { "field": "email", "label": "邮箱" },
                  { "field": "createdAt", "label": "创建时间" }
                ]
              }
            ]
          }
        }
      }
    },
    "layouts": {
      "admin": {
        "header": { "height": 64, "components": ["logo", "menu", "user"] },
        "sider": { "width": 200, "collapsible": true },
        "content": { "padding": "24px" },
        "footer": { "height": 48, "components": ["copyright"] }
      }
    },
    "components": {
      "form": {
        "fields": ["input", "select", "date-picker", "switch", "radio", "checkbox", "upload"],
        "layout": "vertical",
        "labelWidth": 120
      },
      "table": {
        "pagination": { "pageSize": 10, "showSizeChanger": true },
        "bordered": true,
        "size": "middle"
      }
    }
  }
}
```

## 前端模块动态加载流程

UI配置接口与前端模块动态加载的关系说明：

1. 前端初始化时，请求UI配置接口获取配置
2. 根据配置动态加载所需模块（使用动态导入）
3. 使用加载的模块组装界面
4. 当配置变化时自动更新模块组合

### 实现示例

```typescript
// 动态加载模块
async function loadUIModules(config) {
  const modules = {};
  for (const [key, value] of Object.entries(config.modules)) {
    modules[key] = await import(`@/modules/${key}`).default;
  }
  return modules;
}

// 组装UI
function assembleUI(modules, config) {
  return Object.keys(modules).map(key => {
    const Module = modules[key];
    return <Module key={key} config={config.modules[key].config} />;
  });
}

// 页面组件
function Page() {
  const [config, setConfig] = useState(null);
  const [modules, setModules] = useState({});
  
  useEffect(() => {
    // 获取UI配置
    fetch('/api/config/ui')
      .then(res => res.json())
      .then(data => setConfig(data.data));
  }, []);
  
  useEffect(() => {
    if (config) {
      // 动态加载模块
      loadUIModules(config).then(setModules);
    }
  }, [config]);
  
  if (!config || Object.keys(modules).length === 0) {
    return <Loading />;
  }
  
  return (
    <Layout config={config.layouts.admin}>
      {assembleUI(modules, config)}
    </Layout>
  );
}
```

## 自定义UI配置

### 接口说明

更新当前用户的自定义UI配置

- **路径**: `/api/config/ui/custom`
- **方法**: `POST`
- **权限**: 需要登录

### 请求参数

```json
{
  "layouts": {
    "admin": {
      "sider": { "collapsed": true }
    }
  },
  "components": {
    "table": {
      "pagination": { "pageSize": 20 }
    }
  }
}
```

### 响应数据

```json
{
  "code": 0,
  "message": "UI配置已更新",
  "data": {
    "layouts": {
      "admin": {
        "sider": { "collapsed": true }
      }
    },
    "components": {
      "table": {
        "pagination": { "pageSize": 20 }
      }
    }
  }
}
```

## 前端模块与后端代码生成的区别

DRYcore框架在代码生成策略上的区别：

| 方面 | 后端代码 | 前端代码 |
|-----|---------|---------|
| 方法 | 代码生成 | 模块动态加载 |
| 时机 | 开发/构建时 | 运行时 |
| 灵活性 | 静态生成 | 动态组合 |
| 复用性 | 生成的代码独立 | 模块高度复用 |
| 维护 | 需重新生成 | 只更新配置 |
| 性能 | 编译优化 | 按需加载 |

这种方法充分体现了DRY原则，前端通过模块复用而非代码生成实现高度灵活性，同时保持了代码的一致性和可维护性。 