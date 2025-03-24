# 配置驱动开发

## 概述

配置驱动开发（Configuration-Driven Development）是 DRYcore 框架的核心设计理念，它通过集中的配置文件定义系统行为，而非分散在代码各处的硬编码逻辑。这种方式能显著减少重复代码，提高开发效率，降低维护成本。

## 基本原则

配置驱动开发遵循以下核心原则：

1. **声明式定义** - 通过配置文件声明系统结构和行为
2. **中央集权** - 配置集中管理，易于查找和修改
3. **代码生成** - 基于配置自动生成重复性代码
4. **约定优于配置** - 建立合理的默认行为，只需配置特殊情况
5. **单一数据源** - 配置作为唯一真实来源(Single Source of Truth)

## 配置文件

DRYcore 中的配置文件主要包括：

### 1. 数据模型配置

使用 Prisma Schema 定义数据模型：

```prisma
// schema.prisma
model User {
  id        Int      @id @default(autoincrement())
  email     String   @unique
  name      String?
  role      Role     @default(USER)
  posts     Post[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Post {
  id        Int      @id @default(autoincrement())
  title     String
  content   String?
  published Boolean  @default(false)
  author    User     @relation(fields: [authorId], references: [id])
  authorId  Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

enum Role {
  USER
  ADMIN
}
```

### 2. API 配置

定义 API 路由和行为的配置：

```typescript
// api-config.ts
export const apiConfig = {
  endpoints: {
    users: {
      model: 'User',
      operations: ['create', 'read', 'update', 'delete', 'list'],
      fields: {
        // 可见字段
        visible: ['id', 'email', 'name', 'role', 'createdAt'],
        // 可搜索字段
        searchable: ['email', 'name'],
        // 可排序字段
        sortable: ['createdAt', 'name'],
        // 可过滤字段
        filterable: ['role', 'createdAt']
      },
      auth: {
        // 权限控制
        create: ['ADMIN'],
        read: ['USER', 'ADMIN'],
        update: ['ADMIN'],
        delete: ['ADMIN'],
        list: ['USER', 'ADMIN']
      },
      validation: {
        // 字段验证规则
        email: { required: true, type: 'email' },
        name: { required: true, minLength: 2, maxLength: 50 },
        role: { required: true, enum: ['USER', 'ADMIN'] }
      },
      hooks: {
        // 自定义钩子
        beforeCreate: 'hashPassword',
        afterCreate: 'sendWelcomeEmail'
      }
    },
    // 其他端点配置...
  }
};
```

### 3. 菜单配置

定义应用菜单结构：

```typescript
// menu-config.ts
export const menuConfig = {
  admin: [
    {
      key: 'dashboard',
      label: '控制台',
      icon: 'dashboard',
      path: '/admin/dashboard'
    },
    {
      key: 'users',
      label: '用户管理',
      icon: 'user',
      path: '/admin/users',
      children: [
        {
          key: 'user-list',
          label: '用户列表',
          path: '/admin/users/list'
        },
        {
          key: 'user-roles',
          label: '角色管理',
          path: '/admin/users/roles'
        }
      ]
    },
    // 其他菜单项...
  ],
  client: [
    // 客户端菜单配置...
  ]
};
```

### 4. 权限配置

定义权限规则：

```typescript
// permission-config.ts
export const permissionConfig = {
  roles: {
    ADMIN: {
      description: '系统管理员',
      permissions: ['*'] // 所有权限
    },
    MANAGER: {
      description: '管理人员',
      permissions: [
        'users:read',
        'users:list',
        'posts:*' // 所有文章相关权限
      ]
    },
    USER: {
      description: '普通用户',
      permissions: [
        'users:self:read',
        'users:self:update',
        'posts:read',
        'posts:list',
        'posts:self:create',
        'posts:self:update',
        'posts:self:delete'
      ]
    }
  }
};
```

## 代码生成

DRYcore 基于配置生成多种代码：

### 1. 数据库操作代码

基于 Prisma Schema 生成数据库操作代码：

```typescript
// 自动生成的代码
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const UserService = {
  // 创建用户
  async create(data) {
    return prisma.user.create({ data });
  },
  
  // 根据ID获取用户
  async findById(id) {
    return prisma.user.findUnique({ where: { id } });
  },
  
  // 更新用户
  async update(id, data) {
    return prisma.user.update({
      where: { id },
      data
    });
  },
  
  // 删除用户
  async delete(id) {
    return prisma.user.delete({ where: { id } });
  },
  
  // 查询用户列表
  async findMany(args) {
    return prisma.user.findMany(args);
  }
};
```

### 2. API 路由代码

基于 API 配置生成路由代码：

```typescript
// 自动生成的代码
import { Hono } from 'hono';
import { UserService } from '../services/user.service';
import { validateUserInput } from '../validators/user.validator';
import { requireAuth, checkPermission } from '../middlewares/auth';

const app = new Hono();

// 创建用户
app.post('/api/users', 
  requireAuth, 
  checkPermission('users:create'), 
  async (c) => {
    const data = await c.req.json();
    const validationResult = validateUserInput(data);
    
    if (!validationResult.success) {
      return c.json({ error: validationResult.errors }, 400);
    }
    
    const user = await UserService.create(data);
    return c.json({ user }, 201);
  }
);

// 获取用户
app.get('/api/users/:id', 
  requireAuth, 
  checkPermission('users:read'), 
  async (c) => {
    const id = parseInt(c.req.param('id'));
    const user = await UserService.findById(id);
    
    if (!user) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    return c.json({ user });
  }
);

// 更多路由...

export { app };
```

### 3. 前端表单代码

基于 API 配置生成前端表单：

```tsx
// 自动生成的代码
import React from 'react';
import { Form, Input, Select, Button } from 'antd';

const UserForm = ({ initialValues, onSubmit, loading }) => {
  const [form] = Form.useForm();
  
  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
      onFinish={onSubmit}
    >
      <Form.Item
        name="email"
        label="邮箱"
        rules={[
          { required: true, message: '请输入邮箱' },
          { type: 'email', message: '请输入有效的邮箱地址' }
        ]}
      >
        <Input placeholder="请输入邮箱" />
      </Form.Item>
      
      <Form.Item
        name="name"
        label="姓名"
        rules={[
          { required: true, message: '请输入姓名' },
          { min: 2, message: '姓名长度至少为2个字符' },
          { max: 50, message: '姓名长度不能超过50个字符' }
        ]}
      >
        <Input placeholder="请输入姓名" />
      </Form.Item>
      
      <Form.Item
        name="role"
        label="角色"
        rules={[{ required: true, message: '请选择角色' }]}
      >
        <Select placeholder="请选择角色">
          <Select.Option value="USER">普通用户</Select.Option>
          <Select.Option value="ADMIN">管理员</Select.Option>
        </Select>
      </Form.Item>
      
      <Form.Item>
        <Button type="primary" htmlType="submit" loading={loading}>
          提交
        </Button>
      </Form.Item>
    </Form>
  );
};

export default UserForm;
```

## 使用方法

### 1. 创建数据模型

1. 在 `prisma/schema.prisma` 中定义数据模型
2. 运行 `pnpm prisma:generate` 生成 Prisma 客户端
3. 运行 `pnpm prisma:migrate` 应用数据库变更

### 2. 配置 API

1. 在 `src/config/api` 目录下创建或修改 API 配置文件
2. 运行 `pnpm generate` 生成相应的服务层和路由代码

### 3. 配置 UI

1. 在 `src/config/ui` 目录下创建或修改 UI 配置文件
2. 运行 `pnpm generate:client` 生成前端代码

### 4. 添加自定义逻辑

对于需要特殊处理的情况，可以通过以下方式添加自定义逻辑：

```typescript
// 添加自定义钩子
// src/hooks/user.hooks.ts
export const hashPassword = async (data) => {
  // 密码哈希处理
  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }
  return data;
};

export const sendWelcomeEmail = async (user) => {
  // 发送欢迎邮件
  await emailService.send({
    to: user.email,
    subject: '欢迎加入',
    template: 'welcome',
    data: { name: user.name }
  });
  return user;
};
```

## 最佳实践

1. **保持配置简洁**
   - 配置文件应当清晰易读
   - 使用合理的默认值减少配置量
   - 分类组织配置文件

2. **遵循渐进增强原则**
   - 从基础配置开始
   - 根据需要逐步添加复杂配置
   - 自定义代码作为配置的补充，而非替代

3. **配置版本控制**
   - 所有配置都应纳入版本控制
   - 配置变更应当有明确的审核流程
   - 记录配置变更历史

4. **测试配置**
   - 为配置文件编写测试
   - 验证生成的代码符合预期
   - 确保配置变更不会破坏现有功能

## 配置驱动与代码生成的区别

配置驱动开发与简单的代码生成有本质区别：

| 配置驱动开发 | 简单代码生成 |
|----------|----------|
| 配置作为系统的核心 | 代码生成只是辅助工具 |
| 系统运行时仍依赖配置 | 生成后的代码独立运行 |
| 配置变更可即时影响系统行为 | 配置变更需要重新生成代码 |
| 强调声明式编程 | 通常生成命令式代码 |
| 关注"做什么" | 关注"怎么做" |

## 小结

配置驱动开发是 DRYcore 框架的核心理念，通过集中化的配置和自动化的代码生成，大幅降低了开发工作量和维护成本。它使开发者可以专注于业务逻辑，而非重复的样板代码，从而实现真正的"不重复自己"(Don't Repeat Yourself)原则。 