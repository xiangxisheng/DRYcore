# 集成测试

## 概述

集成测试验证多个组件在一起工作时的行为。DRYcore的集成测试关注API、数据库交互、服务间通信等，确保系统各部分能协同工作。

## 集成测试目录结构

集成测试位于每个包的`tests/integration`目录中：

```
packages/server/
└── tests/
    └── integration/        # 集成测试
        ├── api/            # API接口测试
        ├── db/             # 数据库交互测试
        ├── services/       # 服务间交互测试
        └── ...
```

## 设置集成测试环境

### 1. 测试数据库

集成测试需要使用独立的测试数据库，避免影响开发或生产环境。DRYcore使用Docker容器为集成测试提供独立的数据库实例：

```typescript
// tests/integration/helpers/setup-db.ts
import { exec } from 'child_process';
import { promisify } from 'util';
import { Client } from 'pg';
import { config } from '@/config';

const execAsync = promisify(exec);

export async function setupTestDatabase() {
  // 启动测试数据库容器
  await execAsync('docker-compose -f docker-compose.test.yml up -d db-test');
  
  // 等待数据库可用
  await waitForDatabase();
  
  // 运行迁移
  await execAsync('pnpm prisma migrate deploy');
  
  console.log('测试数据库已准备就绪');
}

export async function teardownTestDatabase() {
  // 关闭测试数据库容器
  await execAsync('docker-compose -f docker-compose.test.yml down');
  console.log('测试数据库已关闭');
}

async function waitForDatabase() {
  const client = new Client({
    host: config.testDb.host,
    port: config.testDb.port,
    user: config.testDb.user,
    password: config.testDb.password,
    database: 'postgres', // 连接默认数据库
  });
  
  let retries = 5;
  while (retries > 0) {
    try {
      await client.connect();
      await client.end();
      return;
    } catch (error) {
      console.log(`等待数据库连接...还有${retries}次重试`);
      retries -= 1;
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }
  
  throw new Error('无法连接到测试数据库');
}
```

### 2. 测试工具与辅助函数

创建测试辅助函数用于测试数据库的设置与清理、API请求等：

```typescript
// tests/integration/helpers/test-client.ts
import request from 'supertest';
import { app } from '@/app';
import { prisma } from '@/lib/prisma';
import { generateJWT } from '@/utils/auth';

export class TestClient {
  private authToken: string | null = null;
  
  // 清理数据库
  async cleanDb() {
    const tables = ['Post', 'User', 'Category', 'Comment'];
    
    for (const table of tables) {
      await prisma.$executeRawUnsafe(`TRUNCATE TABLE "${table}" CASCADE;`);
    }
  }
  
  // 创建认证用户
  async createAuthenticatedUser(userData = {}) {
    const defaultUser = {
      name: '测试用户',
      email: 'test@example.com',
      password: 'password123',
      role: 'USER',
    };
    
    const user = await prisma.user.create({
      data: { ...defaultUser, ...userData }
    });
    
    this.authToken = generateJWT({ id: user.id, email: user.email, role: user.role });
    
    return user;
  }
  
  // 以认证用户身份发送GET请求
  async get(url: string) {
    const req = request(app).get(url);
    
    if (this.authToken) {
      req.set('Authorization', `Bearer ${this.authToken}`);
    }
    
    return req;
  }
  
  // 以认证用户身份发送POST请求
  async post(url: string, data: any) {
    const req = request(app).post(url).send(data);
    
    if (this.authToken) {
      req.set('Authorization', `Bearer ${this.authToken}`);
    }
    
    return req;
  }
  
  // 以认证用户身份发送PUT请求
  async put(url: string, data: any) {
    const req = request(app).put(url).send(data);
    
    if (this.authToken) {
      req.set('Authorization', `Bearer ${this.authToken}`);
    }
    
    return req;
  }
  
  // 以认证用户身份发送DELETE请求
  async delete(url: string) {
    const req = request(app).delete(url);
    
    if (this.authToken) {
      req.set('Authorization', `Bearer ${this.authToken}`);
    }
    
    return req;
  }
}
```

### 3. Jest设置文件

创建一个Jest设置文件来初始化集成测试环境：

```typescript
// tests/integration/jest-setup.ts
import { setupTestDatabase, teardownTestDatabase } from './helpers/setup-db';

beforeAll(async () => {
  // 设置测试环境
  process.env.NODE_ENV = 'test';
  
  // 配置测试环境变量
  process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5433/drycore_test';
  process.env.JWT_SECRET = 'test_jwt_secret';
  
  // 设置测试数据库
  await setupTestDatabase();
}, 60000); // 增加超时时间，因为数据库启动可能需要一些时间

afterAll(async () => {
  // 清理测试数据库
  await teardownTestDatabase();
});
```

## 编写集成测试

### 1. API端点测试

```typescript
// tests/integration/api/users.test.ts
import { TestClient } from '../helpers/test-client';
import { prisma } from '@/lib/prisma';

describe('用户API', () => {
  const client = new TestClient();
  
  beforeEach(async () => {
    await client.cleanDb();
  });
  
  describe('GET /api/users', () => {
    test('应该获取用户列表', async () => {
      // 创建测试数据
      await prisma.user.createMany({
        data: [
          { name: '用户1', email: 'user1@example.com', password: 'password1', role: 'USER' },
          { name: '用户2', email: 'user2@example.com', password: 'password2', role: 'ADMIN' },
        ],
      });
      
      // 认证
      await client.createAuthenticatedUser({ role: 'ADMIN' });
      
      // 发送请求
      const response = await client.get('/api/users');
      
      // 验证
      expect(response.status).toBe(200);
      expect(response.body.data.length).toBe(3); // 包括认证用户
      expect(response.body.data[0]).toHaveProperty('name');
      expect(response.body.data[0]).toHaveProperty('email');
      expect(response.body.data[0]).not.toHaveProperty('password'); // 密码不应返回
    });
    
    test('未认证用户无法访问用户列表', async () => {
      const response = await client.get('/api/users');
      
      expect(response.status).toBe(401);
    });
  });
  
  describe('POST /api/users', () => {
    test('管理员应该能创建新用户', async () => {
      // 认证为管理员
      await client.createAuthenticatedUser({ role: 'ADMIN' });
      
      const userData = {
        name: '新用户',
        email: 'new@example.com',
        password: 'newpassword',
        role: 'USER',
      };
      
      const response = await client.post('/api/users', userData);
      
      expect(response.status).toBe(201);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe('新用户');
      expect(response.body.data.email).toBe('new@example.com');
      expect(response.body.data).not.toHaveProperty('password'); // 密码不应返回
      
      // 验证用户已创建到数据库
      const user = await prisma.user.findUnique({
        where: { email: 'new@example.com' },
      });
      
      expect(user).toBeTruthy();
    });
    
    test('普通用户无法创建新用户', async () => {
      // 认证为普通用户
      await client.createAuthenticatedUser({ role: 'USER' });
      
      const userData = {
        name: '新用户',
        email: 'new@example.com',
        password: 'newpassword',
        role: 'USER',
      };
      
      const response = await client.post('/api/users', userData);
      
      expect(response.status).toBe(403); // 权限不足
    });
  });
  
  // 其他API测试...
});
```

### 2. 数据库交互测试

```typescript
// tests/integration/db/user-repository.test.ts
import { UserRepository } from '@/repositories/user.repository';
import { prisma } from '@/lib/prisma';
import { TestClient } from '../helpers/test-client';

describe('UserRepository', () => {
  const client = new TestClient();
  const repo = new UserRepository();
  
  beforeEach(async () => {
    await client.cleanDb();
  });
  
  describe('findByEmail', () => {
    test('应该通过邮箱找到用户', async () => {
      // 创建测试用户
      const testUser = await prisma.user.create({
        data: {
          name: '测试用户',
          email: 'test@example.com',
          password: 'password123',
          role: 'USER',
        },
      });
      
      // 通过仓库查找
      const foundUser = await repo.findByEmail('test@example.com');
      
      expect(foundUser).toBeTruthy();
      expect(foundUser?.id).toBe(testUser.id);
      expect(foundUser?.email).toBe('test@example.com');
    });
    
    test('用户不存在时应该返回null', async () => {
      const user = await repo.findByEmail('nonexistent@example.com');
      expect(user).toBeNull();
    });
  });
  
  describe('createUser', () => {
    test('应该创建并返回用户', async () => {
      const userData = {
        name: '新用户',
        email: 'new@example.com',
        password: 'hashedpassword',
        role: 'USER',
      };
      
      const user = await repo.createUser(userData);
      
      expect(user).toBeTruthy();
      expect(user.id).toBeDefined();
      expect(user.name).toBe('新用户');
      expect(user.email).toBe('new@example.com');
      
      // 确认已存入数据库
      const dbUser = await prisma.user.findUnique({
        where: { id: user.id },
      });
      
      expect(dbUser).toBeTruthy();
    });
    
    test('创建邮箱重复的用户应该抛出错误', async () => {
      // 创建测试用户
      await prisma.user.create({
        data: {
          name: '测试用户',
          email: 'test@example.com',
          password: 'password123',
          role: 'USER',
        },
      });
      
      // 尝试创建相同邮箱的用户
      const userData = {
        name: '另一个用户',
        email: 'test@example.com', // 相同邮箱
        password: 'anotherpassword',
        role: 'USER',
      };
      
      await expect(repo.createUser(userData)).rejects.toThrow();
    });
  });
  
  // 其他仓库方法测试...
});
```

### 3. 服务层集成测试

```typescript
// tests/integration/services/auth.test.ts
import { AuthService } from '@/services/auth.service';
import { UserService } from '@/services/user.service';
import { prisma } from '@/lib/prisma';
import { TestClient } from '../helpers/test-client';

describe('AuthService集成测试', () => {
  const client = new TestClient();
  const authService = new AuthService();
  const userService = new UserService();
  
  beforeEach(async () => {
    await client.cleanDb();
  });
  
  describe('登录流程', () => {
    test('正确凭据应该登录成功', async () => {
      // 先创建用户
      await userService.register({
        name: '测试用户',
        email: 'test@example.com',
        password: 'password123',
      });
      
      // 尝试登录
      const result = await authService.login({
        email: 'test@example.com',
        password: 'password123',
      });
      
      expect(result.success).toBe(true);
      expect(result.user).toBeTruthy();
      expect(result.token).toBeTruthy();
      expect(result.user?.email).toBe('test@example.com');
    });
    
    test('错误密码应该登录失败', async () => {
      // 先创建用户
      await userService.register({
        name: '测试用户',
        email: 'test@example.com',
        password: 'password123',
      });
      
      // 尝试使用错误密码登录
      const result = await authService.login({
        email: 'test@example.com',
        password: 'wrongpassword',
      });
      
      expect(result.success).toBe(false);
      expect(result.user).toBeNull();
      expect(result.token).toBeNull();
      expect(result.error).toBeTruthy();
    });
  });
  
  describe('注册流程', () => {
    test('应该成功注册并登录', async () => {
      const result = await authService.register({
        name: '新用户',
        email: 'new@example.com',
        password: 'password123',
      });
      
      expect(result.success).toBe(true);
      expect(result.user).toBeTruthy();
      expect(result.token).toBeTruthy();
      
      // 确认用户已在数据库中
      const dbUser = await prisma.user.findUnique({
        where: { email: 'new@example.com' },
      });
      
      expect(dbUser).toBeTruthy();
    });
    
    test('邮箱重复应该注册失败', async () => {
      // 先创建用户
      await userService.register({
        name: '测试用户',
        email: 'test@example.com',
        password: 'password123',
      });
      
      // 尝试使用相同邮箱注册
      const result = await authService.register({
        name: '另一个用户',
        email: 'test@example.com',
        password: 'differentpassword',
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });
  
  // 其他服务集成测试...
});
```

## 前后端集成测试

除了后端API和服务的集成测试，DRYcore还包括前后端集成测试，确保前端能正确与后端交互：

```typescript
// tests/integration/frontend/api-client.test.ts
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { ApiClient } from '@/api/client';

// 模拟的API服务器
const server = setupServer(
  // 模拟登录端点
  rest.post('http://localhost:3000/api/auth/login', (req, res, ctx) => {
    const { email, password } = req.body as any;
    
    if (email === 'test@example.com' && password === 'password123') {
      return res(
        ctx.status(200),
        ctx.json({
          success: true,
          data: {
            user: { id: 1, name: '测试用户', email: 'test@example.com' },
            token: 'fake-jwt-token',
          },
        })
      );
    }
    
    return res(
      ctx.status(401),
      ctx.json({
        success: false,
        error: { message: '无效的凭据' },
      })
    );
  }),
  
  // 模拟获取用户端点
  rest.get('http://localhost:3000/api/users/1', (req, res, ctx) => {
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader || !authHeader.includes('Bearer fake-jwt-token')) {
      return res(
        ctx.status(401),
        ctx.json({
          success: false,
          error: { message: '未授权' },
        })
      );
    }
    
    return res(
      ctx.status(200),
      ctx.json({
        success: true,
        data: { id: 1, name: '测试用户', email: 'test@example.com' },
      })
    );
  })
);

describe('ApiClient集成测试', () => {
  const apiClient = new ApiClient('http://localhost:3000/api');
  
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());
  
  describe('auth', () => {
    test('登录成功应该设置token', async () => {
      const result = await apiClient.auth.login({
        email: 'test@example.com',
        password: 'password123',
      });
      
      expect(result.success).toBe(true);
      expect(result.data.user).toBeTruthy();
      expect(result.data.token).toBe('fake-jwt-token');
      
      // 验证token已设置
      expect(apiClient.getAuthToken()).toBe('fake-jwt-token');
    });
    
    test('登录失败应该返回错误', async () => {
      const result = await apiClient.auth.login({
        email: 'wrong@example.com',
        password: 'wrongpassword',
      });
      
      expect(result.success).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });
  
  describe('用户API', () => {
    test('有效token应该能获取用户', async () => {
      // 先登录
      await apiClient.auth.login({
        email: 'test@example.com',
        password: 'password123',
      });
      
      // 获取用户
      const result = await apiClient.users.getById(1);
      
      expect(result.success).toBe(true);
      expect(result.data.id).toBe(1);
      expect(result.data.email).toBe('test@example.com');
    });
  });
});
```

## 运行集成测试

集成测试通常比单元测试慢，它们涉及数据库交互和网络请求。在DRYcore中，使用专门的命令运行集成测试：

```bash
# 运行所有集成测试
pnpm test:integration

# 运行特定的集成测试
pnpm test:integration -- -t "用户API"
```

## 集成测试最佳实践

1. **隔离测试环境** - 使用独立的测试数据库，避免影响开发环境
2. **清理测试数据** - 每个测试前清理数据库，确保测试之间互不干扰
3. **测试端到端流程** - 测试完整的业务流程，而不仅是单个操作
4. **模拟外部依赖** - 对第三方API等外部依赖进行模拟
5. **并行测试** - 设计测试使其可以并行运行，提高效率
6. **适当使用fixtures** - 使用固定测试数据简化测试设置
7. **检查真实交互** - 验证数据是否确实存入数据库等真实交互

## 示例：完整的用户API集成测试

```typescript
// tests/integration/api/user-flow.test.ts
import { TestClient } from '../helpers/test-client';
import { prisma } from '@/lib/prisma';

describe('用户完整流程', () => {
  const client = new TestClient();
  
  beforeEach(async () => {
    await client.cleanDb();
  });
  
  test('完整的用户CRUD流程', async () => {
    // 1. 先创建管理员用户
    await client.createAuthenticatedUser({ role: 'ADMIN' });
    
    // 2. 创建新用户
    const createResponse = await client.post('/api/users', {
      name: '测试用户',
      email: 'user@example.com',
      password: 'userpassword',
      role: 'USER',
    });
    
    expect(createResponse.status).toBe(201);
    const userId = createResponse.body.data.id;
    
    // 3. 获取用户详情
    const getResponse = await client.get(`/api/users/${userId}`);
    
    expect(getResponse.status).toBe(200);
    expect(getResponse.body.data.email).toBe('user@example.com');
    
    // 4. 更新用户
    const updateResponse = await client.put(`/api/users/${userId}`, {
      name: '更新的用户名',
    });
    
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.data.name).toBe('更新的用户名');
    expect(updateResponse.body.data.email).toBe('user@example.com'); // 未修改的保持不变
    
    // 5. 确认数据库中的用户已更新
    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    expect(dbUser?.name).toBe('更新的用户名');
    
    // 6. 删除用户
    const deleteResponse = await client.delete(`/api/users/${userId}`);
    
    expect(deleteResponse.status).toBe(204);
    
    // 7. 确认用户已从数据库中删除
    const deletedUser = await prisma.user.findUnique({
      where: { id: userId },
    });
    
    expect(deletedUser).toBeNull();
  });
});
```

## 小结

集成测试是DRYcore测试策略的中间层，它确保系统的不同部分能够协同工作。通过对API、数据库和服务层的集成测试，我们能够在保持较快反馈速度的同时验证系统的真实行为。 