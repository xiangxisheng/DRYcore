# 后端开发指南

## 概述

DRYcore后端架构采用模块化、可扩展的设计，基于Node.js和TypeScript构建。本文档提供了后端开发的详细指南，包括架构设计、API开发、数据库交互、认证授权、测试策略和部署方案等方面。

## 目录

- [架构概览](./architecture.md) - 后端架构设计与技术栈
- [API设计](./api-design.md) - RESTful API设计原则与最佳实践
- [数据库交互](./database.md) - 数据库模型、查询与优化
- [认证与授权](./auth.md) - 用户认证、JWT和权限控制
- [中间件](./middleware.md) - Express中间件开发与使用
- [错误处理](./error-handling.md) - 统一错误处理策略
- [日志管理](./logging.md) - 应用日志记录与监控
- [缓存策略](./caching.md) - 数据缓存与性能优化
- [任务队列](./queues.md) - 异步任务处理与调度
- [测试策略](./testing.md) - 单元测试、集成测试与测试最佳实践
- [部署配置](./deployment.md) - 环境配置与部署流程

## 后端技术栈

DRYcore后端采用以下核心技术：

- **Node.js** - JavaScript运行环境
- **TypeScript** - 类型安全的JavaScript超集
- **Express** - Web应用框架
- **Prisma** - 类型安全的ORM
- **PostgreSQL/MySQL** - 关系型数据库
- **Redis** - 缓存与会话存储
- **JWT** - 基于令牌的身份验证
- **Jest** - 测试框架
- **Supertest** - API测试工具
- **Winston** - 日志记录
- **Bull** - 队列管理

## 快速入门

### 后端开发环境设置

1. 确保已安装Node.js (v16.0.0+)、PNPM (v8.0.0+)和数据库(PostgreSQL/MySQL)
2. 克隆项目并安装依赖：

```bash
# 克隆项目
git clone https://github.com/yourusername/drycore.git
cd drycore

# 安装依赖
pnpm install

# 设置环境变量
cp packages/server/.env.example packages/server/.env
```

3. 编辑`.env`文件，设置数据库连接和其他环境变量

4. 初始化数据库：

```bash
cd packages/server
pnpm prisma migrate dev
```

5. 启动开发服务器：

```bash
# 启动后端开发服务器
pnpm dev:server
```

### 创建新API端点

在DRYcore中创建API端点的基本步骤：

1. 定义数据模型（如果需要）：

```prisma
// packages/server/prisma/schema.prisma
model Task {
  id          Int      @id @default(autoincrement())
  title       String
  description String?
  status      String   @default("PENDING")
  dueDate     DateTime?
  userId      Int
  user        User     @relation(fields: [userId], references: [id])
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

2. 创建服务类：

```typescript
// packages/server/src/services/task.service.ts
import { prisma } from '../lib/prisma';
import { CreateTaskDto, UpdateTaskDto } from '../dtos/task.dto';

export class TaskService {
  // 获取用户所有任务
  async getUserTasks(userId: number) {
    return prisma.task.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  // 获取单个任务
  async getTaskById(id: number, userId: number) {
    return prisma.task.findFirst({
      where: { id, userId },
    });
  }

  // 创建任务
  async createTask(data: CreateTaskDto, userId: number) {
    return prisma.task.create({
      data: {
        ...data,
        userId,
      },
    });
  }

  // 更新任务
  async updateTask(id: number, data: UpdateTaskDto, userId: number) {
    // 先验证任务是否属于该用户
    const task = await this.getTaskById(id, userId);
    
    if (!task) {
      throw new Error('Task not found or access denied');
    }
    
    return prisma.task.update({
      where: { id },
      data,
    });
  }

  // 删除任务
  async deleteTask(id: number, userId: number) {
    // 先验证任务是否属于该用户
    const task = await this.getTaskById(id, userId);
    
    if (!task) {
      throw new Error('Task not found or access denied');
    }
    
    return prisma.task.delete({
      where: { id },
    });
  }
}
```

3. 创建数据传输对象(DTO)：

```typescript
// packages/server/src/dtos/task.dto.ts
import { IsNotEmpty, IsString, IsOptional, IsDate, IsEnum } from 'class-validator';

export class CreateTaskDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(['PENDING', 'IN_PROGRESS', 'COMPLETED'])
  status?: string;

  @IsOptional()
  @IsDate()
  dueDate?: Date;
}

export class UpdateTaskDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(['PENDING', 'IN_PROGRESS', 'COMPLETED'])
  status?: string;

  @IsOptional()
  @IsDate()
  dueDate?: Date;
}
```

4. 创建控制器：

```typescript
// packages/server/src/controllers/task.controller.ts
import { Request, Response } from 'express';
import { TaskService } from '../services/task.service';
import { CreateTaskDto, UpdateTaskDto } from '../dtos/task.dto';
import { validateDto } from '../utils/validate-dto';

export class TaskController {
  private taskService = new TaskService();

  // 获取用户所有任务
  async getUserTasks(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const tasks = await this.taskService.getUserTasks(userId);
      
      return res.status(200).json({
        success: true,
        data: tasks,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: '获取任务失败',
      });
    }
  }

  // 获取单个任务
  async getTaskById(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const taskId = Number(req.params.id);
      
      if (isNaN(taskId)) {
        return res.status(400).json({
          success: false,
          error: '无效的任务ID',
        });
      }
      
      const task = await this.taskService.getTaskById(taskId, userId);
      
      if (!task) {
        return res.status(404).json({
          success: false,
          error: '任务未找到',
        });
      }
      
      return res.status(200).json({
        success: true,
        data: task,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: '获取任务失败',
      });
    }
  }

  // 创建任务
  async createTask(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const createTaskDto = req.body as CreateTaskDto;
      
      // 验证请求数据
      const errors = await validateDto(CreateTaskDto, createTaskDto);
      
      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          errors,
        });
      }
      
      const task = await this.taskService.createTask(createTaskDto, userId);
      
      return res.status(201).json({
        success: true,
        data: task,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: '创建任务失败',
      });
    }
  }

  // 更新任务
  async updateTask(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const taskId = Number(req.params.id);
      const updateTaskDto = req.body as UpdateTaskDto;
      
      if (isNaN(taskId)) {
        return res.status(400).json({
          success: false,
          error: '无效的任务ID',
        });
      }
      
      // 验证请求数据
      const errors = await validateDto(UpdateTaskDto, updateTaskDto);
      
      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          errors,
        });
      }
      
      try {
        const task = await this.taskService.updateTask(taskId, updateTaskDto, userId);
        
        return res.status(200).json({
          success: true,
          data: task,
        });
      } catch (error) {
        return res.status(404).json({
          success: false,
          error: '任务未找到或无权访问',
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: '更新任务失败',
      });
    }
  }

  // 删除任务
  async deleteTask(req: Request, res: Response) {
    try {
      const userId = req.user.id;
      const taskId = Number(req.params.id);
      
      if (isNaN(taskId)) {
        return res.status(400).json({
          success: false,
          error: '无效的任务ID',
        });
      }
      
      try {
        await this.taskService.deleteTask(taskId, userId);
        
        return res.status(204).send();
      } catch (error) {
        return res.status(404).json({
          success: false,
          error: '任务未找到或无权访问',
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: '删除任务失败',
      });
    }
  }
}
```

5. 定义路由：

```typescript
// packages/server/src/routes/task.routes.ts
import { Router } from 'express';
import { TaskController } from '../controllers/task.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

export const taskRouter = Router();
const taskController = new TaskController();

// 所有任务路由都需要认证
taskRouter.use(authMiddleware);

// 获取用户所有任务
taskRouter.get(
  '/',
  taskController.getUserTasks.bind(taskController)
);

// 获取单个任务
taskRouter.get(
  '/:id',
  taskController.getTaskById.bind(taskController)
);

// 创建任务
taskRouter.post(
  '/',
  taskController.createTask.bind(taskController)
);

// 更新任务
taskRouter.put(
  '/:id',
  taskController.updateTask.bind(taskController)
);

// 删除任务
taskRouter.delete(
  '/:id',
  taskController.deleteTask.bind(taskController)
);
```

6. 注册路由：

```typescript
// packages/server/src/app.ts
import express from 'express';
import { taskRouter } from './routes/task.routes';

// ... 其他导入和中间件

// 注册路由
app.use('/api/tasks', taskRouter);

// ... 错误处理和服务器启动
```

### API测试示例

```typescript
// packages/server/tests/integration/tasks.test.ts
import request from 'supertest';
import { app } from '../../src/app';
import { prisma } from '../../src/lib/prisma';
import { generateJWT } from '../../src/utils/jwt';

describe('Task API', () => {
  let authToken: string;
  let userId: number;
  let taskId: number;
  
  // 在所有测试前设置
  beforeAll(async () => {
    // 创建测试用户
    const user = await prisma.user.create({
      data: {
        name: '测试用户',
        email: 'test-tasks@example.com',
        password: 'hashedpassword', // 实际中应该哈希密码
        role: 'USER',
      },
    });
    
    userId = user.id;
    
    // 生成认证令牌
    authToken = generateJWT({ id: user.id, email: user.email, role: user.role });
    
    // 创建测试任务
    const task = await prisma.task.create({
      data: {
        title: '测试任务',
        description: '这是一个测试任务',
        userId: user.id,
      },
    });
    
    taskId = task.id;
  });
  
  // 在所有测试后清理
  afterAll(async () => {
    // 清理测试数据
    await prisma.task.deleteMany({
      where: { userId },
    });
    
    await prisma.user.delete({
      where: { id: userId },
    });
    
    // 关闭Prisma连接
    await prisma.$disconnect();
  });
  
  describe('GET /api/tasks', () => {
    test('应该返回用户的所有任务', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0]).toHaveProperty('title', '测试任务');
    });
    
    test('未认证用户应该被拒绝访问', async () => {
      const response = await request(app)
        .get('/api/tasks');
      
      expect(response.status).toBe(401);
    });
  });
  
  describe('POST /api/tasks', () => {
    test('应该创建新任务', async () => {
      const taskData = {
        title: '新任务',
        description: '这是一个新任务',
        status: 'PENDING',
      };
      
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData);
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('title', '新任务');
      expect(response.body.data).toHaveProperty('userId', userId);
    });
    
    test('缺少标题应该返回验证错误', async () => {
      const taskData = {
        description: '缺少标题的任务',
      };
      
      const response = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send(taskData);
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });
  
  // 更多测试...
});
```

## 目录结构

DRYcore后端代码遵循以下目录结构：

```
packages/server/
├── prisma/           # Prisma配置和迁移
│   ├── migrations/   # 数据库迁移文件
│   └── schema.prisma # 数据库模型定义
├── src/
│   ├── app.ts        # 应用入口
│   ├── config/       # 应用配置
│   ├── controllers/  # API控制器
│   ├── dtos/         # 数据传输对象
│   ├── lib/          # 外部库连接 (Prisma, Redis等)
│   ├── middlewares/  # Express中间件
│   ├── routes/       # API路由定义
│   ├── services/     # 业务逻辑服务
│   ├── types/        # TypeScript类型定义
│   └── utils/        # 通用工具函数
├── tests/            # 测试文件
│   ├── unit/         # 单元测试
│   └── integration/  # 集成测试
├── .env              # 环境变量
├── .env.example      # 环境变量示例
├── jest.config.js    # Jest配置
├── package.json      # 包配置
└── tsconfig.json     # TypeScript配置
```

## 开发规范

### 命名约定

- **类**: 使用PascalCase (如`UserService`, `AuthController`)
- **文件**: 使用kebab-case (如`user-service.ts`, `auth-middleware.ts`)
- **变量和函数**: 使用camelCase (如`getUserById`, `validateToken`)
- **常量**: 使用UPPER_SNAKE_CASE (如`JWT_SECRET`, `DEFAULT_TIMEOUT`)
- **路由**: 使用kebab-case (如`/api/user-profiles`, `/api/reset-password`)

### 代码风格

DRYcore后端代码遵循以下代码风格规范：

- 使用ESLint和Prettier保持代码风格一致
- 遵循SOLID原则设计类和模块
- 使用TypeScript类型增强代码可靠性
- 使用依赖注入模式提高测试性
- 使用异步/等待而非回调风格
- 使用描述性命名，避免缩写和单字母变量

## API设计原则

DRYcore API遵循以下设计原则：

1. **REST原则**: 遵循RESTful设计风格
2. **版本控制**: 在URL中包含API版本（如`/api/v1/users`）
3. **一致的响应格式**: 统一的成功和错误响应结构
4. **HTTP状态码**: 适当使用HTTP状态码表示响应状态
5. **查询参数**: 使用查询参数进行过滤、排序和分页
6. **HATEOAS**: 在响应中包含相关资源链接

### 标准响应格式

成功响应：

```json
{
  "success": true,
  "data": { ... },
  "meta": { ... }  // 可选，包含分页信息等元数据
}
```

错误响应：

```json
{
  "success": false,
  "error": "错误消息",
  "errors": [ ... ],  // 可选，详细验证错误列表
  "code": "ERROR_CODE"  // 可选，错误代码
}
```

## 数据库最佳实践

1. **使用迁移**: 使用Prisma迁移管理数据库架构变更
2. **数据验证**: 在应用层验证数据，而不仅依赖数据库约束
3. **事务**: 对相关操作使用事务确保数据一致性
4. **索引**: 为频繁查询的字段创建适当索引
5. **关系**: 正确定义表关系和外键约束
6. **分页**: 实现适当的分页机制，避免大结果集

## 安全最佳实践

1. **输入验证**: 验证所有用户输入，防止注入攻击
2. **认证**: 使用JWT进行无状态认证
3. **授权**: 实现细粒度的权限控制
4. **敏感数据**: 加密存储敏感数据，使用HTTPS传输
5. **速率限制**: 实现API速率限制，防止滥用
6. **CORS**: 配置适当的跨域资源共享策略
7. **依赖安全**: 定期更新和审核依赖包

## 错误处理策略

DRYcore使用集中式错误处理策略：

```typescript
// packages/server/src/middlewares/error.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

// 自定义错误类
export class AppError extends Error {
  statusCode: number;
  code: string;
  
  constructor(message: string, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
  }
}

// 全局错误处理中间件
export function errorMiddleware(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const statusCode = 'statusCode' in err ? err.statusCode : 500;
  const code = 'code' in err ? err.code : 'INTERNAL_ERROR';
  
  // 生产环境下不暴露内部错误细节
  const message = statusCode === 500 && process.env.NODE_ENV === 'production'
    ? '服务器内部错误'
    : err.message;
  
  // 记录错误
  logger.error(`${statusCode} - ${message}`, {
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    stack: err.stack,
  });
  
  // 返回错误响应
  res.status(statusCode).json({
    success: false,
    error: message,
    code,
  });
}
```

## 性能优化技巧

1. **缓存**: 使用Redis缓存频繁访问的数据
2. **查询优化**: 优化数据库查询，仅获取所需字段
3. **批处理**: 使用批处理操作替代多次单个操作
4. **压缩**: 启用响应压缩减少传输数据大小
5. **并行处理**: 使用`Promise.all`并行处理独立任务

## 测试策略

DRYcore后端采用多层次测试策略：

1. **单元测试**: 测试独立函数和类
2. **集成测试**: 测试API和数据库交互
3. **端到端测试**: 测试完整用户流程

测试覆盖率要求：
- 单元测试: 至少80%
- 集成测试: 至少70%
- 端到端测试: 核心流程100%

## 常见问题解答

### Q: 如何处理数据验证?

A: DRYcore使用class-validator进行请求数据验证：

```typescript
// 验证工具函数
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

export async function validateDto(dtoClass: any, obj: any) {
  // 将普通对象转换为类实例
  const dtoObj = plainToInstance(dtoClass, obj);
  
  // 验证对象
  const errors = await validate(dtoObj);
  
  if (errors.length === 0) {
    return [];
  }
  
  // 格式化错误
  return errors.map(error => ({
    property: error.property,
    constraints: error.constraints,
  }));
}
```

### Q: 如何处理环境变量?

A: 使用集中式环境配置：

```typescript
// packages/server/src/config/env.ts
import { z } from 'zod';
import dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// 环境变量验证模式
const envSchema = z.object({
  // 应用
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.string().default('4000'),
  
  // 数据库
  DATABASE_URL: z.string(),
  
  // JWT
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string().default('7d'),
  
  // Redis (可选)
  REDIS_URL: z.string().optional(),
});

// 验证环境变量
const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error('❌ 环境变量验证失败:');
  console.error(result.error.format());
  process.exit(1);
}

// 导出验证后的环境变量
export const env = result.data;

// 环境辅助函数
export const isDev = () => env.NODE_ENV === 'development';
export const isProd = () => env.NODE_ENV === 'production';
export const isTest = () => env.NODE_ENV === 'test';
```

## 相关资源

- [Node.js 官方文档](https://nodejs.org/docs/latest-v16.x/api/)
- [TypeScript 官方文档](https://www.typescriptlang.org/docs/)
- [Express 官方文档](https://expressjs.com/)
- [Prisma 文档](https://www.prisma.io/docs/)
- [Jest 文档](https://jestjs.io/docs/getting-started) 