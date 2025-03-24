# 测试策略

## 概述

DRYcore 框架采用多层次的测试策略，确保代码质量和系统稳定性。测试策略涵盖单元测试、集成测试和端到端测试，为整个开发过程提供全面的质量保障。

## 测试目录结构

```
packages/server/
├── tests/
│   ├── unit/           # 单元测试
│   ├── integration/    # 集成测试
│   └── e2e/            # 端到端测试
├── jest.config.js      # Jest配置文件
└── tests/jest.setup.js # Jest设置脚本
```

## 测试技术栈

DRYcore 使用以下技术进行测试：

- **Jest**: 主要的测试框架和测试运行器
- **Supertest**: HTTP请求测试库，用于API测试
- **ts-jest**: TypeScript支持
- **测试数据库**: 使用独立的测试数据库进行数据库交互测试

## 测试环境配置

测试环境通过 `tests/jest.setup.js` 配置，包括以下内容：

```javascript
// 设置测试环境变量
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = 'mysql://root:password@localhost:3306/drycore_test';
process.env.PORT = '3001';
process.env.JWT_SECRET = 'test-secret-key';

// 添加自定义断言
expect.extend({
  // 自定义断言示例
  toBeWithinRange(received, floor, ceiling) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },
});
```

## 测试分类

### 单元测试 (Unit Tests)

单元测试关注于测试独立的代码单元（通常是函数或类方法），确保它们在隔离环境中正确工作。

**特点**：
- 快速执行
- 不依赖外部系统（数据库、API等）
- 使用模拟（Mocks）和存根（Stubs）隔离依赖

**示例**：

```typescript
// 环境配置测试示例
import { env } from '@config/env';

describe('环境配置测试', () => {
  // 备份原始环境变量
  const originalEnv = process.env;

  beforeEach(() => {
    // 重置环境变量
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    // 恢复原始环境变量
    process.env = originalEnv;
  });

  test('环境配置有默认值', () => {
    // 确保关键配置有默认值
    expect(env.NODE_ENV).toBeDefined();
    expect(env.PORT).toBeDefined();
    expect(env.HOST).toBeDefined();
    expect(env.DATABASE_URL).toBeDefined();
  });

  test('环境帮助函数工作正常', () => {
    // 测试开发环境
    process.env.NODE_ENV = 'development';
    expect(env.isDev()).toBe(true);
    expect(env.isProd()).toBe(false);
    expect(env.isTest()).toBe(false);
  });
});
```

### 集成测试 (Integration Tests)

集成测试验证多个组件一起工作的正确性，测试组件之间的交互。

**特点**：
- 测试多个单元的协作
- 可能涉及数据库交互
- 测试API路由和控制器

**示例**：

```typescript
// 应用集成测试示例
import request from 'supertest';
import { app } from '@/index';

describe('应用集成测试', () => {
  test('健康检查端点返回200', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'ok');
  });

  test('不存在的路由返回404', async () => {
    const response = await request(app).get('/not-exist-path');
    expect(response.status).toBe(404);
  });
});
```

### 端到端测试 (E2E Tests)

端到端测试验证整个系统的行为，模拟真实用户操作，测试完整的用户流程。

**特点**：
- 测试完整的用户流程
- 与真实环境类似的测试环境
- 覆盖前端和后端交互

**示例**：

```typescript
// 认证端到端测试示例
import request from 'supertest';
import { app } from '@/index';

describe('认证端到端测试', () => {
  let authToken: string;

  beforeAll(async () => {
    // 测试前清理数据库
    // TODO: 实现数据库清理逻辑
  });

  test('用户注册', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'test@example.com',
        password: 'Password123!',
        name: '测试用户'
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('user');
    expect(response.body.user).toHaveProperty('email', 'test@example.com');
  });

  test('用户登录', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Password123!'
      });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    
    // 保存token用于后续测试
    authToken = response.body.token;
  });

  test('获取当前用户信息', async () => {
    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('email', 'test@example.com');
  });
});
```

## 测试脚本

在 `package.json` 中配置了以下测试命令：

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:unit": "jest --testMatch='**/tests/unit/**/*.test.ts'",
    "test:integration": "jest --testMatch='**/tests/integration/**/*.test.ts'",
    "test:e2e": "jest --testMatch='**/tests/e2e/**/*.test.ts'"
  }
}
```

## 测试最佳实践

1. **测试隔离**
   - 每个测试应该相互独立
   - 使用 `beforeEach` 和 `afterEach` 重置测试状态
   - 避免测试之间的依赖性

2. **测试覆盖率**
   - 追踪代码覆盖率，使用 `npm run test:coverage`
   - 关注核心业务逻辑的覆盖率
   - 设定覆盖率目标（例如 80%）

3. **测试命名**
   - 使用描述性名称，表明测试内容
   - 使用 `describe` 和 `test` 块组织测试
   - 按功能或模块组织测试文件

4. **模拟外部依赖**
   - 使用 Jest 的模拟功能隔离外部依赖
   - 创建专用的测试数据和状态
   - 避免测试中的网络请求和真实外部API调用

5. **持续集成**
   - 在 CI/CD 流程中集成测试
   - 在合并前确保所有测试通过
   - 为测试构建详细的报告 