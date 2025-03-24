# API驱动开发实现详解

本文档详细说明DRYcore框架中API驱动开发的具体实现方式，作为[设计概述](../design/overview.md)的补充文档。

## 数据模型定义详解

DRYcore使用Prisma Schema作为数据模型定义的单一来源。这一节详细说明数据模型的定义和转换过程。

### Prisma Schema示例

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        Int      @id @default(autoincrement())
  username  String   @unique
  password  String
  email     String?  @unique
  roles     Role[]   @relation("UserRoles")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Role {
  id          Int          @id @default(autoincrement())
  name        String       @unique
  description String?
  users       User[]       @relation("UserRoles")
  permissions Permission[]
}

model Permission {
  id          Int     @id @default(autoincrement())
  name        String  @unique
  description String?
  roles       Role[]
}
```

### Drizzle代码生成

Prisma Schema定义完成后，通过代码生成器转换为Drizzle ORM代码：

```typescript
// src/generators/drizzle.ts
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

async function generateDrizzleCode() {
  try {
    console.log('开始生成Drizzle代码...');
    
    // 1. 生成Prisma客户端
    execSync('npx prisma generate', { stdio: 'inherit' });
    
    // 2. 读取Prisma模型定义
    const prismaSchema = fs.readFileSync(
      path.resolve(__dirname, '../../prisma/schema.prisma'), 
      'utf-8'
    );
    
    // 3. 解析Prisma模型并转换为Drizzle模式
    const drizzleSchema = convertPrismaTodrizzle(prismaSchema);
    
    // 4. 写入Drizzle模式文件
    fs.writeFileSync(
      path.resolve(__dirname, '../../drizzle/generated/schema.ts'),
      drizzleSchema
    );
    
    console.log('Drizzle代码生成完成！');
  } catch (error) {
    console.error('Drizzle代码生成失败:', error);
    process.exit(1);
  }
}

// 执行生成
generateDrizzleCode();
```

## API配置详解

API配置是DRYcore框架实现零重复代码的关键，通过声明式配置定义API行为：

### API配置示例

```typescript
// src/apps/feieryun/admin/config/api-config.ts
import { defineApiConfig } from '@core/api-config';
import { User, Role, Permission } from '@drizzle/generated/schema';

export const userApiConfig = defineApiConfig({
  model: User,
  endpoints: {
    list: {
      path: '/users',
      method: 'GET',
      query: {
        filters: ['username', 'email', 'createdAt'],
        sort: ['username', 'createdAt', 'updatedAt'],
        pagination: true,
        defaultPageSize: 10
      },
      permissions: ['user:view']
    },
    detail: {
      path: '/users/:id',
      method: 'GET',
      params: {
        id: { type: 'number', required: true }
      },
      permissions: ['user:view']
    },
    create: {
      path: '/users',
      method: 'POST',
      body: {
        username: { type: 'string', required: true },
        password: { type: 'string', required: true },
        email: { type: 'string', required: false },
        roles: { type: 'relation', required: false }
      },
      permissions: ['user:create']
    },
    update: {
      path: '/users/:id',
      method: 'PUT',
      params: {
        id: { type: 'number', required: true }
      },
      body: {
        username: { type: 'string', required: false },
        password: { type: 'string', required: false },
        email: { type: 'string', required: false },
        roles: { type: 'relation', required: false }
      },
      permissions: ['user:update']
    },
    delete: {
      path: '/users/:id',
      method: 'DELETE',
      params: {
        id: { type: 'number', required: true }
      },
      permissions: ['user:delete']
    }
  },
  ui: {
    list: {
      columns: [
        { field: 'id', title: 'ID', width: 80 },
        { field: 'username', title: '用户名', width: 150 },
        { field: 'email', title: '邮箱', width: 200 },
        { field: 'createdAt', title: '创建时间', width: 180 }
      ],
      operations: ['view', 'edit', 'delete']
    },
    form: {
      groups: [
        {
          title: '基本信息',
          fields: [
            { field: 'username', label: '用户名', component: 'Input' },
            { field: 'password', label: '密码', component: 'Password' },
            { field: 'email', label: '邮箱', component: 'Input' }
          ]
        },
        {
          title: '角色分配',
          fields: [
            { field: 'roles', label: '角色', component: 'Select', props: { multiple: true } }
          ]
        }
      ]
    }
  }
});
```

## 路由自动注册

DRYcore框架基于API配置自动注册路由，代码示例如下：

```typescript
// src/core/routes/register-api-routes.ts
import { Hono } from 'hono';
import { ApiConfig } from '@core/types/api-config';
import { generateRouteHandler } from '@core/services/route-handler';

export function registerApiRoutes(app: Hono, apiConfig: ApiConfig): void {
  const { model, endpoints } = apiConfig;
  
  // 遍历所有端点配置
  for (const [key, endpoint] of Object.entries(endpoints)) {
    const { path, method, permissions } = endpoint;
    
    // 生成路由处理器
    const handler = generateRouteHandler(model, endpoint);
    
    // 注册路由
    switch (method) {
      case 'GET':
        app.get(path, handler);
        break;
      case 'POST':
        app.post(path, handler);
        break;
      case 'PUT':
        app.put(path, handler);
        break;
      case 'DELETE':
        app.delete(path, handler);
        break;
      default:
        console.warn(`不支持的HTTP方法: ${method}`);
    }
    
    console.log(`已注册API路由: ${method} ${path}`);
  }
}
```

## 前端模块动态加载

DRYcore通过API配置动态加载前端组件，实现零重复代码：

```tsx
// src/core/services/component-loader.tsx
import React, { lazy, Suspense } from 'react';
import { ApiConfig } from '@core/types/api-config';
import { Loading } from '@core/components/Loading';

// 通用组件库
const components = {
  // 列表相关组件
  DataTable: lazy(() => import('@core/components/DataTable')),
  FilterForm: lazy(() => import('@core/components/FilterForm')),
  
  // 表单相关组件
  Form: lazy(() => import('@core/components/Form')),
  FormGroup: lazy(() => import('@core/components/FormGroup')),
  
  // 表单控件
  Input: lazy(() => import('@core/components/Input')),
  Password: lazy(() => import('@core/components/Password')),
  Select: lazy(() => import('@core/components/Select')),
  DatePicker: lazy(() => import('@core/components/DatePicker')),
  Upload: lazy(() => import('@core/components/Upload')),
  
  // 布局组件
  Card: lazy(() => import('@core/components/Card')),
  Modal: lazy(() => import('@core/components/Modal')),
  Drawer: lazy(() => import('@core/components/Drawer')),
};

// 加载列表页面组件
export function loadListComponent(apiConfig: ApiConfig) {
  const { model, endpoints, ui } = apiConfig;
  const { list } = ui;
  
  return function ListPage(props) {
    return (
      <Suspense fallback={<Loading />}>
        <components.Card title={`${model.name}列表`}>
          <components.FilterForm 
            filters={endpoints.list.query.filters} 
            {...props} 
          />
          <components.DataTable 
            columns={list.columns}
            operations={list.operations}
            endpoint={endpoints.list.path}
            {...props}
          />
        </components.Card>
      </Suspense>
    );
  };
}

// 加载表单页面组件
export function loadFormComponent(apiConfig: ApiConfig) {
  const { model, endpoints, ui } = apiConfig;
  const { form } = ui;
  
  return function FormPage(props) {
    return (
      <Suspense fallback={<Loading />}>
        <components.Card title={`${props.id ? '编辑' : '新建'}${model.name}`}>
          <components.Form 
            endpoint={props.id ? endpoints.update.path : endpoints.create.path}
            method={props.id ? 'PUT' : 'POST'}
            {...props}
          >
            {form.groups.map(group => (
              <components.FormGroup key={group.title} title={group.title}>
                {group.fields.map(field => {
                  const Component = components[field.component];
                  return (
                    <Component 
                      key={field.field}
                      name={field.field}
                      label={field.label}
                      {...field.props}
                    />
                  );
                })}
              </components.FormGroup>
            ))}
          </components.Form>
        </components.Card>
      </Suspense>
    );
  };
}
```

## 路径别名最佳实践

基于`overview.md`中定义的路径别名，下面是实际使用的最佳实践示例：

### tsconfig.json配置

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@core/*": ["src/core/*"],
      "@config/*": ["src/config/*"],
      "@types/*": ["src/types/*"],
      "@utils/*": ["src/utils/*"],
      "@apps/*": ["src/apps/*"],
      "@generators/*": ["src/generators/*"]
    }
  }
}
```

### 实际导入示例

```typescript
// 导入核心功能
import { registerApiRoutes } from '@core/routes/register-api-routes';
import { authMiddleware } from '@core/middlewares/auth';

// 导入配置
import { domainConfig } from '@config/domain';
import { serverConfig } from '@config/server';

// 导入应用特定配置
import { userApiConfig } from '@apps/feieryun/admin/config/api-config';

// 使用工具函数
import { formatDate } from '@utils/date';
```

## 总结

DRYcore框架的API驱动开发遵循"Don't Repeat Yourself"原则，通过Prisma Schema定义数据模型，Drizzle ORM实现数据访问，API配置声明接口行为，自动生成后端代码并动态加载前端通用模块，真正做到零重复代码、配置驱动开发。 